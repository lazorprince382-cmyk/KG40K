const fs=require("fs");
const path=require("path");
const crypto=require("crypto");
const bcrypt=require("bcryptjs");
const db=require("../src/db");

const periodEnd="2026-06-30";
const excludedNames=new Set(["Joshua Ssewanyana"]);
const primaryAccess={
  "Charles Oketcho":{role:"Member",department:null},
  "Francis Banumba":{role:"Executive Officer",department:"executive"},
  "Josephine Babirye Kyobe":{role:"Credits Officer",department:"credits"},
  "Denis Tugume":{role:"Welfare Officer",department:"welfare"},
  "Tabula Robert":{role:"Executive Officer",department:"executive"},
  "Ntono Moreen":{role:"Welfare Officer",department:"welfare"},
  "Ritah Nakyanzi":{role:"Executive Officer",department:"executive"},
  "Mary Babirye":{role:"Executive Officer",department:"executive"},
  "Nakayiza Baraza Olivia":{role:"Credits Officer",department:"credits"},
  "Jude Tadieus Kyobe":{role:"Executive Officer",department:"executive"},
  "Brian Mutiga":{role:"Investment Officer",department:"investment"},
  "Justine Kaudha Inhensiko":{role:"Executive Officer",department:"executive"},
  "Paul Kalemba":{role:"Supervisory Officer",department:"supervisory"},
  "Dan Rwebingira Ssalongo":{role:"Credits Officer",department:"credits"},
  "Christopher Muhoozi":{role:"Supervisory Officer",department:"supervisory"},
  "Ralph Masaba":{role:"Auditor",department:"audit"},
  "Ezrah Nayoga":{role:"Executive Officer",department:"executive"}
};
const bodyDepartment={board:"executive",exco:"executive","credit-committee":"credits",
  "investment-committee":"investment","legal-committee":"legal","finance-committee":"finance",
  "welfare-committee":"welfare","supervisory-committee":"supervisory","audit-committee":"audit"};

