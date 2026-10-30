#!/usr/bin/env node
"use strict";
/**
 * Post UGX 1,700,000 to Centenary as a savings deposit from Jude Tadieus Kyobe.
 * His personal savings book is not increased (stays at the October surplus pin).
 *
 * Usage:
 *   DATABASE_URL=... node scripts/sync-jude-centenary-savings-1700000.js
 *   DATABASE_URL=... node scripts/sync-jude-centenary-savings-1700000.js --dry-run
 */
const { Pool } = require("pg");
const path = require("path");
const { requireDatabaseUrl } = require("./lib/load-database-url");

const projectRoot = path.resolve(__dirname, "..");
const dryRun = process.argv.includes("--dry-run");
const databaseUrl = requireDatabaseUrl(projectRoot);

const MARKER = "sync-jude-centenary-savings-1700000";
const MEMBER_NAME = "Jude Tadieus Kyobe";
const AMOUNT = 1700000;
const PINNED_SAVINGS = 10783010;
const ENTRY_REF = "FIN-JUDE-CEN-SAV-1700000-20261030";
const RECEIPT = "RCPT-JUDE-CEN-1700K-20261030";
const PAID_ON = "2026-10-30";

const pool = new Pool({
  connectionString: databaseUrl,
  max: 3,
  ssl:
    /railway|proxy|rlwy/i.test(databaseUrl) && !/127\.0\.0\.1|localhost/.test(databaseUrl)
      ? { rejectUnauthorized: false }
      : undefined,
});

