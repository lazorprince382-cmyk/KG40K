#!/usr/bin/env node
"use strict";
/**
 * Consistent automated update for hosting (the script the other operator should schedule).
 *
 * Use this AFTER the database already exists. Do NOT re-import the dump on every update.
 *
 * PowerShell:
 *   $env:DATABASE_URL="postgresql://USER:PASS@HOST:5432/DB"
 *   npm run system:auto-update
 *   npm run system:auto-update -- --pull          # git pull first
 *   npm run system:auto-update -- --skip-install  # skip npm install
 *   npm run system:auto-update -- --dry-run
 *
 * First-time empty host only:
 *   npm run db:hosting-setup
 *
 * Then keep the app running with: npm start
 * (schema migrations apply automatically on start)
 */
const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const projectRoot = path.resolve(__dirname, "..");
const doPull = process.argv.includes("--pull");
const skipInstall = process.argv.includes("--skip-install");
const dryRun = process.argv.includes("--dry-run");

function run(label, command, args, { optional = false } = {}) {
  console.log(`\n== ${label} ==`);
  console.log(`> ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    env: process.env,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    if (optional) {
      console.warn(`Skipped/failed optional step: ${label} (exit ${result.status})`);
      return;
    }
    console.error(`\nFailed: ${label} (exit ${result.status})`);
    process.exit(result.status || 1);
  }
}

if (!process.env.DATABASE_URL) {
  console.error("Set DATABASE_URL first (PostgreSQL connection string).");
  process.exit(1);
}

console.log("Kasangati G40 system auto-update");
console.log("Safe recurring update: pull (optional) → install → live sync pack (no dump re-import)");

if (doPull) {
  if (fs.existsSync(path.join(projectRoot, ".git"))) {
    run("Git pull", "git", ["pull", "--ff-only"], { optional: true });
  } else {
    console.log("\n== Git pull ==\nNo .git folder — skipped");
  }
}

if (!skipInstall) {
  const hasLock = fs.existsSync(path.join(projectRoot, "package-lock.json"));
  run("Install dependencies", "npm", hasLock ? ["ci", "--omit=dev"] : ["install", "--omit=dev"], {
    optional: true,
  });
}

run("Live finance / welfare sync pack", "node", [
  "scripts/sync-live-pack.js",
  ...(dryRun ? ["--dry-run"] : []),
]);

console.log(`
Done.

Next (restart the running app so migrations + UI load):
  npm start

Automation tip (Task Scheduler / cron):
  set DATABASE_URL=...
  npm run system:auto-update -- --pull

First-time empty database only (imports dump — do not schedule this):
  npm run db:hosting-setup
`);
