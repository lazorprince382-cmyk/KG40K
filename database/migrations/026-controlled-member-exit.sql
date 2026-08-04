-- Recoverable member exit. Financial ledgers remain intact for audit, while
-- archived members are excluded from current organization and SACCO totals.
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by BIGINT REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS exit_reason TEXT,
  ADD COLUMN IF NOT EXISTS exit_savings_balance NUMERIC(18,2),
  ADD COLUMN IF NOT EXISTS exit_share_capital NUMERIC(18,2);

CREATE INDEX IF NOT EXISTS idx_members_current
  ON members(status, deleted_at);

