#!/usr/bin/env node
"use strict";
/**
 * Import Jul–Aug 2026 management accounts (Income Statement + Balance Sheet)
 * and register GL bank/cash accounts. Records organization income & expenditure.
 *
 * Usage:
 *   DATABASE_URL=... node scripts/sync-aug2026-management-statements.js
 *   DATABASE_URL=... node scripts/sync-aug2026-management-statements.js --dry-run
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
  ssl:
    /railway|proxy|rlwy/i.test(databaseUrl) && !/127\.0\.0\.1|localhost/.test(databaseUrl)
      ? { rejectUnauthorized: false }
      : undefined,
});

const MARKER = "sync-aug2026-management-statements";
const PERIOD_END = "2026-08-30";
const CENTENARY_NUMBER = "3100111892";

/** Income statement 01-Jul-2026 to 30-Aug-2026. */
const INCOME_LINES = [
  ["income_statement", "gl_1003", "1003 | Penalty Fees", null, 0, 10],
  ["income_statement", "gl_1004", "1004 | Unit Trust Fund Investment Income", null, 1684620.48, 20],
  ["income_statement", "gl_1005", "1005 | Other Income", null, 1651009.8, 30],
  ["income_statement", "gl_1007", "1007 | Personal Loan RB Int Income", null, 1128938, 40],
  ["income_statement", "gl_1008", "1008 | Annual Subscription", null, 3600000, 50],
  ["income_statement", "total_income", "Total Income", null, 8064568.28, 60],
  ["income_statement", "gl_9001", "9001 | Bad Loans writeoff", null, 3582912, 70],
  ["income_statement", "total_expenses", "Total Expenses", null, 3582912, 80],
  ["income_statement", "net_income", "Net Income", null, 4481656.28, 90],
];

/** Balance sheet assets as at 30-Aug-2026. */
const ASSET_LINES = [
  ["financial_position", "gl_4101", "4101 | Bank 1", null, 0, 110],
  ["financial_position", "gl_4102", "4102 | MTN Mobile Money", null, 0, 120],
  ["financial_position", "gl_4103", "4103 | Deposits", null, 0, 130],
  ["financial_position", "gl_4104", "4104 | Centenary Bank Co. 3100111892", null, 12576453, 140],
  ["financial_position", "gl_4105", "4105 | Cash at Hand", null, 0, 150],
  ["financial_position", "gl_4202", "4202 | Personal Loan Flat Int Receivable", null, 0, 160],
  ["financial_position", "gl_4203", "4203 | Personal Loan RB Int Receivable", null, 824250, 170],
  ["financial_position", "gl_4204", "4204 | Penalties Receivable", null, 0, 180],
  ["financial_position", "gl_4205", "4205 | Fees Receivable", null, 149957.8, 190],
  ["financial_position", "gl_4404", "4404 | Personal Loan Flat", null, 0, 200],
  ["financial_position", "gl_4405", "4405 | Personal Loan RB", null, 45371053, 210],
  ["financial_position", "gl_4500", "4500 | Unit Trust Fund Investment", null, 129077015.78, 220],
  ["financial_position", "gl_4600", "4600 | Cash In Transit", null, 0, 230],
  ["financial_position", "total_assets", "Total Assets", null, 187998729.58, 240],
];

/** Balance sheet liabilities & equity as at 30-Aug-2026. */
const LIABILITY_LINES = [
  ["liabilities", "gl_7100", "7100 | Member Savings", null, 131276833, 310],
  ["liabilities", "gl_7101", "7101 | Welfare Fund", null, 6200000, 320],
  ["liabilities", "gl_7102", "7102 | Raffle Fund", null, 0, 330],
  ["liabilities", "gl_7200", "7200 | Over Payment Liability", null, 0, 340],
  ["liabilities", "gl_7400", "7400 | Suspense Account", null, 0, 350],
  ["liabilities", "gl_7601", "7601 | AGM Service Providers", null, 0, 360],
  ["liabilities", "gl_8003", "8003 | Dividends Payable", null, 0, 370],
  ["liabilities", "total_liabilities", "Total Liabilities", null, 137476833, 380],
  ["equity", "gl_8001", "8001 | Retained Earnings", null, 10600240.3, 390],
  ["equity", "gl_8002", "8002 | Members Share Capital", null, 35640000, 400],
  ["equity", "gl_8001_period", "Retained Earnings (current period)", null, 4281656.28, 410],
  ["equity", "total_equity", "Total Equity", null, 50521896.58, 420],
];

