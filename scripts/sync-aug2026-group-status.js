#!/usr/bin/env node
"use strict";
/**
 * Align live KG40 member savings, FY26/27 shares/subscription, and running loans
 * with the Personal Savings Report (29 Aug 2026) and loan status Excel (30 Aug 2026).
 *
 * Usage:
 *   DATABASE_URL=... node scripts/sync-aug2026-group-status.js
 *   DATABASE_URL=... node scripts/sync-aug2026-group-status.js --dry-run
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

const round = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;
const MARKER = "sync-aug2026-group-status";
const SHARE_CAPITAL = 2000000;
const SUBSCRIPTION_FEE = 200000;

/** Personal Savings Report as at 29 Aug 2026 (Vicent overridden to 600,000). */
const SAVINGS_BY_NAME = [
  ["Vicent Gumisiriza", 600000],
  ["Charles Oketcho", 436245],
  ["Josephine Babirye Kyobe", 3370399],
  ["Francis Banumba", 3520163],
  ["Denis Tugume", 4524945],
  ["Nakayiza Baraza Olivia", 8053037],
  ["Dan Rwebingira Ssalongo", 8362852],
  ["Mary Babirye", 8640533],
  ["Justine Kaudha Inhensiko", 8921430],
  ["Tabula Robert", 8949185],
  ["Ntono Moreen", 8955259],
  ["Ritah Nakyanzi", 9041708],
  ["Ralph Masaba", 9127536],
  ["Jude Tadieus Kyobe", 9157811],
  ["Christopher Muhoozi", 9313242],
  ["Brian Mutiga", 9615863],
  ["Paul Kalemba", 9809123],
  ["Ezrah Nayoga", 11678502],
];

/** Loan status Excel 30 Aug 2026. */
const LOANS = {
  "LN-JUDE-15M-20260413": {
    amount: 15000000,
    termMonths: 5,
    principalOutstanding: 8868763,
    principalRepaid: 6131237,
    interestRepaid: 607577,
    feesOutstanding: 149958,
    processingFee: 300000,
  },
  "LN-JUSTINE-16M-20260731": {
    amount: 16000000,
    termMonths: 6,
    principalOutstanding: 16000000,
    processingFee: 320000,
  },
  "LN-MARY-25M-20260808": {
    amount: 25000000,
    termMonths: 10,
    principalOutstanding: 20502290,
    principalRepaid: 4497710,
    interestRepaid: 502290,
    repaymentCash: 5000000,
    processingFee: 500000,
  },
};

const NAME_ALIASES = {
  "Ntono Moreen": ["Tabula Moreen", "Ntono Moreen"],
};

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

async function findMember(client, name) {
  const aliases = NAME_ALIASES[name] || [name];
  for (const alias of aliases) {
    const exact = (
      await client.query(
        `SELECT id, full_name, member_number, savings_balance::float AS savings_balance,
          share_capital::float AS share_capital, legacy_opening_balance_id
         FROM members
         WHERE deleted_at IS NULL AND status = 'active' AND full_name ILIKE $1
         ORDER BY id LIMIT 1`,
        [alias]
      )
    ).rows[0];
    if (exact) return exact;
  }
  // Fallback: unique last-name match only when a single active member matches.
  const last = String(name).trim().split(/\s+/).pop();
  if (last && last.length > 2) {
    const rows = (
      await client.query(
        `SELECT id, full_name, member_number, savings_balance::float AS savings_balance,
          share_capital::float AS share_capital, legacy_opening_balance_id
         FROM members
         WHERE deleted_at IS NULL AND status = 'active' AND full_name ILIKE '%' || $1
         ORDER BY id`,
        [last]
      )
    ).rows;
    if (rows.length === 1) return rows[0];
  }
  return null;
}

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

