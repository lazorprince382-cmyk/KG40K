#!/usr/bin/env node
"use strict";
/**
 * Pin Jude Tadieus Kyobe's member savings so October 2026 shows a surplus of
 * UGX 883,010 (expected 9,900,000 → savings 10,783,010).
 * Centenary / finance_accounts current balances are not changed.
 *
 * Usage:
 *   DATABASE_URL=... node scripts/sync-jude-savings-9900000.js
 *   DATABASE_URL=... node scripts/sync-jude-savings-9900000.js --dry-run
 */
const { Pool } = require("pg");
const path = require("path");
const { requireDatabaseUrl } = require("./lib/load-database-url");

const projectRoot = path.resolve(__dirname, "..");
const dryRun = process.argv.includes("--dry-run");
const databaseUrl = requireDatabaseUrl(projectRoot);

const MARKER = "sync-jude-savings-surplus-883010";
const MEMBER_NAME = "Jude Tadieus Kyobe";
const OCTOBER_EXPECTED = 9900000;
const SURPLUS = 883010;
const TARGET_SAVINGS = OCTOBER_EXPECTED + SURPLUS;
const WELFARE = 25000;
const DEPOSIT_REF = "DEP-JUDE-SURPLUS-883010-20261030";
const DEPOSIT_AT = "2026-10-30T10:00:00+03:00";

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

async function ensureWelfare(client, { reference, memberId, period, at, method, receipt, comment, actor }) {
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
  console.log(`  Recorded welfare ${period} so catch-up does not take it from the 9,900,000 pin`);
  return true;
}

async function main() {
  console.log(dryRun ? "DRY RUN\n" : `Syncing Jude savings to UGX ${TARGET_SAVINGS.toLocaleString()} (surplus ${SURPLUS.toLocaleString()}; Centenary unchanged)\n`);
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
    const topUp = Math.round((TARGET_SAVINGS - previous) * 100) / 100;

    console.log(`Member: ${member.full_name} (${member.member_number})`);
    console.log(`  Current savings: UGX ${previous.toLocaleString()}`);
    console.log(`  October expected: UGX ${OCTOBER_EXPECTED.toLocaleString()}`);
    console.log(`  Target savings:   UGX ${TARGET_SAVINGS.toLocaleString()} (surplus ${SURPLUS.toLocaleString()})`);
    console.log(`  Member-book top-up: UGX ${topUp.toLocaleString()} (not posted to Centenary)`);
    console.log(`  Finance accounts snapshot: ${accountsBefore.length} account(s) — current balances will not change`);

    if (!dryRun) {
      const existingTx = (await client.query(`SELECT id FROM transactions WHERE reference=$1`, [DEPOSIT_REF])).rows[0];
      if (!existingTx && topUp > 0) {
        await client.query(
          `INSERT INTO transactions
            (reference, member_id, type, method, amount, status, external_reference, notes,
             recorded_by, verified_by, verified_at, created_at, target_fiscal_year, submission_source)
           VALUES ($1,$2,'Savings deposit','Bank transfer',$3,'completed',$4,$5,$6,$6,$7::timestamptz,$7::timestamptz,2026,'staff')`,
          [
            DEPOSIT_REF,
            member.id,
            topUp,
            MARKER,
            `${MARKER}: October surplus pin. Member savings UGX ${previous} → ${TARGET_SAVINGS} (surplus ${SURPLUS}). Not posted to Centenary.`,
            actor,
            DEPOSIT_AT,
          ]
        );
        console.log(`  Recorded ${DEPOSIT_REF} UGX ${topUp.toLocaleString()}`);
      } else if (existingTx) {
        console.log(`  Keep ${DEPOSIT_REF} (already recorded)`);
      }
      for (const period of ["2026-08", "2026-09", "2026-10"]) {
        await ensureWelfare(client, {
          reference: `WCON-JUDE-${period}-${member.id}`,
          memberId: member.id,
          period,
          at: period === "2026-10" ? DEPOSIT_AT : `${period}-28T12:00:00+03:00`,
          method: "Savings pin",
          receipt: `WRCPT-JUDE-${period}-${member.id}`,
          comment: `${MARKER}: Monthly welfare already covered so auto catch-up does not reduce the October surplus pin.`,
          actor,
        });
      }
      await client.query(`UPDATE members SET savings_balance=$1 WHERE id=$2`, [TARGET_SAVINGS, member.id]);
      await client.query(
        `INSERT INTO audit_logs(action, entity_type, entity_id, details)
         VALUES ($1,'member',$2,$3)`,
        [
          "JUDE_SAVINGS_SURPLUS",
          String(member.id),
          `${MARKER}: ${member.full_name} savings UGX ${previous} → ${TARGET_SAVINGS} (surplus ${SURPLUS}); finance_accounts unchanged`,
        ]
      );
      console.log(`  Savings set to UGX ${TARGET_SAVINGS.toLocaleString()}`);
    } else {
      console.log("  Would pin member savings only; finance_accounts untouched");
    }

    assertFinanceUnchanged(accountsBefore, await snapshotAccounts(client));
    await client.query(dryRun ? "ROLLBACK" : "COMMIT");

    const saved = await pool.query(`SELECT savings_balance::float AS savings_balance FROM members WHERE id=$1`, [member.id]);
    const accountsFinal = await snapshotAccounts(pool);
    assertFinanceUnchanged(accountsBefore, accountsFinal);

    console.log("\n== Summary ==");
    console.log(`  Jude savings: UGX ${Number(dryRun ? previous : saved.rows[0].savings_balance).toLocaleString()}`);
    for (const row of accountsFinal.filter((r) => r.account_code === "GL-4104" || r.account_code === "GL-4500")) {
      console.log(`  Finance ${row.account_code}: UGX ${Number(row.balance).toLocaleString()} (unchanged)`);
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
