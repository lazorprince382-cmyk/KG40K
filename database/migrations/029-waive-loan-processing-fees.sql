-- Loans carry only schedule interest; processing fees are no longer assessed or collected.
UPDATE loan_charges
SET status = 'waived',
    reason = TRIM(BOTH FROM COALESCE(reason, '') || ' [Waived: only monthly interest applies per SACCO policy]')
WHERE charge_type = 'Processing fee'
  AND status IN ('outstanding', 'partial');
