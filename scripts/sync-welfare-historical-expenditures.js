#!/usr/bin/env node
"use strict";
/**
 * Record historical welfare expenditures (death burials + weddings), deduct the
 * UGX 7,000,000 from the welfare fund and from each standing member's welfare
 * balance (equal share). Vicent is not charged. Joshua Ssewanyana stays history-only
 * (exited + soft-deleted) so the active roll remains 18 members.
 *
 * Usage:
 *   node scripts/sync-welfare-historical-expenditures.js
 *   node scripts/sync-welfare-historical-expenditures.js --dry-run
 */
const { Pool } = require("pg");
const path = require("path");
const { requireDatabaseUrl } = require("./lib/load-database-url");

const projectRoot = path.resolve(__dirname, "..");
requireDatabaseUrl(projectRoot);

const dryRun = process.argv.includes("--dry-run");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
  ssl:
    /railway|proxy|rlwy/i.test(process.env.DATABASE_URL) &&
    !/127\.0\.0\.1|localhost/.test(process.env.DATABASE_URL)
      ? { rejectUnauthorized: false }
      : undefined,
});

const MARKER = "sync-welfare-historical-expenditures";
const AMOUNT = 1000000;
const STANDARD_STANDING = 650000;
const STANDARD_SINCE = "2024-06-01";
const PAYOUT_TOTAL = 7000000;

const PAYOUTS = [
  {
    key: "burial-jude-20260228",
    type: "Funeral assistance",
    date: "2026-02-28",
    amount: AMOUNT,
    match: (name) => /jude/i.test(name) && /kyobe|tadieus/i.test(name),
    label: "Jude Tadieus Kyobe",
    description: "Death burial welfare support — historical payout UGX 1,000,000 on 28/02/2026.",
  },
  {
    key: "burial-justin-20260228",
    type: "Funeral assistance",
    date: "2026-02-28",
    amount: AMOUNT,
    match: (name) => /justin|justine/i.test(name) && /kaudha|inhensiko/i.test(name),
    label: "Justine Kaudha Inhensiko",
    description: "Death burial welfare support — historical payout UGX 1,000,000 on 28/02/2026.",
  },
  {
    key: "burial-josephine-20260228",
    type: "Funeral assistance",
    date: "2026-02-28",
    amount: AMOUNT,
    match: (name) => /josephine/i.test(name) && /babirye|kyobe/i.test(name),
    label: "Josephine Babirye Kyobe",
    description: "Death burial welfare support — historical payout UGX 1,000,000 on 28/02/2026.",
  },
  {
    key: "burial-muhoozi-20260202",
    type: "Funeral assistance",
    date: "2026-02-02",
    amount: AMOUNT,
    match: (name) => /muhoozi/i.test(name),
    label: "Christopher Muhoozi",
    description: "Death burial welfare support — historical payout UGX 1,000,000 on 02/02/2026.",
  },
  {
    key: "burial-dan-20260202",
    type: "Funeral assistance",
    date: "2026-02-02",
    amount: AMOUNT,
    match: (name) => /dan/i.test(name) && /rwebingira|ssalongo/i.test(name),
    label: "Dan Rwebingira Ssalongo",
    description: "Death burial welfare support — historical payout UGX 1,000,000 on 02/02/2026.",
  },
  {
    key: "wedding-dan-son-20250910",
    type: "Marriage assistance",
    date: "2025-09-10",
    amount: AMOUNT,
    match: (name) => /dan/i.test(name) && /rwebingira|ssalongo/i.test(name),
    label: "Dan Rwebingira Ssalongo",
    description: "Wedding welfare support for Dan's son — historical payout UGX 1,000,000 on 10/09/2025.",
  },
  {
    key: "wedding-joshua-20250905",
    type: "Marriage assistance",
    date: "2025-09-05",
    amount: AMOUNT,
    match: null,
    exited: true,
    label: "Joshua Ssewanyana",
    description:
      "Wedding welfare support — historical payout UGX 1,000,000 on 05/09/2025. Former member; kept in welfare history only.",
  },
];

function isExcluded(name) {
  return /oketcho/i.test(name || "") || (/baraza/i.test(name || "") && /nakayiza|olivia/i.test(name || ""));
}
function isVicent(name) {
  return /vicent|vincent/i.test(name || "") && /gumisiriza/i.test(name || "");
}

