CREATE TABLE IF NOT EXISTS branches (
  id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, code TEXT NOT NULL UNIQUE,
  address TEXT, active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS members (
  id BIGSERIAL PRIMARY KEY, member_number TEXT NOT NULL UNIQUE, full_name TEXT NOT NULL,
  email TEXT, phone TEXT NOT NULL, national_id TEXT NOT NULL UNIQUE, occupation TEXT,
  employer TEXT, address TEXT, next_of_kin TEXT, beneficiaries TEXT,
  branch_id BIGINT REFERENCES branches(id), savings_balance NUMERIC(18,2) NOT NULL DEFAULT 0,
  share_capital NUMERIC(18,2) NOT NULL DEFAULT 0, dividends NUMERIC(18,2) NOT NULL DEFAULT 0,
  fines NUMERIC(18,2) NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'active',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), created_by BIGINT
);
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY, full_name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
  phone TEXT, password_hash TEXT NOT NULL, role TEXT NOT NULL, branch_id BIGINT REFERENCES branches(id),
  member_id BIGINT REFERENCES members(id), active BOOLEAN NOT NULL DEFAULT TRUE,
  must_change_password BOOLEAN NOT NULL DEFAULT TRUE, failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ, last_login TIMESTAMPTZ, created_by BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_created_by_fkey;
