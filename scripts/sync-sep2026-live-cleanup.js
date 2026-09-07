#!/usr/bin/env node
"use strict";
/**
 * Live finance cleanup (Sep 2026):
 * - Delete Management accounts import income/expense receipts
 * - Set money in loans to UGX 45,500,115
 * - Seed UAP daily interest from 01-Sep-2026 at 12.96% p.a. on 140,461,829.36
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

const LOANS_TARGET = 45500115;
const UAP_SEP_OPEN = 140461829.36;
const RATE = 12.96;
const MARKER = "sync-sep2026-uap-interest";
const IMPORT_REFS = [
  "FIN-INC-UT-AUG26",
  "FIN-INC-OTH-AUG26",
  "FIN-INC-LN-AUG26",
  "FIN-INC-SUB-AUG26",
  "FIN-EXP-BAD-AUG26",
];

function round2(n) {
  return Math.round(Number(n) * 100) / 100;
}

function ymd(d) {
  return d.toISOString().slice(0, 10);
}

async function upsertMovement(client, row, actor) {
  const existing = (
    await client.query(
      `SELECT id FROM unit_trust_movements
       WHERE movement_date=$1 AND description=$2 AND COALESCE(source_reference,'')=COALESCE($3,'')`,
      [row.date, row.description, row.ref || null]
    )
  ).rows[0];
  if (existing) {
    await client.query(
      `UPDATE unit_trust_movements SET deposit_amount=$1, interest_amount=$2, withdrawal_amount=$3,
         rate_percent=$4, balance_after=$5 WHERE id=$6`,
      [row.deposit || 0, row.interest || 0, row.withdrawal || 0, row.rate || null, row.balance, existing.id]
    );
    return;
  }
  await client.query(
    `INSERT INTO unit_trust_movements
      (movement_date, description, deposit_amount, interest_amount, withdrawal_amount, rate_percent, balance_after, source_reference, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [
      row.date,
      row.description,
      row.deposit || 0,
      row.interest || 0,
      row.withdrawal || 0,
      row.rate || null,
      row.balance,
      row.ref || null,
      actor,
    ]
  );
}

async function main() {
  console.log(dryRun ? "DRY RUN\n" : "Cleaning live finance + seeding Sep UAP interest\n");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const actor =
      (
        await client.query(
          `SELECT id FROM users WHERE email ILIKE 'nakayiza.baraza.olivia@gmail.com' AND active=true LIMIT 1`
        )
      ).rows[0]?.id ||
      (await client.query(`SELECT id FROM users WHERE active=true ORDER BY id LIMIT 1`)).rows[0]?.id;

    // 1) Remove management-accounts import receipts (and any other import-method rows).
    const deleted = (
      await client.query(
        `DELETE FROM organization_finance_entries
         WHERE reference = ANY($1::text[])
            OR payment_method ILIKE 'Management accounts import'
         RETURNING reference, entry_type, amount::float`,
        [IMPORT_REFS]
      )
    ).rows;
    console.log(`Deleted ${deleted.length} import receipt(s):`, deleted.map((r) => r.reference).join(", ") || "(none)");

    // 2) Money in loans → 45,500,115 (restore Justine principal reduction gap).
    const loanSum = Number(
      (
        await client.query(
          `SELECT COALESCE(SUM(balance),0)::float AS total FROM loans WHERE status IN ('active','overdue')`
        )
      ).rows[0].total
    );
    const gap = round2(LOANS_TARGET - loanSum);
    console.log(`Loans outstanding now ${loanSum.toLocaleString()}; target ${LOANS_TARGET.toLocaleString()}; gap ${gap.toLocaleString()}`);
    if (Math.abs(gap) > 0.5) {
      const justine = (
        await client.query(`SELECT id, balance::float AS balance FROM loans WHERE reference='LN-JUSTINE-16M-20260731' FOR UPDATE`)
      ).rows[0];
      if (!justine) throw new Error("Justine loan not found");
      const newBal = round2(Number(justine.balance) + gap);
      if (!dryRun) {
        await client.query(`UPDATE loans SET balance=$1 WHERE id=$2`, [newBal, justine.id]);
        // Keep member repayment history but annotate — outstanding corrected to leadership figure.
        await client.query(
          `UPDATE transactions SET notes = COALESCE(notes,'') || $1
           WHERE reference='REP-JUSTINE-4320K-20260831'`,
          [` | Outstanding portfolio corrected to UGX ${LOANS_TARGET.toLocaleString()} (${MARKER})`]
        );
      }
      console.log(`Justine balance ${Number(justine.balance).toLocaleString()} → ${newBal.toLocaleString()}`);
    }

    // 3) September UAP daily interest @ 12.96% p.a. from 140,461,829.36 starting 1 Sep 2026.
    const uap = (
      await client.query(`SELECT id FROM finance_accounts WHERE account_code='GL-4500' AND active=true LIMIT 1`)
    ).rows[0];
    if (!uap) throw new Error("UAP account missing");

    const start = new Date("2026-09-01T00:00:00Z");
    const today = new Date();
    // Cap at system "today" in Africa/Kampala-ish: user_info says Sep 7, 2026
    const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    if (end < start) throw new Error("End date before Sep 1");

    let bal = UAP_SEP_OPEN;
    if (!dryRun) {
      await upsertMovement(
        client,
        {
          date: "2026-09-01",
          description: "Opening Balance",
          balance: bal,
          ref: `${MARKER}-open-2026-09-01`,
        },
        actor
      );
    }
    console.log(`UAP Sep opening ${bal.toLocaleString()} @ ${RATE}% p.a.`);

    for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
      const date = ymd(d);
      const interest = round2((bal * RATE) / 100 / 365);
      bal = round2(bal + interest);
      if (!dryRun) {
        await upsertMovement(
          client,
          {
            date,
            description: "Interest",
            interest,
            rate: RATE,
            balance: bal,
            ref: `${MARKER}-int-${date}`,
          },
          actor
        );
      }
      console.log(`  ${date} interest ${interest.toLocaleString()} → ${bal.toLocaleString()}`);
    }

    if (!dryRun) {
      await client.query(
        `UPDATE finance_accounts SET balance=$1, updated_at=NOW(),
           notes=COALESCE(notes,'') || $2 WHERE id=$3`,
        [
          bal,
          ` Sep 2026 daily interest at ${RATE}% p.a. from ${UAP_SEP_OPEN} (${MARKER}).`,
          uap.id,
        ]
      );
      await client.query(
        `INSERT INTO settings (key,value) VALUES ('organizationUapBalance',$1)
         ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`,
        [String(bal)]
      );
      await client.query(
        `UPDATE investment_fund_accounts SET current_value=$1, updated_at=NOW()
         WHERE reference IN ('FUND-OLD-MUTUAL-2025','FUND-UAP-UMBRELLA')`,
        [bal]
      );
    }

    const loansAfter = Number(
      (
        await client.query(
          `SELECT COALESCE(SUM(balance),0)::float AS total FROM loans WHERE status IN ('active','overdue')`
        )
      ).rows[0].total
    );
    const bank = Number(
      (
        await client.query(`SELECT balance::float AS balance FROM finance_accounts WHERE account_code='GL-4104' LIMIT 1`)
      ).rows[0]?.balance || 0
    );

    if (dryRun) await client.query("ROLLBACK");
    else await client.query("COMMIT");

    console.log("\n== Summary ==");
    console.log(`  Centenary: UGX ${bank.toLocaleString()}`);
    console.log(`  UAP / Unit Trust: UGX ${bal.toLocaleString()}`);
    console.log(`  Money in loans: UGX ${dryRun ? LOANS_TARGET : loansAfter.toLocaleString()}`);
    console.log(
      `  Total company funds: UGX ${(bank + bal + (dryRun ? LOANS_TARGET : loansAfter)).toLocaleString()}`
    );
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