const BANK_ACCOUNTS = [
  { code: "GL-4101", name: "Bank 1", type: "bank", bank: "Bank 1", number: "4101", balance: 0 },
  {
    code: "GL-4102",
    name: "MTN Mobile Money",
    type: "mobile_money",
    bank: "MTN",
    number: "Mobile Money",
    balance: 0,
  },
  { code: "GL-4103", name: "Deposits", type: "restricted", bank: null, number: "Deposits", balance: 0 },
  {
    code: "GL-4104",
    name: "Centenary Bank Co. 3100111892",
    type: "bank",
    bank: "Centenary Bank",
    number: CENTENARY_NUMBER,
    balance: null,
  },
  { code: "GL-4105", name: "Cash at Hand", type: "cash", bank: null, number: "Cash", balance: 0 },
];

const FINANCE_ENTRIES = [
  {
    ref: "FIN-INC-UT-AUG26",
    type: "income",
    category: "Investment Income",
    description: "Unit Trust Fund Investment Income (GL 1004) — Jul–Aug 2026",
    counterparty: "Old Mutual Unit Trust",
    amount: 1684620.48,
    date: "2026-08-30",
    accountCode: null,
  },
  {
    ref: "FIN-INC-OTH-AUG26",
    type: "income",
    category: "Miscellaneous Income",
    description: "Other Income (GL 1005) — Jul–Aug 2026",
    counterparty: "Various",
    amount: 1651009.8,
    date: "2026-08-30",
    accountCode: null,
  },
  {
    ref: "FIN-INC-LN-AUG26",
    type: "income",
    category: "Investment Income",
    description: "Personal Loan RB Interest Income (GL 1007) — Jul–Aug 2026",
    counterparty: "Loan portfolio",
    amount: 1128938,
    date: "2026-08-30",
    accountCode: null,
  },
  {
    ref: "FIN-INC-SUB-AUG26",
    type: "income",
    category: "Annual Subscription Fees",
    description: "Annual Subscription (GL 1008) — 18 members × UGX 200,000 — Jul–Aug 2026",
    counterparty: "Kasangati G40 Kwagalana members",
    amount: 3600000,
    date: "2026-08-30",
    accountCode: "GL-4104",
  },
  {
    ref: "FIN-EXP-BAD-AUG26",
    type: "expense",
    category: "Bad Debt / Loan Loss",
    description: "Bad Loans writeoff (GL 9001) — Jul–Aug 2026",
    counterparty: "Loan portfolio",
    amount: 3582912,
    date: "2026-08-30",
    accountCode: null,
  },
];

async function actorId(client) {
  const row =
    (
      await client.query(
        `SELECT id FROM users WHERE email ILIKE 'nakayiza.baraza.olivia@gmail.com' AND active=true LIMIT 1`
      )
    ).rows[0] ||
    (await client.query(`SELECT id FROM users WHERE active=true ORDER BY id LIMIT 1`)).rows[0];
  return row?.id;
}

async function upsertStatementLines(client, periodId, lines) {
  for (const [statementType, lineCode, lineName, noteNumber, amount, sortOrder] of lines) {
    if (dryRun) {
      console.log(`  line ${lineCode}: ${Number(amount).toLocaleString()}`);
      continue;
    }
    await client.query(
      `INSERT INTO financial_statement_lines
        (period_id, statement_type, line_code, line_name, note_number, current_amount, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (period_id, statement_type, line_code) DO UPDATE SET
         line_name = EXCLUDED.line_name,
         note_number = EXCLUDED.note_number,
         current_amount = EXCLUDED.current_amount,
         sort_order = EXCLUDED.sort_order`,
      [periodId, statementType, lineCode, lineName, noteNumber, amount, sortOrder]
    );
  }
}

