#!/usr/bin/env node
"use strict";
/**
 * Align live operational finance with the photographed FY2026 draft statements
 * (year ended 30 June 2026). Historical statement lines were already imported;
 * this script fixes live bank/unit-trust figures, member share/dividend details,
 * and adds missing note-line detail.
 *
 * Usage: DATABASE_URL=... node scripts/sync-fy2026-statement-live.js
 *        DATABASE_URL=... node scripts/sync-fy2026-statement-live.js --dry-run
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

const pool = new Pool({
  connectionString: databaseUrl,
  max: 3,
  ssl: /railway|proxy|rlwy/i.test(databaseUrl) && !/127\.0\.0\.1|localhost/.test(databaseUrl)
    ? { rejectUnauthorized: false }
    : undefined
});

const CASH_BANK = 1773373;
const UNIT_TRUST = 162392395;
const UNIT_TRUST_INVESTED = 150000000;
const UNIT_TRUST_RETURNS = UNIT_TRUST - UNIT_TRUST_INVESTED; // 12,392,395 matches Note 3

/** Share capital from Total Share Capital report (Joshua kept exited / not an active member). */
const shareCapitalByName = {
  "Christopher Muhoozi": 2040000,
  "Ralph Masaba": 2040000
};

/** Proposed dividends from the same schedule (Joshua excluded). */
const dividendsByName = {
  "Charles Oketcho": 251251.82,
  "Francis Banumba": 545208.97,
  "Josephine Babirye Kyobe": 586427.86,
  "Denis Tugume": 599991.22,
  "Tabula Robert": 714249.45,
  "Ntono Moreen": 714823.36,
  "Tabula Moreen": 714823.36,
  "Ritah Nakyanzi": 991707.54,
  "Mary Babirye": 1029020.51,
  "Nakayiza Baraza Olivia": 1033036.62,
  "Jude Tadieus Kyobe": 1037739.65,
  "Brian Mutiga": 1040862.65,
  "Justine Kaudha Inhensiko": 1043518.91,
  "Paul Kalemba": 1059123.4,
  "Dan Rwebingira Ssalongo": 1060420.54,
  "Christopher Muhoozi": 1117811.46,
  "Ralph Masaba": 1149587.05,
  "Ezrah Nayoga": 1316071.02
};

/** Extra note lines from photographed notes (upsert by line_code). */
const extraStatementLines = [
  ["operating_notes", "interest_flat_loan", "Flat loan interest", "2", 0, 12640000, -12640000, 5],
  ["operating_notes", "interest_reducing_balance", "Reducing balance loan interest", "2", 8214012, 8202818, 11194, 6],
  ["operating_notes", "fines_penalties_income", "Fines and penalties", "3", 0, 1814513, -1814513, 15],
  ["operating_notes", "bank_interest_earned", "Bank interest earned", "3", 0, 638014, -638014, 16],
  ["operating_notes", "taxes_rates", "Taxes and rates", "5", 0, 305000, -305000, 45],
  ["operating_notes", "telephone", "Telephone", "10", 0, 0, 0, 55],
  ["operating_notes", "internet_usage", "Internet usage", "10", 100000, 0, 100000, 56],
  ["operating_notes", "agm_costs", "AGM costs", "11", 2000000, 2000000, 0, 65],
  ["operating_notes", "bank_charges", "Bank charges", "12", 413605, 283669, 129936, 75],
  ["operating_notes", "bad_debts", "Bad debts", "13", 0, 0, 0, 85],
  ["operating_notes", "provision_loan_loss_expense", "Provision for loan loss", "13", 0, 4007959, -4007959, 86],
  ["operating_notes", "discount_expense", "Discount", "13", 0, 496239, -496239, 87],
  ["operating_notes", "loans_receivable_personal", "Loans receivable (personal loans)", "14", 19432301, 20165484, -733183, 95],
  ["operating_notes", "interest_receivable_personal", "Interest receivable (personal loans)", "14", 0, 1106306, -1106306, 96],
  ["operating_notes", "penalties_receivable", "Penalties receivable", "15", 0, 603302, -603302, 100],
  ["operating_notes", "centenary_operations_account", "Centenary Bank - Operations Account", "17", 1773373, 110295817, -108522444, 110],
  ["operating_notes", "loan_loss_provision_liability", "Loan loss provision (accrual)", "20", 0, 4007959, -4007959, 120],
  ["operating_notes", "raffle_fund", "Raffle fund", "20", 0, 3800000, -3800000, 121],
  ["operating_notes", "loan_outstanding_1", "Personal loan reducing - outstanding (disbursed 01-01-2025)", "14", 4819912, null, null, 130],
  ["operating_notes", "loan_outstanding_2", "Personal loan reducing - outstanding (disbursed 05-02-2026)", "14", 2002025, null, null, 131],
  ["operating_notes", "loan_outstanding_3", "Personal loan reducing - outstanding (disbursed 13-04-2026)", "14", 12610364, null, null, 132],
  ["operating_notes", "loan_principal_1", "Personal loan reducing - principal (disbursed 01-01-2025)", "14", 9280000, null, null, 133],
  ["operating_notes", "loan_principal_2", "Personal loan reducing - principal (disbursed 05-02-2026)", "14", 10000000, null, null, 134],
  ["operating_notes", "loan_principal_3", "Personal loan reducing - principal (disbursed 13-04-2026)", "14", 15000000, null, null, 135]
];

