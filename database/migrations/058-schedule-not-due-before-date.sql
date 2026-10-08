-- Instalments were created as 'due' at disbursement even when their due date was still in the future.
UPDATE loan_repayment_schedule
SET status = CASE WHEN paid_amount > 0 THEN 'partial' ELSE 'upcoming' END
WHERE status = 'due'
  AND due_date > (CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Kampala')::date
  AND paid_amount < total_due;
