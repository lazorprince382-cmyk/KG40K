-- General document library + multi-department visibility audiences
ALTER TABLE organization_documents
  ADD COLUMN IF NOT EXISTS audience_departments TEXT;

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
