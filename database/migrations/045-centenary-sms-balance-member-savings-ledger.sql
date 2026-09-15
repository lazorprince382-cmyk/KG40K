-- Member savings receipts are ledger splits on Centenary; they must not bump GL-4104
-- on top of the reconciled SMS balance (organizationBankBalance).

UPDATE finance_accounts
SET balance = COALESCE(
      (SELECT NULLIF(value, '')::numeric FROM settings WHERE key = 'organizationBankBalance'),
      balance
    ),
    notes = TRIM(BOTH FROM COALESCE(notes, '') || ' Member savings receipts no longer change this reconciled SMS balance.'),
    updated_at = NOW()
WHERE account_code = 'GL-4104'
  AND active = true
  AND COALESCE((SELECT NULLIF(value, '')::numeric FROM settings WHERE key = 'organizationBankBalance'), 0) > 0;
