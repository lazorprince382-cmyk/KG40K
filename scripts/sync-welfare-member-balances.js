#!/usr/bin/env node
"use strict";
/**
 * Set member welfare standing balances:
 * - 15 standard members: UGX 650,000 each (since June 2024)
 * - Vicent Gumisiriza: UGX 50,000 (since July 2026), personal savings → 550,000
 * - Charles Oketcho & Nakayiza Baraza Olivia: no welfare standing (excluded)
 */
const { Pool } = require("pg");
const path = require("path");
const { requireDatabaseUrl } = require("./lib/load-database-url");

const projectRoot = path.resolve(__dirname, "..");
requireDatabaseUrl(projectRoot);

const dryRun = process.argv.includes("--dry-run");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
  ssl:
    /railway|proxy|rlwy/i.test(process.env.DATABASE_URL) &&
    !/127\.0\.0\.1|localhost/.test(process.env.DATABASE_URL)
      ? { rejectUnauthorized: false }
      : undefined,
});

const STANDARD_AMOUNT = 650000;
const VICENT_AMOUNT = 50000;
const VICENT_SAVINGS = 550000;
const STANDARD_SINCE = "2024-06-01";
const VICENT_SINCE = "2026-07-01";
const MARKER = "sync-welfare-member-balances";

function isExcluded(name) {
  return /oketcho/i.test(name) || (/baraza/i.test(name) && /nakayiza|olivia/i.test(name));
}
function isVicent(name) {
  return /vicent|vincent/i.test(name) && /gumisiriza/i.test(name);
}

async function main() {
  console.log(dryRun ? "DRY RUN\n" : "Syncing member welfare standing balances\n");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const actor =
      (
        await client.query(
          `SELECT id FROM users WHERE email ILIKE 'nakayiza.baraza.olivia@gmail.com' AND active=true LIMIT 1`
        )
      ).rows[0]?.id ||
      (await client.query(`SELECT id FROM users WHERE active=true ORDER BY id LIMIT 1`)).rows[0]?.id;
    if (!actor) throw new Error("No active user");

    if (!dryRun) {
      await client.query(
        `INSERT INTO settings (key, value) VALUES ('welfareCollectionStartDate', $1)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [STANDARD_SINCE]
      );
      await client.query(
        `INSERT INTO settings (key, value) VALUES ('monthlyWelfareContribution', '25000')
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`
      );
    }

    const members = (
      await client.query(
        `SELECT id, full_name, member_number, savings_balance::float AS savings
         FROM members WHERE deleted_at IS NULL AND status='active' ORDER BY full_name`
      )
    ).rows;

    let standardCount = 0;
    let standardTotal = 0;
    let vicentTotal = 0;

    for (const member of members) {
      if (isExcluded(member.full_name)) {
        console.log(`SKIP ${member.full_name} (${member.member_number}) — excluded from welfare standing`);
        continue;
      }

      const vicent = isVicent(member.full_name);
      const amount = vicent ? VICENT_AMOUNT : STANDARD_AMOUNT;
      const since = vicent ? VICENT_SINCE : STANDARD_SINCE;
      const ref = `WEL-STANDING-${member.member_number}`;

      if (vicent) {
        vicentTotal = amount;
        console.log(
          `${member.full_name}: welfare ${amount.toLocaleString()} since July 2026; savings → ${VICENT_SAVINGS.toLocaleString()}`
        );
      } else {
        standardCount += 1;
        standardTotal += amount;
        console.log(`${member.full_name}: welfare ${amount.toLocaleString()} since June 2024`);
      }

      if (dryRun) continue;

      await client.query(
        `DELETE FROM welfare_contributions
         WHERE member_id=$1
           AND (
             reference = $2
             OR reference LIKE 'WEL-STANDING-%'
             OR reference = 'WEL-SEP01-DAN-25K'
             OR (COALESCE(receipt_number,'') LIKE $3)
           )`,
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
          vicent ? "New member welfare standing" : "Welfare standing since June 2024",
          vicent ? "2026-07" : "2024-06",
          amount,
          `${MARKER}-${member.member_number}`,
          since,
          actor,
        ]
      );

      if (vicent) {
        await client.query(`UPDATE members SET savings_balance=$1, joined_at=$2::date WHERE id=$3`, [
          VICENT_SAVINGS,
          VICENT_SINCE,
          member.id,
        ]);
      }
    }

    if (!dryRun) {
      await client.query(
        `INSERT INTO settings (key, value) VALUES ('welfareStandingStandardTotal', $1)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [String(standardTotal)]
      );
      await client.query(
        `INSERT INTO settings (key, value) VALUES ('welfareStandingMemberCount', $1)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [String(standardCount)]
      );
    }

    await client.query(dryRun ? "ROLLBACK" : "COMMIT");
    console.log("\n== Summary ==");
    console.log(`  Standard members (since June 2024): ${standardCount} × ${STANDARD_AMOUNT.toLocaleString()} = ${standardTotal.toLocaleString()}`);
    console.log(`  Vicent (since July 2026): ${vicentTotal.toLocaleString()}`);
    console.log(`  Card total (15-member June standing): ${standardTotal.toLocaleString()}`);
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
