"use strict";
/**
 * Shared welfare standing for Finance, Welfare and Executive.
 * Welfare share (UGX 25,000 of the monthly 425,000 deposit) is tracked in
 * welfare_contributions AND remains part of the member's personal savings_balance.
 */
const { query, one } = require("./db");

const DEFAULT_SINCE = "2024-06-01";
const DEFAULT_MONTHLY = 25000;

async function loadWelfareStanding() {
  const sinceSetting = (await one(`SELECT value FROM settings WHERE key='welfareCollectionStartDate'`))?.value;
  const sinceDate = /^\d{4}-\d{2}-\d{2}$/.test(String(sinceSetting || "")) ? String(sinceSetting) : DEFAULT_SINCE;
  const monthlyShare = Number(
    (await one(`SELECT value FROM settings WHERE key='monthlyWelfareContribution'`))?.value || DEFAULT_MONTHLY
  );
  const openingBalance = Number((await one(`SELECT value FROM settings WHERE key='welfareFundBalance'`))?.value || 0);

  const totals = await one(
    `SELECT
       COALESCE(SUM(amount) FILTER (WHERE status IN ('verified','completed') AND contribution_date >= $1::date),0)::float AS "collectedSince",
       COUNT(*) FILTER (WHERE status IN ('verified','completed') AND contribution_date >= $1::date)::int AS "contributionRows",
       COUNT(DISTINCT member_id) FILTER (WHERE status IN ('verified','completed') AND contribution_date >= $1::date)::int AS "membersContributing",
       COALESCE(SUM(amount) FILTER (WHERE status IN ('verified','completed')),0)::float AS "collectedAllTime"
     FROM welfare_contributions`,
    [sinceDate]
  );

  const assistancePaid = Number(
    (
      await one(
        `SELECT COALESCE(SUM(p.amount),0)::float AS total
         FROM welfare_payments p
         LEFT JOIN welfare_requests wr ON wr.id = p.request_id
         LEFT JOIN finance_payment_vouchers v ON v.id = wr.finance_voucher_id
         WHERE COALESCE(v.status, p.status) IN ('paid','processed')`
      )
    )?.total || 0
  );

  const byMember = (
    await query(
      `SELECT m.id AS "memberId", m.full_name AS member, m.member_number AS "memberNumber",
         m.joined_at AS "joinedAt", m.savings_balance::float AS "savingsBalance",
         COUNT(c.id)::int AS "contributionCount",
         COALESCE(SUM(c.amount),0)::float AS collected,
         MAX(c.contribution_date) AS "lastContributionDate",
         (m.joined_at >= (CURRENT_DATE - INTERVAL '60 days')) AS "isNewMember"
       FROM members m
       LEFT JOIN welfare_contributions c
         ON c.member_id = m.id
        AND c.status IN ('verified','completed')
        AND c.contribution_date >= $1::date
       WHERE m.deleted_at IS NULL AND m.status = 'active'
       GROUP BY m.id
       ORDER BY collected DESC, m.full_name`,
      [sinceDate]
    )
  ).rows;

  const newMembers = byMember.filter((row) => row.isNewMember || /vicent|vincent/i.test(row.member || ""));
  const closingBalance = openingBalance + Number(totals.collectedAllTime || 0) - assistancePaid;
  const sinceLabel = new Date(`${sinceDate}T00:00:00`).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  return {
    sinceDate,
    sinceLabel,
    monthlyShare,
    monthlyCombined: 425000,
    openingBalance,
    collectedSince: Number(totals.collectedSince || 0),
    collectedAllTime: Number(totals.collectedAllTime || 0),
    contributionRows: Number(totals.contributionRows || 0),
    membersContributing: Number(totals.membersContributing || 0),
    assistancePaid,
    closingBalance,
    note:
      "Welfare share (UGX 25,000 of each UGX 425,000 monthly deposit) is tracked here and also stays inside the member's personal savings balance.",
    byMember,
    newMembers,
  };
}

module.exports = { loadWelfareStanding, DEFAULT_SINCE };
