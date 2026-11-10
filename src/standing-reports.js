"use strict";
const PDFDocument = require("pdfkit");
const { query } = require("./db");
const { loadScheduleSettings, expectedAtEndOf, monthIndex, monthKey } = require("./savings-schedule");
const { loadWelfareStanding } = require("./welfare-standing");
const { loadHostingFeeStanding } = require("./hosting-fees");
const {
  LOAN_PRINCIPAL_LEFT_SQL,
  LOAN_INTEREST_LEFT_SQL,
  LOAN_PENALTY_LEFT_SQL,
  LOAN_MONEY_IN_LOANS_SQL,
  withLoanAlias,
} = require("./loan-totals");

const NAVY = "#1F4E79";
const BLUE = "#2E75B6";
const CYAN = "#00B0F0";
const CYAN_CELL = "#B7DEE8";
const SKY = "#A6E3F5";
const RED = "#C00000";
const RED_CELL = "#FF6B6B";
const GREEN_CELL = "#C6EFCE";
const GREEN_TEXT = "#006100";
const WHITE = "#FFFFFF";
const LINE = "#8EA8C3";
const WELFARE_START = "2024-06";
const VICENT_START = "2026-07";

function kampalaNow() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Kampala",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const pick = (type) => parts.find((p) => p.type === type)?.value;
  return { year: Number(pick("year")), month: Number(pick("month")), day: Number(pick("day")) };
}

function parseAsOf(value) {
  const now = kampalaNow();
  const match = /^(\d{4})-(\d{2})$/.exec(String(value || "").trim());
  let year = now.year;
  let month = now.month;
  if (match) {
    year = Number(match[1]);
    month = Number(match[2]);
  }
  if (year < 2024) { year = 2024; month = 6; }
  const currentIndex = now.year * 12 + (now.month - 1);
  const index = Math.min(year * 12 + (month - 1), currentIndex);
  year = Math.floor(index / 12);
  month = (index % 12) + 1;
  const isCurrent = index === currentIndex;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const day = isCurrent ? now.day : lastDay;
  const asOfMonth = `${year}-${String(month).padStart(2, "0")}`;
  const asOfDate = `${asOfMonth}-${String(day).padStart(2, "0")}`;
  return { year, month, day, lastDay, index, asOfMonth, asOfDate, isCurrent };
}

function shortDate(day, month, year) {
  return `${Number(day)}.${Number(month)}.${String(year).slice(-2)}`;
}

function slashDate(day, month, year) {
  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
}

function ordinalDay(day) {
  const v = day % 100;
  if (v > 10 && v < 14) return "th";
  return ["th", "st", "nd", "rd"][day % 10] || "th";
}

function asOfLabel(asOf) {
  const parsed = typeof asOf === "string" || !asOf ? parseAsOf(asOf) : asOf;
  const monthName = new Date(Date.UTC(parsed.year, parsed.month - 1, 1))
    .toLocaleDateString("en-GB", { month: "long", timeZone: "UTC" });
  return `${parsed.day}${ordinalDay(parsed.day)} ${monthName} ${parsed.year}`;
}

function money(value) {
  return Number(value || 0).toLocaleString("en-UG", { maximumFractionDigits: 0 });
}

function moneyExact(value) {
  const amount = Number(value || 0);
  const decimals = Math.abs(amount % 1) > 0.0005 ? 2 : 0;
  return amount.toLocaleString("en-UG", { minimumFractionDigits: decimals, maximumFractionDigits: 2 });
}

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function kampalaDateKey(value) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toLocaleDateString("en-CA", { timeZone: "Africa/Kampala" });
}

function kampalaTodayKey() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Kampala" });
}

function isPastDueDate(dueValue, todayKey = kampalaTodayKey()) {
  const dueKey = kampalaDateKey(dueValue);
  return Boolean(dueKey && todayKey && dueKey < todayKey);
}

function dashMoney(value) {
  const amount = Number(value || 0);
  return amount > 0.004 ? moneyExact(amount) : "-";
}

function isVicent(name) {
  return /vicent|vincent/i.test(name || "") && /gumisiriza/i.test(name || "");
}

function ascii(value) {
  return String(value ?? "").replace(/[^\x20-\x7E]/g, " ").replace(/\s+/g, " ").trim();
}

async function loadPersonalSavingsRows(asOf) {
  const parsed = parseAsOf(asOf);
  const settings = await loadScheduleSettings();
  const members = (
    await query(
      `SELECT m.id, m.full_name AS name, m.member_number AS "memberNumber",
         m.savings_balance::float AS savings,
         m.share_capital::float AS shares,
         to_char(m.joined_at,'YYYY-MM') AS "joinMonth",
         COALESCE((SELECT SUM(t.amount) FROM transactions t
           WHERE t.member_id=m.id AND t.status IN ('completed','verified','approved')
             AND t.type='Savings deposit'
             AND COALESCE(t.verified_at,t.created_at)::date > $1::date),0)::float AS "depositsAfter",
         COALESCE((SELECT SUM(t.amount) FROM transactions t
           WHERE t.member_id=m.id AND t.status IN ('completed','verified','approved')
             AND t.type='Withdrawal'
             AND COALESCE(t.verified_at,t.created_at)::date > $1::date),0)::float AS "withdrawalsAfter",
         COALESCE((SELECT SUM(c.amount) FROM welfare_contributions c
           WHERE c.member_id=m.id AND c.status IN ('verified','completed','recorded') AND c.amount>0
             AND (c.payment_method ILIKE '%savings%' OR COALESCE(c.reference,'') LIKE 'WCON-AUTO-%'
               OR COALESCE(c.reference,'') LIKE 'WCON-CATCHUP-%')
             AND c.contribution_date > $1::date),0)::float AS "welfareFromSavingsAfter",
         COALESCE((SELECT SUM(t.amount) FROM transactions t
           WHERE t.member_id=m.id AND t.status IN ('completed','verified','approved')
             AND t.type='Share purchase' AND t.method='Savings transfer'
             AND COALESCE(t.verified_at,t.created_at)::date > $1::date),0)::float AS "shareFromSavingsAfter",
         COALESCE((SELECT SUM(t.amount) FROM transactions t
           WHERE t.member_id=m.id AND t.status IN ('completed','verified','approved')
             AND t.type='Share purchase' AND t.method='Savings transfer'
             AND COALESCE(t.verified_at,t.created_at)::date <= $1::date),0)::float AS "shareFromSavingsByAsOf",
         COALESCE((SELECT SUM(t.amount) FROM transactions t
           WHERE t.member_id=m.id AND t.status IN ('completed','verified','approved')
             AND t.type='Hosting fee' AND t.method ILIKE '%savings%'
             AND COALESCE(t.verified_at,t.created_at)::date > $1::date),0)::float AS "hostingFromSavingsAfter",
         COALESCE((SELECT SUM(t.amount) FROM transactions t
           WHERE t.member_id=m.id AND t.status IN ('completed','verified','approved')
             AND t.type='Hosting fee' AND t.method ILIKE '%savings%'
             AND COALESCE(t.verified_at,t.created_at)::date <= $1::date),0)::float AS "hostingFromSavingsByAsOf",
         COALESCE((SELECT SUM(t.amount) FROM transactions t
           WHERE t.member_id=m.id AND t.status IN ('completed','verified','approved')
             AND t.type='Share purchase'
             AND COALESCE(t.verified_at,t.created_at)::date > $1::date),0)::float AS "sharesAfter"
       FROM members m
       WHERE m.deleted_at IS NULL AND m.status='active'
       ORDER BY m.full_name`,
      [parsed.asOfDate]
    )
  ).rows;
  return members
    .map((m) => {
      const joinMonth = m.joinMonth ? monthIndex(m.joinMonth) : null;
      const current = Number(m.savings || 0);
      let paid = parsed.isCurrent
        ? current
        : current - Number(m.depositsAfter || 0) + Number(m.withdrawalsAfter || 0)
          + Number(m.welfareFromSavingsAfter || 0) + Number(m.shareFromSavingsAfter || 0)
          + Number(m.hostingFromSavingsAfter || 0);
      const shareMoved = Number(m.shareFromSavingsByAsOf || 0);
      if (shareMoved > 0.5) {
        const previousExpected = expectedAtEndOf(settings, joinMonth, parsed.index - 1);
        if (paid + 0.5 >= previousExpected + shareMoved) paid -= shareMoved;
      }
      const hostChop = Number(m.hostingFromSavingsByAsOf || 0);
      if (hostChop > 0.5 && /banumba/i.test(m.name || "") && /francis/i.test(m.name || "")) {
        paid += hostChop;
      }
      const expected = expectedAtEndOf(settings, joinMonth, parsed.index);
      const variance = paid - expected;
      const shares = Math.max(
        0,
        Number(m.shares || 0) - (parsed.isCurrent ? 0 : Number(m.sharesAfter || 0))
      );
      return { id: m.id, name: m.name, memberNumber: m.memberNumber, paid, expected, variance, shares };
    })
    .sort((a, b) => a.variance - b.variance || a.name.localeCompare(b.name));
}

