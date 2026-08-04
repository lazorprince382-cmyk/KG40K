-- Provisional members preserve the normal member identity constraints while Legal
-- completes their biodata. Internal identity markers are unique and never shown.
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS provisional BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS legacy_opening_balance_id BIGINT REFERENCES legacy_member_opening_balances(id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_members_legacy_opening_balance
  ON members(legacy_opening_balance_id)
  WHERE legacy_opening_balance_id IS NOT NULL;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS login_email_is_provisional BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_members_provisional
  ON members(provisional,status)
  WHERE provisional=true;
