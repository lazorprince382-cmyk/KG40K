"use strict";

const JUDE_SURPLUS_KEY = "judeOctoberSurplusToShares202610";
const JUDE_SURPLUS = 883010;

function isComputerTechnician(user) {
  return user && user.role === "System Admin";
}

async function applyJudeOctoberSurplusToShares(client) {
  const member = (
    await client.query(
      `SELECT id, full_name, member_number, savings_balance::float AS savings, share_capital::float AS shares
       FROM members
       WHERE deleted_at IS NULL AND full_name ILIKE '%jude%' AND full_name ILIKE '%kyobe%'
       ORDER BY id LIMIT 1 FOR UPDATE`
    )
  ).rows[0];
  if (!member) return "Jude not found";
  const shareTx = (
    await client.query(
      `SELECT id, amount::float FROM transactions
       WHERE reference='SHR-JUDE-OCT-SURPLUS-883010' AND status IN ('completed','verified','approved')
       LIMIT 1`
    )
  ).rows[0];
  const savings = Number(member.savings || 0);
  const surplusStillInSavings = savings + 0.5 >= 10783010;
  if (!surplusStillInSavings && shareTx) return null;
  const take = Math.min(JUDE_SURPLUS, Math.max(0, savings));
  if (surplusStillInSavings && take < 0.5) return `${member.full_name} had no savings left to move`;
  const recorder = (
    await client.query(
      `SELECT id FROM users WHERE active=true
       ORDER BY CASE role WHEN 'System Admin' THEN 1 WHEN 'Finance Officer' THEN 2 ELSE 3 END, id LIMIT 1`
    )
  ).rows[0];
  const yearRow = (
    await client.query(
      `SELECT EXTRACT(YEAR FROM ends_on)::int AS year
       FROM member_financial_year_policies WHERE status='active'
         AND '2026-10-30'::date BETWEEN starts_on AND ends_on
       ORDER BY starts_on DESC LIMIT 1`
    )
  ).rows[0];
  if (surplusStillInSavings) {
    await client.query("UPDATE members SET savings_balance=GREATEST(0,savings_balance-$1) WHERE id=$2", [take, member.id]);
  }
  if (!shareTx) {
    await client.query("UPDATE members SET share_capital=share_capital+$1 WHERE id=$2", [take, member.id]);
    await client.query(
      `INSERT INTO transactions
        (reference,member_id,type,method,amount,status,notes,recorded_by,verified_by,verified_at,created_at,receipt_number,target_fiscal_year,submission_source)
       VALUES ($1,$2,'Share purchase','Savings transfer',$3,'completed',$4,$5,$5,NOW(),'2026-10-30 12:00:00+03',$6,$7,'system')`,
      [
        `SHR-JUDE-OCT-SURPLUS-883010`,
        member.id,
        take,
        `October 2026 surplus UGX ${take.toLocaleString()} moved from savings to annual share contribution. Expected 9,900,000; paid up 10,783,010. Not posted again to Centenary.`,
        recorder?.id || null,
        `RCPT-JUDE-SHR-883010`,
        yearRow?.year || 2027,
      ]
    );
  }
  await client.query(
    `INSERT INTO settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`,
    [JUDE_SURPLUS_KEY, String(Math.round(take || Number(shareTx?.amount || JUDE_SURPLUS)))]
  );
  if (surplusStillInSavings) {
    return `${member.full_name}: UGX ${take.toLocaleString()} taken off savings${shareTx ? " (shares already recorded)" : " → annual shares"}`;
  }
  return `${member.full_name}: annual shares recorded`;
}

const RALPH_SHARES_KEY = "ralphShareCapitalPlus40000-20261104";
const RALPH_SHARES_REF = "SHR-RALPH-40000-20261104";
const RALPH_SHARES_ADD = 40000;

