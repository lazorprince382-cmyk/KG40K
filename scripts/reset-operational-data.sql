\set ON_ERROR_STOP on

BEGIN;

-- Login accounts remain available, but no account retains a deleted member link.
UPDATE users SET member_id = NULL WHERE member_id IS NOT NULL;
UPDATE settings SET value = '0', updated_at = NOW() WHERE key = 'welfareFundBalance';

-- Clear every operational table while preserving system structure and access:
-- organizations, branches, departments, users, department assignments,
-- leadership assignments, settings, migrations, and configurable loan products.
DO $reset$
DECLARE
  reset_tables TEXT;
BEGIN
  SELECT string_agg(format('%I.%I', schemaname, tablename), ', ')
    INTO reset_tables
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename NOT IN (
      'organizations',
      'branches',
      'departments',
      'users',
      'department_assignments',
      'leadership_assignments',
      'settings',
      'schema_migrations',
      'loan_products',
      'members'
    );

  IF reset_tables IS NOT NULL THEN
    EXECUTE 'TRUNCATE TABLE ' || reset_tables || ' RESTART IDENTITY';
  END IF;
END
$reset$;

DELETE FROM members;
SELECT setval(pg_get_serial_sequence('members', 'id'), 1, false);

-- Keep one security event showing that an intentional reset occurred.
INSERT INTO audit_logs(action, entity_type, details)
VALUES ('SYSTEM_OPERATIONAL_RESET', 'system', 'Operational data reset; access structure preserved');

COMMIT;