async function loadWelfareRows(asOf) {
  const parsed = parseAsOf(asOf);
  const monthly = 25000;
  const members = (
    await query(
      `SELECT m.id, m.full_name AS member, m.member_number AS "memberNumber",
         to_char(m.joined_at,'YYYY-MM') AS "joinMonth",
         COALESCE(SUM(c.amount) FILTER (WHERE c.contribution_date <= $1::date),0)::float AS paid
       FROM members m
       LEFT JOIN welfare_contributions c
         ON c.member_id=m.id AND c.status IN ('verified','completed','recorded') AND c.amount>0
       WHERE m.deleted_at IS NULL AND m.status='active'
       GROUP BY m.id
       ORDER BY m.full_name`,
      [parsed.asOfDate]
    )
  ).rows;
  return members
    .map((row) => {
      const vicent = isVicent(row.member);
      const joinIdx = row.joinMonth ? monthIndex(row.joinMonth) : monthIndex(WELFARE_START);
      const start = vicent ? monthIndex(VICENT_START) : Math.max(monthIndex(WELFARE_START), joinIdx);
      const months = Math.max(0, parsed.index - start + 1);
      const expected = months * monthly;
      const paid = Number(row.paid || 0);
      return {
        id: row.id,
        name: row.member,
        memberNumber: row.memberNumber,
        paid,
        expected,
        variance: paid - expected,
        isVicent: vicent,
      };
    })
    .sort((a, b) => a.variance - b.variance || a.name.localeCompare(b.name));
}

async function loadLoanRows(asOf) {
  const parsed = parseAsOf(asOf);
  const rows = (
    await query(
      `SELECT l.reference, m.id AS "memberId", m.full_name AS member, m.member_number AS "memberNumber",
         COALESCE(p.name,'Loan') AS product,
         l.amount::float, l.balance::float, l.status, l.due_date AS "dueDate",
         l.term_months AS "termMonths",
         COALESCE((SELECT SUM(s.total_due) FROM loan_repayment_schedule s WHERE s.loan_id=l.id), l.amount)::float AS "totalDue",
         COALESCE((SELECT SUM(s.paid_amount) FROM loan_repayment_schedule s WHERE s.loan_id=l.id),0)::float AS "totalPaid",
         ROUND((${withLoanAlias(LOAN_MONEY_IN_LOANS_SQL, "l")})::numeric,2)::float AS "moneyInLoans",
         (SELECT MIN(s.due_date) FROM loan_repayment_schedule s WHERE s.loan_id=l.id AND s.status<>'paid') AS "nextDue"
       FROM loans l
       JOIN members m ON m.id=l.member_id
       LEFT JOIN loan_products p ON p.id=l.product_id
       WHERE m.deleted_at IS NULL
         AND COALESCE(l.created_at)::date <= $1::date
       ORDER BY CASE l.status WHEN 'overdue' THEN 0 WHEN 'active' THEN 1 ELSE 2 END, m.full_name, l.id`,
      [parsed.asOfDate]
    )
  ).rows;
  return rows.map((row) => ({
    ...row,
    outstanding: Number(row.moneyInLoans != null ? row.moneyInLoans : Math.max(0, Number(row.totalDue || 0) - Number(row.totalPaid || 0))),
  }));
}

function fillRect(doc, x, y, w, h, color) {
  doc.save();
  doc.fillColor(color);
  doc.rect(x, y, w, h);
  doc.fill();
  doc.restore();
}

function cellText(doc, text, x, y, w, h, { align = "left", color = "#0B1F3B", bold = false, size = 8 } = {}) {
  const safe = ascii(text);
  doc.fillColor(color).font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(size);
  doc.text(safe, x + 3, y + Math.max(2, (h - size) / 2), {
    width: Math.max(8, w - 6),
    align,
    height: Math.max(size, h - 2),
    ellipsis: true,
  });
}

function drawHeader(doc, title, subtitle) {
  doc.font("Helvetica-Bold").fontSize(13).fillColor(NAVY).text("KASANGATI G40 KWAGALANA LIMITED", 18, 16, { align: "center" });
  doc.font("Helvetica-Bold").fontSize(11).fillColor(BLUE).text(title, 18, 32, { align: "center" });
  if (subtitle) {
    doc.font("Helvetica").fontSize(9).fillColor("#5B6B7C").text(ascii(subtitle), 18, 46, { align: "center" });
  }
}

function parseMemberId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function filterMemberRows(rows, memberId, idKey = "id") {
  if (!memberId) return rows;
  return (rows || []).filter((row) => Number(row[idKey] ?? row.id ?? row.memberId) === Number(memberId));
}

async function loadReportMember(memberId) {
  const id = parseMemberId(memberId);
  if (!id) return null;
  const row = (
    await query(
      `SELECT id, full_name AS name, member_number AS "memberNumber"
       FROM members WHERE id=$1 AND deleted_at IS NULL`,
      [id]
    )
  ).rows[0];
  return row || null;
}

function ensureRowSpace(doc, y, rowH) {
  if (y + rowH <= doc.page.height - 36) return y;
  doc.addPage();
  return 36;
}

