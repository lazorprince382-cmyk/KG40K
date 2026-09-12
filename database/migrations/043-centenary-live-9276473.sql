-- The 01 Sep SMS figure (UGX 8,351,473) was reapplied over later Centenary receipts.
-- Restore the live company bank balance. Later receipts must not be wiped again.

UPDATE finance_accounts
SET balance = 9276473,
    notes = TRIM(BOTH FROM COALESCE(notes, '') || ' Restored live Centenary balance to UGX 9,276,473; later receipts stay on top of the 01 Sep SMS figure.'),
    updated_at = NOW()
WHERE account_code = 'GL-4104'
  AND active = true
  AND balance = 8351473;

UPDATE settings
SET value = '9276473',
    updated_at = NOW()
WHERE key = 'organizationBankBalance'
  AND value IN ('8351473', '8351473.00');
