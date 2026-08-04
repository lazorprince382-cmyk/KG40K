const fs=require("fs"),path=require("path"),crypto=require("crypto"),db=require("../src/db");
const items=[
  ["DOC-WELFARE-POLICY-2025","Welfare-policy_G40-Kwagalana_5.7.2025.txt"],
  ["DOC-INVESTMENT-REPORT-2026","INVESTMENT-REPORT-FOR-KASANGATI-G40-KWAGALANA-AGM--1-.txt"],
  ["DOC-UNIT-TRUST-RESOLUTION-2025","RESOLUTION-OF-KASANGATI-G40-KWAGALANA-LIMITED.txt"],
  ["DOC-AGM-MINUTES-2025","kwagalana-AGM-2025-Minutes.txt"],
  ["DOC-AGM-ACTIONS-2025","2025-AGM-ACTIONS-POINTS.txt"],
  ["DOC-AGM-MINUTES-2026","2026-AGM-MINUTES_KASANGATI-G40-KWAGALANA-LIMITED.txt"],
  ["DOC-INVESTMENT-REPORT-2025","INVESTMENT-REPORT-FOR-KASANGATI-G40-KWAGALANA-AGM.txt"],
  ["DOC-LOAN-AGREEMENT","kasangati-g40-kwagalana-loan-agreement--2-.txt"],
  ["DOC-COMPANY-CONSTITUTION","KASANGATI-G40-KWAGALANA-LTD--Private-Limited-By-Shares.txt"]
];
async function main(){
  await db.initialize();const uploader=await db.one("SELECT id FROM users WHERE role='Legal Officer' AND active=true ORDER BY id LIMIT 1");
  if(!uploader)throw new Error("An active Legal Officer is required");
  const sourceDir=path.join(__dirname,"..","storage","official-text"),uploads=path.join(__dirname,"..","storage","uploads"),results=[];
  for(const [reference,file] of items){
    const source=path.join(sourceDir,file),document=await db.one("SELECT id FROM organization_documents WHERE reference=$1",[reference]);
    if(!fs.existsSync(source)||!document)throw new Error(`Preview source or document missing: ${reference}`);
    const buffer=fs.readFileSync(source),sha=crypto.createHash("sha256").update(buffer).digest("hex");
    const existing=await db.one("SELECT id FROM organization_document_versions WHERE document_id=$1 AND sha256=$2",[document.id,sha]);
    if(existing){results.push({reference,added:false});continue;}
    const stored=`${Date.now()}-${crypto.randomBytes(12).toString("hex")}.txt`;fs.copyFileSync(source,path.join(uploads,stored));
    await db.query(`INSERT INTO organization_document_versions
      (document_id,version,original_name,stored_name,mime_type,file_size,sha256,uploaded_by)
      VALUES ($1,'1.1',$2,$3,'text/plain; charset=utf-8',$4,$5,$6)`,[document.id,file,stored,buffer.length,sha,uploader.id]);
    await db.query("UPDATE organization_documents SET version='1.1',file_name=$1,updated_at=NOW() WHERE id=$2",[file,document.id]);
    results.push({reference,added:true});
  }
  console.log(JSON.stringify(results,null,2));await db.pool.end();
}
main().catch(async error=>{console.error(error);try{await db.pool.end();}catch{}process.exitCode=1;});
