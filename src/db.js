const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const projectRoot = path.resolve(__dirname,"..");

function loadEnv() {
  const file = path.join(projectRoot, ".env");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match && process.env[match[1]] === undefined) process.env[match[1]] = match[2];
  }
}
loadEnv();

const ROLES = [
  "Member", "Executive Officer", "Finance Officer", "Credits Officer",
  "Investment Officer", "Welfare Officer", "Legal Officer", "Auditor",
  "Supervisory Officer", "System Admin"
];

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 15,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

async function query(text, params = []) {
  return pool.query(text, params);
}

async function one(text, params = []) {
  const result = await query(text, params);
  return result.rows[0] || null;
}

async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function audit({ userId = null, action, entityType = null, entityId = null, details = null, ip = null, userAgent = null }) {
  await query(`INSERT INTO audit_logs
    (user_id, action, entity_type, entity_id, details, ip_address, user_agent)
    VALUES ($1,$2,$3,$4,$5,$6,$7)`,
  [userId, action, entityType, entityId, details, ip, userAgent]);
}

async function runMigrations() {
  const migrationsDir=path.join(projectRoot,"database","migrations");
  await query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    name TEXT PRIMARY KEY,
    checksum TEXT NOT NULL,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
  const files=fs.readdirSync(migrationsDir).filter(file=>file.endsWith(".sql")).sort();
  for(const file of files) {
    // Normalize CRLF from Windows checkouts so checksums match Linux/Railway applies.
    const sql=fs.readFileSync(path.join(migrationsDir,file),"utf8").replace(/\r\n/g,"\n").replace(/\r/g,"\n");
    const checksum=crypto.createHash("sha256").update(sql).digest("hex");
    const applied=await one("SELECT checksum FROM schema_migrations WHERE name=$1",[file]);
    if(applied) {
      if(applied.checksum!==checksum)throw new Error(`Applied migration ${file} was modified; create a new migration instead`);
      continue;
    }
    await transaction(async client=>{
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (name,checksum) VALUES ($1,$2)",[file,checksum]);
    });
  }
}