function drawSavingsStyleTable(doc, rows, {
  paidLabel,
  expectedLabel,
  summaryTitle = "Client Savings Summary",
  rangeLabel = "Personal Savings",
  fromDate = "2024-01-01",
  toDate = "",
  unpaidLabel = "UNPAID SAVINGS :",
  shareLabel = "",
} = {}) {
  const rowH = 18;
  const headH = 36;
  const showShares = Boolean(shareLabel);
  const cols = [
    { key: "no", label: "No.", w: 28, align: "center", header: CYAN, body: WHITE, text: "#0B1F3B" },
    { key: "name", label: "Client Name", w: showShares ? 132 : 168, align: "left", header: CYAN, body: SKY, text: "#0B1F3B" },
    ...(showShares
      ? [{ key: "shares", label: shareLabel, w: 92, align: "right", header: NAVY, body: WHITE, text: "#0B1F3B" }]
      : []),
    { key: "paid", label: paidLabel, w: showShares ? 86 : 100, align: "right", header: CYAN, body: CYAN_CELL, text: "#0B1F3B" },
    { key: "expected", label: expectedLabel, w: showShares ? 86 : 100, align: "right", header: GREEN_TEXT, body: GREEN_CELL, text: GREEN_TEXT },
    { key: "variance", label: "Deficit/Surplus", w: showShares ? 92 : 110, align: "right", header: RED, body: WHITE, text: "#0B1F3B" },
  ];
  const tableW = cols.reduce((sum, c) => sum + c.w, 0);
  const x0 = (doc.page.width - tableW) / 2;
  let y = 50;
  fillRect(doc, x0, y, tableW, rowH, NAVY);
  cellText(doc, summaryTitle, x0, y, tableW, rowH, { align: "center", color: WHITE, bold: true, size: 10 });
  y += rowH;
  const nameW = cols[0].w + cols[1].w;
  const fromCols = cols.slice(2, cols.length - 2);
  const fromW = fromCols.reduce((s, c) => s + c.w, 0);
  const toW = cols[cols.length - 2].w + cols[cols.length - 1].w;
  fillRect(doc, x0, y, nameW, rowH, WHITE);
  cellText(doc, rangeLabel, x0, y, nameW, rowH, { align: "left", color: NAVY, bold: true, size: 8 });
  fillRect(doc, x0 + nameW, y, fromW, rowH, WHITE);
  cellText(doc, `From  ${fromDate}`, x0 + nameW, y, fromW, rowH, { align: "center", color: NAVY, bold: true, size: 8 });
  fillRect(doc, x0 + nameW + fromW, y, toW, rowH, WHITE);
  cellText(doc, `To  ${toDate}`, x0 + nameW + fromW, y, toW, rowH, { align: "center", color: NAVY, bold: true, size: 8 });
  y += rowH;
  let x = x0;
  cols.forEach((col) => {
    fillRect(doc, x, y, col.w, headH, col.header);
    doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(8);
    doc.text(ascii(col.label), x + 3, y + 4, { width: col.w - 6, align: "center", height: headH - 6 });
    x += col.w;
  });
  y += headH;
  rows.forEach((row, index) => {
    y = ensureRowSpace(doc, y, rowH);
    const deficit = Number(row.variance) < -0.5;
    const surplus = Number(row.variance) > 0.5;
    const values = showShares
      ? [index + 1, row.name, money(row.shares), money(row.paid), money(row.expected), money(row.variance)]
      : [index + 1, row.name, money(row.paid), money(row.expected), money(row.variance)];
    x = x0;
    cols.forEach((col, i) => {
      let bg = col.body;
      let color = col.text;
      if (col.key === "name") bg = index % 2 === 0 ? SKY : WHITE;
      if (col.key === "variance") {
        bg = deficit ? RED_CELL : surplus ? GREEN_CELL : WHITE;
        color = deficit ? WHITE : surplus ? GREEN_TEXT : "#0B1F3B";
      }
      fillRect(doc, x, y, col.w, rowH, bg);
      doc.strokeColor(LINE).lineWidth(0.3).rect(x, y, col.w, rowH).stroke();
      cellText(doc, values[i], x, y, col.w, rowH, {
        align: col.align,
        color,
        bold: col.key !== "name",
        size: 8,
      });
      x += col.w;
    });
    y += rowH;
  });
  y = ensureRowSpace(doc, y, rowH * 2 + 8);
  const totalPaid = rows.reduce((s, r) => s + Number(r.paid || 0), 0);
  const totalExpected = rows.reduce((s, r) => s + Number(r.expected || 0), 0);
  const totalShares = rows.reduce((s, r) => s + Number(r.shares || 0), 0);
  const totalVar = totalPaid - totalExpected;
  const unpaid = rows.reduce((s, r) => s + Math.max(0, -Number(r.variance || 0)), 0);
  const totals = showShares
    ? ["", "Total :", money(totalShares), money(totalPaid), money(totalExpected), money(totalVar)]
    : ["", "Total :", money(totalPaid), money(totalExpected), money(totalVar)];
  x = x0;
  cols.forEach((col, i) => {
    const moneyCol = col.key === "paid" || col.key === "expected" || col.key === "variance";
    const bg = moneyCol ? (Number(totalVar) < 0 ? RED_CELL : GREEN_CELL) : "#F2F2F2";
    fillRect(doc, x, y, col.w, rowH, bg);
    cellText(doc, totals[i], x, y, col.w, rowH, {
      align: col.align,
      bold: true,
      size: 8,
      color: moneyCol && totalVar < 0 ? WHITE : "#0B1F3B",
    });
    x += col.w;
  });
  if (unpaidLabel) {
    y += rowH + 6;
    fillRect(doc, x0 + nameW, y, fromW, rowH, RED);
    cellText(doc, unpaidLabel, x0 + nameW, y, fromW, rowH, { align: "center", color: WHITE, bold: true, size: 8 });
    fillRect(doc, x0 + nameW + fromW, y, toW, rowH, RED_CELL);
    cellText(doc, money(-unpaid), x0 + nameW + fromW, y, toW, rowH, {
      align: "right",
      color: WHITE,
      bold: true,
      size: 9,
    });
  }
}

function drawLoanTable(doc, rows) {
  const rowH = 20;
  const cols = [
    { w: 26, label: "No." },
    { w: 108, label: "Member" },
    { w: 72, label: "Loan" },
    { w: 78, label: "Product" },
    { w: 62, label: "Amount" },
    { w: 68, label: "Outstanding" },
    { w: 52, label: "Status" },
    { w: 62, label: "Next due" },
  ];
  const tableW = cols.reduce((s, c) => s + c.w, 0);
  const x0 = (doc.page.width - tableW) / 2;
  let y = 50;
  let x = x0;
  cols.forEach((col) => {
    fillRect(doc, x, y, col.w, rowH + 4, NAVY);
    cellText(doc, col.label, x, y, col.w, rowH + 4, { align: "center", color: WHITE, bold: true, size: 8 });
    x += col.w;
  });
  y += rowH + 4;
  rows.forEach((row, index) => {
    y = ensureRowSpace(doc, y, rowH);
    const overdue = String(row.status) === "overdue" || (Number(row.outstanding) > 0 && row.nextDue && new Date(row.nextDue) < new Date());
    const values = [
      index + 1,
      row.member,
      row.reference,
      row.product,
      moneyExact(row.amount),
      moneyExact(row.outstanding ?? row.balance),
      row.status,
      row.nextDue ? new Date(row.nextDue).toLocaleDateString("en-GB") : "-",
    ];
    x = x0;
    cols.forEach((col, i) => {
      const bg = overdue && i >= 5 ? RED_CELL : i === 1 ? (index % 2 === 0 ? SKY : WHITE) : WHITE;
      fillRect(doc, x, y, col.w, rowH, bg);
      doc.strokeColor(LINE).lineWidth(0.3).rect(x, y, col.w, rowH).stroke();
      cellText(doc, values[i], x, y, col.w, rowH, { align: i >= 4 ? "right" : "left", size: 9, bold: i >= 4 });
      x += col.w;
    });
    y += rowH;
  });
  y = ensureRowSpace(doc, y, 24);
  const outstanding = rows.reduce((s, r) => s + Number(r.outstanding ?? r.balance ?? 0), 0);
  const disbursed = rows.filter((r) => ["active", "overdue"].includes(r.status)).reduce((s, r) => s + Number(r.amount || 0), 0);
  y += 10;
  doc.font("Helvetica-Bold").fontSize(9).fillColor(NAVY)
    .text(`Outstanding: UGX ${money(outstanding)}    Active book: UGX ${money(disbursed)}    Facilities: ${rows.length}`, x0, y, { width: tableW });
}