ALTER TABLE members ADD CONSTRAINT members_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id);
CREATE TABLE IF NOT EXISTS transactions (
  id BIGSERIAL PRIMARY KEY, reference TEXT NOT NULL UNIQUE, member_id BIGINT NOT NULL REFERENCES members(id),
  type TEXT NOT NULL, method TEXT NOT NULL, amount NUMERIC(18,2) NOT NULL, status TEXT NOT NULL DEFAULT 'pending',
  external_reference TEXT, notes TEXT, recorded_by BIGINT NOT NULL REFERENCES users(id),
  verified_by BIGINT REFERENCES users(id), approved_by BIGINT REFERENCES users(id),
  reversal_of BIGINT REFERENCES transactions(id), reversal_reason TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_at TIMESTAMPTZ, approved_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS loan_products (
  id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL UNIQUE, annual_rate NUMERIC(8,3) NOT NULL,
  max_term INTEGER NOT NULL, max_multiplier NUMERIC(8,2) NOT NULL DEFAULT 3, active BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE IF NOT EXISTS loans (
  id BIGSERIAL PRIMARY KEY, reference TEXT NOT NULL UNIQUE, member_id BIGINT NOT NULL REFERENCES members(id),
  product_id BIGINT NOT NULL REFERENCES loan_products(id), amount NUMERIC(18,2) NOT NULL,
  balance NUMERIC(18,2) NOT NULL, term_months INTEGER NOT NULL, purpose TEXT NOT NULL,
  guarantor_member_id BIGINT REFERENCES members(id), status TEXT NOT NULL DEFAULT 'pending',
  officer_comment TEXT, committee_comment TEXT, manager_comment TEXT,
  recommended_by BIGINT REFERENCES users(id), committee_approved_by BIGINT REFERENCES users(id),
  authorized_by BIGINT REFERENCES users(id), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), due_date DATE
);
ALTER TABLE loans ADD COLUMN IF NOT EXISTS savings_at_application NUMERIC(18,2);
ALTER TABLE loans ADD COLUMN IF NOT EXISTS existing_loan_balance NUMERIC(18,2) NOT NULL DEFAULT 0;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS eligibility_result TEXT;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS verified_amount NUMERIC(18,2);
ALTER TABLE loans ADD COLUMN IF NOT EXISTS accountant_verified_by BIGINT REFERENCES users(id);
ALTER TABLE loans ADD COLUMN IF NOT EXISTS accountant_comment TEXT;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS accountant_verified_at TIMESTAMPTZ;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS authorized_at TIMESTAMPTZ;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS disbursed_at TIMESTAMPTZ;
CREATE TABLE IF NOT EXISTS loan_guarantors (
  id BIGSERIAL PRIMARY KEY,
  loan_id BIGINT NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  member_id BIGINT NOT NULL REFERENCES members(id),
  status TEXT NOT NULL DEFAULT 'pending',
  response_note TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (loan_id, member_id)
);
CREATE TABLE IF NOT EXISTS loan_workflow_events (
  id BIGSERIAL PRIMARY KEY,
  loan_id BIGINT NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  action TEXT NOT NULL,
  actor_id BIGINT REFERENCES users(id),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS loan_disbursements (
  id BIGSERIAL PRIMARY KEY,
  loan_id BIGINT NOT NULL UNIQUE REFERENCES loans(id),
  amount NUMERIC(18,2) NOT NULL,
  method TEXT NOT NULL,
  destination TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'prepared',
  prepared_by BIGINT REFERENCES users(id),
  authorized_by BIGINT REFERENCES users(id),
  disbursed_by BIGINT REFERENCES users(id),
  transaction_reference TEXT UNIQUE,
  prepared_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  authorized_at TIMESTAMPTZ,
  disbursed_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS loan_repayment_schedule (
  id BIGSERIAL PRIMARY KEY,
  loan_id BIGINT NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  due_date DATE NOT NULL,
  opening_balance NUMERIC(18,2) NOT NULL,
  principal NUMERIC(18,2) NOT NULL,
  interest NUMERIC(18,2) NOT NULL,
  total_due NUMERIC(18,2) NOT NULL,
  paid_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'upcoming',
  paid_at TIMESTAMPTZ,
  UNIQUE (loan_id, installment_number)
);
ALTER TABLE loan_repayment_schedule ADD COLUMN IF NOT EXISTS principal_paid NUMERIC(18,2) NOT NULL DEFAULT 0;
ALTER TABLE loan_repayment_schedule ADD COLUMN IF NOT EXISTS interest_paid NUMERIC(18,2) NOT NULL DEFAULT 0;
UPDATE loan_repayment_schedule
SET interest_paid=LEAST(paid_amount,interest),
    principal_paid=LEAST(principal,GREATEST(0,paid_amount-interest))
WHERE paid_amount>0 AND principal_paid=0 AND interest_paid=0;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS loan_id BIGINT REFERENCES loans(id);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS receipt_number TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_receipt_number
  ON transactions(receipt_number) WHERE receipt_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_loan ON transactions(loan_id);
CREATE TABLE IF NOT EXISTS loan_charges (
  id BIGSERIAL PRIMARY KEY,
  loan_id BIGINT NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  charge_type TEXT NOT NULL,
  amount NUMERIC(18,2) NOT NULL CHECK (amount >= 0),
  status TEXT NOT NULL DEFAULT 'outstanding',
  reason TEXT,
  assessed_by BIGINT REFERENCES users(id),
  waived_by BIGINT REFERENCES users(id),
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  settled_at TIMESTAMPTZ,
  waived_at TIMESTAMPTZ
);
ALTER TABLE loan_charges ADD COLUMN IF NOT EXISTS paid_amount NUMERIC(18,2) NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_loan_charges_loan_status ON loan_charges(loan_id,status);
CREATE TABLE IF NOT EXISTS loan_recovery_actions (
  id BIGSERIAL PRIMARY KEY,
  loan_id BIGINT NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  notes TEXT NOT NULL,
  recovery_status TEXT NOT NULL DEFAULT 'open',
  follow_up_date DATE,
  assigned_to BIGINT REFERENCES users(id),
  created_by BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_loan_recovery_actions_loan ON loan_recovery_actions(loan_id,created_at);
CREATE TABLE IF NOT EXISTS withdrawals (
  id BIGSERIAL PRIMARY KEY, reference TEXT NOT NULL UNIQUE, member_id BIGINT NOT NULL REFERENCES members(id),
  amount NUMERIC(18,2) NOT NULL, method TEXT NOT NULL, reason TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending',
  requested_by BIGINT NOT NULL REFERENCES users(id), approved_by BIGINT REFERENCES users(id),
  processed_by BIGINT REFERENCES users(id), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), approved_at TIMESTAMPTZ
);
ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;
ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS transaction_id BIGINT REFERENCES transactions(id);
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY, user_id BIGINT REFERENCES users(id), action TEXT NOT NULL,
  entity_type TEXT, entity_id TEXT, details TEXT, ip_address TEXT, user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY, user_id BIGINT REFERENCES users(id), member_id BIGINT REFERENCES members(id),
  title TEXT NOT NULL, message TEXT NOT NULL, read_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS announcements (
  id BIGSERIAL PRIMARY KEY, title TEXT NOT NULL, body TEXT NOT NULL,
  created_by BIGINT NOT NULL REFERENCES users(id), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_by BIGINT REFERENCES users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS conversations (
  id BIGSERIAL PRIMARY KEY,
  user_low BIGINT NOT NULL REFERENCES users(id),
  user_high BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT conversations_distinct_users CHECK (user_low <> user_high),
  CONSTRAINT conversations_direct_unique UNIQUE (user_low, user_high)
);
ALTER TABLE conversations ALTER COLUMN user_low DROP NOT NULL;
ALTER TABLE conversations ALTER COLUMN user_high DROP NOT NULL;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'direct';
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS created_by BIGINT REFERENCES users(id);
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS only_admins_can_post BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS avatar_color TEXT NOT NULL DEFAULT '#1d6449';
CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT NOT NULL REFERENCES conversations(id),
  sender_id BIGINT NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  reply_to_id BIGINT REFERENCES messages(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  CONSTRAINT messages_body_length CHECK (char_length(body) BETWEEN 1 AND 2000)
);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMPTZ;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS pinned_by BIGINT REFERENCES users(id);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS forwarded_from_id BIGINT REFERENCES messages(id);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
CREATE TABLE IF NOT EXISTS conversation_members (
  conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id),
  member_role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  muted_until TIMESTAMPTZ,
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  last_read_at TIMESTAMPTZ,
  PRIMARY KEY (conversation_id, user_id)
);
CREATE TABLE IF NOT EXISTS message_reads (
  message_id BIGINT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id),
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (message_id, user_id)
);
CREATE TABLE IF NOT EXISTS message_reactions (
  message_id BIGINT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id),
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (message_id, user_id, emoji)
);
CREATE TABLE IF NOT EXISTS message_stars (
  message_id BIGINT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (message_id, user_id)
);
CREATE TABLE IF NOT EXISTS message_attachments (
  id BIGSERIAL PRIMARY KEY,
  message_id BIGINT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  original_name TEXT NOT NULL,
  stored_name TEXT NOT NULL UNIQUE,
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  uploaded_by BIGINT NOT NULL REFERENCES users(id),
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS message_mentions (
  message_id BIGINT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  mentioned_user_id BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (message_id, mentioned_user_id)
);
INSERT INTO conversation_members (conversation_id,user_id,member_role)
SELECT id,user_low,'member' FROM conversations WHERE type='direct' AND user_low IS NOT NULL
ON CONFLICT DO NOTHING;
INSERT INTO conversation_members (conversation_id,user_id,member_role)
SELECT id,user_high,'member' FROM conversations WHERE type='direct' AND user_high IS NOT NULL
ON CONFLICT DO NOTHING;
INSERT INTO message_reads (message_id,user_id,read_at)
SELECT msg.id,cm.user_id,msg.read_at FROM messages msg
JOIN conversation_members cm ON cm.conversation_id=msg.conversation_id AND cm.user_id<>msg.sender_id
WHERE msg.read_at IS NOT NULL
ON CONFLICT DO NOTHING;
CREATE INDEX IF NOT EXISTS idx_transactions_member ON transactions(member_id);
CREATE INDEX IF NOT EXISTS idx_loans_member ON loans(member_id);
CREATE INDEX IF NOT EXISTS idx_loan_guarantors_member ON loan_guarantors(member_id,status);
CREATE INDEX IF NOT EXISTS idx_loan_events_loan ON loan_workflow_events(loan_id,created_at);
CREATE INDEX IF NOT EXISTS idx_repayment_schedule_due ON loan_repayment_schedule(loan_id,due_date);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_recent ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(conversation_id, read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_conversation_members_user ON conversation_members(user_id, conversation_id);
CREATE INDEX IF NOT EXISTS idx_message_reads_user ON message_reads(user_id, message_id);
CREATE INDEX IF NOT EXISTS idx_message_attachments_message ON message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_message_stars_user ON message_stars(user_id, message_id);
CREATE INDEX IF NOT EXISTS idx_messages_search ON messages USING GIN (to_tsvector('english', body));

-- Central organization structure. Credits remains financially isolated from
-- general organization finance while verified member identity is shared.
CREATE TABLE IF NOT EXISTS organizations (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS departments (
  id BIGSERIAL PRIMARY KEY,
  organization_id BIGINT NOT NULL REFERENCES organizations(id),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS department_assignments (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  department_id BIGINT NOT NULL REFERENCES departments(id),
  position_title TEXT NOT NULL,
  authority_level INTEGER NOT NULL DEFAULT 1 CHECK (authority_level BETWEEN 1 AND 5),
  can_view BOOLEAN NOT NULL DEFAULT TRUE,
  can_create BOOLEAN NOT NULL DEFAULT FALSE,
  can_edit BOOLEAN NOT NULL DEFAULT FALSE,
  can_approve BOOLEAN NOT NULL DEFAULT FALSE,
  is_head BOOLEAN NOT NULL DEFAULT FALSE,
  assigned_by BIGINT REFERENCES users(id),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, department_id)
);
CREATE TABLE IF NOT EXISTS member_department_profiles (
  id BIGSERIAL PRIMARY KEY,
  member_id BIGINT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  department_id BIGINT NOT NULL REFERENCES departments(id),
  position_title TEXT NOT NULL DEFAULT 'Member',
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (member_id, department_id)
);
CREATE TABLE IF NOT EXISTS leadership_assignments (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  position_title TEXT NOT NULL,
  leadership_level INTEGER NOT NULL CHECK (leadership_level BETWEEN 1 AND 5),
  starts_on DATE NOT NULL DEFAULT CURRENT_DATE,
  ends_on DATE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (user_id, body, position_title)
);
CREATE TABLE IF NOT EXISTS department_activities (
  id BIGSERIAL PRIMARY KEY,
  department_id BIGINT NOT NULL REFERENCES departments(id),
  reference TEXT NOT NULL UNIQUE,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(18,2),
  status TEXT NOT NULL DEFAULT 'draft',
  visibility_level INTEGER NOT NULL DEFAULT 1 CHECK (visibility_level BETWEEN 1 AND 5),
  created_by BIGINT NOT NULL REFERENCES users(id),
  assigned_to BIGINT REFERENCES users(id),
  approved_by BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS organization_finance_entries (
  id BIGSERIAL PRIMARY KEY,
  department_id BIGINT NOT NULL REFERENCES departments(id),
  reference TEXT NOT NULL UNIQUE,
  entry_type TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'pending',
  recorded_by BIGINT NOT NULL REFERENCES users(id),
  approved_by BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ
);
ALTER TABLE organization_finance_entries ADD COLUMN IF NOT EXISTS counterparty TEXT;
ALTER TABLE organization_finance_entries ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE organization_finance_entries ADD COLUMN IF NOT EXISTS transaction_date DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE organization_finance_entries ADD COLUMN IF NOT EXISTS receipt_number TEXT;
ALTER TABLE organization_finance_entries ADD COLUMN IF NOT EXISTS voucher_number TEXT;
ALTER TABLE organization_finance_entries ADD COLUMN IF NOT EXISTS budget_line TEXT;
ALTER TABLE organization_finance_entries ADD COLUMN IF NOT EXISTS supporting_document TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_org_finance_receipt ON organization_finance_entries(receipt_number) WHERE receipt_number IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_org_finance_voucher ON organization_finance_entries(voucher_number) WHERE voucher_number IS NOT NULL;
CREATE TABLE IF NOT EXISTS finance_accounts (
  id BIGSERIAL PRIMARY KEY,
  account_code TEXT NOT NULL UNIQUE,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL,
  bank_name TEXT,
  account_number TEXT,
  balance NUMERIC(18,2) NOT NULL DEFAULT 0,
  restricted BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  last_reconciled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS finance_budgets (
  id BIGSERIAL PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  department_id BIGINT NOT NULL REFERENCES departments(id),
  fiscal_period TEXT NOT NULL,
  allocated_amount NUMERIC(18,2) NOT NULL CHECK (allocated_amount >= 0),
  used_amount NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (used_amount >= 0),
  status TEXT NOT NULL DEFAULT 'approved',
  created_by BIGINT NOT NULL REFERENCES users(id),
  approved_by BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (department_id,fiscal_period)
);
CREATE TABLE IF NOT EXISTS finance_payment_vouchers (
  id BIGSERIAL PRIMARY KEY,
  voucher_number TEXT NOT NULL UNIQUE,
  department_id BIGINT NOT NULL REFERENCES departments(id),
  supplier TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  budget_line TEXT NOT NULL,
  amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
  payment_method TEXT,
  status TEXT NOT NULL DEFAULT 'finance_review',
  supporting_document TEXT,
  requested_by BIGINT NOT NULL REFERENCES users(id),
  finance_reviewed_by BIGINT REFERENCES users(id),
  executive_approved_by BIGINT REFERENCES users(id),
  processed_by BIGINT REFERENCES users(id),
  finance_comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finance_reviewed_at TIMESTAMPTZ,
  executive_approved_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ
);
ALTER TABLE finance_payment_vouchers ADD COLUMN IF NOT EXISTS executive_activity_id BIGINT REFERENCES department_activities(id);
CREATE TABLE IF NOT EXISTS finance_invoices (
  id BIGSERIAL PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  supplier TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'unpaid',
  voucher_id BIGINT REFERENCES finance_payment_vouchers(id),
  supporting_document TEXT,
  created_by BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS finance_assets (
  id BIGSERIAL PRIMARY KEY,
  asset_code TEXT NOT NULL UNIQUE,
  asset_name TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  purchase_date DATE NOT NULL,
  purchase_value NUMERIC(18,2) NOT NULL,
  current_value NUMERIC(18,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  department_id BIGINT REFERENCES departments(id),
  location TEXT,
  custodian TEXT,
  created_by BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS finance_procurements (
  id BIGSERIAL PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  department_id BIGINT NOT NULL REFERENCES departments(id),
  item_description TEXT NOT NULL,
  supplier TEXT,
  estimated_amount NUMERIC(18,2) NOT NULL,
  approved_amount NUMERIC(18,2),
  stage TEXT NOT NULL DEFAULT 'department_request',
  status TEXT NOT NULL DEFAULT 'open',
  requested_by BIGINT NOT NULL REFERENCES users(id),
  finance_reviewed_by BIGINT REFERENCES users(id),
  executive_approved_by BIGINT REFERENCES users(id),
  purchase_order_number TEXT,
  goods_received_at TIMESTAMPTZ,
  invoice_id BIGINT REFERENCES finance_invoices(id),
  voucher_id BIGINT REFERENCES finance_payment_vouchers(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS welfare_requests (
  id BIGSERIAL PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  member_id BIGINT NOT NULL REFERENCES members(id),
  request_type TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'submitted',
  submitted_by BIGINT NOT NULL REFERENCES users(id),
  reviewed_by BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);
ALTER TABLE welfare_requests ADD COLUMN IF NOT EXISTS urgency TEXT NOT NULL DEFAULT 'medium';
ALTER TABLE welfare_requests ADD COLUMN IF NOT EXISTS supporting_document TEXT;
ALTER TABLE welfare_requests ADD COLUMN IF NOT EXISTS documents_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE welfare_requests ADD COLUMN IF NOT EXISTS previous_support NUMERIC(18,2) NOT NULL DEFAULT 0;
ALTER TABLE welfare_requests ADD COLUMN IF NOT EXISTS officer_recommendation TEXT;
ALTER TABLE welfare_requests ADD COLUMN IF NOT EXISTS assigned_to BIGINT REFERENCES users(id);
ALTER TABLE welfare_requests ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'not_ready';
ALTER TABLE welfare_requests ADD COLUMN IF NOT EXISTS executive_activity_id BIGINT REFERENCES department_activities(id);
ALTER TABLE welfare_requests ADD COLUMN IF NOT EXISTS finance_voucher_id BIGINT REFERENCES finance_payment_vouchers(id);
ALTER TABLE welfare_requests ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;
CREATE TABLE IF NOT EXISTS welfare_contributions (
  id BIGSERIAL PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  member_id BIGINT NOT NULL REFERENCES members(id),
  contribution_type TEXT NOT NULL,
  period TEXT,
  expected_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  amount NUMERIC(18,2) NOT NULL CHECK (amount >= 0),
  payment_method TEXT NOT NULL,
  receipt_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'recorded',
  contribution_date DATE NOT NULL DEFAULT CURRENT_DATE,
  recorded_by BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_welfare_contributions_member_date ON welfare_contributions(member_id,contribution_date);
CREATE TABLE IF NOT EXISTS welfare_payments (
  id BIGSERIAL PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  request_id BIGINT NOT NULL REFERENCES welfare_requests(id),
  beneficiary_name TEXT NOT NULL,
  amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL,
  voucher_number TEXT,
  receipt_number TEXT,
  status TEXT NOT NULL DEFAULT 'pending_finance',
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  recorded_by BIGINT NOT NULL REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS welfare_activities (
  id BIGSERIAL PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  activity_date TIMESTAMPTZ NOT NULL,
  budget NUMERIC(18,2) NOT NULL DEFAULT 0,
  responsible_officer TEXT,
  participants TEXT,
  outcome TEXT,
  status TEXT NOT NULL DEFAULT 'planned',
  report_reference TEXT,
  created_by BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS welfare_committee_meetings (
  id BIGSERIAL PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  agenda TEXT NOT NULL,
  venue TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  chairperson TEXT,
  participants TEXT,
  decisions TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_by BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS investment_projects (
  id BIGSERIAL PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  target_amount NUMERIC(18,2) NOT NULL,
  raised_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'planning',
  starts_on DATE,
  ends_on DATE,
  created_by BIGINT NOT NULL REFERENCES users(id),
  approved_by BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE investment_projects ADD COLUMN IF NOT EXISTS current_value NUMERIC(18,2) NOT NULL DEFAULT 0;
ALTER TABLE investment_projects ADD COLUMN IF NOT EXISTS expected_return NUMERIC(18,2) NOT NULL DEFAULT 0;
ALTER TABLE investment_projects ADD COLUMN IF NOT EXISTS performance_status TEXT NOT NULL DEFAULT 'on_track';
ALTER TABLE investment_projects ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE investment_projects ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE investment_projects ADD COLUMN IF NOT EXISTS manager_name TEXT;
ALTER TABLE investment_projects ADD COLUMN IF NOT EXISTS responsible_department TEXT;
ALTER TABLE investment_projects ADD COLUMN IF NOT EXISTS funding_source TEXT;
ALTER TABLE investment_projects ADD COLUMN IF NOT EXISTS progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100);
ALTER TABLE investment_projects ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE investment_projects ADD COLUMN IF NOT EXISTS supporting_document TEXT;
CREATE TABLE IF NOT EXISTS investment_proposals (
  id BIGSERIAL PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  estimated_cost NUMERIC(18,2) NOT NULL CHECK (estimated_cost > 0),
  expected_revenue NUMERIC(18,2) NOT NULL DEFAULT 0,
  expected_roi NUMERIC(8,2) NOT NULL DEFAULT 0,
  risk_assessment TEXT NOT NULL,
  recommendation TEXT,
  supporting_document TEXT,
  status TEXT NOT NULL DEFAULT 'investment_review',
  executive_activity_id BIGINT REFERENCES department_activities(id),
  created_by BIGINT NOT NULL REFERENCES users(id),
  reviewed_by BIGINT REFERENCES users(id),
  approved_by BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS investment_transactions (
  id BIGSERIAL PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  project_id BIGINT NOT NULL REFERENCES investment_projects(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('revenue','expense')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  supporting_document TEXT,
  recorded_by BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_investment_transactions_project_date ON investment_transactions(project_id,transaction_date);
CREATE TABLE IF NOT EXISTS investment_investors (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES investment_projects(id),
  member_id BIGINT REFERENCES members(id),
  investor_name TEXT NOT NULL,
  funding_source TEXT NOT NULL DEFAULT 'Member investment',
  amount_invested NUMERIC(18,2) NOT NULL CHECK (amount_invested > 0),
  ownership_percentage NUMERIC(8,3) NOT NULL DEFAULT 0,
  expected_returns NUMERIC(18,2) NOT NULL DEFAULT 0,
  payments_received NUMERIC(18,2) NOT NULL DEFAULT 0,
  investment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active',
  created_by BIGINT NOT NULL REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS investment_contracts (
  id BIGSERIAL PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  project_id BIGINT REFERENCES investment_projects(id),
  contract_type TEXT NOT NULL,
  counterparty TEXT NOT NULL,
  title TEXT NOT NULL,
  contract_value NUMERIC(18,2) NOT NULL DEFAULT 0,
  starts_on DATE,
  ends_on DATE,
  status TEXT NOT NULL DEFAULT 'active',
  document_reference TEXT,
  created_by BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS investment_assets (
  id BIGSERIAL PRIMARY KEY,
  asset_code TEXT NOT NULL UNIQUE,
  project_id BIGINT REFERENCES investment_projects(id),
  asset_name TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  acquisition_value NUMERIC(18,2) NOT NULL CHECK (acquisition_value >= 0),
  current_value NUMERIC(18,2) NOT NULL DEFAULT 0,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_by BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS organization_meetings (
  id BIGSERIAL PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  department_id BIGINT REFERENCES departments(id),
  title TEXT NOT NULL,
  meeting_type TEXT NOT NULL,
  agenda TEXT,
  venue TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  visibility_level INTEGER NOT NULL DEFAULT 1,
  created_by BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS governance_records (
  id BIGSERIAL PRIMARY KEY,
  department_id BIGINT NOT NULL REFERENCES departments(id),
  reference TEXT NOT NULL UNIQUE,
  record_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  visibility_level INTEGER NOT NULL DEFAULT 3,
  created_by BIGINT NOT NULL REFERENCES users(id),
  assigned_to BIGINT REFERENCES users(id),
  resolved_by BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);
ALTER TABLE department_activities ADD COLUMN IF NOT EXISTS decision_comment TEXT;
CREATE TABLE IF NOT EXISTS organization_documents (
  id BIGSERIAL PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  department_id BIGINT REFERENCES departments(id),
  document_type TEXT NOT NULL,
  title TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0',
  status TEXT NOT NULL DEFAULT 'published',
  visibility_level INTEGER NOT NULL DEFAULT 2,
  file_name TEXT,
  created_by BIGINT NOT NULL REFERENCES users(id),
  approved_by BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS legal_cases (
  id BIGSERIAL PRIMARY KEY,
  case_number TEXT NOT NULL UNIQUE,
  case_category TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  member_id BIGINT REFERENCES members(id),
  department_id BIGINT REFERENCES departments(id),
  description TEXT NOT NULL,
  evidence TEXT,
  assigned_officer TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  risk_level TEXT NOT NULL DEFAULT 'medium',
  next_hearing_at TIMESTAMPTZ,
  decision TEXT,
  attachments TEXT,
  timeline_note TEXT,
  opened_at DATE NOT NULL DEFAULT CURRENT_DATE,
  closed_at DATE,
  created_by BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS legal_contracts (
  id BIGSERIAL PRIMARY KEY,
  contract_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  contract_type TEXT NOT NULL,
  parties TEXT NOT NULL,
  department_id BIGINT REFERENCES departments(id),
  contract_value NUMERIC(18,2) NOT NULL DEFAULT 0,
  starts_on DATE,
  ends_on DATE,
  renewal_date DATE,
  status TEXT NOT NULL DEFAULT 'under_review',
  responsible_officer TEXT,
  supporting_document TEXT,
  review_notes TEXT,
  created_by BIGINT NOT NULL REFERENCES users(id),
  approved_by BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS legal_policies (
  id BIGSERIAL PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  policy_name TEXT NOT NULL,
  policy_category TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0',
  effective_date DATE,
  review_date DATE,
  status TEXT NOT NULL DEFAULT 'draft',
  approval_history TEXT,
  document_reference TEXT,
  created_by BIGINT NOT NULL REFERENCES users(id),
  approved_by BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS legal_complaints (
  id BIGSERIAL PRIMARY KEY,
  complaint_number TEXT NOT NULL UNIQUE,
  complainant TEXT NOT NULL,
  member_id BIGINT REFERENCES members(id),
  complaint_type TEXT NOT NULL,
  department_id BIGINT REFERENCES departments(id),
  description TEXT NOT NULL,
  evidence TEXT,
  assigned_officer TEXT,
  status TEXT NOT NULL DEFAULT 'submitted',
  recommendation TEXT,
  decision TEXT,
  confidential BOOLEAN NOT NULL DEFAULT true,
  created_by BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS legal_opinions (
  id BIGSERIAL PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  requested_by_department BIGINT REFERENCES departments(id),
  question TEXT NOT NULL,
  opinion TEXT,
  assigned_officer TEXT,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  document_reference TEXT,
  created_by BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS legal_compliance (
  id BIGSERIAL PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  department_id BIGINT REFERENCES departments(id),
  requirement TEXT NOT NULL,
  policy_reference TEXT,
  compliance_score NUMERIC(5,2) NOT NULL DEFAULT 100,
  risk_level TEXT NOT NULL DEFAULT 'low',
  status TEXT NOT NULL DEFAULT 'compliant',
  due_date DATE,
  finding TEXT,
  corrective_action TEXT,
  responsible_officer TEXT,
  reviewed_at TIMESTAMPTZ,
  created_by BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS legal_court_matters (
  id BIGSERIAL PRIMARY KEY,
  court_file TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  court_name TEXT NOT NULL,
  opposing_party TEXT,
  legal_representative TEXT,
  case_id BIGINT REFERENCES legal_cases(id),
  next_hearing_at TIMESTAMPTZ,
  court_order TEXT,
  judgement TEXT,
  appeal_status TEXT,
  legal_expenses NUMERIC(18,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_by BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS audit_plans (
  id BIGSERIAL PRIMARY KEY,
  audit_number TEXT NOT NULL UNIQUE,
  audit_type TEXT NOT NULL,
  department_id BIGINT REFERENCES departments(id),
  audit_period TEXT NOT NULL,
  lead_auditor TEXT NOT NULL,
  audit_team TEXT,
  objective TEXT NOT NULL,
  scope TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned',
  planned_date DATE NOT NULL,
  started_at TIMESTAMPTZ,
  completion_date DATE,
  created_by BIGINT NOT NULL REFERENCES users(id),
  approved_by BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS audit_findings (
  id BIGSERIAL PRIMARY KEY,
  finding_number TEXT NOT NULL UNIQUE,
  audit_id BIGINT REFERENCES audit_plans(id),
  department_id BIGINT REFERENCES departments(id),
  description TEXT NOT NULL,
  evidence TEXT NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low','medium','high','critical')),
  recommendation TEXT NOT NULL,
  responsible_department BIGINT REFERENCES departments(id),
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'open',
  supporting_document TEXT,
  repeat_finding BOOLEAN NOT NULL DEFAULT false,
  created_by BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS audit_investigations (
  id BIGSERIAL PRIMARY KEY,
  investigation_number TEXT NOT NULL UNIQUE,
  case_description TEXT NOT NULL,
  lead_auditor TEXT NOT NULL,
  departments_involved TEXT NOT NULL,
  evidence TEXT,
  interviews TEXT,
  findings TEXT,
  recommendations TEXT,
  final_report TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'medium',
  opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  created_by BIGINT NOT NULL REFERENCES users(id),
  authorized_closed_by BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS audit_recommendations (
  id BIGSERIAL PRIMARY KEY,
  recommendation_number TEXT NOT NULL UNIQUE,
  finding_id BIGINT REFERENCES audit_findings(id),
  department_id BIGINT REFERENCES departments(id),
  description TEXT NOT NULL,
  issued_on DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'issued',
  department_response TEXT,
  follow_up_date DATE,
  verified_by BIGINT REFERENCES users(id),
  completed_at TIMESTAMPTZ,
  created_by BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS audit_compliance (
  id BIGSERIAL PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  department_id BIGINT NOT NULL REFERENCES departments(id),
  compliance_area TEXT NOT NULL,
  compliance_score NUMERIC(5,2) NOT NULL DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'compliant',
  finding_summary TEXT,
  corrective_action TEXT,
  responsible_officer TEXT,
  review_date DATE,
  reviewed_by BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS audit_risks (
  id BIGSERIAL PRIMARY KEY,
  risk_number TEXT NOT NULL UNIQUE,
  department_id BIGINT REFERENCES departments(id),
  risk_category TEXT NOT NULL,
  description TEXT NOT NULL,
  likelihood INTEGER NOT NULL CHECK (likelihood BETWEEN 1 AND 5),
  impact INTEGER NOT NULL CHECK (impact BETWEEN 1 AND 5),
  risk_level TEXT NOT NULL,
  mitigation_plan TEXT NOT NULL,
  risk_owner TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  last_reviewed_at TIMESTAMPTZ,
  created_by BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS audit_fraud_alerts (
  id BIGSERIAL PRIMARY KEY,
  alert_number TEXT NOT NULL UNIQUE,
  source_type TEXT NOT NULL,
  source_reference TEXT,
  department_id BIGINT REFERENCES departments(id),
  rule_name TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(18,2),
  risk_score INTEGER NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
  status TEXT NOT NULL DEFAULT 'new',
  assigned_auditor TEXT,
  review_notes TEXT,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_department_assignments_user ON department_assignments(user_id,active);
CREATE INDEX IF NOT EXISTS idx_department_activities_department ON department_activities(department_id,status,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_member_department_member ON member_department_profiles(member_id);
CREATE INDEX IF NOT EXISTS idx_governance_records_department ON governance_records(department_id,status);
CREATE INDEX IF NOT EXISTS idx_organization_documents_type ON organization_documents(document_type,updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_legal_cases_status ON legal_cases(status,risk_level);
CREATE INDEX IF NOT EXISTS idx_legal_contracts_status ON legal_contracts(status,ends_on);
CREATE INDEX IF NOT EXISTS idx_legal_complaints_status ON legal_complaints(status,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_legal_compliance_department ON legal_compliance(department_id,status);
CREATE INDEX IF NOT EXISTS idx_audit_plans_status ON audit_plans(status,planned_date);
CREATE INDEX IF NOT EXISTS idx_audit_findings_status ON audit_findings(status,risk_level,due_date);
CREATE INDEX IF NOT EXISTS idx_audit_investigations_status ON audit_investigations(status,priority);
CREATE INDEX IF NOT EXISTS idx_audit_recommendations_status ON audit_recommendations(status,due_date);
CREATE INDEX IF NOT EXISTS idx_audit_compliance_department ON audit_compliance(department_id,status);
CREATE INDEX IF NOT EXISTS idx_audit_risks_level ON audit_risks(risk_level,status);
CREATE INDEX IF NOT EXISTS idx_audit_fraud_status ON audit_fraud_alerts(status,risk_score DESC);
