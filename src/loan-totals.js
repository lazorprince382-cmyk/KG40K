"use strict";

// Unpaid principal of a loan row aliased as `loans` (capped at the stored balance).
const LOAN_PRINCIPAL_LEFT_SQL = `LEAST(loans.balance,COALESCE((SELECT SUM(GREATEST(s.principal-s.principal_paid,0)) FROM loan_repayment_schedule s WHERE s.loan_id=loans.id),loans.balance))`;

const LOAN_INTEREST_LEFT_SQL = `COALESCE((SELECT SUM(GREATEST(s.interest-COALESCE(s.interest_paid,0),0)) FROM loan_repayment_schedule s WHERE s.loan_id=loans.id),0)`;

// Assessed unpaid charges + late penalties already on the book + the next 5% not yet posted.
const LOAN_PENALTY_LEFT_SQL = `(
  COALESCE((SELECT SUM(GREATEST(0,c.amount-c.paid_amount)) FROM loan_charges c
    WHERE c.loan_id=loans.id AND c.status IN ('outstanding','partial')
      AND c.charge_type <> 'Processing fee' AND c.charge_type <> 'Late payment penalty'),0)
  + COALESCE((SELECT SUM(GREATEST(0,c.amount-c.paid_amount)) FROM loan_charges c
      LEFT JOIN loan_repayment_schedule ps ON ps.id=c.schedule_id
      WHERE c.loan_id=loans.id AND c.status IN ('outstanding','partial') AND c.charge_type='Late payment penalty'
        AND (c.schedule_id IS NULL OR ps.due_date < (CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Kampala')::date)),0)
  + COALESCE((SELECT ROUND(GREATEST(0,s.principal)*COALESCE(p.late_penalty_rate,5)/100,2)
      FROM loan_repayment_schedule s
      JOIN loan_products p ON p.id=loans.product_id
      WHERE s.loan_id=loans.id AND s.status='overdue' AND s.paid_amount<s.total_due
        AND NOT EXISTS (
          SELECT 1 FROM loan_charges c
          WHERE c.loan_id=loans.id AND c.schedule_id=s.id AND c.charge_type='Late payment penalty'
            AND c.status IN ('outstanding','partial','settled')
        )
      ORDER BY s.installment_number LIMIT 1),0)
)`;

const LOAN_MONEY_IN_LOANS_SQL = `((${LOAN_PRINCIPAL_LEFT_SQL})+(${LOAN_INTEREST_LEFT_SQL})+(${LOAN_PENALTY_LEFT_SQL}))`;

function withLoanAlias(sql, alias = "loans") {
  return String(sql).replace(/\bloans\./g, `${alias}.`);
}

async function loansOutstandingTotal(one) {
  const row = await one(
    `SELECT ROUND(COALESCE(SUM(${LOAN_MONEY_IN_LOANS_SQL}),0),2)::float AS total FROM loans WHERE status IN ('active','overdue')`
  );
  return Number(row?.total || 0);
}

module.exports = {
  LOAN_PRINCIPAL_LEFT_SQL,
  LOAN_INTEREST_LEFT_SQL,
  LOAN_PENALTY_LEFT_SQL,
  LOAN_MONEY_IN_LOANS_SQL,
  withLoanAlias,
  loansOutstandingTotal,
};
