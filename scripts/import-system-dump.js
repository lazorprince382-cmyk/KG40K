#!/usr/bin/env node
"use strict";
/**
 * Import database/dumps/system-hosting-data.dump into DATABASE_URL.
 * Creates the target database if missing (when using a postgres admin URL).
 *
 * WARNING: --clean replaces existing objects in the target database.
 *
 * Usage:
 *   DATABASE_URL=... node scripts/import-system-dump.js
 *   DATABASE_URL=... node scripts/import-system-dump.js --dump path/to/other.dump
 *   npm run db:import-system
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const projectRoot = path.resolve(__dirname, "..");
const envFile = path.join(projectRoot, ".env");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2];
  }
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Set DATABASE_URL to the destination Postgres URL first.");
  process.exit(1);
}

const dumpArg = process.argv.find((arg) => arg.startsWith("--dump="));
const dumpIndex = process.argv.indexOf("--dump");
const dumpPath = dumpArg
  ? dumpArg.slice("--dump=".length)
  : dumpIndex >= 0 && process.argv[dumpIndex + 1]
    ? process.argv[dumpIndex + 1]
    : path.join(projectRoot, "database", "dumps", "system-hosting-data.dump");

if (!fs.existsSync(dumpPath)) {
  console.error(`Missing dump file: ${dumpPath}`);
  console.error("Create one with: npm run db:export-system");
  process.exit(1);
}

function findTool(envKey, names, winBins) {
  const candidates = [
    process.env[envKey],
    ...names,
    ...winBins.map((bin) => String.raw`C:\Program Files\PostgreSQL\18\bin\${bin}`),
    ...winBins.map((bin) => String.raw`C:\Program Files\PostgreSQL\17\bin\${bin}`),
    ...winBins.map((bin) => String.raw`C:\Program Files\PostgreSQL\16\bin\${bin}`),
  ].filter(Boolean);
  for (const candidate of candidates) {
    const probe = spawnSync(candidate, ["--version"], { encoding: "utf8" });
    if (probe.status === 0) return candidate;
  }
  return null;
}

const pgRestore = findTool("PG_RESTORE_PATH", ["pg_restore"], ["pg_restore.exe"]);
const psql = findTool("PSQL_PATH", ["psql"], ["psql.exe"]);
if (!pgRestore) {
  console.error("pg_restore not found. Install PostgreSQL client tools or set PG_RESTORE_PATH.");
  process.exit(1);
}

function ensureDatabase(urlString) {
  if (!psql) {
    console.warn("psql not found — skipping auto-create database (target must already exist).");
    return;
  }
  let parsed;
  try {
    parsed = new URL(urlString);
  } catch {
    return;
  }
  const dbName = decodeURIComponent((parsed.pathname || "").replace(/^\//, "").split("?")[0] || "");
  if (!dbName || dbName === "postgres") return;

  const admin = new URL(urlString);
  admin.pathname = "/postgres";
  console.log(`Ensuring database "${dbName}" exists...`);
  const exists = spawnSync(
    psql,
    [admin.toString(), "-tAc", `SELECT 1 FROM pg_database WHERE datname='${dbName.replace(/'/g, "''")}'`],
    { encoding: "utf8", env: process.env }
  );
  if (exists.status === 0 && String(exists.stdout || "").trim() === "1") {
    console.log(`Database "${dbName}" already exists.`);
    return;
  }
  const created = spawnSync(
    psql,
    [admin.toString(), "-v", "ON_ERROR_STOP=1", "-c", `CREATE DATABASE "${dbName}"`],
    { stdio: "inherit", env: process.env }
  );
  if (created.status !== 0) {
    console.error(`Could not create database "${dbName}". Create it manually, then re-run.`);
    process.exit(created.status === null ? 1 : created.status);
  }
  console.log(`Created database "${dbName}".`);
}

ensureDatabase(databaseUrl);

console.log(`Importing ${dumpPath}`);
console.log(`Target: ${databaseUrl.replace(/:[^:@/]+@/, ":****@")}`);
console.log("This replaces matching objects in the target database (--clean --if-exists).");

const result = spawnSync(
  pgRestore,
  [
    "--clean",
    "--if-exists",
    "--no-owner",
    "--no-acl",
    `--dbname=${databaseUrl}`,
    dumpPath,
  ],
  { stdio: "inherit", env: process.env }
);

// pg_restore returns 1 for some non-fatal warnings (e.g. missing roles); treat 0 as success.
if (result.status !== 0 && result.status !== 1) {
  console.error("pg_restore failed.");
  process.exit(result.status === null ? 1 : result.status);
}

console.log("Import finished.");
console.log("Next: copy .env.example → .env, set JWT_SECRET, then npm ci && npm start");
console.log("Loan supporting images (if used) live under storage/seed-supporting/.");
