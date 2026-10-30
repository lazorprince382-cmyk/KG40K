#!/usr/bin/env node
"use strict";
/**
 * 1) Add UGX 50,000 to Centenary as Jude savings cash (book stays 10,783,010)
 *    so posted Jude savings-cash on Centenary is 1,750,000.
 * 2) Record Jude's UGX 50,000 hosting fee (not yet in the system) onto Centenary
 *    with a finance ledger, member transaction, and hosting_fee_payments row.
 *
 * Usage:
 *   DATABASE_URL=... node scripts/sync-jude-centenary-hosting-50000.js
 *   DATABASE_URL=... node scripts/sync-jude-centenary-hosting-50000.js --dry-run
 */
const { Pool } = require("pg");
const path = require("path");
const fs = require("fs");
const { requireDatabaseUrl } = require("./lib/load-database-url");

const projectRoot = path.resolve(__dirname, "..");
const dryRun = process.argv.includes("--dry-run");
const databaseUrl = requireDatabaseUrl(projectRoot);

const MEMBER_NAME = "Jude Tadieus Kyobe";
const PINNED_SAVINGS = 10783010;
const SAVINGS_CASH = 50000;
const HOSTING_FEE = 50000;
const SAVINGS_REF = "FIN-JUDE-CEN-SAV-50000-20261030";
const SAVINGS_RECEIPT = "RCPT-JUDE-CEN-50K-20261030";
const HOSTING_REF = "FIN-JUDE-HOSTING-50000-20261030";
const HOSTING_TX = "TRX-JUDE-HOSTING-50000-20261030";
const HOSTING_PAY = "HOST-JUDE-50000-20261030";
const HOSTING_RECEIPT = "RCPT-JUDE-HOST-50K-20261030";
const PAID_ON = "2026-10-30";

const pool = new Pool({
  connectionString: databaseUrl,
  max: 3,
  ssl:
    /railway|proxy|rlwy/i.test(databaseUrl) && !/127\.0\.0\.1|localhost/.test(databaseUrl)
      ? { rejectUnauthorized: false }
      : undefined,
});

async function ensureHostingTable(client) {
  const sql = fs.readFileSync(path.join(projectRoot, "database", "migrations", "060-hosting-fees.sql"), "utf8");
  await client.query(sql);
}

