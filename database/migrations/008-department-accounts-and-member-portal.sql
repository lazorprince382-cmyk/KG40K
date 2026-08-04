-- Department-only accounts, personal profile photos, and Legal membership records.
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo_stored_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo_original_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo_mime_type TEXT;

ALTER TABLE member_bio_data ADD COLUMN IF NOT EXISTS passport_photo_stored_name TEXT;
ALTER TABLE member_bio_data ADD COLUMN IF NOT EXISTS passport_photo_original_name TEXT;
ALTER TABLE member_bio_data ADD COLUMN IF NOT EXISTS passport_photo_mime_type TEXT;

CREATE TABLE IF NOT EXISTS member_support_requests (
  id BIGSERIAL PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  member_id BIGINT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted',
  response TEXT,
  assigned_department_id BIGINT REFERENCES departments(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_member_support_member ON member_support_requests(member_id,created_at DESC);

-- Preserve every account while removing obsolete authorization roles.
UPDATE users SET role=CASE
  WHEN role IN ('Chairperson','Vice Chairperson','Secretary','Manager') THEN 'Executive Officer'
  WHEN role IN ('Treasurer','Accountant','Cashier') THEN 'Finance Officer'
  WHEN role IN ('Loans Officer','Credit Committee') THEN 'Credits Officer'
  WHEN role='Membership Officer' THEN 'Legal Officer'
  ELSE role
END
WHERE role IN ('Chairperson','Vice Chairperson','Secretary','Manager','Treasurer','Accountant','Cashier',
               'Loans Officer','Credit Committee','Membership Officer');

-- Move the workflow vocabulary to departmental responsibility.
UPDATE loans SET status='finance-verification' WHERE status='accountant-verification';
UPDATE loans SET status='executive-authorization' WHERE status IN ('manager-authorization','committee-approved');
UPDATE loan_workflow_events SET stage='finance-verification' WHERE stage='accountant-verification';
UPDATE loan_workflow_events SET stage='executive-authorization' WHERE stage='manager-authorization';

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loans' AND column_name='manager_comment')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loans' AND column_name='executive_comment') THEN
    ALTER TABLE loans RENAME COLUMN manager_comment TO executive_comment;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loans' AND column_name='accountant_verified_by')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loans' AND column_name='finance_verified_by') THEN
    ALTER TABLE loans RENAME COLUMN accountant_verified_by TO finance_verified_by;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loans' AND column_name='accountant_comment')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loans' AND column_name='finance_comment') THEN
    ALTER TABLE loans RENAME COLUMN accountant_comment TO finance_comment;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loans' AND column_name='accountant_verified_at')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='loans' AND column_name='finance_verified_at') THEN
    ALTER TABLE loans RENAME COLUMN accountant_verified_at TO finance_verified_at;
  END IF;
END $$;
