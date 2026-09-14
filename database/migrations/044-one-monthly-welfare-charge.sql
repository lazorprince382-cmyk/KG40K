-- Monthly welfare is taken once in a calendar month. Keep the earliest charge and void later ones.
-- The extra amount goes back to savings. Dan stays capped at the pinned UGX 8,900,000. The bank receipt is not rewritten.

WITH extras AS (
  SELECT id, member_id, amount
  FROM (
    SELECT id, member_id, amount::numeric AS amount,
      ROW_NUMBER() OVER (
        PARTITION BY member_id, date_trunc('month', contribution_date)
        ORDER BY contribution_date, id
      ) AS n
    FROM welfare_contributions
    WHERE status IN ('verified','completed','recorded')
      AND amount > 0
      AND contribution_type NOT ILIKE '%standing%'
      AND COALESCE(reference,'') NOT LIKE 'WEL-STANDING-%'
      AND contribution_date IS NOT NULL
  ) ranked
  WHERE n > 1
),
credited AS (
  UPDATE members m
  SET savings_balance = CASE
    WHEN m.member_number = 'G40-2026-0015' THEN LEAST(8900000, m.savings_balance + extra.total)
    ELSE m.savings_balance + extra.total
  END
  FROM (SELECT member_id, SUM(amount) AS total FROM extras GROUP BY member_id) extra
  WHERE m.id = extra.member_id
  RETURNING m.id
),
funded AS (
  UPDATE settings
  SET value = GREATEST(0, COALESCE(NULLIF(value,''),'0')::numeric - COALESCE((SELECT SUM(amount) FROM extras), 0))::text,
      updated_at = NOW()
  WHERE key = 'welfareFundBalance'
  RETURNING key
)
UPDATE welfare_contributions c
SET status = 'voided',
    amount = 0,
    verification_comment = TRIM(BOTH FROM COALESCE(c.verification_comment,'') || ' | Voided: monthly welfare is taken only once in a month')
FROM extras
WHERE c.id = extras.id;

CREATE UNIQUE INDEX IF NOT EXISTS welfare_one_monthly_charge
  ON welfare_contributions (member_id, (date_trunc('month', contribution_date)::date))
  WHERE status IN ('verified','completed','recorded')
    AND amount > 0
    AND contribution_type = 'Monthly Welfare Contribution';
