CREATE TABLE IF NOT EXISTS governance_bodies (
  id BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  body_type TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS governance_appointments (
  id BIGSERIAL PRIMARY KEY,
  body_id BIGINT NOT NULL REFERENCES governance_bodies(id) ON DELETE CASCADE,
  legacy_balance_id BIGINT REFERENCES legacy_member_opening_balances(id),
  linked_member_id BIGINT REFERENCES members(id),
  member_name_as_recorded TEXT NOT NULL,
  canonical_member_name TEXT NOT NULL,
  position_title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  source_document_id BIGINT REFERENCES organization_documents(id),
  notes TEXT,
  appointed_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(body_id,canonical_member_name,position_title)
);

CREATE TABLE IF NOT EXISTS governance_directives (
  id BIGSERIAL PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  details TEXT NOT NULL,
  applies_to TEXT NOT NULL,
  due_date DATE,
  recurrence TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  source_document_id BIGINT REFERENCES organization_documents(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS membership_status_records (
  id BIGSERIAL PRIMARY KEY,
  legacy_balance_id BIGINT REFERENCES legacy_member_opening_balances(id),
  linked_member_id BIGINT REFERENCES members(id),
  member_name TEXT NOT NULL,
  status TEXT NOT NULL,
  condition_note TEXT,
  effective_date DATE,
  source_document_id BIGINT REFERENCES organization_documents(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(member_name,status)
);

CREATE INDEX IF NOT EXISTS idx_governance_appointments_body
  ON governance_appointments(body_id,status,position_title);
CREATE INDEX IF NOT EXISTS idx_membership_status_name
  ON membership_status_records(member_name,status);