function slug(name){return name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g,".").replace(/^\.|\.$/g,"");}
function temporaryPassword(){
  const upper="ABCDEFGHJKLMNPQRSTUVWXYZ",lower="abcdefghijkmnopqrstuvwxyz",digits="23456789",symbols="!@#$%",all=upper+lower+digits+symbols;
  const pick=s=>s[crypto.randomInt(s.length)],characters=[pick(upper),pick(lower),pick(digits),pick(symbols),...Array.from({length:10},()=>pick(all))];
  for(let index=characters.length-1;index>0;index--){const other=crypto.randomInt(index+1);[characters[index],characters[other]]=[characters[other],characters[index]];}
  return characters.join("");
}
function csv(value){const text=String(value??"");return /[",\r\n]/.test(text)?`"${text.replaceAll('"','""')}"`:text;}

async function main(){
  await db.initialize();
  const credentials=[];
  const result=await db.transaction(async client=>{
    const period=(await client.query("SELECT id FROM financial_reporting_periods WHERE period_end=$1",[periodEnd])).rows[0];
    if(!period)throw new Error(`Financial reporting period ${periodEnd} was not found`);
    const legalCreator=(await client.query("SELECT id FROM users WHERE role='Legal Officer' AND active=true ORDER BY id DESC LIMIT 1")).rows[0];
    const branch=(await client.query("SELECT id FROM branches WHERE active=true ORDER BY id LIMIT 1")).rows[0];
    if(!legalCreator||!branch)throw new Error("An active Legal Officer and branch are required");
    const departments=Object.fromEntries((await client.query("SELECT id,code FROM departments WHERE active=true")).rows.map(x=>[x.code,x.id]));
    const balances=(await client.query(`SELECT id,source_row,member_name,savings_balance,share_capital,status
      FROM legacy_member_opening_balances WHERE period_id=$1 ORDER BY source_row`,[period.id])).rows;
    let createdMembers=0,createdUsers=0,linkedAppointments=0;
    for(const balance of balances){
      const name=balance.member_name;
      if(excludedNames.has(name)||balance.status==="exited")continue;
      const access=primaryAccess[name]||{role:"Member",department:null};
      const memberNumber=`G40-2026-${String(balance.source_row).padStart(4,"0")}`;
      let member=(await client.query("SELECT id FROM members WHERE legacy_opening_balance_id=$1 OR member_number=$2",[balance.id,memberNumber])).rows[0];
      if(!member){
        member=(await client.query(`INSERT INTO members
          (member_number,full_name,email,phone,national_id,branch_id,savings_balance,share_capital,status,joined_at,created_by,provisional,legacy_opening_balance_id)
          VALUES ($1,$2,NULL,$3,$4,$5,$6,$7,'active','2024-01-01',$8,true,$9) RETURNING id`,
        [memberNumber,name,`PROVISIONAL-PHONE-${memberNumber}`,`PROVISIONAL-NID-${memberNumber}`,branch.id,
          balance.savings_balance,balance.share_capital,legalCreator.id,balance.id])).rows[0];
        createdMembers++;
      }
      await client.query(`INSERT INTO member_bio_data(member_id,nationality,bio_status,record_notes,created_by)
        VALUES ($1,'Ugandan','pending','Provisional record created from the FY2026 member savings schedule; biodata awaits Legal verification.',$2)
        ON CONFLICT(member_id) DO NOTHING`,[member.id,legalCreator.id]);
      await client.query("UPDATE legacy_member_opening_balances SET linked_member_id=$1,status='recognized_provisional' WHERE id=$2",[member.id,balance.id]);
      await client.query("UPDATE governance_appointments SET linked_member_id=$1 WHERE legacy_balance_id=$2 OR lower(canonical_member_name)=lower($3)",[member.id,balance.id,name]);
      linkedAppointments+=(await client.query("SELECT COUNT(*)::int AS count FROM governance_appointments WHERE linked_member_id=$1",[member.id])).rows[0].count;
      await client.query("UPDATE membership_status_records SET linked_member_id=$1 WHERE legacy_balance_id=$2 OR lower(member_name)=lower($3)",[member.id,balance.id,name]);

      let user=(await client.query("SELECT id,email FROM users WHERE member_id=$1",[member.id])).rows[0];
      if(!user){
        const email=`${slug(name)}@members.kg40.local`,password=temporaryPassword();
        user=(await client.query(`INSERT INTO users
          (full_name,email,phone,password_hash,role,branch_id,member_id,created_by,must_change_password,login_email_is_provisional)
          VALUES ($1,$2,NULL,$3,$4,$5,$6,$7,true,true) RETURNING id,email`,
        [name,email,await bcrypt.hash(password,12),access.role,branch.id,member.id,legalCreator.id])).rows[0];
        credentials.push({memberNumber,name,email,password,role:access.role,biodata:"Incomplete"});createdUsers++;
      }

      const appointments=(await client.query(`SELECT b.code,b.name,g.position_title
        FROM governance_appointments g JOIN governance_bodies b ON b.id=g.body_id
        WHERE g.linked_member_id=$1 AND g.status='active' ORDER BY b.id`,[member.id])).rows;
      const grouped=new Map();
      for(const appointment of appointments){
        const departmentCode=bodyDepartment[appointment.code];if(!departmentCode||!departments[departmentCode])continue;
        const list=grouped.get(departmentCode)||[];list.push(`${appointment.name}: ${appointment.position_title}`);grouped.set(departmentCode,list);
        const level=["board","exco"].includes(appointment.code)?4:appointment.position_title==="Chairperson"?3:2;
        await client.query(`INSERT INTO leadership_assignments(user_id,body,position_title,leadership_level,starts_on,active)
          VALUES ($1,$2,$3,$4,$5,true) ON CONFLICT(user_id,body,position_title) DO UPDATE SET active=true,leadership_level=EXCLUDED.leadership_level`,
        [user.id,appointment.name,appointment.position_title,level,periodEnd]);
      }
      if(access.department&&!grouped.has(access.department))grouped.set(access.department,[access.role]);
      for(const [departmentCode,titles] of grouped){
        const primary=departmentCode===access.department,isExecutive=departmentCode==="executive"&&primary,isChair=titles.some(x=>/: Chairperson$/.test(x));
        const authority=isExecutive?4:isChair?3:2,canManage=primary&&(isExecutive||isChair);
        await client.query(`INSERT INTO department_assignments
          (user_id,department_id,position_title,authority_level,can_view,can_create,can_edit,can_approve,is_head,assigned_by,active)
          VALUES ($1,$2,$3,$4,true,$5,$5,$6,$7,$8,true)
          ON CONFLICT(user_id,department_id) DO UPDATE SET position_title=EXCLUDED.position_title,authority_level=EXCLUDED.authority_level,
            can_view=true,can_create=EXCLUDED.can_create,can_edit=EXCLUDED.can_edit,can_approve=EXCLUDED.can_approve,
            is_head=EXCLUDED.is_head,assigned_by=EXCLUDED.assigned_by,active=true`,
        [user.id,departments[departmentCode],titles.join("; "),authority,canManage,
          primary&&(isExecutive||isChair||titles.some(x=>/: Member$/.test(x))),primary&&isChair,legalCreator.id]);
      }
      await client.query(`INSERT INTO notifications(user_id,member_id,title,message)
        SELECT $1,$2,'Account ready',$3 WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id=$1 AND title='Account ready')`,
      [user.id,member.id,`Your ${access.role} login and linked Member account are ready. Complete your biodata and change the temporary password after signing in.`]);
    }
    await client.query(`INSERT INTO audit_logs(user_id,action,entity_type,details)
      VALUES ($1,'PROVISIONAL_MEMBER_ACCOUNTS_IMPORTED','member',$2)`,
    [legalCreator.id,`FY2026 recognized accounts; members created=${createdMembers}; users created=${createdUsers}; Joshua Ssewanyana excluded as exited`]);
    return {createdMembers,createdUsers,recognizedMembers:balances.filter(x=>!excludedNames.has(x.member_name)&&x.status!=="exited").length,linkedAppointments};
  });

  if(credentials.length){
    const privateDir=path.join(__dirname,"..","private");fs.mkdirSync(privateDir,{recursive:true});
    const target=path.join(privateDir,"provisional-member-credentials.csv"),header=["Member Number","Name","Login Email","Temporary Password","System Role","Biodata Status"];
    fs.writeFileSync(target,[header,...credentials.map(x=>[x.memberNumber,x.name,x.email,x.password,x.role,x.biodata])].map(row=>row.map(csv).join(",")).join("\r\n")+"\r\n",{encoding:"utf8",mode:0o600});
  }
  console.log(JSON.stringify({...result,credentialsFile:credentials.length?"private/provisional-member-credentials.csv":"unchanged (no new accounts)"},null,2));
  await db.pool.end();
}

main().catch(async error=>{console.error(error);try{await db.pool.end();}catch{}process.exitCode=1;});
