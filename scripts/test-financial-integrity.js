"use strict";
const assert=require("assert");
const db=require("../src/db");
const base=process.env.TEST_BASE_URL||"http://127.0.0.1:3000";
const password=process.env.FINANCIAL_TEST_PASSWORD;
async function login(email){const response=await fetch(base+"/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});assert.equal(response.status,200,`login failed for ${email}`);return response.headers.get("set-cookie").split(";")[0];}
async function post(path,cookie,body={}){return fetch(base+path,{method:"POST",headers:{Cookie:cookie,"Content-Type":"application/json"},body:JSON.stringify(body)});}
async function main(){
  assert(password,"FINANCIAL_TEST_PASSWORD is required");
  const completed=(await db.query("SELECT t.id,t.member_id,m.savings_balance FROM transactions t JOIN members m ON m.id=t.member_id WHERE t.status='completed' AND t.type='Savings deposit' ORDER BY t.id LIMIT 1")).rows[0];
  assert(completed,"a completed savings deposit is required");
  const financeVerifier=await login("finance@kasangatig40.test");
  assert.equal((await post(`/api/transactions/${completed.id}/verify`,financeVerifier)).status,409);
  const unchanged=await db.one("SELECT savings_balance FROM members WHERE id=$1",[completed.member_id]);
  assert.equal(Number(unchanged.savings_balance),Number(completed.savings_balance),"retry changed member savings");

  const processed=await db.one("SELECT id FROM finance_payment_vouchers WHERE status='processed' ORDER BY id LIMIT 1");
  if(processed){
    const account=await db.one("SELECT id FROM finance_accounts WHERE active=true ORDER BY id LIMIT 1");
    const before=await db.one("SELECT COALESCE(SUM(balance),0) AS total FROM finance_accounts");
    const finance=await login("finance@kasangatig40.test");
    assert.equal((await post(`/api/finance/vouchers/${processed.id}/process`,finance,{accountId:account.id})).status,409);
    const after=await db.one("SELECT COALESCE(SUM(balance),0) AS total FROM finance_accounts");
    assert.equal(Number(after.total),Number(before.total),"voucher retry changed Finance balances");
  }
  const decided=await db.one("SELECT id FROM withdrawals WHERE status<>'pending' ORDER BY id LIMIT 1");
  if(decided){const creditsOfficer=await login("credits@kasangatig40.test");assert.equal((await post(`/api/withdrawals/${decided.id}/decision`,creditsOfficer,{decision:"approve"})).status,409);}
  const scheduleMismatch=await db.one("SELECT COUNT(*)::int AS count FROM loan_repayment_schedule WHERE ABS(paid_amount-(principal_paid+interest_paid))>0.01 OR principal_paid>principal+0.01 OR interest_paid>interest+0.01");
  const chargeMismatch=await db.one("SELECT COUNT(*)::int AS count FROM loan_charges WHERE paid_amount<0 OR paid_amount>amount+0.01");
  const negativeLoans=await db.one("SELECT COUNT(*)::int AS count FROM loans WHERE balance<0");
  assert.equal(scheduleMismatch.count,0,"repayment schedule allocations do not reconcile");
  assert.equal(chargeMismatch.count,0,"loan charge allocations do not reconcile");
  assert.equal(negativeLoans.count,0,"negative loan balances found");
  console.log(JSON.stringify({transactionRetry:"rejected",voucherRetry:processed?"rejected":"not-applicable",withdrawalRedecision:decided?"rejected":"not-applicable",repaymentAllocation:"reconciled",negativeBalances:"none"},null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>db.pool.end());