function formatDay(value) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-GB", { timeZone: "Africa/Kampala" });
}

async function loadCompanyStanding() {
  const uap = Number((await query(`SELECT balance::float AS balance FROM finance_accounts WHERE account_code='GL-4500' AND active=true LIMIT 1`)).rows[0]?.balance || 0);
  const bank = Number((await query(`SELECT balance::float AS balance FROM finance_accounts WHERE account_code='GL-4104' AND active=true LIMIT 1`)).rows[0]?.balance || 0);
  const loans = Number((await query(`SELECT ROUND(COALESCE(SUM(${LOAN_MONEY_IN_LOANS_SQL}),0),2)::float AS total FROM loans WHERE status IN ('active','overdue')`)).rows[0]?.total || 0);
  const standing = await loadWelfareStanding();
  const welfare = Math.max(0, Number(standing.closingBalance || standing.currentFundBalance || 0));
  const lines = [
    { label: "Old Mutual Unit Trust (UAP)", amount: uap, fill: "#E8F4FC", text: NAVY },
    { label: "Centenary Bank", amount: bank, fill: CYAN_CELL, text: NAVY },
    { label: "Current money in welfare", amount: welfare, fill: GREEN_CELL, text: GREEN_TEXT },
    { label: "Money in loans (principal + interest + penalties)", amount: loans, fill: "#FCE4D6", text: "#C65911" },
  ];
  const total = uap + bank + welfare + loans;
  return { lines, total };
}

function drawCompanyStanding(doc, standing, label) {
  const tableW = 520;
  const x0 = (doc.page.width - tableW) / 2;
  let y = 52;
  fillRect(doc, x0, y, tableW, 22, NAVY);
  cellText(doc, `Company standing as at ${label}`, x0, y, tableW, 22, { align: "center", color: WHITE, bold: true, size: 10 });
  y += 28;
  doc.font("Helvetica").fontSize(8).fillColor("#5B6B7C")
    .text("UAP + Centenary + welfare fund + money still in active loans. Centenary is the bank book; welfare is the current welfare standing after assistance already paid.", x0, y, { width: tableW });
  y += 28;
  standing.lines.forEach((line) => {
    fillRect(doc, x0, y, 300, 28, line.fill);
    fillRect(doc, x0 + 300, y, 220, 28, WHITE);
    doc.strokeColor(LINE).lineWidth(0.4).rect(x0, y, tableW, 28).stroke();
    cellText(doc, line.label, x0, y, 300, 28, { color: line.text, bold: true, size: 10 });
    cellText(doc, moneyExact(line.amount), x0 + 300, y, 210, 28, { align: "right", color: line.text, bold: true, size: 11 });
    y += 28;
  });
  y += 8;
  fillRect(doc, x0, y, 300, 32, NAVY);
  fillRect(doc, x0 + 300, y, 220, 32, GREEN_CELL);
  cellText(doc, "Total company funds", x0, y, 300, 32, { color: WHITE, bold: true, size: 11 });
  cellText(doc, moneyExact(standing.total), x0 + 300, y, 210, 32, { align: "right", color: GREEN_TEXT, bold: true, size: 12 });
}

async function loadAssistanceRows() {
  const rows = (
    await query(
      `SELECT p.id, p.beneficiary_name AS member, p.amount::float AS amount, p.paid_at AS "paidAt",
              p.payment_method AS method, COALESCE(r.request_type, 'Welfare assistance') AS category,
              COALESCE(r.description, '') AS note
       FROM welfare_payments p
       LEFT JOIN welfare_requests r ON r.id = p.request_id
       WHERE p.status IN ('paid','processed')
       ORDER BY p.paid_at DESC NULLS LAST, p.id DESC`
    )
  ).rows;
  return rows;
}

function drawAssistanceRegister(doc, rows) {
  const cols = [
    { w: 28, label: "No." },
    { w: 78, label: "Date paid" },
    { w: 110, label: "Type" },
    { w: 168, label: "Member / family" },
    { w: 78, label: "Amount" },
    { w: 70, label: "How paid" },
  ];
  const tableW = cols.reduce((s, c) => s + c.w, 0);
  const x0 = (doc.page.width - tableW) / 2;
  const rowH = 20;
  let y = 50;
  fillRect(doc, x0, y, tableW, 22, NAVY);
  cellText(doc, "People already given welfare assistance", x0, y, tableW, 22, { align: "center", color: WHITE, bold: true, size: 10 });
  y += 22;
  let x = x0;
  cols.forEach((col) => {
    fillRect(doc, x, y, col.w, 18, CYAN);
    cellText(doc, col.label, x, y, col.w, 18, { align: "center", color: WHITE, bold: true, size: 8 });
    x += col.w;
  });
  y += 18;
  rows.forEach((row, index) => {
    y = ensureRowSpace(doc, y, rowH);
    const values = [index + 1, formatDay(row.paidAt), row.category, row.member, money(row.amount), row.method || "Bank transfer"];
    x = x0;
    cols.forEach((col, i) => {
      const bg = i === 3 ? (index % 2 === 0 ? SKY : WHITE) : i === 4 ? GREEN_CELL : WHITE;
      fillRect(doc, x, y, col.w, rowH, bg);
      doc.strokeColor(LINE).lineWidth(0.3).rect(x, y, col.w, rowH).stroke();
      cellText(doc, values[i], x, y, col.w, rowH, {
        align: i === 4 || i === 0 ? "right" : "left",
        size: 9,
        bold: i === 4,
        color: i === 4 ? GREEN_TEXT : "#0B1F3B",
      });
      x += col.w;
    });
    y += rowH;
    if (row.note) {
      y = ensureRowSpace(doc, y, 16);
      fillRect(doc, x0, y, tableW, 16, "#F7FBFE");
      cellText(doc, row.note, x0 + 8, y, tableW - 16, 16, { size: 9, color: "#5B6B7C" });
      y += 16;
    }
  });
  y = ensureRowSpace(doc, y, 28);
  const total = rows.reduce((s, r) => s + Number(r.amount || 0), 0);
  fillRect(doc, x0, y, 384, 24, NAVY);
  fillRect(doc, x0 + 384, y, 148, 24, GREEN_CELL);
  cellText(doc, `Total assistance listed  ·  ${rows.length} payout${rows.length === 1 ? "" : "s"}`, x0, y, 384, 24, { color: WHITE, bold: true, size: 9 });
  cellText(doc, money(total), x0 + 384, y, 140, 24, { align: "right", color: GREEN_TEXT, bold: true, size: 10 });
  y += 32;
  y = ensureRowSpace(doc, y, 48);
  doc.font("Helvetica").fontSize(7.5).fillColor("#5B6B7C")
    .text("This register is the Legal / Welfare record of support already paid. Vicent Gumisiriza is not charged a shared deduction on these historical payouts. Joshua Ssewanyana is kept in assistance history only.", x0, y, { width: tableW });
}

