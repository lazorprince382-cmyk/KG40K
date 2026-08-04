ALTER TABLE investment_projects
  ADD COLUMN IF NOT EXISTS open_to_members BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS minimum_member_investment NUMERIC(18,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS member_expected_return_rate NUMERIC(8,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS member_investment_deadline DATE;

CREATE TABLE IF NOT EXISTS member_investment_applications (
  id BIGSERIAL PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  project_id BIGINT NOT NULL REFERENCES investment_projects(id),
  member_id BIGINT NOT NULL REFERENCES members(id),
  amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL,
  payment_reference TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'investment_review',
  evidence_stored_name TEXT,
  evidence_original_name TEXT,
  evidence_mime_type TEXT,
  submitted_by BIGINT NOT NULL REFERENCES users(id),
  reviewed_by BIGINT REFERENCES users(id),
  review_comment TEXT,
  reviewed_at TIMESTAMPTZ,
  finance_entry_id BIGINT REFERENCES organization_finance_entries(id),
  investor_id BIGINT REFERENCES investment_investors(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_member_investment_member ON member_investment_applications(member_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_member_investment_status ON member_investment_applications(status,created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_member_investment_finance ON member_investment_applications(finance_entry_id) WHERE finance_entry_id IS NOT NULL;

ALTER TABLE welfare_contributions ALTER COLUMN receipt_number DROP NOT NULL;
ALTER TABLE welfare_contributions
  ADD COLUMN IF NOT EXISTS payment_reference TEXT,
  ADD COLUMN IF NOT EXISTS submission_source TEXT NOT NULL DEFAULT 'staff',
  ADD COLUMN IF NOT EXISTS evidence_stored_name TEXT,
  ADD COLUMN IF NOT EXISTS evidence_original_name TEXT,
  ADD COLUMN IF NOT EXISTS evidence_mime_type TEXT,
  ADD COLUMN IF NOT EXISTS verification_comment TEXT,
  ADD COLUMN IF NOT EXISTS verified_by BIGINT REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

ALTER TABLE welfare_requests
  ADD COLUMN IF NOT EXISTS evidence_stored_name TEXT,
  ADD COLUMN IF NOT EXISTS evidence_original_name TEXT,
  ADD COLUMN IF NOT EXISTS evidence_mime_type TEXT;

UPDATE investment_projects SET open_to_members=true,
  minimum_member_investment=CASE WHEN minimum_member_investment=0 THEN 50000 ELSE minimum_member_investment END,
  member_expected_return_rate=CASE WHEN member_expected_return_rate=0 THEN 10 ELSE member_expected_return_rate END
WHERE status IN ('planning','active','running','construction');

UPDATE investment_projects SET open_to_members=true,
  minimum_member_investment=CASE WHEN minimum_member_investment=0 THEN 50000 ELSE minimum_member_investment END,
  member_expected_return_rate=CASE WHEN member_expected_return_rate=0 THEN 10 ELSE member_expected_return_rate END
WHERE status IN ('planning','active','running','construction');
