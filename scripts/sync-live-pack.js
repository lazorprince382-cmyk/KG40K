#!/usr/bin/env node
"use strict";
/**
 * Run the live finance sync pack only (no dump import).
 * Same sync steps as hosting-setup.js --skip-import.
 *
 *   $env:DATABASE_URL="postgresql://..."
 *   npm run db:sync-live-pack
 */
const { spawnSync } = require("child_process");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const dryRun = process.argv.includes("--dry-run");
const args = ["scripts/hosting-setup.js", "--skip-import"];
if (dryRun) args.push("--dry-run");

const result = spawnSync("node", args, {
  cwd: projectRoot,
  env: process.env,
  stdio: "inherit",
  shell: process.platform === "win32",
});
process.exit(result.status || 0);
