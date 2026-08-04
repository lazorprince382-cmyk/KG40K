-- Non-Tabula loan rejections are advisory only. Reopen loans that were
-- finally closed by someone other than Tabula Robert so the queue can continue.

UPDATE loans l
SET status = CASE
  WHEN EXISTS (
    SELECT 1 FROM loan_stage_votes v
    WHERE v.loan_id = l.id AND v.stage = 'executive'
  ) THEN 'executive-authorization'
  ELSE 'officer-review'
END
WHERE l.status = 'rejected'
  AND NOT EXISTS (
    SELECT 1
    FROM loan_stage_votes v
    JOIN users u ON u.id = v.user_id
    WHERE v.loan_id = l.id
      AND v.decision = 'reject'
      AND LOWER(u.full_name) LIKE '%tabula%robert%'
  );

UPDATE loan_workflow_events e
SET action = 'advisory-reject',
    comment = CASE
      WHEN comment IS NULL OR comment = '' THEN 'Advisory rejection recorded; loan continues.'
      WHEN comment LIKE 'Advisory rejection recorded%' THEN comment
      ELSE 'Advisory rejection recorded; loan continues. ' || comment
    END
FROM loans l, users u
WHERE e.loan_id = l.id
  AND e.actor_id = u.id
  AND e.action = 'reject'
  AND l.status IN ('officer-review','executive-authorization','correction','committee-review','pending','review')
  AND LOWER(u.full_name) NOT LIKE '%tabula%robert%';
