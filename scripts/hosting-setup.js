#!/usr/bin/env node
"use strict";
/**
 * One-shot hosting setup for the operator who imports / refreshes system data.
 *
 * 1) Imports database/dumps/system-hosting-data.dump (unless --skip-import)
 * 2) Applies live finance sync pack (unless --skip-sync)
 * 3) Verifies Finance Live company positions (UAP + Centenary + loans)
 *
 * Usage (PowerShell) — replace with REAL credentials, not USER/PASS/HOST:
 *   $env:DATABASE_URL="postgresql://postgres:REAL_PASSWORD@127.0.0.1:5432/your_db"
 *   npm run db:hosting-setup
 *   npm run db:sync-live-pack
 *
 * After setup:
 *   npm start
 */
const { spawnSync } = require("child_process");
const path = require("path");
const { requireDatabaseUrl } = require("./lib/load-database-url");

const projectRoot = path.resolve(__dirname, "..");
const skipImport = process.argv.includes("--skip-import");
const skipSync = process.argv.includes("--skip-sync");
const dryRun = process.argv.includes("--dry-run");
const skipVerify = process.argv.includes("--skip-verify");

requireDatabaseUrl(projectRoot);

function run(label, command, args) {
  console.log(`\n== ${label} ==`);
  console.log(`> ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    env: process.env,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    console.error(`\nFailed: ${label} (exit ${result.status})`);
    process.exit(result.status || 1);
  }
}

console.log("Kasangati G40 hosting setup");
console.log(`DATABASE_URL accepted${dryRun ? " (dry-run where supported)" : ""}`);

if (!skipImport) {
  run("Import system hosting dump", "npm", ["run", "db:import-system"]);
} else {
  console.log("\n== Import ==\nSkipped (--skip-import)");
}

if (!skipSync) {
  const dry = dryRun ? ["--dry-run"] : [];
  run("Sep 2026 Dan 425k + welfare policy", "node", [
    "scripts/sync-sep2026-dan-425k-welfare.js",
    ...dry,
  ]);
  run("Centenary ↔ UAP money flow + 10M transfer", "node", [
    "scripts/sync-uap-centenary-flow.js",
    ...dry,
  ]);
  run("Clarify Centenary→UAP transfer dates/labels", "node", [
    "scripts/clarify-centenary-uap-flow.js",
    ...dry,
  ]);
  run("Live cleanup + Sep UAP 12.96% interest + loans 45.5M", "node", [
    "scripts/sync-sep2026-live-cleanup.js",
    ...dry,
  ]);
  run("Vicent join date + welfare collection start June 2024", "node", [
    "scripts/sync-vicent-welfare-start.js",
    ...dry,
  ]);
} else {
  console.log("\n== Sync ==\nSkipped (--skip-sync)");
}

if (!dryRun && !skipVerify) {
  run("Verify live company positions (Finance UI)", "node", ["scripts/verify-live-positions.js"]);
}

console.log("\nDone. Start the app with: npm start");
console.log("Migrations (incl. unit_trust_movements) run automatically on start.");
console.log("\nRecurring auto-update (schedule this — NOT dump import):");
console.log("  npm run system:auto-update");
console.log("  npm run system:auto-update -- --pull");
console.log("\nIndividual refresh commands:");
console.log("  npm run db:sync-sep2026-dan");
console.log("  npm run db:sync-uap-flow");
console.log("  npm run db:clarify-uap-flow");
console.log("  npm run db:sync-sep2026-live");
console.log("  npm run db:sync-vicent-welfare");
console.log("  npm run db:sync-live-pack");
console.log("  npm run db:verify-live");
console.log("  npm run db:export-system      # refresh dump after local data changes");
