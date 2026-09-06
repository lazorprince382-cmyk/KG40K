const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === "0" ? false : { rejectUnauthorized: false },
});

async function main() {
  const loan = (
    await pool.query(
      `SELECT id,reference,status,balance::float FROM loans WHERE reference=$1`,
      ["LN-JUDE-15M-20260413"]
    )
  ).rows[0];
  console.log("LOAN", loan);
  const sched = (
    await pool.query(
      `SELECT installment_number,due_date::text,principal::float,principal_paid::float,
              interest::float,interest_paid::float,total_due::float,paid_amount::float,status
       FROM loan_repayment_schedule WHERE loan_id=$1 ORDER BY installment_number`,
      [loan.id]
    )
  ).rows;
  console.log("SCHEDULE");
  for (const r of sched) console.log(JSON.stringify(r));
  const charges = (
    await pool.query(
      `SELECT id,charge_type,amount::float,paid_amount::float,status,reason,schedule_id,
              penalty_period::text,assessed_at::text
       FROM loan_charges WHERE loan_id=$1 ORDER BY id`,
      [loan.id]
    )
  ).rows;
  console.log("CHARGES");
  for (const r of charges) console.log(JSON.stringify(r));
  const today = (await pool.query(`SELECT CURRENT_DATE::text AS d, NOW()::text AS n`)).rows[0];
  console.log("DB_TODAY", today);
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
