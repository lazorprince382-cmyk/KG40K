#!/usr/bin/env node
"use strict";
/**
 * Record Centenary deposit 01-Sep-2026 for Dan Rwebingira Ssalongo (UGX 425,000)
 * and set monthly contribution policy: 425,000 combined (25,000 welfare + 400,000 savings).
 *
 * Member dashboards keep one 425k monthly savings target (not split).
 * Welfare + Finance dashboards track the 25k welfare portion with progress bars.
 * The 01 Sep SMS figure UGX 8,351,473 is historical. A higher live Centenary balance is left as-is.
 * Dan's member savings is then pinned to UGX 8,900,000 without adding a further
 * credit to the finance account current balance.
 *
 * Usage:
 *   DATABASE_URL=... node scripts/sync-sep2026-dan-425k-welfare.js
 *   DATABASE_URL=... node scripts/sync-sep2026-dan-425k-welfare.js --dry-run
 */
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const envFile = path.join(projectRoot, ".env");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2];
  }
}

const dryRun = process.argv.includes("--dry-run");
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Set DATABASE_URL first.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  max: 3,
  ssl:
    /railway|proxy|rlwy/i.test(databaseUrl) && !/127\.0\.0\.1|localhost/.test(databaseUrl)
      ? { rejectUnauthorized: false }
      : undefined,
});

const MARKER = "sync-sep2026-dan-425k";
const FINANCE_ACCOUNT_NUMBER = "3100111892";
const FINAL_BALANCE = 8351473;
const DEPOSIT_TOTAL = 425000;
const WELFARE_SHARE = 25000;
const SAVINGS_SHARE = DEPOSIT_TOTAL - WELFARE_SHARE; // 400,000 stays on savings after the 25,000 welfare share
const PIN_SAVINGS = 8900000; // official current savings; not posted to finance_accounts
const TX_AT = "2026-09-01T18:20:00+03:00";
const BANK_REF = "394886009";
const BANK_NOTE = "AGNTBANK DEP DAN/Financia";
const MEMBER_ALIASES = ["Dan Rwebingira Ssalongo", "Rwebingira Dan Ssalongo", "Dan Rwebingira"];

async function findMember(client, aliases) {
  for (const alias of aliases) {
    const exact = (
      await client.query(
        `SELECT id, full_name, member_number, savings_balance::float AS savings_balance
         FROM members
         WHERE deleted_at IS NULL AND status='active' AND full_name ILIKE $1
         ORDER BY id LIMIT 1`,
        [alias]
      )
    ).rows[0];
    if (exact) return exact;
  }
  return null;
}

async function actorId(client) {
  const row =
    (
      await client.query(
        `SELECT id FROM users WHERE email ILIKE 'nakayiza.baraza.olivia@gmail.com' AND active=true LIMIT 1`
      )
    ).rows[0] ||
    (await client.query(`SELECT id FROM users WHERE active=true ORDER BY id LIMIT 1`)).rows[0];
  return row?.id;
}

