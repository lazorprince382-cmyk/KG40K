function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(Number(value) || 0)));
}

function computeDepartmentPerformance(metrics) {
  const pendingApprovals = Number(metrics.pendingApprovals || 0);
  const upcomingMeetings = Number(metrics.upcomingMeetings || 0);
  const budgetUtilization = Number(metrics.budgetUtilization || 0);
  const financeIncome = Number(metrics.financeIncome || 0);
  const financeExpenditure = Number(metrics.financeExpenditure || 0);
  const recoveryRate = Number(metrics.recoveryRate || 0);
  const totalSavings = Number(metrics.totalSavings || 0);
  const activeLoans = Number(metrics.activeLoans || 0);
  const overdueLoans = Number(metrics.overdueLoans || 0);
  const investmentRunning = Number(metrics.investmentRunning || 0);
  const investmentProfitable = Number(metrics.investmentProfitable || 0);
  const investmentGrowth = Number(metrics.investmentGrowth || 0);
  const welfareBalance = Number(metrics.welfareBalance || 0);
  const welfarePending = Number(metrics.welfarePending || 0);
  const welfareApproved = Number(metrics.welfareApproved || 0);
  const legalOpenCases = Number(metrics.legalOpenCases || 0);
  const legalContracts = Number(metrics.legalContracts || 0);
  const legalAlerts = Number(metrics.legalAlerts || 0);
  const auditCompliance = Number(metrics.auditCompliance || 0);
  const auditOpen = Number(metrics.auditOpen || 0);
  const supervisoryBelow = Number(metrics.supervisoryBelow || 0);
  const supervisoryFollowups = Number(metrics.supervisoryFollowups || 0);

  const executive = clamp(
    pendingApprovals === 0 ? 94 : Math.max(58, 96 - pendingApprovals * 7) + Math.min(4, upcomingMeetings)
  );

  let finance = 72;
  if (budgetUtilization > 0) {
    finance = budgetUtilization <= 100
      ? clamp(68 + (100 - Math.abs(budgetUtilization - 78)) * 0.35)
      : clamp(58 - (budgetUtilization - 100) * 0.8);
  } else if (financeIncome > 0) {
    finance = clamp(70 + (financeIncome >= financeExpenditure ? 18 : -12));
  }

  const credits = clamp(
    recoveryRate * 0.55 +
    (totalSavings > 0 ? 20 : 8) +
    (activeLoans > 0 ? 12 : 6) -
    overdueLoans * 8
  );

  const investment = investmentRunning > 0
    ? clamp((investmentProfitable / investmentRunning) * 72 + Math.min(20, Math.max(0, investmentGrowth)))
    : 76;

  const welfare = clamp(
    (welfareBalance > 0 ? 72 : 52) + Math.min(16, welfareApproved * 2) - welfarePending * 6
  );

  const legal = clamp(94 - legalOpenCases * 9 - legalContracts * 4 - legalAlerts * 6);
  const audit = clamp(auditCompliance > 0 ? auditCompliance : 82 - auditOpen * 5);
  const supervisory = clamp(
    supervisoryBelow === 0 ? 90 - supervisoryFollowups * 2 : Math.max(52, 86 - supervisoryBelow * 9)
  );

  return { executive, finance, credits, investment, welfare, legal, audit, supervisory };
}

function mergeDepartmentPerformance(assessed = {}, computed = {}) {
  const merged = {};
  for (const code of Object.keys(computed)) {
    const official = Number(assessed[code] || 0);
    merged[code] = official > 0 ? official : computed[code];
  }
  return merged;
}

module.exports = { computeDepartmentPerformance, mergeDepartmentPerformance };
