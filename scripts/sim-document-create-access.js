"use strict";
/** Simulate documentCreateAccess for Legal → general using live DB (no HTTP). */
const path = require("path");
const { requireDatabaseUrl } = require("./lib/load-database-url");
const { query, one } = require("../src/db");

requireDatabaseUrl(path.resolve(__dirname, ".."));

const DOCUMENT_REGISTRY_ROLES = new Set(["Legal Officer", "Executive Officer", "System Admin"]);
const DOCUMENT_LIBRARY_CODES = new Set([
  "credits", "investment", "finance", "welfare", "supervisory", "audit", "executive", "general",
]);

async function ensureDocumentLibraryDepartment(code) {
  const normalized = String(code || "").trim().toLowerCase();
  if (!DOCUMENT_LIBRARY_CODES.has(normalized)) return null;
  let department = await one(
    "SELECT id,code,name,description,active FROM departments WHERE code=$1",
    [normalized]
  );
  if (department?.active) return department;
  if (department && !department.active) {
    await query(`UPDATE departments SET active=true WHERE id=$1`, [department.id]);
    return one("SELECT id,code,name,description FROM departments WHERE id=$1", [department.id]);
  }
  const org = await one("SELECT id FROM organizations ORDER BY id LIMIT 1");
  if (!org) return null;
  const names = {
    credits: "Credits Department", investment: "Investment", finance: "Finance", welfare: "Welfare",
    supervisory: "Supervisory", audit: "Audit", executive: "Executive", general: "General",
  };
  await query(
    `INSERT INTO departments (organization_id,code,name,description,sort_order,active)
     VALUES ($1,$2,$3,$4,$5,true)
     ON CONFLICT (code) DO UPDATE SET active=true`,
    [org.id, normalized, names[normalized] || normalized, `${names[normalized] || normalized} documents`, normalized === "general" ? 0 : 99]
  );
  return one("SELECT id,code,name,description FROM departments WHERE code=$1", [normalized]);
}

async function departmentPermission(user, code, action = "view") {
  if (action === "delete") action = "edit";
  const assigned = await one(
    `SELECT d.id,d.code FROM departments d JOIN department_assignments da ON da.department_id=d.id
     WHERE d.code=$1 AND da.user_id=$2 AND da.active=true AND da.can_${action}=true`,
    [code, user.id]
  );
  return assigned || null;
}

async function documentCreateAccess(user, code) {
  const normalized = String(code || "").trim().toLowerCase();
  if (!normalized) return null;
  const role = String(user?.role || "");
  if (DOCUMENT_REGISTRY_ROLES.has(role)) {
    let department = null;
    if (DOCUMENT_LIBRARY_CODES.has(normalized)) department = await ensureDocumentLibraryDepartment(normalized);
    if (!department) {
      department = await one(
        "SELECT id,code,name,description FROM departments WHERE code=$1 AND active=true",
        [normalized]
      );
    }
    if (!department) return null;
    return department;
  }
  const legalWrite =
    (await departmentPermission(user, "legal", "create")) ||
    (await departmentPermission(user, "legal", "edit"));
  if (legalWrite && DOCUMENT_LIBRARY_CODES.has(normalized)) {
    return ensureDocumentLibraryDepartment(normalized);
  }
  return departmentPermission(user, normalized, "create");
}

async function main() {
  const user = await one(
    "SELECT id, email, role FROM users WHERE email=$1 AND active=true",
    ["legal@kasangatig40.test"]
  );
  const access = await documentCreateAccess(user, "general");
  console.log(
    JSON.stringify(
      {
        user: user?.email,
        role: user?.role,
        target: "general",
        accessGranted: Boolean(access),
        departmentId: access?.id || null,
      },
      null,
      2
    )
  );
  process.exit(access ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
