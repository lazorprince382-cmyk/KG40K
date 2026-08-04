ALTER TABLE department_activities
  ADD COLUMN IF NOT EXISTS decision_by BIGINT REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS decision_at TIMESTAMPTZ;

UPDATE department_activities
SET decision_by=approved_by,
    decision_at=COALESCE(approved_at,updated_at)
WHERE status='approved' AND approved_by IS NOT NULL AND decision_by IS NULL;

CREATE INDEX IF NOT EXISTS idx_department_activities_executive_history
  ON department_activities(activity_type,status,decision_at DESC)
  WHERE activity_type IN ('finance-budget','finance-payment','investment-proposal','welfare-request','legal-contract','large-loan','policy');
