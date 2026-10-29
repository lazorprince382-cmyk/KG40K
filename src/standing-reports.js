"use strict";
const PDFDocument = require("pdfkit");
const { query, one } = require("./db");
const { loadScheduleSettings, expectedAtEndOf, monthIndex, monthLabel } = require("./savings-schedule");
const { loadWelfareStanding } = require("./welfare-standing");

const NAVY = "#1F4E79";
const BLUE = "#2E75B6";
const CYAN = "#00B0F0";
const CYAN_CELL = "#B7DEE8";
const RED = "#C00000";
const RED_CELL = "#FF6B6B";
const GREEN_CELL = "#C6EFCE";
const GREEN_TEXT = "#006100";
const WHITE = "#FFFFFF";
const LINE = "#8EA8C3";

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

function asOfLabel(date = new Date()) {
  const k = kampalaNow();
  const d = new Date(Date.UTC(k.year, k.month - 1, k.day));
  const day = d.getUTCDate();
  const ord = ["th", "st", "nd", "rd"][day % 100 > 10 && day % 100 < 14 ? 0 : day % 10] || "th";
  const month = d.toLocaleDateString("en-GB", { month: "long", timeZone: "UTC" });
  return `${day}${ord} ${month} ${d.getUTCFullYear()}`;
}

function money(value) {
  return Number(value || 0).toLocaleString("en-UG", { maximumFractionDigits: 0 });
}

function isVicent(name) {
  return /vicent|vincent/i.test(name || "") && /gumisiriza/i.test(name || "");
}

async function loadPersonalSavingsRows() {
  const settings = await loadScheduleSettings();
  const members = (
    await query(
      `SELECT m.id, m.full_name AS name, m.member_number AS "memberNumber",
         m.savings_balance::float AS savings, to_char(m.joined_at,'YYYY-MM') AS "joinMonth",
         COALESCE((SELECT SUM(c.amount) FROM welfare_contributions c
           WHERE c.member_id=m.id AND c.status IN ('verified','completed','recorded') AND c.amount>0
             AND c.contribution_type NOT ILIKE '%standing%' AND COALESCE(c.reference,'') NOT LIKE 'WEL-STANDING-%'
             AND c.contribution_date > $1::date),0)::float AS "welfareSinceBenchmark"
       FROM members m
       WHERE m.deleted_at IS NULL AND m.status='active'
       ORDER BY m.full_name`,
      [settings.benchmarkDate]
    )
  ).rows;
  return members
    .map((m) => {
      const joinMonth = m.joinMonth ? monthIndex(m.joinMonth) : null;
      const paid = Number(m.savings || 0);
      const expected = expectedAtEndOf(settings, joinMonth, settings.currentMonth);
      const variance = paid - expected;
      return {
        name: m.name,
        memberNumber: m.memberNumber,
        paid,
        expected,
        variance,
      };
    })
    .sort((a, b) => a.variance - b.variance || a.name.localeCompare(b.name));
}

async function loadWelfareRows() {
  const standing = await loadWelfareStanding();
  return (standing.byMember || [])
    .filter((row) => !row.excluded)
    .map((row) => {
      const paid = Number(row.contributedSince || row.standingBalance || 0);
      const expected = row.isVicent ? standing.vicentTarget || paid : Number(standing.standardGrossTarget || 700000);
      return {
        name: row.member,
        memberNumber: row.memberNumber,
        paid,
        expected,
        variance: paid - expected,
        current: Number(row.currentBalance || 0),
      };
    })
    .sort((a, b) => a.variance - b.variance || a.name.localeCompare(b.name));
}

async function loadLoanRows() {
  const rows = (
    await query(
      `SELECT l.reference, m.full_name AS member, m.member_number AS "memberNumber", p.name AS product,
         l.amount::float, l.balance::float, l.status, l.due_date AS "dueDate",
         l.term_months AS "termMonths",
         COALESCE((SELECT SUM(s.total_due) FROM loan_repayment_schedule s WHERE s.loan_id=l.id), l.amount)::float AS "totalDue",
         COALESCE((SELECT SUM(s.paid_amount) FROM loan_repayment_schedule s WHERE s.loan_id=l.id),0)::float AS "totalPaid",
         (SELECT MIN(s.due_date) FROM loan_repayment_schedule s WHERE s.loan_id=l.id AND s.status<>'paid') AS "nextDue"
       FROM loans l
       JOIN members m ON m.id=l.member_id
       JOIN loan_products p ON p.id=l.product_id
       WHERE m.deleted_at IS NULL
       ORDER BY CASE l.status WHEN 'overdue' THEN 0 WHEN 'active' THEN 1 ELSE 2 END, m.full_name, l.id`
    )
  ).rows;
  return rows.map((row) => ({
    ...row,
    outstanding: Math.max(0, Number(row.totalDue || 0) - Number(row.totalPaid || 0)),
  }));
}

