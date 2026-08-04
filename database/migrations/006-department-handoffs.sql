ALTER TABLE finance_budgets ADD COLUMN IF NOT EXISTS executive_activity_id BIGINT REFERENCES department_activities(id);
ALTER TABLE investment_transactions ADD COLUMN IF NOT EXISTS finance_entry_id BIGINT REFERENCES organization_finance_entries(id);
ALTER TABLE welfare_contributions ADD COLUMN IF NOT EXISTS finance_entry_id BIGINT REFERENCES organization_finance_entries(id);
ALTER TABLE investment_contracts ADD COLUMN IF NOT EXISTS legal_contract_id BIGINT REFERENCES legal_contracts(id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_investment_contract_legal ON investment_contracts(legal_contract_id) WHERE legal_contract_id IS NOT NULL;