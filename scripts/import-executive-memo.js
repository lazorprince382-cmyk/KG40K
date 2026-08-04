const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
const db=require('../src/db');

const sourcePath=process.argv[2]||'D:/Downloads/Kasangati G40 Kwagalana Executive Memo.(1).pdf';
const periodEnd='2026-06-30';

const bodies=[
  ['board','Board of Directors','board','Tabula Robert is to be enrolled on URSB.'],
  ['exco','Executive Committee','executive',null],
  ['credit-committee','Credit Committee','committee',null],
  ['investment-committee','Investment Committee','committee',null],
  ['legal-committee','Legal Committee','committee',null],
  ['finance-committee','Finance Committee','committee',null],
  ['welfare-committee','Welfare Committee','committee',null],
  ['supervisory-committee','Supervisory Committee','committee','Elected during the AGM.'],
  ['audit-committee','Audit Committee','committee','Elected during the AGM.']
];

const appointments=[
  ['board','Babirye Mary','Mary Babirye','Director',null],
  ['board','Jude Tadieus Kyobe','Jude Tadieus Kyobe','Director',null],
  ['board','Banumba Francis','Francis Banumba','Director',null],
  ['board','Tabula Robert','Tabula Robert','Director','To be enrolled on URSB.'],
  ['exco','Tabula Robert','Tabula Robert','Chairperson',null],
  ['exco','Ezra Nayoga','Ezrah Nayoga','Vice Chairperson','Memo spelling differs from the savings schedule.'],
  ['exco','Jude Tadieus Kyobe','Jude Tadieus Kyobe','Secretary',null],
  ['exco','Inhensiko K. Justine','Justine Kaudha Inhensiko','Treasurer',null],
  ['exco','Rita Nakyanzi Sanyu','Ritah Nakyanzi','Member','Memo spelling differs from the savings schedule.'],
  ['credit-committee','Baraza Olivia Nakayiza','Nakayiza Baraza Olivia','Chairperson',null],
  ['credit-committee','Josephine Babirye Kyobe','Josephine Babirye Kyobe','Member',null],
  ['credit-committee','Rwebingira Dan Ssalongo','Dan Rwebingira Ssalongo','Member',null],
  ['investment-committee','Mutiga D. Brian','Brian Mutiga','Chairperson',null],
  ['investment-committee','Ritah Nakyanzi Sanyu','Ritah Nakyanzi','Member',null],
  ['investment-committee','Ezra Nayoga','Ezrah Nayoga','Member','Memo spelling differs from the savings schedule.'],
  ['legal-committee','Babirye Mary','Mary Babirye','Chairperson',null],
  ['legal-committee','Jude Tadieus Kyobe','Jude Tadieus Kyobe','Member',null],
  ['legal-committee','Banumba Francis','Francis Banumba','Member',null],
  ['finance-committee','Tabula Robert','Tabula Robert','Chairperson',null],
  ['finance-committee','Justine Kaudha Inhensiko','Justine Kaudha Inhensiko','Member',null],
  ['finance-committee','Rwebingira Dan Ssalongo','Dan Rwebingira Ssalongo','Member',null],
  ['welfare-committee','Tugume Denis','Denis Tugume','Chairperson',null],
  ['welfare-committee','Masaba Ralph','Ralph Masaba','Member',null],
  ['welfare-committee','Ntono Moreen Tabula','Ntono Moreen','Member',null],
  ['supervisory-committee','Muhoozi Christopher','Christopher Muhoozi','Chairperson',null],
  ['supervisory-committee','Kalemba Paul','Paul Kalemba','Member',null],
  ['audit-committee','Ralph Masaba','Ralph Masaba','Chairperson',null],
  ['audit-committee','Kalemba Paul','Paul Kalemba','Member',null]
];

const exitRecords=[
  ['Ezra Mujjabwami','proposed_exit','Also to be removed from the list of Directors.'],
  ['Brenda Mujjabwami','proposed_exit',null],
  ['Patrick Nzabara','proposed_exit',null],
  ['Barasa Gerald','conditional_exit','Exit if he fails to adhere to organization guidelines.'],
  ['Charles Oketcho','conditional_exit','Exit if he fails to adhere to organization guidelines.'],
  ['Joshua Ssewanyana','exited','Confirmed by the user as out of the organization.']
];