async function ensureVicent(client, actor) {
  let member = await findMember(client, "Vicent Gumisiriza");
  if (member) return member;

  const branch = (await client.query(`SELECT id FROM branches WHERE active=true ORDER BY id LIMIT 1`)).rows[0];
  if (!branch) throw new Error("No active branch");

  console.log("  Creating Vicent Gumisiriza (G40-2026-0002)");
  if (dryRun) return { id: -1, full_name: "Vicent Gumisiriza", member_number: "G40-2026-0002" };

  member = (
    await client.query(
      `INSERT INTO members
        (member_number, full_name, phone, national_id, branch_id, savings_balance, share_capital,
         status, joined_at, created_by, provisional)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'active','2024-01-01',$8,true)
       RETURNING id, full_name, member_number, savings_balance::float AS savings_balance,
         share_capital::float AS share_capital, legacy_opening_balance_id`,
      [
        "G40-2026-0002",
        "Vicent Gumisiriza",
        "PROVISIONAL-PHONE-G40-2026-0002",
        "PROVISIONAL-NID-G40-2026-0002",
        branch.id,
        600000,
        SHARE_CAPITAL,
        actor,
      ]
    )
  ).rows[0];

  await client.query(
    `INSERT INTO member_bio_data(member_id, nationality, bio_status, record_notes, created_by)
     VALUES ($1,'Ugandan','pending',$2,$3) ON CONFLICT(member_id) DO NOTHING`,
    [member.id, "Provisional member created during Aug 2026 group status sync.", actor]
  );
  return member;
}

async function syncMemberBalances(client, actor, policy) {
  console.log("\n== Member savings, shares & subscription ==");
  await ensureVicent(client, actor);
  const fyYear = Number(policy.fy_end_year);

  for (const [name, savingsTarget] of SAVINGS_BY_NAME) {
    const member = await findMember(client, name);
    if (!member) {
      console.log(`  WARN member not found: ${name}`);
      continue;
    }

    const oldSavings = Number(member.savings_balance || 0);
    console.log(
      `  ${member.full_name}: savings ${oldSavings.toLocaleString()} → ${savingsTarget.toLocaleString()}, shares → ${SHARE_CAPITAL.toLocaleString()}`
    );

    if (dryRun) continue;

    await client.query(`UPDATE members SET savings_balance=$1, share_capital=$2 WHERE id=$3`, [
      savingsTarget,
      SHARE_CAPITAL,
      member.id,
    ]);

    if (member.legacy_opening_balance_id) {
      await client.query(
        `UPDATE legacy_member_opening_balances SET savings_balance=$1, share_capital=$2 WHERE id=$3`,
        [savingsTarget, SHARE_CAPITAL, member.legacy_opening_balance_id]
      );
    }

    const paid = (
      await client.query(
        `SELECT
          COALESCE(SUM(amount) FILTER (WHERE type='Share purchase' AND status='completed'),0)::float AS shares,
          COALESCE(SUM(amount) FILTER (WHERE type='Annual subscription fee' AND status='completed'),0)::float AS subscription
         FROM transactions
         WHERE member_id=$1
           AND (target_fiscal_year=$2 OR (target_fiscal_year IS NULL AND created_at::date BETWEEN $3 AND $4))`,
        [member.id, fyYear, policy.starts_on, policy.ends_on]
      )
    ).rows[0];

    const shareGap = round(SHARE_CAPITAL - Number(paid.shares || 0));
    if (shareGap > 0) {
      const existing = (
        await client.query(`SELECT id FROM transactions WHERE reference=$1`, [`SHR-${MARKER}-${member.id}`])
      ).rows[0];
      if (!existing) {
        await client.query(
          `INSERT INTO transactions
            (reference, member_id, type, method, amount, status, notes, recorded_by, verified_by,
             verified_at, created_at, target_fiscal_year, receipt_number)
           VALUES ($1,$2,'Share purchase','Bank transfer',$3,'completed',$4,$5,$5,
             '2026-08-29T12:00:00+03:00','2026-08-29T12:00:00+03:00',$6,$7)`,
          [
            `SHR-${MARKER}-${member.id}`,
            member.id,
            shareGap,
            `${MARKER} FY26/27 share capital cleared (UGX ${SHARE_CAPITAL.toLocaleString()})`,
            actor,
            fyYear,
            `RCPT-SHR-${member.member_number}`,
          ]
        );
      }
    }

    const subGap = round(SUBSCRIPTION_FEE - Number(paid.subscription || 0));
    if (subGap > 0) {
      const existing = (
        await client.query(`SELECT id FROM transactions WHERE reference=$1`, [`SUB-${MARKER}-${member.id}`])
      ).rows[0];
      if (!existing) {
        await client.query(
          `INSERT INTO transactions
            (reference, member_id, type, method, amount, status, notes, recorded_by, verified_by,
             verified_at, created_at, target_fiscal_year, receipt_number)
           VALUES ($1,$2,'Annual subscription fee','Bank transfer',$3,'completed',$4,$5,$5,
             '2026-08-29T12:00:00+03:00','2026-08-29T12:00:00+03:00',$6,$7)`,
          [
            `SUB-${MARKER}-${member.id}`,
            member.id,
            subGap,
            `${MARKER} FY26/27 annual subscription cleared (UGX ${SUBSCRIPTION_FEE.toLocaleString()})`,
            actor,
            fyYear,
            `RCPT-SUB-${member.member_number}`,
          ]
        );
      }
    }
  }
}