async function applyRalphShareCapital40000(client) {
  if ((await client.query("SELECT 1 FROM settings WHERE key=$1", [RALPH_SHARES_KEY])).rows[0]) return null;
  const member = (
    await client.query(
      `SELECT id, full_name, share_capital::float AS shares
       FROM members
       WHERE deleted_at IS NULL AND full_name ILIKE '%ralph%' AND full_name ILIKE '%masaba%'
       ORDER BY id LIMIT 1 FOR UPDATE`
    )
  ).rows[0];
  if (!member) {
    await client.query(
      `INSERT INTO settings (key,value) VALUES ($1,'skipped-member-missing') ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`,
      [RALPH_SHARES_KEY]
    );
    return "Ralph Masaba not found";
  }
  const already = (
    await client.query(
      `SELECT id FROM transactions WHERE reference=$1 AND status IN ('completed','verified','approved') LIMIT 1`,
      [RALPH_SHARES_REF]
    )
  ).rows[0];
  if (already) {
    await client.query(
      `INSERT INTO settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`,
      [RALPH_SHARES_KEY, String(member.id)]
    );
    return null;
  }
  const recorder = (
    await client.query(
      `SELECT id FROM users WHERE active=true
       ORDER BY CASE role WHEN 'System Admin' THEN 1 WHEN 'Finance Officer' THEN 2 ELSE 3 END, id LIMIT 1`
    )
  ).rows[0];
  if (!recorder) return "No user to record Ralph share capital";
  await client.query("UPDATE members SET share_capital=share_capital+$1 WHERE id=$2", [RALPH_SHARES_ADD, member.id]);
  await client.query(
    `INSERT INTO transactions
      (reference,member_id,type,method,amount,status,notes,recorded_by,verified_by,verified_at,created_at,receipt_number,submission_source)
     VALUES ($1,$2,'Share purchase','Book adjustment',$3,'completed',$4,$5,$5,NOW(),NOW(),$6,'system')`,
    [
      RALPH_SHARES_REF,
      member.id,
      RALPH_SHARES_ADD,
      `UGX ${RALPH_SHARES_ADD.toLocaleString()} added to share capital on the member card. Centenary unchanged.`,
      recorder.id,
      "RCPT-RALPH-SHR-40000",
    ]
  );
  await client.query(
    `INSERT INTO settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=NOW()`,
    [RALPH_SHARES_KEY, JSON.stringify({ memberId: member.id, added: RALPH_SHARES_ADD })]
  );
  return `${member.full_name}: UGX ${RALPH_SHARES_ADD.toLocaleString()} added to share capital (Centenary unchanged)`;
}

