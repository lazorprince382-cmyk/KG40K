#!/usr/bin/env node
"use strict";
/**
 * Reverse the historical UGX 7,000,000 welfare deduction so standing balances
 * return to UGX 650,000 per standard member (pre-deduction). Assistance payment
 * history is kept for display; Joshua stays exited/history-only.
 *
 * Usage:
 *   node scripts/reverse-welfare-historical-deduction.js
 *   node scripts/reverse-welfare-historical-deduction.js --dry-run
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
const STANDARD_SINCE = "2024-06-01";
const VICENT_SINCE = "2026-07-01";
const PAYOUT_TOTAL = 7000000;
const MARKER = "sync-welfare-member-balances";

function isExcluded(name) {
  return /oketcho/i.test(name || "") || (/baraza/i.test(name || "") && /nakayiza|olivia/i.test(name || ""));
}
function isVicent(name) {
  return /vicent|vincent/i.test(name || "") && /gumisiriza/i.test(name || "");
}

async function main() {
  console.log(dryRun ? "DRY RUN — reverse historical 7M welfare deduction\n" : "Reversing historical 7M welfare deduction\n");
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

    const members = (
      await client.query(
        `SELECT id, full_name, member_number FROM members
         WHERE deleted_at IS NULL AND status='active' ORDER BY full_name, id`
      )
    ).rows;

    let standardCount = 0;
    let standardTotal = 0;
    let vicentTotal = 0;

    for (const member of members) {
      if (isExcluded(member.full_name)) {
        console.log(`SKIP ${member.full_name} — excluded from welfare standing`);
        continue;
      }
      const vicent = isVicent(member.full_name);
      const amount = vicent ? VICENT_AMOUNT : STANDARD_AMOUNT;
      const since = vicent ? VICENT_SINCE : STANDARD_SINCE;
      const ref = `WEL-STANDING-${member.member_number}`;
      if (vicent) vicentTotal = amount;
      else {
        standardCount += 1;
        standardTotal += amount;
      }
      console.log(`  ${member.full_name}: restore standing → UGX ${amount.toLocaleString()}`);
      if (dryRun) continue;

      await client.query(
        `DELETE FROM welfare_contributions
         WHERE member_id=$1
           AND (
             reference = $2
             OR reference LIKE 'WEL-STANDING-%'
             OR COALESCE(receipt_number,'') LIKE $3
           )`,
        [member.id, ref, `%${MARKER}%`]
      );
      await client.query(
        `INSERT INTO welfare_contributions
          (reference, member_id, contribution_type, period, expected_amount, amount, payment_method,
           receipt_number, status, contribution_date, recorded_by, verified_by, verified_at, verification_comment)
         VALUES ($1,$2,$3,$4,$5,$5,'Member standing balance',$6,'verified',$7::date,$8,$8,NOW(),$9)`,
        [
          ref,
          member.id,
          vicent ? "New member welfare standing" : "Welfare standing since June 2024",
          vicent ? "2026-07" : "2024-06",
          amount,
          `${MARKER}-${member.member_number}`,
          since,
          actor,
          "Restored to pre-historical-deduction standing (7M reverse).",
        ]
      );
    }

    const before = Number(
      (await client.query(`SELECT value FROM settings WHERE key='welfareFundBalanceBeforeHistorical'`)).rows[0]?.value || 0
    );
    const deducted = Number(
      (await client.query(`SELECT value FROM settings WHERE key='welfareHistoricalFundDeducted'`)).rows[0]?.value || 0
    );
    const currentFund = Number(
      (await client.query(`SELECT value FROM settings WHERE key='welfareFundBalance'`)).rows[0]?.value || 0
    );
    const restoredFund = before > 0 ? before : currentFund + Math.max(deducted, PAYOUT_TOTAL);
    console.log(`\n  Fund balance ${currentFund.toLocaleString()} → ${restoredFund.toLocaleString()} (7M reverse)`);

    if (!dryRun) {
      await client.query(
        `INSERT INTO settings (key, value) VALUES ('welfareFundBalance', $1)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
        [String(restoredFund)]
      );
      await client.query(
        `INSERT INTO settings (key, value) VALUES ('welfareHistoricalFundDeducted', '0')
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`
      );
      await client.query(
        `INSERT INTO settings (key, value) VALUES ('welfareHistoricalAssistancePaid', '0')
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`
      );
      await client.query(
        `INSERT INTO settings (key, value) VALUES ('welfareStandingAfterHistorical', $1)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
        [String(STANDARD_AMOUNT)]
      );
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
      // Keep burial/wedding payment rows for history, but they no longer reduce standing cards.
    }

    await client.query(dryRun ? "ROLLBACK" : "COMMIT");
    console.log("\n== Summary ==");
    console.log(`  Standard members restored: ${standardCount} × ${STANDARD_AMOUNT.toLocaleString()} = ${standardTotal.toLocaleString()}`);
    console.log(`  Vicent unchanged at: ${vicentTotal.toLocaleString()}`);
    console.log(`  Assistance history records kept for member welfare history views`);
    console.log(`  Joshua remains exited / history-only (not in active member count)`);
    console.log(dryRun ? "\nDry run complete." : "\nDone.");
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
