CREATE TABLE IF NOT EXISTS financial_reporting_periods (
  id BIGSERIAL PRIMARY KEY,
  fiscal_year INTEGER NOT NULL,
  period_end DATE NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft',
  currency TEXT NOT NULL DEFAULT 'UGX',
  source_name TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS financial_statement_lines (
  id BIGSERIAL PRIMARY KEY,
  period_id BIGINT NOT NULL REFERENCES financial_reporting_periods(id) ON DELETE CASCADE,
  statement_type TEXT NOT NULL,
  line_code TEXT NOT NULL,
  line_name TEXT NOT NULL,
  note_number TEXT,
  current_amount NUMERIC(20,2),
  prior_amount NUMERIC(20,2),
  variance NUMERIC(20,2),
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE(period_id,statement_type,line_code)
);

CREATE TABLE IF NOT EXISTS legacy_member_opening_balances (
  id BIGSERIAL PRIMARY KEY,
  period_id BIGINT NOT NULL REFERENCES financial_reporting_periods(id) ON DELETE CASCADE,
  source_row INTEGER NOT NULL,
  member_name TEXT NOT NULL,
  share_capital NUMERIC(20,2) NOT NULL DEFAULT 0,
  savings_balance NUMERIC(20,2) NOT NULL DEFAULT 0,
  expected_savings NUMERIC(20,2) NOT NULL DEFAULT 0,
  deficit_surplus NUMERIC(20,2) NOT NULL DEFAULT 0,
  proposed_dividend NUMERIC(20,2),
  linked_member_id BIGINT REFERENCES members(id),
  status TEXT NOT NULL DEFAULT 'pending_identity_verification',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(period_id,member_name)
);

CREATE TABLE IF NOT EXISTS historical_investment_ledger (
  id BIGSERIAL PRIMARY KEY,
  period_id BIGINT NOT NULL REFERENCES financial_reporting_periods(id) ON DELETE CASCADE,
  transaction_id TEXT NOT NULL,
  transaction_date DATE NOT NULL,
  account_name TEXT NOT NULL,
  account_code TEXT,
  entry_type TEXT NOT NULL CHECK(entry_type IN ('debit','credit')),
  amount NUMERIC(20,2) NOT NULL CHECK(amount > 0),
  source_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(period_id,transaction_id)
);

CREATE INDEX IF NOT EXISTS idx_financial_lines_period_type
  ON financial_statement_lines(period_id,statement_type,sort_order);
CREATE INDEX IF NOT EXISTS idx_legacy_member_balances_period
  ON legacy_member_opening_balances(period_id,member_name);
CREATE INDEX IF NOT EXISTS idx_historical_investment_period_date
  ON historical_investment_ledger(period_id,transaction_date);
