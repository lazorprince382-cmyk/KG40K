ALTER TABLE finance_accounts
  ADD COLUMN IF NOT EXISTS created_by BIGINT REFERENCES users(id);

ALTER TABLE finance_accounts
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE organization_finance_entries
  ADD COLUMN IF NOT EXISTS finance_account_id BIGINT REFERENCES finance_accounts(id);

CREATE INDEX IF NOT EXISTS idx_finance_entries_account
  ON organization_finance_entries(finance_account_id, transaction_date DESC);
