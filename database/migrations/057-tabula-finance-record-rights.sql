-- Tabula Robert (Finance Committee chairperson) records UAP monthly interest and UAP transfers.
UPDATE department_assignments da
SET can_view = true, can_create = true, can_edit = true, active = true
FROM users u, departments d
WHERE u.id = da.user_id AND d.id = da.department_id
  AND d.code = 'finance'
  AND u.full_name ILIKE '%tabula%robert%';
