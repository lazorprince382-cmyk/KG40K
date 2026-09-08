#!/usr/bin/env node
"use strict";
/**
 * Align Vicent Gumisiriza joined_at to July 2026 and ensure
 * welfare collection start date is June 2024.
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
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
const JOINED = "2026-07-01"; // Vicent welfare/personal savings since July 2026

async function main() {
  console.log(dryRun ? "DRY RUN\n" : "Aligning Vicent + welfare collection start\n");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    if (!dryRun) {
      await client.query(
        `INSERT INTO settings (key, value) VALUES ('welfareCollectionStartDate', '2024-06-01')
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`
      );
      await client.query(
        `INSERT INTO settings (key, value) VALUES ('monthlyWelfareContribution', '25000')
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`
      );
    }
    console.log("welfareCollectionStartDate = 2024-06-01");

    const vicent = (
      await client.query(
        `SELECT id, full_name, member_number, joined_at::date::text AS joined
         FROM members
         WHERE deleted_at IS NULL
           AND (full_name ILIKE '%Vicent Gumisiriza%' OR full_name ILIKE '%Vincent Gumisiriza%'
                OR member_number = 'G40-2026-0002')
         ORDER BY id LIMIT 1`
      )
    ).rows[0];

    if (vicent) {
      console.log(`Found ${vicent.full_name} (${vicent.member_number}) joined ${vicent.joined}`);
      if (!dryRun) {
        await client.query(
          `UPDATE members SET joined_at = $1::date, provisional = COALESCE(provisional, true)
           WHERE id = $2`,
          [JOINED, vicent.id]
        );
      }
      console.log(`Vicent joined_at → ${JOINED} (since July 2026)`);
    } else {
      console.log("Vicent not found — create via membership onboarding if needed");
    }

    if (dryRun) await client.query("ROLLBACK");
    else await client.query("COMMIT");
    console.log(dryRun ? "\nDry run complete." : "\nDone.");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
