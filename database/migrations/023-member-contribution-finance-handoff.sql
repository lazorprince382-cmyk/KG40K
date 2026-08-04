ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS finance_entry_id BIGINT REFERENCES organization_finance_entries(id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_finance_entry
  ON transactions(finance_entry_id) WHERE finance_entry_id IS NOT NULL;