function registerTechnicianApi({
  app,
  auth,
  asyncRoute,
  query,
  one,
  transaction,
  audit,
  metadata,
  reference,
  receiptReference,
}) {
  function requireTechnician() {
    return asyncRoute(async (req, res, next) => {
      if (!isComputerTechnician(req.user)) return res.status(403).json({ error: "Sign in as the computer technician (System Admin)" });
      next();
    });
  }

  app.get("/api/technician/command-center", auth, requireTechnician(), asyncRoute(async (req, res) => {
    const members = (
      await query(
        `SELECT m.id, m.member_number AS "memberNumber", m.full_name AS name, m.status,
           m.savings_balance::float AS savings, m.share_capital::float AS shares,
           m.phone, m.joined_at AS "joinedAt"
         FROM members m WHERE m.deleted_at IS NULL ORDER BY m.full_name`
      )
    ).rows;
    const bank = Number((await one(`SELECT balance::float AS balance FROM finance_accounts WHERE account_code='GL-4104' AND active=true`))?.balance || 0);
    const uap = Number((await one(`SELECT balance::float AS balance FROM finance_accounts WHERE account_code='GL-4500' AND active=true`))?.balance || 0);
    const totals = members.reduce(
      (sum, row) => {
        if (row.status === "active") {
          sum.savings += Number(row.savings || 0);
          sum.shares += Number(row.shares || 0);
          sum.active += 1;
        }
        return sum;
      },
      { savings: 0, shares: 0, active: 0 }
    );
    const recent = (
      await query(
        `SELECT t.id, t.reference, t.type, t.method, t.amount::float, t.status, t.notes, t.created_at AS "createdAt",
           m.full_name AS member, m.member_number AS "memberNumber"
         FROM transactions t JOIN members m ON m.id=t.member_id
         WHERE t.method IN ('Savings transfer','Technician adjustment')
            OR t.submission_source='technician'
         ORDER BY t.id DESC LIMIT 40`
      )
    ).rows;
    const judeMove = (await one(`SELECT value FROM settings WHERE key=$1`, [JUDE_SURPLUS_KEY]))?.value || null;
    res.json({
      members,
      recent,
      judeOctoberSurplus: { amount: JUDE_SURPLUS, posted: judeMove },
      stats: {
        activeMembers: totals.active,
        totalSavings: totals.savings,
        totalShares: totals.shares,
        bankBalance: bank,
        uapBalance: uap,
      },
    });
  }));

  app.post("/api/technician/books", auth, requireTechnician(), asyncRoute(async (req, res) => {
    const b = req.body || {};
    const memberId = Number(b.memberId);
    if (!Number.isInteger(memberId)) return res.status(400).json({ error: "Select a member" });
    const action = String(b.action || "set").toLowerCase();
    const note = String(b.note || "").trim();
    const onDate = String(b.date || "").trim() || new Date().toISOString().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(onDate)) return res.status(400).json({ error: "Use a valid date" });
    const result = await transaction(async (client) => {
      const member = (
        await client.query(
          `SELECT id, full_name, member_number, savings_balance::float AS savings, share_capital::float AS shares
           FROM members WHERE id=$1 AND deleted_at IS NULL FOR UPDATE`,
          [memberId]
        )
      ).rows[0];
      if (!member) {
        const error = new Error("Member not found");
        error.status = 404;
        throw error;
      }
      const yearRow = (
        await client.query(
          `SELECT EXTRACT(YEAR FROM ends_on)::int AS year
           FROM member_financial_year_policies WHERE status='active' AND $1::date BETWEEN starts_on AND ends_on
           ORDER BY starts_on DESC LIMIT 1`,
          [onDate]
        )
      ).rows[0];
      const stamp = `${member.id}-${Date.now().toString(36).toUpperCase()}`;
      const changes = [];
      const insertTx = async ({ type, amount, method, notes }) => {
        if (Math.abs(Number(amount)) < 0.5) return;
        await client.query(
          `INSERT INTO transactions
            (reference,member_id,type,method,amount,status,notes,recorded_by,verified_by,verified_at,created_at,receipt_number,target_fiscal_year,submission_source)
           VALUES ($1,$2,$3,$4,$5,'completed',$6,$7,$7,NOW(),$8::timestamptz,$9,$10,'technician')`,
          [
            reference("TECH"),
            member.id,
            type,
            method,
            Math.abs(Number(amount)),
            notes,
            req.user.id,
            `${onDate}T12:00:00+03`,
            receiptReference("RCPT"),
            yearRow?.year || null,
          ]
        );
      };

      if (action === "transfer") {
        const from = String(b.from || "").toLowerCase();
        const to = String(b.to || "").toLowerCase();
        const amount = Number(b.amount);
        if (!["savings", "shares"].includes(from) || !["savings", "shares"].includes(to) || from === to)
          throw Object.assign(new Error("Choose different from and to books"), { status: 400 });
        if (!Number.isFinite(amount) || amount <= 0) throw Object.assign(new Error("Enter a positive amount"), { status: 400 });
        const available = from === "savings" ? Number(member.savings) : Number(member.shares);
        if (amount > available + 0.004)
          throw Object.assign(new Error(`Only UGX ${available.toLocaleString()} is available in ${from}`), { status: 400 });
        if (from === "savings") await client.query("UPDATE members SET savings_balance=savings_balance-$1 WHERE id=$2", [amount, member.id]);
        else await client.query("UPDATE members SET share_capital=GREATEST(0,share_capital-$1) WHERE id=$2", [amount, member.id]);
        if (to === "savings") await client.query("UPDATE members SET savings_balance=savings_balance+$1 WHERE id=$2", [amount, member.id]);
        else await client.query("UPDATE members SET share_capital=share_capital+$1 WHERE id=$2", [amount, member.id]);
        if (to === "shares") {
          await insertTx({
            type: "Share purchase",
            amount,
            method: "Savings transfer",
            notes: note || `Moved UGX ${amount.toLocaleString()} from ${from} to annual share contribution. ${stamp}. Centenary unchanged.`,
          });
        } else {
          await insertTx({
            type: "Savings deposit",
            amount,
            method: "Savings transfer",
            notes: note || `Moved UGX ${amount.toLocaleString()} from ${from} to savings. ${stamp}. Centenary unchanged.`,
          });
        }
        changes.push(`UGX ${amount.toLocaleString()} ${from} → ${to}`);
      } else {
        const nextSavings = b.savings === "" || b.savings == null ? null : Number(b.savings);
        const nextShares = b.shares === "" || b.shares == null ? null : Number(b.shares);
        if (nextSavings != null && (!Number.isFinite(nextSavings) || nextSavings < 0))
          throw Object.assign(new Error("Savings must be zero or more"), { status: 400 });
        if (nextShares != null && (!Number.isFinite(nextShares) || nextShares < 0))
          throw Object.assign(new Error("Share capital must be zero or more"), { status: 400 });
        if (nextSavings == null && nextShares == null)
          throw Object.assign(new Error("Enter a new savings or share amount"), { status: 400 });
        if (nextSavings != null) {
          const delta = Math.round((nextSavings - Number(member.savings)) * 100) / 100;
          await client.query("UPDATE members SET savings_balance=$1 WHERE id=$2", [nextSavings, member.id]);
          if (Math.abs(delta) > 0.004) {
            await insertTx({
              type: delta > 0 ? "Savings deposit" : "Savings adjustment",
              amount: Math.abs(delta),
              method: "Technician adjustment",
              notes: note || `Computer technician set savings from UGX ${Number(member.savings).toLocaleString()} to UGX ${nextSavings.toLocaleString()}. ${stamp}. Centenary unchanged.`,
            });
            changes.push(`savings ${Number(member.savings).toLocaleString()} → ${nextSavings.toLocaleString()}`);
          }
        }
        if (nextShares != null) {
          const delta = Math.round((nextShares - Number(member.shares)) * 100) / 100;
          await client.query("UPDATE members SET share_capital=$1 WHERE id=$2", [nextShares, member.id]);
          if (delta > 0.004) {
            await insertTx({
              type: "Share purchase",
              amount: delta,
              method: "Technician adjustment",
              notes: note || `Computer technician set share capital from UGX ${Number(member.shares).toLocaleString()} to UGX ${nextShares.toLocaleString()}. ${stamp}. Centenary unchanged.`,
            });
          }
          if (Math.abs(delta) > 0.004) changes.push(`shares ${Number(member.shares).toLocaleString()} → ${nextShares.toLocaleString()}`);
        }
      }
      const updated = (
        await client.query(
          `SELECT id, full_name AS name, member_number AS "memberNumber", savings_balance::float AS savings, share_capital::float AS shares
           FROM members WHERE id=$1`,
          [member.id]
        )
      ).rows[0];
      return { member: updated, changes };
    });
    await audit({
      userId: req.user.id,
      action: "TECHNICIAN_MEMBER_BOOKS",
      entityType: "member",
      entityId: String(memberId),
      details: result.changes.join("; ") || "no change",
      ...metadata(req),
    });
    res.json({ ok: true, message: result.changes.join("; ") || "No change", member: result.member });
  }));
}

module.exports = {
  isComputerTechnician,
  applyJudeOctoberSurplusToShares,
  applyRalphShareCapital40000,
  registerTechnicianApi,
};
