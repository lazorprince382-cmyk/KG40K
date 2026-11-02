"use strict";
const { query } = require("./db");

function isHostingFeeCategory(category = "") {
  return /hosting\s*fee/i.test(String(category || "").trim());
}

async function hostingFeeExpected(runner) {
  const exec = runner?.query
    ? (sql, params) => runner.query(sql, params)
    : (sql, params) => query(sql, params).then((r) => ({ rows: r.rows }));
  const row = (await exec(`SELECT value FROM settings WHERE key='hostingFeeAmount'`)).rows[0];
  const amount = Number(row?.value || 50000);
  return Number.isFinite(amount) && amount > 0 ? amount : 50000;
}

function statusForPaid(paid, expected, reminderActive, isHost) {
  if (isHost) return "host";
  if (!reminderActive) return Number(paid) > 0.5 ? "paid" : "not_due";
  if (Number(paid) >= Number(expected) - 0.5) return "paid";
  if (Number(paid) > 0.5) return "partial";
  return "unpaid";
}

function mapCycle(row) {
  if (!row) return null;
  return {
    id: row.id,
    meetingId: row.meetingId ?? row.meeting_id,
    meetingTitle: row.meetingTitle ?? row.meeting_title,
    meetingDate: row.meetingDate ?? row.meeting_date,
    expected: Number(row.expectedAmount ?? row.expected_amount ?? 50000),
    hostMemberId: row.hostMemberId ?? row.host_member_id ?? null,
    status: row.status,
  };
}

async function loadOpenHostingCycle(runner) {
  const exec = runner?.query
    ? (sql, params) => runner.query(sql, params)
    : (sql, params) => query(sql, params).then((r) => ({ rows: r.rows }));
  try {
    const open = (await exec(
      `SELECT id, meeting_id AS "meetingId", meeting_title AS "meetingTitle",
         meeting_date AS "meetingDate", expected_amount::float AS "expectedAmount",
         host_member_id AS "hostMemberId", status
       FROM hosting_fee_cycles WHERE status='open' ORDER BY meeting_date DESC, id DESC LIMIT 1`
    )).rows[0];
    if (open) return mapCycle(open);
    const last = (await exec(
      `SELECT id, meeting_id AS "meetingId", meeting_title AS "meetingTitle",
         meeting_date AS "meetingDate", expected_amount::float AS "expectedAmount",
         host_member_id AS "hostMemberId", status
       FROM hosting_fee_cycles ORDER BY meeting_date DESC, id DESC LIMIT 1`
    )).rows[0];
    return last ? { ...mapCycle(last), reminderActive: false } : null;
  } catch (error) {
    if (error.code === "42P01") return null;
    throw error;
  }
}

async function loadHostingFeeStanding() {
  const defaultExpected = await hostingFeeExpected();
  const cycle = await loadOpenHostingCycle();
  const reminderActive = Boolean(cycle && cycle.status === "open");
  const expected = Number(cycle?.expected || defaultExpected);
  const cycleId = cycle?.id || null;
  let members = [];
  try {
    members = (
      await query(
        `SELECT m.id, m.full_name AS name, m.member_number AS "memberNumber",
           COALESCE((SELECT SUM(p.amount) FROM hosting_fee_payments p
             WHERE p.member_id=m.id AND p.status='completed'
               AND ($1::bigint IS NULL OR p.cycle_id=$1)),0)::float AS paid,
           (SELECT MAX(p.paid_on) FROM hosting_fee_payments p
             WHERE p.member_id=m.id AND p.status='completed'
               AND ($1::bigint IS NULL OR p.cycle_id=$1)) AS "lastPaidOn",
           (SELECT p.receipt_number FROM hosting_fee_payments p
             WHERE p.member_id=m.id AND p.status='completed'
               AND ($1::bigint IS NULL OR p.cycle_id=$1)
             ORDER BY p.paid_on DESC, p.id DESC LIMIT 1) AS "receiptNumber"
         FROM members m
         WHERE m.deleted_at IS NULL AND m.status='active'
         ORDER BY m.full_name`,
        [cycleId]
      )
    ).rows;
  } catch (error) {
    if (error.code !== "42P01") throw error;
  }
  const hostId = Number(cycle?.hostMemberId || 0);
  const list = members.map((m) => {
    const paid = Number(m.paid || 0);
    const isHost = hostId && Number(m.id) === hostId;
    return {
      id: m.id,
      name: m.name,
      memberNumber: m.memberNumber,
      paid,
      expected: isHost ? 0 : expected,
      due: reminderActive && !isHost ? Math.max(0, expected - paid) : 0,
      lastPaidOn: m.lastPaidOn,
      receiptNumber: m.receiptNumber,
      isHost,
      status: statusForPaid(paid, expected, reminderActive, isHost),
    };
  });
  const collected = list.reduce((sum, row) => sum + row.paid, 0);
  const unpaid = list.filter((row) => row.status === "unpaid");
  return {
    expected,
    collected,
    reminderActive,
    cycle,
    meetingLabel: cycle
      ? `${cycle.meetingTitle || "Meeting"} · ${cycle.meetingDate ? new Date(cycle.meetingDate).toLocaleDateString("en-GB") : ""}`
      : "No upcoming meeting",
    paidCount: list.filter((row) => row.status === "paid").length,
    unpaidCount: unpaid.length,
    partialCount: list.filter((row) => row.status === "partial").length,
    members: list,
    paidMembers: list.filter((row) => row.status === "paid" || row.status === "partial"),
    unpaidMembers: unpaid,
  };
}

