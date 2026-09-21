-- Speed up login / boot lookups
CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_members_email_lower ON members (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_audit_login_failed_ip_time
  ON audit_logs (ip_address, created_at DESC)
  WHERE action = 'LOGIN_FAILED';
CREATE INDEX IF NOT EXISTS idx_department_assignments_user_active
  ON department_assignments (user_id)
  WHERE active = true;
