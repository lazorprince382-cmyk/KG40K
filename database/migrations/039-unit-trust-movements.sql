-- Unit Trust (Old Mutual / UAP) daily & monthly movement ledger
CREATE TABLE IF NOT EXISTS unit_trust_movements (
  id BIGSERIAL PRIMARY KEY,
  movement_date DATE NOT NULL,
  description TEXT NOT NULL,
  deposit_amount NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (deposit_amount >= 0),
  interest_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  withdrawal_amount NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (withdrawal_amount >= 0),
  rate_percent NUMERIC(8,4),
  balance_after NUMERIC(18,2) NOT NULL,
  source_reference TEXT,
  finance_entry_id BIGINT REFERENCES organization_finance_entries(id),
  created_by BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_unit_trust_movements_unique
  ON unit_trust_movements (movement_date, description, COALESCE(source_reference, ''));

CREATE INDEX IF NOT EXISTS idx_unit_trust_movements_date ON unit_trust_movements(movement_date);

COMMENT ON TABLE unit_trust_movements IS 'Old Mutual / UAP umbrella unit trust daily interest, deposits and withdrawals';
