ALTER TABLE loans
  ADD COLUMN IF NOT EXISTS overdue_declaration_accepted BOOLEAN NOT NULL DEFAULT false;

UPDATE loans
SET overdue_declaration_accepted = true
WHERE borrower_declaration_accepted = true
  AND overdue_declaration_accepted = false;