function standingAfterDeduction(memberCount) {
  const totalAfter = STANDARD_STANDING * memberCount - PAYOUT_TOTAL;
  const base = Math.floor(totalAfter / memberCount);
  const rem = totalAfter - base * memberCount;
  return { totalAfter, base, rem };
}

async function ensureJoshuaHistoryOnly(client) {
  const existing = (
    await client.query(
      `SELECT id, full_name, member_number, status, deleted_at
       FROM members
       WHERE full_name ILIKE '%joshua%' AND (full_name ILIKE '%ssewanyana%' OR full_name ILIKE '%sewanyana%')
          OR member_number='G40-HIST-JOSHUA'
       ORDER BY id LIMIT 1`
    )
  ).rows[0];

  if (existing) {
    if (!dryRun) {
      await client.query(
        `UPDATE members SET status='exited', deleted_at=COALESCE(deleted_at, NOW()),
           provisional=true
         WHERE id=$1`,
        [existing.id]
      );
    }
    console.log(`  Joshua: history-only ${existing.member_number} (hidden from member roll)`);
    return existing;
  }

  if (dryRun) {
    console.log("  Joshua: would create history-only G40-HIST-JOSHUA");
    return { id: null, full_name: "Joshua Ssewanyana", member_number: "G40-HIST-JOSHUA" };
  }

  const branchId =
    (await client.query(`SELECT id FROM branches WHERE active=true ORDER BY id LIMIT 1`)).rows[0]?.id || 1;
  const row = (
    await client.query(
      `INSERT INTO members
        (member_number, full_name, phone, national_id, savings_balance, share_capital, dividends, fines,
         status, joined_at, provisional, branch_id, deleted_at)
       VALUES ('G40-HIST-JOSHUA','Joshua Ssewanyana','0700000000','HIST-JOSHUA-EXITED',0,0,0,0,
         'exited','2024-06-01',true,$1,NOW())
       RETURNING id, full_name, member_number, status`,
      [branchId]
    )
  ).rows[0];
  console.log(`  Joshua: created history-only ${row.member_number}`);
  return row;
}

async function upsertPayout(client, actorId, payout, member) {
  const reqRef = `WREQ-${payout.key}`.toUpperCase();
  const payRef = `WPAY-${payout.key}`.toUpperCase();
  const existing = (
    await client.query(`SELECT id FROM welfare_requests WHERE reference=$1`, [reqRef])
  ).rows[0];

  if (dryRun) {
    console.log(
      `  ${existing ? "KEEP" : "ADD"} ${payout.type} · ${member.full_name || payout.label} · ${payout.date} · UGX ${payout.amount.toLocaleString()}`
    );
    return { amount: payout.amount };
  }

  let requestId = existing?.id;
  if (!requestId) {
    const inserted = (
      await client.query(
        `INSERT INTO welfare_requests
          (reference, member_id, request_type, description, amount, status, urgency, supporting_document,
           documents_verified, previous_support, officer_recommendation, payment_status, submitted_by, reviewed_by,
           reviewed_at, closed_at, created_at)
         VALUES ($1,$2,$3,$4,$5,'closed','medium',$6,true,0,$7,'paid',$8,$8,$9::timestamptz,$9::timestamptz,$9::timestamptz)
         RETURNING id`,
        [
          reqRef,
          member.id,
          payout.type,
          payout.description,
          payout.amount,
          MARKER,
          `Historical ${MARKER}`,
          actorId,
          `${payout.date} 12:00:00+03`,
        ]
      )
    ).rows[0];
    requestId = inserted.id;
  } else {
    await client.query(
      `UPDATE welfare_requests SET
         request_type=$2, description=$3, amount=$4, status='closed', payment_status='paid',
         supporting_document=$5, reviewed_by=$6, reviewed_at=$7::timestamptz, closed_at=$7::timestamptz
       WHERE id=$1`,
      [requestId, payout.type, payout.description, payout.amount, MARKER, actorId, `${payout.date} 12:00:00+03`]
    );
  }

  const payExisting = (
    await client.query(`SELECT id FROM welfare_payments WHERE reference=$1`, [payRef])
  ).rows[0];
  if (!payExisting) {
    await client.query(
      `INSERT INTO welfare_payments
        (reference, request_id, beneficiary_name, amount, payment_method, voucher_number, receipt_number,
         status, approved_at, paid_at, recorded_by)
       VALUES ($1,$2,$3,$4,'Bank transfer',$5,$6,'paid',$7::timestamptz,$7::timestamptz,$8)`,
      [
        payRef,
        requestId,
        member.full_name || payout.label,
        payout.amount,
        `HIST-${payout.key}`.toUpperCase(),
        `RCPT-${payout.key}`.toUpperCase(),
        `${payout.date} 12:00:00+03`,
        actorId,
      ]
    );
  } else {
    await client.query(
      `UPDATE welfare_payments SET
         request_id=$2, beneficiary_name=$3, amount=$4, status='paid',
         approved_at=$5::timestamptz, paid_at=$5::timestamptz, recorded_by=$6
       WHERE id=$1`,
      [payExisting.id, requestId, member.full_name || payout.label, payout.amount, `${payout.date} 12:00:00+03`, actorId]
    );
  }

  console.log(
    `  OK ${payout.type} · ${member.full_name || payout.label} · ${payout.date} · UGX ${payout.amount.toLocaleString()}`
  );
  return { amount: payout.amount };
}

