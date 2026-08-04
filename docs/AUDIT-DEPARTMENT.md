# Audit Department

The Audit Department is implemented as an independent assurance workspace. It examines organizational records and controls but does not process or alter departmental operations.

## Test account

- Email: `auditor@tujenge.test`
- Department: Audit
- Position: Lead Internal Auditor
- Use the standard seeded test password supplied separately for local testing.

## Included dashboard

The landing page includes all twelve requested indicators:

- total audits conducted
- audits in progress
- pending audits
- open and resolved findings
- high-risk findings
- departments audited
- organization compliance score
- open and closed recommendations
- fraud alerts
- pending investigations

It also includes Audit overview, priority findings, departmental compliance, investigation tracking, recommendation tracking, enterprise risk, Audit calendar, and notification widgets.

## Included modules

- Audit Plans
- Audits
- Audit Findings
- Investigations
- Recommendations
- Compliance Monitoring
- Risk Management
- Fraud Detection
- Reports
- Analytics
- Documents
- Calendar
- Notifications
- Settings

## Permission boundary

Audit has create/edit authority over Audit-owned plans, evidence, findings, investigations, recommendations, risks, compliance reviews, and fraud-alert reviews.

Operational records from Finance, Credits, Investment, Welfare, Legal, Executive, and Supervisory are exposed to the Audit command center as read-only evidence. Audit cannot:

- edit Finance records
- change savings, loans, guarantors, or repayments
- approve payments or loans
- modify contracts
- delete operational records
- replace another department's decision

Every Audit workflow change is authenticated and traceable.
