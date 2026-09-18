#!/usr/bin/env node
"use strict";
/**
 * Upsert Legal library documents that hosting often misses:
 *  - DOC-WELFARE-ASSISTANCE → Welfare
 *  - DOC-LOAN-AGREEMENT → Credits (create if missing)
 *
 *   node scripts/seed-welfare-assistance-document.js
 *   node scripts/seed-welfare-assistance-document.js --dry-run
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { Pool } = require("pg");
const { requireDatabaseUrl } = require("./lib/load-database-url");

const projectRoot = path.resolve(__dirname, "..");
requireDatabaseUrl(projectRoot);

const dryRun = process.argv.includes("--dry-run");
const seedDir = path.join(projectRoot, "database", "seed-documents");
const uploadsDir = path.join(projectRoot, "storage", "uploads");

const DOCS = [
  {
    reference: "DOC-WELFARE-ASSISTANCE",
    department: "welfare",
    documentType: "Welfare Reports",
    title: "Welfare assistance register — people given support",
    source: path.join(seedDir, "welfare-assistance-register.txt"),
    fileName: "welfare-assistance-register.txt",
  },
  {
    reference: "DOC-LOAN-AGREEMENT",
    department: "credits",
    documentType: "Loan Agreement",
    title: "Kasangati G40 Kwagalana Loan Agreement",
    sourceCandidates: [
      path.join(seedDir, "loan-agreement.txt"),
      path.join(projectRoot, "storage", "official-text", "kasangati-g40-kwagalana-loan-agreement--2-.txt"),
    ],
    fileName: "kasangati-g40-kwagalana-loan-agreement--2-.txt",
  },
];

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
  ssl:
    /railway|proxy|rlwy/i.test(process.env.DATABASE_URL) &&
    !/127\.0\.0\.1|localhost/.test(process.env.DATABASE_URL)
      ? { rejectUnauthorized: false }
      : undefined,
});

function resolveSource(doc) {
  if (doc.source) return doc.source;
  for (const candidate of doc.sourceCandidates || []) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

async function upsertDocument(client, { deptByCode, actorId, hasAudience }, doc) {
  const department = deptByCode[doc.department];
  if (!department) throw new Error(`Missing department: ${doc.department}`);
  const source = resolveSource(doc);
  if (!source || !fs.existsSync(source)) throw new Error(`Missing seed file for ${doc.reference}`);
  const buffer = fs.readFileSync(source);
  const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");

  if (dryRun) {
    console.log(`Would upsert ${doc.reference} → ${doc.department} (${buffer.length} bytes)`);
    return;
  }

  let row = (await client.query(`SELECT id FROM organization_documents WHERE reference=$1`, [doc.reference])).rows[0];
  if (!row) {
    row = (
      await client.query(
        hasAudience
          ? `INSERT INTO organization_documents
              (reference,department_id,document_type,title,version,status,visibility_level,audience_departments,file_name,created_by)
             VALUES ($1,$2,$3,$4,'1.1','published',2,NULL,$5,$6) RETURNING id`
          : `INSERT INTO organization_documents
              (reference,department_id,document_type,title,version,status,visibility_level,file_name,created_by)
             VALUES ($1,$2,$3,$4,'1.1','published',2,$5,$6) RETURNING id`,
        [doc.reference, department.id, doc.documentType, doc.title, doc.fileName, actorId]
      )
    ).rows[0];
    console.log(`Created ${doc.reference} under ${doc.department} id=${row.id}`);
  } else {
    await client.query(
      hasAudience
        ? `UPDATE organization_documents SET
             department_id=$2, document_type=$3, title=$4, version='1.1', status='published',
             visibility_level=2, audience_departments=NULL, file_name=$5, updated_at=NOW()
           WHERE id=$1`
        : `UPDATE organization_documents SET
             department_id=$2, document_type=$3, title=$4, version='1.1', status='published',
             visibility_level=2, file_name=$5, updated_at=NOW()
           WHERE id=$1`,
      [row.id, department.id, doc.documentType, doc.title, doc.fileName]
    );
    console.log(`Updated ${doc.reference} → ${doc.department} id=${row.id}`);
  }

  const same = (
    await client.query(`SELECT id FROM organization_document_versions WHERE document_id=$1 AND sha256=$2`, [
      row.id,
      sha256,
    ])
  ).rows[0];
  const versionExists = (
    await client.query(`SELECT id FROM organization_document_versions WHERE document_id=$1 AND version=$2`, [
      row.id,
      "1.1",
    ])
  ).rows[0];
  if (!same && !versionExists) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    const stored = `${Date.now()}-${crypto.randomBytes(12).toString("hex")}.txt`;
    fs.writeFileSync(path.join(uploadsDir, stored), buffer);
    await client.query(
      `INSERT INTO organization_document_versions
        (document_id,version,original_name,stored_name,mime_type,file_size,sha256,uploaded_by)
       VALUES ($1,'1.1',$2,$3,'text/plain; charset=utf-8',$4,$5,$6)`,
      [row.id, doc.fileName, stored, buffer.length, sha256, actorId]
    );
    await client.query(`UPDATE organization_documents SET file_name=$1, version='1.1', updated_at=NOW() WHERE id=$2`, [
      doc.fileName,
      row.id,
    ]);
    console.log(`  Attached ${stored}`);
  } else {
    console.log("  File version already present");
  }
}

async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const depts = (await client.query(`SELECT id, code FROM departments WHERE active=true`)).rows;
    const deptByCode = Object.fromEntries(depts.map((d) => [d.code, d]));
    const actor =
      (await client.query(`SELECT id FROM users WHERE role='Legal Officer' AND active=true ORDER BY id LIMIT 1`)).rows[0] ||
      (await client.query(`SELECT id FROM users WHERE active=true ORDER BY id LIMIT 1`)).rows[0];
    if (!actor) throw new Error("An active user is required");
    const hasAudience = !!(
      await client.query(
        `SELECT 1 FROM information_schema.columns
         WHERE table_name='organization_documents' AND column_name='audience_departments'`
      )
    ).rows[0];

    for (const doc of DOCS) {
      await upsertDocument(client, { deptByCode, actorId: actor.id, hasAudience }, doc);
    }

    if (dryRun) {
      await client.query("ROLLBACK");
      console.log("Dry run only.");
      return;
    }
    await client.query("COMMIT");
    console.log("Done. Credits should show Loan Agreement; Welfare should show assistance register.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
