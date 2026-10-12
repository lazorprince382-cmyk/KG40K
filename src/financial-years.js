"use strict";
/**
 * Member financial years (1 July – 30 June). When today falls outside every active year,
 * the next year is opened automatically using the latest year's targets, so the member
 * dashboard, deposits and schedules roll over without manual setup.
 */
const { query, one } = require("./db");

const TODAY = "(CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Kampala')::date";
const EDIT_ROLES = new Set(["Executive Officer", "Finance Officer", "System Admin"]);
const labelFor = (startYear) => `${startYear}/${String(startYear + 1).slice(-2)}`;

async function ensureFinancialYears(runner = { query }) {
  for (let i = 0; i < 5; i += 1) {
    const covered = (await runner.query(`SELECT 1 FROM member_financial_year_policies
      WHERE status='active' AND ${TODAY} BETWEEN starts_on AND ends_on LIMIT 1`)).rows[0];
    if (covered) return;
    const pending = (await runner.query(`SELECT id FROM member_financial_year_policies
      WHERE status='draft' AND ${TODAY} BETWEEN starts_on AND ends_on ORDER BY starts_on LIMIT 1`)).rows[0];
    if (pending) {
      await runner.query("UPDATE member_financial_year_policies SET status='active' WHERE id=$1", [pending.id]);
      continue;
    }
    const created = await createNextYear(runner, "active");
    if (!created) return;
  }
}

async function createNextYear(runner = { query }, status = "draft") {
  const last = (await runner.query(`SELECT starts_on,ends_on,monthly_savings_target,annual_share_target,annual_subscription_fee,
      (ends_on+1) AS next_start, EXTRACT(YEAR FROM ends_on+1)::int AS next_year
    FROM member_financial_year_policies ORDER BY starts_on DESC LIMIT 1`)).rows[0];
  if (!last) return null;
  return (await runner.query(`INSERT INTO member_financial_year_policies
      (fiscal_year_label,starts_on,ends_on,monthly_savings_target,annual_share_target,annual_subscription_fee,status)
    VALUES ($1,$2::date,($2::date+INTERVAL '1 year'-INTERVAL '1 day')::date,$3,$4,$5,$6)
    ON CONFLICT DO NOTHING
    RETURNING id,fiscal_year_label AS "fiscalYear"`,
  [labelFor(Number(last.next_year)), last.next_start, last.monthly_savings_target, last.annual_share_target,
    last.annual_subscription_fee, status])).rows[0] || null;
}

async function listFinancialYears() {
  await ensureFinancialYears();
  return (await query(`SELECT id,fiscal_year_label AS "fiscalYear",starts_on AS "startsOn",ends_on AS "endsOn",
      EXTRACT(YEAR FROM ends_on)::int AS "endYear",monthly_savings_target::float AS "monthlySavingsTarget",
      annual_share_target::float AS "annualShareTarget",annual_subscription_fee::float AS "annualSubscriptionFee",status,
      (${TODAY} BETWEEN starts_on AND ends_on) AS current,(ends_on<${TODAY}) AS closed
    FROM member_financial_year_policies ORDER BY starts_on DESC`)).rows;
}

module.exports = function registerFinancialYears({ app, auth, asyncRoute, audit, metadata }) {
  app.get("/api/financial-years", auth, asyncRoute(async (req, res) => {
    res.json({ years: await listFinancialYears(), canEdit: EDIT_ROLES.has(req.user.role) });
  }));

  app.post("/api/financial-years/next", auth, asyncRoute(async (req, res) => {
    if (!EDIT_ROLES.has(req.user.role)) return res.status(403).json({ error: "Only Executive or Finance can open a financial year" });
    const created = await createNextYear();
    if (!created) return res.status(409).json({ error: "Could not open the next financial year" });
    await audit({ userId: req.user.id, action: "FINANCIAL_YEAR_OPENED", entityType: "financial_year", entityId: String(created.id), details: created.fiscalYear, ...metadata(req) });
    res.status(201).json(created);
  }));

  app.patch("/api/financial-years/:id", auth, asyncRoute(async (req, res) => {
    if (!EDIT_ROLES.has(req.user.role)) return res.status(403).json({ error: "Only Executive or Finance can change financial-year targets" });
    const row = await one(`SELECT id,fiscal_year_label AS "fiscalYear",(ends_on<${TODAY}) AS closed FROM member_financial_year_policies WHERE id=$1`, [req.params.id]);
    if (!row) return res.status(404).json({ error: "Financial year not found" });
    if (row.closed) return res.status(409).json({ error: "A closed financial year cannot be changed" });
    const fields = { annualSubscriptionFee: "annual_subscription_fee", annualShareTarget: "annual_share_target", monthlySavingsTarget: "monthly_savings_target" };
    const sets = [], values = [];
    for (const [key, column] of Object.entries(fields)) {
      if (req.body[key] === undefined || req.body[key] === "") continue;
      const value = Number(req.body[key]);
      if (!Number.isFinite(value) || value < 0) return res.status(400).json({ error: "Targets must be zero or more" });
      values.push(value); sets.push(`${column}=$${values.length}`);
    }
    if (!sets.length) return res.status(400).json({ error: "Nothing to change" });
    values.push(row.id);
    await query(`UPDATE member_financial_year_policies SET ${sets.join(",")} WHERE id=$${values.length}`, values);
    await audit({ userId: req.user.id, action: "FINANCIAL_YEAR_UPDATED", entityType: "financial_year", entityId: String(row.id), details: `${row.fiscalYear}: ${JSON.stringify(req.body)}`, ...metadata(req) });
    res.json({ ok: true });
  }));
};
module.exports.ensureFinancialYears = ensureFinancialYears;
