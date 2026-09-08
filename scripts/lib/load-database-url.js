"use strict";
/**
 * Load DATABASE_URL from process.env or project .env, and reject placeholders.
 */
const fs = require("fs");
const path = require("path");

function loadEnvFile(projectRoot) {
  const envFile = path.join(projectRoot, ".env");
  if (!fs.existsSync(envFile)) return;
  for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match && process.env[match[1]] === undefined) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
}

function isPlaceholderDatabaseUrl(url) {
  const value = String(url || "");
  if (!value) return true;
  return (
    /USER:PASS@HOST/i.test(value) ||
    /:\/\/USER:/i.test(value) ||
    /@HOST:/i.test(value) ||
    /changeme|your[-_]?password|example\.com/i.test(value) ||
    /postgresql:\/\/[^/]+\/DB$/i.test(value)
  );
}

function requireDatabaseUrl(projectRoot = path.resolve(__dirname, "..")) {
  loadEnvFile(projectRoot);
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("Set DATABASE_URL first (PostgreSQL connection string), or put it in .env");
    process.exit(1);
  }
  if (isPlaceholderDatabaseUrl(url)) {
    console.error(
      "DATABASE_URL still looks like a placeholder (USER/PASS/HOST/DB).\n" +
        "Replace it with your real Postgres URL, for example:\n" +
        '  $env:DATABASE_URL="postgresql://postgres:REAL_PASSWORD@127.0.0.1:5432/kg40k"'
    );
    process.exit(1);
  }
  return url;
}

module.exports = { loadEnvFile, isPlaceholderDatabaseUrl, requireDatabaseUrl };
