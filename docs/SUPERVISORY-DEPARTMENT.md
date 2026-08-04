# Supervisory Department

The Supervisory workspace is the organization’s governance and performance command center. It monitors implementation and accountability without changing operational records owned by other departments.

## Included workspace

- Dashboard with 12 organization-level performance indicators.
- Scorecards for Executive, Finance, Credits, Investment, Welfare, Legal and Audit.
- Department follow-up tracker with ownership, deadlines, evidence and progress.
- Executive and committee performance monitoring.
- Project schedule, progress, risk and site-visit monitoring.
- Board and leadership resolution implementation tracker.
- Confidential complaints and escalation register.
- Recommendation acceptance, implementation and verification tracking.
- Organization KPI dashboard and performance analytics.
- Reports, documents, calendar, notifications, global search and settings.
- Quick actions for scorecards, follow-ups, resolutions, complaints, recommendations and site visits.

## Access boundary

Supervisory officers can create and update Supervisory assessments, findings, recommendations and follow-up records. Finance, Credits, Investment, Welfare, Legal and Audit source records are exposed only as read-only summaries. Supervisory cannot edit departmental operational transactions or approve them unless a separate organizational policy explicitly grants that authority.

## Workflow

1. Performance data is received.
2. The department, Executive body, committee or project is reviewed.
3. A Supervisory assessment is recorded.
4. Findings and recommendations are issued.
5. The responsible department responds.
6. A follow-up or site visit verifies implementation.
7. Evidence is recorded.
8. The matter is closed.

## Local review

Start the server with `npm start`, then open `http://localhost:3000`. Sign in with the seeded Supervisory test account supplied during development.

Automated validation:

```powershell
$env:SUPERVISORY_TEST_PASSWORD = "<test-password>"
node scripts/test-supervisory.js
```

The test verifies authentication, dashboard data, global search, record validation, static assets and read-only boundaries across operational departments.
