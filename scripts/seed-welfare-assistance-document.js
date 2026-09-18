#!/usr/bin/env node
"use strict";
/**
 * Upsert a simple Welfare assistance register into Legal → Welfare library.
 * Also ensures the loan agreement is visible under Credits (common hosting gap).
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
const SOURCE = path.join(projectRoot, "database", "seed-documents", "welfare-assistance-register.txt");
const REFERENCE = "DOC-WELFARE-ASSISTANCE";
const TITLE = "Welfare assistance register — people given support";
const DOC_TYPE = "Welfare Reports";
const FILE_NAME = "welfare-assistance-register.txt";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
  ssl:
    /railway|proxy|rlwy/i.test(process.env.DATABASE_URL) &&
    !/127\.0\.0\.1|localhost/.test(process.env.DATABASE_URL)
      ? { rejectUnauthorized: false }
      : undefined,
});

async function main() {
  if (!fs.existsSync(SOURCE)) throw new Error(`Missing seed file: ${SOURCE}`);
  const buffer = fs.readFileSync(SOURCE);
  const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const welfare = (await client.query(`SELECT id FROM departments WHERE code='welfare' AND active=true`)).rows[0];
    const credits = (await client.query(`SELECT id FROM departments WHERE code='credits' AND active=true`)).rows[0];
    const actor =
      (await client.query(`SELECT id FROM users WHERE role='Legal Officer' AND active=true ORDER BY id LIMIT 1`)).rows[0] ||
      (await client.query(`SELECT id FROM users WHERE active=true ORDER BY id LIMIT 1`)).rows[0];
    if (!welfare || !actor) throw new Error("Welfare department and an active user are required");

    if (dryRun) {
      console.log(`Would upsert ${REFERENCE} under Welfare (${welfare.id}), ${buffer.length} bytes`);
      if (credits) console.log("Would also publish DOC-LOAN-AGREEMENT under Credits (visibility 2)");
      await client.query("ROLLBACK");
      return;
    }

    const uploads = path.join(projectRoot, "storage", "uploads");
    fs.mkdirSync(uploads, { recursive: true });

    const hasAudience = (
      await client.query(
        `SELECT 1 FROM information_schema.columns
         WHERE table_name='organization_documents' AND column_name='audience_departments'`
      )
    ).rows[0];

    let doc = (await client.query(`SELECT id FROM organization_documents WHERE reference=$1`, [REFERENCE])).rows[0];
    if (!doc) {
      doc = (
        await client.query(
          hasAudience
            ? `INSERT INTO organization_documents
                (reference,department_id,document_type,title,version,status,visibility_level,audience_departments,file_name,created_by)
               VALUES ($1,$2,$3,$4,'1.0','published',2,NULL,$5,$6) RETURNING id`
            : `INSERT INTO organization_documents
                (reference,department_id,document_type,title,version,status,visibility_level,file_name,created_by)
               VALUES ($1,$2,$3,$4,'1.0','published',2,$5,$6) RETURNING id`,
          [REFERENCE, welfare.id, DOC_TYPE, TITLE, FILE_NAME, actor.id]
        )
      ).rows[0];
      console.log(`Created ${REFERENCE} id=${doc.id}`);
    } else {
      await client.query(
        hasAudience
          ? `UPDATE organization_documents SET
               department_id=$2, document_type=$3, title=$4, version='1.0', status='published',
               visibility_level=2, audience_departments=NULL, file_name=$5, updated_at=NOW()
             WHERE id=$1`
          : `UPDATE organization_documents SET
               department_id=$2, document_type=$3, title=$4, version='1.0', status='published',
               visibility_level=2, file_name=$5, updated_at=NOW()
             WHERE id=$1`,
        [doc.id, welfare.id, DOC_TYPE, TITLE, FILE_NAME]
      );
      console.log(`Updated ${REFERENCE} id=${doc.id}`);
    }

    const same = (
      await client.query(`SELECT id FROM organization_document_versions WHERE document_id=$1 AND sha256=$2`, [
        doc.id,
        sha256,
      ])
    ).rows[0];
    if (!same) {
      const stored = `${Date.now()}-${crypto.randomBytes(12).toString("hex")}.txt`;
      const destination = path.join(uploads, stored);
      fs.writeFileSync(destination, buffer);
      await client.query(
        `INSERT INTO organization_document_versions
          (document_id,version,original_name,stored_name,mime_type,file_size,sha256,uploaded_by)
         VALUES ($1,'1.0',$2,$3,'text/plain; charset=utf-8',$4,$5,$6)`,
        [doc.id, FILE_NAME, stored, buffer.length, sha256, actor.id]
      );
      await client.query(`UPDATE organization_documents SET file_name=$1, version='1.0', updated_at=NOW() WHERE id=$2`, [
        FILE_NAME,
        doc.id,
      ]);
      console.log(`Attached file version ${stored}`);
    } else {
      console.log("File version already present");
    }

    // Hosting often still has the loan agreement stuck on Legal / high visibility.
    if (credits) {
      const loan = (
        await client.query(`SELECT id, department_id, visibility_level, status FROM organization_documents WHERE reference='DOC-LOAN-AGREEMENT'`)
      ).rows[0];
      if (loan) {
        await client.query(
          hasAudience
            ? `UPDATE organization_documents SET
                 department_id=$2, document_type='Loan Agreement', status='published',
                 visibility_level=2, audience_departments=NULL, updated_at=NOW()
               WHERE id=$1`
            : `UPDATE organization_documents SET
                 department_id=$2, document_type='Loan Agreement', status='published',
                 visibility_level=2, updated_at=NOW()
               WHERE id=$1`,
          [loan.id, credits.id]
        );
        console.log(`Ensured DOC-LOAN-AGREEMENT under Credits (visibility 2)`);
      }
    }

    await client.query("COMMIT");
    console.log("Done.");
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
