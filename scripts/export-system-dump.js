#!/usr/bin/env node
"use strict";
/**
 * Export the current PostgreSQL database into database/dumps/system-hosting-data.dump
 * (pg_dump custom format). Use with scripts/import-system-dump.js on another host.
 *
 * Usage:
 *   DATABASE_URL=... node scripts/export-system-dump.js
 *   npm run db:export-system
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

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
  console.error("Set DATABASE_URL first.");
  process.exit(1);
}

const dumpsDir = path.join(projectRoot, "database", "dumps");
fs.mkdirSync(dumpsDir, { recursive: true });
const dumpPath = path.join(dumpsDir, "system-hosting-data.dump");

const candidates = [
  process.env.PG_DUMP_PATH,
  "pg_dump",
  String.raw`C:\Program Files\PostgreSQL\18\bin\pg_dump.exe`,
  String.raw`C:\Program Files\PostgreSQL\17\bin\pg_dump.exe`,
  String.raw`C:\Program Files\PostgreSQL\16\bin\pg_dump.exe`,
].filter(Boolean);

let pgDump = null;
for (const candidate of candidates) {
  const probe = spawnSync(candidate, ["--version"], { encoding: "utf8" });
  if (probe.status === 0) {
    pgDump = candidate;
    break;
  }
}
if (!pgDump) {
  console.error("pg_dump not found. Install PostgreSQL client tools or set PG_DUMP_PATH.");
  process.exit(1);
}

console.log(`Exporting ${databaseUrl.replace(/:[^:@/]+@/, ":****@")} → ${dumpPath}`);
const result = spawnSync(
  pgDump,
  [
    "--format=custom",
    "--clean",
    "--if-exists",
    "--no-owner",
    "--no-acl",
    `--file=${dumpPath}`,
    databaseUrl,
  ],
  { stdio: "inherit", env: process.env }
);

if (result.status !== 0) {
  console.error("pg_dump failed.");
  process.exit(result.status === null ? 1 : result.status);
}

const stats = fs.statSync(dumpPath);
console.log(`Wrote ${dumpPath} (${Math.round(stats.size / 1024)} KB)`);
console.log("Import on another host with: npm run db:import-system");