function decorateScheduleRows(loan, scheduleRows, repaymentAmounts) {
  const todayKey = kampalaTodayKey();
  let repaymentCursor = 0;
  const rate = Number(loan.latePenaltyRate || 5);
  return scheduleRows.map((row) => {
    const isPaid = row.status === "paid";
    const penaltyActive = !isPaid && isPastDueDate(row.dueDate, todayKey);
    const principal = Number(row.principal || 0);
    const interest = Number(row.interest || 0);
    const emi = roundMoney(principal + interest);
    const assessed = roundMoney(principal * (rate / 100));
    const rawPenalty = penaltyActive ? (Number(row.penalty || 0) || assessed) : 0;
    const schedulePaid = Number(row.paidAmount || 0);
    let amountPaid = schedulePaid;
    let surplusPaid = 0;
    if (schedulePaid > 0.005) {
      if (isPaid && repaymentCursor < repaymentAmounts.length) {
        amountPaid = roundMoney(repaymentAmounts[repaymentCursor]);
        surplusPaid = roundMoney(Math.max(0, amountPaid - emi));
        repaymentCursor += 1;
      } else {
        amountPaid = roundMoney(schedulePaid);
      }
    }
    const remainingPrincipal = Math.max(0, principal - Number(row.principalPaid || 0));
    const remainingInterest = Math.max(0, interest - Number(row.interestPaid || 0));
    const outstanding = isPaid ? 0 : roundMoney(remainingPrincipal + remainingInterest + rawPenalty);
    const dueAmount = roundMoney(emi + rawPenalty);
    return {
      ...row,
      installment: row.installment,
      openingBalance: row.openingBalance,
      penalty: rawPenalty,
      dueAmount,
      outstanding,
      amountPaid,
      surplusPaid,
    };
  });
}

async function loadActiveLoanReports() {
  const loans = (
    await query(
      `SELECT l.id, l.reference, l.amount::float AS amount, l.balance::float AS balance, l.status,
              l.term_months AS "termMonths", l.created_at AS "requestedAt", l.disbursed_at AS "disbursedAt",
              l.processing_fee::float AS "processingFee",
              m.id AS "memberId", m.full_name AS member, m.member_number AS "memberNumber",
              COALESCE(p.name, l.custom_product_name, 'Loan') AS product,
              COALESCE(p.late_penalty_rate,5)::float AS "latePenaltyRate",
              COALESCE((SELECT SUM(s.principal_paid) FROM loan_repayment_schedule s WHERE s.loan_id=l.id),0)::float AS "principalPaid",
              COALESCE((SELECT SUM(s.interest_paid) FROM loan_repayment_schedule s WHERE s.loan_id=l.id),0)::float AS "interestPaid",
              COALESCE((SELECT SUM(c.paid_amount) FROM loan_charges c
                WHERE c.loan_id=l.id AND c.charge_type='Late payment penalty'),0)::float AS "penaltyPaid",
              ROUND((${withLoanAlias(LOAN_PRINCIPAL_LEFT_SQL, "l")})::numeric,2)::float AS "principalLeft",
              ROUND((${withLoanAlias(LOAN_INTEREST_LEFT_SQL, "l")})::numeric,2)::float AS "interestLeft",
              ROUND((${withLoanAlias(LOAN_PENALTY_LEFT_SQL, "l")})::numeric,2)::float AS "penaltyLeft"
       FROM loans l
       JOIN members m ON m.id=l.member_id
       LEFT JOIN loan_products p ON p.id=l.product_id
       WHERE l.status IN ('active','overdue') AND m.deleted_at IS NULL
       ORDER BY m.full_name, l.id`
    )
  ).rows;
  if (!loans.length) return [];
  const ids = loans.map((l) => l.id);
  const schedule = (
    await query(
      `SELECT s.loan_id AS "loanId", s.installment_number AS installment, s.due_date AS "dueDate",
              s.opening_balance::float AS "openingBalance", s.principal::float, s.interest::float,
              s.total_due::float AS "totalDue", s.paid_amount::float AS "paidAmount",
              s.principal_paid::float AS "principalPaid", s.interest_paid::float AS "interestPaid", s.status,
              CASE
                WHEN s.status='paid' THEN 0
                WHEN s.due_date < (CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Kampala')::date THEN
                  COALESCE(NULLIF((SELECT ROUND(c.amount::numeric,2) FROM loan_charges c
                    WHERE c.schedule_id=s.id AND c.charge_type='Late payment penalty'
                      AND c.status IN ('outstanding','partial','settled')
                    ORDER BY c.id DESC LIMIT 1),0),
                    ROUND((s.principal*(SELECT p.late_penalty_rate FROM loans lx JOIN loan_products p ON p.id=lx.product_id WHERE lx.id=s.loan_id)/100.0)::numeric,2))
                ELSE 0
              END::float AS penalty
       FROM loan_repayment_schedule s
       WHERE s.loan_id = ANY($1::bigint[])
       ORDER BY s.loan_id, s.installment_number`,
      [ids]
    )
  ).rows;
  const payments = (
    await query(
      `SELECT loan_id AS "loanId", reference, method, amount::float,
              COALESCE(verified_at, created_at) AS "paidAt"
       FROM transactions
       WHERE loan_id = ANY($1::bigint[]) AND type='Loan repayment' AND status IN ('completed','verified','approved')
       ORDER BY COALESCE(verified_at, created_at), id`,
      [ids]
    )
  ).rows;
  return loans.map((loan) => {
    const loanPayments = payments.filter((row) => Number(row.loanId) === Number(loan.id));
    const loanSchedule = schedule.filter((row) => Number(row.loanId) === Number(loan.id));
    return {
      ...loan,
      schedule: decorateScheduleRows(loan, loanSchedule, loanPayments.map((p) => Number(p.amount || 0))),
      payments: loanPayments,
    };
  });
}

function drawMiniTable(doc, x0, y, cols, rows, { header = CYAN } = {}) {
  const rowH = 20;
  const tableW = cols.reduce((s, c) => s + c.w, 0);
  y = ensureRowSpace(doc, y, rowH + 4);
  let x = x0;
  cols.forEach((col) => {
    fillRect(doc, x, y, col.w, rowH, header);
    cellText(doc, col.label, x, y, col.w, rowH, { align: "center", color: WHITE, bold: true, size: 9 });
    x += col.w;
  });
  y += rowH;
  if (!rows.length) {
    fillRect(doc, x0, y, tableW, rowH, WHITE);
    cellText(doc, "None recorded", x0, y, tableW, rowH, { size: 9, color: "#5B6B7C" });
    return y + rowH;
  }
  rows.forEach((values, index) => {
    y = ensureRowSpace(doc, y, rowH);
    x = x0;
    cols.forEach((col, i) => {
      fillRect(doc, x, y, col.w, rowH, index % 2 === 0 ? "#F7FBFE" : WHITE);
      doc.strokeColor(LINE).lineWidth(0.2).rect(x, y, col.w, rowH).stroke();
      cellText(doc, values[i], x, y, col.w, rowH, { align: col.align || "left", size: 9, bold: Boolean(col.bold) });
      x += col.w;
    });
    y += rowH;
  });
  return y;
}

