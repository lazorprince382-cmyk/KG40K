#!/usr/bin/env node
"use strict";
/**
 * Import db/railway-seed.sql into DATABASE_URL (Railway Postgres).
 * Usage: DATABASE_URL=... npm run db:import-railway
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const databaseUrl = process.env.DATABASE_URL;
const dumpPath = path.join(__dirname, "..", "db", "railway-seed.sql");

if (!databaseUrl) {
  console.error("Set DATABASE_URL to your Railway Postgres URL first.");
  process.exit(1);
}
if (!fs.existsSync(dumpPath)) {
  console.error("Missing db/railway-seed.sql — export the local database first.");
  process.exit(1);
}

const candidates = [
  process.env.PSQL_PATH,
  "psql",
  String.raw`C:\Program Files\PostgreSQL\18\bin\psql.exe`,
  String.raw`C:\Program Files\PostgreSQL\17\bin\psql.exe`,
  String.raw`C:\Program Files\PostgreSQL\16\bin\psql.exe`
].filter(Boolean);

let psql = null;
for (const candidate of candidates) {
  const probe = spawnSync(candidate, ["--version"], { encoding: "utf8" });
  if (probe.status === 0) {
    psql = candidate;
    break;
  }
}
if (!psql) {
  console.error("psql not found. Install PostgreSQL client tools or set PSQL_PATH.");
  process.exit(1);
}

console.log(`Importing ${dumpPath} into Railway database...`);
const result = spawnSync(psql, [databaseUrl, "-v", "ON_ERROR_STOP=1", "-f", dumpPath], {
  stdio: "inherit",
  env: process.env
});
process.exit(result.status === null ? 1 : result.status);
