"use strict";
const assert=require("assert");
const fs=require("fs");
const path=require("path");
const db=require("../src/db");
const base=process.env.TEST_BASE_URL||"http://127.0.0.1:3000";
const legalPassword=process.env.LINKED_ACCOUNT_TEST_PASSWORD;
let created;

async function login(email,password){
  const response=await fetch(`${base}/api/auth/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});
  assert.equal(response.status,200,`login failed for ${email}`);
  return response.headers.get("set-cookie").split(";")[0];
}
async function main(){
  assert(legalPassword,"LINKED_ACCOUNT_TEST_PASSWORD is required");
  const legalCookie=await login("legal@kasangatig40.test",legalPassword);
  const options=await fetch(`${base}/api/legal/membership-options`,{headers:{Cookie:legalCookie}});
  assert.equal(options.status,200);
  const form=new FormData(),suffix=Date.now().toString(36);
  const email=`linked.member.${suffix}@test.invalid`;
  [
    ["fullName","Linked Member Test"],["phone",`+256700${String(Date.now()).slice(-6)}`],
    ["email",email],["nationalId",`TEST-${suffix}`],["nationality","Ugandan"],
    ["createAccount","true"],["hasOrganizationRole","true"],["departmentCode","finance"],
    ["positionTitle","Finance Records Test"]
  ].forEach(([key,value])=>form.append(key,value));
  const png=Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=","base64");
  form.append("passportPhoto",new Blob([png],{type:"image/png"}),"passport.png");
  const registered=await fetch(`${base}/api/legal/members`,{method:"POST",headers:{Cookie:legalCookie},body:form});
  const result=await registered.json();
  assert.equal(registered.status,201,result.error);
  created=result;
  assert.equal(result.role,"Finance Officer");
  assert(result.temporaryPassword);

  const cookie=await login(email,result.temporaryPassword);
  const bootstrap=await (await fetch(`${base}/api/bootstrap`,{headers:{Cookie:cookie}})).json();
  assert.equal(bootstrap.user.role,"Finance Officer");
  assert.equal(Number(bootstrap.user.member_id),Number(result.memberId));
  assert.deepEqual(bootstrap.organization.departments.map(item=>item.code),["finance"]);
  const memberResponse=await fetch(`${base}/api/member/command-center`,{headers:{Cookie:cookie}});
  assert.equal(memberResponse.status,200);
  const member=await memberResponse.json();
  assert.equal(member.member.memberNumber,result.memberNumber);
  assert.equal(member.member.hasPassportPhoto,true);
  assert.equal(member.transactions.every(item=>item.memberId===undefined),true);
  assert.equal((await fetch(`${base}/api/member/passport-photo`,{headers:{Cookie:cookie}})).status,200);
  assert.equal((await fetch(`${base}/api/member/reports/transactions.csv`,{headers:{Cookie:cookie}})).status,200);
  assert.equal((await fetch(`${base}/api/legal/bio-data`,{headers:{Cookie:cookie}})).status,403);
  const renamed=await fetch(`${base}/api/account/profile`,{method:"PATCH",headers:{Cookie:cookie,"Content-Type":"application/json"},
    body:JSON.stringify({fullName:"Linked Member Account Test"})});
  assert.equal(renamed.status,200);
  const profileForm=new FormData();profileForm.append("photo",new Blob([png],{type:"image/png"}),"profile.png");
  assert.equal((await fetch(`${base}/api/account/profile-photo`,{method:"POST",headers:{Cookie:cookie},body:profileForm})).status,200);
  assert.equal((await fetch(`${base}/api/account/profile-photo`,{headers:{Cookie:cookie}})).status,200);
  assert.equal((await fetch(`${base}/api/account/profile-photo`,{method:"DELETE",headers:{Cookie:cookie}})).status,200);
  const newPassword=`Zz9!${suffix}Aa`;
  const changed=await fetch(`${base}/api/auth/change-password`,{method:"POST",headers:{Cookie:cookie,"Content-Type":"application/json"},
    body:JSON.stringify({currentPassword:result.temporaryPassword,newPassword})});
  assert.equal(changed.status,200);await login(email,newPassword);
  console.log(JSON.stringify({legalRegistration:"verified",departmentRole:"Finance Officer",memberContext:"self-only",
    passportPhoto:"verified",departmentAssignment:"finance-only",memberReport:"self-scoped",
    accountName:"editable",profilePhoto:"upload-and-remove",passwordChange:"verified"},null,2));
}
async function cleanup(){
  if(!created)return;
  const photo=await db.one("SELECT passport_photo_stored_name AS stored FROM member_bio_data WHERE member_id=$1",[created.memberId]);
  await db.transaction(async client=>{
    if(created.userId)await client.query("DELETE FROM audit_logs WHERE user_id=$1",[created.userId]);
    if(created.userId)await client.query("DELETE FROM users WHERE id=$1",[created.userId]);
    await client.query("DELETE FROM members WHERE id=$1",[created.memberId]);
  });
  if(photo?.stored&&path.basename(photo.stored)===photo.stored){
    const file=path.join(__dirname,"..","storage","uploads",photo.stored);
    if(fs.existsSync(file))fs.unlinkSync(file);
  }
}
main().catch(error=>{console.error(error);process.exitCode=1}).finally(async()=>{try{await cleanup()}finally{await db.pool.end()}});
