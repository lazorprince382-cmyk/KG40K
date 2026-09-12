#!/usr/bin/env node
"use strict";
/**
 * Clarify Centenary → UAP money flow:
 *   31/08/2026 Centenary 17,943,723
 *   → transfer 10,000,000 to UAP (member deposits / company bank surplus — NOT income)
 *   → Centenary 7,943,723
 *   01/09/2026 Dan member deposit 425,000 → Centenary 8,351,473
 *
 * Removes the misleading "Unit Trust funding" income receipt.
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

const dryRun = process.argv.includes("--dry-run");
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });

const PRE_XFER = 17943723;
const XFER = 10000000;
const POST_XFER = PRE_XFER - XFER; // 7943723
const FINAL = 8351473;
const DAN = 425000;

async function main() {
  console.log(dryRun ? "DRY RUN\n" : "Clarifying Centenary ↔ UAP flow\n");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const centenary = (
      await client.query(
        `SELECT id, balance::float AS balance FROM finance_accounts WHERE account_code='GL-4104' OR account_number='3100111892' ORDER BY CASE WHEN account_code='GL-4104' THEN 0 ELSE 1 END LIMIT 1`
      )
    ).rows[0];
    const uap = (await client.query(`SELECT id FROM finance_accounts WHERE account_code='GL-4500' LIMIT 1`)).rows[0];
    if (!centenary || !uap) throw new Error("Centenary or UAP account missing");

    // Reclassify / retitle the 10M legs so they are NOT org income or expense.
    const out = (
      await client.query(
        `SELECT id, reference FROM organization_finance_entries
         WHERE reference IN ('FIN-UAP-XFER-10M-20260901','FIN-UAP-XFER-10M-20260831')
            OR receipt_number IN ('UAP-10M-0901','UAP-10M-0831')
         ORDER BY id DESC LIMIT 1`
      )
    ).rows[0];
    const inn = (
      await client.query(
        `SELECT id, reference FROM organization_finance_entries
         WHERE reference IN ('FIN-UAP-RECV-10M-20260901','FIN-UAP-RECV-10M-20260831')
            OR receipt_number IN ('UAP-10M-IN-0901','UAP-10M-IN-0831')
         ORDER BY id DESC LIMIT 1`
      )
    ).rows[0];

    if (out) {
      console.log(`Out leg ${out.reference} → transfer on 2026-08-31`);
      if (!dryRun) {
        await client.query(
          `UPDATE organization_finance_entries SET
             reference='FIN-UAP-XFER-10M-20260831',
             entry_type='transfer',
             category='Internal transfer to UAP',
             description=$1,
             counterparty='Old Mutual Unit Trust (UAP)',
             receipt_number='UAP-10M-0831',
             transaction_date='2026-08-31',
             finance_account_id=$2
           WHERE id=$3`,
          [
            `Internal move of company bank funds (member deposits surplus) Centenary → UAP. ` +
              `Centenary was UGX ${PRE_XFER.toLocaleString()} on 31/08/2026; after this transfer UGX ${POST_XFER.toLocaleString()}. Not organization income.`,
            centenary.id,
            out.id,
          ]
        );
      }
    } else console.log("WARN: outbound 10M finance entry not found");

    if (inn) {
      console.log(`In leg ${inn.reference} → transfer on 2026-08-31 (not income)`);
      if (!dryRun) {
        await client.query(
          `UPDATE organization_finance_entries SET
             reference='FIN-UAP-RECV-10M-20260831',
             entry_type='transfer',
             category='Internal transfer from company bank',
             description=$1,
             counterparty='Centenary company bank (member deposits)',
             receipt_number='UAP-10M-0831-IN',
             transaction_date='2026-08-31',
             finance_account_id=$2
           WHERE id=$3`,
          [
            `UAP received internal transfer from Centenary company account — same 10M already held as member deposits / company funds. Not new income from UAP or outside.`,
            uap.id,
            inn.id,
          ]
        );
      }
    } else console.log("WARN: inbound 10M finance entry not found");

    // Unit Trust movement date aligned with bank outflow (31 Aug).
    if (!dryRun) {
      await client.query(
        `UPDATE unit_trust_movements SET
           movement_date='2026-08-31',
           description='Transfer from Centenary (company bank / member deposits)'
         WHERE source_reference LIKE '%xfer-10m%'
            OR (deposit_amount=$1 AND description ILIKE '%Transfer from Centenary%')`,
        [XFER]
      );
    }
    console.log("Unit Trust 10M movement dated 2026-08-31");

    // Opening trail stays historical. Do not pull a later live balance back to the 01 Sep SMS figure.
    if (!dryRun && Number(centenary.balance) <= FINAL + 0.009) {
      await client.query(
        `UPDATE finance_accounts SET
           balance=$1,
           opening_balance=$2,
           opening_balance_date='2026-08-31',
           notes=$3,
           updated_at=NOW()
         WHERE id=$4 AND balance <= $1`,
        [
          FINAL,
          PRE_XFER,
          `Flow: 31/08/2026 bal UGX ${PRE_XFER.toLocaleString()} → transfer UGX ${XFER.toLocaleString()} to UAP → UGX ${POST_XFER.toLocaleString()} → 01/09/2026 Dan member deposit UGX ${DAN.toLocaleString()} → SMS bal UGX ${FINAL.toLocaleString()}.`,
          centenary.id,
        ]
      );
    }
    console.log(
      `Centenary: opening ${PRE_XFER.toLocaleString()} (31/08) → after 10M ${POST_XFER.toLocaleString()} → after Dan ${FINAL.toLocaleString()}`
    );

    // Clarify Dan income description (only real September member money into the bank).
    if (!dryRun) {
      await client.query(
        `UPDATE organization_finance_entries SET
           description=$1,
           category='Member savings deposit'
         WHERE reference='FIN-SEP01-DAN-425K'`,
        [
          `394886009-AGNTBANK DEP DAN/Financia | Member monthly deposit UGX ${DAN.toLocaleString()} (UGX 25,000 welfare share). ` +
            `Bank after 10M→UAP was UGX ${POST_XFER.toLocaleString()}; after this deposit SMS bal UGX ${FINAL.toLocaleString()}. This is September member money — not a UAP receipt.`,
        ]
      );
    }
    console.log("Dan Sep 1 deposit description clarified");

    if (dryRun) await client.query("ROLLBACK");
    else await client.query("COMMIT");
    console.log(dryRun ? "\nDry run complete (rolled back)." : "\nDone.");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
