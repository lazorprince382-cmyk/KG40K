"use strict";

// Unpaid principal of a loan row aliased as `loans` (capped at the stored balance).
const LOAN_PRINCIPAL_LEFT_SQL = `LEAST(loans.balance,COALESCE((SELECT SUM(GREATEST(s.principal-s.principal_paid,0)) FROM loan_repayment_schedule s WHERE s.loan_id=loans.id),loans.balance))`;

async function loansOutstandingTotal(one) {
  const row = await one(`SELECT ROUND(COALESCE(SUM(${LOAN_PRINCIPAL_LEFT_SQL}),0),2)::float AS total FROM loans WHERE status IN ('active','overdue')`);
  return Number(row?.total || 0);
}

module.exports = { LOAN_PRINCIPAL_LEFT_SQL, loansOutstandingTotal };