async function ensureBankAccounts(client, actor, centenaryLiveBalance) {
  console.log("\n== GL bank & cash accounts ==");
  const accountByCode = new Map();

  for (const spec of BANK_ACCOUNTS) {
    const existing = (
      await client.query(
        `SELECT id, account_code, account_name, balance::float
         FROM finance_accounts
         WHERE account_code = $1
            OR (account_number = $2 AND $2 <> '')
            OR (account_name ILIKE '%centenary%' AND $1 = 'GL-4104')
         ORDER BY CASE WHEN account_code = $1 THEN 0 WHEN account_number = $2 THEN 1 ELSE 2 END, id
         LIMIT 1`,
        [spec.code, spec.number]
      )
    ).rows[0];

    const balance =
      spec.code === "GL-4104" && centenaryLiveBalance != null ? centenaryLiveBalance : spec.balance;

    if (existing) {
      console.log(
        `  ${spec.code} ${existing.account_name}: UGX ${Number(existing.balance).toLocaleString()} → ${Number(balance).toLocaleString()}`
      );
      if (!dryRun) {
        await client.query(
          `UPDATE finance_accounts
           SET account_code = $1, account_name = $2, account_type = $3, bank_name = $4,
               account_number = $5, balance = $6, active = true, updated_at = NOW(),
               notes = COALESCE(notes,'') || $7
           WHERE id = $8`,
          [
            spec.code,
            spec.name,
            spec.type,
            spec.bank,
            spec.number,
            balance,
            ` ${MARKER} aligned to management accounts GL chart.`,
            existing.id,
          ]
        );
      }
      accountByCode.set(spec.code, { ...existing, balance });
      continue;
    }

    console.log(`  CREATE ${spec.code} ${spec.name}: UGX ${Number(balance).toLocaleString()}`);
    if (dryRun) {
      accountByCode.set(spec.code, { id: -1, balance });
      continue;
    }

    const inserted = (
      await client.query(
        `INSERT INTO finance_accounts
          (account_code, account_name, account_type, bank_name, account_number, balance, opening_balance,
           opening_balance_date, active, created_by, notes, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$6,'2026-08-30',true,$7,$8,NOW())
         RETURNING id, account_code, balance::float AS balance`,
        [
          spec.code,
          spec.name,
          spec.type,
          spec.bank,
          spec.number,
          balance,
          actor,
          `${MARKER} Registered from balance sheet GL chart.`,
        ]
      )
    ).rows[0];
    accountByCode.set(spec.code, inserted);
  }

  return accountByCode;
}

async function recordFinanceEntries(client, actor, financeDeptId, accountByCode) {
  console.log("\n== Income & expenditure (Jul–Aug 2026) ==");
  for (const entry of FINANCE_ENTRIES) {
    const existing = (await client.query(`SELECT id FROM organization_finance_entries WHERE reference=$1`, [
      entry.ref,
    ])).rows[0];
    if (existing) {
      console.log(`  SKIP ${entry.ref} — already recorded`);
      continue;
    }

    const account = entry.accountCode ? accountByCode.get(entry.accountCode) : null;
    console.log(
      `  ${entry.type.toUpperCase()} ${entry.category}: UGX ${entry.amount.toLocaleString()} — ${entry.description}`
    );

    if (dryRun) continue;

    await client.query(
      `INSERT INTO organization_finance_entries
        (department_id, reference, entry_type, category, description, counterparty, payment_method,
         amount, status, transaction_date, recorded_by, approved_by, approved_at, finance_account_id)
       VALUES ($1,$2,$3,$4,$5,$6,'Management accounts import',$7,'completed',$8::date,$9,$9,NOW(),$10)`,
      [
        financeDeptId,
        entry.ref,
        entry.type,
        entry.category,
        entry.description,
        entry.counterparty,
        entry.amount,
        entry.date,
        actor,
        account?.id || null,
      ]
    );
  }
}

