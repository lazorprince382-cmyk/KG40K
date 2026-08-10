#!/usr/bin/env node
"use strict";
/**
 * Deactivate "Other accounts" — users with no official governance appointment.
 * Keeps System Admin and the current operator. Soft-deactivates only (no hard delete).
 */
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
const { officialMemberDepts } = require("../src/official-department-roster");

const envFile = path.join(__dirname, "..", ".env");
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
  ssl: /railway|proxy|rlwy/i.test(databaseUrl) && !/127\.0\.0\.1|localhost/.test(databaseUrl)
    ? { rejectUnauthorized: false }
    : undefined
});

async function main() {
  const other = (await pool.query(`
    SELECT u.id, u.full_name, u.email, u.role, u.active
    FROM users u
    WHERE u.role <> 'System Admin'
      AND u.role <> 'Member'
      AND LOWER(u.email) <> 'nakayiza.baraza.olivia@gmail.com'
      AND NOT EXISTS (
        SELECT 1 FROM (${officialMemberDepts}) od WHERE od.member_id = u.member_id
      )
    ORDER BY u.role, u.full_name`)).rows;

  console.log(`${dryRun ? "DRY RUN — " : ""}Other accounts found: ${other.length}`);
  for (const u of other) console.log(`  #${u.id} ${u.role} | ${u.email} | ${u.full_name} | active=${u.active}`);

  if (!dryRun && other.length) {
    const ids = other.map((u) => u.id);
    await pool.query(
      `UPDATE users SET active = false, token_version = token_version + 1
       WHERE id = ANY($1::bigint[]) AND role <> 'System Admin'`,
      [ids]
    );
    await pool.query(
      `INSERT INTO audit_logs(action, entity_type, entity_id, details)
       VALUES ('OTHER_ACCOUNTS_DEACTIVATED','user','bulk',$1)`,
      [`Deactivated ${ids.length} accounts outside official governance roster`]
    );
    console.log(`\nDeactivated ${ids.length} accounts.`);
  } else {
    console.log(dryRun ? "\nDry run complete." : "\nNothing to deactivate.");
  }
  await pool.end();
}

main().catch(async (error) => {
  console.error(error);
  try { await pool.end(); } catch {}
  process.exit(1);
});
