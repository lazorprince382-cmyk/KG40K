const db=require("../src/db");
(async()=>{
  await db.initialize();
  const products=(await db.query(`SELECT name,annual_rate,max_term,max_amount,processing_fee_rate,
    late_penalty_rate,minimum_guarantors,maximum_guarantors,interest_method FROM loan_products ORDER BY id`)).rows;
  const documents=await db.one(`SELECT COUNT(*)::int AS count,
    COUNT(*) FILTER (WHERE status='published' AND visibility_level=4)::int AS controlled
    FROM organization_documents WHERE reference LIKE 'DOC-%'`);
  const funds=(await db.query(`SELECT reference,fund_name,bank_name,bank_account_number,
    amount_invested,current_value,returns_earned,status FROM investment_fund_accounts ORDER BY reference`)).rows;
  const familyTable=await db.one(`SELECT COUNT(*)::int AS count FROM member_family_records`);
  console.log(JSON.stringify({products,documents,funds,familyTable},null,2));
  await db.pool.end();
})().catch(async error=>{console.error(error);try{await db.pool.end();}catch{}process.exitCode=1;});
