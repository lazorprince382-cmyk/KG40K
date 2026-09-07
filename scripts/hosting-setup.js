#!/usr/bin/env node
"use strict";
/**
 * One-shot hosting setup for the operator who imports system data.
 *
 * 1) Imports database/dumps/system-hosting-data.dump (unless --skip-import)
 * 2) Applies Sep 2026 Dan 425k + monthly welfare policy sync (unless --skip-sync)
 *
 * Usage (PowerShell):
 *   $env:DATABASE_URL="postgresql://..."
 *   node scripts/hosting-setup.js
 *   node scripts/hosting-setup.js --skip-import
 *   node scripts/hosting-setup.js --dry-run
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
  const syncArgs = ["scripts/sync-sep2026-dan-425k-welfare.js"];
  if (dryRun) syncArgs.push("--dry-run");
  run("Sep 2026 Dan 425k + welfare policy", "node", syncArgs);
} else {
  console.log("\n== Sync ==\nSkipped (--skip-sync)");
}

console.log("\nDone. Start the app with: npm start");
console.log("Optional later refreshes:");
console.log("  npm run db:sync-sep2026-dan");
console.log("  npm run db:export-system   # after local data changes, to refresh the dump");
