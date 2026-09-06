#!/usr/bin/env node
"use strict";
/**
 * 1) Clear FY25/26 savings shortfalls from Centenary statement credits (named payers only);
 *    surplus goes to current FY 26/27 (no past-year target).
 * 2) Register active running loans for Jude (15M), Justine (16M), Mary (10M default)
 *    with full apply → Credits → Executive → disburse history and supporting docs.
 *
 * Usage: DATABASE_URL=... node scripts/seed-running-loans-and-fy-clear.js
 *        DATABASE_URL=... node scripts/seed-running-loans-and-fy-clear.js --dry-run
 */
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

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

const round = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;
const MARKER = "seed-running-loans-fy-clear-2026-08";

/** Centenary credits mapped to members (Jul–Aug 2026 statement). */
const STATEMENT_CREDITS = [
  { name: "Ritah Nakyanzi", amount: 796073, date: "2026-07-01", note: "AGNTBANK DEP RITAH NAKYAZI" },
  { name: "Christopher Muhoozi", amount: 425000, date: "2026-07-02", note: "AGNTBANK DEP MUHOOZI CHRISTOPH" },
  { name: "Justine Kaudha Inhensiko", amount: 2301600, date: "2026-07-04", note: "AGNTBANK DEP JUSTINE" },
  { name: "Jude Tadieus Kyobe", amount: 3794407, date: "2026-07-06", note: "RTGS KYOBE JUDE TADIEUS" },
  { name: "Ralph Masaba", amount: 400000, date: "2026-07-16", note: "RTGS RALPH MASABA" },
  { name: "Denis Tugume", amount: 425000, date: "2026-07-23", note: "AGNTBANK DEP DENIS" },
  { name: "Tabula Robert", amount: 3500000, date: "2026-07-24", note: "AGNTBANK DEP TABULA ROBERT" },
  { name: "Tabula Moreen", amount: 3500000, date: "2026-07-24", note: "AGNTBANK DEP NTONO MAUREEN" },
  { name: "Dan Rwebingira Ssalongo", amount: 450000, date: "2026-07-24", note: "AGNTBANK DEP DAN" }
];

const ASSETS = path.join(
  process.env.USERPROFILE || "",
  ".cursor",
  "projects",
  "c-Users-PRINCE-Desktop-Credit-and-debt",
  "assets"
);
const uploadsDir = path.join(projectRoot, "storage", "uploads");

function copySupportDoc(sourceName, destPrefix) {
  const candidates = [
    path.join(ASSETS, sourceName),
    path.join(projectRoot, "assets", sourceName)
  ];
  const source = candidates.find((p) => fs.existsSync(p));
  if (!source) return null;
  fs.mkdirSync(uploadsDir, { recursive: true });
  const stored = `${destPrefix}-${crypto.randomBytes(6).toString("hex")}${path.extname(source) || ".png"}`;
  fs.copyFileSync(source, path.join(uploadsDir, stored));
  return {
    stored,
    original: path.basename(source),
    mime: "image/png"
  };
}