async function main(){
  if(!fs.existsSync(sourcePath))throw new Error(`Executive Memo not found: ${sourcePath}`);
  await db.initialize();
  const originalName=path.basename(sourcePath),buffer=fs.readFileSync(sourcePath),sha256=crypto.createHash('sha256').update(buffer).digest('hex');
  const storedName=`${Date.now()}-${crypto.randomBytes(12).toString('hex')}.pdf`;
  const destination=path.join(__dirname,'..','storage','uploads',storedName);
  fs.mkdirSync(path.dirname(destination),{recursive:true});
  fs.copyFileSync(sourcePath,destination);
  try{
    const result=await db.transaction(async client=>{
      const legal=(await client.query("SELECT id FROM departments WHERE code='legal'")).rows[0];
      const uploader=(await client.query("SELECT id FROM users WHERE role='Legal Officer' AND active=true ORDER BY id LIMIT 1")).rows[0];
      if(!legal||!uploader)throw new Error('An active Legal Officer and Legal department are required');
      const existing=(await client.query("SELECT id FROM organization_documents WHERE reference='DOC-EXEC-MEMO-2026'")).rows[0];
      const document=existing||(await client.query(`INSERT INTO organization_documents
        (reference,department_id,document_type,title,version,status,visibility_level,created_by)
        VALUES ('DOC-EXEC-MEMO-2026',$1,'Minutes','Executive Memo - Governance and Committee Appointments','1.0','published',4,$2)
        RETURNING id`,[legal.id,uploader.id])).rows[0];
      const priorVersion=(await client.query("SELECT id FROM organization_document_versions WHERE document_id=$1 AND version='1.0'",[document.id])).rows[0];
      if(!priorVersion)await client.query(`INSERT INTO organization_document_versions
        (document_id,version,original_name,stored_name,mime_type,file_size,sha256,uploaded_by)
        VALUES ($1,'1.0',$2,$3,'application/pdf',$4,$5,$6)`,[document.id,originalName,storedName,buffer.length,sha256,uploader.id]);
      else fs.unlinkSync(destination);
      const period=(await client.query('SELECT id FROM financial_reporting_periods WHERE period_end=$1',[periodEnd])).rows[0];
      const bodyIds={};
      for(const [code,name,type,notes] of bodies){const body=(await client.query(`INSERT INTO governance_bodies(code,name,body_type,notes)
        VALUES ($1,$2,$3,$4) ON CONFLICT(code) DO UPDATE SET name=EXCLUDED.name,body_type=EXCLUDED.body_type,notes=EXCLUDED.notes RETURNING id`,[code,name,type,notes])).rows[0];bodyIds[code]=body.id;}
      for(const [code,recorded,canonical,title,notes] of appointments){
        const legacy=period?(await client.query('SELECT id FROM legacy_member_opening_balances WHERE period_id=$1 AND lower(member_name)=lower($2)',[period.id,canonical])).rows[0]:null;
        await client.query(`INSERT INTO governance_appointments(body_id,legacy_balance_id,member_name_as_recorded,canonical_member_name,position_title,status,source_document_id,notes)
          VALUES ($1,$2,$3,$4,$5,'active',$6,$7)
          ON CONFLICT(body_id,canonical_member_name,position_title) DO UPDATE SET legacy_balance_id=EXCLUDED.legacy_balance_id,
          member_name_as_recorded=EXCLUDED.member_name_as_recorded,status='active',source_document_id=EXCLUDED.source_document_id,notes=EXCLUDED.notes`,
          [bodyIds[code],legacy?.id||null,recorded,canonical,title,document.id,notes]);
      }
      for(const [name,status,note] of exitRecords){
        const legacy=period?(await client.query('SELECT id FROM legacy_member_opening_balances WHERE period_id=$1 AND lower(member_name)=lower($2)',[period.id,name])).rows[0]:null;
        await client.query(`INSERT INTO membership_status_records(legacy_balance_id,member_name,status,condition_note,source_document_id)
          VALUES ($1,$2,$3,$4,$5) ON CONFLICT(member_name,status) DO UPDATE SET legacy_balance_id=EXCLUDED.legacy_balance_id,
          condition_note=EXCLUDED.condition_note,source_document_id=EXCLUDED.source_document_id`,[legacy?.id||null,name,status,note,document.id]);
        if(legacy&&status==='exited')await client.query("UPDATE legacy_member_opening_balances SET status='exited' WHERE id=$1",[legacy.id]);
      }
      const directives=[
        ['GOV-DIR-2026-001','Committee annual budgets','All committee heads must draft annual budgets and submit them to the Treasurer.','All committee heads','2026-08-04',null],
        ['GOV-DIR-2026-002','Quarterly committee reports','Submit activities, challenges, achievements and recommendations to the Executive.','All committee heads',null,'quarterly'],
        ['GOV-DIR-2026-003','Committee meeting records','Document every committee meeting and file minutes with the secretariat.','All committees',null,'every meeting']
      ];
      for(const d of directives)await client.query(`INSERT INTO governance_directives(reference,title,details,applies_to,due_date,recurrence,source_document_id)
        VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(reference) DO UPDATE SET title=EXCLUDED.title,details=EXCLUDED.details,
        applies_to=EXCLUDED.applies_to,due_date=EXCLUDED.due_date,recurrence=EXCLUDED.recurrence,source_document_id=EXCLUDED.source_document_id`,[...d,document.id]);
      await client.query(`INSERT INTO audit_logs(user_id,action,entity_type,entity_id,details)
        VALUES ($1,'EXECUTIVE_MEMO_IMPORTED','organization_document',$2,$3)`,[uploader.id,String(document.id),`sha256=${sha256}; governance appointments=${appointments.length}`]);
      return {documentId:document.id};
    });
    console.log(JSON.stringify({...result,bodies:bodies.length,appointments:appointments.length,exitedMember:'Joshua Ssewanyana',sha256},null,2));
  }catch(error){if(fs.existsSync(destination))fs.unlinkSync(destination);throw error;}
  await db.pool.end();
}

main().catch(async error=>{console.error(error);try{await db.pool.end();}catch{}process.exitCode=1;});
