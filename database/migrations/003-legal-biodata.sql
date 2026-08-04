CREATE TABLE IF NOT EXISTS member_bio_data (
  member_id BIGINT PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
  date_of_birth DATE,
  gender TEXT CHECK (gender IS NULL OR gender IN ('female','male','other','prefer_not_to_say')),
  marital_status TEXT CHECK (marital_status IS NULL OR marital_status IN ('single','married','divorced','widowed','separated','other')),
  nationality TEXT NOT NULL DEFAULT 'Ugandan',
  home_district TEXT,
  subcounty TEXT,
  parish TEXT,
  village TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  blood_group TEXT,
  disability_notes TEXT,
  profile_photo_reference TEXT,
  identity_document_reference TEXT,
  record_notes TEXT,
  bio_status TEXT NOT NULL DEFAULT 'pending' CHECK (bio_status IN ('pending','complete','verified','needs_update')),
  created_by BIGINT REFERENCES users(id),
  verified_by BIGINT REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_member_bio_status ON member_bio_data(bio_status);
CREATE INDEX IF NOT EXISTS idx_member_bio_location ON member_bio_data(home_district,subcounty,village);
