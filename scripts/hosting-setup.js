#!/usr/bin/env node
"use strict";
/**
 * One-shot hosting setup for the operator who imports / refreshes system data.
 *
 * 1) Imports database/dumps/system-hosting-data.dump (unless --skip-import)
 * 2) Applies live finance sync pack (unless --skip-sync):
 *      - Sep 2026 Dan 425k + monthly welfare policy
 *      - Centenary ↔ UAP (Old Mutual) money flow + 10M transfer
 *      - Live cleanup: remove management-import receipts, loans → 45,500,115,
 *        Sep UAP daily interest at 12.96% p.a. from 1 Sep 2026
 *
 * Usage (PowerShell):
 *   $env:DATABASE_URL="postgresql://USER:PASS@HOST:5432/DB"
 *   npm run db:hosting-setup
 *   npm run db:hosting-setup -- --skip-import
 *   npm run db:hosting-setup -- --dry-run
 *   npm run db:sync-live-pack          # syncs only (no dump import)
 *
 * After setup:
 *   npm start
 *   (migrations including 039-unit-trust-movements.sql apply on start)
 */
const { spawnSync } = require("child_process");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const skipImport = process.argv.includes("--skip-import");
const skipSync = process.argv.includes("--skip-sync");
const dryRun = process.argv.includes("--dry-run");

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

if (!process.env.DATABASE_URL) {
  console.error("Set DATABASE_URL first (PostgreSQL connection string).");
  process.exit(1);
}

console.log("Kasangati G40 hosting setup");
console.log(`DATABASE_URL is set${dryRun ? " (dry-run where supported)" : ""}`);

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
} else {
  console.log("\n== Sync ==\nSkipped (--skip-sync)");
}

console.log("\nDone. Start the app with: npm start");
console.log("Migrations (incl. unit_trust_movements) run automatically on start.");
console.log("\nIndividual refresh commands:");
console.log("  npm run db:sync-sep2026-dan");
console.log("  npm run db:sync-uap-flow");
console.log("  npm run db:clarify-uap-flow");
console.log("  npm run db:sync-sep2026-live");
console.log("  npm run db:sync-live-pack     # all four syncs, no dump import");
console.log("  npm run db:export-system      # refresh dump after local data changes");
