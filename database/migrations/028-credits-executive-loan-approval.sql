-- Loan decisions belong to Credits and Executive. Finance only processes
-- organization accounting and has no approval stage in the loan workflow.
UPDATE loans
SET status = 'executive-authorization',
    verified_amount = COALESCE(verified_amount, amount)
WHERE status = 'finance-verification';

UPDATE department_assignments da
SET can_edit = TRUE,
    can_create = TRUE
FROM departments d, users u
WHERE da.department_id = d.id
  AND da.user_id = u.id
  AND d.code = 'credits'
  AND u.role = 'Credits Officer'
  AND da.active = TRUE;

UPDATE department_assignments da
SET can_approve = TRUE
FROM departments d
WHERE da.department_id = d.id
  AND d.code = 'credits'
  AND da.active = TRUE
  AND da.authority_level >= 3;
