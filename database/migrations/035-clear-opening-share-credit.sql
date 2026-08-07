-- Do not pretreat any amount as already-paid shares. Target stays 2,125,000;
-- progress starts at zero until verified share purchases exist.
UPDATE member_financial_year_policies
SET opening_share_credit = 0
WHERE fiscal_year_label = '2026/27'
  AND status = 'active';
