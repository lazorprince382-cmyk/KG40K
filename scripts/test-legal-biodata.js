const assert = require("assert");

const base = "http://127.0.0.1:3000";
const password = process.env.LEGAL_TEST_PASSWORD;
let cookie = "";

async function request(path, options = {}) {
  const response = await fetch(base + path, {
    ...options,
    headers: {"Content-Type":"application/json",...(cookie?{Cookie:cookie}:{}),...(options.headers||{})},
  });
  const setCookie=response.headers.get("set-cookie");
  if(setCookie)cookie=setCookie.split(";")[0];
  const type=response.headers.get("content-type")||"";
  return {response,body:type.includes("json")?await response.json():await response.text()};
}

async function login(email) {
  cookie="";
  return request("/api/auth/login",{method:"POST",body:JSON.stringify({email,password})});
}

async function main() {
  assert(password,"LEGAL_TEST_PASSWORD is required");
  assert.equal((await login("legal@kasangatig40.test")).response.status,200);
  const list=await request("/api/legal/bio-data");
  assert.equal(list.response.status,200);
  assert.equal(list.body.records.length>=6,true);
  assert.equal(list.body.stats.total>=6,true);
  assert.equal(list.body.records.every(x=>x.savings===undefined&&x.loans===undefined),true);

  const search=await request("/api/legal/bio-data?q=TJS-000184");
  assert.equal(search.response.status,200);
  assert.equal(search.body.records.length,1);
  const record=search.body.records[0];
  assert.equal(record.fullName,"Amina Nansubuga");

  const globalSearch=await request("/api/legal/search?q=TJS-000184");
  assert.equal(globalSearch.response.status,200);
  assert.equal(globalSearch.body.results.some(x=>x.type==="Member Bio"&&x.target==="legal-bio-data"),true);

  const invalid=await request(`/api/legal/bio-data/${record.memberId}`,{
    method:"PUT",body:JSON.stringify({gender:"invalid",bioStatus:"complete"}),
  });
  assert.equal(invalid.response.status,400);

  const updated=await request(`/api/legal/bio-data/${record.memberId}`,{
    method:"PUT",
    body:JSON.stringify({
      dateOfBirth:record.dateOfBirth?.slice(0,10),gender:record.gender,maritalStatus:record.maritalStatus,
      nationality:record.nationality,homeDistrict:record.homeDistrict,subcounty:record.subcounty,
      parish:record.parish,village:record.village,emergencyContactName:record.emergencyContactName,
      emergencyContactPhone:record.emergencyContactPhone,
      emergencyContactRelationship:record.emergencyContactRelationship,bloodGroup:record.bloodGroup,
      disabilityNotes:record.disabilityNotes,profilePhotoReference:record.profilePhotoReference,
      identityDocumentReference:record.identityDocumentReference,recordNotes:record.recordNotes,
      bioStatus:record.bioStatus,
    }),
  });
  assert.equal(updated.response.status,200);

  assert.equal((await request("/legal-biodata-module.js")).response.status,200);
  assert.equal((await request("/legal-biodata-styles.css")).response.status,200);

  assert.equal((await login("credits@kasangatig40.test")).response.status,200);
  const denied=await request("/api/legal/bio-data");
  assert.equal(denied.response.status,403);

  console.log(JSON.stringify({
    login:"ok",records:list.body.records.length,stats:list.body.stats,
    search:"verified",globalLegalSearch:"verified",updateValidation:"verified",
    privacy:"SACCO balances and loans excluded",crossDepartmentAccess:"denied",assets:"verified",
  },null,2));
}

main().catch(error=>{console.error(error);process.exitCode=1;});
