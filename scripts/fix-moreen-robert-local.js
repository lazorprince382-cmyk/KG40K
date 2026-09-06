#!/usr/bin/env node
"use strict";
/**
 * Correct Ntono Moreen / Tabula Robert mix-up from fuzzy name matching,
 * and ensure Vicent has FY26/27 subscription cleared.
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

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });

async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const moreen = (
      await client.query(
        `SELECT id, full_name, member_number, savings_balance::float AS savings
         FROM members WHERE deleted_at IS NULL AND (
           full_name ILIKE 'Ntono Moreen' OR full_name ILIKE 'Tabula Moreen'
         ) ORDER BY CASE WHEN full_name ILIKE 'Ntono Moreen' THEN 0 ELSE 1 END LIMIT 1`
      )
    ).rows[0];
    const robert = (
      await client.query(
        `SELECT id, full_name, member_number, savings_balance::float AS savings
         FROM members WHERE deleted_at IS NULL AND full_name ILIKE 'Tabula Robert' LIMIT 1`
      )
    ).rows[0];
    if (!moreen || !robert) throw new Error("Moreen or Robert not found");

    console.log(`Moreen before: ${moreen.full_name} ${moreen.savings}`);
    console.log(`Robert before: ${robert.full_name} ${robert.savings}`);

    // Report 29 Aug + 31 Aug deposit 450k each
    await client.query(`UPDATE members SET savings_balance=$1 WHERE id=$2`, [9405259, moreen.id]);
    await client.query(`UPDATE members SET savings_balance=$1 WHERE id=$2`, [9399185, robert.id]);

    // Re-point Moreen's Centenary deposit transaction if it was credited to Robert
    const moreenDep = (
      await client.query(`SELECT id, member_id FROM transactions WHERE reference='DEP-AUG31-MOREEN'`)
    ).rows[0];
    if (moreenDep && Number(moreenDep.member_id) !== Number(moreen.id)) {
      await client.query(`UPDATE transactions SET member_id=$1, notes=COALESCE(notes,'') || ' | reassigned to Moreen' WHERE id=$2`, [
        moreen.id,
        moreenDep.id,
      ]);
      console.log("Reassigned DEP-AUG31-MOREEN to", moreen.full_name);
    }

    const actor =
      (
        await client.query(
          `SELECT id FROM users WHERE email ILIKE 'nakayiza.baraza.olivia@gmail.com' AND active=true LIMIT 1`
        )
      ).rows[0] ||
      (await client.query(`SELECT id FROM users WHERE active=true ORDER BY id LIMIT 1`)).rows[0];

    const policy = (
      await client.query(
        `SELECT EXTRACT(YEAR FROM ends_on)::int AS fy_end_year, starts_on, ends_on
         FROM member_financial_year_policies WHERE status='active' ORDER BY ends_on DESC LIMIT 1`
      )
    ).rows[0];

    for (const member of [moreen, robert, ...(await client.query(
      `SELECT id, full_name, member_number FROM members WHERE full_name ILIKE 'Vicent Gumisiriza' AND deleted_at IS NULL`
    )).rows]) {
      const paid = (
        await client.query(
          `SELECT COALESCE(SUM(amount),0)::float AS subscription
           FROM transactions
           WHERE member_id=$1 AND type='Annual subscription fee' AND status='completed'
             AND (target_fiscal_year=$2 OR (target_fiscal_year IS NULL AND created_at::date BETWEEN $3 AND $4))`,
          [member.id, policy.fy_end_year, policy.starts_on, policy.ends_on]
        )
      ).rows[0];
      const gap = 200000 - Number(paid.subscription || 0);
      if (gap > 0) {
        const ref = `SUB-sync-aug2026-group-status-${member.id}`;
        const exists = (await client.query(`SELECT id FROM transactions WHERE reference=$1`, [ref])).rows[0];
        if (!exists) {
          await client.query(
            `INSERT INTO transactions
              (reference, member_id, type, method, amount, status, notes, recorded_by, verified_by,
               verified_at, created_at, target_fiscal_year, receipt_number)
             VALUES ($1,$2,'Annual subscription fee','Bank transfer',$3,'completed',$4,$5,$5,
               '2026-08-29T12:00:00+03:00','2026-08-29T12:00:00+03:00',$6,$7)`,
            [
              ref,
              member.id,
              gap,
              "sync-aug2026-group-status FY26/27 annual subscription cleared",
              actor.id,
              policy.fy_end_year,
              `RCPT-SUB-${member.member_number}`,
            ]
          );
          console.log("Added subscription for", member.full_name);
        }
      }

      const sharesPaid = (
        await client.query(
          `SELECT COALESCE(SUM(amount),0)::float AS shares
           FROM transactions
           WHERE member_id=$1 AND type='Share purchase' AND status='completed'
             AND (target_fiscal_year=$2 OR (target_fiscal_year IS NULL AND created_at::date BETWEEN $3 AND $4))`,
          [member.id, policy.fy_end_year, policy.starts_on, policy.ends_on]
        )
      ).rows[0];
      const shareGap = 2000000 - Number(sharesPaid.shares || 0);
      if (shareGap > 0) {
        const ref = `SHR-sync-aug2026-group-status-${member.id}`;
        const exists = (await client.query(`SELECT id FROM transactions WHERE reference=$1`, [ref])).rows[0];
        if (!exists) {
          await client.query(
            `INSERT INTO transactions
              (reference, member_id, type, method, amount, status, notes, recorded_by, verified_by,
               verified_at, created_at, target_fiscal_year, receipt_number)
             VALUES ($1,$2,'Share purchase','Bank transfer',$3,'completed',$4,$5,$5,
               '2026-08-29T12:00:00+03:00','2026-08-29T12:00:00+03:00',$6,$7)`,
            [
              ref,
              member.id,
              shareGap,
              "sync-aug2026-group-status FY26/27 share capital cleared",
              actor.id,
              policy.fy_end_year,
              `RCPT-SHR-${member.member_number}`,
            ]
          );
          console.log("Added share purchase for", member.full_name);
        }
      }
      await client.query(`UPDATE members SET share_capital=2000000 WHERE id=$1`, [member.id]);
    }

    // Deactivate placeholder operating account (production used Kwagalana Centenary)
    await client.query(
      `UPDATE finance_accounts SET active=false WHERE account_code='ACC-39402FB0DA8F4CD5' AND active=true`
    );

    await client.query("COMMIT");
    console.log("Fixed Moreen → 9,405,259 and Robert → 9,399,185");
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(e.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
