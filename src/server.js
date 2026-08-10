const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const projectRoot = path.resolve(__dirname,"..");
const { query, one, transaction, audit, initialize, ROLES } = require("./db");
const { officialMemberDepts, officialDeptCodes } = require("./official-department-roster");
const { getPrimaryCreditsOfficer, notifyCreditsVerificationQueue } = require("./credits-queue");
const { computeDepartmentPerformance, mergeDepartmentPerformance } = require("./department-performance");
const { sendReport } = require("./services/report-service");
const buildLoanApprovalHelpers = require("./loan-approval-helpers");
const {
  SECURITY_RATE,
  securityCapacity,
  isSavingsSecurity,
  selectedGuarantorCover,
  allocateGuarantorPledges
} = require("./loan-security");
const { getRunningLoan, getSavingsTargetStatus, getGuarantorEligibility } = require("./loan-eligibility");
let loanApprovals = null;
const getLoanApprovals = async () => {
  if (!loanApprovals) loanApprovals = await buildLoanApprovalHelpers({ query, one });
  return loanApprovals;
};

const app = express();
const port = Number(process.env.PORT || 3000);
const production = process.env.NODE_ENV === "production";
if (production && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
  throw new Error("JWT_SECRET must be set to a random value of at least 32 characters in production");
}
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(48).toString("hex");
const asyncRoute = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const publicDir=path.join(projectRoot,"public");
const uploadsDir=path.join(projectRoot,"storage","uploads");
fs.mkdirSync(uploadsDir,{recursive:true});
const allowedFileTypes=new Set([
  "image/jpeg","image/png","image/gif","image/webp","video/mp4","audio/mpeg","audio/ogg","audio/wav",
  "application/pdf","application/zip","application/x-zip-compressed","text/plain","text/csv",
  "application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint","application/vnd.openxmlformats-officedocument.presentationml.presentation"
]);
const upload=multer({
  storage:multer.diskStorage({
    destination:(req,file,cb)=>cb(null,uploadsDir),
    filename:(req,file,cb)=>cb(null,`${Date.now()}-${crypto.randomBytes(12).toString("hex")}${path.extname(file.originalname).toLowerCase().slice(0,10)}`)
  }),
  limits:{fileSize:15*1024*1024,files:5},
  fileFilter:(req,file,cb)=>allowedFileTypes.has(file.mimetype)?cb(null,true):cb(new Error("This file type is not allowed"))
});
const typingPresence=new Map();

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(express.json({ limit: "1mb" }));
app.use((req,res,next)=>{
  req.cookies=Object.fromEntries(String(req.headers.cookie||"").split(";").map(v=>v.trim().split("=")).filter(v=>v.length===2).map(([k,v])=>[decodeURIComponent(k),decodeURIComponent(v)]));
  res.set({
    "X-Content-Type-Options":"nosniff","X-Frame-Options":"DENY","Referrer-Policy":"same-origin",
    "Permissions-Policy":"camera=(), microphone=(), geolocation=()",
    "Content-Security-Policy":"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
    "Cache-Control":req.path.startsWith("/api/")?"no-store":"no-cache"
  });
  if(production)res.set("Strict-Transport-Security","max-age=31536000; includeSubDomains");
  next();
});
app.use((req,res,next)=>{
  if(!["POST","PUT","PATCH","DELETE"].includes(req.method))return next();
  const fetchSite=String(req.headers["sec-fetch-site"]||"").toLowerCase();
  if(fetchSite==="cross-site")return res.status(403).json({error:"Cross-site requests are not allowed"});
  const origin=req.headers.origin;
  if(origin) {
    try {
      if(new URL(origin).host!==req.get("host"))return res.status(403).json({error:"Request origin is not allowed"});
    } catch {
      return res.status(403).json({error:"Invalid request origin"});
    }
  }
  next();
});

const permissions = {
  Member:["self:read","loan:create","withdrawal:create","profile:update"],
  Auditor:["member:read","finance:read","transaction:read","loan:read","report:read","audit:read"],
  "System Admin":["system:manage","audit:read"],
  "Finance Officer":["dashboard:read","finance:read","transaction:create","transaction:verify","accounting:manage","report:read"],
  "Investment Officer":["dashboard:read","member:read","report:read"],
  "Credits Officer":["dashboard:read","member:read","transaction:read","transaction:create","loan:read","loan:manage","withdrawal:approve","withdrawal:process","report:read"],
  "Legal Officer":["dashboard:read","member:read","member:manage","document:manage","report:read"],
  "Welfare Officer":["dashboard:read","member:read","report:read"],
  "Executive Officer":["dashboard:read","member:read","loan:authorize","report:read","audit:read","announcement:manage","meeting:manage","document:manage","user:manage"],
  "Supervisory Officer":["dashboard:read","member:read","finance:read","transaction:read","loan:read","report:read","audit:read"]
};
const loginLimiter=asyncRoute(async(req,res,next)=>{
  const recent=await one(`SELECT COUNT(*)::int AS count FROM audit_logs
    WHERE action='LOGIN_FAILED' AND ip_address=$1 AND created_at>NOW()-INTERVAL '15 minutes'`,[req.ip]);
  if(Number(recent?.count||0)>=20)return res.status(429).json({error:"Too many failed login attempts. Try again later."});
  next();
});
const safeUser=`u.id,u.full_name,u.email,u.phone,u.role,u.branch_id,u.member_id,u.active,u.must_change_password,u.last_login,u.token_version,`+`(u.profile_photo_stored_name IS NOT NULL) AS has_profile_photo,b.name AS branch_name`;
const metadata=req=>({ip:req.ip,userAgent:String(req.headers["user-agent"]||"").slice(0,250)});
const strongPassword=p=>typeof p==="string"&&p.length>=8&&/[A-Z]/.test(p)&&/[a-z]/.test(p)&&/\d/.test(p)&&/[^A-Za-z0-9]/.test(p);
const generateTemporaryPassword=()=>`Aa1!${crypto.randomBytes(12).toString("base64url")}`;
const reference=prefix=>`${prefix}-${crypto.randomUUID().replaceAll("-","").slice(0,8).toUpperCase()}`;
const receiptReference=prefix=>reference(prefix);

function token(user) {
  return jwt.sign({sub:user.id,role:user.role,ver:Number(user.token_version||0)},JWT_SECRET,{expiresIn:"8h",issuer:"tujenge-sacco"});
}
const auth=asyncRoute(async(req,res,next)=>{
  try {
    const payload=jwt.verify(req.cookies.sacco_session,JWT_SECRET,{issuer:"tujenge-sacco"});
    const user=await one(`SELECT ${safeUser} FROM users u LEFT JOIN branches b ON b.id=u.branch_id WHERE u.id=$1`,[payload.sub]);
    if(!user||!user.active) return res.status(401).json({error:"Account is inactive"});
    if(Number(payload.ver||0)!==Number(user.token_version||0)) return res.status(401).json({error:"Session has been revoked. Please sign in again"});
    req.user=user; next();
  } catch { res.status(401).json({error:"Authentication required or session expired"}); }
});
function permit(...needed) {
  return (req,res,next)=>needed.some(p=>(permissions[req.user.role]||[]).includes(p))?next():res.status(403).json({error:"You do not have permission for this action"});
}
const hasPermission=(user,permission)=>(permissions[user.role]||[]).includes(permission);
const hasAnyPermission=(user,prefixes)=>(permissions[user.role]||[]).some(permission=>prefixes.some(prefix=>permission===prefix||permission.startsWith(`${prefix}:`)));
const memberFinancialRoles=new Set(["Member","Credits Officer","Auditor","Supervisory Officer","Executive Officer"]);
const memberIdentityRoles=new Set(["Member","Auditor","Supervisory Officer","Executive Officer"]);
async function canAccessLoanRecords(user) {
  if(user.role==="Member")return true;
  if(hasAnyPermission(user,["loan"])||hasPermission(user,"loan:authorize")||hasPermission(user,"approval:high")||hasPermission(user,"approval:delegated"))return true;
  return Boolean(await departmentPermission(user,"credits","view"));
}
const DEPARTMENT_WORKSPACE_ROLES={
  executive:"Executive Officer",finance:"Finance Officer",credits:"Credits Officer",
  investment:"Investment Officer",welfare:"Welfare Officer",legal:"Legal Officer",
  audit:"Auditor",supervisory:"Supervisory Officer"
};
function roleToDepartmentCode(role){
  return Object.entries(DEPARTMENT_WORKSPACE_ROLES).find(([,value])=>value===role)?.[0]||null;
}
async function buildAvailableWorkspaces(user){
  const workspaces=[];
  const seen=new Set();
  const push=(workspace)=>{
    const key=workspace.type==="member"?"member":`dept:${workspace.code}`;
    if(seen.has(key))return;
    seen.add(key);
    workspaces.push({
      ...workspace,
      permissions:permissions[workspace.role]||[]
    });
  };
  const assignments=(await query(`SELECT d.code,d.name,da.position_title AS "positionTitle",
    da.authority_level AS "authorityLevel",da.can_edit AS "canEdit",da.can_approve AS "canApprove",da.is_head AS "isHead"
    FROM departments d JOIN department_assignments da ON da.department_id=d.id
    WHERE da.user_id=$1 AND da.active=true AND da.can_view=true AND d.active=true
    ORDER BY d.sort_order`,[user.id])).rows;
  for(const row of assignments){
    const role=DEPARTMENT_WORKSPACE_ROLES[row.code];
    if(!role)continue;
    push({
      id:`dept:${row.code}`,type:"department",code:row.code,role,label:row.name,
      title:`${row.name} dashboard`,subtitle:row.positionTitle||role,
      level:Number(row.authorityLevel||1),canEdit:Boolean(row.canEdit),canApprove:Boolean(row.canApprove),
      isHead:Boolean(row.isHead),fromAssignment:true
    });
  }
  const primaryCode=roleToDepartmentCode(user.role);
  if(user.role&&user.role!=="Member"&&user.role!=="System Admin"){
    const assignedPrimary=assignments.find(a=>a.code===primaryCode);
    push({
      id:primaryCode?`dept:${primaryCode}`:`role:${user.role}`,
      type:"department",code:primaryCode||user.role.toLowerCase().replace(/\s+/g,"-"),
      role:user.role,label:assignedPrimary?.name||user.role.replace(/ Officer$/,""),
      title:`${assignedPrimary?.name||user.role.replace(/ Officer$/,"")} dashboard`,subtitle:"Primary account role",
      level:assignedPrimary?Number(assignedPrimary.authorityLevel||1):null,
      canEdit:true,canApprove:true,isHead:Boolean(assignedPrimary?.isHead),
      fromAssignment:Boolean(assignedPrimary),primary:true
    });
  }else if(user.role==="System Admin"){
    push({
      id:"role:system-admin",type:"department",code:"admin",role:"System Admin",label:"System Admin",
      title:"System administration",subtitle:"Primary account role",
      level:null,canEdit:true,canApprove:true,isHead:false,fromAssignment:false,primary:true
    });
  }
  if(user.member_id){
    push({
      id:"member",type:"member",code:"member",role:"Member",label:"Member account",
      title:"My Member Account",subtitle:"Savings, loans, shares and personal records",
      level:null,canEdit:true,canApprove:false,isHead:false,fromAssignment:false
    });
  }else if(user.role==="Member"){
    push({
      id:"member",type:"member",code:"member",role:"Member",label:"Member account",
      title:"My Member Account",subtitle:"Primary membership workspace",
      level:null,canEdit:true,canApprove:false,isHead:false,fromAssignment:false,primary:true
    });
  }
  // Prefer primary department first, then other departments, member last.
  workspaces.sort((a,b)=>{
    if(a.type==="member"&&b.type!=="member")return 1;
    if(b.type==="member"&&a.type!=="member")return -1;
    if(a.primary&&!b.primary)return -1;
    if(b.primary&&!a.primary)return 1;
    return String(a.label).localeCompare(String(b.label));
  });
  return workspaces;
}
async function organizationContext(user) {
  const organization=await one("SELECT id,name,code,description FROM organizations WHERE active=true ORDER BY id LIMIT 1");
  if(!organization) return null;
  let assignmentRows=(await query(`SELECT d.id,d.code,d.name,d.description,d.sort_order AS "sortOrder",
    da.position_title AS "positionTitle",da.authority_level AS "authorityLevel",da.can_view AS "canView",
    da.can_create AS "canCreate",da.can_edit AS "canEdit",da.can_approve AS "canApprove",da.is_head AS "isHead"
    FROM departments d JOIN department_assignments da ON da.department_id=d.id
    WHERE d.organization_id=$1 AND d.active=true AND da.user_id=$2 AND da.active=true AND da.can_view=true
    ORDER BY d.sort_order`,[organization.id,user.id])).rows;
  if(user.role==="Member"&&user.member_id) {
    assignmentRows=(await query(`SELECT d.id,d.code,d.name,d.description,d.sort_order AS "sortOrder",
      mdp.position_title AS "positionTitle",1 AS "authorityLevel",true AS "canView",false AS "canCreate",
      false AS "canEdit",false AS "canApprove",false AS "isHead"
      FROM departments d JOIN member_department_profiles mdp ON mdp.department_id=d.id
      WHERE d.organization_id=$1 AND d.active=true AND mdp.member_id=$2 AND mdp.status='active'
      ORDER BY d.sort_order`,[organization.id,user.member_id])).rows;
  }
  const leadership=(await query(`SELECT body,position_title AS "positionTitle",leadership_level AS "leadershipLevel",
    starts_on AS "startsOn",ends_on AS "endsOn" FROM leadership_assignments
    WHERE user_id=$1 AND active=true AND (ends_on IS NULL OR ends_on>=CURRENT_DATE) ORDER BY leadership_level DESC`,[user.id])).rows;
  return {...organization,departments:assignmentRows,leadership,workspaces:await buildAvailableWorkspaces(user)};
}
async function departmentPermission(user,code,action="view") {
  if(!["view","create","edit","approve"].includes(action)) return null;
  if(user.role==="Member"&&action==="view"&&user.member_id) return one(`SELECT d.id,d.code,d.name,d.description,1 AS authority_level
    FROM departments d JOIN member_department_profiles mdp ON mdp.department_id=d.id
    WHERE d.code=$1 AND mdp.member_id=$2 AND mdp.status='active'`,[code,user.member_id]);
  const assigned=await one(`SELECT d.id,d.code,d.name,d.description,da.position_title,da.authority_level,
    da.can_view,da.can_create,da.can_edit,da.can_approve,da.is_head
    FROM departments d JOIN department_assignments da ON da.department_id=d.id
    WHERE d.code=$1 AND da.user_id=$2 AND da.active=true AND da.can_${action}=true`,[code,user.id]);
  if(assigned) return assigned;
  // Executive may open any department dashboard read-only without operational write rights.
  if(user.role==="Executive Officer"&&action==="view") {
    const department=await one("SELECT id,code,name,description FROM departments WHERE code=$1",[code]);
    if(!department) return null;
    return {...department,position_title:"Executive oversight",authority_level:4,can_view:true,can_create:false,can_edit:false,can_approve:false,is_head:false};
  }
  return null;
}
function requireDepartment(action) {
  return asyncRoute(async(req,res,next)=>{
    const access=await departmentPermission(req.user,req.params.code,action);
    if(!access) return res.status(403).json({error:`Your assignment does not allow you to ${action} records in this department`});
    req.departmentAccess=access; next();
  });
}

app.post("/api/departments/:code/files",auth,requireDepartment("create"),upload.single("file"),asyncRoute(async(req,res)=>{
  if(!req.file)return res.status(400).json({error:"Choose a file to upload"});
  await audit({userId:req.user.id,action:"DEPARTMENT_FILE_UPLOADED",entityType:req.departmentAccess.code,
    entityId:req.file.filename,details:req.file.originalname,...metadata(req)});
  res.status(201).json({fileName:req.file.originalname,storedName:req.file.filename,mimeType:req.file.mimetype,size:req.file.size,
    url:`/api/departments/${encodeURIComponent(req.departmentAccess.code)}/files/${encodeURIComponent(req.file.filename)}`});
}));
app.get("/api/departments/:code/files/:storedName",auth,requireDepartment("view"),asyncRoute(async(req,res)=>{
  const storedName=path.basename(String(req.params.storedName||""));
  if(!/^[a-zA-Z0-9._-]+$/.test(storedName))return res.status(400).json({error:"Invalid file name"});
  const filePath=path.join(uploadsDir,storedName);
  if(!fs.existsSync(filePath))return res.status(404).json({error:"File not found"});
  res.set("Content-Disposition",`inline; filename="${storedName.replace(/["\\]/g,"")}"`);
  res.sendFile(filePath);
}));

app.get("/api/health",asyncRoute(async(req,res)=>{
  await query("SELECT 1");
  res.json({status:"ok",service:"organization-management",time:new Date().toISOString()});
}));
app.post("/api/auth/login",loginLimiter,asyncRoute(async(req,res)=>{
  const email=String(req.body.email||"").trim().toLowerCase(), password=String(req.body.password||"");
  const user=await one(`SELECT u.* FROM users u
    LEFT JOIN members m ON m.id=u.member_id
    WHERE LOWER(u.email)=$1 OR LOWER(COALESCE(m.email,''))=$1
    ORDER BY CASE WHEN LOWER(u.email)=$1 THEN 0 ELSE 1 END
    LIMIT 1`,[email]);
  if(!user) { await audit({action:"LOGIN_FAILED",details:`Unknown account: ${email}`,...metadata(req)}); return res.status(401).json({error:"Invalid email or password"}); }
  if(!user.active) return res.status(403).json({error:"This account has been deactivated"});
  if(user.locked_until&&new Date(user.locked_until)>new Date()) return res.status(423).json({error:"Account temporarily locked. Try again later."});
  if(!(await bcrypt.compare(password,user.password_hash))) {
    const attempts=user.failed_attempts+1, lock=attempts>=5?new Date(Date.now()+15*60000):null;
    await query("UPDATE users SET failed_attempts=$1,locked_until=$2 WHERE id=$3",[attempts>=5?0:attempts,lock,user.id]);
    await audit({userId:user.id,action:"LOGIN_FAILED",details:`Failed attempt ${attempts}`,...metadata(req)});
    return res.status(401).json({error:attempts>=5?"Account locked for 15 minutes":"Invalid email or password"});
  }
  await query("UPDATE users SET failed_attempts=0,locked_until=NULL,last_login=NOW() WHERE id=$1",[user.id]);
  audit({userId:user.id,action:"LOGIN",details:"Successful login",...metadata(req)}).catch(()=>{});
  const safeUser={id:user.id,email:user.email,full_name:user.full_name,role:user.role,member_id:user.member_id,must_change_password:user.must_change_password,has_profile_photo:Boolean(user.profile_photo_stored_name)};
  const workspaces=await buildAvailableWorkspaces(user);
  res.cookie("sacco_session",token(user),{httpOnly:true,sameSite:"strict",secure:production,maxAge:8*60*60*1000,path:"/"});
  res.json({ok:true,user:safeUser,permissions:permissions[user.role]||[],workspaces});
}));
app.post("/api/auth/logout",auth,asyncRoute(async(req,res)=>{
  await audit({userId:req.user.id,action:"LOGOUT",details:"User signed out",...metadata(req)});
  res.clearCookie("sacco_session",{path:"/"}); res.json({ok:true});
}));
app.get("/api/auth/me",auth,asyncRoute(async(req,res)=>{
  res.json({user:req.user,permissions:permissions[req.user.role]||[],workspaces:await buildAvailableWorkspaces(req.user)});
}));
app.get("/api/auth/workspaces",auth,asyncRoute(async(req,res)=>{
  res.json({workspaces:await buildAvailableWorkspaces(req.user)});
}));
app.post("/api/auth/change-password",auth,asyncRoute(async(req,res)=>{
  const row=await one("SELECT password_hash FROM users WHERE id=$1",[req.user.id]);
  if(!(await bcrypt.compare(String(req.body.currentPassword||""),row.password_hash))) return res.status(400).json({error:"Current password is incorrect"});
  if(!strongPassword(req.body.newPassword)) return res.status(400).json({error:"Use 8+ characters with uppercase, lowercase, number and symbol"});
  await query("UPDATE users SET password_hash=$1,must_change_password=false,token_version=token_version+1 WHERE id=$2",[await bcrypt.hash(req.body.newPassword,12),req.user.id]);
  await audit({userId:req.user.id,action:"PASSWORD_CHANGED",entityType:"user",entityId:String(req.user.id),...metadata(req)});
  res.clearCookie("sacco_session",{path:"/"});
  res.json({ok:true,reauthenticate:true});
}));

app.get("/api/bootstrap",auth,asyncRoute(async(req,res)=>{
  const memberId=req.user.role==="Member"?req.user.member_id:null;
  const memberFilter=memberId?"WHERE m.id=$1 AND m.deleted_at IS NULL":"WHERE m.deleted_at IS NULL", args=memberId?[memberId]:[];
  const userPermissions=permissions[req.user.role]||[];
  const allowed=p=>userPermissions.includes(p);
  const canSeeTransactions=req.user.role==="Finance Officer"?false:req.user.role==="Member"||
    ["finance:read","transaction:read","transaction:create","transaction:verify","accounting:manage","receipt:print"].some(allowed);
  const canSeeLoans=req.user.role==="Member"||userPermissions.some(p=>p.startsWith("loan:"))||["approval:high","approval:delegated"].some(allowed);
  const canSeeWithdrawals=req.user.role==="Member"||userPermissions.some(p=>p.startsWith("withdrawal:"))||allowed("finance:read");
  const needsMemberDirectory=["Executive Officer","Credits Officer","Finance Officer","System Admin","Investment Officer"].includes(req.user.role)||req.user.role==="Member";
  const empty={rows:[]};
  const [membersResult,txResult,loansResult,withdrawalsResult,productsResult,settingsResult,announcementsResult,notificationsResult,unreadResult,guarantorRequestsResult]=await Promise.all([
    needsMemberDirectory?query(`SELECT m.id AS "databaseId",m.member_number AS id,m.full_name AS name,m.email,CASE WHEN m.provisional THEN NULL ELSE m.phone END AS phone,CASE WHEN m.provisional THEN NULL ELSE m.national_id END AS national_id,m.occupation,m.employer,m.address,m.next_of_kin,
      m.savings_balance::float AS savings,m.share_capital::float AS shares,m.dividends::float,m.fines::float,m.status,m.joined_at AS joined,b.name AS branch
      FROM members m LEFT JOIN branches b ON b.id=m.branch_id ${memberFilter} ORDER BY m.id DESC`,args):Promise.resolve(empty),
    canSeeTransactions?query(`SELECT t.id AS "databaseId",t.reference AS id,t.type,t.method,t.amount::float,t.status,t.external_reference,t.created_at AS date,
      m.id AS "memberId",m.member_number,m.full_name AS member,u.full_name AS "recordedBy"
      FROM transactions t JOIN members m ON m.id=t.member_id JOIN users u ON u.id=t.recorded_by ${memberId?"WHERE m.id=$1":""} ORDER BY t.id DESC LIMIT 250`,args):Promise.resolve(empty),
    canSeeLoans?query(`SELECT l.id AS "databaseId",l.reference AS id,l.amount::float,l.balance::float,l.term_months AS "termMonths",
      COALESCE((SELECT SUM(s.total_due) FROM loan_repayment_schedule s WHERE s.loan_id=l.id),
        ROUND((l.amount+(l.amount*(p.annual_rate/1200.0)*(l.term_months+1)/2.0))::numeric,2))::float AS "totalDue",
      COALESCE((SELECT SUM(s.paid_amount) FROM loan_repayment_schedule s WHERE s.loan_id=l.id),0)::float AS "totalPaid",l.purpose,l.status,l.created_at AS date,l.due_date AS "dueDate",
      m.id AS "memberId",m.full_name AS member,m.member_number,p.name AS product,p.annual_rate::float AS "annualRate",
      gm.full_name AS guarantor,l.officer_comment AS "officerComment",l.committee_comment AS "committeeComment",l.executive_comment AS "executiveComment",
      l.savings_at_application::float AS "savingsAtApplication",l.existing_loan_balance::float AS "existingLoanBalance",
      l.eligibility_result AS "eligibilityResult",l.verified_amount::float AS "verifiedAmount",
      l.finance_comment AS "financeComment",d.status AS "disbursementStatus",
      (SELECT MIN(s.due_date) FROM loan_repayment_schedule s WHERE s.loan_id=l.id AND s.status<>'paid') AS "nextRepaymentDate",
      COALESCE((SELECT json_agg(json_build_object('id',lg.id,'memberId',lg.member_id,'name',guarantor.full_name,'status',lg.status,'note',lg.response_note))
        FROM loan_guarantors lg JOIN members guarantor ON guarantor.id=lg.member_id WHERE lg.loan_id=l.id),'[]') AS guarantors
      FROM loans l JOIN members m ON m.id=l.member_id JOIN loan_products p ON p.id=l.product_id LEFT JOIN members gm ON gm.id=l.guarantor_member_id
      LEFT JOIN loan_disbursements d ON d.loan_id=l.id
      ${memberId?"WHERE m.id=$1":""} ORDER BY l.id DESC`,args):Promise.resolve(empty),
    canSeeWithdrawals?query(`SELECT w.id AS "databaseId",w.reference AS id,w.amount::float,w.method,w.reason,w.status,w.created_at AS date,m.id AS "memberId",m.full_name AS member,m.member_number
      FROM withdrawals w JOIN members m ON m.id=w.member_id ${memberId?"WHERE m.id=$1":""} ORDER BY w.id DESC`,args):Promise.resolve(empty),
    query(`SELECT id,name,annual_rate::float AS "annualRate",max_term AS "maxTerm",max_multiplier::float AS "maxMultiplier",
      max_amount::float AS "maxAmount",processing_fee_rate::float AS "processingFeeRate",late_penalty_rate::float AS "latePenaltyRate",
      minimum_guarantors AS "minimumGuarantors",maximum_guarantors AS "maximumGuarantors",interest_method AS "interestMethod",policy_reference AS "policyReference"
      FROM loan_products WHERE active=true`),
    query("SELECT key,value FROM settings"),
    query(`SELECT a.id,a.title,a.body,a.created_at AS date,u.full_name AS author FROM announcements a JOIN users u ON u.id=a.created_by ORDER BY a.id DESC LIMIT 10`),
    query("SELECT * FROM notifications WHERE user_id=$1 OR member_id=$2 ORDER BY id DESC LIMIT 30",[req.user.id,req.user.member_id||-1]),
    query(`SELECT COUNT(*)::int AS count FROM messages msg
      JOIN conversation_members cm ON cm.conversation_id=msg.conversation_id AND cm.user_id=$1
      WHERE msg.sender_id<>$1 AND msg.deleted_at IS NULL
      AND NOT EXISTS (SELECT 1 FROM message_reads mr WHERE mr.message_id=msg.id AND mr.user_id=$1)`,[req.user.id]),
    req.user.member_id?query(`SELECT l.id AS "databaseId",l.reference AS id,l.amount::float,l.term_months AS "termMonths",
      l.purpose,l.status,p.name AS product,borrower.full_name AS member,borrower.savings_balance::float AS "borrowerSavings",
      lg.id AS "guarantorRequestId",lg.status AS "guarantorStatus",lg.response_note AS "responseNote"
      FROM loan_guarantors lg JOIN loans l ON l.id=lg.loan_id JOIN members borrower ON borrower.id=l.member_id
      JOIN loan_products p ON p.id=l.product_id WHERE lg.member_id=$1 ORDER BY lg.id DESC`,[req.user.member_id]):Promise.resolve(empty)
  ]);
  const canSeeMemberFinancials=memberFinancialRoles.has(req.user.role);
  const canSeeMemberIdentity=memberIdentityRoles.has(req.user.role);
  const canSeeMemberExtended=memberFinancialRoles.has(req.user.role)||memberIdentityRoles.has(req.user.role);
  const safeMembers=membersResult.rows.map(member=>{
    const result={...member};
    if(!canSeeMemberFinancials)for(const field of ["savings","shares","dividends","fines"])delete result[field];
    if(!canSeeMemberIdentity)delete result.national_id;
    if(!canSeeMemberExtended)for(const field of ["occupation","employer","address","next_of_kin"])delete result[field];
    return result;
  });
  let auditRows=[];
  if((permissions[req.user.role]||[]).includes("audit:read")) auditRows=(await query(`SELECT a.id,a.action,a.entity_type AS "entityType",a.entity_id AS "entityId",a.details,a.ip_address AS ip,a.created_at AS time,
    COALESCE(u.full_name,'System') AS actor,COALESCE(u.role,'System') AS role FROM audit_logs a LEFT JOIN users u ON u.id=a.user_id ORDER BY a.id DESC LIMIT 300`)).rows;
  res.json({user:req.user,permissions:permissions[req.user.role]||[],roles:ROLES,organization:await organizationContext(req.user),workspaces:await buildAvailableWorkspaces(req.user),members:safeMembers,transactions:txResult.rows,loans:loansResult.rows,
    withdrawals:withdrawalsResult.rows,products:productsResult.rows,settings:Object.fromEntries(settingsResult.rows.map(s=>[s.key,s.value==="true"?true:s.value==="false"?false:s.value])),
    announcements:announcementsResult.rows,notifications:notificationsResult.rows,unreadMessages:unreadResult.rows[0].count,
    guarantorRequests:guarantorRequestsResult.rows,audit:auditRows});
}));

app.get("/api/organization/departments/:code",auth,requireDepartment("view"),asyncRoute(async(req,res)=>{
  const department=req.departmentAccess;
  const visibility=Number(department.authority_level||1);
  const [activities,memberCount,staff,finance,welfare,investments,meetings,governance]=await Promise.all([
    query(`SELECT a.id,a.reference,a.activity_type AS "activityType",a.title,a.description,a.amount::float,a.status,
      a.visibility_level AS "visibilityLevel",a.created_at AS "createdAt",creator.full_name AS "createdBy",
      approver.full_name AS "approvedBy" FROM department_activities a
      JOIN users creator ON creator.id=a.created_by LEFT JOIN users approver ON approver.id=a.approved_by
      WHERE a.department_id=$1 AND a.visibility_level<=$2 ORDER BY a.id DESC LIMIT 100`,[department.id,visibility]),
    query("SELECT COUNT(*)::int AS count FROM member_department_profiles WHERE department_id=$1 AND status='active'",[department.id]),
    query(`SELECT u.full_name AS name,da.position_title AS position,da.authority_level AS level,da.is_head AS "isHead"
      FROM department_assignments da JOIN users u ON u.id=da.user_id
      WHERE da.department_id=$1 AND da.active=true ORDER BY da.authority_level DESC,u.full_name`,[department.id]),
    department.code==="finance"?query(`SELECT reference,entry_type AS "entryType",category,description,amount::float,status,created_at AS "createdAt"
      FROM organization_finance_entries WHERE department_id=$1 ORDER BY id DESC LIMIT 50`,[department.id]):Promise.resolve({rows:[]}),
    department.code==="welfare"?query(`SELECT w.reference,m.full_name AS member,w.request_type AS "requestType",w.description,w.amount::float,w.status,w.created_at AS "createdAt"
      FROM welfare_requests w JOIN members m ON m.id=w.member_id ORDER BY w.id DESC LIMIT 50`):Promise.resolve({rows:[]}),
    department.code==="investment"?query(`SELECT reference,name,description,target_amount::float AS "targetAmount",
      raised_amount::float AS "raisedAmount",status,starts_on AS "startsOn",ends_on AS "endsOn" FROM investment_projects ORDER BY id DESC LIMIT 50`):Promise.resolve({rows:[]}),
    department.code==="executive"?query(`SELECT reference,title,meeting_type AS "meetingType",agenda,venue,scheduled_at AS "scheduledAt",status
      FROM organization_meetings WHERE department_id=$1 OR department_id IS NULL ORDER BY scheduled_at DESC LIMIT 50`,[department.id]):Promise.resolve({rows:[]}),
    department.code==="supervisory"?query(`SELECT reference,record_type AS "recordType",title,description,severity,status,visibility_level AS "visibilityLevel",
      created_at AS "createdAt" FROM governance_records WHERE department_id=$1 AND visibility_level<=$2 ORDER BY id DESC LIMIT 50`,[department.id,visibility]):Promise.resolve({rows:[]})
  ]);
  res.json({department:{id:department.id,code:department.code,name:department.name,description:department.description},
    access:{positionTitle:department.position_title||"Member",authorityLevel:visibility,canCreate:Boolean(department.can_create),
      canEdit:Boolean(department.can_edit),canApprove:Boolean(department.can_approve),isHead:Boolean(department.is_head)},
    summary:{activities:activities.rows.length,members:memberCount.rows[0].count,staff:staff.rows.length,pending:activities.rows.filter(a=>!["approved","completed","closed"].includes(a.status)).length},
    activities:activities.rows,staff:staff.rows,finance:finance.rows,welfare:welfare.rows,investments:investments.rows,
    meetings:meetings.rows,governance:governance.rows});
}));

app.post("/api/organization/departments/:code/activities",auth,requireDepartment("create"),asyncRoute(async(req,res)=>{
  const b=req.body,title=String(b.title||"").trim(),activityType=String(b.activityType||"general").trim();
  if(!title) return res.status(400).json({error:"Activity title is required"});
  const visibility=Math.max(1,Math.min(Number(b.visibilityLevel||1),Number(req.departmentAccess.authority_level)));
  const row=await one(`INSERT INTO department_activities
    (department_id,reference,activity_type,title,description,amount,status,visibility_level,created_by)
    VALUES ($1,$2,$3,$4,$5,$6,'draft',$7,$8) RETURNING id,reference`,
  [req.departmentAccess.id,reference("ACT"),activityType,title,String(b.description||"").trim()||null,
    b.amount?Number(b.amount):null,visibility,req.user.id]);
  await audit({userId:req.user.id,action:"DEPARTMENT_ACTIVITY_CREATED",entityType:req.departmentAccess.code,
    entityId:String(row.id),details:title,...metadata(req)});
  res.status(201).json(row);
}));

app.post("/api/organization/departments/:code/activities/:id/decision",auth,requireDepartment("approve"),asyncRoute(async(req,res)=>{
  const decision=String(req.body.decision||"").toLowerCase();
  if(!["approved","rejected"].includes(decision)) return res.status(400).json({error:"Decision must be approved or rejected"});
  const row=await one(`UPDATE department_activities SET status=$1,approved_by=$2,approved_at=NOW(),updated_at=NOW()
    WHERE id=$3 AND department_id=$4 AND visibility_level<=$5 RETURNING id,title`,
  [decision,req.user.id,req.params.id,req.departmentAccess.id,req.departmentAccess.authority_level]);
  if(!row) return res.status(404).json({error:"Activity was not found or is above your authority level"});
  await audit({userId:req.user.id,action:`DEPARTMENT_ACTIVITY_${decision.toUpperCase()}`,entityType:req.departmentAccess.code,
    entityId:String(row.id),details:row.title,...metadata(req)});
  res.json({ok:true});
}));

function requireExecutive(action="view") {
  return asyncRoute(async(req,res,next)=>{
    const access=await departmentPermission(req.user,"executive",action);
    if(!access||Number(access.authority_level)<4) return res.status(403).json({error:"Executive level-4 authority is required"});
    req.executiveAccess=access;next();
  });
}
app.get("/api/executive/command-center",auth,requireExecutive("view"),asyncRoute(async(req,res)=>{
  const level=Number(req.executiveAccess.authority_level);  const fiscalYearRows=(await query(`SELECT EXTRACT(YEAR FROM ends_on)::int AS year,fiscal_year_label AS label
    FROM member_financial_year_policies
    UNION
    SELECT fiscal_year AS year,'FY ended '||to_char(period_end,'DD Mon YYYY') AS label FROM financial_reporting_periods
    ORDER BY year DESC`)).rows;
  const availableFiscalYears=fiscalYearRows.map(row=>({year:Number(row.year),label:row.label}));
  const defaultFiscalYear=Number((await one(`SELECT EXTRACT(YEAR FROM ends_on)::int AS year
    FROM member_financial_year_policies WHERE status='active' ORDER BY ends_on DESC LIMIT 1`))?.year||availableFiscalYears[0]?.year||new Date().getFullYear());
  const requestedFiscalYear=Number(req.query.fy);
  const selectedFiscalYear=availableFiscalYears.some(row=>row.year===requestedFiscalYear)?requestedFiscalYear:defaultFiscalYear;
  const [memberStats,departments,approvals,financeTotals,savings,loanStats,investments,welfare,legal,auditIssues,supervisory,meetings,
    activities,documents,financeEntries,welfareRequests,governanceRows,approvalHistory]=await Promise.all([
    query(`SELECT COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status='active')::int AS active,
      COUNT(*) FILTER (WHERE joined_at>=date_trunc('month',CURRENT_DATE))::int AS new_this_month
      FROM members WHERE deleted_at IS NULL`),
    query(`SELECT d.id,d.code,d.name,d.description,d.sort_order AS "sortOrder",
      COUNT(da.id)::int AS staff FROM departments d LEFT JOIN department_assignments da ON da.department_id=d.id AND da.active=true
      WHERE d.active=true GROUP BY d.id ORDER BY d.sort_order`),
    query(`SELECT a.id,a.reference,a.activity_type AS "activityType",a.title,a.description,a.amount::float,a.status,
      a.visibility_level AS "visibilityLevel",a.created_at AS "createdAt",d.code AS "departmentCode",d.name AS department,
      creator.full_name AS "createdBy",assignee.full_name AS "assignedTo"
      FROM department_activities a JOIN departments d ON d.id=a.department_id
      JOIN users creator ON creator.id=a.created_by LEFT JOIN users assignee ON assignee.id=a.assigned_to
      WHERE a.status IN ('pending_executive','in_review') AND a.visibility_level<=$1
      ORDER BY CASE WHEN a.status='pending_executive' THEN 0 ELSE 1 END,a.id DESC LIMIT 30`,[level]),
    query(`SELECT COALESCE(SUM(amount) FILTER (WHERE entry_type='income' AND status IN ('approved','completed')),0)::float AS income,
      COALESCE(SUM(amount) FILTER (WHERE entry_type='expense' AND status IN ('approved','completed')),0)::float AS expenditure,
      COALESCE(SUM(amount) FILTER (WHERE entry_type='expense' AND status IN ('pending','pending_finance_review')),0)::float AS pending_payments
      FROM organization_finance_entries`),
    query("SELECT COALESCE(SUM(savings_balance),0)::float AS total FROM members WHERE deleted_at IS NULL"),
    query(`SELECT COUNT(*) FILTER (WHERE status='active')::int AS active,
      COUNT(*) FILTER (WHERE due_date=CURRENT_DATE AND status='active')::int AS due_today,
      COUNT(*) FILTER (WHERE status='overdue')::int AS defaults,
      COALESCE(SUM(balance) FILTER (WHERE status IN ('active','overdue')),0)::float AS outstanding,
      COALESCE(SUM(amount) FILTER (WHERE status IN ('active','overdue','completed')),0)::float AS issued,
      COALESCE(SUM(amount-balance) FILTER (WHERE status IN ('active','overdue','completed')),0)::float AS recovered
      FROM loans`),
    query(`SELECT COUNT(*) FILTER (WHERE status IN ('active','running'))::int AS running,
      COUNT(*) FILTER (WHERE performance_status='profitable')::int AS profitable,
      COUNT(*) FILTER (WHERE performance_status IN ('losing','watch'))::int AS losing,
      COALESCE(SUM(current_value),0)::float AS current_value,COALESCE(SUM(expected_return),0)::float AS expected_return,
      COALESCE(SUM(raised_amount),0)::float AS invested FROM investment_projects`),
    query(`SELECT COUNT(*) FILTER (WHERE status='submitted')::int AS pending,
      COUNT(*) FILTER (WHERE status='approved')::int AS approved,
      COALESCE(SUM(amount) FILTER (WHERE status='approved'),0)::float AS approved_amount FROM welfare_requests`),
    query(`SELECT
      (SELECT COUNT(*) FROM legal_cases WHERE status NOT IN ('resolved','closed'))::int AS open_cases,
      (SELECT COUNT(*) FROM legal_contracts WHERE status IN ('draft','submitted','under_review','information_requested'))::int AS contracts,
      (SELECT COUNT(*) FROM legal_policies WHERE status IN ('draft','under_review','amendment_required'))::int AS policies,
      (SELECT COUNT(*) FROM legal_compliance WHERE status IN ('action_required','non_compliant'))::int AS alerts`),
    query(`SELECT
      COUNT(*) FILTER (WHERE status NOT IN ('resolved','closed'))::int AS open,
      COUNT(*) FILTER (WHERE status IN ('resolved','closed'))::int AS resolved
      FROM audit_findings`),
    query(`SELECT
      COUNT(*) FILTER (WHERE status NOT IN ('implemented','closed'))::int AS recommendations,
      (SELECT COUNT(*) FROM supervisory_followups WHERE status NOT IN ('completed','closed'))::int AS followups
      FROM supervisory_recommendations`),
    query(`SELECT m.id,m.reference,m.title,m.meeting_type AS "meetingType",m.agenda,m.venue,m.scheduled_at AS "scheduledAt",
      m.status,d.name AS department FROM organization_meetings m LEFT JOIN departments d ON d.id=m.department_id
      WHERE m.scheduled_at>=NOW() AND m.visibility_level<=$1 ORDER BY m.scheduled_at LIMIT 20`,[level]),
    query(`SELECT a.id,a.reference,a.activity_type AS "activityType",a.title,a.description,a.status,a.created_at AS "createdAt",
      d.code AS "departmentCode",d.name AS department,u.full_name AS "createdBy"
      FROM department_activities a JOIN departments d ON d.id=a.department_id JOIN users u ON u.id=a.created_by
      WHERE a.visibility_level<=$1 ORDER BY a.updated_at DESC LIMIT 30`,[level]),
    query(`SELECT doc.id,doc.reference,doc.document_type AS "documentType",doc.title,doc.version,doc.status,doc.visibility_level AS "visibilityLevel",doc.file_name AS "fileName",
      doc.updated_at AS "updatedAt",d.name AS department,u.full_name AS "createdBy",
      EXISTS(SELECT 1 FROM organization_document_versions v WHERE v.document_id=doc.id) AS "hasFile"
      FROM organization_documents doc LEFT JOIN departments d ON d.id=doc.department_id JOIN users u ON u.id=doc.created_by
      WHERE doc.visibility_level<=$1 AND doc.status<>'archived' ORDER BY doc.updated_at DESC`,[level]),
    query(`SELECT f.id,f.reference,f.entry_type AS "entryType",f.category,f.description,f.amount::float,f.status,
      f.created_at AS "createdAt",d.name AS department FROM organization_finance_entries f JOIN departments d ON d.id=f.department_id
      ORDER BY f.id DESC LIMIT 30`),
    query(`SELECT w.id,w.reference,m.full_name AS member,w.request_type AS "requestType",w.description,w.amount::float,w.status,
      w.created_at AS "createdAt" FROM welfare_requests w JOIN members m ON m.id=w.member_id ORDER BY w.id DESC LIMIT 30`),
    query(`SELECT g.id,g.reference,g.record_type AS "recordType",g.title,g.description,g.severity,g.status,g.created_at AS "createdAt",
      d.code AS "departmentCode",d.name AS department FROM governance_records g JOIN departments d ON d.id=g.department_id
      WHERE g.visibility_level<=$1 ORDER BY g.id DESC LIMIT 50`,[level]),
    query(`SELECT a.id,a.reference,a.activity_type AS "activityType",a.title,a.description,a.amount::float,a.status,
      a.visibility_level AS "visibilityLevel",a.created_at AS "createdAt",a.decision_at AS "decisionAt",
      a.decision_comment AS "decisionComment",d.code AS "departmentCode",d.name AS department,
      creator.full_name AS "createdBy",decision_user.full_name AS "decisionBy",assignee.full_name AS "assignedTo"
      FROM department_activities a JOIN departments d ON d.id=a.department_id
      JOIN users creator ON creator.id=a.created_by
      LEFT JOIN users decision_user ON decision_user.id=a.decision_by
      LEFT JOIN users assignee ON assignee.id=a.assigned_to
      WHERE a.activity_type IN ('finance-budget','finance-payment','investment-proposal','welfare-request','legal-contract','large-loan','policy')
      AND a.status IN ('approved','rejected','information_requested') AND a.visibility_level<=$1
      ORDER BY COALESCE(a.decision_at,a.approved_at,a.updated_at) DESC,a.id DESC LIMIT 200`,[level])
  ]);
  const executiveLoanApprovalsRaw=(await query(`SELECT l.id,l.id AS "loanId",l.reference,
      'loan' AS "recordType",'large-loan' AS "activityType",
      ('Loan authorization - '||CASE WHEN NULLIF(l.custom_product_name,'') IS NOT NULL THEN p.name||' ('||l.custom_product_name||')' ELSE p.name END) AS title,
      (m.full_name||' requested UGX '||to_char(l.amount,'FM999,999,999,990')) AS description,
      l.amount::float,l.processing_fee::float AS "processingFee",l.status,l.created_at AS "createdAt",
      4 AS "visibilityLevel",'credits' AS "departmentCode",
      'Credits (SACCO)' AS department,creator.full_name AS "createdBy",
      NULL::text AS "assignedTo",l.custom_product_name AS "customProductName",
      CASE WHEN NULLIF(l.custom_product_name,'') IS NOT NULL THEN p.name||' ('||l.custom_product_name||')' ELSE p.name END AS product
      FROM loans l JOIN members m ON m.id=l.member_id
      JOIN loan_products p ON p.id=l.product_id
      LEFT JOIN users creator ON creator.id=COALESCE(l.recommended_by,l.committee_approved_by)
      WHERE l.status='executive-authorization' ORDER BY l.id DESC LIMIT 30`)).rows;
  const executiveLoanHistoryRaw=(await query(`SELECT l.id,l.id AS "loanId",l.reference,
      'loan' AS "recordType",'large-loan' AS "activityType",
      ('Loan authorization - '||CASE WHEN NULLIF(l.custom_product_name,'') IS NOT NULL THEN p.name||' ('||l.custom_product_name||')' ELSE p.name END) AS title,
      (m.full_name||' requested UGX '||to_char(l.amount,'FM999,999,999,990')) AS description,
      l.amount::float,l.processing_fee::float AS "processingFee",
      CASE
        WHEN l.status IN ('ready-disbursement','active','overdue','completed','closed') THEN 'approved'
        WHEN l.status='rejected' THEN 'rejected'
        ELSE l.status
      END AS status,
      l.created_at AS "createdAt",
      COALESCE(l.authorized_at,l.disbursed_at,l.created_at) AS "decisionAt",
      authorizer.full_name AS "decisionBy",
      l.executive_comment AS "decisionComment",
      4 AS "visibilityLevel",'credits' AS "departmentCode",
      'Credits (SACCO)' AS department,creator.full_name AS "createdBy",
      NULL::text AS "assignedTo",m.full_name AS member,
      CASE WHEN NULLIF(l.custom_product_name,'') IS NOT NULL THEN p.name||' ('||l.custom_product_name||')' ELSE p.name END AS product
      FROM loans l JOIN members m ON m.id=l.member_id
      JOIN loan_products p ON p.id=l.product_id
      LEFT JOIN users creator ON creator.id=COALESCE(l.recommended_by,l.committee_approved_by)
      LEFT JOIN users authorizer ON authorizer.id=l.authorized_by
      WHERE l.status IN ('ready-disbursement','active','overdue','completed','closed','rejected')
        AND EXISTS (SELECT 1 FROM loan_stage_votes v WHERE v.loan_id=l.id)
      ORDER BY COALESCE(l.authorized_at,l.disbursed_at,l.created_at) DESC LIMIT 100`)).rows;
  const helpers=await getLoanApprovals();
  const executiveLoanApprovals=await helpers.attachLoanApprovalMeta(executiveLoanApprovalsRaw, req.user.id);
  approvals.rows.push(...executiveLoanApprovals);
  approvalHistory.rows.push(...executiveLoanHistoryRaw);  const finance=financeTotals.rows[0],loans=loanStats.rows[0],investment=investments.rows[0];
  const historicalFinance=await one(`SELECT
    MAX(current_amount) FILTER (WHERE line_code='total_income')::float AS income,
    MAX(current_amount) FILTER (WHERE line_code='total_operating_expenses')::float AS expenditure,
    MAX(current_amount) FILTER (WHERE line_code='cash_bank')::float AS "cashBank",
    MAX(current_amount) FILTER (WHERE line_code='total_assets')::float AS "totalAssets",
    MAX(current_amount) FILTER (WHERE line_code='total_liabilities')::float AS "totalLiabilities"
    FROM financial_statement_lines l JOIN financial_reporting_periods p ON p.id=l.period_id WHERE p.fiscal_year=$1`,[selectedFiscalYear]);
  if(selectedFiscalYear!==defaultFiscalYear&&historicalFinance?.income!=null){finance.income=Number(historicalFinance.income);finance.expenditure=Number(historicalFinance.expenditure);finance.pending_payments=0;}
  if(selectedFiscalYear===defaultFiscalYear){
    const cumulativeOpeningFinance=await one(`SELECT
      MAX(l.current_amount) FILTER (WHERE l.line_code='total_income')::float AS income,
      MAX(l.current_amount) FILTER (WHERE l.line_code='total_operating_expenses')::float AS expenditure
      FROM financial_statement_lines l JOIN financial_reporting_periods p ON p.id=l.period_id
      WHERE p.fiscal_year=(SELECT MAX(fiscal_year) FROM financial_reporting_periods WHERE fiscal_year<$1)`,[defaultFiscalYear]);
    finance.income=Number(finance.income||0)+Number(cumulativeOpeningFinance?.income||0);
    finance.expenditure=Number(finance.expenditure||0)+Number(cumulativeOpeningFinance?.expenditure||0);
  }
  const investmentProjects=(await query(`SELECT p.id,p.reference,p.name,p.description,p.category,p.location,
    p.target_amount::float AS "targetAmount",p.raised_amount::float AS "raisedAmount",
    p.current_value::float AS "currentValue",p.expected_return::float AS "expectedReturn",
    p.status,p.executive_status AS "executiveStatus",p.performance_status AS "performanceStatus",
    p.starts_on AS "startsOn",p.ends_on AS "endsOn",p.manager_name AS manager,p.funding_source AS "fundingSource",
    p.progress,p.photo_url AS "photoUrl",p.supporting_document AS "supportingDocument",
    proposal.reference AS "proposalReference",
    COALESCE(SUM(t.amount) FILTER (WHERE t.transaction_type='revenue' AND t.deleted_at IS NULL),0)::float AS revenue,
    COALESCE(SUM(t.amount) FILTER (WHERE t.transaction_type='expense' AND t.deleted_at IS NULL),0)::float AS expenses,
    (COALESCE(SUM(t.amount) FILTER (WHERE t.transaction_type='revenue' AND t.deleted_at IS NULL),0)-
      COALESCE(SUM(t.amount) FILTER (WHERE t.transaction_type='expense' AND t.deleted_at IS NULL),0))::float AS profit
    FROM investment_projects p
    LEFT JOIN investment_proposals proposal ON proposal.id=p.proposal_id
    LEFT JOIN investment_transactions t ON t.project_id=p.id
    WHERE p.status<>'archived'
    GROUP BY p.id,proposal.reference ORDER BY p.id DESC`)).rows;
  const recentLoans=(await query(`SELECT l.id,l.reference,m.full_name AS member,p.name AS product,l.amount::float,l.balance::float,
    l.status,l.term_months AS "termMonths",l.created_at AS "createdAt" FROM loans l JOIN members m ON m.id=l.member_id
    JOIN loan_products p ON p.id=l.product_id ORDER BY l.id DESC LIMIT 20`)).rows;
  const welfareOpeningBalance=Number((await one("SELECT value FROM settings WHERE key='welfareFundBalance'"))?.value||0);
  const [budgetSummary,welfareMonth,welfareLedger,auditSummary,supervisorySummary,performanceRows,monthlyRows,financeAccounts]=await Promise.all([
    one(`SELECT COALESCE(SUM(allocated_amount),0)::float AS allocated,COALESCE(SUM(used_amount),0)::float AS used
      FROM finance_budgets WHERE status='approved'`),
    one(`SELECT COALESCE(SUM(amount),0)::float AS total FROM welfare_contributions
      WHERE contribution_date>=date_trunc('month',CURRENT_DATE)`),
    one(`SELECT
      COALESCE((SELECT SUM(amount) FROM welfare_contributions),0)::float AS contributed,
      COALESCE((SELECT SUM(p.amount) FROM welfare_payments p LEFT JOIN welfare_requests wr ON wr.id=p.request_id
        LEFT JOIN finance_payment_vouchers v ON v.id=wr.finance_voucher_id
        WHERE COALESCE(v.status,p.status) IN ('paid','processed')),0)::float AS paid`),
    one(`SELECT COUNT(*) FILTER (WHERE status NOT IN ('resolved','closed'))::int AS open,
      COUNT(DISTINCT department_id) FILTER (WHERE status NOT IN ('resolved','closed'))::int AS departments,
      COALESCE((SELECT AVG(compliance_score) FROM audit_compliance),0)::float AS compliance FROM audit_findings`),
    one(`SELECT COUNT(*) FILTER (WHERE performance_score<80)::int AS below FROM supervisory_scorecards`),
    query(`SELECT d.code,ROUND(AVG(s.performance_score))::int AS performance FROM departments d
      LEFT JOIN supervisory_scorecards s ON s.department_id=d.id GROUP BY d.code`),
    query(`WITH months AS (SELECT generate_series(date_trunc('month',CURRENT_DATE)-INTERVAL '5 months',date_trunc('month',CURRENT_DATE),INTERVAL '1 month') AS month)
      SELECT to_char(month,'Mon') AS month,
      COALESCE((SELECT SUM(amount)/1000000 FROM organization_finance_entries f WHERE f.entry_type='income' AND f.status IN ('approved','completed') AND date_trunc('month',f.transaction_date)=months.month),0)::float AS income,
      COALESCE((SELECT SUM(amount)/1000000 FROM organization_finance_entries f WHERE f.entry_type='expense' AND f.status IN ('approved','completed') AND date_trunc('month',f.transaction_date)=months.month),0)::float AS expenses,
      COALESCE((SELECT SUM(amount)/1000000 FROM transactions tx WHERE tx.type='Savings deposit' AND tx.status='completed' AND date_trunc('month',tx.created_at)=months.month),0)::float AS savings,
      COALESCE((SELECT SUM(amount)/1000000 FROM loans l WHERE date_trunc('month',l.created_at)=months.month),0)::float AS loans,
      COALESCE((SELECT SUM(CASE WHEN transaction_type='revenue' THEN amount ELSE -amount END)/1000000 FROM investment_transactions it WHERE date_trunc('month',it.transaction_date)=months.month),0)::float AS investment
      FROM months ORDER BY month`),
    query(`SELECT id,account_code AS "accountCode",account_name AS "accountName",account_type AS "accountType",
      bank_name AS "bankName",
      CASE WHEN account_number IS NULL OR BTRIM(account_number)='' THEN NULL
        ELSE '**** '||RIGHT(REGEXP_REPLACE(account_number,'\\s','','g'),4) END AS "maskedAccountNumber",
      balance::float,restricted,last_reconciled_at AS "lastReconciledAt"
      FROM finance_accounts WHERE active=true ORDER BY
      CASE account_type WHEN 'bank' THEN 1 WHEN 'cash' THEN 2 WHEN 'petty_cash' THEN 3 WHEN 'mobile_money' THEN 4 ELSE 5 END,account_name`)
  ]);
  const monthly=monthlyRows.rows;
  const budgetUtilization=budgetSummary.allocated?Math.round(budgetSummary.used/budgetSummary.allocated*1000)/10:0;
  const accountTotals=financeAccounts.rows.reduce((totals,account)=>{
    const amount=Number(account.balance||0),type=String(account.accountType||"");
    if(type==="bank")totals.bankBalance+=amount;
    if(type==="cash")totals.cashBalance+=amount;
    if(type==="petty_cash")totals.pettyCash+=amount;
    if(account.restricted)totals.restrictedFunds+=amount;else totals.availableFunds+=amount;
    return totals;
  },{bankBalance:0,cashBalance:0,pettyCash:0,restrictedFunds:0,availableFunds:0});
  const investmentGrowth=investment.invested?Math.round((investment.current_value-investment.invested)/investment.invested*1000)/10:0;
  const welfareBalance=welfareOpeningBalance+Number(welfareLedger.contributed||0)-Number(welfareLedger.paid||0);
  const notifications=[
    ...approvals.rows.slice(0,5).map(item=>({type:"approval",title:item.title,detail:`${item.department} approval required`,time:item.createdAt})),
    ...documents.rows.filter(d=>d.status==="pending_executive").slice(0,3).map(item=>({type:"approval",title:item.title,detail:`${item.department||"Legal"} document publication required`,time:item.updatedAt})),
    ...meetings.rows.slice(0,3).map(item=>({type:"meeting",title:item.title,detail:item.venue||item.meetingType,time:item.scheduledAt})),
    ...activities.rows.filter(item=>!approvals.rows.some(approval=>approval.id===item.id)).slice(0,4).map(item=>({type:item.activityType,title:item.title,detail:item.department,time:item.createdAt}))
  ];
  const pendingDocumentCount=documents.rows.filter(d=>d.status==="pending_executive").length;
  const recoveryRate=loans.issued?Math.round(loans.recovered/loans.issued*100):0;
  const supervisoryPerformance=Object.fromEntries(performanceRows.rows.map(row=>[row.code,Number(row.performance||0)]));
  const computedPerformance=computeDepartmentPerformance({
    pendingApprovals:approvals.rows.length+pendingDocumentCount,
    upcomingMeetings:meetings.rows.length,
    financeIncome:Number(finance.income||0),
    financeExpenditure:Number(finance.expenditure||0),
    budgetUtilization,
    totalSavings:Number(savings.rows[0].total||0),
    recoveryRate,
    activeLoans:Number(loans.active||0),
    overdueLoans:Number(loans.defaults||0),
    investmentRunning:Number(investment.running||0),
    investmentProfitable:Number(investment.profitable||0),
    investmentGrowth,
    welfareBalance,
    welfarePending:Number(welfare.rows[0].pending||0),
    welfareApproved:Number(welfare.rows[0].approved||0),
    legalOpenCases:Number(legal.rows[0].open_cases||0),
    legalContracts:Number(legal.rows[0].contracts||0),
    legalAlerts:Number(legal.rows[0].alerts||0),
    auditCompliance:Number(auditSummary.compliance||0),
    auditOpen:Number(auditSummary.open||0),
    supervisoryBelow:Number(supervisorySummary.below||0),
    supervisoryFollowups:Number(supervisory.rows[0].followups||0)
  });
  const performance=mergeDepartmentPerformance(supervisoryPerformance,computedPerformance);
  const performanceSource=Object.fromEntries(Object.keys(computedPerformance).map(code=>[
    code,supervisoryPerformance[code]>0?"assessed":"live"
  ]));
  res.json({
    selectedFiscalYear,availableFiscalYears,historicalPeriod:selectedFiscalYear!==defaultFiscalYear,
    stats:{totalMembers:memberStats.rows[0].total,activeMembers:memberStats.rows[0].active,newMembers:memberStats.rows[0].new_this_month,
      totalDepartments:departments.rows.length,pendingApprovals:approvals.rows.length+pendingDocumentCount,organizationIncome:finance.income,
      organizationExpenditure:finance.expenditure,netBalance:finance.income-finance.expenditure,totalSavings:savings.rows[0].total,
      outstandingLoans:loans.outstanding,activeInvestments:investment.running,welfareFundBalance:welfareBalance,
      legalCases:legal.rows[0].open_cases,auditIssues:auditIssues.rows[0].open,
      supervisoryRecommendations:supervisory.rows[0].recommendations,upcomingMeetings:meetings.rows.length},
    performance,performanceSource,departments:departments.rows,approvals:approvals.rows,approvalHistory:approvalHistory.rows,activities:activities.rows,meetings:meetings.rows,
    documents:documents.rows,financeEntries:financeEntries.rows,welfareRequests:welfareRequests.rows,governance:governanceRows.rows,
    finance:{...finance,budgetUtilization,budgetAllocated:budgetSummary.allocated,budgetUsed:budgetSummary.used,
      accounts:financeAccounts.rows,cashPosition:accountTotals,monthly},loans:{...loans,recoveryRate:loans.issued?Math.round(loans.recovered/loans.issued*100):0},
    investment:{...investment,growth:investmentGrowth},investmentProjects,recentLoans,
    welfare:{...welfare.rows[0],fundBalance:welfareBalance,monthlyContributions:welfareMonth.total},
    legal:legal.rows[0],audit:{...auditIssues.rows[0],open:auditSummary.open,departmentsUnderReview:auditSummary.departments,compliance:auditSummary.compliance},
    supervisory:{...supervisory.rows[0],departmentsBelowTarget:supervisorySummary.below},monthly,notifications
  });
}));
app.post("/api/executive/approvals/:id/decision",auth,requireExecutive("approve"),asyncRoute(async(req,res)=>{
  const decision=String(req.body.decision||"").toLowerCase();
  const statusMap={approve:"approved",reject:"rejected",more_information:"information_requested"};
  if(!statusMap[decision]) return res.status(400).json({error:"Choose approve, reject, or request more information"});
  const comment=String(req.body.comment||"").trim();
  if(decision!=="approve"&&!comment) return res.status(400).json({error:"A comment is required for this decision"});
  const reviewerId=req.body.reviewerId?Number(req.body.reviewerId):null;
  const row=await transaction(async client=>{
    const activity=(await client.query(`SELECT id,reference,title,activity_type FROM department_activities
      WHERE id=$1::bigint AND visibility_level<=$2::integer
      AND status IN ('pending_executive','in_review','information_requested') FOR UPDATE`,
    [req.params.id,req.executiveAccess.authority_level])).rows[0];
    if(!activity){const error=new Error("Approval item was not found or is outside your authority");error.status=404;throw error;}
    await client.query(`UPDATE department_activities SET status=$1::text,
      approved_by=CASE WHEN $1::text='approved' THEN $2::bigint ELSE NULL::bigint END,
      decision_by=$2::bigint,decision_at=NOW(),
      assigned_to=COALESCE($3::bigint,assigned_to),decision_comment=$4::text,
      approved_at=CASE WHEN $1::text='approved' THEN NOW() ELSE NULL END,updated_at=NOW() WHERE id=$5::bigint`,
    [statusMap[decision],req.user.id,reviewerId,comment||null,activity.id]);
    if(activity.activity_type==="finance-payment") {
      const voucherStatus=decision==="approve"?"executive_approved":decision==="reject"?"rejected":"executive_approval";
      const linked=await client.query(`UPDATE finance_payment_vouchers SET status=$1::text,
        executive_approved_by=CASE WHEN $1::text='executive_approved' THEN $2::bigint ELSE executive_approved_by END,
        executive_approved_at=CASE WHEN $1::text='executive_approved' THEN NOW() ELSE executive_approved_at END,
        finance_comment=COALESCE($3::text,finance_comment) WHERE executive_activity_id=$4::bigint RETURNING id`,
      [voucherStatus,req.user.id,comment||null,activity.id]);
      if(linked.rowCount!==1)throw new Error("The linked payment voucher could not be found");
    }
    if(activity.activity_type==="finance-budget") {
      const budgetStatus=decision==="approve"?"approved":decision==="reject"?"rejected":"pending_approval";
      const linked=await client.query(`UPDATE finance_budgets SET status=$1::text,
        approved_by=CASE WHEN $1::text='approved' THEN $2::bigint ELSE NULL::bigint END
        WHERE executive_activity_id=$3::bigint RETURNING id`,[budgetStatus,req.user.id,activity.id]);
      if(linked.rowCount!==1)throw new Error("The linked Finance budget could not be found");
    }
    if(activity.activity_type==="investment-proposal") {
      const proposalStatus=decision==="approve"?"approved":decision==="reject"?"rejected":"investment_review";
      const linked=await client.query(`UPDATE investment_proposals SET status=$1::text,
        approved_by=CASE WHEN $1::text='approved' THEN $2::bigint ELSE approved_by END,
        approved_at=CASE WHEN $1::text='approved' THEN NOW() ELSE approved_at END,
        recommendation=COALESCE($3::text,recommendation) WHERE executive_activity_id=$4::bigint RETURNING id`,
      [proposalStatus,req.user.id,comment||null,activity.id]);
      if(linked.rowCount!==1)throw new Error("The linked investment proposal could not be found");
    }
    if(activity.activity_type==="welfare-request") {
      const requestStatus=decision==="approve"?"approved":decision==="reject"?"rejected":"more_information";
      const welfareRequest=(await client.query(`UPDATE welfare_requests SET status=$1::text,reviewed_by=$2::bigint,reviewed_at=NOW(),
        officer_recommendation=COALESCE($3::text,officer_recommendation)
        WHERE executive_activity_id=$4::bigint RETURNING *`,
      [requestStatus,req.user.id,comment||null,activity.id])).rows[0];
      if(!welfareRequest)throw new Error("The linked Welfare request could not be found");
      if(decision==="approve")await createWelfareFinanceVoucher(welfareRequest,req.user.id,client);
    }
    if(activity.activity_type==="legal-contract") {
      const contractNumber=activity.reference.replace(/^EXEC-/,"");
      const contractStatus=decision==="approve"?"approved":decision==="reject"?"rejected":"information_requested";
      const linked=await client.query(`UPDATE legal_contracts SET status=$1::text,
        approved_by=CASE WHEN $1::text='approved' THEN $2::bigint ELSE approved_by END,
        review_notes=COALESCE($3::text,review_notes),updated_at=NOW() WHERE contract_number=$4::text RETURNING id`,
      [contractStatus,req.user.id,comment||null,contractNumber]);
      if(linked.rowCount!==1)throw new Error("The linked Legal contract could not be found");
      await client.query("UPDATE investment_contracts SET status=$1::text WHERE reference=$2::text",
        [decision==="approve"?"active":decision==="reject"?"rejected":"legal_review",contractNumber]);
    }
    return activity;
  });
  await audit({userId:req.user.id,action:`EXECUTIVE_${statusMap[decision].toUpperCase()}`,entityType:"department_activity",
    entityId:String(row.id),details:`${row.reference} - ${row.title}${comment?` - ${comment}`:""}`,...metadata(req)});
  res.json({ok:true,status:statusMap[decision]});
}));
app.post("/api/executive/approvals/:id/reviewer",auth,requireExecutive("approve"),asyncRoute(async(req,res)=>{
  const reviewer=await one("SELECT id,full_name FROM users WHERE id=$1 AND active=true",[Number(req.body.reviewerId)]);
  if(!reviewer) return res.status(400).json({error:"Select an active reviewer"});
  const row=await one(`UPDATE department_activities SET assigned_to=$1,decision_comment=$2,updated_at=NOW()
    WHERE id=$3 AND visibility_level<=$4 AND status IN ('pending_executive','in_review','information_requested')
    RETURNING id,reference,title`,[reviewer.id,String(req.body.comment||"Assigned for executive review").trim(),req.params.id,req.executiveAccess.authority_level]);
  if(!row) return res.status(404).json({error:"Approval item was not found"});
  await audit({userId:req.user.id,action:"EXECUTIVE_REVIEWER_ASSIGNED",entityType:"department_activity",entityId:String(row.id),
    details:`${row.reference} - ${reviewer.full_name}`,...metadata(req)});
  res.json({ok:true,reviewer:reviewer.full_name});
}));
app.get("/api/executive/projects/:id",auth,requireExecutive("view"),asyncRoute(async(req,res)=>{
  const project=await one(`SELECT p.id,p.reference,p.name,p.description,p.category,p.location,
    p.target_amount::float AS budget,p.raised_amount::float AS "capitalRaised",p.current_value::float AS "currentValue",
    p.expected_return::float AS "expectedReturn",p.status,p.executive_status AS "executiveStatus",
    p.performance_status AS "performanceStatus",p.starts_on AS "startsOn",p.ends_on AS "endsOn",
    p.manager_name AS manager,p.funding_source AS "fundingSource",p.progress,p.photo_url AS "photoUrl",
    p.supporting_document AS "supportingDocument",proposal.reference AS "proposalReference",
    proposal.title AS "proposalTitle",proposal.risk_assessment AS "riskAssessment",
    proposal.finance_analysis AS "financeAnalysis",proposal.finance_recommendation AS "financeRecommendation",
    proposal.approved_at AS "proposalApprovedAt",approver.full_name AS "proposalApprovedBy",
    COALESCE(SUM(t.amount) FILTER (WHERE t.transaction_type='revenue' AND t.deleted_at IS NULL),0)::float AS revenue,
    COALESCE(SUM(t.amount) FILTER (WHERE t.transaction_type='expense' AND t.deleted_at IS NULL),0)::float AS expenses
    FROM investment_projects p LEFT JOIN investment_proposals proposal ON proposal.id=p.proposal_id
    LEFT JOIN users approver ON approver.id=proposal.approved_by
    LEFT JOIN investment_transactions t ON t.project_id=p.id
    WHERE p.id=$1 AND p.status<>'archived' GROUP BY p.id,proposal.id,approver.full_name`,[Number(req.params.id)]);
  if(!project)return res.status(404).json({error:"Investment project not found"});
  project.profit=Number(project.revenue)-Number(project.expenses);
  project.roi=Number(project.budget)?Number((project.profit/Number(project.budget)*100).toFixed(1)):0;
  project.budgetUtilization=Number(project.budget)?Number((Number(project.expenses)/Number(project.budget)*100).toFixed(1)):0;
  const [oversight,transactions,contracts,assets]=await Promise.all([
    query(`SELECT o.id,o.action_type AS "actionType",o.previous_status AS "previousStatus",o.new_status AS "newStatus",
      o.comment,o.created_at AS "createdAt",u.full_name AS "createdBy",d.name AS "targetDepartment"
      FROM investment_project_oversight o JOIN users u ON u.id=o.created_by
      LEFT JOIN departments d ON d.id=o.target_department_id WHERE o.project_id=$1 ORDER BY o.created_at DESC`,[project.id]),
    query(`SELECT reference,transaction_type AS "transactionType",category,description,amount::float,
      transaction_date AS "transactionDate",supporting_document AS "supportingDocument"
      FROM investment_transactions WHERE project_id=$1 AND deleted_at IS NULL ORDER BY transaction_date DESC,id DESC LIMIT 30`,[project.id]),
    query(`SELECT reference,title,contract_type AS "contractType",counterparty,contract_value::float AS "contractValue",
      status,document_reference AS "documentReference" FROM investment_contracts WHERE project_id=$1 ORDER BY id DESC`,[project.id]),
    query(`SELECT asset_code AS "assetCode",asset_name AS "assetName",asset_type AS "assetType",current_value::float AS "currentValue",
      status,photo_url AS "photoUrl",supporting_document AS "supportingDocument" FROM investment_assets
      WHERE project_id=$1 AND status<>'archived' ORDER BY id DESC`,[project.id])
  ]);
  res.json({project,oversight:oversight.rows,transactions:transactions.rows,contracts:contracts.rows,assets:assets.rows});
}));
app.post("/api/executive/projects/:id/actions",auth,requireExecutive("approve"),asyncRoute(async(req,res)=>{
  const action=String(req.body.action||"").toLowerCase(),comment=String(req.body.comment||"").trim();
  if(!["comment","suspend","reactivate","close","escalate"].includes(action))return res.status(400).json({error:"Choose a valid Executive project action"});
  if(!comment)return res.status(400).json({error:"A reason or strategic comment is required"});
  const result=await transaction(async client=>{
    const project=(await client.query("SELECT * FROM investment_projects WHERE id=$1 AND status<>'archived' FOR UPDATE",[Number(req.params.id)])).rows[0];
    if(!project){const error=new Error("Investment project not found");error.status=404;throw error;}
    let targetDepartmentId=null,newStatus=project.status;
    if(action==="suspend"){
      if(["completed","suspended"].includes(project.status)){const error=new Error("Only an active project can be suspended");error.status=409;throw error;}
      newStatus="suspended";
      await client.query("UPDATE investment_projects SET status='suspended',executive_status='suspended',suspended_at=NOW() WHERE id=$1",[project.id]);
    }else if(action==="reactivate"){
      if(project.status!=="suspended"){const error=new Error("Only a suspended project can be reactivated");error.status=409;throw error;}
      newStatus="active";
      await client.query("UPDATE investment_projects SET status='active',executive_status='approved',suspended_at=NULL WHERE id=$1",[project.id]);
    }else if(action==="close"){
      if(project.status==="completed"){const error=new Error("This project is already closed");error.status=409;throw error;}
      newStatus="completed";
      await client.query("UPDATE investment_projects SET status='completed',executive_status='closed',progress=100,closed_at=NOW() WHERE id=$1",[project.id]);
    }else if(action==="escalate"){
      const target=String(req.body.targetDepartment||"").toLowerCase();
      if(!["audit","legal","supervisory"].includes(target)){const error=new Error("Escalate to Audit, Legal, or Supervisory");error.status=400;throw error;}
      const department=(await client.query("SELECT id FROM departments WHERE code=$1 AND active=true",[target])).rows[0];
      if(!department){const error=new Error("The selected oversight department is unavailable");error.status=409;throw error;}
      targetDepartmentId=department.id;
      await client.query(`INSERT INTO department_activities
        (department_id,reference,activity_type,title,description,status,visibility_level,created_by)
        VALUES ($1,$2,'project-escalation',$3,$4,'pending',3,$5)`,
      [department.id,reference(`EXEC-${target.toUpperCase()}`),`Project escalation - ${project.name}`,comment,req.user.id]);
    }
    const oversight=(await client.query(`INSERT INTO investment_project_oversight
      (project_id,action_type,target_department_id,previous_status,new_status,comment,created_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,[project.id,action,targetDepartmentId,project.status,newStatus,comment,req.user.id])).rows[0];
    return {project,oversight,newStatus};
  });
  await audit({userId:req.user.id,action:`EXECUTIVE_PROJECT_${action.toUpperCase()}`,entityType:"investment_project",
    entityId:String(result.project.id),details:`${result.project.reference} - ${comment}`,...metadata(req)});
  res.json({ok:true,status:result.newStatus});
}));
app.get("/api/executive/search",auth,requireExecutive("view"),asyncRoute(async(req,res)=>{
  const term=String(req.query.q||"").trim();
  if(term.length<2) return res.json({results:[]});
  const like=`%${term}%`;
  const rows=await query(`SELECT * FROM (
    SELECT 'Member' AS type,m.member_number AS reference,m.full_name AS title,COALESCE(m.phone,'') AS detail,'members' AS target FROM members m
      WHERE m.full_name ILIKE $1 OR m.member_number ILIKE $1 OR m.phone ILIKE $1
    UNION ALL SELECT 'Loan',l.reference,m.full_name||' - '||p.name,l.status,'executive-credits' FROM loans l JOIN members m ON m.id=l.member_id JOIN loan_products p ON p.id=l.product_id
      WHERE l.reference ILIKE $1 OR m.full_name ILIKE $1 OR p.name ILIKE $1
    UNION ALL SELECT 'Department',d.code,d.name,d.description,'departments' FROM departments d WHERE d.name ILIKE $1 OR d.description ILIKE $1
    UNION ALL SELECT 'Investment',i.reference,i.name,i.status,'executive-investments' FROM investment_projects i WHERE i.name ILIKE $1 OR i.reference ILIKE $1
    UNION ALL SELECT 'Welfare',w.reference,m.full_name||' - '||w.request_type,w.status,'executive-welfare' FROM welfare_requests w JOIN members m ON m.id=w.member_id
      WHERE w.reference ILIKE $1 OR m.full_name ILIKE $1 OR w.request_type ILIKE $1
    UNION ALL SELECT 'Legal',g.reference,g.title,g.status,'executive-legal' FROM governance_records g JOIN departments d ON d.id=g.department_id
      WHERE d.code='legal' AND (g.reference ILIKE $1 OR g.title ILIKE $1)
    UNION ALL SELECT 'Document',doc.reference,doc.title,doc.document_type,'executive-documents' FROM organization_documents doc
      WHERE doc.status<>'archived' AND (doc.reference ILIKE $1 OR doc.title ILIKE $1 OR doc.document_type ILIKE $1)
    UNION ALL SELECT 'Meeting',mt.reference,mt.title,mt.meeting_type,'executive-meetings' FROM organization_meetings mt
      WHERE mt.reference ILIKE $1 OR mt.title ILIKE $1 OR mt.meeting_type ILIKE $1
    UNION ALL SELECT 'Transaction',f.reference,f.description,f.status,'executive-finance' FROM organization_finance_entries f
      WHERE f.reference ILIKE $1 OR f.description ILIKE $1 OR f.category ILIKE $1
  ) results LIMIT 60`,[like]);
  res.json({results:rows.rows});
}));
app.post("/api/executive/meetings",auth,requireExecutive("view"),asyncRoute(async(req,res)=>{
  const b=req.body,title=String(b.title||"").trim(),scheduledAt=new Date(b.scheduledAt);
  if(!title||Number.isNaN(scheduledAt.getTime())||scheduledAt<=new Date()) return res.status(400).json({error:"Provide a title and a future meeting date"});
  const executiveDepartment=await one("SELECT id FROM departments WHERE code='executive'");
  const row=await one(`INSERT INTO organization_meetings
    (reference,department_id,title,meeting_type,agenda,venue,scheduled_at,status,visibility_level,created_by)
    VALUES ($1,$2,$3,$4,$5,$6,$7,'scheduled',$8,$9) RETURNING id,reference`,
  [reference("MTG"),executiveDepartment.id,title,String(b.meetingType||"Executive Meeting").trim(),
    String(b.agenda||"").trim()||null,String(b.venue||"").trim()||null,scheduledAt,
    Math.min(4,Math.max(1,Number(b.visibilityLevel||2))),req.user.id]);
  await audit({userId:req.user.id,action:"EXECUTIVE_MEETING_SCHEDULED",entityType:"meeting",entityId:String(row.id),details:title,...metadata(req)});
  res.status(201).json(row);
}));

function requireFinance(action="view") {
  return asyncRoute(async(req,res,next)=>{
    const access=await departmentPermission(req.user,"finance",action);
    if(!access) return res.status(403).json({error:`Your Finance assignment does not allow ${action} access`});
    req.financeAccess=access;next();
  });
}
app.get("/api/finance/command-center",auth,requireFinance("view"),asyncRoute(async(req,res)=>{
  const fiscalYearRows=(await query(`SELECT EXTRACT(YEAR FROM ends_on)::int AS year,fiscal_year_label AS label
    FROM member_financial_year_policies
    UNION
    SELECT fiscal_year AS year,'FY ended '||to_char(period_end,'DD Mon YYYY') AS label FROM financial_reporting_periods
    ORDER BY year DESC`)).rows;
  const availableFiscalYears=fiscalYearRows.map(row=>({year:Number(row.year),label:row.label}));
  const defaultFiscalYear=Number((await one(`SELECT EXTRACT(YEAR FROM ends_on)::int AS year
    FROM member_financial_year_policies WHERE status='active' ORDER BY ends_on DESC LIMIT 1`))?.year||availableFiscalYears[0]?.year||new Date().getFullYear());
  const requestedFiscalYear=Number(req.query.fy);
  const selectedFiscalYear=availableFiscalYears.some(row=>row.year===requestedFiscalYear)?requestedFiscalYear:defaultFiscalYear;  const [accounts,incomeExpense,budgets,vouchers,entries,invoices,assets,procurements,documents,departments,investmentAnalyses]=await Promise.all([
    query(`SELECT id,account_code AS "accountCode",account_name AS "accountName",account_type AS "accountType",
      bank_name AS "bankName",account_number AS "accountNumber",balance::float,opening_balance::float AS "openingBalance",
      opening_balance_date AS "openingBalanceDate",notes,supporting_document AS "supportingDocument",
      supporting_document_name AS "supportingDocumentName",restricted,active,last_reconciled_at AS "lastReconciledAt"
      FROM finance_accounts WHERE active=true ORDER BY id`),
    query(`SELECT
      COALESCE(SUM(amount) FILTER (WHERE entry_type='income' AND status IN ('completed','approved') AND transaction_date=CURRENT_DATE),0)::float AS income_today,
      COALESCE(SUM(amount) FILTER (WHERE entry_type='expense' AND status IN ('completed','approved') AND transaction_date=CURRENT_DATE),0)::float AS expense_today,
      COALESCE(SUM(amount) FILTER (WHERE entry_type='income' AND status IN ('completed','approved') AND transaction_date>=date_trunc('month',CURRENT_DATE)::date),0)::float AS income_month,
      COALESCE(SUM(amount) FILTER (WHERE entry_type='expense' AND status IN ('completed','approved') AND transaction_date>=date_trunc('month',CURRENT_DATE)::date),0)::float AS expense_month
      FROM organization_finance_entries`),
    query(`SELECT b.id,b.reference,d.id AS "departmentId",b.fiscal_period AS "fiscalPeriod",b.allocated_amount::float AS allocated,
      b.used_amount::float AS used,(b.allocated_amount-b.used_amount)::float AS remaining,b.status,d.code AS "departmentCode",d.name AS department
      FROM finance_budgets b JOIN departments d ON d.id=b.department_id WHERE b.status='approved' ORDER BY d.sort_order`),
    query(`SELECT v.id,v.voucher_number AS "voucherNumber",v.supplier,v.description,v.category,v.budget_line AS "budgetLine",
      v.amount::float,v.payment_method AS "paymentMethod",v.status,v.supporting_document AS "supportingDocument",
      v.created_at AS "createdAt",d.name AS department,requester.id AS "requestedById",requester.full_name AS "requestedBy",
      reviewer.full_name AS "reviewedBy",v.finance_comment AS "financeComment",v.executive_activity_id AS "executiveActivityId"
      FROM finance_payment_vouchers v JOIN departments d ON d.id=v.department_id JOIN users requester ON requester.id=v.requested_by
      LEFT JOIN users reviewer ON reviewer.id=v.finance_reviewed_by ORDER BY v.id DESC LIMIT 100`),
    query(`SELECT f.id,f.reference,f.entry_type AS "entryType",f.category,f.description,f.counterparty,f.payment_method AS "paymentMethod",
      f.amount::float,f.status,f.receipt_number AS "receiptNumber",f.voucher_number AS "voucherNumber",f.budget_line AS "budgetLine",
      f.supporting_document AS "supportingDocument",f.transaction_date AS "transactionDate",f.created_at AS "createdAt",
      f.finance_account_id AS "accountId",a.account_name AS "accountName",
      recorder.full_name AS "recordedBy" FROM organization_finance_entries f JOIN users recorder ON recorder.id=f.recorded_by
      LEFT JOIN finance_accounts a ON a.id=f.finance_account_id
      ORDER BY f.transaction_date DESC,f.id DESC LIMIT 100`),
    query(`SELECT id,invoice_number AS "invoiceNumber",supplier,description,amount::float,invoice_date AS "invoiceDate",
      due_date AS "dueDate",status,supporting_document AS "supportingDocument" FROM finance_invoices ORDER BY due_date,id DESC`),
    query(`SELECT a.id,a.asset_code AS "assetCode",a.asset_name AS "assetName",a.asset_type AS "assetType",
      a.purchase_date AS "purchaseDate",a.purchase_value::float AS "purchaseValue",a.current_value::float AS "currentValue",
      a.status,a.location,a.custodian,a.photo_url AS "photoUrl",a.supporting_document AS "supportingDocument",d.name AS department
      FROM finance_assets a LEFT JOIN departments d ON d.id=a.department_id ORDER BY a.id DESC`),
    query(`SELECT p.id,p.reference,p.item_description AS "itemDescription",p.supplier,p.estimated_amount::float AS "estimatedAmount",
      p.approved_amount::float AS "approvedAmount",p.stage,p.status,p.purchase_order_number AS "purchaseOrderNumber",
      p.goods_received_at AS "goodsReceivedAt",p.created_at AS "createdAt",d.name AS department,u.full_name AS "requestedBy"
      FROM finance_procurements p JOIN departments d ON d.id=p.department_id JOIN users u ON u.id=p.requested_by ORDER BY p.id DESC`),
    query(`SELECT doc.id,doc.reference,doc.document_type AS "documentType",doc.title,doc.version,doc.status,
      doc.file_name AS "fileName",doc.updated_at AS "updatedAt",d.name AS department,
      EXISTS(SELECT 1 FROM organization_document_versions v WHERE v.document_id=doc.id) AS "hasFile"
      FROM organization_documents doc LEFT JOIN departments d ON d.id=doc.department_id
      WHERE doc.status<>'archived' AND (d.code='finance' OR (doc.status='published' AND doc.visibility_level<=2 AND doc.document_type IN ('Annual Reports','Audit Reports'))) ORDER BY doc.updated_at DESC`),
    query(`SELECT id,code,name FROM departments WHERE active=true ORDER BY sort_order,name`),
    query(`SELECT p.id,p.reference,p.title,p.description,p.category,p.estimated_cost::float AS "estimatedCost",
      p.expected_revenue::float AS "expectedRevenue",p.expected_roi::float AS "expectedRoi",p.risk_assessment AS "riskAssessment",
      p.supporting_document AS "supportingDocument",p.created_at AS "createdAt",u.full_name AS "createdBy"
      FROM investment_proposals p JOIN users u ON u.id=p.created_by
      WHERE p.status='financial_analysis' ORDER BY p.created_at`)
  ]);
  const financialSnapshot=await one(`SELECT p.id,p.fiscal_year AS "fiscalYear",p.period_end AS "periodEnd",p.status,p.source_name AS "sourceName",
    jsonb_object_agg(l.line_code,jsonb_build_object('name',l.line_name,'current',l.current_amount::float,'prior',l.prior_amount::float)) AS values
    FROM financial_reporting_periods p JOIN financial_statement_lines l ON l.period_id=p.id
    WHERE p.fiscal_year=$1 GROUP BY p.id,p.fiscal_year,p.period_end,p.status,p.source_name LIMIT 1`,[selectedFiscalYear]);
  const cash=accounts.rows.filter(a=>a.accountType==="cash").reduce((sum,a)=>sum+a.balance,0);
  const bank=accounts.rows.filter(a=>a.accountType==="bank").reduce((sum,a)=>sum+a.balance,0);
  const petty=accounts.rows.filter(a=>a.accountType==="petty_cash").reduce((sum,a)=>sum+a.balance,0);
  const mobile=accounts.rows.filter(a=>a.accountType==="mobile_money").reduce((sum,a)=>sum+a.balance,0);
  const restricted=accounts.rows.filter(a=>a.restricted||a.accountType==="restricted").reduce((sum,a)=>sum+a.balance,0);
  const liquidFunds=bank+cash+petty+mobile;
  const budgetAllocated=budgets.rows.reduce((sum,b)=>sum+b.allocated,0);
  const budgetUsed=budgets.rows.reduce((sum,b)=>sum+b.used,0);
  const outstandingVouchers=vouchers.rows.filter(v=>!["processed","rejected"].includes(v.status));
  const outstandingPayments=outstandingVouchers.reduce((sum,v)=>sum+v.amount,0);
  const totalAssets=assets.rows.reduce((sum,a)=>sum+a.currentValue,0);
  const liabilities=invoices.rows.filter(i=>i.status!=="paid").reduce((sum,i)=>sum+i.amount,0);
  const budgetOrder={executive:1,finance:2,credits:3,investment:4,welfare:5,legal:6,audit:7,supervisory:8};
  const budgetRows=[...budgets.rows]
    .map(row=>({...row,utilization:row.allocated?Math.round(row.used/row.allocated*100):0}))
    .sort((a,b)=>(budgetOrder[a.departmentCode]||99)-(budgetOrder[b.departmentCode]||99));
  const incomeBySource=Object.entries(entries.rows.filter(x=>x.entryType==="income"&&["completed","approved"].includes(x.status))
    .reduce((totals,row)=>(totals[row.category]=(totals[row.category]||0)+row.amount,totals),{})).map(([label,amount])=>({label,amount}));
  const expensesByCategory=Object.entries(entries.rows.filter(x=>x.entryType==="expense"&&["completed","approved"].includes(x.status))
    .reduce((totals,row)=>(totals[row.category]=(totals[row.category]||0)+row.amount,totals),{})).map(([label,amount])=>({label,amount}));
  const monthly=(await query(`WITH months AS (
      SELECT generate_series(date_trunc('month',CURRENT_DATE)-INTERVAL '5 months',date_trunc('month',CURRENT_DATE),INTERVAL '1 month') AS month)
    SELECT to_char(month,'Mon') AS month,
      COALESCE((SELECT SUM(amount) FROM organization_finance_entries f WHERE f.entry_type='income' AND f.status IN ('approved','completed') AND date_trunc('month',f.transaction_date)=months.month),0)::float AS income,
      COALESCE((SELECT SUM(amount) FROM organization_finance_entries f WHERE f.entry_type='expense' AND f.status IN ('approved','completed') AND date_trunc('month',f.transaction_date)=months.month),0)::float AS expenses
      FROM months ORDER BY month`)).rows;
  const daily=[];
  const historicalPeriod=selectedFiscalYear!==defaultFiscalYear&&Boolean(financialSnapshot);
  const snapshotValues=financialSnapshot?.values||{};
  const snapshotAmount=code=>Number(snapshotValues[code]?.current||0);
  const pendingFinanceEntries=entries.rows.filter(x=>x.status==="pending_finance_review");
  const subscriptionPolicy=await one(`SELECT fiscal_year_label AS "fiscalYear",annual_subscription_fee::float AS fee,
    EXTRACT(YEAR FROM ends_on)::int AS year,starts_on AS "startsOn",ends_on AS "endsOn"
    FROM member_financial_year_policies WHERE status='active' ORDER BY ends_on DESC LIMIT 1`);
  const activeMemberCount=Number((await one(`SELECT COUNT(*)::int AS count FROM members WHERE status='active'`))?.count||0);
  const subscriptionPayments=subscriptionPolicy?(await query(`SELECT t.id,t.reference,t.amount::float,t.created_at AS "paidAt",
      t.verified_at AS "verifiedAt",m.id AS "memberId",m.full_name AS member,m.member_number AS "memberNumber"
      FROM transactions t JOIN members m ON m.id=t.member_id
      WHERE t.type='Annual subscription fee' AND t.status='completed'
        AND (t.target_fiscal_year=$1 OR (t.target_fiscal_year IS NULL AND t.created_at::date BETWEEN $2 AND $3))
      ORDER BY COALESCE(t.verified_at,t.created_at) DESC,t.id DESC`,
    [subscriptionPolicy.year,subscriptionPolicy.startsOn,subscriptionPolicy.endsOn])).rows:[];
  const subscriptionCollected=subscriptionPayments.reduce((sum,row)=>sum+Number(row.amount||0),0);
  const subscriptionExpected=activeMemberCount*Number(subscriptionPolicy?.fee||0);
  const subscriptionMembersPaid=new Set(subscriptionPayments.map(row=>row.memberId)).size;
  const subscriptionProgress={
    fiscalYear:subscriptionPolicy?.fiscalYear||null,
    fee:Number(subscriptionPolicy?.fee||0),
    expected:subscriptionExpected,
    collected:subscriptionCollected,
    percent:subscriptionExpected?Math.min(100,Math.round(subscriptionCollected/subscriptionExpected*100)):0,
    activeMembers:activeMemberCount,
    membersPaid:subscriptionMembersPaid,
    payments:subscriptionPayments
  };
  res.json({
    selectedFiscalYear,availableFiscalYears,historicalPeriod,
    stats:{currentBankBalance:historicalPeriod?snapshotAmount('cash_bank'):bank,cashOnHand:historicalPeriod?0:cash,
      incomeToday:historicalPeriod?snapshotAmount('total_income'):incomeExpense.rows[0].income_today,
      expensesToday:historicalPeriod?snapshotAmount('total_operating_expenses'):incomeExpense.rows[0].expense_today,
      monthlyIncome:historicalPeriod?snapshotAmount('total_income'):incomeExpense.rows[0].income_month,
      monthlyExpenses:historicalPeriod?snapshotAmount('total_operating_expenses'):incomeExpense.rows[0].expense_month,
      outstandingPayments:historicalPeriod?0:outstandingPayments,pendingPaymentRequests:historicalPeriod?0:outstandingVouchers.length,
      pendingFinanceEntries:pendingFinanceEntries.length,
      approvedBudget:budgetAllocated,budgetUtilized:budgetAllocated?Number((budgetUsed/budgetAllocated*100).toFixed(2)):0,
      totalAssets:historicalPeriod?snapshotAmount('total_assets'):totalAssets,
      totalLiabilities:historicalPeriod?snapshotAmount('total_liabilities'):liabilities,
      annualSubscriptionsCollected:subscriptionCollected,annualSubscriptionsExpected:subscriptionExpected},
    cashPosition:{bankBalance:bank,cashBalance:cash,pettyCash:petty,mobileMoney:mobile,availableFunds:Math.max(0,liquidFunds-restricted),restrictedFunds:restricted},
    financialSnapshot,accounts:accounts.rows,departments:departments.rows,budgets:budgetRows,vouchers:vouchers.rows,entries:entries.rows,
    pendingEntries:pendingFinanceEntries,invoices:invoices.rows,assets:assets.rows,
    procurements:procurements.rows,documents:documents.rows,investmentAnalyses:investmentAnalyses.rows,monthly,daily,
    incomeBySource,expensesByCategory,subscriptionProgress,
    notifications:[
      ...pendingFinanceEntries.slice(0,4).map(x=>({level:"warning",title:`${x.reference} awaits Finance verification`,createdAt:x.createdAt||x.transactionDate})),
      ...budgetRows.filter(x=>x.utilization>=80).map(x=>({level:"warning",title:`${x.department} budget has reached ${x.utilization}%`,createdAt:x.updatedAt||x.createdAt})),
      ...outstandingVouchers.slice(0,3).map(x=>({level:"info",title:`${x.voucherNumber} awaits ${x.status.replaceAll("_"," ")}`,createdAt:x.createdAt})),
      ...invoices.rows.filter(x=>x.status!=="paid"&&new Date(x.dueDate)<new Date()).slice(0,3).map(x=>({level:"danger",title:`Invoice ${x.invoiceNumber} is overdue`,createdAt:x.dueDate}))
    ],
    access:{authorityLevel:req.financeAccess.authority_level,canCreate:Boolean(req.financeAccess.can_create),
      canEdit:Boolean(req.financeAccess.can_edit),canApprove:Boolean(req.financeAccess.can_approve)}
  });
}));
app.post("/api/finance/income",auth,requireFinance("create"),asyncRoute(async(req,res)=>{
  const b=req.body,amount=Number(b.amount);
  if(!b.category||!b.counterparty||!b.paymentMethod||!b.description||!Number.isFinite(amount)||amount<=0)
    return res.status(400).json({error:"Category, payer, method, description and a positive amount are required"});
  const paymentMethod=String(b.paymentMethod).trim();
  const compatibleTypes={"Bank transfer":["bank"],Cheque:["bank"],Cash:["cash","petty_cash"],"Mobile Money":["mobile_money"]}[paymentMethod]||[];
  const row=await transaction(async client=>{
    const department=(await client.query("SELECT id FROM departments WHERE code='finance'")).rows[0];
    const account=(await client.query("SELECT * FROM finance_accounts WHERE id=$1 AND active=true FOR UPDATE",[Number(b.accountId)])).rows[0];
    if(!account){const error=new Error("Choose the account that received this income");error.status=400;throw error;}
    if(!compatibleTypes.includes(account.account_type)){const error=new Error(`${paymentMethod} income must be posted to a compatible registered account`);error.status=400;throw error;}
    const ref=reference("FIN-INC"),receipt=receiptReference("RCPT");
    const inserted=(await client.query(`INSERT INTO organization_finance_entries
      (department_id,reference,entry_type,category,description,counterparty,payment_method,amount,status,receipt_number,
        supporting_document,transaction_date,recorded_by,approved_by,approved_at,finance_account_id)
      VALUES ($1,$2,'income',$3,$4,$5,$6,$7,'completed',$8,$9,$10,$11,$11,NOW(),$12)
      RETURNING id,reference,receipt_number AS "receiptNumber"`,
    [department.id,ref,String(b.category),String(b.description).trim(),String(b.counterparty).trim(),paymentMethod,
      amount,receipt,String(b.supportingDocument||"").trim()||null,b.date||new Date(),req.user.id,account.id])).rows[0];
    await client.query("UPDATE finance_accounts SET balance=balance+$1,updated_at=NOW() WHERE id=$2",[amount,account.id]);
    return {...inserted,accountName:account.account_name};
  });
  await audit({userId:req.user.id,action:"FINANCE_INCOME_RECORDED",entityType:"organization_finance",entityId:String(row.id),
    details:`${row.receiptNumber} - ${b.category} - ${row.accountName} - UGX ${amount}`,...metadata(req)});
  res.status(201).json(row);
}));
app.post("/api/finance/accounts",auth,requireFinance("create"),asyncRoute(async(req,res)=>{
  const b=req.body,type=String(b.accountType||"").toLowerCase(),openingBalance=Number(b.openingBalance||0),
    openingBalanceDate=String(b.openingBalanceDate||new Date().toISOString().slice(0,10));
  const allowed=["bank","cash","petty_cash","mobile_money","restricted"];
  if(!allowed.includes(type)||!String(b.accountName||"").trim()||!Number.isFinite(openingBalance)||openingBalance<0)
    return res.status(400).json({error:"Account name, valid account type and a non-negative opening balance are required"});
  if(!/^\d{4}-\d{2}-\d{2}$/.test(openingBalanceDate)||openingBalanceDate>new Date().toISOString().slice(0,10))
    return res.status(400).json({error:"Opening balance date must be today or an earlier valid date"});
  if(openingBalance>0&&!String(b.supportingDocument||"").trim())
    return res.status(400).json({error:"Upload a bank statement or supporting document for a non-zero opening balance"});
  if(type==="bank"&&(!String(b.bankName||"").trim()||!String(b.accountNumber||"").trim()))
    return res.status(400).json({error:"Bank name and account number are required for a bank account"});
  const code=String(b.accountCode||"").trim().toUpperCase()||reference("ACC");
  try {
    const row=await transaction(async client=>{
      const inserted=(await client.query(`INSERT INTO finance_accounts
        (account_code,account_name,account_type,bank_name,account_number,balance,opening_balance,opening_balance_date,
          notes,supporting_document,supporting_document_name,restricted,active,created_by,updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$6,$7,$8,$9,$10,$11,true,$12,NOW())
        RETURNING id,account_code AS "accountCode",account_name AS "accountName",account_type AS "accountType"`,
      [code,String(b.accountName).trim(),type,String(b.bankName||"").trim()||null,String(b.accountNumber||"").trim()||null,
        openingBalance,openingBalanceDate,String(b.notes||"").trim()||null,String(b.supportingDocument||"").trim()||null,
        String(b.attachmentName||"").trim()||null,type==="restricted"||Boolean(b.restricted),req.user.id])).rows[0];
      if(openingBalance>0){
        const financeDepartment=(await client.query("SELECT id FROM departments WHERE code='finance'")).rows[0];
        await client.query(`INSERT INTO organization_finance_entries
          (department_id,reference,entry_type,category,description,counterparty,payment_method,amount,status,
            supporting_document,transaction_date,recorded_by,approved_by,approved_at,finance_account_id)
          VALUES ($1,$2,'opening_balance','Opening Balance',$3,$4,'Opening balance',$5,'completed',$6,$7,$8,$8,NOW(),$9)`,
        [financeDepartment.id,reference("FIN-OPEN"),String(b.notes||"").trim()||`Opening balance for ${String(b.accountName).trim()}`,
          String(b.bankName||b.accountName).trim(),openingBalance,String(b.supportingDocument||"").trim(),openingBalanceDate,req.user.id,inserted.id]);
      }
      return inserted;
    });
    await audit({userId:req.user.id,action:"FINANCE_ACCOUNT_CREATED",entityType:"finance_account",entityId:String(row.id),
      details:`${code} - ${row.accountName} - ${type} - opening UGX ${openingBalance}`,...metadata(req)});
    res.status(201).json(row);
  } catch(error){if(error.code==="23505")return res.status(409).json({error:"That finance account code already exists"});throw error;}
}));
app.patch("/api/finance/accounts/:id",auth,requireFinance("edit"),asyncRoute(async(req,res)=>{
  const b=req.body,type=String(b.accountType||"").toLowerCase(),allowed=["bank","cash","petty_cash","mobile_money","restricted"];
  if(!allowed.includes(type)||!String(b.accountName||"").trim())return res.status(400).json({error:"Account name and valid account type are required"});
  if(type==="bank"&&(!String(b.bankName||"").trim()||!String(b.accountNumber||"").trim()))
    return res.status(400).json({error:"Bank name and account number are required for a bank account"});
  const row=await one(`UPDATE finance_accounts SET account_name=$1,account_type=$2,bank_name=$3,account_number=$4,
    restricted=$5,notes=$6,supporting_document=COALESCE($7,supporting_document),
    supporting_document_name=COALESCE($8,supporting_document_name),updated_at=NOW() WHERE id=$9 AND active=true
    RETURNING id,account_code AS "accountCode",account_name AS "accountName"`,
  [String(b.accountName).trim(),type,String(b.bankName||"").trim()||null,String(b.accountNumber||"").trim()||null,
    type==="restricted"||Boolean(b.restricted),String(b.notes||"").trim()||null,String(b.supportingDocument||"").trim()||null,
    String(b.attachmentName||"").trim()||null,req.params.id]);
  if(!row)return res.status(404).json({error:"Active finance account not found"});
  await audit({userId:req.user.id,action:"FINANCE_ACCOUNT_UPDATED",entityType:"finance_account",entityId:String(row.id),details:row.accountCode,...metadata(req)});
  res.json(row);
}));
app.delete("/api/finance/accounts/:id",auth,requireFinance("edit"),asyncRoute(async(req,res)=>{
  const row=await one(`UPDATE finance_accounts SET active=false,updated_at=NOW() WHERE id=$1 AND active=true
    RETURNING id,account_code AS "accountCode",account_name AS "accountName"`,[req.params.id]);
  if(!row)return res.status(404).json({error:"Active finance account not found"});
  await audit({userId:req.user.id,action:"FINANCE_ACCOUNT_DEACTIVATED",entityType:"finance_account",entityId:String(row.id),details:row.accountCode,...metadata(req)});
  res.json({ok:true});
}));
app.post("/api/finance/expenses",auth,requireFinance("create"),asyncRoute(async(req,res)=>{
  const b=req.body,amount=Number(b.amount);
  if(!b.supplier||!b.description||!b.category||!b.budgetLine||!b.departmentId||!Number.isFinite(amount)||amount<=0)
    return res.status(400).json({error:"Supplier, description, category, department, budget line and amount are required"});
  const number=reference("PV");
  const row=await one(`INSERT INTO finance_payment_vouchers
    (voucher_number,department_id,supplier,description,category,budget_line,amount,payment_method,status,supporting_document,requested_by)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'finance_review',$9,$10) RETURNING id,voucher_number AS "voucherNumber"`,
  [number,b.departmentId,String(b.supplier).trim(),String(b.description).trim(),String(b.category),String(b.budgetLine),
    amount,String(b.paymentMethod||"Bank transfer"),String(b.supportingDocument||"").trim()||null,req.user.id]);
  await audit({userId:req.user.id,action:"PAYMENT_VOUCHER_CREATED",entityType:"finance_voucher",entityId:String(row.id),
    details:`${number} - ${b.supplier} - UGX ${amount}`,...metadata(req)});
  res.status(201).json(row);
}));
app.post("/api/finance/investment-proposals/:id/review",auth,requireFinance("approve"),asyncRoute(async(req,res)=>{
  const decision=String(req.body.decision||"").toLowerCase(),analysis=String(req.body.analysis||"").trim(),recommendation=String(req.body.recommendation||"").trim();
  if(!["approve","reject","more_information"].includes(decision))return res.status(400).json({error:"Choose approve, reject, or request more information"});
  if(!analysis||!recommendation)return res.status(400).json({error:"Financial analysis and recommendation are required"});
  const result=await transaction(async client=>{
    const proposal=(await client.query("SELECT * FROM investment_proposals WHERE id=$1 AND status='financial_analysis' FOR UPDATE",[Number(req.params.id)])).rows[0];
    if(!proposal){const error=new Error("This proposal is no longer awaiting Finance analysis");error.status=409;throw error;}
    let next=decision==="approve"?"executive_approval":decision==="reject"?"finance_rejected":"investment_review",activityId=proposal.executive_activity_id;
    if(decision==="approve"){
      const department=(await client.query("SELECT id FROM departments WHERE code='investment'" )).rows[0];
      const activity=(await client.query(`INSERT INTO department_activities
        (department_id,reference,activity_type,title,description,amount,status,visibility_level,created_by)
        VALUES ($1,$2,'investment-proposal',$3,$4,$5,'pending_executive',4,$6)
        ON CONFLICT (reference) DO UPDATE SET status='pending_executive',description=EXCLUDED.description,updated_at=NOW()
        RETURNING id`,[department.id,`EXEC-${proposal.reference}`,proposal.title,`${proposal.description} - Finance: ${recommendation}`,proposal.estimated_cost,req.user.id])).rows[0];
      activityId=activity.id;
    }
    await client.query(`UPDATE investment_proposals SET status=$1,finance_reviewed_by=$2,finance_reviewed_at=NOW(),
      finance_analysis=$3,finance_recommendation=$4,executive_activity_id=COALESCE($5,executive_activity_id) WHERE id=$6`,
    [next,req.user.id,analysis,recommendation,activityId,proposal.id]);
    return {proposal,next};
  });
  await audit({userId:req.user.id,action:`FINANCE_INVESTMENT_${decision.toUpperCase()}`,entityType:"investment_proposal",
    entityId:String(result.proposal.id),details:`${result.proposal.reference} - ${recommendation}`,...metadata(req)});
  res.json({ok:true,status:result.next});
}));
app.post("/api/finance/entries/:id/review",auth,requireFinance("approve"),asyncRoute(async(req,res)=>{
  const decision=String(req.body.decision||"").toLowerCase();
  if(!["approve","reject"].includes(decision))return res.status(400).json({error:"Choose approve or reject"});
  const reviewed=await transaction(async client=>{
    const entry=(await client.query("SELECT * FROM organization_finance_entries WHERE id=$1 FOR UPDATE",[req.params.id])).rows[0];
    if(!entry){const error=new Error("Finance entry not found");error.status=404;throw error;}
    if(entry.status!=="pending_finance_review"){const error=new Error("Finance entry has already been reviewed");error.status=409;throw error;}
    if(Number(entry.recorded_by)===Number(req.user.id)){const error=new Error("Maker-checker rule: the originating officer cannot approve this entry");error.status=409;throw error;}
    if(decision==="reject") {
      await client.query("UPDATE organization_finance_entries SET status='rejected',approved_by=$1,approved_at=NOW() WHERE id=$2 AND status='pending_finance_review'",[req.user.id,entry.id]);
      const contribution=(await client.query(`UPDATE welfare_contributions SET status='rejected',verification_comment='Finance could not verify the submitted payment',verified_by=$1,verified_at=NOW()
        WHERE finance_entry_id=$2 AND status='pending_finance_review' RETURNING member_id,reference`,[req.user.id,entry.id])).rows[0];
      const investment=(await client.query(`UPDATE member_investment_applications SET status='finance_rejected',review_comment=COALESCE(review_comment,'')||' Finance could not verify the submitted payment.',updated_at=NOW()
        WHERE finance_entry_id=$1 AND status='finance_review' RETURNING member_id,reference`,[entry.id])).rows[0];
      const memberContribution=(await client.query(`UPDATE transactions SET status='rejected',verification_comment=COALESCE(verification_comment,'')||' Finance could not verify the receiving account.'
        WHERE finance_entry_id=$1 AND status='pending_finance_review' RETURNING member_id,reference`,[entry.id])).rows[0];
      const affected=contribution||investment||memberContribution;if(affected)await client.query("INSERT INTO notifications (member_id,title,message) VALUES ($1,$2,$3)",[affected.member_id,"Payment verification rejected",`${affected.reference} was rejected by Finance. Contact the organization or submit correct payment evidence.`]);
      return entry;
    }
    const account=(await client.query("SELECT * FROM finance_accounts WHERE id=$1 AND active=true FOR UPDATE",[Number(req.body.accountId)])).rows[0];
    if(!account){const error=new Error("Choose the reconciled Finance account");error.status=400;throw error;}
    if(entry.entry_type==="expense"&&Number(account.balance)<Number(entry.amount)){const error=new Error("The selected account has insufficient funds");error.status=409;throw error;}
    const operation=entry.entry_type==="income"?"+":"-";
    await client.query(`UPDATE finance_accounts SET balance=balance ${operation} $1 WHERE id=$2`,[entry.amount,account.id]);
    const update=await client.query("UPDATE organization_finance_entries SET status='completed',approved_by=$1,approved_at=NOW(),finance_account_id=$2 WHERE id=$3 AND status='pending_finance_review' RETURNING id",[req.user.id,account.id,entry.id]);
    if(update.rowCount!==1){const error=new Error("Finance entry has already been reviewed");error.status=409;throw error;}
    const contribution=(await client.query(`UPDATE welfare_contributions SET status='verified',receipt_number=COALESCE(receipt_number,$1),
      verification_comment='Payment received and verified by Finance',verified_by=$2,verified_at=NOW()
      WHERE finance_entry_id=$3 AND status='pending_finance_review' RETURNING member_id,reference,receipt_number`,[receiptReference("WRCPT"),req.user.id,entry.id])).rows[0];
    if(contribution)await client.query("INSERT INTO notifications (member_id,title,message) VALUES ($1,'Welfare contribution verified',$2)",
      [contribution.member_id,`${contribution.reference} was verified. Official receipt ${contribution.receipt_number} is now available.`]);
    const memberContribution=(await client.query(`UPDATE transactions SET status='completed',receipt_number=COALESCE(receipt_number,$1),
      verification_comment=COALESCE(verification_comment,'')||' Finance receiving account verified.',verified_at=NOW()
      WHERE finance_entry_id=$2 AND status='pending_finance_review' RETURNING member_id,reference,receipt_number`,
      [receiptReference("RCPT"),entry.id])).rows[0];
    if(memberContribution)await client.query("INSERT INTO notifications (member_id,title,message) VALUES ($1,'Annual subscription verified',$2)",
      [memberContribution.member_id,`${memberContribution.reference} was posted by Finance. Official receipt ${memberContribution.receipt_number} is available.`]);
    const application=(await client.query(`SELECT a.*,p.name AS project,p.target_amount,p.member_expected_return_rate,m.full_name AS member
      FROM member_investment_applications a JOIN investment_projects p ON p.id=a.project_id JOIN members m ON m.id=a.member_id
      WHERE a.finance_entry_id=$1 AND a.status='finance_review' FOR UPDATE`,[entry.id])).rows[0];
    if(application){const ownership=Number(application.target_amount)>0?Number(application.amount)/Number(application.target_amount)*100:0,expected=Number(application.amount)*Number(application.member_expected_return_rate||0)/100;
      const investor=(await client.query(`INSERT INTO investment_investors
        (project_id,member_id,investor_name,funding_source,amount_invested,ownership_percentage,expected_returns,investment_date,status,created_by)
        VALUES ($1,$2,$3,'Member investment',$4,$5,$6,CURRENT_DATE,'active',$7) RETURNING id`,
        [application.project_id,application.member_id,application.member,application.amount,ownership,expected,req.user.id])).rows[0];
      await client.query("UPDATE investment_projects SET raised_amount=raised_amount+$1,current_value=current_value+$1 WHERE id=$2",[application.amount,application.project_id]);
      await client.query("UPDATE member_investment_applications SET status='completed',investor_id=$1,updated_at=NOW() WHERE id=$2",[investor.id,application.id]);
      await client.query("INSERT INTO notifications (member_id,title,message) VALUES ($1,'Investment payment verified',$2)",[application.member_id,`${application.reference} is now a confirmed investment in ${application.project}.`]);
    }
    return entry;
  });
  await audit({userId:req.user.id,action:`FINANCE_ENTRY_${decision.toUpperCase()}`,entityType:"organization_finance_entry",entityId:String(reviewed.id),details:reviewed.reference,...metadata(req)});
  res.json({ok:true,status:decision==="approve"?"completed":"rejected"});
}));
app.post("/api/finance/vouchers/:id/decision",auth,requireFinance("approve"),asyncRoute(async(req,res)=>{
  const decision=String(req.body.decision||"").toLowerCase(),comment=String(req.body.comment||"").trim();
  if(!["approve","reject","return"].includes(decision)) return res.status(400).json({error:"Choose approve, reject, or return"});
  if(decision!=="approve"&&!comment) return res.status(400).json({error:"A comment is required"});
  const voucher=await one("SELECT * FROM finance_payment_vouchers WHERE id=$1",[req.params.id]);
  if(!voucher) return res.status(404).json({error:"Payment voucher not found"});
  if(Number(voucher.requested_by)===Number(req.user.id)) return res.status(403).json({error:"You cannot review your own payment request"});
  if(voucher.status!=="finance_review") return res.status(409).json({error:"This voucher is no longer awaiting Finance review"});
  let statusValue=decision==="reject"?"rejected":decision==="return"?"returned_for_correction":"executive_approval";
  let activityId=null;
  if(statusValue==="executive_approval") {
    const financeDepartment=await one("SELECT id FROM departments WHERE code='finance'");
    const activity=await one(`INSERT INTO department_activities
      (department_id,reference,activity_type,title,description,amount,status,visibility_level,created_by)
      VALUES ($1,$2,'finance-payment',$3,$4,$5,'pending_executive',4,$6) RETURNING id`,
    [financeDepartment.id,`EXEC-${voucher.voucher_number}`,`Payment voucher - ${voucher.supplier}`,voucher.description,voucher.amount,req.user.id]);
    activityId=activity.id;
  }
  await query(`UPDATE finance_payment_vouchers SET status=$1,finance_reviewed_by=$2,finance_comment=$3,
    finance_reviewed_at=NOW(),executive_activity_id=COALESCE($4,executive_activity_id) WHERE id=$5`,
  [statusValue,req.user.id,comment||"Finance review completed",activityId,voucher.id]);
  await audit({userId:req.user.id,action:`FINANCE_VOUCHER_${decision.toUpperCase()}`,entityType:"finance_voucher",
    entityId:String(voucher.id),details:`${voucher.voucher_number} - ${statusValue}`,...metadata(req)});
  res.json({ok:true,status:statusValue});
}));
app.post("/api/finance/vouchers/:id/process",auth,requireFinance("edit"),asyncRoute(async(req,res)=>{
  const processed=await transaction(async client=>{
    const voucher=(await client.query("SELECT * FROM finance_payment_vouchers WHERE id=$1 FOR UPDATE",[req.params.id])).rows[0];
    if(!voucher) { const error=new Error("Payment voucher not found"); error.status=404; throw error; }
    if(!["executive_approved"].includes(voucher.status)) { const error=new Error("Executive approval is required before payment can be processed"); error.status=409; throw error; }
    const account=(await client.query("SELECT * FROM finance_accounts WHERE id=$1 AND active=true FOR UPDATE",[Number(req.body.accountId)])).rows[0];
    if(!account||Number(account.balance)<Number(voucher.amount)) { const error=new Error("Select an account with sufficient funds"); error.status=400; throw error; }
    const debit=await client.query("UPDATE finance_accounts SET balance=balance-$1 WHERE id=$2 AND balance >= $1 RETURNING id",[voucher.amount,account.id]);
    if(debit.rowCount!==1) { const error=new Error("The account no longer has sufficient funds"); error.status=409; throw error; }
    const voucherUpdate=await client.query(`UPDATE finance_payment_vouchers SET status='processed',processed_by=$1,processed_at=NOW(),payment_method=COALESCE($2,payment_method)
      WHERE id=$3 AND status='executive_approved' RETURNING id`,[req.user.id,req.body.paymentMethod||null,voucher.id]);
    if(voucherUpdate.rowCount!==1) { const error=new Error("Payment voucher was already processed"); error.status=409; throw error; }
    const financeDepartment=(await client.query("SELECT id FROM departments WHERE code='finance'")).rows[0];
    await client.query(`INSERT INTO organization_finance_entries
      (department_id,reference,entry_type,category,description,counterparty,payment_method,amount,status,voucher_number,budget_line,
       supporting_document,transaction_date,recorded_by,approved_by,approved_at,finance_account_id)
      VALUES ($1,$2,'expense',$3,$4,$5,$6,$7,'completed',$8,$9,$10,CURRENT_DATE,$11,$12,NOW(),$13)`,
    [financeDepartment.id,reference("FIN-EXP"),voucher.category,voucher.description,voucher.supplier,
      req.body.paymentMethod||voucher.payment_method,voucher.amount,voucher.voucher_number,voucher.budget_line,voucher.supporting_document,req.user.id,
      voucher.executive_approved_by||voucher.finance_reviewed_by,account.id]);
    await client.query("UPDATE finance_budgets SET used_amount=used_amount+$1 WHERE department_id=$2 AND fiscal_period='FY 2026'",
      [voucher.amount,voucher.department_id]);
    const welfareRequest=(await client.query("SELECT id FROM welfare_requests WHERE finance_voucher_id=$1",[voucher.id])).rows[0];
    if(welfareRequest) {
      await client.query("UPDATE welfare_requests SET payment_status='paid',status='closed',closed_at=NOW() WHERE id=$1",[welfareRequest.id]);
      await client.query(`UPDATE welfare_payments SET status='paid',paid_at=NOW(),
        receipt_number=COALESCE(receipt_number,$2) WHERE request_id=$1`,[welfareRequest.id,voucher.voucher_number]);
    }
    return {voucher,account};
  });
  await audit({userId:req.user.id,action:"FINANCE_PAYMENT_PROCESSED",entityType:"finance_voucher",entityId:String(processed.voucher.id),
    details:`${processed.voucher.voucher_number} - ${processed.account.account_name} - UGX ${processed.voucher.amount}`,...metadata(req)});
  res.json({ok:true});
}));app.post("/api/finance/invoices",auth,requireFinance("create"),asyncRoute(async(req,res)=>{
  const b=req.body,amount=Number(b.amount);
  if(!b.invoiceNumber||!b.supplier||!b.description||!b.invoiceDate||!b.dueDate||!Number.isFinite(amount)||amount<=0)
    return res.status(400).json({error:"Invoice number, supplier, description, dates and amount are required"});
  try {
    const row=await one(`INSERT INTO finance_invoices
      (invoice_number,supplier,description,amount,invoice_date,due_date,status,supporting_document,created_by)
      VALUES ($1,$2,$3,$4,$5,$6,'unpaid',$7,$8) RETURNING id,invoice_number AS "invoiceNumber"`,
    [b.invoiceNumber,String(b.supplier).trim(),String(b.description).trim(),amount,b.invoiceDate,b.dueDate,
      String(b.supportingDocument||"").trim()||null,req.user.id]);
    await audit({userId:req.user.id,action:"FINANCE_INVOICE_RECORDED",entityType:"finance_invoice",entityId:String(row.id),details:b.invoiceNumber,...metadata(req)});
    res.status(201).json(row);
  } catch(error){if(error.code==="23505")return res.status(409).json({error:"That invoice number already exists"});throw error;}
}));
app.post("/api/finance/assets",auth,requireFinance("create"),asyncRoute(async(req,res)=>{
  const b=req.body,purchaseValue=Number(b.purchaseValue),currentValue=Number(b.currentValue||purchaseValue);
  if(!b.assetCode||!b.assetName||!b.assetType||!b.purchaseDate||!Number.isFinite(purchaseValue)||purchaseValue<=0)
    return res.status(400).json({error:"Asset code, name, type, purchase date and value are required"});
  try {
    const row=await one(`INSERT INTO finance_assets
      (asset_code,asset_name,asset_type,purchase_date,purchase_value,current_value,status,department_id,location,custodian,photo_url,supporting_document,created_by)
      VALUES ($1,$2,$3,$4,$5,$6,'active',$7,$8,$9,$10,$11,$12) RETURNING id,asset_code AS "assetCode"`,
    [b.assetCode,String(b.assetName).trim(),String(b.assetType),b.purchaseDate,purchaseValue,currentValue,b.departmentId||null,
      String(b.location||"").trim()||null,String(b.custodian||"").trim()||null,String(b.photoUrl||"").trim()||null,
      String(b.supportingDocument||"").trim()||null,req.user.id]);
    await audit({userId:req.user.id,action:"FINANCE_ASSET_REGISTERED",entityType:"finance_asset",entityId:String(row.id),details:b.assetCode,...metadata(req)});
    res.status(201).json(row);
  } catch(error){if(error.code==="23505")return res.status(409).json({error:"That asset code already exists"});throw error;}
}));
app.post("/api/finance/budgets",auth,requireFinance("create"),asyncRoute(async(req,res)=>{
  const b=req.body,allocated=Number(b.allocatedAmount),period=String(b.fiscalPeriod||"FY 2026").trim();
  if(!b.departmentId||!Number.isFinite(allocated)||allocated<=0)return res.status(400).json({error:"Department and positive budget allocation are required"});
  const row=await transaction(async client=>{
    const existing=(await client.query("SELECT id,used_amount,reference FROM finance_budgets WHERE department_id=$1 AND fiscal_period=$2 FOR UPDATE",[b.departmentId,period])).rows[0];
    if(existing&&allocated<Number(existing.used_amount)){const error=new Error("Allocation cannot be below the amount already used");error.status=400;throw error;}
    const budget=existing
      ?(await client.query("UPDATE finance_budgets SET allocated_amount=$1,status='pending_approval',approved_by=NULL WHERE id=$2 RETURNING id,reference",[allocated,existing.id])).rows[0]
      :(await client.query(`INSERT INTO finance_budgets (reference,department_id,fiscal_period,allocated_amount,status,created_by)
        VALUES ($1,$2,$3,$4,'pending_approval',$5) RETURNING id,reference`,[reference("BUD"),b.departmentId,period,allocated,req.user.id])).rows[0];
    const financeDepartment=(await client.query("SELECT id FROM departments WHERE code='finance'")).rows[0];
    const activity=(await client.query(`INSERT INTO department_activities
      (department_id,reference,activity_type,title,description,amount,status,visibility_level,created_by)
      VALUES ($1,$2,'finance-budget',$3,$4,$5,'pending_executive',4,$6)
      ON CONFLICT (reference) DO UPDATE SET title=EXCLUDED.title,description=EXCLUDED.description,amount=EXCLUDED.amount,status='pending_executive',updated_at=NOW()
      RETURNING id`,[financeDepartment.id,`EXEC-${budget.reference}`,`Budget approval - ${period}`,`Department ${b.departmentId} allocation`,allocated,req.user.id])).rows[0];
    await client.query("UPDATE finance_budgets SET executive_activity_id=$1 WHERE id=$2",[activity.id,budget.id]);
    return budget;
  });
  await audit({userId:req.user.id,action:"FINANCE_BUDGET_SUBMITTED",entityType:"finance_budget",entityId:String(row.id),details:`${row.reference} - UGX ${allocated}`,...metadata(req)});
  res.status(202).json({...row,status:"pending_approval"});
}));app.post("/api/finance/procurements",auth,requireFinance("create"),asyncRoute(async(req,res)=>{
  const b=req.body,amount=Number(b.estimatedAmount);
  if(!b.departmentId||!b.itemDescription||!Number.isFinite(amount)||amount<=0)
    return res.status(400).json({error:"Department, item description and estimated amount are required"});
  const row=await one(`INSERT INTO finance_procurements
    (reference,department_id,item_description,supplier,estimated_amount,stage,status,requested_by)
    VALUES ($1,$2,$3,$4,$5,'department_request','open',$6) RETURNING id,reference`,
  [reference("PROC"),b.departmentId,String(b.itemDescription).trim(),String(b.supplier||"").trim()||null,amount,req.user.id]);
  await audit({userId:req.user.id,action:"PROCUREMENT_REQUEST_CREATED",entityType:"procurement",entityId:String(row.id),details:row.reference,...metadata(req)});
  res.status(201).json(row);
}));
app.post("/api/finance/procurements/:id/advance",auth,requireFinance("edit"),asyncRoute(async(req,res)=>{
  const procurement=await one("SELECT * FROM finance_procurements WHERE id=$1",[req.params.id]);
  if(!procurement) return res.status(404).json({error:"Procurement record not found"});
  const sequence=["department_request","finance_review","executive_approval","purchase_order","goods_received","invoice","payment","closed"];
  const current=sequence.indexOf(procurement.stage),next=sequence[current+1];
  if(!next) return res.status(409).json({error:"Procurement is already closed"});
  if(next==="executive_approval"){
    const financeDepartment=await one("SELECT id FROM departments WHERE code='finance'");
    const activity=await one(`INSERT INTO department_activities
      (department_id,reference,activity_type,title,description,amount,status,visibility_level,created_by)
      VALUES ($1,$2,'finance-payment',$3,$4,$5,'pending_executive',4,$6) RETURNING id`,
    [financeDepartment.id,`EXEC-${procurement.reference}`,`Procurement - ${procurement.item_description}`,
      `Supplier: ${procurement.supplier||"TBD"}. Estimated UGX ${Number(procurement.estimated_amount).toLocaleString()}`,
      procurement.estimated_amount,req.user.id]);
    await query("UPDATE finance_procurements SET stage=$1,status='open',updated_at=NOW(),finance_reviewed_by=$2 WHERE id=$3",
      [next,req.user.id,procurement.id]);
    await audit({userId:req.user.id,action:"PROCUREMENT_SENT_TO_EXECUTIVE",entityType:"procurement",entityId:String(procurement.id),
      details:`${procurement.reference} - ${next} - activity ${activity.id}`,...metadata(req)});
    return res.json({ok:true,stage:next,executiveActivityId:activity.id});
  }
  await query("UPDATE finance_procurements SET stage=$1,status=$2,updated_at=NOW(),finance_reviewed_by=COALESCE(finance_reviewed_by,$3) WHERE id=$4",
    [next,next==="closed"?"closed":"open",req.user.id,procurement.id]);
  await audit({userId:req.user.id,action:"PROCUREMENT_STAGE_ADVANCED",entityType:"procurement",entityId:String(procurement.id),details:`${procurement.reference} - ${next}`,...metadata(req)});
  res.json({ok:true,stage:next});
}));
app.post("/api/finance/accounts/:id/reconcile",auth,requireFinance("edit"),asyncRoute(async(req,res)=>{
  const account=await one("UPDATE finance_accounts SET last_reconciled_at=NOW() WHERE id=$1 AND active=true RETURNING id,account_name",[req.params.id]);
  if(!account)return res.status(404).json({error:"Finance account not found"});
  await audit({userId:req.user.id,action:"BANK_ACCOUNT_RECONCILED",entityType:"finance_account",entityId:String(account.id),details:account.account_name,...metadata(req)});
  res.json({ok:true});
}));
app.get("/api/finance/search",auth,requireFinance("view"),asyncRoute(async(req,res)=>{
  const term=String(req.query.q||"").trim();if(term.length<2)return res.json({results:[]});
  const like=`%${term}%`;
  const results=await query(`SELECT * FROM (
    SELECT 'Income / Expense' AS type,f.reference,f.description AS title,
      COALESCE(f.receipt_number,f.voucher_number,f.counterparty,'') AS detail,'finance-cashbook' AS target
      FROM organization_finance_entries f WHERE f.reference ILIKE $1 OR f.receipt_number ILIKE $1 OR f.voucher_number ILIKE $1
        OR f.counterparty ILIKE $1 OR f.description ILIKE $1 OR f.amount::text ILIKE $1 OR f.transaction_date::text ILIKE $1
    UNION ALL SELECT 'Payment Voucher',v.voucher_number,v.supplier||' - '||v.description,v.status,'finance-vouchers'
      FROM finance_payment_vouchers v WHERE v.voucher_number ILIKE $1 OR v.supplier ILIKE $1 OR v.description ILIKE $1 OR v.amount::text ILIKE $1
    UNION ALL SELECT 'Invoice',i.invoice_number,i.supplier||' - '||i.description,i.status,'finance-invoices'
      FROM finance_invoices i WHERE i.invoice_number ILIKE $1 OR i.supplier ILIKE $1 OR i.description ILIKE $1 OR i.amount::text ILIKE $1
    UNION ALL SELECT 'Department Budget',b.reference,d.name,b.fiscal_period,'finance-budgets' FROM finance_budgets b JOIN departments d ON d.id=b.department_id
      WHERE b.reference ILIKE $1 OR d.name ILIKE $1
    UNION ALL SELECT 'Bank / Cash Account',a.account_code,a.account_name,COALESCE(a.bank_name,'Cash account'),'finance-bank'
      FROM finance_accounts a WHERE a.account_code ILIKE $1 OR a.account_name ILIKE $1 OR a.bank_name ILIKE $1 OR a.account_number ILIKE $1
    UNION ALL SELECT 'Asset',a.asset_code,a.asset_name,a.asset_type,'finance-assets'
      FROM finance_assets a WHERE a.asset_code ILIKE $1 OR a.asset_name ILIKE $1 OR a.asset_type ILIKE $1 OR a.location ILIKE $1
    UNION ALL SELECT 'Procurement',p.reference,p.item_description,COALESCE(p.supplier,p.stage),'finance-procurement'
      FROM finance_procurements p WHERE p.reference ILIKE $1 OR p.item_description ILIKE $1 OR p.supplier ILIKE $1
  ) finance_results LIMIT 80`,[like]);
  res.json({results:results.rows});
}));

function requireCredits(action="view") {
  return asyncRoute(async(req,res,next)=>{
    const access=await departmentPermission(req.user,"credits",action);
    if(!access) return res.status(403).json({error:`Your Credits assignment does not allow ${action} access`});
    req.creditsAccess=access;next();
  });
}
app.get("/api/credits/command-center",auth,requireCredits("view"),asyncRoute(async(req,res)=>{
  const [members,transactionsResult,loansResult,guarantors,recovery,charges,documents,summary,depositSummary,portfolioSummary,guarantorSummary]=await Promise.all([
    query(`SELECT m.id,m.member_number AS "memberNumber",m.full_name AS name,m.email,CASE WHEN m.provisional THEN NULL ELSE m.phone END AS phone,m.status,
      m.savings_balance::float AS savings,m.share_capital::float AS shares,m.joined_at AS "joinedAt",
      legacy.savings_balance::float AS "closingSavings",legacy.share_capital::float AS "closingShares",
      legacy.expected_savings::float AS "closingExpected",legacy.deficit_surplus::float AS "closingVariance",
      COALESCE((SELECT SUM(l.balance) FROM loans l WHERE l.member_id=m.id AND l.status IN ('active','overdue')),0)::float AS "outstandingBalance",
      COALESCE((SELECT COUNT(*) FROM loans l WHERE l.member_id=m.id AND l.status IN ('active','overdue')),0)::int AS "activeLoans",
      COALESCE((SELECT COUNT(*) FROM loan_guarantors lg JOIN loans l ON l.id=lg.loan_id
        WHERE lg.member_id=m.id AND lg.status='accepted' AND l.status IN ('active','overdue')),0)::int AS "guaranteesGiven",
      COALESCE((SELECT COUNT(*) FROM loan_guarantors lg JOIN loans l ON l.id=lg.loan_id
        WHERE l.member_id=m.id AND lg.status='accepted'),0)::int AS "guaranteesReceived"
      FROM members m LEFT JOIN legacy_member_opening_balances legacy ON legacy.id=m.legacy_opening_balance_id WHERE m.deleted_at IS NULL ORDER BY m.full_name`),
    query(`SELECT t.id,t.reference,t.receipt_number AS "receiptNumber",t.type,t.method,t.amount::float,
      t.status,t.external_reference AS "externalReference",t.notes,t.submission_source AS "submissionSource",
      (t.evidence_stored_name IS NOT NULL) AS "hasEvidence",t.evidence_original_name AS "evidenceName",
      t.verification_comment AS "verificationComment",t.target_fiscal_year AS "targetFiscalYear",t.created_at AS "createdAt",t.verified_at AS "verifiedAt",
      m.id AS "memberId",m.member_number AS "memberNumber",m.full_name AS member,u.full_name AS officer,
      verifier.full_name AS "verifiedBy",l.reference AS "loanReference"
      FROM transactions t JOIN members m ON m.id=t.member_id JOIN users u ON u.id=t.recorded_by
      LEFT JOIN users verifier ON verifier.id=t.verified_by LEFT JOIN loans l ON l.id=t.loan_id
      ORDER BY t.created_at DESC,t.id DESC LIMIT 150`),
    query(`SELECT l.id,l.reference,m.id AS "memberId",m.member_number AS "memberNumber",m.full_name AS member,
      CASE WHEN m.provisional THEN NULL ELSE m.phone END AS phone,m.email,m.status AS "memberStatus",
      CASE WHEN NULLIF(l.custom_product_name,'') IS NOT NULL THEN p.name||' ('||l.custom_product_name||')' ELSE p.name END AS product,
      l.custom_product_name AS "customProductName",p.annual_rate::float AS "annualRate",
      l.amount::float,l.balance::float,l.term_months AS "termMonths",l.processing_fee::float AS "processingFee",
      COALESCE((SELECT SUM(s.total_due) FROM loan_repayment_schedule s WHERE s.loan_id=l.id),
        ROUND((l.amount+(l.amount*(p.annual_rate/1200.0)*(l.term_months+1)/2.0))::numeric,2))::float AS "totalDue",
      COALESCE((SELECT SUM(s.paid_amount) FROM loan_repayment_schedule s WHERE s.loan_id=l.id),0)::float AS "totalPaid",
      COALESCE((SELECT SUM(s.interest) FROM loan_repayment_schedule s WHERE s.loan_id=l.id),
        ROUND((l.amount*(p.annual_rate/1200.0)*(l.term_months+1)/2.0)::numeric,2))::float AS "totalInterest",
      COALESCE((SELECT SUM(GREATEST(0,c.amount-c.paid_amount)) FROM loan_charges c WHERE c.loan_id=l.id AND c.status IN ('outstanding','partial') AND c.charge_type <> 'Processing fee'),0)::float AS "outstandingCharges",
      l.purpose,l.status,l.created_at AS "createdAt",l.due_date AS "dueDate",l.verified_amount::float AS "verifiedAmount",
      COALESCE(officer.full_name,'Unassigned') AS "officerHandling",
      COALESCE((SELECT MIN(s.due_date) FROM loan_repayment_schedule s
        WHERE s.loan_id=l.id AND s.status IN ('due','partial','upcoming') AND s.paid_amount<s.total_due),l.due_date) AS "nextDueDate",
      COALESCE((SELECT ROUND(((s.interest-s.interest_paid)+(s.principal-s.principal_paid))::numeric,2)::float
        FROM loan_repayment_schedule s WHERE s.loan_id=l.id AND s.status<>'paid'
        ORDER BY s.installment_number LIMIT 1),0)::float AS "nextPaymentAmount",
      (SELECT COUNT(*)::int FROM loan_repayment_schedule s WHERE s.loan_id=l.id) AS "totalInstallments",
      (SELECT COUNT(*)::int FROM loan_repayment_schedule s WHERE s.loan_id=l.id AND s.status='paid') AS "paidInstallments",
      GREATEST(0,CURRENT_DATE-(COALESCE((SELECT MIN(s.due_date) FROM loan_repayment_schedule s
        WHERE s.loan_id=l.id AND s.status<>'paid' AND s.due_date+5<CURRENT_DATE),CURRENT_DATE)))::int AS "daysOverdue",
      EXISTS (
        SELECT 1 FROM loan_repayment_schedule s
        WHERE s.loan_id=l.id AND s.status IN ('due','partial')
          AND s.due_date<=CURRENT_DATE AND s.due_date+5>=CURRENT_DATE
      ) AS "inDangerPeriod",
      COALESCE((SELECT ROUND(GREATEST(0,s.interest-COALESCE(s.interest_paid,0))::numeric,2)::float
        FROM loan_repayment_schedule s WHERE s.loan_id=l.id AND s.installment_number=1),0)::float AS "firstMonthInterestRemaining",
      ROUND((l.balance+COALESCE((
        SELECT GREATEST(0,s.interest-COALESCE(s.interest_paid,0))
        FROM loan_repayment_schedule s WHERE s.loan_id=l.id AND s.installment_number=1
      ),0))::numeric,2)::float AS "earlySettlementAmount"
      FROM loans l JOIN members m ON m.id=l.member_id JOIN loan_products p ON p.id=l.product_id
      LEFT JOIN users officer ON officer.id=l.recommended_by ORDER BY l.created_at DESC`),
    query(`SELECT lg.id,lg.loan_id AS "loanId",l.reference AS "loanReference",l.status AS "loanStatus",borrower.full_name AS borrower,
      guarantor.id AS "memberId",guarantor.member_number AS "memberNumber",guarantor.full_name AS guarantor,
      guarantor.savings_balance::float AS savings,l.amount::float AS "loanAmount",
      COALESCE(lg.guaranteed_amount,0)::float AS "guaranteedAmount",
      lg.status,lg.response_note AS note,
      lg.responded_at AS "respondedAt",lg.created_at AS "createdAt"
      FROM loan_guarantors lg JOIN loans l ON l.id=lg.loan_id JOIN members borrower ON borrower.id=l.member_id
      JOIN members guarantor ON guarantor.id=lg.member_id ORDER BY lg.id DESC`),
    query(`SELECT r.id,r.loan_id AS "loanId",l.reference AS "loanReference",m.full_name AS member,l.balance::float AS outstanding,
      GREATEST(0,CURRENT_DATE-COALESCE(l.due_date,CURRENT_DATE))::int AS "daysOverdue",r.action_type AS "actionType",
      r.notes,r.recovery_status AS "recoveryStatus",r.follow_up_date AS "followUpDate",r.created_at AS "createdAt",
      COALESCE(assignee.full_name,'Unassigned') AS "assignedTo",creator.full_name AS "createdBy"
      FROM loan_recovery_actions r JOIN loans l ON l.id=r.loan_id JOIN members m ON m.id=l.member_id
      JOIN users creator ON creator.id=r.created_by LEFT JOIN users assignee ON assignee.id=r.assigned_to
      ORDER BY r.created_at DESC`),
    query(`SELECT c.id,c.loan_id AS "loanId",l.reference AS "loanReference",m.full_name AS member,
      c.charge_type AS "chargeType",c.amount::float,c.status,c.reason,c.assessed_at AS "assessedAt"
      FROM loan_charges c JOIN loans l ON l.id=c.loan_id JOIN members m ON m.id=l.member_id ORDER BY c.assessed_at DESC`),
    query(`SELECT doc.id,doc.reference,doc.document_type AS "documentType",doc.title,doc.version,doc.status,
      doc.visibility_level AS "visibilityLevel",doc.file_name AS "fileName",doc.updated_at AS "updatedAt",
      EXISTS(SELECT 1 FROM organization_document_versions v WHERE v.document_id=doc.id) AS "hasFile"
      FROM organization_documents doc
      JOIN departments d ON d.id=doc.department_id WHERE doc.status<>'archived' AND (d.code='credits' OR (doc.status='published' AND doc.visibility_level<=2 AND doc.document_type IN ('Policies','Annual Reports')))
      ORDER BY doc.updated_at DESC`),
    query(`SELECT COUNT(*) FILTER (WHERE status='active')::int AS active_members,
      COALESCE(SUM(savings_balance) FILTER (WHERE status='active'),0)::float AS total_savings FROM members`),
    query(`SELECT
      COALESCE(SUM(amount) FILTER (WHERE type='Savings deposit' AND status='completed' AND created_at::date=CURRENT_DATE),0)::float AS deposits_today,
      COALESCE(SUM(amount) FILTER (WHERE type='Savings deposit' AND status='completed' AND created_at>=date_trunc('month',CURRENT_DATE)),0)::float AS deposits_month,
      COALESCE(SUM(ABS(amount)) FILTER (WHERE type='Withdrawal' AND status='completed' AND created_at>=date_trunc('month',CURRENT_DATE)),0)::float AS withdrawals_month,
      COALESCE(SUM(amount) FILTER (WHERE type='Loan repayment' AND status='completed' AND created_at>=date_trunc('month',CURRENT_DATE)),0)::float AS repayments_month
      FROM transactions`),
    query(`SELECT
      COUNT(*) FILTER (WHERE status IN ('active','overdue'))::int AS active,
      COUNT(*) FILTER (WHERE status='completed')::int AS completed,
      COUNT(*) FILTER (WHERE status IN ('pending','review','pending-guarantors','officer-review','committee-review','correction','finance-verification','executive-authorization'))::int AS pending,
      COUNT(*) FILTER (WHERE status='rejected')::int AS rejected,
      COUNT(*) FILTER (WHERE status='overdue' OR (balance>0 AND due_date<CURRENT_DATE))::int AS overdue,
      COUNT(*) FILTER (WHERE status='ready-disbursement')::int AS awaiting_disbursement,
      COALESCE(SUM(balance) FILTER (WHERE status IN ('active','overdue')),0)::float AS outstanding,
      COALESCE(SUM(amount) FILTER (WHERE disbursed_at>=date_trunc('month',CURRENT_DATE)),0)::float AS disbursed_month
      FROM loans`),
    query(`SELECT
      COUNT(*) FILTER (WHERE status='pending')::int AS pending,
      COUNT(*) FILTER (WHERE status='accepted')::int AS accepted,
      COUNT(*) FILTER (WHERE status='rejected')::int AS rejected
      FROM loan_guarantors`)
  ]);
  const contributionPolicy=await one(`SELECT id,fiscal_year_label AS "fiscalYear",starts_on AS "startsOn",ends_on AS "endsOn",
    monthly_savings_target::float AS "monthlySavingsTarget",annual_share_target::float AS "annualShareTarget",
    annual_subscription_fee::float AS "annualSubscriptionFee",COALESCE(opening_share_credit,0)::float AS "openingShareCredit",
    LEAST(12,GREATEST(0,(EXTRACT(YEAR FROM age(date_trunc('month',LEAST(CURRENT_DATE,ends_on+INTERVAL '1 day')),date_trunc('month',starts_on)))*12+
      EXTRACT(MONTH FROM age(date_trunc('month',LEAST(CURRENT_DATE,ends_on+INTERVAL '1 day')),date_trunc('month',starts_on))))::int)) AS "monthsDue"
    FROM member_financial_year_policies WHERE status='active' AND CURRENT_DATE BETWEEN starts_on AND ends_on
    ORDER BY starts_on DESC LIMIT 1`);
  const memberContributionRows=contributionPolicy?(await query(`SELECT member_id AS "memberId",
    COALESCE(SUM(amount) FILTER (WHERE type='Savings deposit' AND status='completed'),0)::float AS savings,
    COALESCE(SUM(amount) FILTER (WHERE type='Share purchase' AND status='completed'),0)::float AS shares,
    COALESCE(SUM(amount) FILTER (WHERE type='Annual subscription fee' AND status='completed'),0)::float AS subscription
    FROM transactions WHERE (target_fiscal_year=EXTRACT(YEAR FROM $2::date)::int OR (target_fiscal_year IS NULL AND created_at::date BETWEEN $1 AND $2)) GROUP BY member_id`,
    [contributionPolicy.startsOn,contributionPolicy.endsOn])).rows:[];
  const contributionsByMember=new Map(memberContributionRows.map(row=>[Number(row.memberId),row]));
  const pastPeriod=await one("SELECT id,fiscal_year AS year,period_end AS \"periodEnd\" FROM financial_reporting_periods ORDER BY period_end DESC LIMIT 1");
  const pastArrearsRows=pastPeriod?(await query(`SELECT member_id AS "memberId",COALESCE(SUM(amount),0)::float AS amount
    FROM transactions WHERE type='Savings deposit' AND status='completed' AND target_fiscal_year=$1 GROUP BY member_id`,[pastPeriod.year])).rows:[];
  const pastArrearsByMember=new Map(pastArrearsRows.map(row=>[Number(row.memberId),Number(row.amount)]));
  const expectedPerMember=contributionPolicy?Number(contributionPolicy.monthlySavingsTarget)*Number(contributionPolicy.monthsDue):0;
  members.rows.forEach(member=>{
    const paid=contributionsByMember.get(Number(member.id))||{savings:0,shares:0,subscription:0};
    member.currentYearSavings=Number(paid.savings);member.currentYearShares=Number(paid.shares);
    member.currentYearSubscription=Number(paid.subscription);member.expectedSavingsToDate=expectedPerMember;
    member.savingsVariance=Number(paid.savings)-expectedPerMember;
    member.totalMemberFunds=Number(member.savings)+Number(member.shares);
    member.pastYearPaidAtClose=Number(member.closingSavings||0);member.pastYearArrearsPaid=pastArrearsByMember.get(Number(member.id))||0;
    member.pastYearTotalPaid=member.pastYearPaidAtClose+member.pastYearArrearsPaid;member.pastYearExpected=Number(member.closingExpected||0);
    member.pastYearVariance=member.pastYearTotalPaid-member.pastYearExpected;
  });
  const activeContributionMembers=members.rows.filter(member=>member.status==='active');
  const pastContributionMembers=members.rows.filter(member=>member.closingExpected>0);
  const pastContributionProgress=pastPeriod?{fiscalYear:`FY ${Number(pastPeriod.year)-1}/${String(pastPeriod.year).slice(-2)}`,
    periodEnd:pastPeriod.periodEnd,expected:pastContributionMembers.reduce((sum,m)=>sum+m.pastYearExpected,0),
    paidAtClose:pastContributionMembers.reduce((sum,m)=>sum+m.pastYearPaidAtClose,0),
    arrearsPaid:pastContributionMembers.reduce((sum,m)=>sum+m.pastYearArrearsPaid,0),
    totalPaid:pastContributionMembers.reduce((sum,m)=>sum+m.pastYearTotalPaid,0),
    variance:pastContributionMembers.reduce((sum,m)=>sum+m.pastYearVariance,0)}:null;
  const contributionProgress=contributionPolicy?{
    fiscalYear:contributionPolicy.fiscalYear,monthsDue:Number(contributionPolicy.monthsDue),
    monthlySavingsTarget:Number(contributionPolicy.monthlySavingsTarget),
    annualSavingsTarget:Number(contributionPolicy.monthlySavingsTarget)*12,
    annualShareTarget:Number(contributionPolicy.annualShareTarget),annualSubscriptionFee:Number(contributionPolicy.annualSubscriptionFee),
    expectedSavingsToDate:expectedPerMember*activeContributionMembers.length,
    verifiedSavings:activeContributionMembers.reduce((sum,member)=>sum+member.currentYearSavings,0),
    expectedShares:activeContributionMembers.length*Number(contributionPolicy.annualShareTarget),
    verifiedShares:activeContributionMembers.reduce((sum,member)=>sum+member.currentYearShares,0),
    expectedSubscriptions:activeContributionMembers.length*Number(contributionPolicy.annualSubscriptionFee),
    verifiedSubscriptions:activeContributionMembers.reduce((sum,member)=>sum+member.currentYearSubscription,0),
    totalMemberFunds:activeContributionMembers.reduce((sum,member)=>sum+member.totalMemberFunds,0)
  }:null;
  const loanRows=await (await getLoanApprovals()).attachLoanApprovalMeta(loansResult.rows.map(loan=>({
    ...loan,
    canCurrentUserDecide:false
  })), req.user.id);
  const pendingStages=["pending","review","pending-guarantors","officer-review","committee-review","correction","executive-authorization"];
  const underReview=loanRows.filter(l=>pendingStages.includes(l.status));
  const overdueRows=loanRows.filter(l=>l.status==="overdue"||l.daysOverdue>0&&Number(l.balance)>0);
  const dangerRows=loanRows.filter(l=>l.inDangerPeriod&&Number(l.balance)>0);
  const totalSavings=summary.rows[0].total_savings;
  const outstanding=portfolioSummary.rows[0].outstanding;
  const availableFunds=Math.max(0,totalSavings-outstanding);
  const duePrincipal=(await one(`SELECT COALESCE(SUM(principal),0)::float AS amount FROM loan_repayment_schedule
    WHERE due_date<=CURRENT_DATE`)).amount;
  const paidPrincipal=(await one(`SELECT COALESCE(SUM(LEAST(paid_amount,principal)),0)::float AS amount FROM loan_repayment_schedule`)).amount;
  const recoveryRate=duePrincipal?Number((paidPrincipal/duePrincipal*100).toFixed(1)):0;
  const interestEarned=(await one(`SELECT COALESCE(SUM(LEAST(paid_amount,total_due)-LEAST(paid_amount,principal)),0)::float AS amount
    FROM loan_repayment_schedule WHERE paid_at>=date_trunc('month',CURRENT_DATE)`)).amount;
  const savingsThisMonth=depositSummary.rows[0].deposits_month;
  const previousSavings=(await one(`SELECT COALESCE(SUM(amount),0)::float AS amount FROM transactions
    WHERE type='Savings deposit' AND status='completed'
      AND created_at>=date_trunc('month',CURRENT_DATE)-INTERVAL '1 month'
      AND created_at<date_trunc('month',CURRENT_DATE)`)).amount;
  const savingsGrowth=previousSavings?Number(((savingsThisMonth-previousSavings)/previousSavings*100).toFixed(1)):0;
  const monthly=(await query(`WITH months AS (
      SELECT generate_series(date_trunc('month',CURRENT_DATE)-INTERVAL '5 months',date_trunc('month',CURRENT_DATE),INTERVAL '1 month') AS start_date)
    SELECT to_char(start_date,'Mon') AS month,
      COALESCE((SELECT SUM(m.savings_balance) FROM members m
        WHERE m.deleted_at IS NULL AND m.status='active'
          AND m.joined_at < start_date + INTERVAL '1 month'),0)::float AS savings,
      COALESCE((SELECT SUM(l.balance) FROM loans l
        WHERE l.status IN ('active','overdue')
          AND l.created_at < start_date + INTERVAL '1 month'),0)::float AS loans,
      COALESCE((SELECT SUM(amount) FROM loan_disbursements WHERE disbursed_at>=start_date AND disbursed_at<start_date+INTERVAL '1 month'),0)::float AS disbursed,
      COALESCE((SELECT SUM(GREATEST(0,LEAST(paid_amount,total_due)-LEAST(paid_amount,principal))) FROM loan_repayment_schedule WHERE paid_at>=start_date AND paid_at<start_date+INTERVAL '1 month'),0)::float AS interest
    FROM months ORDER BY start_date`)).rows;
  const activeGuarantees=guarantors.rows.filter(g=>g.status==="accepted");
  const overGuaranteed=members.rows.filter(member=>{
    const guaranteed=activeGuarantees.filter(g=>Number(g.memberId)===Number(member.id)).reduce((sum,g)=>sum+g.guaranteedAmount,0);
    return guaranteed>member.savings;
  }).length;
  const pendingMemberVerifications=transactionsResult.rows.filter(t=>t.status==="pending"&&t.submissionSource==="member");
  const pendingRepaymentVerifications=pendingMemberVerifications.filter(t=>t.type==="Loan repayment");
  const pendingContributionVerifications=pendingMemberVerifications.filter(t=>t.type!=="Loan repayment");
  const primaryCreditsOfficer=await getPrimaryCreditsOfficer({query});
  res.json({
    stats:{totalMembers:summary.rows[0].active_members,totalSavings,availableFunds,activeLoans:portfolioSummary.rows[0].active,
      pendingApplications:underReview.length,awaitingDisbursement:portfolioSummary.rows[0].awaiting_disbursement,
      overdueLoans:overdueRows.length,recoveryRate,interestEarned,savingsGrowth,
      pendingGuarantors:guarantorSummary.rows[0].pending,applicationsUnderReview:underReview.filter(l=>["review","officer-review","committee-review"].includes(l.status)).length,
      pendingRepaymentVerifications:pendingRepaymentVerifications.length,
      pendingContributionVerifications:pendingContributionVerifications.length},
    savings:{totalSavings,depositsToday:depositSummary.rows[0].deposits_today,monthlyDeposits:savingsThisMonth,
      withdrawals:depositSummary.rows[0].withdrawals_month,growth:savingsGrowth},
    portfolio:{active:portfolioSummary.rows[0].active,completed:portfolioSummary.rows[0].completed,
      pending:portfolioSummary.rows[0].pending,rejected:portfolioSummary.rows[0].rejected,arrears:overdueRows.length,
      outstanding,disbursedMonth:portfolioSummary.rows[0].disbursed_month},
    guarantorSummary:{...guarantorSummary.rows[0],overGuaranteed,totalActive:activeGuarantees.length,
      guaranteedAmount:activeGuarantees.reduce((sum,g)=>sum+g.guaranteedAmount,0)},
    members:members.rows,transactions:transactionsResult.rows,loans:loanRows,guarantors:guarantors.rows,
    contributionPolicy,contributionProgress,pastContributionProgress,
    recovery:recovery.rows,charges:charges.rows,documents:documents.rows,monthly,
    notifications:[
      pendingRepaymentVerifications.length&&{level:"warning",title:`${pendingRepaymentVerifications.length} loan repayment${pendingRepaymentVerifications.length===1?"":"s"} awaiting Credits Officer approval`,detail:`Review on Repayments${primaryCreditsOfficer?.name?` — ${primaryCreditsOfficer.name}`:""}`,target:"credits-repayments",transactionId:pendingRepaymentVerifications[0]?.id,createdAt:pendingRepaymentVerifications[0]?.createdAt},
      pendingContributionVerifications.length&&{level:"info",title:`${pendingContributionVerifications.length} member contribution${pendingContributionVerifications.length===1?"":"s"} awaiting verification`,detail:"Review on Savings",target:"credits-savings",transactionId:pendingContributionVerifications[0]?.id,createdAt:pendingContributionVerifications[0]?.createdAt},
      dangerRows.length&&{level:"danger",title:`${dangerRows.length} loan${dangerRows.length===1?"":"s"} in the 5-day grace danger window — remind members before the 5% principal penalty`,createdAt:dangerRows[0]?.nextDueDate||dangerRows[0]?.dueDate||dangerRows[0]?.createdAt},
      overdueRows.length&&{level:"danger",title:`${overdueRows.length} loan${overdueRows.length===1?" is":"s are"} overdue (after grace) and need recovery follow-up`,createdAt:overdueRows[0]?.dueDate||overdueRows[0]?.createdAt},
      underReview.length&&{level:"info",title:`${underReview.length} loan applications are moving through approval`,createdAt:underReview[0]?.createdAt},
      Number(guarantorSummary.rows[0].pending)>0&&{level:"warning",title:`${guarantorSummary.rows[0].pending} guarantor confirmations are pending`,createdAt:guarantors.rows.find(x=>x.status==="pending")?.createdAt},
      Number(savingsThisMonth)>0&&{level:"success",title:`Savings deposits this month total UGX ${Number(savingsThisMonth).toLocaleString()}`,createdAt:transactionsResult.rows.find(x=>x.type==="Savings deposit"&&x.status==="completed")?.verifiedAt||transactionsResult.rows.find(x=>x.type==="Savings deposit"&&x.status==="completed")?.createdAt},
      Number(depositSummary.rows[0].repayments_month)>0&&{level:"info",title:`Repayments this month total UGX ${Number(depositSummary.rows[0].repayments_month).toLocaleString()}`,createdAt:transactionsResult.rows.find(x=>x.type==="Loan repayment"&&x.status==="completed")?.verifiedAt||transactionsResult.rows.find(x=>x.type==="Loan repayment"&&x.status==="completed")?.createdAt}
    ].filter(Boolean),
    access:{authorityLevel:req.creditsAccess.authority_level,canCreate:Boolean(req.creditsAccess.can_create),
      canEdit:Boolean(req.creditsAccess.can_edit),canApprove:Boolean(req.creditsAccess.can_approve)},
    primaryCreditsOfficer:primaryCreditsOfficer?.name||null,
    verificationQueue:pendingMemberVerifications.slice(0,10).map(t=>({id:t.id,type:t.type,reference:t.reference,member:t.member,
      memberNumber:t.memberNumber,amount:t.amount,loanReference:t.loanReference,createdAt:t.createdAt,hasEvidence:t.hasEvidence}))
  });
}));
app.get("/api/credits/search",auth,requireCredits("view"),asyncRoute(async(req,res)=>{
  const term=String(req.query.q||"").trim();if(term.length<2)return res.json({results:[]});
  const like=`%${term}%`;
  const results=await query(`SELECT * FROM (
    SELECT 'Member' AS type,m.member_number AS reference,m.full_name AS title,COALESCE(m.phone,'') AS detail,'credits-members' AS target
      FROM members m WHERE m.deleted_at IS NULL AND (m.full_name ILIKE $1 OR m.member_number ILIKE $1 OR m.phone ILIKE $1)
    UNION ALL SELECT 'Loan',l.reference,m.full_name||' - '||p.name,l.status,'credits-applications'
      FROM loans l JOIN members m ON m.id=l.member_id JOIN loan_products p ON p.id=l.product_id
      WHERE l.reference ILIKE $1 OR m.full_name ILIKE $1 OR p.name ILIKE $1
    UNION ALL SELECT 'SACCO transaction',t.reference,m.full_name||' - '||t.type,
      COALESCE(t.receipt_number,t.external_reference,t.status),'credits-savings'
      FROM transactions t JOIN members m ON m.id=t.member_id
      WHERE t.reference ILIKE $1 OR t.receipt_number ILIKE $1 OR t.external_reference ILIKE $1 OR m.full_name ILIKE $1
    UNION ALL SELECT 'Guarantor',l.reference,g.full_name,b.full_name||' - '||lg.status,'credits-guarantors'
      FROM loan_guarantors lg JOIN loans l ON l.id=lg.loan_id JOIN members g ON g.id=lg.member_id JOIN members b ON b.id=l.member_id
      WHERE g.full_name ILIKE $1 OR g.member_number ILIKE $1 OR l.reference ILIKE $1
  ) credit_results LIMIT 80`,[like]);
  res.json({results:results.rows});
}));
app.post("/api/credits/deposits",auth,requireCredits("create"),asyncRoute(async(req,res)=>{
  const b=req.body,amount=Number(b.amount),memberId=Number(b.memberId);
  if(!Number.isInteger(memberId)||!Number.isFinite(amount)||amount<=0||!b.method)
    return res.status(400).json({error:"Active member, payment method and a positive amount are required"});
  const member=await one("SELECT id FROM members WHERE id=$1 AND status='active'",[memberId]);
  if(!member||!Number.isFinite(amount)||amount<=0||!b.method) return res.status(400).json({error:"Active member, payment method and a positive amount are required"});
  const txRef=reference("TRX"),receipt=receiptReference("RCPT");
  const row=await one(`INSERT INTO transactions
    (reference,receipt_number,member_id,type,method,amount,status,external_reference,notes,recorded_by)
    VALUES ($1,$2,$3,'Savings deposit',$4,$5,'pending',$6,$7,$8)
    RETURNING id,reference,receipt_number AS "receiptNumber"`,
  [txRef,receipt,member.id,String(b.method),amount,String(b.externalReference||"").trim()||null,String(b.notes||"").trim()||null,req.user.id]);
  await audit({userId:req.user.id,action:"SACCO_DEPOSIT_RECORDED",entityType:"transaction",entityId:String(row.id),details:`${receipt} - UGX ${amount}`,...metadata(req)});
  res.status(201).json(row);
}));
const memberLoanActionRoles=new Set(["Executive Officer","Credits Officer","System Admin"]);
const receiptEvidenceTypes=new Set(["image/jpeg","image/png","image/webp","application/pdf"]);
async function firstMonthInterestRemaining(client,loanId){
  const row=(await client.query(`SELECT GREATEST(0,interest-COALESCE(interest_paid,0))::float AS remaining
    FROM loan_repayment_schedule WHERE loan_id=$1 AND installment_number=1`,[loanId])).rows[0];
  return Number(row?.remaining||0);
}
async function applyLoanRepayment(client,loanId,amount,options={}){
  // Early full settlement always includes unpaid first-month interest; later months' interest is waived.
  const settleEarlyFull=!!(options.settleEarlyFull||options.settlePrincipalOnly);
  const loan=(await client.query("SELECT * FROM loans WHERE id=$1 FOR UPDATE",[loanId])).rows[0];
  if(!loan||!["active","overdue"].includes(loan.status)){const error=new Error("Choose an active loan and enter a positive repayment");error.status=400;throw error;}
  let remaining=amount,chargeApplied=0,interestApplied=0,principalApplied=0;
  const charges=(await client.query(`SELECT * FROM loan_charges WHERE loan_id=$1 AND status IN ('outstanding','partial')
    AND charge_type <> 'Processing fee' ORDER BY assessed_at,id FOR UPDATE`,[loan.id])).rows;
  for(const charge of charges){
    if(remaining<=0)break;
    const due=Math.max(0,Number(charge.amount)-Number(charge.paid_amount||0));
    const applied=Math.min(remaining,due);
    if(applied<=0)continue;
    const paid=Number(charge.paid_amount||0)+applied;
    await client.query("UPDATE loan_charges SET paid_amount=$1,status=$2,settled_at=CASE WHEN $2='settled' THEN NOW() ELSE NULL END WHERE id=$3",
      [paid,paid>=Number(charge.amount)-0.005?"settled":"partial",charge.id]);
    chargeApplied+=applied; remaining-=applied;
  }
  const schedules=(await client.query("SELECT * FROM loan_repayment_schedule WHERE loan_id=$1 AND status<>'paid' ORDER BY installment_number FOR UPDATE",[loan.id])).rows;
  if(settleEarlyFull){
    const firstMonthInterest=await firstMonthInterestRemaining(client,loan.id);
    const settlementCap=Math.max(0,Number(loan.balance))+firstMonthInterest;
    if(remaining>settlementCap+0.005){const error=new Error("Pay in full cannot exceed remaining principal plus first-month interest");error.status=400;throw error;}
    if(firstMonthInterest>0&&remaining>0){
      const first=(await client.query(`SELECT * FROM loan_repayment_schedule WHERE loan_id=$1 AND installment_number=1 FOR UPDATE`,[loan.id])).rows[0];
      if(first&&first.status!=="paid"){
        const interestDue=Math.max(0,Number(first.interest)-Number(first.interest_paid||0));
        const interestPart=Math.min(remaining,interestDue);
        if(interestPart>0){
          remaining-=interestPart; interestApplied+=interestPart;
          const newInterest=Number(first.interest_paid||0)+interestPart;
          const newPrincipal=Number(first.principal_paid||0);
          const newPaid=newInterest+newPrincipal;
          const rowPaid=newPrincipal>=Number(first.principal)-0.005&&newInterest>=Number(first.interest)-0.005;
          await client.query(`UPDATE loan_repayment_schedule SET interest_paid=$1,principal_paid=$2,paid_amount=$3,status=$4,
            paid_at=CASE WHEN $4='paid' THEN NOW() ELSE paid_at END WHERE id=$5`,[newInterest,newPrincipal,newPaid,rowPaid?"paid":"partial",first.id]);
        }
      }
    }
    const unpaid=(await client.query("SELECT * FROM loan_repayment_schedule WHERE loan_id=$1 AND status<>'paid' ORDER BY installment_number FOR UPDATE",[loan.id])).rows;
    for(const schedule of unpaid){
      if(remaining<=0)break;
      const principalDue=Math.max(0,Number(schedule.principal)-Number(schedule.principal_paid||0));
      const principalPart=Math.min(remaining,principalDue);
      if(principalPart<=0)continue;
      remaining-=principalPart; principalApplied+=principalPart;
      const newPrincipal=Number(schedule.principal_paid||0)+principalPart;
      const newInterest=Number(schedule.interest_paid||0);
      const newPaid=newInterest+newPrincipal;
      const rowPaid=newPrincipal>=Number(schedule.principal)-0.005&&newInterest>=Number(schedule.interest)-0.005;
      await client.query(`UPDATE loan_repayment_schedule SET interest_paid=$1,principal_paid=$2,paid_amount=$3,status=$4,
        paid_at=CASE WHEN $4='paid' THEN NOW() ELSE paid_at END WHERE id=$5`,[newInterest,newPrincipal,newPaid,rowPaid?"paid":"partial",schedule.id]);
    }
    if(remaining>0.005){const error=new Error("Full settlement exceeds remaining principal plus first-month interest");error.status=400;throw error;}
    const newBalance=Math.max(0,Number(loan.balance)-principalApplied);
    if(newBalance<0.005){
      await client.query(`UPDATE loan_repayment_schedule SET interest_paid=interest,principal_paid=principal,paid_amount=total_due,status='paid',paid_at=COALESCE(paid_at,NOW())
        WHERE loan_id=$1 AND status<>'paid'`,[loan.id]);
      await client.query("UPDATE loans SET balance=0,status='completed' WHERE id=$1",[loan.id]);
      return {loan,chargeApplied,interestApplied,principalApplied,newBalance:0,settledEarlyFull:true,settledPrincipalOnly:true};
    }
    await client.query("UPDATE loans SET balance=$1,status='active' WHERE id=$2",[newBalance,loan.id]);
    return {loan,chargeApplied,interestApplied,principalApplied,newBalance,settledEarlyFull:true,settledPrincipalOnly:true};
  }
  for(const schedule of schedules){
    if(remaining<=0)break;
    const interestDue=Math.max(0,Number(schedule.interest)-Number(schedule.interest_paid||0));
    const interestPart=Math.min(remaining,interestDue);
    remaining-=interestPart; interestApplied+=interestPart;
    const principalDue=Math.max(0,Number(schedule.principal)-Number(schedule.principal_paid||0));
    const principalPart=Math.min(remaining,principalDue);
    remaining-=principalPart; principalApplied+=principalPart;
    const newInterest=Number(schedule.interest_paid||0)+interestPart;
    const newPrincipal=Number(schedule.principal_paid||0)+principalPart;
    const newPaid=newInterest+newPrincipal;
    const paid=newInterest>=Number(schedule.interest)-0.005&&newPrincipal>=Number(schedule.principal)-0.005;
    await client.query(`UPDATE loan_repayment_schedule SET interest_paid=$1,principal_paid=$2,paid_amount=$3,status=$4,
      paid_at=CASE WHEN $4='paid' THEN NOW() ELSE paid_at END WHERE id=$5`,[newInterest,newPrincipal,newPaid,paid?"paid":"partial",schedule.id]);
  }
  if(remaining>0.005){const error=new Error("Repayment exceeds outstanding interest and principal");error.status=400;throw error;}
  const newBalance=Math.max(0,Number(loan.balance)-principalApplied);
  const outstanding=(await client.query(`SELECT
    COALESCE((SELECT SUM(amount-paid_amount) FROM loan_charges WHERE loan_id=$1 AND status IN ('outstanding','partial') AND charge_type <> 'Processing fee'),0)+
    COALESCE((SELECT SUM((interest-interest_paid)+(principal-principal_paid)) FROM loan_repayment_schedule WHERE loan_id=$1 AND status<>'paid'),0) AS total`,[loan.id])).rows[0];
  const completed=newBalance<0.005&&Number(outstanding.total)<0.005;
  await client.query("UPDATE loans SET balance=$1,status=$2 WHERE id=$3",[newBalance,completed?"completed":"active",loan.id]);
  return {loan,chargeApplied,interestApplied,principalApplied,newBalance,settledPrincipalOnly:false};
}
const optionalReceiptUpload=(req,res,next)=>{
  if(String(req.headers["content-type"]||"").includes("multipart/form-data")) return upload.single("receipt")(req,res,next);
  next();
};
app.post("/api/credits/repayments",auth,optionalReceiptUpload,asyncRoute(async(req,res)=>{
  const creditAccess=await departmentPermission(req.user,"credits","create");
  // Executive / other oversight roles may view only — repayments must go through Credits officers or the member portal
  const oversightAccess=false;
  if(!creditAccess&&!req.user.member_id){
    if(req.file) fs.unlink(path.join(uploadsDir,req.file.filename),()=>{});
    return res.status(403).json({error:"Credits repayment authority or a linked member account is required"});
  }
  const b=req.body,amount=Number(b.amount),loanId=Number(b.loanId);
  if(!Number.isInteger(loanId)||!Number.isFinite(amount)||amount<=0){
    if(req.file) fs.unlink(path.join(uploadsDir,req.file.filename),()=>{});
    return res.status(400).json({error:"Choose an active loan and enter a positive repayment"});
  }
  const method=String(b.method||"Cash").trim();
  if(!["Mobile Money","Bank transfer","Cheque","Cash"].includes(method)){
    if(req.file) fs.unlink(path.join(uploadsDir,req.file.filename),()=>{});
    return res.status(400).json({error:"Choose a valid payment method"});
  }
  const externalReference=String(b.externalReference||"").trim();
  const fromMember=!creditAccess&&!oversightAccess;
  if(fromMember){
    if(!req.file){return res.status(400).json({error:"Upload a receipt photo or PDF showing the loan payment"});}
    if(!receiptEvidenceTypes.has(req.file.mimetype)){fs.unlink(path.join(uploadsDir,req.file.filename),()=>{});return res.status(400).json({error:"Payment evidence must be a JPG, PNG, WebP or PDF file"});}
  }
  if((fromMember||req.file)&&externalReference.length<3){
    if(req.file) fs.unlink(path.join(uploadsDir,req.file.filename),()=>{});
    return res.status(400).json({error:"Enter the payment transaction reference"});
  }
  const txRef=reference("RPY");
  const settleEarlyFull=["1","true","yes","on"].includes(String(b.settleFull||"").toLowerCase());
  const settlementMarker="[EARLY_SETTLEMENT_FULL]";
  if(fromMember){
    let pendingRow;
    try{
      pendingRow=await transaction(async client=>{
        const loan=(await client.query("SELECT * FROM loans WHERE id=$1 FOR UPDATE",[loanId])).rows[0];
        if(!loan||!["active","overdue"].includes(loan.status)){const error=new Error("Choose an active loan and enter a positive repayment");error.status=400;throw error;}
        if(Number(req.user.member_id)!==Number(loan.member_id)){const error=new Error("You can only repay your own loan");error.status=403;throw error;}
        if(settleEarlyFull){
          const firstInterest=await firstMonthInterestRemaining(client,loan.id);
          const settlementCap=Number(loan.balance)+firstInterest;
          if(amount>settlementCap+0.005){const error=new Error("Pay in full uses remaining principal plus first-month interest");error.status=400;throw error;}
        }else{
          const scheduleDue=(await client.query(`SELECT COALESCE(SUM((interest-interest_paid)+(principal-principal_paid)),0)::float AS total
            FROM loan_repayment_schedule WHERE loan_id=$1 AND status<>'paid'`,[loan.id])).rows[0];
          if(amount>Number(scheduleDue.total)+0.005){const error=new Error("Repayment exceeds outstanding interest and principal");error.status=400;throw error;}
        }
        const noteParts=[String(b.notes||"").trim(),settleEarlyFull?settlementMarker:""].filter(Boolean);
        const row=(await client.query(`INSERT INTO transactions
          (reference,member_id,loan_id,type,method,amount,status,external_reference,notes,recorded_by,submission_source,
           evidence_stored_name,evidence_original_name,evidence_mime_type)
          VALUES ($1,$2,$3,'Loan repayment',$4,$5,'pending',$6,$7,$8,'member',$9,$10,$11) RETURNING id,reference,status`,
        [txRef,loan.member_id,loan.id,method,amount,externalReference||null,noteParts.join(" ")||null,req.user.id,
          req.file.filename,req.file.originalname,req.file.mimetype])).rows[0];
        await client.query("INSERT INTO notifications (member_id,title,message) VALUES ($1,$2,$3)",
          [loan.member_id,"Loan repayment submitted",`${txRef} is awaiting Credits Officer verification before your loan progress updates.`]);
        await notifyCreditsVerificationQueue(client,{
          title:"Loan repayment awaiting approval",
          message:`${txRef} — UGX ${Number(amount).toLocaleString()} loan payment with receipt evidence.`,
          kind:"repayment"
        });
        return row;
      });
    }catch(error){
      if(req.file) fs.unlink(path.join(uploadsDir,req.file.filename),()=>{});
      throw error;
    }
    await audit({userId:req.user.id,action:"MEMBER_LOAN_REPAYMENT_SUBMITTED",entityType:"transaction",entityId:String(pendingRow.id),details:`${txRef} - UGX ${amount}`,...metadata(req)});
    return res.status(201).json({ok:true,reference:txRef,status:"pending",message:"Loan payment sent to the Credits Officer for approval. Your progress will update after verification."});
  }
  const receipt=receiptReference("RCPT");
  let allocation;
  try{
    allocation=await transaction(async client=>{
      const result=await applyLoanRepayment(client,loanId,amount,{settleEarlyFull});
      const noteParts=[String(b.notes||"").trim(),settleEarlyFull?settlementMarker:"",
        `charges=${result.chargeApplied.toFixed(2)}, interest=${result.interestApplied.toFixed(2)}, principal=${result.principalApplied.toFixed(2)}`].filter(Boolean);
      await client.query(`INSERT INTO transactions
        (reference,receipt_number,member_id,loan_id,type,method,amount,status,external_reference,notes,recorded_by,verified_by,verified_at,
         submission_source,evidence_stored_name,evidence_original_name,evidence_mime_type)
        VALUES ($1,$2,$3,$4,'Loan repayment',$5,$6,'completed',$7,$8,$9,$9,NOW(),'staff',$10,$11,$12)`,
      [txRef,receipt,result.loan.member_id,result.loan.id,method,amount,externalReference||null,
        noteParts.join(" | ").slice(0,1000),req.user.id,
        req.file?.filename||null,req.file?.originalname||null,req.file?.mimetype||null]);
      return result;
    });
  }catch(error){
    if(req.file) fs.unlink(path.join(uploadsDir,req.file.filename),()=>{});
    throw error;
  }
  await audit({userId:req.user.id,action:"LOAN_REPAYMENT_RECORDED",entityType:"loan",entityId:String(allocation.loan.id),details:`${receipt} - UGX ${amount}`,...metadata(req)});
  res.status(201).json({ok:true,reference:txRef,receiptNumber:receipt,allocation:{charges:allocation.chargeApplied,interest:allocation.interestApplied,principal:allocation.principalApplied},balance:allocation.newBalance});
}));
app.post("/api/credits/withdrawals",auth,requireCredits("create"),asyncRoute(async(req,res)=>{
  const b=req.body,amount=Number(b.amount),memberId=Number(b.memberId);
  if(!Number.isInteger(memberId)||!Number.isFinite(amount)||amount<=0||!b.reason)
    return res.status(400).json({error:"Member, amount and reason are required"});
  const member=await one("SELECT * FROM members WHERE id=$1",[memberId]);
  const minimum=Number((await one("SELECT value FROM settings WHERE key='minimumBalance'")).value);
  if(!member||!Number.isFinite(amount)||amount<=0||!b.reason) return res.status(400).json({error:"Member, amount and reason are required"});
  if(Number(member.savings_balance)-amount<minimum) return res.status(400).json({error:`A minimum savings balance of UGX ${minimum.toLocaleString()} must remain`});
  const activeSecurity=(await one("SELECT COALESCE(SUM(balance),0)::float AS amount FROM loans WHERE member_id=$1 AND status IN ('active','overdue')",[member.id])).amount;
  if(Number(activeSecurity)>0) return res.status(400).json({error:"Savings and shares cannot be withdrawn while a loan is active, under the signed loan agreement"});
  const row=await one(`INSERT INTO withdrawals (reference,member_id,amount,method,reason,status,requested_by)
    VALUES ($1,$2,$3,$4,$5,'pending',$6) RETURNING id,reference`,
  [reference("WD"),member.id,amount,String(b.method||"Mobile Money"),String(b.reason).trim(),req.user.id]);
  res.status(201).json(row);
}));
app.post("/api/credits/recovery/:loanId",auth,requireCredits("edit"),asyncRoute(async(req,res)=>{
  const b=req.body,loanId=Number(req.params.loanId);
  if(!Number.isInteger(loanId))return res.status(400).json({error:"Choose a valid overdue loan"});
  const loan=await one("SELECT id,reference FROM loans WHERE id=$1 AND (status='overdue' OR due_date<CURRENT_DATE)",[loanId]);
  if(!loan||!b.actionType||!String(b.notes||"").trim()) return res.status(400).json({error:"Choose an overdue loan, action type and notes"});
  const row=await one(`INSERT INTO loan_recovery_actions
    (loan_id,action_type,notes,recovery_status,follow_up_date,assigned_to,created_by)
    VALUES ($1,$2,$3,'open',$4,$5,$6) RETURNING id`,
  [loan.id,String(b.actionType),String(b.notes).trim(),b.followUpDate||null,b.assignedTo||req.user.id,req.user.id]);
  await audit({userId:req.user.id,action:"LOAN_RECOVERY_ACTION",entityType:"loan",entityId:String(loan.id),details:`${loan.reference} - ${b.actionType}`,...metadata(req)});
  res.status(201).json(row);
}));
app.post("/api/credits/charges",auth,requireCredits("edit"),asyncRoute(async(req,res)=>{
  const b=req.body,amount=Number(b.amount),loanId=Number(b.loanId);
  if(!Number.isInteger(loanId)||!Number.isFinite(amount)||amount<=0||!b.chargeType)
    return res.status(400).json({error:"Loan, charge type and positive amount are required"});
  const loan=await one("SELECT id,reference FROM loans WHERE id=$1",[loanId]);
  if(!loan||!b.chargeType||!Number.isFinite(amount)||amount<=0) return res.status(400).json({error:"Loan, charge type and positive amount are required"});
  const row=await one(`INSERT INTO loan_charges (loan_id,charge_type,amount,status,reason,assessed_by)
    VALUES ($1,$2,$3,'outstanding',$4,$5) RETURNING id`,[loan.id,String(b.chargeType),amount,String(b.reason||"").trim()||null,req.user.id]);
  await audit({userId:req.user.id,action:"LOAN_CHARGE_ASSESSED",entityType:"loan",entityId:String(loan.id),details:`${b.chargeType} - UGX ${amount}`,...metadata(req)});
  res.status(201).json(row);
}));
app.post("/api/credits/charges/:id/waive",auth,requireCredits("approve"),asyncRoute(async(req,res)=>{
  const reason=String(req.body.reason||"").trim();
  if(!reason)return res.status(400).json({error:"A waiver reason is required"});
  const row=await one(`UPDATE loan_charges SET status='waived',reason=$1,waived_by=$2,waived_at=NOW()
    WHERE id=$3 AND status='outstanding' RETURNING id,loan_id`,[reason,req.user.id,req.params.id]);
  if(!row)return res.status(409).json({error:"Charge is not available for waiver"});
  await audit({userId:req.user.id,action:"LOAN_CHARGE_WAIVED",entityType:"loan_charge",entityId:String(row.id),details:reason,...metadata(req)});
  res.json({ok:true});
}));

function requireInvestment(action="view") {
  return asyncRoute(async(req,res,next)=>{
    const access=await departmentPermission(req.user,"investment",action);
    if(!access) return res.status(403).json({error:`Your Investment assignment does not allow ${action} access`});
    req.investmentAccess=access;next();
  });
}
app.get("/api/investment/command-center",auth,requireInvestment("view"),asyncRoute(async(req,res)=>{
  const [projects,transactionsResult,proposals,investors,contracts,assets,documents,memberApplications]=await Promise.all([
    query(`SELECT p.id,p.reference,p.name,p.description,p.category,p.location,p.target_amount::float AS budget,
      p.raised_amount::float AS "capitalInvested",p.current_value::float AS "currentValue",
      p.expected_return::float AS "expectedReturn",p.status,p.performance_status AS "performanceStatus",
      p.starts_on AS "startsOn",p.ends_on AS "endsOn",p.manager_name AS manager,
      p.responsible_department AS "responsibleDepartment",p.funding_source AS "fundingSource",p.progress,
      p.photo_url AS "photoUrl",p.supporting_document AS "supportingDocument",p.open_to_members AS "openToMembers",
      p.minimum_member_investment::float AS "minimumMemberInvestment",p.member_expected_return_rate::float AS "memberExpectedReturnRate",
      p.member_investment_deadline AS "memberInvestmentDeadline",p.proposal_id AS "proposalId",
      COALESCE(SUM(t.amount) FILTER (WHERE t.transaction_type='revenue'),0)::float AS revenue,
      COALESCE(SUM(t.amount) FILTER (WHERE t.transaction_type='expense'),0)::float AS expenses,
      (COALESCE(SUM(t.amount) FILTER (WHERE t.transaction_type='revenue'),0)-
       COALESCE(SUM(t.amount) FILTER (WHERE t.transaction_type='expense'),0))::float AS profit
      FROM investment_projects p LEFT JOIN investment_transactions t ON t.project_id=p.id AND t.deleted_at IS NULL
      WHERE p.status<>'archived'
      GROUP BY p.id ORDER BY p.id`),
    query(`SELECT t.id,t.reference,t.transaction_type AS "transactionType",t.category,t.description,t.amount::float,
      t.transaction_date AS "transactionDate",t.supporting_document AS "supportingDocument",p.id AS "projectId",
      p.reference AS "projectCode",p.name AS project,u.full_name AS "recordedBy"
      FROM investment_transactions t JOIN investment_projects p ON p.id=t.project_id JOIN users u ON u.id=t.recorded_by
      WHERE t.deleted_at IS NULL ORDER BY t.transaction_date DESC,t.id DESC LIMIT 150`),
    query(`SELECT p.id,p.reference,p.title,p.description,p.category,p.estimated_cost::float AS "estimatedCost",
      p.expected_revenue::float AS "expectedRevenue",p.expected_roi::float AS "expectedRoi",
      p.risk_assessment AS "riskAssessment",p.recommendation,p.supporting_document AS "supportingDocument",
      p.status,p.executive_activity_id AS "executiveActivityId",p.created_at AS "createdAt",
      creator.full_name AS "createdBy",reviewer.full_name AS "reviewedBy"
      FROM investment_proposals p JOIN users creator ON creator.id=p.created_by
      LEFT JOIN users reviewer ON reviewer.id=p.reviewed_by ORDER BY p.id DESC`),
    query(`SELECT i.id,i.project_id AS "projectId",p.reference AS "projectCode",p.name AS project,
      i.member_id AS "memberId",i.investor_name AS "investorName",i.funding_source AS "fundingSource",
      i.amount_invested::float AS "amountInvested",i.ownership_percentage::float AS "ownershipPercentage",
      i.expected_returns::float AS "expectedReturns",i.payments_received::float AS "paymentsReceived",
      (i.expected_returns-i.payments_received)::float AS "outstandingReturns",i.investment_date AS "investmentDate",i.status
      FROM investment_investors i JOIN investment_projects p ON p.id=i.project_id ORDER BY i.amount_invested DESC`),
    query(`SELECT c.id,c.reference,c.project_id AS "projectId",p.name AS project,c.contract_type AS "contractType",
      c.counterparty,c.title,c.contract_value::float AS "contractValue",c.starts_on AS "startsOn",c.ends_on AS "endsOn",
      c.status,c.document_reference AS "documentReference" FROM investment_contracts c
      LEFT JOIN investment_projects p ON p.id=c.project_id ORDER BY c.id DESC`),
    query(`SELECT a.id,a.asset_code AS "assetCode",a.project_id AS "projectId",p.name AS project,a.asset_name AS "assetName",
      a.asset_type AS "assetType",a.acquisition_value::float AS "acquisitionValue",a.current_value::float AS "currentValue",
      a.location,a.status,a.photo_url AS "photoUrl",a.supporting_document AS "supportingDocument"
      FROM investment_assets a LEFT JOIN investment_projects p ON p.id=a.project_id WHERE a.status<>'archived' ORDER BY a.id DESC`),
    query(`SELECT doc.id,doc.reference,doc.document_type AS "documentType",doc.title,doc.version,doc.status,
      doc.file_name AS "fileName",doc.updated_at AS "updatedAt",
      EXISTS(SELECT 1 FROM organization_document_versions v WHERE v.document_id=doc.id) AS "hasFile" FROM organization_documents doc
      JOIN departments d ON d.id=doc.department_id WHERE doc.status<>'archived' AND (d.code='investment' OR (doc.status='published' AND doc.visibility_level<=2 AND doc.document_type IN ('Signed Contracts','Policies')))
      ORDER BY doc.updated_at DESC`),
    query(`SELECT a.id,a.reference,a.project_id AS "projectId",p.name AS project,a.member_id AS "memberId",
      m.member_number AS "memberNumber",m.full_name AS member,a.amount::float,a.payment_method AS "paymentMethod",
      a.payment_reference AS "paymentReference",a.notes,a.status,a.review_comment AS "reviewComment",
      (a.evidence_stored_name IS NOT NULL) AS "hasEvidence",a.created_at AS "createdAt",a.reviewed_at AS "reviewedAt"
      FROM member_investment_applications a JOIN investment_projects p ON p.id=a.project_id
      JOIN members m ON m.id=a.member_id ORDER BY a.id DESC`)
  ]);
  const projectRows=projects.rows.map(project=>({...project,
    roi:project.capitalInvested?Number((project.profit/project.capitalInvested*100).toFixed(1)):0,
    budgetUtilization:project.budget?Number((project.expenses/project.budget*100).toFixed(1)):0}));
  const revenue=transactionsResult.rows.filter(t=>t.transactionType==="revenue").reduce((sum,t)=>sum+t.amount,0);
  const expenses=transactionsResult.rows.filter(t=>t.transactionType==="expense").reduce((sum,t)=>sum+t.amount,0);
  const profit=revenue-expenses,totalInvested=projectRows.reduce((sum,p)=>sum+p.capitalInvested,0);
  const portfolioValue=projectRows.reduce((sum,p)=>sum+p.currentValue,0);
  const expectedReturns=projectRows.reduce((sum,p)=>sum+p.expectedReturn,0);
  const availableCapital=Math.max(0,projectRows.reduce((sum,p)=>sum+p.budget,0)-totalInvested);
  const roi=totalInvested?Number((profit/totalInvested*100).toFixed(1)):0;
  const sortedPerformance=[...projectRows].sort((a,b)=>b.roi-a.roi);
  const categoryMap={};
  for(const project of projectRows)categoryMap[project.category||"Other"]=(categoryMap[project.category||"Other"]||0)+project.currentValue;
  const monthly=(await query(`WITH months AS (
      SELECT generate_series(date_trunc('month',CURRENT_DATE)-INTERVAL '5 months',date_trunc('month',CURRENT_DATE),INTERVAL '1 month') AS start_date)
    SELECT to_char(start_date,'Mon') AS month,
      COALESCE((SELECT SUM(amount) FROM investment_transactions WHERE transaction_type='revenue' AND deleted_at IS NULL AND transaction_date>=start_date AND transaction_date<start_date+INTERVAL '1 month'),0)::float AS revenue,
      COALESCE((SELECT SUM(amount) FROM investment_transactions WHERE transaction_type='expense' AND deleted_at IS NULL AND transaction_date>=start_date AND transaction_date<start_date+INTERVAL '1 month'),0)::float AS expenses,
      COALESCE((SELECT SUM(CASE WHEN transaction_type='revenue' THEN amount ELSE -amount END) FROM investment_transactions WHERE deleted_at IS NULL AND transaction_date>=start_date AND transaction_date<start_date+INTERVAL '1 month'),0)::float AS profit,
      COALESCE((SELECT SUM(current_value) FROM investment_projects WHERE status<>'archived'),0)::float AS portfolio
    FROM months ORDER BY start_date`)).rows;
  res.json({
    stats:{totalPortfolio:portfolioValue,activeProjects:projectRows.filter(p=>["active","running","construction"].includes(p.status)).length,
      underConstruction:projectRows.filter(p=>p.status==="construction").length,completedProjects:projectRows.filter(p=>["completed","closed"].includes(p.status)).length,
      monthlyProfit:profit,monthlyLoss:Math.max(0,-profit),expectedReturns,actualReturns:profit,
      pendingProposals:proposals.rows.filter(p=>!["approved","rejected","funded","closed"].includes(p.status)).length,
      availableCapital,totalInvestors:investors.rows.filter(i=>i.status==="active").length,roi},
    portfolio:{totalInvested,portfolioValue,profit,growth:totalInvested?Number(((portfolioValue-totalInvested)/totalInvested*100).toFixed(1)):0,
      availableCapital},projects:projectRows,transactions:transactionsResult.rows,proposals:proposals.rows,
    investors:investors.rows,memberApplications:memberApplications.rows,contracts:contracts.rows,assets:assets.rows,documents:documents.rows,monthly,
    categories:Object.entries(categoryMap).map(([category,value])=>({category,value})),
    performance:{best:sortedPerformance[0]||null,worst:sortedPerformance.at(-1)||null,
      highestRoi:sortedPerformance[0]?.roi||0,lowestRoi:sortedPerformance.at(-1)?.roi||0,
      fastest:[...projectRows].sort((a,b)=>b.progress-a.progress)[0]||null},
    revenueCategories:["Rental Income","Sales Revenue","Service Income","Agricultural Income","Dividends","Interest Earned","Other Investment Income"]
      .map(category=>({category,amount:transactionsResult.rows.filter(t=>t.transactionType==="revenue"&&t.category===category).reduce((s,t)=>s+t.amount,0)})),
    expenseCategories:["Construction Costs","Maintenance","Salaries","Utilities","Repairs","Marketing","Taxes","Insurance","Operational Costs"]
      .map(category=>({category,amount:transactionsResult.rows.filter(t=>t.transactionType==="expense"&&t.category===category).reduce((s,t)=>s+t.amount,0)})),
    notifications:[
      projectRows.some(p=>p.budgetUtilization>100)&&{level:"warning",title:`${projectRows.filter(p=>p.budgetUtilization>100).length} project budgets require attention`,createdAt:transactionsResult.rows[0]?.transactionDate},
      proposals.rows.some(p=>p.status==="investment_review")&&{level:"info",title:`${proposals.rows.filter(p=>p.status==="investment_review").length} new investment proposal requires review`,createdAt:proposals.rows.find(p=>p.status==="investment_review")?.createdAt},
      contracts.rows.some(c=>c.endsOn&&new Date(c.endsOn)<new Date(Date.now()+30*86400000))&&{level:"danger",title:`${contracts.rows.filter(c=>c.endsOn&&new Date(c.endsOn)<new Date(Date.now()+30*86400000)).length} contract renewals are approaching`,createdAt:contracts.rows.find(c=>c.endsOn&&new Date(c.endsOn)<new Date(Date.now()+30*86400000))?.endsOn}
    ].filter(Boolean),
    access:{authorityLevel:req.investmentAccess.authority_level,canCreate:Boolean(req.investmentAccess.can_create),
      canEdit:Boolean(req.investmentAccess.can_edit),canApprove:Boolean(req.investmentAccess.can_approve)}
  });
}));
app.get("/api/investment/search",auth,requireInvestment("view"),asyncRoute(async(req,res)=>{
  const term=String(req.query.q||"").trim();if(term.length<2)return res.json({results:[]});const like=`%${term}%`;
  const results=await query(`SELECT * FROM (
    SELECT 'Project' AS type,p.reference,p.name AS title,COALESCE(p.category,'')||' - '||p.status AS detail,'investment-projects' AS target
      FROM investment_projects p WHERE p.reference ILIKE $1 OR p.name ILIKE $1 OR p.category ILIKE $1 OR p.location ILIKE $1 OR p.status ILIKE $1 OR p.target_amount::text ILIKE $1
    UNION ALL SELECT 'Proposal',p.reference,p.title,p.status,'investment-proposals' FROM investment_proposals p
      WHERE p.reference ILIKE $1 OR p.title ILIKE $1 OR p.category ILIKE $1 OR p.status ILIKE $1
    UNION ALL SELECT 'Investor',p.reference,i.investor_name,i.funding_source,'investment-investors'
      FROM investment_investors i JOIN investment_projects p ON p.id=i.project_id WHERE i.investor_name ILIKE $1 OR i.funding_source ILIKE $1
    UNION ALL SELECT 'Contract',c.reference,c.title,c.counterparty,'investment-contracts' FROM investment_contracts c
      WHERE c.reference ILIKE $1 OR c.title ILIKE $1 OR c.counterparty ILIKE $1 OR c.contract_type ILIKE $1
  ) investment_results LIMIT 80`,[like]);res.json({results:results.rows});
}));
app.post("/api/investment/projects",auth,requireInvestment("create"),asyncRoute(async(req,res)=>{
  const b=req.body,budget=Number(b.budget),capital=Number(b.capitalInvested||0),value=Number(b.currentValue||capital),expected=Number(b.expectedReturn||0),progress=Number(b.progress||0),proposalId=Number(b.proposalId);
  if(!b.name||!b.description||!b.category||!b.location||!Number.isFinite(budget)||budget<=0||progress<0||progress>100)
    return res.status(400).json({error:"Project name, description, category, location, positive budget, and valid progress are required"});
  if(!Number.isInteger(proposalId))return res.status(400).json({error:"Select an Executive-approved investment proposal"});
  if(!["planning","active","construction"].includes(String(b.status||"planning")))return res.status(400).json({error:"Investment may start a project in planning, active, or construction status; Executive controls suspension and closure"});
  const proposal=await one(`SELECT p.id,p.status FROM investment_proposals p LEFT JOIN investment_projects project ON project.proposal_id=p.id
    WHERE p.id=$1 AND p.status IN ('approved','funded','project_started','monitoring') AND project.id IS NULL`,[proposalId]);
  if(!proposal)return res.status(409).json({error:"Projects can only be created from an unused Executive-approved proposal"});
  const row=await one(`INSERT INTO investment_projects
    (reference,name,description,category,location,target_amount,raised_amount,current_value,expected_return,status,
      performance_status,starts_on,ends_on,manager_name,responsible_department,funding_source,progress,supporting_document,created_by,
      open_to_members,minimum_member_investment,member_expected_return_rate,member_investment_deadline,proposal_id,executive_status)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'on_track',$11,$12,$13,'Investment',$14,$15,$16,$17,$18,$19,$20,$21,$22,'approved')
    RETURNING id,reference`,[reference("INV"),String(b.name).trim(),String(b.description).trim(),String(b.category),String(b.location).trim(),
    budget,capital,value,expected,String(b.status||"planning"),b.startDate||null,b.completionDate||null,String(b.manager||"").trim()||null,
    String(b.fundingSource||"Organization Capital"),progress,String(b.supportingDocument||"").trim()||null,req.user.id,
    b.openToMembers===undefined?true:Boolean(b.openToMembers),Number(b.minimumMemberInvestment||50000),Number(b.memberExpectedReturnRate||10),b.memberInvestmentDeadline||null,proposal.id]);
  await query("UPDATE investment_proposals SET status='project_started' WHERE id=$1",[proposal.id]);
  await audit({userId:req.user.id,action:"INVESTMENT_PROJECT_CREATED",entityType:"investment_project",entityId:String(row.id),details:row.reference,...metadata(req)});
  res.status(201).json(row);
}));
app.post("/api/investment/proposals",auth,requireInvestment("create"),asyncRoute(async(req,res)=>{
  const b=req.body,cost=Number(b.estimatedCost),revenue=Number(b.expectedRevenue),roi=Number(b.expectedRoi);
  if(!b.title||!b.description||!b.category||!b.riskAssessment||!Number.isFinite(cost)||cost<=0||!Number.isFinite(revenue)||revenue<0||!Number.isFinite(roi))
    return res.status(400).json({error:"Title, description, category, cost, expected revenue, ROI and risk assessment are required"});
  const row=await one(`INSERT INTO investment_proposals
    (reference,title,description,category,estimated_cost,expected_revenue,expected_roi,risk_assessment,recommendation,supporting_document,status,created_by)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'investment_review',$11) RETURNING id,reference`,
  [reference("PROP"),String(b.title).trim(),String(b.description).trim(),String(b.category),cost,revenue,roi,
    String(b.riskAssessment).trim(),String(b.recommendation||"").trim()||null,String(b.supportingDocument||"").trim()||null,req.user.id]);
  res.status(201).json(row);
}));
app.post("/api/investment/proposals/:id/advance",auth,requireInvestment("edit"),asyncRoute(async(req,res)=>{
  const proposal=await one("SELECT * FROM investment_proposals WHERE id=$1",[Number(req.params.id)]);
  if(!proposal)return res.status(404).json({error:"Investment proposal not found"});
  const sequence=["investment_review","financial_analysis","executive_approval","approved","funded","project_started","monitoring","closed"];
  const index=sequence.indexOf(proposal.status);if(index<0||index>=sequence.length-1)return res.status(409).json({error:"This proposal cannot advance"});
  if(proposal.status==="financial_analysis")return res.status(409).json({error:"Finance must complete the financial analysis before Executive review"});
  const next=sequence[index+1];let activityId=proposal.executive_activity_id;
  if(next==="executive_approval") {
    const department=await one("SELECT id FROM departments WHERE code='investment'");
    const activity=await one(`INSERT INTO department_activities
      (department_id,reference,activity_type,title,description,amount,status,visibility_level,created_by)
      VALUES ($1,$2,'investment-proposal',$3,$4,$5,'pending_executive',4,$6)
      ON CONFLICT (reference) DO UPDATE SET updated_at=NOW() RETURNING id`,
    [department.id,`EXEC-${proposal.reference}`,proposal.title,proposal.description,proposal.estimated_cost,req.user.id]);
    activityId=activity.id;
  }
  if(proposal.status==="executive_approval")return res.status(409).json({error:"Executive must decide this proposal before it can advance"});
  await query(`UPDATE investment_proposals SET status=$1,reviewed_by=$2,reviewed_at=NOW(),
    executive_activity_id=COALESCE($3,executive_activity_id) WHERE id=$4`,[next,req.user.id,activityId,proposal.id]);
  await audit({userId:req.user.id,action:"INVESTMENT_PROPOSAL_ADVANCED",entityType:"investment_proposal",entityId:String(proposal.id),details:`${proposal.reference} - ${next}`,...metadata(req)});
  res.json({ok:true,status:next});
}));
app.post("/api/investment/transactions",auth,requireInvestment("create"),asyncRoute(async(req,res)=>{
  const b=req.body,amount=Number(b.amount),projectId=Number(b.projectId);
  if(!Number.isInteger(projectId)||!["revenue","expense"].includes(b.transactionType)||!b.category||!b.description||!Number.isFinite(amount)||amount<=0)
    return res.status(400).json({error:"Project, transaction type, category, description and positive amount are required"});
  const row=await transaction(async client=>{
    const project=(await client.query("SELECT id,name FROM investment_projects WHERE id=$1",[projectId])).rows[0];
    if(!project){const error=new Error("Project not found");error.status=404;throw error;}
    const investment=(await client.query(`INSERT INTO investment_transactions
      (reference,project_id,transaction_type,category,description,amount,transaction_date,supporting_document,recorded_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id,reference`,
      [reference(b.transactionType==="revenue"?"INV-REV":"INV-EXP"),project.id,b.transactionType,String(b.category),String(b.description).trim(),
       amount,b.date||new Date(),String(b.supportingDocument||"").trim()||null,req.user.id])).rows[0];
    const department=(await client.query("SELECT id FROM departments WHERE code='investment'")).rows[0];
    const finance=(await client.query(`INSERT INTO organization_finance_entries
      (department_id,reference,entry_type,category,description,counterparty,amount,status,supporting_document,transaction_date,recorded_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,'pending_finance_review',$8,$9,$10) RETURNING id`,
      [department.id,`FIN-${investment.reference}`,b.transactionType==="revenue"?"income":"expense",String(b.category),String(b.description).trim(),project.name,
       amount,String(b.supportingDocument||"").trim()||null,b.date||new Date(),req.user.id])).rows[0];
    await client.query("UPDATE investment_transactions SET finance_entry_id=$1 WHERE id=$2",[finance.id,investment.id]);
    return investment;
  });
  await audit({userId:req.user.id,action:`INVESTMENT_${b.transactionType.toUpperCase()}_RECORDED`,entityType:"investment_transaction",entityId:String(row.id),details:`${row.reference} - pending Finance review`,...metadata(req)});
  res.status(201).json({...row,financeStatus:"pending_finance_review"});
}));app.post("/api/investment/investors",auth,requireInvestment("create"),asyncRoute(async(req,res)=>{
  const b=req.body,projectId=Number(b.projectId),amount=Number(b.amountInvested),ownership=Number(b.ownershipPercentage||0),expected=Number(b.expectedReturns||0);
  if(!Number.isInteger(projectId)||!b.investorName||!b.fundingSource||!Number.isFinite(amount)||amount<=0)
    return res.status(400).json({error:"Project, investor or funding source, and positive invested amount are required"});
  const row=await one(`INSERT INTO investment_investors
    (project_id,member_id,investor_name,funding_source,amount_invested,ownership_percentage,expected_returns,investment_date,status,created_by)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'active',$9) RETURNING id`,
  [projectId,b.memberId||null,String(b.investorName).trim(),String(b.fundingSource),amount,ownership,expected,b.investmentDate||new Date(),req.user.id]);
  res.status(201).json(row);
}));
app.post("/api/investment/contracts",auth,requireInvestment("create"),asyncRoute(async(req,res)=>{
  const b=req.body,value=Number(b.contractValue||0);
  if(!b.contractType||!b.counterparty||!b.title||!Number.isFinite(value)||value<0)
    return res.status(400).json({error:"Contract type, counterparty, title and valid value are required"});
  const row=await transaction(async client=>{
    const department=(await client.query("SELECT id FROM departments WHERE code='investment'")).rows[0];
    const contractReference=reference("INV-CON");
    const legal=(await client.query(`INSERT INTO legal_contracts
      (contract_number,title,contract_type,parties,department_id,contract_value,starts_on,ends_on,status,supporting_document,created_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'under_review',$9,$10) RETURNING id`,
      [contractReference,String(b.title).trim(),String(b.contractType),String(b.counterparty).trim(),department.id,value,b.startDate||null,b.endDate||null,
       String(b.documentReference||"").trim()||null,req.user.id])).rows[0];
    return (await client.query(`INSERT INTO investment_contracts
      (reference,project_id,contract_type,counterparty,title,contract_value,starts_on,ends_on,status,document_reference,created_by,legal_contract_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'legal_review',$9,$10,$11) RETURNING id,reference,status`,
      [contractReference,b.projectId||null,String(b.contractType),String(b.counterparty).trim(),String(b.title).trim(),value,b.startDate||null,b.endDate||null,
       String(b.documentReference||"").trim()||null,req.user.id,legal.id])).rows[0];
  });
  await audit({userId:req.user.id,action:"INVESTMENT_CONTRACT_SUBMITTED_TO_LEGAL",entityType:"investment_contract",entityId:String(row.id),details:row.reference,...metadata(req)});
  res.status(201).json(row);
}));
app.post("/api/investment/assets",auth,requireInvestment("create"),asyncRoute(async(req,res)=>{
  const b=req.body,cost=Number(b.acquisitionValue),value=Number(b.currentValue||cost);
  if(!b.assetCode||!b.assetName||!b.assetType||!Number.isFinite(cost)||cost<0||!Number.isFinite(value)||value<0)
    return res.status(400).json({error:"Asset code, name, type and valid values are required"});
  try{const row=await one(`INSERT INTO investment_assets
    (asset_code,project_id,asset_name,asset_type,acquisition_value,current_value,location,status,photo_url,supporting_document,created_by)
    VALUES ($1,$2,$3,$4,$5,$6,$7,'active',$8,$9,$10) RETURNING id,asset_code AS "assetCode"`,
  [String(b.assetCode).trim(),b.projectId||null,String(b.assetName).trim(),String(b.assetType),cost,value,String(b.location||"").trim()||null,
    String(b.photoUrl||"").trim()||null,String(b.supportingDocument||"").trim()||null,req.user.id]);
  res.status(201).json(row);}catch(error){if(error.code==="23505")return res.status(409).json({error:"That investment asset code already exists"});throw error;}
}));
app.patch("/api/investment/projects/:id",auth,requireInvestment("edit"),asyncRoute(async(req,res)=>{
  const b=req.body,budget=Number(b.budget),capital=Number(b.capitalInvested||0),value=Number(b.currentValue||capital),expected=Number(b.expectedReturn||0),progress=Number(b.progress||0);
  if(!b.name||!b.description||!b.category||!b.location||!Number.isFinite(budget)||budget<=0||progress<0||progress>100)
    return res.status(400).json({error:"Project name, description, category, location, positive budget, and valid progress are required"});
  if(!["planning","active","construction"].includes(String(b.status||"planning")))return res.status(403).json({error:"Executive authority is required to suspend or close a project"});
  const row=await one(`UPDATE investment_projects SET name=$1,description=$2,category=$3,location=$4,target_amount=$5,
    raised_amount=$6,current_value=$7,expected_return=$8,status=$9,starts_on=$10,ends_on=$11,manager_name=$12,
    funding_source=$13,progress=$14,photo_url=COALESCE($15,photo_url),supporting_document=COALESCE($16,supporting_document),
    open_to_members=COALESCE($17,open_to_members),minimum_member_investment=COALESCE($18,minimum_member_investment),
    member_expected_return_rate=COALESCE($19,member_expected_return_rate),member_investment_deadline=COALESCE($20,member_investment_deadline)
    WHERE id=$21 RETURNING id,reference`,[String(b.name).trim(),String(b.description).trim(),String(b.category),String(b.location).trim(),
    budget,capital,value,expected,String(b.status||"planning"),b.startDate||null,b.completionDate||null,String(b.manager||"").trim()||null,
    String(b.fundingSource||"Organization Capital"),progress,String(b.photoUrl||"").trim()||null,String(b.supportingDocument||"").trim()||null,
    b.openToMembers===undefined?null:Boolean(b.openToMembers),b.minimumMemberInvestment===undefined?null:Number(b.minimumMemberInvestment),
    b.memberExpectedReturnRate===undefined?null:Number(b.memberExpectedReturnRate),b.memberInvestmentDeadline||null,Number(req.params.id)]);
  if(!row)return res.status(404).json({error:"Investment project not found"});
  await audit({userId:req.user.id,action:"INVESTMENT_PROJECT_UPDATED",entityType:"investment_project",entityId:String(row.id),details:row.reference,...metadata(req)});
  res.json(row);
}));
app.patch("/api/investment/assets/:id",auth,requireInvestment("edit"),asyncRoute(async(req,res)=>{
  const b=req.body,cost=Number(b.acquisitionValue),value=Number(b.currentValue||cost);
  if(!b.assetCode||!b.assetName||!b.assetType||!Number.isFinite(cost)||cost<0||!Number.isFinite(value)||value<0)
    return res.status(400).json({error:"Asset code, name, type and valid values are required"});
  const row=await one(`UPDATE investment_assets SET asset_code=$1,project_id=$2,asset_name=$3,asset_type=$4,
    acquisition_value=$5,current_value=$6,location=$7,status=$8,photo_url=COALESCE($9,photo_url),
    supporting_document=COALESCE($10,supporting_document) WHERE id=$11 RETURNING id,asset_code AS "assetCode"`,
  [String(b.assetCode).trim(),b.projectId||null,String(b.assetName).trim(),String(b.assetType),cost,value,
    String(b.location||"").trim()||null,String(b.status||"active"),String(b.photoUrl||"").trim()||null,
    String(b.supportingDocument||"").trim()||null,Number(req.params.id)]);
  if(!row)return res.status(404).json({error:"Investment asset not found"});
  await audit({userId:req.user.id,action:"INVESTMENT_ASSET_UPDATED",entityType:"investment_asset",entityId:String(row.id),details:row.assetCode,...metadata(req)});
  res.json(row);
}));
app.patch("/api/investment/proposals/:id",auth,requireInvestment("edit"),asyncRoute(async(req,res)=>{
  const b=req.body,cost=Number(b.estimatedCost),revenue=Number(b.expectedRevenue),roi=Number(b.expectedRoi);
  if(!b.title||!b.description||!b.category||!b.riskAssessment||!Number.isFinite(cost)||cost<=0||!Number.isFinite(revenue)||revenue<0||!Number.isFinite(roi))
    return res.status(400).json({error:"Title, description, category, cost, expected revenue, ROI and risk assessment are required"});
  const row=await one(`UPDATE investment_proposals SET title=$1,description=$2,category=$3,estimated_cost=$4,
    expected_revenue=$5,expected_roi=$6,risk_assessment=$7,recommendation=$8,supporting_document=COALESCE($9,supporting_document)
    WHERE id=$10 AND status NOT IN ('approved','funded','closed') RETURNING id,reference`,[String(b.title).trim(),String(b.description).trim(),
    String(b.category),cost,revenue,roi,String(b.riskAssessment).trim(),String(b.recommendation||"").trim()||null,
    String(b.supportingDocument||"").trim()||null,Number(req.params.id)]);
  if(!row)return res.status(409).json({error:"Only proposals still under review can be edited"});
  await audit({userId:req.user.id,action:"INVESTMENT_PROPOSAL_UPDATED",entityType:"investment_proposal",entityId:String(row.id),details:row.reference,...metadata(req)});res.json(row);
}));
app.patch("/api/investment/investors/:id",auth,requireInvestment("edit"),asyncRoute(async(req,res)=>{
  const b=req.body,projectId=Number(b.projectId),amount=Number(b.amountInvested),ownership=Number(b.ownershipPercentage||0),expected=Number(b.expectedReturns||0);
  if(!Number.isInteger(projectId)||!b.investorName||!b.fundingSource||!Number.isFinite(amount)||amount<=0)return res.status(400).json({error:"Project, funding source, and positive amount are required"});
  const row=await one(`UPDATE investment_investors SET project_id=$1,investor_name=$2,funding_source=$3,amount_invested=$4,
    ownership_percentage=$5,expected_returns=$6,investment_date=$7,status=$8 WHERE id=$9 RETURNING id`,[projectId,String(b.investorName).trim(),
    String(b.fundingSource),amount,ownership,expected,b.investmentDate||new Date(),String(b.status||"active"),Number(req.params.id)]);
  if(!row)return res.status(404).json({error:"Investment funding source not found"});
  await audit({userId:req.user.id,action:"INVESTMENT_FUNDING_UPDATED",entityType:"investment_investor",entityId:String(row.id),details:String(b.investorName),...metadata(req)});res.json(row);
}));
app.patch("/api/investment/contracts/:id",auth,requireInvestment("edit"),asyncRoute(async(req,res)=>{
  const b=req.body,value=Number(b.contractValue||0);if(!b.contractType||!b.counterparty||!b.title||!Number.isFinite(value)||value<0)return res.status(400).json({error:"Contract type, counterparty, title and valid value are required"});
  const row=await transaction(async client=>{
    const current=(await client.query("SELECT * FROM investment_contracts WHERE id=$1 FOR UPDATE",[Number(req.params.id)])).rows[0];
    if(!current){const error=new Error("Investment contract not found");error.status=404;throw error;}
    await client.query(`UPDATE investment_contracts SET project_id=$1,contract_type=$2,counterparty=$3,title=$4,contract_value=$5,
      starts_on=$6,ends_on=$7,document_reference=COALESCE($8,document_reference) WHERE id=$9`,[b.projectId||null,String(b.contractType),
      String(b.counterparty).trim(),String(b.title).trim(),value,b.startDate||null,b.endDate||null,String(b.documentReference||"").trim()||null,current.id]);
    if(current.legal_contract_id)await client.query(`UPDATE legal_contracts SET title=$1,contract_type=$2,parties=$3,contract_value=$4,
      starts_on=$5,ends_on=$6,supporting_document=COALESCE($7,supporting_document),updated_at=NOW() WHERE id=$8`,[String(b.title).trim(),
      String(b.contractType),String(b.counterparty).trim(),value,b.startDate||null,b.endDate||null,String(b.documentReference||"").trim()||null,current.legal_contract_id]);
    return {id:current.id,reference:current.reference};
  });
  await audit({userId:req.user.id,action:"INVESTMENT_CONTRACT_UPDATED",entityType:"investment_contract",entityId:String(row.id),details:row.reference,...metadata(req)});res.json(row);
}));
app.delete("/api/investment/projects/:id",auth,requireInvestment("edit"),asyncRoute(async(req,res)=>{
  const row=await one("UPDATE investment_projects SET status='archived' WHERE id=$1 AND status<>'archived' RETURNING id,reference",[Number(req.params.id)]);
  if(!row)return res.status(404).json({error:"Investment project not found or already archived"});
  await audit({userId:req.user.id,action:"INVESTMENT_PROJECT_ARCHIVED",entityType:"investment_project",entityId:String(row.id),details:row.reference,...metadata(req)});
  res.json({ok:true,recoverable:true});
}));
app.delete("/api/investment/assets/:id",auth,requireInvestment("edit"),asyncRoute(async(req,res)=>{
  const row=await one("UPDATE investment_assets SET status='archived' WHERE id=$1 AND status<>'archived' RETURNING id,asset_code AS reference",[Number(req.params.id)]);
  if(!row)return res.status(404).json({error:"Investment asset not found or already archived"});
  await audit({userId:req.user.id,action:"INVESTMENT_ASSET_ARCHIVED",entityType:"investment_asset",entityId:String(row.id),details:row.reference,...metadata(req)});
  res.json({ok:true,recoverable:true});
}));
app.delete("/api/investment/transactions/:id",auth,requireInvestment("edit"),asyncRoute(async(req,res)=>{
  const row=await transaction(async client=>{
    const current=(await client.query(`SELECT t.id,t.reference,t.finance_entry_id,f.status AS finance_status
      FROM investment_transactions t LEFT JOIN organization_finance_entries f ON f.id=t.finance_entry_id
      WHERE t.id=$1 AND t.deleted_at IS NULL FOR UPDATE OF t`,[Number(req.params.id)])).rows[0];
    if(!current){const error=new Error("Investment transaction not found");error.status=404;throw error;}
    if(current.finance_status&&!['pending_finance_review','rejected','voided'].includes(current.finance_status)){const error=new Error("A Finance-posted transaction cannot be deleted; request a reversing entry instead");error.status=409;throw error;}
    await client.query("UPDATE investment_transactions SET deleted_at=NOW(),deleted_by=$1 WHERE id=$2",[req.user.id,current.id]);
    if(current.finance_entry_id)await client.query("UPDATE organization_finance_entries SET status='voided' WHERE id=$1",[current.finance_entry_id]);
    return current;
  });
  await audit({userId:req.user.id,action:"INVESTMENT_TRANSACTION_VOIDED",entityType:"investment_transaction",entityId:String(row.id),details:row.reference,...metadata(req)});
  res.json({ok:true,recoverable:true});
}));

function requireWelfare(action="view") {
  return asyncRoute(async(req,res,next)=>{
    const access=await departmentPermission(req.user,"welfare",action);
    if(!access) return res.status(403).json({error:`Your Welfare assignment does not allow ${action} access`});
    req.welfareAccess=access;next();
  });
}
async function createWelfareFinanceVoucher(requestRow,userId,client=null) {
  if(requestRow.finance_voucher_id)return requestRow.finance_voucher_id;
  const fetchOne=async(sql,params=[])=>client?(await client.query(sql,params)).rows[0]:one(sql,params);
  const execute=(sql,params=[])=>client?client.query(sql,params):query(sql,params);
  const welfareDepartment=await fetchOne("SELECT id FROM departments WHERE code='welfare'");
  const member=await fetchOne("SELECT full_name FROM members WHERE id=$1",[requestRow.member_id]);
  const voucherNumber=reference("PV-WEL");
  const voucher=await fetchOne(`INSERT INTO finance_payment_vouchers
    (voucher_number,department_id,supplier,description,category,budget_line,amount,payment_method,status,supporting_document,requested_by)
    VALUES ($1,$2,$3,$4,'Welfare Transfer','Welfare assistance',$5,'Mobile Money','finance_review',$6,$7)
    RETURNING id,voucher_number`,[voucherNumber,welfareDepartment.id,member.full_name,
    `${requestRow.request_type} - ${requestRow.reference}`,requestRow.amount,requestRow.supporting_document,userId]);
  await execute(`UPDATE welfare_requests SET finance_voucher_id=$1,payment_status='awaiting_finance' WHERE id=$2`,[voucher.id,requestRow.id]);
  await execute(`INSERT INTO welfare_payments
    (reference,request_id,beneficiary_name,amount,payment_method,voucher_number,status,approved_at,recorded_by)
    VALUES ($1,$2,$3,$4,'Mobile Money',$5,'pending_finance',NOW(),$6)
    ON CONFLICT (reference) DO NOTHING`,
  [`WPAY-${requestRow.reference}`,requestRow.id,member.full_name,requestRow.amount,voucherNumber,userId]);
  return voucher.id;
}
app.get("/api/welfare/command-center",auth,requireWelfare("view"),asyncRoute(async(req,res)=>{
  const [requests,contributions,payments,activities,meetings,documents]=await Promise.all([
    query(`SELECT wr.id,wr.reference,wr.request_type AS category,wr.description,wr.amount::float,
      wr.status,wr.urgency,wr.supporting_document AS "supportingDocument",wr.documents_verified AS "documentsVerified",
      wr.previous_support::float AS "previousSupport",wr.officer_recommendation AS "officerRecommendation",
      wr.payment_status AS "paymentStatus",wr.created_at AS "createdAt",wr.reviewed_at AS "reviewedAt",
      wr.executive_activity_id AS "executiveActivityId",wr.finance_voucher_id AS "financeVoucherId",
      m.id AS "memberId",m.member_number AS "memberNumber",m.full_name AS member,m.phone,
      COALESCE(officer.full_name,'Unassigned') AS "assignedOfficer"
      FROM welfare_requests wr JOIN members m ON m.id=wr.member_id LEFT JOIN users officer ON officer.id=wr.assigned_to
      ORDER BY CASE wr.urgency WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,wr.id DESC`),
    query(`SELECT c.id,c.reference,c.contribution_type AS "contributionType",c.period,c.expected_amount::float AS expected,
      c.amount::float,c.payment_method AS "paymentMethod",c.receipt_number AS "receiptNumber",c.status,
      c.contribution_date AS "contributionDate",c.created_at AS "createdAt",m.id AS "memberId",m.member_number AS "memberNumber",m.full_name AS member,
      u.full_name AS "recordedBy" FROM welfare_contributions c JOIN members m ON m.id=c.member_id
      JOIN users u ON u.id=c.recorded_by ORDER BY c.contribution_date DESC,c.id DESC`),
    query(`SELECT p.id,p.reference,p.request_id AS "requestId",p.beneficiary_name AS beneficiary,p.amount::float,
      p.payment_method AS "paymentMethod",p.voucher_number AS "voucherNumber",p.receipt_number AS "receiptNumber",
      COALESCE(v.status,p.status) AS status,p.approved_at AS "approvedAt",p.paid_at AS "paidAt",
      wr.request_type AS category FROM welfare_payments p JOIN welfare_requests wr ON wr.id=p.request_id
      LEFT JOIN finance_payment_vouchers v ON v.id=wr.finance_voucher_id ORDER BY p.id DESC`),
    query(`SELECT id,reference,activity_type AS "activityType",title,description,activity_date AS "activityDate",
      budget::float,responsible_officer AS "responsibleOfficer",participants,outcome,status,report_reference AS "reportReference"
      FROM welfare_activities ORDER BY activity_date`),
    query(`SELECT id,reference,title,agenda,venue,scheduled_at AS "scheduledAt",chairperson,participants,decisions,status
      FROM welfare_committee_meetings ORDER BY scheduled_at`),
    query(`SELECT doc.id,doc.reference,doc.document_type AS "documentType",doc.title,doc.version,doc.status,
      doc.file_name AS "fileName",doc.updated_at AS "updatedAt",
      EXISTS(SELECT 1 FROM organization_document_versions v WHERE v.document_id=doc.id) AS "hasFile" FROM organization_documents doc
      JOIN departments d ON d.id=doc.department_id WHERE doc.status<>'archived' AND (d.code='welfare' OR (doc.status='published' AND doc.visibility_level<=2 AND doc.document_type IN ('Policies','Annual Reports')))
      ORDER BY doc.updated_at DESC`)
  ]);
  const openingBalance=Number((await one("SELECT value FROM settings WHERE key='welfareFundBalance'"))?.value||0);
  const verifiedContributions=contributions.rows.filter(c=>["verified","completed"].includes(c.status)),
    contributed=verifiedContributions.reduce((s,c)=>s+c.amount,0);
  const assistancePaid=payments.rows.filter(p=>["paid","processed"].includes(p.status)).reduce((s,p)=>s+p.amount,0);
  const otherExpenses=0,closingBalance=openingBalance+contributed-assistancePaid-otherExpenses;
  const requestRows=requests.rows,pending=requestRows.filter(r=>!["approved","rejected","closed"].includes(r.status));
  const approved=requestRows.filter(r=>r.status==="approved"),rejected=requestRows.filter(r=>r.status==="rejected");
  const emergencies=requestRows.filter(r=>["critical","high"].includes(r.urgency)&&!["closed","rejected"].includes(r.status));
  const members=(await query("SELECT COUNT(*)::int AS count FROM members WHERE status='active'")).rows[0].count;
  const memberTotals=new Map();
  for(const contribution of verifiedContributions)memberTotals.set(contribution.memberId,(memberTotals.get(contribution.memberId)||0)+contribution.amount);
  const fullyPaid=[...memberTotals.values()].filter(x=>x>=50000).length,partiallyPaid=[...memberTotals.values()].filter(x=>x>0&&x<50000).length;
  const arrears=Math.max(0,members-fullyPaid-partiallyPaid),expected=members*50000,collected=contributed;
  const beneficiaries=new Set(payments.rows.filter(p=>["paid","processed"].includes(p.status)).map(p=>p.beneficiary));
  const averageApproval=requestRows.filter(r=>r.reviewedAt).length?Number((requestRows.filter(r=>r.reviewedAt)
    .reduce((s,r)=>s+(new Date(r.reviewedAt)-new Date(r.createdAt))/86400000,0)/requestRows.filter(r=>r.reviewedAt).length).toFixed(1)):0;
  const categories={};for(const payment of payments.rows)categories[payment.category]=(categories[payment.category]||0)+payment.amount;
  const contributionsMonth=verifiedContributions.filter(c=>new Date(c.contributionDate||c.createdAt).getMonth()===new Date().getMonth()&&new Date(c.contributionDate||c.createdAt).getFullYear()===new Date().getFullYear()).reduce((s,c)=>s+c.amount,0);
  const assistancePaidMonth=payments.rows.filter(p=>["paid","processed"].includes(p.status)&&p.paidAt&&new Date(p.paidAt).getMonth()===new Date().getMonth()&&new Date(p.paidAt).getFullYear()===new Date().getFullYear()).reduce((s,p)=>s+p.amount,0);
  const monthly=(await query(`WITH months AS (
      SELECT generate_series(date_trunc('month',CURRENT_DATE)-INTERVAL '5 months',date_trunc('month',CURRENT_DATE),INTERVAL '1 month') AS start_date)
    SELECT to_char(start_date,'Mon') AS month,
      COALESCE((SELECT SUM(amount) FROM welfare_contributions WHERE status IN ('verified','completed') AND contribution_date>=start_date AND contribution_date<start_date+INTERVAL '1 month'),0)::float AS contributions,
      COALESCE((SELECT SUM(p.amount) FROM welfare_payments p WHERE COALESCE(p.status,'') IN ('paid','processed') AND COALESCE(p.paid_at,p.approved_at)>=start_date AND COALESCE(p.paid_at,p.approved_at)<start_date+INTERVAL '1 month'),0)::float AS assistance
    FROM months ORDER BY start_date`)).rows.map((row,index,all)=>{
      const prior=all.slice(0,index+1).reduce((s,r)=>s+Number(r.contributions)-Number(r.assistance),openingBalance);
      return {...row,balance:prior};
    });
  res.json({
    stats:{totalFund:closingBalance,contributionsMonth,assistancePaidMonth,
      pendingRequests:pending.length,approvedRequests:approved.length,rejectedRequests:rejected.length,
      emergencyCases:emergencies.length,activeBeneficiaries:beneficiaries.size,membersInArrears:arrears,
      upcomingEvents:activities.rows.filter(a=>new Date(a.activityDate)>new Date()).length,averageApprovalTime:averageApproval,
      remainingBalance:closingBalance},
    fund:{openingBalance,contributions:contributed,assistancePaid,otherExpenses,closingBalance,
      growth:openingBalance?Number(((closingBalance-openingBalance)/openingBalance*100).toFixed(2)):0},
    contributionStatus:{fullyPaid,partiallyPaid,arrears,expected,collected,
      collectionPercentage:expected?Number((collected/expected*100).toFixed(1)):0},
    beneficiarySummary:{total:beneficiaries.size,totalPaid:assistancePaid,averageSupport:beneficiaries.size?assistancePaid/beneficiaries.size:0,
      repeat:payments.rows.length-beneficiaries.size,highestCategory:Object.entries(categories).sort((a,b)=>b[1]-a[1])[0]?.[0]||"None"},
    requests:requestRows,contributions:contributions.rows,payments:payments.rows,activities:activities.rows,
    meetings:meetings.rows,documents:documents.rows,monthly,categories:Object.entries(categories).map(([category,amount])=>({category,amount})),
    notifications:[
      emergencies.length&&{level:"danger",title:`${emergencies.length} urgent welfare cases require immediate attention`,createdAt:emergencies[0]?.createdAt},
      pending.length&&{level:"info",title:`${pending.length} welfare requests are awaiting progress`,createdAt:pending[0]?.createdAt},
      arrears>0&&{level:"warning",title:`${arrears} members have incomplete monthly contributions`,createdAt:contributions.rows[0]?.createdAt},
      contributions.rows.length&&{level:"success",title:`Verified contributions totaling UGX ${collected.toLocaleString()}`,createdAt:contributions.rows[0]?.createdAt},
      payments.rows.some(p=>p.status==="finance_review")&&{level:"info",title:`${payments.rows.filter(p=>p.status==="finance_review").length} approved payments await Finance review`,createdAt:payments.rows.find(p=>p.status==="finance_review")?.approvedAt}
    ].filter(Boolean),
    access:{authorityLevel:req.welfareAccess.authority_level,canCreate:Boolean(req.welfareAccess.can_create),
      canEdit:Boolean(req.welfareAccess.can_edit),canApprove:Boolean(req.welfareAccess.can_approve)}
  });
}));
app.get("/api/welfare/search",auth,requireWelfare("view"),asyncRoute(async(req,res)=>{
  const term=String(req.query.q||"").trim();if(term.length<2)return res.json({results:[]});const like=`%${term}%`;
  const results=await query(`SELECT * FROM (
    SELECT 'Welfare Request' AS type,wr.reference,m.full_name||' - '||wr.request_type AS title,wr.status AS detail,'welfare-requests' AS target
      FROM welfare_requests wr JOIN members m ON m.id=wr.member_id
      WHERE wr.reference ILIKE $1 OR m.full_name ILIKE $1 OR m.member_number ILIKE $1 OR wr.request_type ILIKE $1
    UNION ALL SELECT 'Contribution',c.reference,m.full_name,c.receipt_number,'welfare-contributions'
      FROM welfare_contributions c JOIN members m ON m.id=c.member_id
      WHERE c.reference ILIKE $1 OR c.receipt_number ILIKE $1 OR m.full_name ILIKE $1
    UNION ALL SELECT 'Activity',a.reference,a.title,a.activity_type,'welfare-activities'
      FROM welfare_activities a WHERE a.reference ILIKE $1 OR a.title ILIKE $1 OR a.activity_type ILIKE $1
    UNION ALL SELECT 'Meeting',m.reference,m.title,m.venue,'welfare-meetings'
      FROM welfare_committee_meetings m WHERE m.reference ILIKE $1 OR m.title ILIKE $1 OR m.venue ILIKE $1
  ) welfare_results LIMIT 80`,[like]);res.json({results:results.rows});
}));
app.post("/api/welfare/requests",auth,requireWelfare("create"),asyncRoute(async(req,res)=>{
  const b=req.body,memberId=Number(b.memberId),amount=Number(b.amount);
  const allowedCategories=new Set(["Funeral assistance","Marriage assistance","Accident assistance","Other assistance"]);
  if(!Number.isInteger(memberId)||!allowedCategories.has(String(b.category||""))||!b.description||!["low","medium","high","critical"].includes(b.urgency)||!Number.isFinite(amount)||amount<=0)
    return res.status(400).json({error:"Member, approved assistance category, description, urgency and positive amount are required"});
  const member=await one("SELECT id FROM members WHERE id=$1 AND status='active'",[memberId]);if(!member)return res.status(404).json({error:"Active member not found"});
  const previous=(await one(`SELECT COALESCE(SUM(amount),0)::float AS amount FROM welfare_requests
    WHERE member_id=$1 AND status IN ('approved','closed')`,[member.id])).amount;
  const row=await one(`INSERT INTO welfare_requests
    (reference,member_id,request_type,description,amount,status,urgency,supporting_document,previous_support,submitted_by,assigned_to)
    VALUES ($1,$2,$3,$4,$5,'submitted',$6,$7,$8,$9,$9) RETURNING id,reference`,
  [reference("WEL"),member.id,String(b.category),String(b.description).trim(),amount,b.urgency,
    String(b.supportingDocument||"").trim()||null,previous,req.user.id]);
  await audit({userId:req.user.id,action:"WELFARE_REQUEST_CREATED",entityType:"welfare_request",entityId:String(row.id),details:row.reference,...metadata(req)});
  res.status(201).json(row);
}));
app.post("/api/welfare/requests/:id/decision",auth,requireWelfare("edit"),asyncRoute(async(req,res)=>{
  const decision=String(req.body.decision||""),comment=String(req.body.comment||"").trim();
  if(!["recommend","approve","reject","more_information"].includes(decision))return res.status(400).json({error:"Choose a valid welfare decision"});
  if(decision!=="approve"&&!comment)return res.status(400).json({error:"A comment or recommendation is required"});
  const requestRow=await one("SELECT * FROM welfare_requests WHERE id=$1",[Number(req.params.id)]);if(!requestRow)return res.status(404).json({error:"Welfare request not found"});
  if(["approved","rejected","closed"].includes(requestRow.status))return res.status(409).json({error:"This welfare case is already decided"});
  if(decision==="approve"&&!req.welfareAccess.can_approve)return res.status(403).json({error:"Your Welfare assignment does not include approval authority"});
  let next=decision==="recommend"?"committee_review":decision==="reject"?"rejected":decision==="more_information"?"more_information":"approved",activityId=requestRow.executive_activity_id;
  if(decision==="approve"&&Number(requestRow.amount)>=5000000) {
    next="executive_approval";const department=await one("SELECT id FROM departments WHERE code='welfare'");
    const activity=await one(`INSERT INTO department_activities
      (department_id,reference,activity_type,title,description,amount,status,visibility_level,created_by)
      VALUES ($1,$2,'welfare-request',$3,$4,$5,'pending_executive',4,$6)
      ON CONFLICT (reference) DO UPDATE SET updated_at=NOW() RETURNING id`,
    [department.id,`EXEC-${requestRow.reference}`,`${requestRow.request_type} - ${requestRow.reference}`,requestRow.description,requestRow.amount,req.user.id]);
    activityId=activity.id;
  }
  await query(`UPDATE welfare_requests SET status=$1,officer_recommendation=$2,reviewed_by=$3,reviewed_at=NOW(),
    documents_verified=CASE WHEN supporting_document IS NOT NULL THEN true ELSE documents_verified END,
    executive_activity_id=COALESCE($4,executive_activity_id) WHERE id=$5`,[next,comment||"Approved within Welfare authority",req.user.id,activityId,requestRow.id]);
  if(next==="approved")await createWelfareFinanceVoucher(requestRow,req.user.id);
  await query("INSERT INTO notifications (member_id,title,message) VALUES ($1,'Welfare request updated',$2)",
    [requestRow.member_id,`${requestRow.reference} is now ${next.replaceAll("_"," ")}.`]);
  await audit({userId:req.user.id,action:`WELFARE_${decision.toUpperCase()}`,entityType:"welfare_request",entityId:String(requestRow.id),details:`${requestRow.reference} - ${next}`,...metadata(req)});
  res.json({ok:true,status:next});
}));
app.post("/api/welfare/contributions",auth,requireWelfare("create"),asyncRoute(async(req,res)=>{
  const b=req.body,memberId=Number(b.memberId),amount=Number(b.amount),expected=Number(b.expectedAmount||50000);
  if(!Number.isInteger(memberId)||!b.contributionType||!b.paymentMethod||!Number.isFinite(amount)||amount<=0)
    return res.status(400).json({error:"Member, contribution type, payment method and positive amount are required"});
  const receipt=receiptReference("WRCPT"),row=await transaction(async client=>{
    const member=(await client.query("SELECT id,full_name FROM members WHERE id=$1",[memberId])).rows[0];
    if(!member){const error=new Error("Member not found");error.status=404;throw error;}
    const contribution=(await client.query(`INSERT INTO welfare_contributions
      (reference,member_id,contribution_type,period,expected_amount,amount,payment_method,receipt_number,status,contribution_date,recorded_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending_finance_review',$9,$10) RETURNING id,reference,receipt_number AS "receiptNumber"`,
      [reference("WCON"),member.id,String(b.contributionType),String(b.period||"").trim()||null,expected,amount,String(b.paymentMethod),receipt,b.date||new Date(),req.user.id])).rows[0];
    const department=(await client.query("SELECT id FROM departments WHERE code='welfare'")).rows[0];
    const finance=(await client.query(`INSERT INTO organization_finance_entries
      (department_id,reference,entry_type,category,description,counterparty,payment_method,amount,status,receipt_number,transaction_date,recorded_by)
      VALUES ($1,$2,'income','Welfare Contribution',$3,$4,$5,$6,'pending_finance_review',$7,$8,$9) RETURNING id`,
      [department.id,`FIN-${contribution.reference}`,String(b.contributionType),member.full_name,String(b.paymentMethod),amount,receipt,b.date||new Date(),req.user.id])).rows[0];
    await client.query("UPDATE welfare_contributions SET finance_entry_id=$1 WHERE id=$2",[finance.id,contribution.id]);
    return contribution;
  });
  await audit({userId:req.user.id,action:"WELFARE_CONTRIBUTION_RECORDED",entityType:"welfare_contribution",entityId:String(row.id),details:`${row.reference} - pending Finance review`,...metadata(req)});
  res.status(201).json({...row,financeStatus:"pending_finance_review"});
}));app.post("/api/welfare/activities",auth,requireWelfare("create"),asyncRoute(async(req,res)=>{
  const b=req.body,budget=Number(b.budget||0);
  if(!b.activityType||!b.title||!b.description||!b.activityDate||!Number.isFinite(budget)||budget<0)
    return res.status(400).json({error:"Activity type, title, description, date and valid budget are required"});
  const row=await one(`INSERT INTO welfare_activities
    (reference,activity_type,title,description,activity_date,budget,responsible_officer,participants,status,created_by)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'planned',$9) RETURNING id,reference`,
  [reference("WACT"),String(b.activityType),String(b.title).trim(),String(b.description).trim(),b.activityDate,budget,
    String(b.responsibleOfficer||"").trim()||null,String(b.participants||"").trim()||null,req.user.id]);
  res.status(201).json(row);
}));
app.post("/api/welfare/meetings",auth,requireWelfare("create"),asyncRoute(async(req,res)=>{
  const b=req.body;if(!b.title||!b.agenda||!b.scheduledAt)return res.status(400).json({error:"Meeting title, agenda and date are required"});
  const row=await one(`INSERT INTO welfare_committee_meetings
    (reference,title,agenda,venue,scheduled_at,chairperson,participants,status,created_by)
    VALUES ($1,$2,$3,$4,$5,$6,$7,'scheduled',$8) RETURNING id,reference`,
  [reference("WMTG"),String(b.title).trim(),String(b.agenda).trim(),String(b.venue||"").trim()||null,b.scheduledAt,
    String(b.chairperson||"").trim()||null,String(b.participants||"").trim()||null,req.user.id]);
  res.status(201).json(row);
}));

function requireLegal(action="view") {
  return asyncRoute(async(req,res,next)=>{
    const access=await departmentPermission(req.user,"legal",action);
    if(!access) return res.status(403).json({error:`Your Legal assignment does not allow ${action} access`});
    req.legalAccess=access;next();
  });
}
app.get("/api/legal/command-center",auth,requireLegal("view"),asyncRoute(async(req,res)=>{
  const [cases,contracts,policies,complaints,opinions,compliance,courtMatters,documents,departments]=await Promise.all([
    query(`SELECT c.id,c.case_number AS "caseNumber",c.case_category AS category,c.subject_name AS subject,
      c.member_id AS "memberId",c.department_id AS "departmentId",d.name AS department,c.description,c.evidence,
      c.assigned_officer AS "assignedOfficer",c.status,c.risk_level AS "riskLevel",c.next_hearing_at AS "nextHearingAt",
      c.decision,c.attachments,c.timeline_note AS "timelineNote",c.opened_at AS "openedAt",c.closed_at AS "closedAt",
      c.created_at AS "createdAt" FROM legal_cases c LEFT JOIN departments d ON d.id=c.department_id ORDER BY c.id DESC`),
    query(`SELECT c.id,c.contract_number AS "contractNumber",c.title,c.contract_type AS "contractType",c.parties,
      c.department_id AS "departmentId",d.name AS department,c.contract_value::float AS "contractValue",
      c.starts_on AS "startsOn",c.ends_on AS "endsOn",c.renewal_date AS "renewalDate",c.status,
      c.responsible_officer AS "responsibleOfficer",c.supporting_document AS "supportingDocument",
      c.review_notes AS "reviewNotes",c.created_at AS "createdAt",c.updated_at AS "updatedAt"
      FROM legal_contracts c LEFT JOIN departments d ON d.id=c.department_id ORDER BY c.id DESC`),
    query(`SELECT id,reference,policy_name AS "policyName",policy_category AS "policyCategory",version,
      effective_date AS "effectiveDate",review_date AS "reviewDate",status,approval_history AS "approvalHistory",
      document_reference AS "documentReference",created_at AS "createdAt",updated_at AS "updatedAt"
      FROM legal_policies ORDER BY review_date NULLS LAST,id DESC`),
    query(`SELECT c.id,c.complaint_number AS "complaintNumber",c.complainant,c.member_id AS "memberId",
      c.complaint_type AS "complaintType",c.department_id AS "departmentId",d.name AS department,c.description,c.evidence,
      c.assigned_officer AS "assignedOfficer",c.status,c.recommendation,c.decision,c.confidential,
      c.created_at AS "createdAt",c.updated_at AS "updatedAt",c.closed_at AS "closedAt"
      FROM legal_complaints c LEFT JOIN departments d ON d.id=c.department_id ORDER BY c.id DESC`),
    query(`SELECT o.id,o.reference,o.title,o.requested_by_department AS "departmentId",d.name AS department,o.question,
      o.opinion,o.assigned_officer AS "assignedOfficer",o.due_date AS "dueDate",o.status,
      o.document_reference AS "documentReference",o.created_at AS "createdAt",o.completed_at AS "completedAt"
      FROM legal_opinions o LEFT JOIN departments d ON d.id=o.requested_by_department ORDER BY o.due_date NULLS LAST`),
    query(`SELECT c.id,c.reference,c.department_id AS "departmentId",d.name AS department,c.requirement,
      c.policy_reference AS "policyReference",c.compliance_score::float AS "complianceScore",
      c.risk_level AS "riskLevel",c.status,c.due_date AS "dueDate",c.finding,c.corrective_action AS "correctiveAction",
      c.responsible_officer AS "responsibleOfficer",c.reviewed_at AS "reviewedAt"
      FROM legal_compliance c LEFT JOIN departments d ON d.id=c.department_id ORDER BY c.compliance_score,c.id`),
    query(`SELECT m.id,m.court_file AS "courtFile",m.title,m.court_name AS "courtName",m.opposing_party AS "opposingParty",
      m.legal_representative AS "legalRepresentative",m.case_id AS "caseId",m.next_hearing_at AS "nextHearingAt",
      m.court_order AS "courtOrder",m.judgement,m.appeal_status AS "appealStatus",m.legal_expenses::float AS "legalExpenses",
      m.status,m.created_at AS "createdAt" FROM legal_court_matters m ORDER BY m.next_hearing_at NULLS LAST`),
    query(`SELECT doc.id,doc.reference,doc.document_type AS "documentType",doc.title,doc.version,doc.status,
      doc.file_name AS "fileName",doc.updated_at AS "updatedAt",
      EXISTS(SELECT 1 FROM organization_document_versions v WHERE v.document_id=doc.id) AS "hasFile" FROM organization_documents doc
      LEFT JOIN departments d ON d.id=doc.department_id
      WHERE doc.status<>'archived' AND (d.code='legal' OR (doc.status='published' AND doc.visibility_level<=2 AND doc.document_type IN ('Constitution','Policies','Signed Contracts','Legal Documents')))
      ORDER BY doc.updated_at DESC`),
    query("SELECT id,code,name FROM departments WHERE active=true ORDER BY sort_order")
  ]);
  const openCases=cases.rows.filter(x=>!["resolved","closed"].includes(x.status)),resolvedCases=cases.rows.filter(x=>["resolved","closed"].includes(x.status));
  const disciplinary=cases.rows.filter(x=>x.category.toLowerCase().includes("disciplinary"));
  const contractsReview=contracts.rows.filter(x=>["draft","submitted","under_review","information_requested"].includes(x.status));
  const contractsApproved=contracts.rows.filter(x=>["approved","legal_approved","active"].includes(x.status));
  const policiesReview=policies.rows.filter(x=>["draft","under_review","amendment_required"].includes(x.status));
  const pendingOpinions=opinions.rows.filter(x=>x.status!=="completed");
  const scores=compliance.rows.map(x=>x.complianceScore),complianceScore=scores.length?Number((scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(1)):0;
  const now=Date.now(),today=new Date();today.setHours(0,0,0,0);const days30=now+30*86400000;
  const deadlines=[
    ...cases.rows.filter(x=>x.nextHearingAt).map(x=>({type:"Case hearing",reference:x.caseNumber,title:x.subject,date:x.nextHearingAt,target:"legal-cases",risk:x.riskLevel})),
    ...contracts.rows.filter(x=>x.endsOn).map(x=>({type:"Contract expiry",reference:x.contractNumber,title:x.title,date:x.endsOn,target:"legal-contracts",risk:new Date(x.endsOn).getTime()<days30?"high":"medium"})),
    ...policies.rows.filter(x=>x.reviewDate).map(x=>({type:"Policy review",reference:x.reference,title:x.policyName,date:x.reviewDate,target:"legal-policies",risk:new Date(x.reviewDate).getTime()<days30?"high":"low"})),
    ...opinions.rows.filter(x=>x.dueDate&&x.status!=="completed").map(x=>({type:"Legal opinion",reference:x.reference,title:x.title,date:x.dueDate,target:"legal-opinions",risk:new Date(x.dueDate).getTime()<days30?"high":"medium"})),
    ...courtMatters.rows.filter(x=>x.nextHearingAt).map(x=>({type:"Court hearing",reference:x.courtFile,title:x.title,date:x.nextHearingAt,target:"legal-court",risk:"high"}))
  ].filter(x=>new Date(x.date).getTime()>=today.getTime()).sort((a,b)=>new Date(a.date)-new Date(b.date));
  const caseCategories={};for(const row of cases.rows)caseCategories[row.category]=(caseCategories[row.category]||0)+1;
  const contractStatuses={};for(const row of contracts.rows)contractStatuses[row.status]=(contractStatuses[row.status]||0)+1;
  res.json({
    stats:{activeCases:openCases.length,contractsUnderReview:contractsReview.length,contractsApproved:contractsApproved.length,
      policiesAwaitingReview:policiesReview.length,disciplinaryCases:disciplinary.length,
      legalNotices:compliance.rows.filter(x=>["action_required","non_compliant"].includes(x.status)).length,
      pendingLegalOpinions:pendingOpinions.length,complianceScore,courtCases:courtMatters.rows.filter(x=>x.status!=="closed").length,
      upcomingDeadlines:deadlines.filter(x=>new Date(x.date).getTime()<days30).length,resolvedCases:resolvedCases.length,
      legalDocuments:documents.rows.filter(x=>x.hasFile).length,documentRecords:documents.rows.length},
    cases:cases.rows,contracts:contracts.rows,policies:policies.rows,complaints:complaints.rows,opinions:opinions.rows,
    compliance:compliance.rows,courtMatters:courtMatters.rows,documents:documents.rows,departments:departments.rows,deadlines,
    analytics:{caseCategories:Object.entries(caseCategories).map(([label,value])=>({label,value})),
      contractStatuses:Object.entries(contractStatuses).map(([label,value])=>({label,value})),
      complianceTrend:scores.length?[complianceScore]:[],
      complaintTrend:complaints.rows.length?[complaints.rows.filter(x=>new Date(x.createdAt).getMonth()===new Date().getMonth()).length]:[]},
    notifications:[
      deadlines.some(x=>new Date(x.date).getTime()<now+7*86400000)&&{level:"danger",title:`${deadlines.filter(x=>new Date(x.date).getTime()<now+7*86400000).length} legal deadlines fall within seven days`,createdAt:deadlines.find(x=>new Date(x.date).getTime()<now+7*86400000)?.date,target:"legal-calendar"},
      contractsReview.length&&{level:"info",title:`${contractsReview.length} contracts await Legal review`,createdAt:contractsReview[0]?.createdAt||contractsReview[0]?.updatedAt,target:"legal-contracts"},
      policiesReview.length&&{level:"warning",title:`${policiesReview.length} policies require review or amendment`,createdAt:policiesReview[0]?.createdAt||policiesReview[0]?.updatedAt,target:"legal-policies"},
      compliance.rows.some(x=>x.status==="non_compliant")&&{level:"danger",title:`${compliance.rows.filter(x=>x.status==="non_compliant").length} department has a high compliance risk`,createdAt:compliance.rows.find(x=>x.status==="non_compliant")?.updatedAt||compliance.rows.find(x=>x.status==="non_compliant")?.createdAt,target:"legal-compliance"},
      resolvedCases.length&&{level:"success",title:`${resolvedCases.length} legal matters have recorded resolutions`,createdAt:resolvedCases[0]?.closedAt||resolvedCases[0]?.createdAt,target:"legal-cases"}
    ].filter(Boolean),
    access:{authorityLevel:req.legalAccess.authority_level,canCreate:Boolean(req.legalAccess.can_create),
      canEdit:Boolean(req.legalAccess.can_edit),canApprove:Boolean(req.legalAccess.can_approve)}
  });
}));
app.get("/api/legal/search",auth,requireLegal("view"),asyncRoute(async(req,res)=>{
  const term=String(req.query.q||"").trim();if(term.length<2)return res.json({results:[]});const like=`%${term}%`;
  const results=await query(`SELECT * FROM (
    SELECT 'Legal Case' AS type,case_number AS reference,subject_name AS title,case_category||' - '||status AS detail,'legal-cases' AS target
      FROM legal_cases WHERE case_number ILIKE $1 OR subject_name ILIKE $1 OR case_category ILIKE $1 OR assigned_officer ILIKE $1
    UNION ALL SELECT 'Contract',contract_number,title,parties||' - '||status,'legal-contracts'
      FROM legal_contracts WHERE contract_number ILIKE $1 OR title ILIKE $1 OR parties ILIKE $1 OR contract_type ILIKE $1
    UNION ALL SELECT 'Policy',reference,policy_name,policy_category||' - '||status,'legal-policies'
      FROM legal_policies WHERE reference ILIKE $1 OR policy_name ILIKE $1 OR policy_category ILIKE $1
    UNION ALL SELECT 'Complaint',complaint_number,complainant,complaint_type||' - '||status,'legal-complaints'
      FROM legal_complaints WHERE complaint_number ILIKE $1 OR complainant ILIKE $1 OR complaint_type ILIKE $1
    UNION ALL SELECT 'Court Matter',court_file,title,court_name||' - '||status,'legal-court'
      FROM legal_court_matters WHERE court_file ILIKE $1 OR title ILIKE $1 OR court_name ILIKE $1
    UNION ALL SELECT 'Legal Opinion',reference,title,status,'legal-opinions'
      FROM legal_opinions WHERE reference ILIKE $1 OR title ILIKE $1 OR assigned_officer ILIKE $1
    UNION ALL SELECT 'Member Bio' AS type,m.member_number,m.full_name,COALESCE(m.phone,'')||' - '||COALESCE(b.home_district,m.address,'')||' - '||COALESCE(b.bio_status,'pending'),'legal-bio-data'
      FROM members m LEFT JOIN member_bio_data b ON b.member_id=m.id
      WHERE m.member_number ILIKE $1 OR m.full_name ILIKE $1 OR m.national_id ILIKE $1 OR m.phone ILIKE $1
        OR COALESCE(m.email,'') ILIKE $1 OR COALESCE(m.occupation,'') ILIKE $1 OR COALESCE(m.address,'') ILIKE $1
        OR COALESCE(b.home_district,'') ILIKE $1 OR COALESCE(b.village,'') ILIKE $1 OR COALESCE(b.emergency_contact_name,'') ILIKE $1  ) legal_results LIMIT 80`,[like]);res.json({results:results.rows});
}));
app.post("/api/legal/cases",auth,requireLegal("create"),asyncRoute(async(req,res)=>{
  const b=req.body;if(!b.category||!b.subject||!b.description||!["low","medium","high","critical"].includes(b.riskLevel))
    return res.status(400).json({error:"Category, subject, description and valid legal risk are required"});
  const row=await one(`INSERT INTO legal_cases
    (case_number,case_category,subject_name,member_id,department_id,description,evidence,assigned_officer,status,risk_level,
     next_hearing_at,attachments,timeline_note,created_by)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'open',$9,$10,$7,'Matter registered and initial review started',$11)
    RETURNING id,case_number AS "caseNumber"`,
  [reference("LC"),String(b.category),String(b.subject).trim(),b.memberId||null,b.departmentId||null,String(b.description).trim(),
    String(b.evidence||"").trim()||null,String(b.assignedOfficer||"").trim()||null,b.riskLevel,b.nextHearingAt||null,req.user.id]);
  await audit({userId:req.user.id,action:"LEGAL_CASE_CREATED",entityType:"legal_case",entityId:String(row.id),details:row.caseNumber,...metadata(req)});
  res.status(201).json(row);
}));
app.post("/api/legal/contracts",auth,requireLegal("create"),asyncRoute(async(req,res)=>{
  const b=req.body,value=Number(b.contractValue||0);if(!b.title||!b.contractType||!b.parties||!Number.isFinite(value)||value<0)
    return res.status(400).json({error:"Title, contract type, parties and valid value are required"});
  const row=await one(`INSERT INTO legal_contracts
    (contract_number,title,contract_type,parties,department_id,contract_value,starts_on,ends_on,renewal_date,status,
     responsible_officer,supporting_document,review_notes,created_by)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'under_review',$10,$11,$12,$13)
    RETURNING id,contract_number AS "contractNumber"`,
  [reference("CON"),String(b.title).trim(),String(b.contractType),String(b.parties).trim(),b.departmentId||null,value,
    b.startsOn||null,b.endsOn||null,b.renewalDate||null,String(b.responsibleOfficer||"").trim()||null,
    String(b.supportingDocument||"").trim()||null,String(b.reviewNotes||"").trim()||null,req.user.id]);
  res.status(201).json(row);
}));
app.post("/api/legal/complaints",auth,requireLegal("create"),asyncRoute(async(req,res)=>{
  const b=req.body;if(!b.complainant||!b.complaintType||!b.description)return res.status(400).json({error:"Complainant, complaint type and description are required"});
  const row=await one(`INSERT INTO legal_complaints
    (complaint_number,complainant,member_id,complaint_type,department_id,description,evidence,assigned_officer,status,created_by)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'submitted',$9) RETURNING id,complaint_number AS "complaintNumber"`,
  [reference("CMP"),String(b.complainant).trim(),b.memberId||null,String(b.complaintType),b.departmentId||null,
    String(b.description).trim(),String(b.evidence||"").trim()||null,String(b.assignedOfficer||"").trim()||null,req.user.id]);
  res.status(201).json(row);
}));
app.post("/api/legal/policies",auth,requireLegal("create"),asyncRoute(async(req,res)=>{
  const b=req.body;if(!b.policyName||!b.policyCategory||!b.version)return res.status(400).json({error:"Policy name, category and version are required"});
  const row=await one(`INSERT INTO legal_policies
    (reference,policy_name,policy_category,version,effective_date,review_date,status,approval_history,document_reference,created_by)
    VALUES ($1,$2,$3,$4,$5,$6,'under_review','Legal review opened',$7,$8) RETURNING id,reference`,
  [reference("POL"),String(b.policyName).trim(),String(b.policyCategory),String(b.version),b.effectiveDate||null,b.reviewDate||null,
    String(b.documentReference||"").trim()||null,req.user.id]);res.status(201).json(row);
}));
app.post("/api/legal/opinions",auth,requireLegal("create"),asyncRoute(async(req,res)=>{
  const b=req.body;if(!b.title||!b.question||!b.dueDate)return res.status(400).json({error:"Title, legal question and due date are required"});
  const row=await one(`INSERT INTO legal_opinions
    (reference,title,requested_by_department,question,assigned_officer,due_date,status,created_by)
    VALUES ($1,$2,$3,$4,$5,$6,'pending',$7) RETURNING id,reference`,
  [reference("OPN"),String(b.title).trim(),b.departmentId||null,String(b.question).trim(),
    String(b.assignedOfficer||"").trim()||null,b.dueDate,req.user.id]);res.status(201).json(row);
}));
app.post("/api/legal/contracts/:id/decision",auth,requireLegal("approve"),asyncRoute(async(req,res)=>{
  const decision=String(req.body.decision||""),comment=String(req.body.comment||"").trim();
  if(!["approve","reject","more_information"].includes(decision))return res.status(400).json({error:"Choose approve, reject, or request more information"});
  if(decision!=="approve"&&!comment)return res.status(400).json({error:"A legal review comment is required"});
  const contract=await one("SELECT * FROM legal_contracts WHERE id=$1",[req.params.id]);if(!contract)return res.status(404).json({error:"Contract not found"});
  let next=decision==="reject"?"rejected":decision==="more_information"?"information_requested":"legal_approved";
  if(decision==="approve"&&Number(contract.contract_value)>=100000000) {
    const department=await one("SELECT id FROM departments WHERE code='legal'");
    const activity=await one(`INSERT INTO department_activities
      (department_id,reference,activity_type,title,description,amount,status,visibility_level,created_by)
      VALUES ($1,$2,'legal-contract',$3,$4,$5,'pending_executive',4,$6)
      ON CONFLICT (reference) DO UPDATE SET updated_at=NOW() RETURNING id`,
    [department.id,`EXEC-${contract.contract_number}`,`Contract approval - ${contract.title}`,contract.parties,contract.contract_value,req.user.id]);
    next="executive_approval";
    await query("UPDATE legal_contracts SET review_notes=$1,status=$2,updated_at=NOW() WHERE id=$3",[`${comment||"Legally cleared"} - Executive activity ${activity.id}`,next,contract.id]);
  } else await query(`UPDATE legal_contracts SET status=$1,review_notes=$2,approved_by=CASE WHEN $1='legal_approved' THEN $3 ELSE approved_by END,
    updated_at=NOW() WHERE id=$4`,[next,comment||"Legally cleared",req.user.id,contract.id]);
  await query("UPDATE investment_contracts SET status=$1 WHERE legal_contract_id=$2",[next==="legal_approved"?"active":next,contract.id]);
  res.json({ok:true,status:next});
}));
app.post("/api/legal/complaints/:id/advance",auth,requireLegal("edit"),asyncRoute(async(req,res)=>{
  const stages=["submitted","legal_review","investigation","recommendation","decision","closed"],next=String(req.body.status||"");
  if(!stages.includes(next))return res.status(400).json({error:"Choose a valid complaint stage"});
  const row=await one(`UPDATE legal_complaints SET status=$1,recommendation=COALESCE($2,recommendation),
    decision=CASE WHEN $1 IN ('decision','closed') THEN COALESCE($2,decision) ELSE decision END,updated_at=NOW(),
    closed_at=CASE WHEN $1='closed' THEN NOW() ELSE closed_at END WHERE id=$3 RETURNING id`,
  [next,String(req.body.comment||"").trim()||null,req.params.id]);if(!row)return res.status(404).json({error:"Complaint not found"});
  res.json({ok:true,status:next});
}));
app.post("/api/legal/cases/:id/update",auth,requireLegal("edit"),asyncRoute(async(req,res)=>{
  const b=req.body;if(!["open","investigation","hearing","appeal","resolved","closed"].includes(b.status))
    return res.status(400).json({error:"Choose a valid case status"});
  const row=await one(`UPDATE legal_cases SET status=$1,timeline_note=COALESCE($2,timeline_note),
    decision=CASE WHEN $1 IN ('resolved','closed') THEN COALESCE($2,decision) ELSE decision END,
    next_hearing_at=COALESCE($3,next_hearing_at),closed_at=CASE WHEN $1 IN ('resolved','closed') THEN CURRENT_DATE ELSE closed_at END,
    updated_at=NOW() WHERE id=$4 RETURNING id`,[b.status,String(b.note||"").trim()||null,b.nextHearingAt||null,req.params.id]);
  if(!row)return res.status(404).json({error:"Legal case not found"});res.json({ok:true,status:b.status});
}));

function requireAudit(action="view") {
  return asyncRoute(async(req,res,next)=>{
    const access=await departmentPermission(req.user,"audit",action);
    if(!access) return res.status(403).json({error:`Your Audit assignment does not allow ${action} access`});
    req.auditAccess=access;next();
  });
}
app.get("/api/audit/command-center",auth,requireAudit("view"),asyncRoute(async(req,res)=>{
  const [plans,findings,investigations,recommendations,compliance,risks,fraudAlerts,documents,departments,operationalRecords]=await Promise.all([
    query(`SELECT p.id,p.audit_number AS "auditNumber",p.audit_type AS "auditType",p.department_id AS "departmentId",
      d.name AS department,p.audit_period AS "auditPeriod",p.lead_auditor AS "leadAuditor",p.audit_team AS "auditTeam",
      p.objective,p.scope,p.status,p.planned_date AS "plannedDate",p.started_at AS "startedAt",
      p.completion_date AS "completionDate",p.created_at AS "createdAt"
      FROM audit_plans p LEFT JOIN departments d ON d.id=p.department_id ORDER BY p.planned_date,p.id DESC`),
    query(`SELECT f.id,f.finding_number AS "findingNumber",f.audit_id AS "auditId",p.audit_number AS "auditNumber",
      f.department_id AS "departmentId",d.name AS department,f.description,f.evidence,f.risk_level AS "riskLevel",
      f.recommendation,f.responsible_department AS "responsibleDepartmentId",rd.name AS "responsibleDepartment",
      f.due_date AS "dueDate",f.status,f.supporting_document AS "supportingDocument",
      f.repeat_finding AS "repeatFinding",f.created_at AS "createdAt",f.resolved_at AS "resolvedAt"
      FROM audit_findings f LEFT JOIN audit_plans p ON p.id=f.audit_id
      LEFT JOIN departments d ON d.id=f.department_id LEFT JOIN departments rd ON rd.id=f.responsible_department
      ORDER BY CASE f.risk_level WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,f.id DESC`),
    query(`SELECT id,investigation_number AS "investigationNumber",case_description AS "caseDescription",
      lead_auditor AS "leadAuditor",departments_involved AS "departmentsInvolved",evidence,interviews,findings,
      recommendations,final_report AS "finalReport",status,priority,opened_at AS "openedAt",closed_at AS "closedAt",
      created_at AS "createdAt" FROM audit_investigations ORDER BY id DESC`),
    query(`SELECT r.id,r.recommendation_number AS "recommendationNumber",r.finding_id AS "findingId",
      f.finding_number AS "findingNumber",r.department_id AS "departmentId",d.name AS department,r.description,
      r.issued_on AS "issuedOn",r.due_date AS "dueDate",r.status,r.department_response AS "departmentResponse",
      r.follow_up_date AS "followUpDate",r.completed_at AS "completedAt"
      FROM audit_recommendations r LEFT JOIN audit_findings f ON f.id=r.finding_id
      LEFT JOIN departments d ON d.id=r.department_id ORDER BY r.due_date NULLS LAST,r.id DESC`),
    query(`SELECT c.id,c.reference,c.department_id AS "departmentId",d.name AS department,
      c.compliance_area AS "complianceArea",c.compliance_score::float AS "complianceScore",c.status,
      c.finding_summary AS "findingSummary",c.corrective_action AS "correctiveAction",
      c.responsible_officer AS "responsibleOfficer",c.review_date AS "reviewDate"
      FROM audit_compliance c JOIN departments d ON d.id=c.department_id ORDER BY c.compliance_score,c.id`),
    query(`SELECT r.id,r.risk_number AS "riskNumber",r.department_id AS "departmentId",d.name AS department,
      r.risk_category AS "riskCategory",r.description,r.likelihood,r.impact,r.risk_level AS "riskLevel",
      r.mitigation_plan AS "mitigationPlan",r.risk_owner AS "riskOwner",r.status,
      r.last_reviewed_at AS "lastReviewedAt" FROM audit_risks r LEFT JOIN departments d ON d.id=r.department_id
      ORDER BY r.likelihood*r.impact DESC,r.id DESC`),
    query(`SELECT a.id,a.alert_number AS "alertNumber",a.source_type AS "sourceType",
      a.source_reference AS "sourceReference",a.department_id AS "departmentId",d.name AS department,
      a.rule_name AS "ruleName",a.description,a.amount::float AS amount,a.risk_score AS "riskScore",a.status,
      a.assigned_auditor AS "assignedAuditor",a.review_notes AS "reviewNotes",a.detected_at AS "detectedAt",
      a.reviewed_at AS "reviewedAt" FROM audit_fraud_alerts a LEFT JOIN departments d ON d.id=a.department_id
      ORDER BY a.risk_score DESC,a.detected_at DESC`),
    query(`SELECT doc.id,doc.reference,doc.document_type AS "documentType",doc.title,doc.version,doc.status,
      doc.file_name AS "fileName",doc.updated_at AS "updatedAt",
      EXISTS(SELECT 1 FROM organization_document_versions v WHERE v.document_id=doc.id) AS "hasFile" FROM organization_documents doc
      LEFT JOIN departments d ON d.id=doc.department_id
      WHERE doc.status<>'archived' AND (d.code='audit' OR (doc.status='published' AND doc.visibility_level<=2 AND doc.document_type IN ('Audit Reports','Annual Reports','Policies','Signed Contracts')))
      ORDER BY doc.updated_at DESC`),
    query("SELECT id,code,name FROM departments WHERE active=true ORDER BY sort_order"),
    query(`SELECT * FROM (
      SELECT e.reference,'Finance entry' AS type,d.name AS department,e.description,e.amount::float AS amount,
        e.status,e.transaction_date::text AS date
        FROM organization_finance_entries e JOIN departments d ON d.id=e.department_id
      UNION ALL
      SELECT v.voucher_number,'Payment voucher',d.name,v.description,v.amount::float,v.status,v.created_at::date::text
        FROM finance_payment_vouchers v JOIN departments d ON d.id=v.department_id
      UNION ALL
      SELECT t.reference,'Investment transaction','Investment',t.description,t.amount::float,t.transaction_type,t.transaction_date::text
        FROM investment_transactions t
    ) records ORDER BY date DESC LIMIT 40`)
  ]);
  const now=Date.now(),month=30*86400000;
  const completed=plans.rows.filter(x=>x.status==="completed"),inProgress=plans.rows.filter(x=>x.status==="in_progress");
  const pending=plans.rows.filter(x=>["planned","scheduled"].includes(x.status));
  const openFindings=findings.rows.filter(x=>!["resolved","closed"].includes(x.status));
  const resolvedFindings=findings.rows.filter(x=>["resolved","closed"].includes(x.status));
  const openRecommendations=recommendations.rows.filter(x=>!["implemented","closed"].includes(x.status));
  const closedRecommendations=recommendations.rows.filter(x=>["implemented","closed"].includes(x.status));
  const openInvestigations=investigations.rows.filter(x=>!["closed","resolved"].includes(x.status));
  const scores=compliance.rows.map(x=>x.complianceScore);
  const complianceScore=scores.length?Number((scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(1)):0;
  const calendar=[
    ...plans.rows.filter(x=>x.plannedDate).map(x=>({type:"Planned audit",reference:x.auditNumber,title:`${x.auditType} - ${x.department||"Organization"}`,date:x.plannedDate,target:"audit-plans",risk:x.status==="overdue"?"high":"low"})),
    ...findings.rows.filter(x=>x.dueDate&&!["resolved","closed"].includes(x.status)).map(x=>({type:"Finding deadline",reference:x.findingNumber,title:x.description,date:x.dueDate,target:"audit-findings",risk:x.riskLevel})),
    ...recommendations.rows.filter(x=>x.followUpDate&&!["implemented","closed"].includes(x.status)).map(x=>({type:"Follow-up review",reference:x.recommendationNumber,title:x.description,date:x.followUpDate,target:"audit-recommendations",risk:new Date(x.followUpDate).getTime()<now?"high":"medium"}))
  ].sort((a,b)=>new Date(a.date)-new Date(b.date));
  const riskDistribution={low:0,medium:0,high:0,critical:0};for(const x of risks.rows)riskDistribution[x.riskLevel]=(riskDistribution[x.riskLevel]||0)+1;
  const findingDepartments={};for(const x of findings.rows)findingDepartments[x.department||"Organization"]=(findingDepartments[x.department||"Organization"]||0)+1;
  res.json({
    stats:{totalAuditsConducted:completed.length,auditsInProgress:inProgress.length,pendingAudits:pending.length,
      auditFindings:openFindings.length,resolvedFindings:resolvedFindings.length,
      highRiskFindings:openFindings.filter(x=>["high","critical"].includes(x.riskLevel)).length,
      departmentsAudited:new Set(plans.rows.filter(x=>x.status==="completed").map(x=>x.departmentId)).size,
      complianceScore,openRecommendations:openRecommendations.length,closedRecommendations:closedRecommendations.length,
      fraudAlerts:fraudAlerts.rows.filter(x=>!["cleared","closed"].includes(x.status)).length,
      pendingInvestigations:openInvestigations.length},
    plans:plans.rows,findings:findings.rows,investigations:investigations.rows,recommendations:recommendations.rows,
    compliance:compliance.rows,risks:risks.rows,fraudAlerts:fraudAlerts.rows,documents:documents.rows,
    departments:departments.rows,operationalRecords:operationalRecords.rows,calendar,
    analytics:{riskDistribution:Object.entries(riskDistribution).map(([label,value])=>({label,value})),
      findingsByDepartment:Object.entries(findingDepartments).map(([label,value])=>({label,value})),
      complianceTrend:scores.length?[complianceScore]:[],
      recommendationRate:recommendations.rows.length?Math.round(closedRecommendations.length/recommendations.rows.length*100):0,
      auditCompletionRate:plans.rows.length?Math.round(completed.length/plans.rows.length*100):0,
      fraudTrend:fraudAlerts.rows.length?[fraudAlerts.rows.filter(x=>new Date(x.detectedAt).getTime()>now-month).length]:[]},
    notifications:[
      openFindings.some(x=>x.riskLevel==="critical")&&{level:"danger",title:`${openFindings.filter(x=>x.riskLevel==="critical").length} critical audit finding requires immediate action`,createdAt:openFindings.find(x=>x.riskLevel==="critical")?.createdAt,target:"audit-findings"},
      openRecommendations.some(x=>x.dueDate&&new Date(x.dueDate).getTime()<now)&&{level:"warning",title:`${openRecommendations.filter(x=>x.dueDate&&new Date(x.dueDate).getTime()<now).length} recommendations are overdue`,createdAt:openRecommendations.find(x=>x.dueDate&&new Date(x.dueDate).getTime()<now)?.dueDate,target:"audit-recommendations"},
      fraudAlerts.rows.some(x=>x.status==="new")&&{level:"danger",title:`${fraudAlerts.rows.filter(x=>x.status==="new").length} new fraud alerts require triage`,createdAt:fraudAlerts.rows.find(x=>x.status==="new")?.detectedAt,target:"audit-fraud"},
      inProgress.length&&{level:"info",title:`${inProgress.length} audit is currently in evidence review`,createdAt:inProgress[0]?.startedAt||inProgress[0]?.plannedDate,target:"audits"},
      completed.length&&{level:"success",title:`${completed.length} audit reports have been completed`,createdAt:completed[0]?.completionDate||completed[0]?.updatedAt,target:"audit-reports"}
    ].filter(Boolean),
    access:{authorityLevel:req.auditAccess.authority_level,canCreate:Boolean(req.auditAccess.can_create),
      canEdit:Boolean(req.auditAccess.can_edit),canApprove:Boolean(req.auditAccess.can_approve),operationalAccess:"read_only"}
  });
}));
app.get("/api/audit/search",auth,requireAudit("view"),asyncRoute(async(req,res)=>{
  const term=String(req.query.q||"").trim();if(term.length<2)return res.json({results:[]});const like=`%${term}%`;
  const results=await query(`SELECT * FROM (
    SELECT 'Audit' AS type,audit_number AS reference,audit_type AS title,audit_period||' - '||status AS detail,'audits' AS target
      FROM audit_plans WHERE audit_number ILIKE $1 OR audit_type ILIKE $1 OR lead_auditor ILIKE $1 OR audit_period ILIKE $1 OR department_id IN (SELECT id FROM departments WHERE name ILIKE $1 OR code ILIKE $1)
    UNION ALL SELECT 'Finding',finding_number,description,risk_level||' risk - '||status,'audit-findings'
      FROM audit_findings WHERE finding_number ILIKE $1 OR description ILIKE $1 OR recommendation ILIKE $1 OR risk_level ILIKE $1 OR department_id IN (SELECT id FROM departments WHERE name ILIKE $1 OR code ILIKE $1)
    UNION ALL SELECT 'Investigation',investigation_number,case_description,priority||' priority - '||status,'audit-investigations'
      FROM audit_investigations WHERE investigation_number ILIKE $1 OR case_description ILIKE $1 OR lead_auditor ILIKE $1
    UNION ALL SELECT 'Recommendation',recommendation_number,description,status,'audit-recommendations'
      FROM audit_recommendations WHERE recommendation_number ILIKE $1 OR description ILIKE $1 OR department_id IN (SELECT id FROM departments WHERE name ILIKE $1 OR code ILIKE $1)
    UNION ALL SELECT 'Risk',risk_number,description,risk_category||' - '||risk_level,'audit-risk'
      FROM audit_risks WHERE risk_number ILIKE $1 OR description ILIKE $1 OR risk_category ILIKE $1 OR risk_level ILIKE $1 OR department_id IN (SELECT id FROM departments WHERE name ILIKE $1 OR code ILIKE $1)
    UNION ALL SELECT 'Fraud Alert',alert_number,rule_name,COALESCE(source_reference,'')||' - '||status,'audit-fraud'
      FROM audit_fraud_alerts WHERE alert_number ILIKE $1 OR rule_name ILIKE $1 OR source_reference ILIKE $1 OR department_id IN (SELECT id FROM departments WHERE name ILIKE $1 OR code ILIKE $1)
  ) audit_results LIMIT 80`,[like]);res.json({results:results.rows});
}));
app.post("/api/audit/plans",auth,requireAudit("create"),asyncRoute(async(req,res)=>{
  const b=req.body;if(!b.auditType||!b.auditPeriod||!b.leadAuditor||!b.objective||!b.scope||!b.plannedDate)
    return res.status(400).json({error:"Audit type, period, lead auditor, objective, scope and planned date are required"});
  const row=await one(`INSERT INTO audit_plans
    (audit_number,audit_type,department_id,audit_period,lead_auditor,audit_team,objective,scope,status,planned_date,created_by)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'planned',$9,$10) RETURNING id,audit_number AS "auditNumber"`,
  [reference("AUD"),String(b.auditType),b.departmentId||null,String(b.auditPeriod).trim(),String(b.leadAuditor).trim(),
    String(b.auditTeam||"").trim()||null,String(b.objective).trim(),String(b.scope).trim(),b.plannedDate,req.user.id]);
  await audit({userId:req.user.id,action:"AUDIT_PLAN_CREATED",entityType:"audit_plan",entityId:String(row.id),details:row.auditNumber,...metadata(req)});
  res.status(201).json(row);
}));
app.post("/api/audit/findings",auth,requireAudit("create"),asyncRoute(async(req,res)=>{
  const b=req.body;if(!b.description||!b.evidence||!b.recommendation||!["low","medium","high","critical"].includes(b.riskLevel))
    return res.status(400).json({error:"Description, evidence, recommendation and valid risk level are required"});
  const result=await transaction(async client=>{
    const finding=(await client.query(`INSERT INTO audit_findings
      (finding_number,audit_id,department_id,description,evidence,risk_level,recommendation,responsible_department,due_date,status,supporting_document,repeat_finding,created_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'open',$10,$11,$12) RETURNING id,finding_number AS "findingNumber"`,
    [reference("FND"),b.auditId||null,b.departmentId||null,String(b.description).trim(),String(b.evidence).trim(),b.riskLevel,
      String(b.recommendation).trim(),b.responsibleDepartmentId||b.departmentId||null,b.dueDate||null,
      String(b.supportingDocument||"").trim()||null,Boolean(b.repeatFinding),req.user.id])).rows[0];
    await client.query(`INSERT INTO audit_recommendations
      (recommendation_number,finding_id,department_id,description,due_date,status,created_by)
      VALUES ($1,$2,$3,$4,$5,'issued',$6)`,[reference("REC"),finding.id,b.responsibleDepartmentId||b.departmentId||null,String(b.recommendation).trim(),b.dueDate||null,req.user.id]);
    return finding;
  });
  await audit({userId:req.user.id,action:"AUDIT_FINDING_RECORDED",entityType:"audit_finding",entityId:String(result.id),details:result.findingNumber,...metadata(req)});
  res.status(201).json(result);
}));
app.post("/api/audit/investigations",auth,requireAudit("create"),asyncRoute(async(req,res)=>{
  const b=req.body;if(!b.caseDescription||!b.leadAuditor||!b.departmentsInvolved||!["low","medium","high","critical"].includes(b.priority))
    return res.status(400).json({error:"Case description, lead auditor, departments and valid priority are required"});
  const row=await one(`INSERT INTO audit_investigations
    (investigation_number,case_description,lead_auditor,departments_involved,evidence,status,priority,created_by)
    VALUES ($1,$2,$3,$4,$5,'open',$6,$7) RETURNING id,investigation_number AS "investigationNumber"`,
  [reference("INV"),String(b.caseDescription).trim(),String(b.leadAuditor).trim(),String(b.departmentsInvolved).trim(),
    String(b.evidence||"").trim()||null,b.priority,req.user.id]);res.status(201).json(row);
}));
app.post("/api/audit/risks",auth,requireAudit("create"),asyncRoute(async(req,res)=>{
  const b=req.body,likelihood=Number(b.likelihood),impact=Number(b.impact);
  if(!b.riskCategory||!b.description||!b.mitigationPlan||likelihood<1||likelihood>5||impact<1||impact>5)
    return res.status(400).json({error:"Category, description, mitigation and likelihood/impact from 1 to 5 are required"});
  const score=likelihood*impact,level=score>=20?"critical":score>=12?"high":score>=6?"medium":"low";
  const row=await one(`INSERT INTO audit_risks
    (risk_number,department_id,risk_category,description,likelihood,impact,risk_level,mitigation_plan,risk_owner,status,last_reviewed_at,created_by)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'open',NOW(),$10) RETURNING id,risk_number AS "riskNumber",risk_level AS "riskLevel"`,
  [reference("RSK"),b.departmentId||null,String(b.riskCategory),String(b.description).trim(),likelihood,impact,level,
    String(b.mitigationPlan).trim(),String(b.riskOwner||"").trim()||null,req.user.id]);res.status(201).json(row);
}));
app.post("/api/audit/plans/:id/status",auth,requireAudit("edit"),asyncRoute(async(req,res)=>{
  const next=String(req.body.status||"");if(!["planned","scheduled","in_progress","completed","overdue"].includes(next))
    return res.status(400).json({error:"Choose a valid audit status"});
  const row=await one(`UPDATE audit_plans SET status=$1,started_at=CASE WHEN $1='in_progress' THEN COALESCE(started_at,NOW()) ELSE started_at END,
    completion_date=CASE WHEN $1='completed' THEN CURRENT_DATE ELSE completion_date END,updated_at=NOW() WHERE id=$2 RETURNING id`,
  [next,req.params.id]);if(!row)return res.status(404).json({error:"Audit not found"});res.json({ok:true,status:next});
}));
app.post("/api/audit/findings/:id/status",auth,requireAudit("edit"),asyncRoute(async(req,res)=>{
  const next=String(req.body.status||""),note=String(req.body.note||"").trim();
  if(!["open","management_response","follow_up","resolved","closed"].includes(next))
    return res.status(400).json({error:"Choose a valid finding status"});
  const row=await one(`UPDATE audit_findings SET status=$1,evidence=CASE WHEN $2='' THEN evidence ELSE evidence||E'\nFollow-up: '||$2 END,
    resolved_at=CASE WHEN $1 IN ('resolved','closed') THEN NOW() ELSE resolved_at END,updated_at=NOW()
    WHERE id=$3 RETURNING id`,[next,note,req.params.id]);if(!row)return res.status(404).json({error:"Finding not found"});
  res.json({ok:true,status:next});
}));
app.post("/api/audit/recommendations/:id/status",auth,requireAudit("edit"),asyncRoute(async(req,res)=>{
  const next=String(req.body.status||""),response=String(req.body.response||"").trim();
  if(!["issued","pending","in_progress","implemented","overdue","closed"].includes(next))
    return res.status(400).json({error:"Choose a valid recommendation status"});
  const row=await one(`UPDATE audit_recommendations SET status=$1,department_response=COALESCE(NULLIF($2,''),department_response),
    verified_by=CASE WHEN $1 IN ('implemented','closed') THEN $3 ELSE verified_by END,
    completed_at=CASE WHEN $1 IN ('implemented','closed') THEN NOW() ELSE completed_at END,updated_at=NOW()
    WHERE id=$4 RETURNING id`,[next,response,req.user.id,req.params.id]);if(!row)return res.status(404).json({error:"Recommendation not found"});
  res.json({ok:true,status:next});
}));
app.post("/api/audit/fraud/:id/review",auth,requireAudit("edit"),asyncRoute(async(req,res)=>{
  const next=String(req.body.status||""),notes=String(req.body.notes||"").trim();
  if(!["under_review","investigating","escalated","cleared","closed"].includes(next)||!notes)
    return res.status(400).json({error:"Review status and evidence-based notes are required"});
  const row=await one(`UPDATE audit_fraud_alerts SET status=$1,review_notes=$2,reviewed_by=$3,reviewed_at=NOW()
    WHERE id=$4 RETURNING id`,[next,notes,req.user.id,req.params.id]);if(!row)return res.status(404).json({error:"Fraud alert not found"});
  res.json({ok:true,status:next});
}));

require("./supervisory-api")({app,auth,asyncRoute,departmentPermission,query,one,audit,metadata,reference});
require("./legal-biodata-api")({app,auth,asyncRoute,departmentPermission,query,one,transaction,audit,metadata});
require("./legal-family-api")({app,auth,asyncRoute,departmentPermission,query,one,audit,metadata});
require("./member-account-api")({app,auth,asyncRoute,query,one,transaction,audit,metadata,upload,fs,path,uploadsDir});
require("./member-self-service-api")({app,auth,asyncRoute,query,one,transaction,audit,metadata,departmentPermission,
  upload,fs,path,uploadsDir,reference});
require("./member-report-api")({app,auth,asyncRoute,query});
require("./legal-membership-api")({app,auth,asyncRoute,departmentPermission,query,one,transaction,audit,metadata,
  upload,fs,path,uploadsDir,strongPassword,generateTemporaryPassword,roles:ROLES});
app.get("/api/users",auth,permit("user:manage"),asyncRoute(async(req,res)=>{
  const users=(await query(`SELECT u.id,u.full_name AS "fullName",u.email,u.phone,u.role,u.active,u.must_change_password AS "mustChangePassword",
    (u.profile_photo_stored_name IS NOT NULL) AS "hasProfilePhoto",
    u.last_login AS "lastLogin",u.created_at AS "createdAt",b.name AS branch,m.member_number AS "memberNumber",
    COALESCE((SELECT json_agg(json_build_object('department',d.name,'code',d.code,'position',da.position_title,
      'level',da.authority_level,'canCreate',da.can_create,'canEdit',da.can_edit,'canApprove',da.can_approve) ORDER BY d.sort_order)
      FROM department_assignments da JOIN departments d ON d.id=da.department_id
      WHERE da.user_id=u.id AND da.active=true),'[]') AS assignments,
    COALESCE((SELECT json_agg(json_build_object('code',od.dept_code,'name',od.dept_name,
      'title',od.body_name||': '||od.position_title) ORDER BY od.dept_name)
      FROM (${officialMemberDepts}) od WHERE od.member_id=u.member_id),'[]') AS "governanceDepartments"
    FROM users u LEFT JOIN branches b ON b.id=u.branch_id LEFT JOIN members m ON m.id=u.member_id ORDER BY u.id DESC`)).rows;
  const departmentRoster=(await query(`SELECT d.code,d.name,
      COUNT(DISTINCT u.id)::int AS "accountCount"
      FROM departments d
      LEFT JOIN (${officialMemberDepts}) od ON od.dept_code=d.code
      LEFT JOIN users u ON u.member_id=od.member_id
      WHERE d.code = ANY($1)
      GROUP BY d.code,d.name
      ORDER BY d.name`,[officialDeptCodes])).rows;
  const otherAccounts=(await one(`SELECT COUNT(*)::int AS count FROM users u
    WHERE NOT EXISTS (SELECT 1 FROM (${officialMemberDepts}) od WHERE od.member_id=u.member_id)`))?.count||0;
  res.json({users,roles:ROLES,departmentRoster,otherAccounts,
    branches:(await query("SELECT * FROM branches WHERE active=true")).rows,
    departments:(await query("SELECT id,code,name FROM departments WHERE active=true ORDER BY sort_order")).rows});
}));
app.post("/api/users",auth,permit("user:manage"),asyncRoute(async(req,res)=>{
  const b=req.body||{};
  const fullName=String(b.fullName||"").trim();
  const email=String(b.email||"").trim().toLowerCase();
  const phone=String(b.phone||"").trim();
  const role=String(b.role||"").trim();
  const branchId=Number(b.branchId||req.user.branch_id);
  const departmentId=b.departmentId?Number(b.departmentId):null;
  const positionTitle=String(b.positionTitle||role||"Staff").trim();
  if(!fullName||fullName.length<2)return res.status(400).json({error:"Full name is required"});
  if(!email||!email.includes("@"))return res.status(400).json({error:"A valid email is required"});
  if(!phone)return res.status(400).json({error:"Phone number is required"});
  if(!ROLES.includes(role))return res.status(400).json({error:"Choose a valid system role"});
  if(!branchId)return res.status(400).json({error:"Branch is required"});
  const temporaryPassword=b.password?String(b.password):generateTemporaryPassword();
  if(!strongPassword(temporaryPassword))return res.status(400).json({error:"Password must include uppercase, lowercase, number and symbol"});
  try{
    const created=await transaction(async client=>{
      const user=(await client.query(`INSERT INTO users
        (full_name,email,phone,password_hash,role,branch_id,created_by,must_change_password)
        VALUES ($1,$2,$3,$4,$5,$6,$7,true) RETURNING id,email,role`,
        [fullName,email,phone,await bcrypt.hash(temporaryPassword,12),role,branchId,req.user.id])).rows[0];
      if(departmentId){
        await client.query(`INSERT INTO department_assignments
          (user_id,department_id,position_title,authority_level,can_view,can_create,can_edit,can_approve,is_head,assigned_by)
          VALUES ($1,$2,$3,2,true,true,true,false,false,$4)`,
          [user.id,departmentId,positionTitle,req.user.id]);
      }
      return user;
    });
    await audit({userId:req.user.id,action:"USER_CREATED",entityType:"user",entityId:String(created.id),
      details:`${fullName} - ${role} - ${email}`,...metadata(req)});
    res.status(201).json({id:created.id,email:created.email,role:created.role,temporaryPassword});
  }catch(error){
    if(error.code==="23505")return res.status(409).json({error:"An account with this email already exists"});
    throw error;
  }
}));
app.patch("/api/users/:id/status",auth,permit("user:manage"),asyncRoute(async(req,res)=>{
  if(Number(req.params.id)===Number(req.user.id)) return res.status(400).json({error:"You cannot deactivate your own account"});
  await query("UPDATE users SET active=$1 WHERE id=$2",[Boolean(req.body.active),req.params.id]);
  await audit({userId:req.user.id,action:req.body.active?"USER_ACTIVATED":"USER_DEACTIVATED",entityType:"user",entityId:req.params.id,...metadata(req)}); res.json({ok:true});
}));
app.post("/api/users/:id/reset-password",auth,permit("user:manage"),asyncRoute(async(req,res)=>{
  const temporaryPassword=req.body.password?String(req.body.password):generateTemporaryPassword();
  if(!strongPassword(temporaryPassword)) return res.status(400).json({error:"Password does not meet security requirements"});
  const result=await query("UPDATE users SET password_hash=$1,must_change_password=true,failed_attempts=0,locked_until=NULL,token_version=token_version+1 WHERE id=$2 RETURNING id",[await bcrypt.hash(temporaryPassword,12),req.params.id]);
  if(result.rowCount!==1)return res.status(404).json({error:"User account not found"});
  await audit({userId:req.user.id,action:"PASSWORD_RESET",entityType:"user",entityId:req.params.id,...metadata(req)}); res.json({ok:true,temporaryPassword});
}));

app.post("/api/transactions",auth,permit("transaction:create"),asyncRoute(async(req,res)=>{
  const b=req.body, amount=Number(b.amount);
  if(!b.memberId||!b.type||!b.method||!Number.isFinite(amount)||amount<=0) return res.status(400).json({error:"Member, type, method and valid amount are required"});
  const ref=reference("TRX");
  const row=await one(`INSERT INTO transactions (reference,member_id,type,method,amount,status,external_reference,notes,recorded_by)
    VALUES ($1,$2,$3,$4,$5,'pending',$6,$7,$8) RETURNING id`,[ref,b.memberId,b.type,b.method,amount,b.externalReference||null,b.notes||null,req.user.id]);
  await audit({userId:req.user.id,action:"TRANSACTION_RECORDED",entityType:"transaction",entityId:String(row.id),details:`${ref} - ${b.type} - UGX ${amount}`,...metadata(req)});
  res.status(201).json({id:row.id,reference:ref,status:"pending"});
}));
app.get("/api/transactions/:id/evidence",auth,asyncRoute(async(req,res)=>{
  const evidence=await one(`SELECT t.member_id,t.evidence_stored_name AS stored,t.evidence_original_name AS original,
    t.evidence_mime_type AS mime FROM transactions t WHERE t.id=$1`,[req.params.id]);
  if(!evidence?.stored)return res.status(404).json({error:"Deposit evidence not found"});
  const ownsEvidence=Number(req.user.member_id)===Number(evidence.member_id);
  const creditsAccess=ownsEvidence?null:await departmentPermission(req.user,"credits","view");
  if(!ownsEvidence&&!creditsAccess&&req.user.role!=="System Admin")return res.status(403).json({error:"You cannot view this deposit evidence"});
  const filePath=path.join(uploadsDir,path.basename(evidence.stored));
  if(!fs.existsSync(filePath))return res.status(404).json({error:"Deposit evidence file is missing"});
  res.set("Content-Disposition",`inline; filename*=UTF-8''${encodeURIComponent(evidence.original||"deposit-evidence")}`);
  res.type(evidence.mime||"application/octet-stream").sendFile(filePath);
}));
app.post("/api/transactions/:id/verify",auth,requireCredits("approve"),asyncRoute(async(req,res)=>{
  const decision=String(req.body.decision||"approve").toLowerCase(),comment=String(req.body.comment||"").trim();
  if(!["approve","reject"].includes(decision))return res.status(400).json({error:"Choose approve or reject"});
  if(decision==="reject"&&comment.length<3)return res.status(400).json({error:"Enter a reason for rejecting this submission"});
  const tx=await transaction(async client=>{
    const locked=(await client.query("SELECT * FROM transactions WHERE id=$1 FOR UPDATE",[req.params.id])).rows[0];
    if(!locked) { const error=new Error("Transaction not found"); error.status=404; throw error; }
    if(locked.status!=="pending") { const error=new Error("Transaction has already been processed"); error.status=409; throw error; }
    if(Number(locked.recorded_by)===Number(req.user.id)) { const error=new Error("Maker-checker rule: you cannot verify your own transaction"); error.status=409; throw error; }
    if(decision==="approve"&&locked.submission_source==="member"&&!locked.evidence_stored_name){const error=new Error("Member payment evidence must be reviewed before approval");error.status=409;throw error;}
    const needsFinance=decision==="approve"&&locked.type==="Annual subscription fee";
    const statusValue=decision==="approve"?(needsFinance?"pending_finance_review":"completed"):"rejected";
    let receipt=decision==="approve"&&!needsFinance?(locked.receipt_number||receiptReference("RCPT")):locked.receipt_number;
    let allocationNotes=null;
    if(decision==="approve"&&locked.type==="Loan repayment"){
      if(!locked.loan_id){const error=new Error("Loan repayment is missing its linked loan");error.status=409;throw error;}
      const settleEarlyFull=/\[EARLY_SETTLEMENT_(?:FULL|PRINCIPAL)\]/i.test(String(locked.notes||""));
      const allocation=await applyLoanRepayment(client,locked.loan_id,Number(locked.amount),{settleEarlyFull});
      allocationNotes=`charges=${allocation.chargeApplied.toFixed(2)}, interest=${allocation.interestApplied.toFixed(2)}, principal=${allocation.principalApplied.toFixed(2)}${settleEarlyFull?" | early settlement (principal + first-month interest)":""}`;
    }
    const updated=await client.query(`UPDATE transactions SET status=$1,verified_by=$2,verified_at=NOW(),verification_comment=$3,
      receipt_number=$4,notes=CASE WHEN $5::text IS NOT NULL THEN TRIM(BOTH FROM COALESCE(notes,'')||' | '||$5) ELSE notes END WHERE id=$6 AND status='pending' RETURNING id`,
    [statusValue,req.user.id,comment||(decision==="approve"?"Funds received and evidence verified":null),receipt,allocationNotes,locked.id]);
    if(updated.rowCount!==1) { const error=new Error("Transaction has already been processed"); error.status=409; throw error; }
    if(decision==="approve"&&locked.type==="Savings deposit") await client.query("UPDATE members SET savings_balance=savings_balance+$1 WHERE id=$2",[locked.amount,locked.member_id]);
    if(decision==="approve"&&locked.type==="Share purchase") await client.query("UPDATE members SET share_capital=share_capital+$1 WHERE id=$2",[locked.amount,locked.member_id]);
    if(needsFinance){
      const creditsDepartment=(await client.query("SELECT id FROM departments WHERE code='credits'")).rows[0];
      const member=(await client.query("SELECT full_name FROM members WHERE id=$1",[locked.member_id])).rows[0];
      const finance=(await client.query(`INSERT INTO organization_finance_entries
        (department_id,reference,entry_type,category,description,counterparty,payment_method,amount,status,
         supporting_document,transaction_date,recorded_by)
        VALUES ($1,$2,'income','Annual Subscription Fees',$3,$4,$5,$6,'pending_finance_review',$7,CURRENT_DATE,$8)
        RETURNING id`,[creditsDepartment.id,reference("FIN-SUB"),`Annual subscription fee  -  ${locked.reference}`,
          member.full_name,locked.method,locked.amount,`/api/transactions/${locked.id}/evidence`,locked.recorded_by])).rows[0];
      await client.query("UPDATE transactions SET finance_entry_id=$1 WHERE id=$2",[finance.id,locked.id]);
    }
    await client.query("INSERT INTO notifications (member_id,title,message) VALUES ($1,$2,$3)",[locked.member_id,
      decision==="approve"?`${locked.type} verified`:`${locked.type} rejected`,
      decision==="approve"?(needsFinance?`${locked.reference} was confirmed by Credits and sent to Finance for bank-account verification.`:`${locked.reference} was verified. Official receipt ${receipt} is available.`):`${locked.reference} was rejected: ${comment}`]);
    return {...locked,receipt,statusValue};
  });
  await audit({userId:req.user.id,action:decision==="approve"?"TRANSACTION_VERIFIED":"TRANSACTION_REJECTED",entityType:"transaction",
    entityId:String(tx.id),details:`${tx.reference} - ${comment||tx.statusValue}`,...metadata(req)});
  res.json({ok:true,status:tx.statusValue,receiptNumber:tx.receipt});
}));
app.post("/api/loans",auth,upload.single("supportingDocument"),(req,res,next)=>{
  if(req.user.member_id||(permissions[req.user.role]||[]).some(permission=>["loan:create","loan:manage"].includes(permission)))return next();
  return res.status(403).json({error:"A linked member account or Credits loan authority is required"});
},asyncRoute(async(req,res)=>{
  const b=req.body,canManageLoans=(permissions[req.user.role]||[]).includes("loan:manage"),memberId=canManageLoans&&b.memberId?Number(b.memberId):Number(req.user.member_id),amount=Number(b.amount),term=Number(b.termMonths);
  const member=await one("SELECT * FROM members WHERE id=$1 AND deleted_at IS NULL",[memberId]),product=await one("SELECT * FROM loan_products WHERE id=$1 AND active=true",[b.productId]);
  const securityType=String(b.securityType||"").trim().toLowerCase().replaceAll(/[^a-z]+/g,"_").replace(/^_|_$/g,"");
  const declaration=String(b.borrowerDeclaration||"")==="accepted",overdueDeclaration=String(b.overdueDeclaration||"")==="accepted";
  const savingsSecurity=isSavingsSecurity(securityType),collateralSecurity=securityType==="collateral";
  if(!member||!product||!amount||!term||!declaration||!overdueDeclaration||(!savingsSecurity&&!collateralSecurity))return res.status(400).json({error:"Complete the required loan fields and accept the Kwagalana loan policy"});
  const customProductName=String(b.customProductName||"").trim().slice(0,120);
  if(/^other loan$/i.test(product.name)&&!customProductName)return res.status(400).json({error:"Type the loan product name when selecting Other Loan"});
  const processingFeeRate=Number(product.processing_fee_rate||2);
  const processingFee=Math.round((amount*processingFeeRate/100+Number.EPSILON)*100)/100;
  const existing=await one(`SELECT COALESCE(SUM(balance),0)::float AS balance,
    COUNT(*)::int AS running,
    COUNT(*) FILTER (WHERE status='overdue')::int AS overdue
    FROM loans WHERE member_id=$1 AND status IN ('active','overdue')`,[memberId]);
  if(existing.running>0){
    const running=await getRunningLoan(memberId);
    return res.status(400).json({error:`You already have a running loan${running?.reference?` (${running.reference})`:""}. Settle it fully before applying for another loan or guaranteeing someone else.`});
  }
  const activeGuarantee=await one(`SELECT l.reference,borrower.full_name AS borrower
    FROM loan_guarantors lg JOIN loans l ON l.id=lg.loan_id JOIN members borrower ON borrower.id=l.member_id
    WHERE lg.member_id=$1 AND lg.status IN ('pending','accepted')
      AND l.status NOT IN ('rejected','completed','closed')
    ORDER BY lg.id DESC LIMIT 1`,[memberId]);
  if(activeGuarantee){
    return res.status(400).json({error:`You cannot apply for a loan while guaranteeing ${activeGuarantee.borrower}'s loan ${activeGuarantee.reference}. Settle that loan first.`});
  }
  const closingPosition=await one(`SELECT p.period_end AS "periodEnd",b.savings_balance::float AS savings,
    b.expected_savings::float AS expected
    FROM members m JOIN legacy_member_opening_balances b ON b.id=m.legacy_opening_balance_id
    JOIN financial_reporting_periods p ON p.id=b.period_id WHERE m.id=$1`,[memberId]);
  let pastYearTargetCompleted=false;
  if(closingPosition){
    const arrearsPaid=Number((await one(`SELECT COALESCE(SUM(amount),0)::float AS amount FROM transactions
      WHERE member_id=$1 AND type='Savings deposit' AND status='completed' AND target_fiscal_year=EXTRACT(YEAR FROM $2::date)::int`,
      [memberId,closingPosition.periodEnd])).amount||0);
    const totalPaid=Number(closingPosition.savings)+arrearsPaid;
    const expected=Number(closingPosition.expected||0);
    const shortfall=Math.max(0,Math.round((expected-totalPaid)*100)/100);
    if(shortfall>0.005){
      const fy=`FY ${new Date(closingPosition.periodEnd).getUTCFullYear()-1}/${String(new Date(closingPosition.periodEnd).getUTCFullYear()).slice(-2)}`;
      return res.status(400).json({error:`Complete your ${fy} savings target before applying for a loan. Amount remaining to complete target: UGX ${shortfall.toLocaleString()}.`,remainingToCompleteTarget:shortfall,fiscalYear:fy});
    }
    // FY 25/26 (closing) target met — unlock loan apply without current-year progress gate
    pastYearTargetCompleted=true;
  }
  const financialYear=await one(`SELECT fiscal_year_label AS "fiscalYear",starts_on AS "startsOn",ends_on AS "endsOn",
    monthly_savings_target::float AS "monthlySavingsTarget",
    LEAST(12,GREATEST(0,(EXTRACT(YEAR FROM age(date_trunc('month',LEAST(CURRENT_DATE,ends_on+INTERVAL '1 day')),date_trunc('month',starts_on)))*12+
      EXTRACT(MONTH FROM age(date_trunc('month',LEAST(CURRENT_DATE,ends_on+INTERVAL '1 day')),date_trunc('month',starts_on))))::int)) AS "monthsDue"
    FROM member_financial_year_policies
    WHERE status='active' AND CURRENT_DATE BETWEEN starts_on AND ends_on ORDER BY starts_on DESC LIMIT 1`);
  // Members who completed FY 25/26 may apply freely; only members without that closing target must stay on current-year pace
  if(financialYear&&!pastYearTargetCompleted){
    const yearSavings=Number((await one(`SELECT COALESCE(SUM(amount),0)::float AS amount FROM transactions
      WHERE member_id=$1 AND type='Savings deposit' AND status='completed'
        AND (target_fiscal_year=EXTRACT(YEAR FROM $3::date)::int OR (target_fiscal_year IS NULL AND created_at::date BETWEEN $2 AND $3))`,
      [memberId,financialYear.startsOn,financialYear.endsOn])).amount||0);
    const expectedToDate=Number(financialYear.monthlySavingsTarget)*Number(financialYear.monthsDue);
    const currentShortfall=Math.max(0,Math.round((expectedToDate-yearSavings)*100)/100);
    if(currentShortfall>0.005){
      return res.status(400).json({error:`Your ${financialYear.fiscalYear} savings progress is behind target. Amount remaining to complete target progress: UGX ${currentShortfall.toLocaleString()}.`,remainingToCompleteTarget:currentShortfall,fiscalYear:financialYear.fiscalYear});
    }
  }
  const policyMaximum=Number(product.max_amount||25000000);
  if(amount>policyMaximum)return res.status(400).json({error:`Amount exceeds the approved limit of UGX ${policyMaximum.toLocaleString()}`});
  if(term>Number(product.max_term))return res.status(400).json({error:`Maximum term is ${product.max_term} months`});
  const collateralDescription=String(b.collateralDescription||"").trim(),collateralOwner=String(b.collateralOwner||"").trim(),collateralOwnerPhone=String(b.collateralOwnerPhone||"").trim(),collateralValue=Number(b.collateralValue||0),collateralConsent=["accepted","true","on"].includes(String(b.collateralOwnerConsent||"").toLowerCase());
  if(collateralSecurity&&(!collateralDescription||!collateralOwner||!collateralOwnerPhone||collateralValue<=0||!collateralConsent))return res.status(400).json({error:"Collateral applications require a description, value, owner, owner phone number and consent"});
  const guarantorIds=savingsSecurity?[...new Set([...(Array.isArray(b.guarantorIds)?b.guarantorIds:[]),b.guarantorId].map(Number).filter(Boolean))]:[];
  if(guarantorIds.includes(Number(memberId)))return res.status(400).json({error:"A member cannot guarantee their own loan"});
  const borrowerSavings=Number(member.savings_balance||0);
  const borrowerCover=Math.min(amount, securityCapacity(borrowerSavings));
  const remainingToCover=Math.max(0, Math.round((amount-borrowerCover)*100)/100);
  const guarantors=guarantorIds.length?(await query(`SELECT m.id,m.full_name,m.savings_balance::float AS savings,u.id AS user_id,
    COALESCE((SELECT COUNT(*) FROM loan_guarantors active_guarantee
      JOIN loans active_loan ON active_loan.id=active_guarantee.loan_id
      WHERE active_guarantee.member_id=m.id
        AND active_guarantee.status IN ('pending','accepted')
        AND active_loan.status NOT IN ('rejected','completed','closed')),0)::int AS "activeGuarantees",
    COALESCE((SELECT COUNT(*) FROM loans running WHERE running.member_id=m.id AND running.status IN ('active','overdue')),0)::int AS "runningLoans",
    COALESCE((SELECT SUM(active_loan.amount) FROM loan_guarantors active_guarantee JOIN loans active_loan ON active_loan.id=active_guarantee.loan_id WHERE active_guarantee.member_id=m.id AND active_guarantee.status IN ('pending','accepted') AND active_loan.status NOT IN ('rejected','completed','closed')),0)::float AS guaranteed
    FROM members m JOIN users u ON u.member_id=m.id WHERE m.id=ANY($1::bigint[]) AND m.status='active' AND m.deleted_at IS NULL AND u.active=true`,[guarantorIds])).rows:[];
  if(savingsSecurity&&guarantors.length!==guarantorIds.length)return res.status(400).json({error:"Every guarantor must be an active member with a login account"});
  const busyGuarantors=guarantors.filter(g=>Number(g.activeGuarantees||0)>0);
  if(savingsSecurity&&busyGuarantors.length){
    return res.status(400).json({error:`${busyGuarantors.map(g=>g.full_name).join(", ")} already guarantee an active loan and cannot guarantee another until that loan is completed.`});
  }
  const borrowerGuarantors=guarantors.filter(g=>Number(g.runningLoans||0)>0);
  if(savingsSecurity&&borrowerGuarantors.length){
    return res.status(400).json({error:`${borrowerGuarantors.map(g=>g.full_name).join(", ")} have a running loan and cannot guarantee until that loan is settled.`});
  }
  if(savingsSecurity&&guarantors.length){
    const savingsChecks=await Promise.all(guarantors.map(async g=>{
      const savings=await getSavingsTargetStatus(g.id);
      return {...g,savingsUpToDate:savings.upToDate,savingsReason:savings.reason};
    }));
    const behind=savingsChecks.filter(g=>!g.savingsUpToDate);
    if(behind.length){
      return res.status(400).json({error:`${behind.map(g=>`${g.full_name} (${g.savingsReason||"savings not up to date"})`).join("; ")}. Members whose savings are not up to date cannot guarantee.`});
    }
  }
  if(savingsSecurity&&remainingToCover>0&&!guarantorIds.length)return res.status(400).json({error:`Your 75% savings security covers ${borrowerCover.toLocaleString()} of ${amount.toLocaleString()}. Choose guarantors to cover the remaining ${remainingToCover.toLocaleString()}.`});
  const guarantorCover=selectedGuarantorCover(guarantors.map(g=>g.savings));
  if(savingsSecurity&&remainingToCover>0&&guarantorCover+0.005<remainingToCover){
    return res.status(400).json({error:`Selected guarantors cover ${guarantorCover.toLocaleString()} at 75% of their savings, but ${remainingToCover.toLocaleString()} is still needed after your own 75% security of ${borrowerCover.toLocaleString()}.`});
  }
  const pledges=allocateGuarantorPledges(remainingToCover, guarantors);
  const storedSecurityType=savingsSecurity?"savings_and_shares":securityType;
  const ref=reference("LN"),initialStatus=savingsSecurity&&pledges.length?"pending-guarantors":"officer-review";
  const eligibilityNote=savingsSecurity
    ?`Savings security at ${SECURITY_RATE*100}%: borrower covers UGX ${borrowerCover.toLocaleString()}; guarantors cover UGX ${remainingToCover.toLocaleString()}`
    :`Open to all members up to UGX ${policyMaximum.toLocaleString()}`;
  const row=await transaction(async client=>{
    const created=(await client.query(`INSERT INTO loans (reference,member_id,product_id,amount,balance,term_months,purpose,status,savings_at_application,existing_loan_balance,eligibility_result,security_type,collateral_description,collateral_value,collateral_owner,collateral_owner_phone,collateral_owner_consent,borrower_declaration_accepted,overdue_declaration_accepted,supporting_document_stored_name,supporting_document_original_name,supporting_document_mime_type,processing_fee,custom_product_name,policy_reference) VALUES ($1,$2,$3,$4,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,true,true,$17,$18,$19,$20,$21,$22) RETURNING id`,[ref,memberId,b.productId,amount,term,String(b.purpose||"").trim(),initialStatus,member.savings_balance,existing.balance,eligibilityNote,storedSecurityType,collateralSecurity?collateralDescription:null,collateralSecurity?collateralValue:null,collateralSecurity?collateralOwner:null,collateralSecurity?collateralOwnerPhone:null,collateralSecurity?collateralConsent:false,req.file?.filename||null,req.file?.originalname||null,req.file?.mimetype||null,processingFee,customProductName||null,product.policy_reference||"AGM-2025-LOAN-RESOLUTION"])).rows[0];
    for(const guarantor of pledges){await client.query("INSERT INTO loan_guarantors (loan_id,member_id,guaranteed_amount) VALUES ($1,$2,$3)",[created.id,guarantor.id,guarantor.pledge]);await client.query("INSERT INTO notifications (user_id,title,message) VALUES ($1,'Loan guarantee request',$2)",[guarantor.user_id,`${member.full_name} asked you to guarantee loan ${ref} for UGX ${guarantor.pledge.toLocaleString()} (75% of your savings capacity).`]);}
    const nextNote=collateralSecurity
      ?`Collateral offered by ${collateralOwner}; Credit Committee appraisal required`
      :`Savings security: borrower 75% = UGX ${borrowerCover.toLocaleString()}; ${pledges.length} guarantor(s) for remaining UGX ${remainingToCover.toLocaleString()}. Processing fee ${processingFee.toLocaleString()} (2%) deducted at disbursement.`;
    await client.query("INSERT INTO loan_workflow_events (loan_id,stage,action,actor_id,comment) VALUES ($1,'application','submitted',$2,$3)",[created.id,req.user.id,nextNote]);return created;
  });
  await audit({userId:req.user.id,action:"LOAN_APPLIED",entityType:"loan",entityId:String(row.id),details:`${ref} - UGX ${amount}`,...metadata(req)});
  res.status(201).json({id:row.id,reference:ref,status:initialStatus,maximumEligible:policyMaximum,processingFee,borrowerCover,remainingToCover,guarantorsRequired:pledges.length});
}));app.post("/api/loans/:id/decision",auth,asyncRoute(async(req,res)=>{
  const loan=await one("SELECT * FROM loans WHERE id=$1",[req.params.id]);
  if(!loan) return res.status(404).json({error:"Loan not found"});
  let d=String(req.body.decision||"").toLowerCase();
  if(d==="recommend")d="approve";
  if(d==="authorize")d="approve";
  const comment=String(req.body.comment||"").slice(0,500);
  if(!["approve","return","reject"].includes(d))return res.status(400).json({error:"Choose approve, return or reject"});
  const helpers=await getLoanApprovals();
  const creditsAccess=await departmentPermission(req.user,"credits","edit")||await departmentPermission(req.user,"credits","approve");
  const executiveAccess=await departmentPermission(req.user,"executive","approve")||await departmentPermission(req.user,"executive","edit");
  const creditsStage=["officer-review","pending","review","correction","committee-review"].includes(loan.status);
  const executiveStage=loan.status==="executive-authorization";
  if(!creditsStage&&!executiveStage)return res.status(403).json({error:"This loan is not awaiting a decision at your stage"});
  const stage=creditsStage?"credits":"executive";
  const progress=await helpers.approvalProgress(loan.id,stage);
  if(!progress.requiredCount)return res.status(409).json({error:`No active ${stage} reviewers are assigned`});
  if(progress.blockedBy)return res.status(409).json({error:`This loan was already ${progress.blockedBy.decision}ed by ${progress.blockedBy.fullName}`});
  if(progress.complete)return res.status(409).json({error:"All required reviewers have already approved this stage"});
  const me=progress.reviewers.find(r=>Number(r.userId)===Number(req.user.id));
  // Committee membership is the source of truth; department flags are only a fallback gate.
  if(creditsStage&&!me&&!creditsAccess)return res.status(403).json({error:"Credits department authority is required"});
  if(executiveStage&&!me&&!executiveAccess)return res.status(403).json({error:"Executive committee authority is required"});
  if(!me)return res.status(403).json({error:"You are not an assigned committee reviewer for this loan"});
  if(me.decision)return res.status(409).json({error:"You have already recorded a decision on this loan"});
  if(!helpers.canUserDecide(progress,req.user.id)){
    if(executiveStage&&helpers.isFinalRejectAuthority(me)){
      return res.status(409).json({error:"Chairperson Tabula Robert decides last. The other Executive committee members must record their decisions first."});
    }
    return res.status(409).json({error:"You cannot decide on this loan at this time"});
  }
  const remainingAfterVote=progress.reviewers.filter(r=>Number(r.userId)!==Number(req.user.id)&&!r.decision);
  if(d==="reject"&&!comment.trim())return res.status(400).json({error:"Enter a reason for this rejection"});
  const isFinalReject=d==="reject"&&helpers.isFinalRejectAuthority(me);
  const stageComplete=(d==="approve"||(d==="reject"&&!isFinalReject))&&remainingAfterVote.length===0;
  const result=await transaction(async client=>{
    await client.query(`INSERT INTO loan_stage_votes (loan_id,stage,user_id,decision,comment)
      VALUES ($1,$2,$3,$4,$5)
      ON CONFLICT (loan_id,stage,user_id) DO UPDATE SET decision=EXCLUDED.decision,comment=EXCLUDED.comment,created_at=NOW()`,
      [loan.id,stage,req.user.id,d,comment]);
    const eventComment=d==="reject"&&!isFinalReject
      ?`Advisory rejection recorded; loan continues. ${comment}`
      :(comment||`${stage} vote by ${req.user.full_name}`);
    await client.query("INSERT INTO loan_workflow_events (loan_id,stage,action,actor_id,comment) VALUES ($1,$2,$3,$4,$5)",
      [loan.id,loan.status,d==="reject"&&!isFinalReject?"advisory-reject":d,req.user.id,eventComment]);

    let next=loan.status;
    if(d==="reject"&&isFinalReject){
      next="rejected";
    } else if(d==="return"){
      next=stage==="credits"?"correction":"officer-review";
      if(stage==="executive"){
        await client.query("DELETE FROM loan_stage_votes WHERE loan_id=$1 AND stage='credits'",[loan.id]);
      }
      await client.query("DELETE FROM loan_stage_votes WHERE loan_id=$1 AND stage=$2",[loan.id,stage]);
    } else if(stageComplete){
      if(stage==="credits"){
        next="executive-authorization";
        await client.query(`UPDATE loans SET recommended_by=$1,officer_comment=$2,committee_approved_by=$1,committee_comment=$2,verified_amount=amount WHERE id=$3`,
          [req.user.id,comment,loan.id]);
      } else {
        next="ready-disbursement";
        await client.query(`UPDATE loans SET authorized_by=$1,executive_comment=$2,authorized_at=NOW(),verified_amount=COALESCE(verified_amount,amount) WHERE id=$3`,
          [req.user.id,comment,loan.id]);
        await client.query(`INSERT INTO loan_disbursements (loan_id,amount,method,destination,status,prepared_by,authorized_by,authorized_at)
          VALUES ($1,$2,$3,$4,'authorized',$5,$6,NOW()) ON CONFLICT (loan_id) DO UPDATE
          SET amount=EXCLUDED.amount,method=EXCLUDED.method,destination=EXCLUDED.destination,status='authorized',authorized_by=EXCLUDED.authorized_by,authorized_at=NOW()`,
          [loan.id,loan.verified_amount||loan.amount,"Pending selection","To be confirmed at disbursement",loan.committee_approved_by||loan.recommended_by||req.user.id,req.user.id]);
      }
    } else {
      next=stage==="credits"?"officer-review":"executive-authorization";
      if(stage==="credits"&&!loan.recommended_by){
        await client.query("UPDATE loans SET recommended_by=$1,officer_comment=$2 WHERE id=$3",[req.user.id,comment,loan.id]);
      }
    }
    if(next!==loan.status)await client.query("UPDATE loans SET status=$1 WHERE id=$2",[next,loan.id]);

    if((d==="approve"||(d==="reject"&&!isFinalReject))&&remainingAfterVote.length){
      for(const reviewer of remainingAfterVote){
        await client.query("INSERT INTO notifications (user_id,title,message) VALUES ($1,$2,$3)",
          [reviewer.userId,"Loan awaiting your review",
            d==="reject"
              ?`Loan ${loan.reference} continues after an advisory rejection. Any remaining ${stage} reviewer may decide.`
              :`Loan ${loan.reference} still needs your ${stage} approval. Any remaining committee member may decide.`]);
      }
    } else if(next==="executive-authorization"){
      const execReviewers=await helpers.departmentReviewers("executive");
      for(const reviewer of execReviewers){
        await client.query("INSERT INTO notifications (user_id,title,message) VALUES ($1,$2,$3)",
          [reviewer.id,"Loan awaiting Executive review",`Loan ${loan.reference} has cleared Credits. Any Executive committee member may approve or reject.`]);
      }
    }
    return {next,isFinalReject,advisoryReject:d==="reject"&&!isFinalReject};
  });
  await audit({userId:req.user.id,action:result.advisoryReject?"LOAN_ADVISORY_REJECT":`LOAN_${d.toUpperCase()}`,entityType:"loan",entityId:String(loan.id),details:`${loan.reference} - ${comment}`,...metadata(req)});
  res.json({ok:true,status:result.next,advisoryReject:Boolean(result.advisoryReject),finalReject:Boolean(result.isFinalReject)});
}));app.get("/api/loans/guarantor-candidates",auth,asyncRoute(async(req,res)=>{
  if(!req.user.member_id&&!await canAccessLoanRecords(req.user))return res.status(403).json({error:"A linked member account or Credits access is required"});
  const borrowerId=req.query.memberId?Number(req.query.memberId):Number(req.user.member_id);
  if(!Number.isInteger(borrowerId)||borrowerId<=0)return res.status(400).json({error:"Choose the borrower before selecting guarantors"});
  const borrower=await one(`SELECT m.id,m.member_number AS "memberNumber",m.full_name AS "fullName",
    m.savings_balance::float AS savings FROM members m WHERE m.id=$1 AND m.deleted_at IS NULL`,[borrowerId]);
  if(!borrower)return res.status(404).json({error:"Borrower not found"});
  const rows=(await query(`SELECT m.id,m.member_number AS "memberNumber",m.full_name AS "fullName",
    m.savings_balance::float AS savings,
    COALESCE((SELECT COUNT(*) FROM loan_guarantors lg
      JOIN loans l ON l.id=lg.loan_id
      WHERE lg.member_id=m.id
        AND lg.status IN ('pending','accepted')
        AND l.status NOT IN ('rejected','completed','closed')),0)::int AS "activeGuarantees",
    COALESCE((SELECT COUNT(*) FROM loans running
      WHERE running.member_id=m.id AND running.status IN ('active','overdue')),0)::int AS "runningLoans",
    (SELECT running.reference FROM loans running
      WHERE running.member_id=m.id AND running.status IN ('active','overdue')
      ORDER BY CASE WHEN running.status='overdue' THEN 0 ELSE 1 END, running.id DESC LIMIT 1) AS "runningLoanReference"
    FROM members m
    WHERE m.status='active' AND m.id<>$1
      AND EXISTS (SELECT 1 FROM users u WHERE u.member_id=m.id AND u.active=true)
    ORDER BY m.full_name`,[borrowerId])).rows;
  const candidates=await Promise.all(rows.map(async row=>{
    let reason=null,code=null;
    if(Number(row.activeGuarantees)>0){
      reason="Already guaranteeing an active loan — unavailable until that loan is completed";
      code="busy_guarantor";
    }else if(Number(row.runningLoans)>0){
      reason=`Has a running loan${row.runningLoanReference?` (${row.runningLoanReference})`:""} — cannot guarantee until settled`;
      code="running_loan";
    }else{
      const savings=await getSavingsTargetStatus(row.id);
      if(!savings.upToDate){
        reason=savings.reason||"Savings are not up to date — cannot guarantee";
        code="savings_behind";
      }
    }
    return {
      ...row,
      securityCapacity:securityCapacity(row.savings),
      available:!reason,
      unavailableReason:reason,
      unavailableCode:code
    };
  }));
  res.json({
    securityRate:SECURITY_RATE,
    borrower:{
      ...borrower,
      securityCapacity:securityCapacity(borrower.savings)
    },
    candidates
  });
}));
app.post("/api/loans/:id/guarantor-response",auth,asyncRoute(async(req,res)=>{
  if(!req.user.member_id)return res.status(403).json({error:"Only linked member accounts can respond as guarantors"});
  const loan=await one("SELECT * FROM loans WHERE id=$1",[req.params.id]);
  const guarantee=await one("SELECT * FROM loan_guarantors WHERE loan_id=$1 AND member_id=$2",[req.params.id,req.user.member_id]);
  if(!loan||!guarantee)return res.status(404).json({error:"Guarantee request not found"});
  if(loan.status!=="pending-guarantors"||guarantee.status!=="pending")return res.status(409).json({error:"This guarantee request has already been resolved"});
  const accepted=req.body.decision==="accept",note=String(req.body.note||"").trim().slice(0,500);
  if(!accepted&&!note)return res.status(400).json({error:"A rejection reason is required"});
  if(accepted){
    const eligibility=await getGuarantorEligibility(req.user.member_id);
    if(!eligibility.eligible){
      return res.status(400).json({error:eligibility.reason||"You are not eligible to guarantee this loan"});
    }
  }
  await transaction(async client=>{
    await client.query("UPDATE loan_guarantors SET status=$1,response_note=$2,responded_at=NOW() WHERE id=$3",[accepted?"accepted":"rejected",note,guarantee.id]);
    let next="pending-guarantors";
    if(!accepted){
      // One decline does not kill the loan — return to Credits so new guarantors can be arranged
      next="correction";
      await client.query(`UPDATE loans SET officer_comment=COALESCE(officer_comment,'')||$1 WHERE id=$2`,
        [` Guarantor ${req.user.full_name||"member"} declined. Arrange replacement guarantors.`,loan.id]);
    }else{
      const pending=(await client.query("SELECT COUNT(*)::int AS count FROM loan_guarantors WHERE loan_id=$1 AND status='pending'",[loan.id])).rows[0].count;
      if(pending===0){
        const acceptedCover=(await client.query(`SELECT COALESCE(SUM(guaranteed_amount),0)::float AS cover
          FROM loan_guarantors WHERE loan_id=$1 AND status='accepted'`,[loan.id])).rows[0].cover;
        next=Number(acceptedCover)>0?"officer-review":"correction";
      }
    }
    await client.query("UPDATE loans SET status=$1 WHERE id=$2",[next,loan.id]);
    await client.query("INSERT INTO loan_workflow_events (loan_id,stage,action,actor_id,comment) VALUES ($1,'guarantor-consent',$2,$3,$4)",
      [loan.id,accepted?"accepted":"rejected",req.user.id,note]);
  });
  res.json({ok:true,status:accepted?"accepted":"rejected",loanStatus:accepted?"pending-guarantors":"correction"});
}));
app.post("/api/loans/:id/finance-verification",auth,(_req,res)=>res.status(410).json({error:"Finance does not approve loans. Credit Committee approval is sent directly to Executive."}));async function createRepaymentSchedule(client,loan,amount) {
  const product=(await client.query("SELECT annual_rate FROM loan_products WHERE id=$1",[loan.product_id])).rows[0];
  // Equal principal repayments with reducing-balance monthly interest (same as loan calculator).
  const monthlyRate=Number(product.annual_rate)/1200,n=Number(loan.term_months),round=value=>Math.round((value+Number.EPSILON)*100)/100,regularPrincipal=round(amount/n);
  let balance=round(amount);
  for(let installment=1;installment<=n;installment++){
    const openingBalance=balance,principal=installment===n?openingBalance:Math.min(regularPrincipal,openingBalance),interest=round(openingBalance*monthlyRate),total=round(principal+interest);
    await client.query(`INSERT INTO loan_repayment_schedule (loan_id,installment_number,due_date,opening_balance,principal,interest,total_due,status) VALUES ($1,$2::int,(CURRENT_DATE+($2::int::text||' months')::interval)::date,$3,$4,$5,$6,CASE WHEN $2::int=1 THEN 'due' ELSE 'upcoming' END)`,[loan.id,installment,openingBalance,principal,interest,total]);
    balance=round(Math.max(0,openingBalance-principal));
  }
}
app.post("/api/loans/:id/disburse",auth,asyncRoute(async(req,res)=>{
  if(req.user.role==="Executive Officer")
    return res.status(403).json({error:"Disbursement is reserved for the Credits Officer (Nakayiza Baraza Olivia). Executive can only authorize."});
  const disburserEmail=String(req.user.email||"").trim().toLowerCase();
  if(disburserEmail!=="nakayiza.baraza.olivia@gmail.com")
    return res.status(403).json({error:"Only Nakayiza Baraza Olivia can disburse approved loans"});
  if(req.user.role!=="Credits Officer"&&req.user.role!=="System Admin")
    return res.status(403).json({error:"Only the Credits Officer can disburse an approved loan"});
  if(!await departmentPermission(req.user,"credits","edit"))
    return res.status(403).json({error:"Credits disbursement authority is required"});
  const allowedMethods=new Set(["Cash","Mobile Money","Bank transfer","Cheque"]);
  const method=String(req.body.method||"").trim();
  if(!allowedMethods.has(method))
    return res.status(400).json({error:"Choose how the money will be given: Cash, Mobile Money, Bank transfer, or Cheque."});
  const member=await one("SELECT phone FROM members WHERE id=(SELECT member_id FROM loans WHERE id=$1)",[req.params.id]);
  let destination=String(req.body.destination||"").trim();
  if(method==="Cash") destination=destination||"Handed to member";
  else if(method==="Mobile Money") {
    destination=destination||String(member?.phone||"").trim();
    if(!destination) return res.status(400).json({error:"Enter the mobile money number receiving the disbursement."});
  } else if(method==="Bank transfer") {
    if(!destination) return res.status(400).json({error:"Enter the bank account details receiving the disbursement."});
  } else if(method==="Cheque") {
    if(!destination) return res.status(400).json({error:"Enter the cheque number and payee details."});
  }
  const transactionReference=reference("DSB");
  const result=await transaction(async client=>{
    const loan=(await client.query("SELECT * FROM loans WHERE id=$1 FOR UPDATE",[req.params.id])).rows[0];
    const disbursement=(await client.query("SELECT * FROM loan_disbursements WHERE loan_id=$1 FOR UPDATE",[req.params.id])).rows[0];
    if(!loan||loan.status!=="ready-disbursement"||!disbursement||disbursement.status!=="authorized") {
      const error=new Error("Loan is not ready for disbursement or was already disbursed");error.status=409;throw error;
    }
    const fullAmount=Number(disbursement.amount||loan.verified_amount||loan.amount);
    const product=(await client.query("SELECT processing_fee_rate FROM loan_products WHERE id=$1",[loan.product_id])).rows[0];
    const feeRate=Number(product?.processing_fee_rate||2);
    let processingFee=Number(loan.processing_fee||0);
    if(!processingFee)processingFee=Math.round((fullAmount*feeRate/100+Number.EPSILON)*100)/100;
    const netCash=Math.max(0,Math.round((fullAmount-processingFee+Number.EPSILON)*100)/100);
    const disbursed=await client.query(`UPDATE loan_disbursements
      SET status='disbursed',method=$1,destination=$2,disbursed_by=$3,transaction_reference=$4,disbursed_at=NOW()
      WHERE id=$5 AND status='authorized' RETURNING id`,[method,destination,req.user.id,transactionReference,disbursement.id]);
    if(disbursed.rowCount!==1){const error=new Error("Loan was already disbursed");error.status=409;throw error;}
    const activated=await client.query(`UPDATE loans SET status='active',amount=$1,balance=$1,processing_fee=$2,disbursed_at=NOW(),due_date=(CURRENT_DATE+($3||' months')::interval)::date
      WHERE id=$4 AND status='ready-disbursement' RETURNING id`,[fullAmount,processingFee,loan.term_months,loan.id]);
    if(activated.rowCount!==1){const error=new Error("Loan status changed before disbursement");error.status=409;throw error;}
    const payoutNote=method==="Cash"
      ?`Cash handed to member after ${feeRate}% processing fee of UGX ${processingFee.toLocaleString()}. Full principal UGX ${fullAmount.toLocaleString()} remains repayable with organization interest.`
      :`Net amount paid by ${method} to ${destination} after ${feeRate}% processing fee of UGX ${processingFee.toLocaleString()}. Full principal UGX ${fullAmount.toLocaleString()} remains repayable with organization interest.`;
    await client.query(`INSERT INTO transactions (reference,member_id,type,method,amount,status,external_reference,notes,recorded_by,verified_by,verified_at)
      VALUES ($1,$2,'Loan disbursement',$3,$4,'completed',$5,$6,$7,$7,NOW())`,
      [transactionReference,loan.member_id,method,netCash,destination,payoutNote,req.user.id]);
    if(processingFee>0){
      await client.query(`INSERT INTO loan_charges (loan_id,charge_type,amount,paid_amount,status,reason,assessed_by,assessed_at)
        VALUES ($1,'Processing fee',$2,$2,'paid',$3,$4,NOW())`,
        [loan.id,processingFee,`${feeRate}% processing fee deducted from disbursed amount`,req.user.id]);
    }
    await createRepaymentSchedule(client,loan,fullAmount);
    await client.query("INSERT INTO loan_workflow_events (loan_id,stage,action,actor_id,comment) VALUES ($1,'disbursement','disbursed',$2,$3)",
      [loan.id,req.user.id,`${method}${method==="Cash"?"":` to ${destination}`} - ${transactionReference}. Net UGX ${netCash.toLocaleString()}; processing fee UGX ${processingFee.toLocaleString()}.`]);
    const memberUser=(await client.query("SELECT id FROM users WHERE member_id=$1 AND active=true LIMIT 1",[loan.member_id])).rows[0];
    if(memberUser)await client.query("INSERT INTO notifications (user_id,title,message) VALUES ($1,'Loan disbursed',$2)",
      [memberUser.id,`Loan ${loan.reference} has been disbursed by ${method}${method==="Cash"?"":` to ${destination}`}. Net received UGX ${netCash.toLocaleString()} after a ${feeRate}% processing fee. You repay the full UGX ${fullAmount.toLocaleString()} plus 2% monthly organization interest.`]);
    return {loan,netCash,processingFee,fullAmount,method,destination};
  });
  await audit({userId:req.user.id,action:"LOAN_DISBURSED",entityType:"loan",entityId:String(result.loan.id),details:`${transactionReference} · ${result.method}`,...metadata(req)});
  res.json({ok:true,status:"active",transactionReference,netCash:result.netCash,processingFee:result.processingFee,principal:result.fullAmount,method:result.method,destination:result.destination});
}));app.get("/api/loans/:id/supporting-document",auth,asyncRoute(async(req,res)=>{
  const loan=await one("SELECT member_id,supporting_document_stored_name AS stored,supporting_document_original_name AS original,supporting_document_mime_type AS mime FROM loans WHERE id=$1",[req.params.id]);
  if(!loan?.stored)return res.status(404).json({error:"Loan supporting document not found"});
  const isBorrower=Number(req.user.member_id)===Number(loan.member_id),isGuarantor=req.user.member_id&&await one("SELECT 1 FROM loan_guarantors WHERE loan_id=$1 AND member_id=$2",[req.params.id,req.user.member_id]);
  if(!isBorrower&&!isGuarantor&&!await canAccessLoanRecords(req.user))return res.status(403).json({error:"Loan document access denied"});
  const file=path.join(uploadsDir,path.basename(loan.stored));if(!fs.existsSync(file))return res.status(404).json({error:"Stored loan document is missing"});
  res.type(loan.mime||"application/octet-stream");res.set("Content-Disposition",`inline; filename="${String(loan.original||"loan-document").replaceAll('"','')}"`);res.sendFile(file);
}));app.get("/api/loans/:id/details",auth,asyncRoute(async(req,res)=>{
  const loan=await one(`SELECT l.*,m.full_name AS member,m.member_number,
    CASE WHEN NULLIF(l.custom_product_name,'') IS NOT NULL THEN p.name||' ('||l.custom_product_name||')' ELSE p.name END AS product,
    p.annual_rate,l.custom_product_name,l.processing_fee
    FROM loans l JOIN members m ON m.id=l.member_id JOIN loan_products p ON p.id=l.product_id WHERE l.id=$1`,[req.params.id]);
  if(!loan)return res.status(404).json({error:"Loan not found"});
  const isBorrower=Number(req.user.member_id)===Number(loan.member_id);
  const isGuarantor=req.user.member_id&&await one("SELECT 1 FROM loan_guarantors WHERE loan_id=$1 AND member_id=$2",[loan.id,req.user.member_id]);
  const hasStaffAccess=req.user.role!=="Member"&&await canAccessLoanRecords(req.user);
  if(!isBorrower&&!isGuarantor&&!hasStaffAccess)return res.status(403).json({error:"Loan access denied"});
  const helpers=await getLoanApprovals();
  const [guarantors,events,schedule,disbursement,creditsProgress,executiveProgress]=await Promise.all([
    query(`SELECT lg.id,m.full_name AS name,m.member_number AS "memberNumber",lg.status,lg.response_note AS note,lg.responded_at AS "respondedAt"
      FROM loan_guarantors lg JOIN members m ON m.id=lg.member_id WHERE lg.loan_id=$1`,[loan.id]),
    query(`SELECT e.id,e.stage,e.action,e.comment,e.created_at AS "createdAt",COALESCE(u.full_name,'System') AS actor
      FROM loan_workflow_events e LEFT JOIN users u ON u.id=e.actor_id WHERE e.loan_id=$1 ORDER BY e.id`,[loan.id]),
    query(`SELECT installment_number AS installment,due_date AS "dueDate",opening_balance::float AS "openingBalance",
      principal::float,interest::float,total_due::float AS "totalDue",paid_amount::float AS "paidAmount",status
      FROM loan_repayment_schedule WHERE loan_id=$1 ORDER BY installment_number`,[loan.id]),
    one(`SELECT amount::float,method,destination,status,transaction_reference AS "transactionReference",
      prepared_at AS "preparedAt",authorized_at AS "authorizedAt",disbursed_at AS "disbursedAt" FROM loan_disbursements WHERE loan_id=$1`,[loan.id]),
    helpers.approvalProgress(loan.id,"credits"),
    helpers.approvalProgress(loan.id,"executive")
  ]);
  res.json({loan,guarantors:guarantors.rows,events:events.rows,schedule:schedule.rows,disbursement,
    approvalQueues:{credits:creditsProgress,executive:executiveProgress},
    canCurrentUserDecide:{
      credits:helpers.canUserDecide(creditsProgress,req.user.id),
      executive:helpers.canUserDecide(executiveProgress,req.user.id)
    }});
}));

app.post("/api/withdrawals",auth,permit("withdrawal:create","transaction:create"),asyncRoute(async(req,res)=>{
  const b=req.body,memberId=req.user.role==="Member"?req.user.member_id:Number(b.memberId),amount=Number(b.amount);
  const member=await one("SELECT * FROM members WHERE id=$1",[memberId]),setting=await one("SELECT value FROM settings WHERE key='minimumBalance'");
  const minimum=Number(setting.value);
  if(!member||!amount||amount<=0||!b.reason) return res.status(400).json({error:"Complete all required withdrawal fields"});
  if(Number(member.savings_balance)-amount<minimum) return res.status(400).json({error:`A minimum balance of UGX ${minimum.toLocaleString()} must remain`});
  const activeLoan=await one("SELECT id FROM loans WHERE member_id=$1 AND status IN ('active','overdue') LIMIT 1",[memberId]);
  if(activeLoan) return res.status(400).json({error:"Savings and shares cannot be withdrawn while a loan is active, under the signed loan agreement"});
  const ref=reference("WD");
  const row=await one("INSERT INTO withdrawals (reference,member_id,amount,method,reason,requested_by) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id",[ref,memberId,amount,b.method||"Mobile Money",b.reason,req.user.id]);
  await audit({userId:req.user.id,action:"WITHDRAWAL_REQUESTED",entityType:"withdrawal",entityId:String(row.id),details:`${ref} - UGX ${amount}`,...metadata(req)}); res.status(201).json({id:row.id,reference:ref});
}));
app.post("/api/withdrawals/:id/decision",auth,permit("withdrawal:approve"),asyncRoute(async(req,res)=>{
  const approved=req.body.decision==="approve";
  const wd=await transaction(async client=>{
    const locked=(await client.query("SELECT * FROM withdrawals WHERE id=$1 FOR UPDATE",[req.params.id])).rows[0];
    if(!locked) { const error=new Error("Withdrawal not found"); error.status=404; throw error; }
    if(locked.status!=="pending") { const error=new Error("Withdrawal has already been decided"); error.status=409; throw error; }
    if(Number(locked.requested_by)===Number(req.user.id)) { const error=new Error("You cannot approve your own request"); error.status=409; throw error; }
    const updated=await client.query("UPDATE withdrawals SET status=$1,approved_by=$2,approved_at=NOW() WHERE id=$3 AND status='pending' RETURNING id",
      [approved?"approved":"rejected",req.user.id,locked.id]);
    if(updated.rowCount!==1) { const error=new Error("Withdrawal has already been decided"); error.status=409; throw error; }
    return locked;
  });
  await audit({userId:req.user.id,action:approved?"WITHDRAWAL_APPROVED":"WITHDRAWAL_REJECTED",entityType:"withdrawal",entityId:String(wd.id),details:wd.reference,...metadata(req)}); res.json({ok:true});
}));
app.post("/api/withdrawals/:id/process",auth,asyncRoute(async(req,res)=>{
  const allowed=hasPermission(req.user,"withdrawal:process")||Boolean(await departmentPermission(req.user,"credits","edit"));
  if(!allowed)return res.status(403).json({error:"Credits processing authority is required"});
  const processed=await transaction(async client=>{
    const wd=(await client.query("SELECT * FROM withdrawals WHERE id=$1 FOR UPDATE",[req.params.id])).rows[0];
    if(!wd) { const error=new Error("Withdrawal not found"); error.status=404; throw error; }
    if(wd.status!=="approved") { const error=new Error("Withdrawal must be approved and not previously processed"); error.status=409; throw error; }
    const member=(await client.query("SELECT * FROM members WHERE id=$1 FOR UPDATE",[wd.member_id])).rows[0];
    const minimumRow=(await client.query("SELECT value FROM settings WHERE key='minimumBalance'")).rows[0];
    const minimum=Number(minimumRow?.value||0);
    const secured=(await client.query("SELECT COALESCE(SUM(balance),0) AS amount FROM loans WHERE member_id=$1 AND status IN ('active','overdue')",[member.id])).rows[0];
    const remainingBalance=Number(member.savings_balance)-Number(wd.amount);
    if(remainingBalance<minimum||remainingBalance<Number(secured.amount)/3) { const error=new Error("Current savings no longer satisfy minimum balance or active-loan security rules"); error.status=409; throw error; }
    const memberUpdate=await client.query("UPDATE members SET savings_balance=savings_balance-$1 WHERE id=$2 AND savings_balance >= $1 RETURNING savings_balance",[wd.amount,member.id]);
    if(memberUpdate.rowCount!==1) { const error=new Error("Insufficient savings balance"); error.status=409; throw error; }
    const tx=(await client.query(`INSERT INTO transactions
      (reference,receipt_number,member_id,type,method,amount,status,notes,recorded_by,verified_by,verified_at)
      VALUES ($1,$2,$3,'Savings withdrawal',$4,$5,'completed',$6,$7,$7,NOW()) RETURNING id,reference,receipt_number`,
      [reference("WDT"),receiptReference("RCPT"),member.id,wd.method,wd.amount,wd.reason,req.user.id])).rows[0];
    const update=await client.query("UPDATE withdrawals SET status='processed',processed_by=$1,processed_at=NOW(),transaction_id=$2 WHERE id=$3 AND status='approved' RETURNING id",
      [req.user.id,tx.id,wd.id]);
    if(update.rowCount!==1) { const error=new Error("Withdrawal was already processed"); error.status=409; throw error; }
    return {wd,tx,balance:memberUpdate.rows[0].savings_balance};
  });
  await audit({userId:req.user.id,action:"WITHDRAWAL_PROCESSED",entityType:"withdrawal",entityId:String(processed.wd.id),details:`${processed.wd.reference} - ${processed.tx.reference}`,...metadata(req)});
  res.json({ok:true,transactionReference:processed.tx.reference,receiptNumber:processed.tx.receipt_number,balance:Number(processed.balance)});
}));
async function documentAccess(user,document,action="view") {
  if(user.role==="System Admin")return true;
  if(action==="delete"&&["Executive Officer","Legal Officer"].includes(user.role))return true;
  if(action==="view"&&["Auditor","Executive Officer","Supervisory Officer"].includes(user.role))return true;
  if(action==="view"&&document.status==="published"&&user.role==="Member"&&Number(document.visibility_level)<=1)return true;
  if(action==="view"&&document.status==="published"&&user.role!=="Member"&&Number(document.visibility_level)<=2)return true;
  const code=document.department_code||"executive";
  return Boolean(await departmentPermission(user,code,action));
}
const loadDocumentAccess=action=>asyncRoute(async(req,res,next)=>{
  const document=await one(`SELECT doc.*,d.code AS department_code,d.name AS department_name FROM organization_documents doc
    LEFT JOIN departments d ON d.id=doc.department_id WHERE doc.id=$1`,[req.params.id]);
  if(!document)return res.status(404).json({error:"Document not found"});
  if(document.status==="archived"&&action!=="delete")return res.status(410).json({error:"This document has been deleted from active records"});
  if(!await documentAccess(req.user,document,action))return res.status(403).json({error:"Document access denied"});
  req.organizationDocument=document;next();
});
app.get("/api/documents",auth,asyncRoute(async(req,res)=>{
  const code=String(req.query.department||"").trim().toLowerCase();
  if(!code)return res.status(400).json({error:"Choose a department"});
  if(!await departmentPermission(req.user,code,"view")&&!["Auditor","Executive Officer","Supervisory Officer","System Admin"].includes(req.user.role))
    return res.status(403).json({error:"Document access denied"});
  const rows=(await query(`SELECT doc.id,doc.reference,doc.document_type AS "documentType",doc.title,doc.version,doc.status,
    doc.visibility_level AS "visibilityLevel",doc.created_at AS "createdAt",d.code AS department,
    latest.id AS "versionId",latest.original_name AS "fileName",latest.mime_type AS "mimeType",latest.file_size AS "fileSize",latest.sha256
    FROM organization_documents doc JOIN departments d ON d.id=doc.department_id
    LEFT JOIN LATERAL (SELECT * FROM organization_document_versions v WHERE v.document_id=doc.id ORDER BY v.created_at DESC LIMIT 1) latest ON true
    WHERE d.code=$1 AND doc.status<>'archived' ORDER BY doc.updated_at DESC LIMIT 200`,[code])).rows;
  res.json({documents:rows});
}));
app.post("/api/documents",auth,asyncRoute(async(req,res)=>{
  const b=req.body,code=String(b.department||"").trim().toLowerCase();
  const access=await departmentPermission(req.user,code,"create");
  if(!access)return res.status(403).json({error:"Document creation access denied"});
  if(!b.title||!b.documentType)return res.status(400).json({error:"Document title and type are required"});
  let status=["draft","published","pending_executive","archived"].includes(b.status)?b.status:"draft";
  let visibility=Math.max(1,Math.min(5,Number(b.visibilityLevel||2)));
  if(code==="legal"&&status==="published"&&visibility<4)status="pending_executive";
  const row=await one(`INSERT INTO organization_documents
    (reference,department_id,document_type,title,version,status,visibility_level,created_by)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id,reference`,
    [reference("DOC"),access.id,String(b.documentType).trim(),String(b.title).trim(),String(b.version||"1.0").trim(),
      status,visibility,req.user.id]);
  await audit({userId:req.user.id,action:"DOCUMENT_CREATED",entityType:"organization_document",entityId:String(row.id),details:row.reference,...metadata(req)});
  res.status(201).json(row);
}));
app.patch("/api/documents/:id",auth,loadDocumentAccess("edit"),asyncRoute(async(req,res)=>{
  const b=req.body;let status=["draft","published","pending_executive","archived"].includes(b.status)?b.status:req.organizationDocument.status;
  const title=String(b.title||req.organizationDocument.title).trim(),
    documentType=String(b.documentType||req.organizationDocument.document_type).trim(),
    visibility=Math.max(1,Math.min(5,Number(b.visibilityLevel||req.organizationDocument.visibility_level)));
  if(req.organizationDocument.department_code==="legal"&&status==="published"&&visibility<4)status="pending_executive";
  if(!title||!documentType)return res.status(400).json({error:"Document title and type are required"});
  await query(`UPDATE organization_documents SET title=$1,document_type=$2,status=$3,visibility_level=$4,updated_at=NOW()
    WHERE id=$5`,[title,documentType,status,visibility,req.organizationDocument.id]);
  await audit({userId:req.user.id,action:"DOCUMENT_METADATA_UPDATED",entityType:"organization_document",
    entityId:String(req.organizationDocument.id),details:`${documentType} - ${status}`,...metadata(req)});
  res.json({ok:true});
}));
app.delete("/api/documents/:id",auth,loadDocumentAccess("delete"),asyncRoute(async(req,res)=>{
  if(req.organizationDocument.status==="archived")return res.status(404).json({error:"Document is already deleted"});
  await query("UPDATE organization_documents SET status='archived',updated_at=NOW() WHERE id=$1",[req.organizationDocument.id]);
  await audit({userId:req.user.id,action:"DOCUMENT_ARCHIVED",entityType:"organization_document",
    entityId:String(req.organizationDocument.id),details:`${req.organizationDocument.reference} - ${req.organizationDocument.title}`,...metadata(req)});
  res.json({ok:true,recoverable:true});
}));
app.post("/api/documents/:id/versions",auth,loadDocumentAccess("edit"),upload.single("file"),asyncRoute(async(req,res)=>{
  if(!req.file)return res.status(400).json({error:"Choose a document file"});
  const version=String(req.body.version||req.organizationDocument.version||"1.0").trim().slice(0,30);
  const sha256=crypto.createHash("sha256").update(fs.readFileSync(req.file.path)).digest("hex");
  try {
    const row=await transaction(async client=>{
      const created=(await client.query(`INSERT INTO organization_document_versions
        (document_id,version,original_name,stored_name,mime_type,file_size,sha256,uploaded_by)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
        [req.organizationDocument.id,version,path.basename(req.file.originalname),req.file.filename,req.file.mimetype,req.file.size,sha256,req.user.id])).rows[0];
      await client.query("UPDATE organization_documents SET version=$1,file_name=$2,updated_at=NOW() WHERE id=$3",[version,path.basename(req.file.originalname),req.organizationDocument.id]);
      return created;
    });
    await audit({userId:req.user.id,action:"DOCUMENT_VERSION_UPLOADED",entityType:"organization_document",entityId:String(req.organizationDocument.id),details:`version=${version}; sha256=${sha256}`,...metadata(req)});
    res.status(201).json({id:row.id,version,sha256});
  } catch(error) {
    fs.unlink(req.file.path,()=>{});
    if(error.code==="23505")return res.status(409).json({error:"That document version already exists"});
    throw error;
  }
}));
app.post("/api/documents/:id/publication-decision",auth,asyncRoute(async(req,res)=>{
  if(req.user.role!=="Executive Officer")return res.status(403).json({error:"Executive authority is required"});
  const document=await one(`SELECT doc.*,d.code AS department_code FROM organization_documents doc
    JOIN departments d ON d.id=doc.department_id WHERE doc.id=$1`,[req.params.id]);
  if(!document)return res.status(404).json({error:"Document not found"});
  if(document.status!=="pending_executive")return res.status(409).json({error:"This document is not awaiting publication approval"});
  const decision=String(req.body.decision||"").toLowerCase(),comment=String(req.body.comment||"").trim().slice(0,1000);
  if(!["approve","reject"].includes(decision))return res.status(400).json({error:"Choose approve or reject"});
  const next=decision==="approve"?"published":"draft";
  await query(`UPDATE organization_documents SET status=$1,visibility_level=CASE WHEN $1='draft' THEN 4 ELSE visibility_level END,
    approved_by=CASE WHEN $1='published' THEN $3::bigint ELSE NULL::bigint END,updated_at=NOW() WHERE id=$2`,[next,document.id,req.user.id]);
  await audit({userId:req.user.id,action:decision==="approve"?"DOCUMENT_PUBLICATION_APPROVED":"DOCUMENT_PUBLICATION_RETURNED",
    entityType:"organization_document",entityId:String(document.id),details:`${document.reference}${comment?` - ${comment}`:""}`,...metadata(req)});
  res.json({ok:true,status:next});
}));
app.get("/api/documents/:id/download",auth,loadDocumentAccess("view"),asyncRoute(async(req,res)=>{
  const version=await one(`SELECT * FROM organization_document_versions WHERE document_id=$1
    ORDER BY created_at DESC LIMIT 1`,[req.organizationDocument.id]);
  if(!version)return res.status(404).json({error:"No file has been uploaded for this document"});
  const filePath=path.join(uploadsDir,path.basename(version.stored_name));
  if(!fs.existsSync(filePath))return res.status(410).json({error:"Document file is no longer available"});
  await audit({userId:req.user.id,action:"DOCUMENT_DOWNLOADED",entityType:"organization_document",entityId:String(req.organizationDocument.id),details:`version=${version.version}`,...metadata(req)});
  res.type(version.mime_type);res.download(filePath,version.original_name);
}));
app.get("/api/documents/:id/content",auth,loadDocumentAccess("view"),asyncRoute(async(req,res)=>{
  const version=await one(`SELECT * FROM organization_document_versions WHERE document_id=$1
    ORDER BY created_at DESC LIMIT 1`,[req.organizationDocument.id]);
  if(!version)return res.status(404).json({error:"No file has been uploaded for this document"});
  const filePath=path.join(uploadsDir,path.basename(version.stored_name));
  if(!fs.existsSync(filePath))return res.status(410).json({error:"Document file is no longer available"});
  const content=await fs.promises.readFile(filePath);
  await audit({userId:req.user.id,action:"DOCUMENT_VIEWED_IN_APP",entityType:"organization_document",
    entityId:String(req.organizationDocument.id),details:`version=${version.version}`,...metadata(req)});
  res.set("X-Document-Mime-Type",version.mime_type||"application/octet-stream");
  res.type("application/octet-stream").send(content);
}));
app.get("/api/documents/:id/view",auth,loadDocumentAccess("view"),asyncRoute(async(req,res)=>{
  const version=await one(`SELECT * FROM organization_document_versions WHERE document_id=$1
    ORDER BY created_at DESC LIMIT 1`,[req.organizationDocument.id]);
  if(!version)return res.status(404).json({error:"No file has been uploaded for this document"});
  const filePath=path.join(uploadsDir,path.basename(version.stored_name));
  if(!fs.existsSync(filePath))return res.status(410).json({error:"Document file is no longer available"});
  res.set({
    "X-Frame-Options":"SAMEORIGIN",
    "Content-Security-Policy":"default-src 'self' data: blob:; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; frame-ancestors 'self'; object-src 'self' blob:"
  });
  await audit({userId:req.user.id,action:"DOCUMENT_VIEWED",entityType:"organization_document",
    entityId:String(req.organizationDocument.id),details:`version=${version.version}`,...metadata(req)});
  res.setHeader("Content-Disposition",`inline; filename="${path.basename(version.original_name).replaceAll('"',"")}"`);
  res.type(version.mime_type).sendFile(filePath);
}));
async function conversationForUser(conversationId,userId) {
  return one(`SELECT c.*,cm.member_role,cm.archived,cm.muted_until FROM conversations c
    JOIN conversation_members cm ON cm.conversation_id=c.id
    WHERE c.id=$1 AND cm.user_id=$2`,[conversationId,userId]);
}
async function recordMentions(messageId,conversationId,body,senderId) {
  const handles=[...String(body).matchAll(/@([a-zA-Z0-9._-]+)/g)].map(match=>match[1].toLowerCase());
  if(!handles.length)return;
  const mentioned=(await query(`SELECT u.id FROM conversation_members cm JOIN users u ON u.id=cm.user_id
    WHERE cm.conversation_id=$1 AND u.id<>$2
    AND (LOWER(SPLIT_PART(u.email,'@',1))=ANY($3::text[]) OR LOWER(SPLIT_PART(u.full_name,' ',1))=ANY($3::text[]))`,[conversationId,senderId,handles])).rows;
  for(const user of mentioned) {
    await query("INSERT INTO message_mentions (message_id,mentioned_user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING",[messageId,user.id]);
    await query("INSERT INTO notifications (user_id,title,message) VALUES ($1,'You were mentioned',$2)",[user.id,String(body).slice(0,180)]);
  }
}
app.get("/api/messages/contacts",auth,asyncRoute(async(req,res)=>{
  const search=String(req.query.search||"").trim();
  const contacts=(await query(`SELECT u.id,u.full_name AS "fullName",u.role,u.email,u.last_login AS "lastLogin",
    m.member_number AS "memberNumber",b.name AS branch,
    (u.profile_photo_stored_name IS NOT NULL) AS "hasProfilePhoto",
    CASE WHEN u.last_login > NOW()-INTERVAL '15 minutes' THEN true ELSE false END AS online
    FROM users u LEFT JOIN members m ON m.id=u.member_id LEFT JOIN branches b ON b.id=u.branch_id
    WHERE u.active=true AND u.id<>$1 AND ($2='' OR u.full_name ILIKE '%'||$2||'%' OR u.email ILIKE '%'||$2||'%' OR u.role ILIKE '%'||$2||'%')
    ORDER BY online DESC,u.full_name LIMIT 100`,[req.user.id,search])).rows;
  res.json({contacts});
}));
app.get("/api/messages/users/:id/profile",auth,asyncRoute(async(req,res)=>{
  const user=await one(`SELECT u.id,u.full_name AS "fullName",u.role,u.email,u.last_login AS "lastLogin",
    (u.profile_photo_stored_name IS NOT NULL) AS "hasProfilePhoto",m.member_number AS "memberNumber",
    m.status AS "memberStatus",m.joined_at AS "joinedAt",b.name AS branch
    FROM users u LEFT JOIN members m ON m.id=u.member_id LEFT JOIN branches b ON b.id=u.branch_id
    WHERE u.id=$1 AND u.active=true`,[Number(req.params.id)]);
  if(!user)return res.status(404).json({error:"This user profile is unavailable"});
  user.departments=(await query(`SELECT d.name,da.position_title AS title,da.authority_level AS "authorityLevel"
    FROM department_assignments da JOIN departments d ON d.id=da.department_id
    WHERE da.user_id=$1 AND da.active=true ORDER BY d.sort_order`,[user.id])).rows;
  res.json({user});
}));
app.get("/api/messages/conversations",auth,asyncRoute(async(req,res)=>{
  const conversations=(await query(`SELECT c.id,c.type,c.title,c.description,c.only_admins_can_post AS "onlyAdminsCanPost",
    c.last_message_at AS "lastMessageAt",cm.member_role AS "memberRole",cm.archived,cm.muted_until AS "mutedUntil",
    other.id AS "otherUserId",(other.profile_photo_stored_name IS NOT NULL) AS "otherHasProfilePhoto",
    CASE WHEN c.type IN ('group','channel') THEN c.title ELSE other.full_name END AS "otherName",
    CASE WHEN c.type='channel' THEN 'Announcement channel'
      WHEN c.type='group' THEN (SELECT COUNT(*)::text||' members' FROM conversation_members x WHERE x.conversation_id=c.id)
      ELSE other.role END AS "otherRole",
    CASE WHEN c.type='direct' AND other.last_login > NOW()-INTERVAL '15 minutes' THEN true ELSE false END AS online,
    last_msg.body AS "lastMessage",last_msg.sender_id AS "lastSenderId",last_msg.created_at AS "lastMessageDate",
    COUNT(DISTINCT unread.id)::int AS "unreadCount",
    (SELECT COUNT(*)::int FROM conversation_members count_member WHERE count_member.conversation_id=c.id) AS "memberCount"
    FROM conversation_members cm JOIN conversations c ON c.id=cm.conversation_id
    LEFT JOIN users other ON c.type='direct' AND other.id=CASE WHEN c.user_low=$1 THEN c.user_high ELSE c.user_low END
    LEFT JOIN LATERAL (SELECT body,sender_id,created_at FROM messages WHERE conversation_id=c.id AND deleted_at IS NULL ORDER BY id DESC LIMIT 1) last_msg ON true
    LEFT JOIN messages unread ON unread.conversation_id=c.id AND unread.sender_id<>$1 AND unread.deleted_at IS NULL
      AND NOT EXISTS (SELECT 1 FROM message_reads mr WHERE mr.message_id=unread.id AND mr.user_id=$1)
    WHERE cm.user_id=$1
    GROUP BY c.id,cm.member_role,cm.archived,cm.muted_until,other.id,last_msg.body,last_msg.sender_id,last_msg.created_at
    ORDER BY c.last_message_at DESC`,[req.user.id])).rows;
  res.json({conversations});
}));
app.post("/api/messages/conversations",auth,asyncRoute(async(req,res)=>{
  const otherId=Number(req.body.userId);
  if(!otherId||otherId===Number(req.user.id)) return res.status(400).json({error:"Select another system user"});
  const other=await one("SELECT id FROM users WHERE id=$1 AND active=true",[otherId]);
  if(!other) return res.status(404).json({error:"User not found or inactive"});
  const low=Math.min(Number(req.user.id),otherId),high=Math.max(Number(req.user.id),otherId);
  const conversation=await transaction(async client=>{
    const result=(await client.query(`INSERT INTO conversations (user_low,user_high,type,created_by) VALUES ($1,$2,'direct',$3)
      ON CONFLICT (user_low,user_high) DO UPDATE SET user_low=EXCLUDED.user_low RETURNING id`,[low,high,req.user.id])).rows[0];
    await client.query(`INSERT INTO conversation_members (conversation_id,user_id) VALUES ($1,$2),($1,$3) ON CONFLICT DO NOTHING`,[result.id,low,high]);
    return result;
  });
  res.status(201).json({conversationId:conversation.id});
}));
app.post("/api/messages/groups",auth,asyncRoute(async(req,res)=>{
  const title=String(req.body.title||"").trim(),description=String(req.body.description||"").trim().slice(0,500);
  const memberIds=[...new Set((req.body.memberIds||[]).map(Number).filter(Boolean).filter(id=>id!==Number(req.user.id)))];
  if(title.length<3||title.length>80) return res.status(400).json({error:"Group name must contain 3 to 80 characters"});
  if(memberIds.length<1) return res.status(400).json({error:"Select at least one group member"});
  const valid=(await query("SELECT id FROM users WHERE active=true AND id=ANY($1::bigint[])",[memberIds])).rows.map(row=>Number(row.id));
  if(valid.length!==memberIds.length) return res.status(400).json({error:"One or more selected users are not active"});
  const group=await transaction(async client=>{
    const row=(await client.query(`INSERT INTO conversations (type,title,description,created_by,only_admins_can_post)
      VALUES ('group',$1,$2,$3,$4) RETURNING id`,[title,description,req.user.id,Boolean(req.body.onlyAdminsCanPost)])).rows[0];
    await client.query("INSERT INTO conversation_members (conversation_id,user_id,member_role) VALUES ($1,$2,'admin')",[row.id,req.user.id]);
    for(const userId of valid) await client.query("INSERT INTO conversation_members (conversation_id,user_id) VALUES ($1,$2)",[row.id,userId]);
    return row;
  });
  await audit({userId:req.user.id,action:"MESSAGE_GROUP_CREATED",entityType:"conversation",entityId:String(group.id),details:title,...metadata(req)});
  res.status(201).json({conversationId:group.id});
}));
app.get("/api/messages/conversations/:id",auth,asyncRoute(async(req,res)=>{
  const conversation=await conversationForUser(req.params.id,req.user.id);
  if(!conversation) return res.status(404).json({error:"Conversation not found"});
  await query(`INSERT INTO message_reads (message_id,user_id)
    SELECT id,$2 FROM messages WHERE conversation_id=$1 AND sender_id<>$2 AND deleted_at IS NULL
    ON CONFLICT DO NOTHING`,[conversation.id,req.user.id]);
  await query("UPDATE messages SET read_at=COALESCE(read_at,NOW()) WHERE conversation_id=$1 AND sender_id<>$2 AND read_at IS NULL",[conversation.id,req.user.id]);
  const participants=(await query(`SELECT u.id,u.full_name AS "fullName",u.role,u.email,cm.member_role AS "memberRole",
    (u.profile_photo_stored_name IS NOT NULL) AS "hasProfilePhoto",
    CASE WHEN u.last_login > NOW()-INTERVAL '15 minutes' THEN true ELSE false END AS online
    FROM conversation_members cm JOIN users u ON u.id=cm.user_id WHERE cm.conversation_id=$1 ORDER BY cm.member_role DESC,u.full_name`,[conversation.id])).rows;
  const other=conversation.type!=="direct"
    ? {id:conversation.id,fullName:conversation.title,role:conversation.type==="channel"?"Announcement channel":`${participants.length} members`,email:conversation.description||"Organization conversation",online:false,type:conversation.type}
    : participants.find(user=>Number(user.id)!==Number(req.user.id));
  const messages=(await query(`SELECT msg.id,msg.body,msg.sender_id AS "senderId",msg.reply_to_id AS "replyToId",
    msg.created_at AS "createdAt",
    COALESCE((SELECT MAX(read_at) FROM message_reads mr WHERE mr.message_id=msg.id AND mr.user_id<>msg.sender_id),msg.read_at) AS "readAt",
    msg.edited_at AS "editedAt",msg.pinned_at AS "pinnedAt",msg.forwarded_from_id AS "forwardedFromId",msg.delivered_at AS "deliveredAt",
    EXISTS(SELECT 1 FROM message_stars star WHERE star.message_id=msg.id AND star.user_id=$2) AS starred,
    reply.body AS "replyBody",sender.full_name AS "senderName",
    (sender.profile_photo_stored_name IS NOT NULL) AS "senderHasProfilePhoto",
    COALESCE((SELECT json_agg(reaction_data) FROM
      (SELECT emoji,COUNT(*)::int AS count,BOOL_OR(user_id=$2) AS mine FROM message_reactions WHERE message_id=msg.id GROUP BY emoji) reaction_data),'[]') AS reactions
    ,COALESCE((SELECT json_agg(json_build_object('id',att.id,'name',att.original_name,'mimeType',att.mime_type,'size',att.file_size,'downloads',att.download_count) ORDER BY att.id)
      FROM message_attachments att WHERE att.message_id=msg.id AND att.quarantined_at IS NULL),'[]') AS attachments
    FROM messages msg JOIN users sender ON sender.id=msg.sender_id
    LEFT JOIN messages reply ON reply.id=msg.reply_to_id
    WHERE msg.conversation_id=$1 AND msg.deleted_at IS NULL ORDER BY msg.id ASC LIMIT 500`,[conversation.id,req.user.id])).rows;
  const typing=[...(typingPresence.get(String(conversation.id))||new Map()).entries()]
    .filter(([userId,expires])=>Number(userId)!==Number(req.user.id)&&expires>Date.now())
    .map(([userId])=>participants.find(user=>Number(user.id)===Number(userId))?.fullName).filter(Boolean);
  res.json({conversationId:conversation.id,type:conversation.type,title:conversation.title,description:conversation.description,
    onlyAdminsCanPost:conversation.only_admins_can_post,memberRole:conversation.member_role,archived:conversation.archived,
    mutedUntil:conversation.muted_until,other,participants,messages,typingUsers:typing});
}));
app.post("/api/messages/conversations/:id/messages",auth,asyncRoute(async(req,res)=>{
  const conversation=await conversationForUser(req.params.id,req.user.id);
  if(!conversation) return res.status(404).json({error:"Conversation not found"});
  if(conversation.only_admins_can_post&&conversation.member_role!=="admin") return res.status(403).json({error:"Only group administrators can send messages here"});
  const body=String(req.body.body||"").trim();
  if(!body) return res.status(400).json({error:"Write a message first"});
  if(body.length>2000) return res.status(400).json({error:"Messages can contain up to 2,000 characters"});
  const replyTo=req.body.replyToId||null;
  if(replyTo) {
    const reply=await one("SELECT id FROM messages WHERE id=$1 AND conversation_id=$2",[replyTo,conversation.id]);
    if(!reply) return res.status(400).json({error:"Reply target is not in this conversation"});
  }
  const message=await one(`INSERT INTO messages (conversation_id,sender_id,body,reply_to_id)
    VALUES ($1,$2,$3,$4) RETURNING id,created_at AS "createdAt"`,[conversation.id,req.user.id,body,replyTo]);
  await query("UPDATE conversations SET last_message_at=NOW() WHERE id=$1",[conversation.id]);
  await recordMentions(message.id,conversation.id,body,req.user.id);
  res.status(201).json({message});
}));
app.post("/api/messages/channels",auth,asyncRoute(async(req,res)=>{
  const allowed=["System Admin","Executive Officer"];
  if(!allowed.includes(req.user.role)) return res.status(403).json({error:"Your role cannot create announcement channels"});
  const title=String(req.body.title||"").trim(),description=String(req.body.description||"").trim().slice(0,500),audience=req.body.audience||"all";
  if(title.length<3||title.length>80) return res.status(400).json({error:"Channel name must contain 3 to 80 characters"});
  const channel=await transaction(async client=>{
    const row=(await client.query(`INSERT INTO conversations (type,title,description,created_by,only_admins_can_post)
      VALUES ('channel',$1,$2,$3,true) RETURNING id`,[title,description,req.user.id])).rows[0];
    await client.query("INSERT INTO conversation_members (conversation_id,user_id,member_role) VALUES ($1,$2,'admin')",[row.id,req.user.id]);
    let audienceSql="SELECT id FROM users WHERE active=true AND id<>$1";
    if(audience==="members") audienceSql+=" AND role='Member'";
    if(audience==="staff") audienceSql+=" AND role<>'Member'";
    const recipients=(await client.query(audienceSql,[req.user.id])).rows;
    for(const recipient of recipients) await client.query("INSERT INTO conversation_members (conversation_id,user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING",[row.id,recipient.id]);
    return row;
  });
  await audit({userId:req.user.id,action:"ANNOUNCEMENT_CHANNEL_CREATED",entityType:"conversation",entityId:String(channel.id),details:title,...metadata(req)});
  res.status(201).json({conversationId:channel.id});
}));
app.post("/api/messages/conversations/:id/files",auth,upload.array("files",5),asyncRoute(async(req,res)=>{
  const conversation=await conversationForUser(req.params.id,req.user.id);
  if(!conversation) { for(const file of req.files||[])fs.unlink(file.path,()=>{}); return res.status(404).json({error:"Conversation not found"}); }
  if(conversation.only_admins_can_post&&conversation.member_role!=="admin") { for(const file of req.files||[])fs.unlink(file.path,()=>{}); return res.status(403).json({error:"Only group administrators can share files here"}); }
  if(!req.files?.length) return res.status(400).json({error:"Choose at least one file"});
  const caption=String(req.body.caption||"").trim();
  const message=await transaction(async client=>{
    const row=(await client.query(`INSERT INTO messages (conversation_id,sender_id,body) VALUES ($1,$2,$3) RETURNING id`,
      [conversation.id,req.user.id,caption||`Shared ${req.files.length} file${req.files.length>1?"s":""}`])).rows[0];
    for(const file of req.files) await client.query(`INSERT INTO message_attachments
      (message_id,original_name,stored_name,mime_type,file_size,uploaded_by) VALUES ($1,$2,$3,$4,$5,$6)`,
      [row.id,path.basename(file.originalname),file.filename,file.mimetype,file.size,req.user.id]);
    await client.query("UPDATE conversations SET last_message_at=NOW() WHERE id=$1",[conversation.id]);
    return row;
  });
  res.status(201).json({messageId:message.id});
}));
app.get("/api/messages/attachments/:id/download",auth,asyncRoute(async(req,res)=>{
  const attachment=await one(`SELECT att.* FROM message_attachments att JOIN messages msg ON msg.id=att.message_id
    JOIN conversation_members cm ON cm.conversation_id=msg.conversation_id
    WHERE att.id=$1 AND cm.user_id=$2 AND att.quarantined_at IS NULL`,[req.params.id,req.user.id]);
  if(!attachment) return res.status(404).json({error:"Attachment not found"});
  const filePath=path.join(uploadsDir,attachment.stored_name);
  if(!fs.existsSync(filePath)) return res.status(410).json({error:"File is no longer available"});
  await query("UPDATE message_attachments SET download_count=download_count+1 WHERE id=$1",[attachment.id]);
  res.download(filePath,attachment.original_name);
}));
app.get("/api/messages/search",auth,asyncRoute(async(req,res)=>{
  const term=String(req.query.q||"").trim(),filter=String(req.query.filter||"all");
  if(term.length<2&&filter!=="starred") return res.json({results:[]});
  const results=(await query(`SELECT msg.id,msg.body,msg.created_at AS "createdAt",msg.conversation_id AS "conversationId",
    sender.full_name AS "senderName",c.type,COALESCE(c.title,other.full_name) AS "conversationName",
    EXISTS(SELECT 1 FROM message_attachments a WHERE a.message_id=msg.id) AS "hasFile"
    FROM messages msg JOIN conversation_members mine ON mine.conversation_id=msg.conversation_id AND mine.user_id=$1
    JOIN conversations c ON c.id=msg.conversation_id JOIN users sender ON sender.id=msg.sender_id
    LEFT JOIN users other ON c.type='direct' AND other.id=CASE WHEN c.user_low=$1 THEN c.user_high ELSE c.user_low END
    WHERE msg.deleted_at IS NULL AND ($2='' OR to_tsvector('english',msg.body) @@ plainto_tsquery('english',$2))
    AND ($3='all' OR ($3='files' AND EXISTS(SELECT 1 FROM message_attachments a WHERE a.message_id=msg.id))
      OR ($3='starred' AND EXISTS(SELECT 1 FROM message_stars s WHERE s.message_id=msg.id AND s.user_id=$1)))
    ORDER BY msg.created_at DESC LIMIT 100`,[req.user.id,term,filter])).rows;
  res.json({results});
}));
app.patch("/api/messages/conversations/:id/preferences",auth,asyncRoute(async(req,res)=>{
  const conversation=await conversationForUser(req.params.id,req.user.id);
  if(!conversation) return res.status(404).json({error:"Conversation not found"});
  if(req.body.archived!==undefined) await query("UPDATE conversation_members SET archived=$1 WHERE conversation_id=$2 AND user_id=$3",[Boolean(req.body.archived),conversation.id,req.user.id]);
  if(req.body.muted!==undefined) await query("UPDATE conversation_members SET muted_until=$1 WHERE conversation_id=$2 AND user_id=$3",
    [req.body.muted?new Date(Date.now()+365*24*60*60*1000):null,conversation.id,req.user.id]);
  res.json({ok:true});
}));
app.post("/api/messages/messages/:id/star",auth,asyncRoute(async(req,res)=>{
  const message=await one(`SELECT msg.id FROM messages msg JOIN conversation_members cm ON cm.conversation_id=msg.conversation_id
    WHERE msg.id=$1 AND cm.user_id=$2`,[req.params.id,req.user.id]);
  if(!message) return res.status(404).json({error:"Message not found"});
  const existing=await one("SELECT 1 FROM message_stars WHERE message_id=$1 AND user_id=$2",[message.id,req.user.id]);
  if(existing)await query("DELETE FROM message_stars WHERE message_id=$1 AND user_id=$2",[message.id,req.user.id]);
  else await query("INSERT INTO message_stars (message_id,user_id) VALUES ($1,$2)",[message.id,req.user.id]);
  res.json({ok:true});
}));
app.post("/api/messages/messages/:id/forward",auth,asyncRoute(async(req,res)=>{
  const source=await one(`SELECT msg.* FROM messages msg JOIN conversation_members cm ON cm.conversation_id=msg.conversation_id
    WHERE msg.id=$1 AND cm.user_id=$2 AND msg.deleted_at IS NULL`,[req.params.id,req.user.id]);
  const target=await conversationForUser(req.body.conversationId,req.user.id);
  if(!source||!target) return res.status(404).json({error:"Message or target conversation not found"});
  if(target.only_admins_can_post&&target.member_role!=="admin") return res.status(403).json({error:"You cannot post in the target conversation"});
  const forwarded=await one(`INSERT INTO messages (conversation_id,sender_id,body,forwarded_from_id)
    VALUES ($1,$2,$3,$4) RETURNING id`,[target.id,req.user.id,source.body,source.id]);
  await query("UPDATE conversations SET last_message_at=NOW() WHERE id=$1",[target.id]);
  res.status(201).json({messageId:forwarded.id});
}));
app.post("/api/messages/conversations/:id/typing",auth,asyncRoute(async(req,res)=>{
  const conversation=await conversationForUser(req.params.id,req.user.id);
  if(!conversation)return res.status(404).json({error:"Conversation not found"});
  const key=String(conversation.id),users=typingPresence.get(key)||new Map();
  if(req.body.typing)users.set(String(req.user.id),Date.now()+5000);else users.delete(String(req.user.id));
  typingPresence.set(key,users);res.json({ok:true});
}));
app.patch("/api/messages/groups/:id",auth,asyncRoute(async(req,res)=>{
  const group=await conversationForUser(req.params.id,req.user.id);
  if(!group||group.type!=="group") return res.status(404).json({error:"Group not found"});
  if(group.member_role!=="admin") return res.status(403).json({error:"Only group administrators can edit this group"});
  const title=String(req.body.title||group.title).trim(),description=String(req.body.description??group.description??"").trim().slice(0,500);
  if(title.length<3||title.length>80) return res.status(400).json({error:"Group name must contain 3 to 80 characters"});
  await query("UPDATE conversations SET title=$1,description=$2,only_admins_can_post=$3 WHERE id=$4",
    [title,description,req.body.onlyAdminsCanPost===undefined?group.only_admins_can_post:Boolean(req.body.onlyAdminsCanPost),group.id]);
  res.json({ok:true});
}));
app.post("/api/messages/groups/:id/members",auth,asyncRoute(async(req,res)=>{
  const group=await conversationForUser(req.params.id,req.user.id);
  if(!group||group.type!=="group") return res.status(404).json({error:"Group not found"});
  if(group.member_role!=="admin") return res.status(403).json({error:"Only group administrators can add members"});
  const userId=Number(req.body.userId),user=await one("SELECT id FROM users WHERE id=$1 AND active=true",[userId]);
  if(!user) return res.status(404).json({error:"Active user not found"});
  await query("INSERT INTO conversation_members (conversation_id,user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING",[group.id,userId]);
  res.json({ok:true});
}));
app.patch("/api/messages/groups/:id/members/:userId",auth,asyncRoute(async(req,res)=>{
  const group=await conversationForUser(req.params.id,req.user.id);
  if(!group||group.type!=="group") return res.status(404).json({error:"Group not found"});
  if(group.member_role!=="admin") return res.status(403).json({error:"Only group administrators can assign administrators"});
  const role=req.body.role==="admin"?"admin":"member";
  await query("UPDATE conversation_members SET member_role=$1 WHERE conversation_id=$2 AND user_id=$3",[role,group.id,req.params.userId]);
  res.json({ok:true});
}));
app.delete("/api/messages/groups/:id/members/:userId",auth,asyncRoute(async(req,res)=>{
  const group=await conversationForUser(req.params.id,req.user.id);
  if(!group||group.type!=="group") return res.status(404).json({error:"Group not found"});
  const removingSelf=Number(req.params.userId)===Number(req.user.id);
  if(group.member_role!=="admin"&&!removingSelf) return res.status(403).json({error:"Only group administrators can remove members"});
  if(removingSelf&&group.member_role==="admin") {
    const admins=await one("SELECT COUNT(*)::int AS count FROM conversation_members WHERE conversation_id=$1 AND member_role='admin'",[group.id]);
    if(admins.count<=1) return res.status(409).json({error:"Assign another administrator before leaving the group"});
  }
  await query("DELETE FROM conversation_members WHERE conversation_id=$1 AND user_id=$2",[group.id,req.params.userId]);
  res.json({ok:true});
}));
app.post("/api/messages/messages/:id/reactions",auth,asyncRoute(async(req,res)=>{
  const message=await one(`SELECT msg.id,msg.conversation_id FROM messages msg JOIN conversation_members cm ON cm.conversation_id=msg.conversation_id
    WHERE msg.id=$1 AND cm.user_id=$2 AND msg.deleted_at IS NULL`,[req.params.id,req.user.id]);
  if(!message) return res.status(404).json({error:"Message not found"});
  const emoji=String(req.body.emoji||"").slice(0,12);
  if(!["??","??","??","??","??","??"].includes(emoji)) return res.status(400).json({error:"Unsupported reaction"});
  const existing=await one("SELECT 1 FROM message_reactions WHERE message_id=$1 AND user_id=$2 AND emoji=$3",[message.id,req.user.id,emoji]);
  if(existing) await query("DELETE FROM message_reactions WHERE message_id=$1 AND user_id=$2 AND emoji=$3",[message.id,req.user.id,emoji]);
  else await query("INSERT INTO message_reactions (message_id,user_id,emoji) VALUES ($1,$2,$3)",[message.id,req.user.id,emoji]);
  res.json({ok:true});
}));
app.patch("/api/messages/messages/:id",auth,asyncRoute(async(req,res)=>{
  const message=await one(`SELECT msg.* FROM messages msg JOIN conversation_members cm ON cm.conversation_id=msg.conversation_id
    WHERE msg.id=$1 AND cm.user_id=$2 AND msg.deleted_at IS NULL`,[req.params.id,req.user.id]);
  if(!message) return res.status(404).json({error:"Message not found"});
  const action=req.body.action;
  if(action==="edit") {
    if(Number(message.sender_id)!==Number(req.user.id)) return res.status(403).json({error:"You can only edit your own messages"});
    const body=String(req.body.body||"").trim();
    if(!body||body.length>2000) return res.status(400).json({error:"Edited message must contain 1 to 2,000 characters"});
    await query("UPDATE messages SET body=$1,edited_at=NOW() WHERE id=$2",[body,message.id]);
  } else if(action==="pin") {
    await query("UPDATE messages SET pinned_at=CASE WHEN pinned_at IS NULL THEN NOW() ELSE NULL END,pinned_by=$1 WHERE id=$2",[req.user.id,message.id]);
  } else return res.status(400).json({error:"Unsupported message action"});
  res.json({ok:true});
}));
app.delete("/api/messages/messages/:id",auth,asyncRoute(async(req,res)=>{
  const message=await one(`SELECT msg.*,cm.member_role FROM messages msg JOIN conversation_members cm ON cm.conversation_id=msg.conversation_id
    WHERE msg.id=$1 AND cm.user_id=$2 AND msg.deleted_at IS NULL`,[req.params.id,req.user.id]);
  if(!message) return res.status(404).json({error:"Message not found"});
  if(Number(message.sender_id)!==Number(req.user.id)&&message.member_role!=="admin") return res.status(403).json({error:"You cannot delete this message"});
  await query("UPDATE messages SET deleted_at=NOW() WHERE id=$1",[message.id]);
  res.json({ok:true});
}));

app.get("/api/department-reports/:scope.:format",auth,asyncRoute(async(req,res)=>{
  const scope=String(req.params.scope).toLowerCase(),format=String(req.params.format).toLowerCase();
  if(!["pdf","xml","excel","preview"].includes(format))return res.status(400).json({error:"Choose PDF or Excel format"});
  const departmentScopes=new Set(["finance","investment","welfare","legal","audit","supervisory","executive"]);
  const allowed=scope==="credits"?await canAccessLoanRecords(req.user):departmentScopes.has(scope)&&Boolean(await departmentPermission(req.user,scope,"view"));
  if(!allowed)return res.status(403).json({error:"Department report access denied"});
  const requestedTitle=String(req.query.name||`${scope} report`).replace(/[^a-zA-Z0-9 ()&,-]/g,"").slice(0,100)||`${scope} report`;
  let result,columns;
  if(scope==="finance") {
    if(requestedTitle.toLowerCase().includes("historical financial")) {
      result=await query(`SELECT p.fiscal_year,p.period_end,l.statement_type,l.line_name,l.note_number,
        l.current_amount::float AS amount_2026,l.prior_amount::float AS amount_2025,l.variance::float,p.status
        FROM financial_statement_lines l JOIN financial_reporting_periods p ON p.id=l.period_id
        ORDER BY p.period_end DESC,l.statement_type,l.sort_order`);
      columns=["fiscal_year","period_end","statement_type","line_name","note_number","amount_2026","amount_2025","variance","status"];
    } else {
      result=await query(`SELECT reference,transaction_date AS date,entry_type AS type,category,description,counterparty,amount::float,status
        FROM organization_finance_entries ORDER BY transaction_date DESC,id DESC LIMIT 1000`);
      columns=["reference","date","type","category","description","counterparty","amount","status"];
    }
  } else if(scope==="credits") {
    const report=requestedTitle.toLowerCase();
    if(report.includes("opening savings")) {
      result=await query(`SELECT p.period_end,b.source_row,b.member_name,b.share_capital::float,b.savings_balance::float,
        b.expected_savings::float,b.deficit_surplus::float,b.proposed_dividend::float,b.status
        FROM legacy_member_opening_balances b JOIN financial_reporting_periods p ON p.id=b.period_id
        ORDER BY p.period_end DESC,b.source_row`);
      columns=["period_end","source_row","member_name","share_capital","savings_balance","expected_savings","deficit_surplus","proposed_dividend","status"];
    } else if(report.includes("saving")||report.includes("daily transaction")) {
      result=await query(`SELECT t.reference,t.receipt_number,m.member_number,m.full_name AS member,t.type,t.method,
        t.external_reference AS payment_reference,t.amount::float,t.status,t.created_at,t.verified_at
        FROM transactions t JOIN members m ON m.id=t.member_id
        ${report.includes("saving")?"WHERE t.type IN ('Savings deposit','Withdrawal')":""}
        ORDER BY t.created_at DESC LIMIT 1000`);
      columns=["reference","receipt_number","member_number","member","type","method","payment_reference","amount","status","created_at","verified_at"];
    } else if(report.includes("guarantor")) {
      result=await query(`SELECT l.reference AS loan_reference,borrower.full_name AS borrower,guarantor.member_number,
        guarantor.full_name AS guarantor,l.amount::float AS loan_amount,lg.status,lg.created_at,lg.responded_at
        FROM loan_guarantors lg JOIN loans l ON l.id=lg.loan_id JOIN members borrower ON borrower.id=l.member_id
        JOIN members guarantor ON guarantor.id=lg.member_id ORDER BY lg.id DESC LIMIT 1000`);
      columns=["loan_reference","borrower","member_number","guarantor","loan_amount","status","created_at","responded_at"];
    } else if(report.includes("recovery")||report.includes("defaulter")) {
      result=await query(`SELECT l.reference,m.member_number,m.full_name AS member,l.amount::float,l.balance::float,l.status,
        l.due_date,GREATEST(0,CURRENT_DATE-COALESCE(l.due_date,CURRENT_DATE))::int AS days_overdue
        FROM loans l JOIN members m ON m.id=l.member_id
        ${report.includes("defaulter")?"WHERE l.status='overdue' OR (l.balance>0 AND l.due_date<CURRENT_DATE)":""}
        ORDER BY days_overdue DESC,l.id DESC LIMIT 1000`);
      columns=["reference","member_number","member","amount","balance","status","due_date","days_overdue"];
    } else if(report.includes("interest")) {
      result=await query(`SELECT l.reference AS loan_reference,m.member_number,m.full_name AS member,c.charge_type,
        c.amount::float,c.status,c.reason,c.assessed_at FROM loan_charges c JOIN loans l ON l.id=c.loan_id
        JOIN members m ON m.id=l.member_id ORDER BY c.assessed_at DESC LIMIT 1000`);
      columns=["loan_reference","member_number","member","charge_type","amount","status","reason","assessed_at"];
    } else if(report.includes("statement")) {
      result=await query(`SELECT member_number,full_name AS member,savings_balance::float,share_capital::float,
        dividends::float,status,joined_at FROM members ORDER BY full_name LIMIT 1000`);
      columns=["member_number","member","savings_balance","share_capital","dividends","status","joined_at"];
    } else {
      result=await query(`SELECT l.reference,m.member_number,m.full_name AS member,p.name AS product,l.amount::float,l.balance::float,l.status,l.due_date
        FROM loans l JOIN members m ON m.id=l.member_id JOIN loan_products p ON p.id=l.product_id ORDER BY l.id DESC LIMIT 1000`);
      columns=["reference","member_number","member","product","amount","balance","status","due_date"];
    }
  } else if(scope==="investment") {
    if(requestedTitle.toLowerCase().includes("unit trust ledger")) {
      result=await query(`SELECT p.period_end,l.transaction_date,l.transaction_id,l.account_name,l.account_code,
        l.entry_type,l.amount::float,l.source_reference
        FROM historical_investment_ledger l JOIN financial_reporting_periods p ON p.id=l.period_id
        ORDER BY l.transaction_date,l.id`);
      columns=["period_end","transaction_date","transaction_id","account_name","account_code","entry_type","amount","source_reference"];
    } else {
      result=await query(`SELECT reference,name,category,location,budget::float,capital_invested::float,current_value::float,progress::float,status
        FROM investment_projects ORDER BY id DESC LIMIT 1000`);
      columns=["reference","name","category","location","budget","capital_invested","current_value","progress","status"];
    }
  } else if(scope==="welfare") {
    const report=requestedTitle.toLowerCase();
    if(report.includes("contribution")) {
      result=await query(`SELECT c.reference,m.member_number,m.full_name AS member,c.contribution_type,c.amount::float,c.payment_method,c.receipt_number,c.status,c.contribution_date
        FROM welfare_contributions c JOIN members m ON m.id=c.member_id ORDER BY c.id DESC LIMIT 1000`);
      columns=["reference","member_number","member","contribution_type","amount","payment_method","receipt_number","status","contribution_date"];
    } else if(report.includes("payment")) {
      result=await query(`SELECT p.reference,p.beneficiary_name,p.amount::float,p.payment_method,p.voucher_number,p.status,p.paid_at,wr.request_type
        FROM welfare_payments p JOIN welfare_requests wr ON wr.id=p.request_id ORDER BY p.id DESC LIMIT 1000`);
      columns=["reference","beneficiary_name","amount","payment_method","voucher_number","status","paid_at","request_type"];
    } else {
      result=await query(`SELECT w.reference,m.member_number,m.full_name AS member,w.request_type,w.amount::float,w.urgency,w.status,w.payment_status,w.created_at
        FROM welfare_requests w JOIN members m ON m.id=w.member_id ORDER BY w.id DESC LIMIT 1000`);
      columns=["reference","member_number","member","request_type","amount","urgency","status","payment_status","created_at"];
    }
  } else if(scope==="legal") {
    const report=requestedTitle.toLowerCase();
    if(report.includes("contract")) {
      result=await query(`SELECT contract_number,title,parties,contract_type,status,starts_on,ends_on,created_at FROM legal_contracts ORDER BY id DESC LIMIT 1000`);
      columns=["contract_number","title","parties","contract_type","status","starts_on","ends_on","created_at"];
    } else if(report.includes("polic")) {
      result=await query(`SELECT reference,policy_name,policy_category,version,status,effective_date,created_at FROM legal_policies ORDER BY id DESC LIMIT 1000`);
      columns=["reference","policy_name","policy_category","version","status","effective_date","created_at"];
    } else if(report.includes("court")) {
      result=await query(`SELECT court_file,title,court_name,opposing_party,status,next_hearing_at,created_at FROM legal_court_matters ORDER BY id DESC LIMIT 1000`);
      columns=["court_file","title","court_name","opposing_party","status","next_hearing_at","created_at"];
    } else {
      result=await query(`SELECT case_number,case_category,subject_name,description,risk_level,status,next_hearing_at,created_at FROM legal_cases ORDER BY id DESC LIMIT 1000`);
      columns=["case_number","case_category","subject_name","description","risk_level","status","next_hearing_at","created_at"];
    }
  } else if(scope==="audit") {
    const report=requestedTitle.toLowerCase();
    if(report.includes("fraud")) {
      result=await query(`SELECT alert_number,source_type,rule_name,description,risk_score,status,detected_at,reviewed_at FROM audit_fraud_alerts ORDER BY id DESC LIMIT 1000`);
      columns=["alert_number","source_type","rule_name","description","risk_score","status","detected_at","reviewed_at"];
    } else if(report.includes("investigation")) {
      result=await query(`SELECT investigation_number,case_description,lead_auditor,status,priority,opened_at,closed_at FROM audit_investigations ORDER BY id DESC LIMIT 1000`);
      columns=["investigation_number","case_description","lead_auditor","status","priority","opened_at","closed_at"];
    } else {
      result=await query(`SELECT f.finding_number,d.name AS department,f.description,f.risk_level,f.recommendation,f.due_date,f.status,f.created_at
        FROM audit_findings f LEFT JOIN departments d ON d.id=f.department_id ORDER BY f.id DESC LIMIT 1000`);
      columns=["finding_number","department","description","risk_level","recommendation","due_date","status","created_at"];
    }
  } else if(scope==="supervisory") {
    const report=requestedTitle.toLowerCase();
    if(report.includes("complaint")) {
      result=await query(`SELECT complaint_number,category,subject_type,description,status,escalated,created_at,resolved_at FROM supervisory_complaints ORDER BY id DESC LIMIT 1000`);
      columns=["complaint_number","category","subject_type","description","status","escalated","created_at","resolved_at"];
    } else if(report.includes("project")) {
      result=await query(`SELECT reference,project_name,status,planned_progress,actual_progress,updated_at FROM supervisory_projects ORDER BY id DESC LIMIT 1000`);
      columns=["reference","project_name","status","planned_progress","actual_progress","updated_at"];
    } else if(report.includes("committee")||report.includes("resolution")) {
      result=await query(`SELECT resolution_number,title,responsible_officer,status,due_date,completed_at FROM supervisory_resolutions ORDER BY id DESC LIMIT 1000`);
      columns=["resolution_number","title","responsible_officer","status","due_date","completed_at"];
    } else {
      result=await query(`SELECT d.name AS department,s.review_period,s.target_achievement::float,s.performance_score::float,s.status,s.supervisor_comment,s.updated_at
        FROM supervisory_scorecards s JOIN departments d ON d.id=s.department_id ORDER BY s.updated_at DESC LIMIT 1000`);
      columns=["department","review_period","target_achievement","performance_score","status","supervisor_comment","updated_at"];
    }
  } else {
    const executiveReport=requestedTitle.toLowerCase();
    if(executiveReport.includes("governance structure")) {
      result=await query(`SELECT b.name AS body,b.body_type,a.position_title,a.canonical_member_name AS member,
        a.member_name_as_recorded,a.status,a.notes
        FROM governance_appointments a JOIN governance_bodies b ON b.id=a.body_id
        WHERE b.active=true ORDER BY CASE b.body_type WHEN 'board' THEN 1 WHEN 'executive' THEN 2 ELSE 3 END,b.name,
        CASE a.position_title WHEN 'Chairperson' THEN 1 WHEN 'Vice Chairperson' THEN 2 WHEN 'Secretary' THEN 3 WHEN 'Treasurer' THEN 4 ELSE 5 END,a.id`);
      columns=["body","body_type","position_title","member","member_name_as_recorded","status","notes"];
    } else if(executiveReport.includes("historical financial")) {
      result=await query(`SELECT p.fiscal_year,p.period_end,l.statement_type,l.line_name,l.note_number,
        l.current_amount::float AS amount_2026,l.prior_amount::float AS amount_2025,l.variance::float,p.status
        FROM financial_statement_lines l JOIN financial_reporting_periods p ON p.id=l.period_id
        ORDER BY p.period_end DESC,l.statement_type,l.sort_order`);
      columns=["fiscal_year","period_end","statement_type","line_name","note_number","amount_2026","amount_2025","variance","status"];
    } else if(executiveReport.includes("financial")) {
      result=await query(`SELECT reference,transaction_date AS date,entry_type AS type,category,description,counterparty,amount::float,status
        FROM organization_finance_entries ORDER BY transaction_date DESC,id DESC LIMIT 1000`);
      columns=["reference","date","type","category","description","counterparty","amount","status"];
    } else if(executiveReport.includes("loan")) {
      result=await query(`SELECT l.reference,m.member_number,m.full_name AS member,p.name AS product,l.amount::float,l.balance::float,l.status,l.due_date
        FROM loans l JOIN members m ON m.id=l.member_id JOIN loan_products p ON p.id=l.product_id ORDER BY l.id DESC LIMIT 1000`);
      columns=["reference","member_number","member","product","amount","balance","status","due_date"];
    } else if(executiveReport.includes("investment")) {
      result=await query(`SELECT reference,name,category,location,target_amount::float AS budget,raised_amount::float AS capital_invested,
        current_value::float,expected_return::float,progress::float,status,performance_status
        FROM investment_projects ORDER BY id DESC LIMIT 1000`);
      columns=["reference","name","category","location","budget","capital_invested","current_value","expected_return","progress","status","performance_status"];
    } else if(executiveReport.includes("welfare")) {
      result=await query(`SELECT w.reference,m.member_number,m.full_name AS member,w.request_type,w.amount::float,w.urgency,w.status,w.payment_status,w.created_at
        FROM welfare_requests w JOIN members m ON m.id=w.member_id ORDER BY w.id DESC LIMIT 1000`);
      columns=["reference","member_number","member","request_type","amount","urgency","status","payment_status","created_at"];
    } else if(executiveReport.includes("audit")) {
      result=await query(`SELECT f.finding_number,d.name AS department,f.description,f.risk_level,f.recommendation,f.due_date,f.status,f.created_at
        FROM audit_findings f LEFT JOIN departments d ON d.id=f.department_id ORDER BY f.id DESC LIMIT 1000`);
      columns=["finding_number","department","description","risk_level","recommendation","due_date","status","created_at"];
    } else if(executiveReport.includes("supervisory")||executiveReport.includes("department performance")) {
      result=await query(`SELECT d.name AS department,s.review_period,s.target_achievement::float,s.performance_score::float,s.status,s.supervisor_comment,s.updated_at
        FROM supervisory_scorecards s JOIN departments d ON d.id=s.department_id ORDER BY s.updated_at DESC LIMIT 1000`);
      columns=["department","review_period","target_achievement","performance_score","status","supervisor_comment","updated_at"];
    } else if(executiveReport.includes("legal")) {
      result=await query(`SELECT case_number,case_category,subject_name,description,risk_level,status,next_hearing_at,created_at
        FROM legal_cases ORDER BY id DESC LIMIT 1000`);
      columns=["case_number","case_category","subject_name","description","risk_level","status","next_hearing_at","created_at"];
    } else {
      result=await query(`SELECT 'Membership' AS section,'Total members' AS metric,COUNT(*)::text AS value FROM members WHERE deleted_at IS NULL
        UNION ALL SELECT 'Membership','Active members',COUNT(*)::text FROM members WHERE status='active' AND deleted_at IS NULL
        UNION ALL SELECT 'Finance','Approved income',COALESCE(SUM(amount),0)::text FROM organization_finance_entries WHERE entry_type='income' AND status IN ('approved','completed')
        UNION ALL SELECT 'Finance','Approved expenditure',COALESCE(SUM(amount),0)::text FROM organization_finance_entries WHERE entry_type='expense' AND status IN ('approved','completed')
        UNION ALL SELECT 'Credits','Total savings',COALESCE(SUM(savings_balance),0)::text FROM members WHERE deleted_at IS NULL
        UNION ALL SELECT 'Credits','Outstanding loans',COALESCE(SUM(balance),0)::text FROM loans WHERE status IN ('active','overdue')
        UNION ALL SELECT 'Investment','Active projects',COUNT(*)::text FROM investment_projects WHERE status IN ('active','running')
        UNION ALL SELECT 'Legal','Open cases',COUNT(*)::text FROM legal_cases WHERE status NOT IN ('resolved','closed')
        UNION ALL SELECT 'Audit','Open findings',COUNT(*)::text FROM audit_findings WHERE status NOT IN ('resolved','closed')
        UNION ALL SELECT 'Supervisory','Pending recommendations',COUNT(*)::text FROM supervisory_recommendations WHERE status NOT IN ('implemented','closed')`);
      columns=["section","metric","value"];
    }
  }
  await audit({userId:req.user.id,action:"REPORT_EXPORTED",entityType:"department_report",entityId:scope,details:`${requestedTitle} - ${format}`,...metadata(req)});
  sendReport(res,{title:`Kasangati G40 Kwagalana - ${requestedTitle}`,columns,rows:result.rows,
    format:["pdf","preview"].includes(format)?"pdf":"xml",inline:format==="preview"});
}));
app.get("/api/reports/:type.csv",auth,asyncRoute(async(req,res)=>{
  const type=String(req.params.type).replace(/[^a-z-]/g,"");
  if(!["members","loans","transactions"].includes(type))return res.status(404).json({error:"Report type not found"});
  let result;
  if(type==="members") {
    const allowedRoles=new Set(["Member","Legal Officer","Auditor","Supervisory Officer","Executive Officer"]);
    if(!allowedRoles.has(req.user.role))return res.status(403).json({error:"Membership report access denied"});
    result=req.user.role==="Member"
      ?await query("SELECT member_number,full_name,email,phone,status,joined_at FROM members WHERE id=$1",[req.user.member_id])
      :await query("SELECT member_number,full_name,email,phone,status,joined_at FROM members ORDER BY member_number");
  } else if(type==="loans") {
    if(!await canAccessLoanRecords(req.user))return res.status(403).json({error:"Loan report access denied"});
    result=await query(`SELECT l.reference,m.full_name,p.name,l.amount,l.balance,l.status FROM loans l JOIN members m ON m.id=l.member_id JOIN loan_products p ON p.id=l.product_id ${req.user.role==="Member"?"WHERE m.id=$1":""} ORDER BY l.id DESC`,req.user.role==="Member"?[req.user.member_id]:[]);
  } else {
    const staffAccess=hasAnyPermission(req.user,["transaction"])||["Auditor","Supervisory Officer"].includes(req.user.role);
    if(req.user.role!=="Member"&&!staffAccess)return res.status(403).json({error:"Transaction report access denied"});
    result=await query(`SELECT t.reference,m.full_name,t.type,t.method,t.amount,t.status,t.created_at FROM transactions t JOIN members m ON m.id=t.member_id ${req.user.role==="Member"?"WHERE m.id=$1":""} ORDER BY t.id DESC`,req.user.role==="Member"?[req.user.member_id]:[]);
  }
  const esc=v=>`"${String(v??"").replaceAll('"','""')}"`, keys=result.fields.map(f=>f.name);
  res.type("text/csv").attachment(`${type}-report.csv`).send([keys.map(esc).join(","),...result.rows.map(r=>keys.map(k=>esc(r[k])).join(","))].join("\r\n"));
  await audit({userId:req.user.id,action:"REPORT_EXPORTED",entityType:"report",entityId:type,...metadata(req)});
}));
app.patch("/api/settings/:key",auth,permit("system:manage"),asyncRoute(async(req,res)=>{
  await query(`INSERT INTO settings (key,value,updated_by,updated_at) VALUES ($1,$2,$3,NOW())
    ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value,updated_by=EXCLUDED.updated_by,updated_at=NOW()`,[req.params.key,String(req.body.value),req.user.id]);
  await audit({userId:req.user.id,action:"SETTING_UPDATED",entityType:"setting",entityId:req.params.key,details:String(req.body.value),...metadata(req)}); res.json({ok:true});
}));

async function runScheduledMaintenance() {
  const graceDays=5;
  await transaction(async client=>{
    // Grace period: installment becomes overdue only 5 days after due date.
    await client.query(`UPDATE loan_repayment_schedule SET status='due'
      WHERE status='upcoming' AND due_date<=CURRENT_DATE AND paid_amount<total_due`);
    await client.query(`UPDATE loan_repayment_schedule SET status='overdue'
      WHERE status IN ('due','partial') AND due_date + $1::int < CURRENT_DATE AND paid_amount<total_due`,[graceDays]);
    await client.query(`UPDATE loans SET status='overdue'
      WHERE status='active' AND balance>0
        AND EXISTS (
          SELECT 1 FROM loan_repayment_schedule s
          WHERE s.loan_id=loans.id AND s.status='overdue'
        )`);
    // 5% penalty on overdue principal only (not interest), after grace period.
    await client.query(`INSERT INTO loan_charges (loan_id,charge_type,amount,status,reason,schedule_id,penalty_period)
      SELECT s.loan_id,'Late payment penalty',ROUND(GREATEST(s.principal-s.principal_paid,0)*p.late_penalty_rate/100,2),'outstanding',
        'Automatic 5% penalty on overdue principal after '||$1||'-day grace',s.id,date_trunc('month',CURRENT_DATE)::date
      FROM loan_repayment_schedule s JOIN loans l ON l.id=s.loan_id JOIN loan_products p ON p.id=l.product_id
      WHERE s.status='overdue' AND s.principal>s.principal_paid
      ON CONFLICT (loan_id,schedule_id,penalty_period,charge_type) WHERE charge_type='Late payment penalty' AND schedule_id IS NOT NULL AND penalty_period IS NOT NULL DO NOTHING`,[graceDays]);
    await client.query("UPDATE legal_contracts SET status='expired',updated_at=NOW() WHERE ends_on<CURRENT_DATE AND status IN ('approved','legal_approved','active')");
    await client.query("UPDATE investment_contracts SET status='expired' WHERE ends_on<CURRENT_DATE AND status='active'");
    // Danger-window alerts: due date reached through end of grace (due today … due+5).
    await client.query(`INSERT INTO notifications (user_id,title,message)
      SELECT u.id,'Loan installment in danger period',
        'Loan '||l.reference||' installment due '||to_char(s.due_date,'DD/MM/YYYY')||' is unpaid. Grace ends '||to_char(s.due_date+$1::int,'DD/MM/YYYY')||'. After that a 5% penalty applies on principal only.'
      FROM loan_repayment_schedule s JOIN loans l ON l.id=s.loan_id JOIN users u ON u.member_id=l.member_id AND u.active=true
      WHERE s.due_date<=CURRENT_DATE AND s.due_date+$1::int>=CURRENT_DATE AND s.status IN ('due','partial')
      AND NOT EXISTS (SELECT 1 FROM notifications n WHERE n.user_id=u.id AND n.title='Loan installment in danger period'
        AND n.message LIKE 'Loan '||l.reference||'%' AND n.created_at>=CURRENT_DATE)`,[graceDays]);
    await client.query(`INSERT INTO notifications (user_id,title,message)
      SELECT DISTINCT u.id,'Active loan in danger period',
        'Loan '||l.reference||' ('||m.full_name||') is unpaid. Due '||to_char(s.due_date,'DD/MM/YYYY')||'; grace ends '||to_char(s.due_date+$1::int,'DD/MM/YYYY')||'. Remind the member — 5% penalty on principal starts after grace.'
      FROM loan_repayment_schedule s
      JOIN loans l ON l.id=s.loan_id
      JOIN members m ON m.id=l.member_id
      JOIN departments d ON d.code='credits'
      JOIN department_assignments da ON da.department_id=d.id AND da.active=true AND da.can_view=true
      JOIN users u ON u.id=da.user_id AND u.active=true
      WHERE s.due_date<=CURRENT_DATE AND s.due_date+$1::int>=CURRENT_DATE AND s.status IN ('due','partial')
      AND NOT EXISTS (SELECT 1 FROM notifications n WHERE n.user_id=u.id AND n.title='Active loan in danger period'
        AND n.message LIKE 'Loan '||l.reference||'%' AND n.created_at>=CURRENT_DATE)`,[graceDays]);
    await client.query(`INSERT INTO notifications (user_id,title,message)
      SELECT u.id,'Loan repayment due tomorrow','Loan '||l.reference||' has an installment due tomorrow.'
      FROM loan_repayment_schedule s JOIN loans l ON l.id=s.loan_id JOIN users u ON u.member_id=l.member_id AND u.active=true
      WHERE s.due_date=CURRENT_DATE+1 AND s.status<>'paid'
      AND NOT EXISTS (SELECT 1 FROM notifications n WHERE n.user_id=u.id AND n.title='Loan repayment due tomorrow'
        AND n.message='Loan '||l.reference||' has an installment due tomorrow.' AND n.created_at>=CURRENT_DATE)`);
    await client.query(`INSERT INTO notifications (user_id,title,message)
      SELECT DISTINCT u.id,'Budget threshold alert',d.name||' budget utilization is '||ROUND(b.used_amount/NULLIF(b.allocated_amount,0)*100)||'%.'
      FROM finance_budgets b JOIN departments d ON d.id=b.department_id
      JOIN department_assignments da ON da.department_id=(SELECT id FROM departments WHERE code='finance') AND da.active=true AND da.can_view=true
      JOIN users u ON u.id=da.user_id AND u.active=true
      WHERE b.status='approved' AND b.allocated_amount>0 AND b.used_amount/b.allocated_amount>=0.8
      AND NOT EXISTS (SELECT 1 FROM notifications n WHERE n.user_id=u.id AND n.title='Budget threshold alert'
        AND n.message=d.name||' budget utilization is '||ROUND(b.used_amount/NULLIF(b.allocated_amount,0)*100)||'%.' AND n.created_at>=CURRENT_DATE)`);
  });
}
app.use(express.static(publicDir,{extensions:["html"],index:"index.html",dotfiles:"deny",fallthrough:true}));
app.all("/api/{*splat}",(req,res)=>res.status(404).json({error:"API route not found"}));
app.get("/{*splat}",(req,res)=>{
  if(path.extname(req.path)||/^\/(?:storage|uploads|scripts|node_modules|docs)(?:\/|$)/i.test(req.path))
    return res.status(404).type("text/plain").send("Not found");
  res.sendFile(path.join(publicDir,"index.html"));
});
app.use((error,req,res,next)=>{
  const status=error instanceof multer.MulterError||error.message==="This file type is not allowed"?400:Number(error.status)||500;
  if(status>=500)console.error(error);
  res.status(status).json({error:status>=500&&production?"An unexpected server error occurred":error.message});
});
initialize().then(async()=>{
  await runScheduledMaintenance();
  const maintenanceTimer=setInterval(()=>runScheduledMaintenance().catch(error=>console.error("Scheduled maintenance failed:",error.message)),60*60*1000);
  maintenanceTimer.unref();
  app.listen(port,"0.0.0.0",()=>console.log(`Kasangati G40 Kwagalana running at http://localhost:${port}`));
})
  .catch(error=>{console.error("Database initialization failed:",error.message);process.exit(1);});







