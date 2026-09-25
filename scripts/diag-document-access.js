"use strict";
const path = require("path");
const { requireDatabaseUrl } = require("./lib/load-database-url");
const { Pool } = require("pg");

const projectRoot = path.resolve(__dirname, "..");
requireDatabaseUrl(projectRoot);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const general = (
    await pool.query("SELECT id, code, name, active FROM departments WHERE code='general'")
  ).rows[0];
  console.log("general department:", general || "(missing)");

  const officers = (
    await pool.query(
      `SELECT id, email, role, active FROM users 
       WHERE role IN ('Legal Officer','Executive Officer','System Admin') AND active=true
       ORDER BY role, email`
    )
  ).rows;
  console.log("registry officers:", officers);

  const legalPerms = (
    await pool.query(
      `SELECT u.id, u.email, u.role, d.code, da.can_create, da.can_edit, da.active AS assignment_active
       FROM users u
       LEFT JOIN department_assignments da ON da.user_id = u.id AND da.active = true
       LEFT JOIN departments d ON d.id = da.department_id
       WHERE u.role = 'Legal Officer' AND u.active = true`
    )
  ).rows;
  console.log("Legal Officer dept assignments:", legalPerms);

  // Simulate ensureDocumentLibraryDepartment for general
  if (!general) {
    console.log("SIM: general missing — ensure would INSERT");
  } else if (!general.active) {
    console.log("SIM: general inactive — ensure would UPDATE active=true");
  } else {
    console.log("SIM: general exists and active — ensure returns id", general.id);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => pool.end());
