ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS submission_source TEXT NOT NULL DEFAULT 'staff';

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS evidence_stored_name TEXT;

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS evidence_original_name TEXT;

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS evidence_mime_type TEXT;

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS verification_comment TEXT;

CREATE INDEX IF NOT EXISTS idx_transactions_pending_source
  ON transactions(status, submission_source, created_at DESC);
