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

async function deductUnpaidHostingFromSavings(client) {
  const exec = (sql, params) => client.query(sql, params);
  const expected = await hostingFeeExpected(client);
  const recorder = (
    await exec(
      `SELECT id FROM users WHERE active=true
       ORDER BY CASE role WHEN 'Finance Officer' THEN 1 WHEN 'System Admin' THEN 2 ELSE 3 END, id LIMIT 1`
    )
  ).rows[0];
  if (!recorder) return [];
  const members = (
    await exec(
      `SELECT m.id, m.full_name AS name, m.savings_balance::float AS savings,
         COALESCE((SELECT SUM(p.amount) FROM hosting_fee_payments p
           WHERE p.member_id=m.id AND p.status='completed'),0)::float AS paid
       FROM members m
       WHERE m.deleted_at IS NULL AND m.status='active'
       FOR UPDATE OF m`
    )
  ).rows;
  const taken = [];
  for (const member of members) {
    const due = Math.max(0, Number(expected) - Number(member.paid || 0));
    const take = Math.min(due, Number(member.savings || 0));
    if (take < 0.5) continue;
    const stamp = `${member.id}-${Date.now().toString(36).toUpperCase()}`;
    await exec("SAVEPOINT hosting_from_savings");
    try {
      const tx = (
        await exec(
          `INSERT INTO transactions
            (reference,member_id,type,method,amount,status,notes,recorded_by,verified_by,verified_at,created_at,receipt_number,submission_source)
           VALUES ($1,$2,'Hosting fee','Savings deduction',$3,'completed',$4,$5,$5,NOW(),NOW(),$6,'system')
           RETURNING id`,
          [
            `HOST-SAV-${stamp}`,
            member.id,
            take,
            "Taken from savings because hosting fee was not paid separately.",
            recorder.id,
            `RCPT-HOST-${stamp}`,
          ]
        )
      ).rows[0];
      await exec(
        `INSERT INTO hosting_fee_payments
          (member_id,amount,paid_on,status,reference,receipt_number,transaction_id,notes,recorded_by)
         VALUES ($1,$2,(CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Kampala')::date,'completed',$3,$4,$5,$6,$7)`,
        [
          member.id,
          take,
          `HOST-SAV-${stamp}`,
          `RCPT-HOST-${stamp}`,
          tx.id,
          "Deducted from savings",
          recorder.id,
        ]
      );
      await exec(`UPDATE members SET savings_balance=GREATEST(0,savings_balance-$1) WHERE id=$2`, [take, member.id]);
      await exec("RELEASE SAVEPOINT hosting_from_savings");
      taken.push({ memberId: member.id, name: member.name, amount: take });
    } catch (error) {
      await exec("ROLLBACK TO SAVEPOINT hosting_from_savings");
      if (error.code !== "23505") throw error;
    }
  }
  return taken;
}

module.exports = {
  isHostingFeeCategory,
  hostingFeeExpected,
  loadHostingFeeStanding,
  loadMemberHostingFee,
  deductUnpaidHostingFromSavings,
};
