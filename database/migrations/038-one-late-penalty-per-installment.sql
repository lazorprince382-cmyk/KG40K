-- One late-payment penalty per overdue installment (not a new 5% every calendar month).
-- Penalty applies from the day AFTER the installment due date.

-- Keep the newest charge when duplicates exist for the same installment.
DELETE FROM loan_charges a
USING loan_charges b
WHERE a.charge_type = 'Late payment penalty'
  AND b.charge_type = 'Late payment penalty'
  AND a.loan_id = b.loan_id
  AND a.schedule_id IS NOT NULL
  AND a.schedule_id = b.schedule_id
  AND a.id < b.id;

DROP INDEX IF EXISTS idx_loan_charges_monthly_penalty;

CREATE UNIQUE INDEX IF NOT EXISTS idx_loan_charges_installment_penalty
  ON loan_charges (loan_id, schedule_id, charge_type)
  WHERE charge_type = 'Late payment penalty' AND schedule_id IS NOT NULL;

-- Align outstanding late penalties to 5% of currently unpaid installment principal.
UPDATE loan_charges c
SET amount = ROUND(GREATEST(s.principal - s.principal_paid, 0) * p.late_penalty_rate / 100, 2),
    reason = 'Automatic 5% penalty on overdue principal after the due date',
    penalty_period = s.due_date
FROM loan_repayment_schedule s
JOIN loans l ON l.id = s.loan_id
JOIN loan_products p ON p.id = l.product_id
WHERE c.schedule_id = s.id
  AND c.charge_type = 'Late payment penalty'
  AND c.status IN ('outstanding', 'partial')
  AND s.status = 'overdue'
  AND s.principal > s.principal_paid;
