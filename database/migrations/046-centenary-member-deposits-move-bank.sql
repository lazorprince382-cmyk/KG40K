-- Undo migration 045 pinning: member deposits must move GL-4104 again.
-- Full receipt amount (savings + welfare share) posts to Centenary; delete reverses it.
-- Do not overwrite the live balance here — only clear the broken pin note.

UPDATE finance_accounts
SET notes = TRIM(BOTH FROM regexp_replace(
      COALESCE(notes, ''),
      '\s*Member savings receipts no longer change this reconciled SMS balance\.?',
      '',
      'gi'
    )),
    updated_at = NOW()
WHERE account_code = 'GL-4104'
  AND active = true;
