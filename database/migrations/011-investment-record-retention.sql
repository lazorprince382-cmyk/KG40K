ALTER TABLE investment_transactions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE investment_transactions ADD COLUMN IF NOT EXISTS deleted_by BIGINT REFERENCES users(id);