function emiSchedule(amount, months, monthlyRate = 0.02, startDate) {
  const factor = Math.pow(1 + monthlyRate, months);
  const payment = monthlyRate === 0
    ? round(amount / months)
    : round(amount * monthlyRate * factor / (factor - 1));
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

async function findMember(client, name) {
  const row = (await client.query(
    `SELECT id, full_name, member_number, savings_balance::float AS savings_balance,
      legacy_opening_balance_id
     FROM members
     WHERE status = 'active' AND (
       full_name ILIKE $1
       OR full_name ILIKE '%' || split_part($1,' ',1) || '%'
     )
     ORDER BY CASE WHEN full_name ILIKE $1 THEN 0 ELSE 1 END, id
     LIMIT 1`,
    [name]
  )).rows[0];
  return row || null;
}

async function actorIds(client) {
  const olivia = (await client.query(
    `SELECT id FROM users WHERE email ILIKE 'nakayiza.baraza.olivia@gmail.com' AND active=true LIMIT 1`
  )).rows[0];
  const credits = (await client.query(
    `SELECT u.id, u.full_name FROM governance_appointments g
     JOIN governance_bodies b ON b.id=g.body_id
     JOIN members m ON m.id=g.linked_member_id
     JOIN users u ON u.member_id=m.id
     WHERE b.code='credit-committee' AND g.status='active' AND u.active=true
     ORDER BY CASE WHEN LOWER(g.position_title) LIKE '%chair%' AND LOWER(g.position_title) NOT LIKE '%vice%' THEN 99 ELSE 1 END, u.id`
  )).rows;
  const exco = (await client.query(
    `SELECT u.id, u.full_name FROM governance_appointments g
     JOIN governance_bodies b ON b.id=g.body_id
     JOIN members m ON m.id=g.linked_member_id
     JOIN users u ON u.member_id=m.id
     WHERE b.code='exco' AND g.status='active' AND u.active=true
     ORDER BY CASE WHEN LOWER(u.full_name) LIKE '%tabula%robert%' THEN 99 ELSE 1 END, u.id`
  )).rows;
  const any = (await client.query(`SELECT id FROM users WHERE active=true ORDER BY id LIMIT 1`)).rows[0];
  return {
    oliviaId: olivia?.id || credits[credits.length - 1]?.id || any?.id,
    credits,
    exco,
    anyId: any?.id
  };
}

async function fyShortfall(client, memberId) {
  const row = (await client.query(
    `SELECT COALESCE(legacy.expected_savings,0)::float AS expected,
      COALESCE(legacy.savings_balance,0)::float AS opening,
      COALESCE((SELECT SUM(t.amount) FROM transactions t
        WHERE t.member_id=$1 AND t.type='Savings deposit' AND t.status='completed'
          AND t.target_fiscal_year=2026),0)::float AS toward_fy
     FROM members m
     LEFT JOIN legacy_member_opening_balances legacy ON legacy.id=m.legacy_opening_balance_id
     WHERE m.id=$1`,
    [memberId]
  )).rows[0];
  if (!row) return { expected: 0, paid: 0, shortfall: 0 };
  const paid = round(Number(row.opening) + Number(row.toward_fy));
  const expected = round(Number(row.expected) || 8300000);
  return { expected, paid, shortfall: Math.max(0, round(expected - paid)) };
}

async function clearFyDeposits(client, recorderId) {
  console.log("\n== FY25/26 clearance from bank statement ==");
  for (const credit of STATEMENT_CREDITS) {
    const member = await findMember(client, credit.name);
    if (!member) {
      console.log(`  SKIP ${credit.name}: member not found`);
      continue;
    }
    const existing = (await client.query(
      `SELECT id FROM transactions
       WHERE member_id=$1 AND type='Savings deposit' AND notes LIKE $2 LIMIT 1`,
      [member.id, `%${MARKER}%${credit.date}%${credit.amount}%`]
    )).rows[0];
    if (existing) {
      console.log(`  SKIP ${member.full_name}: already seeded ${credit.amount}`);
      continue;
    }

    const { shortfall, expected, paid } = await fyShortfall(client, member.id);
    const towardPast = Math.min(credit.amount, shortfall);
    const towardCurrent = round(credit.amount - towardPast);
    console.log(
      `  ${member.full_name}: credit ${credit.amount} | expected ${expected} paid ${paid} shortfall ${shortfall}` +
      ` → FY2026 ${towardPast} | current ${towardCurrent}`
    );

    if (dryRun) continue;

    if (towardPast > 0) {
      await client.query(
        `INSERT INTO transactions
          (reference,member_id,type,method,amount,status,notes,recorded_by,verified_by,verified_at,created_at,target_fiscal_year)
         VALUES ($1,$2,'Savings deposit','Bank transfer',$3,'completed',$4,$5,$5,$6::timestamptz,$6::timestamptz,2026)`,
        [
          `DEP-FY26-${member.id}-${credit.date.replaceAll("-", "")}`,
          member.id,
          towardPast,
          `${MARKER} ${credit.date} ${credit.amount} | Centenary: ${credit.note} | Clears FY25/26 target`,
          recorderId,
          `${credit.date}T12:00:00+03:00`
        ]
      );
    }
    if (towardCurrent > 0) {
      await client.query(
        `INSERT INTO transactions
          (reference,member_id,type,method,amount,status,notes,recorded_by,verified_by,verified_at,created_at,target_fiscal_year)
         VALUES ($1,$2,'Savings deposit','Bank transfer',$3,'completed',$4,$5,$5,$6::timestamptz,$6::timestamptz,NULL)`,
        [
          `DEP-CUR-${member.id}-${credit.date.replaceAll("-", "")}`,
          member.id,
          towardCurrent,
          `${MARKER} ${credit.date} ${credit.amount} | Centenary: ${credit.note} | Surplus to FY26/27`,
          recorderId,
          `${credit.date}T12:05:00+03:00`
        ]
      );
    }
    await client.query(
      `UPDATE members SET savings_balance = savings_balance + $1 WHERE id=$2`,
      [credit.amount, member.id]
    );
  }
}

async function seedApprovalTrail(client, loanId, actors, appliedAt) {
  const { credits, exco } = actors;
  let t = new Date(appliedAt);
  await client.query(
    `INSERT INTO loan_workflow_events (loan_id,stage,action,actor_id,comment,created_at)
     VALUES ($1,'application','submitted',$2,'Member self-application submitted via member portal',$3)`,
    [loanId, actors.anyId, t.toISOString()]
  );

  for (const reviewer of credits) {
    t = new Date(t.getTime() + 3600_000);
    await client.query(
      `INSERT INTO loan_stage_votes (loan_id,stage,user_id,decision,comment,created_at)
       VALUES ($1,'credits',$2,'approve','Credit Committee approval',$3)
       ON CONFLICT (loan_id,stage,user_id) DO NOTHING`,
      [loanId, reviewer.id, t.toISOString()]
    );
    await client.query(
      `INSERT INTO loan_workflow_events (loan_id,stage,action,actor_id,comment,created_at)
       VALUES ($1,'credits','approved',$2,$3,$4)`,
      [loanId, reviewer.id, `${reviewer.full_name} approved (Credit Committee)`, t.toISOString()]
    );
  }

  for (const reviewer of exco) {
    t = new Date(t.getTime() + 3600_000);
    await client.query(
      `INSERT INTO loan_stage_votes (loan_id,stage,user_id,decision,comment,created_at)
       VALUES ($1,'executive',$2,'approve','Executive Committee authorization',$3)
       ON CONFLICT (loan_id,stage,user_id) DO NOTHING`,
      [loanId, reviewer.id, t.toISOString()]
    );
    await client.query(
      `INSERT INTO loan_workflow_events (loan_id,stage,action,actor_id,comment,created_at)
       VALUES ($1,'executive','approved',$2,$3,$4)`,
      [loanId, reviewer.id, `${reviewer.full_name} authorized (Executive)`, t.toISOString()]
    );
  }
}

async function ensureNoActiveLoan(client, memberId, reference) {
  const existing = (await client.query(
    `SELECT id, reference, status FROM loans
     WHERE member_id=$1 AND status IN ('active','overdue','ready-disbursement','officer-review','pending','executive-review')
     ORDER BY id DESC`,
    [memberId]
  )).rows;
  const same = existing.find((l) => l.reference === reference);
  if (same) return same;
  for (const loan of existing) {
    console.log(`  Closing conflicting loan ${loan.reference} (${loan.status}) for member ${memberId}`);
    if (!dryRun) {
      await client.query(`UPDATE loans SET status='closed', balance=0 WHERE id=$1`, [loan.id]);
    }
  }
  return null;
}

async function insertActiveLoan(client, opts) {
  const {
    reference, member, productId, amount, termMonths, purpose, disbursedAt,
    securityType, collateralDescription, collateralValue, collateralOwner,
    guarantors, doc, actors, processingFee, disburseMethod, destination,
    applyJudePayments
  } = opts;

  const existing = await ensureNoActiveLoan(client, member.id, reference);
  if (existing) {
    console.log(`  SKIP loan ${reference}: already exists (#${existing.id})`);
    return existing.id;
  }

  console.log(`  Creating ${reference} for ${member.full_name}: UGX ${amount.toLocaleString()} / ${termMonths} mo`);
  if (dryRun) return null;

  const appliedAt = new Date(new Date(disbursedAt).getTime() - 5 * 86400_000);
  const fee = processingFee != null ? processingFee : round(amount * 0.02);
  const netCash = round(amount - fee);
  const dueDate = new Date(disbursedAt);
  dueDate.setMonth(dueDate.getMonth() + termMonths);

  const loan = (await client.query(
    `INSERT INTO loans (
      reference, member_id, product_id, amount, balance, term_months, purpose, status,
      savings_at_application, existing_loan_balance, eligibility_result, verified_amount,
      authorized_by, authorized_at, disbursed_at, due_date,
      security_type, collateral_description, collateral_value, collateral_owner,
      collateral_owner_consent, borrower_declaration_accepted,
      supporting_document_stored_name, supporting_document_original_name, supporting_document_mime_type,
      processing_fee, policy_reference, created_at
    ) VALUES (
      $1,$2,$3,$4,$4,$5,$6,'active',
      $7,0,'Eligible — historical running loan registered',$4,
      $8,$9::timestamptz,$9::timestamptz,$20::date,
      $10,$11,$12,$13,
      $14,true,
      $15,$16,$17,
      $18,'AGM-2025-LOAN-RESOLUTION',$19::timestamptz
    ) RETURNING id`,
    [
      reference, member.id, productId, amount, termMonths, purpose,
      member.savings_balance || 0,
      actors.exco[actors.exco.length - 1]?.id || actors.anyId,
      disbursedAt,
      securityType, collateralDescription, collateralValue, collateralOwner,
      Boolean(collateralOwner),
      doc?.stored || null, doc?.original || null, doc?.mime || null,
      fee, appliedAt.toISOString(), dueDate.toISOString().slice(0, 10)
    ]
  )).rows[0];

  await seedApprovalTrail(client, loan.id, actors, appliedAt);

  await client.query(
    `INSERT INTO loan_disbursements
      (loan_id,amount,method,destination,status,prepared_by,authorized_by,disbursed_by,
       transaction_reference,prepared_at,authorized_at,disbursed_at)
     VALUES ($1,$2,$3,$4,'disbursed',$5,$6,$5,$7,$8::timestamptz,$8::timestamptz,$8::timestamptz)`,
    [
      loan.id, amount, disburseMethod, destination,
      actors.oliviaId, actors.exco[actors.exco.length - 1]?.id || actors.anyId,
      `DSB-${reference}`, disbursedAt
    ]
  );

  await client.query(
    `INSERT INTO transactions
      (reference,member_id,type,method,amount,status,external_reference,notes,recorded_by,verified_by,verified_at,created_at,loan_id)
     VALUES ($1,$2,'Loan disbursement',$3,$4,'completed',$5,$6,$7,$7,$8::timestamptz,$8::timestamptz,$9)`,
    [
      `DSB-${reference}`, member.id, disburseMethod, netCash, destination,
      `${MARKER} Net after ${fee} processing fee. Full principal ${amount} remains repayable.`,
      actors.oliviaId, disbursedAt, loan.id
    ]
  );

  if (fee > 0) {
    await client.query(
      `INSERT INTO loan_charges (loan_id,charge_type,amount,paid_amount,status,reason,assessed_by,assessed_at)
       VALUES ($1,'Processing fee',$2,$2,'paid',$3,$4,$5::timestamptz)`,
      [loan.id, fee, "2% processing fee deducted at disbursement", actors.oliviaId, disbursedAt]
    );
  }

  await client.query(
    `INSERT INTO loan_workflow_events (loan_id,stage,action,actor_id,comment,created_at)
     VALUES ($1,'disbursement','disbursed',$2,$3,$4::timestamptz)`,
    [loan.id, actors.oliviaId, `${disburseMethod} to ${destination} — DSB-${reference}`, disbursedAt]
  );

  for (const g of guarantors || []) {
    const guarantor = await findMember(client, g.name);
    if (!guarantor) {
      console.log(`    WARN guarantor not found: ${g.name}`);
      continue;
    }
    await client.query(
      `INSERT INTO loan_guarantors (loan_id,member_id,guaranteed_amount,status,responded_at,response_note)
       VALUES ($1,$2,$3,'accepted',$4::timestamptz,'Accepted guarantorship for historical running loan')
       ON CONFLICT (loan_id,member_id) DO UPDATE SET status='accepted', guaranteed_amount=EXCLUDED.guaranteed_amount`,
      [loan.id, guarantor.id, g.amount ?? round(amount / (guarantors.length || 1)), disbursedAt]
    );
  }

  const { rows } = emiSchedule(amount, termMonths, 0.02, new Date(disbursedAt));
  let remainingPrincipal = amount;
  const ADVANCE_EACH = 187031;
  const JULY_ADVANCE = ADVANCE_EACH * 2;
  const AUG_PENALTY = 149958;
  const scheduleIds = {};

  for (const row of rows) {
    const totalDue = row.total;
    const schedule = (await client.query(
      `INSERT INTO loan_repayment_schedule
        (loan_id,installment_number,due_date,opening_balance,principal,interest,total_due,status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'upcoming')
       RETURNING id`,
      [loan.id, row.installment, row.dueDate, row.opening, row.principal, row.interest, totalDue]
    )).rows[0];
    scheduleIds[row.installment] = schedule.id;
  }

  if (applyJudePayments) {
    const cashPerMonth = round(rows[0].total + ADVANCE_EACH);
    // 1) 18 May — one payment of EMI + surplus 187,031
    await client.query(
      `UPDATE loan_repayment_schedule SET
        paid_amount=total_due, principal_paid=principal, interest_paid=interest,
        status='paid', paid_at='2026-05-18T12:00:00+03:00'
       WHERE id=$1`,
      [scheduleIds[1]]
    );
    remainingPrincipal = round(remainingPrincipal - rows[0].principal);
    await client.query(
      `INSERT INTO transactions
        (reference,member_id,type,method,amount,status,notes,recorded_by,verified_by,verified_at,created_at,loan_id,receipt_number)
       VALUES ($1,$2,'Loan repayment','Bank transfer',$3,'completed',$4,$5,$5,'2026-05-18T12:00:00+03:00','2026-05-18T12:00:00+03:00',$6,$7)`,
      [`RPY-${reference}-01`, member.id, cashPerMonth, `${MARKER} Month 1 due 13 May — paid 18 May UGX ${cashPerMonth} (EMI + surplus 187,031 toward later month)`, actors.oliviaId, loan.id, `RCPT-${reference}-01`]
    );

    // 2) 6 July — one payment of EMI + surplus 187,031 (late penalty forgiven)
    await client.query(
      `UPDATE loan_repayment_schedule SET
        paid_amount=total_due, principal_paid=principal, interest_paid=interest,
        status='paid', paid_at='2026-07-06T12:00:00+03:00'
       WHERE id=$1`,
      [scheduleIds[2]]
    );
    remainingPrincipal = round(remainingPrincipal - rows[1].principal);
    await client.query(
      `INSERT INTO transactions
        (reference,member_id,type,method,amount,status,notes,recorded_by,verified_by,verified_at,created_at,loan_id,receipt_number)
       VALUES ($1,$2,'Loan repayment','Bank transfer',$3,'completed',$4,$5,$5,'2026-07-06T12:00:00+03:00','2026-07-06T12:00:00+03:00',$6,$7)`,
      [`RPY-${reference}-02`, member.id, cashPerMonth, `${MARKER} Month 2 due 13 June — paid late 6 July UGX ${cashPerMonth} (EMI + surplus 187,031; late penalty forgiven). Combined surplus 374,062 credited to July.`, actors.oliviaId, loan.id, `RCPT-${reference}-02`]
    );

    // 3) July installment — 374,062 surplus credit applied; remainder unpaid; 149,958 penalty on Aug
    const interestPaid = Math.min(JULY_ADVANCE, rows[2].interest);
    const principalPaid = Math.min(rows[2].principal, Math.max(0, JULY_ADVANCE - interestPaid));
    remainingPrincipal = round(remainingPrincipal - principalPaid);
    await client.query(
      `UPDATE loan_repayment_schedule SET
        paid_amount=$2, principal_paid=$3, interest_paid=$4,
        status='overdue', paid_at='2026-07-06T12:00:00+03:00'
       WHERE id=$1`,
      [scheduleIds[3], JULY_ADVANCE, principalPaid, interestPaid]
    );
    await client.query(
      `INSERT INTO loan_charges
        (loan_id,charge_type,amount,paid_amount,status,reason,assessed_by,assessed_at,schedule_id,penalty_period)
       VALUES ($1,'Late payment penalty',$2,0,'outstanding',
         '5% July principal penalty 149,958 — due with next repayment',$3,'2026-07-14T00:00:00+03:00',$4,'2026-07-01')
       ON CONFLICT (loan_id,schedule_id,penalty_period,charge_type)
         WHERE charge_type='Late payment penalty' AND schedule_id IS NOT NULL AND penalty_period IS NOT NULL
         DO NOTHING`,
      [loan.id, AUG_PENALTY, actors.oliviaId, scheduleIds[3]]
    );
  }

  // Refresh schedule statuses relative to today
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

  if (applyJudePayments) {
    await client.query(`UPDATE loans SET balance=$1 WHERE id=$2`, [remainingPrincipal, loan.id]);
  } else {
    await client.query(`UPDATE loans SET balance=$1 WHERE id=$2`, [amount, loan.id]);
  }

  const overdue = (await client.query(
    `SELECT 1 FROM loan_repayment_schedule WHERE loan_id=$1 AND status='overdue' LIMIT 1`,
    [loan.id]
  )).rows[0];
  if (overdue) {
    await client.query(`UPDATE loans SET status='overdue' WHERE id=$1`, [loan.id]);
  }

  return loan.id;
}

async function seedLoans(client, actors) {
  console.log("\n== Running loans ==");
  const product = (await client.query(
    `SELECT id FROM loan_products WHERE active=true ORDER BY CASE WHEN name ILIKE '%personal%' THEN 0 ELSE 1 END, id LIMIT 1`
  )).rows[0];
  if (!product) throw new Error("No active loan product");

  await client.query(
    `UPDATE loan_products SET interest_method='equal_total_payments' WHERE active=true`
  );

  // Close leftover test loans that are not the three historical running loans.
  const stale = (await client.query(
    `SELECT l.id, l.reference, l.status, m.full_name
     FROM loans l JOIN members m ON m.id=l.member_id
     WHERE l.reference NOT LIKE 'LN-JUDE-%'
       AND l.reference NOT LIKE 'LN-JUSTINE-%'
       AND l.reference NOT LIKE 'LN-MARY-%'
       AND l.status IN ('ready-disbursement','officer-review','pending','executive-review','active','overdue')`
  )).rows;
  for (const loan of stale) {
    console.log(`  Closing stale loan ${loan.reference} (${loan.status}) — ${loan.full_name}`);
    if (!dryRun) {
      await client.query(`UPDATE loans SET status='closed', balance=0 WHERE id=$1`, [loan.id]);
    }
  }

  // Jude — 15M on 13 Apr 2026, 5 months, no collateral/guarantors
  const jude = await findMember(client, "Jude Tadieus Kyobe");
  if (!jude) throw new Error("Jude Tadieus Kyobe not found");
  const judeDoc = copySupportDoc(
    "c__Users_PRINCE_AppData_Roaming_Cursor_User_workspaceStorage_c4fc1f1555d7ea19e5978665178bc86c_images_image-638c6c67-ad97-43bf-bedc-2840f12855d4.png",
    "jude-kyobe-schedule"
  ) || copySupportDoc(
    "c__Users_PRINCE_AppData_Roaming_Cursor_User_workspaceStorage_c4fc1f1555d7ea19e5978665178bc86c_images_image-09911052-1ce1-4e31-a023-6d55bea72aac.png",
    "jude-kyobe-calc"
  );
  await insertActiveLoan(client, {
    reference: "LN-JUDE-15M-20260413",
    member: jude,
    productId: product.id,
    amount: 15000000,
    termMonths: 5,
    purpose: "Personal loan — equal total payments (historical running loan)",
    disbursedAt: "2026-04-13T10:00:00+03:00",
    securityType: "none",
    collateralDescription: null,
    collateralValue: null,
    collateralOwner: null,
    guarantors: [],
    doc: judeDoc,
    actors,
    processingFee: 300000,
    disburseMethod: "Bank transfer",
    destination: "Member Centenary account",
    applyJudePayments: true
  });

  // Justine — 16M on 31 Jul 2026, 6 months, guarantors Ralph + Olivia
  const justine = await findMember(client, "Justine Kaudha Inhensiko");
  if (!justine) throw new Error("Justine Kaudha Inhensiko not found");
  const justineDoc = copySupportDoc(
    "c__Users_PRINCE_AppData_Roaming_Cursor_User_workspaceStorage_c4fc1f1555d7ea19e5978665178bc86c_images_image-e6740108-2975-4b8d-993d-c6c019ece01d.png",
    "justine-loan-agreement"
  );
  await insertActiveLoan(client, {
    reference: "LN-JUSTINE-16M-20260731",
    member: justine,
    productId: product.id,
    amount: 16000000,
    termMonths: 6,
    purpose: "Personal loan per Kasangati G40 Kwagalana loan agreement",
    disbursedAt: "2026-07-31T10:00:00+03:00",
    securityType: "guarantors",
    collateralDescription: null,
    collateralValue: null,
    collateralOwner: null,
    guarantors: [
      { name: "Ralph Masaba", amount: 8000000 },
      { name: "Nakayiza Baraza Olivia", amount: 8000000 }
    ],
    doc: justineDoc,
    actors,
    processingFee: 320000,
    disburseMethod: "Cheque",
    destination: "CHQ 61 IFO INHENSIKO KAUDHA JUSTINE (net 15,680,000)",
    applyJudePayments: false
  });

  // Mary — 25M on 8 Aug 2026 with land collateral
  const mary = await findMember(client, "Mary Babirye");
  if (!mary) throw new Error("Mary Babirye not found");
  const maryDoc = copySupportDoc(
    "c__Users_PRINCE_AppData_Roaming_Cursor_User_workspaceStorage_c4fc1f1555d7ea19e5978665178bc86c_images_image-c4a02430-6618-4fc3-a665-f978246bc0b3.png",
    "mary-land-title"
  ) || copySupportDoc(
    "c__Users_PRINCE_AppData_Roaming_Cursor_User_workspaceStorage_c4fc1f1555d7ea19e5978665178bc86c_images_image-73a0ecbd-7efb-423e-8deb-8f4053a2979f.png",
    "mary-land-photo"
  );
  await insertActiveLoan(client, {
    reference: "LN-MARY-25M-20260808",
    member: mary,
    productId: product.id,
    amount: 25000000,
    termMonths: 10,
    purpose: "Personal loan secured by land title Bulemezi Block 445 Plot 26 (UGX 25,000,000)",
    disbursedAt: "2026-08-08T10:00:00+03:00",
    securityType: "collateral",
    collateralDescription:
      "Land at NAKATETE Bulemezi, Block 445 Plot 26, Area 1.2140 ha, PIN 64000115908, Instrument LUW-00101779. Owner BABIRYE MARY NIN CF700071087GYL. No encumbrances (search LUW00207557 dated 04/Aug/2026).",
    collateralValue: 25000000,
    collateralOwner: "BABIRYE MARY",
    guarantors: [],
    doc: maryDoc,
    actors,
    processingFee: 500000,
    disburseMethod: "Bank transfer",
    destination: "Member Centenary account",
    applyJudePayments: false
  });
}

async function main() {
  console.log(dryRun ? "DRY RUN — no writes\n" : "Seeding FY clearances + running loans\n");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const actors = await actorIds(client);
    if (!actors.anyId) throw new Error("No active users found");
    await clearFyDeposits(client, actors.oliviaId || actors.anyId);
    await seedLoans(client, actors);
    if (dryRun) {
      await client.query("ROLLBACK");
      console.log("\nDry run complete (rolled back).");
    } else {
      await client.query("COMMIT");
      console.log("\nCommitted successfully.");
    }
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
