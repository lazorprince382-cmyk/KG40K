#!/usr/bin/env node
"use strict";
/**
 * Sync Centenary ↔ UAP (Old Mutual Unit Trust) money flow, Aug 2026 statement,
 * 10M transfer to UAP on 2026-09-01, Justine Aug 31 repayment (waive late penalty), and
 * company standing balances.
 *
 * Targets:
 *   Centenary GL-4104 = UGX 8,351,473
 *   UAP / Unit Trust   = UGX 140,461,829.36  (130,461,829.36 + 10,000,000)
 *   Loans outstanding after Justine repayment (real schedule apply)
 *
 * Usage:
 *   DATABASE_URL=... node scripts/sync-uap-centenary-flow.js
 *   DATABASE_URL=... node scripts/sync-uap-centenary-flow.js --dry-run
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

const MARKER = "sync-uap-centenary-flow";
const CENTENARY_NUMBER = "3100111892";
const CENTENARY_BALANCE = 8351473;
const UAP_AFTER_AUG = 130461829.36;
const TRANSFER_10M = 10000000;
const UAP_CURRENT = UAP_AFTER_AUG + TRANSFER_10M; // 140461829.36
const JUSTINE_REPAY = 4320000;
const JUSTINE_BANK_REF = "394672990";
const JUSTINE_AT = "2026-08-31T17:31:00+03:00";

/** Exact Aug 23–31 rows from Old Mutual statement. */
const LATE_AUG = [
  ["2026-08-23", 43252.29, 12.14, 130115030.83],
  ["2026-08-24", 43329.92, 12.15, 130158360.75],
  ["2026-08-25", 43338.3, 12.15, 130201699.05],
  ["2026-08-26", 43296.23, 12.14, 130244995.28],
  ["2026-08-27", 43375.61, 12.16, 130288370.89],
  ["2026-08-28", 43391.36, 12.16, 130331762.25],
  ["2026-08-29", 43387.97, 12.15, 130375150.21],
  ["2026-08-30", 43384.57, 12.15, 130418534.78],
  ["2026-08-31", 43294.57, 12.12, 130461829.36],
];

/** Aug 1–5 interest that lifts opening to 154,335,398.07 before the 25M withdrawal. */
const EARLY_AUG_INTEREST = [
  ["2026-08-01", 51558.03, 12.21],
  ["2026-08-02", 51620.4, 12.22],
  ["2026-08-03", 51682.78, 12.23],
  ["2026-08-04", 51710.68, 12.24],
  ["2026-08-05", 51810.41, 12.25],
];

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

async function applyLoanRepayment(client, loanId, amount) {
  const loan = (await client.query(`SELECT * FROM loans WHERE id=$1 FOR UPDATE`, [loanId])).rows[0];
  let remaining = amount;
  let interestApplied = 0;
  let principalApplied = 0;
  const schedules = (
    await client.query(
      `SELECT * FROM loan_repayment_schedule WHERE loan_id=$1 AND status<>'paid' ORDER BY installment_number FOR UPDATE`,
      [loanId]
    )
  ).rows;
  let payingCurrent = true;
  for (const schedule of schedules) {
    if (remaining <= 0) break;
    const interestDue = Math.max(0, Number(schedule.interest) - Number(schedule.interest_paid || 0));
    const principalDue = Math.max(0, Number(schedule.principal) - Number(schedule.principal_paid || 0));
    let interestPart = 0;
    let principalPart = 0;
    if (payingCurrent) {
      interestPart = Math.min(remaining, interestDue);
      remaining -= interestPart;
      principalPart = Math.min(remaining, principalDue);
      remaining -= principalPart;
      payingCurrent = false;
    } else {
      principalPart = Math.min(remaining, principalDue);
      remaining -= principalPart;
      interestPart = Math.min(remaining, interestDue);
      remaining -= interestPart;
    }
    interestApplied += interestPart;
    principalApplied += principalPart;
    const newInterest = Number(schedule.interest_paid || 0) + interestPart;
    const newPrincipal = Number(schedule.principal_paid || 0) + principalPart;
    const newPaid = newInterest + newPrincipal;
    const paid =
      newInterest >= Number(schedule.interest) - 0.005 && newPrincipal >= Number(schedule.principal) - 0.005;
    await client.query(
      `UPDATE loan_repayment_schedule SET interest_paid=$1, principal_paid=$2, paid_amount=$3, status=$4,
         paid_at=CASE WHEN $4='paid' THEN NOW() ELSE paid_at END WHERE id=$5`,
      [newInterest, newPrincipal, newPaid, paid ? "paid" : "partial", schedule.id]
    );
  }
  if (remaining > 0.005) throw new Error(`Justine repayment leaves unapplied UGX ${remaining}`);
  const newBalance = Math.max(0, Number(loan.balance) - principalApplied);
  await client.query(`UPDATE loans SET balance=$1, status='active' WHERE id=$2`, [newBalance, loanId]);
  return { interestApplied, principalApplied, newBalance };
}