async function main() {
  console.log(dryRun ? "DRY RUN — no changes will be written\n" : "Applying FY2026 live alignment\n");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const period = (await client.query(
      `SELECT id, fiscal_year FROM financial_reporting_periods WHERE period_end = '2026-06-30' ORDER BY id DESC LIMIT 1`
    )).rows[0];
    if (!period) throw new Error("FY2026 reporting period (2026-06-30) not found. Run import-fy2026-opening-records.js first.");

    const accounts = (await client.query(
      `SELECT id, account_name, bank_name, balance::float AS balance, active
       FROM finance_accounts ORDER BY id`
    )).rows;
    console.log("Bank accounts before:");
    for (const a of accounts) {
      console.log(`  #${a.id} ${a.account_name} (${a.bank_name || "?"}) balance=${a.balance} active=${a.active}`);
    }

    if (!dryRun) {
      // Clear any stale Centenary balances that are not the statement figure.
      await client.query(
        `UPDATE finance_accounts
         SET balance = 0, opening_balance = 0, active = false, updated_at = NOW(),
             notes = COALESCE(notes,'') || ' Cleared — superseded by FY2026 Note 17 Centenary Operations balance.'
         WHERE active = true
           AND (bank_name ILIKE '%centenary%' OR account_name ILIKE '%centenary%' OR account_name ILIKE '%operating%' OR account_name ILIKE '%kasangati%')
           AND id NOT IN (
             SELECT id FROM finance_accounts
             WHERE bank_name ILIKE '%centenary%' OR account_name ILIKE '%kasangati%'
             ORDER BY active DESC, id DESC
             LIMIT 1
           )`
      );

      const primary = (await client.query(
        `SELECT id FROM finance_accounts
         WHERE bank_name ILIKE '%centenary%' OR account_name ILIKE '%kasangati%' OR account_name ILIKE '%operating%'
         ORDER BY active DESC, id DESC LIMIT 1`
      )).rows[0];

      if (!primary) throw new Error("No Centenary / operating finance account found to update.");

      await client.query(
        `UPDATE finance_accounts
         SET account_name = 'Centenary Bank - Operations Account',
             bank_name = 'Centenary Bank',
             balance = $1,
             opening_balance = $1,
             opening_balance_date = '2026-06-30',
             active = true,
             notes = 'Aligned to Draft Financial Statements Note 17 as at 30 June 2026.',
             updated_at = NOW()
         WHERE id = $2`,
        [CASH_BANK, primary.id]
      );

      // Replace opening-balance cashbook rows for this account with the statement figure.
      await client.query(
        `UPDATE organization_finance_entries
         SET status = 'rejected',
             description = COALESCE(description,'') || ' Superseded by FY2026 Note 17 alignment.'
         WHERE finance_account_id = $1
           AND entry_type = 'opening_balance'
           AND status NOT IN ('rejected')`,
        [primary.id]
      );

      const financeDept = (await client.query(
        `SELECT id FROM departments WHERE code = 'finance' OR name ILIKE '%finance%' ORDER BY id LIMIT 1`
      )).rows[0];
      const financeUser = (await client.query(
        `SELECT id FROM users WHERE role ILIKE '%finance%' AND active = true ORDER BY id LIMIT 1`
      )).rows[0];
      const actorId = financeUser?.id || (await client.query(`SELECT id FROM users WHERE active = true ORDER BY id LIMIT 1`)).rows[0]?.id;
      if (actorId && financeDept) {
        await client.query(
          `INSERT INTO organization_finance_entries
            (department_id, reference, entry_type, category, description, counterparty, payment_method,
             amount, status, transaction_date, recorded_by, approved_by, approved_at, finance_account_id)
           VALUES (
             $1, $2, 'opening_balance', 'Opening Balance',
             'Centenary Bank Operations Account closing balance per FY2026 draft statements Note 17',
             'Centenary Bank', 'Opening balance', $3, 'completed', '2026-06-30', $4, $4, NOW(), $5
           )`,
          [financeDept.id, `FIN-OPEN-FY2026-${Date.now().toString(36).toUpperCase()}`, CASH_BANK, actorId, primary.id]
        );
      }

      // Zero any remaining non-primary active bank accounts so cash position matches the statement.
      await client.query(
        `UPDATE finance_accounts
         SET balance = 0, opening_balance = 0, active = false, updated_at = NOW()
         WHERE id <> $1 AND account_type IN ('bank','cash','petty_cash','mobile_money')`,
        [primary.id]
      );

      // Prior live cashbook figures were placeholders — retire them so the ledger matches Note 17.
      await client.query(
        `UPDATE organization_finance_entries
         SET status = 'rejected',
             description = COALESCE(description,'') || ' Retired during FY2026 Note 17 cash alignment.'
         WHERE finance_account_id IS NOT NULL
           AND status IN ('completed','pending','pending_finance_review')
           AND (finance_account_id <> $1 OR entry_type <> 'opening_balance' OR amount <> $2)`,
        [primary.id, CASH_BANK]
      );
    }

    if (!dryRun) {
      await client.query(
        `UPDATE investment_fund_accounts
         SET amount_invested = $1, current_value = $2, returns_earned = $3,
             report_as_at = '2026-06-30', updated_at = NOW()
         WHERE reference = 'FUND-OLD-MUTUAL-2025'`,
        [UNIT_TRUST_INVESTED, UNIT_TRUST, UNIT_TRUST_RETURNS]
      );
      await client.query(
        `UPDATE investment_projects
         SET current_value = $1, expected_return = $2, raised_amount = $3, progress = 100, status = 'active'
         WHERE reference = 'INV-FUND-OM-2025'`,
        [UNIT_TRUST, UNIT_TRUST_RETURNS, UNIT_TRUST_INVESTED]
      );
    }

    for (const line of extraStatementLines) {
      if (dryRun) continue;
      await client.query(
        `INSERT INTO financial_statement_lines
          (period_id, statement_type, line_code, line_name, note_number, current_amount, prior_amount, variance, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (period_id, statement_type, line_code) DO UPDATE SET
           line_name = EXCLUDED.line_name,
           note_number = EXCLUDED.note_number,
           current_amount = EXCLUDED.current_amount,
           prior_amount = EXCLUDED.prior_amount,
           variance = EXCLUDED.variance,
           sort_order = EXCLUDED.sort_order`,
        [period.id, ...line]
      );
    }

    // Keep core cash/unit-trust statement lines exact.
    if (!dryRun) {
      await client.query(
        `UPDATE financial_statement_lines SET current_amount = $1
         WHERE period_id = $2 AND line_code IN ('cash_bank','centenary_operations_account')`,
        [CASH_BANK, period.id]
      );
      await client.query(
        `UPDATE financial_statement_lines SET current_amount = $1
         WHERE period_id = $2 AND line_code = 'unit_trust_investment'`,
        [UNIT_TRUST, period.id]
      );
      await client.query(
        `UPDATE financial_statement_lines SET current_amount = $1
         WHERE period_id = $2 AND line_code = 'unit_trust_income'`,
        [UNIT_TRUST_RETURNS, period.id]
      );
    }

    const legacyRows = (await client.query(
      `SELECT id, member_name, linked_member_id FROM legacy_member_opening_balances WHERE period_id = $1`,
      [period.id]
    )).rows;

    for (const row of legacyRows) {
      if (row.member_name === "Joshua Ssewanyana") {
        if (!dryRun) {
          await client.query(
            `UPDATE legacy_member_opening_balances SET status = 'exited', proposed_dividend = NULL WHERE id = $1`,
            [row.id]
          );
        }
        continue;
      }
      const shares = shareCapitalByName[row.member_name] || 2000000;
      const dividend = dividendsByName[row.member_name];
      if (!dryRun) {
        await client.query(
          `UPDATE legacy_member_opening_balances
           SET share_capital = $1, proposed_dividend = COALESCE($2, proposed_dividend)
           WHERE id = $3`,
          [shares, dividend ?? null, row.id]
        );
        if (row.linked_member_id) {
          await client.query(
            `UPDATE members
             SET share_capital = $1, dividends = COALESCE($2, dividends)
             WHERE id = $3 AND deleted_at IS NULL`,
            [shares, dividend ?? null, row.linked_member_id]
          );
        }
      }
    }

    // Also patch live members matched by name (covers Tabula Moreen ↔ Ntono Moreen).
    if (!dryRun) {
      for (const [name, dividend] of Object.entries(dividendsByName)) {
        const shares = shareCapitalByName[name] || null;
        await client.query(
          `UPDATE members
           SET dividends = $1,
               share_capital = COALESCE($2, share_capital)
           WHERE deleted_at IS NULL AND lower(full_name) = lower($3)`,
          [dividend, shares, name]
        );
      }
      await client.query(
        `UPDATE legacy_member_opening_balances SET status = 'exited'
         WHERE lower(member_name) = lower('Joshua Ssewanyana')`
      );
    }

    if (!dryRun) {
      await client.query(
        `INSERT INTO audit_logs(action, entity_type, entity_id, details)
         VALUES ('FY2026_LIVE_ALIGNMENT','financial_reporting_period',$1,$2)`,
        [
          String(period.id),
          `Centenary cash set to UGX ${CASH_BANK}; Unit Trust set to UGX ${UNIT_TRUST}; note lines/dividends/share capital refreshed; Joshua remains exited`
        ]
      );
    }

    await client.query(dryRun ? "ROLLBACK" : "COMMIT");

    const after = (await client.query(
      `SELECT id, account_name, bank_name, balance::float AS balance, active FROM finance_accounts ORDER BY id`
    )).rows;
    const funds = (await client.query(
      `SELECT reference, current_value::float AS current_value FROM investment_fund_accounts WHERE reference = 'FUND-OLD-MUTUAL-2025'`
    )).rows;
    const joshuaMember = (await client.query(
      `SELECT id FROM members WHERE full_name ILIKE '%joshua%' AND deleted_at IS NULL`
    )).rows;
    const noteCount = (await client.query(
      `SELECT COUNT(*)::int AS count FROM financial_statement_lines WHERE period_id = $1`,
      [period.id]
    )).rows[0].count;

    console.log("\nBank accounts after:");
    for (const a of after) console.log(`  #${a.id} ${a.account_name} (${a.bank_name || "?"}) balance=${a.balance} active=${a.active}`);
    console.log("Unit Trust fund:", funds[0] || null);
    console.log("Active Joshua members:", joshuaMember.length);
    console.log("Statement lines:", noteCount);
    console.log(dryRun ? "\nDry run complete (rolled back)." : "\nAlignment committed.");
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
