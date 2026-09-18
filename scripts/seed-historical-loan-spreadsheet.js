#!/usr/bin/env node
"use strict";
/**
 * Import Kasangati G40 historical loan spreadsheet into completed loan history.
 *
 * - Credits "Loan process history" shows decided/completed loans
 * - Member My Loans → Loan history shows completed/closed
 * - Spreadsheet "still running" / "NOT CLEAR" rows are treated as CLEARED (report not updated)
 * - Interest follows the sheet: 4% flat or 4% equal-principal reducing balance
 *
 *   $env:DATABASE_URL="..."
 *   node scripts/seed-historical-loan-spreadsheet.js
 *   node scripts/seed-historical-loan-spreadsheet.js --dry-run
 */
const { pool } = require("../src/db");

const MARKER = "HIST-LOAN-SPREADSHEET-2023-2025";
const dryRun = process.argv.includes("--dry-run");
const MONTHLY_RATE = 0.04;

function round(n) {
  return Math.round(Number(n) || 0);
}

function addMonths(isoDate, months) {
  const d = new Date(`${isoDate}T12:00:00+03:00`);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

function isoTs(date, hour = 12) {
  return `${date}T${String(hour).padStart(2, "0")}:00:00+03:00`;
}

/** Equal-principal reducing balance at monthlyRate (matches sheet interest totals). */
function reducingSchedule(amount, months, startDate, monthlyRate = MONTHLY_RATE) {
  const principalEach = round(amount / months);
  let balance = round(amount);
  const rows = [];
  let interestTotal = 0;
  for (let i = 1; i <= months; i++) {
    const opening = balance;
    const interest = round(opening * monthlyRate);
    const principal = i === months ? opening : principalEach;
    const total = round(principal + interest);
    interestTotal += interest;
    rows.push({
      installment: i,
      dueDate: addMonths(startDate, i),
      opening,
      principal,
      interest,
      total,
    });
    balance = round(Math.max(0, opening - principal));
  }
  return { interestTotal: round(interestTotal), rows };
}

/** Flat 4%: interest = principal × rate × months, split evenly across months. */
function flatSchedule(amount, months, startDate, interestOverride = null, monthlyRate = MONTHLY_RATE) {
  const interestTotal = interestOverride != null
    ? round(interestOverride)
    : round(amount * monthlyRate * months);
  const principalEach = round(amount / months);
  const interestEach = round(interestTotal / months);
  let balance = round(amount);
  let interestAssigned = 0;
  const rows = [];
  for (let i = 1; i <= months; i++) {
    const opening = balance;
    const principal = i === months ? opening : principalEach;
    const interest = i === months ? round(interestTotal - interestAssigned) : interestEach;
    interestAssigned += interest;
    const total = round(principal + interest);
    rows.push({
      installment: i,
      dueDate: addMonths(startDate, i),
      opening,
      principal,
      interest,
      total,
    });
    balance = round(Math.max(0, opening - principal));
  }
  return { interestTotal, rows };
}

const HISTORICAL_MEMBERS = [
  {
    key: "joshua",
    fullName: "Joshua Ssewanyana",
    aliases: ["SSEWANYANA JOSUA", "Joshua Ssewanyana"],
    memberNumber: "G40-HIST-JOSHUA",
    status: "exited",
  },
  {
    key: "ezra",
    fullName: "Ezra Mujjabwami",
    aliases: ["EZRA MUJABWAMI", "Ezra Mujjabwami"],
    memberNumber: "G40-HIST-EZRA",
    status: "exited",
  },
  {
    key: "gerald",
    fullName: "Barasa Gerald",
    aliases: ["GERALD BARASA", "Barasa Gerald", "Gerald Barasa"],
    memberNumber: "G40-HIST-GERALD",
    status: "exited",
  },
];

const MEMBER_ALIASES = [
  { match: /ssewanyana|josua|^joshua\b/i, name: "Joshua Ssewanyana" },
  { match: /mujjabwami|mujabwami/i, name: "Ezra Mujjabwami" },
  { match: /barasa|gerald/i, name: "Barasa Gerald" },
  { match: /jude|kyobe|tade/i, name: "Jude Tadieus Kyobe" },
  { match: /justine|kaudha|inhensiko|inhesiko/i, name: "Justine Kaudha Inhensiko" },
  { match: /tabula/i, name: "Tabula Robert" },
  { match: /rita|ritah|nakyanzi/i, name: "Ritah Nakyanzi" },
  { match: /kalemba/i, name: "Paul Kalemba" },
  { match: /brian|brain|mutiga/i, name: "Brian Mutiga" },
  { match: /babirye\s*mary|mary\s*babirye|^babirye mary$/i, name: "Mary Babirye" },
  { match: /masaba|ralph/i, name: "Ralph Masaba" },
];

/**
 * Spreadsheet loans — all stored as completed history.
 * method: flat | reducing
 * sheetStatus kept for audit; runtime status is always completed.
 */
const LOANS = [
  // —— 2023/24 (no dates on sheet; spaced across the FY) ——
  { ref: "LN-HIST-JOSHUA-5M-20230815", member: "Joshua Ssewanyana", amount: 5000000, months: 5, method: "flat", fee: 0, interest: 1200000, taken: "2023-08-15", sheetStatus: "CLEARED" },
  { ref: "LN-HIST-JUDE-6M-20230915", member: "Jude Tadieus Kyobe", amount: 6000000, months: 1, method: "flat", fee: 0, interest: 240000, taken: "2023-09-15", sheetStatus: "CLEARED" },
  { ref: "LN-HIST-JUDE-7M-20231015", member: "Jude Tadieus Kyobe", amount: 7000000, months: 2, method: "flat", fee: 0, interest: 560000, taken: "2023-10-15", sheetStatus: "CLEARED" },
  { ref: "LN-HIST-EZRA-10M-20231115", member: "Ezra Mujjabwami", amount: 10000000, months: 4, method: "flat", fee: 0, interest: 1600000, taken: "2023-11-15", sheetStatus: "CLEARED" },
  { ref: "LN-HIST-JUSTINE-15M-20231215", member: "Justine Kaudha Inhensiko", amount: 15000000, months: 4, method: "flat", fee: 0, interest: 2400000, taken: "2023-12-15", sheetStatus: "CLEARED" },
  { ref: "LN-HIST-TABULA-10M-20240115", member: "Tabula Robert", amount: 10000000, months: 1, method: "flat", fee: 0, interest: 400000, taken: "2024-01-15", sheetStatus: "CLEARED" },
  { ref: "LN-HIST-JUDE-10M-20240215", member: "Jude Tadieus Kyobe", amount: 10000000, months: 1, method: "flat", fee: 0, interest: 400000, taken: "2024-02-15", sheetStatus: "CLEARED" },
  { ref: "LN-HIST-RITA-10M-20240315", member: "Ritah Nakyanzi", amount: 10000000, months: 1, method: "flat", fee: 0, interest: 400000, taken: "2024-03-15", sheetStatus: "CLEARED" },
  { ref: "LN-HIST-PAUL-6M-20240415", member: "Paul Kalemba", amount: 6000000, months: 1, method: "flat", fee: 0, interest: 240000, taken: "2024-04-15", sheetStatus: "CLEARED" },

  // —— 2024/25 ——
  { ref: "LN-HIST-GERALD-8M-20240521", member: "Barasa Gerald", amount: 8000000, months: 14, method: "flat", fee: 0, interest: 4480000, taken: "2024-05-21", sheetStatus: "NOT CLEAR → CLEARED" },
  { ref: "LN-HIST-JUDE-10M-20240614", member: "Jude Tadieus Kyobe", amount: 10000000, months: 6, method: "flat", fee: 0, interest: 2400000, taken: "2024-06-14", sheetStatus: "CLEARED" },
  { ref: "LN-HIST-BRIAN-6M-20240624", member: "Brian Mutiga", amount: 6000000, months: 2, method: "flat", fee: 0, interest: 480000, taken: "2024-06-24", sheetStatus: "CLEARED" },
  { ref: "LN-HIST-JOSHUA-10M-20240628", member: "Joshua Ssewanyana", amount: 10000000, months: 2, method: "flat", fee: 0, interest: 800000, taken: "2024-06-28", sheetStatus: "CLEARED" },
  { ref: "LN-HIST-TABULA-15M-20240702", member: "Tabula Robert", amount: 15000000, months: 2, method: "flat", fee: 0, interest: 1200000, taken: "2024-07-02", sheetStatus: "CLEARED" },
  { ref: "LN-HIST-RITA-15M-20250104", member: "Ritah Nakyanzi", amount: 15000000, months: 1, method: "reducing", fee: 300000, interest: 600000, taken: "2025-01-04", sheetStatus: "CLEARED" },
  { ref: "LN-HIST-MARY-15M-20250104", member: "Mary Babirye", amount: 15000000, months: 5, method: "reducing", fee: 300000, interest: 1800000, taken: "2025-01-04", sheetStatus: "CLEARED" },
  { ref: "LN-HIST-TABULA-15M-20250105", member: "Tabula Robert", amount: 15000000, months: 5, method: "reducing", fee: 300000, interest: 1800000, taken: "2025-01-05", sheetStatus: "CLEARED" },
  { ref: "LN-HIST-JUSTINE-15M-20250110", member: "Justine Kaudha Inhensiko", amount: 15000000, months: 5, method: "reducing", fee: 300000, interest: 1800000, taken: "2025-01-10", sheetStatus: "CLEARED" },
  { ref: "LN-HIST-RALPH-5M-20250508", member: "Ralph Masaba", amount: 5000000, months: 5, method: "reducing", fee: 100000, interest: 600000, taken: "2025-05-08", sheetStatus: "CLEARED" },

  // —— Later sheet rows marked "still running" but actually completed ——
  { ref: "LN-HIST-MARY-15M-20250626", member: "Mary Babirye", amount: 15000000, months: 4, method: "reducing", fee: 300000, interest: 1500000, taken: "2025-06-26", sheetStatus: "still running → CLEARED" },
  { ref: "LN-HIST-RALPH-10M-20250724", member: "Ralph Masaba", amount: 10000000, months: 5, method: "reducing", fee: 200000, interest: 1200000, taken: "2025-07-24", sheetStatus: "still running → CLEARED" },
  { ref: "LN-HIST-JUSTINE-5M-20250821", member: "Justine Kaudha Inhensiko", amount: 5000000, months: 5, method: "reducing", fee: 100000, interest: 600000, taken: "2025-08-21", sheetStatus: "still running → CLEARED" },
  { ref: "LN-HIST-JUDE-7M-20250910", member: "Jude Tadieus Kyobe", amount: 7000000, months: 5, method: "reducing", fee: 140000, interest: 840000, taken: "2025-09-10", sheetStatus: "still running → CLEARED" },
];

async function ensureHistoricalMembers(client) {
  for (const hm of HISTORICAL_MEMBERS) {
    let row = (await client.query(
      `SELECT id, full_name, member_number, status FROM members
       WHERE full_name ILIKE $1 OR member_number=$2 OR full_name ILIKE ANY($3::text[])
       ORDER BY id LIMIT 1`,
      [hm.fullName, hm.memberNumber, hm.aliases]
    )).rows[0];
    if (row) {
      console.log(`  member ok: ${row.full_name} (#${row.id})`);
      continue;
    }
    console.log(`  create historical member: ${hm.fullName} (${hm.status})`);
    if (dryRun) continue;
    row = (await client.query(
      `INSERT INTO members
        (member_number, full_name, email, phone, national_id, occupation, employer, address,
         next_of_kin, savings_balance, share_capital, status, joined_at)
       VALUES ($1,$2,$3,$4,$5,'Former member','—','—','—',0,0,$6,'2023-07-01')
       RETURNING id, full_name, member_number, status`,
      [
        hm.memberNumber,
        hm.fullName,
        `${hm.key}.history@members.kg40.local`,
        "+256700000000",
        `HIST-${hm.key.toUpperCase()}`,
        hm.status,
      ]
    )).rows[0];
    console.log(`    → #${row.id}`);
  }
}

async function findMember(client, name) {
  const alias = MEMBER_ALIASES.find((a) => a.match.test(String(name || "")));
  const target = alias?.name || name;
  // Prefer exact canonical name (includes exited historical members).
  let row = (await client.query(
    `SELECT id, full_name, member_number, status, COALESCE(savings_balance,0)::float AS savings_balance
     FROM members
     WHERE full_name ILIKE $1
     ORDER BY CASE WHEN status='active' THEN 0 WHEN status='exited' THEN 1 ELSE 2 END, id
     LIMIT 1`,
    [target]
  )).rows[0];
  if (row) return row;
  row = (await client.query(
    `SELECT id, full_name, member_number, status, COALESCE(savings_balance,0)::float AS savings_balance
     FROM members
     WHERE member_number IN ('G40-HIST-JOSHUA','G40-HIST-EZRA','G40-HIST-GERALD')
       AND full_name ILIKE $1
     LIMIT 1`,
    [target]
  )).rows[0];
  return row || null;
}

async function ensureProduct(client) {
  let product = (await client.query(
    `SELECT id, name, annual_rate::float AS annual_rate FROM loan_products
     WHERE name='Historical Group Loan 4%' LIMIT 1`
  )).rows[0];
  if (product) return product;
  console.log("  create product: Historical Group Loan 4% (48% p.a. / 4% monthly)");
  if (dryRun) return { id: null, name: "Historical Group Loan 4%", annual_rate: 48 };
  product = (await client.query(
    `INSERT INTO loan_products (name, annual_rate, max_term, max_multiplier)
     VALUES ('Historical Group Loan 4%', 48, 24, 5)
     RETURNING id, name, annual_rate::float AS annual_rate`
  )).rows[0];
  return product;
}

async function actorId(client) {
  const row = (await client.query(
    `SELECT id FROM users WHERE active=true
     ORDER BY CASE WHEN role IN ('Credits Officer','Executive Officer','System Admin','Finance Officer') THEN 0 ELSE 1 END, id
     LIMIT 1`
  )).rows[0];
  return row?.id || null;
}

async function seedLoan(client, productId, userId, loan) {
  const existing = (await client.query(
    `SELECT id, status FROM loans WHERE reference=$1 LIMIT 1`,
    [loan.ref]
  )).rows[0];
  if (existing) {
    console.log(`  SKIP ${loan.ref}: already exists (#${existing.id}, ${existing.status})`);
    return;
  }

  const member = await findMember(client, loan.member);
  if (!member) {
    console.log(`  SKIP ${loan.ref}: member not found (${loan.member})`);
    return;
  }

  const schedule = loan.method === "reducing"
    ? reducingSchedule(loan.amount, loan.months, loan.taken)
    : flatSchedule(loan.amount, loan.months, loan.taken, loan.interest);

  // Prefer sheet interest when provided (flat blanks / rounding).
  if (loan.interest != null && loan.method === "flat") {
    const rebuilt = flatSchedule(loan.amount, loan.months, loan.taken, loan.interest);
    schedule.rows = rebuilt.rows;
    schedule.interestTotal = rebuilt.interestTotal;
  }
  if (loan.interest != null && loan.method === "reducing" && Math.abs(schedule.interestTotal - loan.interest) > 1) {
    console.log(`    WARN ${loan.ref}: reducing interest computed ${schedule.interestTotal} vs sheet ${loan.interest}`);
  }

  const fee = round(loan.fee || 0);
  const dueDate = addMonths(loan.taken, loan.months);
  const completedAt = isoTs(dueDate, 16);
  const disbursedAt = isoTs(loan.taken, 10);
  const appliedAt = isoTs(addMonths(loan.taken, -0), 9);
  const purpose = `Historical spreadsheet loan (${loan.method} 4%) — ${loan.sheetStatus}`;
  const totalRepaid = round(loan.amount + schedule.interestTotal);

  console.log(
    `  ${loan.ref} → ${member.full_name}: ${loan.amount.toLocaleString()} / ${loan.months}mo ` +
    `${loan.method} interest ${schedule.interestTotal.toLocaleString()} fee ${fee.toLocaleString()} [${loan.sheetStatus}]`
  );
  if (dryRun) return;

  const inserted = (await client.query(
    `INSERT INTO loans (
      reference, member_id, product_id, amount, balance, term_months, purpose, status,
      savings_at_application, existing_loan_balance, eligibility_result, verified_amount,
      authorized_by, authorized_at, disbursed_at, due_date,
      security_type, collateral_description, collateral_value, collateral_owner,
      collateral_owner_consent, borrower_declaration_accepted,
      processing_fee, policy_reference, custom_product_name, created_at
    ) VALUES (
      $1,$2,$3,$4,0,$5,$6,'completed',
      $7,0,$8,$4,
      $9,$10::timestamptz,$10::timestamptz,$11::date,
      'savings_security','Historical cleared facility (spreadsheet import)',$4,$12,
      true,true,
      $13,'AGM-HISTORICAL-LOAN-REGISTER','Historical 4% group loan',$14::timestamptz
    ) RETURNING id`,
    [
      loan.ref,
      member.id,
      productId,
      loan.amount,
      loan.months,
      purpose,
      member.savings_balance || 0,
      `Eligible — historical cleared loan imported from spreadsheet (${MARKER})`,
      userId,
      disbursedAt,
      dueDate,
      member.full_name,
      fee,
      appliedAt,
    ]
  )).rows[0];

  await client.query(
    `INSERT INTO loan_disbursements
      (loan_id,amount,method,destination,status,prepared_by,authorized_by,disbursed_by,
       transaction_reference,prepared_at,authorized_at,disbursed_at)
     VALUES ($1,$2,'Bank transfer','Historical Centenary disbursement','disbursed',$3,$3,$3,$4,$5::timestamptz,$5::timestamptz,$5::timestamptz)`,
    [inserted.id, loan.amount, userId, `DSB-${loan.ref}`, disbursedAt]
  );

  if (fee > 0) {
    await client.query(
      `INSERT INTO loan_charges (loan_id,charge_type,amount,paid_amount,status,reason,assessed_by,assessed_at)
       VALUES ($1,'Processing fee',$2,$2,'paid',$3,$4,$5::timestamptz)`,
      [inserted.id, fee, "2% processing fee from spreadsheet", userId, disbursedAt]
    );
  }

  await client.query(
    `INSERT INTO loan_workflow_events (loan_id,stage,action,actor_id,comment,created_at)
     VALUES
       ($1,'application','submitted',$2,$3,$4::timestamptz),
       ($1,'committee-review','approved',$2,'Historical clearance recorded from loan spreadsheet',$4::timestamptz),
       ($1,'executive-authorization','authorized',$2,'Authorized for historical register',$4::timestamptz),
       ($1,'disbursement','disbursed',$2,$5,$6::timestamptz),
       ($1,'repayment','completed',$2,$7,$8::timestamptz)`,
    [
      inserted.id,
      userId,
      `${MARKER} | Spreadsheet status: ${loan.sheetStatus}`,
      appliedAt,
      `Disbursed UGX ${loan.amount.toLocaleString()}`,
      disbursedAt,
      `Fully repaid UGX ${totalRepaid.toLocaleString()} (principal + interest). Balance cleared.`,
      completedAt,
    ]
  );

  for (const row of schedule.rows) {
    await client.query(
      `INSERT INTO loan_repayment_schedule
        (loan_id,installment_number,due_date,opening_balance,principal,interest,total_due,
         paid_amount,principal_paid,interest_paid,status,paid_at)
       VALUES ($1,$2,$3::date,$4,$5,$6,$7,$7,$5,$6,'paid',$8::timestamptz)`,
      [
        inserted.id,
        row.installment,
        row.dueDate,
        row.opening,
        row.principal,
        row.interest,
        row.total,
        isoTs(row.dueDate, 14),
      ]
    );

    await client.query(
      `INSERT INTO transactions
        (reference,member_id,type,method,amount,status,notes,recorded_by,verified_by,verified_at,created_at,loan_id,receipt_number)
       VALUES ($1,$2,'Loan repayment','Bank transfer',$3,'completed',$4,$5,$5,$6::timestamptz,$6::timestamptz,$7,$8)`,
      [
        `REP-${loan.ref}-${String(row.installment).padStart(2, "0")}`,
        member.id,
        row.total,
        `${MARKER} Installment ${row.installment}/${loan.months} | ${loan.method} 4%`,
        userId,
        isoTs(row.dueDate, 14),
        inserted.id,
        `RCPT-${loan.ref}-${String(row.installment).padStart(2, "0")}`,
      ]
    );
  }
}

async function main() {
  console.log(`Kasangati G40 historical loan spreadsheet import${dryRun ? " (dry-run)" : ""}`);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    console.log("\n== Historical / exited members ==");
    await ensureHistoricalMembers(client);
    console.log("\n== Product ==");
    const product = await ensureProduct(client);
    const userId = await actorId(client);
    if (!userId && !dryRun) throw new Error("No active user to attribute historical loans");
    console.log(`  actor user #${userId || "dry-run"}`);

    console.log("\n== Completed history loans ==");
    for (const loan of LOANS) {
      await seedLoan(client, product.id, userId, loan);
    }

    if (dryRun) {
      await client.query("ROLLBACK");
      console.log("\nDry-run complete (rolled back).");
    } else {
      await client.query("COMMIT");
      const counts = (await client.query(
        `SELECT status, COUNT(*)::int AS n FROM loans
         WHERE reference LIKE 'LN-HIST-%' GROUP BY status ORDER BY status`
      )).rows;
      console.log("\nDone. Historical loan counts:", counts);
    }
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