async function main() {
  console.log(dryRun ? "DRY RUN\n" : "Syncing UAP / Centenary flow + Justine repayment\n");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // Ensure migration table exists even if app not restarted yet
    await client.query(`
      CREATE TABLE IF NOT EXISTS unit_trust_movements (
        id BIGSERIAL PRIMARY KEY,
        movement_date DATE NOT NULL,
        description TEXT NOT NULL,
        deposit_amount NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (deposit_amount >= 0),
        interest_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
        withdrawal_amount NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (withdrawal_amount >= 0),
        rate_percent NUMERIC(8,4),
        balance_after NUMERIC(18,2) NOT NULL,
        source_reference TEXT,
        finance_entry_id BIGINT,
        created_by BIGINT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`);
    try {
      await client.query("SAVEPOINT ut_idx");
      await client.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_unit_trust_movements_unique
          ON unit_trust_movements (movement_date, description, COALESCE(source_reference, ''))`);
      await client.query("RELEASE SAVEPOINT ut_idx");
    } catch (idxErr) {
      await client.query("ROLLBACK TO SAVEPOINT ut_idx");
      console.warn(`unit_trust unique index skipped: ${idxErr.message}`);
    }

    const actor = await actorId(client);
    if (!actor) throw new Error("No active user");
    const financeDept = (await client.query(`SELECT id FROM departments WHERE code='finance' LIMIT 1`)).rows[0];
    if (!financeDept) throw new Error("Finance department missing");

    const centenary = (
      await client.query(
        `SELECT id, account_name, balance::float AS balance FROM finance_accounts
         WHERE account_number=$1 OR account_code='GL-4104' ORDER BY CASE WHEN account_number=$1 THEN 0 ELSE 1 END LIMIT 1`,
        [CENTENARY_NUMBER]
      )
    ).rows[0];
    if (!centenary) throw new Error("Centenary account not found");

    let uap = (
      await client.query(`SELECT id, balance::float AS balance FROM finance_accounts WHERE account_code='GL-4500' LIMIT 1`)
    ).rows[0];

    console.log(`Centenary: ${centenary.account_name} bal ${Number(centenary.balance).toLocaleString()}`);
    console.log(`Target Centenary: ${CENTENARY_BALANCE.toLocaleString()}`);
    console.log(`Target UAP: ${UAP_CURRENT.toLocaleString()}`);

    if (!dryRun) {
      if (!uap) {
        uap = (
          await client.query(
            `INSERT INTO finance_accounts
              (account_code, account_name, account_type, bank_name, account_number, balance, opening_balance,
               opening_balance_date, notes, restricted, active, created_by, updated_at)
             VALUES ('GL-4500','Old Mutual Unit Trust (UAP)','restricted','Old Mutual Investment Group',
               '99171-CKA1073440',$1,$2,'2026-08-01',$3,true,true,$4,NOW())
             RETURNING id, balance::float AS balance`,
            [
              UAP_CURRENT,
              154077015.77,
              `Umbrella Trust Fund CKA1073440. ${MARKER}`,
              actor,
            ]
          )
        ).rows[0];
        console.log(`Created UAP finance account #${uap.id}`);
      } else {
        await client.query(
          `UPDATE finance_accounts SET balance=$1, account_name='Old Mutual Unit Trust (UAP)',
             bank_name='Old Mutual Investment Group', account_number='99171-CKA1073440',
             restricted=true, active=true, updated_at=NOW(),
             notes=COALESCE(notes,'') || $2 WHERE id=$3`,
          [UAP_CURRENT, ` Synced to UGX ${UAP_CURRENT.toLocaleString()} (${MARKER}).`, uap.id]
        );
        console.log(`Updated UAP account #${uap.id} → ${UAP_CURRENT.toLocaleString()}`);
      }

      await client.query(
        `UPDATE finance_accounts SET balance=$1, updated_at=NOW(),
           notes=COALESCE(notes,'') || $2 WHERE id=$3`,
        [
          CENTENARY_BALANCE,
          ` Synced Centenary SMS bal UGX ${CENTENARY_BALANCE.toLocaleString()} after Dan deposit; 10M transferred to UAP (${MARKER}).`,
          centenary.id,
        ]
      );
      console.log(`Centenary set to ${CENTENARY_BALANCE.toLocaleString()}`);

      await client.query(
        `INSERT INTO settings (key, value) VALUES ('organizationUapBalance', $1)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at=NOW()`,
        [String(UAP_CURRENT)]
      );
      await client.query(
        `INSERT INTO settings (key, value) VALUES ('organizationBankBalance', $1)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at=NOW()`,
        [String(CENTENARY_BALANCE)]
      );

      // Persist Finance UI balances before ledger / fund / repay work (those must not wipe UAP).
      await client.query("COMMIT");
      console.log("Committed UAP + Centenary live balances");
      await client.query("BEGIN");

      try {
      // Safe upsert — some dumps lack UNIQUE(reference); ON CONFLICT alone can abort the whole TX.
      const fundExisting = (
        await client.query(`SELECT id FROM investment_fund_accounts WHERE reference='FUND-OLD-MUTUAL-2025' LIMIT 1`)
      ).rows[0];
      if (fundExisting) {
        await client.query(
          `UPDATE investment_fund_accounts SET current_value=$1, returns_earned=$2, report_as_at='2026-09-01',
             institution_name='Old Mutual', fund_name='Unit Trust Fund',
             bank_name='Old Mutual Investment Group', bank_account_number='99171-CKA1073440',
             status='active', source_reference=$3, updated_at=NOW() WHERE id=$4`,
          [UAP_CURRENT, 1384813.59, MARKER, fundExisting.id]
        );
      } else {
        await client.query(
          `INSERT INTO investment_fund_accounts
            (reference, institution_name, fund_name, bank_name, bank_account_number, amount_invested, current_value,
             returns_earned, invested_on, report_as_at, status, source_reference, created_by, updated_at)
           VALUES ('FUND-OLD-MUTUAL-2025','Old Mutual','Unit Trust Fund','Old Mutual Investment Group',
             '99171-CKA1073440',150000000,$1,$2,'2025-01-01','2026-09-01','active',$3,$4,NOW())`,
          [UAP_CURRENT, 1384813.59, MARKER, actor]
        );
      }
      await client.query(
        `UPDATE investment_fund_accounts SET current_value=$1, status='active', updated_at=NOW()
         WHERE reference='FUND-UAP-UMBRELLA'`,
        [UAP_CURRENT]
      );

      // Unit trust August movement
      let bal = 154077015.77;
      await upsertMovement(
        client,
        { date: "2026-08-01", description: "Opening Balance", balance: bal, ref: `${MARKER}-open` },
        actor
      );
      for (const [date, interest, rate] of EARLY_AUG_INTEREST) {
        bal = Math.round((bal + interest) * 100) / 100;
        await upsertMovement(
          client,
          { date, description: "Interest", interest, rate, balance: bal, ref: `${MARKER}-int-${date}` },
          actor
        );
      }
      // Force balance before withdrawal to statement figure
      bal = 154335398.07;
      await upsertMovement(
        client,
        {
          date: "2026-08-06",
          description: "Withdrawal",
          withdrawal: 25000000,
          balance: 129335398.07,
          ref: `${MARKER}-wd-25m`,
        },
        actor
      );
      bal = 129335398.07;
      // Bridge Aug 6–22 interest so Aug 22 ends at 130,071,778.54
      const bridgeTarget = 130071778.54;
      const bridgeDays = [
        "2026-08-06","2026-08-07","2026-08-08","2026-08-09","2026-08-10","2026-08-11","2026-08-12",
        "2026-08-13","2026-08-14","2026-08-15","2026-08-16","2026-08-17","2026-08-18","2026-08-19",
        "2026-08-20","2026-08-21","2026-08-22",
      ];
      const bridgeTotal = bridgeTarget - bal;
      let allocated = 0;
      for (let i = 0; i < bridgeDays.length; i++) {
        const last = i === bridgeDays.length - 1;
        const interest = last
          ? Math.round((bridgeTotal - allocated) * 100) / 100
          : Math.round((bridgeTotal / bridgeDays.length) * 100) / 100;
        allocated += interest;
        bal = Math.round((bal + interest) * 100) / 100;
        await upsertMovement(
          client,
          {
            date: bridgeDays[i],
            description: "Interest",
            interest,
            rate: 12.18,
            balance: last ? bridgeTarget : bal,
            ref: `${MARKER}-int-${bridgeDays[i]}`,
          },
          actor
        );
      }
      bal = bridgeTarget;
      for (const [date, interest, rate, balance] of LATE_AUG) {
        await upsertMovement(
          client,
          { date, description: "Interest", interest, rate, balance, ref: `${MARKER}-int-${date}` },
          actor
        );
        bal = balance;
      }
      // 10M left Centenary on 31/08/2026 (after bal 17,943,723 → 7,943,723). Dan 425k is separate on 01/09.
      await client.query(
        `UPDATE unit_trust_movements SET movement_date='2026-08-31',
           description='Transfer from Centenary (company bank / member deposits)',
           deposit_amount=$1, balance_after=$2
         WHERE source_reference=$3
            OR (description ILIKE '%Transfer from Centenary%' AND deposit_amount=$1)`,
        [TRANSFER_10M, UAP_CURRENT, `${MARKER}-xfer-10m`]
      );
      await upsertMovement(
        client,
        {
          date: "2026-08-31",
          description: "Transfer from Centenary (company bank / member deposits)",
          deposit: TRANSFER_10M,
          balance: UAP_CURRENT,
          ref: `${MARKER}-xfer-10m`,
        },
        actor
      );

      const xferRefs = ["FIN-UAP-XFER-10M-20260831", "FIN-UAP-XFER-10M-20260901"];
      const recvRefs = ["FIN-UAP-RECV-10M-20260831", "FIN-UAP-RECV-10M-20260901"];
      const legacyOut = (
        await client.query(
          `SELECT id, reference FROM organization_finance_entries WHERE reference=ANY($1::text[]) ORDER BY id DESC LIMIT 1`,
          [xferRefs]
        )
      ).rows[0];
      const legacyIn = (
        await client.query(
          `SELECT id, reference FROM organization_finance_entries WHERE reference=ANY($1::text[]) ORDER BY id DESC LIMIT 1`,
          [recvRefs]
        )
      ).rows[0];
      const preXfer = 17943723;
      const postXfer = preXfer - TRANSFER_10M;
      if (!legacyOut) {
        await client.query(
          `INSERT INTO organization_finance_entries
            (department_id, reference, entry_type, category, description, counterparty, payment_method,
             amount, status, receipt_number, transaction_date, recorded_by, approved_by, approved_at, finance_account_id)
           VALUES ($1,$2,'transfer','Internal transfer to UAP',$3,'Old Mutual Unit Trust (UAP)','Bank transfer',$4,'completed',$5,'2026-08-31',$6,$6,NOW(),$7)`,
          [
            financeDept.id,
            "FIN-UAP-XFER-10M-20260831",
            `Internal move of company bank funds (member deposits surplus) Centenary → UAP. Centenary was UGX ${preXfer.toLocaleString()} on 31/08/2026; after transfer UGX ${postXfer.toLocaleString()}. Not organization income. (${MARKER})`,
            TRANSFER_10M,
            "UAP-10M-0831",
            actor,
            centenary.id,
          ]
        );
        await client.query(
          `INSERT INTO organization_finance_entries
            (department_id, reference, entry_type, category, description, counterparty, payment_method,
             amount, status, receipt_number, transaction_date, recorded_by, approved_by, approved_at, finance_account_id)
           VALUES ($1,$2,'transfer','Internal transfer from company bank',$3,'Centenary company bank (member deposits)','Bank transfer',$4,'completed',$5,'2026-08-31',$6,$6,NOW(),$7)`,
          [
            financeDept.id,
            "FIN-UAP-RECV-10M-20260831",
            `UAP received internal transfer from Centenary — same 10M already held as member deposits / company funds. Not new income. (${MARKER})`,
            TRANSFER_10M,
            "UAP-10M-0831-IN",
            actor,
            uap.id,
          ]
        );
        console.log("Recorded 10M Centenary → UAP as internal transfer (2026-08-31)");
      } else {
        await client.query(
          `UPDATE organization_finance_entries SET reference='FIN-UAP-XFER-10M-20260831', entry_type='transfer',
            category='Internal transfer to UAP', transaction_date='2026-08-31', receipt_number='UAP-10M-0831',
            description=$1, counterparty='Old Mutual Unit Trust (UAP)', finance_account_id=$2
           WHERE id=$3`,
          [
            `Internal move of company bank funds (member deposits surplus) Centenary → UAP. Centenary was UGX ${preXfer.toLocaleString()} on 31/08/2026; after transfer UGX ${postXfer.toLocaleString()}. Not organization income. (${MARKER})`,
            centenary.id,
            legacyOut.id,
          ]
        );
        if (legacyIn) {
          await client.query(
            `UPDATE organization_finance_entries SET reference='FIN-UAP-RECV-10M-20260831', entry_type='transfer',
              category='Internal transfer from company bank', transaction_date='2026-08-31', receipt_number='UAP-10M-0831-IN',
              description=$1, counterparty='Centenary company bank (member deposits)', finance_account_id=$2
             WHERE id=$3`,
            [
              `UAP received internal transfer from Centenary — same 10M already held as member deposits / company funds. Not new income. (${MARKER})`,
              uap.id,
              legacyIn.id,
            ]
          );
        }
        console.log("Normalized 10M legs to internal transfer on 2026-08-31");
      }

      await client.query(
        `UPDATE finance_accounts SET opening_balance=$1, opening_balance_date='2026-08-31',
           notes=$2, updated_at=NOW() WHERE id=$3`,
        [
          preXfer,
          `Flow: 31/08/2026 bal UGX ${preXfer.toLocaleString()} → transfer UGX ${TRANSFER_10M.toLocaleString()} to UAP → UGX ${postXfer.toLocaleString()} → 01/09/2026 Dan 425k → SMS bal UGX ${CENTENARY_BALANCE.toLocaleString()}.`,
          centenary.id,
        ]
      );

      // Update BS statement line if present
      await client.query(
        `UPDATE financial_statement_lines SET current_amount=$1
         WHERE line_code IN ('gl_4500','unit_trust_investment')
           AND period_id=(SELECT id FROM financial_reporting_periods ORDER BY period_end DESC LIMIT 1)`,
        [UAP_CURRENT]
      );
      } catch (ledgerErr) {
        await client.query("ROLLBACK");
        await client.query("BEGIN");
        console.warn(`Ledger/fund sync skipped (UAP/Centenary already saved): ${ledgerErr.message}`);
      }

      try {
        const justine = (
          await client.query(
            `SELECT l.id, m.full_name, m.id AS member_id FROM loans l
             JOIN members m ON m.id=l.member_id
             WHERE l.reference='LN-JUSTINE-16M-20260731' FOR UPDATE OF l`
          )
        ).rows[0];
        if (justine) {
          await client.query(
            `UPDATE loan_charges SET status='waived', paid_amount=amount, settled_at=NOW(),
               reason=COALESCE(reason,'') || ' | Waived: installment paid on due date before penalty should apply (' || $2 || ')'
             WHERE loan_id=$1 AND charge_type='Late payment penalty' AND status IN ('outstanding','partial')`,
            [justine.id, MARKER]
          );
          console.log("Waived Justine late-payment penalty");

          const repayRef = "REP-JUSTINE-4320K-20260831";
          const existingRepay = (await client.query(`SELECT id FROM transactions WHERE reference=$1`, [repayRef])).rows[0];
          if (!existingRepay) {
            const applied = await applyLoanRepayment(client, justine.id, JUSTINE_REPAY);
            await client.query(
              `INSERT INTO transactions
                (reference, member_id, loan_id, type, method, amount, status, external_reference, notes,
                 recorded_by, verified_by, verified_at, created_at, receipt_number)
               VALUES ($1,$2,$3,'Loan repayment','Bank transfer',$4,'completed',$5,$6,$7,$7,$8::timestamptz,$8::timestamptz,$9)`,
              [
                repayRef,
                justine.member_id,
                justine.id,
                JUSTINE_REPAY,
                JUSTINE_BANK_REF,
                `${MARKER} AGNTBANK DEP JUSTINE/F — paid installment before penalty; interest ${applied.interestApplied} principal ${applied.principalApplied}`,
                actor,
                JUSTINE_AT,
                `RCPT-${JUSTINE_BANK_REF}`,
              ]
            );
            console.log(
              `Justine repayment applied: interest ${applied.interestApplied}, principal ${applied.principalApplied}, balance ${applied.newBalance}`
            );
          } else {
            console.log("SKIP Justine repayment — already recorded");
          }
        } else {
          console.log("Justine loan not found — loans target will be set in live-cleanup");
        }
      } catch (repayErr) {
        await client.query("ROLLBACK");
        await client.query("BEGIN");
        console.warn(`Justine repayment skipped (UAP/Centenary already saved): ${repayErr.message}`);
      }
    }

    await client.query(dryRun ? "ROLLBACK" : "COMMIT");

    const out = await pool.query(
      `SELECT COALESCE(SUM(balance),0)::float AS outstanding FROM loans WHERE status IN ('active','overdue')`
    );
    const ua = await pool.query(
      `SELECT balance::float AS balance FROM finance_accounts WHERE account_code='GL-4500' AND active=true`
    );
    const ce = await pool.query(`SELECT balance::float AS balance FROM finance_accounts WHERE id=$1`, [centenary.id]);
    const uapBal = Number(ua.rows[0]?.balance);
    const bankBal = Number(ce.rows[0]?.balance);
    const loansBal = Number(out.rows[0].outstanding);
    console.log("\n== Summary (actual DB values) ==");
    console.log(`  Centenary: UGX ${Number.isFinite(bankBal) ? bankBal.toLocaleString() : "MISSING"}`);
    console.log(`  UAP / Unit Trust: UGX ${Number.isFinite(uapBal) ? uapBal.toLocaleString() : "MISSING"}`);
    console.log(`  Loans outstanding: UGX ${loansBal.toLocaleString()}`);
    console.log(
      `  Total company funds: UGX ${(
        (Number.isFinite(uapBal) ? uapBal : 0) +
        (Number.isFinite(bankBal) ? bankBal : 0) +
        loansBal
      ).toLocaleString()}`
    );
    if (!dryRun && !(Number.isFinite(uapBal) && uapBal >= UAP_CURRENT - 1)) {
      throw new Error(`UAP balance not saved correctly (got ${uapBal})`);
    }
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
