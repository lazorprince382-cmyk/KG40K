#!/usr/bin/env node
"use strict";
/**
 * Record Justine Kaudha Inhensiko's 30 Sep 2026 savings flow on the member book only.
 * Centenary / finance_accounts current balances are not changed.
 *
 * August pin: 8,921,430
 * 30 Sep: 178,600 August arrears + 425,000 (400,000 savings + 25,000 September welfare)
 * After September: 9,500,030
 * October welfare chopped from savings: 9,475,030
 *
 * Usage:
 *   DATABASE_URL=... node scripts/sync-justine-sep30-savings.js
 *   DATABASE_URL=... node scripts/sync-justine-sep30-savings.js --dry-run
 */
const { Pool } = require("pg");
const path = require("path");
const { requireDatabaseUrl } = require("./lib/load-database-url");

const projectRoot = path.resolve(__dirname, "..");
const dryRun = process.argv.includes("--dry-run");
const databaseUrl = requireDatabaseUrl(projectRoot);

const MARKER = "sync-justine-sep30-savings";
const MEMBER_NAME = "Justine Kaudha Inhensiko";
const AUG_BALANCE = 8921430;
const AUG_ARREARS = 178600;
const SEPT_GROSS = 425000;
const WELFARE = 25000;
const SEPT_SAVINGS = SEPT_GROSS - WELFARE;
const AFTER_SEPT = 9500030;
const TARGET_SAVINGS = 9475030;
const ARREARS_REF = "DEP-JUSTINE-AUG-ARREARS-20260930";
const SEPT_REF = "DEP-JUSTINE-SEP-425K-20260930";
const ARREARS_AT = "2026-09-30T14:28:00+03:00";
const SEPT_AT = "2026-09-30T14:29:00+03:00";
const OCT_AT = "2026-10-01T08:00:00+03:00";
const AUG_WELFARE_AT = "2026-08-31T18:00:00+03:00";

const pool = new Pool({
  connectionString: databaseUrl,
  max: 3,
  ssl:
    /railway|proxy|rlwy/i.test(databaseUrl) && !/127\.0\.0\.1|localhost/.test(databaseUrl)
      ? { rejectUnauthorized: false }
      : undefined,
});

async function snapshotAccounts(runner) {
  const result = await runner.query(
    `SELECT id, account_code, account_name, account_number, balance::float AS balance
     FROM finance_accounts
     ORDER BY id`
  );
  return result.rows;
}

function accountKey(row) {
  return `${row.id}|${row.account_code || ""}|${row.account_number || ""}`;
}