async function loadIncomeStatement(parsed) {
  const monthStart = `${parsed.asOfMonth}-01`;
  const asOfDate = parsed.asOfDate;
  const fyStart = (await query(
    `SELECT starts_on FROM member_financial_year_policies
     WHERE status='active' AND $1::date BETWEEN starts_on AND ends_on
     ORDER BY starts_on DESC LIMIT 1`,
    [asOfDate]
  )).rows[0]?.starts_on || `${parsed.year}-01-01`;
  const rows = (
    await query(
      `SELECT entry_type AS "entryType", COALESCE(NULLIF(category,''),'Uncategorised') AS category,
         SUM(amount) FILTER (WHERE transaction_date>=$1::date AND transaction_date<=$2::date)::float AS month_amount,
         SUM(amount) FILTER (WHERE transaction_date>=$3::date AND transaction_date<=$2::date)::float AS ytd_amount
       FROM organization_finance_entries
       WHERE status IN ('approved','completed')
         AND COALESCE(payment_method,'') NOT ILIKE 'Management accounts import'
       GROUP BY entry_type, COALESCE(NULLIF(category,''),'Uncategorised')
       ORDER BY entry_type, category`,
      [monthStart, asOfDate, fyStart]
    )
  ).rows;
  const income = rows.filter((r) => r.entryType === "income");
  const expenses = rows.filter((r) => r.entryType === "expense");
  const sum = (list, key) => list.reduce((s, r) => s + Number(r[key] || 0), 0);
  return {
    income,
    expenses,
    fyStart,
    monthIncome: sum(income, "month_amount"),
    monthExpenses: sum(expenses, "month_amount"),
    ytdIncome: sum(income, "ytd_amount"),
    ytdExpenses: sum(expenses, "ytd_amount"),
  };
}

function drawIncomeStatement(doc, statement, label) {
  let y = 50;
  const x0 = 18;
  const pageW = doc.page.width - 36;
  doc.font("Helvetica").fontSize(10).fillColor("#5B6B7C")
    .text(`Income and expenses posted to the books as at ${label}. Year-to-date starts ${statement.fyStart ? formatDay(statement.fyStart) : "FY start"}. Member savings receipts are included as recorded.`, x0, y, { width: pageW });
  y += 28;
  cellText(doc, "Income", x0, y, pageW, 16, { bold: true, size: 12, color: NAVY });
  y += 18;
  y = drawMiniTable(doc, x0, y, [
    { w: 220, label: "Category", align: "left" },
    { w: 120, label: "This month", align: "right", bold: true },
    { w: 120, label: "Year to date", align: "right", bold: true },
  ], statement.income.map((row) => [ascii(row.category), moneyExact(row.month_amount), moneyExact(row.ytd_amount)]).concat([
    ["Total income", moneyExact(statement.monthIncome), moneyExact(statement.ytdIncome)],
  ]), { header: NAVY });
  y += 16;
  cellText(doc, "Expenses", x0, y, pageW, 16, { bold: true, size: 12, color: RED });
  y += 18;
  y = drawMiniTable(doc, x0, y, [
    { w: 220, label: "Category", align: "left" },
    { w: 120, label: "This month", align: "right", bold: true },
    { w: 120, label: "Year to date", align: "right", bold: true },
  ], statement.expenses.map((row) => [ascii(row.category), moneyExact(row.month_amount), moneyExact(row.ytd_amount)]).concat([
    ["Total expenses", moneyExact(statement.monthExpenses), moneyExact(statement.ytdExpenses)],
  ]), { header: RED });
  y += 18;
  const monthNet = statement.monthIncome - statement.monthExpenses;
  const ytdNet = statement.ytdIncome - statement.ytdExpenses;
  y = drawMiniTable(doc, x0, y, [
    { w: 220, label: "Result", align: "left" },
    { w: 120, label: "This month", align: "right", bold: true },
    { w: 120, label: "Year to date", align: "right", bold: true },
  ], [["Surplus / (deficit)", moneyExact(monthNet), moneyExact(ytdNet)]], { header: BLUE });
}

async function loadDebtorsAging() {
  const today = kampalaTodayKey();
  const loans = (
    await query(
      `SELECT l.id, l.reference, m.full_name AS member, m.member_number AS "memberNumber",
         l.status, ROUND((${withLoanAlias(LOAN_MONEY_IN_LOANS_SQL, "l")})::numeric,2)::float AS outstanding,
         COALESCE((SELECT MIN(s.due_date) FROM loan_repayment_schedule s
           WHERE s.loan_id=l.id AND s.paid_amount < s.total_due - 0.5
             AND s.due_date < $1::date), NULL) AS "oldestDue"
       FROM loans l JOIN members m ON m.id=l.member_id
       WHERE l.status IN ('active','overdue')
       ORDER BY m.full_name`,
      [today]
    )
  ).rows;
  const bucketOf = (days) => {
    if (days <= 0) return "current";
    if (days <= 30) return "1-30";
    if (days <= 60) return "31-60";
    if (days <= 90) return "61-90";
    return "90+";
  };
  const rows = loans.map((loan) => {
    const dueKey = kampalaDateKey(loan.oldestDue);
    const days = dueKey && dueKey < today
      ? Math.round((new Date(`${today}T00:00:00+03:00`) - new Date(`${dueKey}T00:00:00+03:00`)) / 86400000)
      : 0;
    return {
      member: loan.member,
      memberNumber: loan.memberNumber,
      reference: loan.reference,
      status: loan.status,
      outstanding: Number(loan.outstanding || 0),
      daysOverdue: Math.max(0, days),
      bucket: bucketOf(Math.max(0, days)),
    };
  });
  const totals = { current: 0, "1-30": 0, "31-60": 0, "61-90": 0, "90+": 0 };
  rows.forEach((row) => { totals[row.bucket] += row.outstanding; });
  return { rows, totals, total: rows.reduce((s, r) => s + r.outstanding, 0) };
}

function lateLabel(days) {
  if (Number(days) <= 0) return "Paying on time";
  return `${Number(days)} days late`;
}

function drawDebtorsAging(doc, aging, label) {
  let y = 48;
  const x0 = 28;
  const pageW = doc.page.width - 56;
  doc.font("Helvetica").fontSize(11).fillColor("#334155")
    .text(`Who still owes the group on a loan as at ${label}. Amounts include remaining principal, interest and penalties.`, x0, y, { width: pageW });
  y += 32;
  const summary = [
    ["Paying on time", aging.totals.current],
    ["Late up to 1 month", aging.totals["1-30"]],
    ["Late 1–2 months", aging.totals["31-60"]],
    ["Late 2–3 months", aging.totals["61-90"]],
    ["Late over 3 months", aging.totals["90+"]],
  ].filter(([, amount]) => Number(amount) > 0.5);
  cellText(doc, "How much is owed", x0, y, pageW, 18, { bold: true, size: 13, color: NAVY });
  y += 22;
  y = drawMiniTable(doc, x0, y, [
    { w: 260, label: "Standing", align: "left" },
    { w: 160, label: "Amount (UGX)", align: "right", bold: true },
  ], summary.concat([["Total still owed", aging.total]]).map(([name, amount]) => [name, money(amount)]), { header: NAVY });
  y += 20;
  cellText(doc, "Members", x0, y, pageW, 18, { bold: true, size: 13, color: NAVY });
  y += 22;
  drawMiniTable(doc, x0, y, [
    { w: 200, label: "Who owes", align: "left" },
    { w: 130, label: "Still owes (UGX)", align: "right", bold: true },
    { w: 190, label: "Are they late?", align: "left" },
  ], aging.rows.map((row) => [
    ascii(row.member),
    money(row.outstanding),
    lateLabel(row.daysOverdue),
  ]), { header: NAVY });
}

