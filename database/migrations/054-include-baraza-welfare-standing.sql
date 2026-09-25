-- Include Nakayiza Baraza Olivia on the welfare standing register (UGX 650,000 since June 2024).

DO $$
DECLARE
  member_row RECORD;
  actor_id BIGINT;
  standing_ref TEXT;
BEGIN
  SELECT id, member_number, full_name
    INTO member_row
  FROM members
  WHERE deleted_at IS NULL
    AND status = 'active'
    AND full_name ILIKE '%baraza%'
  ORDER BY id
  LIMIT 1;

  IF member_row.id IS NULL THEN
    RAISE NOTICE 'Baraza member not found — skipped welfare standing include';
    RETURN;
  END IF;

  SELECT id INTO actor_id
  FROM users
  WHERE active = true
    AND (
      email ILIKE 'nakayiza.baraza.olivia@gmail.com'
      OR id = (SELECT created_by FROM members WHERE id = member_row.id)
    )
  ORDER BY CASE WHEN email ILIKE 'nakayiza.baraza.olivia@gmail.com' THEN 0 ELSE 1 END, id
  LIMIT 1;

  IF actor_id IS NULL THEN
    SELECT id INTO actor_id FROM users WHERE active = true ORDER BY id LIMIT 1;
  END IF;

  IF actor_id IS NULL THEN
    RAISE NOTICE 'No active user to record Baraza welfare standing — skipped';
    RETURN;
  END IF;

  standing_ref := 'WEL-STANDING-' || member_row.member_number;

  DELETE FROM welfare_contributions
  WHERE member_id = member_row.id
    AND (
      reference = standing_ref
      OR reference LIKE 'WEL-STANDING-%'
      OR COALESCE(receipt_number, '') LIKE '%include-baraza-welfare-standing%'
    );

  INSERT INTO welfare_contributions
    (reference, member_id, contribution_type, period, expected_amount, amount, payment_method,
     receipt_number, status, contribution_date, recorded_by, verified_by, verified_at)
  VALUES
    (standing_ref, member_row.id, 'Standing welfare contribution', 'Since June 2024',
     650000, 650000, 'Opening balance',
     'include-baraza-welfare-standing:' || member_row.member_number,
     'verified', DATE '2024-06-01', actor_id, actor_id, NOW());

  RAISE NOTICE 'Added % (%) to welfare standing at UGX 650,000', member_row.full_name, member_row.member_number;
END $$;