async function main() {
  console.log(dryRun ? "DRY RUN\n" : `Posting Jude UGX ${AMOUNT.toLocaleString()} to Centenary only (member savings unchanged)\n`);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const member = (
      await client.query(
        `SELECT id, full_name, member_number, savings_balance::float AS savings_balance
         FROM members
         WHERE deleted_at IS NULL AND status='active' AND full_name ILIKE $1
         ORDER BY id LIMIT 1`,
        [MEMBER_NAME]
      )
    ).rows[0];
    if (!member) throw new Error(`Member not found: ${MEMBER_NAME}`);

    const bank = (
      await client.query(
        `SELECT id, account_code, account_name, balance::float AS balance
         FROM finance_accounts
         WHERE account_code='GL-4104' AND active=true
         ORDER BY id LIMIT 1
         FOR UPDATE`
      )
    ).rows[0];
    if (!bank) throw new Error("Centenary GL-4104 is not set up");

    const uapBefore = Number(
      (
        await client.query(
          `SELECT balance::float AS balance FROM finance_accounts WHERE account_code='GL-4500' AND active=true LIMIT 1`
        )
      ).rows[0]?.balance || 0
    );

    const actor =
      (
        await client.query(
          `SELECT id FROM users WHERE email ILIKE 'nakayiza.baraza.olivia@gmail.com' AND active=true LIMIT 1`
        )
      ).rows[0] ||
      (await client.query(`SELECT id FROM users WHERE active=true ORDER BY id LIMIT 1`)).rows[0];
    if (!actor?.id) throw new Error("No active user for recorded_by");

    const department = (await client.query(`SELECT id FROM departments WHERE code='finance'`)).rows[0];
    if (!department) throw new Error("Finance department not found");

    const existing = (await client.query(`SELECT id FROM organization_finance_entries WHERE reference=$1`, [ENTRY_REF])).rows[0];
    const savingsBefore = Number(member.savings_balance);
    const bankBefore = Number(bank.balance);

    console.log(`Member: ${member.full_name} (${member.member_number})`);
    console.log(`  Personal savings: UGX ${savingsBefore.toLocaleString()} (must stay ${PINNED_SAVINGS.toLocaleString()})`);
    console.log(`  Centenary before: UGX ${bankBefore.toLocaleString()}`);
    console.log(`  Centenary after:  UGX ${(existing ? bankBefore : bankBefore + AMOUNT).toLocaleString()}`);

    if (!dryRun) {
      if (existing) {
        console.log(`  Keep ${ENTRY_REF} (already recorded)`);
      } else {
        await client.query(
          `INSERT INTO organization_finance_entries
            (department_id,reference,entry_type,category,description,counterparty,payment_method,amount,status,receipt_number,
             supporting_document,transaction_date,recorded_by,approved_by,approved_at,finance_account_id)
           VALUES ($1,$2,'income','Member savings',$3,$4,'Bank transfer',$5,'completed',$6,$7,$8::date,$9,$9,NOW(),$10)`,
          [
            department.id,
            ENTRY_REF,
            `Jude Tadieus Kyobe deposited UGX ${AMOUNT.toLocaleString()} as savings on Centenary. Cash on the company bank account only — not added to his personal savings book.`,
            member.full_name,
            AMOUNT,
            RECEIPT,
            MARKER,
            PAID_ON,
            actor.id,
            bank.id,
          ]
        );
        await client.query(`UPDATE finance_accounts SET balance=balance+$1, updated_at=NOW() WHERE id=$2`, [AMOUNT, bank.id]);
        const live = (
          await client.query(`SELECT balance::float AS balance FROM finance_accounts WHERE id=$1`, [bank.id])
        ).rows[0];
        await client.query(
          `INSERT INTO settings (key,value) VALUES ('organizationBankBalance',$1)
           ON CONFLICT (key) DO UPDATE SET value=$1, updated_at=NOW()`,
          [String(Math.round(Number(live.balance)))]
        );
        await client.query(
          `INSERT INTO audit_logs(action, entity_type, entity_id, details)
           VALUES ($1,'finance_account',$2,$3)`,
          [
            "JUDE_CENTENARY_SAVINGS_CASH",
            String(bank.id),
            `${MARKER}: +UGX ${AMOUNT} on GL-4104 from ${member.full_name}; members.savings_balance unchanged at ${savingsBefore}`,
          ]
        );
        console.log(`  Recorded ${ENTRY_REF} / ${RECEIPT}`);
      }

      await client.query(`UPDATE members SET savings_balance=$1 WHERE id=$2`, [PINNED_SAVINGS, member.id]);
    }

    const savingsAfter = Number(
      (await client.query(`SELECT savings_balance::float AS savings_balance FROM members WHERE id=$1`, [member.id])).rows[0]
        .savings_balance
    );
    const bankAfter = Number(
      (await client.query(`SELECT balance::float AS balance FROM finance_accounts WHERE id=$1`, [bank.id])).rows[0].balance
    );
    const uapAfter = Number(
      (
        await client.query(
          `SELECT balance::float AS balance FROM finance_accounts WHERE account_code='GL-4500' AND active=true LIMIT 1`
        )
      ).rows[0]?.balance || 0
    );

    if (Math.abs(savingsAfter - PINNED_SAVINGS) > 0.004) {
      throw new Error(`Refused: Jude savings moved to ${savingsAfter}; expected ${PINNED_SAVINGS}`);
    }
    if (Math.abs(uapAfter - uapBefore) > 0.004) {
      throw new Error(`Refused: UAP balance changed ${uapBefore} → ${uapAfter}`);
    }
    if (!dryRun && !existing && Math.abs(bankAfter - (bankBefore + AMOUNT)) > 0.004) {
      throw new Error(`Centenary did not increase by ${AMOUNT}: ${bankBefore} → ${bankAfter}`);
    }

    await client.query(dryRun ? "ROLLBACK" : "COMMIT");

    console.log("\n== Summary ==");
    console.log(`  Jude personal savings: UGX ${savingsAfter.toLocaleString()} (not including the 1,700,000)`);
    console.log(`  Centenary GL-4104:     UGX ${bankAfter.toLocaleString()}`);
    console.log(`  UAP GL-4500:           UGX ${uapAfter.toLocaleString()} (unchanged)`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed:", error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
