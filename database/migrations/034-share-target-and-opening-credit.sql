-- Raise 2026/27 annual share target to UGX 2,125,000 and credit UGX 125,000
-- as shares already bought toward this year.
ALTER TABLE member_financial_year_policies
  ADD COLUMN IF NOT EXISTS opening_share_credit NUMERIC(20,2) NOT NULL DEFAULT 0
    CHECK (opening_share_credit >= 0);

UPDATE member_financial_year_policies
SET annual_share_target = 2125000,
    opening_share_credit = 125000
WHERE fiscal_year_label = '2026/27'
  AND status = 'active';

UPDATE organization_policy_settings
SET numeric_value = 2125000,
    updated_at = NOW()
WHERE setting_key = 'annual_share_capital'
  AND effective_from = '2026-07-01';
