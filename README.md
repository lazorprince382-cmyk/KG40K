# Kasangati G40 Kwegatta Organization Management System

A Node.js and PostgreSQL organization platform with role- and department-controlled dashboards for Executive, Finance, Credits (SACCO), Investment, Welfare, Legal/Records, Audit, Supervisory, members, and system administrators.

Current account roles are limited to `Member`, the seven departmental officer roles, `Auditor`, `Supervisory Officer`, and `System Admin`. Historical Manager, Accountant, Cashier, Loans Officer, committee, and office-holder login roles are migrated into their responsible departments.

Legal/Records registers members, stores bio data and private passport photos, and creates standard linked user accounts. A linked user has one login: their department workspace includes a self-only Member Account tab, while users without an organization role receive the normal Member dashboard.

## Project structure

- `server.js` — stable application entrypoint.
- `src/` — backend runtime, APIs, middleware, services, and database access.
- `src/services/` — shared services such as genuine PDF and Excel-compatible report generation.
- `public/` — the only browser-accessible HTML, CSS, JavaScript, icons, and service worker.
- `database/migrations/` — ordered checksum-tracked PostgreSQL migrations.
- `database/seeds/` — development demonstration seed modules.
- `storage/uploads/` — private message and document files; downloads require authenticated routes.
- `scripts/` — seeding and regression tests.
- `docs/` — departmental notes and preview screenshots, excluded from the public web root.

## Local setup

1. Install Node.js and PostgreSQL.
2. Copy `.env.example` to `.env` and provide `DATABASE_URL` and a random `JWT_SECRET`.
3. Install exactly the locked dependencies:

   ```powershell
   npm ci
   ```

4. Start the application:

   ```powershell
   npm start
   ```

Database migrations apply automatically and are recorded in `schema_migrations`. Production startup never creates demonstration users or shared passwords.

## Optional development data

Demo data is explicit. Set a strong temporary password only in the current shell, run the seed, then clear it:

```powershell
$env:DEMO_PASSWORD='replace-with-a-strong-development-password'
npm run seed
Remove-Item Env:DEMO_PASSWORD
```

Never run the demo seed against production and never publish its password.

## Mobile testing on the same Wi-Fi

The server listens on `0.0.0.0`. Find the computer IPv4 address with `ipconfig`, then open `http://COMPUTER_IPV4:3000` on the phone. Allow Node.js through Windows Firewall only on private networks. Both devices must use the same network.

## Security controls

- Only `public/` is statically served. Source, SQL, seeds, dependencies, documentation, and stored uploads return 404.
- Session cookies are HTTP-only and SameSite Strict; production requires HTTPS and a strong JWT secret.
- Cross-site state-changing requests are rejected and security/CSP headers are applied.
- Password changes and resets revoke prior sessions.
- Department APIs enforce assignment and authority checks; Legal cannot access SACCO balances, loans, guarantors, or loan exports.
- Message attachments and organizational documents use authenticated downloads.
- Documents retain versions, SHA-256 checksums, uploader identity, and access audit events.
- Financial verification, voucher processing, disbursement, repayments, withdrawals, and handoffs use PostgreSQL transactions and row locks.
- Demo passwords are not embedded in the login page or documentation.

## Financial workflow safeguards

- Repayments allocate charges, then interest, then principal and retain each allocation.
- Withdrawals require separate approval and processing before savings are deducted.
- Finance budgets are submitted to Executive approval rather than self-approved.
- Investment contracts enter Legal review and high-value contracts continue to Executive approval.
- Welfare contributions and Investment revenue/expenses create pending Finance reconciliation entries.
- Hourly maintenance updates overdue loans/schedules, expired contracts, repayment reminders, and budget alerts.

## Validation

With the local server running and an explicitly seeded development password:

```powershell
$env:SECURITY_TEST_PASSWORD='your-development-seed-password'
npm test
npm run check
```

Additional API suites are available in `scripts/test-audit.js`, `scripts/test-supervisory.js`, and `scripts/test-legal-biodata.js`. UI suites require a Chromium debugging session as described inside those scripts.
`scripts/test-linked-member-account.js` verifies Legal registration, passport storage, department/member dual context, self-scoped exports, name editing, profile-photo lifecycle, and password changes using temporary test data that it removes afterward.

## Production checklist

- Set `NODE_ENV=production`, a unique 32+ character `JWT_SECRET`, and a least-privilege PostgreSQL account.
- Terminate TLS at a trusted reverse proxy and restrict database/network access.
- Keep `SEED_DEMO_DATA=false`; remove or deactivate demonstration records before launch.
- Back up PostgreSQL and `storage/uploads/` together with `powershell -File scripts/backup.ps1`; test restoration regularly.
- Place uploaded files on encrypted, backed-up storage and connect malware scanning before public rollout.
- Centralize structured logs, uptime/health monitoring (`GET /api/health`), alerting, and database backup verification.
- Run `npm ci`, `npm run check`, and the security/API regression suites in CI before deployment.