async function deductMemberStanding(client, actorId) {
  const members = (
    await client.query(
      `SELECT id, full_name, member_number FROM members
       WHERE deleted_at IS NULL AND status='active' ORDER BY full_name, id`
    )
  ).rows.filter((m) => !isExcluded(m.full_name) && !isVicent(m.full_name));

  const { totalAfter, base, rem } = standingAfterDeduction(members.length);
  let i = 0;
  for (const member of members) {
    const amount = i < rem ? base + 1 : base;
    i += 1;
    const ref = `WEL-STANDING-${member.member_number}`;
    console.log(
      `  ${member.full_name}: welfare standing UGX ${STANDARD_STANDING.toLocaleString()} → UGX ${amount.toLocaleString()}`
    );
    if (dryRun) continue;
    await client.query(
      `DELETE FROM welfare_contributions
       WHERE member_id=$1 AND (reference=$2 OR reference LIKE 'WEL-STANDING-%')`,
      [member.id, ref]
    );
    await client.query(
      `INSERT INTO welfare_contributions
        (reference, member_id, contribution_type, period, expected_amount, amount, payment_method,
         receipt_number, status, contribution_date, recorded_by, verified_by, verified_at, verification_comment)
       VALUES ($1,$2,'Welfare standing since June 2024','2024-06',$3,$3,'Member standing balance',$4,'verified',$5::date,$6,$6,NOW(),$7)`,
      [
        ref,
        member.id,
        amount,
        `sync-welfare-member-balances-${member.member_number}`,
        STANDARD_SINCE,
        actorId,
        `Standing after UGX ${PAYOUT_TOTAL.toLocaleString()} historical welfare expenditures (equal share).`,
      ]
    );
  }

  if (!dryRun) {
    await client.query(
      `INSERT INTO settings (key, value) VALUES ('welfareStandingStandardTotal', $1)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [String(totalAfter)]
    );
    await client.query(
      `INSERT INTO settings (key, value) VALUES ('welfareStandingMemberCount', $1)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [String(members.length)]
    );
    await client.query(
      `INSERT INTO settings (key, value) VALUES ('welfareStandingAfterHistorical', $1)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [String(base)]
    );
  }

  console.log(
    `  ${members.length} members now hold UGX ${totalAfter.toLocaleString()} combined standing (Vicent unchanged)`
  );
  return { count: members.length, totalAfter, base };
}

async function deductFundBalance(client) {
  const current = Number(
    (await client.query(`SELECT value FROM settings WHERE key='welfareFundBalance'`)).rows[0]?.value || 0
  );
  const already = Number(
    (await client.query(`SELECT value FROM settings WHERE key='welfareHistoricalFundDeducted'`)).rows[0]?.value || 0
  );
  let before = Number(
    (await client.query(`SELECT value FROM settings WHERE key='welfareFundBalanceBeforeHistorical'`)).rows[0]?.value || 0
  );
  if (!before) before = current + already;
  const next = Math.max(0, before - PAYOUT_TOTAL);
  console.log(
    `  Fund setting UGX ${before.toLocaleString()} − UGX ${PAYOUT_TOTAL.toLocaleString()} → UGX ${next.toLocaleString()}`
  );
  if (dryRun) return { before, next };
  await client.query(
    `INSERT INTO settings (key, value) VALUES ('welfareFundBalanceBeforeHistorical', $1)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
    [String(before)]
  );
  await client.query(
    `INSERT INTO settings (key, value) VALUES ('welfareHistoricalFundDeducted', $1)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
    [String(PAYOUT_TOTAL)]
  );
  await client.query(
    `INSERT INTO settings (key, value) VALUES ('welfareFundBalance', $1)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
    [String(next)]
  );
  await client.query(
    `INSERT INTO settings (key, value) VALUES ('welfareHistoricalAssistancePaid', $1)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
    [String(PAYOUT_TOTAL)]
  );
  return { before, next };
}

async function main() {
  console.log(dryRun ? "DRY RUN\n" : "Recording historical welfare expenditures + deductions\n");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const actor =
      (
        await client.query(
          `SELECT id FROM users WHERE email ILIKE 'nakayiza.baraza.olivia@gmail.com' AND active=true LIMIT 1`
        )
      ).rows[0]?.id ||
      (await client.query(`SELECT id FROM users WHERE active=true ORDER BY id LIMIT 1`)).rows[0]?.id;
    if (!actor) throw new Error("No active user to record history");

    console.log("== Joshua (history only, not on member roll) ==");
    const joshua = await ensureJoshuaHistoryOnly(client);

    const members = (
      await client.query(
        `SELECT id, full_name, member_number, status FROM members WHERE deleted_at IS NULL ORDER BY full_name`
      )
    ).rows;

    console.log("\n== Historical payouts ==");
    let payoutTotal = 0;
    for (const payout of PAYOUTS) {
      let member;
      if (payout.exited) {
        member = joshua;
        if (!member?.id && !dryRun) throw new Error("Joshua history member missing");
      } else {
        member = members.find((row) => payout.match(row.full_name));
        if (!member) throw new Error(`Member not found for ${payout.label}`);
      }
      const result = await upsertPayout(client, actor, payout, member);
      payoutTotal += result.amount;
    }

    console.log("\n== Deduct UGX 7,000,000 from member welfare standing ==");
    const standing = await deductMemberStanding(client, actor);

    console.log("\n== Deduct UGX 7,000,000 from welfare fund balance ==");
    const fund = await deductFundBalance(client);

    // Keep Dan monthly welfare share if missing.
    if (!dryRun) {
      const dan = members.find((m) => /dan/i.test(m.full_name) && /rwebingira|ssalongo/i.test(m.full_name));
      const danWelfare = (await client.query(`SELECT id FROM welfare_contributions WHERE reference='WEL-SEP01-DAN-25K'`)).rows[0];
      const danReceipt = (await client.query(`SELECT id FROM organization_finance_entries WHERE reference='FIN-SEP01-DAN-425K'`)).rows[0];
      if (dan && !danWelfare && danReceipt) {
        await client.query(
          `INSERT INTO welfare_contributions
            (reference, member_id, contribution_type, period, expected_amount, amount, payment_method,
             receipt_number, status, contribution_date, recorded_by, verified_by, verified_at)
           VALUES ('WEL-SEP01-DAN-25K',$1,'Monthly Welfare Contribution','2026-08',25000,25000,'Bank transfer',
             '394886009-WEL','verified','2026-08-31',$2,$2,NOW())`,
          [dan.id, actor]
        );
        console.log("  Restored Dan monthly welfare share UGX 25,000");
      }
    }

    const activeCount = (
      await client.query(
        `SELECT COUNT(*)::int AS n FROM members WHERE deleted_at IS NULL AND status='active'`
      )
    ).rows[0].n;

    await client.query(dryRun ? "ROLLBACK" : "COMMIT");

    console.log("\n== Summary ==");
    console.log(`  Historical payouts: UGX ${payoutTotal.toLocaleString()}`);
    console.log(`  Welfare fund: UGX ${fund.before.toLocaleString()} → UGX ${fund.next.toLocaleString()}`);
    console.log(
      `  Standing members: ${standing.count} × ~UGX ${standing.base.toLocaleString()} = UGX ${standing.totalAfter.toLocaleString()}`
    );
    console.log(`  Active members on roll: ${activeCount} (Joshua history-only)`);
    console.log(dryRun ? "\nDry run complete (rolled back)." : "\nDone.");
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
