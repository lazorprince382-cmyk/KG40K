#!/usr/bin/env node
"use strict";
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
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Set DATABASE_URL first.");
  process.exit(1);
}
const pool = new Pool({
  connectionString: databaseUrl,
  max: 3,
  ssl: /railway|proxy|rlwy/i.test(databaseUrl) ? { rejectUnauthorized: false } : undefined
});

async function q(label, sql, params = []) {
  console.log(`\n=== ${label} ===`);
  const rows = (await pool.query(sql, params)).rows;
  console.log(JSON.stringify(rows, null, 2));
  return rows;
}

async function main() {
  await q(
    "FINANCE ACCOUNTS",
    `SELECT id, account_code, account_name, bank_name, account_number,
            balance::float AS balance, opening_balance::float AS opening_balance, active
     FROM finance_accounts ORDER BY id`
  );
  await q(
    "MEMBERS ACTIVE",
    `SELECT id, member_number, full_name, savings_balance::float AS savings,
            share_capital::float AS shares, dividends::float AS dividends, status
     FROM members WHERE deleted_at IS NULL ORDER BY full_name`
  );
  await q(
    "JOSHUA MEMBER",
    `SELECT id, full_name, status, deleted_at FROM members WHERE full_name ILIKE '%joshua%'`
  );
  await q(
    "JOSHUA LEGACY",
    `SELECT member_name, status, savings_balance::float AS savings, share_capital::float AS shares
     FROM legacy_member_opening_balances WHERE member_name ILIKE '%joshua%'`
  );
  await q("LOAN COUNT", "SELECT COUNT(*)::int AS count FROM loans");
  await q(
    "LOANS",
    `SELECT l.reference, l.amount::float AS amount, l.balance::float AS balance, l.status,
            l.disbursed_at, m.full_name
     FROM loans l LEFT JOIN members m ON m.id = l.member_id ORDER BY l.id`
  );
  await q(
    "STATEMENT LINES KEY",
    `SELECT line_code, current_amount::float AS current_amount, prior_amount::float AS prior_amount
     FROM financial_statement_lines
     WHERE line_code IN ('cash_bank','unit_trust_investment','share_capital','member_savings',
                         'trade_receivables','dividend_payable','other_payables')
     ORDER BY line_code`
  );
  await q(
    "STATEMENT LINE COUNT",
    `SELECT statement_type, COUNT(*)::int AS count
     FROM financial_statement_lines GROUP BY statement_type ORDER BY statement_type`
  );
  await q(
    "INVESTMENT FUNDS",
    `SELECT reference, amount_invested::float AS invested, current_value::float AS current_value,
            returns_earned::float AS returns_earned, report_as_at
     FROM investment_fund_accounts ORDER BY reference`
  );
  await q(
    "INVESTMENT PROJECTS",
    `SELECT reference, current_value::float AS current_value, raised_amount::float AS raised, status
     FROM investment_projects
     WHERE reference ILIKE '%OM%' OR name ILIKE '%unit%' OR category ILIKE '%unit%'`
  );
  await q(
    "LEGACY BALANCES",
    `SELECT source_row, member_name, share_capital::float AS shares,
            savings_balance::float AS savings, proposed_dividend::float AS dividend, status
     FROM legacy_member_opening_balances ORDER BY source_row`
  );
  await q(
    "UNIT TRUST LEDGER SUM",
    `SELECT COUNT(*)::int AS entries,
            COALESCE(SUM(CASE WHEN entry_type='debit' THEN amount ELSE -amount END),0)::float AS net
     FROM historical_investment_ledger`
  );
  await pool.end();
}

main().catch(async (error) => {
  console.error(error);
  try { await pool.end(); } catch {}
  process.exit(1);
});
