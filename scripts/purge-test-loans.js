#!/usr/bin/env node
"use strict";
/**
 * Remove all loans and linked history so no member has a running loan.
 * Preserves members, savings, loan products, and application workflow config.
 *
 * Usage: DATABASE_URL=... node scripts/purge-test-loans.js
 *        DATABASE_URL=... node scripts/purge-test-loans.js --dry-run
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

const pool = new Pool({ connectionString: databaseUrl, max: 3, ssl: databaseUrl.includes("railway") ? { rejectUnauthorized: false } : undefined });

async function count(client, label, sql) {
  const value = Number((await client.query(sql)).rows[0]?.count || 0);
  console.log(`  ${label}: ${value}`);
  return value;
}

async function main() {
  const loans = (await pool.query(`
    SELECT l.id, l.reference, l.status, l.amount::float AS amount, m.full_name AS member
    FROM loans l
    JOIN members m ON m.id = l.member_id
    ORDER BY l.id
  `)).rows;

  console.log(dryRun ? "DRY RUN — no changes will be made\n" : "Purging all loans and linked history\n");
  console.log(`Found ${loans.length} loan(s):`);
  for (const loan of loans) {
    console.log(`  - ${loan.reference} | ${loan.member} | ${loan.status} | UGX ${Number(loan.amount).toLocaleString()}`);
  }
  if (!loans.length) {
    console.log("\nNothing to remove.");
    await pool.end();
    return;
  }

  console.log("\nRelated records:");
  await count(pool, "Loan repayments / disbursement transactions", "SELECT COUNT(*)::int AS count FROM transactions WHERE loan_id IS NOT NULL OR type IN ('Loan repayment','Loan disbursement')");
  await count(pool, "Loan disbursements", "SELECT COUNT(*)::int AS count FROM loan_disbursements");
  await count(pool, "Guarantors", "SELECT COUNT(*)::int AS count FROM loan_guarantors");
  await count(pool, "Repayment schedule rows", "SELECT COUNT(*)::int AS count FROM loan_repayment_schedule");
  await count(pool, "Workflow events", "SELECT COUNT(*)::int AS count FROM loan_workflow_events");
  await count(pool, "Stage votes", "SELECT COUNT(*)::int AS count FROM loan_stage_votes");
  await count(pool, "Charges", "SELECT COUNT(*)::int AS count FROM loan_charges");
  await count(pool, "Recovery actions", "SELECT COUNT(*)::int AS count FROM loan_recovery_actions");
  await count(pool, "Executive large-loan activities", "SELECT COUNT(*)::int AS count FROM department_activities WHERE activity_type = 'large-loan'");

  if (dryRun) {
    console.log("\nDry run complete.");
    await pool.end();
    return;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(`
      DELETE FROM transactions
      WHERE loan_id IS NOT NULL
         OR type IN ('Loan repayment', 'Loan disbursement')
    `);

    await client.query(`
      DELETE FROM notifications
      WHERE title ILIKE '%loan%'
         OR message ILIKE '%loan %'
         OR message ILIKE '%LN-%'
    `);

    await client.query(`
      DELETE FROM department_activities
      WHERE activity_type = 'large-loan'
         OR reference LIKE 'ACT-LOAN-%'
         OR title ILIKE '%loan%'
    `);

    await client.query("DELETE FROM loan_disbursements");
    const deleted = await client.query("DELETE FROM loans RETURNING reference");

    await client.query(`
      INSERT INTO audit_logs (action, entity_type, details)
      VALUES (
        'SYSTEM_LOAN_DATA_PURGE',
        'system',
        $1
      )
    `, [`Removed ${deleted.rowCount} test loan(s) and all linked schedules, guarantors, repayments, and workflow history.`]);

    await client.query("COMMIT");
    console.log("\nPurge complete.");
    console.log(`Deleted ${deleted.rowCount} loan(s): ${deleted.rows.map(r => r.reference).join(", ")}`);

    const remaining = Number((await pool.query(`
      SELECT COUNT(*)::int AS count FROM loans
      WHERE status NOT IN ('rejected', 'closed', 'completed')
    `)).rows[0].count);
    const totalLeft = Number((await pool.query("SELECT COUNT(*)::int AS count FROM loans")).rows[0].count);
    console.log(`Loans remaining (any status): ${totalLeft}`);
    console.log(`Active/pending loans remaining: ${remaining}`);
    if (remaining !== 0 || totalLeft !== 0) process.exitCode = 1;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(error => {
  console.error(error.message || error);
  process.exit(1);
});