async function main() {
  console.log(dryRun ? "DRY RUN\n" : "Jude Centenary +50,000 savings cash and +50,000 hosting fee\n");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await ensureHostingTable(client);

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

    const savingsExisting = (await client.query(`SELECT id FROM organization_finance_entries WHERE reference=$1`, [SAVINGS_REF])).rows[0];
    const hostingExisting = (await client.query(`SELECT id FROM organization_finance_entries WHERE reference=$1`, [HOSTING_REF])).rows[0];
    const savingsBefore = Number(member.savings_balance);
    const bankBefore = Number(bank.balance);
    const addSavings = savingsExisting ? 0 : SAVINGS_CASH;
    const addHosting = hostingExisting ? 0 : HOSTING_FEE;

    console.log(`Member: ${member.full_name} (${member.member_number})`);
    console.log(`  Personal savings: UGX ${savingsBefore.toLocaleString()} (must stay ${PINNED_SAVINGS.toLocaleString()})`);
    console.log(`  Centenary before: UGX ${bankBefore.toLocaleString()}`);
    console.log(`  + savings cash:   UGX ${addSavings.toLocaleString()} ${savingsExisting ? "(already recorded)" : ""}`);
    console.log(`  + hosting fee:    UGX ${addHosting.toLocaleString()} ${hostingExisting ? "(already recorded)" : ""}`);
    console.log(`  Centenary after:  UGX ${(bankBefore + addSavings + addHosting).toLocaleString()}`);

    if (!dryRun) {
      if (!savingsExisting) {
        await client.query(
          `INSERT INTO organization_finance_entries
            (department_id,reference,entry_type,category,description,counterparty,payment_method,amount,status,receipt_number,
             supporting_document,transaction_date,recorded_by,approved_by,approved_at,finance_account_id)
           VALUES ($1,$2,'income','Member savings',$3,$4,'Bank transfer',$5,'completed',$6,$7,$8::date,$9,$9,NOW(),$10)`,
          [
            department.id,
            SAVINGS_REF,
            `Jude Tadieus Kyobe deposited UGX ${SAVINGS_CASH.toLocaleString()} as savings on Centenary (correction to 1,750,000). Cash on the company bank account only — not added to his personal savings book.`,
            member.full_name,
            SAVINGS_CASH,
            SAVINGS_RECEIPT,
            "sync-jude-centenary-hosting-50000",
            PAID_ON,
            actor.id,
            bank.id,
          ]
        );
        await client.query(`UPDATE finance_accounts SET balance=balance+$1, updated_at=NOW() WHERE id=$2`, [SAVINGS_CASH, bank.id]);
        console.log(`  Recorded ${SAVINGS_REF}`);
      }

      if (!hostingExisting) {
        const entry = (
          await client.query(
            `INSERT INTO organization_finance_entries
              (department_id,reference,entry_type,category,description,counterparty,payment_method,amount,status,receipt_number,
               supporting_document,transaction_date,recorded_by,approved_by,approved_at,finance_account_id)
             VALUES ($1,$2,'income','Hosting fee',$3,$4,'Bank transfer',$5,'completed',$6,$7,$8::date,$9,$9,NOW(),$10)
             RETURNING id`,
            [
              department.id,
              HOSTING_REF,
              `Hosting fee UGX ${HOSTING_FEE.toLocaleString()} from ${member.full_name}. Posted to Centenary.`,
              member.full_name,
              HOSTING_FEE,
              HOSTING_RECEIPT,
              "sync-jude-centenary-hosting-50000",
              PAID_ON,
              actor.id,
              bank.id,
            ]
          )
        ).rows[0];
        await client.query(`UPDATE finance_accounts SET balance=balance+$1, updated_at=NOW() WHERE id=$2`, [HOSTING_FEE, bank.id]);
        const tx = (
          await client.query(
            `INSERT INTO transactions
              (reference,member_id,type,method,amount,status,external_reference,notes,recorded_by,verified_by,verified_at,
               created_at,receipt_number,submission_source,finance_entry_id)
             VALUES ($1,$2,'Hosting fee','Bank transfer',$3,'completed',$4,$5,$6,$6,NOW(),$7::timestamptz,$8,'finance',$9)
             RETURNING id`,
            [
              HOSTING_TX,
              member.id,
              HOSTING_FEE,
              HOSTING_RECEIPT,
              `Hosting fee posted to Centenary. received=${HOSTING_FEE.toFixed(2)}.`,
              actor.id,
              PAID_ON,
              HOSTING_RECEIPT,
              entry.id,
            ]
          )
        ).rows[0];
        await client.query(
          `INSERT INTO hosting_fee_payments
            (member_id,amount,paid_on,status,reference,receipt_number,finance_entry_id,transaction_id,notes,recorded_by)
           VALUES ($1,$2,$3::date,'completed',$4,$5,$6,$7,$8,$9)`,
          [
            member.id,
            HOSTING_FEE,
            PAID_ON,
            HOSTING_PAY,
            HOSTING_RECEIPT,
            entry.id,
            tx.id,
            "Recorded from live books — hosting fee not previously in the system.",
            actor.id,
          ]
        );
        await client.query(
          `INSERT INTO notifications (member_id,title,message) VALUES ($1,$2,$3)`,
          [member.id, "Hosting fee recorded", `UGX ${HOSTING_FEE.toLocaleString()} hosting fee posted to Centenary. Receipt ${HOSTING_RECEIPT}.`]
        );
        console.log(`  Recorded ${HOSTING_REF} / ${HOSTING_PAY}`);
      }

      const live = (await client.query(`SELECT balance::float AS balance FROM finance_accounts WHERE id=$1`, [bank.id])).rows[0];
      await client.query(
        `INSERT INTO settings (key,value) VALUES ('organizationBankBalance',$1)
         ON CONFLICT (key) DO UPDATE SET value=$1, updated_at=NOW()`,
        [String(Math.round(Number(live.balance)))]
      );
      await client.query(`UPDATE members SET savings_balance=$1 WHERE id=$2`, [PINNED_SAVINGS, member.id]);
      await client.query(
        `INSERT INTO settings (key,value) VALUES ('hostingFeeAmount','50000')
         ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`
      );
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
    if (!dryRun && Math.abs(bankAfter - (bankBefore + addSavings + addHosting)) > 0.004) {
      throw new Error(`Refused: Centenary ${bankAfter} vs expected ${bankBefore + addSavings + addHosting}`);
    }

    if (dryRun) await client.query("ROLLBACK");
    else await client.query("COMMIT");
    console.log(dryRun ? "Rolled back." : "Committed.");
    console.log(`  Personal savings: UGX ${savingsAfter.toLocaleString()}`);
    console.log(`  Centenary:        UGX ${bankAfter.toLocaleString()}`);
    console.log(`  UAP:              UGX ${uapAfter.toLocaleString()}`);
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