async function loadMemberHostingFee(memberId) {
  const standing = await loadHostingFeeStanding();
  const row = standing.members.find((m) => Number(m.id) === Number(memberId));
  let payments = [];
  try {
    payments = (
      await query(
        `SELECT p.id, p.amount::float, p.paid_on AS "paidOn", p.receipt_number AS "receiptNumber",
           p.reference, p.status, t.method, p.cycle_id AS "cycleId"
         FROM hosting_fee_payments p
         LEFT JOIN transactions t ON t.id=p.transaction_id
         WHERE p.member_id=$1 AND p.status='completed'
         ORDER BY p.paid_on DESC, p.id DESC`,
        [memberId]
      )
    ).rows;
  } catch (error) {
    if (error.code !== "42P01") throw error;
  }
  return {
    expected: standing.expected,
    paid: Number(row?.paid || 0),
    due: Number(row?.due || 0),
    status: row?.status || (standing.reminderActive ? "unpaid" : "not_due"),
    isHost: Boolean(row?.isHost),
    reminderActive: Boolean(standing.reminderActive && row?.status === "unpaid"),
    cycle: standing.cycle,
    meetingLabel: standing.meetingLabel,
    lastPaidOn: row?.lastPaidOn || null,
    payments,
  };
}

async function paymentCycleId(client) {
  const cycle = await loadOpenHostingCycle(client);
  return cycle?.id || null;
}

async function startHostingCycleForMeeting(client, {
  meetingId, title, meetingDate, expectedAmount, createdBy, notify = true,
  hostMemberId = null, open = true,
} = {}) {
  const expected = Number(expectedAmount) > 0 ? Number(expectedAmount) : await hostingFeeExpected(client);
  const date = meetingDate instanceof Date
    ? meetingDate.toLocaleDateString("en-CA", { timeZone: "Africa/Kampala" })
    : String(meetingDate).slice(0, 10);
  const hostId = Number(hostMemberId) > 0 ? Number(hostMemberId) : null;
  if (open) {
    await client.query(
      `UPDATE hosting_fee_cycles SET status='closed', closed_at=NOW() WHERE status='open'`
    );
  }
  const cycle = (await client.query(
    `INSERT INTO hosting_fee_cycles
      (meeting_id, meeting_title, meeting_date, expected_amount, status, created_by, host_member_id, closed_at)
     VALUES ($1,$2,$3::date,$4,$5,$6,$7,$8)
     RETURNING id, meeting_title AS "meetingTitle", meeting_date AS "meetingDate", expected_amount::float AS "expectedAmount"`,
    [meetingId || null, String(title || "Organization meeting").trim(), date, expected,
      open ? "open" : "closed", createdBy || null, hostId, open ? null : new Date()]
  )).rows[0];
  if (notify && open) {
    const when = new Date(`${date}T12:00:00+03:00`).toLocaleDateString("en-GB", {
      day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Kampala",
    });
    const message = `A meeting is scheduled for ${when}${title ? ` (${String(title).trim()})` : ""}. Pay the hosting fee of UGX ${Number(expected).toLocaleString()} for this meeting. The member hosting the sitting does not pay.`;
    await client.query(
      `INSERT INTO notifications (member_id, title, message)
       SELECT id, 'Pay hosting fee for the upcoming meeting', $1
       FROM members WHERE deleted_at IS NULL AND status='active'
         AND ($2::bigint IS NULL OR id<>$2)`,
      [message, hostId]
    );
  }
  return cycle;
}

const BANUMBA_MEETING_KEY = "banumbaOctober30Meeting2026";
const OCT30_AGENDA = `1. Opening Prayer
2. Confirmation of the quorum
3. Communication from the Chairperson
4. Reading and adoption of previous minutes.
5. Matters arising from previous minutes
6. Reports from departments:
   • Legal department
   • Credit department
7. Kanzu Contract.
8. Introduction of the new Kwagalana system
9. AOB
10. Closure`;

