#!/usr/bin/env node
"use strict";
/**
 * Revert the live FY2026 paper-alignment applied by sync-fy2026-statement-live.js.
 * Restores pre-sync Centenary balances, unit-trust values, member dividends/share capital,
 * and removes the extra statement note lines that script added.
 */
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

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

/** Extra note lines added by the paper sync — remove these only. */
const extraLineCodes = [
  "interest_flat_loan",
  "interest_reducing_balance",
  "fines_penalties_income",
  "bank_interest_earned",
  "taxes_rates",
  "telephone",
  "internet_usage",
  "agm_costs",
  "bank_charges",
  "bad_debts",
  "provision_loan_loss_expense",
  "discount_expense",
  "loans_receivable_personal",
  "interest_receivable_personal",
  "penalties_receivable",
  "centenary_operations_account",
  "loan_loss_provision_liability",
  "raffle_fund",
  "loan_outstanding_1",
  "loan_outstanding_2",
  "loan_outstanding_3",
  "loan_principal_1",
  "loan_principal_2",
  "loan_principal_3"
];

async function main() {
  console.log(dryRun ? "DRY RUN — no changes\n" : "Reverting paper-alignment live data\n");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const period = (await client.query(
      `SELECT id FROM financial_reporting_periods WHERE period_end = '2026-06-30' ORDER BY id DESC LIMIT 1`
    )).rows[0];

    // Restore Centenary accounts to pre-sync state.
    if (!dryRun) {
      await client.query(
        `UPDATE finance_accounts
         SET account_name = 'Organization Operating Account',
             bank_name = 'Centenary Bank',
             account_number = COALESCE(NULLIF(account_number,''), '****8834'),
             balance = 500000,
             opening_balance = 500000,
             opening_balance_date = '2026-07-31',
             active = false,
             notes = 'Restored after reverting FY2026 paper alignment.',
             updated_at = NOW()
         WHERE id = 1`
      );
      await client.query(
        `UPDATE finance_accounts
         SET account_name = 'Kasangati G40 Kwagalana',
             bank_name = 'Centenary',
             account_number = COALESCE(NULLIF(account_number,''), '3100111892'),
             balance = 28465723,
             opening_balance = 28265723,
             opening_balance_date = COALESCE(opening_balance_date, CURRENT_DATE),
             active = true,
             notes = 'Restored after reverting FY2026 paper alignment.',
             updated_at = NOW()
         WHERE id = 2`
      );

      // Retire the Note-17 opening entry created by the sync.
      await client.query(
        `UPDATE organization_finance_entries
         SET status = 'rejected',
             description = COALESCE(description,'') || ' Reverted with FY2026 paper-alignment undo.'
         WHERE entry_type = 'opening_balance'
           AND description ILIKE '%Note 17%'
           AND status = 'completed'`
      );
    }

    // Restore Old Mutual unit trust to pre-sync AGM-report figure.
    if (!dryRun) {
      await client.query(
        `UPDATE investment_fund_accounts
         SET amount_invested = 150000000,
             current_value = 163204057.50,
             returns_earned = 13204057.50,
             report_as_at = '2026-06-30',
             updated_at = NOW()
         WHERE reference = 'FUND-OLD-MUTUAL-2025'`
      );
      await client.query(
        `UPDATE investment_projects
         SET current_value = 163204057.50,
             expected_return = 13204057.50,
             raised_amount = 150000000,
             progress = 100,
             status = 'active'
         WHERE reference = 'INV-FUND-OM-2025'`
      );
    }

    // Clear paper-schedule dividends and reset share capital to 2,000,000.
    if (!dryRun) {
      await client.query(
        `UPDATE members
         SET dividends = 0,
             share_capital = 2000000
         WHERE deleted_at IS NULL
           AND full_name NOT ILIKE '%joshua%'`
      );
      if (period) {
        await client.query(
          `UPDATE legacy_member_opening_balances
           SET proposed_dividend = NULL,
               share_capital = 2000000
           WHERE period_id = $1
             AND lower(member_name) <> lower('Joshua Ssewanyana')`,
          [period.id]
        );
        await client.query(
          `DELETE FROM financial_statement_lines
           WHERE period_id = $1
             AND line_code = ANY($2::text[])`,
          [period.id, extraLineCodes]
        );
      }
    }

    if (!dryRun) {
      await client.query(
        `INSERT INTO audit_logs(action, entity_type, entity_id, details)
         VALUES ('FY2026_PAPER_ALIGNMENT_REVERTED','financial_reporting_period',$1,$2)`,
        [
          period ? String(period.id) : "none",
          "Reverted live bank/unit-trust/dividends/share capital and removed extra note lines from paper sync"
        ]
      );
    }

    await client.query(dryRun ? "ROLLBACK" : "COMMIT");

    const accounts = (await client.query(
      `SELECT id, account_name, balance::float AS balance, active FROM finance_accounts ORDER BY id`
    )).rows;
    const fund = (await client.query(
      `SELECT reference, current_value::float AS current_value FROM investment_fund_accounts WHERE reference='FUND-OLD-MUTUAL-2025'`
    )).rows[0];
    const divSum = (await client.query(
      `SELECT COALESCE(SUM(dividends),0)::float AS total FROM members WHERE deleted_at IS NULL`
    )).rows[0];

    console.log("Accounts:", accounts);
    console.log("Unit Trust:", fund);
    console.log("Member dividends total:", divSum.total);
    console.log(dryRun ? "\nDry run complete." : "\nRevert committed.");
  } catch (error) {
    try { await client.query("ROLLBACK"); } catch {}
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
