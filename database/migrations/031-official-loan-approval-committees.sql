-- Ensure official Credit Committee and Executive Committee members have
-- active Credits/Executive assignments for the loan approval queue.
-- Queue membership itself comes from governance_appointments (credit-committee / exco).

-- Credit Committee
UPDATE department_assignments da
SET active = true,
    can_view = true,
    can_edit = true,
    can_create = true,
    can_approve = true,
    is_head = CASE WHEN g.position_title = 'Chairperson' THEN true ELSE da.is_head END,
    authority_level = GREATEST(da.authority_level, CASE WHEN g.position_title = 'Chairperson' THEN 3 ELSE 2 END),
    position_title = 'Credit Committee: ' || g.position_title
FROM departments d,
     governance_appointments g,
     governance_bodies b,
     members m,
     users u
WHERE da.department_id = d.id
  AND d.code = 'credits'
  AND da.user_id = u.id
  AND u.member_id = m.id
  AND g.linked_member_id = m.id
  AND g.body_id = b.id
  AND b.code = 'credit-committee'
  AND g.status = 'active';

INSERT INTO department_assignments (user_id, department_id, position_title, authority_level, can_view, can_create, can_edit, can_approve, is_head, active)
SELECT u.id, d.id, 'Credit Committee: ' || g.position_title,
  CASE WHEN g.position_title = 'Chairperson' THEN 3 ELSE 2 END,
  true, true, true, true,
  CASE WHEN g.position_title = 'Chairperson' THEN true ELSE false END,
  true
FROM governance_appointments g
JOIN governance_bodies b ON b.id = g.body_id
JOIN members m ON m.id = g.linked_member_id
JOIN users u ON u.member_id = m.id
JOIN departments d ON d.code = 'credits'
WHERE b.code = 'credit-committee' AND g.status = 'active' AND u.active = true
  AND NOT EXISTS (
    SELECT 1 FROM department_assignments existing
    WHERE existing.user_id = u.id AND existing.department_id = d.id
  );

-- Executive Committee
UPDATE department_assignments da
SET active = true,
    can_view = true,
    can_edit = true,
    can_create = true,
    can_approve = true,
    is_head = CASE WHEN g.position_title = 'Chairperson' THEN true ELSE da.is_head END,
    authority_level = GREATEST(da.authority_level, 4),
    position_title = 'Executive Committee: ' || g.position_title
FROM departments d,
     governance_appointments g,
     governance_bodies b,
     members m,
     users u
WHERE da.department_id = d.id
  AND d.code = 'executive'
  AND da.user_id = u.id
  AND u.member_id = m.id
  AND g.linked_member_id = m.id
  AND g.body_id = b.id
  AND b.code = 'exco'
  AND g.status = 'active';

INSERT INTO department_assignments (user_id, department_id, position_title, authority_level, can_view, can_create, can_edit, can_approve, is_head, active)
SELECT u.id, d.id, 'Executive Committee: ' || g.position_title, 4,
  true, true, true, true,
  CASE WHEN g.position_title = 'Chairperson' THEN true ELSE false END,
  true
FROM governance_appointments g
JOIN governance_bodies b ON b.id = g.body_id
JOIN members m ON m.id = g.linked_member_id
JOIN users u ON u.member_id = m.id
JOIN departments d ON d.code = 'executive'
WHERE b.code = 'exco' AND g.status = 'active' AND u.active = true
  AND NOT EXISTS (
    SELECT 1 FROM department_assignments existing
    WHERE existing.user_id = u.id AND existing.department_id = d.id
  );
