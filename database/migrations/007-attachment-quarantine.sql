ALTER TABLE message_attachments ADD COLUMN IF NOT EXISTS quarantined_at TIMESTAMPTZ;
ALTER TABLE message_attachments ADD COLUMN IF NOT EXISTS quarantine_reason TEXT;