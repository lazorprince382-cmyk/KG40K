const assert = require("assert");
const { query, pool } = require("../src/db");

const base = "http://127.0.0.1:3000";
const testPassword = process.env.SUPERVISORY_TEST_PASSWORD;
let cookie = "";

async function request(path, options = {}) {
  const response = await fetch(base + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
      ...(options.headers || {}),
    },
  });
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) cookie = setCookie.split(";")[0];
  const type = response.headers.get("content-type") || "";
  const body = type.includes("json") ? await response.json() : await response.text();
  return { response, body };
}

async function main() {
  assert(testPassword, "SUPERVISORY_TEST_PASSWORD is required");
  const login = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "supervisory@kasangatig40.test", password: testPassword }),
  });
  assert.equal(login.response.status, 200, "Supervisory login failed");

  const center = await request("/api/supervisory/command-center");
  assert.equal(center.response.status, 200);
  const s = center.body;
  assert.equal(Object.keys(s.stats).length, 12);
  assert.equal(s.scorecards.length, 7);
  assert.equal(s.followups.length >= 5, true);
  assert.equal(s.committees.length >= 5, true);
  assert.equal(s.resolutions.length >= 6, true);
  assert.equal(s.complaints.length >= 5, true);
  assert.equal(s.projects.length >= 5, true);
  assert.equal(s.recommendations.length >= 6, true);
  assert.equal(s.siteVisits.length >= 4, true);
  assert.equal(s.kpis.length, 7);
  assert.equal(s.access.operationalAccess, "read_only");

  const search = await request("/api/supervisory/search?q=Finance");
  assert.equal(search.response.status, 200);
  assert.equal(search.body.results.length > 0, true);

  const invalid = await request("/api/supervisory/followups", { method: "POST", body: "{}" });
  assert.equal(invalid.response.status, 400);

  const created = await request("/api/supervisory/followups", {
    method: "POST",
    body: JSON.stringify({
      departmentId: s.departments[0].id,
      actionRequired: "Temporary automated validation follow-up",
      responsibleOfficer: "Automated Test",
      deadline: "2026-09-30",
      evidence: "Test only",
    }),
  });
  assert.equal(created.response.status, 201);
  await query("DELETE FROM supervisory_followups WHERE id=$1", [created.body.id]);

  for (const path of ["/api/finance/income", "/api/credits/deposits", "/api/investment/projects",
    "/api/welfare/requests", "/api/legal/cases", "/api/audit/plans"]) {
    const result = await request(path, { method: "POST", body: "{}" });
    assert.equal(result.response.status, 403, `Supervisory write boundary failed for ${path}`);
  }

  for (const asset of ["/", "/app.js", "/department-core.js", "/supervisory-module.js",
    "/supervisory-styles.css", "/sw.js"]) {
    const result = await request(asset);
    assert.equal(result.response.status, 200, `Static asset unavailable: ${asset}`);
  }

  console.log(JSON.stringify({
    login: "ok",
    stats: s.stats,
    counts: {
      scorecards: s.scorecards.length,
      followups: s.followups.length,
      committees: s.committees.length,
      resolutions: s.resolutions.length,
      complaints: s.complaints.length,
      projects: s.projects.length,
      recommendations: s.recommendations.length,
      siteVisits: s.siteVisits.length,
      kpis: s.kpis.length,
    },
    operationalAccess: s.access.operationalAccess,
    permissionBoundaries: "verified",
    staticAssets: "verified",
  }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => pool.end());
