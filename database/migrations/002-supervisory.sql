CREATE TABLE IF NOT EXISTS supervisory_scorecards (
  id BIGSERIAL PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  department_id BIGINT NOT NULL REFERENCES departments(id),
  annual_target NUMERIC(5,2) NOT NULL DEFAULT 100,
  monthly_target NUMERIC(5,2) NOT NULL DEFAULT 100,
  completed_tasks INTEGER NOT NULL DEFAULT 0,
  outstanding_tasks INTEGER NOT NULL DEFAULT 0,
  budget_utilization NUMERIC(5,2) NOT NULL DEFAULT 0,
  performance_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  target_achievement NUMERIC(5,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'on_track',
  supervisor_comment TEXT,
  review_period TEXT NOT NULL,
  reviewed_by BIGINT REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supervisory_followups (
  id BIGSERIAL PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  department_id BIGINT NOT NULL REFERENCES departments(id),
  action_required TEXT NOT NULL,
  responsible_officer TEXT NOT NULL,
  deadline DATE NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  status TEXT NOT NULL DEFAULT 'pending',
  evidence TEXT,
  supervisor_comment TEXT,
  created_by BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS supervisory_executive_monitoring (
  id BIGSERIAL PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  review_period TEXT NOT NULL,
  meetings_held INTEGER NOT NULL DEFAULT 0,
  decisions_made INTEGER NOT NULL DEFAULT 0,
  decisions_implemented INTEGER NOT NULL DEFAULT 0,
  decisions_pending INTEGER NOT NULL DEFAULT 0,
  strategic_objectives_completed INTEGER NOT NULL DEFAULT 0,
  strategic_objectives_total INTEGER NOT NULL DEFAULT 0,
  attendance_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  implementation_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  performance_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  delayed_actions INTEGER NOT NULL DEFAULT 0,
  report_reference TEXT,
  supervisor_comment TEXT,
  created_by BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supervisory_committees (
  id BIGSERIAL PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  committee_name TEXT NOT NULL,
  members INTEGER NOT NULL DEFAULT 0,
  meetings_held INTEGER NOT NULL DEFAULT 0,
  attendance_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  decisions_made INTEGER NOT NULL DEFAULT 0,
  outstanding_actions INTEGER NOT NULL DEFAULT 0,
  performance_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'on_track',
  chairperson TEXT,
  supervisor_comment TEXT,
  review_period TEXT NOT NULL,
  created_by BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supervisory_resolutions (
  id BIGSERIAL PRIMARY KEY,
  resolution_number TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  meeting_date DATE NOT NULL,
  department_id BIGINT REFERENCES departments(id),
  responsible_officer TEXT NOT NULL,
  due_date DATE NOT NULL,
  completion_percentage INTEGER NOT NULL DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
  evidence TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'medium',
  supervisor_comment TEXT,
  created_by BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS supervisory_complaints (
  id BIGSERIAL PRIMARY KEY,
  complaint_number TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  subject_type TEXT NOT NULL,
  department_id BIGINT REFERENCES departments(id),
  description TEXT NOT NULL,
  assigned_supervisor TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'received',
  investigation_progress INTEGER NOT NULL DEFAULT 0 CHECK (investigation_progress BETWEEN 0 AND 100),
  finding TEXT,
  recommendation TEXT,
  escalated BOOLEAN NOT NULL DEFAULT false,
  confidential BOOLEAN NOT NULL DEFAULT true,
  evidence TEXT,
  created_by BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS supervisory_projects (
  id BIGSERIAL PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  project_name TEXT NOT NULL,
  department_id BIGINT REFERENCES departments(id),
  project_manager TEXT,
  planned_progress INTEGER NOT NULL DEFAULT 0 CHECK (planned_progress BETWEEN 0 AND 100),
  actual_progress INTEGER NOT NULL DEFAULT 0 CHECK (actual_progress BETWEEN 0 AND 100),
  risk_level TEXT NOT NULL DEFAULT 'low',
  status TEXT NOT NULL DEFAULT 'active',
  deadline DATE,
  budget_summary NUMERIC(18,2) NOT NULL DEFAULT 0,
  site_visits_completed INTEGER NOT NULL DEFAULT 0,
  supervisor_comment TEXT,
  created_by BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supervisory_recommendations (
  id BIGSERIAL PRIMARY KEY,
  recommendation_number TEXT NOT NULL UNIQUE,
  department_id BIGINT REFERENCES departments(id),
  source_type TEXT NOT NULL,
  source_reference TEXT,
  description TEXT NOT NULL,
  responsible_officer TEXT NOT NULL,
  issued_on DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'issued',
  department_response TEXT,
  implementation_progress INTEGER NOT NULL DEFAULT 0 CHECK (implementation_progress BETWEEN 0 AND 100),
  accepted BOOLEAN NOT NULL DEFAULT false,
  evidence TEXT,
  verified_by BIGINT REFERENCES users(id),
  created_by BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS supervisory_site_visits (
  id BIGSERIAL PRIMARY KEY,
  visit_number TEXT NOT NULL UNIQUE,
  site_name TEXT NOT NULL,
  department_id BIGINT REFERENCES departments(id),
  project_id BIGINT REFERENCES supervisory_projects(id),
  visit_date DATE NOT NULL,
  supervisor TEXT NOT NULL,
  observations TEXT NOT NULL,
  photos_reference TEXT,
  recommendations TEXT NOT NULL,
  follow_up_date DATE,
  status TEXT NOT NULL DEFAULT 'completed',
  created_by BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supervisory_kpis (
  id BIGSERIAL PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  kpi_name TEXT NOT NULL,
  category TEXT NOT NULL,
  target_value NUMERIC(12,2) NOT NULL,
  actual_value NUMERIC(12,2) NOT NULL,
  unit TEXT NOT NULL DEFAULT '%',
  achievement_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  trend TEXT NOT NULL DEFAULT 'stable',
  status TEXT NOT NULL DEFAULT 'on_track',
  review_period TEXT NOT NULL,
  data_source TEXT,
  created_by BIGINT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_supervisory_scorecards_department ON supervisory_scorecards(department_id,review_period);
CREATE INDEX IF NOT EXISTS idx_supervisory_followups_status ON supervisory_followups(status,deadline);
CREATE INDEX IF NOT EXISTS idx_supervisory_resolutions_status ON supervisory_resolutions(status,due_date);
CREATE INDEX IF NOT EXISTS idx_supervisory_complaints_status ON supervisory_complaints(status,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_supervisory_projects_status ON supervisory_projects(status,risk_level);
CREATE INDEX IF NOT EXISTS idx_supervisory_recommendations_status ON supervisory_recommendations(status,due_date);
CREATE INDEX IF NOT EXISTS idx_supervisory_visits_date ON supervisory_site_visits(visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_supervisory_kpis_period ON supervisory_kpis(review_period,status);
