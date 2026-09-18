#!/usr/bin/env node
"use strict";
/**
 * Put Charles Oketcho on welfare standing since June 2024 at UGX 650,000.
 */
const { Pool } = require("pg");
const path = require("path");
const { requireDatabaseUrl } = require("./lib/load-database-url");

const projectRoot = path.resolve(__dirname, "..");
requireDatabaseUrl(projectRoot);

const dryRun = process.argv.includes("--dry-run");
const AMOUNT = 650000;
const SINCE = "2024-06-01";
const MARKER = "include-oketcho-welfare-standing";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
  ssl:
    /railway|proxy|rlwy/i.test(process.env.DATABASE_URL) &&
    !/127\.0\.0\.1|localhost/.test(process.env.DATABASE_URL)
      ? { rejectUnauthorized: false }
      : undefined,
});

async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const actor =
      (await client.query(`SELECT id FROM users WHERE active=true ORDER BY id LIMIT 1`)).rows[0]?.id;
    if (!actor) throw new Error("No active user");

    const member = (
      await client.query(
        `SELECT id, full_name, member_number, savings_balance::float AS savings
         FROM members
         WHERE deleted_at IS NULL AND status='active'
           AND full_name ILIKE '%Oketcho%'
         ORDER BY id LIMIT 1`
      )
    ).rows[0];
    if (!member) throw new Error("Charles Oketcho not found");

    const ref = `WEL-STANDING-${member.member_number}`;
    console.log(`${member.full_name} (${member.member_number}) savings=${member.savings}`);

    if (dryRun) {
      console.log(`DRY RUN would set standing ${AMOUNT} since ${SINCE}`);
      await client.query("ROLLBACK");
      return;
    }

    await client.query(
      `DELETE FROM welfare_contributions
       WHERE member_id=$1
         AND (reference=$2 OR reference LIKE 'WEL-STANDING-%' OR COALESCE(receipt_number,'') LIKE $3)`,
      [member.id, ref, `%${MARKER}%`]
    );

    await client.query(
      `INSERT INTO welfare_contributions
        (reference, member_id, contribution_type, period, expected_amount, amount, payment_method,
         receipt_number, status, contribution_date, recorded_by, verified_by, verified_at)
       VALUES ($1,$2,$3,$4,$5,$5,'Member standing balance',$6,'verified',$7::date,$8,$8,NOW())`,
      [
        ref,
        member.id,
        "Welfare standing since June 2024",
        "2024-06",
        AMOUNT,
        `${MARKER}-${member.member_number}`,
        SINCE,
        actor,
      ]
    );

    console.log(`Standing set to UGX ${AMOUNT.toLocaleString()} since June 2024`);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