async function main() {
  console.log(dryRun ? "DRY RUN\n" : "Importing Aug 2026 management statements\n");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const actor = await actorId(client);
    if (!actor) throw new Error("No active user found");

    const financeDept = (await client.query(`SELECT id FROM departments WHERE code='finance' LIMIT 1`)).rows[0];
    if (!financeDept) throw new Error("Finance department not found");

    const centenaryCurrent = (
      await client.query(
        `SELECT balance::float AS balance FROM finance_accounts
         WHERE account_number = $1 OR account_name ILIKE '%kwagalana%' OR account_code = 'GL-4104'
         ORDER BY active DESC, id LIMIT 1`,
        [CENTENARY_NUMBER]
      )
    ).rows[0];
    const liveCentenary = centenaryCurrent?.balance ?? 12576453;
    console.log(`Centenary live balance: UGX ${Number(liveCentenary).toLocaleString()}`);

    const accountByCode = await ensureBankAccounts(client, actor, liveCentenary);

    let periodId;
    if (dryRun) {
      console.log(`\n== Reporting period ${PERIOD_END} ==`);
      periodId = -1;
    } else {
      const period = (
        await client.query(
          `INSERT INTO financial_reporting_periods
            (fiscal_year, period_end, status, currency, source_name, notes)
           VALUES (2027, $1, 'draft', 'UGX',
             'Management accounts — Income Statement & Balance Sheet',
             'Interim management reports for 01 Jul 2026 to 30 Aug 2026 supplied by the organization.')
           ON CONFLICT (period_end) DO UPDATE SET
             source_name = EXCLUDED.source_name,
             notes = EXCLUDED.notes
           RETURNING id`,
          [PERIOD_END]
        )
      ).rows[0];
      periodId = period.id;
      console.log(`\n== Reporting period ${PERIOD_END} (id ${periodId}) ==`);
    }

    console.log("Income statement lines:");
    await upsertStatementLines(client, periodId, INCOME_LINES);
    console.log("Asset lines:");
    await upsertStatementLines(client, periodId, ASSET_LINES);
    console.log("Liability & equity lines:");
    await upsertStatementLines(client, periodId, LIABILITY_LINES);

    await recordFinanceEntries(client, actor, financeDept.id, accountByCode);

    if (!dryRun) {
      await client.query(
        `UPDATE investment_fund_accounts
         SET current_value = $1, report_as_at = $2, updated_at = NOW()
         WHERE reference = 'FUND-OLD-MUTUAL-2025'`,
        [129077015.78, PERIOD_END]
      );

      await client.query(
        `INSERT INTO settings (key, value, updated_at)
         VALUES ('welfareFundBalance', '6200000', NOW())
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`
      );

      await client.query(
        `UPDATE financial_statement_lines
         SET current_amount = $1
         WHERE period_id = $2 AND line_code = 'gl_4104'`,
        [liveCentenary, periodId]
      );

      await client.query(
        `INSERT INTO audit_logs(action, entity_type, entity_id, details)
         VALUES ('MANAGEMENT_ACCOUNTS_IMPORTED','financial_reporting_period',$1,$2)`,
        [
          String(periodId),
          `${MARKER}: Income UGX 8,064,568; expenses UGX 3,582,912; assets UGX 187,998,730; Centenary UGX ${liveCentenary.toLocaleString()}`,
        ]
      );
    } else {
      console.log("\nWould set Unit Trust GL 4500 → UGX 129,077,015.78");
      console.log("Would set welfare fund opening → UGX 6,200,000");
    }

    if (dryRun) {
      await client.query("ROLLBACK");
      console.log("\nDry run complete (rolled back).");
    } else {
      await client.query("COMMIT");
      console.log("\nCommitted successfully.");
    }

    const summary = await pool.query(
      `SELECT entry_type, SUM(amount)::float AS total FROM organization_finance_entries
       WHERE reference LIKE 'FIN-%-AUG26' GROUP BY entry_type ORDER BY entry_type`
    );
    const accounts = await pool.query(
      `SELECT account_code, account_name, balance::float FROM finance_accounts
       WHERE account_code LIKE 'GL-41%' OR account_code = 'GL-4104' OR account_code = 'GL-4105'
       ORDER BY account_code`
    );
    console.log("\n== Summary ==");
    summary.rows.forEach((r) =>
      console.log(`  ${r.entry_type}: UGX ${Number(r.total).toLocaleString()}`)
    );
    console.log("  Bank accounts:");
    accounts.rows.forEach((r) =>
      console.log(`    ${r.account_code} ${r.account_name}: UGX ${Number(r.balance).toLocaleString()}`)
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed:", error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
