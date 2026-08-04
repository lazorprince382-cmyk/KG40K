"use strict";
const assert=require("assert");
const base=process.env.TEST_BASE_URL||"http://127.0.0.1:3000";
const password=process.env.SECURITY_TEST_PASSWORD;

async function response(path,options={}) {
  return fetch(base+path,options);
}
async function login(email) {
  const result=await response("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});
  assert.equal(result.status,200,`login failed for ${email}`);
  return result.headers.get("set-cookie").split(";")[0];
}
async function authed(path,cookie) {
  return response(path,{headers:{Cookie:cookie}});
}

async function main() {
  assert(password,"SECURITY_TEST_PASSWORD is required");
  const health=await response("/api/health");
  assert.equal(health.status,200);
  const page=await response("/");
  assert.equal(page.status,200);
  assert((page.headers.get("content-security-policy")||"").includes("object-src 'none'"));
  for(const path of ["/server.js","/src/server.js","/src/db.js","/database/migrations/001-core.sql","/scripts/seed.js","/node_modules/express/package.json","/storage/uploads/example.txt","/uploads/example.txt"]) {
    assert.equal((await response(path)).status,404,`${path} must not be public`);
  }
  assert.equal((await response("/api/not-a-route")).status,404);
  const crossSite=await response("/api/auth/login",{method:"POST",headers:{Origin:"https://attacker.example","Content-Type":"application/json"},body:"{}"});
  assert.equal(crossSite.status,403);

  const legal=await login("legal@kasangatig40.test");
  const bootstrap=await (await authed("/api/bootstrap",legal)).json();
  assert.equal(bootstrap.loans.length,0);
  assert.equal(bootstrap.transactions.length,0);
  for(const member of bootstrap.members)for(const field of ["national_id","savings","shares","dividends","fines","occupation","employer","address","next_of_kin"])
    assert.equal(member[field],undefined,`Legal bootstrap leaked ${field}`);
  for(const path of ["/api/loans/guarantor-candidates?memberId=1","/api/loans/1/details","/api/reports/loans.csv"])
    assert.equal((await authed(path,legal)).status,403,`Legal must be denied ${path}`);

  const credits=await login("credits@kasangatig40.test");
  assert.equal((await authed("/api/loans/guarantor-candidates?memberId=1",credits)).status,200);
  assert.equal((await authed("/api/reports/loans.csv",credits)).status,200);

  const member=await login("amina@tujenge.test");
  const memberBootstrap=await (await authed("/api/bootstrap",member)).json();
  assert.equal(memberBootstrap.members.length,1);
  assert.notEqual(memberBootstrap.members[0].savings,undefined);
  assert.notEqual(memberBootstrap.members[0].national_id,undefined);
  console.log(JSON.stringify({staticBoundary:"verified",securityHeaders:"verified",csrfOrigin:"verified",legalPrivacy:"verified",creditsAccess:"verified",memberSelfAccess:"verified"},null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