async function refundHostHostingFee(client, memberId, maxAmount = 50000) {
  const payments = (
    await client.query(
      `SELECT p.id, p.amount::float, p.transaction_id, p.finance_entry_id,
         t.method, t.type, t.notes
       FROM hosting_fee_payments p
       LEFT JOIN transactions t ON t.id=p.transaction_id
       WHERE p.member_id=$1 AND p.status='completed'
       ORDER BY p.id`,
      [memberId]
    )
  ).rows;
  const extraTx = (
    await client.query(
      `SELECT t.id AS transaction_id, t.amount::float, t.finance_entry_id, t.method, t.type, t.notes, NULL::bigint AS id
       FROM transactions t
       WHERE t.member_id=$1 AND t.status IN ('completed','verified','approved')
         AND t.type='Hosting fee'
         AND (t.method ILIKE '%savings%' OR t.notes ILIKE '%savings%')
         AND NOT EXISTS (
           SELECT 1 FROM hosting_fee_payments p WHERE p.transaction_id=t.id AND p.status='completed'
         )
       ORDER BY t.id`,
      [memberId]
    )
  ).rows;
  let restored = 0;
  for (const row of [...payments, ...extraTx]) {
    if (restored >= maxAmount - 0.5) break;
    const amount = Math.min(Number(row.amount || 0), maxAmount - restored);
    if (amount < 0.5) continue;
    if (row.id) {
      await client.query(
        `UPDATE hosting_fee_payments SET status='voided',
           notes=TRIM(BOTH FROM COALESCE(notes,'')||' | Returned: host does not pay hosting fee')
         WHERE id=$1`,
        [row.id]
      );
    }
    await client.query(`UPDATE members SET savings_balance=savings_balance+$1 WHERE id=$2`, [amount, memberId]);
    if (row.transaction_id) {
      await client.query(
        `UPDATE transactions SET status='voided',
           notes=TRIM(BOTH FROM COALESCE(notes,'')||' | Returned to savings: host does not pay hosting fee')
         WHERE id=$1 AND status<>'voided'`,
        [row.transaction_id]
      );
    }
    if (row.finance_entry_id) {
      const entry = (
        await client.query(
          `SELECT id, amount::float, finance_account_id, status FROM organization_finance_entries WHERE id=$1`,
          [row.finance_entry_id]
        )
      ).rows[0];
      if (entry && !/void/i.test(String(entry.status || ""))) {
        await client.query(
          `UPDATE organization_finance_entries SET status='voided',
             description=TRIM(BOTH FROM COALESCE(description,'')||' | Voided: host does not pay hosting fee')
           WHERE id=$1`,
          [entry.id]
        );
        if (entry.finance_account_id) {
          await client.query(
            `UPDATE finance_accounts SET balance=GREATEST(0,balance-$1), updated_at=NOW() WHERE id=$2`,
            [Number(entry.amount || amount), entry.finance_account_id]
          );
          const bank = (
            await client.query(`SELECT account_code FROM finance_accounts WHERE id=$1`, [entry.finance_account_id])
          ).rows[0];
          if (bank?.account_code === "GL-4104") {
            await client.query(
              `INSERT INTO settings (key,value) VALUES ('organizationBankBalance',
                 (SELECT ROUND(balance)::text FROM finance_accounts WHERE id=$1))
               ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`,
              [entry.finance_account_id]
            );
          }
        }
      }
    }
    restored += amount;
  }
  return restored;
}

