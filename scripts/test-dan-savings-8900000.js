"use strict";
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const sql = fs.readFileSync(path.join(root, "database", "migrations", "041-dan-savings-8900000.sql"), "utf8");
const script = fs.readFileSync(path.join(root, "scripts", "sync-dan-savings-8900000.js"), "utf8");
const sepDan = fs.readFileSync(path.join(root, "scripts", "sync-sep2026-dan-425k-welfare.js"), "utf8");
const sqlDml = sql
  .split(/\n/)
  .filter((line) => !/^\s*--/.test(line))
  .join("\n");

assert.match(sql, /8900000/);
assert.match(sql, /Dan Rwebingira Ssalongo/);
assert.match(sqlDml, /UPDATE members/i);
assert.doesNotMatch(sqlDml, /finance_accounts/i);
assert.doesNotMatch(sqlDml, /UPDATE\s+finance_accounts/i);
assert.doesNotMatch(sqlDml, /organization_finance_entries/i);

assert.match(script, /TARGET_SAVINGS = 8900000/);
assert.match(script, /assertFinanceUnchanged/);
assert.match(script, /UPDATE members SET savings_balance/);
assert.doesNotMatch(script, /UPDATE finance_accounts SET balance/);

assert.match(sepDan, /PIN_SAVINGS = 8900000/);
assert.match(sepDan, /SET savings_balance=\$1/);

console.log(
  JSON.stringify(
    {
      migrationTouchesFinanceAccounts: false,
      targetSavings: 8900000,
      pinAfterSepDanDeposit: true,
    },
    null,
    2
  )
);
