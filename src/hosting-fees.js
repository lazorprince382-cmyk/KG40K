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

function statusForPaid(paid, expected, reminderActive) {
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
      expected,
      due: reminderActive ? Math.max(0, expected - paid) : 0,
      lastPaidOn: m.lastPaidOn,
      receiptNumber: m.receiptNumber,
      isHost,
      status: statusForPaid(paid, expected, reminderActive),
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
    const message = `A meeting is scheduled for ${when}${title ? ` (${String(title).trim()})` : ""}. Pay the hosting fee of UGX ${Number(expected).toLocaleString()} for this meeting. Every member pays, including the host.`;
    await client.query(
      `INSERT INTO notifications (member_id, title, message)
       SELECT id, 'Pay hosting fee for the upcoming meeting', $1
       FROM members WHERE deleted_at IS NULL AND status='active'`,
      [message]
    );
  }
  return cycle;
}

const BANUMBA_MEETING_KEY = "banumbaOctober30Meeting2026";
const BANUMBA_HOST_PAYS_KEY = "banumbaHostPaysHosting50000-20261106";
const BANUMBA_HOST_AMOUNT = 50000;
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
  if ((await client.query("SELECT 1 FROM settings WHERE key=$1", [BANUMBA_MEETING_KEY])).rows[0]) {
    if (!host) return "Banumba Francis not found";
    return null;
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
    [BANUMBA_MEETING_KEY, JSON.stringify({ meetingId, hostId: host.id })]
  );
  return `${host.full_name}: meeting recorded`;
}

async function restoreCentenaryIfNeeded(client, accountId, amount) {
  if (!accountId || amount < 0.5) return;
  await client.query(
    `UPDATE finance_accounts SET balance=balance+$1, updated_at=NOW() WHERE id=$2`,
    [amount, accountId]
  );
  const bank = (
    await client.query(`SELECT account_code FROM finance_accounts WHERE id=$1`, [accountId])
  ).rows[0];
  if (bank?.account_code === "GL-4104") {
    await client.query(
      `INSERT INTO settings (key,value) VALUES ('organizationBankBalance',
         (SELECT ROUND(balance)::text FROM finance_accounts WHERE id=$1))
       ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`,
      [accountId]
    );
  }
}

