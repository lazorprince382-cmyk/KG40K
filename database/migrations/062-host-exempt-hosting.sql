ALTER TABLE hosting_fee_cycles
  ADD COLUMN IF NOT EXISTS host_member_id BIGINT REFERENCES members(id);
