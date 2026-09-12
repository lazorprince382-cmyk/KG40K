-- Pin Dan Rwebingira Ssalongo's member savings to UGX 8,900,000.
-- Member ledger only: do not change finance_accounts current balances
-- (Centenary/Kwagalana, UAP, or any other organization financial account).

UPDATE members
SET savings_balance = 8900000
WHERE deleted_at IS NULL
  AND status = 'active'
  AND (
    full_name ILIKE 'Dan Rwebingira Ssalongo'
    OR full_name ILIKE 'Rwebingira Dan Ssalongo'
    OR full_name ILIKE 'Dan Rwebingira'
  );
