--
-- PostgreSQL database dump
--


-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.withdrawals DROP CONSTRAINT IF EXISTS withdrawals_transaction_id_fkey;
ALTER TABLE IF EXISTS ONLY public.withdrawals DROP CONSTRAINT IF EXISTS withdrawals_requested_by_fkey;
ALTER TABLE IF EXISTS ONLY public.withdrawals DROP CONSTRAINT IF EXISTS withdrawals_processed_by_fkey;
ALTER TABLE IF EXISTS ONLY public.withdrawals DROP CONSTRAINT IF EXISTS withdrawals_member_id_fkey;
ALTER TABLE IF EXISTS ONLY public.withdrawals DROP CONSTRAINT IF EXISTS withdrawals_approved_by_fkey;
ALTER TABLE IF EXISTS ONLY public.welfare_requests DROP CONSTRAINT IF EXISTS welfare_requests_submitted_by_fkey;
ALTER TABLE IF EXISTS ONLY public.welfare_requests DROP CONSTRAINT IF EXISTS welfare_requests_reviewed_by_fkey;
ALTER TABLE IF EXISTS ONLY public.welfare_requests DROP CONSTRAINT IF EXISTS welfare_requests_member_id_fkey;
ALTER TABLE IF EXISTS ONLY public.welfare_requests DROP CONSTRAINT IF EXISTS welfare_requests_finance_voucher_id_fkey;
ALTER TABLE IF EXISTS ONLY public.welfare_requests DROP CONSTRAINT IF EXISTS welfare_requests_executive_activity_id_fkey;
ALTER TABLE IF EXISTS ONLY public.welfare_requests DROP CONSTRAINT IF EXISTS welfare_requests_assigned_to_fkey;
ALTER TABLE IF EXISTS ONLY public.welfare_payments DROP CONSTRAINT IF EXISTS welfare_payments_request_id_fkey;
ALTER TABLE IF EXISTS ONLY public.welfare_payments DROP CONSTRAINT IF EXISTS welfare_payments_recorded_by_fkey;
ALTER TABLE IF EXISTS ONLY public.welfare_contributions DROP CONSTRAINT IF EXISTS welfare_contributions_verified_by_fkey;
ALTER TABLE IF EXISTS ONLY public.welfare_contributions DROP CONSTRAINT IF EXISTS welfare_contributions_recorded_by_fkey;
ALTER TABLE IF EXISTS ONLY public.welfare_contributions DROP CONSTRAINT IF EXISTS welfare_contributions_member_id_fkey;
ALTER TABLE IF EXISTS ONLY public.welfare_contributions DROP CONSTRAINT IF EXISTS welfare_contributions_finance_entry_id_fkey;
ALTER TABLE IF EXISTS ONLY public.welfare_committee_meetings DROP CONSTRAINT IF EXISTS welfare_committee_meetings_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.welfare_activities DROP CONSTRAINT IF EXISTS welfare_activities_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_member_id_fkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.transactions DROP CONSTRAINT IF EXISTS transactions_verified_by_fkey;
ALTER TABLE IF EXISTS ONLY public.transactions DROP CONSTRAINT IF EXISTS transactions_reversal_of_fkey;
ALTER TABLE IF EXISTS ONLY public.transactions DROP CONSTRAINT IF EXISTS transactions_recorded_by_fkey;
ALTER TABLE IF EXISTS ONLY public.transactions DROP CONSTRAINT IF EXISTS transactions_member_id_fkey;
ALTER TABLE IF EXISTS ONLY public.transactions DROP CONSTRAINT IF EXISTS transactions_loan_id_fkey;
ALTER TABLE IF EXISTS ONLY public.transactions DROP CONSTRAINT IF EXISTS transactions_finance_entry_id_fkey;
ALTER TABLE IF EXISTS ONLY public.transactions DROP CONSTRAINT IF EXISTS transactions_approved_by_fkey;
ALTER TABLE IF EXISTS ONLY public.supervisory_site_visits DROP CONSTRAINT IF EXISTS supervisory_site_visits_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.supervisory_site_visits DROP CONSTRAINT IF EXISTS supervisory_site_visits_department_id_fkey;
ALTER TABLE IF EXISTS ONLY public.supervisory_site_visits DROP CONSTRAINT IF EXISTS supervisory_site_visits_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.supervisory_scorecards DROP CONSTRAINT IF EXISTS supervisory_scorecards_reviewed_by_fkey;
ALTER TABLE IF EXISTS ONLY public.supervisory_scorecards DROP CONSTRAINT IF EXISTS supervisory_scorecards_department_id_fkey;
ALTER TABLE IF EXISTS ONLY public.supervisory_resolutions DROP CONSTRAINT IF EXISTS supervisory_resolutions_department_id_fkey;
ALTER TABLE IF EXISTS ONLY public.supervisory_resolutions DROP CONSTRAINT IF EXISTS supervisory_resolutions_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.supervisory_recommendations DROP CONSTRAINT IF EXISTS supervisory_recommendations_verified_by_fkey;
ALTER TABLE IF EXISTS ONLY public.supervisory_recommendations DROP CONSTRAINT IF EXISTS supervisory_recommendations_department_id_fkey;
ALTER TABLE IF EXISTS ONLY public.supervisory_recommendations DROP CONSTRAINT IF EXISTS supervisory_recommendations_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.supervisory_projects DROP CONSTRAINT IF EXISTS supervisory_projects_department_id_fkey;
ALTER TABLE IF EXISTS ONLY public.supervisory_projects DROP CONSTRAINT IF EXISTS supervisory_projects_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.supervisory_kpis DROP CONSTRAINT IF EXISTS supervisory_kpis_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.supervisory_followups DROP CONSTRAINT IF EXISTS supervisory_followups_department_id_fkey;
ALTER TABLE IF EXISTS ONLY public.supervisory_followups DROP CONSTRAINT IF EXISTS supervisory_followups_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.supervisory_executive_monitoring DROP CONSTRAINT IF EXISTS supervisory_executive_monitoring_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.supervisory_complaints DROP CONSTRAINT IF EXISTS supervisory_complaints_department_id_fkey;
ALTER TABLE IF EXISTS ONLY public.supervisory_complaints DROP CONSTRAINT IF EXISTS supervisory_complaints_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.supervisory_committees DROP CONSTRAINT IF EXISTS supervisory_committees_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.settings DROP CONSTRAINT IF EXISTS settings_updated_by_fkey;
ALTER TABLE IF EXISTS ONLY public.organization_meetings DROP CONSTRAINT IF EXISTS organization_meetings_department_id_fkey;
ALTER TABLE IF EXISTS ONLY public.organization_meetings DROP CONSTRAINT IF EXISTS organization_meetings_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.organization_finance_entries DROP CONSTRAINT IF EXISTS organization_finance_entries_recorded_by_fkey;
ALTER TABLE IF EXISTS ONLY public.organization_finance_entries DROP CONSTRAINT IF EXISTS organization_finance_entries_finance_account_id_fkey;
ALTER TABLE IF EXISTS ONLY public.organization_finance_entries DROP CONSTRAINT IF EXISTS organization_finance_entries_department_id_fkey;
ALTER TABLE IF EXISTS ONLY public.organization_finance_entries DROP CONSTRAINT IF EXISTS organization_finance_entries_approved_by_fkey;
ALTER TABLE IF EXISTS ONLY public.organization_documents DROP CONSTRAINT IF EXISTS organization_documents_department_id_fkey;
ALTER TABLE IF EXISTS ONLY public.organization_documents DROP CONSTRAINT IF EXISTS organization_documents_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.organization_documents DROP CONSTRAINT IF EXISTS organization_documents_approved_by_fkey;
ALTER TABLE IF EXISTS ONLY public.organization_document_versions DROP CONSTRAINT IF EXISTS organization_document_versions_uploaded_by_fkey;
ALTER TABLE IF EXISTS ONLY public.organization_document_versions DROP CONSTRAINT IF EXISTS organization_document_versions_document_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_member_id_fkey;
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS messages_reply_to_id_fkey;
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS messages_pinned_by_fkey;
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS messages_forwarded_from_id_fkey;
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS messages_conversation_id_fkey;
ALTER TABLE IF EXISTS ONLY public.message_stars DROP CONSTRAINT IF EXISTS message_stars_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.message_stars DROP CONSTRAINT IF EXISTS message_stars_message_id_fkey;
ALTER TABLE IF EXISTS ONLY public.message_reads DROP CONSTRAINT IF EXISTS message_reads_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.message_reads DROP CONSTRAINT IF EXISTS message_reads_message_id_fkey;
ALTER TABLE IF EXISTS ONLY public.message_reactions DROP CONSTRAINT IF EXISTS message_reactions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.message_reactions DROP CONSTRAINT IF EXISTS message_reactions_message_id_fkey;
ALTER TABLE IF EXISTS ONLY public.message_mentions DROP CONSTRAINT IF EXISTS message_mentions_message_id_fkey;
ALTER TABLE IF EXISTS ONLY public.message_mentions DROP CONSTRAINT IF EXISTS message_mentions_mentioned_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.message_attachments DROP CONSTRAINT IF EXISTS message_attachments_uploaded_by_fkey;
ALTER TABLE IF EXISTS ONLY public.message_attachments DROP CONSTRAINT IF EXISTS message_attachments_message_id_fkey;
ALTER TABLE IF EXISTS ONLY public.membership_status_records DROP CONSTRAINT IF EXISTS membership_status_records_source_document_id_fkey;
ALTER TABLE IF EXISTS ONLY public.membership_status_records DROP CONSTRAINT IF EXISTS membership_status_records_linked_member_id_fkey;
ALTER TABLE IF EXISTS ONLY public.membership_status_records DROP CONSTRAINT IF EXISTS membership_status_records_legacy_balance_id_fkey;
ALTER TABLE IF EXISTS ONLY public.members DROP CONSTRAINT IF EXISTS members_legacy_opening_balance_id_fkey;
ALTER TABLE IF EXISTS ONLY public.members DROP CONSTRAINT IF EXISTS members_deleted_by_fkey;
ALTER TABLE IF EXISTS ONLY public.members DROP CONSTRAINT IF EXISTS members_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.members DROP CONSTRAINT IF EXISTS members_branch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.member_support_requests DROP CONSTRAINT IF EXISTS member_support_requests_member_id_fkey;
ALTER TABLE IF EXISTS ONLY public.member_support_requests DROP CONSTRAINT IF EXISTS member_support_requests_assigned_department_id_fkey;
ALTER TABLE IF EXISTS ONLY public.member_investment_applications DROP CONSTRAINT IF EXISTS member_investment_applications_submitted_by_fkey;
ALTER TABLE IF EXISTS ONLY public.member_investment_applications DROP CONSTRAINT IF EXISTS member_investment_applications_reviewed_by_fkey;
ALTER TABLE IF EXISTS ONLY public.member_investment_applications DROP CONSTRAINT IF EXISTS member_investment_applications_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.member_investment_applications DROP CONSTRAINT IF EXISTS member_investment_applications_member_id_fkey;
ALTER TABLE IF EXISTS ONLY public.member_investment_applications DROP CONSTRAINT IF EXISTS member_investment_applications_investor_id_fkey;
ALTER TABLE IF EXISTS ONLY public.member_investment_applications DROP CONSTRAINT IF EXISTS member_investment_applications_finance_entry_id_fkey;
ALTER TABLE IF EXISTS ONLY public.member_family_records DROP CONSTRAINT IF EXISTS member_family_records_recorded_by_fkey;
ALTER TABLE IF EXISTS ONLY public.member_family_records DROP CONSTRAINT IF EXISTS member_family_records_member_id_fkey;
ALTER TABLE IF EXISTS ONLY public.member_department_profiles DROP CONSTRAINT IF EXISTS member_department_profiles_member_id_fkey;
ALTER TABLE IF EXISTS ONLY public.member_department_profiles DROP CONSTRAINT IF EXISTS member_department_profiles_department_id_fkey;
ALTER TABLE IF EXISTS ONLY public.member_bio_data DROP CONSTRAINT IF EXISTS member_bio_data_verified_by_fkey;
ALTER TABLE IF EXISTS ONLY public.member_bio_data DROP CONSTRAINT IF EXISTS member_bio_data_member_id_fkey;
ALTER TABLE IF EXISTS ONLY public.member_bio_data DROP CONSTRAINT IF EXISTS member_bio_data_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.loans DROP CONSTRAINT IF EXISTS loans_recommended_by_fkey;
ALTER TABLE IF EXISTS ONLY public.loans DROP CONSTRAINT IF EXISTS loans_product_id_fkey;
ALTER TABLE IF EXISTS ONLY public.loans DROP CONSTRAINT IF EXISTS loans_member_id_fkey;
ALTER TABLE IF EXISTS ONLY public.loans DROP CONSTRAINT IF EXISTS loans_guarantor_member_id_fkey;
ALTER TABLE IF EXISTS ONLY public.loans DROP CONSTRAINT IF EXISTS loans_committee_approved_by_fkey;
ALTER TABLE IF EXISTS ONLY public.loans DROP CONSTRAINT IF EXISTS loans_authorized_by_fkey;
ALTER TABLE IF EXISTS ONLY public.loans DROP CONSTRAINT IF EXISTS loans_accountant_verified_by_fkey;
ALTER TABLE IF EXISTS ONLY public.loan_workflow_events DROP CONSTRAINT IF EXISTS loan_workflow_events_loan_id_fkey;
ALTER TABLE IF EXISTS ONLY public.loan_workflow_events DROP CONSTRAINT IF EXISTS loan_workflow_events_actor_id_fkey;
ALTER TABLE IF EXISTS ONLY public.loan_repayment_schedule DROP CONSTRAINT IF EXISTS loan_repayment_schedule_loan_id_fkey;
ALTER TABLE IF EXISTS ONLY public.loan_recovery_actions DROP CONSTRAINT IF EXISTS loan_recovery_actions_loan_id_fkey;
ALTER TABLE IF EXISTS ONLY public.loan_recovery_actions DROP CONSTRAINT IF EXISTS loan_recovery_actions_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.loan_recovery_actions DROP CONSTRAINT IF EXISTS loan_recovery_actions_assigned_to_fkey;
ALTER TABLE IF EXISTS ONLY public.loan_guarantors DROP CONSTRAINT IF EXISTS loan_guarantors_member_id_fkey;
ALTER TABLE IF EXISTS ONLY public.loan_guarantors DROP CONSTRAINT IF EXISTS loan_guarantors_loan_id_fkey;
ALTER TABLE IF EXISTS ONLY public.loan_disbursements DROP CONSTRAINT IF EXISTS loan_disbursements_prepared_by_fkey;
ALTER TABLE IF EXISTS ONLY public.loan_disbursements DROP CONSTRAINT IF EXISTS loan_disbursements_loan_id_fkey;
ALTER TABLE IF EXISTS ONLY public.loan_disbursements DROP CONSTRAINT IF EXISTS loan_disbursements_disbursed_by_fkey;
ALTER TABLE IF EXISTS ONLY public.loan_disbursements DROP CONSTRAINT IF EXISTS loan_disbursements_authorized_by_fkey;
ALTER TABLE IF EXISTS ONLY public.loan_charges DROP CONSTRAINT IF EXISTS loan_charges_waived_by_fkey;
ALTER TABLE IF EXISTS ONLY public.loan_charges DROP CONSTRAINT IF EXISTS loan_charges_schedule_id_fkey;
ALTER TABLE IF EXISTS ONLY public.loan_charges DROP CONSTRAINT IF EXISTS loan_charges_loan_id_fkey;
ALTER TABLE IF EXISTS ONLY public.loan_charges DROP CONSTRAINT IF EXISTS loan_charges_assessed_by_fkey;
ALTER TABLE IF EXISTS ONLY public.legal_policies DROP CONSTRAINT IF EXISTS legal_policies_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.legal_policies DROP CONSTRAINT IF EXISTS legal_policies_approved_by_fkey;
ALTER TABLE IF EXISTS ONLY public.legal_opinions DROP CONSTRAINT IF EXISTS legal_opinions_requested_by_department_fkey;
ALTER TABLE IF EXISTS ONLY public.legal_opinions DROP CONSTRAINT IF EXISTS legal_opinions_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.legal_court_matters DROP CONSTRAINT IF EXISTS legal_court_matters_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.legal_court_matters DROP CONSTRAINT IF EXISTS legal_court_matters_case_id_fkey;
ALTER TABLE IF EXISTS ONLY public.legal_contracts DROP CONSTRAINT IF EXISTS legal_contracts_department_id_fkey;
ALTER TABLE IF EXISTS ONLY public.legal_contracts DROP CONSTRAINT IF EXISTS legal_contracts_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.legal_contracts DROP CONSTRAINT IF EXISTS legal_contracts_approved_by_fkey;
ALTER TABLE IF EXISTS ONLY public.legal_compliance DROP CONSTRAINT IF EXISTS legal_compliance_department_id_fkey;
ALTER TABLE IF EXISTS ONLY public.legal_compliance DROP CONSTRAINT IF EXISTS legal_compliance_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.legal_complaints DROP CONSTRAINT IF EXISTS legal_complaints_member_id_fkey;
ALTER TABLE IF EXISTS ONLY public.legal_complaints DROP CONSTRAINT IF EXISTS legal_complaints_department_id_fkey;
ALTER TABLE IF EXISTS ONLY public.legal_complaints DROP CONSTRAINT IF EXISTS legal_complaints_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.legal_cases DROP CONSTRAINT IF EXISTS legal_cases_member_id_fkey;
ALTER TABLE IF EXISTS ONLY public.legal_cases DROP CONSTRAINT IF EXISTS legal_cases_department_id_fkey;
ALTER TABLE IF EXISTS ONLY public.legal_cases DROP CONSTRAINT IF EXISTS legal_cases_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.legacy_member_opening_balances DROP CONSTRAINT IF EXISTS legacy_member_opening_balances_period_id_fkey;
ALTER TABLE IF EXISTS ONLY public.legacy_member_opening_balances DROP CONSTRAINT IF EXISTS legacy_member_opening_balances_linked_member_id_fkey;
ALTER TABLE IF EXISTS ONLY public.leadership_assignments DROP CONSTRAINT IF EXISTS leadership_assignments_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.investment_transactions DROP CONSTRAINT IF EXISTS investment_transactions_recorded_by_fkey;
ALTER TABLE IF EXISTS ONLY public.investment_transactions DROP CONSTRAINT IF EXISTS investment_transactions_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.investment_transactions DROP CONSTRAINT IF EXISTS investment_transactions_finance_entry_id_fkey;
ALTER TABLE IF EXISTS ONLY public.investment_transactions DROP CONSTRAINT IF EXISTS investment_transactions_deleted_by_fkey;
ALTER TABLE IF EXISTS ONLY public.investment_proposals DROP CONSTRAINT IF EXISTS investment_proposals_reviewed_by_fkey;
ALTER TABLE IF EXISTS ONLY public.investment_proposals DROP CONSTRAINT IF EXISTS investment_proposals_finance_reviewed_by_fkey;
ALTER TABLE IF EXISTS ONLY public.investment_proposals DROP CONSTRAINT IF EXISTS investment_proposals_executive_activity_id_fkey;
ALTER TABLE IF EXISTS ONLY public.investment_proposals DROP CONSTRAINT IF EXISTS investment_proposals_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.investment_proposals DROP CONSTRAINT IF EXISTS investment_proposals_approved_by_fkey;
ALTER TABLE IF EXISTS ONLY public.investment_projects DROP CONSTRAINT IF EXISTS investment_projects_proposal_id_fkey;
ALTER TABLE IF EXISTS ONLY public.investment_projects DROP CONSTRAINT IF EXISTS investment_projects_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.investment_projects DROP CONSTRAINT IF EXISTS investment_projects_approved_by_fkey;
ALTER TABLE IF EXISTS ONLY public.investment_project_oversight DROP CONSTRAINT IF EXISTS investment_project_oversight_target_department_id_fkey;
ALTER TABLE IF EXISTS ONLY public.investment_project_oversight DROP CONSTRAINT IF EXISTS investment_project_oversight_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.investment_project_oversight DROP CONSTRAINT IF EXISTS investment_project_oversight_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.investment_investors DROP CONSTRAINT IF EXISTS investment_investors_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.investment_investors DROP CONSTRAINT IF EXISTS investment_investors_member_id_fkey;
ALTER TABLE IF EXISTS ONLY public.investment_investors DROP CONSTRAINT IF EXISTS investment_investors_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.investment_fund_accounts DROP CONSTRAINT IF EXISTS investment_fund_accounts_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.investment_contracts DROP CONSTRAINT IF EXISTS investment_contracts_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.investment_contracts DROP CONSTRAINT IF EXISTS investment_contracts_legal_contract_id_fkey;
ALTER TABLE IF EXISTS ONLY public.investment_contracts DROP CONSTRAINT IF EXISTS investment_contracts_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.investment_assets DROP CONSTRAINT IF EXISTS investment_assets_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.investment_assets DROP CONSTRAINT IF EXISTS investment_assets_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.historical_investment_ledger DROP CONSTRAINT IF EXISTS historical_investment_ledger_period_id_fkey;
ALTER TABLE IF EXISTS ONLY public.governance_records DROP CONSTRAINT IF EXISTS governance_records_resolved_by_fkey;
ALTER TABLE IF EXISTS ONLY public.governance_records DROP CONSTRAINT IF EXISTS governance_records_department_id_fkey;
ALTER TABLE IF EXISTS ONLY public.governance_records DROP CONSTRAINT IF EXISTS governance_records_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.governance_records DROP CONSTRAINT IF EXISTS governance_records_assigned_to_fkey;
ALTER TABLE IF EXISTS ONLY public.governance_directives DROP CONSTRAINT IF EXISTS governance_directives_source_document_id_fkey;
ALTER TABLE IF EXISTS ONLY public.governance_appointments DROP CONSTRAINT IF EXISTS governance_appointments_source_document_id_fkey;
ALTER TABLE IF EXISTS ONLY public.governance_appointments DROP CONSTRAINT IF EXISTS governance_appointments_linked_member_id_fkey;
ALTER TABLE IF EXISTS ONLY public.governance_appointments DROP CONSTRAINT IF EXISTS governance_appointments_legacy_balance_id_fkey;
ALTER TABLE IF EXISTS ONLY public.governance_appointments DROP CONSTRAINT IF EXISTS governance_appointments_body_id_fkey;
ALTER TABLE IF EXISTS ONLY public.financial_statement_lines DROP CONSTRAINT IF EXISTS financial_statement_lines_period_id_fkey;
ALTER TABLE IF EXISTS ONLY public.finance_procurements DROP CONSTRAINT IF EXISTS finance_procurements_voucher_id_fkey;
ALTER TABLE IF EXISTS ONLY public.finance_procurements DROP CONSTRAINT IF EXISTS finance_procurements_requested_by_fkey;
ALTER TABLE IF EXISTS ONLY public.finance_procurements DROP CONSTRAINT IF EXISTS finance_procurements_invoice_id_fkey;
ALTER TABLE IF EXISTS ONLY public.finance_procurements DROP CONSTRAINT IF EXISTS finance_procurements_finance_reviewed_by_fkey;
ALTER TABLE IF EXISTS ONLY public.finance_procurements DROP CONSTRAINT IF EXISTS finance_procurements_executive_approved_by_fkey;
ALTER TABLE IF EXISTS ONLY public.finance_procurements DROP CONSTRAINT IF EXISTS finance_procurements_department_id_fkey;
ALTER TABLE IF EXISTS ONLY public.finance_payment_vouchers DROP CONSTRAINT IF EXISTS finance_payment_vouchers_requested_by_fkey;
ALTER TABLE IF EXISTS ONLY public.finance_payment_vouchers DROP CONSTRAINT IF EXISTS finance_payment_vouchers_processed_by_fkey;
ALTER TABLE IF EXISTS ONLY public.finance_payment_vouchers DROP CONSTRAINT IF EXISTS finance_payment_vouchers_finance_reviewed_by_fkey;
ALTER TABLE IF EXISTS ONLY public.finance_payment_vouchers DROP CONSTRAINT IF EXISTS finance_payment_vouchers_executive_approved_by_fkey;
ALTER TABLE IF EXISTS ONLY public.finance_payment_vouchers DROP CONSTRAINT IF EXISTS finance_payment_vouchers_executive_activity_id_fkey;
ALTER TABLE IF EXISTS ONLY public.finance_payment_vouchers DROP CONSTRAINT IF EXISTS finance_payment_vouchers_department_id_fkey;
ALTER TABLE IF EXISTS ONLY public.finance_invoices DROP CONSTRAINT IF EXISTS finance_invoices_voucher_id_fkey;
ALTER TABLE IF EXISTS ONLY public.finance_invoices DROP CONSTRAINT IF EXISTS finance_invoices_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.finance_budgets DROP CONSTRAINT IF EXISTS finance_budgets_executive_activity_id_fkey;
ALTER TABLE IF EXISTS ONLY public.finance_budgets DROP CONSTRAINT IF EXISTS finance_budgets_department_id_fkey;
ALTER TABLE IF EXISTS ONLY public.finance_budgets DROP CONSTRAINT IF EXISTS finance_budgets_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.finance_budgets DROP CONSTRAINT IF EXISTS finance_budgets_approved_by_fkey;
ALTER TABLE IF EXISTS ONLY public.finance_assets DROP CONSTRAINT IF EXISTS finance_assets_department_id_fkey;
ALTER TABLE IF EXISTS ONLY public.finance_assets DROP CONSTRAINT IF EXISTS finance_assets_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.finance_accounts DROP CONSTRAINT IF EXISTS finance_accounts_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.departments DROP CONSTRAINT IF EXISTS departments_organization_id_fkey;
ALTER TABLE IF EXISTS ONLY public.department_assignments DROP CONSTRAINT IF EXISTS department_assignments_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.department_assignments DROP CONSTRAINT IF EXISTS department_assignments_department_id_fkey;
ALTER TABLE IF EXISTS ONLY public.department_assignments DROP CONSTRAINT IF EXISTS department_assignments_assigned_by_fkey;
ALTER TABLE IF EXISTS ONLY public.department_activities DROP CONSTRAINT IF EXISTS department_activities_department_id_fkey;
ALTER TABLE IF EXISTS ONLY public.department_activities DROP CONSTRAINT IF EXISTS department_activities_decision_by_fkey;
ALTER TABLE IF EXISTS ONLY public.department_activities DROP CONSTRAINT IF EXISTS department_activities_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.department_activities DROP CONSTRAINT IF EXISTS department_activities_assigned_to_fkey;
ALTER TABLE IF EXISTS ONLY public.department_activities DROP CONSTRAINT IF EXISTS department_activities_approved_by_fkey;
ALTER TABLE IF EXISTS ONLY public.conversations DROP CONSTRAINT IF EXISTS conversations_user_low_fkey;
ALTER TABLE IF EXISTS ONLY public.conversations DROP CONSTRAINT IF EXISTS conversations_user_high_fkey;
ALTER TABLE IF EXISTS ONLY public.conversations DROP CONSTRAINT IF EXISTS conversations_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.conversation_members DROP CONSTRAINT IF EXISTS conversation_members_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.conversation_members DROP CONSTRAINT IF EXISTS conversation_members_conversation_id_fkey;
ALTER TABLE IF EXISTS ONLY public.audit_risks DROP CONSTRAINT IF EXISTS audit_risks_department_id_fkey;
ALTER TABLE IF EXISTS ONLY public.audit_risks DROP CONSTRAINT IF EXISTS audit_risks_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.audit_recommendations DROP CONSTRAINT IF EXISTS audit_recommendations_verified_by_fkey;
ALTER TABLE IF EXISTS ONLY public.audit_recommendations DROP CONSTRAINT IF EXISTS audit_recommendations_finding_id_fkey;
ALTER TABLE IF EXISTS ONLY public.audit_recommendations DROP CONSTRAINT IF EXISTS audit_recommendations_department_id_fkey;
ALTER TABLE IF EXISTS ONLY public.audit_recommendations DROP CONSTRAINT IF EXISTS audit_recommendations_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.audit_plans DROP CONSTRAINT IF EXISTS audit_plans_department_id_fkey;
ALTER TABLE IF EXISTS ONLY public.audit_plans DROP CONSTRAINT IF EXISTS audit_plans_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.audit_plans DROP CONSTRAINT IF EXISTS audit_plans_approved_by_fkey;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.audit_investigations DROP CONSTRAINT IF EXISTS audit_investigations_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.audit_investigations DROP CONSTRAINT IF EXISTS audit_investigations_authorized_closed_by_fkey;
ALTER TABLE IF EXISTS ONLY public.audit_fraud_alerts DROP CONSTRAINT IF EXISTS audit_fraud_alerts_reviewed_by_fkey;
ALTER TABLE IF EXISTS ONLY public.audit_fraud_alerts DROP CONSTRAINT IF EXISTS audit_fraud_alerts_department_id_fkey;
ALTER TABLE IF EXISTS ONLY public.audit_findings DROP CONSTRAINT IF EXISTS audit_findings_responsible_department_fkey;
ALTER TABLE IF EXISTS ONLY public.audit_findings DROP CONSTRAINT IF EXISTS audit_findings_department_id_fkey;
ALTER TABLE IF EXISTS ONLY public.audit_findings DROP CONSTRAINT IF EXISTS audit_findings_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.audit_findings DROP CONSTRAINT IF EXISTS audit_findings_audit_id_fkey;
ALTER TABLE IF EXISTS ONLY public.audit_compliance DROP CONSTRAINT IF EXISTS audit_compliance_reviewed_by_fkey;
ALTER TABLE IF EXISTS ONLY public.audit_compliance DROP CONSTRAINT IF EXISTS audit_compliance_department_id_fkey;
ALTER TABLE IF EXISTS ONLY public.announcements DROP CONSTRAINT IF EXISTS announcements_created_by_fkey;
DROP INDEX IF EXISTS public.uq_members_legacy_opening_balance;
DROP INDEX IF EXISTS public.idx_welfare_contributions_member_date;
DROP INDEX IF EXISTS public.idx_transactions_receipt_number;
DROP INDEX IF EXISTS public.idx_transactions_pending_source;
DROP INDEX IF EXISTS public.idx_transactions_member_target_fy;
DROP INDEX IF EXISTS public.idx_transactions_member;
DROP INDEX IF EXISTS public.idx_transactions_loan;
DROP INDEX IF EXISTS public.idx_transactions_finance_entry;
DROP INDEX IF EXISTS public.idx_supervisory_visits_date;
DROP INDEX IF EXISTS public.idx_supervisory_scorecards_department;
DROP INDEX IF EXISTS public.idx_supervisory_resolutions_status;
DROP INDEX IF EXISTS public.idx_supervisory_recommendations_status;
DROP INDEX IF EXISTS public.idx_supervisory_projects_status;
DROP INDEX IF EXISTS public.idx_supervisory_kpis_period;
DROP INDEX IF EXISTS public.idx_supervisory_followups_status;
DROP INDEX IF EXISTS public.idx_supervisory_complaints_status;
DROP INDEX IF EXISTS public.idx_repayment_schedule_due;
DROP INDEX IF EXISTS public.idx_organization_documents_type;
DROP INDEX IF EXISTS public.idx_org_finance_voucher;
DROP INDEX IF EXISTS public.idx_org_finance_receipt;
DROP INDEX IF EXISTS public.idx_notifications_user_unread;
DROP INDEX IF EXISTS public.idx_messages_unread;
DROP INDEX IF EXISTS public.idx_messages_search;
DROP INDEX IF EXISTS public.idx_messages_conversation;
DROP INDEX IF EXISTS public.idx_message_stars_user;
DROP INDEX IF EXISTS public.idx_message_reads_user;
DROP INDEX IF EXISTS public.idx_message_attachments_message;
DROP INDEX IF EXISTS public.idx_membership_status_name;
DROP INDEX IF EXISTS public.idx_members_provisional;
DROP INDEX IF EXISTS public.idx_members_current;
DROP INDEX IF EXISTS public.idx_member_support_member;
DROP INDEX IF EXISTS public.idx_member_investment_status;
DROP INDEX IF EXISTS public.idx_member_investment_member;
DROP INDEX IF EXISTS public.idx_member_investment_finance;
DROP INDEX IF EXISTS public.idx_member_fy_policy_dates;
DROP INDEX IF EXISTS public.idx_member_family_records_member;
DROP INDEX IF EXISTS public.idx_member_department_member;
DROP INDEX IF EXISTS public.idx_member_bio_status;
DROP INDEX IF EXISTS public.idx_member_bio_location;
DROP INDEX IF EXISTS public.idx_loans_member;
DROP INDEX IF EXISTS public.idx_loan_recovery_actions_loan;
DROP INDEX IF EXISTS public.idx_loan_guarantors_member;
DROP INDEX IF EXISTS public.idx_loan_events_loan;
DROP INDEX IF EXISTS public.idx_loan_charges_monthly_penalty;
DROP INDEX IF EXISTS public.idx_loan_charges_loan_status;
DROP INDEX IF EXISTS public.idx_legal_contracts_status;
DROP INDEX IF EXISTS public.idx_legal_compliance_department;
DROP INDEX IF EXISTS public.idx_legal_complaints_status;
DROP INDEX IF EXISTS public.idx_legal_cases_status;
DROP INDEX IF EXISTS public.idx_legacy_member_balances_period;
DROP INDEX IF EXISTS public.idx_investment_transactions_project_date;
DROP INDEX IF EXISTS public.idx_investment_projects_proposal;
DROP INDEX IF EXISTS public.idx_investment_project_oversight_project;
DROP INDEX IF EXISTS public.idx_investment_contract_legal;
DROP INDEX IF EXISTS public.idx_historical_investment_period_date;
DROP INDEX IF EXISTS public.idx_governance_records_department;
DROP INDEX IF EXISTS public.idx_governance_appointments_body;
DROP INDEX IF EXISTS public.idx_financial_lines_period_type;
DROP INDEX IF EXISTS public.idx_finance_entries_account;
DROP INDEX IF EXISTS public.idx_document_versions_document;
DROP INDEX IF EXISTS public.idx_department_assignments_user;
DROP INDEX IF EXISTS public.idx_department_activities_executive_history;
DROP INDEX IF EXISTS public.idx_department_activities_department;
DROP INDEX IF EXISTS public.idx_conversations_recent;
DROP INDEX IF EXISTS public.idx_conversation_members_user;
DROP INDEX IF EXISTS public.idx_audit_risks_level;
DROP INDEX IF EXISTS public.idx_audit_recommendations_status;
DROP INDEX IF EXISTS public.idx_audit_plans_status;
DROP INDEX IF EXISTS public.idx_audit_logs_entity;
DROP INDEX IF EXISTS public.idx_audit_investigations_status;
DROP INDEX IF EXISTS public.idx_audit_fraud_status;
DROP INDEX IF EXISTS public.idx_audit_findings_status;
DROP INDEX IF EXISTS public.idx_audit_created;
DROP INDEX IF EXISTS public.idx_audit_compliance_department;
ALTER TABLE IF EXISTS ONLY public.withdrawals DROP CONSTRAINT IF EXISTS withdrawals_reference_key;
ALTER TABLE IF EXISTS ONLY public.withdrawals DROP CONSTRAINT IF EXISTS withdrawals_pkey;
ALTER TABLE IF EXISTS ONLY public.welfare_requests DROP CONSTRAINT IF EXISTS welfare_requests_reference_key;
ALTER TABLE IF EXISTS ONLY public.welfare_requests DROP CONSTRAINT IF EXISTS welfare_requests_pkey;
ALTER TABLE IF EXISTS ONLY public.welfare_payments DROP CONSTRAINT IF EXISTS welfare_payments_reference_key;
ALTER TABLE IF EXISTS ONLY public.welfare_payments DROP CONSTRAINT IF EXISTS welfare_payments_pkey;
ALTER TABLE IF EXISTS ONLY public.welfare_contributions DROP CONSTRAINT IF EXISTS welfare_contributions_reference_key;
ALTER TABLE IF EXISTS ONLY public.welfare_contributions DROP CONSTRAINT IF EXISTS welfare_contributions_receipt_number_key;
ALTER TABLE IF EXISTS ONLY public.welfare_contributions DROP CONSTRAINT IF EXISTS welfare_contributions_pkey;
ALTER TABLE IF EXISTS ONLY public.welfare_committee_meetings DROP CONSTRAINT IF EXISTS welfare_committee_meetings_reference_key;
ALTER TABLE IF EXISTS ONLY public.welfare_committee_meetings DROP CONSTRAINT IF EXISTS welfare_committee_meetings_pkey;
ALTER TABLE IF EXISTS ONLY public.welfare_activities DROP CONSTRAINT IF EXISTS welfare_activities_reference_key;
ALTER TABLE IF EXISTS ONLY public.welfare_activities DROP CONSTRAINT IF EXISTS welfare_activities_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.transactions DROP CONSTRAINT IF EXISTS transactions_reference_key;
ALTER TABLE IF EXISTS ONLY public.transactions DROP CONSTRAINT IF EXISTS transactions_pkey;
ALTER TABLE IF EXISTS ONLY public.supervisory_site_visits DROP CONSTRAINT IF EXISTS supervisory_site_visits_visit_number_key;
ALTER TABLE IF EXISTS ONLY public.supervisory_site_visits DROP CONSTRAINT IF EXISTS supervisory_site_visits_pkey;
ALTER TABLE IF EXISTS ONLY public.supervisory_scorecards DROP CONSTRAINT IF EXISTS supervisory_scorecards_reference_key;
ALTER TABLE IF EXISTS ONLY public.supervisory_scorecards DROP CONSTRAINT IF EXISTS supervisory_scorecards_pkey;
ALTER TABLE IF EXISTS ONLY public.supervisory_resolutions DROP CONSTRAINT IF EXISTS supervisory_resolutions_resolution_number_key;
ALTER TABLE IF EXISTS ONLY public.supervisory_resolutions DROP CONSTRAINT IF EXISTS supervisory_resolutions_pkey;
ALTER TABLE IF EXISTS ONLY public.supervisory_recommendations DROP CONSTRAINT IF EXISTS supervisory_recommendations_recommendation_number_key;
ALTER TABLE IF EXISTS ONLY public.supervisory_recommendations DROP CONSTRAINT IF EXISTS supervisory_recommendations_pkey;
ALTER TABLE IF EXISTS ONLY public.supervisory_projects DROP CONSTRAINT IF EXISTS supervisory_projects_reference_key;
ALTER TABLE IF EXISTS ONLY public.supervisory_projects DROP CONSTRAINT IF EXISTS supervisory_projects_pkey;
ALTER TABLE IF EXISTS ONLY public.supervisory_kpis DROP CONSTRAINT IF EXISTS supervisory_kpis_reference_key;
ALTER TABLE IF EXISTS ONLY public.supervisory_kpis DROP CONSTRAINT IF EXISTS supervisory_kpis_pkey;
ALTER TABLE IF EXISTS ONLY public.supervisory_followups DROP CONSTRAINT IF EXISTS supervisory_followups_reference_key;
ALTER TABLE IF EXISTS ONLY public.supervisory_followups DROP CONSTRAINT IF EXISTS supervisory_followups_pkey;
ALTER TABLE IF EXISTS ONLY public.supervisory_executive_monitoring DROP CONSTRAINT IF EXISTS supervisory_executive_monitoring_reference_key;
ALTER TABLE IF EXISTS ONLY public.supervisory_executive_monitoring DROP CONSTRAINT IF EXISTS supervisory_executive_monitoring_pkey;
ALTER TABLE IF EXISTS ONLY public.supervisory_complaints DROP CONSTRAINT IF EXISTS supervisory_complaints_pkey;
ALTER TABLE IF EXISTS ONLY public.supervisory_complaints DROP CONSTRAINT IF EXISTS supervisory_complaints_complaint_number_key;
ALTER TABLE IF EXISTS ONLY public.supervisory_committees DROP CONSTRAINT IF EXISTS supervisory_committees_reference_key;
ALTER TABLE IF EXISTS ONLY public.supervisory_committees DROP CONSTRAINT IF EXISTS supervisory_committees_pkey;
ALTER TABLE IF EXISTS ONLY public.settings DROP CONSTRAINT IF EXISTS settings_pkey;
ALTER TABLE IF EXISTS ONLY public.schema_migrations DROP CONSTRAINT IF EXISTS schema_migrations_pkey;
ALTER TABLE IF EXISTS ONLY public.organizations DROP CONSTRAINT IF EXISTS organizations_pkey;
ALTER TABLE IF EXISTS ONLY public.organizations DROP CONSTRAINT IF EXISTS organizations_code_key;
ALTER TABLE IF EXISTS ONLY public.organization_policy_settings DROP CONSTRAINT IF EXISTS organization_policy_settings_pkey;
ALTER TABLE IF EXISTS ONLY public.organization_meetings DROP CONSTRAINT IF EXISTS organization_meetings_reference_key;
ALTER TABLE IF EXISTS ONLY public.organization_meetings DROP CONSTRAINT IF EXISTS organization_meetings_pkey;
ALTER TABLE IF EXISTS ONLY public.organization_finance_entries DROP CONSTRAINT IF EXISTS organization_finance_entries_reference_key;
ALTER TABLE IF EXISTS ONLY public.organization_finance_entries DROP CONSTRAINT IF EXISTS organization_finance_entries_pkey;
ALTER TABLE IF EXISTS ONLY public.organization_documents DROP CONSTRAINT IF EXISTS organization_documents_reference_key;
ALTER TABLE IF EXISTS ONLY public.organization_documents DROP CONSTRAINT IF EXISTS organization_documents_pkey;
ALTER TABLE IF EXISTS ONLY public.organization_document_versions DROP CONSTRAINT IF EXISTS organization_document_versions_stored_name_key;
ALTER TABLE IF EXISTS ONLY public.organization_document_versions DROP CONSTRAINT IF EXISTS organization_document_versions_pkey;
ALTER TABLE IF EXISTS ONLY public.organization_document_versions DROP CONSTRAINT IF EXISTS organization_document_versions_document_id_version_key;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.messages DROP CONSTRAINT IF EXISTS messages_pkey;
ALTER TABLE IF EXISTS ONLY public.message_stars DROP CONSTRAINT IF EXISTS message_stars_pkey;
ALTER TABLE IF EXISTS ONLY public.message_reads DROP CONSTRAINT IF EXISTS message_reads_pkey;
ALTER TABLE IF EXISTS ONLY public.message_reactions DROP CONSTRAINT IF EXISTS message_reactions_pkey;
ALTER TABLE IF EXISTS ONLY public.message_mentions DROP CONSTRAINT IF EXISTS message_mentions_pkey;
ALTER TABLE IF EXISTS ONLY public.message_attachments DROP CONSTRAINT IF EXISTS message_attachments_stored_name_key;
ALTER TABLE IF EXISTS ONLY public.message_attachments DROP CONSTRAINT IF EXISTS message_attachments_pkey;
ALTER TABLE IF EXISTS ONLY public.membership_status_records DROP CONSTRAINT IF EXISTS membership_status_records_pkey;
ALTER TABLE IF EXISTS ONLY public.membership_status_records DROP CONSTRAINT IF EXISTS membership_status_records_member_name_status_key;
ALTER TABLE IF EXISTS ONLY public.members DROP CONSTRAINT IF EXISTS members_pkey;
ALTER TABLE IF EXISTS ONLY public.members DROP CONSTRAINT IF EXISTS members_national_id_key;
ALTER TABLE IF EXISTS ONLY public.members DROP CONSTRAINT IF EXISTS members_member_number_key;
ALTER TABLE IF EXISTS ONLY public.member_support_requests DROP CONSTRAINT IF EXISTS member_support_requests_reference_key;
ALTER TABLE IF EXISTS ONLY public.member_support_requests DROP CONSTRAINT IF EXISTS member_support_requests_pkey;
ALTER TABLE IF EXISTS ONLY public.member_investment_applications DROP CONSTRAINT IF EXISTS member_investment_applications_reference_key;
ALTER TABLE IF EXISTS ONLY public.member_investment_applications DROP CONSTRAINT IF EXISTS member_investment_applications_pkey;
ALTER TABLE IF EXISTS ONLY public.member_financial_year_policies DROP CONSTRAINT IF EXISTS member_financial_year_policies_starts_on_key;
ALTER TABLE IF EXISTS ONLY public.member_financial_year_policies DROP CONSTRAINT IF EXISTS member_financial_year_policies_pkey;
ALTER TABLE IF EXISTS ONLY public.member_financial_year_policies DROP CONSTRAINT IF EXISTS member_financial_year_policies_fiscal_year_label_key;
ALTER TABLE IF EXISTS ONLY public.member_family_records DROP CONSTRAINT IF EXISTS member_family_records_pkey;
ALTER TABLE IF EXISTS ONLY public.member_department_profiles DROP CONSTRAINT IF EXISTS member_department_profiles_pkey;
ALTER TABLE IF EXISTS ONLY public.member_department_profiles DROP CONSTRAINT IF EXISTS member_department_profiles_member_id_department_id_key;
ALTER TABLE IF EXISTS ONLY public.member_bio_data DROP CONSTRAINT IF EXISTS member_bio_data_pkey;
ALTER TABLE IF EXISTS ONLY public.loans DROP CONSTRAINT IF EXISTS loans_reference_key;
ALTER TABLE IF EXISTS ONLY public.loans DROP CONSTRAINT IF EXISTS loans_pkey;
ALTER TABLE IF EXISTS ONLY public.loan_workflow_events DROP CONSTRAINT IF EXISTS loan_workflow_events_pkey;
ALTER TABLE IF EXISTS ONLY public.loan_repayment_schedule DROP CONSTRAINT IF EXISTS loan_repayment_schedule_pkey;
ALTER TABLE IF EXISTS ONLY public.loan_repayment_schedule DROP CONSTRAINT IF EXISTS loan_repayment_schedule_loan_id_installment_number_key;
ALTER TABLE IF EXISTS ONLY public.loan_recovery_actions DROP CONSTRAINT IF EXISTS loan_recovery_actions_pkey;
ALTER TABLE IF EXISTS ONLY public.loan_products DROP CONSTRAINT IF EXISTS loan_products_pkey;
ALTER TABLE IF EXISTS ONLY public.loan_products DROP CONSTRAINT IF EXISTS loan_products_name_key;
ALTER TABLE IF EXISTS ONLY public.loan_guarantors DROP CONSTRAINT IF EXISTS loan_guarantors_pkey;
ALTER TABLE IF EXISTS ONLY public.loan_guarantors DROP CONSTRAINT IF EXISTS loan_guarantors_loan_id_member_id_key;
ALTER TABLE IF EXISTS ONLY public.loan_disbursements DROP CONSTRAINT IF EXISTS loan_disbursements_transaction_reference_key;
ALTER TABLE IF EXISTS ONLY public.loan_disbursements DROP CONSTRAINT IF EXISTS loan_disbursements_pkey;
ALTER TABLE IF EXISTS ONLY public.loan_disbursements DROP CONSTRAINT IF EXISTS loan_disbursements_loan_id_key;
ALTER TABLE IF EXISTS ONLY public.loan_charges DROP CONSTRAINT IF EXISTS loan_charges_pkey;
ALTER TABLE IF EXISTS ONLY public.legal_policies DROP CONSTRAINT IF EXISTS legal_policies_reference_key;
ALTER TABLE IF EXISTS ONLY public.legal_policies DROP CONSTRAINT IF EXISTS legal_policies_pkey;
ALTER TABLE IF EXISTS ONLY public.legal_opinions DROP CONSTRAINT IF EXISTS legal_opinions_reference_key;
ALTER TABLE IF EXISTS ONLY public.legal_opinions DROP CONSTRAINT IF EXISTS legal_opinions_pkey;
ALTER TABLE IF EXISTS ONLY public.legal_court_matters DROP CONSTRAINT IF EXISTS legal_court_matters_pkey;
ALTER TABLE IF EXISTS ONLY public.legal_court_matters DROP CONSTRAINT IF EXISTS legal_court_matters_court_file_key;
ALTER TABLE IF EXISTS ONLY public.legal_contracts DROP CONSTRAINT IF EXISTS legal_contracts_pkey;
ALTER TABLE IF EXISTS ONLY public.legal_contracts DROP CONSTRAINT IF EXISTS legal_contracts_contract_number_key;
ALTER TABLE IF EXISTS ONLY public.legal_compliance DROP CONSTRAINT IF EXISTS legal_compliance_reference_key;
ALTER TABLE IF EXISTS ONLY public.legal_compliance DROP CONSTRAINT IF EXISTS legal_compliance_pkey;
ALTER TABLE IF EXISTS ONLY public.legal_complaints DROP CONSTRAINT IF EXISTS legal_complaints_pkey;
ALTER TABLE IF EXISTS ONLY public.legal_complaints DROP CONSTRAINT IF EXISTS legal_complaints_complaint_number_key;
ALTER TABLE IF EXISTS ONLY public.legal_cases DROP CONSTRAINT IF EXISTS legal_cases_pkey;
ALTER TABLE IF EXISTS ONLY public.legal_cases DROP CONSTRAINT IF EXISTS legal_cases_case_number_key;
ALTER TABLE IF EXISTS ONLY public.legacy_member_opening_balances DROP CONSTRAINT IF EXISTS legacy_member_opening_balances_pkey;
ALTER TABLE IF EXISTS ONLY public.legacy_member_opening_balances DROP CONSTRAINT IF EXISTS legacy_member_opening_balances_period_id_member_name_key;
ALTER TABLE IF EXISTS ONLY public.leadership_assignments DROP CONSTRAINT IF EXISTS leadership_assignments_user_id_body_position_title_key;
ALTER TABLE IF EXISTS ONLY public.leadership_assignments DROP CONSTRAINT IF EXISTS leadership_assignments_pkey;
ALTER TABLE IF EXISTS ONLY public.investment_transactions DROP CONSTRAINT IF EXISTS investment_transactions_reference_key;
ALTER TABLE IF EXISTS ONLY public.investment_transactions DROP CONSTRAINT IF EXISTS investment_transactions_pkey;
ALTER TABLE IF EXISTS ONLY public.investment_proposals DROP CONSTRAINT IF EXISTS investment_proposals_reference_key;
ALTER TABLE IF EXISTS ONLY public.investment_proposals DROP CONSTRAINT IF EXISTS investment_proposals_pkey;
ALTER TABLE IF EXISTS ONLY public.investment_projects DROP CONSTRAINT IF EXISTS investment_projects_reference_key;
ALTER TABLE IF EXISTS ONLY public.investment_projects DROP CONSTRAINT IF EXISTS investment_projects_pkey;
ALTER TABLE IF EXISTS ONLY public.investment_project_oversight DROP CONSTRAINT IF EXISTS investment_project_oversight_pkey;
ALTER TABLE IF EXISTS ONLY public.investment_investors DROP CONSTRAINT IF EXISTS investment_investors_pkey;
ALTER TABLE IF EXISTS ONLY public.investment_fund_accounts DROP CONSTRAINT IF EXISTS investment_fund_accounts_reference_key;
ALTER TABLE IF EXISTS ONLY public.investment_fund_accounts DROP CONSTRAINT IF EXISTS investment_fund_accounts_pkey;
ALTER TABLE IF EXISTS ONLY public.investment_contracts DROP CONSTRAINT IF EXISTS investment_contracts_reference_key;
ALTER TABLE IF EXISTS ONLY public.investment_contracts DROP CONSTRAINT IF EXISTS investment_contracts_pkey;
ALTER TABLE IF EXISTS ONLY public.investment_assets DROP CONSTRAINT IF EXISTS investment_assets_pkey;
ALTER TABLE IF EXISTS ONLY public.investment_assets DROP CONSTRAINT IF EXISTS investment_assets_asset_code_key;
ALTER TABLE IF EXISTS ONLY public.historical_investment_ledger DROP CONSTRAINT IF EXISTS historical_investment_ledger_pkey;
ALTER TABLE IF EXISTS ONLY public.historical_investment_ledger DROP CONSTRAINT IF EXISTS historical_investment_ledger_period_id_transaction_id_key;
ALTER TABLE IF EXISTS ONLY public.governance_records DROP CONSTRAINT IF EXISTS governance_records_reference_key;
ALTER TABLE IF EXISTS ONLY public.governance_records DROP CONSTRAINT IF EXISTS governance_records_pkey;
ALTER TABLE IF EXISTS ONLY public.governance_directives DROP CONSTRAINT IF EXISTS governance_directives_reference_key;
ALTER TABLE IF EXISTS ONLY public.governance_directives DROP CONSTRAINT IF EXISTS governance_directives_pkey;
ALTER TABLE IF EXISTS ONLY public.governance_bodies DROP CONSTRAINT IF EXISTS governance_bodies_pkey;
ALTER TABLE IF EXISTS ONLY public.governance_bodies DROP CONSTRAINT IF EXISTS governance_bodies_code_key;
ALTER TABLE IF EXISTS ONLY public.governance_appointments DROP CONSTRAINT IF EXISTS governance_appointments_pkey;
ALTER TABLE IF EXISTS ONLY public.governance_appointments DROP CONSTRAINT IF EXISTS governance_appointments_body_id_canonical_member_name_posit_key;
ALTER TABLE IF EXISTS ONLY public.financial_statement_lines DROP CONSTRAINT IF EXISTS financial_statement_lines_pkey;
ALTER TABLE IF EXISTS ONLY public.financial_statement_lines DROP CONSTRAINT IF EXISTS financial_statement_lines_period_id_statement_type_line_cod_key;
ALTER TABLE IF EXISTS ONLY public.financial_reporting_periods DROP CONSTRAINT IF EXISTS financial_reporting_periods_pkey;
ALTER TABLE IF EXISTS ONLY public.financial_reporting_periods DROP CONSTRAINT IF EXISTS financial_reporting_periods_period_end_key;
ALTER TABLE IF EXISTS ONLY public.finance_procurements DROP CONSTRAINT IF EXISTS finance_procurements_reference_key;
ALTER TABLE IF EXISTS ONLY public.finance_procurements DROP CONSTRAINT IF EXISTS finance_procurements_pkey;
ALTER TABLE IF EXISTS ONLY public.finance_payment_vouchers DROP CONSTRAINT IF EXISTS finance_payment_vouchers_voucher_number_key;
ALTER TABLE IF EXISTS ONLY public.finance_payment_vouchers DROP CONSTRAINT IF EXISTS finance_payment_vouchers_pkey;
ALTER TABLE IF EXISTS ONLY public.finance_invoices DROP CONSTRAINT IF EXISTS finance_invoices_pkey;
ALTER TABLE IF EXISTS ONLY public.finance_invoices DROP CONSTRAINT IF EXISTS finance_invoices_invoice_number_key;
ALTER TABLE IF EXISTS ONLY public.finance_budgets DROP CONSTRAINT IF EXISTS finance_budgets_reference_key;
ALTER TABLE IF EXISTS ONLY public.finance_budgets DROP CONSTRAINT IF EXISTS finance_budgets_pkey;
ALTER TABLE IF EXISTS ONLY public.finance_budgets DROP CONSTRAINT IF EXISTS finance_budgets_department_id_fiscal_period_key;
ALTER TABLE IF EXISTS ONLY public.finance_assets DROP CONSTRAINT IF EXISTS finance_assets_pkey;
ALTER TABLE IF EXISTS ONLY public.finance_assets DROP CONSTRAINT IF EXISTS finance_assets_asset_code_key;
ALTER TABLE IF EXISTS ONLY public.finance_accounts DROP CONSTRAINT IF EXISTS finance_accounts_pkey;
ALTER TABLE IF EXISTS ONLY public.finance_accounts DROP CONSTRAINT IF EXISTS finance_accounts_account_code_key;
ALTER TABLE IF EXISTS ONLY public.departments DROP CONSTRAINT IF EXISTS departments_pkey;
ALTER TABLE IF EXISTS ONLY public.departments DROP CONSTRAINT IF EXISTS departments_code_key;
ALTER TABLE IF EXISTS ONLY public.department_assignments DROP CONSTRAINT IF EXISTS department_assignments_user_id_department_id_key;
ALTER TABLE IF EXISTS ONLY public.department_assignments DROP CONSTRAINT IF EXISTS department_assignments_pkey;
ALTER TABLE IF EXISTS ONLY public.department_activities DROP CONSTRAINT IF EXISTS department_activities_reference_key;
ALTER TABLE IF EXISTS ONLY public.department_activities DROP CONSTRAINT IF EXISTS department_activities_pkey;
ALTER TABLE IF EXISTS ONLY public.conversations DROP CONSTRAINT IF EXISTS conversations_pkey;
ALTER TABLE IF EXISTS ONLY public.conversations DROP CONSTRAINT IF EXISTS conversations_direct_unique;
ALTER TABLE IF EXISTS ONLY public.conversation_members DROP CONSTRAINT IF EXISTS conversation_members_pkey;
ALTER TABLE IF EXISTS ONLY public.branches DROP CONSTRAINT IF EXISTS branches_pkey;
ALTER TABLE IF EXISTS ONLY public.branches DROP CONSTRAINT IF EXISTS branches_code_key;
ALTER TABLE IF EXISTS ONLY public.audit_risks DROP CONSTRAINT IF EXISTS audit_risks_risk_number_key;
ALTER TABLE IF EXISTS ONLY public.audit_risks DROP CONSTRAINT IF EXISTS audit_risks_pkey;
ALTER TABLE IF EXISTS ONLY public.audit_recommendations DROP CONSTRAINT IF EXISTS audit_recommendations_recommendation_number_key;
ALTER TABLE IF EXISTS ONLY public.audit_recommendations DROP CONSTRAINT IF EXISTS audit_recommendations_pkey;
ALTER TABLE IF EXISTS ONLY public.audit_plans DROP CONSTRAINT IF EXISTS audit_plans_pkey;
ALTER TABLE IF EXISTS ONLY public.audit_plans DROP CONSTRAINT IF EXISTS audit_plans_audit_number_key;
ALTER TABLE IF EXISTS ONLY public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_pkey;
ALTER TABLE IF EXISTS ONLY public.audit_investigations DROP CONSTRAINT IF EXISTS audit_investigations_pkey;
ALTER TABLE IF EXISTS ONLY public.audit_investigations DROP CONSTRAINT IF EXISTS audit_investigations_investigation_number_key;
ALTER TABLE IF EXISTS ONLY public.audit_fraud_alerts DROP CONSTRAINT IF EXISTS audit_fraud_alerts_pkey;
ALTER TABLE IF EXISTS ONLY public.audit_fraud_alerts DROP CONSTRAINT IF EXISTS audit_fraud_alerts_alert_number_key;
ALTER TABLE IF EXISTS ONLY public.audit_findings DROP CONSTRAINT IF EXISTS audit_findings_pkey;
ALTER TABLE IF EXISTS ONLY public.audit_findings DROP CONSTRAINT IF EXISTS audit_findings_finding_number_key;
ALTER TABLE IF EXISTS ONLY public.audit_compliance DROP CONSTRAINT IF EXISTS audit_compliance_reference_key;
ALTER TABLE IF EXISTS ONLY public.audit_compliance DROP CONSTRAINT IF EXISTS audit_compliance_pkey;
ALTER TABLE IF EXISTS ONLY public.announcements DROP CONSTRAINT IF EXISTS announcements_pkey;
ALTER TABLE IF EXISTS public.withdrawals ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.welfare_requests ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.welfare_payments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.welfare_contributions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.welfare_committee_meetings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.welfare_activities ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.transactions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.supervisory_site_visits ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.supervisory_scorecards ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.supervisory_resolutions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.supervisory_recommendations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.supervisory_projects ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.supervisory_kpis ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.supervisory_followups ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.supervisory_executive_monitoring ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.supervisory_complaints ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.supervisory_committees ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.organizations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.organization_meetings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.organization_finance_entries ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.organization_documents ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.organization_document_versions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.notifications ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.messages ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.message_attachments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.membership_status_records ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.members ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.member_support_requests ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.member_investment_applications ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.member_financial_year_policies ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.member_family_records ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.member_department_profiles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.loans ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.loan_workflow_events ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.loan_repayment_schedule ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.loan_recovery_actions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.loan_products ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.loan_guarantors ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.loan_disbursements ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.loan_charges ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.legal_policies ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.legal_opinions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.legal_court_matters ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.legal_contracts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.legal_compliance ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.legal_complaints ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.legal_cases ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.legacy_member_opening_balances ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.leadership_assignments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.investment_transactions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.investment_proposals ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.investment_projects ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.investment_project_oversight ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.investment_investors ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.investment_fund_accounts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.investment_contracts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.investment_assets ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.historical_investment_ledger ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.governance_records ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.governance_directives ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.governance_bodies ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.governance_appointments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.financial_statement_lines ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.financial_reporting_periods ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.finance_procurements ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.finance_payment_vouchers ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.finance_invoices ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.finance_budgets ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.finance_assets ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.finance_accounts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.departments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.department_assignments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.department_activities ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.conversations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.branches ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.audit_risks ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.audit_recommendations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.audit_plans ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.audit_logs ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.audit_investigations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.audit_fraud_alerts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.audit_findings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.audit_compliance ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.announcements ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.withdrawals_id_seq;
DROP TABLE IF EXISTS public.withdrawals;
DROP SEQUENCE IF EXISTS public.welfare_requests_id_seq;
DROP TABLE IF EXISTS public.welfare_requests;
DROP SEQUENCE IF EXISTS public.welfare_payments_id_seq;
DROP TABLE IF EXISTS public.welfare_payments;
DROP SEQUENCE IF EXISTS public.welfare_contributions_id_seq;
DROP TABLE IF EXISTS public.welfare_contributions;
DROP SEQUENCE IF EXISTS public.welfare_committee_meetings_id_seq;
DROP TABLE IF EXISTS public.welfare_committee_meetings;
DROP SEQUENCE IF EXISTS public.welfare_activities_id_seq;
DROP TABLE IF EXISTS public.welfare_activities;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.transactions_id_seq;
DROP TABLE IF EXISTS public.transactions;
DROP SEQUENCE IF EXISTS public.supervisory_site_visits_id_seq;
DROP TABLE IF EXISTS public.supervisory_site_visits;
DROP SEQUENCE IF EXISTS public.supervisory_scorecards_id_seq;
DROP TABLE IF EXISTS public.supervisory_scorecards;
DROP SEQUENCE IF EXISTS public.supervisory_resolutions_id_seq;
DROP TABLE IF EXISTS public.supervisory_resolutions;
DROP SEQUENCE IF EXISTS public.supervisory_recommendations_id_seq;
DROP TABLE IF EXISTS public.supervisory_recommendations;
DROP SEQUENCE IF EXISTS public.supervisory_projects_id_seq;
DROP TABLE IF EXISTS public.supervisory_projects;
DROP SEQUENCE IF EXISTS public.supervisory_kpis_id_seq;
DROP TABLE IF EXISTS public.supervisory_kpis;
DROP SEQUENCE IF EXISTS public.supervisory_followups_id_seq;
DROP TABLE IF EXISTS public.supervisory_followups;
DROP SEQUENCE IF EXISTS public.supervisory_executive_monitoring_id_seq;
DROP TABLE IF EXISTS public.supervisory_executive_monitoring;
DROP SEQUENCE IF EXISTS public.supervisory_complaints_id_seq;
DROP TABLE IF EXISTS public.supervisory_complaints;
DROP SEQUENCE IF EXISTS public.supervisory_committees_id_seq;
DROP TABLE IF EXISTS public.supervisory_committees;
DROP TABLE IF EXISTS public.settings;
DROP TABLE IF EXISTS public.schema_migrations;
DROP SEQUENCE IF EXISTS public.organizations_id_seq;
DROP TABLE IF EXISTS public.organizations;
DROP TABLE IF EXISTS public.organization_policy_settings;
DROP SEQUENCE IF EXISTS public.organization_meetings_id_seq;
DROP TABLE IF EXISTS public.organization_meetings;
DROP SEQUENCE IF EXISTS public.organization_finance_entries_id_seq;
DROP TABLE IF EXISTS public.organization_finance_entries;
DROP SEQUENCE IF EXISTS public.organization_documents_id_seq;
DROP TABLE IF EXISTS public.organization_documents;
DROP SEQUENCE IF EXISTS public.organization_document_versions_id_seq;
DROP TABLE IF EXISTS public.organization_document_versions;
DROP SEQUENCE IF EXISTS public.notifications_id_seq;
DROP TABLE IF EXISTS public.notifications;
DROP SEQUENCE IF EXISTS public.messages_id_seq;
DROP TABLE IF EXISTS public.messages;
DROP TABLE IF EXISTS public.message_stars;
DROP TABLE IF EXISTS public.message_reads;
DROP TABLE IF EXISTS public.message_reactions;
DROP TABLE IF EXISTS public.message_mentions;
DROP SEQUENCE IF EXISTS public.message_attachments_id_seq;
DROP TABLE IF EXISTS public.message_attachments;
DROP SEQUENCE IF EXISTS public.membership_status_records_id_seq;
DROP TABLE IF EXISTS public.membership_status_records;
DROP SEQUENCE IF EXISTS public.members_id_seq;
DROP TABLE IF EXISTS public.members;
DROP SEQUENCE IF EXISTS public.member_support_requests_id_seq;
DROP TABLE IF EXISTS public.member_support_requests;
DROP SEQUENCE IF EXISTS public.member_investment_applications_id_seq;
DROP TABLE IF EXISTS public.member_investment_applications;
DROP SEQUENCE IF EXISTS public.member_financial_year_policies_id_seq;
DROP TABLE IF EXISTS public.member_financial_year_policies;
DROP SEQUENCE IF EXISTS public.member_family_records_id_seq;
DROP TABLE IF EXISTS public.member_family_records;
DROP SEQUENCE IF EXISTS public.member_department_profiles_id_seq;
DROP TABLE IF EXISTS public.member_department_profiles;
DROP TABLE IF EXISTS public.member_bio_data;
DROP SEQUENCE IF EXISTS public.loans_id_seq;
DROP TABLE IF EXISTS public.loans;
DROP SEQUENCE IF EXISTS public.loan_workflow_events_id_seq;
DROP TABLE IF EXISTS public.loan_workflow_events;
DROP SEQUENCE IF EXISTS public.loan_repayment_schedule_id_seq;
DROP TABLE IF EXISTS public.loan_repayment_schedule;
DROP SEQUENCE IF EXISTS public.loan_recovery_actions_id_seq;
DROP TABLE IF EXISTS public.loan_recovery_actions;
DROP SEQUENCE IF EXISTS public.loan_products_id_seq;
DROP TABLE IF EXISTS public.loan_products;
DROP SEQUENCE IF EXISTS public.loan_guarantors_id_seq;
DROP TABLE IF EXISTS public.loan_guarantors;
DROP SEQUENCE IF EXISTS public.loan_disbursements_id_seq;
DROP TABLE IF EXISTS public.loan_disbursements;
DROP SEQUENCE IF EXISTS public.loan_charges_id_seq;
DROP TABLE IF EXISTS public.loan_charges;
DROP SEQUENCE IF EXISTS public.legal_policies_id_seq;
DROP TABLE IF EXISTS public.legal_policies;
DROP SEQUENCE IF EXISTS public.legal_opinions_id_seq;
DROP TABLE IF EXISTS public.legal_opinions;
DROP SEQUENCE IF EXISTS public.legal_court_matters_id_seq;
DROP TABLE IF EXISTS public.legal_court_matters;
DROP SEQUENCE IF EXISTS public.legal_contracts_id_seq;
DROP TABLE IF EXISTS public.legal_contracts;
DROP SEQUENCE IF EXISTS public.legal_compliance_id_seq;
DROP TABLE IF EXISTS public.legal_compliance;
DROP SEQUENCE IF EXISTS public.legal_complaints_id_seq;
DROP TABLE IF EXISTS public.legal_complaints;
DROP SEQUENCE IF EXISTS public.legal_cases_id_seq;
DROP TABLE IF EXISTS public.legal_cases;
DROP SEQUENCE IF EXISTS public.legacy_member_opening_balances_id_seq;
DROP TABLE IF EXISTS public.legacy_member_opening_balances;
DROP SEQUENCE IF EXISTS public.leadership_assignments_id_seq;
DROP TABLE IF EXISTS public.leadership_assignments;
DROP SEQUENCE IF EXISTS public.investment_transactions_id_seq;
DROP TABLE IF EXISTS public.investment_transactions;
DROP SEQUENCE IF EXISTS public.investment_proposals_id_seq;
DROP TABLE IF EXISTS public.investment_proposals;
DROP SEQUENCE IF EXISTS public.investment_projects_id_seq;
DROP TABLE IF EXISTS public.investment_projects;
DROP SEQUENCE IF EXISTS public.investment_project_oversight_id_seq;
DROP TABLE IF EXISTS public.investment_project_oversight;
DROP SEQUENCE IF EXISTS public.investment_investors_id_seq;
DROP TABLE IF EXISTS public.investment_investors;
DROP SEQUENCE IF EXISTS public.investment_fund_accounts_id_seq;
DROP TABLE IF EXISTS public.investment_fund_accounts;
DROP SEQUENCE IF EXISTS public.investment_contracts_id_seq;
DROP TABLE IF EXISTS public.investment_contracts;
DROP SEQUENCE IF EXISTS public.investment_assets_id_seq;
DROP TABLE IF EXISTS public.investment_assets;
DROP SEQUENCE IF EXISTS public.historical_investment_ledger_id_seq;
DROP TABLE IF EXISTS public.historical_investment_ledger;
DROP SEQUENCE IF EXISTS public.governance_records_id_seq;
DROP TABLE IF EXISTS public.governance_records;
DROP SEQUENCE IF EXISTS public.governance_directives_id_seq;
DROP TABLE IF EXISTS public.governance_directives;
DROP SEQUENCE IF EXISTS public.governance_bodies_id_seq;
DROP TABLE IF EXISTS public.governance_bodies;
DROP SEQUENCE IF EXISTS public.governance_appointments_id_seq;
DROP TABLE IF EXISTS public.governance_appointments;
DROP SEQUENCE IF EXISTS public.financial_statement_lines_id_seq;
DROP TABLE IF EXISTS public.financial_statement_lines;
DROP SEQUENCE IF EXISTS public.financial_reporting_periods_id_seq;
DROP TABLE IF EXISTS public.financial_reporting_periods;
DROP SEQUENCE IF EXISTS public.finance_procurements_id_seq;
DROP TABLE IF EXISTS public.finance_procurements;
DROP SEQUENCE IF EXISTS public.finance_payment_vouchers_id_seq;
DROP TABLE IF EXISTS public.finance_payment_vouchers;
DROP SEQUENCE IF EXISTS public.finance_invoices_id_seq;
DROP TABLE IF EXISTS public.finance_invoices;
DROP SEQUENCE IF EXISTS public.finance_budgets_id_seq;
DROP TABLE IF EXISTS public.finance_budgets;
DROP SEQUENCE IF EXISTS public.finance_assets_id_seq;
DROP TABLE IF EXISTS public.finance_assets;
DROP SEQUENCE IF EXISTS public.finance_accounts_id_seq;
DROP TABLE IF EXISTS public.finance_accounts;
DROP SEQUENCE IF EXISTS public.departments_id_seq;
DROP TABLE IF EXISTS public.departments;
DROP SEQUENCE IF EXISTS public.department_assignments_id_seq;
DROP TABLE IF EXISTS public.department_assignments;
DROP SEQUENCE IF EXISTS public.department_activities_id_seq;
DROP TABLE IF EXISTS public.department_activities;
DROP SEQUENCE IF EXISTS public.conversations_id_seq;
DROP TABLE IF EXISTS public.conversations;
DROP TABLE IF EXISTS public.conversation_members;
DROP SEQUENCE IF EXISTS public.branches_id_seq;
DROP TABLE IF EXISTS public.branches;
DROP SEQUENCE IF EXISTS public.audit_risks_id_seq;
DROP TABLE IF EXISTS public.audit_risks;
DROP SEQUENCE IF EXISTS public.audit_recommendations_id_seq;
DROP TABLE IF EXISTS public.audit_recommendations;
DROP SEQUENCE IF EXISTS public.audit_plans_id_seq;
DROP TABLE IF EXISTS public.audit_plans;
DROP SEQUENCE IF EXISTS public.audit_logs_id_seq;
DROP TABLE IF EXISTS public.audit_logs;
DROP SEQUENCE IF EXISTS public.audit_investigations_id_seq;
DROP TABLE IF EXISTS public.audit_investigations;
DROP SEQUENCE IF EXISTS public.audit_fraud_alerts_id_seq;
DROP TABLE IF EXISTS public.audit_fraud_alerts;
DROP SEQUENCE IF EXISTS public.audit_findings_id_seq;
DROP TABLE IF EXISTS public.audit_findings;
DROP SEQUENCE IF EXISTS public.audit_compliance_id_seq;
DROP TABLE IF EXISTS public.audit_compliance;
DROP SEQUENCE IF EXISTS public.announcements_id_seq;
DROP TABLE IF EXISTS public.announcements;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: announcements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.announcements (
    id bigint NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    created_by bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: announcements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.announcements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: announcements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.announcements_id_seq OWNED BY public.announcements.id;


--
-- Name: audit_compliance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_compliance (
    id bigint NOT NULL,
    reference text NOT NULL,
    department_id bigint NOT NULL,
    compliance_area text NOT NULL,
    compliance_score numeric(5,2) DEFAULT 100 NOT NULL,
    status text DEFAULT 'compliant'::text NOT NULL,
    finding_summary text,
    corrective_action text,
    responsible_officer text,
    review_date date,
    reviewed_by bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: audit_compliance_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_compliance_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_compliance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_compliance_id_seq OWNED BY public.audit_compliance.id;


--
-- Name: audit_findings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_findings (
    id bigint NOT NULL,
    finding_number text NOT NULL,
    audit_id bigint,
    department_id bigint,
    description text NOT NULL,
    evidence text NOT NULL,
    risk_level text NOT NULL,
    recommendation text NOT NULL,
    responsible_department bigint,
    due_date date,
    status text DEFAULT 'open'::text NOT NULL,
    supporting_document text,
    repeat_finding boolean DEFAULT false NOT NULL,
    created_by bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    resolved_at timestamp with time zone,
    CONSTRAINT audit_findings_risk_level_check CHECK ((risk_level = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text])))
);


--
-- Name: audit_findings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_findings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_findings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_findings_id_seq OWNED BY public.audit_findings.id;


--
-- Name: audit_fraud_alerts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_fraud_alerts (
    id bigint NOT NULL,
    alert_number text NOT NULL,
    source_type text NOT NULL,
    source_reference text,
    department_id bigint,
    rule_name text NOT NULL,
    description text NOT NULL,
    amount numeric(18,2),
    risk_score integer NOT NULL,
    status text DEFAULT 'new'::text NOT NULL,
    assigned_auditor text,
    review_notes text,
    detected_at timestamp with time zone DEFAULT now() NOT NULL,
    reviewed_at timestamp with time zone,
    reviewed_by bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT audit_fraud_alerts_risk_score_check CHECK (((risk_score >= 0) AND (risk_score <= 100)))
);


--
-- Name: audit_fraud_alerts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_fraud_alerts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_fraud_alerts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_fraud_alerts_id_seq OWNED BY public.audit_fraud_alerts.id;


--
-- Name: audit_investigations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_investigations (
    id bigint NOT NULL,
    investigation_number text NOT NULL,
    case_description text NOT NULL,
    lead_auditor text NOT NULL,
    departments_involved text NOT NULL,
    evidence text,
    interviews text,
    findings text,
    recommendations text,
    final_report text,
    status text DEFAULT 'open'::text NOT NULL,
    priority text DEFAULT 'medium'::text NOT NULL,
    opened_at timestamp with time zone DEFAULT now() NOT NULL,
    closed_at timestamp with time zone,
    created_by bigint NOT NULL,
    authorized_closed_by bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: audit_investigations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_investigations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_investigations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_investigations_id_seq OWNED BY public.audit_investigations.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id bigint NOT NULL,
    user_id bigint,
    action text NOT NULL,
    entity_type text,
    entity_id text,
    details text,
    ip_address text,
    user_agent text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: audit_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_plans (
    id bigint NOT NULL,
    audit_number text NOT NULL,
    audit_type text NOT NULL,
    department_id bigint,
    audit_period text NOT NULL,
    lead_auditor text NOT NULL,
    audit_team text,
    objective text NOT NULL,
    scope text NOT NULL,
    status text DEFAULT 'planned'::text NOT NULL,
    planned_date date NOT NULL,
    started_at timestamp with time zone,
    completion_date date,
    created_by bigint NOT NULL,
    approved_by bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: audit_plans_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_plans_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_plans_id_seq OWNED BY public.audit_plans.id;


--
-- Name: audit_recommendations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_recommendations (
    id bigint NOT NULL,
    recommendation_number text NOT NULL,
    finding_id bigint,
    department_id bigint,
    description text NOT NULL,
    issued_on date DEFAULT CURRENT_DATE NOT NULL,
    due_date date,
    status text DEFAULT 'issued'::text NOT NULL,
    department_response text,
    follow_up_date date,
    verified_by bigint,
    completed_at timestamp with time zone,
    created_by bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: audit_recommendations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_recommendations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_recommendations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_recommendations_id_seq OWNED BY public.audit_recommendations.id;


--
-- Name: audit_risks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_risks (
    id bigint NOT NULL,
    risk_number text NOT NULL,
    department_id bigint,
    risk_category text NOT NULL,
    description text NOT NULL,
    likelihood integer NOT NULL,
    impact integer NOT NULL,
    risk_level text NOT NULL,
    mitigation_plan text NOT NULL,
    risk_owner text,
    status text DEFAULT 'open'::text NOT NULL,
    last_reviewed_at timestamp with time zone,
    created_by bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT audit_risks_impact_check CHECK (((impact >= 1) AND (impact <= 5))),
    CONSTRAINT audit_risks_likelihood_check CHECK (((likelihood >= 1) AND (likelihood <= 5)))
);


--
-- Name: audit_risks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_risks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_risks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_risks_id_seq OWNED BY public.audit_risks.id;


--
-- Name: branches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.branches (
    id bigint NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    address text,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: branches_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.branches_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: branches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.branches_id_seq OWNED BY public.branches.id;


--
-- Name: conversation_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversation_members (
    conversation_id bigint NOT NULL,
    user_id bigint NOT NULL,
    member_role text DEFAULT 'member'::text NOT NULL,
    joined_at timestamp with time zone DEFAULT now() NOT NULL,
    muted_until timestamp with time zone,
    archived boolean DEFAULT false NOT NULL,
    last_read_at timestamp with time zone
);


--
-- Name: conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversations (
    id bigint NOT NULL,
    user_low bigint,
    user_high bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    last_message_at timestamp with time zone DEFAULT now() NOT NULL,
    type text DEFAULT 'direct'::text NOT NULL,
    title text,
    description text,
    created_by bigint,
    only_admins_can_post boolean DEFAULT false NOT NULL,
    avatar_color text DEFAULT '#1d6449'::text NOT NULL,
    CONSTRAINT conversations_distinct_users CHECK ((user_low <> user_high))
);


--
-- Name: conversations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.conversations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: conversations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.conversations_id_seq OWNED BY public.conversations.id;


--
-- Name: department_activities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.department_activities (
    id bigint NOT NULL,
    department_id bigint NOT NULL,
    reference text NOT NULL,
    activity_type text NOT NULL,
    title text NOT NULL,
    description text,
    amount numeric(18,2),
    status text DEFAULT 'draft'::text NOT NULL,
    visibility_level integer DEFAULT 1 NOT NULL,
    created_by bigint NOT NULL,
    assigned_to bigint,
    approved_by bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    approved_at timestamp with time zone,
    decision_comment text,
    decision_by bigint,
    decision_at timestamp with time zone,
    CONSTRAINT department_activities_visibility_level_check CHECK (((visibility_level >= 1) AND (visibility_level <= 5)))
);


--
-- Name: department_activities_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.department_activities_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: department_activities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.department_activities_id_seq OWNED BY public.department_activities.id;


--
-- Name: department_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.department_assignments (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    department_id bigint NOT NULL,
    position_title text NOT NULL,
    authority_level integer DEFAULT 1 NOT NULL,
    can_view boolean DEFAULT true NOT NULL,
    can_create boolean DEFAULT false NOT NULL,
    can_edit boolean DEFAULT false NOT NULL,
    can_approve boolean DEFAULT false NOT NULL,
    is_head boolean DEFAULT false NOT NULL,
    assigned_by bigint,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT department_assignments_authority_level_check CHECK (((authority_level >= 1) AND (authority_level <= 5)))
);


--
-- Name: department_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.department_assignments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: department_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.department_assignments_id_seq OWNED BY public.department_assignments.id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.departments (
    id bigint NOT NULL,
    organization_id bigint NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.departments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- Name: finance_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.finance_accounts (
    id bigint NOT NULL,
    account_code text NOT NULL,
    account_name text NOT NULL,
    account_type text NOT NULL,
    bank_name text,
    account_number text,
    balance numeric(18,2) DEFAULT 0 NOT NULL,
    restricted boolean DEFAULT false NOT NULL,
    active boolean DEFAULT true NOT NULL,
    last_reconciled_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by bigint,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    opening_balance numeric(18,2) DEFAULT 0 NOT NULL,
    opening_balance_date date,
    notes text,
    supporting_document text,
    supporting_document_name text
);


--
-- Name: finance_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.finance_accounts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: finance_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.finance_accounts_id_seq OWNED BY public.finance_accounts.id;


--
-- Name: finance_assets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.finance_assets (
    id bigint NOT NULL,
    asset_code text NOT NULL,
    asset_name text NOT NULL,
    asset_type text NOT NULL,
    purchase_date date NOT NULL,
    purchase_value numeric(18,2) NOT NULL,
    current_value numeric(18,2) NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    department_id bigint,
    location text,
    custodian text,
    created_by bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    photo_url text,
    supporting_document text
);


--
-- Name: finance_assets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.finance_assets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: finance_assets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.finance_assets_id_seq OWNED BY public.finance_assets.id;


--
-- Name: finance_budgets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.finance_budgets (
    id bigint NOT NULL,
    reference text NOT NULL,
    department_id bigint NOT NULL,
    fiscal_period text NOT NULL,
    allocated_amount numeric(18,2) NOT NULL,
    used_amount numeric(18,2) DEFAULT 0 NOT NULL,
    status text DEFAULT 'approved'::text NOT NULL,
    created_by bigint NOT NULL,
    approved_by bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    executive_activity_id bigint,
    CONSTRAINT finance_budgets_allocated_amount_check CHECK ((allocated_amount >= (0)::numeric)),
    CONSTRAINT finance_budgets_used_amount_check CHECK ((used_amount >= (0)::numeric))
);


--
-- Name: finance_budgets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.finance_budgets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: finance_budgets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.finance_budgets_id_seq OWNED BY public.finance_budgets.id;


--
-- Name: finance_invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.finance_invoices (
    id bigint NOT NULL,
    invoice_number text NOT NULL,
    supplier text NOT NULL,
    description text NOT NULL,
    amount numeric(18,2) NOT NULL,
    invoice_date date NOT NULL,
    due_date date NOT NULL,
    status text DEFAULT 'unpaid'::text NOT NULL,
    voucher_id bigint,
    supporting_document text,
    created_by bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT finance_invoices_amount_check CHECK ((amount > (0)::numeric))
);


--
-- Name: finance_invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.finance_invoices_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: finance_invoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.finance_invoices_id_seq OWNED BY public.finance_invoices.id;


--
-- Name: finance_payment_vouchers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.finance_payment_vouchers (
    id bigint NOT NULL,
    voucher_number text NOT NULL,
    department_id bigint NOT NULL,
    supplier text NOT NULL,
    description text NOT NULL,
    category text NOT NULL,
    budget_line text NOT NULL,
    amount numeric(18,2) NOT NULL,
    payment_method text,
    status text DEFAULT 'finance_review'::text NOT NULL,
    supporting_document text,
    requested_by bigint NOT NULL,
    finance_reviewed_by bigint,
    executive_approved_by bigint,
    processed_by bigint,
    finance_comment text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    finance_reviewed_at timestamp with time zone,
    executive_approved_at timestamp with time zone,
    processed_at timestamp with time zone,
    executive_activity_id bigint,
    CONSTRAINT finance_payment_vouchers_amount_check CHECK ((amount > (0)::numeric))
);


--
-- Name: finance_payment_vouchers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.finance_payment_vouchers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: finance_payment_vouchers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.finance_payment_vouchers_id_seq OWNED BY public.finance_payment_vouchers.id;


--
-- Name: finance_procurements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.finance_procurements (
    id bigint NOT NULL,
    reference text NOT NULL,
    department_id bigint NOT NULL,
    item_description text NOT NULL,
    supplier text,
    estimated_amount numeric(18,2) NOT NULL,
    approved_amount numeric(18,2),
    stage text DEFAULT 'department_request'::text NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    requested_by bigint NOT NULL,
    finance_reviewed_by bigint,
    executive_approved_by bigint,
    purchase_order_number text,
    goods_received_at timestamp with time zone,
    invoice_id bigint,
    voucher_id bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: finance_procurements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.finance_procurements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: finance_procurements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.finance_procurements_id_seq OWNED BY public.finance_procurements.id;


--
-- Name: financial_reporting_periods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.financial_reporting_periods (
    id bigint NOT NULL,
    fiscal_year integer NOT NULL,
    period_end date NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    currency text DEFAULT 'UGX'::text NOT NULL,
    source_name text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: financial_reporting_periods_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.financial_reporting_periods_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: financial_reporting_periods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.financial_reporting_periods_id_seq OWNED BY public.financial_reporting_periods.id;


--
-- Name: financial_statement_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.financial_statement_lines (
    id bigint NOT NULL,
    period_id bigint NOT NULL,
    statement_type text NOT NULL,
    line_code text NOT NULL,
    line_name text NOT NULL,
    note_number text,
    current_amount numeric(20,2),
    prior_amount numeric(20,2),
    variance numeric(20,2),
    sort_order integer DEFAULT 0 NOT NULL
);


--
-- Name: financial_statement_lines_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.financial_statement_lines_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: financial_statement_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.financial_statement_lines_id_seq OWNED BY public.financial_statement_lines.id;


--
-- Name: governance_appointments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.governance_appointments (
    id bigint NOT NULL,
    body_id bigint NOT NULL,
    legacy_balance_id bigint,
    linked_member_id bigint,
    member_name_as_recorded text NOT NULL,
    canonical_member_name text NOT NULL,
    position_title text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    source_document_id bigint,
    notes text,
    appointed_at date,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: governance_appointments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.governance_appointments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: governance_appointments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.governance_appointments_id_seq OWNED BY public.governance_appointments.id;


--
-- Name: governance_bodies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.governance_bodies (
    id bigint NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    body_type text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: governance_bodies_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.governance_bodies_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: governance_bodies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.governance_bodies_id_seq OWNED BY public.governance_bodies.id;


--
-- Name: governance_directives; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.governance_directives (
    id bigint NOT NULL,
    reference text NOT NULL,
    title text NOT NULL,
    details text NOT NULL,
    applies_to text NOT NULL,
    due_date date,
    recurrence text,
    status text DEFAULT 'open'::text NOT NULL,
    source_document_id bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: governance_directives_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.governance_directives_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: governance_directives_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.governance_directives_id_seq OWNED BY public.governance_directives.id;


--
-- Name: governance_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.governance_records (
    id bigint NOT NULL,
    department_id bigint NOT NULL,
    reference text NOT NULL,
    record_type text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    severity text,
    status text DEFAULT 'open'::text NOT NULL,
    visibility_level integer DEFAULT 3 NOT NULL,
    created_by bigint NOT NULL,
    assigned_to bigint,
    resolved_by bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    resolved_at timestamp with time zone
);


--
-- Name: governance_records_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.governance_records_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: governance_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.governance_records_id_seq OWNED BY public.governance_records.id;


--
-- Name: historical_investment_ledger; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.historical_investment_ledger (
    id bigint NOT NULL,
    period_id bigint NOT NULL,
    transaction_id text NOT NULL,
    transaction_date date NOT NULL,
    account_name text NOT NULL,
    account_code text,
    entry_type text NOT NULL,
    amount numeric(20,2) NOT NULL,
    source_reference text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT historical_investment_ledger_amount_check CHECK ((amount > (0)::numeric)),
    CONSTRAINT historical_investment_ledger_entry_type_check CHECK ((entry_type = ANY (ARRAY['debit'::text, 'credit'::text])))
);


--
-- Name: historical_investment_ledger_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.historical_investment_ledger_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: historical_investment_ledger_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.historical_investment_ledger_id_seq OWNED BY public.historical_investment_ledger.id;


--
-- Name: investment_assets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.investment_assets (
    id bigint NOT NULL,
    asset_code text NOT NULL,
    project_id bigint,
    asset_name text NOT NULL,
    asset_type text NOT NULL,
    acquisition_value numeric(18,2) NOT NULL,
    current_value numeric(18,2) DEFAULT 0 NOT NULL,
    location text,
    status text DEFAULT 'active'::text NOT NULL,
    created_by bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    photo_url text,
    supporting_document text,
    CONSTRAINT investment_assets_acquisition_value_check CHECK ((acquisition_value >= (0)::numeric))
);


--
-- Name: investment_assets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.investment_assets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: investment_assets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.investment_assets_id_seq OWNED BY public.investment_assets.id;


--
-- Name: investment_contracts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.investment_contracts (
    id bigint NOT NULL,
    reference text NOT NULL,
    project_id bigint,
    contract_type text NOT NULL,
    counterparty text NOT NULL,
    title text NOT NULL,
    contract_value numeric(18,2) DEFAULT 0 NOT NULL,
    starts_on date,
    ends_on date,
    status text DEFAULT 'active'::text NOT NULL,
    document_reference text,
    created_by bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    legal_contract_id bigint
);


--
-- Name: investment_contracts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.investment_contracts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: investment_contracts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.investment_contracts_id_seq OWNED BY public.investment_contracts.id;


--
-- Name: investment_fund_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.investment_fund_accounts (
    id bigint NOT NULL,
    reference text NOT NULL,
    institution_name text NOT NULL,
    fund_name text NOT NULL,
    bank_name text,
    bank_account_number text,
    bank_branch text,
    amount_invested numeric(18,2) DEFAULT 0 NOT NULL,
    current_value numeric(18,2) DEFAULT 0 NOT NULL,
    returns_earned numeric(18,2) DEFAULT 0 NOT NULL,
    invested_on date,
    report_as_at date,
    status text DEFAULT 'active'::text NOT NULL,
    source_reference text,
    created_by bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: investment_fund_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.investment_fund_accounts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: investment_fund_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.investment_fund_accounts_id_seq OWNED BY public.investment_fund_accounts.id;


--
-- Name: investment_investors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.investment_investors (
    id bigint NOT NULL,
    project_id bigint NOT NULL,
    member_id bigint,
    investor_name text NOT NULL,
    funding_source text DEFAULT 'Member investment'::text NOT NULL,
    amount_invested numeric(18,2) NOT NULL,
    ownership_percentage numeric(8,3) DEFAULT 0 NOT NULL,
    expected_returns numeric(18,2) DEFAULT 0 NOT NULL,
    payments_received numeric(18,2) DEFAULT 0 NOT NULL,
    investment_date date DEFAULT CURRENT_DATE NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_by bigint NOT NULL,
    CONSTRAINT investment_investors_amount_invested_check CHECK ((amount_invested > (0)::numeric))
);


--
-- Name: investment_investors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.investment_investors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: investment_investors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.investment_investors_id_seq OWNED BY public.investment_investors.id;


--
-- Name: investment_project_oversight; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.investment_project_oversight (
    id bigint NOT NULL,
    project_id bigint NOT NULL,
    action_type text NOT NULL,
    target_department_id bigint,
    previous_status text,
    new_status text,
    comment text NOT NULL,
    created_by bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: investment_project_oversight_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.investment_project_oversight_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: investment_project_oversight_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.investment_project_oversight_id_seq OWNED BY public.investment_project_oversight.id;


--
-- Name: investment_projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.investment_projects (
    id bigint NOT NULL,
    reference text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    target_amount numeric(18,2) NOT NULL,
    raised_amount numeric(18,2) DEFAULT 0 NOT NULL,
    status text DEFAULT 'planning'::text NOT NULL,
    starts_on date,
    ends_on date,
    created_by bigint NOT NULL,
    approved_by bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    current_value numeric(18,2) DEFAULT 0 NOT NULL,
    expected_return numeric(18,2) DEFAULT 0 NOT NULL,
    performance_status text DEFAULT 'on_track'::text NOT NULL,
    category text,
    location text,
    manager_name text,
    responsible_department text,
    funding_source text,
    progress integer DEFAULT 0 NOT NULL,
    photo_url text,
    supporting_document text,
    open_to_members boolean DEFAULT false NOT NULL,
    minimum_member_investment numeric(18,2) DEFAULT 0 NOT NULL,
    member_expected_return_rate numeric(8,2) DEFAULT 0 NOT NULL,
    member_investment_deadline date,
    proposal_id bigint,
    executive_status text DEFAULT 'approved'::text NOT NULL,
    suspended_at timestamp with time zone,
    closed_at timestamp with time zone,
    CONSTRAINT investment_projects_progress_check CHECK (((progress >= 0) AND (progress <= 100)))
);


--
-- Name: investment_projects_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.investment_projects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: investment_projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.investment_projects_id_seq OWNED BY public.investment_projects.id;


--
-- Name: investment_proposals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.investment_proposals (
    id bigint NOT NULL,
    reference text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    category text NOT NULL,
    estimated_cost numeric(18,2) NOT NULL,
    expected_revenue numeric(18,2) DEFAULT 0 NOT NULL,
    expected_roi numeric(8,2) DEFAULT 0 NOT NULL,
    risk_assessment text NOT NULL,
    recommendation text,
    supporting_document text,
    status text DEFAULT 'investment_review'::text NOT NULL,
    executive_activity_id bigint,
    created_by bigint NOT NULL,
    reviewed_by bigint,
    approved_by bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    reviewed_at timestamp with time zone,
    approved_at timestamp with time zone,
    finance_reviewed_by bigint,
    finance_reviewed_at timestamp with time zone,
    finance_analysis text,
    finance_recommendation text,
    CONSTRAINT investment_proposals_estimated_cost_check CHECK ((estimated_cost > (0)::numeric))
);


--
-- Name: investment_proposals_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.investment_proposals_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: investment_proposals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.investment_proposals_id_seq OWNED BY public.investment_proposals.id;


--
-- Name: investment_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.investment_transactions (
    id bigint NOT NULL,
    reference text NOT NULL,
    project_id bigint NOT NULL,
    transaction_type text NOT NULL,
    category text NOT NULL,
    description text NOT NULL,
    amount numeric(18,2) NOT NULL,
    transaction_date date DEFAULT CURRENT_DATE NOT NULL,
    supporting_document text,
    recorded_by bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    finance_entry_id bigint,
    deleted_at timestamp with time zone,
    deleted_by bigint,
    CONSTRAINT investment_transactions_amount_check CHECK ((amount > (0)::numeric)),
    CONSTRAINT investment_transactions_transaction_type_check CHECK ((transaction_type = ANY (ARRAY['revenue'::text, 'expense'::text])))
);


--
-- Name: investment_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.investment_transactions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: investment_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.investment_transactions_id_seq OWNED BY public.investment_transactions.id;


--
-- Name: leadership_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leadership_assignments (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    body text NOT NULL,
    position_title text NOT NULL,
    leadership_level integer NOT NULL,
    starts_on date DEFAULT CURRENT_DATE NOT NULL,
    ends_on date,
    active boolean DEFAULT true NOT NULL,
    CONSTRAINT leadership_assignments_leadership_level_check CHECK (((leadership_level >= 1) AND (leadership_level <= 5)))
);


--
-- Name: leadership_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.leadership_assignments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: leadership_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.leadership_assignments_id_seq OWNED BY public.leadership_assignments.id;


--
-- Name: legacy_member_opening_balances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.legacy_member_opening_balances (
    id bigint NOT NULL,
    period_id bigint NOT NULL,
    source_row integer NOT NULL,
    member_name text NOT NULL,
    share_capital numeric(20,2) DEFAULT 0 NOT NULL,
    savings_balance numeric(20,2) DEFAULT 0 NOT NULL,
    expected_savings numeric(20,2) DEFAULT 0 NOT NULL,
    deficit_surplus numeric(20,2) DEFAULT 0 NOT NULL,
    proposed_dividend numeric(20,2),
    linked_member_id bigint,
    status text DEFAULT 'pending_identity_verification'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: legacy_member_opening_balances_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.legacy_member_opening_balances_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: legacy_member_opening_balances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.legacy_member_opening_balances_id_seq OWNED BY public.legacy_member_opening_balances.id;


--
-- Name: legal_cases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.legal_cases (
    id bigint NOT NULL,
    case_number text NOT NULL,
    case_category text NOT NULL,
    subject_name text NOT NULL,
    member_id bigint,
    department_id bigint,
    description text NOT NULL,
    evidence text,
    assigned_officer text,
    status text DEFAULT 'open'::text NOT NULL,
    risk_level text DEFAULT 'medium'::text NOT NULL,
    next_hearing_at timestamp with time zone,
    decision text,
    attachments text,
    timeline_note text,
    opened_at date DEFAULT CURRENT_DATE NOT NULL,
    closed_at date,
    created_by bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: legal_cases_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.legal_cases_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: legal_cases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.legal_cases_id_seq OWNED BY public.legal_cases.id;


--
-- Name: legal_complaints; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.legal_complaints (
    id bigint NOT NULL,
    complaint_number text NOT NULL,
    complainant text NOT NULL,
    member_id bigint,
    complaint_type text NOT NULL,
    department_id bigint,
    description text NOT NULL,
    evidence text,
    assigned_officer text,
    status text DEFAULT 'submitted'::text NOT NULL,
    recommendation text,
    decision text,
    confidential boolean DEFAULT true NOT NULL,
    created_by bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    closed_at timestamp with time zone
);


--
-- Name: legal_complaints_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.legal_complaints_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: legal_complaints_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.legal_complaints_id_seq OWNED BY public.legal_complaints.id;


--
-- Name: legal_compliance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.legal_compliance (
    id bigint NOT NULL,
    reference text NOT NULL,
    department_id bigint,
    requirement text NOT NULL,
    policy_reference text,
    compliance_score numeric(5,2) DEFAULT 100 NOT NULL,
    risk_level text DEFAULT 'low'::text NOT NULL,
    status text DEFAULT 'compliant'::text NOT NULL,
    due_date date,
    finding text,
    corrective_action text,
    responsible_officer text,
    reviewed_at timestamp with time zone,
    created_by bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: legal_compliance_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.legal_compliance_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: legal_compliance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.legal_compliance_id_seq OWNED BY public.legal_compliance.id;


--
-- Name: legal_contracts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.legal_contracts (
    id bigint NOT NULL,
    contract_number text NOT NULL,
    title text NOT NULL,
    contract_type text NOT NULL,
    parties text NOT NULL,
    department_id bigint,
    contract_value numeric(18,2) DEFAULT 0 NOT NULL,
    starts_on date,
    ends_on date,
    renewal_date date,
    status text DEFAULT 'under_review'::text NOT NULL,
    responsible_officer text,
    supporting_document text,
    review_notes text,
    created_by bigint NOT NULL,
    approved_by bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: legal_contracts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.legal_contracts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: legal_contracts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.legal_contracts_id_seq OWNED BY public.legal_contracts.id;


--
-- Name: legal_court_matters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.legal_court_matters (
    id bigint NOT NULL,
    court_file text NOT NULL,
    title text NOT NULL,
    court_name text NOT NULL,
    opposing_party text,
    legal_representative text,
    case_id bigint,
    next_hearing_at timestamp with time zone,
    court_order text,
    judgement text,
    appeal_status text,
    legal_expenses numeric(18,2) DEFAULT 0 NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_by bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: legal_court_matters_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.legal_court_matters_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: legal_court_matters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.legal_court_matters_id_seq OWNED BY public.legal_court_matters.id;


--
-- Name: legal_opinions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.legal_opinions (
    id bigint NOT NULL,
    reference text NOT NULL,
    title text NOT NULL,
    requested_by_department bigint,
    question text NOT NULL,
    opinion text,
    assigned_officer text,
    due_date date,
    status text DEFAULT 'pending'::text NOT NULL,
    document_reference text,
    created_by bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone
);


--
-- Name: legal_opinions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.legal_opinions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: legal_opinions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.legal_opinions_id_seq OWNED BY public.legal_opinions.id;


--
-- Name: legal_policies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.legal_policies (
    id bigint NOT NULL,
    reference text NOT NULL,
    policy_name text NOT NULL,
    policy_category text NOT NULL,
    version text DEFAULT '1.0'::text NOT NULL,
    effective_date date,
    review_date date,
    status text DEFAULT 'draft'::text NOT NULL,
    approval_history text,
    document_reference text,
    created_by bigint NOT NULL,
    approved_by bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: legal_policies_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.legal_policies_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: legal_policies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.legal_policies_id_seq OWNED BY public.legal_policies.id;


--
-- Name: loan_charges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loan_charges (
    id bigint NOT NULL,
    loan_id bigint NOT NULL,
    charge_type text NOT NULL,
    amount numeric(18,2) NOT NULL,
    status text DEFAULT 'outstanding'::text NOT NULL,
    reason text,
    assessed_by bigint,
    waived_by bigint,
    assessed_at timestamp with time zone DEFAULT now() NOT NULL,
    settled_at timestamp with time zone,
    waived_at timestamp with time zone,
    paid_amount numeric(18,2) DEFAULT 0 NOT NULL,
    schedule_id bigint,
    penalty_period date,
    CONSTRAINT loan_charges_amount_check CHECK ((amount >= (0)::numeric))
);


--
-- Name: loan_charges_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.loan_charges_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: loan_charges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.loan_charges_id_seq OWNED BY public.loan_charges.id;


--
-- Name: loan_disbursements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loan_disbursements (
    id bigint NOT NULL,
    loan_id bigint NOT NULL,
    amount numeric(18,2) NOT NULL,
    method text NOT NULL,
    destination text NOT NULL,
    status text DEFAULT 'prepared'::text NOT NULL,
    prepared_by bigint,
    authorized_by bigint,
    disbursed_by bigint,
    transaction_reference text,
    prepared_at timestamp with time zone DEFAULT now() NOT NULL,
    authorized_at timestamp with time zone,
    disbursed_at timestamp with time zone
);


--
-- Name: loan_disbursements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.loan_disbursements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: loan_disbursements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.loan_disbursements_id_seq OWNED BY public.loan_disbursements.id;


--
-- Name: loan_guarantors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loan_guarantors (
    id bigint NOT NULL,
    loan_id bigint NOT NULL,
    member_id bigint NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    response_note text,
    responded_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    guaranteed_amount numeric(18,2) DEFAULT 0 NOT NULL,
    declaration_accepted boolean DEFAULT false NOT NULL
);


--
-- Name: loan_guarantors_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.loan_guarantors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: loan_guarantors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.loan_guarantors_id_seq OWNED BY public.loan_guarantors.id;


--
-- Name: loan_products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loan_products (
    id bigint NOT NULL,
    name text NOT NULL,
    annual_rate numeric(8,3) NOT NULL,
    max_term integer NOT NULL,
    max_multiplier numeric(8,2) DEFAULT 3 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    max_amount numeric(18,2) DEFAULT 25000000 NOT NULL,
    processing_fee_rate numeric(8,3) DEFAULT 2 NOT NULL,
    late_penalty_rate numeric(8,3) DEFAULT 5 NOT NULL,
    minimum_guarantors integer DEFAULT 3 NOT NULL,
    maximum_guarantors integer DEFAULT 3 NOT NULL,
    interest_method text DEFAULT 'reducing_balance'::text NOT NULL,
    policy_reference text DEFAULT 'AGM-2025-LOAN-RESOLUTION'::text NOT NULL
);


--
-- Name: loan_products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.loan_products_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: loan_products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.loan_products_id_seq OWNED BY public.loan_products.id;


--
-- Name: loan_recovery_actions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loan_recovery_actions (
    id bigint NOT NULL,
    loan_id bigint NOT NULL,
    action_type text NOT NULL,
    notes text NOT NULL,
    recovery_status text DEFAULT 'open'::text NOT NULL,
    follow_up_date date,
    assigned_to bigint,
    created_by bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone
);


--
-- Name: loan_recovery_actions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.loan_recovery_actions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: loan_recovery_actions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.loan_recovery_actions_id_seq OWNED BY public.loan_recovery_actions.id;


--
-- Name: loan_repayment_schedule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loan_repayment_schedule (
    id bigint NOT NULL,
    loan_id bigint NOT NULL,
    installment_number integer NOT NULL,
    due_date date NOT NULL,
    opening_balance numeric(18,2) NOT NULL,
    principal numeric(18,2) NOT NULL,
    interest numeric(18,2) NOT NULL,
    total_due numeric(18,2) NOT NULL,
    paid_amount numeric(18,2) DEFAULT 0 NOT NULL,
    status text DEFAULT 'upcoming'::text NOT NULL,
    paid_at timestamp with time zone,
    principal_paid numeric(18,2) DEFAULT 0 NOT NULL,
    interest_paid numeric(18,2) DEFAULT 0 NOT NULL
);


--
-- Name: loan_repayment_schedule_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.loan_repayment_schedule_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: loan_repayment_schedule_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.loan_repayment_schedule_id_seq OWNED BY public.loan_repayment_schedule.id;


--
-- Name: loan_workflow_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loan_workflow_events (
    id bigint NOT NULL,
    loan_id bigint NOT NULL,
    stage text NOT NULL,
    action text NOT NULL,
    actor_id bigint,
    comment text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: loan_workflow_events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.loan_workflow_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: loan_workflow_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.loan_workflow_events_id_seq OWNED BY public.loan_workflow_events.id;


--
-- Name: loans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loans (
    id bigint NOT NULL,
    reference text NOT NULL,
    member_id bigint NOT NULL,
    product_id bigint NOT NULL,
    amount numeric(18,2) NOT NULL,
    balance numeric(18,2) NOT NULL,
    term_months integer NOT NULL,
    purpose text NOT NULL,
    guarantor_member_id bigint,
    status text DEFAULT 'pending'::text NOT NULL,
    officer_comment text,
    committee_comment text,
    executive_comment text,
    recommended_by bigint,
    committee_approved_by bigint,
    authorized_by bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    due_date date,
    savings_at_application numeric(18,2),
    existing_loan_balance numeric(18,2) DEFAULT 0 NOT NULL,
    eligibility_result text,
    verified_amount numeric(18,2),
    finance_verified_by bigint,
    finance_comment text,
    finance_verified_at timestamp with time zone,
    authorized_at timestamp with time zone,
    disbursed_at timestamp with time zone,
    security_type text,
    collateral_description text,
    collateral_value numeric(18,2),
    collateral_owner text,
    collateral_owner_consent boolean DEFAULT false NOT NULL,
    borrower_declaration_accepted boolean DEFAULT false NOT NULL,
    supporting_document_stored_name text,
    supporting_document_original_name text,
    supporting_document_mime_type text,
    processing_fee numeric(18,2) DEFAULT 0 NOT NULL,
    policy_reference text DEFAULT 'AGM-2025-LOAN-RESOLUTION'::text NOT NULL,
    collateral_owner_phone text
);


--
-- Name: loans_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.loans_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: loans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.loans_id_seq OWNED BY public.loans.id;


--
-- Name: member_bio_data; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.member_bio_data (
    member_id bigint NOT NULL,
    date_of_birth date,
    gender text,
    marital_status text,
    nationality text DEFAULT 'Ugandan'::text NOT NULL,
    home_district text,
    subcounty text,
    parish text,
    village text,
    emergency_contact_name text,
    emergency_contact_phone text,
    emergency_contact_relationship text,
    blood_group text,
    disability_notes text,
    profile_photo_reference text,
    identity_document_reference text,
    record_notes text,
    bio_status text DEFAULT 'pending'::text NOT NULL,
    created_by bigint,
    verified_by bigint,
    verified_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    passport_photo_stored_name text,
    passport_photo_original_name text,
    passport_photo_mime_type text,
    CONSTRAINT member_bio_data_bio_status_check CHECK ((bio_status = ANY (ARRAY['pending'::text, 'complete'::text, 'verified'::text, 'needs_update'::text]))),
    CONSTRAINT member_bio_data_gender_check CHECK (((gender IS NULL) OR (gender = ANY (ARRAY['female'::text, 'male'::text, 'other'::text, 'prefer_not_to_say'::text])))),
    CONSTRAINT member_bio_data_marital_status_check CHECK (((marital_status IS NULL) OR (marital_status = ANY (ARRAY['single'::text, 'married'::text, 'divorced'::text, 'widowed'::text, 'separated'::text, 'other'::text]))))
);


--
-- Name: member_department_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.member_department_profiles (
    id bigint NOT NULL,
    member_id bigint NOT NULL,
    department_id bigint NOT NULL,
    position_title text DEFAULT 'Member'::text NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    joined_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: member_department_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.member_department_profiles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: member_department_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.member_department_profiles_id_seq OWNED BY public.member_department_profiles.id;


--
-- Name: member_family_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.member_family_records (
    id bigint NOT NULL,
    member_id bigint NOT NULL,
    full_name text NOT NULL,
    relationship text NOT NULL,
    phone text,
    eligible_for_welfare boolean DEFAULT true NOT NULL,
    active boolean DEFAULT true NOT NULL,
    recorded_by bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: member_family_records_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.member_family_records_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: member_family_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.member_family_records_id_seq OWNED BY public.member_family_records.id;


--
-- Name: member_financial_year_policies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.member_financial_year_policies (
    id bigint NOT NULL,
    fiscal_year_label text NOT NULL,
    starts_on date NOT NULL,
    ends_on date NOT NULL,
    monthly_savings_target numeric(20,2) NOT NULL,
    annual_share_target numeric(20,2) NOT NULL,
    annual_subscription_fee numeric(20,2) NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT member_financial_year_policies_annual_share_target_check CHECK ((annual_share_target >= (0)::numeric)),
    CONSTRAINT member_financial_year_policies_annual_subscription_fee_check CHECK ((annual_subscription_fee >= (0)::numeric)),
    CONSTRAINT member_financial_year_policies_check CHECK ((ends_on >= starts_on)),
    CONSTRAINT member_financial_year_policies_monthly_savings_target_check CHECK ((monthly_savings_target >= (0)::numeric)),
    CONSTRAINT member_financial_year_policies_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'active'::text, 'closed'::text])))
);


--
-- Name: member_financial_year_policies_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.member_financial_year_policies_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: member_financial_year_policies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.member_financial_year_policies_id_seq OWNED BY public.member_financial_year_policies.id;


--
-- Name: member_investment_applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.member_investment_applications (
    id bigint NOT NULL,
    reference text NOT NULL,
    project_id bigint NOT NULL,
    member_id bigint NOT NULL,
    amount numeric(18,2) NOT NULL,
    payment_method text NOT NULL,
    payment_reference text NOT NULL,
    notes text,
    status text DEFAULT 'investment_review'::text NOT NULL,
    evidence_stored_name text,
    evidence_original_name text,
    evidence_mime_type text,
    submitted_by bigint NOT NULL,
    reviewed_by bigint,
    review_comment text,
    reviewed_at timestamp with time zone,
    finance_entry_id bigint,
    investor_id bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT member_investment_applications_amount_check CHECK ((amount > (0)::numeric))
);


--
-- Name: member_investment_applications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.member_investment_applications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: member_investment_applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.member_investment_applications_id_seq OWNED BY public.member_investment_applications.id;


--
-- Name: member_support_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.member_support_requests (
    id bigint NOT NULL,
    reference text NOT NULL,
    member_id bigint NOT NULL,
    category text NOT NULL,
    subject text NOT NULL,
    description text NOT NULL,
    status text DEFAULT 'submitted'::text NOT NULL,
    response text,
    assigned_department_id bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    closed_at timestamp with time zone
);


--
-- Name: member_support_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.member_support_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: member_support_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.member_support_requests_id_seq OWNED BY public.member_support_requests.id;


--
-- Name: members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.members (
    id bigint NOT NULL,
    member_number text NOT NULL,
    full_name text NOT NULL,
    email text,
    phone text NOT NULL,
    national_id text NOT NULL,
    occupation text,
    employer text,
    address text,
    next_of_kin text,
    beneficiaries text,
    branch_id bigint,
    savings_balance numeric(18,2) DEFAULT 0 NOT NULL,
    share_capital numeric(18,2) DEFAULT 0 NOT NULL,
    dividends numeric(18,2) DEFAULT 0 NOT NULL,
    fines numeric(18,2) DEFAULT 0 NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    joined_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by bigint,
    provisional boolean DEFAULT false NOT NULL,
    legacy_opening_balance_id bigint,
    deleted_at timestamp with time zone,
    deleted_by bigint,
    exit_reason text,
    exit_savings_balance numeric(18,2),
    exit_share_capital numeric(18,2)
);


--
-- Name: members_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.members_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.members_id_seq OWNED BY public.members.id;


--
-- Name: membership_status_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.membership_status_records (
    id bigint NOT NULL,
    legacy_balance_id bigint,
    linked_member_id bigint,
    member_name text NOT NULL,
    status text NOT NULL,
    condition_note text,
    effective_date date,
    source_document_id bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: membership_status_records_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.membership_status_records_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: membership_status_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.membership_status_records_id_seq OWNED BY public.membership_status_records.id;


--
-- Name: message_attachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.message_attachments (
    id bigint NOT NULL,
    message_id bigint NOT NULL,
    original_name text NOT NULL,
    stored_name text NOT NULL,
    mime_type text NOT NULL,
    file_size bigint NOT NULL,
    uploaded_by bigint NOT NULL,
    download_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    quarantined_at timestamp with time zone,
    quarantine_reason text
);


--
-- Name: message_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.message_attachments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: message_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.message_attachments_id_seq OWNED BY public.message_attachments.id;


--
-- Name: message_mentions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.message_mentions (
    message_id bigint NOT NULL,
    mentioned_user_id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: message_reactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.message_reactions (
    message_id bigint NOT NULL,
    user_id bigint NOT NULL,
    emoji text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: message_reads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.message_reads (
    message_id bigint NOT NULL,
    user_id bigint NOT NULL,
    read_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: message_stars; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.message_stars (
    message_id bigint NOT NULL,
    user_id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id bigint NOT NULL,
    conversation_id bigint NOT NULL,
    sender_id bigint NOT NULL,
    body text NOT NULL,
    reply_to_id bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    read_at timestamp with time zone,
    edited_at timestamp with time zone,
    deleted_at timestamp with time zone,
    pinned_at timestamp with time zone,
    pinned_by bigint,
    forwarded_from_id bigint,
    delivered_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT messages_body_length CHECK (((char_length(body) >= 1) AND (char_length(body) <= 2000)))
);


--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id bigint NOT NULL,
    user_id bigint,
    member_id bigint,
    title text NOT NULL,
    message text NOT NULL,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: organization_document_versions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organization_document_versions (
    id bigint NOT NULL,
    document_id bigint NOT NULL,
    version text NOT NULL,
    original_name text NOT NULL,
    stored_name text NOT NULL,
    mime_type text NOT NULL,
    file_size bigint NOT NULL,
    sha256 text NOT NULL,
    uploaded_by bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT organization_document_versions_file_size_check CHECK ((file_size > 0))
);


--
-- Name: organization_document_versions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.organization_document_versions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: organization_document_versions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.organization_document_versions_id_seq OWNED BY public.organization_document_versions.id;


--
-- Name: organization_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organization_documents (
    id bigint NOT NULL,
    reference text NOT NULL,
    department_id bigint,
    document_type text NOT NULL,
    title text NOT NULL,
    version text DEFAULT '1.0'::text NOT NULL,
    status text DEFAULT 'published'::text NOT NULL,
    visibility_level integer DEFAULT 2 NOT NULL,
    file_name text,
    created_by bigint NOT NULL,
    approved_by bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: organization_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.organization_documents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: organization_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.organization_documents_id_seq OWNED BY public.organization_documents.id;


--
-- Name: organization_finance_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organization_finance_entries (
    id bigint NOT NULL,
    department_id bigint NOT NULL,
    reference text NOT NULL,
    entry_type text NOT NULL,
    category text NOT NULL,
    description text NOT NULL,
    amount numeric(18,2) NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    recorded_by bigint NOT NULL,
    approved_by bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    approved_at timestamp with time zone,
    counterparty text,
    payment_method text,
    transaction_date date DEFAULT CURRENT_DATE NOT NULL,
    receipt_number text,
    voucher_number text,
    budget_line text,
    supporting_document text,
    finance_account_id bigint,
    CONSTRAINT organization_finance_entries_amount_check CHECK ((amount > (0)::numeric))
);


--
-- Name: organization_finance_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.organization_finance_entries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: organization_finance_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.organization_finance_entries_id_seq OWNED BY public.organization_finance_entries.id;


--
-- Name: organization_meetings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organization_meetings (
    id bigint NOT NULL,
    reference text NOT NULL,
    department_id bigint,
    title text NOT NULL,
    meeting_type text NOT NULL,
    agenda text,
    venue text,
    scheduled_at timestamp with time zone NOT NULL,
    status text DEFAULT 'scheduled'::text NOT NULL,
    visibility_level integer DEFAULT 1 NOT NULL,
    created_by bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: organization_meetings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.organization_meetings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: organization_meetings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.organization_meetings_id_seq OWNED BY public.organization_meetings.id;


--
-- Name: organization_policy_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organization_policy_settings (
    setting_key text NOT NULL,
    numeric_value numeric(18,3),
    text_value text,
    source_reference text NOT NULL,
    effective_from date NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: organizations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organizations (
    id bigint NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: organizations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.organizations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: organizations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.organizations_id_seq OWNED BY public.organizations.id;


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    name text NOT NULL,
    checksum text NOT NULL,
    applied_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.settings (
    key text NOT NULL,
    value text NOT NULL,
    updated_by bigint,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: supervisory_committees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.supervisory_committees (
    id bigint NOT NULL,
    reference text NOT NULL,
    committee_name text NOT NULL,
    members integer DEFAULT 0 NOT NULL,
    meetings_held integer DEFAULT 0 NOT NULL,
    attendance_rate numeric(5,2) DEFAULT 0 NOT NULL,
    decisions_made integer DEFAULT 0 NOT NULL,
    outstanding_actions integer DEFAULT 0 NOT NULL,
    performance_score numeric(5,2) DEFAULT 0 NOT NULL,
    status text DEFAULT 'on_track'::text NOT NULL,
    chairperson text,
    supervisor_comment text,
    review_period text NOT NULL,
    created_by bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: supervisory_committees_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.supervisory_committees_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: supervisory_committees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.supervisory_committees_id_seq OWNED BY public.supervisory_committees.id;


--
-- Name: supervisory_complaints; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.supervisory_complaints (
    id bigint NOT NULL,
    complaint_number text NOT NULL,
    category text NOT NULL,
    subject_type text NOT NULL,
    department_id bigint,
    description text NOT NULL,
    assigned_supervisor text NOT NULL,
    status text DEFAULT 'received'::text NOT NULL,
    investigation_progress integer DEFAULT 0 NOT NULL,
    finding text,
    recommendation text,
    escalated boolean DEFAULT false NOT NULL,
    confidential boolean DEFAULT true NOT NULL,
    evidence text,
    created_by bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    resolved_at timestamp with time zone,
    CONSTRAINT supervisory_complaints_investigation_progress_check CHECK (((investigation_progress >= 0) AND (investigation_progress <= 100)))
);


--
-- Name: supervisory_complaints_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.supervisory_complaints_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: supervisory_complaints_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.supervisory_complaints_id_seq OWNED BY public.supervisory_complaints.id;


--
-- Name: supervisory_executive_monitoring; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.supervisory_executive_monitoring (
    id bigint NOT NULL,
    reference text NOT NULL,
    review_period text NOT NULL,
    meetings_held integer DEFAULT 0 NOT NULL,
    decisions_made integer DEFAULT 0 NOT NULL,
    decisions_implemented integer DEFAULT 0 NOT NULL,
    decisions_pending integer DEFAULT 0 NOT NULL,
    strategic_objectives_completed integer DEFAULT 0 CONSTRAINT supervisory_executive_monit_strategic_objectives_compl_not_null NOT NULL,
    strategic_objectives_total integer DEFAULT 0 CONSTRAINT supervisory_executive_monit_strategic_objectives_total_not_null NOT NULL,
    attendance_rate numeric(5,2) DEFAULT 0 NOT NULL,
    implementation_rate numeric(5,2) DEFAULT 0 NOT NULL,
    performance_score numeric(5,2) DEFAULT 0 NOT NULL,
    delayed_actions integer DEFAULT 0 NOT NULL,
    report_reference text,
    supervisor_comment text,
    created_by bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: supervisory_executive_monitoring_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.supervisory_executive_monitoring_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: supervisory_executive_monitoring_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.supervisory_executive_monitoring_id_seq OWNED BY public.supervisory_executive_monitoring.id;


--
-- Name: supervisory_followups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.supervisory_followups (
    id bigint NOT NULL,
    reference text NOT NULL,
    department_id bigint NOT NULL,
    action_required text NOT NULL,
    responsible_officer text NOT NULL,
    deadline date NOT NULL,
    progress integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    evidence text,
    supervisor_comment text,
    created_by bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    closed_at timestamp with time zone,
    CONSTRAINT supervisory_followups_progress_check CHECK (((progress >= 0) AND (progress <= 100)))
);


--
-- Name: supervisory_followups_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.supervisory_followups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: supervisory_followups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.supervisory_followups_id_seq OWNED BY public.supervisory_followups.id;


--
-- Name: supervisory_kpis; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.supervisory_kpis (
    id bigint NOT NULL,
    reference text NOT NULL,
    kpi_name text NOT NULL,
    category text NOT NULL,
    target_value numeric(12,2) NOT NULL,
    actual_value numeric(12,2) NOT NULL,
    unit text DEFAULT '%'::text NOT NULL,
    achievement_percentage numeric(5,2) DEFAULT 0 NOT NULL,
    trend text DEFAULT 'stable'::text NOT NULL,
    status text DEFAULT 'on_track'::text NOT NULL,
    review_period text NOT NULL,
    data_source text,
    created_by bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: supervisory_kpis_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.supervisory_kpis_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: supervisory_kpis_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.supervisory_kpis_id_seq OWNED BY public.supervisory_kpis.id;


--
-- Name: supervisory_projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.supervisory_projects (
    id bigint NOT NULL,
    reference text NOT NULL,
    project_name text NOT NULL,
    department_id bigint,
    project_manager text,
    planned_progress integer DEFAULT 0 NOT NULL,
    actual_progress integer DEFAULT 0 NOT NULL,
    risk_level text DEFAULT 'low'::text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    deadline date,
    budget_summary numeric(18,2) DEFAULT 0 NOT NULL,
    site_visits_completed integer DEFAULT 0 NOT NULL,
    supervisor_comment text,
    created_by bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT supervisory_projects_actual_progress_check CHECK (((actual_progress >= 0) AND (actual_progress <= 100))),
    CONSTRAINT supervisory_projects_planned_progress_check CHECK (((planned_progress >= 0) AND (planned_progress <= 100)))
);


--
-- Name: supervisory_projects_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.supervisory_projects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: supervisory_projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.supervisory_projects_id_seq OWNED BY public.supervisory_projects.id;


--
-- Name: supervisory_recommendations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.supervisory_recommendations (
    id bigint NOT NULL,
    recommendation_number text NOT NULL,
    department_id bigint,
    source_type text NOT NULL,
    source_reference text,
    description text NOT NULL,
    responsible_officer text NOT NULL,
    issued_on date DEFAULT CURRENT_DATE NOT NULL,
    due_date date NOT NULL,
    status text DEFAULT 'issued'::text NOT NULL,
    department_response text,
    implementation_progress integer DEFAULT 0 NOT NULL,
    accepted boolean DEFAULT false NOT NULL,
    evidence text,
    verified_by bigint,
    created_by bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    CONSTRAINT supervisory_recommendations_implementation_progress_check CHECK (((implementation_progress >= 0) AND (implementation_progress <= 100)))
);


--
-- Name: supervisory_recommendations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.supervisory_recommendations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: supervisory_recommendations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.supervisory_recommendations_id_seq OWNED BY public.supervisory_recommendations.id;


--
-- Name: supervisory_resolutions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.supervisory_resolutions (
    id bigint NOT NULL,
    resolution_number text NOT NULL,
    title text NOT NULL,
    meeting_date date NOT NULL,
    department_id bigint,
    responsible_officer text NOT NULL,
    due_date date NOT NULL,
    completion_percentage integer DEFAULT 0 NOT NULL,
    evidence text,
    status text DEFAULT 'pending'::text NOT NULL,
    priority text DEFAULT 'medium'::text NOT NULL,
    supervisor_comment text,
    created_by bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    CONSTRAINT supervisory_resolutions_completion_percentage_check CHECK (((completion_percentage >= 0) AND (completion_percentage <= 100)))
);


--
-- Name: supervisory_resolutions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.supervisory_resolutions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: supervisory_resolutions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.supervisory_resolutions_id_seq OWNED BY public.supervisory_resolutions.id;


--
-- Name: supervisory_scorecards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.supervisory_scorecards (
    id bigint NOT NULL,
    reference text NOT NULL,
    department_id bigint NOT NULL,
    annual_target numeric(5,2) DEFAULT 100 NOT NULL,
    monthly_target numeric(5,2) DEFAULT 100 NOT NULL,
    completed_tasks integer DEFAULT 0 NOT NULL,
    outstanding_tasks integer DEFAULT 0 NOT NULL,
    budget_utilization numeric(5,2) DEFAULT 0 NOT NULL,
    performance_score numeric(5,2) DEFAULT 0 NOT NULL,
    target_achievement numeric(5,2) DEFAULT 0 NOT NULL,
    status text DEFAULT 'on_track'::text NOT NULL,
    supervisor_comment text,
    review_period text NOT NULL,
    reviewed_by bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: supervisory_scorecards_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.supervisory_scorecards_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: supervisory_scorecards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.supervisory_scorecards_id_seq OWNED BY public.supervisory_scorecards.id;


--
-- Name: supervisory_site_visits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.supervisory_site_visits (
    id bigint NOT NULL,
    visit_number text NOT NULL,
    site_name text NOT NULL,
    department_id bigint,
    project_id bigint,
    visit_date date NOT NULL,
    supervisor text NOT NULL,
    observations text NOT NULL,
    photos_reference text,
    recommendations text NOT NULL,
    follow_up_date date,
    status text DEFAULT 'completed'::text NOT NULL,
    created_by bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: supervisory_site_visits_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.supervisory_site_visits_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: supervisory_site_visits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.supervisory_site_visits_id_seq OWNED BY public.supervisory_site_visits.id;


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transactions (
    id bigint NOT NULL,
    reference text NOT NULL,
    member_id bigint NOT NULL,
    type text NOT NULL,
    method text NOT NULL,
    amount numeric(18,2) NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    external_reference text,
    notes text,
    recorded_by bigint NOT NULL,
    verified_by bigint,
    approved_by bigint,
    reversal_of bigint,
    reversal_reason text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    verified_at timestamp with time zone,
    approved_at timestamp with time zone,
    loan_id bigint,
    receipt_number text,
    submission_source text DEFAULT 'staff'::text NOT NULL,
    evidence_stored_name text,
    evidence_original_name text,
    evidence_mime_type text,
    verification_comment text,
    finance_entry_id bigint,
    target_fiscal_year integer,
    CONSTRAINT transactions_target_fiscal_year_valid CHECK (((target_fiscal_year IS NULL) OR ((target_fiscal_year >= 2000) AND (target_fiscal_year <= 2200))))
);


--
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.transactions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    full_name text NOT NULL,
    email text NOT NULL,
    phone text,
    password_hash text NOT NULL,
    role text NOT NULL,
    branch_id bigint,
    member_id bigint,
    active boolean DEFAULT true NOT NULL,
    must_change_password boolean DEFAULT true NOT NULL,
    failed_attempts integer DEFAULT 0 NOT NULL,
    locked_until timestamp with time zone,
    last_login timestamp with time zone,
    created_by bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    token_version integer DEFAULT 0 NOT NULL,
    profile_photo_stored_name text,
    profile_photo_original_name text,
    profile_photo_mime_type text,
    login_email_is_provisional boolean DEFAULT false NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: welfare_activities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.welfare_activities (
    id bigint NOT NULL,
    reference text NOT NULL,
    activity_type text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    activity_date timestamp with time zone NOT NULL,
    budget numeric(18,2) DEFAULT 0 NOT NULL,
    responsible_officer text,
    participants text,
    outcome text,
    status text DEFAULT 'planned'::text NOT NULL,
    report_reference text,
    created_by bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: welfare_activities_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.welfare_activities_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: welfare_activities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.welfare_activities_id_seq OWNED BY public.welfare_activities.id;


--
-- Name: welfare_committee_meetings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.welfare_committee_meetings (
    id bigint NOT NULL,
    reference text NOT NULL,
    title text NOT NULL,
    agenda text NOT NULL,
    venue text,
    scheduled_at timestamp with time zone NOT NULL,
    chairperson text,
    participants text,
    decisions text,
    status text DEFAULT 'scheduled'::text NOT NULL,
    created_by bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: welfare_committee_meetings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.welfare_committee_meetings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: welfare_committee_meetings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.welfare_committee_meetings_id_seq OWNED BY public.welfare_committee_meetings.id;


--
-- Name: welfare_contributions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.welfare_contributions (
    id bigint NOT NULL,
    reference text NOT NULL,
    member_id bigint NOT NULL,
    contribution_type text NOT NULL,
    period text,
    expected_amount numeric(18,2) DEFAULT 0 NOT NULL,
    amount numeric(18,2) NOT NULL,
    payment_method text NOT NULL,
    receipt_number text,
    status text DEFAULT 'recorded'::text NOT NULL,
    contribution_date date DEFAULT CURRENT_DATE NOT NULL,
    recorded_by bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    finance_entry_id bigint,
    payment_reference text,
    submission_source text DEFAULT 'staff'::text NOT NULL,
    evidence_stored_name text,
    evidence_original_name text,
    evidence_mime_type text,
    verification_comment text,
    verified_by bigint,
    verified_at timestamp with time zone,
    CONSTRAINT welfare_contributions_amount_check CHECK ((amount >= (0)::numeric))
);


--
-- Name: welfare_contributions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.welfare_contributions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: welfare_contributions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.welfare_contributions_id_seq OWNED BY public.welfare_contributions.id;


--
-- Name: welfare_payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.welfare_payments (
    id bigint NOT NULL,
    reference text NOT NULL,
    request_id bigint NOT NULL,
    beneficiary_name text NOT NULL,
    amount numeric(18,2) NOT NULL,
    payment_method text NOT NULL,
    voucher_number text,
    receipt_number text,
    status text DEFAULT 'pending_finance'::text NOT NULL,
    approved_at timestamp with time zone,
    paid_at timestamp with time zone,
    recorded_by bigint NOT NULL,
    CONSTRAINT welfare_payments_amount_check CHECK ((amount > (0)::numeric))
);


--
-- Name: welfare_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.welfare_payments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: welfare_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.welfare_payments_id_seq OWNED BY public.welfare_payments.id;


--
-- Name: welfare_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.welfare_requests (
    id bigint NOT NULL,
    reference text NOT NULL,
    member_id bigint NOT NULL,
    request_type text NOT NULL,
    description text NOT NULL,
    amount numeric(18,2) NOT NULL,
    status text DEFAULT 'submitted'::text NOT NULL,
    submitted_by bigint NOT NULL,
    reviewed_by bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    reviewed_at timestamp with time zone,
    urgency text DEFAULT 'medium'::text NOT NULL,
    supporting_document text,
    documents_verified boolean DEFAULT false NOT NULL,
    previous_support numeric(18,2) DEFAULT 0 NOT NULL,
    officer_recommendation text,
    assigned_to bigint,
    payment_status text DEFAULT 'not_ready'::text NOT NULL,
    executive_activity_id bigint,
    finance_voucher_id bigint,
    closed_at timestamp with time zone,
    evidence_stored_name text,
    evidence_original_name text,
    evidence_mime_type text,
    beneficiary_name text,
    beneficiary_relationship text,
    policy_limit numeric(18,2),
    policy_eligible boolean,
    policy_reason text,
    policy_reference text DEFAULT 'WELFARE-POLICY-2025'::text NOT NULL,
    CONSTRAINT welfare_requests_amount_check CHECK ((amount > (0)::numeric))
);


--
-- Name: welfare_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.welfare_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: welfare_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.welfare_requests_id_seq OWNED BY public.welfare_requests.id;


--
-- Name: withdrawals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.withdrawals (
    id bigint NOT NULL,
    reference text NOT NULL,
    member_id bigint NOT NULL,
    amount numeric(18,2) NOT NULL,
    method text NOT NULL,
    reason text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    requested_by bigint NOT NULL,
    approved_by bigint,
    processed_by bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    approved_at timestamp with time zone,
    processed_at timestamp with time zone,
    transaction_id bigint
);


--
-- Name: withdrawals_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.withdrawals_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: withdrawals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.withdrawals_id_seq OWNED BY public.withdrawals.id;


--
-- Name: announcements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements ALTER COLUMN id SET DEFAULT nextval('public.announcements_id_seq'::regclass);


--
-- Name: audit_compliance id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_compliance ALTER COLUMN id SET DEFAULT nextval('public.audit_compliance_id_seq'::regclass);


--
-- Name: audit_findings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_findings ALTER COLUMN id SET DEFAULT nextval('public.audit_findings_id_seq'::regclass);


--
-- Name: audit_fraud_alerts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_fraud_alerts ALTER COLUMN id SET DEFAULT nextval('public.audit_fraud_alerts_id_seq'::regclass);


--
-- Name: audit_investigations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_investigations ALTER COLUMN id SET DEFAULT nextval('public.audit_investigations_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: audit_plans id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_plans ALTER COLUMN id SET DEFAULT nextval('public.audit_plans_id_seq'::regclass);


--
-- Name: audit_recommendations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_recommendations ALTER COLUMN id SET DEFAULT nextval('public.audit_recommendations_id_seq'::regclass);


--
-- Name: audit_risks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_risks ALTER COLUMN id SET DEFAULT nextval('public.audit_risks_id_seq'::regclass);


--
-- Name: branches id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches ALTER COLUMN id SET DEFAULT nextval('public.branches_id_seq'::regclass);


--
-- Name: conversations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations ALTER COLUMN id SET DEFAULT nextval('public.conversations_id_seq'::regclass);


--
-- Name: department_activities id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department_activities ALTER COLUMN id SET DEFAULT nextval('public.department_activities_id_seq'::regclass);


--
-- Name: department_assignments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department_assignments ALTER COLUMN id SET DEFAULT nextval('public.department_assignments_id_seq'::regclass);


--
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- Name: finance_accounts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_accounts ALTER COLUMN id SET DEFAULT nextval('public.finance_accounts_id_seq'::regclass);


--
-- Name: finance_assets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_assets ALTER COLUMN id SET DEFAULT nextval('public.finance_assets_id_seq'::regclass);


--
-- Name: finance_budgets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_budgets ALTER COLUMN id SET DEFAULT nextval('public.finance_budgets_id_seq'::regclass);


--
-- Name: finance_invoices id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_invoices ALTER COLUMN id SET DEFAULT nextval('public.finance_invoices_id_seq'::regclass);


--
-- Name: finance_payment_vouchers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_payment_vouchers ALTER COLUMN id SET DEFAULT nextval('public.finance_payment_vouchers_id_seq'::regclass);


--
-- Name: finance_procurements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_procurements ALTER COLUMN id SET DEFAULT nextval('public.finance_procurements_id_seq'::regclass);


--
-- Name: financial_reporting_periods id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_reporting_periods ALTER COLUMN id SET DEFAULT nextval('public.financial_reporting_periods_id_seq'::regclass);


--
-- Name: financial_statement_lines id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_statement_lines ALTER COLUMN id SET DEFAULT nextval('public.financial_statement_lines_id_seq'::regclass);


--
-- Name: governance_appointments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.governance_appointments ALTER COLUMN id SET DEFAULT nextval('public.governance_appointments_id_seq'::regclass);


--
-- Name: governance_bodies id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.governance_bodies ALTER COLUMN id SET DEFAULT nextval('public.governance_bodies_id_seq'::regclass);


--
-- Name: governance_directives id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.governance_directives ALTER COLUMN id SET DEFAULT nextval('public.governance_directives_id_seq'::regclass);


--
-- Name: governance_records id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.governance_records ALTER COLUMN id SET DEFAULT nextval('public.governance_records_id_seq'::regclass);


--
-- Name: historical_investment_ledger id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historical_investment_ledger ALTER COLUMN id SET DEFAULT nextval('public.historical_investment_ledger_id_seq'::regclass);


--
-- Name: investment_assets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_assets ALTER COLUMN id SET DEFAULT nextval('public.investment_assets_id_seq'::regclass);


--
-- Name: investment_contracts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_contracts ALTER COLUMN id SET DEFAULT nextval('public.investment_contracts_id_seq'::regclass);


--
-- Name: investment_fund_accounts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_fund_accounts ALTER COLUMN id SET DEFAULT nextval('public.investment_fund_accounts_id_seq'::regclass);


--
-- Name: investment_investors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_investors ALTER COLUMN id SET DEFAULT nextval('public.investment_investors_id_seq'::regclass);


--
-- Name: investment_project_oversight id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_project_oversight ALTER COLUMN id SET DEFAULT nextval('public.investment_project_oversight_id_seq'::regclass);


--
-- Name: investment_projects id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_projects ALTER COLUMN id SET DEFAULT nextval('public.investment_projects_id_seq'::regclass);


--
-- Name: investment_proposals id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_proposals ALTER COLUMN id SET DEFAULT nextval('public.investment_proposals_id_seq'::regclass);


--
-- Name: investment_transactions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_transactions ALTER COLUMN id SET DEFAULT nextval('public.investment_transactions_id_seq'::regclass);


--
-- Name: leadership_assignments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leadership_assignments ALTER COLUMN id SET DEFAULT nextval('public.leadership_assignments_id_seq'::regclass);


--
-- Name: legacy_member_opening_balances id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legacy_member_opening_balances ALTER COLUMN id SET DEFAULT nextval('public.legacy_member_opening_balances_id_seq'::regclass);


--
-- Name: legal_cases id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_cases ALTER COLUMN id SET DEFAULT nextval('public.legal_cases_id_seq'::regclass);


--
-- Name: legal_complaints id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_complaints ALTER COLUMN id SET DEFAULT nextval('public.legal_complaints_id_seq'::regclass);


--
-- Name: legal_compliance id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_compliance ALTER COLUMN id SET DEFAULT nextval('public.legal_compliance_id_seq'::regclass);


--
-- Name: legal_contracts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_contracts ALTER COLUMN id SET DEFAULT nextval('public.legal_contracts_id_seq'::regclass);


--
-- Name: legal_court_matters id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_court_matters ALTER COLUMN id SET DEFAULT nextval('public.legal_court_matters_id_seq'::regclass);


--
-- Name: legal_opinions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_opinions ALTER COLUMN id SET DEFAULT nextval('public.legal_opinions_id_seq'::regclass);


--
-- Name: legal_policies id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_policies ALTER COLUMN id SET DEFAULT nextval('public.legal_policies_id_seq'::regclass);


--
-- Name: loan_charges id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_charges ALTER COLUMN id SET DEFAULT nextval('public.loan_charges_id_seq'::regclass);


--
-- Name: loan_disbursements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_disbursements ALTER COLUMN id SET DEFAULT nextval('public.loan_disbursements_id_seq'::regclass);


--
-- Name: loan_guarantors id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_guarantors ALTER COLUMN id SET DEFAULT nextval('public.loan_guarantors_id_seq'::regclass);


--
-- Name: loan_products id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_products ALTER COLUMN id SET DEFAULT nextval('public.loan_products_id_seq'::regclass);


--
-- Name: loan_recovery_actions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_recovery_actions ALTER COLUMN id SET DEFAULT nextval('public.loan_recovery_actions_id_seq'::regclass);


--
-- Name: loan_repayment_schedule id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_repayment_schedule ALTER COLUMN id SET DEFAULT nextval('public.loan_repayment_schedule_id_seq'::regclass);


--
-- Name: loan_workflow_events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_workflow_events ALTER COLUMN id SET DEFAULT nextval('public.loan_workflow_events_id_seq'::regclass);


--
-- Name: loans id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loans ALTER COLUMN id SET DEFAULT nextval('public.loans_id_seq'::regclass);


--
-- Name: member_department_profiles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_department_profiles ALTER COLUMN id SET DEFAULT nextval('public.member_department_profiles_id_seq'::regclass);


--
-- Name: member_family_records id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_family_records ALTER COLUMN id SET DEFAULT nextval('public.member_family_records_id_seq'::regclass);


--
-- Name: member_financial_year_policies id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_financial_year_policies ALTER COLUMN id SET DEFAULT nextval('public.member_financial_year_policies_id_seq'::regclass);


--
-- Name: member_investment_applications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_investment_applications ALTER COLUMN id SET DEFAULT nextval('public.member_investment_applications_id_seq'::regclass);


--
-- Name: member_support_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_support_requests ALTER COLUMN id SET DEFAULT nextval('public.member_support_requests_id_seq'::regclass);


--
-- Name: members id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members ALTER COLUMN id SET DEFAULT nextval('public.members_id_seq'::regclass);


--
-- Name: membership_status_records id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_status_records ALTER COLUMN id SET DEFAULT nextval('public.membership_status_records_id_seq'::regclass);


--
-- Name: message_attachments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_attachments ALTER COLUMN id SET DEFAULT nextval('public.message_attachments_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: organization_document_versions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_document_versions ALTER COLUMN id SET DEFAULT nextval('public.organization_document_versions_id_seq'::regclass);


--
-- Name: organization_documents id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_documents ALTER COLUMN id SET DEFAULT nextval('public.organization_documents_id_seq'::regclass);


--
-- Name: organization_finance_entries id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_finance_entries ALTER COLUMN id SET DEFAULT nextval('public.organization_finance_entries_id_seq'::regclass);


--
-- Name: organization_meetings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_meetings ALTER COLUMN id SET DEFAULT nextval('public.organization_meetings_id_seq'::regclass);


--
-- Name: organizations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations ALTER COLUMN id SET DEFAULT nextval('public.organizations_id_seq'::regclass);


--
-- Name: supervisory_committees id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_committees ALTER COLUMN id SET DEFAULT nextval('public.supervisory_committees_id_seq'::regclass);


--
-- Name: supervisory_complaints id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_complaints ALTER COLUMN id SET DEFAULT nextval('public.supervisory_complaints_id_seq'::regclass);


--
-- Name: supervisory_executive_monitoring id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_executive_monitoring ALTER COLUMN id SET DEFAULT nextval('public.supervisory_executive_monitoring_id_seq'::regclass);


--
-- Name: supervisory_followups id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_followups ALTER COLUMN id SET DEFAULT nextval('public.supervisory_followups_id_seq'::regclass);


--
-- Name: supervisory_kpis id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_kpis ALTER COLUMN id SET DEFAULT nextval('public.supervisory_kpis_id_seq'::regclass);


--
-- Name: supervisory_projects id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_projects ALTER COLUMN id SET DEFAULT nextval('public.supervisory_projects_id_seq'::regclass);


--
-- Name: supervisory_recommendations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_recommendations ALTER COLUMN id SET DEFAULT nextval('public.supervisory_recommendations_id_seq'::regclass);


--
-- Name: supervisory_resolutions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_resolutions ALTER COLUMN id SET DEFAULT nextval('public.supervisory_resolutions_id_seq'::regclass);


--
-- Name: supervisory_scorecards id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_scorecards ALTER COLUMN id SET DEFAULT nextval('public.supervisory_scorecards_id_seq'::regclass);


--
-- Name: supervisory_site_visits id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_site_visits ALTER COLUMN id SET DEFAULT nextval('public.supervisory_site_visits_id_seq'::regclass);


--
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: welfare_activities id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.welfare_activities ALTER COLUMN id SET DEFAULT nextval('public.welfare_activities_id_seq'::regclass);


--
-- Name: welfare_committee_meetings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.welfare_committee_meetings ALTER COLUMN id SET DEFAULT nextval('public.welfare_committee_meetings_id_seq'::regclass);


--
-- Name: welfare_contributions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.welfare_contributions ALTER COLUMN id SET DEFAULT nextval('public.welfare_contributions_id_seq'::regclass);


--
-- Name: welfare_payments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.welfare_payments ALTER COLUMN id SET DEFAULT nextval('public.welfare_payments_id_seq'::regclass);


--
-- Name: welfare_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.welfare_requests ALTER COLUMN id SET DEFAULT nextval('public.welfare_requests_id_seq'::regclass);


--
-- Name: withdrawals id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawals ALTER COLUMN id SET DEFAULT nextval('public.withdrawals_id_seq'::regclass);


--
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.announcements (id, title, body, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: audit_compliance; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_compliance (id, reference, department_id, compliance_area, compliance_score, status, finding_summary, corrective_action, responsible_officer, review_date, reviewed_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: audit_findings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_findings (id, finding_number, audit_id, department_id, description, evidence, risk_level, recommendation, responsible_department, due_date, status, supporting_document, repeat_finding, created_by, created_at, updated_at, resolved_at) FROM stdin;
\.


--
-- Data for Name: audit_fraud_alerts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_fraud_alerts (id, alert_number, source_type, source_reference, department_id, rule_name, description, amount, risk_score, status, assigned_auditor, review_notes, detected_at, reviewed_at, reviewed_by, created_at) FROM stdin;
\.


--
-- Data for Name: audit_investigations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_investigations (id, investigation_number, case_description, lead_auditor, departments_involved, evidence, interviews, findings, recommendations, final_report, status, priority, opened_at, closed_at, created_by, authorized_closed_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, user_id, action, entity_type, entity_id, details, ip_address, user_agent, created_at) FROM stdin;
1	\N	SYSTEM_OPERATIONAL_RESET	system	\N	Operational data reset; access structure preserved	\N	\N	2026-07-30 12:08:49.138279+03
2	22	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 12:10:55.321865+03
3	17	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 12:10:56.779694+03
4	19	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 12:10:57.586252+03
5	18	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 12:10:58.302463+03
6	21	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 12:10:58.928263+03
7	20	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 12:10:59.562074+03
8	12	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 12:11:00.246183+03
9	23	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 12:11:00.870673+03
10	1	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 12:11:01.520061+03
11	22	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 12:11:38.859353+03
12	17	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 12:11:40.190411+03
13	19	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 12:11:40.875297+03
14	18	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 12:11:41.579747+03
15	21	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 12:11:42.260828+03
16	20	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 12:11:42.924782+03
17	12	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 12:11:43.613904+03
18	23	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 12:11:44.298165+03
19	22	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 12:21:23.539179+03
20	17	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 12:21:24.815746+03
21	19	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 12:21:25.526048+03
22	21	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 12:21:26.277852+03
23	20	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 12:21:26.987016+03
24	12	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 12:21:27.673727+03
25	17	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-30 14:15:49.618441+03
26	22	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-30 14:15:53.288167+03
27	22	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-30 14:16:27.291054+03
28	20	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-30 14:16:33.346182+03
29	20	MEMBER_BIO_SEARCHED	member_bio_data	\N	query=all; status=all; results=0	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-30 14:16:33.663956+03
30	20	LEGAL_MEMBER_REGISTERED	member	1	G40-2026-2950C377 Â· Lazor Prince Â· Member	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-30 14:19:50.333091+03
31	20	MEMBER_BIO_SEARCHED	member_bio_data	\N	query=all; status=all; results=1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-30 14:19:50.678799+03
32	20	LEGAL_MEMBER_ACCOUNT_CREATED	user	26	G40-2026-2950C377 Â· Member	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-30 14:21:53.346829+03
33	20	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-30 14:22:52.859782+03
34	26	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-30 14:23:10.654193+03
35	26	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-30 14:29:12.46774+03
36	19	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-30 14:29:21.581951+03
38	9	LOGIN	\N	\N	Successful login	127.0.0.1	node	2026-07-30 14:55:21.022466+03
41	10	LOGIN	\N	\N	Successful login	127.0.0.1	node	2026-07-30 14:57:08.264381+03
46	19	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-30 15:03:19.236715+03
47	22	LOGIN_FAILED	\N	\N	Failed attempt 1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-30 15:03:37.663705+03
48	26	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-30 15:03:54.362439+03
49	26	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-30 15:06:05.210417+03
50	26	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-30 15:06:19.916948+03
52	10	LOGIN	\N	\N	Successful login	127.0.0.1	node	2026-07-30 15:15:03.661821+03
57	26	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-30 15:16:40.72262+03
58	22	LOGIN_FAILED	\N	\N	Failed attempt 2	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-30 15:17:06.066044+03
59	26	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-30 15:17:28.720272+03
60	26	MEMBER_DEPOSIT_SUBMITTED	transaction	6	MDP-MS7HBVXT-GP1G Â· Bank transfer Â· UGX 100000	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-30 15:18:06.846826+03
61	26	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-30 15:19:48.904196+03
62	\N	LOGIN_FAILED	\N	\N	Unknown account: credit@kasangatig40.test	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-30 15:19:54.366581+03
63	\N	LOGIN_FAILED	\N	\N	Unknown account: credit@kasangatig40.test	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-30 15:20:05.327944+03
64	19	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-30 15:20:25.265716+03
65	19	TRANSACTION_VERIFIED	transaction	6	MDP-MS7HBVXT-GP1G Â· Funds received and uploaded receipt evidence matched	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-30 15:21:22.291288+03
67	10	LOGIN	\N	\N	Successful login	127.0.0.1	node	2026-07-30 15:29:34.156061+03
72	19	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-30 15:31:32.115102+03
73	26	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-30 15:31:46.878256+03
74	1	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 16:14:33.932912+03
75	1	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 16:14:58.881858+03
76	1	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 16:15:26.742195+03
77	1	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 16:15:56.841595+03
78	1	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 16:16:21.73428+03
79	26	LOGIN_FAILED	\N	\N	Failed attempt 1	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 16:17:17.532291+03
80	18	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 16:18:30.647767+03
81	21	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 16:18:31.874581+03
82	17	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 16:18:32.833194+03
83	18	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 16:21:43.605285+03
84	21	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 16:21:44.825453+03
85	17	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 16:21:45.665225+03
86	18	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 16:22:23.768878+03
87	21	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 16:22:24.800139+03
88	17	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 16:22:25.502715+03
89	26	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-30 16:28:57.420397+03
90	23	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-30 16:29:05.680187+03
91	23	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-30 16:33:42.365213+03
92	19	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-30 16:33:50.445711+03
93	19	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 17:00:23.318969+03
94	19	REPORT_EXPORTED	department_report	credits	Savings Report - xml	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 17:00:24.152677+03
95	19	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 17:00:57.760981+03
96	19	REPORT_EXPORTED	department_report	credits	Savings Report - xml	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 17:00:58.32181+03
97	19	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 17:01:30.023288+03
98	19	REPORT_EXPORTED	department_report	credits	Savings Report - xml	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 17:01:30.094566+03
99	17	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 17:02:02.37188+03
100	18	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 17:02:03.260154+03
101	20	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 17:02:03.8034+03
102	12	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 17:02:04.475628+03
103	23	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-07-30 17:02:05.094222+03
104	19	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-30 17:05:33.092797+03
105	26	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-30 17:05:49.11003+03
106	26	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-30 17:32:05.157449+03
107	17	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-30 17:32:14.923784+03
108	17	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-30 19:31:08.282834+03
109	22	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-30 19:31:14.420923+03
110	17	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 08:29:59.210624+03
111	17	DEPARTMENT_FILE_UPLOADED	finance	1785475987408-94638ecefdf71bd2c74a98f8.jpg	Mukiibi Shuquran.JPG	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 08:33:07.435042+03
112	17	FINANCE_ACCOUNT_CREATED	finance_account	1	ACC-39402FB0DA8F4CD5 Â· Organization Operating Account Â· bank Â· opening UGX 500000	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 08:33:07.52857+03
113	17	FINANCE_BUDGET_SUBMITTED	finance_budget	1	BUD-63A209E9604F4010 - UGX 200000	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 08:49:48.436261+03
114	17	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 08:49:52.632371+03
115	22	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 08:49:54.867852+03
116	22	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 09:35:11.131913+03
117	23	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 09:58:22.569862+03
118	23	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 09:58:36.988786+03
119	22	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 09:58:41.96989+03
120	22	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 09:58:48.041676+03
121	20	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 09:58:55.250173+03
122	20	MEMBER_BIO_SEARCHED	member_bio_data	\N	query=all; status=all; results=1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 09:58:55.379709+03
123	20	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 10:00:31.256085+03
124	22	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 10:00:33.519918+03
125	22	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 10:09:38.898762+03
126	23	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 10:10:55.91003+03
127	23	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 10:47:48.806705+03
128	23	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 10:47:58.435645+03
129	22	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 10:48:32.842869+03
130	22	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 10:49:04.000636+03
131	21	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 10:50:08.03912+03
132	21	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 10:50:17.793304+03
133	26	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 10:50:30.36615+03
134	26	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 10:54:30.278119+03
135	22	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 10:54:35.719149+03
136	22	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 10:55:55.01865+03
137	\N	LOGIN_FAILED	\N	\N	Unknown account: audit@kasangatig40.test	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 10:56:01.635197+03
138	22	EXECUTIVE_APPROVED	department_activity	1	EXEC-BUD-63A209E9604F4010 ? Budget approval - FY 2026 ? Reconciled after atomic approval fix	\N	\N	2026-07-31 11:04:58.86539+03
139	22	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 11:07:48.911737+03
140	22	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 11:08:44.112578+03
141	17	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 11:08:53.635188+03
142	17	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 11:10:32.763233+03
143	\N	LOGIN_FAILED	\N	\N	Unknown account: audit@kasangatig40.test	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 11:10:40.679079+03
144	23	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 11:10:56.19283+03
145	23	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 11:11:42.556209+03
146	22	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 11:22:33.995924+03
147	18	INVESTMENT_PROPOSAL_ADVANCED	investment_proposal	1	PROP-5586D4DB9210409F Â· financial_analysis	127.0.0.1	node	2026-07-31 12:29:39.611431+03
148	17	FINANCE_INVESTMENT_APPROVE	investment_proposal	1	PROP-5586D4DB9210409F Â· Financially viable for Executive review.	127.0.0.1	node	2026-07-31 12:29:40.135145+03
150	18	INVESTMENT_PROJECT_CREATED	investment_project	1	INV-A226946EEE674D42	127.0.0.1	node	2026-07-31 12:29:40.450959+03
151	22	EXECUTIVE_PROJECT_COMMENT	investment_project	1	INV-A226946EEE674D42 Â· Initial Executive monitoring note.	127.0.0.1	node	2026-07-31 12:29:40.532106+03
152	22	EXECUTIVE_PROJECT_SUSPEND	investment_project	1	INV-A226946EEE674D42 Â· Temporary lifecycle-control verification.	127.0.0.1	node	2026-07-31 12:29:40.554655+03
153	22	EXECUTIVE_PROJECT_REACTIVATE	investment_project	1	INV-A226946EEE674D42 Â· Lifecycle control verified successfully.	127.0.0.1	node	2026-07-31 12:29:40.570431+03
161	22	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 14:16:35.491477+03
162	26	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 14:16:55.603405+03
163	26	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 14:48:41.623237+03
164	22	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 14:48:44.034921+03
165	22	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 15:00:55.83917+03
166	22	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 15:06:29.850877+03
167	22	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 15:37:00.824564+03
168	26	LOGIN_FAILED	\N	\N	Failed attempt 1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 15:37:37.003418+03
169	26	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 15:38:15.388693+03
170	26	MEMBER_DEPOSIT_SUBMITTED	transaction	9	MDP-MS8XNE2K-F7QM Â· Bank transfer Â· UGX 100000	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 15:42:43.597575+03
171	26	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 15:42:48.097324+03
172	19	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 15:43:01.084449+03
173	19	TRANSACTION_VERIFIED	transaction	9	MDP-MS8XNE2K-F7QM Â· Funds received and uploaded receipt evidence matched	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 15:44:28.427382+03
174	19	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 15:46:22.850882+03
175	19	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 15:46:22.86898+03
176	20	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 15:46:38.350977+03
177	20	MEMBER_BIO_SEARCHED	member_bio_data	\N	query=all; status=all; results=1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 15:46:38.828437+03
178	20	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 15:59:46.394964+03
179	22	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 15:59:50.609626+03
180	22	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 16:01:52.997981+03
181	20	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 16:02:09.338171+03
182	20	MEMBER_BIO_SEARCHED	member_bio_data	\N	query=all; status=all; results=1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 16:02:09.691993+03
183	20	DOCUMENT_CREATED	organization_document	1	DOC-6F1C1C19FDB7483E	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 16:05:18.398826+03
184	20	DOCUMENT_VERSION_UPLOADED	organization_document	1	version=1.0; sha256=4afcce647c0b7907bd53ac348536906e3eb4f06235df240095b2db6d5f80f09c	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 16:05:18.438449+03
185	20	DOCUMENT_VIEWED_IN_APP	organization_document	1	version=1.0	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 16:05:23.84566+03
186	20	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 16:05:37.524684+03
187	22	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 16:05:40.984282+03
188	22	DOCUMENT_VIEWED_IN_APP	organization_document	1	version=1.0	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 16:05:48.146909+03
189	22	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 16:06:17.101187+03
190	21	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 16:06:25.057441+03
191	21	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 16:09:58.860168+03
192	26	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 16:10:19.322739+03
193	26	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 19:23:44.828067+03
194	22	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 19:23:50.792035+03
195	22	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 19:24:29.297496+03
196	21	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-31 19:24:34.23041+03
226	23	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-01 11:20:09.811113+03
227	\N	HISTORICAL_OPENING_DATA_IMPORTED	financial_reporting_period	2	FY2026 draft snapshot: 18 member balance rows, savings UGX 113827903, investment ledger UGX 162392395.30	\N	\N	2026-08-01 11:57:24.76621+03
228	11	EXECUTIVE_MEMO_IMPORTED	organization_document	2	sha256=86727a164395f6282fd58c57f95aef71d8db8424d71586a3215cbeaf4af7e38d; governance appointments=28	\N	\N	2026-08-01 12:26:02.848241+03
229	22	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-01 12:31:37.942544+03
230	22	DOCUMENT_VIEWED_IN_APP	organization_document	1	version=1.0	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-01 12:34:56.79131+03
231	22	DOCUMENT_VIEWED_IN_APP	organization_document	2	version=1.0	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-01 12:35:08.126744+03
232	22	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-01 12:37:55.978231+03
233	17	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-01 12:38:09.873738+03
234	20	PROVISIONAL_MEMBER_ACCOUNTS_IMPORTED	member	\N	FY2026 recognized accounts; members created=17; users created=17; Joshua Ssewanyana excluded as exited	\N	\N	2026-08-01 12:52:09.084286+03
235	31	LOGIN	\N	\N	Successful login	127.0.0.1	node	2026-08-01 12:53:58.415405+03
236	38	LOGIN	\N	\N	Successful login	127.0.0.1	node	2026-08-01 12:54:36.403326+03
237	44	LOGIN	\N	\N	Successful login	127.0.0.1	node	2026-08-01 13:05:46.393457+03
238	17	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-01 14:38:07.080284+03
239	22	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-01 14:38:13.281313+03
240	22	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-01 14:55:31.115234+03
241	19	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-01 14:55:38.195479+03
274	33	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-08-01 16:15:23.509735+03
275	32	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-08-01 16:15:26.718925+03
276	19	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-01 16:34:34.923194+03
277	35	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-01 16:35:12.974637+03
278	35	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.22000.653	2026-08-01 16:39:47.593029+03
279	35	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-01 18:39:12.831699+03
280	20	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-01 18:39:28.631395+03
281	20	MEMBER_BIO_SEARCHED	member_bio_data	\N	query=all; status=all; results=18	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-01 18:39:29.093231+03
282	20	PASSWORD_RESET	user	33	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-01 18:41:43.858057+03
283	20	MEMBER_BIO_SEARCHED	member_bio_data	\N	query=all; status=all; results=18	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-01 18:41:43.906791+03
284	20	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-01 18:42:03.728644+03
285	33	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-01 18:42:43.292883+03
286	35	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 08:32:39.612202+03
287	35	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 08:33:20.077586+03
288	17	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 08:33:42.328273+03
289	17	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 08:34:52.291098+03
290	35	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 08:34:57.627062+03
291	11	OFFICIAL_RECORDS_IMPORTED	organization_document	official-2025-2026	9 official documents; verified Old Mutual and UAP fund records	\N	\N	2026-08-03 09:25:31.68287+03
292	35	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 11:12:13.554692+03
293	35	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 11:12:31.616506+03
294	35	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 11:14:41.917193+03
295	35	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 11:14:44.498678+03
296	35	DOCUMENT_VIEWED_IN_APP	organization_document	6	version=1.1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 11:15:03.165918+03
297	35	DOCUMENT_VIEWED_IN_APP	organization_document	1	version=1.0	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 11:15:25.899155+03
298	35	DOCUMENT_ARCHIVED	organization_document	1	DOC-6F1C1C19FDB7483E - doc 2	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 11:15:33.211569+03
299	35	DOCUMENT_VIEWED_IN_APP	organization_document	11	version=1.1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 11:15:35.725188+03
300	35	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 11:16:08.282878+03
301	21	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 11:17:30.80327+03
302	21	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 11:17:56.962135+03
303	19	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 11:18:08.442009+03
304	19	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 11:20:13.495138+03
305	39	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 11:20:35.890106+03
306	39	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 11:22:03.860065+03
307	39	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 11:22:07.754166+03
308	39	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 11:26:02.541451+03
309	35	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 11:26:25.425389+03
310	35	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 11:27:31.899163+03
311	20	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 11:27:43.264998+03
312	20	MEMBER_BIO_SEARCHED	member_bio_data	\N	query=all; status=all; results=18	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 11:27:43.852309+03
313	35	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 11:28:23.980112+03
314	35	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 11:28:27.781812+03
315	23	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 11:28:32.835314+03
316	23	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 11:28:36.140766+03
317	20	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 11:28:55.254131+03
318	20	MEMBER_BIO_SEARCHED	member_bio_data	\N	query=all; status=all; results=18	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 11:28:55.331778+03
319	20	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 11:30:26.539936+03
320	22	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 11:30:30.886075+03
321	22	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 11:32:14.441293+03
322	17	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 11:32:25.659024+03
323	17	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 11:47:33.665957+03
324	20	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 11:47:48.457803+03
325	20	MEMBER_BIO_SEARCHED	member_bio_data	\N	query=all; status=all; results=18	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 11:47:48.801837+03
326	20	DOCUMENT_VIEWED_IN_APP	organization_document	11	version=1.1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 11:48:27.700147+03
327	20	DOCUMENT_VIEWED_IN_APP	organization_document	9	version=1.1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 11:48:51.180574+03
328	20	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 11:50:14.565976+03
329	35	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 11:50:21.213542+03
330	35	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 11:52:45.454469+03
331	20	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 11:52:58.894089+03
332	20	MEMBER_BIO_SEARCHED	member_bio_data	\N	query=all; status=all; results=18	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 11:52:59.562983+03
333	20	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 12:02:43.323085+03
334	35	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 12:03:58.085944+03
335	35	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 12:08:08.180568+03
336	20	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 12:08:24.874721+03
337	20	MEMBER_BIO_SEARCHED	member_bio_data	\N	query=all; status=all; results=18	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 12:08:24.940449+03
338	20	MEMBER_DELETED	member	1	G40-2026-2950C377 - Lazor Prince; reason=nolonger needed; archived savings=200000.00; archived shares=0.00; disabled accounts=1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 12:09:02.666905+03
339	20	MEMBER_BIO_SEARCHED	member_bio_data	\N	query=all; status=all; results=17	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 12:09:02.994858+03
340	20	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 12:09:13.643734+03
341	35	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 12:09:16.178749+03
342	35	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 12:09:33.508521+03
343	35	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 12:12:16.669332+03
344	35	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 12:23:15.506243+03
345	35	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 12:23:36.31607+03
346	35	PASSWORD_CHANGED	user	35	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 12:24:06.266183+03
347	35	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 12:24:11.928752+03
348	35	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 12:24:35.927254+03
349	35	LOGIN	\N	\N	Successful login	192.168.100.78	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:153.0) Gecko/20100101 Firefox/153.0	2026-08-03 12:27:55.721454+03
350	35	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 13:52:48.440009+03
351	35	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 13:52:52.523831+03
352	35	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 13:53:49.041188+03
353	35	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 15:48:19.891581+03
354	19	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 15:48:35.49713+03
355	19	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 15:58:39.865645+03
356	43	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:00:16.74717+03
357	43	LOAN_APPLIED	loan	1	LN-1226CA16CAAA465C - UGX 5000000	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:02:39.968769+03
358	43	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:03:09.951864+03
359	31	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:03:29.846447+03
360	31	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:03:55.376394+03
361	20	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:05:22.712277+03
362	20	MEMBER_BIO_SEARCHED	member_bio_data	\N	query=all; status=all; results=17	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:05:23.236646+03
363	20	PASSWORD_RESET	user	41	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:05:49.870333+03
364	20	MEMBER_BIO_SEARCHED	member_bio_data	\N	query=all; status=all; results=17	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:05:49.891727+03
365	20	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:06:34.692068+03
366	41	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:06:44.294313+03
367	41	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:08:03.724567+03
368	20	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:08:40.4229+03
369	20	MEMBER_BIO_SEARCHED	member_bio_data	\N	query=all; status=all; results=17	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:08:40.845577+03
370	20	PASSWORD_RESET	user	44	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:09:51.959368+03
371	20	MEMBER_BIO_SEARCHED	member_bio_data	\N	query=all; status=all; results=17	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:09:51.994709+03
372	20	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:09:57.818285+03
373	44	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:10:04.151504+03
374	44	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:10:56.086409+03
375	20	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:11:08.463613+03
376	20	MEMBER_BIO_SEARCHED	member_bio_data	\N	query=all; status=all; results=17	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:11:08.79271+03
377	20	PASSWORD_RESET	user	45	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:11:29.540152+03
378	20	MEMBER_BIO_SEARCHED	member_bio_data	\N	query=all; status=all; results=17	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:11:29.556361+03
379	20	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:11:42.587173+03
380	45	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:11:52.122176+03
381	45	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:12:23.157898+03
382	45	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:12:49.273754+03
383	19	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:13:12.828586+03
384	19	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:13:26.369776+03
385	20	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:13:36.562963+03
386	20	MEMBER_BIO_SEARCHED	member_bio_data	\N	query=all; status=all; results=17	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:13:36.615347+03
387	20	PASSWORD_RESET	user	44	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:13:56.380427+03
388	20	MEMBER_BIO_SEARCHED	member_bio_data	\N	query=all; status=all; results=17	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:13:56.397669+03
389	20	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:14:06.913308+03
390	44	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:14:14.782575+03
391	44	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:14:41.025667+03
392	35	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:14:48.060157+03
393	35	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:15:10.180455+03
394	44	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:15:59.950118+03
395	44	LOAN_RECOMMEND	loan	1	LN-1226CA16CAAA465C - good to go 	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:57:00.144174+03
396	44	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:57:26.779315+03
397	35	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:57:39.179484+03
398	35	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 16:58:14.722524+03
399	44	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 17:00:37.057999+03
400	44	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 17:01:38.270726+03
401	22	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 17:01:48.692897+03
402	22	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 17:01:51.649147+03
403	20	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 17:01:56.72433+03
404	20	MEMBER_BIO_SEARCHED	member_bio_data	\N	query=all; status=all; results=17	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 17:01:56.786285+03
405	20	PASSWORD_RESET	user	39	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 17:02:50.778454+03
406	20	MEMBER_BIO_SEARCHED	member_bio_data	\N	query=all; status=all; results=17	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 17:02:50.80786+03
407	20	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 17:02:55.603356+03
408	39	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 17:03:02.323431+03
409	39	LOAN_APPROVE	loan	1	LN-1226CA16CAAA465C - ok	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 17:03:18.267294+03
410	39	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 17:03:30.486354+03
411	35	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 17:03:36.004109+03
412	35	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 17:04:23.130159+03
413	20	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 17:04:34.179957+03
414	20	MEMBER_BIO_SEARCHED	member_bio_data	\N	query=all; status=all; results=17	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 17:04:34.495312+03
415	20	PASSWORD_RESET	user	37	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 17:05:03.069153+03
416	20	MEMBER_BIO_SEARCHED	member_bio_data	\N	query=all; status=all; results=17	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 17:05:03.085121+03
417	20	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 17:05:06.858167+03
418	37	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 17:05:11.939046+03
419	37	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 17:42:26.910609+03
420	35	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 17:43:02.167857+03
421	35	LOAN_AUTHORIZE	loan	1	LN-1226CA16CAAA465C - Authorized within executive authority.	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 18:11:10.246068+03
422	35	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 18:11:16.163955+03
423	44	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 18:11:22.750333+03
424	44	LOAN_DISBURSED	loan	1	DSB-35C017CDCB1B4249	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 18:11:33.686701+03
425	44	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 18:15:26.32455+03
426	44	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 18:15:29.268353+03
427	44	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 18:15:38.938527+03
428	35	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 18:16:01.597676+03
429	35	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 18:18:13.475179+03
430	20	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 18:18:23.877667+03
431	20	MEMBER_BIO_SEARCHED	member_bio_data	\N	query=all; status=all; results=17	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 18:18:24.287626+03
432	20	PASSWORD_RESET	user	43	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 18:18:59.635061+03
433	20	MEMBER_BIO_SEARCHED	member_bio_data	\N	query=all; status=all; results=17	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 18:18:59.65343+03
434	20	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 18:19:06.057359+03
435	43	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-03 18:19:11.124802+03
436	20	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-04 09:13:12.053869+03
437	20	MEMBER_BIO_SEARCHED	member_bio_data	\N	query=all; status=all; results=17	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-04 09:13:15.812102+03
438	44	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-04 09:16:14.932988+03
439	44	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-04 09:24:14.53407+03
440	44	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-04 09:33:31.492337+03
441	44	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-04 09:34:26.487307+03
442	35	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-04 09:34:33.444108+03
443	35	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-04 09:36:03.027501+03
444	39	LOGIN_FAILED	\N	\N	Failed attempt 1	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-04 09:36:13.139772+03
445	20	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-04 09:36:18.011266+03
446	20	MEMBER_BIO_SEARCHED	member_bio_data	\N	query=all; status=all; results=17	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-04 09:36:18.385643+03
447	20	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-04 09:36:56.971795+03
448	39	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-04 09:37:15.78052+03
449	39	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-04 09:38:31.153882+03
450	20	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-04 09:38:37.934949+03
451	20	MEMBER_BIO_SEARCHED	member_bio_data	\N	query=all; status=all; results=17	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-04 09:38:38.477335+03
452	20	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-04 09:38:41.146811+03
453	21	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-04 09:38:45.667495+03
454	21	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-04 09:39:04.331909+03
455	21	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-04 09:39:24.749248+03
456	21	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-04 09:41:09.965557+03
457	23	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-04 09:42:04.346866+03
458	23	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-04 09:42:15.558176+03
459	22	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-04 09:42:21.191519+03
460	22	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-04 09:43:12.316418+03
461	35	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-04 09:43:52.354172+03
462	35	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-04 09:46:19.292111+03
463	20	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-04 09:46:23.601565+03
464	20	MEMBER_BIO_SEARCHED	member_bio_data	\N	query=all; status=all; results=17	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-04 09:46:23.669812+03
465	20	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-04 09:46:37.667092+03
466	44	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-04 09:46:44.768829+03
467	44	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-04 09:46:54.516225+03
468	35	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-04 09:47:00.058911+03
469	35	LOGOUT	\N	\N	User signed out	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-04 09:50:22.182117+03
470	35	LOGIN	\N	\N	Successful login	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-08-04 10:02:17.671446+03
\.


--
-- Data for Name: audit_plans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_plans (id, audit_number, audit_type, department_id, audit_period, lead_auditor, audit_team, objective, scope, status, planned_date, started_at, completion_date, created_by, approved_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: audit_recommendations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_recommendations (id, recommendation_number, finding_id, department_id, description, issued_on, due_date, status, department_response, follow_up_date, verified_by, completed_at, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: audit_risks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_risks (id, risk_number, department_id, risk_category, description, likelihood, impact, risk_level, mitigation_plan, risk_owner, status, last_reviewed_at, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.branches (id, name, code, address, active, created_at) FROM stdin;
1	Kampala Central	KLA-01	Kampala, Uganda	t	2026-07-27 11:57:54.561495+03
\.


--
-- Data for Name: conversation_members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.conversation_members (conversation_id, user_id, member_role, joined_at, muted_until, archived, last_read_at) FROM stdin;
1	22	member	2026-07-31 14:17:29.547274+03	\N	f	\N
1	26	member	2026-07-31 14:17:29.547274+03	\N	f	\N
2	14	member	2026-08-04 09:40:32.628014+03	\N	f	\N
2	21	member	2026-08-04 09:40:32.628014+03	\N	f	\N
\.


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.conversations (id, user_low, user_high, created_at, last_message_at, type, title, description, created_by, only_admins_can_post, avatar_color) FROM stdin;
1	22	26	2026-07-31 14:17:29.547274+03	2026-07-31 14:48:34.420113+03	direct	\N	\N	26	f	#1d6449
2	14	21	2026-08-04 09:40:32.628014+03	2026-08-04 09:40:32.628014+03	direct	\N	\N	21	f	#1d6449
\.


--
-- Data for Name: department_activities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.department_activities (id, department_id, reference, activity_type, title, description, amount, status, visibility_level, created_by, assigned_to, approved_by, created_at, updated_at, approved_at, decision_comment, decision_by, decision_at) FROM stdin;
1	2	EXEC-BUD-63A209E9604F4010	finance-budget	Budget approval - FY 2026	Department 2 allocation	200000.00	approved	4	17	\N	22	2026-07-31 08:49:48.267568+03	2026-07-31 10:54:52.668381+03	2026-07-31 10:54:52.668381+03	Approved within executive authority.	22	2026-07-31 10:54:52.668381+03
\.


--
-- Data for Name: department_assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.department_assignments (id, user_id, department_id, position_title, authority_level, can_view, can_create, can_edit, can_approve, is_head, assigned_by, active, created_at) FROM stdin;
14	13	6	System Administrator	5	t	t	t	t	t	\N	f	2026-07-27 18:54:29.315608+03
1470	12	4	Investment Audit Observer	4	t	f	f	f	t	\N	t	2026-07-28 16:45:28.558245+03
247	17	2	Finance Officer	3	t	t	t	t	f	\N	t	2026-07-27 19:14:08.065872+03
1471	12	5	Welfare Audit Observer	4	t	f	f	f	t	\N	t	2026-07-28 16:45:28.560428+03
248	18	4	Investment Officer	3	t	t	t	f	f	\N	t	2026-07-27 19:14:08.069084+03
1472	12	6	Governance Audit Observer	4	t	f	f	f	t	\N	t	2026-07-28 16:45:28.562372+03
181	11	6	Membership & Records Officer	3	t	t	t	f	f	\N	f	2026-07-27 19:04:21.772752+03
4	7	3	Credits Verifier	3	t	f	t	t	f	\N	f	2026-07-27 18:54:29.291476+03
6	8	3	Disbursement Officer	2	t	t	f	f	f	\N	f	2026-07-27 18:54:29.296059+03
250	20	1	Legal Officer	3	t	t	t	t	f	\N	t	2026-07-27 19:14:08.074446+03
251	21	5	Welfare Officer	3	t	t	t	t	f	\N	t	2026-07-27 19:14:08.078262+03
252	22	6	Executive Officer	4	t	t	t	t	t	\N	t	2026-07-27 19:14:08.080721+03
253	23	7	Supervisory Officer	4	t	t	t	f	t	\N	t	2026-07-27 19:14:08.083177+03
2	5	2	Treasurer	4	t	t	t	t	t	\N	t	2026-07-27 18:54:29.286262+03
3	7	2	Accountant	3	t	t	t	f	f	\N	t	2026-07-27 18:54:29.28936+03
2352	32	6	Board of Directors: Director	4	t	t	t	t	f	20	t	2026-08-01 12:52:09.084286+03
5	8	2	Cashier	2	t	t	f	f	f	\N	t	2026-07-27 18:54:29.29411+03
2353	32	1	Legal Committee: Member	2	t	f	f	f	f	20	t	2026-08-01 12:52:09.084286+03
2355	34	5	Welfare Committee: Chairperson	3	t	t	t	t	t	20	t	2026-08-01 12:52:09.084286+03
2356	35	6	Board of Directors: Director; Executive Committee: Chairperson	4	t	t	t	t	t	20	t	2026-08-01 12:52:09.084286+03
2357	35	2	Finance Committee: Chairperson	3	t	f	f	f	f	20	t	2026-08-01 12:52:09.084286+03
2358	36	5	Welfare Committee: Member	2	t	f	f	t	f	20	t	2026-08-01 12:52:09.084286+03
20	6	6	Chief Executive Officer	4	t	t	t	t	t	\N	t	2026-07-27 18:54:29.328478+03
15	6	1	Chief Executive Officer	4	t	t	t	t	t	\N	f	2026-07-27 18:54:29.319467+03
16	6	2	Chief Executive Officer	4	t	t	t	t	t	\N	f	2026-07-27 18:54:29.321525+03
17	6	3	Chief Executive Officer	4	t	t	t	t	t	\N	f	2026-07-27 18:54:29.323311+03
18	6	4	Chief Executive Officer	4	t	t	t	t	t	\N	f	2026-07-27 18:54:29.325016+03
19	6	5	Chief Executive Officer	4	t	t	t	t	t	\N	f	2026-07-27 18:54:29.326758+03
21	6	7	Chief Executive Officer	4	t	t	t	t	t	\N	f	2026-07-27 18:54:29.330124+03
1481	6	273	Chief Executive Officer	4	t	f	f	t	t	\N	f	2026-07-28 16:45:28.581485+03
22	2	1	Board Chairperson	5	t	f	f	t	t	\N	f	2026-07-27 18:54:29.332605+03
23	2	2	Board Chairperson	5	t	f	f	t	t	\N	f	2026-07-27 18:54:29.33612+03
2359	37	6	Executive Committee: Member	4	t	t	t	t	f	20	t	2026-08-01 12:52:09.084286+03
2360	37	4	Investment Committee: Member	2	t	f	f	f	f	20	t	2026-08-01 12:52:09.084286+03
24	2	3	Board Chairperson	5	t	f	f	t	t	\N	f	2026-07-27 18:54:29.338361+03
2361	38	6	Board of Directors: Director	4	t	t	t	t	f	20	t	2026-08-01 12:52:09.084286+03
2362	38	1	Legal Committee: Chairperson	3	t	f	f	f	f	20	t	2026-08-01 12:52:09.084286+03
25	2	4	Board Chairperson	5	t	f	f	t	t	\N	f	2026-07-27 18:54:29.340158+03
26	2	5	Board Chairperson	5	t	f	f	t	t	\N	f	2026-07-27 18:54:29.34194+03
190	4	1	Legal Secretariat	3	t	t	t	f	f	\N	f	2026-07-27 19:04:21.793574+03
28	2	7	Board Chairperson	5	t	t	t	t	t	\N	f	2026-07-27 18:54:29.345292+03
10	4	5	Welfare Secretary	3	t	t	t	f	f	\N	f	2026-07-27 18:54:29.307009+03
1489	2	273	Board Audit Authority	5	t	f	f	t	t	\N	f	2026-07-28 16:45:28.596777+03
29	3	7	Vice Chairperson	4	t	t	t	t	t	\N	f	2026-07-27 18:54:29.347641+03
9	4	6	Organization Secretary	4	t	t	t	t	t	\N	t	2026-07-27 18:54:29.305214+03
2364	40	6	Board of Directors: Director; Executive Committee: Secretary	4	t	t	t	t	f	20	t	2026-08-01 12:52:09.084286+03
2365	40	1	Legal Committee: Member	2	t	f	f	f	f	20	t	2026-08-01 12:52:09.084286+03
2366	41	4	Investment Committee: Chairperson	3	t	t	t	t	t	20	t	2026-08-01 12:52:09.084286+03
27	2	6	Board Chairperson	5	t	f	f	t	t	\N	t	2026-07-27 18:54:29.343635+03
2367	42	6	Executive Committee: Treasurer	4	t	t	t	t	f	20	t	2026-08-01 12:52:09.084286+03
2368	42	2	Finance Committee: Member	2	t	f	f	f	f	20	t	2026-08-01 12:52:09.084286+03
1465	12	273	Lead Internal Auditor	4	t	t	t	t	t	\N	t	2026-07-28 16:45:28.468706+03
11	12	7	Independent Assurance Observer	4	t	f	f	f	t	\N	t	2026-07-27 18:54:29.309425+03
193	12	1	Compliance Observer	4	t	f	f	f	t	\N	t	2026-07-27 19:04:21.799058+03
12	12	2	Audit Observer	4	t	f	f	f	t	\N	t	2026-07-27 18:54:29.311475+03
2369	43	7	Supervisory Committee: Member	2	t	f	f	t	f	20	t	2026-08-01 12:52:09.084286+03
2370	43	273	Audit Committee: Member	2	t	f	f	f	f	20	t	2026-08-01 12:52:09.084286+03
212	3	6	Executive Committee Member	4	t	t	t	t	t	\N	t	2026-07-27 19:04:21.84125+03
30	3	4	Board Member	4	t	f	f	t	t	\N	f	2026-07-27 18:54:29.349389+03
2348	14	1	Membership & Records Officer	2	t	t	t	f	f	\N	t	2026-07-29 10:52:16.113972+03
2349	11	1	Membership & Records Officer	2	t	t	t	f	f	\N	t	2026-07-29 10:52:16.113972+03
2372	44	2	Finance Committee: Member	2	t	f	f	f	f	20	t	2026-08-01 12:52:09.084286+03
2373	45	7	Supervisory Committee: Chairperson	3	t	t	t	t	t	20	t	2026-08-01 12:52:09.084286+03
2354	33	3	Credit Committee: Member	2	t	t	t	t	f	20	t	2026-08-01 12:52:09.084286+03
2374	46	5	Welfare Committee: Member	2	t	f	f	f	f	20	t	2026-08-01 12:52:09.084286+03
2375	46	273	Audit Committee: Chairperson	3	t	t	t	t	t	20	t	2026-08-01 12:52:09.084286+03
2376	47	6	Executive Committee: Vice Chairperson	4	t	t	t	t	f	20	t	2026-08-01 12:52:09.084286+03
2377	47	4	Investment Committee: Member	2	t	f	f	f	f	20	t	2026-08-01 12:52:09.084286+03
2371	44	3	Credit Committee: Member	2	t	t	t	t	f	20	t	2026-08-01 12:52:09.084286+03
13	12	3	Credit Audit Observer	4	t	f	f	t	t	\N	t	2026-07-27 18:54:29.313255+03
249	19	3	Credits Officer	3	t	t	t	t	f	\N	t	2026-07-27 19:14:08.071538+03
7	9	3	Loans Officer	3	t	t	t	t	f	\N	t	2026-07-27 18:54:29.298673+03
8	10	3	Credit Committee Member	4	t	t	t	t	t	\N	t	2026-07-27 18:54:29.30256+03
2363	39	3	Credit Committee: Chairperson	3	t	t	t	t	t	20	t	2026-08-01 12:52:09.084286+03
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.departments (id, organization_id, code, name, description, sort_order, active, created_at) FROM stdin;
5	1	welfare	Welfare	Member welfare contributions, assistance requests, cases and benefit approvals.	1	t	2026-07-27 18:54:29.273082+03
4	1	investment	Investment	Projects, member investments, performance, returns and asset oversight.	2	t	2026-07-27 18:54:29.271472+03
2	1	finance	Finance	Organization income, expenditure, budgets, contributions and financial reporting.	3	t	2026-07-27 18:54:29.267405+03
1	1	legal	Legal	Legal affairs, contracts, statutory records, disputes and compliance guidance.	4	t	2026-07-27 18:54:29.254874+03
6	1	executive	Executive	Executive leadership, membership records, administration, human resources, communication, meetings and documents.	5	t	2026-07-27 18:54:29.274582+03
7	1	supervisory	Supervisory	Independent departmental supervision, accountability reviews and leadership follow-up.	6	t	2026-07-27 18:54:29.27599+03
273	1	audit	Audit	Independent assurance, audits, findings, investigations, risk, fraud detection and compliance monitoring.	7	t	2026-07-28 16:45:28.258322+03
3	1	credits	Credits Department	Member savings, loan applications, guarantors, approvals, disbursements and repayments.	8	t	2026-07-27 18:54:29.269806+03
\.


--
-- Data for Name: finance_accounts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.finance_accounts (id, account_code, account_name, account_type, bank_name, account_number, balance, restricted, active, last_reconciled_at, created_at, created_by, updated_at, opening_balance, opening_balance_date, notes, supporting_document, supporting_document_name) FROM stdin;
1	ACC-39402FB0DA8F4CD5	Organization Operating Account	bank	Centenary Bank	****8834	500000.00	f	t	\N	2026-07-31 08:33:07.472704+03	17	2026-07-31 08:33:07.472704+03	500000.00	2026-07-31	we started with this.	/api/departments/finance/files/1785475987408-94638ecefdf71bd2c74a98f8.jpg	Mukiibi Shuquran.JPG
\.


--
-- Data for Name: finance_assets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.finance_assets (id, asset_code, asset_name, asset_type, purchase_date, purchase_value, current_value, status, department_id, location, custodian, created_by, created_at, photo_url, supporting_document) FROM stdin;
\.


--
-- Data for Name: finance_budgets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.finance_budgets (id, reference, department_id, fiscal_period, allocated_amount, used_amount, status, created_by, approved_by, created_at, executive_activity_id) FROM stdin;
1	BUD-63A209E9604F4010	2	FY 2026	200000.00	0.00	approved	17	22	2026-07-31 08:49:48.267568+03	1
\.


--
-- Data for Name: finance_invoices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.finance_invoices (id, invoice_number, supplier, description, amount, invoice_date, due_date, status, voucher_id, supporting_document, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: finance_payment_vouchers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.finance_payment_vouchers (id, voucher_number, department_id, supplier, description, category, budget_line, amount, payment_method, status, supporting_document, requested_by, finance_reviewed_by, executive_approved_by, processed_by, finance_comment, created_at, finance_reviewed_at, executive_approved_at, processed_at, executive_activity_id) FROM stdin;
\.


--
-- Data for Name: finance_procurements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.finance_procurements (id, reference, department_id, item_description, supplier, estimated_amount, approved_amount, stage, status, requested_by, finance_reviewed_by, executive_approved_by, purchase_order_number, goods_received_at, invoice_id, voucher_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: financial_reporting_periods; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.financial_reporting_periods (id, fiscal_year, period_end, status, currency, source_name, notes, created_at) FROM stdin;
2	2026	2026-06-30	draft	UGX	User-supplied photographed draft financial statements	Historical opening snapshot. Board approval date and signed final statements were not supplied.	2026-08-01 11:57:24.76621+03
\.


--
-- Data for Name: financial_statement_lines; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.financial_statement_lines (id, period_id, statement_type, line_code, line_name, note_number, current_amount, prior_amount, variance, sort_order) FROM stdin;
41	2	comprehensive_income	interest_income	Interest income	2	8214012.00	20842818.00	-12628806.00	10
42	2	comprehensive_income	other_income	Other income	3	18140534.00	4239327.00	13901207.00	20
43	2	comprehensive_income	total_income	Total income	\N	26354546.00	25082145.00	1272401.00	30
44	2	comprehensive_income	administration_expenses	Administration expenses	5	0.00	305000.00	-305000.00	40
45	2	comprehensive_income	professional_fees	Professional fees	7	1749600.00	3526528.00	-1776928.00	50
46	2	comprehensive_income	telephone_internet	Telephone and internet	10	100000.00	0.00	100000.00	60
47	2	comprehensive_income	annual_general_meeting	Annual General Meeting	11	2000000.00	2000000.00	0.00	70
48	2	comprehensive_income	financial_charges	Financial charges	12	413605.00	283669.00	129936.00	80
49	2	comprehensive_income	other_operating_expenses	Other operating expenses	13	0.00	4504198.00	-4504198.00	90
50	2	comprehensive_income	total_operating_expenses	Total operating expenses	\N	4263205.00	10619395.00	-6356190.00	100
51	2	comprehensive_income	surplus_after_tax	Surplus after tax provision	\N	22091341.00	14462750.00	7628591.00	110
52	2	financial_position	unit_trust_investment	Investments at fair value - Unit Trust	24	162392395.00	0.00	162392395.00	10
53	2	financial_position	trade_receivables	Trade receivables - loans and interest	14	19432301.00	21271790.00	-1839489.00	20
54	2	financial_position	other_receivables	Other receivables	15	0.00	603302.00	-603302.00	30
55	2	financial_position	cash_bank	Cash and bank balances	17	1773373.00	110295817.00	-108522444.00	40
56	2	financial_position	total_assets	Total assets	\N	183598069.00	132170909.00	51427160.00	50
57	2	financial_position	share_capital	Share capital	18	36040000.00	29940000.00	6100000.00	60
58	2	financial_position	retained_income	Retained income	\N	10966227.00	4338825.00	6627402.00	70
59	2	financial_position	total_equity	Total equity and reserves	\N	47006227.00	34278825.00	12727402.00	80
60	2	financial_position	member_savings	Members savings - trade payables	19	113827903.00	71310200.00	42517703.00	90
61	2	financial_position	dividend_payable	Dividend payable	23	15463939.00	10123925.00	5340014.00	100
62	2	financial_position	other_payables	Other payables and accruals	20	7300000.00	16457959.00	-9157959.00	110
63	2	financial_position	total_liabilities	Total liabilities	\N	136591842.00	97892084.00	38699758.00	120
64	2	financial_position	equity_liabilities	Total equity and liabilities	\N	183598069.00	132170909.00	51427160.00	130
65	2	equity_changes	opening_share_capital	Share capital at 1 July 2025	\N	29940000.00	\N	\N	10
66	2	equity_changes	share_purchases	Share purchases during the year	\N	6100000.00	\N	\N	20
67	2	equity_changes	closing_share_capital	Share capital at 30 June 2026	\N	36040000.00	\N	\N	30
68	2	equity_changes	opening_retained_earnings	Retained earnings at 1 July 2025	\N	14462750.00	\N	\N	40
69	2	equity_changes	dividends_paid	Dividends paid	\N	-10123925.00	\N	\N	50
70	2	equity_changes	profit_for_year	Profit for the year	\N	22091341.00	\N	\N	60
71	2	equity_changes	retained_before_proposed_dividend	Retained earnings before proposed dividends	\N	26430166.00	\N	\N	70
72	2	equity_changes	proposed_dividends	Proposed dividends	\N	-15463939.00	\N	\N	80
73	2	equity_changes	closing_retained_earnings	Retained earnings at 30 June 2026	\N	10966227.00	\N	\N	90
74	2	operating_notes	loan_processing_fees	Loan processing fees	3	1140000.00	1785600.00	-645600.00	10
75	2	operating_notes	prior_year_adjustments	Other income - prior year adjustments	3	4608139.00	1200.00	4606939.00	20
76	2	operating_notes	unit_trust_income	Unit Trust income	3	12392395.00	0.00	12392395.00	30
77	2	operating_notes	audit_fees	Audit fees	7	849600.00	1726528.00	-876928.00	40
78	2	operating_notes	consultancy_fees	Consultancy fees and other professional expenses	7	900000.00	1800000.00	-900000.00	50
79	2	operating_notes	welfare_fund	Welfare fund - weddings, exit and medical	20	5300000.00	6650000.00	-1350000.00	60
80	2	operating_notes	agm_accrual	AGM expenses accrual	20	2000000.00	2000000.00	0.00	70
\.


--
-- Data for Name: governance_appointments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.governance_appointments (id, body_id, legacy_balance_id, linked_member_id, member_name_as_recorded, canonical_member_name, position_title, status, source_document_id, notes, appointed_at, created_at) FROM stdin;
3	1	3	7	Banumba Francis	Francis Banumba	Director	active	2	\N	\N	2026-08-01 12:26:02.848241+03
18	5	3	7	Banumba Francis	Francis Banumba	Member	active	2	\N	\N	2026-08-01 12:26:02.848241+03
11	3	4	8	Josephine Babirye Kyobe	Josephine Babirye Kyobe	Member	active	2	\N	\N	2026-08-01 12:26:02.848241+03
22	7	5	9	Tugume Denis	Denis Tugume	Chairperson	active	2	\N	\N	2026-08-01 12:26:02.848241+03
4	1	6	10	Tabula Robert	Tabula Robert	Director	active	2	To be enrolled on URSB.	\N	2026-08-01 12:26:02.848241+03
5	2	6	10	Tabula Robert	Tabula Robert	Chairperson	active	2	\N	\N	2026-08-01 12:26:02.848241+03
19	6	6	10	Tabula Robert	Tabula Robert	Chairperson	active	2	\N	\N	2026-08-01 12:26:02.848241+03
24	7	7	11	Ntono Moreen Tabula	Ntono Moreen	Member	active	2	\N	\N	2026-08-01 12:26:02.848241+03
9	2	8	12	Rita Nakyanzi Sanyu	Ritah Nakyanzi	Member	active	2	Memo spelling differs from the savings schedule.	\N	2026-08-01 12:26:02.848241+03
14	4	8	12	Ritah Nakyanzi Sanyu	Ritah Nakyanzi	Member	active	2	\N	\N	2026-08-01 12:26:02.848241+03
1	1	9	13	Babirye Mary	Mary Babirye	Director	active	2	\N	\N	2026-08-01 12:26:02.848241+03
16	5	9	13	Babirye Mary	Mary Babirye	Chairperson	active	2	\N	\N	2026-08-01 12:26:02.848241+03
10	3	10	14	Baraza Olivia Nakayiza	Nakayiza Baraza Olivia	Chairperson	active	2	\N	\N	2026-08-01 12:26:02.848241+03
2	1	11	15	Jude Tadieus Kyobe	Jude Tadieus Kyobe	Director	active	2	\N	\N	2026-08-01 12:26:02.848241+03
7	2	11	15	Jude Tadieus Kyobe	Jude Tadieus Kyobe	Secretary	active	2	\N	\N	2026-08-01 12:26:02.848241+03
17	5	11	15	Jude Tadieus Kyobe	Jude Tadieus Kyobe	Member	active	2	\N	\N	2026-08-01 12:26:02.848241+03
13	4	12	16	Mutiga D. Brian	Brian Mutiga	Chairperson	active	2	\N	\N	2026-08-01 12:26:02.848241+03
8	2	13	17	Inhensiko K. Justine	Justine Kaudha Inhensiko	Treasurer	active	2	\N	\N	2026-08-01 12:26:02.848241+03
20	6	13	17	Justine Kaudha Inhensiko	Justine Kaudha Inhensiko	Member	active	2	\N	\N	2026-08-01 12:26:02.848241+03
26	8	14	18	Kalemba Paul	Paul Kalemba	Member	active	2	\N	\N	2026-08-01 12:26:02.848241+03
28	9	14	18	Kalemba Paul	Paul Kalemba	Member	active	2	\N	\N	2026-08-01 12:26:02.848241+03
12	3	15	19	Rwebingira Dan Ssalongo	Dan Rwebingira Ssalongo	Member	active	2	\N	\N	2026-08-01 12:26:02.848241+03
21	6	15	19	Rwebingira Dan Ssalongo	Dan Rwebingira Ssalongo	Member	active	2	\N	\N	2026-08-01 12:26:02.848241+03
25	8	16	20	Muhoozi Christopher	Christopher Muhoozi	Chairperson	active	2	\N	\N	2026-08-01 12:26:02.848241+03
23	7	17	21	Masaba Ralph	Ralph Masaba	Member	active	2	\N	\N	2026-08-01 12:26:02.848241+03
27	9	17	21	Ralph Masaba	Ralph Masaba	Chairperson	active	2	\N	\N	2026-08-01 12:26:02.848241+03
6	2	18	22	Ezra Nayoga	Ezrah Nayoga	Vice Chairperson	active	2	Memo spelling differs from the savings schedule.	\N	2026-08-01 12:26:02.848241+03
15	4	18	22	Ezra Nayoga	Ezrah Nayoga	Member	active	2	Memo spelling differs from the savings schedule.	\N	2026-08-01 12:26:02.848241+03
\.


--
-- Data for Name: governance_bodies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.governance_bodies (id, code, name, body_type, active, notes, created_at) FROM stdin;
1	board	Board of Directors	board	t	Tabula Robert is to be enrolled on URSB.	2026-08-01 12:26:02.848241+03
2	exco	Executive Committee	executive	t	\N	2026-08-01 12:26:02.848241+03
3	credit-committee	Credit Committee	committee	t	\N	2026-08-01 12:26:02.848241+03
4	investment-committee	Investment Committee	committee	t	\N	2026-08-01 12:26:02.848241+03
5	legal-committee	Legal Committee	committee	t	\N	2026-08-01 12:26:02.848241+03
6	finance-committee	Finance Committee	committee	t	\N	2026-08-01 12:26:02.848241+03
7	welfare-committee	Welfare Committee	committee	t	\N	2026-08-01 12:26:02.848241+03
8	supervisory-committee	Supervisory Committee	committee	t	Elected during the AGM.	2026-08-01 12:26:02.848241+03
9	audit-committee	Audit Committee	committee	t	Elected during the AGM.	2026-08-01 12:26:02.848241+03
\.


--
-- Data for Name: governance_directives; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.governance_directives (id, reference, title, details, applies_to, due_date, recurrence, status, source_document_id, created_at) FROM stdin;
1	GOV-DIR-2026-001	Committee annual budgets	All committee heads must draft annual budgets and submit them to the Treasurer.	All committee heads	2026-08-04	\N	open	2	2026-08-01 12:26:02.848241+03
2	GOV-DIR-2026-002	Quarterly committee reports	Submit activities, challenges, achievements and recommendations to the Executive.	All committee heads	\N	quarterly	open	2	2026-08-01 12:26:02.848241+03
3	GOV-DIR-2026-003	Committee meeting records	Document every committee meeting and file minutes with the secretariat.	All committees	\N	every meeting	open	2	2026-08-01 12:26:02.848241+03
\.


--
-- Data for Name: governance_records; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.governance_records (id, department_id, reference, record_type, title, description, severity, status, visibility_level, created_by, assigned_to, resolved_by, created_at, resolved_at) FROM stdin;
\.


--
-- Data for Name: historical_investment_ledger; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.historical_investment_ledger (id, period_id, transaction_id, transaction_date, account_name, account_code, entry_type, amount, source_reference, created_at) FROM stdin;
1	2	63ed840a02191	2025-08-08	Unit Trust Fund Investment	4500	debit	100000000.00	Photographed Unit Trust ledger	2026-08-01 11:57:24.76621+03
2	2	655208398f631	2025-08-31	Unit Trust Fund Investment	4500	debit	701751.25	Photographed Unit Trust ledger	2026-08-01 11:57:24.76621+03
3	2	6552096f9a7b1	2025-09-30	Unit Trust Fund Investment	4500	debit	1010541.65	Photographed Unit Trust ledger	2026-08-01 11:57:24.76621+03
4	2	655209caf4f49	2025-10-31	Unit Trust Fund Investment	4500	debit	1046580.62	Photographed Unit Trust ledger	2026-08-01 11:57:24.76621+03
5	2	65520aa90c2e1	2025-11-30	Unit Trust Fund Investment	4500	debit	1020539.64	Photographed Unit Trust ledger	2026-08-01 11:57:24.76621+03
6	2	65520aa947431	2025-11-30	Unit Trust Fund Investment	4500	debit	1020539.64	Photographed Unit Trust ledger	2026-08-01 11:57:24.76621+03
7	2	65520c4434c59	2025-11-30	Unit Trust Fund Investment	4500	credit	1020539.64	Photographed Unit Trust ledger	2026-08-01 11:57:24.76621+03
8	2	65520b1ca4771	2025-12-31	Unit Trust Fund Investment	4500	debit	1058940.55	Photographed Unit Trust ledger	2026-08-01 11:57:24.76621+03
9	2	65520dee3b071	2026-01-31	Unit Trust Fund Investment	4500	debit	1097305.82	Photographed Unit Trust ledger	2026-08-01 11:57:24.76621+03
10	2	65520e58b5541	2026-02-28	Unit Trust Fund Investment	4500	debit	994550.33	Photographed Unit Trust ledger	2026-08-01 11:57:24.76621+03
11	2	6530bab1cd941	2026-03-27	Unit Trust Fund Investment	4500	debit	30000000.00	Photographed Unit Trust ledger	2026-08-01 11:57:24.76621+03
12	2	65520f2169749	2026-03-31	Unit Trust Fund Investment	4500	debit	1140152.53	Photographed Unit Trust ledger	2026-08-01 11:57:24.76621+03
13	2	65521008a4c49	2026-04-30	Unit Trust Fund Investment	4500	debit	1364008.45	Photographed Unit Trust ledger	2026-08-01 11:57:24.76621+03
14	2	655210586aa49	2026-05-31	Unit Trust Fund Investment	4500	debit	1421387.30	Photographed Unit Trust ledger	2026-08-01 11:57:24.76621+03
15	2	65556f4039e31	2026-06-08	Unit Trust Fund Investment	4500	debit	20000000.00	Photographed Unit Trust ledger	2026-08-01 11:57:24.76621+03
16	2	655cd0914d2a1	2026-06-30	Unit Trust Fund Investment	4500	debit	1536637.16	Photographed Unit Trust ledger	2026-08-01 11:57:24.76621+03
\.


--
-- Data for Name: investment_assets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.investment_assets (id, asset_code, project_id, asset_name, asset_type, acquisition_value, current_value, location, status, created_by, created_at, photo_url, supporting_document) FROM stdin;
\.


--
-- Data for Name: investment_contracts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.investment_contracts (id, reference, project_id, contract_type, counterparty, title, contract_value, starts_on, ends_on, status, document_reference, created_by, created_at, legal_contract_id) FROM stdin;
\.


--
-- Data for Name: investment_fund_accounts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.investment_fund_accounts (id, reference, institution_name, fund_name, bank_name, bank_account_number, bank_branch, amount_invested, current_value, returns_earned, invested_on, report_as_at, status, source_reference, created_by, created_at, updated_at) FROM stdin;
1	FUND-OLD-MUTUAL-2025	Old Mutual	Unit Trust Fund	\N	\N	\N	150000000.00	163204057.50	13204057.50	2025-08-11	2026-06-30	active	DOC-INVESTMENT-REPORT-2026	11	2026-08-03 09:25:31.585374+03	2026-08-03 09:25:31.585374+03
2	FUND-UAP-UMBRELLA	UAP	Umbrella Trust Fund	Standard Chartered Bank	0105214721807	Speke Road	0.00	0.00	0.00	\N	\N	registered	FUND-SELECTION-FORM	11	2026-08-03 09:25:31.593266+03	2026-08-03 09:25:31.593266+03
\.


--
-- Data for Name: investment_investors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.investment_investors (id, project_id, member_id, investor_name, funding_source, amount_invested, ownership_percentage, expected_returns, payments_received, investment_date, status, created_by) FROM stdin;
\.


--
-- Data for Name: investment_project_oversight; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.investment_project_oversight (id, project_id, action_type, target_department_id, previous_status, new_status, comment, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: investment_projects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.investment_projects (id, reference, name, description, target_amount, raised_amount, status, starts_on, ends_on, created_by, approved_by, created_at, current_value, expected_return, performance_status, category, location, manager_name, responsible_department, funding_source, progress, photo_url, supporting_document, open_to_members, minimum_member_investment, member_expected_return_rate, member_investment_deadline, proposal_id, executive_status, suspended_at, closed_at) FROM stdin;
3	INV-FUND-OM-2025	Old Mutual Unit Trust Fund	Verified organizational unit-trust investment reported to the 2026 AGM.	150000000.00	150000000.00	active	2025-08-11	\N	18	\N	2026-08-03 09:25:31.596829+03	163204057.50	13204057.50	profitable	Unit Trust	Uganda	Mutiga David Brian and Tabula Robert	Investment	Organization capital	100	\N	\N	f	0.00	0.00	\N	\N	approved	\N	\N
\.


--
-- Data for Name: investment_proposals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.investment_proposals (id, reference, title, description, category, estimated_cost, expected_revenue, expected_roi, risk_assessment, recommendation, supporting_document, status, executive_activity_id, created_by, reviewed_by, approved_by, created_at, reviewed_at, approved_at, finance_reviewed_by, finance_reviewed_at, finance_analysis, finance_recommendation) FROM stdin;
\.


--
-- Data for Name: investment_transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.investment_transactions (id, reference, project_id, transaction_type, category, description, amount, transaction_date, supporting_document, recorded_by, created_at, finance_entry_id, deleted_at, deleted_by) FROM stdin;
\.


--
-- Data for Name: leadership_assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.leadership_assignments (id, user_id, body, position_title, leadership_level, starts_on, ends_on, active) FROM stdin;
1	2	Board	Board Chairperson	5	2026-07-27	\N	t
2	6	Executive Committee	Chief Executive Officer	4	2026-07-27	\N	t
142	32	Board of Directors	Director	4	2026-06-30	\N	t
143	32	Legal Committee	Member	2	2026-06-30	\N	t
144	33	Credit Committee	Member	2	2026-06-30	\N	t
145	34	Welfare Committee	Chairperson	3	2026-06-30	\N	t
146	35	Board of Directors	Director	4	2026-06-30	\N	t
147	35	Executive Committee	Chairperson	4	2026-06-30	\N	t
148	35	Finance Committee	Chairperson	3	2026-06-30	\N	t
149	36	Welfare Committee	Member	2	2026-06-30	\N	t
150	37	Executive Committee	Member	4	2026-06-30	\N	t
151	37	Investment Committee	Member	2	2026-06-30	\N	t
152	38	Board of Directors	Director	4	2026-06-30	\N	t
153	38	Legal Committee	Chairperson	3	2026-06-30	\N	t
154	39	Credit Committee	Chairperson	3	2026-06-30	\N	t
155	40	Board of Directors	Director	4	2026-06-30	\N	t
156	40	Executive Committee	Secretary	4	2026-06-30	\N	t
157	40	Legal Committee	Member	2	2026-06-30	\N	t
158	41	Investment Committee	Chairperson	3	2026-06-30	\N	t
159	42	Executive Committee	Treasurer	4	2026-06-30	\N	t
160	42	Finance Committee	Member	2	2026-06-30	\N	t
161	43	Supervisory Committee	Member	2	2026-06-30	\N	t
162	43	Audit Committee	Member	2	2026-06-30	\N	t
163	44	Credit Committee	Member	2	2026-06-30	\N	t
164	44	Finance Committee	Member	2	2026-06-30	\N	t
165	45	Supervisory Committee	Chairperson	3	2026-06-30	\N	t
166	46	Welfare Committee	Member	2	2026-06-30	\N	t
167	46	Audit Committee	Chairperson	3	2026-06-30	\N	t
168	47	Executive Committee	Vice Chairperson	4	2026-06-30	\N	t
169	47	Investment Committee	Member	2	2026-06-30	\N	t
\.


--
-- Data for Name: legacy_member_opening_balances; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.legacy_member_opening_balances (id, period_id, source_row, member_name, share_capital, savings_balance, expected_savings, deficit_surplus, proposed_dividend, linked_member_id, status, created_at) FROM stdin;
2	2	2	Joshua Ssewanyana	2000000.00	1302451.00	8300000.00	-6997549.00	\N	\N	exited	2026-08-01 11:57:24.76621+03
1	2	1	Charles Oketcho	2000000.00	434993.00	8300000.00	-7865007.00	\N	6	recognized_provisional	2026-08-01 11:57:24.76621+03
3	2	3	Francis Banumba	2000000.00	3224954.00	8300000.00	-5075046.00	\N	7	recognized_provisional	2026-08-01 11:57:24.76621+03
4	2	4	Josephine Babirye Kyobe	2000000.00	3619971.00	8300000.00	-4680029.00	\N	8	recognized_provisional	2026-08-01 11:57:24.76621+03
5	2	5	Denis Tugume	2000000.00	3749954.00	8300000.00	-4550046.00	\N	9	recognized_provisional	2026-08-01 11:57:24.76621+03
6	2	6	Tabula Robert	2000000.00	4844936.00	8300000.00	-3455064.00	\N	10	recognized_provisional	2026-08-01 11:57:24.76621+03
7	2	7	Ntono Moreen	2000000.00	4850436.00	8300000.00	-3449564.00	\N	11	recognized_provisional	2026-08-01 11:57:24.76621+03
8	2	8	Ritah Nakyanzi	2000000.00	7503927.00	8300000.00	-796073.00	\N	12	recognized_provisional	2026-08-01 11:57:24.76621+03
9	2	9	Mary Babirye	2000000.00	7861512.00	8300000.00	-438488.00	\N	13	recognized_provisional	2026-08-01 11:57:24.76621+03
10	2	10	Nakayiza Baraza Olivia	2000000.00	7900000.00	8300000.00	-400000.00	\N	14	recognized_provisional	2026-08-01 11:57:24.76621+03
11	2	11	Jude Tadieus Kyobe	2000000.00	7945071.00	8300000.00	-354929.00	\N	15	recognized_provisional	2026-08-01 11:57:24.76621+03
12	2	12	Brian Mutiga	2000000.00	7975000.00	8300000.00	-325000.00	\N	16	recognized_provisional	2026-08-01 11:57:24.76621+03
13	2	13	Justine Kaudha Inhensiko	2000000.00	8000456.00	8300000.00	-299544.00	\N	17	recognized_provisional	2026-08-01 11:57:24.76621+03
14	2	14	Paul Kalemba	2000000.00	8150000.00	8300000.00	-150000.00	\N	18	recognized_provisional	2026-08-01 11:57:24.76621+03
15	2	15	Dan Rwebingira Ssalongo	2000000.00	8162431.00	8300000.00	-137569.00	\N	19	recognized_provisional	2026-08-01 11:57:24.76621+03
16	2	16	Christopher Muhoozi	2000000.00	8712431.00	8300000.00	412431.00	\N	20	recognized_provisional	2026-08-01 11:57:24.76621+03
17	2	17	Ralph Masaba	2000000.00	8976949.00	8300000.00	676949.00	\N	21	recognized_provisional	2026-08-01 11:57:24.76621+03
18	2	18	Ezrah Nayoga	2000000.00	10612431.00	8300000.00	2312431.00	\N	22	recognized_provisional	2026-08-01 11:57:24.76621+03
\.


--
-- Data for Name: legal_cases; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.legal_cases (id, case_number, case_category, subject_name, member_id, department_id, description, evidence, assigned_officer, status, risk_level, next_hearing_at, decision, attachments, timeline_note, opened_at, closed_at, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: legal_complaints; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.legal_complaints (id, complaint_number, complainant, member_id, complaint_type, department_id, description, evidence, assigned_officer, status, recommendation, decision, confidential, created_by, created_at, updated_at, closed_at) FROM stdin;
\.


--
-- Data for Name: legal_compliance; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.legal_compliance (id, reference, department_id, requirement, policy_reference, compliance_score, risk_level, status, due_date, finding, corrective_action, responsible_officer, reviewed_at, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: legal_contracts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.legal_contracts (id, contract_number, title, contract_type, parties, department_id, contract_value, starts_on, ends_on, renewal_date, status, responsible_officer, supporting_document, review_notes, created_by, approved_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: legal_court_matters; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.legal_court_matters (id, court_file, title, court_name, opposing_party, legal_representative, case_id, next_hearing_at, court_order, judgement, appeal_status, legal_expenses, status, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: legal_opinions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.legal_opinions (id, reference, title, requested_by_department, question, opinion, assigned_officer, due_date, status, document_reference, created_by, created_at, completed_at) FROM stdin;
\.


--
-- Data for Name: legal_policies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.legal_policies (id, reference, policy_name, policy_category, version, effective_date, review_date, status, approval_history, document_reference, created_by, approved_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: loan_charges; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.loan_charges (id, loan_id, charge_type, amount, status, reason, assessed_by, waived_by, assessed_at, settled_at, waived_at, paid_amount, schedule_id, penalty_period) FROM stdin;
1	1	Processing fee	100000.00	outstanding	Approved 2% loan processing fee	44	\N	2026-08-03 18:11:33.390339+03	\N	\N	0.00	\N	\N
\.


--
-- Data for Name: loan_disbursements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.loan_disbursements (id, loan_id, amount, method, destination, status, prepared_by, authorized_by, disbursed_by, transaction_reference, prepared_at, authorized_at, disbursed_at) FROM stdin;
1	1	5000000.00	Mobile Money	PROVISIONAL-PHONE-G40-2026-0014	disbursed	39	35	44	DSB-35C017CDCB1B4249	2026-08-03 18:11:09.924716+03	2026-08-03 18:11:09.924716+03	2026-08-03 18:11:33.390339+03
\.


--
-- Data for Name: loan_guarantors; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.loan_guarantors (id, loan_id, member_id, status, response_note, responded_at, created_at, guaranteed_amount, declaration_accepted) FROM stdin;
1	1	16	accepted		2026-08-03 16:07:46.591576+03	2026-08-03 16:02:39.732846+03	1666666.67	f
2	1	20	accepted	i accept	2026-08-03 16:12:42.45127+03	2026-08-03 16:02:39.732846+03	1666666.67	f
3	1	19	accepted		2026-08-03 16:14:33.961735+03	2026-08-03 16:02:39.732846+03	1666666.67	f
\.


--
-- Data for Name: loan_products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.loan_products (id, name, annual_rate, max_term, max_multiplier, active, max_amount, processing_fee_rate, late_penalty_rate, minimum_guarantors, maximum_guarantors, interest_method, policy_reference) FROM stdin;
1	Development Loan	24.000	10	3.00	t	25000000.00	2.000	5.000	3	3	equal_principal_reducing_balance	AGM-2025-LOAN-RESOLUTION
2	School Fees Loan	24.000	10	2.50	t	25000000.00	2.000	5.000	3	3	equal_principal_reducing_balance	AGM-2025-LOAN-RESOLUTION
3	Emergency Loan	24.000	6	1.00	t	25000000.00	2.000	5.000	3	3	equal_principal_reducing_balance	AGM-2025-LOAN-RESOLUTION
4	Other Loan	24.000	10	3.00	t	25000000.00	2.000	5.000	3	3	equal_principal_reducing_balance	AGM-2025-LOAN-RESOLUTION
\.


--
-- Data for Name: loan_recovery_actions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.loan_recovery_actions (id, loan_id, action_type, notes, recovery_status, follow_up_date, assigned_to, created_by, created_at, completed_at) FROM stdin;
\.


--
-- Data for Name: loan_repayment_schedule; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.loan_repayment_schedule (id, loan_id, installment_number, due_date, opening_balance, principal, interest, total_due, paid_amount, status, paid_at, principal_paid, interest_paid) FROM stdin;
1	1	1	2026-09-03	5000000.00	1000000.00	100000.00	1100000.00	0.00	due	\N	0.00	0.00
2	1	2	2026-10-03	4000000.00	1000000.00	80000.00	1080000.00	0.00	upcoming	\N	0.00	0.00
3	1	3	2026-11-03	3000000.00	1000000.00	60000.00	1060000.00	0.00	upcoming	\N	0.00	0.00
4	1	4	2026-12-03	2000000.00	1000000.00	40000.00	1040000.00	0.00	upcoming	\N	0.00	0.00
5	1	5	2027-01-03	1000000.00	1000000.00	20000.00	1020000.00	0.00	upcoming	\N	0.00	0.00
\.


--
-- Data for Name: loan_workflow_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.loan_workflow_events (id, loan_id, stage, action, actor_id, comment, created_at) FROM stdin;
1	1	application	submitted	43	Savings checked: UGX 8,150,000; three guarantors requested	2026-08-03 16:02:39.732846+03
2	1	guarantor-consent	accepted	41		2026-08-03 16:07:46.591576+03
3	1	guarantor-consent	accepted	45	i accept	2026-08-03 16:12:42.45127+03
4	1	guarantor-consent	accepted	44		2026-08-03 16:14:33.961735+03
5	1	officer-review	recommend	44	good to go 	2026-08-03 16:57:00.138587+03
6	1	committee-review	approve	39	ok	2026-08-03 17:03:18.258518+03
7	1	executive-authorization	authorize	35	Authorized within executive authority.	2026-08-03 18:11:09.924716+03
8	1	disbursement	disbursed	44	Mobile Money - DSB-35C017CDCB1B4249	2026-08-03 18:11:33.390339+03
\.


--
-- Data for Name: loans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.loans (id, reference, member_id, product_id, amount, balance, term_months, purpose, guarantor_member_id, status, officer_comment, committee_comment, executive_comment, recommended_by, committee_approved_by, authorized_by, created_at, due_date, savings_at_application, existing_loan_balance, eligibility_result, verified_amount, finance_verified_by, finance_comment, finance_verified_at, authorized_at, disbursed_at, security_type, collateral_description, collateral_value, collateral_owner, collateral_owner_consent, borrower_declaration_accepted, supporting_document_stored_name, supporting_document_original_name, supporting_document_mime_type, processing_fee, policy_reference, collateral_owner_phone) FROM stdin;
1	LN-1226CA16CAAA465C	18	1	5000000.00	5000000.00	5	I promise to pay in time	\N	active	good to go 	ok	Authorized within executive authority.	44	39	35	2026-08-03 16:02:39.732846+03	2027-01-03	8150000.00	0.00	Eligible up to UGX 24,450,000	5000000.00	\N	\N	\N	2026-08-03 18:11:09.924716+03	2026-08-03 18:11:33.390339+03	savings_and_shares	\N	\N	\N	f	t	\N	\N	\N	100000.00	AGM-2025-LOAN-RESOLUTION	\N
\.


--
-- Data for Name: member_bio_data; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.member_bio_data (member_id, date_of_birth, gender, marital_status, nationality, home_district, subcounty, parish, village, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, blood_group, disability_notes, profile_photo_reference, identity_document_reference, record_notes, bio_status, created_by, verified_by, verified_at, created_at, updated_at, passport_photo_stored_name, passport_photo_original_name, passport_photo_mime_type) FROM stdin;
1	2001-07-14	\N	married	Ugandan	Kampala	Kawempe	Makerere III	Mulago	Beatrice Nakibuule	0750000577	Spouse	\N	\N	\N	NIN-COPY-TJS-000291	\N	complete	20	\N	\N	2026-07-30 14:19:50.316754+03	2026-07-30 14:19:50.316754+03	1785410390299-b5a590f12084413ce24f898a.jpg	Asiimwe Jotham.JPG	image/jpeg
6	\N	\N	\N	Ugandan	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Provisional record created from the FY2026 member savings schedule; biodata awaits Legal verification.	pending	20	\N	\N	2026-08-01 12:52:09.084286+03	2026-08-01 12:52:09.084286+03	\N	\N	\N
7	\N	\N	\N	Ugandan	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Provisional record created from the FY2026 member savings schedule; biodata awaits Legal verification.	pending	20	\N	\N	2026-08-01 12:52:09.084286+03	2026-08-01 12:52:09.084286+03	\N	\N	\N
8	\N	\N	\N	Ugandan	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Provisional record created from the FY2026 member savings schedule; biodata awaits Legal verification.	pending	20	\N	\N	2026-08-01 12:52:09.084286+03	2026-08-01 12:52:09.084286+03	\N	\N	\N
9	\N	\N	\N	Ugandan	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Provisional record created from the FY2026 member savings schedule; biodata awaits Legal verification.	pending	20	\N	\N	2026-08-01 12:52:09.084286+03	2026-08-01 12:52:09.084286+03	\N	\N	\N
10	\N	\N	\N	Ugandan	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Provisional record created from the FY2026 member savings schedule; biodata awaits Legal verification.	pending	20	\N	\N	2026-08-01 12:52:09.084286+03	2026-08-01 12:52:09.084286+03	\N	\N	\N
11	\N	\N	\N	Ugandan	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Provisional record created from the FY2026 member savings schedule; biodata awaits Legal verification.	pending	20	\N	\N	2026-08-01 12:52:09.084286+03	2026-08-01 12:52:09.084286+03	\N	\N	\N
12	\N	\N	\N	Ugandan	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Provisional record created from the FY2026 member savings schedule; biodata awaits Legal verification.	pending	20	\N	\N	2026-08-01 12:52:09.084286+03	2026-08-01 12:52:09.084286+03	\N	\N	\N
13	\N	\N	\N	Ugandan	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Provisional record created from the FY2026 member savings schedule; biodata awaits Legal verification.	pending	20	\N	\N	2026-08-01 12:52:09.084286+03	2026-08-01 12:52:09.084286+03	\N	\N	\N
14	\N	\N	\N	Ugandan	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Provisional record created from the FY2026 member savings schedule; biodata awaits Legal verification.	pending	20	\N	\N	2026-08-01 12:52:09.084286+03	2026-08-01 12:52:09.084286+03	\N	\N	\N
15	\N	\N	\N	Ugandan	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Provisional record created from the FY2026 member savings schedule; biodata awaits Legal verification.	pending	20	\N	\N	2026-08-01 12:52:09.084286+03	2026-08-01 12:52:09.084286+03	\N	\N	\N
16	\N	\N	\N	Ugandan	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Provisional record created from the FY2026 member savings schedule; biodata awaits Legal verification.	pending	20	\N	\N	2026-08-01 12:52:09.084286+03	2026-08-01 12:52:09.084286+03	\N	\N	\N
17	\N	\N	\N	Ugandan	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Provisional record created from the FY2026 member savings schedule; biodata awaits Legal verification.	pending	20	\N	\N	2026-08-01 12:52:09.084286+03	2026-08-01 12:52:09.084286+03	\N	\N	\N
18	\N	\N	\N	Ugandan	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Provisional record created from the FY2026 member savings schedule; biodata awaits Legal verification.	pending	20	\N	\N	2026-08-01 12:52:09.084286+03	2026-08-01 12:52:09.084286+03	\N	\N	\N
19	\N	\N	\N	Ugandan	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Provisional record created from the FY2026 member savings schedule; biodata awaits Legal verification.	pending	20	\N	\N	2026-08-01 12:52:09.084286+03	2026-08-01 12:52:09.084286+03	\N	\N	\N
20	\N	\N	\N	Ugandan	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Provisional record created from the FY2026 member savings schedule; biodata awaits Legal verification.	pending	20	\N	\N	2026-08-01 12:52:09.084286+03	2026-08-01 12:52:09.084286+03	\N	\N	\N
21	\N	\N	\N	Ugandan	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Provisional record created from the FY2026 member savings schedule; biodata awaits Legal verification.	pending	20	\N	\N	2026-08-01 12:52:09.084286+03	2026-08-01 12:52:09.084286+03	\N	\N	\N
22	\N	\N	\N	Ugandan	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Provisional record created from the FY2026 member savings schedule; biodata awaits Legal verification.	pending	20	\N	\N	2026-08-01 12:52:09.084286+03	2026-08-01 12:52:09.084286+03	\N	\N	\N
\.


--
-- Data for Name: member_department_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.member_department_profiles (id, member_id, department_id, position_title, is_primary, status, joined_at) FROM stdin;
\.


--
-- Data for Name: member_family_records; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.member_family_records (id, member_id, full_name, relationship, phone, eligible_for_welfare, active, recorded_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: member_financial_year_policies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.member_financial_year_policies (id, fiscal_year_label, starts_on, ends_on, monthly_savings_target, annual_share_target, annual_subscription_fee, status, created_at) FROM stdin;
1	2026/27	2026-07-01	2027-06-30	425000.00	2000000.00	200000.00	active	2026-08-01 16:09:55.017701+03
\.


--
-- Data for Name: member_investment_applications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.member_investment_applications (id, reference, project_id, member_id, amount, payment_method, payment_reference, notes, status, evidence_stored_name, evidence_original_name, evidence_mime_type, submitted_by, reviewed_by, review_comment, reviewed_at, finance_entry_id, investor_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: member_support_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.member_support_requests (id, reference, member_id, category, subject, description, status, response, assigned_department_id, created_at, updated_at, closed_at) FROM stdin;
\.


--
-- Data for Name: members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.members (id, member_number, full_name, email, phone, national_id, occupation, employer, address, next_of_kin, beneficiaries, branch_id, savings_balance, share_capital, dividends, fines, status, joined_at, created_by, provisional, legacy_opening_balance_id, deleted_at, deleted_by, exit_reason, exit_savings_balance, exit_share_capital) FROM stdin;
20	G40-2026-0016	Christopher Muhoozi	\N	PROVISIONAL-PHONE-G40-2026-0016	PROVISIONAL-NID-G40-2026-0016	\N	\N	\N	\N	\N	1	8712431.00	2000000.00	0.00	0.00	active	2024-01-01 00:00:00+03	20	t	16	\N	\N	\N	\N	\N
21	G40-2026-0017	Ralph Masaba	\N	PROVISIONAL-PHONE-G40-2026-0017	PROVISIONAL-NID-G40-2026-0017	\N	\N	\N	\N	\N	1	8976949.00	2000000.00	0.00	0.00	active	2024-01-01 00:00:00+03	20	t	17	\N	\N	\N	\N	\N
22	G40-2026-0018	Ezrah Nayoga	\N	PROVISIONAL-PHONE-G40-2026-0018	PROVISIONAL-NID-G40-2026-0018	\N	\N	\N	\N	\N	1	10612431.00	2000000.00	0.00	0.00	active	2024-01-01 00:00:00+03	20	t	18	\N	\N	\N	\N	\N
1	G40-2026-2950C377	Lazor Prince	lazorprince382@gmail.com	0750000377	CM840001AA	Retail trader	COMPUTERS	Gayaza Rd	Fatuma N. Â· +256 700 111 222	\N	1	200000.00	0.00	0.00	0.00	deleted	2026-07-30 14:19:50.316754+03	20	f	\N	2026-08-03 12:09:02.624631+03	20	nolonger needed	200000.00	0.00
6	G40-2026-0001	Charles Oketcho	\N	PROVISIONAL-PHONE-G40-2026-0001	PROVISIONAL-NID-G40-2026-0001	\N	\N	\N	\N	\N	1	434993.00	2000000.00	0.00	0.00	active	2024-01-01 00:00:00+03	20	t	1	\N	\N	\N	\N	\N
7	G40-2026-0003	Francis Banumba	\N	PROVISIONAL-PHONE-G40-2026-0003	PROVISIONAL-NID-G40-2026-0003	\N	\N	\N	\N	\N	1	3224954.00	2000000.00	0.00	0.00	active	2024-01-01 00:00:00+03	20	t	3	\N	\N	\N	\N	\N
8	G40-2026-0004	Josephine Babirye Kyobe	\N	PROVISIONAL-PHONE-G40-2026-0004	PROVISIONAL-NID-G40-2026-0004	\N	\N	\N	\N	\N	1	3619971.00	2000000.00	0.00	0.00	active	2024-01-01 00:00:00+03	20	t	4	\N	\N	\N	\N	\N
9	G40-2026-0005	Denis Tugume	\N	PROVISIONAL-PHONE-G40-2026-0005	PROVISIONAL-NID-G40-2026-0005	\N	\N	\N	\N	\N	1	3749954.00	2000000.00	0.00	0.00	active	2024-01-01 00:00:00+03	20	t	5	\N	\N	\N	\N	\N
10	G40-2026-0006	Tabula Robert	\N	PROVISIONAL-PHONE-G40-2026-0006	PROVISIONAL-NID-G40-2026-0006	\N	\N	\N	\N	\N	1	4844936.00	2000000.00	0.00	0.00	active	2024-01-01 00:00:00+03	20	t	6	\N	\N	\N	\N	\N
11	G40-2026-0007	Ntono Moreen	\N	PROVISIONAL-PHONE-G40-2026-0007	PROVISIONAL-NID-G40-2026-0007	\N	\N	\N	\N	\N	1	4850436.00	2000000.00	0.00	0.00	active	2024-01-01 00:00:00+03	20	t	7	\N	\N	\N	\N	\N
12	G40-2026-0008	Ritah Nakyanzi	\N	PROVISIONAL-PHONE-G40-2026-0008	PROVISIONAL-NID-G40-2026-0008	\N	\N	\N	\N	\N	1	7503927.00	2000000.00	0.00	0.00	active	2024-01-01 00:00:00+03	20	t	8	\N	\N	\N	\N	\N
13	G40-2026-0009	Mary Babirye	\N	PROVISIONAL-PHONE-G40-2026-0009	PROVISIONAL-NID-G40-2026-0009	\N	\N	\N	\N	\N	1	7861512.00	2000000.00	0.00	0.00	active	2024-01-01 00:00:00+03	20	t	9	\N	\N	\N	\N	\N
14	G40-2026-0010	Nakayiza Baraza Olivia	\N	PROVISIONAL-PHONE-G40-2026-0010	PROVISIONAL-NID-G40-2026-0010	\N	\N	\N	\N	\N	1	7900000.00	2000000.00	0.00	0.00	active	2024-01-01 00:00:00+03	20	t	10	\N	\N	\N	\N	\N
15	G40-2026-0011	Jude Tadieus Kyobe	\N	PROVISIONAL-PHONE-G40-2026-0011	PROVISIONAL-NID-G40-2026-0011	\N	\N	\N	\N	\N	1	7945071.00	2000000.00	0.00	0.00	active	2024-01-01 00:00:00+03	20	t	11	\N	\N	\N	\N	\N
16	G40-2026-0012	Brian Mutiga	\N	PROVISIONAL-PHONE-G40-2026-0012	PROVISIONAL-NID-G40-2026-0012	\N	\N	\N	\N	\N	1	7975000.00	2000000.00	0.00	0.00	active	2024-01-01 00:00:00+03	20	t	12	\N	\N	\N	\N	\N
17	G40-2026-0013	Justine Kaudha Inhensiko	\N	PROVISIONAL-PHONE-G40-2026-0013	PROVISIONAL-NID-G40-2026-0013	\N	\N	\N	\N	\N	1	8000456.00	2000000.00	0.00	0.00	active	2024-01-01 00:00:00+03	20	t	13	\N	\N	\N	\N	\N
18	G40-2026-0014	Paul Kalemba	\N	PROVISIONAL-PHONE-G40-2026-0014	PROVISIONAL-NID-G40-2026-0014	\N	\N	\N	\N	\N	1	8150000.00	2000000.00	0.00	0.00	active	2024-01-01 00:00:00+03	20	t	14	\N	\N	\N	\N	\N
19	G40-2026-0015	Dan Rwebingira Ssalongo	\N	PROVISIONAL-PHONE-G40-2026-0015	PROVISIONAL-NID-G40-2026-0015	\N	\N	\N	\N	\N	1	8162431.00	2000000.00	0.00	0.00	active	2024-01-01 00:00:00+03	20	t	15	\N	\N	\N	\N	\N
\.


--
-- Data for Name: membership_status_records; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.membership_status_records (id, legacy_balance_id, linked_member_id, member_name, status, condition_note, effective_date, source_document_id, created_at) FROM stdin;
1	\N	\N	Ezra Mujjabwami	proposed_exit	Also to be removed from the list of Directors.	\N	2	2026-08-01 12:26:02.848241+03
2	\N	\N	Brenda Mujjabwami	proposed_exit	\N	\N	2	2026-08-01 12:26:02.848241+03
3	\N	\N	Patrick Nzabara	proposed_exit	\N	\N	2	2026-08-01 12:26:02.848241+03
4	\N	\N	Barasa Gerald	conditional_exit	Exit if he fails to adhere to organization guidelines.	\N	2	2026-08-01 12:26:02.848241+03
6	2	\N	Joshua Ssewanyana	exited	Confirmed by the user as out of the organization.	\N	2	2026-08-01 12:26:02.848241+03
5	1	6	Charles Oketcho	conditional_exit	Exit if he fails to adhere to organization guidelines.	\N	2	2026-08-01 12:26:02.848241+03
\.


--
-- Data for Name: message_attachments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.message_attachments (id, message_id, original_name, stored_name, mime_type, file_size, uploaded_by, download_count, created_at, quarantined_at, quarantine_reason) FROM stdin;
\.


--
-- Data for Name: message_mentions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.message_mentions (message_id, mentioned_user_id, created_at) FROM stdin;
\.


--
-- Data for Name: message_reactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.message_reactions (message_id, user_id, emoji, created_at) FROM stdin;
\.


--
-- Data for Name: message_reads; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.message_reads (message_id, user_id, read_at) FROM stdin;
1	22	2026-07-31 14:48:50.70349+03
2	22	2026-07-31 14:48:50.70349+03
3	22	2026-07-31 14:48:50.70349+03
4	22	2026-07-31 14:48:50.70349+03
5	22	2026-07-31 14:48:50.70349+03
\.


--
-- Data for Name: message_stars; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.message_stars (message_id, user_id, created_at) FROM stdin;
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.messages (id, conversation_id, sender_id, body, reply_to_id, created_at, read_at, edited_at, deleted_at, pinned_at, pinned_by, forwarded_from_id, delivered_at) FROM stdin;
1	1	26	hello sir	\N	2026-07-31 14:48:04.140833+03	2026-07-31 14:48:50.707181+03	\N	\N	\N	\N	\N	2026-07-31 14:48:04.140833+03
2	1	26	tick	\N	2026-07-31 14:48:18.492743+03	2026-07-31 14:48:50.707181+03	\N	\N	\N	\N	\N	2026-07-31 14:48:18.492743+03
3	1	26	g	\N	2026-07-31 14:48:29.386345+03	2026-07-31 14:48:50.707181+03	\N	\N	\N	\N	\N	2026-07-31 14:48:29.386345+03
4	1	26	g	\N	2026-07-31 14:48:31.712951+03	2026-07-31 14:48:50.707181+03	\N	\N	\N	\N	\N	2026-07-31 14:48:31.712951+03
5	1	26	g	\N	2026-07-31 14:48:34.418512+03	2026-07-31 14:48:50.707181+03	\N	\N	\N	\N	\N	2026-07-31 14:48:34.418512+03
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, user_id, member_id, title, message, read_at, created_at) FROM stdin;
1	\N	1	Savings deposit submitted	MDP-MS8XNE2K-F7QM is awaiting Credits verification.	\N	2026-07-31 15:42:43.588612+03
2	10	\N	Member deposit awaiting verification	MDP-MS8XNE2K-F7QM has payment evidence ready for review.	\N	2026-07-31 15:42:43.591269+03
3	19	\N	Member deposit awaiting verification	MDP-MS8XNE2K-F7QM has payment evidence ready for review.	\N	2026-07-31 15:42:43.591269+03
4	9	\N	Member deposit awaiting verification	MDP-MS8XNE2K-F7QM has payment evidence ready for review.	\N	2026-07-31 15:42:43.591269+03
5	12	\N	Member deposit awaiting verification	MDP-MS8XNE2K-F7QM has payment evidence ready for review.	\N	2026-07-31 15:42:43.591269+03
6	\N	1	Savings deposit verified	MDP-MS8XNE2K-F7QM was verified. Official receipt RCPT-C911CA81A1A14742 is available.	\N	2026-07-31 15:44:28.41565+03
7	31	6	Account ready	Your Member login and linked Member account are ready. Complete your biodata and change the temporary password after signing in.	\N	2026-08-01 12:52:09.084286+03
8	32	7	Account ready	Your Executive Officer login and linked Member account are ready. Complete your biodata and change the temporary password after signing in.	\N	2026-08-01 12:52:09.084286+03
9	33	8	Account ready	Your Credits Officer login and linked Member account are ready. Complete your biodata and change the temporary password after signing in.	\N	2026-08-01 12:52:09.084286+03
10	34	9	Account ready	Your Welfare Officer login and linked Member account are ready. Complete your biodata and change the temporary password after signing in.	\N	2026-08-01 12:52:09.084286+03
12	36	11	Account ready	Your Welfare Officer login and linked Member account are ready. Complete your biodata and change the temporary password after signing in.	\N	2026-08-01 12:52:09.084286+03
13	37	12	Account ready	Your Executive Officer login and linked Member account are ready. Complete your biodata and change the temporary password after signing in.	\N	2026-08-01 12:52:09.084286+03
14	38	13	Account ready	Your Executive Officer login and linked Member account are ready. Complete your biodata and change the temporary password after signing in.	\N	2026-08-01 12:52:09.084286+03
15	39	14	Account ready	Your Credits Officer login and linked Member account are ready. Complete your biodata and change the temporary password after signing in.	\N	2026-08-01 12:52:09.084286+03
16	40	15	Account ready	Your Executive Officer login and linked Member account are ready. Complete your biodata and change the temporary password after signing in.	\N	2026-08-01 12:52:09.084286+03
17	41	16	Account ready	Your Investment Officer login and linked Member account are ready. Complete your biodata and change the temporary password after signing in.	\N	2026-08-01 12:52:09.084286+03
18	42	17	Account ready	Your Executive Officer login and linked Member account are ready. Complete your biodata and change the temporary password after signing in.	\N	2026-08-01 12:52:09.084286+03
19	43	18	Account ready	Your Supervisory Officer login and linked Member account are ready. Complete your biodata and change the temporary password after signing in.	\N	2026-08-01 12:52:09.084286+03
20	44	19	Account ready	Your Credits Officer login and linked Member account are ready. Complete your biodata and change the temporary password after signing in.	\N	2026-08-01 12:52:09.084286+03
21	45	20	Account ready	Your Supervisory Officer login and linked Member account are ready. Complete your biodata and change the temporary password after signing in.	\N	2026-08-01 12:52:09.084286+03
22	46	21	Account ready	Your Auditor login and linked Member account are ready. Complete your biodata and change the temporary password after signing in.	\N	2026-08-01 12:52:09.084286+03
23	47	22	Account ready	Your Executive Officer login and linked Member account are ready. Complete your biodata and change the temporary password after signing in.	\N	2026-08-01 12:52:09.084286+03
11	35	10	Account ready	Your Executive Officer login and linked Member account are ready. Complete your biodata and change the temporary password after signing in.	2026-08-03 11:14:22.309026+03	2026-08-01 12:52:09.084286+03
24	41	\N	Loan guarantee request	Paul Kalemba asked you to guarantee loan LN-1226CA16CAAA465C for UGX 5,000,000.	\N	2026-08-03 16:02:39.732846+03
25	45	\N	Loan guarantee request	Paul Kalemba asked you to guarantee loan LN-1226CA16CAAA465C for UGX 5,000,000.	\N	2026-08-03 16:02:39.732846+03
26	44	\N	Loan guarantee request	Paul Kalemba asked you to guarantee loan LN-1226CA16CAAA465C for UGX 5,000,000.	\N	2026-08-03 16:02:39.732846+03
27	43	\N	Loan disbursed	Loan LN-1226CA16CAAA465C has been disbursed. Your repayment schedule is now available.	\N	2026-08-03 18:11:33.390339+03
\.


--
-- Data for Name: organization_document_versions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.organization_document_versions (id, document_id, version, original_name, stored_name, mime_type, file_size, sha256, uploaded_by, created_at) FROM stdin;
1	1	1.0	PROJECT PROPOSAL.pdf	1785503118425-b37125bf768b2b9e1ba10329.pdf	application/pdf	98764	4afcce647c0b7907bd53ac348536906e3eb4f06235df240095b2db6d5f80f09c	20	2026-07-31 16:05:18.432248+03
2	2	1.0	Kasangati G40 Kwagalana Executive Memo.(1).pdf	1785576362825-e9018941f6c43bd9aa263a5b.pdf	application/pdf	144520	86727a164395f6282fd58c57f95aef71d8db8424d71586a3215cbeaf4af7e38d	11	2026-08-01 12:26:02.848241+03
3	3	1.0	Welfare policy_G40 Kwagalana_5.7.2025.docx	1785738330803-f0be45316d6c95a28554a882.docx	application/vnd.openxmlformats-officedocument.wordprocessingml.document	113729	facb954772a8792dec0ca99a7178d15995fb51e64a879e2498b0de01b5dd9d3b	11	2026-08-03 09:25:30.247949+03
4	4	1.0	INVESTMENT REPORT FOR KASANGATI G40 KWAGALANA AGM (1).docx	1785738331121-b5f8ab751ded4cc216f84793.docx	application/vnd.openxmlformats-officedocument.wordprocessingml.document	15021	69896096b25b6c22a3f9e50e1efe8805e9384c78026466ecab96c519c327e96c	11	2026-08-03 09:25:31.122872+03
5	5	1.0	RESOLUTION OF KASANGATI G40 KWAGALANA LIMITED.docx	1785738331195-28b61c57a99b58a86ac4710e.docx	application/vnd.openxmlformats-officedocument.wordprocessingml.document	15805	447b6279a4127b60897f3571a8a7535205d71afc30196ce56a998e214c4e76ec	11	2026-08-03 09:25:31.199741+03
6	6	1.0	kwagalana AGM 2025 Minutes.docx	1785738331235-4a9b33788f051d0bd6ed31d1.docx	application/vnd.openxmlformats-officedocument.wordprocessingml.document	26667	1e40906e3f0e9d96b80dc97735850db6f85ef53c918e0c64a348efbc60240960	11	2026-08-03 09:25:31.240482+03
7	7	1.0	2025 AGM ACTIONS POINTS.docx	1785738331396-73da75ac4393eee4f1d7a831.docx	application/vnd.openxmlformats-officedocument.wordprocessingml.document	17028	98f2a87472da9fd059187fe17a092bed9a6639e21af99a06e15c82a0420f00fa	11	2026-08-03 09:25:31.395464+03
8	8	1.0	2026 AGM MINUTES_KASANGATI G40 KWAGALANA LIMITED.docx	1785738331454-2a97b2046b1666d40fd0c0fc.docx	application/vnd.openxmlformats-officedocument.wordprocessingml.document	27870	8bc1a8512d84669ecc9a8b37c1e9b1e3e47a773a3ebcb74852db77bc745960d7	11	2026-08-03 09:25:31.461397+03
9	9	1.0	INVESTMENT REPORT FOR KASANGATI G40 KWAGALANA AGM.docx	1785738331515-09a11b8d446d0b8e5e90b3dc.docx	application/vnd.openxmlformats-officedocument.wordprocessingml.document	18166	09a0c0f56899486b5bac6a04cfa8d2bd43226c1c4741ab46aa3971989f5283d9	11	2026-08-03 09:25:31.521594+03
10	10	1.0	kasangati g40 kwagalana loan agreement (2).docx	1785738331548-de8777cedd5f19c824d002ff.docx	application/vnd.openxmlformats-officedocument.wordprocessingml.document	21496	34f7dea808c9f838083aeaf4bda0683b71afa380e7d52c78aa59ae0af1045e54	11	2026-08-03 09:25:31.551759+03
11	11	1.0	KASANGATI G40 KWAGALANA LTD (Private Limited By Shares.docx	1785738331565-85972f37601421bc9941c2a5.docx	application/vnd.openxmlformats-officedocument.wordprocessingml.document	18629	2b1789a6fde03918bc451064ef9905cd5e11cba18203bde604cdb92b4fc162d6	11	2026-08-03 09:25:31.570047+03
12	3	1.1	Welfare-policy_G40-Kwagalana_5.7.2025.txt	1785739426394-62cf4e3c7e4454ed7c41316c.txt	text/plain; charset=utf-8	6562	4cde6a22a6fcfcd98816e0b2c56df310a9abc0729db2cb5342a1357ca94308ac	11	2026-08-03 09:43:46.402452+03
13	4	1.1	INVESTMENT-REPORT-FOR-KASANGATI-G40-KWAGALANA-AGM--1-.txt	1785739426403-aa47beefccd7d9c14abe27c0.txt	text/plain; charset=utf-8	1480	a66f36a06417e1494d7964bec4e5282479097b9f6fbd448412d82d06dd83b396	11	2026-08-03 09:43:46.409673+03
14	5	1.1	RESOLUTION-OF-KASANGATI-G40-KWAGALANA-LIMITED.txt	1785739426411-5d7829d1bf4a68071870067b.txt	text/plain; charset=utf-8	1614	00292a3c769d2d681880e5b760ed91abfbaeaec8feb3b8267df9b58012e07ff6	11	2026-08-03 09:43:46.418396+03
15	6	1.1	kwagalana-AGM-2025-Minutes.txt	1785739426417-a623faaef21ef27e95d94b16.txt	text/plain; charset=utf-8	5689	0765291dd9b7807b5ba332cf2576666508daf27e06d8aac64b3df747ef79ae2e	11	2026-08-03 09:43:46.423375+03
16	7	1.1	2025-AGM-ACTIONS-POINTS.txt	1785739426422-8ab2f2537f2987cace35a572.txt	text/plain; charset=utf-8	1864	e51a332aaf3ca0c60de2f286d52d34a0be62db69fcb760b2564fb546ebac608a	11	2026-08-03 09:43:46.429847+03
17	8	1.1	2026-AGM-MINUTES_KASANGATI-G40-KWAGALANA-LIMITED.txt	1785739426429-d7fd5a6fb14989668745079f.txt	text/plain; charset=utf-8	10861	3cf75fbfc8a58f42658665a56882a10e702579685a34ded14c662ef888c40d6f	11	2026-08-03 09:43:46.435296+03
18	9	1.1	INVESTMENT-REPORT-FOR-KASANGATI-G40-KWAGALANA-AGM.txt	1785739426434-539f7a804be0b32c32c54e01.txt	text/plain; charset=utf-8	3575	cefb2650d4d75b19b26d3f658e8f5b750b349e651ba31d8da7d58a0f3ab00b4e	11	2026-08-03 09:43:46.440439+03
19	10	1.1	kasangati-g40-kwagalana-loan-agreement--2-.txt	1785739426440-f6153d9928acbbc78ffe52f3.txt	text/plain; charset=utf-8	5130	460a96c54a2196b025bf1c2fd4203c700500811b1ef69ecf9b9e44044229b4ed	11	2026-08-03 09:43:46.44749+03
20	11	1.1	KASANGATI-G40-KWAGALANA-LTD--Private-Limited-By-Shares.txt	1785739426448-640c50f9898aad6cdd2355e5.txt	text/plain; charset=utf-8	5935	3b92adac616eaca88d7b6b4f390e9f5e89b185cab80592651a7d2f2d1bea7207	11	2026-08-03 09:43:46.453989+03
\.


--
-- Data for Name: organization_documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.organization_documents (id, reference, department_id, document_type, title, version, status, visibility_level, file_name, created_by, approved_by, created_at, updated_at) FROM stdin;
2	DOC-EXEC-MEMO-2026	1	Minutes	Executive Memo - Governance and Committee Appointments	1.0	published	4	\N	11	\N	2026-08-01 12:26:02.848241+03	2026-08-01 12:26:02.848241+03
3	DOC-WELFARE-POLICY-2025	1	Welfare Policy	Kasangati G40 Kwagalana Welfare Policy	1.1	published	4	Welfare-policy_G40-Kwagalana_5.7.2025.txt	11	\N	2026-08-03 09:25:30.247949+03	2026-08-03 09:43:46.404986+03
4	DOC-INVESTMENT-REPORT-2026	1	Investment Report	Investment Report for the 2026 AGM	1.1	published	4	INVESTMENT-REPORT-FOR-KASANGATI-G40-KWAGALANA-AGM--1-.txt	11	\N	2026-08-03 09:25:31.122872+03	2026-08-03 09:43:46.411111+03
5	DOC-UNIT-TRUST-RESOLUTION-2025	1	Resolution	Resolution to Open and Operate the Unit Trust Fund	1.1	published	4	RESOLUTION-OF-KASANGATI-G40-KWAGALANA-LIMITED.txt	11	\N	2026-08-03 09:25:31.199741+03	2026-08-03 09:43:46.419581+03
6	DOC-AGM-MINUTES-2025	1	Minutes	Annual General Meeting Minutes 2025	1.1	published	4	kwagalana-AGM-2025-Minutes.txt	11	\N	2026-08-03 09:25:31.240482+03	2026-08-03 09:43:46.424687+03
7	DOC-AGM-ACTIONS-2025	1	Action Points	2025 AGM Action Points	1.1	published	4	2025-AGM-ACTIONS-POINTS.txt	11	\N	2026-08-03 09:25:31.395464+03	2026-08-03 09:43:46.431327+03
8	DOC-AGM-MINUTES-2026	1	Minutes	Annual General Meeting Minutes 2026	1.1	published	4	2026-AGM-MINUTES_KASANGATI-G40-KWAGALANA-LIMITED.txt	11	\N	2026-08-03 09:25:31.461397+03	2026-08-03 09:43:46.436533+03
9	DOC-INVESTMENT-REPORT-2025	1	Investment Report	Investment Report for the 2025 AGM	1.1	published	4	INVESTMENT-REPORT-FOR-KASANGATI-G40-KWAGALANA-AGM.txt	11	\N	2026-08-03 09:25:31.521594+03	2026-08-03 09:43:46.441486+03
10	DOC-LOAN-AGREEMENT	1	Loan Agreement	Kasangati G40 Kwagalana Loan Agreement	1.1	published	4	kasangati-g40-kwagalana-loan-agreement--2-.txt	11	\N	2026-08-03 09:25:31.551759+03	2026-08-03 09:43:46.449374+03
11	DOC-COMPANY-CONSTITUTION	1	Constitution	Kasangati G40 Kwagalana Limited Constitution	1.1	published	4	KASANGATI-G40-KWAGALANA-LTD--Private-Limited-By-Shares.txt	11	\N	2026-08-03 09:25:31.570047+03	2026-08-03 09:43:46.455023+03
1	DOC-6F1C1C19FDB7483E	1	Constitution	doc 2	1.0	archived	2	PROJECT PROPOSAL.pdf	20	\N	2026-07-31 16:05:18.395127+03	2026-08-03 11:15:33.209843+03
\.


--
-- Data for Name: organization_finance_entries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.organization_finance_entries (id, department_id, reference, entry_type, category, description, amount, status, recorded_by, approved_by, created_at, approved_at, counterparty, payment_method, transaction_date, receipt_number, voucher_number, budget_line, supporting_document, finance_account_id) FROM stdin;
1	2	FIN-OPEN-CBC838B1F82D48FD	opening_balance	Opening Balance	we started with this.	500000.00	completed	17	17	2026-07-31 08:33:07.472704+03	2026-07-31 08:33:07.472704+03	Centenary Bank	Opening balance	2026-07-31	\N	\N	\N	/api/departments/finance/files/1785475987408-94638ecefdf71bd2c74a98f8.jpg	1
\.


--
-- Data for Name: organization_meetings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.organization_meetings (id, reference, department_id, title, meeting_type, agenda, venue, scheduled_at, status, visibility_level, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: organization_policy_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.organization_policy_settings (setting_key, numeric_value, text_value, source_reference, effective_from, updated_at) FROM stdin;
monthly_savings_target	425000.000	\N	CURRENT-MEMBER-SAVINGS-RULE	2026-07-01	2026-08-03 09:25:25.843829+03
annual_share_capital	2000000.000	\N	AGM-2026	2026-07-01	2026-08-03 09:25:25.843829+03
annual_subscription_fee	200000.000	\N	AGM-2026	2026-07-01	2026-08-03 09:25:25.843829+03
monthly_welfare_contribution	25000.000	\N	WELFARE-POLICY-2025	2025-07-05	2026-08-03 09:25:25.843829+03
welfare_waiting_months	6.000	\N	WELFARE-POLICY-2025	2025-07-05	2026-08-03 09:25:25.843829+03
welfare_funeral_member	2000000.000	\N	WELFARE-POLICY-2025	2025-07-05	2026-08-03 09:25:25.843829+03
welfare_funeral_dependant	1000000.000	\N	WELFARE-POLICY-2025	2025-07-05	2026-08-03 09:25:25.843829+03
welfare_accident_medical	1000000.000	\N	WELFARE-POLICY-2025	2025-07-05	2026-08-03 09:25:25.843829+03
welfare_marriage	1000000.000	\N	WELFARE-POLICY-2025	2025-07-05	2026-08-03 09:25:25.843829+03
welfare_max_children	4.000	\N	AGM-2025	2025-07-01	2026-08-03 09:25:25.843829+03
dividend_profit_percentage	70.000	\N	AGM-2026	2026-07-01	2026-08-03 09:25:25.843829+03
strategic_asset_target	1000000000.000	\N	AGM-2026	2026-07-01	2026-08-03 09:25:25.843829+03
strategic_asset_target_date	\N	2031-07-31	AGM-2026	2026-07-01	2026-08-03 09:25:25.843829+03
\.


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.organizations (id, name, code, description, active, created_at) FROM stdin;
1	Kasangati G40 Kwagalana	KG40	A central member-based organization serving its members through seven accountable departments.	t	2026-07-27 18:54:29.192251+03
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.schema_migrations (name, checksum, applied_at) FROM stdin;
001-core.sql	f2e87e684dcaf3539ad0a9c0827d01d631ffc94c83d03f41e91963f3c39c80f2	2026-07-29 08:28:47.911786+03
002-supervisory.sql	debdcc41063e70d2ad269364fc06af9cd25e02e7288e2e54db87bd34135f3899	2026-07-29 08:28:49.428292+03
003-legal-biodata.sql	4e1f8a057c0c9062cde4effd401f616d992e671a9ef03d08ea629fe26d903c51	2026-07-29 08:28:49.447544+03
004-security-and-sessions.sql	36c0e085720a9ee419d0f4c8e1271a50f7f5e5a3359a89b3141cfa5c0ebbecad	2026-07-29 08:33:15.584293+03
005-document-storage.sql	64cb05195bfc8f70313d126f236055c9ad0b7a4bd1ebfd2c6c752ca7c0d5550d	2026-07-29 09:00:05.291905+03
006-department-handoffs.sql	55f6d6e54f5a80aa17fe115e675c3d70ba7e71f5cc5845b02504f186adfb1ff0	2026-07-29 09:00:05.790188+03
007-attachment-quarantine.sql	5dfa90f3dbfb58b49b471985c88d81192c94b52ce993610482f465459321d37c	2026-07-29 09:09:54.053243+03
008-department-accounts-and-member-portal.sql	686e65812cd602d1186eb1c5e2e7e49de2ee8ede5e853495f2ccae27f756643d	2026-07-29 10:52:13.358237+03
009-department-assignment-boundaries.sql	f0b6a8e2fab10e4491180633e034e56f1b7d0c02fe3408469c510513a69bdcb2	2026-07-29 10:52:16.113972+03
010-asset-media.sql	4da33032b628525b0c43426f5049dc3083be9e230f2e08a6025366cc3946bd80	2026-07-30 08:25:24.15756+03
011-investment-record-retention.sql	171e172c8e050e96f1ee7e203491238c39d6cab0586967d696cd6757f8e27a4a	2026-07-30 09:18:18.279674+03
012-finance-account-ledger.sql	5449009832db590e019d38e7edd92d2bd0cd53af632759b5e5847d3e1cff555a	2026-07-30 11:08:55.703143+03
013-member-deposit-evidence.sql	7ae4c674026a992084c2fda168e60bee7b687e61831ace1eee8152521c3a5ad1	2026-07-30 14:50:51.026223+03
014-member-self-service.sql	1734d17988cf9f886984438f9043e762527643bd63e3e7fc506432bfa0dd15d7	2026-07-30 16:10:07.379349+03
015-finance-opening-balances.sql	01e79a14a5011a9c3235ec4ae4bef1768e77e1cb852f1299b0236b10dbe18f60	2026-07-30 19:44:07.995763+03
016-organization-brand-refresh.sql	e3f4a5c5deaffb98558b6e266f59d1738d78f668d929c7d38cdc3d9bf9e3ad09	2026-07-31 09:39:10.831478+03
017-executive-approval-history.sql	9ab11b24a0edb6692ae81b001076161eeb789dfd38e1c5704cf6c1fe15084e34	2026-07-31 11:31:41.081352+03
018-executive-project-governance.sql	5d5157a36115ac9c23b5bcc11d34f3d3274abd33a6150d4e00ebe547901cf398	2026-07-31 12:21:48.883816+03
019-historical-opening-records.sql	18cd9bcf6bd3650cc71f5f2fefef450fdb5ef24e17947907457e53ed1c14f1d0	2026-08-01 11:55:04.165726+03
020-governance-structure.sql	a66f2f7432a36cd7d4e3a584308d41aa1df1e39d790aafca5c72abe22ed764e8	2026-08-01 12:26:02.337804+03
021-provisional-member-accounts.sql	ce3752ca7e83be490d4786d701961841036459279c65df2ac71ba01b6256db97	2026-08-01 12:52:08.702957+03
022-member-financial-year-targets.sql	be5fae59d8ef8cdf9aca3e7e991b649b46c65a2dc37ec01a18f22185a78f5c99	2026-08-01 16:09:55.017701+03
023-member-contribution-finance-handoff.sql	c4081f64960bdcff738bb8df32cd97c2faafc9d330bcbccfcfb442b5c2f0e10e	2026-08-01 16:23:06.851079+03
024-contribution-financial-year-allocation.sql	0fb1b641651dfea00ce97a363e148d83375b2ccdb5bb7c10b4eb6cfe60832bfb	2026-08-01 18:12:12.418093+03
025-approved-organization-policies.sql	1db3e4d1976abad3ebc447712fb1da5c2b4ea07169b6cbdba9af0e079a86898a	2026-08-03 09:25:25.843829+03
026-controlled-member-exit.sql	3f114c6684a147b9671c5f975925c2f4cd602e06afc899cabcfcee2a272123df	2026-08-03 11:55:29.322851+03
027-loan-security-and-equal-principal.sql	1ecded4ec99e8394164ea2da987fa44844fc68c86f0bba759123ffa54815a4c1	2026-08-03 15:11:42.805691+03
028-credits-executive-loan-approval.sql	9200ae82222f78de657dc302dd83ababe3dcd3c9f4b44a87855d00373e498366	2026-08-03 16:49:46.143622+03
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.settings (key, value, updated_by, updated_at) FROM stdin;
sms	true	\N	2026-07-27 11:57:55.310974+03
email	true	\N	2026-07-27 11:57:55.31295+03
twoFactor	false	\N	2026-07-27 11:57:55.313864+03
dualApproval	true	\N	2026-07-27 11:57:55.314841+03
currency	UGX	\N	2026-07-27 11:57:55.316922+03
shareValue	50000	\N	2026-07-27 11:57:55.31847+03
minimumBalance	100000	\N	2026-07-27 11:57:55.319528+03
welfareFundBalance	0	\N	2026-07-30 12:18:36.597366+03
\.


--
-- Data for Name: supervisory_committees; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.supervisory_committees (id, reference, committee_name, members, meetings_held, attendance_rate, decisions_made, outstanding_actions, performance_score, status, chairperson, supervisor_comment, review_period, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: supervisory_complaints; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.supervisory_complaints (id, complaint_number, category, subject_type, department_id, description, assigned_supervisor, status, investigation_progress, finding, recommendation, escalated, confidential, evidence, created_by, created_at, updated_at, resolved_at) FROM stdin;
\.


--
-- Data for Name: supervisory_executive_monitoring; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.supervisory_executive_monitoring (id, reference, review_period, meetings_held, decisions_made, decisions_implemented, decisions_pending, strategic_objectives_completed, strategic_objectives_total, attendance_rate, implementation_rate, performance_score, delayed_actions, report_reference, supervisor_comment, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: supervisory_followups; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.supervisory_followups (id, reference, department_id, action_required, responsible_officer, deadline, progress, status, evidence, supervisor_comment, created_by, created_at, updated_at, closed_at) FROM stdin;
\.


--
-- Data for Name: supervisory_kpis; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.supervisory_kpis (id, reference, kpi_name, category, target_value, actual_value, unit, achievement_percentage, trend, status, review_period, data_source, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: supervisory_projects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.supervisory_projects (id, reference, project_name, department_id, project_manager, planned_progress, actual_progress, risk_level, status, deadline, budget_summary, site_visits_completed, supervisor_comment, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: supervisory_recommendations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.supervisory_recommendations (id, recommendation_number, department_id, source_type, source_reference, description, responsible_officer, issued_on, due_date, status, department_response, implementation_progress, accepted, evidence, verified_by, created_by, created_at, updated_at, completed_at) FROM stdin;
\.


--
-- Data for Name: supervisory_resolutions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.supervisory_resolutions (id, resolution_number, title, meeting_date, department_id, responsible_officer, due_date, completion_percentage, evidence, status, priority, supervisor_comment, created_by, created_at, updated_at, completed_at) FROM stdin;
\.


--
-- Data for Name: supervisory_scorecards; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.supervisory_scorecards (id, reference, department_id, annual_target, monthly_target, completed_tasks, outstanding_tasks, budget_utilization, performance_score, target_achievement, status, supervisor_comment, review_period, reviewed_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: supervisory_site_visits; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.supervisory_site_visits (id, visit_number, site_name, department_id, project_id, visit_date, supervisor, observations, photos_reference, recommendations, follow_up_date, status, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.transactions (id, reference, member_id, type, method, amount, status, external_reference, notes, recorded_by, verified_by, approved_by, reversal_of, reversal_reason, created_at, verified_at, approved_at, loan_id, receipt_number, submission_source, evidence_stored_name, evidence_original_name, evidence_mime_type, verification_comment, finance_entry_id, target_fiscal_year) FROM stdin;
6	MDP-MS7HBVXT-GP1G	1	Savings deposit	Bank transfer	100000.00	completed	money 456	Thanks for the patience	26	19	\N	\N	\N	2026-07-30 15:18:06.842414+03	2026-07-30 15:21:22.27048+03	\N	\N	RCPT-FB6530F3F0D4420A	member	1785413886824-3d92e43cb092654ad9bacdd9.jpg	Dylan Josiah Ndawula.JPG	image/jpeg	Funds received and uploaded receipt evidence matched	\N	\N
9	MDP-MS8XNE2K-F7QM	1	Savings deposit	Bank transfer	100000.00	completed	0986533	50k for savings and 50k for welfare	26	19	\N	\N	\N	2026-07-31 15:42:43.58412+03	2026-07-31 15:44:28.41565+03	\N	\N	RCPT-C911CA81A1A14742	member	1785501763571-2c0839bcceaaec98bd54d02b.jpg	Gyagenda Adriel Elier.JPG	image/jpeg	Funds received and uploaded receipt evidence matched	\N	\N
10	DSB-35C017CDCB1B4249	18	Loan disbursement	Mobile Money	5000000.00	completed	PROVISIONAL-PHONE-G40-2026-0014	\N	44	44	\N	\N	\N	2026-08-03 18:11:33.390339+03	2026-08-03 18:11:33.390339+03	\N	\N	\N	staff	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, full_name, email, phone, password_hash, role, branch_id, member_id, active, must_change_password, failed_attempts, locked_until, last_login, created_by, created_at, token_version, profile_photo_stored_name, profile_photo_original_name, profile_photo_mime_type, login_email_is_provisional) FROM stdin;
13	Isaac Kintu	admin@tujenge.test	+256 700 100 112	$2b$12$Ues7jrR.y9djJVK4ozJNz.38iJuB6YzSTevmZjstVfq1djVvgol7.	System Admin	1	\N	t	f	0	\N	2026-07-29 16:10:37.032294+03	\N	2026-07-27 11:57:55.231326+03	1	\N	\N	\N	f
12	Lydia Akello	auditor@tujenge.test	+256 700 100 111	$2b$12$06CGqg.HXPH4J/s8PYukMuwWlMSVDCBSqsEqzrMis6YD.rp9fle7e	Auditor	1	\N	t	f	0	\N	2026-07-30 17:02:04.470649+03	\N	2026-07-27 11:57:55.230413+03	0	\N	\N	\N	f
22	Edward Ssekitoleko	executive@kasangatig40.test	+256 700 200 106	$2b$12$iRd20e2CTen7PblYLz9wZuySJI5Z0DBccvEuCYvX3osYBOsRN5og.	Executive Officer	1	\N	t	f	0	\N	2026-08-04 09:42:21.189045+03	\N	2026-07-27 19:14:08.049479+03	0	1785401802797-3daccb54c8e3d03350c83fc0.jpg	Asiimwe Jotham.JPG	image/jpeg	f
15	Joseph Okello	joseph.member@tujenge.test	+256 701 586 443	$2b$12$RHuhBaGao2U5/3zx2O23B.PSw8zdH1vPBDj4jIe5T3kvLn2GnnoRq	Member	1	\N	t	f	0	\N	2026-07-27 16:13:50.732026+03	\N	2026-07-27 16:02:21.439141+03	0	\N	\N	\N	f
9	Daniel Ouma	loans@tujenge.test	+256 700 100 108	$2b$12$06CGqg.HXPH4J/s8PYukMuwWlMSVDCBSqsEqzrMis6YD.rp9fle7e	Credits Officer	1	\N	t	f	0	\N	2026-07-30 14:55:21.021005+03	\N	2026-07-27 11:57:55.227349+03	0	\N	\N	\N	f
20	Lawrence Mugerwa	legal@kasangatig40.test	+256 700 200 104	$2b$12$iRd20e2CTen7PblYLz9wZuySJI5Z0DBccvEuCYvX3osYBOsRN5og.	Legal Officer	1	\N	t	f	0	\N	2026-08-04 09:46:23.598392+03	\N	2026-07-27 19:14:08.046033+03	0	1785336775878-bf2c5267ddb047076980e670.png	1774708452988.png	image/png	f
1	Amina Nansubuga	amina@tujenge.test		$2b$12$06CGqg.HXPH4J/s8PYukMuwWlMSVDCBSqsEqzrMis6YD.rp9fle7e	Member	1	\N	t	f	0	\N	2026-07-30 16:16:21.729182+03	\N	2026-07-27 11:57:55.217482+03	0	1785331024912-c332703cb88ea24870412bac.png	1777353179955-removebg-preview.png	image/png	f
3	Andrew Kizza	vicechair@tujenge.test	+256 700 100 102	$2b$12$06CGqg.HXPH4J/s8PYukMuwWlMSVDCBSqsEqzrMis6YD.rp9fle7e	Executive Officer	1	\N	t	f	0	\N	\N	\N	2026-07-27 11:57:55.220984+03	0	\N	\N	\N	f
4	Joan Namuli	secretary@tujenge.test	+256 700 100 103	$2b$12$06CGqg.HXPH4J/s8PYukMuwWlMSVDCBSqsEqzrMis6YD.rp9fle7e	Executive Officer	1	\N	t	f	0	\N	\N	\N	2026-07-27 11:57:55.222042+03	0	\N	\N	\N	f
7	Ruth Nabirye	accountant@tujenge.test	+256 700 100 106	$2b$12$06CGqg.HXPH4J/s8PYukMuwWlMSVDCBSqsEqzrMis6YD.rp9fle7e	Finance Officer	1	\N	t	f	0	\N	\N	\N	2026-07-27 11:57:55.225315+03	0	\N	\N	\N	f
8	Moses Kato	cashier@tujenge.test	+256 700 100 107	$2b$12$06CGqg.HXPH4J/s8PYukMuwWlMSVDCBSqsEqzrMis6YD.rp9fle7e	Finance Officer	1	\N	t	f	0	\N	\N	\N	2026-07-27 11:57:55.226332+03	0	\N	\N	\N	f
16	Grace Atim	grace.member@tujenge.test	+256 704 772 183	$2b$12$RHuhBaGao2U5/3zx2O23B.PSw8zdH1vPBDj4jIe5T3kvLn2GnnoRq	Member	1	\N	t	f	0	\N	2026-07-27 16:16:03.378167+03	\N	2026-07-27 16:02:21.442794+03	0	\N	\N	\N	f
5	Patrick Odoi	treasurer@tujenge.test	+256 700 100 104	$2b$12$06CGqg.HXPH4J/s8PYukMuwWlMSVDCBSqsEqzrMis6YD.rp9fle7e	Finance Officer	1	\N	t	f	0	\N	2026-07-30 11:12:20.501577+03	\N	2026-07-27 11:57:55.223188+03	0	\N	\N	\N	f
19	Christine Nakitto	credits@kasangatig40.test	+256 700 200 103	$2b$12$iRd20e2CTen7PblYLz9wZuySJI5Z0DBccvEuCYvX3osYBOsRN5og.	Credits Officer	1	\N	t	f	0	\N	2026-08-03 16:13:12.825809+03	\N	2026-07-27 19:14:08.043826+03	0	\N	\N	\N	f
21	Winfred Nabukenya	welfare@kasangatig40.test	+256 700 200 105	$2b$12$iRd20e2CTen7PblYLz9wZuySJI5Z0DBccvEuCYvX3osYBOsRN5og.	Welfare Officer	1	\N	t	f	0	\N	2026-08-04 09:39:24.745464+03	\N	2026-07-27 19:14:08.047768+03	0	\N	\N	\N	f
18	Ivan Sserwanga	investment@kasangatig40.test	+256 700 200 102	$2b$12$iRd20e2CTen7PblYLz9wZuySJI5Z0DBccvEuCYvX3osYBOsRN5og.	Investment Officer	1	\N	t	f	0	\N	2026-07-30 17:02:03.257115+03	\N	2026-07-27 19:14:08.04021+03	0	\N	\N	\N	f
10	Samuel Wekesa	credit@tujenge.test	+256 700 100 109	$2b$12$06CGqg.HXPH4J/s8PYukMuwWlMSVDCBSqsEqzrMis6YD.rp9fle7e	Credits Officer	1	\N	t	f	0	\N	2026-07-30 15:29:34.154087+03	\N	2026-07-27 11:57:55.228304+03	0	\N	\N	\N	f
17	Florence Namagembe	finance@kasangatig40.test	+256 700 200 101	$2b$12$iRd20e2CTen7PblYLz9wZuySJI5Z0DBccvEuCYvX3osYBOsRN5og.	Finance Officer	1	\N	t	f	0	\N	2026-08-03 11:32:25.656735+03	\N	2026-07-27 19:14:08.036911+03	0	\N	\N	\N	f
23	Susan Nambatya	supervisory@kasangatig40.test	+256 700 200 107	$2b$12$iRd20e2CTen7PblYLz9wZuySJI5Z0DBccvEuCYvX3osYBOsRN5og.	Supervisory Officer	1	\N	t	f	0	\N	2026-08-04 09:42:04.343679+03	\N	2026-07-27 19:14:08.051149+03	0	\N	\N	\N	f
6	Esther Nakiwala	manager@tujenge.test	+256 700 100 105	$2b$12$06CGqg.HXPH4J/s8PYukMuwWlMSVDCBSqsEqzrMis6YD.rp9fle7e	Executive Officer	1	\N	t	f	0	\N	2026-07-29 09:16:53.654198+03	\N	2026-07-27 11:57:55.224229+03	0	\N	\N	\N	f
11	Faith Birungi	membership@tujenge.test	+256 700 100 110	$2b$12$06CGqg.HXPH4J/s8PYukMuwWlMSVDCBSqsEqzrMis6YD.rp9fle7e	Legal Officer	1	\N	t	f	0	\N	2026-07-27 19:05:19.042111+03	\N	2026-07-27 11:57:55.229403+03	0	\N	\N	\N	f
2	Rebecca Nakato	chairperson@tujenge.test	+256 700 100 101	$2b$12$06CGqg.HXPH4J/s8PYukMuwWlMSVDCBSqsEqzrMis6YD.rp9fle7e	Executive Officer	1	\N	t	f	0	\N	2026-07-27 12:40:06.060755+03	\N	2026-07-27 11:57:55.219929+03	0	\N	\N	\N	f
14	Brenda Asiimwe	support@tujenge.test	+256 700 300 400	$2b$12$XWU3NsmwabykDCftzlXkneOjPqK1YCvdRGxImMgQJ71aZ8fWx0ijW	Legal Officer	1	\N	t	t	0	\N	2026-07-27 12:41:41.325775+03	6	2026-07-27 12:03:47.280508+03	0	\N	\N	\N	f
34	Denis Tugume	denis.tugume@members.kg40.local	\N	$2b$12$buGUZWqj9n36MCnwLodpbu/CoGDyjq931Nm.brhcgb9fi4zjaJZAm	Welfare Officer	1	9	t	t	0	\N	\N	20	2026-08-01 12:52:09.084286+03	0	\N	\N	\N	t
36	Ntono Moreen	ntono.moreen@members.kg40.local	\N	$2b$12$b5iOOV21htbVO6uwtCwVZ.Zr78adBP8iYSjbIsKu56r2scspGOHrS	Welfare Officer	1	11	t	t	0	\N	\N	20	2026-08-01 12:52:09.084286+03	0	\N	\N	\N	t
40	Jude Tadieus Kyobe	jude.tadieus.kyobe@members.kg40.local	\N	$2b$12$nSpTYsIk8aI77ChpZC2/iOEoVUTDN3Dt7rafoa1VVZrYKq65XvBYq	Executive Officer	1	15	t	t	0	\N	\N	20	2026-08-01 12:52:09.084286+03	0	\N	\N	\N	t
42	Justine Kaudha Inhensiko	justine.kaudha.inhensiko@members.kg40.local	\N	$2b$12$g7Lhx3LZfcGwEty/ECVCz.4vXQ335QUnbB1qKfeqowa0t8myftIWC	Executive Officer	1	17	t	t	0	\N	\N	20	2026-08-01 12:52:09.084286+03	0	\N	\N	\N	t
46	Ralph Masaba	ralph.masaba@members.kg40.local	\N	$2b$12$vDeFSKi3n2D2QwAhKtVd0uEaWGgDNvR0WAT/qJvHVotNBkgS63Deu	Auditor	1	21	t	t	0	\N	\N	20	2026-08-01 12:52:09.084286+03	0	\N	\N	\N	t
47	Ezrah Nayoga	ezrah.nayoga@members.kg40.local	\N	$2b$12$JpiwVUicvCpnaHg/SwlYsefc8SWHuFAao9PDuqjo5Pia/7T8vxeRW	Executive Officer	1	22	t	t	0	\N	\N	20	2026-08-01 12:52:09.084286+03	0	\N	\N	\N	t
43	Paul Kalemba	paul.kalemba@members.kg40.local	\N	$2b$12$QyVgtAm9lQadPG2xCPvUAONUGXF3nqwM81KymooEDKTpeRdfUv5h2	Supervisory Officer	1	18	t	t	0	\N	2026-08-03 18:19:11.123567+03	20	2026-08-01 12:52:09.084286+03	1	\N	\N	\N	t
38	Mary Babirye	mary.babirye@members.kg40.local	\N	$2b$12$6rDjFUYJyBotc3lPvU7ej.FY5kDIxYLEjbJjFEx5Jy3MIkhP5YO5O	Executive Officer	1	13	t	t	0	\N	2026-08-01 12:54:36.398823+03	20	2026-08-01 12:52:09.084286+03	0	\N	\N	\N	t
32	Francis Banumba	francis.banumba@members.kg40.local	\N	$2b$12$/IKn2gSZPPkCfsWNfCQqIeo.R/TuOUMo8ukcyrjLBqCGuHVnMc57G	Executive Officer	1	7	t	t	0	\N	2026-08-01 16:15:26.715693+03	20	2026-08-01 12:52:09.084286+03	0	\N	\N	\N	t
31	Charles Oketcho	charles.oketcho@members.kg40.local	\N	$2b$12$Q0MbExXX2ixpttxRhMqU..gflGhC9gUTAJ37I.64.yf5pneUnKU6y	Member	1	6	t	t	0	\N	2026-08-03 16:03:29.842837+03	20	2026-08-01 12:52:09.084286+03	0	\N	\N	\N	t
39	Nakayiza Baraza Olivia	nakayiza.baraza.olivia@members.kg40.local	\N	$2b$12$nHvDD6e4GVh3JK2ErQOSZOnatMg3PIcSOK6kheFujZ5fMqhjsUEMm	Credits Officer	1	14	t	t	0	\N	2026-08-04 09:37:15.778856+03	20	2026-08-01 12:52:09.084286+03	1	\N	\N	\N	t
33	Josephine Babirye Kyobe	josephine.babirye.kyobe@members.kg40.local	\N	$2b$12$Ava/RfKbleJCBBtz7xjkQOL61QteaQzo.ZvOXSPD9PUJ.efjgO9u6	Credits Officer	1	8	t	t	0	\N	2026-08-01 18:42:43.289724+03	20	2026-08-01 12:52:09.084286+03	1	\N	\N	\N	t
41	Brian Mutiga	brian.mutiga@members.kg40.local	\N	$2b$12$qFpyRxPisI498zpbCzue6e25JghwJUNS1MTFdqneLEMCcazZDI5Iq	Investment Officer	1	16	t	t	0	\N	2026-08-03 16:06:44.289403+03	20	2026-08-01 12:52:09.084286+03	1	\N	\N	\N	t
26	Lazor Prince	director@ocean.school	0750000377	$2b$12$tt7Lm.JMG6pcUuDIO.8Tve5vVKZ1Gtx3qnw7jTHOclEj5ZzvAPY8a	Member	1	1	f	t	0	\N	2026-07-31 16:10:19.319803+03	20	2026-07-30 14:21:52.84631+03	0	\N	\N	\N	f
44	Dan Rwebingira Ssalongo	dan.rwebingira.ssalongo@members.kg40.local	\N	$2b$12$3moIIaRvX7IZjxItU835xeCZN5DvTTEmnu5X6PwgkiAUr5l.IXW2y	Credits Officer	1	19	t	t	0	\N	2026-08-04 09:46:44.766173+03	20	2026-08-01 12:52:09.084286+03	2	\N	\N	\N	t
37	Ritah Nakyanzi	ritah.nakyanzi@members.kg40.local	\N	$2b$12$LXTEgpQhYXvvUwvYI3o2SOe4LYFB9q6.24/tIVnZ4FuVEyyN6tKUm	Executive Officer	1	12	t	t	0	\N	2026-08-03 17:05:11.93757+03	20	2026-08-01 12:52:09.084286+03	1	\N	\N	\N	t
45	Christopher Muhoozi	christopher.muhoozi@members.kg40.local	\N	$2b$12$IpVsl7ZnJ7.hLNqI5qifpu.fjpIN9GLCefmD1D/aGGOq.8e7YLxCa	Supervisory Officer	1	20	t	t	0	\N	2026-08-03 16:12:23.154567+03	20	2026-08-01 12:52:09.084286+03	1	\N	\N	\N	t
35	Tabula Robert	tabula.robert@members.kg40.local	\N	$2b$12$g.XjYy7NaAkNHVCRLkh5vuMkAnUrzyg9qCABnAYLlkcSgqPzoLXt2	Executive Officer	1	10	t	f	0	\N	2026-08-04 10:02:17.652252+03	20	2026-08-01 12:52:09.084286+03	1	\N	\N	\N	t
\.


--
-- Data for Name: welfare_activities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.welfare_activities (id, reference, activity_type, title, description, activity_date, budget, responsible_officer, participants, outcome, status, report_reference, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: welfare_committee_meetings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.welfare_committee_meetings (id, reference, title, agenda, venue, scheduled_at, chairperson, participants, decisions, status, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: welfare_contributions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.welfare_contributions (id, reference, member_id, contribution_type, period, expected_amount, amount, payment_method, receipt_number, status, contribution_date, recorded_by, created_at, finance_entry_id, payment_reference, submission_source, evidence_stored_name, evidence_original_name, evidence_mime_type, verification_comment, verified_by, verified_at) FROM stdin;
\.


--
-- Data for Name: welfare_payments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.welfare_payments (id, reference, request_id, beneficiary_name, amount, payment_method, voucher_number, receipt_number, status, approved_at, paid_at, recorded_by) FROM stdin;
\.


--
-- Data for Name: welfare_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.welfare_requests (id, reference, member_id, request_type, description, amount, status, submitted_by, reviewed_by, created_at, reviewed_at, urgency, supporting_document, documents_verified, previous_support, officer_recommendation, assigned_to, payment_status, executive_activity_id, finance_voucher_id, closed_at, evidence_stored_name, evidence_original_name, evidence_mime_type, beneficiary_name, beneficiary_relationship, policy_limit, policy_eligible, policy_reason, policy_reference) FROM stdin;
\.


--
-- Data for Name: withdrawals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.withdrawals (id, reference, member_id, amount, method, reason, status, requested_by, approved_by, processed_by, created_at, approved_at, processed_at, transaction_id) FROM stdin;
\.


--
-- Name: announcements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.announcements_id_seq', 1, false);


--
-- Name: audit_compliance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.audit_compliance_id_seq', 1, false);


--
-- Name: audit_findings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.audit_findings_id_seq', 1, false);


--
-- Name: audit_fraud_alerts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.audit_fraud_alerts_id_seq', 1, false);


--
-- Name: audit_investigations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.audit_investigations_id_seq', 1, false);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 470, true);


--
-- Name: audit_plans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.audit_plans_id_seq', 1, false);


--
-- Name: audit_recommendations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.audit_recommendations_id_seq', 1, false);


--
-- Name: audit_risks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.audit_risks_id_seq', 1, false);


--
-- Name: branches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.branches_id_seq', 1, true);


--
-- Name: conversations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.conversations_id_seq', 2, true);


--
-- Name: department_activities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.department_activities_id_seq', 3, true);


--
-- Name: department_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.department_assignments_id_seq', 2377, true);


--
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.departments_id_seq', 427, true);


--
-- Name: finance_accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.finance_accounts_id_seq', 1, true);


--
-- Name: finance_assets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.finance_assets_id_seq', 1, false);


--
-- Name: finance_budgets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.finance_budgets_id_seq', 1, true);


--
-- Name: finance_invoices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.finance_invoices_id_seq', 1, false);


--
-- Name: finance_payment_vouchers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.finance_payment_vouchers_id_seq', 1, false);


--
-- Name: finance_procurements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.finance_procurements_id_seq', 1, false);


--
-- Name: financial_reporting_periods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.financial_reporting_periods_id_seq', 2, true);


--
-- Name: financial_statement_lines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.financial_statement_lines_id_seq', 80, true);


--
-- Name: governance_appointments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.governance_appointments_id_seq', 28, true);


--
-- Name: governance_bodies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.governance_bodies_id_seq', 9, true);


--
-- Name: governance_directives_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.governance_directives_id_seq', 3, true);


--
-- Name: governance_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.governance_records_id_seq', 1, false);


--
-- Name: historical_investment_ledger_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.historical_investment_ledger_id_seq', 16, true);


--
-- Name: investment_assets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.investment_assets_id_seq', 1, false);


--
-- Name: investment_contracts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.investment_contracts_id_seq', 1, false);


--
-- Name: investment_fund_accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.investment_fund_accounts_id_seq', 2, true);


--
-- Name: investment_investors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.investment_investors_id_seq', 1, false);


--
-- Name: investment_project_oversight_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.investment_project_oversight_id_seq', 6, true);


--
-- Name: investment_projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.investment_projects_id_seq', 3, true);


--
-- Name: investment_proposals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.investment_proposals_id_seq', 2, true);


--
-- Name: investment_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.investment_transactions_id_seq', 1, false);


--
-- Name: leadership_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.leadership_assignments_id_seq', 169, true);


--
-- Name: legacy_member_opening_balances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.legacy_member_opening_balances_id_seq', 18, true);


--
-- Name: legal_cases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.legal_cases_id_seq', 1, false);


--
-- Name: legal_complaints_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.legal_complaints_id_seq', 1, false);


--
-- Name: legal_compliance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.legal_compliance_id_seq', 1, false);


--
-- Name: legal_contracts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.legal_contracts_id_seq', 1, false);


--
-- Name: legal_court_matters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.legal_court_matters_id_seq', 1, false);


--
-- Name: legal_opinions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.legal_opinions_id_seq', 1, false);


--
-- Name: legal_policies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.legal_policies_id_seq', 1, false);


--
-- Name: loan_charges_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.loan_charges_id_seq', 1, true);


--
-- Name: loan_disbursements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.loan_disbursements_id_seq', 1, true);


--
-- Name: loan_guarantors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.loan_guarantors_id_seq', 3, true);


--
-- Name: loan_products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.loan_products_id_seq', 4, true);


--
-- Name: loan_recovery_actions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.loan_recovery_actions_id_seq', 1, false);


--
-- Name: loan_repayment_schedule_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.loan_repayment_schedule_id_seq', 5, true);


--
-- Name: loan_workflow_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.loan_workflow_events_id_seq', 8, true);


--
-- Name: loans_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.loans_id_seq', 1, true);


--
-- Name: member_department_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.member_department_profiles_id_seq', 1, false);


--
-- Name: member_family_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.member_family_records_id_seq', 1, false);


--
-- Name: member_financial_year_policies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.member_financial_year_policies_id_seq', 1, true);


--
-- Name: member_investment_applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.member_investment_applications_id_seq', 1, false);


--
-- Name: member_support_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.member_support_requests_id_seq', 1, false);


--
-- Name: members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.members_id_seq', 22, true);


--
-- Name: membership_status_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.membership_status_records_id_seq', 6, true);


--
-- Name: message_attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.message_attachments_id_seq', 1, false);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.messages_id_seq', 5, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_id_seq', 27, true);


--
-- Name: organization_document_versions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.organization_document_versions_id_seq', 20, true);


--
-- Name: organization_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.organization_documents_id_seq', 11, true);


--
-- Name: organization_finance_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.organization_finance_entries_id_seq', 1, true);


--
-- Name: organization_meetings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.organization_meetings_id_seq', 1, false);


--
-- Name: organizations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.organizations_id_seq', 1, true);


--
-- Name: supervisory_committees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.supervisory_committees_id_seq', 1, false);


--
-- Name: supervisory_complaints_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.supervisory_complaints_id_seq', 1, false);


--
-- Name: supervisory_executive_monitoring_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.supervisory_executive_monitoring_id_seq', 1, false);


--
-- Name: supervisory_followups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.supervisory_followups_id_seq', 1, false);


--
-- Name: supervisory_kpis_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.supervisory_kpis_id_seq', 1, false);


--
-- Name: supervisory_projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.supervisory_projects_id_seq', 1, false);


--
-- Name: supervisory_recommendations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.supervisory_recommendations_id_seq', 1, false);


--
-- Name: supervisory_resolutions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.supervisory_resolutions_id_seq', 1, false);


--
-- Name: supervisory_scorecards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.supervisory_scorecards_id_seq', 1, false);


--
-- Name: supervisory_site_visits_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.supervisory_site_visits_id_seq', 1, false);


--
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.transactions_id_seq', 10, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 47, true);


--
-- Name: welfare_activities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.welfare_activities_id_seq', 1, false);


--
-- Name: welfare_committee_meetings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.welfare_committee_meetings_id_seq', 1, false);


--
-- Name: welfare_contributions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.welfare_contributions_id_seq', 1, false);


--
-- Name: welfare_payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.welfare_payments_id_seq', 1, false);


--
-- Name: welfare_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.welfare_requests_id_seq', 1, false);


--
-- Name: withdrawals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.withdrawals_id_seq', 1, false);


--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- Name: audit_compliance audit_compliance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_compliance
    ADD CONSTRAINT audit_compliance_pkey PRIMARY KEY (id);


--
-- Name: audit_compliance audit_compliance_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_compliance
    ADD CONSTRAINT audit_compliance_reference_key UNIQUE (reference);


--
-- Name: audit_findings audit_findings_finding_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_findings
    ADD CONSTRAINT audit_findings_finding_number_key UNIQUE (finding_number);


--
-- Name: audit_findings audit_findings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_findings
    ADD CONSTRAINT audit_findings_pkey PRIMARY KEY (id);


--
-- Name: audit_fraud_alerts audit_fraud_alerts_alert_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_fraud_alerts
    ADD CONSTRAINT audit_fraud_alerts_alert_number_key UNIQUE (alert_number);


--
-- Name: audit_fraud_alerts audit_fraud_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_fraud_alerts
    ADD CONSTRAINT audit_fraud_alerts_pkey PRIMARY KEY (id);


--
-- Name: audit_investigations audit_investigations_investigation_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_investigations
    ADD CONSTRAINT audit_investigations_investigation_number_key UNIQUE (investigation_number);


--
-- Name: audit_investigations audit_investigations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_investigations
    ADD CONSTRAINT audit_investigations_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: audit_plans audit_plans_audit_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_plans
    ADD CONSTRAINT audit_plans_audit_number_key UNIQUE (audit_number);


--
-- Name: audit_plans audit_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_plans
    ADD CONSTRAINT audit_plans_pkey PRIMARY KEY (id);


--
-- Name: audit_recommendations audit_recommendations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_recommendations
    ADD CONSTRAINT audit_recommendations_pkey PRIMARY KEY (id);


--
-- Name: audit_recommendations audit_recommendations_recommendation_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_recommendations
    ADD CONSTRAINT audit_recommendations_recommendation_number_key UNIQUE (recommendation_number);


--
-- Name: audit_risks audit_risks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_risks
    ADD CONSTRAINT audit_risks_pkey PRIMARY KEY (id);


--
-- Name: audit_risks audit_risks_risk_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_risks
    ADD CONSTRAINT audit_risks_risk_number_key UNIQUE (risk_number);


--
-- Name: branches branches_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_code_key UNIQUE (code);


--
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- Name: conversation_members conversation_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_members
    ADD CONSTRAINT conversation_members_pkey PRIMARY KEY (conversation_id, user_id);


--
-- Name: conversations conversations_direct_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_direct_unique UNIQUE (user_low, user_high);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: department_activities department_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department_activities
    ADD CONSTRAINT department_activities_pkey PRIMARY KEY (id);


--
-- Name: department_activities department_activities_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department_activities
    ADD CONSTRAINT department_activities_reference_key UNIQUE (reference);


--
-- Name: department_assignments department_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department_assignments
    ADD CONSTRAINT department_assignments_pkey PRIMARY KEY (id);


--
-- Name: department_assignments department_assignments_user_id_department_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department_assignments
    ADD CONSTRAINT department_assignments_user_id_department_id_key UNIQUE (user_id, department_id);


--
-- Name: departments departments_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_code_key UNIQUE (code);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: finance_accounts finance_accounts_account_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_accounts
    ADD CONSTRAINT finance_accounts_account_code_key UNIQUE (account_code);


--
-- Name: finance_accounts finance_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_accounts
    ADD CONSTRAINT finance_accounts_pkey PRIMARY KEY (id);


--
-- Name: finance_assets finance_assets_asset_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_assets
    ADD CONSTRAINT finance_assets_asset_code_key UNIQUE (asset_code);


--
-- Name: finance_assets finance_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_assets
    ADD CONSTRAINT finance_assets_pkey PRIMARY KEY (id);


--
-- Name: finance_budgets finance_budgets_department_id_fiscal_period_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_budgets
    ADD CONSTRAINT finance_budgets_department_id_fiscal_period_key UNIQUE (department_id, fiscal_period);


--
-- Name: finance_budgets finance_budgets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_budgets
    ADD CONSTRAINT finance_budgets_pkey PRIMARY KEY (id);


--
-- Name: finance_budgets finance_budgets_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_budgets
    ADD CONSTRAINT finance_budgets_reference_key UNIQUE (reference);


--
-- Name: finance_invoices finance_invoices_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_invoices
    ADD CONSTRAINT finance_invoices_invoice_number_key UNIQUE (invoice_number);


--
-- Name: finance_invoices finance_invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_invoices
    ADD CONSTRAINT finance_invoices_pkey PRIMARY KEY (id);


--
-- Name: finance_payment_vouchers finance_payment_vouchers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_payment_vouchers
    ADD CONSTRAINT finance_payment_vouchers_pkey PRIMARY KEY (id);


--
-- Name: finance_payment_vouchers finance_payment_vouchers_voucher_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_payment_vouchers
    ADD CONSTRAINT finance_payment_vouchers_voucher_number_key UNIQUE (voucher_number);


--
-- Name: finance_procurements finance_procurements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_procurements
    ADD CONSTRAINT finance_procurements_pkey PRIMARY KEY (id);


--
-- Name: finance_procurements finance_procurements_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_procurements
    ADD CONSTRAINT finance_procurements_reference_key UNIQUE (reference);


--
-- Name: financial_reporting_periods financial_reporting_periods_period_end_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_reporting_periods
    ADD CONSTRAINT financial_reporting_periods_period_end_key UNIQUE (period_end);


--
-- Name: financial_reporting_periods financial_reporting_periods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_reporting_periods
    ADD CONSTRAINT financial_reporting_periods_pkey PRIMARY KEY (id);


--
-- Name: financial_statement_lines financial_statement_lines_period_id_statement_type_line_cod_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_statement_lines
    ADD CONSTRAINT financial_statement_lines_period_id_statement_type_line_cod_key UNIQUE (period_id, statement_type, line_code);


--
-- Name: financial_statement_lines financial_statement_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_statement_lines
    ADD CONSTRAINT financial_statement_lines_pkey PRIMARY KEY (id);


--
-- Name: governance_appointments governance_appointments_body_id_canonical_member_name_posit_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.governance_appointments
    ADD CONSTRAINT governance_appointments_body_id_canonical_member_name_posit_key UNIQUE (body_id, canonical_member_name, position_title);


--
-- Name: governance_appointments governance_appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.governance_appointments
    ADD CONSTRAINT governance_appointments_pkey PRIMARY KEY (id);


--
-- Name: governance_bodies governance_bodies_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.governance_bodies
    ADD CONSTRAINT governance_bodies_code_key UNIQUE (code);


--
-- Name: governance_bodies governance_bodies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.governance_bodies
    ADD CONSTRAINT governance_bodies_pkey PRIMARY KEY (id);


--
-- Name: governance_directives governance_directives_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.governance_directives
    ADD CONSTRAINT governance_directives_pkey PRIMARY KEY (id);


--
-- Name: governance_directives governance_directives_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.governance_directives
    ADD CONSTRAINT governance_directives_reference_key UNIQUE (reference);


--
-- Name: governance_records governance_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.governance_records
    ADD CONSTRAINT governance_records_pkey PRIMARY KEY (id);


--
-- Name: governance_records governance_records_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.governance_records
    ADD CONSTRAINT governance_records_reference_key UNIQUE (reference);


--
-- Name: historical_investment_ledger historical_investment_ledger_period_id_transaction_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historical_investment_ledger
    ADD CONSTRAINT historical_investment_ledger_period_id_transaction_id_key UNIQUE (period_id, transaction_id);


--
-- Name: historical_investment_ledger historical_investment_ledger_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historical_investment_ledger
    ADD CONSTRAINT historical_investment_ledger_pkey PRIMARY KEY (id);


--
-- Name: investment_assets investment_assets_asset_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_assets
    ADD CONSTRAINT investment_assets_asset_code_key UNIQUE (asset_code);


--
-- Name: investment_assets investment_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_assets
    ADD CONSTRAINT investment_assets_pkey PRIMARY KEY (id);


--
-- Name: investment_contracts investment_contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_contracts
    ADD CONSTRAINT investment_contracts_pkey PRIMARY KEY (id);


--
-- Name: investment_contracts investment_contracts_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_contracts
    ADD CONSTRAINT investment_contracts_reference_key UNIQUE (reference);


--
-- Name: investment_fund_accounts investment_fund_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_fund_accounts
    ADD CONSTRAINT investment_fund_accounts_pkey PRIMARY KEY (id);


--
-- Name: investment_fund_accounts investment_fund_accounts_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_fund_accounts
    ADD CONSTRAINT investment_fund_accounts_reference_key UNIQUE (reference);


--
-- Name: investment_investors investment_investors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_investors
    ADD CONSTRAINT investment_investors_pkey PRIMARY KEY (id);


--
-- Name: investment_project_oversight investment_project_oversight_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_project_oversight
    ADD CONSTRAINT investment_project_oversight_pkey PRIMARY KEY (id);


--
-- Name: investment_projects investment_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_projects
    ADD CONSTRAINT investment_projects_pkey PRIMARY KEY (id);


--
-- Name: investment_projects investment_projects_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_projects
    ADD CONSTRAINT investment_projects_reference_key UNIQUE (reference);


--
-- Name: investment_proposals investment_proposals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_proposals
    ADD CONSTRAINT investment_proposals_pkey PRIMARY KEY (id);


--
-- Name: investment_proposals investment_proposals_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_proposals
    ADD CONSTRAINT investment_proposals_reference_key UNIQUE (reference);


--
-- Name: investment_transactions investment_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_transactions
    ADD CONSTRAINT investment_transactions_pkey PRIMARY KEY (id);


--
-- Name: investment_transactions investment_transactions_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_transactions
    ADD CONSTRAINT investment_transactions_reference_key UNIQUE (reference);


--
-- Name: leadership_assignments leadership_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leadership_assignments
    ADD CONSTRAINT leadership_assignments_pkey PRIMARY KEY (id);


--
-- Name: leadership_assignments leadership_assignments_user_id_body_position_title_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leadership_assignments
    ADD CONSTRAINT leadership_assignments_user_id_body_position_title_key UNIQUE (user_id, body, position_title);


--
-- Name: legacy_member_opening_balances legacy_member_opening_balances_period_id_member_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legacy_member_opening_balances
    ADD CONSTRAINT legacy_member_opening_balances_period_id_member_name_key UNIQUE (period_id, member_name);


--
-- Name: legacy_member_opening_balances legacy_member_opening_balances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legacy_member_opening_balances
    ADD CONSTRAINT legacy_member_opening_balances_pkey PRIMARY KEY (id);


--
-- Name: legal_cases legal_cases_case_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_cases
    ADD CONSTRAINT legal_cases_case_number_key UNIQUE (case_number);


--
-- Name: legal_cases legal_cases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_cases
    ADD CONSTRAINT legal_cases_pkey PRIMARY KEY (id);


--
-- Name: legal_complaints legal_complaints_complaint_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_complaints
    ADD CONSTRAINT legal_complaints_complaint_number_key UNIQUE (complaint_number);


--
-- Name: legal_complaints legal_complaints_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_complaints
    ADD CONSTRAINT legal_complaints_pkey PRIMARY KEY (id);


--
-- Name: legal_compliance legal_compliance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_compliance
    ADD CONSTRAINT legal_compliance_pkey PRIMARY KEY (id);


--
-- Name: legal_compliance legal_compliance_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_compliance
    ADD CONSTRAINT legal_compliance_reference_key UNIQUE (reference);


--
-- Name: legal_contracts legal_contracts_contract_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_contracts
    ADD CONSTRAINT legal_contracts_contract_number_key UNIQUE (contract_number);


--
-- Name: legal_contracts legal_contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_contracts
    ADD CONSTRAINT legal_contracts_pkey PRIMARY KEY (id);


--
-- Name: legal_court_matters legal_court_matters_court_file_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_court_matters
    ADD CONSTRAINT legal_court_matters_court_file_key UNIQUE (court_file);


--
-- Name: legal_court_matters legal_court_matters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_court_matters
    ADD CONSTRAINT legal_court_matters_pkey PRIMARY KEY (id);


--
-- Name: legal_opinions legal_opinions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_opinions
    ADD CONSTRAINT legal_opinions_pkey PRIMARY KEY (id);


--
-- Name: legal_opinions legal_opinions_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_opinions
    ADD CONSTRAINT legal_opinions_reference_key UNIQUE (reference);


--
-- Name: legal_policies legal_policies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_policies
    ADD CONSTRAINT legal_policies_pkey PRIMARY KEY (id);


--
-- Name: legal_policies legal_policies_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_policies
    ADD CONSTRAINT legal_policies_reference_key UNIQUE (reference);


--
-- Name: loan_charges loan_charges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_charges
    ADD CONSTRAINT loan_charges_pkey PRIMARY KEY (id);


--
-- Name: loan_disbursements loan_disbursements_loan_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_disbursements
    ADD CONSTRAINT loan_disbursements_loan_id_key UNIQUE (loan_id);


--
-- Name: loan_disbursements loan_disbursements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_disbursements
    ADD CONSTRAINT loan_disbursements_pkey PRIMARY KEY (id);


--
-- Name: loan_disbursements loan_disbursements_transaction_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_disbursements
    ADD CONSTRAINT loan_disbursements_transaction_reference_key UNIQUE (transaction_reference);


--
-- Name: loan_guarantors loan_guarantors_loan_id_member_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_guarantors
    ADD CONSTRAINT loan_guarantors_loan_id_member_id_key UNIQUE (loan_id, member_id);


--
-- Name: loan_guarantors loan_guarantors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_guarantors
    ADD CONSTRAINT loan_guarantors_pkey PRIMARY KEY (id);


--
-- Name: loan_products loan_products_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_products
    ADD CONSTRAINT loan_products_name_key UNIQUE (name);


--
-- Name: loan_products loan_products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_products
    ADD CONSTRAINT loan_products_pkey PRIMARY KEY (id);


--
-- Name: loan_recovery_actions loan_recovery_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_recovery_actions
    ADD CONSTRAINT loan_recovery_actions_pkey PRIMARY KEY (id);


--
-- Name: loan_repayment_schedule loan_repayment_schedule_loan_id_installment_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_repayment_schedule
    ADD CONSTRAINT loan_repayment_schedule_loan_id_installment_number_key UNIQUE (loan_id, installment_number);


--
-- Name: loan_repayment_schedule loan_repayment_schedule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_repayment_schedule
    ADD CONSTRAINT loan_repayment_schedule_pkey PRIMARY KEY (id);


--
-- Name: loan_workflow_events loan_workflow_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_workflow_events
    ADD CONSTRAINT loan_workflow_events_pkey PRIMARY KEY (id);


--
-- Name: loans loans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loans
    ADD CONSTRAINT loans_pkey PRIMARY KEY (id);


--
-- Name: loans loans_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loans
    ADD CONSTRAINT loans_reference_key UNIQUE (reference);


--
-- Name: member_bio_data member_bio_data_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_bio_data
    ADD CONSTRAINT member_bio_data_pkey PRIMARY KEY (member_id);


--
-- Name: member_department_profiles member_department_profiles_member_id_department_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_department_profiles
    ADD CONSTRAINT member_department_profiles_member_id_department_id_key UNIQUE (member_id, department_id);


--
-- Name: member_department_profiles member_department_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_department_profiles
    ADD CONSTRAINT member_department_profiles_pkey PRIMARY KEY (id);


--
-- Name: member_family_records member_family_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_family_records
    ADD CONSTRAINT member_family_records_pkey PRIMARY KEY (id);


--
-- Name: member_financial_year_policies member_financial_year_policies_fiscal_year_label_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_financial_year_policies
    ADD CONSTRAINT member_financial_year_policies_fiscal_year_label_key UNIQUE (fiscal_year_label);


--
-- Name: member_financial_year_policies member_financial_year_policies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_financial_year_policies
    ADD CONSTRAINT member_financial_year_policies_pkey PRIMARY KEY (id);


--
-- Name: member_financial_year_policies member_financial_year_policies_starts_on_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_financial_year_policies
    ADD CONSTRAINT member_financial_year_policies_starts_on_key UNIQUE (starts_on);


--
-- Name: member_investment_applications member_investment_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_investment_applications
    ADD CONSTRAINT member_investment_applications_pkey PRIMARY KEY (id);


--
-- Name: member_investment_applications member_investment_applications_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_investment_applications
    ADD CONSTRAINT member_investment_applications_reference_key UNIQUE (reference);


--
-- Name: member_support_requests member_support_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_support_requests
    ADD CONSTRAINT member_support_requests_pkey PRIMARY KEY (id);


--
-- Name: member_support_requests member_support_requests_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_support_requests
    ADD CONSTRAINT member_support_requests_reference_key UNIQUE (reference);


--
-- Name: members members_member_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_member_number_key UNIQUE (member_number);


--
-- Name: members members_national_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_national_id_key UNIQUE (national_id);


--
-- Name: members members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_pkey PRIMARY KEY (id);


--
-- Name: membership_status_records membership_status_records_member_name_status_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_status_records
    ADD CONSTRAINT membership_status_records_member_name_status_key UNIQUE (member_name, status);


--
-- Name: membership_status_records membership_status_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_status_records
    ADD CONSTRAINT membership_status_records_pkey PRIMARY KEY (id);


--
-- Name: message_attachments message_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_attachments
    ADD CONSTRAINT message_attachments_pkey PRIMARY KEY (id);


--
-- Name: message_attachments message_attachments_stored_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_attachments
    ADD CONSTRAINT message_attachments_stored_name_key UNIQUE (stored_name);


--
-- Name: message_mentions message_mentions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_mentions
    ADD CONSTRAINT message_mentions_pkey PRIMARY KEY (message_id, mentioned_user_id);


--
-- Name: message_reactions message_reactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_reactions
    ADD CONSTRAINT message_reactions_pkey PRIMARY KEY (message_id, user_id, emoji);


--
-- Name: message_reads message_reads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_reads
    ADD CONSTRAINT message_reads_pkey PRIMARY KEY (message_id, user_id);


--
-- Name: message_stars message_stars_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_stars
    ADD CONSTRAINT message_stars_pkey PRIMARY KEY (message_id, user_id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: organization_document_versions organization_document_versions_document_id_version_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_document_versions
    ADD CONSTRAINT organization_document_versions_document_id_version_key UNIQUE (document_id, version);


--
-- Name: organization_document_versions organization_document_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_document_versions
    ADD CONSTRAINT organization_document_versions_pkey PRIMARY KEY (id);


--
-- Name: organization_document_versions organization_document_versions_stored_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_document_versions
    ADD CONSTRAINT organization_document_versions_stored_name_key UNIQUE (stored_name);


--
-- Name: organization_documents organization_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_documents
    ADD CONSTRAINT organization_documents_pkey PRIMARY KEY (id);


--
-- Name: organization_documents organization_documents_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_documents
    ADD CONSTRAINT organization_documents_reference_key UNIQUE (reference);


--
-- Name: organization_finance_entries organization_finance_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_finance_entries
    ADD CONSTRAINT organization_finance_entries_pkey PRIMARY KEY (id);


--
-- Name: organization_finance_entries organization_finance_entries_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_finance_entries
    ADD CONSTRAINT organization_finance_entries_reference_key UNIQUE (reference);


--
-- Name: organization_meetings organization_meetings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_meetings
    ADD CONSTRAINT organization_meetings_pkey PRIMARY KEY (id);


--
-- Name: organization_meetings organization_meetings_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_meetings
    ADD CONSTRAINT organization_meetings_reference_key UNIQUE (reference);


--
-- Name: organization_policy_settings organization_policy_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_policy_settings
    ADD CONSTRAINT organization_policy_settings_pkey PRIMARY KEY (setting_key);


--
-- Name: organizations organizations_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_code_key UNIQUE (code);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (name);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (key);


--
-- Name: supervisory_committees supervisory_committees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_committees
    ADD CONSTRAINT supervisory_committees_pkey PRIMARY KEY (id);


--
-- Name: supervisory_committees supervisory_committees_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_committees
    ADD CONSTRAINT supervisory_committees_reference_key UNIQUE (reference);


--
-- Name: supervisory_complaints supervisory_complaints_complaint_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_complaints
    ADD CONSTRAINT supervisory_complaints_complaint_number_key UNIQUE (complaint_number);


--
-- Name: supervisory_complaints supervisory_complaints_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_complaints
    ADD CONSTRAINT supervisory_complaints_pkey PRIMARY KEY (id);


--
-- Name: supervisory_executive_monitoring supervisory_executive_monitoring_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_executive_monitoring
    ADD CONSTRAINT supervisory_executive_monitoring_pkey PRIMARY KEY (id);


--
-- Name: supervisory_executive_monitoring supervisory_executive_monitoring_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_executive_monitoring
    ADD CONSTRAINT supervisory_executive_monitoring_reference_key UNIQUE (reference);


--
-- Name: supervisory_followups supervisory_followups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_followups
    ADD CONSTRAINT supervisory_followups_pkey PRIMARY KEY (id);


--
-- Name: supervisory_followups supervisory_followups_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_followups
    ADD CONSTRAINT supervisory_followups_reference_key UNIQUE (reference);


--
-- Name: supervisory_kpis supervisory_kpis_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_kpis
    ADD CONSTRAINT supervisory_kpis_pkey PRIMARY KEY (id);


--
-- Name: supervisory_kpis supervisory_kpis_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_kpis
    ADD CONSTRAINT supervisory_kpis_reference_key UNIQUE (reference);


--
-- Name: supervisory_projects supervisory_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_projects
    ADD CONSTRAINT supervisory_projects_pkey PRIMARY KEY (id);


--
-- Name: supervisory_projects supervisory_projects_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_projects
    ADD CONSTRAINT supervisory_projects_reference_key UNIQUE (reference);


--
-- Name: supervisory_recommendations supervisory_recommendations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_recommendations
    ADD CONSTRAINT supervisory_recommendations_pkey PRIMARY KEY (id);


--
-- Name: supervisory_recommendations supervisory_recommendations_recommendation_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_recommendations
    ADD CONSTRAINT supervisory_recommendations_recommendation_number_key UNIQUE (recommendation_number);


--
-- Name: supervisory_resolutions supervisory_resolutions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_resolutions
    ADD CONSTRAINT supervisory_resolutions_pkey PRIMARY KEY (id);


--
-- Name: supervisory_resolutions supervisory_resolutions_resolution_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_resolutions
    ADD CONSTRAINT supervisory_resolutions_resolution_number_key UNIQUE (resolution_number);


--
-- Name: supervisory_scorecards supervisory_scorecards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_scorecards
    ADD CONSTRAINT supervisory_scorecards_pkey PRIMARY KEY (id);


--
-- Name: supervisory_scorecards supervisory_scorecards_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_scorecards
    ADD CONSTRAINT supervisory_scorecards_reference_key UNIQUE (reference);


--
-- Name: supervisory_site_visits supervisory_site_visits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_site_visits
    ADD CONSTRAINT supervisory_site_visits_pkey PRIMARY KEY (id);


--
-- Name: supervisory_site_visits supervisory_site_visits_visit_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_site_visits
    ADD CONSTRAINT supervisory_site_visits_visit_number_key UNIQUE (visit_number);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_reference_key UNIQUE (reference);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: welfare_activities welfare_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.welfare_activities
    ADD CONSTRAINT welfare_activities_pkey PRIMARY KEY (id);


--
-- Name: welfare_activities welfare_activities_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.welfare_activities
    ADD CONSTRAINT welfare_activities_reference_key UNIQUE (reference);


--
-- Name: welfare_committee_meetings welfare_committee_meetings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.welfare_committee_meetings
    ADD CONSTRAINT welfare_committee_meetings_pkey PRIMARY KEY (id);


--
-- Name: welfare_committee_meetings welfare_committee_meetings_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.welfare_committee_meetings
    ADD CONSTRAINT welfare_committee_meetings_reference_key UNIQUE (reference);


--
-- Name: welfare_contributions welfare_contributions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.welfare_contributions
    ADD CONSTRAINT welfare_contributions_pkey PRIMARY KEY (id);


--
-- Name: welfare_contributions welfare_contributions_receipt_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.welfare_contributions
    ADD CONSTRAINT welfare_contributions_receipt_number_key UNIQUE (receipt_number);


--
-- Name: welfare_contributions welfare_contributions_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.welfare_contributions
    ADD CONSTRAINT welfare_contributions_reference_key UNIQUE (reference);


--
-- Name: welfare_payments welfare_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.welfare_payments
    ADD CONSTRAINT welfare_payments_pkey PRIMARY KEY (id);


--
-- Name: welfare_payments welfare_payments_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.welfare_payments
    ADD CONSTRAINT welfare_payments_reference_key UNIQUE (reference);


--
-- Name: welfare_requests welfare_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.welfare_requests
    ADD CONSTRAINT welfare_requests_pkey PRIMARY KEY (id);


--
-- Name: welfare_requests welfare_requests_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.welfare_requests
    ADD CONSTRAINT welfare_requests_reference_key UNIQUE (reference);


--
-- Name: withdrawals withdrawals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_pkey PRIMARY KEY (id);


--
-- Name: withdrawals withdrawals_reference_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_reference_key UNIQUE (reference);


--
-- Name: idx_audit_compliance_department; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_compliance_department ON public.audit_compliance USING btree (department_id, status);


--
-- Name: idx_audit_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_created ON public.audit_logs USING btree (created_at DESC);


--
-- Name: idx_audit_findings_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_findings_status ON public.audit_findings USING btree (status, risk_level, due_date);


--
-- Name: idx_audit_fraud_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_fraud_status ON public.audit_fraud_alerts USING btree (status, risk_score DESC);


--
-- Name: idx_audit_investigations_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_investigations_status ON public.audit_investigations USING btree (status, priority);


--
-- Name: idx_audit_logs_entity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_entity ON public.audit_logs USING btree (entity_type, entity_id, created_at DESC);


--
-- Name: idx_audit_plans_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_plans_status ON public.audit_plans USING btree (status, planned_date);


--
-- Name: idx_audit_recommendations_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_recommendations_status ON public.audit_recommendations USING btree (status, due_date);


--
-- Name: idx_audit_risks_level; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_risks_level ON public.audit_risks USING btree (risk_level, status);


--
-- Name: idx_conversation_members_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conversation_members_user ON public.conversation_members USING btree (user_id, conversation_id);


--
-- Name: idx_conversations_recent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conversations_recent ON public.conversations USING btree (last_message_at DESC);


--
-- Name: idx_department_activities_department; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_department_activities_department ON public.department_activities USING btree (department_id, status, created_at DESC);


--
-- Name: idx_department_activities_executive_history; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_department_activities_executive_history ON public.department_activities USING btree (activity_type, status, decision_at DESC) WHERE (activity_type = ANY (ARRAY['finance-budget'::text, 'finance-payment'::text, 'investment-proposal'::text, 'welfare-request'::text, 'legal-contract'::text, 'large-loan'::text, 'policy'::text]));


--
-- Name: idx_department_assignments_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_department_assignments_user ON public.department_assignments USING btree (user_id, active);


--
-- Name: idx_document_versions_document; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_document_versions_document ON public.organization_document_versions USING btree (document_id, created_at DESC);


--
-- Name: idx_finance_entries_account; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_finance_entries_account ON public.organization_finance_entries USING btree (finance_account_id, transaction_date DESC);


--
-- Name: idx_financial_lines_period_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_financial_lines_period_type ON public.financial_statement_lines USING btree (period_id, statement_type, sort_order);


--
-- Name: idx_governance_appointments_body; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_governance_appointments_body ON public.governance_appointments USING btree (body_id, status, position_title);


--
-- Name: idx_governance_records_department; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_governance_records_department ON public.governance_records USING btree (department_id, status);


--
-- Name: idx_historical_investment_period_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_historical_investment_period_date ON public.historical_investment_ledger USING btree (period_id, transaction_date);


--
-- Name: idx_investment_contract_legal; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_investment_contract_legal ON public.investment_contracts USING btree (legal_contract_id) WHERE (legal_contract_id IS NOT NULL);


--
-- Name: idx_investment_project_oversight_project; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_investment_project_oversight_project ON public.investment_project_oversight USING btree (project_id, created_at DESC);


--
-- Name: idx_investment_projects_proposal; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_investment_projects_proposal ON public.investment_projects USING btree (proposal_id) WHERE (proposal_id IS NOT NULL);


--
-- Name: idx_investment_transactions_project_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_investment_transactions_project_date ON public.investment_transactions USING btree (project_id, transaction_date);


--
-- Name: idx_legacy_member_balances_period; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_legacy_member_balances_period ON public.legacy_member_opening_balances USING btree (period_id, member_name);


--
-- Name: idx_legal_cases_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_legal_cases_status ON public.legal_cases USING btree (status, risk_level);


--
-- Name: idx_legal_complaints_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_legal_complaints_status ON public.legal_complaints USING btree (status, created_at DESC);


--
-- Name: idx_legal_compliance_department; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_legal_compliance_department ON public.legal_compliance USING btree (department_id, status);


--
-- Name: idx_legal_contracts_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_legal_contracts_status ON public.legal_contracts USING btree (status, ends_on);


--
-- Name: idx_loan_charges_loan_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_loan_charges_loan_status ON public.loan_charges USING btree (loan_id, status);


--
-- Name: idx_loan_charges_monthly_penalty; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_loan_charges_monthly_penalty ON public.loan_charges USING btree (loan_id, schedule_id, penalty_period, charge_type) WHERE ((charge_type = 'Late payment penalty'::text) AND (schedule_id IS NOT NULL) AND (penalty_period IS NOT NULL));


--
-- Name: idx_loan_events_loan; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_loan_events_loan ON public.loan_workflow_events USING btree (loan_id, created_at);


--
-- Name: idx_loan_guarantors_member; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_loan_guarantors_member ON public.loan_guarantors USING btree (member_id, status);


--
-- Name: idx_loan_recovery_actions_loan; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_loan_recovery_actions_loan ON public.loan_recovery_actions USING btree (loan_id, created_at);


--
-- Name: idx_loans_member; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_loans_member ON public.loans USING btree (member_id);


--
-- Name: idx_member_bio_location; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_member_bio_location ON public.member_bio_data USING btree (home_district, subcounty, village);


--
-- Name: idx_member_bio_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_member_bio_status ON public.member_bio_data USING btree (bio_status);


--
-- Name: idx_member_department_member; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_member_department_member ON public.member_department_profiles USING btree (member_id);


--
-- Name: idx_member_family_records_member; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_member_family_records_member ON public.member_family_records USING btree (member_id, relationship, active);


--
-- Name: idx_member_fy_policy_dates; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_member_fy_policy_dates ON public.member_financial_year_policies USING btree (starts_on, ends_on, status);


--
-- Name: idx_member_investment_finance; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_member_investment_finance ON public.member_investment_applications USING btree (finance_entry_id) WHERE (finance_entry_id IS NOT NULL);


--
-- Name: idx_member_investment_member; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_member_investment_member ON public.member_investment_applications USING btree (member_id, created_at DESC);


--
-- Name: idx_member_investment_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_member_investment_status ON public.member_investment_applications USING btree (status, created_at DESC);


--
-- Name: idx_member_support_member; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_member_support_member ON public.member_support_requests USING btree (member_id, created_at DESC);


--
-- Name: idx_members_current; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_members_current ON public.members USING btree (status, deleted_at);


--
-- Name: idx_members_provisional; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_members_provisional ON public.members USING btree (provisional, status) WHERE (provisional = true);


--
-- Name: idx_membership_status_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_membership_status_name ON public.membership_status_records USING btree (member_name, status);


--
-- Name: idx_message_attachments_message; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_message_attachments_message ON public.message_attachments USING btree (message_id);


--
-- Name: idx_message_reads_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_message_reads_user ON public.message_reads USING btree (user_id, message_id);


--
-- Name: idx_message_stars_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_message_stars_user ON public.message_stars USING btree (user_id, message_id);


--
-- Name: idx_messages_conversation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_conversation ON public.messages USING btree (conversation_id, created_at);


--
-- Name: idx_messages_search; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_search ON public.messages USING gin (to_tsvector('english'::regconfig, body));


--
-- Name: idx_messages_unread; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_unread ON public.messages USING btree (conversation_id, read_at) WHERE (read_at IS NULL);


--
-- Name: idx_notifications_user_unread; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_unread ON public.notifications USING btree (user_id, read_at, created_at DESC);


--
-- Name: idx_org_finance_receipt; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_org_finance_receipt ON public.organization_finance_entries USING btree (receipt_number) WHERE (receipt_number IS NOT NULL);


--
-- Name: idx_org_finance_voucher; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_org_finance_voucher ON public.organization_finance_entries USING btree (voucher_number) WHERE (voucher_number IS NOT NULL);


--
-- Name: idx_organization_documents_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_organization_documents_type ON public.organization_documents USING btree (document_type, updated_at DESC);


--
-- Name: idx_repayment_schedule_due; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_repayment_schedule_due ON public.loan_repayment_schedule USING btree (loan_id, due_date);


--
-- Name: idx_supervisory_complaints_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_supervisory_complaints_status ON public.supervisory_complaints USING btree (status, created_at DESC);


--
-- Name: idx_supervisory_followups_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_supervisory_followups_status ON public.supervisory_followups USING btree (status, deadline);


--
-- Name: idx_supervisory_kpis_period; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_supervisory_kpis_period ON public.supervisory_kpis USING btree (review_period, status);


--
-- Name: idx_supervisory_projects_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_supervisory_projects_status ON public.supervisory_projects USING btree (status, risk_level);


--
-- Name: idx_supervisory_recommendations_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_supervisory_recommendations_status ON public.supervisory_recommendations USING btree (status, due_date);


--
-- Name: idx_supervisory_resolutions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_supervisory_resolutions_status ON public.supervisory_resolutions USING btree (status, due_date);


--
-- Name: idx_supervisory_scorecards_department; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_supervisory_scorecards_department ON public.supervisory_scorecards USING btree (department_id, review_period);


--
-- Name: idx_supervisory_visits_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_supervisory_visits_date ON public.supervisory_site_visits USING btree (visit_date DESC);


--
-- Name: idx_transactions_finance_entry; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_transactions_finance_entry ON public.transactions USING btree (finance_entry_id) WHERE (finance_entry_id IS NOT NULL);


--
-- Name: idx_transactions_loan; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transactions_loan ON public.transactions USING btree (loan_id);


--
-- Name: idx_transactions_member; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transactions_member ON public.transactions USING btree (member_id);


--
-- Name: idx_transactions_member_target_fy; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transactions_member_target_fy ON public.transactions USING btree (member_id, target_fiscal_year, type, status);


--
-- Name: idx_transactions_pending_source; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_transactions_pending_source ON public.transactions USING btree (status, submission_source, created_at DESC);


--
-- Name: idx_transactions_receipt_number; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_transactions_receipt_number ON public.transactions USING btree (receipt_number) WHERE (receipt_number IS NOT NULL);


--
-- Name: idx_welfare_contributions_member_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_welfare_contributions_member_date ON public.welfare_contributions USING btree (member_id, contribution_date);


--
-- Name: uq_members_legacy_opening_balance; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_members_legacy_opening_balance ON public.members USING btree (legacy_opening_balance_id) WHERE (legacy_opening_balance_id IS NOT NULL);


--
-- Name: announcements announcements_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: audit_compliance audit_compliance_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_compliance
    ADD CONSTRAINT audit_compliance_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: audit_compliance audit_compliance_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_compliance
    ADD CONSTRAINT audit_compliance_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id);


--
-- Name: audit_findings audit_findings_audit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_findings
    ADD CONSTRAINT audit_findings_audit_id_fkey FOREIGN KEY (audit_id) REFERENCES public.audit_plans(id);


--
-- Name: audit_findings audit_findings_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_findings
    ADD CONSTRAINT audit_findings_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: audit_findings audit_findings_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_findings
    ADD CONSTRAINT audit_findings_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: audit_findings audit_findings_responsible_department_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_findings
    ADD CONSTRAINT audit_findings_responsible_department_fkey FOREIGN KEY (responsible_department) REFERENCES public.departments(id);


--
-- Name: audit_fraud_alerts audit_fraud_alerts_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_fraud_alerts
    ADD CONSTRAINT audit_fraud_alerts_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: audit_fraud_alerts audit_fraud_alerts_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_fraud_alerts
    ADD CONSTRAINT audit_fraud_alerts_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id);


--
-- Name: audit_investigations audit_investigations_authorized_closed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_investigations
    ADD CONSTRAINT audit_investigations_authorized_closed_by_fkey FOREIGN KEY (authorized_closed_by) REFERENCES public.users(id);


--
-- Name: audit_investigations audit_investigations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_investigations
    ADD CONSTRAINT audit_investigations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: audit_plans audit_plans_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_plans
    ADD CONSTRAINT audit_plans_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: audit_plans audit_plans_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_plans
    ADD CONSTRAINT audit_plans_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: audit_plans audit_plans_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_plans
    ADD CONSTRAINT audit_plans_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: audit_recommendations audit_recommendations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_recommendations
    ADD CONSTRAINT audit_recommendations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: audit_recommendations audit_recommendations_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_recommendations
    ADD CONSTRAINT audit_recommendations_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: audit_recommendations audit_recommendations_finding_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_recommendations
    ADD CONSTRAINT audit_recommendations_finding_id_fkey FOREIGN KEY (finding_id) REFERENCES public.audit_findings(id);


--
-- Name: audit_recommendations audit_recommendations_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_recommendations
    ADD CONSTRAINT audit_recommendations_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.users(id);


--
-- Name: audit_risks audit_risks_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_risks
    ADD CONSTRAINT audit_risks_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: audit_risks audit_risks_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_risks
    ADD CONSTRAINT audit_risks_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: conversation_members conversation_members_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_members
    ADD CONSTRAINT conversation_members_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- Name: conversation_members conversation_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_members
    ADD CONSTRAINT conversation_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: conversations conversations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: conversations conversations_user_high_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_user_high_fkey FOREIGN KEY (user_high) REFERENCES public.users(id);


--
-- Name: conversations conversations_user_low_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_user_low_fkey FOREIGN KEY (user_low) REFERENCES public.users(id);


--
-- Name: department_activities department_activities_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department_activities
    ADD CONSTRAINT department_activities_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: department_activities department_activities_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department_activities
    ADD CONSTRAINT department_activities_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: department_activities department_activities_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department_activities
    ADD CONSTRAINT department_activities_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: department_activities department_activities_decision_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department_activities
    ADD CONSTRAINT department_activities_decision_by_fkey FOREIGN KEY (decision_by) REFERENCES public.users(id);


--
-- Name: department_activities department_activities_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department_activities
    ADD CONSTRAINT department_activities_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: department_assignments department_assignments_assigned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department_assignments
    ADD CONSTRAINT department_assignments_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id);


--
-- Name: department_assignments department_assignments_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department_assignments
    ADD CONSTRAINT department_assignments_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: department_assignments department_assignments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.department_assignments
    ADD CONSTRAINT department_assignments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: departments departments_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id);


--
-- Name: finance_accounts finance_accounts_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_accounts
    ADD CONSTRAINT finance_accounts_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: finance_assets finance_assets_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_assets
    ADD CONSTRAINT finance_assets_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: finance_assets finance_assets_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_assets
    ADD CONSTRAINT finance_assets_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: finance_budgets finance_budgets_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_budgets
    ADD CONSTRAINT finance_budgets_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: finance_budgets finance_budgets_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_budgets
    ADD CONSTRAINT finance_budgets_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: finance_budgets finance_budgets_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_budgets
    ADD CONSTRAINT finance_budgets_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: finance_budgets finance_budgets_executive_activity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_budgets
    ADD CONSTRAINT finance_budgets_executive_activity_id_fkey FOREIGN KEY (executive_activity_id) REFERENCES public.department_activities(id);


--
-- Name: finance_invoices finance_invoices_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_invoices
    ADD CONSTRAINT finance_invoices_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: finance_invoices finance_invoices_voucher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_invoices
    ADD CONSTRAINT finance_invoices_voucher_id_fkey FOREIGN KEY (voucher_id) REFERENCES public.finance_payment_vouchers(id);


--
-- Name: finance_payment_vouchers finance_payment_vouchers_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_payment_vouchers
    ADD CONSTRAINT finance_payment_vouchers_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: finance_payment_vouchers finance_payment_vouchers_executive_activity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_payment_vouchers
    ADD CONSTRAINT finance_payment_vouchers_executive_activity_id_fkey FOREIGN KEY (executive_activity_id) REFERENCES public.department_activities(id);


--
-- Name: finance_payment_vouchers finance_payment_vouchers_executive_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_payment_vouchers
    ADD CONSTRAINT finance_payment_vouchers_executive_approved_by_fkey FOREIGN KEY (executive_approved_by) REFERENCES public.users(id);


--
-- Name: finance_payment_vouchers finance_payment_vouchers_finance_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_payment_vouchers
    ADD CONSTRAINT finance_payment_vouchers_finance_reviewed_by_fkey FOREIGN KEY (finance_reviewed_by) REFERENCES public.users(id);


--
-- Name: finance_payment_vouchers finance_payment_vouchers_processed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_payment_vouchers
    ADD CONSTRAINT finance_payment_vouchers_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES public.users(id);


--
-- Name: finance_payment_vouchers finance_payment_vouchers_requested_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_payment_vouchers
    ADD CONSTRAINT finance_payment_vouchers_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES public.users(id);


--
-- Name: finance_procurements finance_procurements_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_procurements
    ADD CONSTRAINT finance_procurements_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: finance_procurements finance_procurements_executive_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_procurements
    ADD CONSTRAINT finance_procurements_executive_approved_by_fkey FOREIGN KEY (executive_approved_by) REFERENCES public.users(id);


--
-- Name: finance_procurements finance_procurements_finance_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_procurements
    ADD CONSTRAINT finance_procurements_finance_reviewed_by_fkey FOREIGN KEY (finance_reviewed_by) REFERENCES public.users(id);


--
-- Name: finance_procurements finance_procurements_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_procurements
    ADD CONSTRAINT finance_procurements_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.finance_invoices(id);


--
-- Name: finance_procurements finance_procurements_requested_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_procurements
    ADD CONSTRAINT finance_procurements_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES public.users(id);


--
-- Name: finance_procurements finance_procurements_voucher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.finance_procurements
    ADD CONSTRAINT finance_procurements_voucher_id_fkey FOREIGN KEY (voucher_id) REFERENCES public.finance_payment_vouchers(id);


--
-- Name: financial_statement_lines financial_statement_lines_period_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_statement_lines
    ADD CONSTRAINT financial_statement_lines_period_id_fkey FOREIGN KEY (period_id) REFERENCES public.financial_reporting_periods(id) ON DELETE CASCADE;


--
-- Name: governance_appointments governance_appointments_body_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.governance_appointments
    ADD CONSTRAINT governance_appointments_body_id_fkey FOREIGN KEY (body_id) REFERENCES public.governance_bodies(id) ON DELETE CASCADE;


--
-- Name: governance_appointments governance_appointments_legacy_balance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.governance_appointments
    ADD CONSTRAINT governance_appointments_legacy_balance_id_fkey FOREIGN KEY (legacy_balance_id) REFERENCES public.legacy_member_opening_balances(id);


--
-- Name: governance_appointments governance_appointments_linked_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.governance_appointments
    ADD CONSTRAINT governance_appointments_linked_member_id_fkey FOREIGN KEY (linked_member_id) REFERENCES public.members(id);


--
-- Name: governance_appointments governance_appointments_source_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.governance_appointments
    ADD CONSTRAINT governance_appointments_source_document_id_fkey FOREIGN KEY (source_document_id) REFERENCES public.organization_documents(id);


--
-- Name: governance_directives governance_directives_source_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.governance_directives
    ADD CONSTRAINT governance_directives_source_document_id_fkey FOREIGN KEY (source_document_id) REFERENCES public.organization_documents(id);


--
-- Name: governance_records governance_records_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.governance_records
    ADD CONSTRAINT governance_records_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: governance_records governance_records_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.governance_records
    ADD CONSTRAINT governance_records_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: governance_records governance_records_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.governance_records
    ADD CONSTRAINT governance_records_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: governance_records governance_records_resolved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.governance_records
    ADD CONSTRAINT governance_records_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES public.users(id);


--
-- Name: historical_investment_ledger historical_investment_ledger_period_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.historical_investment_ledger
    ADD CONSTRAINT historical_investment_ledger_period_id_fkey FOREIGN KEY (period_id) REFERENCES public.financial_reporting_periods(id) ON DELETE CASCADE;


--
-- Name: investment_assets investment_assets_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_assets
    ADD CONSTRAINT investment_assets_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: investment_assets investment_assets_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_assets
    ADD CONSTRAINT investment_assets_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.investment_projects(id);


--
-- Name: investment_contracts investment_contracts_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_contracts
    ADD CONSTRAINT investment_contracts_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: investment_contracts investment_contracts_legal_contract_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_contracts
    ADD CONSTRAINT investment_contracts_legal_contract_id_fkey FOREIGN KEY (legal_contract_id) REFERENCES public.legal_contracts(id);


--
-- Name: investment_contracts investment_contracts_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_contracts
    ADD CONSTRAINT investment_contracts_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.investment_projects(id);


--
-- Name: investment_fund_accounts investment_fund_accounts_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_fund_accounts
    ADD CONSTRAINT investment_fund_accounts_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: investment_investors investment_investors_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_investors
    ADD CONSTRAINT investment_investors_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: investment_investors investment_investors_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_investors
    ADD CONSTRAINT investment_investors_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id);


--
-- Name: investment_investors investment_investors_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_investors
    ADD CONSTRAINT investment_investors_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.investment_projects(id);


--
-- Name: investment_project_oversight investment_project_oversight_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_project_oversight
    ADD CONSTRAINT investment_project_oversight_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: investment_project_oversight investment_project_oversight_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_project_oversight
    ADD CONSTRAINT investment_project_oversight_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.investment_projects(id);


--
-- Name: investment_project_oversight investment_project_oversight_target_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_project_oversight
    ADD CONSTRAINT investment_project_oversight_target_department_id_fkey FOREIGN KEY (target_department_id) REFERENCES public.departments(id);


--
-- Name: investment_projects investment_projects_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_projects
    ADD CONSTRAINT investment_projects_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: investment_projects investment_projects_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_projects
    ADD CONSTRAINT investment_projects_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: investment_projects investment_projects_proposal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_projects
    ADD CONSTRAINT investment_projects_proposal_id_fkey FOREIGN KEY (proposal_id) REFERENCES public.investment_proposals(id);


--
-- Name: investment_proposals investment_proposals_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_proposals
    ADD CONSTRAINT investment_proposals_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: investment_proposals investment_proposals_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_proposals
    ADD CONSTRAINT investment_proposals_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: investment_proposals investment_proposals_executive_activity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_proposals
    ADD CONSTRAINT investment_proposals_executive_activity_id_fkey FOREIGN KEY (executive_activity_id) REFERENCES public.department_activities(id);


--
-- Name: investment_proposals investment_proposals_finance_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_proposals
    ADD CONSTRAINT investment_proposals_finance_reviewed_by_fkey FOREIGN KEY (finance_reviewed_by) REFERENCES public.users(id);


--
-- Name: investment_proposals investment_proposals_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_proposals
    ADD CONSTRAINT investment_proposals_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id);


--
-- Name: investment_transactions investment_transactions_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_transactions
    ADD CONSTRAINT investment_transactions_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- Name: investment_transactions investment_transactions_finance_entry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_transactions
    ADD CONSTRAINT investment_transactions_finance_entry_id_fkey FOREIGN KEY (finance_entry_id) REFERENCES public.organization_finance_entries(id);


--
-- Name: investment_transactions investment_transactions_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_transactions
    ADD CONSTRAINT investment_transactions_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.investment_projects(id);


--
-- Name: investment_transactions investment_transactions_recorded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.investment_transactions
    ADD CONSTRAINT investment_transactions_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES public.users(id);


--
-- Name: leadership_assignments leadership_assignments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leadership_assignments
    ADD CONSTRAINT leadership_assignments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: legacy_member_opening_balances legacy_member_opening_balances_linked_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legacy_member_opening_balances
    ADD CONSTRAINT legacy_member_opening_balances_linked_member_id_fkey FOREIGN KEY (linked_member_id) REFERENCES public.members(id);


--
-- Name: legacy_member_opening_balances legacy_member_opening_balances_period_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legacy_member_opening_balances
    ADD CONSTRAINT legacy_member_opening_balances_period_id_fkey FOREIGN KEY (period_id) REFERENCES public.financial_reporting_periods(id) ON DELETE CASCADE;


--
-- Name: legal_cases legal_cases_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_cases
    ADD CONSTRAINT legal_cases_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: legal_cases legal_cases_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_cases
    ADD CONSTRAINT legal_cases_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: legal_cases legal_cases_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_cases
    ADD CONSTRAINT legal_cases_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id);


--
-- Name: legal_complaints legal_complaints_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_complaints
    ADD CONSTRAINT legal_complaints_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: legal_complaints legal_complaints_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_complaints
    ADD CONSTRAINT legal_complaints_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: legal_complaints legal_complaints_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_complaints
    ADD CONSTRAINT legal_complaints_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id);


--
-- Name: legal_compliance legal_compliance_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_compliance
    ADD CONSTRAINT legal_compliance_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: legal_compliance legal_compliance_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_compliance
    ADD CONSTRAINT legal_compliance_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: legal_contracts legal_contracts_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_contracts
    ADD CONSTRAINT legal_contracts_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: legal_contracts legal_contracts_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_contracts
    ADD CONSTRAINT legal_contracts_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: legal_contracts legal_contracts_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_contracts
    ADD CONSTRAINT legal_contracts_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: legal_court_matters legal_court_matters_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_court_matters
    ADD CONSTRAINT legal_court_matters_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.legal_cases(id);


--
-- Name: legal_court_matters legal_court_matters_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_court_matters
    ADD CONSTRAINT legal_court_matters_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: legal_opinions legal_opinions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_opinions
    ADD CONSTRAINT legal_opinions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: legal_opinions legal_opinions_requested_by_department_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_opinions
    ADD CONSTRAINT legal_opinions_requested_by_department_fkey FOREIGN KEY (requested_by_department) REFERENCES public.departments(id);


--
-- Name: legal_policies legal_policies_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_policies
    ADD CONSTRAINT legal_policies_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: legal_policies legal_policies_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legal_policies
    ADD CONSTRAINT legal_policies_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: loan_charges loan_charges_assessed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_charges
    ADD CONSTRAINT loan_charges_assessed_by_fkey FOREIGN KEY (assessed_by) REFERENCES public.users(id);


--
-- Name: loan_charges loan_charges_loan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_charges
    ADD CONSTRAINT loan_charges_loan_id_fkey FOREIGN KEY (loan_id) REFERENCES public.loans(id) ON DELETE CASCADE;


--
-- Name: loan_charges loan_charges_schedule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_charges
    ADD CONSTRAINT loan_charges_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES public.loan_repayment_schedule(id);


--
-- Name: loan_charges loan_charges_waived_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_charges
    ADD CONSTRAINT loan_charges_waived_by_fkey FOREIGN KEY (waived_by) REFERENCES public.users(id);


--
-- Name: loan_disbursements loan_disbursements_authorized_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_disbursements
    ADD CONSTRAINT loan_disbursements_authorized_by_fkey FOREIGN KEY (authorized_by) REFERENCES public.users(id);


--
-- Name: loan_disbursements loan_disbursements_disbursed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_disbursements
    ADD CONSTRAINT loan_disbursements_disbursed_by_fkey FOREIGN KEY (disbursed_by) REFERENCES public.users(id);


--
-- Name: loan_disbursements loan_disbursements_loan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_disbursements
    ADD CONSTRAINT loan_disbursements_loan_id_fkey FOREIGN KEY (loan_id) REFERENCES public.loans(id);


--
-- Name: loan_disbursements loan_disbursements_prepared_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_disbursements
    ADD CONSTRAINT loan_disbursements_prepared_by_fkey FOREIGN KEY (prepared_by) REFERENCES public.users(id);


--
-- Name: loan_guarantors loan_guarantors_loan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_guarantors
    ADD CONSTRAINT loan_guarantors_loan_id_fkey FOREIGN KEY (loan_id) REFERENCES public.loans(id) ON DELETE CASCADE;


--
-- Name: loan_guarantors loan_guarantors_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_guarantors
    ADD CONSTRAINT loan_guarantors_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id);


--
-- Name: loan_recovery_actions loan_recovery_actions_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_recovery_actions
    ADD CONSTRAINT loan_recovery_actions_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: loan_recovery_actions loan_recovery_actions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_recovery_actions
    ADD CONSTRAINT loan_recovery_actions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: loan_recovery_actions loan_recovery_actions_loan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_recovery_actions
    ADD CONSTRAINT loan_recovery_actions_loan_id_fkey FOREIGN KEY (loan_id) REFERENCES public.loans(id) ON DELETE CASCADE;


--
-- Name: loan_repayment_schedule loan_repayment_schedule_loan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_repayment_schedule
    ADD CONSTRAINT loan_repayment_schedule_loan_id_fkey FOREIGN KEY (loan_id) REFERENCES public.loans(id) ON DELETE CASCADE;


--
-- Name: loan_workflow_events loan_workflow_events_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_workflow_events
    ADD CONSTRAINT loan_workflow_events_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id);


--
-- Name: loan_workflow_events loan_workflow_events_loan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loan_workflow_events
    ADD CONSTRAINT loan_workflow_events_loan_id_fkey FOREIGN KEY (loan_id) REFERENCES public.loans(id) ON DELETE CASCADE;


--
-- Name: loans loans_accountant_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loans
    ADD CONSTRAINT loans_accountant_verified_by_fkey FOREIGN KEY (finance_verified_by) REFERENCES public.users(id);


--
-- Name: loans loans_authorized_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loans
    ADD CONSTRAINT loans_authorized_by_fkey FOREIGN KEY (authorized_by) REFERENCES public.users(id);


--
-- Name: loans loans_committee_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loans
    ADD CONSTRAINT loans_committee_approved_by_fkey FOREIGN KEY (committee_approved_by) REFERENCES public.users(id);


--
-- Name: loans loans_guarantor_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loans
    ADD CONSTRAINT loans_guarantor_member_id_fkey FOREIGN KEY (guarantor_member_id) REFERENCES public.members(id);


--
-- Name: loans loans_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loans
    ADD CONSTRAINT loans_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id);


--
-- Name: loans loans_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loans
    ADD CONSTRAINT loans_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.loan_products(id);


--
-- Name: loans loans_recommended_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loans
    ADD CONSTRAINT loans_recommended_by_fkey FOREIGN KEY (recommended_by) REFERENCES public.users(id);


--
-- Name: member_bio_data member_bio_data_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_bio_data
    ADD CONSTRAINT member_bio_data_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: member_bio_data member_bio_data_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_bio_data
    ADD CONSTRAINT member_bio_data_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE;


--
-- Name: member_bio_data member_bio_data_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_bio_data
    ADD CONSTRAINT member_bio_data_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.users(id);


--
-- Name: member_department_profiles member_department_profiles_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_department_profiles
    ADD CONSTRAINT member_department_profiles_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: member_department_profiles member_department_profiles_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_department_profiles
    ADD CONSTRAINT member_department_profiles_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE;


--
-- Name: member_family_records member_family_records_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_family_records
    ADD CONSTRAINT member_family_records_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE;


--
-- Name: member_family_records member_family_records_recorded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_family_records
    ADD CONSTRAINT member_family_records_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES public.users(id);


--
-- Name: member_investment_applications member_investment_applications_finance_entry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_investment_applications
    ADD CONSTRAINT member_investment_applications_finance_entry_id_fkey FOREIGN KEY (finance_entry_id) REFERENCES public.organization_finance_entries(id);


--
-- Name: member_investment_applications member_investment_applications_investor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_investment_applications
    ADD CONSTRAINT member_investment_applications_investor_id_fkey FOREIGN KEY (investor_id) REFERENCES public.investment_investors(id);


--
-- Name: member_investment_applications member_investment_applications_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_investment_applications
    ADD CONSTRAINT member_investment_applications_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id);


--
-- Name: member_investment_applications member_investment_applications_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_investment_applications
    ADD CONSTRAINT member_investment_applications_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.investment_projects(id);


--
-- Name: member_investment_applications member_investment_applications_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_investment_applications
    ADD CONSTRAINT member_investment_applications_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id);


--
-- Name: member_investment_applications member_investment_applications_submitted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_investment_applications
    ADD CONSTRAINT member_investment_applications_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES public.users(id);


--
-- Name: member_support_requests member_support_requests_assigned_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_support_requests
    ADD CONSTRAINT member_support_requests_assigned_department_id_fkey FOREIGN KEY (assigned_department_id) REFERENCES public.departments(id);


--
-- Name: member_support_requests member_support_requests_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member_support_requests
    ADD CONSTRAINT member_support_requests_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE;


--
-- Name: members members_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- Name: members members_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: members members_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- Name: members members_legacy_opening_balance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_legacy_opening_balance_id_fkey FOREIGN KEY (legacy_opening_balance_id) REFERENCES public.legacy_member_opening_balances(id);


--
-- Name: membership_status_records membership_status_records_legacy_balance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_status_records
    ADD CONSTRAINT membership_status_records_legacy_balance_id_fkey FOREIGN KEY (legacy_balance_id) REFERENCES public.legacy_member_opening_balances(id);


--
-- Name: membership_status_records membership_status_records_linked_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_status_records
    ADD CONSTRAINT membership_status_records_linked_member_id_fkey FOREIGN KEY (linked_member_id) REFERENCES public.members(id);


--
-- Name: membership_status_records membership_status_records_source_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_status_records
    ADD CONSTRAINT membership_status_records_source_document_id_fkey FOREIGN KEY (source_document_id) REFERENCES public.organization_documents(id);


--
-- Name: message_attachments message_attachments_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_attachments
    ADD CONSTRAINT message_attachments_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;


--
-- Name: message_attachments message_attachments_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_attachments
    ADD CONSTRAINT message_attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: message_mentions message_mentions_mentioned_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_mentions
    ADD CONSTRAINT message_mentions_mentioned_user_id_fkey FOREIGN KEY (mentioned_user_id) REFERENCES public.users(id);


--
-- Name: message_mentions message_mentions_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_mentions
    ADD CONSTRAINT message_mentions_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;


--
-- Name: message_reactions message_reactions_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_reactions
    ADD CONSTRAINT message_reactions_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;


--
-- Name: message_reactions message_reactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_reactions
    ADD CONSTRAINT message_reactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: message_reads message_reads_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_reads
    ADD CONSTRAINT message_reads_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;


--
-- Name: message_reads message_reads_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_reads
    ADD CONSTRAINT message_reads_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: message_stars message_stars_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_stars
    ADD CONSTRAINT message_stars_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;


--
-- Name: message_stars message_stars_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_stars
    ADD CONSTRAINT message_stars_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id);


--
-- Name: messages messages_forwarded_from_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_forwarded_from_id_fkey FOREIGN KEY (forwarded_from_id) REFERENCES public.messages(id);


--
-- Name: messages messages_pinned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pinned_by_fkey FOREIGN KEY (pinned_by) REFERENCES public.users(id);


--
-- Name: messages messages_reply_to_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_reply_to_id_fkey FOREIGN KEY (reply_to_id) REFERENCES public.messages(id);


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- Name: notifications notifications_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: organization_document_versions organization_document_versions_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_document_versions
    ADD CONSTRAINT organization_document_versions_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.organization_documents(id) ON DELETE CASCADE;


--
-- Name: organization_document_versions organization_document_versions_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_document_versions
    ADD CONSTRAINT organization_document_versions_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: organization_documents organization_documents_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_documents
    ADD CONSTRAINT organization_documents_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: organization_documents organization_documents_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_documents
    ADD CONSTRAINT organization_documents_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: organization_documents organization_documents_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_documents
    ADD CONSTRAINT organization_documents_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: organization_finance_entries organization_finance_entries_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_finance_entries
    ADD CONSTRAINT organization_finance_entries_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: organization_finance_entries organization_finance_entries_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_finance_entries
    ADD CONSTRAINT organization_finance_entries_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: organization_finance_entries organization_finance_entries_finance_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_finance_entries
    ADD CONSTRAINT organization_finance_entries_finance_account_id_fkey FOREIGN KEY (finance_account_id) REFERENCES public.finance_accounts(id);


--
-- Name: organization_finance_entries organization_finance_entries_recorded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_finance_entries
    ADD CONSTRAINT organization_finance_entries_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES public.users(id);


--
-- Name: organization_meetings organization_meetings_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_meetings
    ADD CONSTRAINT organization_meetings_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: organization_meetings organization_meetings_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_meetings
    ADD CONSTRAINT organization_meetings_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: settings settings_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: supervisory_committees supervisory_committees_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_committees
    ADD CONSTRAINT supervisory_committees_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: supervisory_complaints supervisory_complaints_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_complaints
    ADD CONSTRAINT supervisory_complaints_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: supervisory_complaints supervisory_complaints_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_complaints
    ADD CONSTRAINT supervisory_complaints_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: supervisory_executive_monitoring supervisory_executive_monitoring_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_executive_monitoring
    ADD CONSTRAINT supervisory_executive_monitoring_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: supervisory_followups supervisory_followups_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_followups
    ADD CONSTRAINT supervisory_followups_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: supervisory_followups supervisory_followups_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_followups
    ADD CONSTRAINT supervisory_followups_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: supervisory_kpis supervisory_kpis_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_kpis
    ADD CONSTRAINT supervisory_kpis_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: supervisory_projects supervisory_projects_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_projects
    ADD CONSTRAINT supervisory_projects_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: supervisory_projects supervisory_projects_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_projects
    ADD CONSTRAINT supervisory_projects_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: supervisory_recommendations supervisory_recommendations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_recommendations
    ADD CONSTRAINT supervisory_recommendations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: supervisory_recommendations supervisory_recommendations_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_recommendations
    ADD CONSTRAINT supervisory_recommendations_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: supervisory_recommendations supervisory_recommendations_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_recommendations
    ADD CONSTRAINT supervisory_recommendations_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.users(id);


--
-- Name: supervisory_resolutions supervisory_resolutions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_resolutions
    ADD CONSTRAINT supervisory_resolutions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: supervisory_resolutions supervisory_resolutions_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_resolutions
    ADD CONSTRAINT supervisory_resolutions_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: supervisory_scorecards supervisory_scorecards_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_scorecards
    ADD CONSTRAINT supervisory_scorecards_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: supervisory_scorecards supervisory_scorecards_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_scorecards
    ADD CONSTRAINT supervisory_scorecards_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id);


--
-- Name: supervisory_site_visits supervisory_site_visits_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_site_visits
    ADD CONSTRAINT supervisory_site_visits_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: supervisory_site_visits supervisory_site_visits_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_site_visits
    ADD CONSTRAINT supervisory_site_visits_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: supervisory_site_visits supervisory_site_visits_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supervisory_site_visits
    ADD CONSTRAINT supervisory_site_visits_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.supervisory_projects(id);


--
-- Name: transactions transactions_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: transactions transactions_finance_entry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_finance_entry_id_fkey FOREIGN KEY (finance_entry_id) REFERENCES public.organization_finance_entries(id);


--
-- Name: transactions transactions_loan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_loan_id_fkey FOREIGN KEY (loan_id) REFERENCES public.loans(id);


--
-- Name: transactions transactions_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id);


--
-- Name: transactions transactions_recorded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES public.users(id);


--
-- Name: transactions transactions_reversal_of_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_reversal_of_fkey FOREIGN KEY (reversal_of) REFERENCES public.transactions(id);


--
-- Name: transactions transactions_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.users(id);


--
-- Name: users users_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- Name: users users_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: users users_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id);


--
-- Name: welfare_activities welfare_activities_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.welfare_activities
    ADD CONSTRAINT welfare_activities_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: welfare_committee_meetings welfare_committee_meetings_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.welfare_committee_meetings
    ADD CONSTRAINT welfare_committee_meetings_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: welfare_contributions welfare_contributions_finance_entry_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.welfare_contributions
    ADD CONSTRAINT welfare_contributions_finance_entry_id_fkey FOREIGN KEY (finance_entry_id) REFERENCES public.organization_finance_entries(id);


--
-- Name: welfare_contributions welfare_contributions_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.welfare_contributions
    ADD CONSTRAINT welfare_contributions_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id);


--
-- Name: welfare_contributions welfare_contributions_recorded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.welfare_contributions
    ADD CONSTRAINT welfare_contributions_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES public.users(id);


--
-- Name: welfare_contributions welfare_contributions_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.welfare_contributions
    ADD CONSTRAINT welfare_contributions_verified_by_fkey FOREIGN KEY (verified_by) REFERENCES public.users(id);


--
-- Name: welfare_payments welfare_payments_recorded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.welfare_payments
    ADD CONSTRAINT welfare_payments_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES public.users(id);


--
-- Name: welfare_payments welfare_payments_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.welfare_payments
    ADD CONSTRAINT welfare_payments_request_id_fkey FOREIGN KEY (request_id) REFERENCES public.welfare_requests(id);


--
-- Name: welfare_requests welfare_requests_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.welfare_requests
    ADD CONSTRAINT welfare_requests_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: welfare_requests welfare_requests_executive_activity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.welfare_requests
    ADD CONSTRAINT welfare_requests_executive_activity_id_fkey FOREIGN KEY (executive_activity_id) REFERENCES public.department_activities(id);


--
-- Name: welfare_requests welfare_requests_finance_voucher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.welfare_requests
    ADD CONSTRAINT welfare_requests_finance_voucher_id_fkey FOREIGN KEY (finance_voucher_id) REFERENCES public.finance_payment_vouchers(id);


--
-- Name: welfare_requests welfare_requests_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.welfare_requests
    ADD CONSTRAINT welfare_requests_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id);


--
-- Name: welfare_requests welfare_requests_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.welfare_requests
    ADD CONSTRAINT welfare_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id);


--
-- Name: welfare_requests welfare_requests_submitted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.welfare_requests
    ADD CONSTRAINT welfare_requests_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES public.users(id);


--
-- Name: withdrawals withdrawals_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id);


--
-- Name: withdrawals withdrawals_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id);


--
-- Name: withdrawals withdrawals_processed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES public.users(id);


--
-- Name: withdrawals withdrawals_requested_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES public.users(id);


--
-- Name: withdrawals withdrawals_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id);


--
-- PostgreSQL database dump complete
--


