-- First monthly deposit splits UGX 25,000 to welfare; the rest is savings.
-- Dan's 1 Sep 2026 receipt stays UGX 425,000 on Centenary/income, but savings keeps only the remainder.

UPDATE members m
SET savings_balance = GREATEST(0, m.savings_balance - 25000)
FROM transactions t
WHERE t.reference = 'DEP-SEP01-DAN-425K'
  AND t.member_id = m.id
  AND t.type = 'Savings deposit'
  AND t.amount = 425000;

UPDATE transactions
SET amount = 400000,
    notes = COALESCE(notes, '') || ' | UGX 25,000 welfare taken once for 2026-09; UGX 400,000 remains on savings'
WHERE reference = 'DEP-SEP01-DAN-425K'
  AND type = 'Savings deposit'
  AND amount = 425000;

INSERT INTO settings (key, value) VALUES ('monthlyWelfareContribution', '25000')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO settings (key, value) VALUES ('monthlyCombinedContribution', '425000')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

UPDATE member_financial_year_policies
SET monthly_savings_target = 400000
WHERE status = 'active' AND monthly_savings_target = 425000;
