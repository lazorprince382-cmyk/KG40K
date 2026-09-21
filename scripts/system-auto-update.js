#!/usr/bin/env node
"use strict";
/**
 * SYSTEM UPDATE — recurring hosting updater.
 *
 * Pulls the latest code from git (so splash/UI/API fixes land), installs
 * dependencies, then runs the live finance/welfare/document sync pack.
 * Does NOT re-import the database dump.
 *
 * PowerShell:
 *   $env:DATABASE_URL="postgresql://USER:PASS@HOST:5432/DB"
 *   npm run system:auto-update
 *   npm run system:auto-update -- --no-pull       # skip git pull
 *   npm run system:auto-update -- --skip-install  # skip npm install
 *   npm run system:auto-update -- --skip-sync     # code pull/install only
 *   npm run system:auto-update -- --dry-run
 *
 * First-time empty host only:
 *   npm run db:hosting-setup
 *
 * After this script finishes, restart the app so migrations + new UI load:
 *   npm start
 * (or restart the Railway / PM2 / Windows service that runs the app)
 */
const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { requireDatabaseUrl } = require("./lib/load-database-url");

const projectRoot = path.resolve(__dirname, "..");
const skipPull = process.argv.includes("--no-pull");
const forcePull = process.argv.includes("--pull"); // kept for older schedules
const doPull = forcePull || !skipPull;
const skipInstall = process.argv.includes("--skip-install");
const skipSync = process.argv.includes("--skip-sync");
const dryRun = process.argv.includes("--dry-run");

requireDatabaseUrl(projectRoot);

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
      return false;
    }
    console.error(`\nFailed: ${label} (exit ${result.status})`);
    process.exit(result.status || 1);
  }
  return true;
}

function showHead() {
  if (!fs.existsSync(path.join(projectRoot, ".git"))) return;
  const result = spawnSync("git", ["log", "-1", "--oneline"], {
    cwd: projectRoot,
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  if (result.status === 0 && result.stdout) {
    console.log(`Current commit: ${result.stdout.trim()}`);
  }
}

console.log("====================================================");
console.log(" Kasangati G40 — SYSTEM UPDATE");
console.log(" Pull code → install → live sync (no dump re-import)");
console.log("====================================================");
showHead();

if (doPull) {
  if (fs.existsSync(path.join(projectRoot, ".git"))) {
    run("Git fetch", "git", ["fetch", "--prune"], { optional: true });
    run("Git pull (latest main changes)", "git", ["pull", "--ff-only"], { optional: true });
    showHead();
  } else {
    console.log("\n== Git pull ==\nNo .git folder — skipped (deploy code another way, e.g. Railway GitHub deploy)");
  }
} else {
  console.log("\n== Git pull ==\nSkipped (--no-pull)");
}

if (!skipInstall) {
  const hasLock = fs.existsSync(path.join(projectRoot, "package-lock.json"));
  run("Install dependencies", "npm", hasLock ? ["ci", "--omit=dev"] : ["install", "--omit=dev"], {
    optional: true,
  });
} else {
  console.log("\n== Install ==\nSkipped (--skip-install)");
}

if (!skipSync) {
  run("Live finance / welfare / document sync pack", "node", [
    "scripts/sync-live-pack.js",
    ...(dryRun ? ["--dry-run"] : []),
  ], { optional: true });
} else {
  console.log("\n== Sync ==\nSkipped (--skip-sync)");
}

const verifyTargets = ["server.js", "src/server.js", "src/db.js"];
let verifyOk = true;
for (const rel of verifyTargets) {
  const abs = path.join(projectRoot, rel);
  if (!fs.existsSync(abs)) continue;
  if (!run(`Verify syntax (${rel})`, "node", ["--check", rel], { optional: true })) verifyOk = false;
}
if (!verifyOk) {
  console.warn(
    "\nWARNING: Syntax check failed after update. Do not restart production until fixed " +
      "(or roll back git). npm start will likely exit immediately."
  );
}

console.log(`
====================================================
 SYSTEM UPDATE complete
====================================================

IMPORTANT — restart the app so new code + migrations load:
  npm start

If the site still shows the old splash/UI, hard-refresh the browser
(Ctrl+Shift+R) after the app restart.

Schedule this (Task Scheduler / cron):
  set DATABASE_URL=...
  npm run system:auto-update

Flags:
  --no-pull        skip git pull
  --skip-install   skip npm install
  --skip-sync      code/install only (no finance/welfare sync)
  --dry-run        dry-run where sync scripts support it

First-time empty database only (imports dump — do NOT schedule):
  npm run db:hosting-setup
`);
