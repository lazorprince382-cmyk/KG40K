#!/usr/bin/env node
"use strict";
/** Update Mary's running loan to UGX 25,000,000 and rebuild EMI schedule (10 months). */
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

const round = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;
const AMOUNT = 25000000;
const TERM = 10;
const FEE = round(AMOUNT * 0.02);
const REF_OLD = "LN-MARY-10M-20260808";
const REF_NEW = "LN-MARY-25M-20260808";

function emiRows(amount, months, monthlyRate, startDate) {
  const factor = Math.pow(1 + monthlyRate, months);
  const payment =
    monthlyRate === 0
      ? round(amount / months)
      : round((amount * monthlyRate * factor) / (factor - 1));
  let balance = round(amount);
  const rows = [];
  for (let i = 1; i <= months; i++) {
    const opening = balance;
    const interest = round(opening * monthlyRate);
    let principal = i === months ? opening : round(payment - interest);
    if (principal > opening) principal = opening;
    const total = round(principal + interest);
    const due = new Date(startDate);
    due.setMonth(due.getMonth() + i);
    rows.push({
      installment: i,
      dueDate: due.toISOString().slice(0, 10),
      opening,
      principal,
      interest,
      total
    });
    balance = round(Math.max(0, opening - principal));
  }
  return { payment, rows };
}

async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const loan = (
      await client.query(
        `SELECT id, disbursed_at, reference FROM loans
         WHERE reference IN ($1,$2) OR (member_id=(SELECT id FROM members WHERE full_name ILIKE 'Mary Babirye' LIMIT 1)
           AND status IN ('active','overdue'))
         ORDER BY CASE WHEN reference=$2 THEN 0 WHEN reference=$1 THEN 1 ELSE 2 END, id DESC
         LIMIT 1`,
        [REF_OLD, REF_NEW]
      )
    ).rows[0];
    if (!loan) throw new Error("Mary loan not found");

    const start = loan.disbursed_at ? new Date(loan.disbursed_at) : new Date("2026-08-08T10:00:00+03:00");
    const dueDate = new Date(start);
    dueDate.setMonth(dueDate.getMonth() + TERM);
    const { payment, rows } = emiRows(AMOUNT, TERM, 0.02, start);

    await client.query(`DELETE FROM loan_charges WHERE loan_id=$1 AND charge_type='Late payment penalty'`, [loan.id]);
    await client.query(`DELETE FROM loan_repayment_schedule WHERE loan_id=$1`, [loan.id]);
    await client.query(
      `UPDATE loans
       SET reference=$1, amount=$2, balance=$2, term_months=$3, processing_fee=$4,
           verified_amount=$2, due_date=$5::date, status='active',
           collateral_value=GREATEST(COALESCE(collateral_value,0), $2),
           purpose='Personal loan secured by land title Bulemezi Block 445 Plot 26 (UGX 25,000,000)'
       WHERE id=$6`,
      [REF_NEW, AMOUNT, TERM, FEE, dueDate.toISOString().slice(0, 10), loan.id]
    );

    await client.query(
      `UPDATE loan_disbursements SET amount=$1 WHERE loan_id=$2`,
      [AMOUNT, loan.id]
    );

    await client.query(
      `UPDATE loan_charges SET amount=$1, paid_amount=$1
       WHERE loan_id=$2 AND charge_type='Processing fee'`,
      [FEE, loan.id]
    );

    await client.query(
      `UPDATE transactions
       SET amount=$1,
           notes=COALESCE(notes,'') || ' | Principal corrected to UGX 25,000,000; net after 2% fee UGX ' || $2::text
       WHERE loan_id=$3 AND type='Loan disbursement'`,
      [AMOUNT - FEE, String(AMOUNT - FEE), loan.id]
    );

    for (const row of rows) {
      await client.query(
        `INSERT INTO loan_repayment_schedule
          (loan_id,installment_number,due_date,opening_balance,principal,interest,total_due,status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,
           CASE WHEN $2=1 AND $3::date<=CURRENT_DATE THEN 'due'
                WHEN $3::date<CURRENT_DATE THEN 'overdue'
                WHEN $2=1 THEN 'due'
                ELSE 'upcoming' END)`,
        [loan.id, row.installment, row.dueDate, row.opening, row.principal, row.interest, row.total]
      );
    }

    await client.query("COMMIT");
    console.log(
      `${loan.reference} → ${REF_NEW}: UGX ${AMOUNT.toLocaleString()} / ${TERM} mo, EMI ≈ ${payment.toLocaleString()}, fee ${FEE.toLocaleString()}`
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
