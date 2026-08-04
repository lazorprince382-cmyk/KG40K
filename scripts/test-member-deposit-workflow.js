const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { query, one, transaction, pool } = require("../src/db");

const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";
const testPassword = "Sacco@2026";
const testEmail = `deposit-workflow-${Date.now()}@example.test`;
let memberId;
let memberUserId;
const transactionIds = [];
const evidenceFiles = [];

function assert(value, message) {
  if (!value) throw new Error(message);
}

async function request(pathname, options = {}, cookie = "") {
  const response = await fetch(`${baseUrl}${pathname}`, {
    ...options,
    headers: { ...(options.headers || {}), ...(cookie ? { Cookie: cookie } : {}) }
  });
  const type = response.headers.get("content-type") || "";
  const body = type.includes("application/json") ? await response.json() : await response.arrayBuffer();
  if (!response.ok) {
    const detail = body && body.error ? body.error : `${response.status} ${response.statusText}`;
    throw new Error(`${pathname}: ${detail}`);
  }
  return { response, body };
}

async function login(email, password) {
  const { response } = await request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const cookie = response.headers.get("set-cookie");
  assert(cookie, `Login for ${email} did not return a session cookie`);
  return cookie.split(";")[0];
}

function receiptForm(amount, reference) {
  const form = new FormData();
  form.set("amount", String(amount));
  form.set("method", "Mobile Money");
  form.set("externalReference", reference);
  form.set("notes", "Automated member deposit workflow verification");
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZQmcAAAAASUVORK5CYII=",
    "base64"
  );
  form.set("receipt", new Blob([png], { type: "image/png" }), "payment-receipt.png");
  return form;
}

async function cleanup() {
  if (transactionIds.length) {
    const files = await query(
      "SELECT evidence_stored_name FROM transactions WHERE id=ANY($1::bigint[])",
      [transactionIds]
    );
    evidenceFiles.push(...files.rows.map((row) => row.evidence_stored_name).filter(Boolean));
    await query("DELETE FROM audit_logs WHERE entity_type='transaction' AND entity_id=ANY($1::text[])", [
      transactionIds.map(String)
    ]);
    await query("DELETE FROM transactions WHERE id=ANY($1::bigint[])", [transactionIds]);
  }
  if (memberUserId) {
    await query("DELETE FROM audit_logs WHERE user_id=$1", [memberUserId]);
    await query("DELETE FROM users WHERE id=$1", [memberUserId]);
  }
  if (memberId) await query("DELETE FROM members WHERE id=$1", [memberId]);
  for (const file of evidenceFiles) {
    const safeName = path.basename(file);
    const target = path.join(__dirname, "..", "storage", "uploads", safeName);
    if (fs.existsSync(target)) fs.unlinkSync(target);
  }
}

