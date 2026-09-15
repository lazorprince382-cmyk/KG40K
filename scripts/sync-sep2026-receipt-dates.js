"use strict";
/**
 * Correct Centenary receipt dates and display rules:
 * - Dan's first 425k (394886009) belongs on 31 Aug 2026, not 1 Sep
 * - Keep September deposits on September calendar days
 * - Form uses DD/MM; storage stays YYYY-MM-DD
 */
const { Pool } = require("pg");
const path = require("path");
const { requireDatabaseUrl } = require("./lib/load-database-url");

requireDatabaseUrl(path.resolve(__dirname, ".."));
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

async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Dan first receipt → 31 Aug 2026
    const danFin = (
      await client.query(
        `UPDATE organization_finance_entries
         SET transaction_date = '2026-08-31',
             description = REPLACE(REPLACE(description, 'September member money', 'August member money'),
               'This is September member money', 'This is August member money')
         WHERE receipt_number = '394886009' OR reference = 'FIN-SEP01-DAN-425K'
         RETURNING id, receipt_number, transaction_date::text AS day, amount::float`
      )
    ).rows;
    const danTx = (
      await client.query(
        `UPDATE transactions
         SET created_at = '2026-08-31 15:20:00+03'::timestamptz,
             notes = COALESCE(notes,'') || CASE WHEN notes ILIKE '%2026-08%' THEN '' ELSE ' | Receipt date corrected to 31/08/2026' END
         WHERE reference = 'DEP-SEP01-DAN-425K'
         RETURNING id, reference, created_at::text`
      )
    ).rows;
    const danWel = (
      await client.query(
        `UPDATE welfare_contributions
         SET contribution_date = '2026-08-31', period = '2026-08'
         WHERE reference = 'WEL-SEP01-DAN-25K'
            OR (member_id = (SELECT id FROM members WHERE member_number = 'G40-2026-0015')
                AND contribution_date = '2026-09-01'
                AND contribution_type = 'Monthly Welfare Contribution'
                AND amount > 0)
         RETURNING id, reference, contribution_date::text AS day, period, amount::float`
      )
    ).rows;

    // Mislabelled Aug 31 Moreen deposit (counterparty was Tabula Robert)
    const moreen = (
      await client.query(
        `UPDATE organization_finance_entries
         SET counterparty = 'Ntono Moreen'
         WHERE reference = 'FIN-AUG31-MOREEN' AND counterparty ILIKE '%tabula%'
         RETURNING id, receipt_number, counterparty`
      )
    ).rows;

    // If a date was stored as 9 Nov (US parse of 9/11) move to 11 Sep
    const flipped = (
      await client.query(
        `UPDATE organization_finance_entries
         SET transaction_date = '2026-09-11'
         WHERE transaction_date = '2026-11-09'
           AND entry_type = 'income'
           AND status IN ('completed','approved')
         RETURNING id, receipt_number, transaction_date::text AS day, counterparty, amount::float`
      )
    ).rows;

    // Align Ritah Sep deposit to 11 Sep when it was recorded as 12 Sep by mistake
    const ritah = (
      await client.query(
        `UPDATE organization_finance_entries
         SET transaction_date = '2026-09-11'
         WHERE (receipt_number IN ('RCPT-F7E06288','RCPT-29A5EF15') OR reference = 'FIN-INC-BCE27C54')
           AND transaction_date IN ('2026-09-12','2026-11-09')
         RETURNING id, receipt_number, transaction_date::text AS day`
      )
    ).rows;
    await client.query(
      `UPDATE welfare_contributions
       SET contribution_date = '2026-09-11'
       WHERE member_id = (SELECT id FROM members WHERE full_name ILIKE '%ritah%nakyanzi%' LIMIT 1)
         AND contribution_date IN ('2026-09-12','2026-11-09')
         AND contribution_type = 'Monthly Welfare Contribution'`
    );
    await client.query(
      `UPDATE transactions
       SET created_at = '2026-09-11 00:00:00+03'::timestamptz
       WHERE reference IN ('TRX-BA36A714')
         AND created_at::date IN ('2026-09-12','2026-11-09')`
    );

    // Dan second Sep receipt if dated as US 9/11 meaning 11 Sep — keep 11 Sep
    await client.query(
      `UPDATE organization_finance_entries
       SET transaction_date = '2026-09-11'
       WHERE counterparty ILIKE '%rwebingira%'
         AND transaction_date = '2026-11-09'
         AND entry_type = 'income'`
    );

    console.log(JSON.stringify({ dryRun, danFin, danTx, danWel, moreen, flipped, ritah }, null, 2));
    await client.query(dryRun ? "ROLLBACK" : "COMMIT");
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
