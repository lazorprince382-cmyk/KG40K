-- FY 26/27 share bar must start unpaid: Aug 2026 group sync shares were FY 25/26.
UPDATE transactions
SET target_fiscal_year = 2026,
    notes = trim(both FROM COALESCE(notes,'') || ' | Retargeted to FY 25/26 (paid before FY 26/27 share window)')
WHERE type = 'Share purchase'
  AND status = 'completed'
  AND target_fiscal_year = 2027
  AND reference LIKE 'SHR-sync-aug2026%';
