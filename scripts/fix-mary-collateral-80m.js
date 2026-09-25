#!/usr/bin/env node
"use strict";
/** Set Mary Babirye loan collateral estimated value to UGX 80,000,000 and owner to Mary Babirye. */
const { Pool } = require("pg");
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

const pool = new Pool({
  connectionString: databaseUrl,
  max: 3,
  ssl: /railway|proxy|rlwy/i.test(databaseUrl) && !/127\.0\.0\.1|localhost/.test(databaseUrl)
    ? { rejectUnauthorized: false }
    : undefined,
});

const COLLATERAL_VALUE = 80000000;
const OWNER = "Mary Babirye";
const DESCRIPTION =
  "Land at NAKATETE Bulemezi, Block 445 Plot 26, Area 1.2140 ha, PIN 64000115908, Instrument LUW-00101779. Owner Mary Babirye NIN CF700071087GYL. No encumbrances (search LUW00207557 dated 04/Aug/2026).";

async function main() {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `UPDATE loans l
       SET collateral_value=$1,
           collateral_owner=$2,
           collateral_description=$3,
           purpose=CASE
             WHEN purpose ILIKE '%Bulemezi Block 445%' OR purpose ILIKE '%25,000,000%'
               THEN 'Personal loan secured by land title Bulemezi Block 445 Plot 26 (collateral UGX 80,000,000)'
             ELSE purpose
           END
       FROM members m
       WHERE l.member_id=m.id
         AND m.full_name ILIKE 'Mary Babirye'
         AND (
           l.reference ILIKE '%MARY%'
           OR l.collateral_description ILIKE '%Block 445%'
           OR COALESCE(l.collateral_value,0)=25000000
         )
         AND l.status IN ('active','overdue','ready-disbursement','executive-authorization','committee-review','officer-review','pending-guarantors','disbursed')
       RETURNING l.id, l.reference, l.collateral_value, l.collateral_owner`,
      [COLLATERAL_VALUE, OWNER, DESCRIPTION]
    );
    if (!result.rowCount) {
      const fallback = await client.query(
        `UPDATE loans l
         SET collateral_value=$1, collateral_owner=$2, collateral_description=$3
         FROM members m
         WHERE l.member_id=m.id AND m.full_name ILIKE 'Mary Babirye'
           AND COALESCE(l.collateral_value,0) IN (0,25000000)
           AND l.security_type='collateral'
         RETURNING l.id, l.reference, l.collateral_value, l.collateral_owner`,
        [COLLATERAL_VALUE, OWNER, DESCRIPTION]
      );
      if (!fallback.rowCount) throw new Error("No Mary Babirye collateral loan found to update");
      console.log("Updated", fallback.rows);
    } else {
      console.log("Updated", result.rows);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
