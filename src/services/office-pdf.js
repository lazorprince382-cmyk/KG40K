"use strict";
/**
 * Convert Word (.doc / .docx) uploads to PDF for clear in-app viewing.
 * Prefers LibreOffice when installed; falls back to mammoth + PDFKit.
 */
const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");
const { spawnSync } = require("child_process");

const WORD_MIME = new Set([
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function isWordUpload(file = {}) {
  const mime = String(file.mimetype || "").toLowerCase();
  const ext = path.extname(String(file.originalname || file.filename || "")).toLowerCase();
  return WORD_MIME.has(mime) || [".doc", ".docx"].includes(ext);
}

function libreOfficeBinary() {
  const candidates = [
    process.env.LIBREOFFICE_PATH,
    process.env.SOFFICE_PATH,
    "soffice",
    "libreoffice",
    path.join(process.env["PROGRAMFILES"] || "C:\\Program Files", "LibreOffice", "program", "soffice.exe"),
    path.join(process.env["PROGRAMFILES(X86)"] || "C:\\Program Files (x86)", "LibreOffice", "program", "soffice.exe"),
    "/usr/bin/soffice",
    "/usr/bin/libreoffice",
    "/usr/lib/libreoffice/program/soffice",
    "/Applications/LibreOffice.app/Contents/MacOS/soffice",
  ].filter(Boolean);
  for (const candidate of candidates) {
    if (candidate === "soffice" || candidate === "libreoffice") {
      const probe = spawnSync(candidate, ["--version"], { encoding: "utf8", windowsHide: true });
      if (!probe.error && probe.status === 0) return candidate;
      continue;
    }
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function convertWithLibreOffice(inputPath, outputDir) {
  const binary = libreOfficeBinary();
  if (!binary) return null;
  const result = spawnSync(
    binary,
    ["--headless", "--nologo", "--nofirststartwizard", "--convert-to", "pdf", "--outdir", outputDir, inputPath],
    { encoding: "utf8", windowsHide: true, timeout: 120000 }
  );
  if (result.status !== 0) {
    console.warn("LibreOffice conversion failed:", result.stderr || result.stdout || result.error);
    return null;
  }
  const expected = path.join(outputDir, `${path.parse(inputPath).name}.pdf`);
  if (fs.existsSync(expected)) return expected;
  const pdf = fs.readdirSync(outputDir).find((name) => name.toLowerCase().endsWith(".pdf"));
  return pdf ? path.join(outputDir, pdf) : null;
}

async function convertWithMammothPdf(inputPath, outputPath) {
  const mammoth = require("mammoth");
  const PDFDocument = require("pdfkit");
  const converted = await mammoth.convertToHtml({ path: inputPath });
  const html = String(converted.value || "");
  const blocks = [];
  const tagRe = /<(h[1-6]|p|li|tr)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi;
  let match;
  while ((match = tagRe.exec(html))) {
    const tag = match[1].toLowerCase();
    const text = match[2]
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, " ")
      .trim();
    if (!text) continue;
    blocks.push({ tag, text });
  }
  if (!blocks.length) {
    const plain = (await mammoth.extractRawText({ path: inputPath })).value || "";
    plain
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .forEach((text) => blocks.push({ tag: "p", text }));
  }

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 54, bottom: 54, left: 54, right: 54 },
      info: { Title: path.basename(inputPath), Creator: "Kasangati G40 Kwagalana" },
    });
    const stream = fs.createWriteStream(outputPath);
    stream.on("finish", resolve);
    stream.on("error", reject);
    doc.on("error", reject);
    doc.pipe(stream);
    doc.font("Times-Roman");
    if (!blocks.length) {
      doc.fontSize(12).fillColor("#333").text("This Word document had no readable text to preview.", {
        align: "left",
      });
    } else {
      for (const block of blocks) {
        if (block.tag === "h1") doc.moveDown(0.4).font("Times-Bold").fontSize(18).fillColor("#0b1f3b").text(block.text);
        else if (block.tag === "h2") doc.moveDown(0.35).font("Times-Bold").fontSize(15).fillColor("#0b1f3b").text(block.text);
        else if (block.tag === "h3" || block.tag === "h4")
          doc.moveDown(0.25).font("Times-Bold").fontSize(13).fillColor("#17372b").text(block.text);
        else if (block.tag === "li")
          doc.moveDown(0.12).font("Times-Roman").fontSize(11).fillColor("#1f2a33").text(`•  ${block.text}`, {
            indent: 12,
            lineGap: 2,
          });
        else doc.moveDown(0.18).font("Times-Roman").fontSize(11).fillColor("#1f2a33").text(block.text, { lineGap: 2 });
      }
    }
    doc.end();
  });
  return outputPath;
}

/**
 * @param {{ path: string, originalname?: string, filename?: string, mimetype?: string }} file
 * @param {string} uploadsDir
 * @returns {Promise<null|{ filename: string, originalname: string, mimetype: string, size: number, path: string, convertedFrom: string }>}
 */
async function convertWordUploadToPdf(file, uploadsDir) {
  if (!file?.path || !isWordUpload(file)) return null;
  if (!fs.existsSync(file.path)) return null;

  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), "kg40-docx-"));
  const pdfName = `${Date.now()}-${crypto.randomBytes(10).toString("hex")}.pdf`;
  const pdfPath = path.join(uploadsDir, pdfName);
  const baseName = path.parse(String(file.originalname || file.filename || "document.docx")).name || "document";
  const pdfOriginal = `${baseName}.pdf`;

  try {
    let produced = convertWithLibreOffice(file.path, workDir);
    if (produced) {
      fs.copyFileSync(produced, pdfPath);
    } else {
      await convertWithMammothPdf(file.path, pdfPath);
    }
    if (!fs.existsSync(pdfPath) || fs.statSync(pdfPath).size < 20) {
      try {
        fs.unlinkSync(pdfPath);
      } catch (_) {
        /* ignore */
      }
      return null;
    }
    return {
      filename: pdfName,
      originalname: pdfOriginal,
      mimetype: "application/pdf",
      size: fs.statSync(pdfPath).size,
      path: pdfPath,
      convertedFrom: path.basename(String(file.originalname || file.filename || "document.docx")),
    };
  } catch (error) {
    console.warn("DOCX→PDF conversion failed:", error.message || error);
    try {
      if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
    } catch (_) {
      /* ignore */
    }
    return null;
  } finally {
    try {
      fs.rmSync(workDir, { recursive: true, force: true });
    } catch (_) {
      /* ignore */
    }
  }
}

module.exports = {
  isWordUpload,
  convertWordUploadToPdf,
  libreOfficeBinary,
};
