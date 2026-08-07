\set ON_ERROR_STOP on

BEGIN;

SELECT l.reference, l.status, m.full_name AS member
FROM loans l
JOIN members m ON m.id = l.member_id
ORDER BY l.id;

DELETE FROM transactions
WHERE loan_id IS NOT NULL
   OR type IN ('Loan repayment', 'Loan disbursement');

DELETE FROM notifications
WHERE title ILIKE '%loan%'
   OR message ILIKE '%loan %'
   OR message ILIKE '%LN-%';

DELETE FROM department_activities
WHERE activity_type = 'large-loan'
   OR reference LIKE 'ACT-LOAN-%'
   OR title ILIKE '%loan%';

DELETE FROM loan_disbursements;

DELETE FROM loans;

INSERT INTO audit_logs (action, entity_type, details)
VALUES (
  'SYSTEM_LOAN_DATA_PURGE',
  'system',
  'Removed all test loans and linked schedules, guarantors, repayments, and workflow history.'
);

SELECT COUNT(*)::int AS loans_remaining FROM loans;
SELECT COUNT(*)::int AS active_or_pending
FROM loans
WHERE status NOT IN ('rejected', 'closed', 'completed');

COMMIT;