async function syncJudeLoan(client, actor) {
  const spec = LOANS["LN-JUDE-15M-20260413"];
  const loan = (
    await client.query(
      `SELECT l.id, l.member_id, l.disbursed_at, m.full_name
       FROM loans l JOIN members m ON m.id=l.member_id
       WHERE l.reference=$1`,
      ["LN-JUDE-15M-20260413"]
    )
  ).rows[0];
  if (!loan) throw new Error("Jude loan not found");

  console.log("\n== Jude loan → Excel 30 Aug 2026 ==");
  if (dryRun) {
    console.log(`  principal outstanding ${spec.principalOutstanding.toLocaleString()}`);
    return;
  }

  await client.query(`DELETE FROM loan_charges WHERE loan_id=$1 AND charge_type='Late payment penalty'`, [
    loan.id,
  ]);
  await client.query(`DELETE FROM transactions WHERE loan_id=$1 AND type='Loan repayment'`, [loan.id]);
  await client.query(`DELETE FROM loan_repayment_schedule WHERE loan_id=$1`, [loan.id]);

  const start = loan.disbursed_at ? new Date(loan.disbursed_at) : new Date("2026-04-13T10:00:00+03:00");
  const { payment, rows } = emiRows(spec.amount, spec.termMonths, 0.02, start);
  const m1 = rows[0];
  const m2 = rows[1];
  const m3 = rows[2];
  const ADVANCE_EACH = 187031;
  const cashPerMonth = round(m1.total + ADVANCE_EACH);
  const julyCredit = ADVANCE_EACH * 2;
  const m3InterestPaid = round(spec.interestRepaid - m1.interest - m2.interest);
  const m3PrincipalPaid = round(spec.principalRepaid - m1.principal - m2.principal);
  const scheduleIds = {};

  for (const row of rows) {
    const inserted = (
      await client.query(
        `INSERT INTO loan_repayment_schedule
          (loan_id, installment_number, due_date, opening_balance, principal, interest, total_due, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,'upcoming')
         RETURNING id`,
        [loan.id, row.installment, row.dueDate, row.opening, row.principal, row.interest, row.total]
      )
    ).rows[0];
    scheduleIds[row.installment] = inserted.id;
  }

  await client.query(
    `UPDATE loan_repayment_schedule SET
      paid_amount=total_due, principal_paid=principal, interest_paid=interest,
      status='paid', paid_at='2026-05-18T12:00:00+03:00'
     WHERE id=$1`,
    [scheduleIds[1]]
  );
  await client.query(
    `INSERT INTO transactions
      (reference, member_id, type, method, amount, status, notes, recorded_by, verified_by,
       verified_at, created_at, loan_id, receipt_number)
     VALUES ($1,$2,'Loan repayment','Bank transfer',$3,'completed',$4,$5,$5,
       '2026-05-18T12:00:00+03:00','2026-05-18T12:00:00+03:00',$6,$7)`,
    [
      `RPY-JUDE-01`,
      loan.member_id,
      cashPerMonth,
      `${MARKER} Month 1 paid 18 May (EMI + surplus)`,
      actor,
      loan.id,
      `RCPT-JUDE-01`,
    ]
  );

  await client.query(
    `UPDATE loan_repayment_schedule SET
      paid_amount=total_due, principal_paid=principal, interest_paid=interest,
      status='paid', paid_at='2026-07-06T12:00:00+03:00'
     WHERE id=$1`,
    [scheduleIds[2]]
  );
  await client.query(
    `INSERT INTO transactions
      (reference, member_id, type, method, amount, status, notes, recorded_by, verified_by,
       verified_at, created_at, loan_id, receipt_number)
     VALUES ($1,$2,'Loan repayment','Bank transfer',$3,'completed',$4,$5,$5,
       '2026-07-06T12:00:00+03:00','2026-07-06T12:00:00+03:00',$6,$7)`,
    [
      `RPY-JUDE-02`,
      loan.member_id,
      cashPerMonth,
      `${MARKER} Month 2 paid 6 Jul (EMI + surplus; surplus ${julyCredit.toLocaleString()} to July)`,
      actor,
      loan.id,
      `RCPT-JUDE-02`,
    ]
  );

  await client.query(
    `UPDATE loan_repayment_schedule SET
      paid_amount=$2, principal_paid=$3, interest_paid=$4,
      status='overdue', paid_at='2026-07-06T12:00:00+03:00'
     WHERE id=$1`,
    [scheduleIds[3], julyCredit, m3PrincipalPaid, m3InterestPaid]
  );

  if (spec.feesOutstanding > 0) {
    await client.query(
      `INSERT INTO loan_charges
        (loan_id, charge_type, amount, paid_amount, status, reason, assessed_by, assessed_at, schedule_id, penalty_period)
       VALUES ($1,'Late payment penalty',$2,0,'outstanding',
         'Late payment penalty per loan status 30 Aug 2026',
         $3,'2026-07-14T00:00:00+03:00',$4,$5)
       ON CONFLICT (loan_id, schedule_id, charge_type)
         WHERE charge_type='Late payment penalty' AND schedule_id IS NOT NULL
         DO UPDATE SET amount=EXCLUDED.amount, paid_amount=0, status='outstanding'`,
      [loan.id, spec.feesOutstanding, actor, scheduleIds[3], m3.dueDate]
    );
  }

  await client.query(
    `UPDATE loan_repayment_schedule SET status='overdue'
     WHERE loan_id=$1 AND installment_number>=3 AND due_date < CURRENT_DATE AND paid_amount < total_due`,
    [loan.id]
  );
  await client.query(
    `UPDATE loan_repayment_schedule SET status='due'
     WHERE loan_id=$1 AND installment_number=4 AND due_date <= CURRENT_DATE AND paid_amount < total_due`,
    [loan.id]
  );

  await client.query(
    `UPDATE loans SET amount=$1, balance=$2, status='overdue',
      due_date=(disbursed_at::date + ($3||' months')::interval)::date
     WHERE id=$4`,
    [spec.amount, spec.principalOutstanding, spec.termMonths, loan.id]
  );

  console.log(
    `  ${loan.full_name}: balance ${spec.principalOutstanding.toLocaleString()}, penalty ${spec.feesOutstanding.toLocaleString()}, EMI ${payment.toLocaleString()}`
  );
}

