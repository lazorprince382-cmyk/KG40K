CREATE TABLE IF NOT EXISTS hosting_fee_payments (
  id BIGSERIAL PRIMARY KEY,
  member_id BIGINT NOT NULL REFERENCES members(id),
  amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
  paid_on DATE NOT NULL DEFAULT ((CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Kampala')::date),
  status TEXT NOT NULL DEFAULT 'completed',
  reference TEXT NOT NULL UNIQUE,
  receipt_number TEXT,
  finance_entry_id BIGINT REFERENCES organization_finance_entries(id) ON DELETE SET NULL,
  transaction_id BIGINT REFERENCES transactions(id) ON DELETE SET NULL,
  notes TEXT,
  recorded_by BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_hosting_fee_member_status ON hosting_fee_payments(member_id, status);
INSERT INTO settings (key, value) VALUES ('hostingFeeAmount', '50000')
  ON CONFLICT (key) DO NOTHING;
