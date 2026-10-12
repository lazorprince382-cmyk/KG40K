const { one } = require("./db");
const { loadMemberSchedule } = require("./savings-schedule");

async function getRunningLoan(memberId) {
  return one(
    `SELECT id,reference,status,balance::float
     FROM loans
     WHERE member_id=$1 AND status IN ('active','overdue')
     ORDER BY CASE WHEN status='overdue' THEN 0 ELSE 1 END, id DESC
     LIMIT 1`,
    [memberId]
  );
}

/** Up to date means monthly savings cover the current month, not the whole financial year. */
async function getSavingsTargetStatus(memberId) {
  const schedule = await loadMemberSchedule(memberId);
  if (!schedule) {
    return { upToDate: true, pastYearCompleted: false, fiscalYear: null, monthLabel: null, shortfall: 0, reason: null };
  }
  const shortfall = Math.max(0, Math.round(Number(schedule.shortBy || 0)));
  if (shortfall > 0.5) {
    return {
      upToDate: false,
      pastYearCompleted: false,
      fiscalYear: schedule.monthLabel,
      monthLabel: schedule.monthLabel,
      shortfall,
      reason: `Monthly savings not up to date for ${schedule.monthLabel} (UGX ${shortfall.toLocaleString()} remaining)`
    };
  }
  return {
    upToDate: true,
    pastYearCompleted: false,
    fiscalYear: schedule.monthLabel,
    monthLabel: schedule.monthLabel,
    shortfall: 0,
    reason: null
  };
}

async function getGuarantorEligibility(memberId) {
  const runningLoan = await getRunningLoan(memberId);
  if (runningLoan) {
    return {
      eligible: false,
      available: false,
      reason: `Has a running loan (${runningLoan.reference}) — cannot guarantee until it is settled`,
      code: "running_loan",
      runningLoan,
      savings: null
    };
  }
  const savings = await getSavingsTargetStatus(memberId);
  if (!savings.upToDate) {
    return {
      eligible: false,
      available: false,
      reason: savings.reason || "Monthly savings are not up to date — cannot guarantee",
      code: "savings_behind",
      runningLoan: null,
      savings
    };
  }
  return {
    eligible: true,
    available: true,
    reason: null,
    code: null,
    runningLoan: null,
    savings
  };
}

module.exports = {
  getRunningLoan,
  getSavingsTargetStatus,
  getGuarantorEligibility
};
