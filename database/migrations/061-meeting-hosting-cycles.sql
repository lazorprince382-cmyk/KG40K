ALTER TABLE organization_meetings
  ADD COLUMN IF NOT EXISTS host_member_id BIGINT REFERENCES members(id),
  ADD COLUMN IF NOT EXISTS collect_hosting_fee BOOLEAN NOT NULL DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS hosting_fee_cycles (
  id BIGSERIAL PRIMARY KEY,
  meeting_id BIGINT REFERENCES organization_meetings(id) ON DELETE SET NULL,
  meeting_title TEXT,
  meeting_date DATE NOT NULL,
  expected_amount NUMERIC(18,2) NOT NULL DEFAULT 50000,
  status TEXT NOT NULL DEFAULT 'open',
  closed_at TIMESTAMPTZ,
  created_by BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_hosting_fee_cycles_status ON hosting_fee_cycles(status, meeting_date DESC);

ALTER TABLE hosting_fee_payments
  ADD COLUMN IF NOT EXISTS cycle_id BIGINT REFERENCES hosting_fee_cycles(id);

INSERT INTO hosting_fee_cycles (meeting_id, meeting_title, meeting_date, expected_amount, status, closed_at)
SELECT m.id, m.title, m.scheduled_at::date, COALESCE(NULLIF((SELECT value FROM settings WHERE key='hostingFeeAmount'),'')::numeric, 50000),
  'closed', NOW()
FROM organization_meetings m
WHERE m.scheduled_at::date = DATE '2026-10-30'
  AND NOT EXISTS (SELECT 1 FROM hosting_fee_cycles c WHERE c.meeting_date = DATE '2026-10-30')
ORDER BY m.id DESC
LIMIT 1;

INSERT INTO hosting_fee_cycles (meeting_title, meeting_date, expected_amount, status, closed_at)
SELECT 'Member meeting 30 October 2026', DATE '2026-10-30',
  COALESCE(NULLIF((SELECT value FROM settings WHERE key='hostingFeeAmount'),'')::numeric, 50000),
  'closed', NOW()
WHERE NOT EXISTS (SELECT 1 FROM hosting_fee_cycles);

UPDATE hosting_fee_payments p
SET cycle_id = (SELECT c.id FROM hosting_fee_cycles c ORDER BY c.meeting_date DESC, c.id DESC LIMIT 1)
WHERE p.cycle_id IS NULL;

UPDATE hosting_fee_cycles SET status='closed', closed_at=COALESCE(closed_at, NOW())
WHERE meeting_date <= DATE '2026-10-30' AND status='open';
