-- September 2026 UAP interest exactly as the Old Mutual Umbrella Trust Fund statement (01-30 Sep 2026).
-- Opening (after the 10,000,000 purchase) 140,461,829.36; interest 1,393,314.36; closing 141,855,143.72.
DELETE FROM unit_trust_movements
WHERE description = 'Interest'
  AND movement_date >= DATE '2026-09-01' AND movement_date < DATE '2026-10-01';

UPDATE unit_trust_movements SET balance_after = 140461829.36
WHERE description = 'Opening Balance' AND movement_date = DATE '2026-09-01';

INSERT INTO unit_trust_movements (movement_date, description, deposit_amount, interest_amount, withdrawal_amount, rate_percent, balance_after, source_reference)
SELECT DATE '2026-09-01', 'Opening Balance', 0, 0, 0, NULL, 140461829.36, 'uap-statement-2026-09-open'
WHERE NOT EXISTS (
  SELECT 1 FROM unit_trust_movements WHERE description = 'Opening Balance' AND movement_date = DATE '2026-09-01'
);

INSERT INTO unit_trust_movements (movement_date, description, deposit_amount, interest_amount, withdrawal_amount, rate_percent, balance_after, source_reference)
SELECT d::date, 'Interest', 0, i, 0, r, b, 'uap-statement-' || d
FROM (VALUES
  ('2026-09-01', 46600.97, 12.11, 140508430.33),
  ('2026-09-02', 46687.53, 12.13, 140555117.86),
  ('2026-09-03', 46776.13, 12.15, 140601893.99),
  ('2026-09-04', 46804.94, 12.15, 140648698.93),
  ('2026-09-05', 46801.71, 12.15, 140695500.64),
  ('2026-09-06', 46798.05, 12.14, 140742298.69),
  ('2026-09-07', 46739.67, 12.12, 140789038.36),
  ('2026-09-08', 46741.64, 12.12, 140835780.00),
  ('2026-09-09', 46768.35, 12.12, 140882548.35),
  ('2026-09-10', 46766.90, 12.12, 140929315.25),
  ('2026-09-11', 46805.47, 12.12, 140976120.72),
  ('2026-09-12', 46801.81, 12.12, 141022922.52),
  ('2026-09-13', 46798.14, 12.11, 141069720.66),
  ('2026-09-14', 46777.09, 12.10, 141116497.76),
  ('2026-09-15', 46693.27, 12.08, 141163191.03),
  ('2026-09-16', 46667.79, 12.07, 141209858.82),
  ('2026-09-17', 46453.70, 12.01, 141256312.51),
  ('2026-09-18', 46219.01, 11.94, 141302531.52),
  ('2026-09-19', 46449.68, 12.00, 141348981.20),
  ('2026-09-20', 46446.04, 11.99, 141395427.25),
  ('2026-09-21', 45049.62, 11.63, 141440476.86),
  ('2026-09-22', 45195.67, 11.66, 141485672.53),
  ('2026-09-23', 44963.96, 11.60, 141530636.49),
  ('2026-09-24', 45163.79, 11.65, 141575800.27),
  ('2026-09-25', 46588.26, 12.01, 141622388.53),
  ('2026-09-26', 46584.61, 12.01, 141668973.14),
  ('2026-09-27', 46580.96, 12.00, 141715554.10),
  ('2026-09-28', 46575.14, 12.00, 141762129.24),
  ('2026-09-29', 46501.98, 11.97, 141808631.22),
  ('2026-09-30', 46512.49, 11.97, 141855143.72)
) AS s(d, i, r, b);

UPDATE finance_accounts SET balance = 141855143.72, updated_at = NOW()
WHERE account_code = 'GL-4500'
  AND NOT EXISTS (SELECT 1 FROM unit_trust_movements WHERE movement_date >= DATE '2026-10-01');

INSERT INTO settings (key, value) VALUES ('organizationUapBalance', '141855143.72')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
