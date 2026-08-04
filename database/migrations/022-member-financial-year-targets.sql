CREATE TABLE IF NOT EXISTS member_financial_year_policies (
  id BIGSERIAL PRIMARY KEY,
  fiscal_year_label TEXT NOT NULL UNIQUE,
  starts_on DATE NOT NULL UNIQUE,
  ends_on DATE NOT NULL,
  monthly_savings_target NUMERIC(20,2) NOT NULL CHECK (monthly_savings_target >= 0),
  annual_share_target NUMERIC(20,2) NOT NULL CHECK (annual_share_target >= 0),
  annual_subscription_fee NUMERIC(20,2) NOT NULL CHECK (annual_subscription_fee >= 0),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft','active','closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (ends_on >= starts_on)
);

INSERT INTO member_financial_year_policies
  (fiscal_year_label,starts_on,ends_on,monthly_savings_target,annual_share_target,annual_subscription_fee,status)
VALUES ('2026/27','2026-07-01','2027-06-30',425000,2000000,200000,'active')
ON CONFLICT (fiscal_year_label) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_member_fy_policy_dates
  ON member_financial_year_policies(starts_on,ends_on,status);