function drawHostingFeeReport(doc, standing, label) {
  const expected = Number(standing.expected || 50000);
  const paid = standing.paidMembers || (standing.members || []).filter((m) => m.status !== "unpaid");
  const unpaid = standing.unpaidMembers || (standing.members || []).filter((m) => m.status === "unpaid");
  let y = 50;
  const pageW = doc.page.width - 36;
  const x0 = 18;
  doc.font("Helvetica").fontSize(10).fillColor("#5B6B7C")
    .text(standing.reminderActive
      ? `Hosting fee of UGX ${money(expected)} per member, including the host, for ${standing.meetingLabel || "the upcoming meeting"}. Collected UGX ${money(standing.collected)} from ${paid.length} member${paid.length === 1 ? "" : "s"} as at ${label}.`
      : `No hosting fee is currently due. The last meeting was 30 October 2026. Every member pays, including the host. Reminders start when Executive schedules the next meeting.`, x0, y, { width: pageW });
  y += 28;
  cellText(doc, "Members who have paid", x0, y, pageW, 16, { bold: true, size: 12, color: NAVY });
  y += 18;
  y = drawMiniTable(doc, x0, y, [
    { w: 32, label: "No.", align: "center" },
    { w: 170, label: "Member", align: "left" },
    { w: 72, label: "Number", align: "left" },
    { w: 80, label: "Paid", align: "right", bold: true },
    { w: 72, label: "Date", align: "left" },
    { w: 100, label: "Receipt", align: "left" },
  ], paid.map((row, i) => [
    String(i + 1),
    ascii(row.name),
    ascii(row.memberNumber || "-"),
    moneyExact(row.paid),
    row.lastPaidOn ? formatDay(row.lastPaidOn) : "-",
    ascii(row.receiptNumber || "-"),
  ]), { header: NAVY });
  y += 16;
  y = ensureRowSpace(doc, y, 40);
  cellText(doc, "Members who have not paid", x0, y, pageW, 16, { bold: true, size: 12, color: RED });
  y += 18;
  drawMiniTable(doc, x0, y, [
    { w: 32, label: "No.", align: "center" },
    { w: 200, label: "Member", align: "left" },
    { w: 90, label: "Number", align: "left" },
    { w: 90, label: "Expected", align: "right", bold: true },
    { w: 114, label: "Status", align: "left" },
  ], unpaid.map((row, i) => [
    String(i + 1),
    ascii(row.name),
    ascii(row.memberNumber || "-"),
    money(expected),
    "Not paid",
  ]), { header: RED });
}

function drawLoanCardRow(doc, x0, y, pageW, boxes, rowH = 54) {
  const boxW = pageW / boxes.length;
  boxes.forEach((box, i) => {
    const x = x0 + i * boxW;
    fillRect(doc, x, y, boxW, rowH, box.bg || WHITE);
    doc.strokeColor(LINE).lineWidth(0.4).rect(x, y, boxW, rowH).stroke();
    doc.fillColor(box.labelColor || "#4A5D73").font("Helvetica").fontSize(8);
    doc.text(ascii(box.label), x + 8, y + 7, { width: boxW - 16, align: "left", lineBreak: true, height: 18 });
    doc.fillColor(box.valueColor || NAVY).font("Helvetica-Bold").fontSize(13);
    doc.text(ascii(box.value), x + 8, y + 28, { width: boxW - 16, align: "left", height: 22 });
  });
  return y + rowH;
}

function drawActiveLoanReports(doc, loans, label) {
  let y = 50;
  const pageW = doc.page.width - 36;
  const x0 = 18;
  doc.font("Helvetica").fontSize(10).fillColor("#5B6B7C")
    .text(`Active and overdue loans as at ${label}. Surplus on the schedule is the paper "In Advance". Processing fee is the paper Fees of 2% kept at disbursement, not a repayment.`, x0, y, { width: pageW });
  y += 24;
  loans.forEach((loan, index) => {
    if (index) y = ensureRowSpace(doc, y, 160);
    const principalPaid = Number(loan.principalPaid || 0);
    const interestPaid = Number(loan.interestPaid || 0);
    const penaltyPaid = Number(loan.penaltyPaid || 0);
    const principalLeft = Number(loan.principalLeft || 0);
    const interestLeft = Number(loan.interestLeft || 0);
    const penaltyLeft = Number(loan.penaltyLeft || 0);
    const totalPaid = roundMoney(principalPaid + interestPaid + penaltyPaid);
    const totalStillToPay = roundMoney(principalLeft + interestLeft + penaltyLeft);
    const processingFee = Number(loan.processingFee || 0);
    fillRect(doc, x0, y, pageW, 24, index % 2 === 0 ? NAVY : BLUE);
    cellText(doc, `${loan.member}   ${loan.reference}   ${loan.product}   ${loan.status}`, x0, y, pageW, 24, { color: WHITE, bold: true, size: 12 });
    y += 24;
    y = drawLoanCardRow(doc, x0, y, pageW, [
      { label: "Date requested", value: formatDay(loan.requestedAt) },
      { label: "Date disbursed", value: formatDay(loan.disbursedAt) },
      { label: "Principal lent", value: money(loan.amount) },
      { label: "Term", value: `${loan.termMonths || "-"} months` },
      { label: "Processing fee (2%)", value: money(processingFee) },
    ], 50);
    y = drawLoanCardRow(doc, x0, y, pageW, [
      { label: "Principal already paid", value: moneyExact(principalPaid), bg: GREEN_CELL, valueColor: GREEN_TEXT },
      { label: "Interest already paid", value: moneyExact(interestPaid), bg: GREEN_CELL, valueColor: GREEN_TEXT },
      { label: "Penalties already paid", value: moneyExact(penaltyPaid), bg: GREEN_CELL, valueColor: GREEN_TEXT },
      { label: "Total already paid", value: moneyExact(totalPaid), bg: "#1F7A4D", labelColor: WHITE, valueColor: WHITE },
    ], 54);
    y = drawLoanCardRow(doc, x0, y, pageW, [
      { label: "Principal still to pay", value: moneyExact(principalLeft), bg: "#FCE4D6", valueColor: "#C65911" },
      { label: "Interest still to pay", value: moneyExact(interestLeft), bg: "#FFF2CC", valueColor: "#7F6000" },
      { label: "Penalties still to pay", value: moneyExact(penaltyLeft), bg: RED_CELL, valueColor: WHITE },
      { label: "Total still to pay", value: moneyExact(totalStillToPay), bg: NAVY, labelColor: WHITE, valueColor: WHITE },
    ], 54);
    y += 8;
    cellText(doc, "How and when installments were paid", x0, y, pageW, 16, { bold: true, size: 11, color: NAVY });
    y += 16;
    y = drawMiniTable(doc, x0, y, [
      { w: 90, label: "Date paid", align: "left" },
      { w: 120, label: "How paid", align: "left" },
      { w: 110, label: "Amount", align: "right", bold: true },
      { w: 200, label: "Receipt", align: "left" },
    ], loan.payments.map((p) => [formatDay(p.paidAt), p.method || "-", moneyExact(p.amount), p.reference || "-"]), { header: GREEN_TEXT });
    y += 10;
    cellText(doc, "Repayment schedule", x0, y, pageW, 16, { bold: true, size: 11, color: NAVY });
    y += 16;
    y = drawMiniTable(doc, x0, y, [
      { w: 32, label: "#", align: "center" },
      { w: 78, label: "Due date", align: "left" },
      { w: 78, label: "Opening", align: "right" },
      { w: 76, label: "Principal", align: "right" },
      { w: 68, label: "Interest", align: "right" },
      { w: 64, label: "Penalty", align: "right" },
      { w: 76, label: "Due", align: "right", bold: true },
      { w: 82, label: "Outstanding", align: "right" },
      { w: 76, label: "Paid amount", align: "right" },
      { w: 64, label: "Surplus", align: "right" },
      { w: 72, label: "Status", align: "left" },
    ], loan.schedule.map((s) => [
      s.installment,
      formatDay(s.dueDate),
      moneyExact(s.openingBalance),
      moneyExact(s.principal),
      moneyExact(s.interest),
      dashMoney(s.penalty),
      moneyExact(s.dueAmount),
      moneyExact(s.outstanding),
      dashMoney(s.amountPaid),
      dashMoney(s.surplusPaid),
      s.status,
    ]).concat([[
      "",
      "Total",
      "",
      moneyExact(loan.schedule.reduce((s, r) => s + Number(r.principal || 0), 0)),
      moneyExact(loan.schedule.reduce((s, r) => s + Number(r.interest || 0), 0)),
      dashMoney(loan.schedule.reduce((s, r) => s + Number(r.penalty || 0), 0)),
      moneyExact(loan.schedule.reduce((s, r) => s + Number(r.dueAmount || 0), 0)),
      moneyExact(loan.schedule.reduce((s, r) => s + Number(r.outstanding || 0), 0)),
      dashMoney(loan.schedule.reduce((s, r) => s + Number(r.amountPaid || 0), 0)),
      dashMoney(loan.schedule.reduce((s, r) => s + Number(r.surplusPaid || 0), 0)),
      "",
    ]]), { header: NAVY });
    y += 14;
  });
  if (!loans.length) {
    cellText(doc, "No active loans.", x0, y, pageW, 20, { size: 10, color: "#5B6B7C" });
  }
}

