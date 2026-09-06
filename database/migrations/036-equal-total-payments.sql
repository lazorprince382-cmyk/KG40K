-- Switch products to equal-total-payments (amortizing EMI) and drop grace-period wording.
UPDATE loan_products
SET interest_method = 'equal_total_payments'
WHERE interest_method IN ('equal_principal_reducing_balance','reducing_balance');
