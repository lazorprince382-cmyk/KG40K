"use strict";
/**
 * Move organization documents off Legal onto the seven operating departments.
 * Safe to re-run: only remaps rows still owned by `legal` (or unmatched heuristics).
 */
const { query, one } = require("../src/db");

const LIBRARY = ["executive", "credits", "investment", "finance", "welfare", "supervisory", "audit"];

function guessCode({ document_type: type = "", title = "", reference = "" } = {}) {
  const blob = `${type} ${title} ${reference}`.toLowerCase();
  if (/credit|loan|repayment|guarantor|collateral/.test(blob)) return "credits";
  if (/invest|project|proposal|roi|portfolio/.test(blob)) return "investment";
  if (/finance|annual report|financial|bank|reconcile|payment|voucher|budget|account/.test(blob)) return "finance";
  if (/welfare|funeral|beneficiary|contribution|assistance/.test(blob)) return "welfare";
  if (/supervisor|supervisory|inspection|oversight/.test(blob)) return "supervisory";
  if (/audit|finding|assurance|internal control/.test(blob)) return "audit";
  if (/constitution|bylaw|board minute|meeting minute|policy|agm|executive|governance|minutes|contract|legal|compliance|statutory|general assembly/.test(blob))
    return "executive";
  if (/^constitution$|^bylaws$|^policies$|^board minutes$|^meeting minutes$|^minutes$|^signed contracts$|^agreements$|^legal documents$/i.test(String(type).trim()))
    return "executive";
  if (/^annual reports$|^financial statements$/i.test(String(type).trim())) return "finance";
  if (/^audit reports$/i.test(String(type).trim())) return "audit";
  if (/^credit reports$|^loan supporting documents$/i.test(String(type).trim())) return "credits";
  return "executive";
}

async function disperseOrganizationDocuments({ forceAll = false } = {}) {
  const depts = (
    await query("SELECT id, code FROM departments WHERE active=true")
  ).rows;
  const byCode = Object.fromEntries(depts.map((d) => [d.code, d.id]));
  for (const code of LIBRARY) {
    if (!byCode[code]) throw new Error(`Missing department code: ${code}`);
  }

  const rows = (
    await query(
      `SELECT doc.id, doc.reference, doc.document_type, doc.title, d.code AS department_code
       FROM organization_documents doc
       LEFT JOIN departments d ON d.id = doc.department_id
       WHERE doc.status <> 'archived'
         AND ($1::boolean = true OR d.code IS NULL OR d.code IN ('legal','general'))`,
      [forceAll]
    )
  ).rows;

  let moved = 0;
  for (const row of rows) {
    const target = guessCode(row);
    const departmentId = byCode[target];
    if (!departmentId) continue;
    if (row.department_code === target) continue;
    await query("UPDATE organization_documents SET department_id=$1, updated_at=NOW() WHERE id=$2", [
      departmentId,
      row.id,
    ]);
    moved += 1;
  }
  return { scanned: rows.length, moved };
}

async function main() {
  const forceAll = process.argv.includes("--force-all");
  const dryRun = process.argv.includes("--dry-run");
  if (dryRun) {
    const rows = (
      await query(
        `SELECT doc.id, doc.reference, doc.document_type, doc.title, d.code AS department_code
         FROM organization_documents doc
         LEFT JOIN departments d ON d.id = doc.department_id
         WHERE doc.status <> 'archived'
           AND ($1::boolean = true OR d.code IS NULL OR d.code IN ('legal','general'))`,
        [forceAll]
      )
    ).rows;
    console.log(`Document disperse dry-run: would scan ${rows.length}`);
    for (const row of rows) {
      console.log(`  ${row.reference}: ${row.department_code || "none"} → ${guessCode(row)}`);
    }
    return;
  }
  const result = await disperseOrganizationDocuments({ forceAll });
  console.log(`Document disperse: scanned ${result.scanned}, moved ${result.moved}`);
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { disperseOrganizationDocuments, guessCode, LIBRARY };
