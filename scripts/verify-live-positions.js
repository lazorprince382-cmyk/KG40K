#!/usr/bin/env node
"use strict";
/**
 * Fail loudly if Finance live company positions are incomplete.
 * Checks the same sources the UI reads (GL-4500, GL-4104, active loans).
 */
const { Pool } = require("pg");
const path = require("path");
const { requireDatabaseUrl } = require("./lib/load-database-url");

const projectRoot = path.resolve(__dirname, "..");
const databaseUrl = requireDatabaseUrl(projectRoot);

const CENTENARY_MIN = 8_000_000;
const UAP_MIN = 140_000_000;
const LOANS_MIN = 40_000_000;

async function main() {
  const pool = new Pool({
    connectionString: databaseUrl,
    max: 1,
    ssl:
      /railway|proxy|rlwy/i.test(databaseUrl) && !/127\.0\.0\.1|localhost/.test(databaseUrl)
        ? { rejectUnauthorized: false }
        : undefined,
  });

  try {
    const uap = (
      await pool.query(
        `SELECT balance::float AS balance, active
         FROM finance_accounts WHERE account_code='GL-4500' LIMIT 1`
      )
    ).rows[0];
    const bank = (
      await pool.query(
        `SELECT balance::float AS balance, active
         FROM finance_accounts WHERE account_code='GL-4104' LIMIT 1`
      )
    ).rows[0];
    const loans = Number(
      (
        await pool.query(
          `SELECT COALESCE(SUM(balance),0)::float AS total
           FROM loans WHERE status IN ('active','overdue')`
        )
      ).rows[0].total
    );
    const settingUap = Number(
      (await pool.query(`SELECT value FROM settings WHERE key='organizationUapBalance'`)).rows[0]?.value || 0
    );

    const uapBal = Number(uap?.balance || 0);
    const bankBal = Number(bank?.balance || 0);
    const company = uapBal + bankBal + loans;

    console.log("\n== Live positions verification (same as Finance UI) ==");
    console.log(`  At UAP (GL-4500):        UGX ${uapBal.toLocaleString()} active=${uap?.active !== false}`);
    console.log(`  Centenary (GL-4104):     UGX ${bankBal.toLocaleString()}`);
    console.log(`  Money in loans:          UGX ${loans.toLocaleString()}`);
    console.log(`  Total company funds:     UGX ${company.toLocaleString()}`);
    console.log(`  settings.organizationUapBalance: UGX ${settingUap.toLocaleString()}`);

    const problems = [];
    if (!uap) problems.push("GL-4500 (UAP) account missing — Unit Trust sync did not apply");
    else if (uap.active === false) problems.push("GL-4500 exists but active=false (UI reads active only)");
    else if (uapBal < UAP_MIN) problems.push(`UAP balance ${uapBal} is below expected ~140M+`);

    if (!bank) problems.push("GL-4104 (Centenary) account missing");
    else if (bankBal < CENTENARY_MIN) problems.push(`Centenary balance ${bankBal} is below expected ~8.35M`);

    if (loans < LOANS_MIN) problems.push(`Money in loans ${loans} is below expected ~45.5M`);

    if (problems.length) {
      console.error("\nVERIFY FAILED — Finance Live company positions are incomplete:");
      for (const p of problems) console.error(`  - ${p}`);
      console.error("\nRe-run after fixing DATABASE_URL:");
      console.error("  npm run db:sync-live-pack");
      console.error("Then restart: npm start");
      process.exit(1);
    }

    console.log("\nVERIFY OK — UAP, Centenary and loans match live targets.");
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
