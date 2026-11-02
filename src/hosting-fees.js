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
         meeting_date AS "meetingDate", expected_amount::float AS "expectedAmount", status
       FROM hosting_fee_cycles WHERE status='open' ORDER BY meeting_date DESC, id DESC LIMIT 1`
    )).rows[0];
    if (open) return mapCycle(open);
    const last = (await exec(
      `SELECT id, meeting_id AS "meetingId", meeting_title AS "meetingTitle",
         meeting_date AS "meetingDate", expected_amount::float AS "expectedAmount", status
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
  const list = members.map((m) => {
    const paid = Number(m.paid || 0);
    return {
      id: m.id,
      name: m.name,
      memberNumber: m.memberNumber,
      paid,
      expected,
      due: reminderActive ? Math.max(0, expected - paid) : 0,
      lastPaidOn: m.lastPaidOn,
      receiptNumber: m.receiptNumber,
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
    reminderActive: standing.reminderActive,
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
} = {}) {
  const expected = Number(expectedAmount) > 0 ? Number(expectedAmount) : await hostingFeeExpected(client);
  const date = meetingDate instanceof Date
    ? meetingDate.toLocaleDateString("en-CA", { timeZone: "Africa/Kampala" })
    : String(meetingDate).slice(0, 10);
  await client.query(
    `UPDATE hosting_fee_cycles SET status='closed', closed_at=NOW() WHERE status='open'`
  );
  const cycle = (await client.query(
    `INSERT INTO hosting_fee_cycles
      (meeting_id, meeting_title, meeting_date, expected_amount, status, created_by)
     VALUES ($1,$2,$3::date,$4,'open',$5)
     RETURNING id, meeting_title AS "meetingTitle", meeting_date AS "meetingDate", expected_amount::float AS "expectedAmount"`,
    [meetingId || null, String(title || "Organization meeting").trim(), date, expected, createdBy || null]
  )).rows[0];
  if (notify) {
    const when = new Date(`${date}T12:00:00+03:00`).toLocaleDateString("en-GB", {
      day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Kampala",
    });
    const message = `A meeting is scheduled for ${when}${title ? ` (${String(title).trim()})` : ""}. Pay the hosting fee of UGX ${Number(expected).toLocaleString()} for this meeting. The previous hosting standing has been cleared.`;
    await client.query(
      `INSERT INTO notifications (member_id, title, message)
       SELECT id, 'Pay hosting fee for the upcoming meeting', $1
       FROM members WHERE deleted_at IS NULL AND status='active'`,
      [message]
    );
  }
  return cycle;
}

module.exports = {
  isHostingFeeCategory,
  hostingFeeExpected,
  loadOpenHostingCycle,
  loadHostingFeeStanding,
  loadMemberHostingFee,
  paymentCycleId,
  startHostingCycleForMeeting,
};
