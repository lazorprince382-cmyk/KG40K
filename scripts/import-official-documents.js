const fs=require("fs");
const path=require("path");
const crypto=require("crypto");
const db=require("../src/db");

const downloads="D:/Downloads";
const documents=[
  ["Welfare policy_G40 Kwagalana_5.7.2025.docx","DOC-WELFARE-POLICY-2025","Welfare Policy","Kasangati G40 Kwagalana Welfare Policy"],
  ["INVESTMENT REPORT FOR KASANGATI G40 KWAGALANA AGM (1).docx","DOC-INVESTMENT-REPORT-2026","Investment Report","Investment Report for the 2026 AGM"],
  ["RESOLUTION OF KASANGATI G40 KWAGALANA LIMITED.docx","DOC-UNIT-TRUST-RESOLUTION-2025","Resolution","Resolution to Open and Operate the Unit Trust Fund"],
  ["kwagalana AGM 2025 Minutes.docx","DOC-AGM-MINUTES-2025","Minutes","Annual General Meeting Minutes 2025"],
  ["2025 AGM ACTIONS POINTS.docx","DOC-AGM-ACTIONS-2025","Action Points","2025 AGM Action Points"],
  ["2026 AGM MINUTES_KASANGATI G40 KWAGALANA LIMITED.docx","DOC-AGM-MINUTES-2026","Minutes","Annual General Meeting Minutes 2026"],
  ["INVESTMENT REPORT FOR KASANGATI G40 KWAGALANA AGM.docx","DOC-INVESTMENT-REPORT-2025","Investment Report","Investment Report for the 2025 AGM"],
  ["kasangati g40 kwagalana loan agreement (2).docx","DOC-LOAN-AGREEMENT","Loan Agreement","Kasangati G40 Kwagalana Loan Agreement"],
  ["KASANGATI G40 KWAGALANA LTD (Private Limited By Shares.docx","DOC-COMPANY-CONSTITUTION","Constitution","Kasangati G40 Kwagalana Limited Constitution"]
].map(([file,reference,type,title])=>({file,reference,type,title,source:path.join(downloads,file)}));

async function main(){
  for(const doc of documents)if(!fs.existsSync(doc.source))throw new Error(`Official document not found: ${doc.source}`);
  await db.initialize();
  const uploads=path.join(__dirname,"..","storage","uploads");
  fs.mkdirSync(uploads,{recursive:true});
  const legal=await db.one("SELECT id FROM departments WHERE code='legal'");
  const uploader=await db.one("SELECT id FROM users WHERE role='Legal Officer' AND active=true ORDER BY id LIMIT 1");
  if(!legal||!uploader)throw new Error("An active Legal Officer and Legal department are required");
  const imported=[];
  for(const doc of documents){
    const buffer=fs.readFileSync(doc.source),sha256=crypto.createHash("sha256").update(buffer).digest("hex");
    let destination=null;
    const result=await db.transaction(async client=>{
      let record=(await client.query("SELECT id FROM organization_documents WHERE reference=$1",[doc.reference])).rows[0];
      if(!record)record=(await client.query(`INSERT INTO organization_documents
        (reference,department_id,document_type,title,version,status,visibility_level,created_by)
        VALUES ($1,$2,$3,$4,'1.0','published',4,$5) RETURNING id`,
        [doc.reference,legal.id,doc.type,doc.title,uploader.id])).rows[0];
      const same=(await client.query("SELECT id FROM organization_document_versions WHERE document_id=$1 AND sha256=$2",[record.id,sha256])).rows[0];
      if(!same){
        const stored=`${Date.now()}-${crypto.randomBytes(12).toString("hex")}.docx`;
        destination=path.join(uploads,stored);fs.copyFileSync(doc.source,destination);
        await client.query(`INSERT INTO organization_document_versions
          (document_id,version,original_name,stored_name,mime_type,file_size,sha256,uploaded_by)
          VALUES ($1,'1.0',$2,$3,'application/vnd.openxmlformats-officedocument.wordprocessingml.document',$4,$5,$6)`,
          [record.id,doc.file,stored,buffer.length,sha256,uploader.id]);
        await client.query("UPDATE organization_documents SET file_name=$1,version='1.0',updated_at=NOW() WHERE id=$2",[doc.file,record.id]);
      }
      return {id:record.id,added:!same};
    }).catch(error=>{if(destination&&fs.existsSync(destination))fs.unlinkSync(destination);throw error;});
    imported.push({reference:doc.reference,...result});
  }
  await db.query(`INSERT INTO investment_fund_accounts
    (reference,institution_name,fund_name,amount_invested,current_value,returns_earned,invested_on,report_as_at,status,source_reference,created_by)
    VALUES ('FUND-OLD-MUTUAL-2025','Old Mutual','Unit Trust Fund',150000000,163204057.50,13204057.50,'2025-08-11','2026-06-30','active','DOC-INVESTMENT-REPORT-2026',$1)
    ON CONFLICT(reference) DO UPDATE SET amount_invested=EXCLUDED.amount_invested,current_value=EXCLUDED.current_value,
      returns_earned=EXCLUDED.returns_earned,invested_on=EXCLUDED.invested_on,report_as_at=EXCLUDED.report_as_at,
      source_reference=EXCLUDED.source_reference,updated_at=NOW()`,[uploader.id]);
  await db.query(`INSERT INTO investment_fund_accounts
    (reference,institution_name,fund_name,bank_name,bank_account_number,bank_branch,status,source_reference,created_by)
    VALUES ('FUND-UAP-UMBRELLA','UAP','Umbrella Trust Fund','Standard Chartered Bank','0105214721807','Speke Road','registered','FUND-SELECTION-FORM',$1)
    ON CONFLICT(reference) DO UPDATE SET institution_name=EXCLUDED.institution_name,fund_name=EXCLUDED.fund_name,
      bank_name=EXCLUDED.bank_name,bank_account_number=EXCLUDED.bank_account_number,bank_branch=EXCLUDED.bank_branch,updated_at=NOW()`,[uploader.id]);
  const officer=await db.one("SELECT id FROM users WHERE role='Investment Officer' AND active=true ORDER BY id LIMIT 1");
  if(officer)await db.query(`INSERT INTO investment_projects
    (reference,name,description,target_amount,raised_amount,status,starts_on,created_by,current_value,expected_return,
     performance_status,category,location,manager_name,responsible_department,funding_source,progress)
    VALUES ('INV-FUND-OM-2025','Old Mutual Unit Trust Fund','Verified organizational unit-trust investment reported to the 2026 AGM.',
      150000000,150000000,'active','2025-08-11',$1,163204057.50,13204057.50,'profitable','Unit Trust','Uganda',
      'Mutiga David Brian and Tabula Robert','Investment','Organization capital',100)
    ON CONFLICT(reference) DO UPDATE SET current_value=EXCLUDED.current_value,expected_return=EXCLUDED.expected_return,
      description=EXCLUDED.description,status='active',progress=100`,[officer.id]);
  await db.query(`INSERT INTO audit_logs(user_id,action,entity_type,entity_id,details)
    VALUES ($1,'OFFICIAL_RECORDS_IMPORTED','organization_document','official-2025-2026',$2)`,
    [uploader.id,`${documents.length} official documents; verified Old Mutual and UAP fund records`]);
  console.log(JSON.stringify({documents:imported,funds:["FUND-OLD-MUTUAL-2025","FUND-UAP-UMBRELLA"]},null,2));
  await db.pool.end();
}
main().catch(async error=>{console.error(error);try{await db.pool.end();}catch{}process.exitCode=1;});
