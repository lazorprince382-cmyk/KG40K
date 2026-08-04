-- Retain assignment history but deactivate operational access inherited from obsolete roles.
-- Audit assignments remain intact because Audit requires read-only review across departments.
UPDATE department_assignments da
SET active=false
FROM users u,departments d
WHERE da.user_id=u.id AND da.department_id=d.id AND da.active=true
AND (
  (u.role='Executive Officer' AND d.code<>'executive') OR
  (u.role='Finance Officer' AND d.code<>'finance') OR
  (u.role='Credits Officer' AND d.code<>'credits') OR
  (u.role='Investment Officer' AND d.code<>'investment') OR
  (u.role='Welfare Officer' AND d.code<>'welfare') OR
  (u.role='Legal Officer' AND d.code<>'legal') OR
  u.role IN ('Member','System Admin')
);

-- Earlier Membership Officer accounts become standard Legal records officers.
INSERT INTO department_assignments
  (user_id,department_id,position_title,authority_level,can_view,can_create,can_edit,can_approve,is_head)
SELECT u.id,d.id,'Membership & Records Officer',2,true,true,true,false,false
FROM users u CROSS JOIN departments d
WHERE u.role='Legal Officer' AND d.code='legal'
AND NOT EXISTS (
  SELECT 1 FROM department_assignments current
  WHERE current.user_id=u.id AND current.department_id=d.id AND current.active=true
)
ON CONFLICT (user_id,department_id) DO UPDATE SET
  active=true,position_title='Membership & Records Officer',authority_level=2,
  can_view=true,can_create=true,can_edit=true,can_approve=false,is_head=false;