function assertFinanceUnchanged(before, after) {
  if (before.length !== after.length) {
    throw new Error(`finance_accounts row count changed (${before.length} → ${after.length}); aborting`);
  }
  const afterByKey = new Map(after.map((row) => [accountKey(row), row]));
  for (const row of before) {
    const next = afterByKey.get(accountKey(row));
    if (!next) throw new Error(`finance account missing after update: ${accountKey(row)}`);
    if (Number(next.balance) !== Number(row.balance)) {
      throw new Error(
        `Refused to change finance account current balance: ${row.account_name || row.account_code} ` +
          `UGX ${Number(row.balance).toLocaleString()} → ${Number(next.balance).toLocaleString()}`
      );
    }
  }
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

async function ensureDeposit(client, { reference, memberId, amount, at, notes, actor }) {
  const existing = (await client.query(`SELECT id FROM transactions WHERE reference=$1`, [reference])).rows[0];
  if (existing) {
    console.log(`  Keep ${reference} (already recorded)`);
    return false;
  }
  await client.query(
    `INSERT INTO transactions
      (reference, member_id, type, method, amount, status, external_reference, notes,
       recorded_by, verified_by, verified_at, created_at, target_fiscal_year, submission_source)
     VALUES ($1,$2,'Savings deposit','Bank transfer',$3,'completed',$4,$5,$6,$6,$7::timestamptz,$7::timestamptz,2026,'staff')`,
    [reference, memberId, amount, MARKER, notes, actor, at]
  );
  console.log(`  Recorded ${reference} UGX ${Number(amount).toLocaleString()}`);
  return true;
}

async function ensureWelfare(client, { reference, memberId, period, at, method, receipt, comment, actor, addToFund }) {
  const existing = (
    await client.query(
      `SELECT id FROM welfare_contributions
       WHERE member_id=$1 AND period=$2 AND status IN ('verified','completed','recorded') AND amount>0
       LIMIT 1`,
      [memberId, period]
    )
  ).rows[0];
  if (existing) {
    console.log(`  Keep welfare ${period} (already recorded)`);
    return false;
  }
  await client.query(
    `INSERT INTO welfare_contributions
      (reference, member_id, contribution_type, period, expected_amount, amount, payment_method,
       receipt_number, status, contribution_date, recorded_by, verified_by, verified_at, verification_comment)
     VALUES ($1,$2,'Monthly Welfare Contribution',$3,$4,$4,$5,$6,'verified',$7::date,$8,$8,NOW(),$9)`,
    [reference, memberId, period, WELFARE, method, receipt, at, actor, comment]
  );
  if (addToFund) {
    await client.query(
      `INSERT INTO settings (key,value) VALUES ('welfareFundBalance',$1)
       ON CONFLICT (key) DO UPDATE SET value=(COALESCE(NULLIF(settings.value,''),'0')::numeric+$2)::text, updated_at=NOW()`,
      [String(WELFARE), WELFARE]
    );
  }
  console.log(`  Recorded welfare ${period} UGX ${WELFARE.toLocaleString()}`);
  return true;
}

async function main() {
  console.log(dryRun ? "DRY RUN\n" : `Syncing Justine savings history → UGX ${TARGET_SAVINGS.toLocaleString()} (Centenary unchanged)\n`);
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
    const actor = await actorId(client);
    if (!actor) throw new Error("No active user for recorded_by");
    const accountsBefore = await snapshotAccounts(client);
    const previous = Number(member.savings_balance);

    console.log(`Member: ${member.full_name} (${member.member_number})`);
    console.log(`  Current savings: UGX ${previous.toLocaleString()}`);
    console.log(`  August pin:      UGX ${AUG_BALANCE.toLocaleString()}`);
    console.log(`  After September: UGX ${AFTER_SEPT.toLocaleString()} (${AUG_ARREARS.toLocaleString()} arrears + ${SEPT_SAVINGS.toLocaleString()} savings)`);
    console.log(`  After Oct welfare: UGX ${TARGET_SAVINGS.toLocaleString()}`);
    console.log(`  Finance accounts snapshot: ${accountsBefore.length} account(s) — current balances will not change`);

    if (!dryRun) {
      await ensureDeposit(client, {
        reference: ARREARS_REF,
        memberId: member.id,
        amount: AUG_ARREARS,
        at: ARREARS_AT,
        actor,
        notes: `${MARKER}: 30 Sep 2026 August bal on savings UGX ${AUG_ARREARS.toLocaleString()} (WhatsApp Justine). Completes August ${AUG_BALANCE.toLocaleString()} → 9,100,030. Not posted to Centenary.`,
      });
      await ensureDeposit(client, {
        reference: SEPT_REF,
        memberId: member.id,
        amount: SEPT_SAVINGS,
        at: SEPT_AT,
        actor,
        notes: `${MARKER}: 30 Sep 2026 UGX ${SEPT_GROSS.toLocaleString()} received; September welfare UGX ${WELFARE.toLocaleString()} chopped; UGX ${SEPT_SAVINGS.toLocaleString()} to savings. Not posted to Centenary.`,
      });
      await ensureWelfare(client, {
        reference: `WCON-JUSTINE-2026-08-${member.id}`,
        memberId: member.id,
        period: "2026-08",
        at: AUG_WELFARE_AT,
        method: "Savings pin",
        receipt: `WRCPT-JUSTINE-2026-08-${member.id}`,
        comment: `${MARKER}: August welfare already inside the 30 Aug savings pin of UGX ${AUG_BALANCE.toLocaleString()}; recorded so catch-up does not take it again.`,
        actor,
        addToFund: false,
      });
      await ensureWelfare(client, {
        reference: `WCON-JUSTINE-2026-09-${member.id}`,
        memberId: member.id,
        period: "2026-09",
        at: SEPT_AT,
        method: "Bank transfer",
        receipt: `WRCPT-JUSTINE-2026-09-${member.id}`,
        comment: `${MARKER}: Taken from the 30 Sep UGX ${SEPT_GROSS.toLocaleString()} deposit (September welfare).`,
        actor,
        addToFund: true,
      });
      await ensureWelfare(client, {
        reference: `WCON-AUTO-2026-10-${member.id}`,
        memberId: member.id,
        period: "2026-10",
        at: OCT_AT,
        method: "Savings surplus",
        receipt: `WRCPT-AUTO-2026-10-${member.id}`,
        comment: `${MARKER}: October welfare chopped from savings so 9,500,030 → ${TARGET_SAVINGS.toLocaleString()}.`,
        actor,
        addToFund: true,
      });
      await client.query(`UPDATE members SET savings_balance=$1 WHERE id=$2`, [TARGET_SAVINGS, member.id]);
      await client.query(
        `INSERT INTO audit_logs(action, entity_type, entity_id, details)
         VALUES ($1,'member',$2,$3)`,
        [
          "JUSTINE_SEP30_SAVINGS_HISTORY",
          String(member.id),
          `${MARKER}: ${member.full_name} savings UGX ${previous} → ${TARGET_SAVINGS}; Aug ${AUG_BALANCE}; 30 Sep arrears ${AUG_ARREARS} + savings ${SEPT_SAVINGS}; Oct welfare ${WELFARE}; finance_accounts unchanged`,
        ]
      );
      console.log(`  Savings set to UGX ${TARGET_SAVINGS.toLocaleString()}`);
    } else {
      console.log("  Would record 30 Sep history, Sept/Oct welfare, pin savings; finance_accounts untouched");
    }

    assertFinanceUnchanged(accountsBefore, await snapshotAccounts(client));
    await client.query(dryRun ? "ROLLBACK" : "COMMIT");

    const saved = await pool.query(`SELECT savings_balance::float AS savings_balance FROM members WHERE id=$1`, [member.id]);
    const accountsFinal = await snapshotAccounts(pool);
    assertFinanceUnchanged(accountsBefore, accountsFinal);

    console.log("\n== Summary ==");
    console.log(`  Justine savings: UGX ${Number(dryRun ? previous : saved.rows[0].savings_balance).toLocaleString()}`);
    for (const row of accountsFinal.filter((r) => r.account_code === "GL-4104" || r.account_code === "GL-4500")) {
      console.log(
        `  Finance ${row.account_code}: UGX ${Number(row.balance).toLocaleString()} (unchanged)`
      );
    }
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
