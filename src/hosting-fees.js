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

function statusForPaid(paid, expected) {
  if (Number(paid) >= Number(expected) - 0.5) return "paid";
  if (Number(paid) > 0.5) return "partial";
  return "unpaid";
}

async function loadHostingFeeStanding() {
  const expected = await hostingFeeExpected();
  let members = [];
  try {
    members = (
      await query(
        `SELECT m.id, m.full_name AS name, m.member_number AS "memberNumber",
           COALESCE((SELECT SUM(p.amount) FROM hosting_fee_payments p
             WHERE p.member_id=m.id AND p.status='completed'),0)::float AS paid,
           (SELECT MAX(p.paid_on) FROM hosting_fee_payments p
             WHERE p.member_id=m.id AND p.status='completed') AS "lastPaidOn",
           (SELECT p.receipt_number FROM hosting_fee_payments p
             WHERE p.member_id=m.id AND p.status='completed'
             ORDER BY p.paid_on DESC, p.id DESC LIMIT 1) AS "receiptNumber"
         FROM members m
         WHERE m.deleted_at IS NULL AND m.status='active'
         ORDER BY m.full_name`
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
      lastPaidOn: m.lastPaidOn,
      receiptNumber: m.receiptNumber,
      status: statusForPaid(paid, expected),
    };
  });
  const collected = list.reduce((sum, row) => sum + row.paid, 0);
  return {
    expected,
    collected,
    paidCount: list.filter((row) => row.status === "paid").length,
    unpaidCount: list.filter((row) => row.status === "unpaid").length,
    partialCount: list.filter((row) => row.status === "partial").length,
    members: list,
    paidMembers: list.filter((row) => row.status !== "unpaid"),
    unpaidMembers: list.filter((row) => row.status === "unpaid"),
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
           p.reference, p.status, t.method
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
    status: row?.status || "unpaid",
    lastPaidOn: row?.lastPaidOn || null,
    payments,
  };
}

module.exports = {
  isHostingFeeCategory,
  hostingFeeExpected,
  loadHostingFeeStanding,
  loadMemberHostingFee,
};
