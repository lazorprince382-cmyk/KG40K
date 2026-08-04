-- Collateral-only applications and the approved equal-principal reducing-balance method.

ALTER TABLE loans
  ADD COLUMN IF NOT EXISTS collateral_owner_phone TEXT;

UPDATE loan_products SET
  annual_rate = 24,
  interest_method = 'equal_principal_reducing_balance'
WHERE active = true;

INSERT INTO loan_products
  (name, annual_rate, max_term, max_multiplier, active, max_amount,
   processing_fee_rate, late_penalty_rate, minimum_guarantors,
   maximum_guarantors, interest_method, policy_reference)
VALUES
  ('Other Loan', 24, 10, 3, true, 25000000, 2, 5, 3, 3,
   'equal_principal_reducing_balance', 'AGM-2025-LOAN-RESOLUTION')
ON CONFLICT (name) DO UPDATE SET
  annual_rate = EXCLUDED.annual_rate,
  max_term = EXCLUDED.max_term,
  max_amount = EXCLUDED.max_amount,
  active = true,
  interest_method = EXCLUDED.interest_method,
  policy_reference = EXCLUDED.policy_reference;