async function buildStandingPdf(kind, { asOf, memberId } = {}) {
  const parsed = parseAsOf(asOf);
  const label = asOfLabel(parsed);
  const member = await loadReportMember(memberId);
  if (parseMemberId(memberId) && !member) {
    throw Object.assign(new Error("Member not found"), { status: 404 });
  }
  const who = member ? `${member.name}` : "";
  const landscape = kind === "active-loans";
  const doc = new PDFDocument({ size: "A4", layout: landscape ? "landscape" : "portrait", margin: 18, bufferPages: true, info: { Title: `Kasangati G40 ${kind} report${who ? ` · ${who}` : ""}` } });
  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  const done = new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
  try {
    const viewDate = shortDate(parsed.day, parsed.month, parsed.year);
    const monthEndDate = shortDate(parsed.lastDay, parsed.month, parsed.year);
    const toDate = slashDate(parsed.day, parsed.month, parsed.year);
    if (kind === "savings") {
      const rows = filterMemberRows(await loadPersonalSavingsRows(parsed.asOfMonth), member?.id);
      drawHeader(doc, who ? `Personal Savings Report · ${who} as at ${label}` : `Personal Savings Report as at ${label}`);
      drawSavingsStyleTable(doc, rows, {
        paidLabel: `Available\n/Paid up\n${viewDate}`,
        expectedLabel: `Expected\n${monthEndDate}`,
        shareLabel: "Share\ncapital",
        summaryTitle: who ? `${who} savings` : "Client Savings Summary",
        rangeLabel: "Personal Savings",
        fromDate: "2024-01-01",
        toDate,
        unpaidLabel: "",
      });
    } else if (kind === "welfare") {
      const rows = filterMemberRows(await loadWelfareRows(parsed.asOfMonth), member?.id);
      drawHeader(doc, who ? `Welfare Standing Report · ${who} as at ${label}` : `Welfare Standing Report as at ${label}`);
      drawSavingsStyleTable(doc, rows, {
        paidLabel: `Contributed\n${viewDate}`,
        expectedLabel: `Expected\n${monthEndDate}`,
        summaryTitle: who ? `${who} welfare` : "Client Welfare Summary",
        rangeLabel: "Welfare since join",
        fromDate: "2024-06-01",
        toDate,
        unpaidLabel: "UNPAID WELFARE :",
      });
    } else if (kind === "loans") {
      const rows = filterMemberRows(await loadLoanRows(parsed.asOfMonth), member?.id, "memberId");
      drawHeader(doc, who ? `Loans Analysis Report · ${who} as at ${label}` : `Loans Analysis Report as at ${label}`);
      drawLoanTable(doc, rows);
    } else if (kind === "company") {
      const standing = await loadCompanyStanding();
      drawHeader(doc, `Company Standing Report as at ${label}`);
      drawCompanyStanding(doc, standing, label);
    } else if (kind === "assistance") {
      const rows = await loadAssistanceRows();
      drawHeader(doc, "Welfare Assistance Register");
      drawAssistanceRegister(doc, rows);
    } else if (kind === "active-loans") {
      const loans = filterMemberRows(await loadActiveLoanReports(), member?.id, "memberId");
      drawHeader(doc, who ? `Active Loans Report · ${who} as at ${label}` : `Active Loans Report as at ${label}`);
      drawActiveLoanReports(doc, loans, label);
    } else if (kind === "hosting-fee") {
      const standing = await loadHostingFeeStanding();
      drawHeader(doc, standing.reminderActive
        ? `Hosting Fee Report for ${standing.meetingLabel || label}`
        : `Hosting Fee Report as at ${label}`);
      drawHostingFeeReport(doc, standing, label);
    } else if (kind === "income-statement") {
      const statement = await loadIncomeStatement(parsed);
      drawHeader(doc, `Income Statement as at ${label}`);
      drawIncomeStatement(doc, statement, label);
    } else if (kind === "debtors-aging") {
      const aging = await loadDebtorsAging();
      drawHeader(doc, `Who still owes on loans · ${label}`);
      drawDebtorsAging(doc, aging, label);
    } else {
      throw Object.assign(new Error("Unknown standing report"), { status: 400 });
    }
    doc.font("Helvetica").fontSize(8).fillColor("#607084")
      .text(`Generated from Kasangati G40 Kwagalana records for ${label}.`, 28, doc.page.height - 24, { width: 700 });
  } catch (error) {
    try { doc.end(); } catch (_) { /* ignore */ }
    throw error;
  }
  doc.end();
  return Promise.race([
    done,
    new Promise((_, reject) => setTimeout(() => reject(new Error("PDF generation timed out")), 30000)),
  ]);
}

const TITLES = {
  savings: "Personal savings standing",
  welfare: "Welfare standings",
  loans: "Loans full analysis",
  company: "Company standing",
  assistance: "Welfare assistance register",
  "active-loans": "Active loans and installments",
  "hosting-fee": "Hosting fee payments",
  "income-statement": "Income statement",
  "debtors-aging": "Who still owes on loans",
};

module.exports = {
  buildStandingPdf,
  parseMemberId,
  loadReportMember,
  loadPersonalSavingsRows,
  loadWelfareRows,
  loadLoanRows,
  parseAsOf,
  TITLES,
  asOfLabel,
  isVicent,
  monthKey,
};
