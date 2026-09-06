-- Multiple supporting documents per loan application.
CREATE TABLE IF NOT EXISTS loan_supporting_documents (
  id BIGSERIAL PRIMARY KEY,
  loan_id BIGINT NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  stored_name TEXT NOT NULL,
  original_name TEXT,
  mime_type TEXT,
  sort_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loan_supporting_documents_loan
  ON loan_supporting_documents (loan_id, sort_order, id);

-- Backfill any existing single supporting document into the multi-doc table.
INSERT INTO loan_supporting_documents (loan_id, stored_name, original_name, mime_type, sort_order)
SELECT l.id, l.supporting_document_stored_name, l.supporting_document_original_name,
       l.supporting_document_mime_type, 1
FROM loans l
WHERE NULLIF(l.supporting_document_stored_name, '') IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM loan_supporting_documents d WHERE d.loan_id = l.id
  );
