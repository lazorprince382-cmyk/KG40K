#!/usr/bin/env node
"use strict";
/**
 * Set Dan Rwebingira Ssalongo's member savings to exactly UGX 8,900,000.
 * Does not change any finance_accounts current balance.
 *
 * Usage:
 *   DATABASE_URL=... node scripts/sync-dan-savings-8900000.js
 *   DATABASE_URL=... node scripts/sync-dan-savings-8900000.js --dry-run
 */
const { Pool } = require("pg");
const path = require("path");
const { requireDatabaseUrl } = require("./lib/load-database-url");

const projectRoot = path.resolve(__dirname, "..");
const dryRun = process.argv.includes("--dry-run");
const databaseUrl = requireDatabaseUrl(projectRoot);

const TARGET_SAVINGS = 8900000;
const MEMBER_ALIASES = ["Dan Rwebingira Ssalongo", "Rwebingira Dan Ssalongo", "Dan Rwebingira"];
const MARKER = "sync-dan-savings-8900000";

const pool = new Pool({
  connectionString: databaseUrl,
  max: 3,
  ssl:
    /railway|proxy|rlwy/i.test(databaseUrl) && !/127\.0\.0\.1|localhost/.test(databaseUrl)
      ? { rejectUnauthorized: false }
      : undefined,
});

async function findMember(client) {
  for (const alias of MEMBER_ALIASES) {
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
    throw new Error(
      `finance_accounts row count changed (${before.length} → ${after.length}); aborting`
    );
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

async function main() {
  console.log(dryRun ? "DRY RUN\n" : `Syncing Dan savings to UGX ${TARGET_SAVINGS.toLocaleString()}\n`);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const member = await findMember(client);
    if (!member) throw new Error("Member not found: Dan Rwebingira Ssalongo");

    const accountsBefore = await snapshotAccounts(client);
    const previous = Number(member.savings_balance);

    console.log(`Member: ${member.full_name} (${member.member_number})`);
    console.log(`  Current savings: UGX ${previous.toLocaleString()}`);
    console.log(`  Target savings:  UGX ${TARGET_SAVINGS.toLocaleString()}`);
    console.log(
      `  Finance accounts snapshot: ${accountsBefore.length} account(s) — current balances will not change`
    );

    if (!dryRun && previous !== TARGET_SAVINGS) {
      await client.query(`UPDATE members SET savings_balance=$1 WHERE id=$2`, [TARGET_SAVINGS, member.id]);
      await client.query(
        `INSERT INTO audit_logs(action, entity_type, entity_id, details)
         VALUES ($1,'member',$2,$3)`,
        [
          "DAN_SAVINGS_PINNED",
          String(member.id),
          `${MARKER}: ${member.full_name} savings UGX ${previous} → ${TARGET_SAVINGS}; finance_accounts balances unchanged`,
        ]
      );
      console.log(`  Savings set to UGX ${TARGET_SAVINGS.toLocaleString()}`);
    } else if (previous === TARGET_SAVINGS) {
      console.log("  Already at target — no member update");
    } else {
      console.log("  Would set member savings only (finance_accounts untouched)");
    }

    assertFinanceUnchanged(accountsBefore, await snapshotAccounts(client));
    await client.query(dryRun ? "ROLLBACK" : "COMMIT");

    const saved = await pool.query(`SELECT savings_balance::float AS savings_balance FROM members WHERE id=$1`, [
      member.id,
    ]);
    const accountsFinal = await snapshotAccounts(pool);
    assertFinanceUnchanged(accountsBefore, accountsFinal);

    console.log("\n== Summary ==");
    console.log(
      `  Dan savings: UGX ${Number(dryRun ? previous : saved.rows[0].savings_balance).toLocaleString()}`
    );
    for (const row of accountsFinal) {
      console.log(
        `  Finance ${row.account_code || row.account_number || row.id}: UGX ${Number(row.balance).toLocaleString()} (unchanged)`
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