async function initialize({seedDemo=process.env.SEED_DEMO_DATA==="true"}={}) {
  await runMigrations();
  if(seedDemo) {
    await seed();
    await require("../database/seeds/supervisory")({ query, one });
    await require("../database/seeds/legal-biodata")({ query, one });
  }
}
async function seed() {
  const demoPassword=String(process.env.DEMO_PASSWORD||"");
  if(!demoPassword||demoPassword.length<12)throw new Error("DEMO_PASSWORD with at least 12 characters is required for explicit demo seeding");
  let branch = await one("SELECT id FROM branches WHERE code=$1", ["KLA-01"]);
  if (!branch) branch = await one("INSERT INTO branches (name,code,address) VALUES ($1,$2,$3) RETURNING id", ["Kampala Central", "KLA-01", "Kampala, Uganda"]);
  const branchId = branch.id;

  if (!(await one("SELECT id FROM loan_products LIMIT 1"))) {
    await query(`INSERT INTO loan_products (name,annual_rate,max_term,max_multiplier) VALUES
      ('Development Loan',24,10,3),('School Fees Loan',24,10,2.5),('Emergency Loan',24,6,1)`);
  }

  if (!(await one("SELECT id FROM members LIMIT 1"))) {
    const members = [
      ["TJS-000184","Amina Nansubuga","amina@tujenge.test","+256 772 418 620","CM840001AA","Retail trader","Nansubuga Stores","Kampala","Fatuma N.  -  +256 700 111 222",4850000,1250000,482500,"active"],
      ["TJS-000207","Joseph Okello","joseph@tujenge.test","+256 701 586 443","CM840002AB","Teacher","Kampala Academy","Wakiso","Mary O.  -  +256 700 222 333",3270000,900000,321000,"active"],
      ["TJS-000231","Sarah Namusoke","sarah@tujenge.test","+256 754 338 219","CM840003AC","Accountant","Nile Foods Ltd","Mukono","John N.  -  +256 700 333 444",5960000,1700000,596000,"active"],
      ["TJS-000256","Peter Mugisha","peter@tujenge.test","+256 782 901 654","CM840004AD","Farmer","Self-employed","Mbarara","Grace M.  -  +256 700 444 555",2140000,600000,188000,"suspended"],
      ["TJS-000291","Grace Atim","grace@tujenge.test","+256 704 772 183","CM840005AE","Nurse","Mulago Hospital","Kampala","Paul A.  -  +256 700 555 666",3890000,1100000,374000,"active"],
      ["TJS-000318","David Ssemanda","david@tujenge.test","+256 776 225 981","CM840006AF","Driver","Swift Logistics","Entebbe","Joan S.  -  +256 700 666 777",1760000,450000,142000,"active"]
    ];
    for (const m of members) {
      await query(`INSERT INTO members
        (member_number,full_name,email,phone,national_id,occupation,employer,address,next_of_kin,branch_id,savings_balance,share_capital,dividends,status)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`, [...m.slice(0, 9), branchId, ...m.slice(9)]);
    }
  }

  if (!(await one("SELECT id FROM users LIMIT 1"))) {
    const passwordHash = await bcrypt.hash(demoPassword, 12);
    const accounts = [
      ["Amina Nansubuga","member@tujenge.test","+256 772 418 620","Member","TJS-000184"],
      ["Rebecca Nakato","executive@tujenge.test","+256 700 100 101","Executive Officer",null],
      ["Patrick Odoi","finance@tujenge.test","+256 700 100 104","Finance Officer",null],
      ["Daniel Ouma","credits@tujenge.test","+256 700 100 108","Credits Officer",null],
      ["Mercy Nakanwagi","investment@tujenge.test","+256 700 100 113","Investment Officer",null],
      ["Winfred Nabukenya","welfare@tujenge.test","+256 700 100 114","Welfare Officer",null],
      ["Lawrence Mugerwa","legal@tujenge.test","+256 700 100 115","Legal Officer",null],
      ["Lydia Akello","auditor@tujenge.test","+256 700 100 111","Auditor",null],
      ["Agnes Nambasa","supervisory@tujenge.test","+256 700 100 116","Supervisory Officer",null],
      ["Isaac Kintu","admin@tujenge.test","+256 700 100 112","System Admin",null]
    ];    for (const [name,email,phone,role,memberNumber] of accounts) {
      const member = memberNumber ? await one("SELECT id FROM members WHERE member_number=$1", [memberNumber]) : null;
      await query(`INSERT INTO users
        (full_name,email,phone,password_hash,role,branch_id,member_id,must_change_password)
        VALUES ($1,$2,$3,$4,$5,$6,$7,false)`, [name,email,phone,passwordHash,role,branchId,member?.id || null]);
    }
  }
  const guarantorAccounts = [
    ["Joseph Okello","joseph.member@tujenge.test","+256 701 586 443","TJS-000207"],
    ["Grace Atim","grace.member@tujenge.test","+256 704 772 183","TJS-000291"]
  ];
  const guarantorPasswordHash = await bcrypt.hash(demoPassword, 12);
  for (const [name,email,phone,memberNumber] of guarantorAccounts) {
    if (!(await one("SELECT id FROM users WHERE email=$1", [email]))) {
      const member = await one("SELECT id FROM members WHERE member_number=$1", [memberNumber]);
      await query(`INSERT INTO users (full_name,email,phone,password_hash,role,branch_id,member_id,must_change_password)
        VALUES ($1,$2,$3,$4,'Member',$5,$6,false)`, [name,email,phone,guarantorPasswordHash,branchId,member.id]);
    }
  }

  const departmentAccountSeed = [
    ["Florence Namagembe","finance@kasangatig40.test","+256 700 200 101","Finance Officer"],
    ["Ivan Sserwanga","investment@kasangatig40.test","+256 700 200 102","Investment Officer"],
    ["Christine Nakitto","credits@kasangatig40.test","+256 700 200 103","Credits Officer"],
    ["Lawrence Mugerwa","legal@kasangatig40.test","+256 700 200 104","Legal Officer"],
    ["Winfred Nabukenya","welfare@kasangatig40.test","+256 700 200 105","Welfare Officer"],
    ["Edward Ssekitoleko","executive@kasangatig40.test","+256 700 200 106","Executive Officer"],
    ["Susan Nambatya","supervisory@kasangatig40.test","+256 700 200 107","Supervisory Officer"]
  ];
  const departmentPasswordHash = await bcrypt.hash(demoPassword, 12);
  for(const [name,email,phone,role] of departmentAccountSeed) {
    if(!(await one("SELECT id FROM users WHERE email=$1",[email]))) {
      await query(`INSERT INTO users (full_name,email,phone,password_hash,role,branch_id,must_change_password)
        VALUES ($1,$2,$3,$4,$5,$6,false)`,[name,email,phone,departmentPasswordHash,role,branchId]);
    }
  }

  let organization = await one("SELECT id FROM organizations WHERE code='KG40'");
  if (!organization) organization = await one(
    "INSERT INTO organizations (name,code,description) VALUES ($1,$2,$3) RETURNING id",
    ["Kasangati G40 Kwagalana","KG40","A central member-based organization serving its members through seven accountable departments."]
  );
  // Migrate the earlier umbrella dashboard names to the organization's exact
  // seven-department structure without breaking their existing records.
  if(!(await one("SELECT id FROM departments WHERE code='legal'"))) {
    await query(`UPDATE departments SET code='legal',name='Legal',
      description='Legal affairs, contracts, statutory records, disputes and compliance guidance.'
      WHERE code='records'`);
  }
  if(!(await one("SELECT id FROM departments WHERE code='executive'"))) {
    await query(`UPDATE departments SET code='executive',name='Executive',
      description='Executive leadership, membership records, administration, human resources, communication, meetings and documents.'
      WHERE code='administration'`);
  }
  if(!(await one("SELECT id FROM departments WHERE code='supervisory'"))) {
    await query(`UPDATE departments SET code='supervisory',name='Supervisory',
      description='Independent supervision, internal audit, risk, controls, investigations and organizational compliance.'
      WHERE code='governance'`);
  }
  const departmentSeed = [
    ["welfare","Welfare","Member welfare contributions, assistance requests, cases and benefit approvals.",1],
    ["investment","Investment","Projects, member investments, performance, returns and asset oversight.",2],
    ["finance","Finance","Organization income, expenditure, budgets, contributions and financial reporting.",3],
    ["legal","Legal","Legal affairs, contracts, statutory records, disputes and compliance guidance.",4],
    ["executive","Executive","Executive leadership, membership records, administration, human resources, communication, meetings and documents.",5],
    ["supervisory","Supervisory","Independent departmental supervision, accountability reviews and leadership follow-up.",6],
    ["audit","Audit","Independent assurance, audits, findings, investigations, risk, fraud detection and compliance monitoring.",7],
    ["credits","Credits Department","Member savings, loan applications, guarantors, approvals, disbursements and repayments.",8]
  ];
  for (const [code,name,description,order] of departmentSeed) {
    await query(`INSERT INTO departments (organization_id,code,name,description,sort_order)
      VALUES ($1,$2,$3,$4,$5) ON CONFLICT (code) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,sort_order=EXCLUDED.sort_order`,
    [organization.id,code,name,description,order]);
  }
  const assignmentSeed = {
    "Finance Officer":[["finance","Finance Officer",3,true,true,true,true]],
    "Investment Officer":[["investment","Investment Officer",3,true,true,true,false]],
    "Credits Officer":[["credits","Credits Officer",3,true,true,true,true]],
    "Legal Officer":[["legal","Legal Officer",3,true,true,true,false]],
    "Welfare Officer":[["welfare","Welfare Officer",3,true,true,true,true]],
    "Executive Officer":[["executive","Executive Officer",4,true,true,true,true]],
    "Supervisory Officer":[["supervisory","Supervisory Officer",4,true,true,true,false]],
    Auditor:[["audit","Lead Internal Auditor",4,true,true,true,true],
      ["supervisory","Independent Assurance Observer",4,true,false,false,false],
      ["legal","Compliance Observer",4,true,false,false,false],
      ["finance","Audit Observer",4,true,false,false,false],
      ["credits","Credit Audit Observer",4,true,false,false,false],
      ["investment","Investment Audit Observer",4,true,false,false,false],
      ["welfare","Welfare Audit Observer",4,true,false,false,false],
      ["executive","Governance Audit Observer",4,true,false,false,false]],
    "System Admin":[]
  };  for (const [role,assignments] of Object.entries(assignmentSeed)) {
    const user = await one("SELECT id FROM users WHERE role=$1 ORDER BY id LIMIT 1",[role]);
    if (!user) continue;
    for (const [code,title,level,canView,canCreate,canEdit,canApprove] of assignments) {
      const department = await one("SELECT id FROM departments WHERE code=$1",[code]);
      await query(`INSERT INTO department_assignments
        (user_id,department_id,position_title,authority_level,can_view,can_create,can_edit,can_approve,is_head)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        ON CONFLICT (user_id,department_id) DO UPDATE SET position_title=EXCLUDED.position_title,
        authority_level=EXCLUDED.authority_level,can_view=EXCLUDED.can_view,can_create=EXCLUDED.can_create,
        can_edit=EXCLUDED.can_edit,can_approve=EXCLUDED.can_approve,is_head=EXCLUDED.is_head`,
      [user.id,department.id,title,level,canView,canCreate,canEdit,canApprove,level>=4]);
    }
  }

  await query(`UPDATE department_activities SET reference='ACT-LEGAL-001',activity_type='legal-register',
    title='Legal and statutory records review',
    description='Review contracts, registrations, policies and statutory obligations',visibility_level=3
    WHERE reference='ACT-RECORDS-001'`);
  await query("UPDATE department_activities SET reference='ACT-EXECUTIVE-001' WHERE reference='ACT-ADMINISTRATION-001'");
  await query("UPDATE department_activities SET reference='ACT-SUPERVISORY-001' WHERE reference='ACT-GOVERNANCE-001'");
  for (const member of (await query("SELECT id FROM members")).rows) {
    const department = await one("SELECT id FROM departments WHERE code=$1",[member.id%2===0?"investment":"welfare"]);
    await query(`INSERT INTO member_department_profiles (member_id,department_id,position_title,is_primary)
      VALUES ($1,$2,'Member',true) ON CONFLICT (member_id,department_id) DO NOTHING`,[member.id,department.id]);
  }
  const executiveUser=await one("SELECT id FROM users WHERE role='Executive Officer' ORDER BY id LIMIT 1");
  const managerUser=executiveUser;
  if(executiveUser) await query(`INSERT INTO leadership_assignments (user_id,body,position_title,leadership_level)
    VALUES ($1,'Board','Board Chairperson',5) ON CONFLICT DO NOTHING`,[executiveUser.id]);
  if(managerUser) await query(`INSERT INTO leadership_assignments (user_id,body,position_title,leadership_level)
    VALUES ($1,'Executive Committee','Chief Executive Officer',4) ON CONFLICT DO NOTHING`,[managerUser.id]);

  if (!(await one("SELECT id FROM department_activities LIMIT 1"))) {
    const creator=managerUser;
    const activitySeed=[
      ["legal","legal-register","Legal and statutory records review","Review contracts, registrations, policies and statutory obligations",null,"in_review",3],
      ["finance","budget","FY 2026 operating budget","Departmental budget consolidation and board review",185000000,"in_review",3],
      ["credits","portfolio","Credit portfolio review","Review arrears, pending applications and monthly collections",8090000,"active",2],
      ["investment","project","Kasangati commercial project","Feasibility assessment and member participation planning",75000000,"planning",2],
      ["welfare","benefits","Member welfare support cycle","Review submitted welfare assistance requests",4500000,"open",2],
      ["executive","meeting","Quarterly General Assembly","Prepare agenda, attendance register and resolutions",null,"scheduled",1],
      ["supervisory","supervision","Quarterly departmental supervision","Accountability, leadership follow-up and departmental performance review",null,"in_review",4],
      ["audit","audit","Quarterly internal audit","Independent records, controls and compliance review",null,"in_progress",4]
    ];
    for(const [code,type,title,description,amount,status,visibility] of activitySeed) {
      const department=await one("SELECT id FROM departments WHERE code=$1",[code]);
      await query(`INSERT INTO department_activities
        (department_id,reference,activity_type,title,description,amount,status,visibility_level,created_by)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [department.id,`ACT-${code.toUpperCase()}-001`,type,title,description,amount,status,visibility,creator.id]);
    }
  }
  const executiveSeedCreator=managerUser;
  const financeDepartment=await one("SELECT id FROM departments WHERE code='finance'");
  const investmentDepartment=await one("SELECT id FROM departments WHERE code='investment'");
  const creditsDepartment=await one("SELECT id FROM departments WHERE code='credits'");
  const welfareDepartment=await one("SELECT id FROM departments WHERE code='welfare'");
  const legalDepartment=await one("SELECT id FROM departments WHERE code='legal'");
  const executiveDepartment=await one("SELECT id FROM departments WHERE code='executive'");
  const supervisoryDepartment=await one("SELECT id FROM departments WHERE code='supervisory'");
  const auditDepartment=await one("SELECT id FROM departments WHERE code='audit'");
  const accountantUser=await one("SELECT id FROM users WHERE role='Finance Officer' ORDER BY id LIMIT 1");
  const secretaryUser=await one("SELECT id FROM users WHERE role='Executive Officer' ORDER BY id LIMIT 1");
  const memberUser=await one("SELECT id,member_id FROM users WHERE role='Member' AND member_id IS NOT NULL ORDER BY id LIMIT 1");
  const auditorUser=await one("SELECT id FROM users WHERE role='Auditor' ORDER BY id LIMIT 1");
  const investmentOfficerUser=await one("SELECT id FROM users WHERE role='Investment Officer' ORDER BY id LIMIT 1");
  const welfareOfficerUser=await one("SELECT id FROM users WHERE role='Welfare Officer' ORDER BY id LIMIT 1");
  const legalOfficerUser=await one("SELECT id FROM users WHERE role='Legal Officer' ORDER BY id LIMIT 1");

  const financeEntries=[
    ["ORG-INC-2607","income","Member contributions","July organization contributions",125450000,"approved"],
    ["ORG-EXP-2607","expense","Operations","July operating and programme expenditure",98750000,"approved"],
    ["ORG-PAY-2608","expense","Asset purchase","Office equipment acquisition request",18500000,"pending"]
  ];
  for(const [ref,type,category,description,amount,status] of financeEntries) {
    await query(`INSERT INTO organization_finance_entries
      (department_id,reference,entry_type,category,description,amount,status,recorded_by,approved_by,approved_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,CASE WHEN $7='approved' THEN NOW() ELSE NULL END)
      ON CONFLICT (reference) DO NOTHING`,
    [financeDepartment.id,ref,type,category,description,amount,status,accountantUser.id,status==="approved"?managerUser.id:null]);
  }
  await query("UPDATE organization_finance_entries SET transaction_date=CURRENT_DATE-10,counterparty='Organization members',payment_method='Bank transfer',receipt_number='RCPT-2607-001' WHERE reference='ORG-INC-2607'");
  await query("UPDATE organization_finance_entries SET transaction_date=CURRENT_DATE-9,counterparty='Operations suppliers',payment_method='Bank transfer',voucher_number='PV-2607-001',budget_line='Operations' WHERE reference='ORG-EXP-2607'");
  const detailedFinanceEntries=[
    ["FIN-INC-001","income","Membership Fees","July membership fees","Organization members","Mobile Money",12850000,"completed","RCPT-2607-101",null,"Membership","0 days"],
    ["FIN-INC-002","income","Donations","Donation from Well Wishers","Well Wishers Association","Bank transfer",15000000,"completed","RCPT-2607-102",null,"Donations","3 days"],
    ["FIN-INC-003","income","Investment Income","Commercial Centre rental income","G40 Commercial Centre","Bank transfer",22500000,"completed","RCPT-2607-103",null,"Investment income","6 days"],
    ["FIN-INC-004","income","Registration Fees","New member registration fees","New members","Cash",4980000,"completed","RCPT-2607-104",null,"Registration","12 days"],
    ["FIN-INC-005","income","Grants","Community development grant","Partner Foundation","Bank transfer",34650000,"completed","RCPT-2607-105",null,"Grants","16 days"],
    ["FIN-EXP-001","expense","Office Expenses","Office supplies purchase","Kasangati Stationers","Bank transfer",3250000,"completed",null,"PV-2607-101","Administration","0 days"],
    ["FIN-EXP-002","expense","Utility Bills","Electricity and water bills","Utility Providers","Bank transfer",2750000,"completed",null,"PV-2607-102","Utilities","0 days"],
    ["FIN-EXP-003","expense","Transport","Organization field transport","Transport Providers","Cash",1650000,"completed",null,"PV-2607-103","Transport","0 days"],
    ["FIN-EXP-004","expense","Project Expenses","Commercial Centre works","BuildRight Uganda","Bank transfer",18500000,"completed",null,"PV-2607-104","Investment projects","5 days"],
    ["FIN-EXP-005","expense","Maintenance","Office and equipment maintenance","TechServe Uganda","Bank transfer",9550000,"completed",null,"PV-2607-105","Maintenance","14 days"],
    ["FIN-EXP-006","expense","Welfare Payments","Approved welfare fund transfer","Welfare Department","Bank transfer",10200000,"completed",null,"PV-2607-106","Welfare transfers","18 days"],
    ["FIN-EXP-007","expense","Operational Costs","Communication and meeting costs","Executive Department","Cash",3170000,"completed",null,"PV-2607-107","Operations","21 days"]
  ];
  for(const [ref,type,category,description,counterparty,method,amount,status,receipt,voucher,budgetLine,ago] of detailedFinanceEntries) {
    await query(`INSERT INTO organization_finance_entries
      (department_id,reference,entry_type,category,description,counterparty,payment_method,amount,status,receipt_number,voucher_number,budget_line,recorded_by,approved_by,approved_at,transaction_date)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,NOW(),CURRENT_DATE-$15::integer)
      ON CONFLICT (reference) DO NOTHING`,
    [financeDepartment.id,ref,type,category,description,counterparty,method,amount,status,receipt,voucher,budgetLine,accountantUser.id,managerUser.id,Number(ago.split(" ")[0])]);
  }
  const financeAccounts=[
    ["BANK-DFCU","DFCU Operating Account","bank","DFCU Bank","**** 4721",280000000,false],
    ["BANK-CENT","Centenary Development Account","bank","Centenary Bank","**** 8834",202560000,false],
    ["CASH-MAIN","Main Office Cash","cash",null,null,18750000,false],
    ["CASH-PETTY","Petty Cash","petty_cash",null,null,5400000,false],
    ["FUND-REST","Restricted Project Funds","restricted",null,null,42000000,true]
  ];
  for(const row of financeAccounts) await query(`INSERT INTO finance_accounts
    (account_code,account_name,account_type,bank_name,account_number,balance,restricted,last_reconciled_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,NOW()-INTERVAL '6 days') ON CONFLICT (account_code) DO NOTHING`,row);
  const budgetRows=[
    ["BUD-EXEC-26",executiveDepartment.id,100000000,62000000],
    ["BUD-FIN-26",financeDepartment.id,180000000,128000000],
    ["BUD-CRED-26",creditsDepartment.id,250000000,165000000],
    ["BUD-INV-26",investmentDepartment.id,350000000,290000000],
    ["BUD-WEL-26",welfareDepartment.id,130000000,82000000],
    ["BUD-LEG-26",legalDepartment.id,100000000,62000000],
    ["BUD-SUP-26",supervisoryDepartment.id,70000000,28000000]
  ];
  for(const [ref,departmentId,allocated,used] of budgetRows) await query(`INSERT INTO finance_budgets
    (reference,department_id,fiscal_period,allocated_amount,used_amount,status,created_by,approved_by)
    VALUES ($1,$2,'FY 2026',$3,$4,'approved',$5,$6) ON CONFLICT (reference) DO NOTHING`,
  [ref,departmentId,allocated,used,accountantUser.id,managerUser.id]);
  const voucherRows=[
    ["PV260717001",executiveDepartment.id,"Office Solutions Ltd","Office furniture supplier payment","Supplier Payment","Executive operations",8500000,"Bank transfer"],
    ["PV260717002",executiveDepartment.id,"Kasangati Properties","Main office rent","Office Rent","Executive operations",12000000,"Bank transfer"],
    ["PV260717003",financeDepartment.id,"UMEME and NWSC","Monthly utility bills","Utility Bills","Utilities",2750000,"Bank transfer"],
    ["PV260717004",investmentDepartment.id,"BuildRight Uganda","Commercial Centre project works","Project Expenses","Investment projects",5400000,"Bank transfer"],
    ["PV260717005",executiveDepartment.id,"Swift Transport","Field activity transport","Transport","Transport",1850000,"Mobile Money"]
  ];
  for(const [number,departmentId,supplier,description,category,budgetLine,amount,method] of voucherRows) await query(`INSERT INTO finance_payment_vouchers
    (voucher_number,department_id,supplier,description,category,budget_line,amount,payment_method,status,supporting_document,requested_by)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'finance_review',$9,$10) ON CONFLICT (voucher_number) DO NOTHING`,
  [number,departmentId,supplier,description,category,budgetLine,amount,method,`${number.toLowerCase()}.pdf`,managerUser.id]);
  const invoiceRows=[
    ["INV-SUP-001","BuildRight Uganda","Commercial Centre works certificate",120000000,"unpaid","7 days"],
    ["INV-SUP-002","Office Solutions Ltd","Furniture and computer equipment",65000000,"unpaid","12 days"],
    ["INV-SUP-003","Kasangati Properties","Office rent commitment",48000000,"unpaid","18 days"],
    ["INV-SUP-004","Utility Providers","Utilities and service commitments",32000000,"part_paid","5 days"]
  ];
  for(const [number,supplier,description,amount,status,due] of invoiceRows) await query(`INSERT INTO finance_invoices
    (invoice_number,supplier,description,amount,invoice_date,due_date,status,supporting_document,created_by)
    VALUES ($1,$2,$3,$4,CURRENT_DATE-INTERVAL '10 days',CURRENT_DATE+$5::interval,$6,$7,$8)
    ON CONFLICT (invoice_number) DO NOTHING`,[number,supplier,description,amount,due,status,`${number.toLowerCase()}.pdf`,accountantUser.id]);
  const assetRows=[
    ["AST-LAND-01","Kasangati Organization Land","Land",new Date("2022-01-15"),900000000,1200000000,executiveDepartment.id,"Kasangati","Executive"],
    ["AST-BLD-01","G40 Commercial Centre","Building",new Date("2024-03-20"),780000000,850000000,investmentDepartment.id,"Kasangati","Investment"],
    ["AST-VEH-01","Organization Field Vehicle","Vehicle",new Date("2025-06-05"),180000000,145000000,executiveDepartment.id,"Main Office","Administration"],
    ["AST-ICT-01","Office Computers and Network","Computers",new Date("2026-01-10"),95000000,82000000,financeDepartment.id,"Main Office","Finance"],
    ["AST-FUR-01","Office Furniture","Furniture",new Date("2025-08-18"),85000000,73000000,executiveDepartment.id,"Main Office","Administration"]
  ];
  for(const row of assetRows) await query(`INSERT INTO finance_assets
    (asset_code,asset_name,asset_type,purchase_date,purchase_value,current_value,status,department_id,location,custodian,created_by)
    VALUES ($1,$2,$3,$4,$5,$6,'active',$7,$8,$9,$10) ON CONFLICT (asset_code) DO NOTHING`,[...row,accountantUser.id]);
  const procurementRows=[
    ["PROC-2607-001",executiveDepartment.id,"Office furniture and storage","Office Solutions Ltd",18500000,"finance_review"],
    ["PROC-2607-002",investmentDepartment.id,"Commercial Centre electrical materials","BuildRight Uganda",32000000,"executive_approval"],
    ["PROC-2607-003",financeDepartment.id,"Accounting workstations","TechServe Uganda",12000000,"purchase_order"],
    ["PROC-2607-004",welfareDepartment.id,"Emergency response supplies","Community Medical Ltd",8500000,"goods_received"]
  ];
  for(const [ref,departmentId,item,supplier,amount,stage] of procurementRows) {
    const approved=["purchase_order","goods_received"].includes(stage);
    await query(`INSERT INTO finance_procurements
      (reference,department_id,item_description,supplier,estimated_amount,approved_amount,stage,status,requested_by,finance_reviewed_by,executive_approved_by,purchase_order_number)
      VALUES ($1,$2,$3,$4,$5,$6,$7,'open',$8,$9,$10,$11)
      ON CONFLICT (reference) DO NOTHING`,
    [ref,departmentId,item,supplier,amount,approved?amount:null,stage,managerUser.id,
      stage!=="finance_review"?accountantUser.id:null,approved?managerUser.id:null,approved?`PO-${ref}`:null]);
  }
  const investmentRows=[
    ["INV-001","Kasangati Commercial Centre","Rental and retail development project",900000000,730000000,785000000,99000000,"running","profitable"],
    ["INV-002","G40 Agro Supplies","Member-focused agricultural input venture",420000000,315000000,302000000,48000000,"running","watch"],
    ["INV-003","Community Events Centre","Events and hospitality income project",260000000,180000000,196000000,31000000,"running","profitable"]
  ];
  for(const row of investmentRows) await query(`INSERT INTO investment_projects
    (reference,name,description,target_amount,raised_amount,current_value,expected_return,status,performance_status,created_by,approved_by,starts_on)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,CURRENT_DATE-INTERVAL '5 months')
    ON CONFLICT (reference) DO NOTHING`,[...row,executiveSeedCreator.id,managerUser.id]);
  const investmentProjectDetails=[
    ["INV-001","Real Estate","Kasangati","Sarah Kabuye","Investment","Organization Capital",78,"2026-12-20","active"],
    ["INV-002","Agriculture","Wakiso","John Kato","Investment","Member & Organization Capital",62,"2026-11-15","construction"],
    ["INV-003","Hospitality","Kasangati","Martha Ssempa","Investment","Organization Capital",100,"2026-07-15","completed"]
  ];
  for(const [ref,category,location,manager,responsible,funding,progress,endDate,projectStatus] of investmentProjectDetails) await query(`UPDATE investment_projects
    SET category=$1,location=$2,manager_name=$3,responsible_department=$4,funding_source=$5,progress=$6,ends_on=$7,status=$8
    WHERE reference=$9`,[category,location,manager,responsible,funding,progress,endDate,projectStatus,ref]);
  const projectOne=await one("SELECT id FROM investment_projects WHERE reference='INV-001'");
  const projectTwo=await one("SELECT id FROM investment_projects WHERE reference='INV-002'");
  const projectThree=await one("SELECT id FROM investment_projects WHERE reference='INV-003'");
  const investmentTransactionRows=[
    ["INV-TX-001",projectOne.id,"revenue","Rental Income","Commercial centre July rent",85000000,"5 days"],
    ["INV-TX-002",projectOne.id,"expense","Maintenance","Electrical and lift maintenance",24500000,"4 days"],
    ["INV-TX-003",projectTwo.id,"revenue","Agricultural Income","Agro supplies sales",32750000,"3 days"],
    ["INV-TX-004",projectTwo.id,"expense","Operational Costs","Distribution and field operations",8600000,"2 days"],
    ["INV-TX-005",projectThree.id,"revenue","Service Income","Events centre bookings",45300000,"1 day"],
    ["INV-TX-006",projectThree.id,"expense","Utilities","Venue utilities and cleaning",7250000,"1 day"]
  ];
  for(const [ref,projectId,type,category,description,amount,ago] of investmentTransactionRows) await query(`INSERT INTO investment_transactions
    (reference,project_id,transaction_type,category,description,amount,transaction_date,recorded_by)
    VALUES ($1,$2,$3,$4,$5,$6,CURRENT_DATE-$7::interval,$8) ON CONFLICT (reference) DO NOTHING`,
  [ref,projectId,type,category,description,amount,ago,investmentOfficerUser.id]);
  const proposalRows=[
    ["PROP-001","Modern Warehouse Complex","Warehousing and logistics facility","Real Estate",150000000,215000000,18.5,"Medium risk: construction costs and tenant uptake","Proceed after detailed cost review","investment_review"],
    ["PROP-002","Poultry Farm Expansion","Expand poultry capacity and cold-chain distribution","Agriculture",90000000,132000000,22.4,"Medium risk: feed prices and disease controls","Recommended with insurance cover","financial_analysis"],
    ["PROP-003","School Infrastructure Project","Lease-backed education infrastructure venture","Real Estate",75000000,96000000,14.2,"Low to medium risk: lease performance","Proceed subject to legal review","executive_approval"]
  ];
  for(const [ref,title,description,category,cost,revenue,roi,risk,recommendation,status] of proposalRows) {
    let activityId=null;
    if(status==="executive_approval") {
      const activity=await one(`INSERT INTO department_activities
        (department_id,reference,activity_type,title,description,amount,status,visibility_level,created_by)
        VALUES ($1,$2,'investment-proposal',$3,$4,$5,'pending_executive',4,$6)
        ON CONFLICT (reference) DO UPDATE SET title=EXCLUDED.title RETURNING id`,
      [investmentDepartment.id,`EXEC-${ref}`,title,description,cost,investmentOfficerUser.id]);
      activityId=activity.id;
    }
    await query(`INSERT INTO investment_proposals
      (reference,title,description,category,estimated_cost,expected_revenue,expected_roi,risk_assessment,recommendation,status,executive_activity_id,created_by,reviewed_by,reviewed_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::text,$11,$12::bigint,
        CASE WHEN $10::text<>'investment_review' THEN $12::bigint ELSE NULL::bigint END,
        CASE WHEN $10::text<>'investment_review' THEN NOW() ELSE NULL END)
      ON CONFLICT (reference) DO UPDATE SET executive_activity_id=COALESCE(investment_proposals.executive_activity_id,EXCLUDED.executive_activity_id)`,
    [ref,title,description,category,cost,revenue,roi,risk,recommendation,status,activityId,investmentOfficerUser.id]);
  }
  const investorRows=[
    [projectOne.id,"Organization Capital","Organizational capital",500000000,55.5,72000000,18000000],
    [projectOne.id,"Member Investment Pool","Member investment pool",230000000,25.6,33000000,8000000],
    [projectTwo.id,"Agriculture Grant","Grant",150000000,35.7,28000000,12000000],
    [projectThree.id,"Organization Capital","Organizational capital",180000000,69.2,31000000,15500000]
  ];
  if(!(await one("SELECT id FROM investment_investors LIMIT 1"))) for(const [projectId,name,source,amount,ownership,expected,received] of investorRows)
    await query(`INSERT INTO investment_investors
      (project_id,investor_name,funding_source,amount_invested,ownership_percentage,expected_returns,payments_received,investment_date,created_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,CURRENT_DATE-INTERVAL '5 months',$8)`,
    [projectId,name,source,amount,ownership,expected,received,investmentOfficerUser.id]);
  const contractRows=[
    ["INV-CON-001",projectOne.id,"Contractor Agreement","BuildRight Uganda","Commercial Centre Phase II Works",185000000,"active"],
    ["INV-CON-002",projectOne.id,"Lease Agreement","Kasangati Retailers Association","Retail Space Master Lease",96000000,"active"],
    ["INV-CON-003",projectTwo.id,"Supplier Contract","Agro Inputs Uganda","Agricultural Inputs Supply",68000000,"active"],
    ["INV-CON-004",projectThree.id,"Insurance Document","UAP Old Mutual","Events Centre Property Cover",22000000,"active"]
  ];
  for(const [ref,projectId,type,counterparty,title,value,status] of contractRows) await query(`INSERT INTO investment_contracts
    (reference,project_id,contract_type,counterparty,title,contract_value,starts_on,ends_on,status,document_reference,created_by)
    VALUES ($1,$2,$3,$4,$5,$6,CURRENT_DATE-INTERVAL '2 months',CURRENT_DATE+INTERVAL '10 months',$7,$1||'.pdf',$8)
    ON CONFLICT (reference) DO NOTHING`,[ref,projectId,type,counterparty,title,value,status,investmentOfficerUser.id]);
  const investmentAssetRows=[
    ["INV-AST-001",projectOne.id,"Commercial Centre Building","Building",730000000,785000000,"Kasangati"],
    ["INV-AST-002",projectTwo.id,"Agro Distribution Truck","Vehicle",85000000,76000000,"Wakiso"],
    ["INV-AST-003",projectTwo.id,"Agricultural Storage Equipment","Equipment",42000000,39000000,"Wakiso"],
    ["INV-AST-004",projectThree.id,"Events Centre Fixtures","Furniture & Equipment",68000000,65000000,"Kasangati"]
  ];
  for(const [code,projectId,name,type,cost,value,location] of investmentAssetRows) await query(`INSERT INTO investment_assets
    (asset_code,project_id,asset_name,asset_type,acquisition_value,current_value,location,status,created_by)
    VALUES ($1,$2,$3,$4,$5,$6,$7,'active',$8) ON CONFLICT (asset_code) DO NOTHING`,
  [code,projectId,name,type,cost,value,location,investmentOfficerUser.id]);
  const welfareRows=[
    ["WEL-001","Emergency assistance","Urgent medical support",2500000,"submitted"],
    ["WEL-002","Bereavement support","Family funeral assistance",1800000,"approved"],
    ["WEL-003","Ceremony support","Member introduction ceremony support",1200000,"submitted"]
  ];
  for(const [ref,type,description,amount,status] of welfareRows) await query(`INSERT INTO welfare_requests
    (reference,member_id,request_type,description,amount,status,submitted_by,reviewed_by,reviewed_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,CASE WHEN $6='approved' THEN NOW() ELSE NULL END)
    ON CONFLICT (reference) DO NOTHING`,[ref,memberUser.member_id,type,description,amount,status,memberUser.id,status==="approved"?secretaryUser.id:null]);
  const welfareMembers=(await query("SELECT id,member_number,full_name FROM members ORDER BY id LIMIT 6")).rows;
  const expandedWelfareRows=[
    ["WEL-004",welfareMembers[1].id,"Medical support","Emergency hospital treatment and medication",5000000,"submitted","critical","medical-evidence.pdf"],
    ["WEL-005",welfareMembers[2].id,"Childbirth support","Maternity and newborn support request",1500000,"committee_review","medium","birth-notification.pdf"],
    ["WEL-006",welfareMembers[4].id,"Education emergency","Urgent school continuation assistance",2000000,"more_information","high",null]
  ];
  for(const [ref,memberId,type,description,amount,status,urgency,document] of expandedWelfareRows) await query(`INSERT INTO welfare_requests
    (reference,member_id,request_type,description,amount,status,urgency,supporting_document,documents_verified,submitted_by,assigned_to)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT (reference) DO NOTHING`,
  [ref,memberId,type,description,amount,status,urgency,document,Boolean(document),memberUser.id,welfareOfficerUser.id]);
  await query(`UPDATE welfare_requests SET urgency=CASE reference WHEN 'WEL-001' THEN 'critical' WHEN 'WEL-002' THEN 'high' ELSE 'medium' END,
    supporting_document=COALESCE(supporting_document,reference||'-evidence.pdf'),
    documents_verified=CASE WHEN reference IN ('WEL-001','WEL-002') THEN true ELSE documents_verified END,
    assigned_to=COALESCE(assigned_to,$1),officer_recommendation=COALESCE(officer_recommendation,'Initial welfare assessment completed')
    WHERE reference IN ('WEL-001','WEL-002','WEL-003')`,[welfareOfficerUser.id]);
  const expectedContribution=50000;
  const contributionRows=[
    [welfareMembers[0].id,50000,"Monthly welfare contribution","Mobile Money","5 days"],
    [welfareMembers[1].id,50000,"Monthly welfare contribution","Cash","4 days"],
    [welfareMembers[2].id,25000,"Monthly welfare contribution","Bank transfer","3 days"],
    [welfareMembers[3].id,0,"Monthly welfare contribution","Cash","2 days"],
    [welfareMembers[4].id,50000,"Emergency collection","Mobile Money","1 day"],
    [welfareMembers[5].id,30000,"Monthly welfare contribution","Cash","1 day"]
  ];
  for(let index=0;index<contributionRows.length;index++) {
    const [memberId,amount,type,method,ago]=contributionRows[index],ref=`WCON-2607-${String(index+1).padStart(3,"0")}`;
    await query(`INSERT INTO welfare_contributions
      (reference,member_id,contribution_type,period,expected_amount,amount,payment_method,receipt_number,status,contribution_date,recorded_by)
      VALUES ($1,$2,$3,'July 2026',$4,$5,$6,$7,'recorded',CURRENT_DATE-$8::interval,$9)
      ON CONFLICT (reference) DO NOTHING`,
    [ref,memberId,type,expectedContribution,amount,method,`WRCPT-2607-${String(index+1).padStart(3,"0")}`,ago,welfareOfficerUser.id]);
  }
  const approvedWelfare=await one("SELECT wr.id,wr.amount,m.full_name FROM welfare_requests wr JOIN members m ON m.id=wr.member_id WHERE wr.reference='WEL-002'");
  if(approvedWelfare&&!(await one("SELECT id FROM welfare_payments WHERE request_id=$1",[approvedWelfare.id]))) await query(`INSERT INTO welfare_payments
    (reference,request_id,beneficiary_name,amount,payment_method,voucher_number,receipt_number,status,approved_at,paid_at,recorded_by)
    VALUES ('WPAY-2607-001',$1,$2,$3,'Mobile Money','PV-WEL-2607-001','WEL-RCPT-2607-001','paid',NOW()-INTERVAL '3 days',NOW()-INTERVAL '2 days',$4)`,
  [approvedWelfare.id,approvedWelfare.full_name,approvedWelfare.amount,welfareOfficerUser.id]);
  const welfareActivityRows=[
    ["WACT-001","Member Visit","Member Visit - Nakawa Community","Visit and follow-up with members receiving medical care","3 days",1200000,"Winfred Nabukenya","planned"],
    ["WACT-002","Fundraising","Welfare Fundraising - Community Walk","Emergency welfare fund mobilization campaign","7 days",3500000,"Welfare Committee","planned"],
    ["WACT-003","Bereavement","Bereavement Support Meeting","Coordination meeting for family support and funeral arrangements","10 days",2000000,"Welfare Committee","planned"],
    ["WACT-004","Community Outreach","Medical Support Campaign","Community health and medical support outreach","14 days",4500000,"Winfred Nabukenya","planned"]
  ];
  for(const [ref,type,title,description,when,budget,officer,status] of welfareActivityRows) await query(`INSERT INTO welfare_activities
    (reference,activity_type,title,description,activity_date,budget,responsible_officer,status,created_by)
    VALUES ($1,$2,$3,$4,NOW()+$5::interval,$6,$7,$8,$9) ON CONFLICT (reference) DO NOTHING`,
  [ref,type,title,description,when,budget,officer,status,welfareOfficerUser.id]);
  const welfareMeetingRows=[
    ["WMTG-001","Monthly Welfare Committee","Review pending requests, contributions and beneficiary follow-ups","Board Room","5 days","Welfare Department Head"],
    ["WMTG-002","Emergency Case Review","Decide critical medical and bereavement cases","Conference Room","9 days","Welfare Committee Chair"]
  ];
  for(const [ref,title,agenda,venue,when,chair] of welfareMeetingRows) await query(`INSERT INTO welfare_committee_meetings
    (reference,title,agenda,venue,scheduled_at,chairperson,status,created_by)
    VALUES ($1,$2,$3,$4,NOW()+$5::interval,$6,'scheduled',$7) ON CONFLICT (reference) DO NOTHING`,
  [ref,title,agenda,venue,when,chair,welfareOfficerUser.id]);
  const meetingRows=[
    ["MTG-BOARD-08",executiveDepartment.id,"Board Strategy Meeting","Board Meeting","Finance, investment performance and major approvals","Kasangati Main Hall","3 days"],
    ["MTG-CREDIT-08",creditsDepartment.id,"Credit Committee Review","Loan Committee","Large loan applications and portfolio risk","Committee Room","5 days"],
    ["MTG-WELFARE-08",welfareDepartment.id,"Welfare Committee Meeting","Welfare Meeting","Emergency requests and monthly fund report","Conference Room","8 days"],
    ["MTG-INVEST-08",investmentDepartment.id,"Investment Performance Meeting","Investment Meeting","Project performance and partnership proposals","Board Room","11 days"],
    ["MTG-TRAIN-08",executiveDepartment.id,"Leadership and Compliance Training","Training","Governance, approvals and accountability","Training Centre","14 days"]
  ];
  for(const [ref,departmentId,title,type,agenda,venue,days] of meetingRows) await query(`INSERT INTO organization_meetings
    (reference,department_id,title,meeting_type,agenda,venue,scheduled_at,status,visibility_level,created_by)
    VALUES ($1,$2,$3,$4,$5,$6,NOW()+$7::interval,'scheduled',2,$8)
    ON CONFLICT (reference) DO NOTHING`,[ref,departmentId,title,type,agenda,venue,days,secretaryUser.id]);
  const governanceRows=[
    [legalDepartment.id,"LEG-001","contract","Partnership agreement review","Review proposed commercial partnership terms","medium","open",3,secretaryUser.id],
    [legalDepartment.id,"LEG-002","policy","Procurement policy update","Policy amendments await executive signature","low","open",3,secretaryUser.id],
    [supervisoryDepartment.id,"SUP-001","audit","Finance control exception","Supporting document gap on two payments","high","open",4,auditorUser.id],
    [supervisoryDepartment.id,"SUP-002","recommendation","Investment reporting follow-up","Monthly variance report must be submitted","medium","open",3,auditorUser.id],
    [supervisoryDepartment.id,"SUP-003","audit","Credits file review","Guarantor documentation sample review completed","low","resolved",3,auditorUser.id]
  ];
  for(const [departmentId,ref,type,title,description,severity,status,visibility,creator] of governanceRows) await query(`INSERT INTO governance_records
    (department_id,reference,record_type,title,description,severity,status,visibility_level,created_by,resolved_by,resolved_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    ON CONFLICT (reference) DO NOTHING`,[departmentId,ref,type,title,description,severity,status,visibility,creator,
      status==="resolved"?creator:null,status==="resolved"?new Date():null]);
  const legalCreator=legalOfficerUser?.id||secretaryUser.id;
  const legalCases=[
    ["LC-2026-001","Contract Dispute","Kass Towers Contractor",null,investmentDepartment.id,"Dispute concerning delayed completion and variation costs.","Contract, site reports and correspondence","Lawrence Mugerwa","open","high","9 days","Pre-hearing conference scheduled",null],
    ["LC-2026-002","Disciplinary","Peter Mugisha","TJS-000207",executiveDepartment.id,"Alleged breach of the organization code of conduct.","Complaint statement and witness notes","Lawrence Mugerwa","investigation","medium","14 days","Investigation interviews underway",null],
    ["LC-2026-003","Land Matter","Kasangati G40 Kwagalana",null,investmentDepartment.id,"Boundary clarification for organization investment land.","Title deed and survey report","External Counsel","appeal","high","21 days","Awaiting court directions",null],
    ["LC-2026-004","Policy Interpretation","Welfare Committee",null,welfareDepartment.id,"Interpretation of exceptional welfare assistance authority.","Constitution and Welfare Policy","Lawrence Mugerwa","resolved","low",null,"Legal opinion adopted","Committee may recommend; Executive approves exceptions"]
  ];
  for(const [number,category,subject,memberNumber,departmentId,description,evidence,officer,status,risk,hearing,timeline,decision] of legalCases) {
    const member=memberNumber?await one("SELECT id FROM members WHERE member_number=$1",[memberNumber]):null;
    await query(`INSERT INTO legal_cases
      (case_number,case_category,subject_name,member_id,department_id,description,evidence,assigned_officer,status,risk_level,
       next_hearing_at,decision,attachments,timeline_note,opened_at,closed_at,created_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,CASE WHEN $11::text IS NULL THEN NULL ELSE NOW()+$11::interval END,
       $12,$7,$13,CURRENT_DATE-45,CASE WHEN $9='resolved' THEN CURRENT_DATE-3 ELSE NULL END,$14)
      ON CONFLICT (case_number) DO NOTHING`,
    [number,category,subject,member?.id||null,departmentId,description,evidence,officer,status,risk,hearing,decision,timeline,legalCreator]);
  }
  const legalContracts=[
    ["CON-2026-014","Commercial Centre Partnership","Partnership Agreement","Kasangati G40 Kwagalana; Kira Development Partners",investmentDepartment.id,850000000,"2026-08-01","2031-07-31","2030-12-15","under_review","Lawrence Mugerwa","con-2026-014.pdf","Risk allocation and termination clauses under review"],
    ["CON-2026-011","Office Supplies Framework","Supplier Contract","Kasangati G40 Kwagalana; Prime Office Solutions",financeDepartment.id,96000000,"2026-01-01","2026-12-31","2026-10-31","approved","Lawrence Mugerwa","con-2026-011.pdf","Legally cleared and signed"],
    ["CON-2025-008","Kass Towers Lease Portfolio","Lease Agreement","Kasangati G40 Kwagalana; Commercial Tenants",investmentDepartment.id,420000000,"2025-09-01","2027-08-31","2027-05-31","active","External Counsel","con-2025-008.pdf","Quarterly compliance monitoring"],
    ["CON-2024-003","Organization Internet Service","Service Contract","Kasangati G40 Kwagalana; UgandaNet Ltd",financeDepartment.id,18400000,"2024-09-01","2026-08-20","2026-08-01","expiring","Lawrence Mugerwa","con-2024-003.pdf","Renewal decision required"]
  ];
  for(const row of legalContracts) await query(`INSERT INTO legal_contracts
    (contract_number,title,contract_type,parties,department_id,contract_value,starts_on,ends_on,renewal_date,status,
     responsible_officer,supporting_document,review_notes,created_by,approved_by)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,CASE WHEN $10 IN ('approved','active') THEN $15::bigint ELSE NULL END)
    ON CONFLICT (contract_number) DO NOTHING`,[...row,legalCreator,managerUser.id]);
  const policies=[
    ["POL-CONST","Organization Constitution","Constitution","3.0","2024-01-01","2027-01-31","approved","Approved by General Assembly","DOC-CONSTITUTION"],
    ["POL-PROC","Procurement Policy","Procurement Policy","2.4","2025-01-01","2026-08-15","under_review","Amendments submitted for review","DOC-POLICY"],
    ["POL-WEL","Welfare Support Policy","Welfare Policy","1.8","2025-07-01","2026-09-30","amendment_required","Committee requested threshold clarification","DOC-WEL-POL"],
    ["POL-CREDIT","Credit and Guarantor Policy","Credit Policy","4.1","2026-01-01","2027-01-01","approved","Executive approval recorded","DOC-CREDIT-POL"]
  ];
  for(const row of policies) await query(`INSERT INTO legal_policies
    (reference,policy_name,policy_category,version,effective_date,review_date,status,approval_history,document_reference,created_by,approved_by)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,CASE WHEN $7='approved' THEN $11::bigint ELSE NULL END)
    ON CONFLICT (reference) DO NOTHING`,[...row,legalCreator,managerUser.id]);
  const complaints=[
    ["CMP-2026-017","Amina Nansubuga","TJS-000184","Member Complaint",creditsDepartment.id,"Complaint regarding delayed communication on a member service request.","Member statement and correspondence","Lawrence Mugerwa","legal_review",null],
    ["CMP-2026-016","Anonymous member",null,"Harassment",executiveDepartment.id,"Confidential workplace conduct complaint requiring protected investigation.","Restricted witness statement","Lawrence Mugerwa","investigation",null],
    ["CMP-2026-012","Investment Department",null,"Department Complaint",investmentDepartment.id,"Contractor performance and procurement compliance complaint.","Project reports and contract","Lawrence Mugerwa","recommendation","Refer contract matter to mediation"],
    ["CMP-2026-009","Grace Atim","TJS-000291","Misconduct",welfareDepartment.id,"Complaint reviewed and resolved through a documented disciplinary process.","Statements and committee minutes","Lawrence Mugerwa","closed","Warning and corrective action completed"]
  ];
  for(const [number,complainant,memberNumber,type,departmentId,description,evidence,officer,status,recommendation] of complaints) {
    const member=memberNumber?await one("SELECT id FROM members WHERE member_number=$1",[memberNumber]):null;
    await query(`INSERT INTO legal_complaints
      (complaint_number,complainant,member_id,complaint_type,department_id,description,evidence,assigned_officer,status,recommendation,decision,created_by,closed_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,CASE WHEN $9='closed' THEN $10 ELSE NULL END,$11,CASE WHEN $9='closed' THEN NOW()-INTERVAL '4 days' ELSE NULL END)
      ON CONFLICT (complaint_number) DO NOTHING`,
    [number,complainant,member?.id||null,type,departmentId,description,evidence,officer,status,recommendation,legalCreator]);
  }
  const opinions=[
    ["OPN-2026-008","Welfare approval thresholds",welfareDepartment.id,"Does the Welfare Committee have authority to approve exceptional support above its limit?",null,"Lawrence Mugerwa","2026-08-05","pending"],
    ["OPN-2026-006","Investment partnership structure",investmentDepartment.id,"Review the proposed revenue-sharing structure and organization liabilities.","Proceed only after liability cap and audit rights are inserted.","Lawrence Mugerwa","2026-07-30","draft"],
    ["OPN-2026-004","Member disciplinary appeal",executiveDepartment.id,"Advise on procedural fairness and appeal timelines.","The member must receive the evidence summary and seven days to respond.","Lawrence Mugerwa","2026-07-20","completed"]
  ];
  for(const row of opinions) await query(`INSERT INTO legal_opinions
    (reference,title,requested_by_department,question,opinion,assigned_officer,due_date,status,document_reference,created_by,completed_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$1||'.pdf',$9,CASE WHEN $8='completed' THEN NOW()-INTERVAL '5 days' ELSE NULL END)
    ON CONFLICT (reference) DO NOTHING`,[...row,legalCreator]);
  const compliance=[
    ["COMP-2026-FIN",financeDepartment.id,"Monthly payment authorization controls","POL-PROC",92,"low","compliant","2026-08-31","No material exception","Continue monthly monitoring","Finance Manager"],
    ["COMP-2026-CRE",creditsDepartment.id,"Loan documentation and member consent","POL-CREDIT",84,"medium","action_required","2026-08-15","Two sampled files require updated consent evidence","Complete file remediation","Credits Head"],
    ["COMP-2026-INV",investmentDepartment.id,"Contract and procurement clearance","POL-PROC",76,"high","non_compliant","2026-08-07","One contractor variation lacks prior Legal clearance","Submit variation for retrospective review","Investment Head"],
    ["COMP-2026-WEL",welfareDepartment.id,"Exceptional support authorization","POL-WEL",88,"medium","under_review","2026-08-20","Threshold wording requires amendment","Table policy amendment","Welfare Head"],
    ["COMP-2026-EXE",executiveDepartment.id,"Constitutional meeting and minutes requirements","POL-CONST",96,"low","compliant","2026-09-30","Records are current","Maintain signed minutes","Organization Secretary"]
  ];
  for(const row of compliance) await query(`INSERT INTO legal_compliance
    (reference,department_id,requirement,policy_reference,compliance_score,risk_level,status,due_date,finding,corrective_action,responsible_officer,reviewed_at,created_by)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW()-INTERVAL '2 days',$12) ON CONFLICT (reference) DO NOTHING`,[...row,legalCreator]);
  const landCase=await one("SELECT id FROM legal_cases WHERE case_number='LC-2026-003'");
  const courtMatters=[
    ["CF-2026-041","Organization Land Boundary Matter","High Court of Uganda","Adjacent land proprietor","Kampala Legal Associates",landCase?.id||null,"21 days",null,null,"pending",12800000,"active"],
    ["CF-2025-019","Former Supplier Claim","Commercial Court","Eastline Supplies Ltd","Mugerwa & Co. Advocates",null,"35 days","Parties directed to mediation",null,null,7600000,"mediation"]
  ];
  for(const [file,title,court,opponent,representative,caseId,hearing,order,judgement,appeal,expenses,status] of courtMatters) await query(`INSERT INTO legal_court_matters
    (court_file,title,court_name,opposing_party,legal_representative,case_id,next_hearing_at,court_order,judgement,appeal_status,legal_expenses,status,created_by)
    VALUES ($1,$2,$3,$4,$5,$6,NOW()+$7::interval,$8,$9,$10,$11,$12,$13) ON CONFLICT (court_file) DO NOTHING`,
  [file,title,court,opponent,representative,caseId,hearing,order,judgement,appeal,expenses,status,legalCreator]);
  const auditCreator=auditorUser?.id||managerUser.id;
  await query(`INSERT INTO department_activities
    (department_id,reference,activity_type,title,description,status,visibility_level,created_by)
    VALUES ($1,'ACT-AUDIT-001','audit','Quarterly internal audit','Independent records, controls and compliance review','in_progress',4,$2)
    ON CONFLICT (reference) DO NOTHING`,[auditDepartment.id,auditCreator]);
  const auditPlans=[
    ["AUD-2026-001","Financial Audit",financeDepartment.id,"Q2 2026","Lydia Akello","Lydia Akello; External Assurance Adviser","Verify income, expenditure, vouchers and bank reconciliations.","Finance records, approvals, bank and cashbook transactions.","completed","-70 days","-12 days"],
    ["AUD-2026-002","Compliance Audit",creditsDepartment.id,"July 2026","Lydia Akello","Lydia Akello; Credit File Reviewer","Assess compliance with credit policy and guarantor controls.","Loan files, approvals, disbursements, repayments and guarantor evidence.","in_progress","-8 days",null],
    ["AUD-2026-003","Project Audit",investmentDepartment.id,"Q3 2026","Lydia Akello","Lydia Akello; Project Assurance Specialist","Review project governance, budgets and contractor performance.","Active projects, proposals, contracts, milestones and expenditure.","planned","12 days",null],
    ["AUD-2026-004","Operational Audit",welfareDepartment.id,"June-July 2026","Lydia Akello","Lydia Akello; Welfare Controls Reviewer","Verify requests, committee decisions and beneficiary payments.","Welfare requests, contributions, approvals and payment evidence.","overdue","-21 days",null],
    ["AUD-2026-005","Procurement Audit",financeDepartment.id,"H1 2026","Lydia Akello","Lydia Akello; Procurement Reviewer","Confirm procurement authorization, competition and receipt of goods.","Requests, quotations, purchase orders, invoices and payment vouchers.","completed","-90 days","-35 days"]
  ];
  for(const row of auditPlans) await query(`INSERT INTO audit_plans
    (audit_number,audit_type,department_id,audit_period,lead_auditor,audit_team,objective,scope,status,planned_date,started_at,completion_date,created_by,approved_by)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,CURRENT_DATE+$10::interval,
      CASE WHEN $9 IN ('in_progress','completed','overdue') THEN NOW()+$10::interval ELSE NULL END,
      CASE WHEN $11::text IS NULL THEN NULL ELSE CURRENT_DATE+$11::interval END,$12,$13)
    ON CONFLICT (audit_number) DO NOTHING`,[...row,auditCreator,managerUser.id]);
  const audit1=await one("SELECT id FROM audit_plans WHERE audit_number='AUD-2026-001'");
  const audit2=await one("SELECT id FROM audit_plans WHERE audit_number='AUD-2026-002'");
  const audit4=await one("SELECT id FROM audit_plans WHERE audit_number='AUD-2026-004'");
  const auditFindings=[
    ["FND-2026-021",audit1.id,financeDepartment.id,"Two payment vouchers lacked evidence of three-way invoice matching.","Voucher PV-2607-104 and receiving documentation.","high","Attach goods-received evidence before payment and enforce system validation.",financeDepartment.id,"10 days","open","PV-2607-review.pdf",false],
    ["FND-2026-020",audit1.id,financeDepartment.id,"One bank reconciliation was completed after the policy deadline.","Bank reconciliation completion timestamps.","medium","Complete and independently review reconciliations by the fifth working day.",financeDepartment.id,"-2 days","overdue","bank-reconciliation.pdf",true],
    ["FND-2026-019",audit2.id,creditsDepartment.id,"Two sampled loan files require updated member consent evidence.","Credit file sample and consent checklist.","high","Obtain signed consent evidence and block disbursement when absent.",creditsDepartment.id,"18 days","management_response","credit-sample.pdf",false],
    ["FND-2026-018",audit2.id,creditsDepartment.id,"Guarantor capacity controls operated effectively in the tested sample.","Guarantor capacity report and loan sample.","low","Continue automated capacity validation and quarterly monitoring.",creditsDepartment.id,"30 days","resolved","guarantor-review.pdf",false],
    ["FND-2026-017",audit4.id,welfareDepartment.id,"An exceptional assistance request was approved after service delivery.","Committee minutes and beneficiary payment voucher.","critical","Require approval before commitment and escalate exceptions to Executive.",welfareDepartment.id,"5 days","open","welfare-exception.pdf",false],
    ["FND-2026-016",audit1.id,investmentDepartment.id,"A project contract variation was not cleared by Legal before implementation.","Project variation and contractor correspondence.","high","Obtain Legal clearance and Executive authorization for material variations.",investmentDepartment.id,"7 days","follow_up","variation-review.pdf",true]
  ];
  for(const row of auditFindings) await query(`INSERT INTO audit_findings
    (finding_number,audit_id,department_id,description,evidence,risk_level,recommendation,responsible_department,due_date,status,supporting_document,repeat_finding,created_by,resolved_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,CURRENT_DATE+$9::interval,$10,$11,$12,$13,
      CASE WHEN $10='resolved' THEN NOW()-INTERVAL '3 days' ELSE NULL END)
    ON CONFLICT (finding_number) DO NOTHING`,[...row,auditCreator]);
  const findings=(await query("SELECT id,finding_number,department_id,recommendation,due_date,status FROM audit_findings WHERE finding_number LIKE 'FND-2026-%'")).rows;
  for(const finding of findings) await query(`INSERT INTO audit_recommendations
    (recommendation_number,finding_id,department_id,description,issued_on,due_date,status,department_response,follow_up_date,verified_by,completed_at,created_by)
    VALUES ($1,$2,$3,$4,CURRENT_DATE-20,$5::date,$6,$7,$5::date+7,$8,
      CASE WHEN $6='implemented' THEN NOW()-INTERVAL '3 days' ELSE NULL END,$9)
    ON CONFLICT (recommendation_number) DO NOTHING`,
  [`REC-${finding.finding_number.slice(4)}`,finding.id,finding.department_id,finding.recommendation,finding.due_date,
    finding.status==="resolved"?"implemented":finding.status==="follow_up"?"in_progress":finding.status==="overdue"?"overdue":"pending",
    finding.status==="resolved"?"Action verified by Audit":finding.status==="management_response"?"Department response received":null,
    finding.status==="resolved"?auditCreator:null,auditCreator]);
  const investigations=[
    ["INV-2026-006","Possible duplicate supplier payment references in the July payment run.","Lydia Akello","Finance","Payment vouchers, supplier ledger and bank statement","Finance Officer; Accountant","Reference duplication requires source-document verification.","Complete bank trace and verify supplier confirmation.",null,"evidence_review","critical"],
    ["INV-2026-005","Potential conflict of interest in an investment contractor selection.","Lydia Akello","Investment; Legal","Procurement evaluation, declarations and contract file","Investment Head; Procurement Officer","Declaration evidence is incomplete.","Obtain declarations and submit governance recommendation.",null,"interviews","high"],
    ["INV-2026-003","Anonymous complaint concerning unauthorized access to member records.","Lydia Akello","Executive; Credits","Access logs and user assignment history","System Administrator; Credits Head","No data export found; access role needs correction.","Remove excessive access and complete follow-up review.","INV-2026-003-final.pdf","recommendation","medium"]
  ];
  for(const row of investigations) await query(`INSERT INTO audit_investigations
    (investigation_number,case_description,lead_auditor,departments_involved,evidence,interviews,findings,recommendations,final_report,status,priority,created_by)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) ON CONFLICT (investigation_number) DO NOTHING`,[...row,auditCreator]);
  const complianceRows=[
    ["ACOMP-FIN",financeDepartment.id,"Financial and payment controls",91,"compliant","Payment approval controls generally effective.","Resolve documentation exceptions.","Finance Manager","2026-08-15"],
    ["ACOMP-CRE",creditsDepartment.id,"Credit and guarantor controls",84,"action_required","Consent evidence exception in sampled files.","Remediate files and strengthen validation.","Credits Head","2026-08-18"],
    ["ACOMP-INV",investmentDepartment.id,"Project and procurement controls",76,"non_compliant","Contract variation implemented before clearance.","Complete retrospective approval and control redesign.","Investment Head","2026-08-07"],
    ["ACOMP-WEL",welfareDepartment.id,"Welfare approval controls",81,"action_required","One late exceptional approval identified.","Enforce pre-approval and escalation.","Welfare Head","2026-08-12"],
    ["ACOMP-LEG",legalDepartment.id,"Legal and policy controls",95,"compliant","Registers and review evidence are current.","Maintain deadline monitoring.","Legal Officer","2026-09-01"],
    ["ACOMP-EXE",executiveDepartment.id,"Governance and authorization",89,"compliant","Decision records are generally complete.","Close two overdue action items.","Organization Secretary","2026-08-20"],
    ["ACOMP-SUP",supervisoryDepartment.id,"Supervisory follow-up controls",87,"compliant","Follow-up evidence is adequate.","Improve escalation timeliness.","Supervisory Head","2026-08-25"]
  ];
  for(const row of complianceRows) await query(`INSERT INTO audit_compliance
    (reference,department_id,compliance_area,compliance_score,status,finding_summary,corrective_action,responsible_officer,review_date,reviewed_by)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT (reference) DO NOTHING`,[...row,auditCreator]);
  const riskRows=[
    ["RSK-2026-014",financeDepartment.id,"Fraud Risk","Duplicate or unsupported supplier payments.",4,5,"critical","Enforce duplicate-reference checks and independent bank verification.","Finance Manager","open"],
    ["RSK-2026-013",investmentDepartment.id,"Project Risk","Material project changes without prior authorization.",4,4,"high","Route variations through Finance, Legal and Executive approval.","Investment Head","mitigating"],
    ["RSK-2026-012",creditsDepartment.id,"Compliance Risk","Incomplete consent or guarantor evidence.",3,4,"high","Block incomplete files and run monthly exception reports.","Credits Head","open"],
    ["RSK-2026-011",welfareDepartment.id,"Operational Risk","Emergency support committed before approval.",3,3,"medium","Introduce emergency approval escalation and evidence checklist.","Welfare Head","mitigating"],
    ["RSK-2026-010",executiveDepartment.id,"Governance Risk","Overdue implementation of departmental recommendations.",2,4,"medium","Monthly Executive action tracker.","Executive Secretary","monitoring"],
    ["RSK-2026-009",legalDepartment.id,"Compliance Risk","Contract and policy review deadlines may be missed.",2,2,"low","Automated deadline alerts and ownership assignment.","Legal Officer","controlled"]
  ];
  for(const row of riskRows) await query(`INSERT INTO audit_risks
    (risk_number,department_id,risk_category,description,likelihood,impact,risk_level,mitigation_plan,risk_owner,status,last_reviewed_at,created_by)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW()-INTERVAL '2 days',$11) ON CONFLICT (risk_number) DO NOTHING`,[...row,auditCreator]);
  const fraudRows=[
    ["FRA-2026-031","Payment Voucher","PV-2607-104",financeDepartment.id,"Duplicate reference pattern","Two related payment records share a supplier reference and require verification.",18500000,92,"investigating","Lydia Akello"],
    ["FRA-2026-030","Payment Voucher","PV-2607-105",financeDepartment.id,"Missing supporting documentation","Large maintenance payment has an incomplete receiving-document set.",9550000,81,"new","Lydia Akello"],
    ["FRA-2026-029","Investment Transaction","INV-EXP-004",investmentDepartment.id,"Budget overrun threshold","Project cost category exceeded its approved monthly threshold.",24500000,76,"under_review","Lydia Akello"],
    ["FRA-2026-028","User Access","ACCESS-2026-18",executiveDepartment.id,"Unusual access pattern","Account viewed records outside its normal working pattern.",null,68,"under_review","Lydia Akello"],
    ["FRA-2026-027","Welfare Payment","WEL-250516-001",welfareDepartment.id,"Approval timing exception","Assistance commitment predates final committee approval.",4500000,88,"escalated","Lydia Akello"]
  ];
  for(const row of fraudRows) await query(`INSERT INTO audit_fraud_alerts
    (alert_number,source_type,source_reference,department_id,rule_name,description,amount,risk_score,status,assigned_auditor,detected_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW()-INTERVAL '2 days') ON CONFLICT (alert_number) DO NOTHING`,row);
  const approvalRows=[
    [creditsDepartment.id,"EXEC-APP-LOAN","large-loan","Large development loan","Executive authorization required for UGX 48,000,000",48000000,4],
    [investmentDepartment.id,"EXEC-APP-INV","investment","Commercial project phase II","Approve phase-two investment allocation",120000000,4],
    [financeDepartment.id,"EXEC-APP-PAY","large-payment","Office equipment payment","Large payment exceeds departmental approval limit",18500000,4],
    [legalDepartment.id,"EXEC-APP-CON","contract","Strategic partnership agreement","Contract is ready for executive signature",null,4],
    [executiveDepartment.id,"EXEC-APP-POL","policy","Updated procurement policy","Board-approved policy awaits executive adoption",null,4]
  ];
  for(const [departmentId,ref,type,title,description,amount,visibility] of approvalRows) await query(`INSERT INTO department_activities
    (department_id,reference,activity_type,title,description,amount,status,visibility_level,created_by)
    VALUES ($1,$2,$3,$4,$5,$6,'pending_executive',$7,$8)
    ON CONFLICT (reference) DO NOTHING`,[departmentId,ref,type,title,description,amount,visibility,executiveSeedCreator.id]);
  const documentRows=[
    ["DOC-CONSTITUTION",executiveDepartment.id,"Constitution","Kasangati G40 Kwagalana Constitution","3.0"],
    ["DOC-POLICY",executiveDepartment.id,"Policies","Organization Policy Manual","2.4"],
    ["DOC-BOARD",executiveDepartment.id,"Board Minutes","Board Meeting Minutes - July 2026","1.0"],
    ["DOC-MEETING",executiveDepartment.id,"Meeting Minutes","General Assembly Minutes","1.0"],
    ["DOC-CONTRACT",legalDepartment.id,"Signed Contracts","Commercial Centre Partnership Agreement","1.1"],
    ["DOC-ANNUAL",financeDepartment.id,"Annual Reports","Annual Organization Report 2025/26","1.0"],
    ["DOC-AUDIT",auditDepartment.id,"Audit Reports","Quarterly Internal Audit Report","1.0"],
    ["DOC-LEGAL",legalDepartment.id,"Legal Documents","Statutory Compliance Register","2.0"]
  ];
  for(const [ref,departmentId,type,title,version] of documentRows) await query(`INSERT INTO organization_documents
    (reference,department_id,document_type,title,version,status,visibility_level,created_by,approved_by,file_name)
    VALUES ($1,$2,$3,$4,$5,'published',3,$6,$7,$8)
    ON CONFLICT (reference) DO NOTHING`,[ref,departmentId,type,title,version,secretaryUser.id,managerUser.id,`${ref.toLowerCase()}.pdf`]);
  await query("INSERT INTO settings (key,value) VALUES ('welfareFundBalance','245600000') ON CONFLICT (key) DO NOTHING");

  if (!(await one("SELECT id FROM transactions LIMIT 1"))) {
    const cashier = await one("SELECT id FROM users WHERE role='Finance Officer' ORDER BY id LIMIT 1");
    const accountant = await one("SELECT id FROM users WHERE role='Finance Officer' ORDER BY id LIMIT 1");
    const rows = [
      ["TRX-90842","TJS-000184","Savings deposit","Mobile Money",350000,"completed","1 hour"],
      ["TRX-90841","TJS-000207","Loan repayment","Bank transfer",525000,"completed","2 hours"],
      ["TRX-90840","TJS-000231","Withdrawal","Cash",-180000,"pending","1 day"],
      ["TRX-90839","TJS-000291","Share purchase","Mobile Money",200000,"completed","1 day"],
      ["TRX-90838","TJS-000318","Savings deposit","Cash",150000,"completed","2 days"]
    ];
    for (const [reference,number,type,method,amount,status,ago] of rows) {
      const member=await one("SELECT id FROM members WHERE member_number=$1",[number]);
      await query(`INSERT INTO transactions
        (reference,member_id,type,method,amount,status,recorded_by,verified_by,created_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW()-$9::interval)`,
      [reference,member.id,type,method,amount,status,cashier.id,accountant.id,ago]);
    }
  }

  if (!(await one("SELECT id FROM loans LIMIT 1"))) {
    const rows = [
      ["LN-02418","TJS-000184","Development Loan",8500000,6250000,18,"Business expansion","active","5 months","13 months"],
      ["LN-02431","TJS-000207","Emergency Loan",1200000,1200000,6,"Medical expenses","pending","2 days","6 months"],
      ["LN-02432","TJS-000291","School Fees Loan",3500000,3500000,12,"School tuition","review","1 day","12 months"],
      ["LN-02377","TJS-000256","Development Loan",6200000,1840000,18,"Farm equipment","overdue","15 months","-5 days"]
    ];
    for (const [reference,number,productName,amount,balance,term,purpose,status,ago,due] of rows) {
      const member=await one("SELECT id FROM members WHERE member_number=$1",[number]);
      const product=await one("SELECT id FROM loan_products WHERE name=$1",[productName]);
      await query(`INSERT INTO loans
        (reference,member_id,product_id,amount,balance,term_months,purpose,status,created_at,due_date)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW()-$9::interval,CURRENT_DATE+$10::interval)`,
      [reference,member.id,product.id,amount,balance,term,purpose,status,ago,due]);
    }
  }
  const creditsOfficer=await one("SELECT id FROM users WHERE role='Credits Officer' ORDER BY id LIMIT 1");
  const loansOfficer=await one("SELECT id FROM users WHERE role='Credits Officer' ORDER BY id LIMIT 1");
  const activeLoan=await one("SELECT * FROM loans WHERE reference='LN-02418'");
  const overdueLoan=await one("SELECT * FROM loans WHERE reference='LN-02377'");
  if(activeLoan&&!(await one("SELECT id FROM loan_repayment_schedule WHERE loan_id=$1",[activeLoan.id]))) {
    const installments=[
      [1,-120,8500000,370000,127500,497500,497500,"paid"],
      [2,-90,8130000,375550,121950,497500,497500,"paid"],
      [3,-60,7754450,381183,116317,497500,497500,"paid"],
      [4,-30,7373267,386901,110599,497500,497500,"paid"],
      [5,7,6986366,392704,104796,497500,0,"due"],
      [6,37,6593662,398595,98905,497500,0,"upcoming"]
    ];
    for(const row of installments) await query(`INSERT INTO loan_repayment_schedule
      (loan_id,installment_number,due_date,opening_balance,principal,interest,total_due,paid_amount,status,paid_at)
      VALUES ($1,$2,CURRENT_DATE+$3::int,$4,$5,$6,$7,$8,$9,CASE WHEN $9='paid' THEN NOW()-INTERVAL '5 days' ELSE NULL END)`,
    [activeLoan.id,...row]);
  }
  if(overdueLoan&&!(await one("SELECT id FROM loan_repayment_schedule WHERE loan_id=$1",[overdueLoan.id]))) {
    const installments=[
      [1,-150,6200000,310000,93000,403000,403000,"paid"],
      [2,-120,5890000,314650,88350,403000,403000,"paid"],
      [3,-90,5575350,319370,83630,403000,200000,"partial"],
      [4,-60,5255980,324160,78840,403000,0,"overdue"],
      [5,-30,4931820,329023,73977,403000,0,"overdue"]
    ];
    for(const row of installments) await query(`INSERT INTO loan_repayment_schedule
      (loan_id,installment_number,due_date,opening_balance,principal,interest,total_due,paid_amount,status,paid_at)
      VALUES ($1,$2,CURRENT_DATE+$3::int,$4,$5,$6,$7,$8::numeric,$9,CASE WHEN $8::numeric>0 THEN NOW()-INTERVAL '20 days' ELSE NULL END)`,
    [overdueLoan.id,...row]);
  }
  if(activeLoan&&!(await one("SELECT id FROM loan_guarantors WHERE loan_id=$1",[activeLoan.id]))) {
    const joseph=await one("SELECT id FROM members WHERE member_number='TJS-000207'");
    const grace=await one("SELECT id FROM members WHERE member_number='TJS-000291'");
    await query(`INSERT INTO loan_guarantors (loan_id,member_id,status,response_note,responded_at)
      VALUES ($1,$2,'accepted','Guarantee confirmed',NOW()-INTERVAL '5 months'),
             ($1,$3,'accepted','Guarantee confirmed',NOW()-INTERVAL '5 months')`,[activeLoan.id,joseph.id,grace.id]);
  }
  if(overdueLoan&&!(await one("SELECT id FROM loan_guarantors WHERE loan_id=$1",[overdueLoan.id]))) {
    const amina=await one("SELECT id FROM members WHERE member_number='TJS-000184'");
    await query(`INSERT INTO loan_guarantors (loan_id,member_id,status,response_note,responded_at)
      VALUES ($1,$2,'accepted','Guarantee confirmed',NOW()-INTERVAL '15 months')`,[overdueLoan.id,amina.id]);
  }
  if(overdueLoan&&!(await one("SELECT id FROM loan_recovery_actions LIMIT 1"))) {
    await query(`INSERT INTO loan_recovery_actions
      (loan_id,action_type,notes,recovery_status,follow_up_date,assigned_to,created_by,created_at)
      VALUES ($1,'Phone reminder','Member contacted and promised a partial payment.','open',CURRENT_DATE+3,$2,$2,NOW()-INTERVAL '2 days')`,
    [overdueLoan.id,creditsOfficer.id]);
  }
  if(overdueLoan&&!(await one("SELECT id FROM loan_charges LIMIT 1"))) {
    await query(`INSERT INTO loan_charges (loan_id,charge_type,amount,status,reason,assessed_by,assessed_at)
      VALUES ($1,'Late payment penalty',92000,'outstanding','Installment overdue beyond the policy grace period',$2,NOW()-INTERVAL '12 days')`,
    [overdueLoan.id,creditsOfficer.id]);
  }
  if(activeLoan) {
    await query("UPDATE transactions SET receipt_number=COALESCE(receipt_number,'RCPT-'||reference) WHERE receipt_number IS NULL");
    await query("UPDATE transactions SET loan_id=$1 WHERE reference='TRX-90841' AND type='Loan repayment'",[activeLoan.id]);
  }

  if (!(await one("SELECT id FROM withdrawals LIMIT 1"))) {
    const requester=await one("SELECT id FROM users WHERE role='Member'");
    const manager=await one("SELECT id FROM users WHERE role='Executive Officer' ORDER BY id LIMIT 1");
    const sarah=await one("SELECT id FROM members WHERE member_number='TJS-000231'");
    const david=await one("SELECT id FROM members WHERE member_number='TJS-000318'");
    await query(`INSERT INTO withdrawals (reference,member_id,amount,method,reason,status,requested_by,created_at)
      VALUES ('WD-00581',$1,180000,'Cash','Family expenses','pending',$2,NOW()-INTERVAL '1 day')`,[sarah.id,requester.id]);
    await query(`INSERT INTO withdrawals (reference,member_id,amount,method,reason,status,requested_by,approved_by,created_at)
      VALUES ('WD-00579',$1,300000,'Mobile Money','Business stock','approved',$2,$3,NOW()-INTERVAL '2 days')`,[david.id,requester.id,manager.id]);
  }

  const defaults = [["sms","true"],["email","true"],["twoFactor","false"],["dualApproval","true"],["currency","UGX"],["shareValue","50000"],["minimumBalance","100000"]];
  for (const [key,value] of defaults) await query("INSERT INTO settings (key,value) VALUES ($1,$2) ON CONFLICT (key) DO NOTHING",[key,value]);
  if (!(await one("SELECT id FROM announcements LIMIT 1"))) {
    const secretary=await one("SELECT id FROM users WHERE role='Executive Officer' ORDER BY id LIMIT 1");
    await query("INSERT INTO announcements (title,body,created_by) VALUES ($1,$2,$3)",["Annual General Meeting","The 2026 AGM will be held on 15 August at the Kampala Central branch.",secretary.id]);
  }
}

module.exports = { pool, query, one, transaction, audit, initialize, ROLES };