async function recordBanumbaOctober30Meeting(client) {
  await client.query(
    `UPDATE organization_meetings
       SET scheduled_at=TIMESTAMPTZ '2026-10-30 21:00:00+03',
           ended_at=TIMESTAMPTZ '2026-10-31 00:00:00+03'
     WHERE reference='MTG-20261030-BANUMBA'
        OR (scheduled_at::date=DATE '2026-10-30'
            AND (venue ILIKE '%banumba%' OR title ILIKE '%banumba%' OR title ILIKE '%francis%'))`
  );
  const host = (
    await client.query(
      `SELECT id, full_name FROM members
       WHERE deleted_at IS NULL AND full_name ILIKE '%banumba%' AND full_name ILIKE '%francis%'
       ORDER BY id LIMIT 1 FOR UPDATE`
    )
  ).rows[0];
  let restoredNow = 0;
  if (host) {
    restoredNow = await refundHostHostingFee(client, host.id, 50000);
    if (restoredNow > 0.5) {
      await client.query(
        `INSERT INTO notifications (member_id,title,message) VALUES ($1,$2,$3)`,
        [
          host.id,
          "Hosting fee returned",
          `UGX ${restoredNow.toLocaleString()} hosting fee was returned to your savings. The member who hosts the meeting does not pay hosting fee.`,
        ]
      );
    }
  }
  if ((await client.query("SELECT 1 FROM settings WHERE key=$1", [BANUMBA_MEETING_KEY])).rows[0]) {
    if (!host) return "Banumba Francis not found";
    return restoredNow > 0.5 ? `${host.full_name}: UGX ${restoredNow.toLocaleString()} hosting returned to savings` : null;
  }
  if (!host) {
    await client.query(
      `INSERT INTO settings (key,value) VALUES ($1,'skipped-host-missing') ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`,
      [BANUMBA_MEETING_KEY]
    );
    return "Banumba Francis not found";
  }
  const existing = (
    await client.query(
      `SELECT id FROM organization_meetings
       WHERE scheduled_at::date='2026-10-30'
         AND (title ILIKE '%banumba%' OR venue ILIKE '%banumba%' OR host_member_id=$1)
       ORDER BY id LIMIT 1`,
      [host.id]
    )
  ).rows[0];
  const recorder = (
    await client.query(
      `SELECT id FROM users WHERE active=true
       ORDER BY CASE role WHEN 'Executive Officer' THEN 1 WHEN 'System Admin' THEN 2 ELSE 3 END, id LIMIT 1`
    )
  ).rows[0];
  if (!recorder) {
    await client.query(
      `INSERT INTO settings (key,value) VALUES ($1,'skipped-no-user') ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`,
      [BANUMBA_MEETING_KEY]
    );
    return "No user to record the meeting";
  }
  const executiveDepartment = (await client.query("SELECT id FROM departments WHERE code='executive'")).rows[0];
  let meetingId = existing?.id;
  if (!meetingId) {
    try {
      const inserted = (
        await client.query(
          `INSERT INTO organization_meetings
            (reference,department_id,title,meeting_type,agenda,venue,scheduled_at,ended_at,status,visibility_level,created_by,host_member_id,collect_hosting_fee)
           VALUES ($1,$2,$3,'Member meeting',$4,$5,'2026-10-30 21:00:00+03','2026-10-31 00:00:00+03','held',1,$6,$7,true)
           RETURNING id`,
          [
            `MTG-20261030-BANUMBA`,
            executiveDepartment?.id || null,
            "Members meeting at Banumba Francis's home",
            OCT30_AGENDA,
            "Banumba Francis's place",
            recorder.id,
            host.id,
          ]
        )
      ).rows[0];
      meetingId = inserted.id;
    } catch (error) {
      if (error.code !== "23505") throw error;
      meetingId = (await client.query(
        `SELECT id FROM organization_meetings WHERE reference='MTG-20261030-BANUMBA' LIMIT 1`
      )).rows[0]?.id;
    }
  } else {
    await client.query(
      `UPDATE organization_meetings
         SET title=$2, meeting_type='Member meeting', agenda=$3, venue=$4, status='held',
             visibility_level=1, host_member_id=$5, collect_hosting_fee=true,
             scheduled_at=TIMESTAMPTZ '2026-10-30 21:00:00+03',
             ended_at=TIMESTAMPTZ '2026-10-31 00:00:00+03'
       WHERE id=$1`,
      [meetingId, "Members meeting at Banumba Francis's home", OCT30_AGENDA, "Banumba Francis's place", host.id]
    );
  }
  const cycle = (
    await client.query(
      `SELECT id FROM hosting_fee_cycles WHERE meeting_date='2026-10-30' ORDER BY id DESC LIMIT 1`
    )
  ).rows[0];
  if (cycle) {
    await client.query(
      `UPDATE hosting_fee_cycles
         SET meeting_id=$2, meeting_title=$3, host_member_id=$4, status='closed', closed_at=COALESCE(closed_at,NOW())
       WHERE id=$1`,
      [cycle.id, meetingId, "Members meeting at Banumba Francis's home", host.id]
    );
  } else {
    await startHostingCycleForMeeting(client, {
      meetingId,
      title: "Members meeting at Banumba Francis's home",
      meetingDate: "2026-10-30",
      createdBy: recorder?.id,
      hostMemberId: host.id,
      notify: false,
      open: false,
    });
  }
  await client.query(
    `INSERT INTO settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`,
    [BANUMBA_MEETING_KEY, JSON.stringify({ meetingId, hostId: host.id, restored: restoredNow })]
  );
  return `${host.full_name}: meeting recorded${restoredNow > 0.5 ? `, UGX ${restoredNow.toLocaleString()} hosting returned to savings` : ", no hosting chop to return"}`;
}

module.exports = {
  isHostingFeeCategory,
  hostingFeeExpected,
  loadOpenHostingCycle,
  loadHostingFeeStanding,
  loadMemberHostingFee,
  paymentCycleId,
  startHostingCycleForMeeting,
  recordBanumbaOctober30Meeting,
};
