#!/usr/bin/env node
"use strict";
/**
 * Legacy alias — prefer: npm run db:import-system
 * Imports database/dumps/system-hosting-data.dump into DATABASE_URL.
 */
const path = require("path");
const dump = path.join(__dirname, "..", "database", "dumps", "system-hosting-data.dump");
process.argv.push("--dump", dump);
require("./import-system-dump.js");
