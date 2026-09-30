"use strict";
/**
 * Monthly savings schedule shared by the member dashboard and the monthly welfare charge.
 * Everyone was expected to hold the benchmark (UGX 9,100,000) at the end of August 2026;
 * every month after that adds the combined monthly contribution (UGX 425,000, of which
 * UGX 25,000 goes to welfare). Members who joined during the current financial year owe
 * the combined amount from their join month instead.
 */
const { query } = require("./db");

const DEFAULT_BENCHMARK_AMOUNT = 9100000;
const DEFAULT_BENCHMARK_DATE = "2026-08-31";

const monthIndex = (value) => {
  const [year, month] = String(value).split("-").map(Number);
  return year * 12 + (month - 1);
};
const monthKey = (index) => `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, "0")}`;
const monthLabel = (index) => new Date(Date.UTC(Math.floor(index / 12), index % 12, 1))
  .toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

async function loadScheduleSettings(runner = { query }) {
  const rows = (await runner.query(`SELECT key, value FROM settings WHERE key = ANY($1::text[])`, [[
    "savingsBenchmarkAmount", "savingsBenchmarkDate", "monthlyCombinedContribution", "monthlyWelfareContribution",
  ]])).rows;
  const setting = Object.fromEntries(rows.map((row) => [row.key, row.value]));
  const benchmarkDate = /^\d{4}-\d{2}-\d{2}$/.test(String(setting.savingsBenchmarkDate || ""))
    ? setting.savingsBenchmarkDate : DEFAULT_BENCHMARK_DATE;
  const months = (await runner.query(`SELECT
      to_char((CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Kampala')::date,'YYYY-MM') AS current,
      (SELECT to_char(starts_on,'YYYY-MM') FROM member_financial_year_policies
        WHERE status='active' AND (CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Kampala')::date BETWEEN starts_on AND ends_on
        ORDER BY starts_on DESC LIMIT 1) AS "yearStart",
      (SELECT to_char(ends_on,'YYYY-MM') FROM member_financial_year_policies
        WHERE status='active' AND (CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Kampala')::date BETWEEN starts_on AND ends_on
        ORDER BY starts_on DESC LIMIT 1) AS "yearEnd"`)).rows[0];
  const welfareAmount = Number(setting.monthlyWelfareContribution || 25000);
  return {
    benchmarkAmount: Number(setting.savingsBenchmarkAmount || DEFAULT_BENCHMARK_AMOUNT),
    benchmarkDate,
    benchmarkMonth: monthIndex(benchmarkDate),
    monthlyTarget: Number(setting.monthlyCombinedContribution || 425000),
    welfareAmount: Number.isFinite(welfareAmount) && welfareAmount > 0 ? welfareAmount : 25000,
    currentMonth: monthIndex(months.current),
    yearStartMonth: monthIndex(months.yearStart || "2026-07"),
    yearEndMonth: monthIndex(months.yearEnd || "2027-06"),
  };
}

/** Savings a member should hold by the end of `month` (savings + welfare taken since the benchmark). */
function expectedAtEndOf(settings, joinMonth, month) {
  const joinedThisYear = joinMonth !== null && joinMonth >= settings.yearStartMonth;
  const expected = joinedThisYear
    ? settings.monthlyTarget * Math.max(0, month - joinMonth + 1)
    : settings.benchmarkAmount + settings.monthlyTarget * (month - settings.benchmarkMonth);
  return Math.max(0, expected);
}

/** Welfare charged since the benchmark still counts toward the member's monthly contribution. */
const WELFARE_SINCE_BENCHMARK_SQL = `COALESCE((SELECT SUM(c.amount) FROM welfare_contributions c
  WHERE c.member_id=m.id AND c.status IN ('verified','completed','recorded') AND c.amount>0
    AND c.contribution_type NOT ILIKE '%standing%' AND COALESCE(c.reference,'') NOT LIKE 'WEL-STANDING-%'
    AND c.contribution_date > $1::date),0)::float`;

function buildSchedule(settings, { savings, welfareSinceBenchmark, joinMonth }) {
  const { currentMonth, yearStartMonth, yearEndMonth, benchmarkMonth, monthlyTarget, benchmarkAmount } = settings;
  const joinedThisYear = joinMonth !== null && joinMonth >= yearStartMonth;
  const contributed = Number(savings || 0) + Number(welfareSinceBenchmark || 0);
  const requiredByMonthEnd = expectedAtEndOf(settings, joinMonth, currentMonth);
  const variance = contributed - requiredByMonthEnd;
  const yearStartBenchmark = expectedAtEndOf(settings, joinMonth, yearStartMonth - 1);
  const yearEndTarget = expectedAtEndOf(settings, joinMonth, yearEndMonth);
  const monthsCoveredAhead = variance > 0 && monthlyTarget > 0 ? Math.floor((variance + 0.5) / monthlyTarget) : 0;
  const nextPaymentMonth = variance < -0.5 ? currentMonth : currentMonth + monthsCoveredAhead + 1;
  const nextPaymentAmount = variance < -0.5
    ? -variance
    : Math.max(0, monthlyTarget - (variance - monthsCoveredAhead * monthlyTarget));
  return {
    benchmarkAmount,
    benchmarkLabel: `end of ${monthLabel(benchmarkMonth)}`,
    joinedThisYear,
    joinLabel: joinMonth !== null ? monthLabel(joinMonth) : null,
    monthLabel: monthLabel(currentMonth),
    monthlyTarget,
    savingsBalance: contributed,
    requiredByMonthEnd,
    shortBy: Math.max(0, -variance),
    surplus: Math.max(0, variance),
    yearEndLabel: monthLabel(yearEndMonth),
    yearEndTarget,
    remainingToYearEnd: Math.max(0, yearEndTarget - contributed),
    monthsLeftInYear: Math.max(0, yearEndMonth - currentMonth + 1),
    savingsPaidTowardYear: Math.max(0, contributed - yearStartBenchmark),
    monthsCoveredAhead,
    coveredThroughLabel: monthsCoveredAhead > 0 ? monthLabel(currentMonth + monthsCoveredAhead) : null,
    nextPaymentLabel: monthLabel(nextPaymentMonth),
    nextPaymentAmount: Math.round(nextPaymentAmount),
  };
}

