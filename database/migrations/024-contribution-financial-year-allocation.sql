ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS target_fiscal_year INTEGER;

ALTER TABLE transactions
  ADD CONSTRAINT transactions_target_fiscal_year_valid
  CHECK (target_fiscal_year IS NULL OR target_fiscal_year BETWEEN 2000 AND 2200);

CREATE INDEX IF NOT EXISTS idx_transactions_member_target_fy
  ON transactions(member_id,target_fiscal_year,type,status);