async function main() {
  const branch = await one("SELECT id FROM branches WHERE active=true ORDER BY id LIMIT 1");
  const credits = await one(
    `SELECT u.id,u.email FROM users u
     JOIN department_assignments da ON da.user_id=u.id AND da.active=true AND da.can_approve=true
     JOIN departments d ON d.id=da.department_id AND d.code='credits'
     WHERE u.role='Credits Officer' AND u.active=true ORDER BY da.authority_level DESC,u.id LIMIT 1`
  );
  assert(branch, "No active branch exists");
  assert(credits, "No active Credits Officer has deposit approval authority");
  const hash = await bcrypt.hash(testPassword, 10);
  const created = await transaction(async (client) => {
    const member = (
      await client.query(
        `INSERT INTO members
          (member_number,full_name,email,phone,national_id,branch_id,status,savings_balance)
         VALUES ($1,$2,$3,$4,$5,$6,'active',0) RETURNING id`,
        [
          `TEST-DEP-${Date.now()}`,
          "Deposit Workflow Test Member",
          testEmail,
          "+256700000999",
          `TEST-NID-${Date.now()}`,
          branch.id
        ]
      )
    ).rows[0];
    const user = (
      await client.query(
        `INSERT INTO users
          (full_name,email,phone,password_hash,role,branch_id,member_id,active,must_change_password)
         VALUES ($1,$2,$3,$4,'Member',$5,$6,true,false) RETURNING id`,
        ["Deposit Workflow Test Member", testEmail, "+256700000999", hash, branch.id, member.id]
      )
    ).rows[0];
    return { member, user };
  });
  memberId = created.member.id;
  memberUserId = created.user.id;

  const memberCookie = await login(testEmail, testPassword);
  const creditsCookie = await login(credits.email, testPassword);

  const submitted = await request(
    "/api/member/deposits",
    { method: "POST", body: receiptForm(125000, `MM-${Date.now()}`) },
    memberCookie
  );
  transactionIds.push(submitted.body.id);
  assert(submitted.body.status === "pending", "Member submission was not kept pending");

  let center = (await request("/api/member/command-center", {}, memberCookie)).body;
  assert(center.member.savings === 0, "Savings changed before Credits verification");
  let memberTransaction = center.transactions.find((item) => item.id === submitted.body.id);
  assert(memberTransaction && memberTransaction.hasEvidence, "Member history does not show receipt evidence");
  assert(memberTransaction.submissionSource === "member", "Submission source was not preserved");

  const creditsCenter = (await request("/api/credits/command-center", {}, creditsCookie)).body;
  const reviewItem = creditsCenter.transactions.find((item) => item.id === submitted.body.id);
  assert(reviewItem && reviewItem.status === "pending", "Deposit did not reach the Credits review queue");
  assert(reviewItem.hasEvidence, "Credits cannot see that evidence is attached");
  const evidence = await request(`/api/transactions/${submitted.body.id}/evidence`, {}, creditsCookie);
  assert(evidence.body.byteLength > 0, "Credits receipt preview returned an empty file");

  const approval = await request(
    `/api/transactions/${submitted.body.id}/verify`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        decision: "approve",
        comment: "Funds received and uploaded receipt evidence matched"
      })
    },
    creditsCookie
  );
  assert(approval.body.status === "completed", "Approved deposit was not completed");
  assert(approval.body.receiptNumber, "Approved deposit did not receive an official receipt");

  center = (await request("/api/member/command-center", {}, memberCookie)).body;
  assert(center.member.savings === 125000, "Approved amount was not added to member savings");
  memberTransaction = center.transactions.find((item) => item.id === submitted.body.id);
  assert(memberTransaction.status === "completed", "Member history does not show the completed status");
  assert(memberTransaction.receiptNumber, "Member history does not show the official receipt");
  assert(memberTransaction.verifiedBy, "Member history does not show who verified the deposit");

  const rejected = await request(
    "/api/member/deposits",
    { method: "POST", body: receiptForm(35000, `MM-REJECT-${Date.now()}`) },
    memberCookie
  );
  transactionIds.push(rejected.body.id);
  await request(
    `/api/transactions/${rejected.body.id}/verify`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision: "reject", comment: "Payment reference could not be confirmed" })
    },
    creditsCookie
  );
  center = (await request("/api/member/command-center", {}, memberCookie)).body;
  assert(center.member.savings === 125000, "Rejected deposit incorrectly changed member savings");
  const rejectedHistory = center.transactions.find((item) => item.id === rejected.body.id);
  assert(rejectedHistory.status === "rejected", "Rejected status was not retained in history");
  assert(
    rejectedHistory.verificationComment === "Payment reference could not be confirmed",
    "Rejection reason was not retained in history"
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        pendingBeforeApproval: true,
        receiptPreviewedByCredits: true,
        approvedBalance: center.member.savings,
        officialReceiptCreated: true,
        rejectedDepositDidNotChangeBalance: true,
        historyRetained: true
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await cleanup();
    } catch (error) {
      console.error(`Cleanup failed: ${error.message}`);
      process.exitCode = 1;
    }
    await pool.end();
  });
