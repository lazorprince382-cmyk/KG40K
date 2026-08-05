const SECURITY_RATE = 0.75;

function securityCapacity(savings) {
  return Math.round(Number(savings || 0) * SECURITY_RATE * 100) / 100;
}

function isSavingsSecurity(type) {
  const normalized = String(type || "").trim().toLowerCase().replaceAll(/[^a-z]+/g, "_").replace(/^_|_$/g, "");
  return normalized === "savings_and_shares" || normalized === "savings";
}

function estimateGuarantorsNeeded(loanAmount, borrowerSavings, candidateSavingsList = []) {
  const amount = Number(loanAmount) || 0;
  const borrowerCover = Math.min(amount, securityCapacity(borrowerSavings));
  const remaining = Math.max(0, Math.round((amount - borrowerCover) * 100) / 100);
  if (remaining <= 0) {
    return { needed: 0, remaining: 0, borrowerCover, estimatedCover: 0, covered: true };
  }
  const caps = (candidateSavingsList || [])
    .map((value) => securityCapacity(value))
    .filter((value) => value > 0)
    .sort((a, b) => b - a);
  let sum = 0;
  let needed = 0;
  for (const cap of caps) {
    if (sum >= remaining) break;
    sum += cap;
    needed += 1;
  }
  return {
    needed,
    remaining,
    borrowerCover,
    estimatedCover: Math.round(sum * 100) / 100,
    covered: sum + 0.005 >= remaining
  };
}

function selectedGuarantorCover(guarantorSavingsList = []) {
  return Math.round(
    (guarantorSavingsList || []).reduce((sum, value) => sum + securityCapacity(value), 0) * 100
  ) / 100;
}

function allocateGuarantorPledges(remainingAmount, guarantors) {
  let left = Math.max(0, Number(remainingAmount) || 0);
  const ranked = [...(guarantors || [])]
    .map((row) => ({ ...row, capacity: securityCapacity(row.savings) }))
    .sort((a, b) => b.capacity - a.capacity);
  return ranked
    .map((row) => {
      const pledge = Math.min(row.capacity, left);
      left = Math.max(0, Math.round((left - pledge) * 100) / 100);
      return { ...row, pledge };
    })
    .filter((row) => Number(row.pledge) > 0.005);
}

module.exports = {
  SECURITY_RATE,
  securityCapacity,
  isSavingsSecurity,
  estimateGuarantorsNeeded,
  selectedGuarantorCover,
  allocateGuarantorPledges
};