async function syncMaryLoan(client, actor) {
  const spec = LOANS["LN-MARY-25M-20260808"];
  const loan = (
    await client.query(
      `SELECT l.id, l.member_id, l.disbursed_at, m.full_name
       FROM loans l JOIN members m ON m.id=l.member_id
       WHERE l.reference=$1`,
      ["LN-MARY-25M-20260808"]
    )
  ).rows[0];
  if (!loan) throw new Error("Mary loan not found");

  console.log("\n== Mary loan → Excel 30 Aug 2026 ==");
  if (dryRun) {
    console.log(`  principal outstanding ${spec.principalOutstanding.toLocaleString()}`);
    return;
  }

  await client.query(`DELETE FROM loan_charges WHERE loan_id=$1 AND charge_type='Late payment penalty'`, [
    loan.id,
  ]);
  await client.query(`DELETE FROM transactions WHERE loan_id=$1 AND type='Loan repayment'`, [loan.id]);
  await client.query(`DELETE FROM loan_repayment_schedule WHERE loan_id=$1`, [loan.id]);

  const start = loan.disbursed_at ? new Date(loan.disbursed_at) : new Date("2026-08-08T10:00:00+03:00");
  const dueDate = new Date(start);
  dueDate.setMonth(dueDate.getMonth() + spec.termMonths);
  const { payment, rows } = emiRows(spec.amount, spec.termMonths, 0.02, start);
  const scheduleIds = {};

  for (const row of rows) {
    const inserted = (
      await client.query(
        `INSERT INTO loan_repayment_schedule
          (loan_id, installment_number, due_date, opening_balance, principal, interest, total_due, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,'upcoming')
         RETURNING id`,
        [loan.id, row.installment, row.dueDate, row.opening, row.principal, row.interest, row.total]
      )
    ).rows[0];
    scheduleIds[row.installment] = inserted.id;
  }

  let remaining = spec.repaymentCash;
  let principalApplied = 0;
  let interestApplied = 0;

  // Allocate per Excel: interest 502,290 then principal 4,497,710 across early installments.
  let interestLeft = spec.interestRepaid;
  let principalLeft = spec.principalRepaid;
  for (const row of rows) {
    if (interestLeft <= 0 && principalLeft <= 0) break;
    const interestPart = Math.min(interestLeft, row.interest);
    interestLeft = round(interestLeft - interestPart);
    const principalPart = Math.min(principalLeft, row.principal);
    principalLeft = round(principalLeft - principalPart);
    interestApplied += interestPart;
    principalApplied += principalPart;
    const paid = round(interestPart + principalPart);
    if (paid <= 0) continue;
    const paidStatus =
      principalPart >= row.principal - 0.005 && interestPart >= row.interest - 0.005 ? "paid" : "partial";
    await client.query(
      `UPDATE loan_repayment_schedule SET
        interest_paid=$2, principal_paid=$3, paid_amount=$4,
        status=$5, paid_at='2026-08-25T12:00:00+03:00'
       WHERE id=$1`,
      [scheduleIds[row.installment], interestPart, principalPart, paid, paidStatus]
    );
  }
  remaining = round(interestLeft + principalLeft);

  await client.query(
    `INSERT INTO transactions
      (reference, member_id, type, method, amount, status, notes, recorded_by, verified_by,
       verified_at, created_at, loan_id, receipt_number)
     VALUES ($1,$2,'Loan repayment','Bank transfer',$3,'completed',$4,$5,$5,
       '2026-08-25T12:00:00+03:00','2026-08-25T12:00:00+03:00',$6,$7)`,
    [
      `RPY-MARY-01`,
      loan.member_id,
      spec.repaymentCash,
      `${MARKER} Advance repayment UGX ${spec.repaymentCash.toLocaleString()} (principal ${spec.principalRepaid.toLocaleString()} + interest ${spec.interestRepaid.toLocaleString()})`,
      actor,
      loan.id,
      `RCPT-MARY-01`,
    ]
  );

  await client.query(
    `UPDATE loan_repayment_schedule SET status='upcoming'
     WHERE loan_id=$1 AND paid_amount < total_due AND due_date > CURRENT_DATE`,
    [loan.id]
  );
  await client.query(
    `UPDATE loan_repayment_schedule SET status='due'
     WHERE loan_id=$1 AND paid_amount < total_due AND due_date <= CURRENT_DATE`,
    [loan.id]
  );

  await client.query(
    `UPDATE loans SET amount=$1, balance=$2, term_months=$3, status='active', due_date=$4::date
     WHERE id=$5`,
    [spec.amount, spec.principalOutstanding, spec.termMonths, dueDate.toISOString().slice(0, 10), loan.id]
  );

  if (Math.abs(principalApplied - spec.principalRepaid) > 1 || Math.abs(interestApplied - spec.interestRepaid) > 1) {
    console.log(
      `  NOTE applied principal ${principalApplied.toLocaleString()} / interest ${interestApplied.toLocaleString()} — forced balance ${spec.principalOutstanding.toLocaleString()}`
    );
  }

  console.log(
    `  ${loan.full_name}: balance ${spec.principalOutstanding.toLocaleString()}, repaid ${spec.repaymentCash.toLocaleString()}, EMI ${payment.toLocaleString()}`
  );
}