function fillRect(doc, x, y, w, h, color) {
  doc.save().fillColor(color).rect(x, y, w, h).fill().restore();
}

function cellText(doc, text, x, y, w, h, { align = "left", color = "#0B1F3B", bold = false, size = 8 } = {}) {
  doc.fillColor(color).font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(size);
  doc.text(String(text ?? ""), x + 4, y + (h - size) / 2 - 1, { width: w - 8, align, lineBreak: false });
}

function drawHeader(doc, title, subtitle) {
  doc.font("Helvetica-Bold").fontSize(16).fillColor(NAVY).text("KASANGATI G40 KWAGALANA LIMITED", 28, 22, { align: "center" });
  doc.font("Helvetica-Bold").fontSize(13).fillColor(BLUE).text(title, 28, 42, { align: "center" });
  doc.font("Helvetica-Bold").fontSize(11).fillColor(NAVY).text(subtitle, 28, 60, { align: "center" });
}

function drawSavingsStyleTable(doc, rows, paidLabel, expectedLabel, summaryTitle = "Client Savings Summary", unpaidLabel = "UNPAID SAVINGS :") {
  const startY = 86;
  const rowH = 16;
  const cols = [
    { key: "no", label: "No.", w: 36, align: "center" },
    { key: "name", label: "Client Name", w: 250, align: "left", fill: CYAN_CELL },
    { key: "paid", label: paidLabel, w: 150, align: "right", header: CYAN },
    { key: "expected", label: expectedLabel, w: 150, align: "right", header: NAVY },
    { key: "variance", label: "Deficit/Surplus", w: 178, align: "right", header: RED },
  ];
  const tableW = cols.reduce((sum, c) => sum + c.w, 0);
  const x0 = (doc.page.width - tableW) / 2;
  fillRect(doc, x0, startY, tableW, rowH, NAVY);
  cellText(doc, summaryTitle, x0, startY, tableW, rowH, { align: "center", color: WHITE, bold: true, size: 10 });
  let y = startY + rowH;
  let x = x0;
  cols.forEach((col) => {
    fillRect(doc, x, y, col.w, rowH + 4, col.header || CYAN);
    cellText(doc, col.label, x, y, col.w, rowH + 4, { align: "center", color: WHITE, bold: true, size: 8 });
    x += col.w;
  });
  y += rowH + 4;
  rows.forEach((row, index) => {
    const deficit = Number(row.variance) < -0.5;
    const surplus = Number(row.variance) > 0.5;
    x = x0;
    const values = [
      index + 1,
      row.name,
      money(row.paid),
      money(row.expected),
      money(row.variance),
    ];
    cols.forEach((col, i) => {
      let bg = WHITE;
      let color = "#0B1F3B";
      if (col.key === "name" || col.key === "paid") bg = CYAN_CELL;
      if (col.key === "variance") {
        bg = deficit ? RED_CELL : surplus ? GREEN_CELL : WHITE;
        color = deficit ? WHITE : surplus ? GREEN_TEXT : "#0B1F3B";
      }
      fillRect(doc, x, y, col.w, rowH, bg);
      doc.strokeColor(LINE).lineWidth(0.3).rect(x, y, col.w, rowH).stroke();
      cellText(doc, values[i], x, y, col.w, rowH, { align: col.align, color, bold: col.key !== "name", size: 8 });
      x += col.w;
    });
    y += rowH;
  });
  const totalPaid = rows.reduce((s, r) => s + Number(r.paid || 0), 0);
  const totalExpected = rows.reduce((s, r) => s + Number(r.expected || 0), 0);
  const totalVar = totalPaid - totalExpected;
  const unpaid = rows.reduce((s, r) => s + Math.max(0, -Number(r.variance || 0)), 0);
  const totals = ["", "Total :", money(totalPaid), money(totalExpected), money(totalVar)];
  x = x0;
  cols.forEach((col, i) => {
    fillRect(doc, x, y, col.w, rowH, i >= 2 ? (Number(totalVar) < 0 ? RED_CELL : GREEN_CELL) : "#F2F2F2");
    cellText(doc, totals[i], x, y, col.w, rowH, { align: col.align, bold: true, size: 8, color: i === 4 && totalVar < 0 ? WHITE : "#0B1F3B" });
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
  const startY = 86;
  const rowH = 15;
  const cols = [
    { w: 28, label: "No." },
    { w: 150, label: "Member" },
    { w: 88, label: "Loan" },
    { w: 110, label: "Product" },
    { w: 78, label: "Amount" },
    { w: 78, label: "Outstanding" },
    { w: 70, label: "Status" },
    { w: 80, label: "Next due" },
  ];
  const tableW = cols.reduce((s, c) => s + c.w, 0);
  const x0 = (doc.page.width - tableW) / 2;
  let y = startY;
  let x = x0;
  cols.forEach((col) => {
    fillRect(doc, x, y, col.w, rowH + 4, NAVY);
    cellText(doc, col.label, x, y, col.w, rowH + 4, { align: "center", color: WHITE, bold: true, size: 8 });
    x += col.w;
  });
  y += rowH + 4;
  rows.forEach((row, index) => {
    if (y > doc.page.height - 40) {
      doc.addPage();
      y = 36;
    }
    const overdue = String(row.status) === "overdue" || Number(row.outstanding) > 0 && row.nextDue && new Date(row.nextDue) < new Date();
    const values = [
      index + 1,
      row.member,
      row.reference,
      row.product,
      money(row.amount),
      money(row.outstanding ?? row.balance),
      row.status,
      row.nextDue ? new Date(row.nextDue).toLocaleDateString("en-GB") : "—",
    ];
    x = x0;
    cols.forEach((col, i) => {
      const bg = overdue && i >= 5 ? RED_CELL : i === 1 ? CYAN_CELL : WHITE;
      fillRect(doc, x, y, col.w, rowH, bg);
      doc.strokeColor(LINE).lineWidth(0.3).rect(x, y, col.w, rowH).stroke();
      cellText(doc, values[i], x, y, col.w, rowH, { align: i >= 4 ? "right" : "left", size: 7, bold: i >= 4 });
      x += col.w;
    });
    y += rowH;
  });
  const outstanding = rows.reduce((s, r) => s + Number(r.outstanding ?? r.balance ?? 0), 0);
  const disbursed = rows.filter((r) => ["active", "overdue"].includes(r.status)).reduce((s, r) => s + Number(r.amount || 0), 0);
  y += 10;
  doc.font("Helvetica-Bold").fontSize(9).fillColor(NAVY)
    .text(`Active / overdue principal outstanding: UGX ${money(outstanding)}    Disbursed on active book: UGX ${money(disbursed)}    Facilities: ${rows.length}`, x0, y);
}

async function buildStandingPdf(kind) {
  const asOf = asOfLabel();
  const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 24, info: { Title: `Kasangati G40 ${kind} report` } });
  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  const done = new Promise((resolve, reject) => {
    doc.on("end", resolve);
    doc.on("error", reject);
  });
  if (kind === "savings") {
    const rows = await loadPersonalSavingsRows();
    drawHeader(doc, `Personal Savings Report as at ${asOf}`, "Client Savings Summary");
    drawSavingsStyleTable(doc, rows, `Available / Paid up`, `Expected ${monthLabel(kampalaNow().year * 12 + kampalaNow().month - 1)}`);
  } else if (kind === "welfare") {
    const rows = await loadWelfareRows();
    const standing = await loadWelfareStanding();
    drawHeader(doc, `Welfare Standing Report as at ${asOf}`, `Expected UGX ${money(standing.standardGrossTarget)} since ${standing.sinceLabel}`);
    drawSavingsStyleTable(doc, rows, "Contributed", "Expected", "Client Welfare Summary", "UNPAID WELFARE :");
  } else {
    const rows = await loadLoanRows();
    drawHeader(doc, `Loans Analysis Report as at ${asOf}`, "Current facilities, outstanding balances and repayment standing");
    drawLoanTable(doc, rows);
  }
  doc.font("Helvetica").fontSize(8).fillColor("#607084")
    .text("Generated from live Kasangati G40 Kwagalana records. View in-app as PDF.", 28, doc.page.height - 28, { align: "left" });
  doc.end();
  await done;
  return Buffer.concat(chunks);
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
  TITLES,
  asOfLabel,
  isVicent,
};