async function chargeBanumbaHostingFromSavings(client) {
  if ((await client.query("SELECT 1 FROM settings WHERE key=$1", [BANUMBA_HOST_PAYS_KEY])).rows[0]) return null;
  const host = (
    await client.query(
      `SELECT id, full_name, savings_balance::float AS savings
       FROM members
       WHERE deleted_at IS NULL AND full_name ILIKE '%banumba%' AND full_name ILIKE '%francis%'
       ORDER BY id LIMIT 1 FOR UPDATE`
    )
  ).rows[0];
  if (!host) {
    await client.query(
      `INSERT INTO settings (key,value) VALUES ($1,'skipped-host-missing') ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`,
      [BANUMBA_HOST_PAYS_KEY]
    );
    return "Banumba Francis not found";
  }
  const cycle = (
    await client.query(
      `SELECT id FROM hosting_fee_cycles WHERE meeting_date='2026-10-30' ORDER BY id DESC LIMIT 1`
    )
  ).rows[0];
  const alreadyPaid = Number(
    (
      await client.query(
        `SELECT COALESCE(SUM(amount),0)::float AS paid
         FROM hosting_fee_payments
         WHERE member_id=$1 AND status='completed'
           AND ($2::bigint IS NULL OR cycle_id=$2)`,
        [host.id, cycle?.id || null]
      )
    ).rows[0]?.paid || 0
  );
  if (alreadyPaid >= BANUMBA_HOST_AMOUNT - 0.5) {
    await client.query(
      `INSERT INTO settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`,
      [BANUMBA_HOST_PAYS_KEY, JSON.stringify({ memberId: host.id, alreadyPaid, deducted: 0 })]
    );
    return `${host.full_name}: hosting fee already on record`;
  }
  const recorder = (
    await client.query(
      `SELECT id FROM users WHERE active=true
       ORDER BY CASE role WHEN 'Finance Officer' THEN 1 WHEN 'Executive Officer' THEN 2 WHEN 'System Admin' THEN 3 ELSE 4 END, id LIMIT 1`
    )
  ).rows[0];
  const voided = (
    await client.query(
      `SELECT p.id, p.amount::float, p.transaction_id, p.finance_entry_id, p.cycle_id
       FROM hosting_fee_payments p
       WHERE p.member_id=$1 AND p.status='voided'
         AND (p.notes ILIKE '%host does not pay%' OR p.notes ILIKE '%Returned%')
       ORDER BY p.id DESC`,
      [host.id]
    )
  ).rows;
  let charged = 0;
  let restoredBank = 0;
  for (const row of voided) {
    if (charged >= BANUMBA_HOST_AMOUNT - 0.5) break;
    const amount = Math.min(Number(row.amount || 0), BANUMBA_HOST_AMOUNT - charged);
    if (amount < 0.5) continue;
    await client.query(
      `UPDATE hosting_fee_payments
          SET status='completed',
              cycle_id=COALESCE(cycle_id,$2),
              notes=TRIM(BOTH FROM COALESCE(notes,'')||' | Restored: host also pays hosting fee')
        WHERE id=$1`,
      [row.id, cycle?.id || null]
    );
    if (row.transaction_id) {
      await client.query(
        `UPDATE transactions SET status='completed',
           notes=TRIM(BOTH FROM COALESCE(notes,'')||' | Restored: hosting taken from savings')
         WHERE id=$1`,
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
      if (entry && /void/i.test(String(entry.status || ""))) {
        await client.query(
          `UPDATE organization_finance_entries SET status='completed',
             description=TRIM(BOTH FROM COALESCE(description,'')||' | Restored: host also pays hosting fee')
           WHERE id=$1`,
          [entry.id]
        );
        const bankAmount = Number(entry.amount || amount);
        await restoreCentenaryIfNeeded(client, entry.finance_account_id, bankAmount);
        restoredBank += bankAmount;
      }
    }
    charged += amount;
  }
  if (charged < BANUMBA_HOST_AMOUNT - 0.5) {
    const extraTx = (
      await client.query(
        `SELECT t.id, t.amount::float, t.finance_entry_id
         FROM transactions t
         WHERE t.member_id=$1 AND t.type='Hosting fee' AND t.status='voided'
           AND (t.notes ILIKE '%host does not pay%' OR t.notes ILIKE '%Returned to savings%')
           AND NOT EXISTS (
             SELECT 1 FROM hosting_fee_payments p WHERE p.transaction_id=t.id AND p.status='completed'
           )
         ORDER BY t.id DESC`,
        [host.id]
      )
    ).rows;
    for (const row of extraTx) {
      if (charged >= BANUMBA_HOST_AMOUNT - 0.5) break;
      const amount = Math.min(Number(row.amount || 0), BANUMBA_HOST_AMOUNT - charged);
      if (amount < 0.5) continue;
      await client.query(
        `UPDATE transactions SET status='completed',
           notes=TRIM(BOTH FROM COALESCE(notes,'')||' | Restored: hosting taken from savings')
         WHERE id=$1`,
        [row.id]
      );
      if (row.finance_entry_id) {
        const entry = (
          await client.query(
            `SELECT id, amount::float, finance_account_id, status FROM organization_finance_entries WHERE id=$1`,
            [row.finance_entry_id]
          )
        ).rows[0];
        if (entry && /void/i.test(String(entry.status || ""))) {
          await client.query(
            `UPDATE organization_finance_entries SET status='completed',
               description=TRIM(BOTH FROM COALESCE(description,'')||' | Restored: host also pays hosting fee')
             WHERE id=$1`,
            [entry.id]
          );
          const bankAmount = Number(entry.amount || amount);
          await restoreCentenaryIfNeeded(client, entry.finance_account_id, bankAmount);
          restoredBank += bankAmount;
        }
      }
      await client.query(
        `INSERT INTO hosting_fee_payments
          (member_id,amount,paid_on,status,reference,receipt_number,finance_entry_id,transaction_id,notes,recorded_by,cycle_id)
         VALUES ($1,$2,'2026-10-30','completed',$3,$4,$5,$6,$7,$8,$9)`,
        [
          host.id,
          amount,
          `HOST-BANUMBA-HOSTPAYS-${row.id}`,
          "RCPT-BANUMBA-HOSTPAYS-50K",
          row.finance_entry_id || null,
          row.id,
          "Hosting fee restored from savings. Every member pays, including the host.",
          recorder?.id || null,
          cycle?.id || null,
        ]
      );
      charged += amount;
    }
  }
  if (charged < BANUMBA_HOST_AMOUNT - 0.5) {
    const amount = BANUMBA_HOST_AMOUNT - charged;
    await client.query("SAVEPOINT banumba_host_pays");
    try {
      const tx = (
        await client.query(
          `INSERT INTO transactions
            (reference,member_id,type,method,amount,status,notes,recorded_by,verified_by,verified_at,created_at,receipt_number,submission_source)
           VALUES ($1,$2,'Hosting fee','Savings transfer',$3,'completed',$4,$5,$5,NOW(),TIMESTAMPTZ '2026-10-30 21:00:00+03',$6,'system')
           RETURNING id`,
          [
            "TRX-BANUMBA-HOSTPAYS-50000",
            host.id,
            amount,
            `Hosting fee taken from savings. The host also pays. received=${amount.toFixed(2)}.`,
            recorder?.id || null,
            "RCPT-BANUMBA-HOSTPAYS-50K",
          ]
        )
      ).rows[0];
      await client.query(
        `INSERT INTO hosting_fee_payments
          (member_id,amount,paid_on,status,reference,receipt_number,transaction_id,notes,recorded_by,cycle_id)
         VALUES ($1,$2,'2026-10-30','completed',$3,$4,$5,$6,$7,$8)`,
        [
          host.id,
          amount,
          "HOST-BANUMBA-HOSTPAYS-50000",
          "RCPT-BANUMBA-HOSTPAYS-50K",
          tx.id,
          "Hosting fee taken from savings. Every member pays, including the host.",
          recorder?.id || null,
          cycle?.id || null,
        ]
      );
      charged += amount;
      await client.query("RELEASE SAVEPOINT banumba_host_pays");
    } catch (error) {
      await client.query("ROLLBACK TO SAVEPOINT banumba_host_pays");
      if (error.code !== "23505") throw error;
    }
  }
  await client.query(`UPDATE members SET savings_balance=savings_balance-$1 WHERE id=$2`, [charged, host.id]);
  await client.query(
    `INSERT INTO notifications (member_id,title,message) VALUES ($1,$2,$3)`,
    [
      host.id,
      "Hosting fee taken from savings",
      `UGX ${charged.toLocaleString()} hosting fee was taken from your savings. Every member pays hosting fee, including the host.`,
    ]
  );
  await client.query(
    `INSERT INTO settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`,
    [BANUMBA_HOST_PAYS_KEY, JSON.stringify({ memberId: host.id, charged, restoredBank, cycleId: cycle?.id || null })]
  );
  return `${host.full_name}: UGX ${charged.toLocaleString()} hosting taken from savings`;
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
  chargeBanumbaHostingFromSavings,
};
