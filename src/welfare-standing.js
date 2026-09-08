"use strict";
/**
 * Shared welfare standing for Finance, Welfare and Executive.
 * Standard members: UGX 650,000 welfare since June 2024 (inside personal savings).
 * Vicent: UGX 50,000 since July 2026. Oketcho & Baraza excluded from standing.
 */
const { query, one } = require("./db");

const DEFAULT_SINCE = "2024-06-01";
const VICENT_SINCE = "2026-07-01";
const DEFAULT_MONTHLY = 25000;

function isExcluded(name) {
  return /oketcho/i.test(name || "") || (/baraza/i.test(name || "") && /nakayiza|olivia/i.test(name || ""));
}
function isVicent(name) {
  return /vicent|vincent/i.test(name || "") && /gumisiriza/i.test(name || "");
}

async function loadWelfareStanding() {
  const sinceSetting = (await one(`SELECT value FROM settings WHERE key='welfareCollectionStartDate'`))?.value;
  const sinceDate = /^\d{4}-\d{2}-\d{2}$/.test(String(sinceSetting || "")) ? String(sinceSetting) : DEFAULT_SINCE;
  const monthlyShare = Number(
    (await one(`SELECT value FROM settings WHERE key='monthlyWelfareContribution'`))?.value || DEFAULT_MONTHLY
  );
  const openingBalance = Number((await one(`SELECT value FROM settings WHERE key='welfareFundBalance'`))?.value || 0);

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

  const sinceLabel = "June 2024";

  const byMember = (
    await query(
      `SELECT m.id AS "memberId", m.full_name AS member, m.member_number AS "memberNumber",
         m.joined_at AS "joinedAt", m.savings_balance::float AS "savingsBalance",
         COUNT(c.id)::int AS "contributionCount",
         COALESCE(SUM(c.amount),0)::float AS collected,
         MAX(c.contribution_date) AS "lastContributionDate"
       FROM members m
       LEFT JOIN welfare_contributions c
         ON c.member_id = m.id
        AND c.status IN ('verified','completed','recorded')
       WHERE m.deleted_at IS NULL AND m.status = 'active'
       GROUP BY m.id
       ORDER BY collected DESC, m.full_name`
    )
  ).rows.map((row) => {
    const excluded = isExcluded(row.member);
    const vicent = isVicent(row.member);
    const memberSinceLabel = vicent ? "July 2026" : sinceLabel;
    const memberSinceDate = vicent ? VICENT_SINCE : sinceDate;
    return {
      ...row,
      excluded,
      isVicent: vicent,
      isNewMember: vicent || (row.joinedAt && new Date(row.joinedAt) >= new Date(Date.now() - 60 * 86400000)),
      sinceDate: memberSinceDate,
      sinceLabel: memberSinceLabel,
      cardNote: excluded
        ? "Not on welfare standing register"
        : vicent
          ? "Welfare since July 2026 (part of personal savings)"
          : "Welfare since June 2024 (part of personal savings)",
    };
  });

  const standingMembers = byMember.filter((row) => !row.excluded && !row.isVicent && Number(row.collected) > 0);
  const allContributing = byMember.filter((row) => !row.excluded && Number(row.collected) > 0);
  const collectedSince = standingMembers.reduce((sum, row) => sum + Number(row.collected || 0), 0);
  const collectedAllTime = allContributing.reduce((sum, row) => sum + Number(row.collected || 0), 0);
  const newMembers = byMember.filter((row) => row.isVicent || row.isNewMember);
  const closingBalance = openingBalance + collectedAllTime - assistancePaid;

  return {
    sinceDate,
    sinceLabel,
    monthlyShare,
    monthlyCombined: 425000,
    openingBalance,
    collectedSince,
    collectedAllTime,
    contributionRows: allContributing.length,
    membersContributing: standingMembers.length,
    assistancePaid,
    closingBalance,
    standardMemberTarget: 650000,
    note:
      "Most members hold UGX 650,000 welfare since June 2024 inside personal savings. Vicent holds UGX 50,000 since July 2026. Oketcho and Baraza are excluded from this standing.",
    byMember,
    standingMembers,
    newMembers,
  };
}

module.exports = { loadWelfareStanding, DEFAULT_SINCE, VICENT_SINCE };
