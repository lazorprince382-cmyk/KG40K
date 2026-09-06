#!/usr/bin/env node
"use strict";
/**
 * Record Centenary agent-bank deposits on 31 Aug 2026 and reconcile the
 * Kasangati G40 Kwagalana finance account to the SMS closing balance.
 *
 * Usage:
 *   DATABASE_URL=... node scripts/sync-centenary-aug31-deposits.js
 *   DATABASE_URL=... node scripts/sync-centenary-aug31-deposits.js --dry-run
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
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Set DATABASE_URL first.");
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  max: 3,
  ssl:
    /railway|proxy|rlwy/i.test(databaseUrl) && !/127\.0\.0\.1|localhost/.test(databaseUrl)
      ? { rejectUnauthorized: false }
      : undefined,
});

const MARKER = "sync-centenary-aug31-2026";
const FINANCE_ACCOUNT_NUMBER = "3100111892";
const PRE_DEPOSIT_BALANCE = 12723723;
const FINAL_BALANCE = 13623723;

const DEPOSITS = [
  {
    name: "Ntono Moreen",
    aliases: ["Tabula Moreen", "Ntono Moreen"],
    amount: 450000,
    bankRef: "394567810",
    bankNote: "AGNTBANK DEP NTONO MOREE",
    at: "2026-08-31T10:53:00+03:00",
    balanceAfter: 13173723,
    suffix: "MOREEN",
  },
  {
    name: "Tabula Robert",
    aliases: ["Tabula Robert"],
    amount: 450000,
    bankRef: "394568646",
    bankNote: "AGNTBANK DEP TABULA ROBE",
    at: "2026-08-31T10:56:00+03:00",
    balanceAfter: FINAL_BALANCE,
    suffix: "ROBERT",
  },
];

async function findMember(client, aliases) {
  for (const alias of aliases) {
    const exact = (
      await client.query(
        `SELECT id, full_name, member_number, savings_balance::float AS savings_balance
         FROM members
         WHERE deleted_at IS NULL AND status='active' AND full_name ILIKE $1
         ORDER BY id LIMIT 1`,
        [alias]
      )
    ).rows[0];
    if (exact) return exact;
  }
  return null;
}

async function actorId(client) {
  const row =
    (
      await client.query(
        `SELECT id FROM users WHERE email ILIKE 'nakayiza.baraza.olivia@gmail.com' AND active=true LIMIT 1`
      )
    ).rows[0] ||
    (await client.query(`SELECT id FROM users WHERE active=true ORDER BY id LIMIT 1`)).rows[0];
  return row?.id;
}

async function main() {
  console.log(dryRun ? "DRY RUN\n" : "Syncing Centenary 31 Aug 2026 deposits\n");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const account = (
      await client.query(
        `SELECT id, account_name, balance::float AS balance
         FROM finance_accounts
         WHERE active=true AND (account_number=$1 OR account_name ILIKE '%kwagalana%')
         ORDER BY CASE WHEN account_number=$1 THEN 0 ELSE 1 END, id
         LIMIT 1`,
        [FINANCE_ACCOUNT_NUMBER]
      )
    ).rows[0];
    if (!account) throw new Error("Kasangati G40 Kwagalana finance account not found");

    const actor = await actorId(client);
    if (!actor) throw new Error("No active user for recorded_by");

    const financeDept = (await client.query(`SELECT id FROM departments WHERE code='finance' LIMIT 1`)).rows[0];
    if (!financeDept) throw new Error("Finance department not found");

    console.log(`Finance account: ${account.account_name} (#${account.id})`);
    console.log(`  Current balance: UGX ${Number(account.balance).toLocaleString()}`);
    console.log(`  Target pre-deposit: UGX ${PRE_DEPOSIT_BALANCE.toLocaleString()}`);
    console.log(`  Target final: UGX ${FINAL_BALANCE.toLocaleString()}`);

    if (!dryRun) {
      await client.query(
        `UPDATE finance_accounts SET balance=$1, updated_at=NOW(), notes=COALESCE(notes,'') || $2
         WHERE id=$3`,
        [
          PRE_DEPOSIT_BALANCE,
          ` Reconciled 2026-08-31 to Centenary SMS balance UGX ${PRE_DEPOSIT_BALANCE.toLocaleString()} before agent deposits (was UGX ${Number(account.balance).toLocaleString()}).`,
          account.id,
        ]
      );
      console.log(`  Reconciled account to UGX ${PRE_DEPOSIT_BALANCE.toLocaleString()}`);
    } else {
      console.log(`  Would reconcile account to UGX ${PRE_DEPOSIT_BALANCE.toLocaleString()}`);
    }

    for (const dep of DEPOSITS) {
      const member = await findMember(client, dep.aliases);
      if (!member) throw new Error(`Member not found: ${dep.name}`);

      const txRef = `DEP-AUG31-${dep.suffix}`;
      const finRef = `FIN-AUG31-${dep.suffix}`;
      const existingTx = (await client.query(`SELECT id FROM transactions WHERE reference=$1`, [txRef])).rows[0];
      const existingFin = (
        await client.query(`SELECT id FROM organization_finance_entries WHERE reference=$1`, [finRef])
      ).rows[0];

      const newSavings = Number(member.savings_balance) + dep.amount;
      console.log(
        `\n${member.full_name}: savings ${Number(member.savings_balance).toLocaleString()} → ${newSavings.toLocaleString()} (+${dep.amount.toLocaleString()})`
      );
      console.log(`  Centenary ${dep.bankRef} — ${dep.bankNote}`);

      if (dryRun) continue;
      if (existingTx && existingFin) {
        console.log("  SKIP — already recorded");
        continue;
      }

      if (!existingFin) {
        await client.query(
          `INSERT INTO organization_finance_entries
            (department_id, reference, entry_type, category, description, counterparty, payment_method,
             amount, status, receipt_number, transaction_date, recorded_by, approved_by, approved_at, finance_account_id)
           VALUES ($1,$2,'income','Member savings deposit',$3,$4,'Bank transfer',$5,'completed',$6,$7::date,$8,$8,NOW(),$9)`,
          [
            financeDept.id,
            finRef,
            `${dep.bankRef}-${dep.bankNote} | Centenary balance after: UGX ${dep.balanceAfter.toLocaleString()}`,
            member.full_name,
            dep.amount,
            dep.bankRef,
            dep.at.slice(0, 10),
            actor,
            account.id,
          ]
        );
        await client.query(`UPDATE finance_accounts SET balance=balance+$1, updated_at=NOW() WHERE id=$2`, [
          dep.amount,
          account.id,
        ]);
      }

      if (!existingTx) {
        await client.query(
          `INSERT INTO transactions
            (reference, member_id, type, method, amount, status, external_reference, notes,
             recorded_by, verified_by, verified_at, created_at, receipt_number)
           VALUES ($1,$2,'Savings deposit','Bank transfer',$3,'completed',$4,$5,$6,$6,$7::timestamptz,$7::timestamptz,$8)`,
          [
            txRef,
            member.id,
            dep.amount,
            dep.bankRef,
            `${MARKER} ${dep.at.slice(0, 10)} ${dep.bankNote} (Centenary Co. ${FINANCE_ACCOUNT_NUMBER})`,
            actor,
            dep.at,
            `RCPT-${dep.suffix}-AUG31`,
          ]
        );
        await client.query(`UPDATE members SET savings_balance=savings_balance+$1 WHERE id=$2`, [
          dep.amount,
          member.id,
        ]);
      }
    }

    if (!dryRun) {
      const final = (
        await client.query(`SELECT balance::float AS balance FROM finance_accounts WHERE id=$1`, [account.id])
      ).rows[0];
      if (Math.abs(Number(final.balance) - FINAL_BALANCE) > 0.01) {
        throw new Error(
          `Finance balance mismatch after sync: got ${final.balance}, expected ${FINAL_BALANCE}`
        );
      }
    }

    if (dryRun) {
      await client.query("ROLLBACK");
      console.log("\nDry run complete (rolled back).");
    } else {
      await client.query("COMMIT");
      console.log("\nCommitted successfully.");
    }

    const summary = await pool.query(
      `SELECT COALESCE(SUM(savings_balance),0)::float AS total FROM members WHERE deleted_at IS NULL AND status='active'`
    );
    const fin = await pool.query(
      `SELECT balance::float AS balance FROM finance_accounts WHERE id=$1`,
      [account.id]
    );
    console.log("\n== Summary ==");
    console.log(`  Total member savings: UGX ${Number(summary.rows[0].total).toLocaleString()}`);
    console.log(`  Kwagalana Centenary balance: UGX ${Number(fin.rows[0].balance).toLocaleString()}`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed:", error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
