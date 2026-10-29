"use strict";
const PDFDocument = require("pdfkit");
const { query } = require("./db");
const { loadScheduleSettings, expectedAtEndOf, monthIndex, monthKey } = require("./savings-schedule");

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
             AND c.contribution_date > $1::date),0)::float AS "welfareFromSavingsAfter"
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
      const paid = parsed.isCurrent
        ? current
        : current - Number(m.depositsAfter || 0) + Number(m.withdrawalsAfter || 0) + Number(m.welfareFromSavingsAfter || 0);
      const expected = expectedAtEndOf(settings, joinMonth, parsed.index);
      const variance = paid - expected;
      return { name: m.name, memberNumber: m.memberNumber, paid, expected, variance };
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
      `SELECT l.reference, m.full_name AS member, m.member_number AS "memberNumber",
         COALESCE(p.name,'Loan') AS product,
         l.amount::float, l.balance::float, l.status, l.due_date AS "dueDate",
         l.term_months AS "termMonths",
         COALESCE((SELECT SUM(s.total_due) FROM loan_repayment_schedule s WHERE s.loan_id=l.id), l.amount)::float AS "totalDue",
         COALESCE((SELECT SUM(s.paid_amount) FROM loan_repayment_schedule s WHERE s.loan_id=l.id),0)::float AS "totalPaid",
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
    outstanding: Math.max(0, Number(row.totalDue || 0) - Number(row.totalPaid || 0)),
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

function drawHeader(doc, title) {
  doc.font("Helvetica-Bold").fontSize(13).fillColor(NAVY).text("KASANGATI G40 KWAGALANA LIMITED", 18, 16, { align: "center" });
  doc.font("Helvetica-Bold").fontSize(11).fillColor(BLUE).text(title, 18, 32, { align: "center" });
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
} = {}) {
  const rowH = 18;
  const headH = 36;
  const cols = [
    { key: "no", label: "No.", w: 32, align: "center", header: CYAN, body: WHITE, text: "#0B1F3B" },
    { key: "name", label: "Client Name", w: 168, align: "left", header: CYAN, body: SKY, text: "#0B1F3B" },
    { key: "paid", label: paidLabel, w: 100, align: "right", header: CYAN, body: CYAN_CELL, text: "#0B1F3B" },
    { key: "expected", label: expectedLabel, w: 100, align: "right", header: NAVY, body: WHITE, text: "#0B1F3B" },
    { key: "variance", label: "Deficit/Surplus", w: 110, align: "right", header: RED, body: WHITE, text: "#0B1F3B" },
  ];
  const tableW = cols.reduce((sum, c) => sum + c.w, 0);
  const x0 = (doc.page.width - tableW) / 2;
  let y = 50;
  fillRect(doc, x0, y, tableW, rowH, NAVY);
  cellText(doc, summaryTitle, x0, y, tableW, rowH, { align: "center", color: WHITE, bold: true, size: 10 });
  y += rowH;
  fillRect(doc, x0, y, cols[0].w + cols[1].w, rowH, WHITE);
  cellText(doc, rangeLabel, x0, y, cols[0].w + cols[1].w, rowH, { align: "left", color: NAVY, bold: true, size: 8 });
  fillRect(doc, x0 + cols[0].w + cols[1].w, y, cols[2].w, rowH, WHITE);
  cellText(doc, `From  ${fromDate}`, x0 + cols[0].w + cols[1].w, y, cols[2].w, rowH, { align: "center", color: NAVY, bold: true, size: 8 });
  fillRect(doc, x0 + cols[0].w + cols[1].w + cols[2].w, y, cols[3].w + cols[4].w, rowH, WHITE);
  cellText(doc, `To  ${toDate}`, x0 + cols[0].w + cols[1].w + cols[2].w, y, cols[3].w + cols[4].w, rowH, { align: "center", color: NAVY, bold: true, size: 8 });
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
    const values = [index + 1, row.name, money(row.paid), money(row.expected), money(row.variance)];
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
  const totalVar = totalPaid - totalExpected;
  const unpaid = rows.reduce((s, r) => s + Math.max(0, -Number(r.variance || 0)), 0);
  const totals = ["", "Total :", money(totalPaid), money(totalExpected), money(totalVar)];
  x = x0;
  cols.forEach((col, i) => {
    const bg = i >= 2 ? (Number(totalVar) < 0 ? RED_CELL : GREEN_CELL) : "#F2F2F2";
    fillRect(doc, x, y, col.w, rowH, bg);
    cellText(doc, totals[i], x, y, col.w, rowH, {
      align: col.align,
      bold: true,
      size: 8,
      color: i >= 2 && totalVar < 0 ? WHITE : "#0B1F3B",
    });
    x += col.w;
  });
  y += rowH + 6;
  fillRect(doc, x0 + cols[0].w + cols[1].w, y, cols[2].w, rowH, RED);
  cellText(doc, unpaidLabel, x0 + cols[0].w + cols[1].w, y, cols[2].w, rowH, { align: "center", color: WHITE, bold: true, size: 8 });
  fillRect(doc, x0 + cols[0].w + cols[1].w + cols[2].w, y, cols[3].w + cols[4].w, rowH, RED_CELL);
  cellText(doc, money(-unpaid), x0 + cols[0].w + cols[1].w + cols[2].w, y, cols[3].w + cols[4].w, rowH, {
    align: "right",
    color: WHITE,
    bold: true,
    size: 9,
  });
}

function drawLoanTable(doc, rows) {
  const rowH = 16;
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
      money(row.amount),
      money(row.outstanding ?? row.balance),
      row.status,
      row.nextDue ? new Date(row.nextDue).toLocaleDateString("en-GB") : "-",
    ];
    x = x0;
    cols.forEach((col, i) => {
      const bg = overdue && i >= 5 ? RED_CELL : i === 1 ? (index % 2 === 0 ? SKY : WHITE) : WHITE;
      fillRect(doc, x, y, col.w, rowH, bg);
      doc.strokeColor(LINE).lineWidth(0.3).rect(x, y, col.w, rowH).stroke();
      cellText(doc, values[i], x, y, col.w, rowH, { align: i >= 4 ? "right" : "left", size: 7, bold: i >= 4 });
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

async function buildStandingPdf(kind, { asOf } = {}) {
  const parsed = parseAsOf(asOf);
  const label = asOfLabel(parsed);
  const doc = new PDFDocument({ size: "A4", layout: "portrait", margin: 18, bufferPages: true, info: { Title: `Kasangati G40 ${kind} report` } });
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
      const rows = await loadPersonalSavingsRows(parsed.asOfMonth);
      drawHeader(doc, `Personal Savings Report as at ${label}`);
      drawSavingsStyleTable(doc, rows, {
        paidLabel: `Available\n/Paid up\n${viewDate}`,
        expectedLabel: `Expected\n${monthEndDate}`,
        summaryTitle: "Client Savings Summary",
        rangeLabel: "Personal Savings",
        fromDate: "2024-01-01",
        toDate,
        unpaidLabel: "UNPAID SAVINGS :",
      });
    } else if (kind === "welfare") {
      const rows = await loadWelfareRows(parsed.asOfMonth);
      drawHeader(doc, `Welfare Standing Report as at ${label}`);
      drawSavingsStyleTable(doc, rows, {
        paidLabel: `Contributed\n${viewDate}`,
        expectedLabel: `Expected\n${monthEndDate}`,
        summaryTitle: "Client Welfare Summary",
        rangeLabel: "Welfare since join",
        fromDate: "2024-06-01",
        toDate,
        unpaidLabel: "UNPAID WELFARE :",
      });
    } else if (kind === "loans") {
      const rows = await loadLoanRows(parsed.asOfMonth);
      drawHeader(doc, `Loans Analysis Report as at ${label}`, "Facilities, outstanding balances and repayment standing");
      drawLoanTable(doc, rows);
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
    new Promise((_, reject) => setTimeout(() => reject(new Error("PDF generation timed out")), 20000)),
  ]);
}

const TITLES = {
  savings: "Personal savings standing",
  welfare: "Welfare standings",
  loans: "Loans full analysis",
};

module.exports = {
  buildStandingPdf,
  loadPersonalSavingsRows,
  loadWelfareRows,
  loadLoanRows,
  parseAsOf,
  TITLES,
  asOfLabel,
  isVicent,
  monthKey,
};
