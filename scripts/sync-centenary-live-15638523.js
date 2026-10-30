#!/usr/bin/env node
"use strict";
/**
 * Set Centenary live balance to UGX 15,638,523 (from 15,688,523).
 */
const { Pool } = require("pg");
const path = require("path");
const { requireDatabaseUrl } = require("./lib/load-database-url");

const projectRoot = path.resolve(__dirname, "..");
const dryRun = process.argv.includes("--dry-run");
const TARGET = 15638523;
const databaseUrl = requireDatabaseUrl(projectRoot);

const pool = new Pool({
  connectionString: databaseUrl,
  max: 3,
  ssl:
    /railway|proxy|rlwy/i.test(databaseUrl) && !/127\.0\.0\.1|localhost/.test(databaseUrl)
      ? { rejectUnauthorized: false }
      : undefined,
});

async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const bank = (
      await client.query(
        `SELECT id, account_code, account_name, balance::float AS balance
         FROM finance_accounts WHERE account_code='GL-4104' AND active=true
         ORDER BY id LIMIT 1 FOR UPDATE`
      )
    ).rows[0];
    if (!bank) throw new Error("Centenary GL-4104 is not set up");
    const setting = Number(
      (await client.query(`SELECT value FROM settings WHERE key='organizationBankBalance'`)).rows[0]?.value || 0
    );
    const before = Number(bank.balance);
    console.log(`Centenary ledger: UGX ${before.toLocaleString()}`);
    console.log(`organizationBankBalance: UGX ${setting.toLocaleString()}`);
    console.log(`Target live balance: UGX ${TARGET.toLocaleString()}`);
    if (Math.abs(before - TARGET) < 0.004) {
      console.log("Already at target.");
      await client.query("ROLLBACK");
      return;
    }
    if (!dryRun) {
      await client.query(`UPDATE finance_accounts SET balance=$1, updated_at=NOW() WHERE id=$2`, [TARGET, bank.id]);
      await client.query(
        `INSERT INTO settings (key,value) VALUES ('organizationBankBalance',$1)
         ON CONFLICT (key) DO UPDATE SET value=$1, updated_at=NOW()`,
        [String(TARGET)]
      );
      const department = (await client.query(`SELECT id FROM departments WHERE code='finance'`)).rows[0];
      const actor =
        (
          await client.query(
            `SELECT id FROM users WHERE full_name ILIKE '%tabula%robert%' AND active=true LIMIT 1`
          )
        ).rows[0] ||
        (await client.query(`SELECT id FROM users WHERE role='Finance Officer' AND active=true LIMIT 1`)).rows[0];
      if (department && actor) {
        const delta = Math.abs(TARGET - before);
        await client.query(
          `INSERT INTO organization_finance_entries
            (department_id,reference,entry_type,category,description,counterparty,payment_method,amount,status,
             transaction_date,recorded_by,approved_by,approved_at,finance_account_id)
           VALUES ($1,$2,'transfer','Bank balance adjustment',$3,$4,'Bank reconciliation',$5,'completed',
             (CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Kampala')::date,$6,$6,NOW(),$7)`,
          [
            department.id,
            `FIN-ADJ-CEN-${Date.now().toString(36).toUpperCase()}`,
            `Finance set ${bank.account_name} from UGX ${before.toLocaleString()} to UGX ${TARGET.toLocaleString()}.`,
            bank.account_name,
            delta,
            actor.id,
            bank.id,
          ]
        );
      }
      await client.query(
        `INSERT INTO audit_logs(action, entity_type, entity_id, details)
         VALUES ('CENTENARY_LIVE_BALANCE','finance_account',$1,$2)`,
        [String(bank.id), `Set GL-4104 live balance ${before} → ${TARGET}`]
      );
    }
    if (dryRun) await client.query("ROLLBACK");
    else await client.query("COMMIT");
    const after = Number(
      (await client.query(`SELECT balance::float AS balance FROM finance_accounts WHERE id=$1`, [bank.id])).rows[0].balance
    );
    console.log(dryRun ? "Rolled back." : `Committed. Centenary now UGX ${after.toLocaleString()}`);
  } catch (error) {
    try { await client.query("ROLLBACK"); } catch (_) { /* ignore */ }
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
