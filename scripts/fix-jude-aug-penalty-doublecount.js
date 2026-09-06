/**
 * Remove baked 149,958 from Jude's August installment when a Late payment penalty charge already exists.
 * Keeps EMI schedule clean; next payment = installment remainder + outstanding penalty charge.
 */
const { Pool } = require("pg");

const REF = process.env.JUDE_LOAN_REF || "LN-JUDE-15M-20260413";
const AUG_PENALTY = 149958;

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === "0" ? false : { rejectUnauthorized: false },
  });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const loan = (
      await client.query(`SELECT id, reference FROM loans WHERE reference=$1`, [REF])
    ).rows[0];
    if (!loan) throw new Error(`Loan ${REF} not found`);

    const aug = (
      await client.query(
        `SELECT id, total_due::float, principal::float, interest::float, paid_amount::float
         FROM loan_repayment_schedule WHERE loan_id=$1 AND installment_number=4`,
        [loan.id]
      )
    ).rows[0];
    if (!aug) throw new Error("August installment missing");

    const expectedEmi = Math.round((Number(aug.principal) + Number(aug.interest)) * 100) / 100;
    const current = Number(aug.total_due);
    if (Math.abs(current - (expectedEmi + AUG_PENALTY)) < 1) {
      await client.query(
        `UPDATE loan_repayment_schedule SET total_due=$2 WHERE id=$1`,
        [aug.id, expectedEmi]
      );
      console.log(`${REF}: August total_due ${current} → ${expectedEmi} (removed baked penalty)`);
    } else {
      console.log(`${REF}: August total_due ${current} already looks clean (EMI ~${expectedEmi})`);
    }

    const charge = (
      await client.query(
        `SELECT id, amount::float, status FROM loan_charges
         WHERE loan_id=$1 AND charge_type='Late payment penalty' AND status IN ('outstanding','partial')
         ORDER BY id DESC LIMIT 1`,
        [loan.id]
      )
    ).rows[0];
    console.log(
      charge
        ? `Outstanding late penalty charge: ${charge.amount} (${charge.status})`
        : "No outstanding late penalty charge — maintenance will assess if overdue"
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
