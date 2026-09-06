const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === "0" ? false : { rejectUnauthorized: false },
});

async function main() {
  const file = "038-one-late-penalty-per-installment.sql";
  const sql = fs
    .readFileSync(path.join(__dirname, "..", "database", "migrations", file), "utf8")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
  const checksum = crypto.createHash("sha256").update(sql).digest("hex");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query(
      `INSERT INTO schema_migrations (name, checksum) VALUES ($1, $2)
       ON CONFLICT (name) DO UPDATE SET checksum = EXCLUDED.checksum`,
      [file, checksum]
    );
    await client.query("COMMIT");
    console.log("Applied", file);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