async function syncJustineLoan(client) {
  const spec = LOANS["LN-JUSTINE-16M-20260731"];
  const loan = (
    await client.query(
      `SELECT l.id, l.member_id, l.disbursed_at, l.term_months, m.full_name
       FROM loans l JOIN members m ON m.id=l.member_id
       WHERE l.reference=$1`,
      ["LN-JUSTINE-16M-20260731"]
    )
  ).rows[0];
  if (!loan) throw new Error("Justine loan not found");

  console.log("\n== Justine loan → Excel 30 Aug 2026 ==");
  if (dryRun) {
    console.log(`  principal outstanding ${spec.principalOutstanding.toLocaleString()}`);
    return;
  }

  const start = loan.disbursed_at ? new Date(loan.disbursed_at) : new Date("2026-07-31T10:00:00+03:00");
  const dueDate = new Date(start);
  dueDate.setMonth(dueDate.getMonth() + spec.termMonths);

  const existingCount = (
    await client.query(`SELECT COUNT(*)::int AS c FROM loan_repayment_schedule WHERE loan_id=$1`, [loan.id])
  ).rows[0].c;

  if (existingCount !== spec.termMonths) {
    await client.query(`DELETE FROM loan_repayment_schedule WHERE loan_id=$1`, [loan.id]);
    const { rows } = emiRows(spec.amount, spec.termMonths, 0.02, start);
    for (const row of rows) {
      await client.query(
        `INSERT INTO loan_repayment_schedule
          (loan_id, installment_number, due_date, opening_balance, principal, interest, total_due, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,
           CASE WHEN $3::date <= CURRENT_DATE THEN 'due' ELSE 'upcoming' END)`,
        [loan.id, row.installment, row.dueDate, row.opening, row.principal, row.interest, row.total]
      );
    }
  }

  await client.query(
    `UPDATE loans SET amount=$1, balance=$2, term_months=$3, status='active', due_date=$4::date
     WHERE id=$5`,
    [spec.amount, spec.principalOutstanding, spec.termMonths, dueDate.toISOString().slice(0, 10), loan.id]
  );

  console.log(`  ${loan.full_name}: balance ${spec.principalOutstanding.toLocaleString()}, no repayments yet`);
}