async function loadMemberSchedule(memberId, runner = { query }) {
  const settings = await loadScheduleSettings(runner);
  const row = (await runner.query(`SELECT m.savings_balance::float AS savings, to_char(m.joined_at,'YYYY-MM') AS "joinMonth",
      ${WELFARE_SINCE_BENCHMARK_SQL} AS "welfareSinceBenchmark"
    FROM members m WHERE m.id=$2`, [settings.benchmarkDate, memberId])).rows[0];
  if (!row) return null;
  return buildSchedule(settings, {
    savings: row.savings,
    welfareSinceBenchmark: row.welfareSinceBenchmark,
    joinMonth: row.joinMonth ? monthIndex(row.joinMonth) : null,
  });
}

/**
 * When a member's savings already cover the whole current month, take that month's
 * welfare from their savings so they are not skipped for making no new deposit.
 */
async function chargeWelfareFromCoveredSavings(client) {
  const settings = await loadScheduleSettings(client);
  if (settings.currentMonth <= settings.benchmarkMonth) return [];
  const period = monthKey(settings.currentMonth);
  const recorder = (await client.query(`SELECT id FROM users WHERE active=true
    ORDER BY CASE role WHEN 'Finance Officer' THEN 1 WHEN 'System Admin' THEN 2 WHEN 'Welfare Officer' THEN 3 ELSE 4 END, id LIMIT 1`)).rows[0];
  if (!recorder) return [];
  const candidates = (await client.query(`SELECT m.id, m.full_name AS name, m.savings_balance::float AS savings,
      to_char(m.joined_at,'YYYY-MM') AS "joinMonth", ${WELFARE_SINCE_BENCHMARK_SQL} AS "welfareSinceBenchmark"
    FROM members m
    WHERE m.deleted_at IS NULL AND m.status='active'
      AND NOT EXISTS (SELECT 1 FROM welfare_contributions c
        WHERE c.member_id=m.id AND c.status IN ('verified','completed','recorded') AND c.amount>0
          AND c.contribution_type NOT ILIKE '%standing%' AND COALESCE(c.reference,'') NOT LIKE 'WEL-STANDING-%'
          AND (c.period=$2 OR to_char(c.contribution_date,'YYYY-MM')=$2))
    FOR UPDATE OF m`, [settings.benchmarkDate, period])).rows;
  const charged = [];
  for (const member of candidates) {
    const joinMonth = member.joinMonth ? monthIndex(member.joinMonth) : null;
    const contributed = Number(member.savings) + Number(member.welfareSinceBenchmark);
    const required = expectedAtEndOf(settings, joinMonth, settings.currentMonth);
    if (contributed < required || Number(member.savings) < settings.welfareAmount) continue;
    const reference = `WCON-AUTO-${period}-${member.id}`;
    await client.query("SAVEPOINT auto_welfare");
    try {
      await client.query(`INSERT INTO welfare_contributions
        (reference,member_id,contribution_type,period,expected_amount,amount,payment_method,receipt_number,status,
         contribution_date,recorded_by,verified_by,verified_at,verification_comment)
        VALUES ($1,$2,'Monthly Welfare Contribution',$3,$4,$4,'Savings surplus',$5,'verified',
          (CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Kampala')::date,$6,$6,NOW(),$7)`,
        [reference, member.id, period, settings.welfareAmount, `WRCPT-AUTO-${period}-${member.id}`, recorder.id,
          `Taken automatically from savings surplus: savings already cover ${monthLabel(settings.currentMonth)}`]);
      await client.query("UPDATE members SET savings_balance=savings_balance-$1 WHERE id=$2", [settings.welfareAmount, member.id]);
      await client.query(`INSERT INTO settings (key,value) VALUES ('welfareFundBalance',$1)
        ON CONFLICT (key) DO UPDATE SET value=(COALESCE(NULLIF(settings.value,''),'0')::numeric+$2)::text, updated_at=NOW()`,
        [String(settings.welfareAmount), settings.welfareAmount]);
      await client.query("RELEASE SAVEPOINT auto_welfare");
      charged.push({ memberId: member.id, name: member.name, period, amount: settings.welfareAmount });
    } catch (error) {
      await client.query("ROLLBACK TO SAVEPOINT auto_welfare");
      if (error.code !== "23505") throw error;
    }
  }
  return charged;
}

module.exports = {
  monthIndex,
  monthLabel,
  loadScheduleSettings,
  expectedAtEndOf,
  buildSchedule,
  loadMemberSchedule,
  chargeWelfareFromCoveredSavings,
};
