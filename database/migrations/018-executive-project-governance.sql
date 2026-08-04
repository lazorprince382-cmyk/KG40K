ALTER TABLE investment_proposals
  ADD COLUMN IF NOT EXISTS finance_reviewed_by BIGINT REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS finance_reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS finance_analysis TEXT,
  ADD COLUMN IF NOT EXISTS finance_recommendation TEXT;

ALTER TABLE investment_projects
  ADD COLUMN IF NOT EXISTS proposal_id BIGINT REFERENCES investment_proposals(id),
  ADD COLUMN IF NOT EXISTS executive_status TEXT NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS idx_investment_projects_proposal
  ON investment_projects(proposal_id) WHERE proposal_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS investment_project_oversight (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES investment_projects(id),
  action_type TEXT NOT NULL,
  target_department_id BIGINT REFERENCES departments(id),
  previous_status TEXT,
  new_status TEXT,
  comment TEXT NOT NULL,
  created_by BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_investment_project_oversight_project
  ON investment_project_oversight(project_id,created_at DESC);