async function main() {
  console.log(dryRun ? "DRY RUN\n" : "Syncing Sep 2026 Dan 425k + monthly welfare policy\n");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const account = (
      await client.query(
        `SELECT id, account_name, balance::float AS balance
         FROM finance_accounts
         WHERE active=true AND (account_number=$1 OR account_name ILIKE '%kwagalana%' OR account_code='GL-4104')
         ORDER BY CASE WHEN account_number=$1 THEN 0 WHEN account_code='GL-4104' THEN 1 ELSE 2 END, id
         LIMIT 1`,
        [FINANCE_ACCOUNT_NUMBER]
      )
    ).rows[0];
    if (!account) throw new Error("Kasangati G40 Kwagalana / Centenary finance account not found");

    const actor = await actorId(client);
    if (!actor) throw new Error("No active user for recorded_by");

    const financeDept = (await client.query(`SELECT id FROM departments WHERE code='finance' LIMIT 1`)).rows[0];
    if (!financeDept) throw new Error("Finance department not found");

    const member = await findMember(client, MEMBER_ALIASES);
    if (!member) throw new Error("Member not found: Dan Rwebingira Ssalongo");

    console.log(`Finance account: ${account.account_name} (#${account.id})`);
    console.log(`  Current balance: UGX ${Number(account.balance).toLocaleString()}`);
    console.log(`  Target SMS balance: UGX ${FINAL_BALANCE.toLocaleString()}`);
    console.log(`Member: ${member.full_name} (${member.member_number})`);
    console.log(`  Current savings: UGX ${Number(member.savings_balance).toLocaleString()}`);
    console.log(`  Deposit: UGX ${DEPOSIT_TOTAL.toLocaleString()} (welfare share ${WELFARE_SHARE.toLocaleString()})`);

    const txRef = "DEP-SEP01-DAN-425K";
    const finRef = "FIN-SEP01-DAN-425K";
    const welRef = "WEL-SEP01-DAN-25K";
    const existingTx = (await client.query(`SELECT id FROM transactions WHERE reference=$1`, [txRef])).rows[0];
    const existingFin = (
      await client.query(`SELECT id FROM organization_finance_entries WHERE reference=$1`, [finRef])
    ).rows[0];
    const existingWel = (await client.query(`SELECT id FROM welfare_contributions WHERE reference=$1`, [welRef])).rows[0];

    if (!dryRun) {
      await client.query(
        `INSERT INTO settings (key, value) VALUES ('monthlyWelfareContribution', $1)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [String(WELFARE_SHARE)]
      );
      await client.query(
        `UPDATE member_financial_year_policies
         SET monthly_savings_target = $1
         WHERE status = 'active'`,
        [SAVINGS_SHARE]
      );
      console.log(`  Policy: monthly savings target UGX ${SAVINGS_SHARE.toLocaleString()}; welfare UGX ${WELFARE_SHARE.toLocaleString()}; receipt UGX ${DEPOSIT_TOTAL.toLocaleString()}`);

      // The 01 Sep SMS figure is historical. Do not overwrite later receipts with it.
      if (Number(account.balance) > FINAL_BALANCE + 0.009) {
        console.log(`  SKIP Centenary balance — live UGX ${Number(account.balance).toLocaleString()} is ahead of the 01 Sep SMS figure`);
      } else {
        await client.query(
          `UPDATE finance_accounts SET balance=$1, updated_at=NOW(),
             notes=COALESCE(notes,'') || $2
           WHERE id=$3 AND balance <= $1`,
          [
            FINAL_BALANCE,
            ` Reconciled 2026-09-01 to Centenary SMS bal UGX ${FINAL_BALANCE.toLocaleString()} after ${BANK_NOTE}.`,
            account.id,
          ]
        );
        console.log(`  Centenary balance set to UGX ${FINAL_BALANCE.toLocaleString()}`);
      }

      if (!existingFin) {
        await client.query(
          `INSERT INTO organization_finance_entries
            (department_id, reference, entry_type, category, description, counterparty, payment_method,
             amount, status, receipt_number, transaction_date, recorded_by, approved_by, approved_at, finance_account_id)
           VALUES ($1,$2,'income','Member savings deposit',$3,$4,'Bank transfer',$5,'completed',$6,$7::date,$8,$8,NOW(),$9)`,
          [
            financeDept.id,
            finRef,
            `${BANK_REF}-${BANK_NOTE} | Combined monthly UGX ${DEPOSIT_TOTAL.toLocaleString()} (UGX ${WELFARE_SHARE.toLocaleString()} welfare). SMS bal UGX ${FINAL_BALANCE.toLocaleString()}. [${MARKER}]`,
            member.full_name,
            DEPOSIT_TOTAL,
            BANK_REF,
            TX_AT.slice(0, 10),
            actor,
            account.id,
          ]
        );
        console.log(`  Finance income ${finRef} recorded (balance already set to SMS figure)`);
      } else {
        console.log(`  SKIP finance entry — ${finRef} exists`);
      }

      if (!existingTx) {
        await client.query(
          `INSERT INTO transactions
            (reference, member_id, type, method, amount, status, external_reference, notes,
             recorded_by, verified_by, verified_at, created_at, receipt_number)
           VALUES ($1,$2,'Savings deposit','Bank transfer',$3,'completed',$4,$5,$6,$6,$7::timestamptz,$7::timestamptz,$8)`,
          [
            txRef,
            member.id,
            SAVINGS_SHARE,
            BANK_REF,
            `${MARKER} ${TX_AT.slice(0, 10)} ${BANK_NOTE}; received=${DEPOSIT_TOTAL.toFixed(2)}, welfare=${WELFARE_SHARE.toFixed(2)}, savings=${SAVINGS_SHARE.toFixed(2)}. Savings UGX ${SAVINGS_SHARE.toLocaleString()}.`,
            actor,
            TX_AT,
            `RCPT-${BANK_REF}`,
          ]
        );
        console.log(`  Savings receipt ${txRef} recorded at UGX ${SAVINGS_SHARE.toLocaleString()} (bank receipt stays UGX ${DEPOSIT_TOTAL.toLocaleString()})`);
      } else {
        console.log(`  SKIP savings tx — ${txRef} already recorded; existing amount left unchanged`);
      }

      // Official current savings. Do not add the 425k on top of the pin, and do not
      // post a further credit to finance_accounts (Centenary current balance stays as set above).
      await client.query(`UPDATE members SET savings_balance=$1 WHERE id=$2`, [PIN_SAVINGS, member.id]);
      console.log(`  Member savings pinned to UGX ${PIN_SAVINGS.toLocaleString()} (finance account current balance unchanged by this pin)`);

      if (!existingWel) {
        await client.query(
          `INSERT INTO welfare_contributions
            (reference, member_id, contribution_type, period, expected_amount, amount, payment_method,
             receipt_number, status, contribution_date, recorded_by, verified_by, verified_at)
           VALUES ($1,$2,'Monthly Welfare Contribution',$3,$4,$4,'Bank transfer',$5,'verified',$6::date,$7,$7,NOW())`,
          [
            welRef,
            member.id,
            "2026-09",
            WELFARE_SHARE,
            BANK_REF + "-WEL",
            TX_AT.slice(0, 10),
            actor,
          ]
        );
        const fund = Number((await client.query(`SELECT value FROM settings WHERE key='welfareFundBalance'`)).rows[0]?.value || 0);
        await client.query(
          `INSERT INTO settings (key, value) VALUES ('welfareFundBalance', $1)
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
          [String(fund + WELFARE_SHARE)]
        );
        console.log(`  Welfare contribution ${welRef} +${WELFARE_SHARE.toLocaleString()}`);
      } else {
        console.log(`  SKIP welfare — ${welRef} exists`);
      }
    } else {
      console.log("  Would update monthly policy, reconcile Centenary, record savings + welfare");
    }

    await client.query(dryRun ? "ROLLBACK" : "COMMIT");

    const summary = await pool.query(
      `SELECT COALESCE(SUM(savings_balance),0)::float AS total FROM members WHERE deleted_at IS NULL AND status='active'`
    );
    const fin = await pool.query(`SELECT balance::float AS balance FROM finance_accounts WHERE id=$1`, [account.id]);
    const policy = await pool.query(
      `SELECT monthly_savings_target::float AS monthly FROM member_financial_year_policies WHERE status='active' ORDER BY ends_on DESC LIMIT 1`
    );
    const welfareSetting = await pool.query(`SELECT value FROM settings WHERE key='monthlyWelfareContribution'`);
    console.log("\n== Summary ==");
    console.log(`  Total member savings: UGX ${Number(summary.rows[0].total).toLocaleString()}`);
    console.log(`  Kwagalana Centenary balance: UGX ${Number(fin.rows[0]?.balance || account.balance).toLocaleString()}`);
    console.log(`  Monthly savings target: UGX ${Number(policy.rows[0]?.monthly || DEPOSIT_TOTAL).toLocaleString()}`);
    console.log(`  Monthly welfare share: UGX ${Number(welfareSetting.rows[0]?.value || WELFARE_SHARE).toLocaleString()}`);
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
