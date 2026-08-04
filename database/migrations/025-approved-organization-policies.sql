-- Approved Kasangati G40 Kwagalana policies extracted from signed agreements,
-- AGM minutes, welfare policy and investment reports supplied in August 2026.

ALTER TABLE loan_products
  ADD COLUMN IF NOT EXISTS max_amount NUMERIC(18,2) NOT NULL DEFAULT 25000000,
  ADD COLUMN IF NOT EXISTS processing_fee_rate NUMERIC(8,3) NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS late_penalty_rate NUMERIC(8,3) NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS minimum_guarantors INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS maximum_guarantors INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS interest_method TEXT NOT NULL DEFAULT 'reducing_balance',
  ADD COLUMN IF NOT EXISTS policy_reference TEXT NOT NULL DEFAULT 'AGM-2025-LOAN-RESOLUTION';

UPDATE loan_products SET
  annual_rate=24,
  max_term=LEAST(max_term,10),
  max_amount=25000000,
  processing_fee_rate=2,
  late_penalty_rate=5,
  minimum_guarantors=3,
  maximum_guarantors=3,
  interest_method='reducing_balance',
  policy_reference='AGM-2025-LOAN-RESOLUTION'
WHERE active=true;

ALTER TABLE loans
  ADD COLUMN IF NOT EXISTS security_type TEXT,
  ADD COLUMN IF NOT EXISTS collateral_description TEXT,
  ADD COLUMN IF NOT EXISTS collateral_value NUMERIC(18,2),
  ADD COLUMN IF NOT EXISTS collateral_owner TEXT,
  ADD COLUMN IF NOT EXISTS collateral_owner_consent BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS borrower_declaration_accepted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS supporting_document_stored_name TEXT,
  ADD COLUMN IF NOT EXISTS supporting_document_original_name TEXT,
  ADD COLUMN IF NOT EXISTS supporting_document_mime_type TEXT,
  ADD COLUMN IF NOT EXISTS processing_fee NUMERIC(18,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS policy_reference TEXT NOT NULL DEFAULT 'AGM-2025-LOAN-RESOLUTION';

ALTER TABLE loan_guarantors
  ADD COLUMN IF NOT EXISTS guaranteed_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS declaration_accepted BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE loan_charges
  ADD COLUMN IF NOT EXISTS schedule_id BIGINT REFERENCES loan_repayment_schedule(id),
  ADD COLUMN IF NOT EXISTS penalty_period DATE;
CREATE UNIQUE INDEX IF NOT EXISTS idx_loan_charges_monthly_penalty
  ON loan_charges(loan_id,schedule_id,penalty_period,charge_type)
  WHERE charge_type='Late payment penalty' AND schedule_id IS NOT NULL AND penalty_period IS NOT NULL;

ALTER TABLE welfare_requests
  ADD COLUMN IF NOT EXISTS beneficiary_name TEXT,
  ADD COLUMN IF NOT EXISTS beneficiary_relationship TEXT,
  ADD COLUMN IF NOT EXISTS policy_limit NUMERIC(18,2),
  ADD COLUMN IF NOT EXISTS policy_eligible BOOLEAN,
  ADD COLUMN IF NOT EXISTS policy_reason TEXT,
  ADD COLUMN IF NOT EXISTS policy_reference TEXT NOT NULL DEFAULT 'WELFARE-POLICY-2025';

CREATE TABLE IF NOT EXISTS member_family_records (
  id BIGSERIAL PRIMARY KEY,
  member_id BIGINT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone TEXT,
  eligible_for_welfare BOOLEAN NOT NULL DEFAULT true,
  active BOOLEAN NOT NULL DEFAULT true,
  recorded_by BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_member_family_records_member ON member_family_records(member_id,relationship,active);

CREATE TABLE IF NOT EXISTS organization_policy_settings (
  setting_key TEXT PRIMARY KEY,
  numeric_value NUMERIC(18,3),
  text_value TEXT,
  source_reference TEXT NOT NULL,
  effective_from DATE NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO organization_policy_settings(setting_key,numeric_value,text_value,source_reference,effective_from) VALUES
  ('monthly_savings_target',425000,NULL,'CURRENT-MEMBER-SAVINGS-RULE','2026-07-01'),
  ('annual_share_capital',2000000,NULL,'AGM-2026','2026-07-01'),
  ('annual_subscription_fee',200000,NULL,'AGM-2026','2026-07-01'),
  ('monthly_welfare_contribution',25000,NULL,'WELFARE-POLICY-2025','2025-07-05'),
  ('welfare_waiting_months',6,NULL,'WELFARE-POLICY-2025','2025-07-05'),
  ('welfare_funeral_member',2000000,NULL,'WELFARE-POLICY-2025','2025-07-05'),
  ('welfare_funeral_dependant',1000000,NULL,'WELFARE-POLICY-2025','2025-07-05'),
  ('welfare_accident_medical',1000000,NULL,'WELFARE-POLICY-2025','2025-07-05'),
  ('welfare_marriage',1000000,NULL,'WELFARE-POLICY-2025','2025-07-05'),
  ('welfare_max_children',4,NULL,'AGM-2025','2025-07-01'),
  ('dividend_profit_percentage',70,NULL,'AGM-2026','2026-07-01'),
  ('strategic_asset_target',1000000000,NULL,'AGM-2026','2026-07-01'),
  ('strategic_asset_target_date',NULL,'2031-07-31','AGM-2026','2026-07-01')
ON CONFLICT(setting_key) DO UPDATE SET numeric_value=EXCLUDED.numeric_value,text_value=EXCLUDED.text_value,
  source_reference=EXCLUDED.source_reference,effective_from=EXCLUDED.effective_from,updated_at=NOW();

CREATE TABLE IF NOT EXISTS investment_fund_accounts (
  id BIGSERIAL PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  institution_name TEXT NOT NULL,
  fund_name TEXT NOT NULL,
  bank_name TEXT,
  bank_account_number TEXT,
  bank_branch TEXT,
  amount_invested NUMERIC(18,2) NOT NULL DEFAULT 0,
  current_value NUMERIC(18,2) NOT NULL DEFAULT 0,
  returns_earned NUMERIC(18,2) NOT NULL DEFAULT 0,
  invested_on DATE,
  report_as_at DATE,
  status TEXT NOT NULL DEFAULT 'active',
  source_reference TEXT,
  created_by BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
