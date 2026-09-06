#!/usr/bin/env node
"use strict";
/**
 * Rebuild Jude Kyobe 15M loan cashflow:
 * - May 18: EMI + 187,031 (May installment paid)
 * - Jul 6: EMI + 187,031 for June (paid) — no late penalty on a paid June installment;
 *   combined surplus leftover credits July
 * - July unpaid remainder stays overdue → July late penalty after July due date
 * - August EMI stays clean on the due date; August late penalty only from the next day
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
  ssl:
    /railway|proxy|rlwy/i.test(databaseUrl) && !/127\.0\.0\.1|localhost/.test(databaseUrl)
      ? { rejectUnauthorized: false }
      : undefined,
});

const round = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;
const AMOUNT = 15000000;
const TERM = 5;
const RATE = 0.02;
const ADVANCE_EACH = 187031;
const REF = "LN-JUDE-15M-20260413";
const MARKER = "jude-payment-flow-2026-08";

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
      total,
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
        `SELECT l.id, l.member_id, l.disbursed_at, m.full_name
         FROM loans l JOIN members m ON m.id=l.member_id
         WHERE l.reference=$1`,
        [REF]
      )
    ).rows[0];
    if (!loan) throw new Error(`${REF} not found`);

    const actor =
      (
        await client.query(
          `SELECT id FROM users WHERE email ILIKE 'nakayiza.baraza.olivia@gmail.com' AND active=true LIMIT 1`
        )
      ).rows[0] ||
      (await client.query(`SELECT id FROM users WHERE active=true ORDER BY id LIMIT 1`)).rows[0];

    const start = loan.disbursed_at
      ? new Date(loan.disbursed_at)
      : new Date("2026-04-13T10:00:00+03:00");
    const { payment, rows } = emiRows(AMOUNT, TERM, RATE, start);
    const m1 = rows[0];
    const m2 = rows[1];
    const m3 = rows[2];
    const cashPerMonth = round(m1.total + ADVANCE_EACH);
    const junePenalty = 0;
    const surplusPool = ADVANCE_EACH * 2;
    const julyCredit = round(Math.max(0, surplusPool - junePenalty));

    await client.query(`DELETE FROM transactions WHERE loan_id=$1 AND type='Loan repayment'`, [
      loan.id,
    ]);
    await client.query(
      `DELETE FROM loan_charges WHERE loan_id=$1 AND charge_type='Late payment penalty'`,
      [loan.id]
    );
    await client.query(`DELETE FROM loan_repayment_schedule WHERE loan_id=$1`, [loan.id]);

    let remainingPrincipal = AMOUNT;
    const scheduleIds = {};

    for (const row of rows) {
      const inserted = (
        await client.query(
          `INSERT INTO loan_repayment_schedule
            (loan_id,installment_number,due_date,opening_balance,principal,interest,total_due,status)
           VALUES ($1,$2,$3,$4,$5,$6,$7,'upcoming')
           RETURNING id`,
          [loan.id, row.installment, row.dueDate, row.opening, row.principal, row.interest, row.total]
        )
      ).rows[0];
      scheduleIds[row.installment] = inserted.id;
    }

    // May — paid 18 May (EMI + surplus)
    await client.query(
      `UPDATE loan_repayment_schedule SET
        paid_amount=total_due, principal_paid=principal, interest_paid=interest,
        status='paid', paid_at='2026-05-18T12:00:00+03:00'
       WHERE id=$1`,
      [scheduleIds[1]]
    );
    remainingPrincipal = round(remainingPrincipal - m1.principal);
    await client.query(
      `INSERT INTO transactions
        (reference,member_id,type,method,amount,status,notes,recorded_by,verified_by,verified_at,created_at,loan_id,receipt_number)
       VALUES ($1,$2,'Loan repayment','Bank transfer',$3,'completed',$4,$5,$5,'2026-05-18T12:00:00+03:00','2026-05-18T12:00:00+03:00',$6,$7)`,
      [
        `RPY-JUDE-01`,
        loan.member_id,
        cashPerMonth,
        `${MARKER} Month 1 due 13 May — paid 18 May UGX ${cashPerMonth.toLocaleString()} (EMI ${m1.total.toLocaleString()} + surplus 187,031)`,
        actor.id,
        loan.id,
        `RCPT-JUDE-01`,
      ]
    );

    // June — paid 6 July (EMI + surplus). Paid installment: no late penalty shown/kept.
    await client.query(
      `UPDATE loan_repayment_schedule SET
        paid_amount=total_due, principal_paid=principal, interest_paid=interest,
        status='paid', paid_at='2026-07-06T12:00:00+03:00'
       WHERE id=$1`,
      [scheduleIds[2]]
    );
    remainingPrincipal = round(remainingPrincipal - m2.principal);
    await client.query(
      `INSERT INTO transactions
        (reference,member_id,type,method,amount,status,notes,recorded_by,verified_by,verified_at,created_at,loan_id,receipt_number)
       VALUES ($1,$2,'Loan repayment','Bank transfer',$3,'completed',$4,$5,$5,'2026-07-06T12:00:00+03:00','2026-07-06T12:00:00+03:00',$6,$7)`,
      [
        `RPY-JUDE-02`,
        loan.member_id,
        cashPerMonth,
        `${MARKER} Month 2 due 13 June — paid 6 July UGX ${cashPerMonth.toLocaleString()} (EMI ${m2.total.toLocaleString()} + surplus 187,031). Leftover surplus ${julyCredit.toLocaleString()} credited to July.`,
        actor.id,
        loan.id,
        `RCPT-JUDE-02`,
      ]
    );

    // July — surplus leftover reduces July principal first; remainder unpaid/overdue → July penalty after due date
    const principalPaid = Math.min(m3.principal, julyCredit);
    const interestPaid = 0;
    remainingPrincipal = round(remainingPrincipal - principalPaid);
    const julyRemaining = round(m3.total - julyCredit);
    const julyPenalty = round(m3.principal * 0.05);

    await client.query(
      `UPDATE loan_repayment_schedule SET
        paid_amount=$2, principal_paid=$3, interest_paid=$4,
        status='overdue', paid_at='2026-07-06T12:00:00+03:00'
       WHERE id=$1`,
      [scheduleIds[3], julyCredit, principalPaid, interestPaid]
    );
    await client.query(
      `INSERT INTO loan_charges
        (loan_id,charge_type,amount,paid_amount,status,reason,assessed_by,assessed_at,schedule_id,penalty_period)
       VALUES ($1,'Late payment penalty',$2,0,'outstanding',
         '5% penalty on July principal due (after 13 July)',
         $3,'2026-07-14T00:00:00+03:00',$4,$5)
       ON CONFLICT (loan_id,schedule_id,charge_type)
         WHERE charge_type='Late payment penalty' AND schedule_id IS NOT NULL
         DO UPDATE SET amount=EXCLUDED.amount, paid_amount=0, status='outstanding',
           reason=EXCLUDED.reason, penalty_period=EXCLUDED.penalty_period`,
      [loan.id, julyPenalty, actor.id, scheduleIds[3], m3.dueDate]
    );

    const m4 = rows[3];
    const augustPenalty = round(m4.principal * 0.05);
    await client.query(
      `UPDATE loan_repayment_schedule SET status='due'
       WHERE loan_id=$1 AND installment_number=4 AND due_date<=(CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Kampala')::date AND paid_amount<total_due`,
      [loan.id]
    );
    await client.query(
      `UPDATE loan_repayment_schedule SET status='upcoming'
       WHERE loan_id=$1 AND installment_number=5`,
      [loan.id]
    );
    await client.query(
      `UPDATE loan_repayment_schedule SET status='overdue'
       WHERE loan_id=$1 AND installment_number>=3 AND due_date<(CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Kampala')::date AND paid_amount<total_due`,
      [loan.id]
    );
    await client.query(
      `INSERT INTO loan_charges
        (loan_id,charge_type,amount,paid_amount,status,reason,assessed_by,assessed_at,schedule_id,penalty_period)
       SELECT $1,'Late payment penalty',$2,0,'outstanding',
         '5% penalty on August principal due (after 13 August)',
         $3,'2026-08-14T00:00:00+03:00',$4,$5
       WHERE EXISTS (
         SELECT 1 FROM loan_repayment_schedule s
         WHERE s.id=$4 AND s.status='overdue'
       )
       ON CONFLICT (loan_id,schedule_id,charge_type)
         WHERE charge_type='Late payment penalty' AND schedule_id IS NOT NULL
         DO UPDATE SET amount=EXCLUDED.amount, paid_amount=0, status='outstanding',
           reason=EXCLUDED.reason, penalty_period=EXCLUDED.penalty_period`,
      [loan.id, augustPenalty, actor.id, scheduleIds[4], m4.dueDate]
    );

    await client.query(
      `UPDATE loans SET amount=$1, balance=$2, status='overdue',
        due_date=(disbursed_at::date + ($3||' months')::interval)::date
       WHERE id=$4`,
      [AMOUNT, remainingPrincipal, TERM, loan.id]
    );

    await client.query("COMMIT");
    console.log(
      [
        `${loan.full_name} ${REF} rebuilt`,
        `EMI ${payment}`,
        `Paid ${cashPerMonth} on 18 May and ${cashPerMonth} on 6 Jul (incl. surplus)`,
        `July credit ${julyCredit} → remaining ${julyRemaining}`,
        `July penalty ${julyPenalty} (5% of July principal due)`,
        `August penalty ${augustPenalty} if overdue`,
        `Principal balance ${remainingPrincipal}`,
      ].join("\n  ")
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
