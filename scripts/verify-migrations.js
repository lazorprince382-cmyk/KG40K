const db = require("../src/db");

async function main() {
  await db.initialize({ seedDemo: false });
  const result = await db.query(
    "SELECT name, applied_at FROM schema_migrations WHERE name >= $1 ORDER BY name",
    ["030"]
  );
  console.log("Applied migrations from 030+:");
  for (const row of result.rows) {
    console.log(`- ${row.name} @ ${row.applied_at}`);
  }
  const needed = [
    "030-loan-multi-approval-and-custom-product.sql",
    "031-official-loan-approval-committees.sql",
    "032-advisory-loan-rejects.sql",
    "033-loan-overdue-declaration.sql"
  ];
  const applied = new Set(result.rows.map((row) => row.name));
  const missing = needed.filter((name) => !applied.has(name));
  if (missing.length) {
    console.error("Missing:", missing.join(", "));
    process.exit(1);
  }
  console.log("All required loan migrations are on this database.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
