const { one } = require("./db");

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

async function getSavingsTargetStatus(memberId) {
  const closingPosition = await one(
    `SELECT p.period_end AS "periodEnd",b.savings_balance::float AS savings,
      b.expected_savings::float AS expected
      FROM members m JOIN legacy_member_opening_balances b ON b.id=m.legacy_opening_balance_id
      JOIN financial_reporting_periods p ON p.id=b.period_id WHERE m.id=$1`,
    [memberId]
  );

  if (closingPosition) {
    const arrearsPaid = Number(
      (
        await one(
          `SELECT COALESCE(SUM(amount),0)::float AS amount FROM transactions
           WHERE member_id=$1 AND type='Savings deposit' AND status='completed'
             AND target_fiscal_year=EXTRACT(YEAR FROM $2::date)::int`,
          [memberId, closingPosition.periodEnd]
        )
      ).amount || 0
    );
    const totalPaid = Number(closingPosition.savings) + arrearsPaid;
    const expected = Number(closingPosition.expected || 0);
    const shortfall = Math.max(0, Math.round((expected - totalPaid) * 100) / 100);
    const fiscalYear = `FY ${new Date(closingPosition.periodEnd).getUTCFullYear() - 1}/${String(new Date(closingPosition.periodEnd).getUTCFullYear()).slice(-2)}`;
    if (shortfall > 0.005) {
      return {
        upToDate: false,
        pastYearCompleted: false,
        fiscalYear,
        shortfall,
        reason: `Complete ${fiscalYear} savings target first (UGX ${shortfall.toLocaleString()} remaining)`
      };
    }
    return {
      upToDate: true,
      pastYearCompleted: true,
      fiscalYear,
      shortfall: 0,
      reason: null
    };
  }

  const financialYear = await one(
    `SELECT fiscal_year_label AS "fiscalYear",starts_on AS "startsOn",ends_on AS "endsOn",
      monthly_savings_target::float AS "monthlySavingsTarget",
      LEAST(12,GREATEST(0,(EXTRACT(YEAR FROM age(LEAST(CURRENT_DATE,ends_on),starts_on))*12+
        EXTRACT(MONTH FROM age(LEAST(CURRENT_DATE,ends_on),starts_on))+1)::int)) AS "monthsDue"
      FROM member_financial_year_policies
      WHERE status='active' AND CURRENT_DATE BETWEEN starts_on AND ends_on
      ORDER BY starts_on DESC LIMIT 1`
  );

  if (!financialYear) {
    return { upToDate: true, pastYearCompleted: false, fiscalYear: null, shortfall: 0, reason: null };
  }

  const yearSavings = Number(
    (
      await one(
        `SELECT COALESCE(SUM(amount),0)::float AS amount FROM transactions
         WHERE member_id=$1 AND type='Savings deposit' AND status='completed'
           AND (target_fiscal_year=EXTRACT(YEAR FROM $3::date)::int
             OR (target_fiscal_year IS NULL AND created_at::date BETWEEN $2 AND $3))`,
        [memberId, financialYear.startsOn, financialYear.endsOn]
      )
    ).amount || 0
  );
  const expectedToDate = Number(financialYear.monthlySavingsTarget) * Number(financialYear.monthsDue);
  const shortfall = Math.max(0, Math.round((expectedToDate - yearSavings) * 100) / 100);
  if (shortfall > 0.005) {
    return {
      upToDate: false,
      pastYearCompleted: false,
      fiscalYear: financialYear.fiscalYear,
      shortfall,
      reason: `Savings not up to date for ${financialYear.fiscalYear} (UGX ${shortfall.toLocaleString()} remaining)`
    };
  }
  return {
    upToDate: true,
    pastYearCompleted: false,
    fiscalYear: financialYear.fiscalYear,
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
      reason: savings.reason || "Savings are not up to date — cannot guarantee",
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
