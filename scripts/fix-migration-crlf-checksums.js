#!/usr/bin/env node
"use strict";
/**
 * Repair schema_migrations checksums when only line endings differ (CRLF vs LF).
 * Does not re-run migrations.
 */
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const projectRoot = path.resolve(__dirname, "..");
const envFile = path.join(projectRoot, ".env");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2];
  }
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
(async () => {
  const dir = path.join(projectRoot, "database", "migrations");
  const applied = (await pool.query(`SELECT name, checksum FROM schema_migrations ORDER BY name`)).rows;
  let fixed = 0;
  for (const row of applied) {
    const file = path.join(dir, row.name);
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, "utf8");
    const norm = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const normSum = crypto.createHash("sha256").update(norm).digest("hex");
    const rawSum = crypto.createHash("sha256").update(text).digest("hex");
    if (row.checksum === normSum) continue;
    if (row.checksum === rawSum && normSum !== rawSum) {
      await pool.query(`UPDATE schema_migrations SET checksum=$1 WHERE name=$2`, [normSum, row.name]);
      console.log("Fixed CRLF checksum:", row.name);
      fixed += 1;
      continue;
    }
    console.log("SKIP (content changed, not just line endings):", row.name);
  }
  console.log(fixed ? `Updated ${fixed} checksum(s).` : "No CRLF checksum repairs needed.");
  await pool.end();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
