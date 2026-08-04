ALTER TABLE finance_assets ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE finance_assets ADD COLUMN IF NOT EXISTS supporting_document TEXT;

ALTER TABLE investment_assets ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE investment_assets ADD COLUMN IF NOT EXISTS supporting_document TEXT;
