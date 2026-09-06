#!/usr/bin/env node
"use strict";
/**
 * Fix term months + regenerate EMI schedules for Justine (6) and Mary (10).
 * Usage: DATABASE_URL=... node scripts/fix-justine-mary-terms.js
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

function emiRows(amount, months, monthlyRate, startDate) {
  const factor = Math.pow(1 + monthlyRate, months);
  const payment = monthlyRate === 0
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

async function rebuild(client, reference, termMonths) {
  const loan = (await client.query(
    `SELECT id, amount::float AS amount, disbursed_at, term_months
     FROM loans WHERE reference=$1`,
    [reference]
  )).rows[0];
  if (!loan) {
    console.log(`SKIP ${reference}: not found`);
    return;
  }
  const start = loan.disbursed_at ? new Date(loan.disbursed_at) : new Date();
  const dueDate = new Date(start);
  dueDate.setMonth(dueDate.getMonth() + termMonths);
  const { payment, rows } = emiRows(loan.amount, termMonths, 0.02, start);

  await client.query(`DELETE FROM loan_charges WHERE loan_id=$1 AND charge_type='Late payment penalty'`, [loan.id]);
  await client.query(`DELETE FROM loan_repayment_schedule WHERE loan_id=$1`, [loan.id]);
  await client.query(
    `UPDATE loans
     SET term_months=$1, due_date=$2::date, balance=$3, status='active'
     WHERE id=$4`,
    [termMonths, dueDate.toISOString().slice(0, 10), loan.amount, loan.id]
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

  await client.query(
    `UPDATE loan_repayment_schedule SET status='due'
     WHERE loan_id=$1 AND status='upcoming' AND due_date<=CURRENT_DATE AND paid_amount<total_due`,
    [loan.id]
  );
  await client.query(
    `UPDATE loan_repayment_schedule SET status='overdue'
     WHERE loan_id=$1 AND status IN ('due','partial') AND due_date < CURRENT_DATE AND paid_amount<total_due`,
    [loan.id]
  );
  const overdue = (await client.query(
    `SELECT 1 FROM loan_repayment_schedule WHERE loan_id=$1 AND status='overdue' LIMIT 1`,
    [loan.id]
  )).rows[0];
  if (overdue) {
    await client.query(`UPDATE loans SET status='overdue' WHERE id=$1`, [loan.id]);
  }

  console.log(`${reference}: ${termMonths} months, EMI ≈ ${payment.toLocaleString()}, due ${dueDate.toISOString().slice(0, 10)}`);
}

async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await rebuild(client, "LN-JUSTINE-16M-20260731", 6);
    await rebuild(client, "LN-MARY-10M-20260808", 10);
    await client.query("COMMIT");
    console.log("Done.");
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
