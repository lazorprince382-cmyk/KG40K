ALTER TABLE finance_accounts
  ADD COLUMN IF NOT EXISTS opening_balance NUMERIC(18,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS opening_balance_date DATE,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS supporting_document TEXT,
  ADD COLUMN IF NOT EXISTS supporting_document_name TEXT;

UPDATE finance_accounts
SET opening_balance = balance,
    opening_balance_date = COALESCE(opening_balance_date, created_at::date)
WHERE opening_balance_date IS NULL;
