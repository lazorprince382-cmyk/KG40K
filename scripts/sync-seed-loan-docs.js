#!/usr/bin/env node
"use strict";
/**
 * Ensure seed supporting docs exist under storage/uploads and point loans at them.
 * Mary gets both land title + photo annex.
 */
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
  max: 2,
  ssl: /railway|proxy|rlwy/i.test(databaseUrl) && !/127\.0\.0\.1|localhost/.test(databaseUrl)
    ? { rejectUnauthorized: false }
    : undefined
});

const seedDir = path.join(projectRoot, "storage", "seed-supporting");
const uploadsDir = path.join(projectRoot, "storage", "uploads");

const MAP = [
  {
    ref: "LN-JUDE-15M-20260413",
    docs: [{ file: "jude-kyobe-schedule.png", original: "jude-repayment-schedule.png" }]
  },
  {
    ref: "LN-JUSTINE-16M-20260731",
    docs: [{ file: "justine-loan-agreement.png", original: "justine-loan-agreement.png" }]
  },
  {
    ref: "LN-MARY-25M-20260808",
    docs: [
      { file: "mary-land-title.png", original: "mary-babirye-land-title.png" },
      { file: "mary-photo-annex.png", original: "mary-babirye-photo-annex.png" }
    ]
  },
  {
    ref: "LN-MARY-10M-20260808",
    docs: [
      { file: "mary-land-title.png", original: "mary-babirye-land-title.png" },
      { file: "mary-photo-annex.png", original: "mary-babirye-photo-annex.png" }
    ]
  }
];

async function main() {
  fs.mkdirSync(uploadsDir, { recursive: true });
  await pool.query(`
    CREATE TABLE IF NOT EXISTS loan_supporting_documents (
      id BIGSERIAL PRIMARY KEY,
      loan_id BIGINT NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
      stored_name TEXT NOT NULL,
      original_name TEXT,
      mime_type TEXT,
      sort_order INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);

  for (const item of MAP) {
    const loan = (await pool.query(`SELECT id FROM loans WHERE reference=$1`, [item.ref])).rows[0];
    if (!loan) {
      console.log(`No loan ${item.ref}`);
      continue;
    }
    await pool.query(`DELETE FROM loan_supporting_documents WHERE loan_id=$1`, [loan.id]);
    let firstStored = null;
    let firstOriginal = null;
    for (let i = 0; i < item.docs.length; i++) {
      const doc = item.docs[i];
      const source = path.join(seedDir, doc.file);
      if (!fs.existsSync(source)) {
        console.log(`MISSING seed file ${doc.file}`);
        continue;
      }
      const stored = `seed-${doc.file}`;
      fs.copyFileSync(source, path.join(uploadsDir, stored));
      await pool.query(
        `INSERT INTO loan_supporting_documents (loan_id,stored_name,original_name,mime_type,sort_order)
         VALUES ($1,$2,$3,'image/png',$4)`,
        [loan.id, stored, doc.original, i + 1]
      );
      if (!firstStored) {
        firstStored = stored;
        firstOriginal = doc.original;
      }
      console.log(`Linked ${item.ref} #${i + 1} → ${stored}`);
    }
    if (firstStored) {
      await pool.query(
        `UPDATE loans
         SET supporting_document_stored_name=$1,
             supporting_document_original_name=$2,
             supporting_document_mime_type='image/png'
         WHERE id=$3`,
        [firstStored, firstOriginal, loan.id]
      );
    }
  }
  await pool.end();
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
