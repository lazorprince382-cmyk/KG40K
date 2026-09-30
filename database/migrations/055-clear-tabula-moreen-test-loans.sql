-- Remove test loans (and their repayments) from Tabula Robert and Ntono Moreen.
CREATE TEMP TABLE clear_loan_members ON COMMIT DROP AS
  SELECT id FROM members
  WHERE full_name ILIKE '%tabula%robert%' OR full_name ILIKE '%ntono%moreen%';

CREATE TEMP TABLE clear_loans ON COMMIT DROP AS
  SELECT id, reference FROM loans WHERE member_id IN (SELECT id FROM clear_loan_members);

CREATE TEMP TABLE clear_loan_tx ON COMMIT DROP AS
  SELECT t.id FROM transactions t
  WHERE t.loan_id IN (SELECT id FROM clear_loans)
     OR (t.member_id IN (SELECT id FROM clear_loan_members)
         AND t.type ILIKE 'loan%'
         AND EXISTS (SELECT 1 FROM clear_loans c WHERE t.reference LIKE '%' || c.reference || '%'));

UPDATE transactions SET reversal_of = NULL WHERE reversal_of IN (SELECT id FROM clear_loan_tx);
DELETE FROM withdrawals WHERE transaction_id IN (SELECT id FROM clear_loan_tx);
DELETE FROM transactions WHERE id IN (SELECT id FROM clear_loan_tx);
DELETE FROM loan_disbursements WHERE loan_id IN (SELECT id FROM clear_loans);
DELETE FROM loans WHERE id IN (SELECT id FROM clear_loans);
