-- Multi-officer Credits + Executive loan approvals, custom Other Loan name,
-- and restore 2% processing fee deducted at disbursement.

ALTER TABLE loans ADD COLUMN IF NOT EXISTS custom_product_name TEXT;

CREATE TABLE IF NOT EXISTS loan_stage_votes (
  id BIGSERIAL PRIMARY KEY,
  loan_id BIGINT NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  stage TEXT NOT NULL CHECK (stage IN ('credits','executive')),
  user_id BIGINT NOT NULL REFERENCES users(id),
  decision TEXT NOT NULL CHECK (decision IN ('approve','reject','return')),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (loan_id, stage, user_id)
);

CREATE INDEX IF NOT EXISTS idx_loan_stage_votes_loan_stage
  ON loan_stage_votes (loan_id, stage, created_at);

-- Collapse legacy Credit Committee stage into Credits multi-officer review.
UPDATE loans
SET status = 'officer-review'
WHERE status = 'committee-review';

-- Ensure every active Credits / Executive assignee can cast loan stage votes.
UPDATE department_assignments da
SET can_edit = TRUE
FROM departments d
WHERE da.department_id = d.id
  AND d.code = 'credits'
  AND da.active = TRUE;

UPDATE department_assignments da
SET can_approve = TRUE,
    can_edit = TRUE
FROM departments d
WHERE da.department_id = d.id
  AND d.code = 'executive'
  AND da.active = TRUE;

-- Recalculate processing fee on loans still waiting for disbursement.
UPDATE loans l
SET processing_fee = ROUND(COALESCE(l.verified_amount, l.amount) * COALESCE(p.processing_fee_rate, 2) / 100, 2)
FROM loan_products p
WHERE p.id = l.product_id
  AND l.status IN ('officer-review','executive-authorization','ready-disbursement','pending-guarantors','correction')
  AND COALESCE(l.processing_fee, 0) = 0;
