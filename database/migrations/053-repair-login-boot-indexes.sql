-- Repair indexes that may have been left INVALID when a prior deploy
-- cancelled CREATE INDEX mid-flight (statement_timeout / 502 crash).
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT c.relname AS index_name
    FROM pg_index i
    JOIN pg_class c ON c.oid = i.indexrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE NOT i.indisvalid
      AND n.nspname = 'public'
      AND c.relname IN (
        'idx_users_email_lower',
        'idx_members_email_lower',
        'idx_audit_login_failed_ip_time',
        'idx_department_assignments_user_active'
      )
  LOOP
    EXECUTE format('DROP INDEX IF EXISTS %I', r.index_name);
  END LOOP;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_members_email_lower ON members (LOWER(email));
-- Skip heavy audit_logs index here; login no longer depends on that scan.
CREATE INDEX IF NOT EXISTS idx_department_assignments_user_active
  ON department_assignments (user_id)
  WHERE active = true;
