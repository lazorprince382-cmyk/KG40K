ALTER TABLE organization_meetings
  ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ;

UPDATE organization_meetings
SET scheduled_at = TIMESTAMPTZ '2026-10-30 21:00:00+03',
    ended_at = TIMESTAMPTZ '2026-10-31 00:00:00+03'
WHERE reference = 'MTG-20261030-BANUMBA'
   OR (scheduled_at::date = DATE '2026-10-30'
       AND (venue ILIKE '%banumba%' OR title ILIKE '%banumba%' OR title ILIKE '%francis%'));