async function printSummary(client) {
  const savings = (
    await client.query(
      `SELECT COALESCE(SUM(savings_balance),0)::float AS total, COUNT(*)::int AS members
       FROM members WHERE deleted_at IS NULL AND status='active'`
    )
  ).rows[0];
  const loans = await client.query(
    `SELECT l.reference, m.full_name, l.balance::float AS balance, l.status
     FROM loans l JOIN members m ON m.id=l.member_id
     WHERE l.status IN ('active','overdue') ORDER BY l.reference`
  );
  const subs = (
    await client.query(
      `SELECT COUNT(DISTINCT member_id)::int AS members
       FROM transactions
       WHERE type='Annual subscription fee' AND status='completed'
         AND (target_fiscal_year=2027 OR created_at >= '2026-07-01')`
    )
  ).rows[0];

  console.log("\n== Summary ==");
  console.log(`  Active members: ${savings.members}`);
  console.log(`  Total member savings: UGX ${Number(savings.total).toLocaleString()}`);
  console.log(`  Members with FY26/27 subscription: ${subs.members}`);
  for (const row of loans.rows) {
    console.log(`  ${row.reference} (${row.full_name}): UGX ${Number(row.balance).toLocaleString()} [${row.status}]`);
  }
  const principalSum = loans.rows.reduce((sum, row) => sum + Number(row.balance), 0);
  console.log(`  Total loan principal outstanding: UGX ${principalSum.toLocaleString()}`);
}

async function main() {
  console.log(dryRun ? "DRY RUN — no writes\n" : "Syncing Aug 2026 group status\n");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const policy = (
      await client.query(
        `SELECT starts_on, ends_on, annual_share_target::float, annual_subscription_fee::float,
          EXTRACT(YEAR FROM ends_on)::int AS fy_end_year
         FROM member_financial_year_policies
         WHERE status='active' AND CURRENT_DATE BETWEEN starts_on AND ends_on
         ORDER BY starts_on DESC LIMIT 1`
      )
    ).rows[0];
    if (!policy) throw new Error("No active member financial year policy");

    const actor = await actorId(client);
    if (!actor) throw new Error("No active user for recorded_by");

    await syncMemberBalances(client, actor, policy);
    await syncJudeLoan(client, actor);
    await syncMaryLoan(client, actor);
    await syncJustineLoan(client);

    if (dryRun) {
      await client.query("ROLLBACK");
      console.log("\nDry run complete (rolled back).");
    } else {
      await client.query("COMMIT");
      console.log("\nCommitted successfully.");
    }

    await printSummary(client);
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
