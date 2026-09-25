#!/usr/bin/env node
"use strict";
/** Add Nakayiza Baraza Olivia to the welfare standing register at UGX 650,000. */
const { Pool } = require("pg");
const path = require("path");
const { requireDatabaseUrl } = require("./lib/load-database-url");

const projectRoot = path.resolve(__dirname, "..");
requireDatabaseUrl(projectRoot);

const AMOUNT = 650000;
const SINCE = "2024-06-01";
const MARKER = "include-baraza-welfare-standing";

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
    const member = (
      await client.query(
        `SELECT id, full_name, member_number FROM members
         WHERE deleted_at IS NULL AND status='active'
           AND full_name ILIKE '%baraza%'
         ORDER BY id LIMIT 1`
      )
    ).rows[0];
    if (!member) throw new Error("Baraza member not found");

    const actor =
      (
        await client.query(
          `SELECT id FROM users WHERE email ILIKE 'nakayiza.baraza.olivia@gmail.com' AND active=true LIMIT 1`
        )
      ).rows[0]?.id ||
      (await client.query(`SELECT id FROM users WHERE active=true ORDER BY id LIMIT 1`)).rows[0]?.id;
    if (!actor) throw new Error("No active user to record contribution");

    const ref = `WEL-STANDING-${member.member_number}`;
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
       VALUES ($1,$2,'Standing welfare contribution','Since June 2024',$3,$3,'Opening balance',
         $4,'verified',$5::date,$6,$6,NOW())`,
      [ref, member.id, AMOUNT, `${MARKER}:${member.member_number}`, SINCE, actor]
    );
    await client.query("COMMIT");
    console.log(`Added ${member.full_name} (${member.member_number}) to welfare standing: UGX ${AMOUNT.toLocaleString()}`);
  } catch (error) {
    await client.query("ROLLBACK");
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
