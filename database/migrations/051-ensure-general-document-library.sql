-- Ensure General document library shelf stays active for Legal uploads
UPDATE departments
SET active=true,
    name='General',
    description='Organization-wide documents used across almost every department.',
    sort_order=0
WHERE code='general';

INSERT INTO departments (organization_id, code, name, description, sort_order, active)
SELECT o.id,
  'general',
  'General',
  'Organization-wide documents used across almost every department.',
  0,
  true
FROM organizations o
WHERE NOT EXISTS (SELECT 1 FROM departments d WHERE d.code = 'general')
LIMIT 1;
