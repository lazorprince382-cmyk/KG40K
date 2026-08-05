const STORAGE_KEY = "kasangati-g40-organization-v1";

const icons = {
  logo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19V9l8-5 8 5v10"/><path d="M8 19v-6h8v6M2 19h20"/></svg>`,
  dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>`,
  members: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  savings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 10h16M6 6h12l2 4v8H4v-8l2-4Z"/><path d="M8 14h4M7 18v2M17 18v2"/></svg>`,
  loans: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5c-.7-.7-1.7-1-3-1-1.6 0-2.7.8-2.7 2s1 1.8 3 2.3 3 1.1 3 2.5-1.2 2.2-3 2.2c-1.4 0-2.5-.4-3.3-1.2M12.5 5.5v2M12.5 16.5v2"/></svg>`,
  withdraw: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M5 15v4h14v-4"/></svg>`,
  approvals: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
  reports: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19V9m6 10V5m6 14v-7m4 7H2"/></svg>`,
  audit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1 1.55V21h-4v-.08a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3v-4h.08a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3h4v.08a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.2.6.8 1 1.55 1H21v4h-.08a1.7 1.7 0 0 0-1.55 1Z"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>`,
  bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>`,
  messages: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z"/><path d="M8 10h.01M12 10h.01M16 10h.01"/></svg>`,
  help: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.4 2.4 0 1 1 3.7 2c-1.5.9-1.5 1.5-1.5 2.5M12 17h.01"/></svg>`,
  menu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>`,
  arrowUp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m18 15-6-6-6 6"/></svg>`,
  arrowDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>`,
  users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="8" r="3"/><path d="M3 19v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M16 5a3 3 0 0 1 0 6M17 13a4 4 0 0 1 4 4v2"/></svg>`,
  wallet: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 5h14a2 2 0 0 1 2 2v12H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h13"/><path d="M15 11h7v5h-7a2.5 2.5 0 0 1 0-5Z"/></svg>`,
  receipt: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
  file: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 2h8l4 4v16H6V2Z"/><path d="M14 2v5h5M9 12h6M9 16h6"/></svg>`,
  eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12 4 4L19 6"/></svg>`,
  x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 6 12 12M18 6 6 18"/></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 20h14"/></svg>`,
  info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.7 19.7 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.7 19.7 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2.1Z"/></svg>`,
  lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>`,
  building: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 10h1m4 0h1m-6 4h1m4 0h1m-4 7v-4h2v4"/></svg>`,
  refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 6v5h-5M4 18v-5h5"/><path d="M18 9a7 7 0 0 0-12-2L4 11m16 2-2 4a7 7 0 0 1-12 0"/></svg>`
  ,trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6"/></svg>`
};

const roles = ["Member","Executive Officer","Finance Officer","Credits Officer","Investment Officer","Welfare Officer","Legal Officer","Auditor","Supervisory Officer","System Admin"];
const rolePages = {
  Member: ["member-dashboard"],
  Auditor: ["dashboard","messages","settings"],
  "System Admin": ["dashboard","messages","audit","settings"],
  "Finance Officer": ["dashboard","finance-income","finance-expenses","finance-vouchers","finance-receipts","finance-invoices",
    "finance-budgets","finance-bank","finance-cashbook","finance-assets","finance-procurement","finance-approvals",
    "finance-reports","finance-analytics","finance-documents","messages","settings"],
  "Investment Officer": ["dashboard","investment-projects","investment-portfolio","investment-proposals","investment-investors",
    "investment-revenue","investment-expenses","investment-pl","investment-budgets","investment-assets",
    "investment-contracts","investment-reports","investment-analytics","investment-documents","investment-notifications","messages","settings"],
  "Credits Officer": ["dashboard","credits-members","credits-savings","credits-applications","credits-approvals","credits-active",
    "credits-disbursement","credits-receipts","credits-repayments","credits-guarantors","credits-recovery","credits-statements",
    "credits-charges","credits-reports","credits-analytics","credits-documents","credits-notifications","messages","settings"],
  "Legal Officer": ["dashboard","settings"],
  "Welfare Officer": ["dashboard","settings"],
  "Executive Officer": ["dashboard","messages","members","departments","users","executive-finance","executive-credits","executive-investments","executive-welfare","executive-legal","executive-audit","executive-supervisory","executive-approvals","executive-meetings","executive-projects","executive-reports","executive-analytics","notifications","executive-documents","settings"],
  "Supervisory Officer": ["dashboard","settings"]
};const pageMeta = {
  dashboard: ["Organization overview", "Dashboard"], departments: ["Organization structure", "Departmental dashboards"], messages: ["Communication", "Messages"], users: ["System accounts", "System accounts"], members: ["People", "Members"], savings: ["Credits", "Savings"],
  loans: ["Credit", "Loans"], withdrawals: ["Finance", "Withdrawals"], approvals: ["Workflow", "Approvals"],
  reports: ["Insights", "Reports"], audit: ["Compliance", "Audit log"], settings: ["Administration", "System settings"],
  "executive-finance":["Department summary","Finance"],"executive-credits":["Department summary","Credits (SACCO)"],
  "executive-investments":["Department summary","Investments"],"executive-welfare":["Department summary","Welfare"],
  "executive-legal":["Department summary","Legal"],"executive-audit":["Assurance","Audit"],
  "executive-supervisory":["Oversight","Supervisory"],"executive-approvals":["Executive authority","Approvals"],
  "executive-meetings":["Organization calendar","Meetings"],"executive-projects":["Strategic portfolio","Projects"],
  "executive-reports":["Decision support","Reports"],"executive-analytics":["Organization intelligence","Analytics"],
  notifications:["Executive alerts","Notifications"],"executive-documents":["Official records","Documents"],
  "executive-search":["Global search","Search results"],"credits-active":["Disbursed facilities","Active Loans"]
};
Object.assign(pageMeta,{
  "finance-income":["Organization revenue","Income"],"finance-expenses":["Organization spending","Expenses"],
  "finance-vouchers":["Payment workflow","Payment Vouchers"],"finance-receipts":["Income evidence","Receipts"],
  "finance-invoices":["Supplier obligations","Invoices"],"finance-budgets":["Planning and control","Budgets"],
  "finance-bank":["Cash position","Bank Accounts"],"finance-cashbook":["Accounting records","Cashbook"],
  "finance-assets":["Organization property","Assets"],"finance-procurement":["Purchase workflow","Procurement"],
  "finance-approvals":["Finance authority","Approvals"],"finance-reports":["Financial reporting","Reports"],
  "finance-analytics":["Financial intelligence","Analytics"],"finance-documents":["Finance records","Documents"],
  "finance-search":["Finance search","Search results"]
});
Object.assign(pageMeta,{
  "credits-members":["SACCO accounts","Members"],"credits-savings":["Member funds","Savings"],
  "credits-applications":["Credit workflow","Loan Applications"],"credits-approvals":["Credit authority","Loan Approvals"],
  "credits-disbursement":["Approved facilities","Loan Disbursement"],"credits-receipts":["Cash given out","Disbursement Receipts"],"credits-repayments":["Loan servicing","Repayments"],
  "credits-guarantors":["Loan security","Guarantors"],"credits-recovery":["Portfolio quality","Loan Recovery"],
  "credits-statements":["Member records","Statements"],"credits-charges":["Loan charges","Interest & Penalties"],
  "credits-reports":["SACCO reporting","Reports"],"credits-analytics":["Portfolio intelligence","Analytics"],
  "credits-documents":["Credit records","Documents"],"credits-notifications":["SACCO alerts","Notifications"],
  "credits-search":["Credits search","Search results"]
});
Object.assign(pageMeta,{
  "investment-projects":["Business portfolio","Projects"],"investment-portfolio":["Capital allocation","Investment Portfolio"],
  "investment-proposals":["Opportunity pipeline","Investment Proposals"],"investment-investors":["Funding sources","Investors"],
  "investment-revenue":["Project income","Revenue"],"investment-expenses":["Project costs","Expenses"],
  "investment-pl":["Performance accounting","Profit & Loss"],"investment-budgets":["Capital control","Budgets"],
  "investment-assets":["Project property","Assets"],"investment-contracts":["Commercial agreements","Contracts"],
  "investment-reports":["Decision support","Reports"],"investment-analytics":["Business intelligence","Analytics"],
  "investment-documents":["Investment records","Documents"],"investment-notifications":["Portfolio alerts","Notifications"],
  "investment-search":["Investment search","Search results"]
});

let state = { user: null, role: null, page: "dashboard", permissions: [], members: [], transactions: [], loans: [], withdrawals: [], audit: [], products: [], settings: {}, announcements: [], notifications: [] };
let searchTerm = "";
let messagePoll = null;
let typingTimer = null;
let executiveSearchTimer = null;
let financeSearchTimer = null;
let creditsSearchTimer = null;
let investmentSearchTimer = null;

async function api(url, options = {}) {
  const isFormData=options.body instanceof FormData;
  const response = await fetch(url, {
    credentials: "same-origin",
    headers: { ...(isFormData?{}:{"Content-Type":"application/json"}), ...(options.headers || {}) },
    ...options
  });
  const type = response.headers.get("content-type") || "";
  const data = type.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}
async function uploadDepartmentFile(file,departmentCode) {
  if(!(file instanceof File)||!file.size)return null;
  const payload=new FormData();payload.append("file",file);
  const response=await fetch(`/api/departments/${encodeURIComponent(departmentCode)}/files`,{method:"POST",credentials:"same-origin",body:payload});
  const result=await response.json();if(!response.ok)throw new Error(result.error||"File upload failed");return result;
}
function enhanceDepartmentRecordForm(form,{department,attachment=true,photo=false}={}) {
  if(!form)return;form.dataset.uploadDepartment=department||"";
  if(attachment){
    const current=form.querySelector('input[name="supportingDocument"],input[name="documentReference"]');
    if(current){current.type="file";current.accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,image/*";current.dataset.fileTarget=current.name;current.name="attachment";current.closest(".field")?.classList.add("record-file-field");}
    else form.querySelector(".form-grid")?.insertAdjacentHTML("beforeend",`<div class="field full record-file-field"><label>Supporting file</label><input name="attachment" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,image/*" data-file-target="supportingDocument"><small>PDF, Office document, image, text or CSV; maximum 15 MB.</small></div>`);
  }
  if(photo)form.querySelector(".form-grid")?.insertAdjacentHTML("beforeend",`<div class="field full record-file-field"><label>Photo</label><input name="photo" type="file" accept="image/jpeg,image/png,image/webp,image/gif"><small>Upload a clear asset or project photo.</small></div>`);
}
async function departmentFormPayload(form) {
  const formData=new FormData(form),data={};
  for(const [key,value] of formData.entries())if(!(value instanceof File))data[key]=value;
  form.querySelectorAll('input[type="checkbox"][name]').forEach(input=>{data[input.name]=input.checked;});
  const department=form.dataset.uploadDepartment;
  const attachment=form.querySelector('input[name="attachment"]'),photo=form.querySelector('input[name="photo"]');
  if(attachment?.files?.[0]){const saved=await uploadDepartmentFile(attachment.files[0],department);data[attachment.dataset.fileTarget||"supportingDocument"]=saved.url;data.attachmentName=saved.fileName;}
  if(photo?.files?.[0]){const saved=await uploadDepartmentFile(photo.files[0],department);data.photoUrl=saved.url;}
  return data;
}
function normalize(data) {
  data.members = data.members.map(m => ({ ...m, initials: initials(m.name) }));
  data.transactions = data.transactions.map(t => ({ ...t }));
  data.loans = data.loans.map(l => ({ ...l, term: `${l.termMonths} months` }));
  data.withdrawals = data.withdrawals.map(w => ({ ...w }));
  data.audit = data.audit.map(a => ({ ...a, id: `AUD-${String(a.id).padStart(5,"0")}`, detail: a.details || `${a.entityType || ""} ${a.entityId || ""}` }));
  return data;
}
async function refreshData(seedUser=null) {
  const knownRole=seedUser?.role||state.user?.role||null;
  const centerByRole={
    "Executive Officer":"/api/executive/command-center",
    "Finance Officer":"/api/finance/command-center",
    "Credits Officer":"/api/credits/command-center",
    "Investment Officer":"/api/investment/command-center"
  };
  const centerUrl=centerByRole[knownRole]||null;
  const memberNeeded=Boolean(seedUser?.member_id||state.user?.member_id);
  const [data,center,memberCenter]=await Promise.all([
    api("/api/bootstrap"),
    centerUrl?api(centerUrl):Promise.resolve(null),
    memberNeeded?api("/api/member/command-center"):Promise.resolve(null)
  ]);
  state={...state,...normalize(data),role:data.user.role,page:state.page||"dashboard"};
  if(memberCenter){
    state.memberCenter=memberCenter;
    if(data.user.role==="Member"&&state.page==="dashboard")state.page="member-dashboard";
  }else if(data.user.member_id){
    state.memberCenter=await api("/api/member/command-center");
    if(data.user.role==="Member"&&state.page==="dashboard")state.page="member-dashboard";
  }
  if(center){
    if(data.user.role==="Executive Officer")state.executive=center;
    if(data.user.role==="Finance Officer")state.finance=center;
    if(data.user.role==="Credits Officer")state.credits=center;
    if(data.user.role==="Investment Officer")state.investment=center;
  }else{
    if(data.user.role==="Executive Officer")state.executive=await api("/api/executive/command-center");
    if(data.user.role==="Finance Officer")state.finance=await api("/api/finance/command-center");
    if(data.user.role==="Credits Officer")state.credits=await api("/api/credits/command-center");
    if(data.user.role==="Investment Officer")state.investment=await api("/api/investment/command-center");
  }
}
function save() {}
function money(value) { return `UGX ${Math.abs(Number(value)).toLocaleString("en-US")}`; }
function initials(name) { return name.split(" ").map(part => part[0]).slice(0, 2).join("").toUpperCase(); }
function profileImage(userId,name,hasPhoto) { return hasPhoto?`<img class="profile-avatar-image" src="/api/users/${userId}/profile-photo?v=${state.profilePhotoVersion||0}" alt="${escapeHtml(name)}">`:initials(name); }
const STATUS_LABELS = {
  pending:"Pending", review:"Review", approved:"Approved", active:"Active", rejected:"Rejected",
  overdue:"Overdue", suspended:"Suspended", draft:"Draft", paid:"Paid", completed:"Completed",
  verified:"Verified", success:"Success", correction:"Correction",
  "pending-guarantors":"Guarantors", "officer-review":"Officer", "committee-review":"Committee",
  "finance-verification":"Finance", "executive-authorization":"Executive", "ready-disbursement":"Disburse",
  pending_finance_review:"Pending", information_requested:"Info requested"
};
function statusLabel(value) {
  const raw = String(value || "").trim();
  if (!raw) return "—";
  return STATUS_LABELS[raw] || raw.replaceAll("-", " ").replaceAll("_", " ");
}
function status(value) {
  const raw = String(value || "").trim();
  return `<span class="status ${escapeHtml(raw)}" title="${escapeHtml(statusLabel(raw))}">${escapeHtml(statusLabel(raw))}</span>`;
}
function displayRef(value) {
  return String(value || "").replace(/^([A-Za-z0-9]+)-/, (_, prefix) => `${prefix}\u2011`);
}
function actor() { return state.user?.full_name || "Organization User"; }
function canWrite() { return state.role!=="Auditor"; }
function addAudit() {}

function loginView(error = "") {
  document.getElementById("app").innerHTML = `<div class="login-page">
    <section class="login-brand">
      <div class="login-brand-identity"><div class="login-organization-heading"><strong><span>KASANGATI</span> G40</strong><small>KWAGALANA</small></div><img src="/brand-logo-slogan.png?v=51" alt="Kasangati G40 Kwagalana - Together in Love, United in Prosperity"></div>
      <div class="login-message"><h1>Together in <em>Love</em>,<br>United in <span>Prosperity.</span></h1><p>A secure platform for members, departments and leadership - working together for a stronger tomorrow.</p></div>
      <div class="login-features">
        <article><i>${icons.shield}</i><div><strong>Secure &amp; Reliable</strong><span>Your data is protected with enterprise-grade security.</span></div></article>
        <article><i>${icons.users}</i><div><strong>Role-Based Access</strong><span>Access only what you need, based on your role.</span></div></article>
        <article><i>${icons.reports}</i><div><strong>Transparency &amp; Accountability</strong><span>Real-time information, approvals and audit trail.</span></div></article>
      </div>
      <div class="login-trust">${icons.shield}<div><strong>Together in <em>Love</em>, United in <span>Prosperity.</span></strong></div></div>
    </section>
    <section class="login-panel">
      <div class="login-box">
        <div class="login-organization-heading login-form-heading"><strong><span>KASANGATI</span> G40</strong><small>KWAGALANA</small></div>
        <img class="login-form-logo" src="/brand-logo-slogan.png?v=51" alt="Kasangati G40 Kwagalana">
        <h2>Welcome back</h2><p>Sign in to your secure organization workspace.</p>
        ${error ? `<div class="login-error">${error}</div>` : ""}
        <div class="login-assistance" id="login-assistance" hidden></div>
        <form id="login-form">
          <div class="field"><label>Email address</label><div class="login-input-wrap"><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg></span><input name="email" type="email" autocomplete="username" required placeholder="Enter your email address"></div></div>
          <div class="field"><label>Password</label><div class="password-wrap login-input-wrap"><span>${icons.lock}</span><input id="login-password" name="password" type="password" autocomplete="current-password" required placeholder="Enter your password"><button type="button" class="password-toggle" id="password-toggle" aria-label="Show password">${icons.eye}</button></div></div>
          <div class="login-form-options"><label><input name="remember" type="checkbox" value="yes"> Remember me</label><button type="button" id="login-forgot">Forgot password?</button></div>
          <button class="button primary login-submit" type="submit">${icons.lock} Sign in securely</button>
        </form>
      </div>
      <footer class="login-footer"><span>${icons.shield} Secure access &nbsp;·&nbsp; Encrypted connection</span><small>&copy; ${new Date().getFullYear()} Kasangati G40 Kwagalana. All rights reserved.</small></footer>
    </section></div>`;
  document.getElementById("login-form").addEventListener("submit", login);
  document.getElementById("password-toggle").onclick = () => { const input=document.getElementById("login-password"); input.type=input.type==="password"?"text":"password"; };
  const assistance=document.getElementById("login-assistance");
  document.getElementById("login-forgot").onclick=()=>{assistance.hidden=false;assistance.textContent="Contact the Legal Department or system administrator to reset your password securely.";};
}
async function login(event) {
  event.preventDefault();
  const button=event.currentTarget.querySelector("button[type=submit]"); button.disabled=true; button.innerHTML=`${icons.lock} Signing in...`;
  try {
    const values=Object.fromEntries(new FormData(event.currentTarget));
    const session=await api("/api/auth/login",{method:"POST",body:JSON.stringify(values)});
    if(session.user){
      state.user=session.user; state.role=session.user.role; state.permissions=session.permissions||[];
      state.page=session.user.role==="Member"?"member-dashboard":"dashboard";
      document.getElementById("app").innerHTML=`<div class="loading-screen"><div class="loading-mark"><div class="brand-mark">${icons.logo}</div>Opening your workspace<div class="spinner"></div></div></div>`;
      await refreshData(session.user);
    }else{
      document.getElementById("app").innerHTML=`<div class="loading-screen"><div class="loading-mark"><div class="brand-mark">${icons.logo}</div>Opening your workspace<div class="spinner"></div></div></div>`;
      await refreshData();
    }
    render();
  } catch(error) { loginView(error.message); }
}
async function init() {
  document.getElementById("app").innerHTML=`<div class="loading-screen"><div class="loading-mark"><div class="brand-mark">${icons.logo}</div>Kasangati G40 Kwagalana<div class="spinner"></div></div></div>`;
  try { await refreshData(); render(); } catch { loginView(); }
}

function executiveWorkspaceRole() {
  return ({credits:"Credits Officer",finance:"Finance Officer",investment:"Investment Officer",welfare:"Welfare Officer",legal:"Legal Officer",audit:"Auditor",supervisory:"Supervisory Officer"})[state.executiveWorkspace]||state.role;
}
function isExecutiveReadOnly() {
  return state.role==="Executive Officer"&&Boolean(state.executiveWorkspace);
}
function canCreditsDisburse(){
  return state.role==="Credits Officer"&&!isExecutiveReadOnly()&&Boolean(state.credits?.access?.canEdit);
}
function render() {
  const workspaceRole=executiveWorkspaceRole();
  const allowed = rolePages[workspaceRole]||rolePages[state.role];
  const linkedMemberPage=Boolean(state.memberContext&&window.MemberPortal?.pages?.includes(state.page));
  if (!allowed.includes(state.page) && !linkedMemberPage && !(state.role==="Executive Officer"&&!state.executiveWorkspace&&state.page==="executive-search") &&
    !(state.role==="Finance Officer"&&state.page==="finance-search") && !(state.role==="Credits Officer"&&state.page==="credits-search") &&
    !(state.role==="Investment Officer"&&state.page==="investment-search")) state.page = allowed[0] || "dashboard";
  let [eyebrow, title] = pageMeta[state.page]||["Organization","Dashboard"];
  if(state.page==="dashboard"&&state.role==="Executive Officer"&&!state.executiveWorkspace)[eyebrow,title]=["Executive Department","Executive Command Center"];
  if(state.page==="dashboard"&&(state.role==="Finance Officer"||state.executiveWorkspace==="finance"))[eyebrow,title]=["Finance Department","Finance Dashboard"];
  if(state.page==="dashboard"&&(state.role==="Credits Officer"||state.executiveWorkspace==="credits"))[eyebrow,title]=["Credits Department","Credits (SACCO) Dashboard"];
  if(state.page==="dashboard"&&(state.role==="Investment Officer"||state.executiveWorkspace==="investment"))[eyebrow,title]=["Investment Department","Investment Dashboard"];
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="app-shell ${state.executiveWorkspace?"executive-workspace-mode":""}">
      ${sidebar()}
      <main class="main">
        <header class="topbar">
          <button class="mobile-menu" data-action="menu">${icons.menu}</button>
          <div class="top-search">${icons.search}<input id="global-search" value="${searchTerm}" placeholder="${state.role==="Executive Officer"&&!state.executiveWorkspace?"Search anything - members, loans, contracts, meetings...":state.role==="Finance Officer"||state.executiveWorkspace==="finance"?"Search receipts, vouchers, suppliers, invoices, amounts...":state.role==="Credits Officer"||state.executiveWorkspace==="credits"?"Search member, account, loan, guarantor, receipt...":state.role==="Investment Officer"||state.executiveWorkspace==="investment"?"Search projects, investors, proposals, contracts...":"Search members, departments, records..."}"></div>
          <div class="top-actions">
            ${state.executiveWorkspace?`<button class="button secondary" data-executive-workspace-exit>${icons.arrowUp} Back to Executive</button>`:""}
            <button class="icon-button" data-action="help">${icons.help}</button>
            <button class="icon-button" data-action="notifications">${icons.bell}<span class="notification-dot"></span></button>
            ${state.role==="Executive Officer"?`<button class="icon-button exec-calendar-button" data-executive-page="executive-meetings">${icons.clock}</button><div class="exec-top-profile"><div class="avatar blue">${initials(actor())}</div><div><strong>${actor()}</strong><span>${state.executiveWorkspace?`Viewing ${state.executiveWorkspace} (read only)`:"Executive Department"}</span></div></div>`:""}
            ${state.role==="Finance Officer"?`<div class="exec-top-profile"><div class="avatar blue">${initials(actor())}</div><div><strong>${actor()}</strong><span>Finance Department</span></div></div>`:""}
            ${state.role==="Credits Officer"?`<div class="exec-top-profile"><div class="avatar blue">${initials(actor())}</div><div><strong>${actor()}</strong><span>Credits Department</span></div></div>`:""}
            ${state.role==="Investment Officer"?`<div class="exec-top-profile"><div class="avatar blue">${initials(actor())}</div><div><strong>${actor()}</strong><span>Investment Department</span></div></div>`:""}
            <button class="date-chip" data-action="logout">Sign out</button>
          </div>
        </header>
        <div class="content">
          <div class="page-head">
            <div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p class="page-subtitle">${subtitle()}</p></div>
            ${headActions()}
          </div>
          ${view()}
        </div>
      </main>
    </div>`;
  document.querySelectorAll(".sidebar-user .avatar,.exec-top-profile .avatar").forEach(node=>{node.innerHTML=profileImage(state.user.id,actor(),state.user.has_profile_photo);});
  if(state.page==="messages"&&state.messenger?.active?.type==="direct"){
    const other=state.messenger.active.other,node=document.querySelector(".chat-head .chat-avatar");
    if(node)node.innerHTML=`${profileImage(other.id,other.fullName,other.hasProfilePhoto)}${other.online?"<i></i>":""}`;
  }
  bind();
}

function sidebar() {
  if(state.executiveWorkspace==="credits") return creditsSidebar();
  if(state.executiveWorkspace==="finance") return financeSidebar();
  if(state.executiveWorkspace==="investment") return investmentSidebar();
  if(state.role==="Executive Officer") return executiveSidebar();
  if(state.role==="Finance Officer") return financeSidebar();
  if(state.role==="Credits Officer") return creditsSidebar();
  if(state.role==="Investment Officer") return investmentSidebar();
  const labels = { dashboard: "Organization", departments: "Departments", messages: "Messages", users: "User accounts", members: "Members", savings: "Savings", loans: "Loans", withdrawals: "Withdrawals", approvals: "Approvals", reports: "Reports", audit: "Audit log", settings: "Settings" };
  const allowed = rolePages[state.role];
  const badge = state.loans.filter(l => ["pending", "review"].includes(l.status)).length + state.withdrawals.filter(w => w.status === "pending").length;
  return `<aside class="sidebar" id="sidebar">
    <div class="brand"><div class="brand-mark">${icons.logo}</div><div><div class="brand-name">Kasangati G40</div><div class="brand-sub">Kwagalana</div></div></div>
    <div class="nav-label">Workspace</div>
    <nav class="nav">${allowed.map(page => `<button class="nav-item ${state.page === page ? "active" : ""}" data-page="${page}">${icons[page] || icons.dashboard}<span>${labels[page]}</span>${page === "approvals" && badge ? `<span class="nav-badge">${badge}</span>` : page==="messages"&&state.unreadMessages ? `<span class="nav-badge">${state.unreadMessages}</span>` : ""}</button>`).join("")}</nav>
    <div class="sidebar-bottom">
      <div class="role-picker"><label>Secure session</label><div style="font-size:12px;font-weight:700">${state.role}</div><div style="margin-top:4px;color:#86a397;font-size:12px">${state.organization?.name || "Kasangati G40 Kwagalana"}</div></div>
      <div class="sidebar-user"><div class="avatar">${initials(actor())}</div><div><div class="user-name">${actor()}</div><div class="user-role">${state.role}</div></div></div>
    </div>
  </aside>`;
}
function investmentSidebar() {
  const labels={dashboard:"Dashboard",messages:"Messages","investment-projects":"Projects","investment-portfolio":"Investment Portfolio",
    "investment-proposals":"Investment Proposals","investment-investors":"Investors","investment-revenue":"Revenue",
    "investment-expenses":"Expenses","investment-pl":"Profit & Loss","investment-budgets":"Budgets","investment-assets":"Assets",
    "investment-contracts":"Contracts","investment-reports":"Reports","investment-analytics":"Analytics",
    "investment-documents":"Documents","investment-notifications":"Notifications",settings:"Settings"};
  const iconMap={"investment-projects":"building","investment-portfolio":"reports","investment-proposals":"file",
    "investment-investors":"users","investment-revenue":"arrowDown","investment-expenses":"arrowUp","investment-pl":"reports",
    "investment-budgets":"wallet","investment-assets":"building","investment-contracts":"file","investment-reports":"reports",
    "investment-analytics":"reports","investment-documents":"file","investment-notifications":"bell"};
  const pending=state.investment?.stats?.pendingProposals||0;
  const pages=rolePages[executiveWorkspaceRole()]||rolePages[state.role];
  const sidebarPages=new Set(["dashboard","messages","investment-projects","investment-proposals","investment-investors","investment-revenue","investment-expenses","investment-assets","investment-contracts","investment-reports","investment-documents","settings"]);
  return `<aside class="sidebar executive-sidebar investment-sidebar" id="sidebar">
    <div class="executive-brand"><div class="executive-crest investment-crest">${icons.reports}</div><div><strong>KASANGATI G40<br>KWAGALANA</strong><span>INVESTMENT DEPARTMENT</span></div></div>
    <nav class="nav executive-nav">${pages.filter(page=>sidebarPages.has(page)).map(page=>`<button class="nav-item ${state.page===page?"active":""}" data-page="${page}">${icons[iconMap[page]||page]||icons.dashboard}<span>${labels[page]}</span>${page==="investment-proposals"&&pending?`<b class="nav-badge">${pending}</b>`:""}</button>`).join("")}</nav>
    <div class="sidebar-bottom">${state.executiveWorkspace?`<button class="executive-quick" data-executive-workspace-exit>${icons.arrowUp}<span>Back to Executive</span></button>`:`<button class="executive-quick" data-action="investment-quick">${icons.arrowUp}<span>Quick Actions</span><b>&gt;</b></button>`}
      <div class="sidebar-user"><div class="avatar blue">${initials(actor())}</div><div><div class="user-name">${actor()}</div><div class="user-role">${state.executiveWorkspace?"Executive read-only view":"Investment Department"}</div></div></div></div>
  </aside>`;
}
function creditsSidebar() {
  const labels={dashboard:"Dashboard",messages:"Messages","credits-members":"Members","credits-savings":"Savings","credits-applications":"Loan Applications",
    "credits-approvals":"Loan Approvals","credits-active":"Active Loans","credits-disbursement":"Loan Disbursement","credits-receipts":"Disbursement Receipts","credits-repayments":"Repayments",
    "credits-guarantors":"Guarantors","credits-recovery":"Loan Recovery","credits-statements":"Statements",
    "credits-charges":"Interest & Penalties","credits-reports":"Reports","credits-analytics":"Analytics",
    "credits-documents":"Documents","credits-notifications":"Notifications",settings:"Settings"};
  const iconMap={"credits-members":"members","credits-savings":"savings","credits-applications":"file",
    "credits-approvals":"approvals","credits-active":"loans","credits-disbursement":"wallet","credits-receipts":"receipt","credits-repayments":"receipt",
    "credits-guarantors":"users","credits-recovery":"clock","credits-statements":"file","credits-charges":"loans",
    "credits-reports":"reports","credits-analytics":"reports","credits-documents":"file","credits-notifications":"bell"};
  const c=state.credits,applicationBadge=c?.stats?.pendingApplications||0,recoveryBadge=c?.stats?.overdueLoans||0,activeBadge=c?.stats?.activeLoans||0;
  const repaymentBadge=(c?.transactions||[]).filter(t=>t.type==="Loan repayment"&&t.status==="pending").length;
  const dangerBadge=(c?.loans||[]).filter(l=>l.inDangerPeriod&&Number(l.balance)>0).length;
  const pages=rolePages[executiveWorkspaceRole()]||rolePages[state.role];
  const sidebarPages=new Set(["dashboard","messages","credits-members","credits-savings","credits-applications","credits-approvals","credits-active","credits-disbursement","credits-receipts","credits-repayments","credits-guarantors","credits-recovery","credits-reports","credits-documents","credits-notifications","settings"]);
  if(isExecutiveReadOnly()) sidebarPages.delete("credits-disbursement");
  return `<aside class="sidebar executive-sidebar credits-sidebar" id="sidebar">
    <div class="executive-brand"><div class="executive-crest credits-crest">${icons.loans}</div><div><strong>KASANGATI G40<br>KWAGALANA</strong><span>SACCO - CREDITS DEPARTMENT</span></div></div>
    <nav class="nav executive-nav">${pages.filter(page=>sidebarPages.has(page)).map(page=>`<button class="nav-item ${state.page===page?"active":""}" data-page="${page}">${icons[iconMap[page]||page]||icons.dashboard}<span>${labels[page]}</span>${page==="credits-applications"&&applicationBadge?`<b class="nav-badge">${applicationBadge}</b>`:page==="credits-active"&&activeBadge?`<b class="nav-badge">${activeBadge}</b>`:page==="credits-repayments"&&repaymentBadge?`<b class="nav-badge">${repaymentBadge}</b>`:page==="credits-recovery"&&(recoveryBadge||dangerBadge)?`<b class="nav-badge">${recoveryBadge+dangerBadge}</b>`:""}</button>`).join("")}</nav>
    <div class="sidebar-bottom">${state.executiveWorkspace?`<button class="executive-quick" data-executive-workspace-exit>${icons.arrowUp}<span>Back to Executive</span></button>`:`<button class="executive-quick" data-action="credits-quick">${icons.arrowUp}<span>Quick Actions</span><b>&gt;</b></button>`}
      <div class="sidebar-user"><div class="avatar blue">${initials(actor())}</div><div><div class="user-name">${actor()}</div><div class="user-role">${state.executiveWorkspace?"Executive read-only view":"Credits Department"}</div></div></div></div>
  </aside>`;
}
function financeSidebar() {
  const labels={dashboard:"Dashboard",messages:"Messages","finance-income":"Income","finance-expenses":"Expenses","finance-vouchers":"Payment Vouchers",
    "finance-receipts":"Receipts","finance-invoices":"Invoices","finance-budgets":"Budgets","finance-bank":"Bank Accounts",
    "finance-cashbook":"Cashbook","finance-assets":"Assets","finance-procurement":"Procurement","finance-approvals":"Approvals",
    "finance-reports":"Reports","finance-analytics":"Analytics","finance-documents":"Documents",settings:"Settings"};
  const iconsByPage={"finance-income":"arrowDown","finance-expenses":"arrowUp","finance-vouchers":"approvals","finance-receipts":"receipt",
    "finance-invoices":"file","finance-budgets":"reports","finance-bank":"building","finance-cashbook":"wallet","finance-assets":"building",
    "finance-procurement":"users","finance-approvals":"approvals","finance-reports":"reports","finance-analytics":"reports","finance-documents":"file"};
  const pending=state.finance?.stats?.pendingPaymentRequests||0;
  const pages=rolePages[executiveWorkspaceRole()]||rolePages[state.role];
  const sidebarPages=new Set(["dashboard","messages","finance-income","finance-expenses","finance-invoices","finance-budgets","finance-bank","finance-assets","finance-procurement","finance-approvals","finance-reports","finance-documents","settings"]);
  return `<aside class="sidebar executive-sidebar finance-sidebar" id="sidebar">
    <div class="executive-brand"><div class="executive-crest finance-crest">${icons.wallet}</div><div><strong>KASANGATI G40<br>KWAGALANA</strong><span>Finance Department</span></div></div>
    <nav class="nav executive-nav">${pages.filter(page=>sidebarPages.has(page)).map(page=>`<button class="nav-item ${state.page===page?"active":""}" data-page="${page}">${icons[iconsByPage[page]||page]||icons.dashboard}<span>${labels[page]}</span>${page==="finance-approvals"&&pending?`<b class="nav-badge">${pending}</b>`:""}</button>`).join("")}</nav>
    <div class="sidebar-bottom">${state.executiveWorkspace?`<button class="executive-quick" data-executive-workspace-exit>${icons.arrowUp}<span>Back to Executive</span></button>`:`<button class="executive-quick" data-action="finance-quick">${icons.arrowUp}<span>Quick Actions</span><b>&gt;</b></button>`}
      <div class="sidebar-user"><div class="avatar blue">${initials(actor())}</div><div><div class="user-name">${actor()}</div><div class="user-role">${state.executiveWorkspace?"Executive read-only view":"Finance Department"}</div></div></div></div>
  </aside>`;
}
function executiveSidebar() {
  const labels={dashboard:"Dashboard",messages:"Messages",members:"Members",departments:"Departments",users:"System accounts","executive-finance":"Finance","executive-credits":"Credits (SACCO)",
    "executive-investments":"Investments","executive-welfare":"Welfare","executive-legal":"Legal","executive-audit":"Audit",
    "executive-supervisory":"Supervisory","executive-approvals":"Approvals","executive-meetings":"Meetings","executive-projects":"Projects",
    "executive-reports":"Reports","executive-analytics":"Analytics",notifications:"Notifications","executive-documents":"Documents",settings:"Settings"};
  const iconMap={"executive-finance":"wallet","executive-credits":"loans","executive-investments":"reports","executive-welfare":"users",
    "executive-legal":"file","executive-audit":"audit","executive-supervisory":"shield","executive-approvals":"approvals",
    "executive-meetings":"clock","executive-projects":"building","executive-reports":"reports","executive-analytics":"reports",
    notifications:"bell","executive-documents":"file",users:"lock"};
  const pending=state.executive?.stats?.pendingApprovals||((state.executive?.approvals||[]).length+((state.executive?.documents||[]).filter(d=>d.status==="pending_executive").length));
  const sidebarPages=new Set(["dashboard","messages","members","departments","users","executive-approvals","executive-meetings","executive-projects","executive-reports","executive-analytics","notifications","executive-documents","settings"]);
  return `<aside class="sidebar executive-sidebar" id="sidebar">
    <div class="executive-brand"><div class="executive-crest">${icons.shield}</div><div><strong>KASANGATI G40<br>KWAGALANA</strong><span>Executive Department</span></div></div>
    <nav class="nav executive-nav">${rolePages[state.role].filter(page=>sidebarPages.has(page)).map(page=>`<button class="nav-item ${state.page===page?"active":""}" data-page="${page}">${icons[iconMap[page]||page]||icons.dashboard}<span>${labels[page]}</span>${page==="executive-approvals"&&pending?`<b class="nav-badge">${pending}</b>`:""}</button>`).join("")}</nav>
    <div class="sidebar-bottom"><button class="executive-quick" data-action="executive-quick">${icons.arrowUp}<span>Quick Actions</span><b>&gt;</b></button>
      <div class="sidebar-user"><div class="avatar blue">${initials(actor())}</div><div><div class="user-name">${actor()}</div><div class="user-role">Executive Department</div></div></div></div>
  </aside>`;
}

function subtitle() {
  const copy = {
    dashboard: state.role === "Member" ? "Your membership, department, benefits and financial activity in one place." :
      state.role==="Finance Officer"?"Overview of the organization's financial activities?not SACCO savings and loans.":
      state.role==="Credits Officer"?"Savings, loans, guarantors, repayments and portfolio recovery in one SACCO workspace.":
      state.role==="Investment Officer"?"Projects, opportunities, capital, returns and portfolio performance in one business-intelligence workspace.":
      state.role==="Executive Officer"?"Strategic organization health, performance, alerts and major decisions.":"A central view of verified organization information and work requiring attention.",
    departments: "Only departments granted by your assignment and leadership level are shown.",
    messages: "Securely connect with members, departments and leadership.",
    users: "Reset passwords and manage secure login accounts for staff and members.",
    members: "Manage member records, status and account information.",
    savings: "Track contributions, deposits and member savings balances.",
    loans: "Manage applications, approvals and repayment performance.",
    withdrawals: "Review and process member withdrawal requests.",
    approvals: "Keep duties separate with clear, traceable decisions.",
    reports: "Financial and operational performance at a glance.",
    audit: "A permanent record of important actions across the system.",
    settings: "Configure access, security and organization operations.",
    "executive-finance":"Strategic financial health, budget and major payment summary.",
    "executive-credits":"Savings, loan portfolio health and executive-level credit decisions.",
    "executive-investments":"Project performance, returns and ventures needing attention.",
    "executive-welfare":"Welfare fund strength, requests and major support decisions.",
    "executive-legal":"Contracts, cases, policies and compliance alerts.",
    "executive-audit":"Independent assurance issues and resolution progress.",
    "executive-supervisory":"Recommendations, follow-ups and departments below target.",
    "executive-approvals":"Major actions requiring executive authority and a recorded decision.",
    "executive-meetings":"Board, committee, welfare, investment and training events.",
    "executive-projects":"Organization investment projects and expected returns.",
    "executive-reports":"Download strategic reports across every organizational arm.",
    "executive-analytics":"Trends for membership, revenue, expenses, loans, savings and performance.",
    notifications:"Urgent alerts and important organization updates.",
    "executive-documents":"Constitution, policies, minutes, contracts and formal reports.",
    "executive-search":"Search results across members, loans, departments, projects, cases and records."
  };
  Object.assign(copy,{
    "finance-income":"Record and monitor organization revenue by source.",
    "finance-expenses":"Create controlled expense requests without touching SACCO accounts.",
    "finance-vouchers":"Review payment vouchers and route large payments for executive authority.",
    "finance-receipts":"Find and issue evidence for completed organization income.",
    "finance-invoices":"Monitor supplier invoices, due dates and liabilities.",
    "finance-budgets":"Allocate departmental budgets and act on utilization alerts.",
    "finance-bank":"Organization bank, cash, petty cash and reconciliation summary.",
    "finance-cashbook":"A chronological ledger of organization income and expenditure.",
    "finance-assets":"Land, buildings, vehicles, furniture, computers and equipment.",
    "finance-procurement":"Track purchasing from departmental request through payment and closure.",
    "finance-approvals":"Routine finance reviews and payments awaiting further authority.",
    "finance-reports":"Generate financial, budget, bank, asset and procurement reports.",
    "finance-analytics":"Revenue, expense, budget, department spending and cash-flow trends.",
    "finance-documents":"Supporting finance documents and approved reports.",
    "finance-search":"Results from receipts, vouchers, suppliers, invoices, accounts, assets and procurement."
  });
  Object.assign(copy,{
    "credits-members":"Member SACCO accounts, savings, loans, guarantee positions and histories.",
    "credits-savings":"Record deposits and controlled withdrawals with complete receipt references.",
    "credits-applications":"Applications from submission through guarantor consent and credit review.",
    "credits-approvals":"Review decisions by the Credits officer, committee and authorized leadership.",
    "credits-disbursement":"Approved loans ready to be sent to members and scheduled for repayment.",
    "credits-repayments":"Post repayments against schedules, balances, interest and charges.",
    "credits-guarantors":"Guarantee requests, capacity, accepted security and declined requests.",
    "credits-recovery":"Overdue facilities, recovery officers, reminders, actions and follow-ups.",
    "credits-statements":"Generate detailed savings and loan account statements for members.",
    "credits-charges":"Interest, late penalties, service charges, processing fees and approved waivers.",
    "credits-reports":"Savings, portfolio, recovery, interest, guarantor and transaction reports.",
    "credits-analytics":"Savings growth, loan quality, repayments, default risk and interest trends.",
    "credits-documents":"Credit policies, supporting documents and approved SACCO reports.",
    "credits-notifications":"Applications, guarantor responses, due repayments, defaults and deposits.",
    "credits-search":"Results from SACCO members, loans, guarantors, receipts and references."
  });
  Object.assign(copy,{
    "investment-projects":"Register, monitor and compare every income-generating organization project.",
    "investment-portfolio":"Capital invested, current value, growth, returns and historical performance.",
    "investment-proposals":"Ideas moving through review, analysis, Executive approval, funding and implementation.",
    "investment-investors":"Member investors, grants, funding sources, ownership and return obligations.",
    "investment-revenue":"Rental, sales, service, agricultural, dividend and interest income by project.",
    "investment-expenses":"Construction, maintenance, salaries, utilities, repairs, taxes and project costs.",
    "investment-pl":"Project revenue less expenses, net profit, margin and monthly trends.",
    "investment-budgets":"Project budgets, capital utilization, remaining requirements and alerts.",
    "investment-assets":"Buildings, vehicles, equipment and other property assigned to investments.",
    "investment-contracts":"Contractor, supplier, lease, partnership and insurance agreements.",
    "investment-reports":"Portfolio, project, P&L, ROI, budget and annual investment reports.",
    "investment-analytics":"Portfolio growth, ROI comparison, progress, distribution and budget intelligence.",
    "investment-documents":"Investment policies, agreements, proposals and performance records.",
    "investment-notifications":"Proposal decisions, budget alerts, milestones, maintenance and contract renewals.",
    "investment-search":"Results from projects, proposals, investors, contractors, categories and locations."
  });
  return copy[state.page];
}

function headActions() {
  if(state.role==="Investment Officer") {
    if(state.page==="investment-projects") return `<div class="head-actions"><button class="button primary" data-investment-modal="project">${icons.plus}Add project</button></div>`;
    if(state.page==="investment-proposals") return `<div class="head-actions"><button class="button primary" data-investment-modal="proposal">${icons.plus}Create proposal</button></div>`;
    if(state.page==="investment-investors") return `<div class="head-actions"><button class="button primary" data-investment-modal="investor">${icons.plus}Add funding source</button></div>`;
    if(state.page==="investment-revenue") return `<div class="head-actions"><button class="button primary" data-investment-modal="revenue">${icons.plus}Record revenue</button></div>`;
    if(state.page==="investment-expenses") return `<div class="head-actions"><button class="button primary" data-investment-modal="expense">${icons.plus}Record expense</button></div>`;
    if(state.page==="investment-assets") return `<div class="head-actions"><button class="button primary" data-investment-modal="asset">${icons.plus}Register asset</button></div>`;
    if(state.page==="investment-contracts") return `<div class="head-actions"><button class="button primary" data-investment-modal="contract">${icons.plus}Add contract</button></div>`;
    if(state.page==="investment-reports") return `<div class="head-actions"><button class="button primary" data-investment-report="Annual Investment Report" data-format="pdf">${icons.download}Annual report</button></div>`;
  }
  if(state.role==="Credits Officer") {
    if(state.page==="credits-savings") return `<div class="head-actions"><button class="button secondary" data-credits-modal="withdrawal">${icons.withdraw}Request withdrawal</button><button class="button primary" data-credits-modal="deposit">${icons.plus}Record deposit</button></div>`;
    if(state.page==="credits-applications") return `<div class="head-actions"><button class="button primary" data-credits-modal="loan">${icons.plus}New application</button></div>`;
    if(state.page==="credits-repayments") return `<div class="head-actions"><button class="button primary" data-credits-modal="repayment">${icons.plus}Record repayment</button></div>`;
    if(state.page==="credits-recovery") return `<div class="head-actions"><button class="button primary" data-credits-modal="recovery">${icons.plus}Recovery action</button></div>`;
    if(state.page==="credits-charges") return `<div class="head-actions"><button class="button primary" data-credits-modal="charge">${icons.plus}Assess charge</button></div>`;
    if(state.page==="credits-reports") return `<div class="head-actions"><button class="button primary" data-credits-report="Annual Credit Report" data-format="pdf">${icons.download}Annual credit report</button></div>`;
  }
  if(state.role==="Finance Officer") {
    if(state.page==="finance-income") return `<div class="head-actions"><button class="button primary" data-finance-modal="income">${icons.plus}Record income</button></div>`;
    if(state.page==="finance-expenses") return `<div class="head-actions"><button class="button primary" data-finance-modal="expense">${icons.plus}New expense request</button></div>`;
    if(state.page==="finance-invoices") return `<div class="head-actions"><button class="button primary" data-finance-modal="invoice">${icons.plus}Record invoice</button></div>`;
    if(state.page==="finance-budgets") return `<div class="head-actions"><button class="button primary" data-finance-modal="budget">${icons.plus}Create or update budget</button></div>`;
    if(state.page==="finance-bank") return `<div class="head-actions"><button class="button primary" data-finance-modal="account">${icons.plus}Add cash account</button></div>`;
    if(state.page==="finance-assets") return `<div class="head-actions"><button class="button primary" data-finance-modal="asset">${icons.plus}Register asset</button></div>`;
    if(state.page==="finance-procurement") return `<div class="head-actions"><button class="button primary" data-finance-modal="procurement">${icons.plus}Procurement request</button></div>`;
    if(state.page==="finance-reports") return `<div class="head-actions"><button class="button primary" data-finance-report="Financial Statement">${icons.download}Financial statement</button></div>`;
  }
  if(state.role==="Executive Officer") {
    if(state.page==="executive-approvals") return `<div class="head-actions"><button class="button secondary" data-action="executive-refresh">${icons.refresh}Refresh</button></div>`;
    if(state.page==="executive-reports") return `<div class="head-actions"><button class="button primary" data-executive-report="Executive Report">${icons.download}Executive report</button></div>`;
    if(state.page==="executive-meetings") return `<div class="head-actions"><button class="button primary" data-action="schedule-meeting">${icons.plus}Schedule meeting</button></div>`;
  }
  if (state.page === "departments" && state.departmentData?.access?.canCreate) {
    return `<div class="head-actions"><button class="button secondary" data-action="back-departments">${icons.arrowUp}All departments</button><button class="button primary" data-modal="department-activity">${icons.plus}New activity</button></div>`;
  }
  if (state.page === "messages") {
    const canChannel=["Executive Officer","System Admin"].includes(state.role);
    return `<div class="head-actions">${canChannel?`<button class="button secondary" data-action="new-channel">${icons.bell}New channel</button>`:""}<button class="button secondary" data-action="new-group">${icons.users}New group</button><button class="button primary" data-action="new-message">${icons.plus}New message</button></div>`;
  }
  if (state.page === "users") return `<div class="head-actions"><button class="button primary" data-modal="user">${icons.plus}Create user</button></div>`;
  if (state.page === "members" && (state.permissions.includes("member:manage") || state.permissions.includes("user:manage"))) return `<div class="head-actions"><button class="button secondary" data-action="export">${icons.download}Export</button><button class="button primary" data-modal="member">${icons.plus}New member</button></div>`;
  if (state.page === "members") return `<div class="head-actions"><button class="button secondary" data-action="export">${icons.download}Export</button></div>`;
  if (state.page === "savings" && state.role === "Member") return `<div class="head-actions"><button class="button primary" data-action="statement">${icons.file}Download statement</button></div>`;
  if (state.page === "savings" && state.permissions.includes("transaction:create")) return `<div class="head-actions"><button class="button secondary" data-action="statement">${icons.file}Statement</button><button class="button primary" data-modal="deposit">${icons.plus}Record deposit</button></div>`;
  if (state.page === "loans" && (state.permissions.includes("loan:create") || state.permissions.includes("loan:manage"))) return `<div class="head-actions"><button class="button secondary" data-action="export">${icons.download}Export</button><button class="button primary" data-modal="loan">${icons.plus}New application</button></div>`;
  if (state.page === "reports") return `<div class="head-actions"><button class="button primary" data-action="export">${icons.download}Export report</button></div>`;
  if (state.page === "audit") return `<div class="head-actions"><button class="button secondary" data-action="export">${icons.download}Export log</button></div>`;
  return "";
}

function view() {
  const views = { dashboard: dashboardView, departments: departmentsView, messages: messagesView, users: usersView, members: membersView, savings: savingsView, loans: loansView, withdrawals: withdrawalsView, approvals: approvalsView, reports: reportsView, audit: auditView, settings: settingsView };
  if(state.role==="Executive Officer"&&state.page==="settings") return executiveSettingsView();
  if(state.role==="Finance Officer"&&state.page==="settings") return financeSettingsView();
  if(state.role==="Credits Officer"&&state.page==="settings") return creditsSettingsView();
  if(state.role==="Investment Officer"&&state.page==="settings") return investmentSettingsView();
  if(state.page==="investment-projects") return investmentProjectsView();
  if(state.page==="investment-portfolio") return investmentPortfolioView();
  if(state.page==="investment-proposals") return investmentProposalsView();
  if(state.page==="investment-investors") return investmentInvestorsView();
  if(state.page==="investment-revenue") return investmentRevenueView();
  if(state.page==="investment-expenses") return investmentExpensesView();
  if(state.page==="investment-pl") return investmentProfitLossView();
  if(state.page==="investment-budgets") return investmentBudgetsView();
  if(state.page==="investment-assets") return investmentAssetsView();
  if(state.page==="investment-contracts") return investmentContractsView();
  if(state.page==="investment-reports") return investmentReportsView();
  if(state.page==="investment-analytics") return investmentAnalyticsView();
  if(state.page==="investment-documents") return investmentDocumentsView();
  if(state.page==="investment-notifications") return investmentNotificationsView();
  if(state.page==="investment-search") return investmentSearchView();
  if(state.page==="credits-members") return creditsMembersView();
  if(state.page==="credits-savings") return creditsSavingsView();
  if(state.page==="credits-applications") return creditsApplicationsView();
  if(state.page==="credits-approvals") return creditsApprovalsView();
  if(state.page==="credits-active") return creditsActiveLoansView();
  if(state.page==="credits-disbursement") return creditsDisbursementView();
  if(state.page==="credits-receipts") return creditsReceiptsView();
  if(state.page==="credits-repayments") return creditsRepaymentsView();
  if(state.page==="credits-guarantors") return creditsGuarantorsView();
  if(state.page==="credits-recovery") return creditsRecoveryView();
  if(state.page==="credits-statements") return creditsStatementsView();
  if(state.page==="credits-charges") return creditsChargesView();
  if(state.page==="credits-reports") return creditsReportsView();
  if(state.page==="credits-analytics") return creditsAnalyticsView();
  if(state.page==="credits-documents") return creditsDocumentsView();
  if(state.page==="credits-notifications") return creditsNotificationsView();
  if(state.page==="credits-search") return creditsSearchView();
  if(state.page==="finance-income") return financeIncomeView();
  if(state.page==="finance-expenses") return financeExpensesView();
  if(state.page==="finance-vouchers"||state.page==="finance-approvals") return financeVouchersView();
  if(state.page==="finance-receipts") return financeReceiptsView();
  if(state.page==="finance-invoices") return financeInvoicesView();
  if(state.page==="finance-budgets") return financeBudgetsView();
  if(state.page==="finance-bank") return financeBankView();
  if(state.page==="finance-cashbook") return financeCashbookView();
  if(state.page==="finance-assets") return financeAssetsView();
  if(state.page==="finance-procurement") return financeProcurementView();
  if(state.page==="finance-reports") return financeReportsView();
  if(state.page==="finance-analytics") return financeAnalyticsView();
  if(state.page==="finance-documents") return financeDocumentsView();
  if(state.page==="finance-search") return financeSearchView();
  if(views[state.page]) return views[state.page]();
  if(state.page==="executive-approvals") return executiveApprovalsView();
  if(state.page==="executive-meetings") return executiveMeetingsView();
  if(state.page==="executive-projects") return executiveProjectsView();
  if(state.page==="executive-reports") return executiveReportsView();
  if(state.page==="executive-analytics") return executiveAnalyticsView();
  if(state.page==="executive-documents") return executiveDocumentsView();
  if(state.page==="notifications") return executiveNotificationsView();
  if(state.page==="executive-search") return executiveSearchView();
  if(state.page?.startsWith("executive-")) return executiveModuleView(state.page.replace("executive-",""));
  return dashboardView();
}

function metric(label, value, icon, note, style = "") {
  return `<div class="metric ${style === "dark" ? "dark" : ""}"><div class="metric-top"><span class="metric-label">${label}</span><span class="metric-icon ${style}">${icons[icon]}</span></div><div class="metric-value">${value}</div><div class="metric-note">${note}</div></div>`;
}

const departmentModules = {
  welfare:["Welfare contributions","Assistance requests","Case review","Benefit approvals","Disbursement","Welfare reports"],
  investment:["Projects","Member participation","Capital raised","Performance","Returns","Assets"],
  finance:["Income & expenditure","Budgets","Member contributions","Payment verification","Financial statements","Department reports"],
  legal:["Contracts","Legal cases","Statutory records","Policy review","Disputes","Legal compliance"],
  executive:["Leadership","Membership records","Human resources","Communication","Meetings","Documents & elections"],
  supervisory:["Internal audit","Department supervision","Risk & controls","Investigations","Compliance findings","Follow-up actions"],
  credits:["Savings","Loan applications","Guarantors","Credit approvals","Disbursement","Repayment schedules"],
};
function departmentsView() {
  if(state.role==="Executive Officer") return executiveDepartmentsView();
  if(state.departmentData) return departmentDashboardView(state.departmentData);
  const departments=state.organization?.departments||[];
  if(!departments.length) return `<div class="permission-empty">${icons.lock}<h2>No departmental assignment</h2><p>Your account has no active department access. A manager or system administrator must assign your position and authority.</p></div>`;
  return `<div class="organization-hero"><div><p class="eyebrow">Central organization</p><h2>${state.organization.name}</h2><p>${state.organization.description||""}</p></div><div class="authority-summary">${icons.shield}<div><strong>${state.organization.leadership?.[0]?.positionTitle||state.role}</strong><span>${departments.length} authorized dashboard${departments.length===1?"":"s"}</span></div></div></div>
    <div class="department-grid">${departments.map((d,index)=>`<button class="department-card dept-${d.code}" data-department="${d.code}">
      <div class="department-number">0${index+1}</div><div class="department-icon">${icons[departmentIcon(d.code)]||icons.building}</div>
      <h3>${d.name}</h3><p>${d.description}</p><div class="department-access"><span>${d.positionTitle}</span><strong>Level ${d.authorityLevel}</strong></div>
      <div class="department-rights">${d.canCreate?"Create":""}${d.canEdit?" - Edit":""}${d.canApprove?" - Approve":""}${!d.canCreate&&!d.canEdit&&!d.canApprove?"View only":""}</div>
    </button>`).join("")}</div>
    <div class="notice">${icons.shield}<div><strong>Information is shared safely</strong><p>All departments use one verified member identity. Sensitive activities are filtered by department, assignment rights and leadership level.</p></div></div>`;
}
function departmentIcon(code) {
  return ({welfare:"users",investment:"reports",finance:"wallet",legal:"file",executive:"building",supervisory:"shield",credits:"loans"})[code]||"building";
}
function departmentDashboardView(data) {
  const d=data.department,a=data.access,modules=departmentModules[d.code]||[];
  const special=departmentSpecialView(data);
  return `<button class="department-back" data-action="back-departments">? Back to all authorized departments</button>
    <div class="department-header dept-${d.code}"><div class="department-icon">${icons[departmentIcon(d.code)]}</div><div><p class="eyebrow">Department dashboard</p><h2>${d.name}</h2><p>${d.description}</p></div>
      <div class="authority-card"><span>Your assignment</span><strong>${a.positionTitle}</strong><small>Authority level ${a.authorityLevel} - ${a.canApprove?"Approval enabled":"No approval authority"}</small></div></div>
    <div class="metric-grid department-metrics">
      ${metric("Open activities",data.summary.pending,"clock","Within your visibility level","dark")}
      ${metric("Department members",data.summary.members,"members","Active member placements")}
      ${metric("Assigned staff",data.summary.staff,"users","Departmental users")}
      ${metric("Authority level",`${a.authorityLevel} / 5`,"shield",a.canCreate?"Create access enabled":"View-only access","blue")}
    </div>
    <div class="department-layout"><div>
      <div class="card"><div class="card-head"><div><h2 class="card-title">Department activity</h2><p class="card-subtitle">Records visible at authority level ${a.authorityLevel}</p></div></div>
      ${data.activities.length?`<div class="department-activity-list">${data.activities.map(item=>`<div class="department-activity"><div><span>${item.reference} - ${item.activityType}</span><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.description||"No description")}</p></div><div class="activity-decision">${item.amount?`<b>${money(item.amount)}</b>`:""}${status(item.status)}${a.canApprove&&!["approved","rejected","completed"].includes(item.status)?`<button class="mini-btn approve" data-department-decision="${item.id}" data-decision="approved">${icons.check}</button><button class="mini-btn reject" data-department-decision="${item.id}" data-decision="rejected">${icons.x}</button>`:""}</div></div>`).join("")}</div>`:`<div class="empty-state">${icons.file}<p>No activities are visible at this authority level.</p></div>`}</div>
      ${special}
    </div><div><div class="card"><div class="card-head"><div><h2 class="card-title">Department modules</h2><p class="card-subtitle">Independent work areas</p></div></div><div class="module-list">${modules.map(name=>`<div>${icons.check}<span>${name}</span></div>`).join("")}</div></div>
      <div class="card stack"><div class="card-head"><div><h2 class="card-title">Assigned team</h2><p class="card-subtitle">Position and authority</p></div></div>${data.staff.map(person=>`<div class="department-person"><div class="avatar green">${initials(person.name)}</div><div><strong>${person.name}</strong><span>${person.position}</span></div><b>L${person.level}</b></div>`).join("")||`<p class="page-subtitle">No staff assignments.</p>`}</div>
    </div></div>`;
}
function departmentSpecialView(data) {
  if(data.department.code==="investment"&&data.investments.length) return `<div class="card stack"><div class="card-head"><div><h2 class="card-title">Investment projects</h2><p class="card-subtitle">Capital and project performance</p></div></div>${data.investments.map(p=>progress(p.name,`${money(p.raisedAmount)} / ${money(p.targetAmount)}`,Math.min(100,Math.round(p.raisedAmount/p.targetAmount*100)),"lime")).join("")}</div>`;
  if(data.department.code==="welfare"&&data.welfare.length) return `<div class="card stack"><div class="card-head"><div><h2 class="card-title">Welfare cases</h2><p class="card-subtitle">Member assistance requests</p></div></div>${data.welfare.map(w=>`<div class="setting-row"><div class="setting-copy"><strong>${w.member} - ${w.requestType}</strong><span>${w.reference} - ${money(w.amount)}</span></div>${status(w.status)}</div>`).join("")}</div>`;
  if(data.department.code==="executive"&&data.meetings.length) return `<div class="card stack"><div class="card-head"><div><h2 class="card-title">Meetings</h2><p class="card-subtitle">Agendas, attendance and resolutions</p></div></div>${data.meetings.map(m=>`<div class="setting-row"><div class="setting-copy"><strong>${m.title}</strong><span>${new Date(m.scheduledAt).toLocaleString()} - ${m.venue||"Venue pending"}</span></div>${status(m.status)}</div>`).join("")}</div>`;
  if(data.department.code==="supervisory"&&data.governance.length) return `<div class="card stack"><div class="card-head"><div><h2 class="card-title">Supervisory register</h2><p class="card-subtitle">Audit, risk, control and compliance records</p></div></div>${data.governance.map(g=>`<div class="setting-row"><div class="setting-copy"><strong>${g.title}</strong><span>${g.reference} - ${g.recordType}${g.severity?` - ${g.severity}`:""}</span></div>${status(g.status)}</div>`).join("")}</div>`;
  return "";
}

function executiveDashboardView() {
  const e=state.executive;if(!e)return `<div class="executive-loading">Loading executive command center?</div>`;
  const s=e.stats;
  const cards=[
    ["Total Members",s.totalMembers,"members","members","Verified membership"],
    ["Active Members",s.activeMembers,"members","members","Currently active"],
    ["New Members This Month",s.newMembers,"plus","members","Membership growth"],
    ["Total Departments",s.totalDepartments,"building","departments","Organization arms"],
    ["Pending Approvals",s.pendingApprovals,"approvals","executive-approvals","Needs authority"],
    ["Organization Income",money(s.organizationIncome),"arrowDown","executive-finance","Approved income"],
    ["Organization Expenditure",money(s.organizationExpenditure),"arrowUp","executive-finance","Approved spending"],
    ["Net Balance",money(s.netBalance),"wallet","executive-finance","Income less expenses"],
    ["Total SACCO Savings",money(s.totalSavings),"savings","executive-credits","Member savings"],
    ["Outstanding Loans",money(s.outstandingLoans),"loans","executive-credits","Active and overdue"],
    ["Active Investments",s.activeInvestments,"reports","executive-investments","Running projects"],
    ["Welfare Fund Balance",money(s.welfareFundBalance),"users","executive-welfare","Available fund"],
    ["Legal Cases",s.legalCases,"file","executive-legal","Open matters"],
    ["Audit Issues",s.auditIssues,"audit","executive-audit","Open findings"],
    ["Supervisory Recommendations",s.supervisoryRecommendations,"shield","executive-supervisory","Pending follow-up"],
    ["Upcoming Meetings",s.upcomingMeetings,"clock","executive-meetings","Organization calendar"]
  ];
  const yearOptions=(e.availableFiscalYears||[]).map(y=>`<option value="${y.year}" ${Number(y.year)===Number(e.selectedFiscalYear)?"selected":""}>${escapeHtml(y.label||`FY ending ${y.year}`)}</option>`).join("");
  return `<div class="exec-welcome"><div><p class="eyebrow">Executive command center</p><h2>Good ${new Date().getHours()<12?"morning":new Date().getHours()<17?"afternoon":"evening"}, ${actor().split(" ")[0]}</h2><p>${e.historicalPeriod?`Viewing the supplied FY ${e.selectedFiscalYear} closing records.`:"Here is the strategic health of Kasangati G40 Kwagalana today."}</p></div><div class="dashboard-year-control"><label>Financial year</label><select data-executive-fy>${yearOptions}</select><span class="exec-live"><i></i>${e.historicalPeriod?"Historical statement":"Live organization overview"}</span></div></div>
    <div class="exec-stat-grid">${cards.slice(0,8).map((c,i)=>executiveStatCard(...c,i)).join("")}</div>
    <div class="exec-command-grid">
      ${executivePerformanceWidget(e)}
      ${executiveApprovalWidget(e.approvals.slice(0,5))}
      ${executiveActivityWidget(e.activities.slice(0,7))}
      ${executiveFinancialWidget(e)}
    </div>
    <div class="exec-health-grid">
      ${executiveHealthCard("Loan overview","executive-credits","loans",[
        ["Total savings",money(s.totalSavings)],["Active loans",e.loans.active],["Loans due today",e.loans.due_today],
        ["Loans in default",e.loans.defaults],["Recovery rate",`${e.loans.recoveryRate}%`]])}
      ${executiveHealthCard("Investment","executive-investments","reports",[
        ["Projects running",e.investment.running],["Profitable projects",e.investment.profitable],["Projects losing money",e.investment.losing],
        ["Expected returns",money(e.investment.expected_return)],["Investment growth",`${e.investment.growth}%`]])}
      ${executiveHealthCard("Welfare","executive-welfare","users",[
        ["Fund balance",money(e.welfare.fundBalance)],["Emergency requests",e.welfare.pending],["Approved requests",e.welfare.approved],
        ["Pending requests",e.welfare.pending],["Monthly contributions",money(e.welfare.monthlyContributions)]])}
      ${executiveHealthCard("Audit","executive-audit","audit",[
        ["Open audit issues",e.audit.open],["Resolved issues",e.audit.resolved],["Departments under review",e.audit.departmentsUnderReview],
        ["Compliance",`${e.audit.compliance}%`]])}
      ${executiveHealthCard("Legal","executive-legal","file",[
        ["Contracts awaiting review",e.legal.contracts],["Cases open",e.legal.open_cases],["Policies pending",e.legal.policies],
        ["Compliance alerts",e.legal.alerts]])}
      ${executiveHealthCard("Supervisory","executive-supervisory","shield",[
        ["Department performance",`${e.performance.supervisory}%`],["Recommendations",e.supervisory.recommendations],
        ["Pending follow-ups",e.supervisory.followups],["Departments below target",e.supervisory.departmentsBelowTarget]])}
    </div>
    <div class="exec-bottom-grid">${executiveNotificationsWidget(e.notifications.slice(0,6))}${executiveCalendarWidget(e.meetings.slice(0,7))}</div>
    ${executiveQuickPanel()}`;
}
function executiveStatCard(label,value,icon,target,note,index) {
  const colors=["blue","green","violet","orange","red","teal"];
  return `<button type="button" class="exec-stat-card" data-executive-page="${target}" aria-label="Open ${escapeHtml(label)} details" title="Open ${escapeHtml(label)} details"><span class="exec-stat-icon ${colors[index%colors.length]}">${icons[icon]||icons.dashboard}</span><span><small>${label}</small><strong>${value}</strong><em>${note}</em></span><b>&gt;</b></button>`;
}
function executivePerformanceWidget(e) {
  const labels={executive:"Executive",finance:"Finance",credits:"Credits",investment:"Investment",welfare:"Welfare",legal:"Legal",audit:"Audit",supervisory:"Supervisory"};
  const sources=e.performanceSource||{};
  return `<section class="exec-panel exec-performance"><div class="exec-panel-head"><div><h3>Organization Performance</h3><p>Live operational scores — official assessments override when recorded</p></div><button data-executive-page="departments">View departments ></button></div>
    <div class="exec-performance-list">${Object.entries(e.performance).map(([key,value])=>{const score=Number(value)||0,live=sources[key]==="live";return `<div><div><span>${labels[key]||key}</span><strong>${score}%${live?`<em class="exec-perf-live">Live</em>`:""}</strong></div><div class="exec-track"><i class="${score<80?"low":score<88?"watch":""}" style="width:${Math.max(2,score)}%"></i></div></div>`;}).join("")}</div></section>`;
}
function executiveApprovalWidget(items) {
  const pendingDocuments=(state.executive?.documents||[]).filter(d=>d.status==="pending_executive");
  const merged=[
    ...pendingDocuments.map(d=>({id:`doc-${d.id}`,department:d.department||"Legal",title:d.title,amount:null,activityType:"document-publication",documentId:d.id,isDocument:true})),
    ...items
  ];
  const row=item=>{
    if(item.isDocument){
      return `<div><div class="exec-approval-copy"><span class="exec-type">${escapeHtml(item.department)}</span><strong>${escapeHtml(item.title)}</strong><small>Document publication</small></div><div><button class="approve" data-document-publication="${item.documentId}" data-decision="approve">Publish</button><button class="reject" data-document-publication="${item.documentId}" data-decision="reject">Return</button><button data-executive-page="executive-approvals">Open</button></div></div>`;
    }
    if(item.recordType==="loan"){
      const loanId=item.loanId||item.id;
      const canDecide=Boolean(item.canCurrentUserDecide)||(item.pendingReviewers||[]).some(r=>Number(r.userId)===Number(state.user?.id));
      return `<div><div class="exec-approval-copy"><span class="exec-type">${escapeHtml(item.department)}</span><strong>${escapeHtml(item.title)}</strong><small>${item.amount?money(item.amount):"Loan authorization"}</small></div><div>${canDecide?`<button type="button" class="approve" data-exec-loan-decision="${loanId}" data-decision="authorize">Approve</button><button type="button" class="reject" data-exec-loan-decision="${loanId}" data-decision="reject">Reject</button>`:`<span class="maker-checker-note">Pending your committee vote</span>`}<button type="button" data-loan-detail-id="${loanId}">Details</button></div></div>`;
    }
    return `<div><div class="exec-approval-copy"><span class="exec-type">${escapeHtml(item.department)}</span><strong>${escapeHtml(item.title)}</strong><small>${item.amount?money(item.amount):String(item.activityType||"").replaceAll("-"," ")}</small></div><div><button class="approve" data-exec-decision="${item.id}" data-decision="approve">Approve</button><button class="reject" data-exec-decision="${item.id}" data-decision="reject">Reject</button><button data-exec-details="${item.id}">Details</button></div></div>`;
  };
  return `<section class="exec-panel exec-approval-widget"><div class="exec-panel-head"><div><h3>Pending Approvals</h3><p>Major decisions requiring authority</p></div><button data-executive-page="executive-approvals">View all ></button></div>
    <div class="exec-approval-list">${merged.length?merged.slice(0,6).map(row).join(""):`<div class="exec-empty">No executive approvals are waiting.</div>`}</div></section>`;
}
function executiveActivityWidget(items) {
  const verbs={finance:"recorded finance activity",credits:"updated the loan portfolio",investment:"updated a project",legal:"reviewed a legal record",welfare:"reviewed welfare support",supervisory:"submitted an assurance update",executive:"updated an executive record"};
  return `<section class="exec-panel"><div class="exec-panel-head"><div><h3>Department Activity</h3><p>Latest verified updates</p></div><button data-executive-page="departments">All activity &gt;</button></div><div class="exec-activity-feed">${items.map((item,i)=>`<div><i class="dot-${i%6}"></i><span><strong>${item.department}</strong> ${verbs[item.departmentCode]||"updated an activity"}<small>${escapeHtml(item.title)} - ${new Date(item.createdAt).toLocaleDateString()}</small></span></div>`).join("")}</div></section>`;
}
function executiveFinancialWidget(e) {
  const months=e.monthly||[];
  const max=Math.max(...months.flatMap(m=>[m.income,m.expenses]),1);
  const net=Number(e.stats?.netBalance||0);
  const cashFlowLabel=net>0?"Positive":net<0?"Negative":"Balanced";
  const cashFlowClass=net>=0?"positive":"negative";
  return `<section class="exec-panel exec-financial"><div class="exec-panel-head"><div><h3>Financial Overview</h3><p>Monthly income, expenses and cash flow (UGX millions)</p></div><button data-executive-page="executive-finance">Full summary ></button></div>
    <div class="exec-finance-summary"><span>Net balance<strong>${money(e.stats.netBalance)}</strong></span><span>Budget used<strong>${e.finance.budgetUtilization}%</strong></span><span>Cash flow<strong class="${cashFlowClass}">${cashFlowLabel}</strong></span></div>
    <div class="exec-bar-chart">${months.length?months.map(m=>`<div><div class="exec-bars"><i style="height:${m.income/max*100}%"></i><i class="expense" style="height:${m.expenses/max*100}%"></i></div><span>${m.month}</span></div>`).join(""):`<div class="exec-empty">No monthly history yet.</div>`}</div><div class="exec-legend"><span><i></i>Income</span><span><i class="expense"></i>Expenses</span></div></section>`;
}
function executiveHealthCard(title,target,icon,rows) {
  return `<button class="exec-health-card" data-executive-page="${target}"><div class="exec-health-head"><span>${icons[icon]}</span><h3>${title}</h3><b>&gt;</b></div>${rows.map(([label,value])=>`<div class="exec-health-row"><span>${label}</span><strong>${value}</strong></div>`).join("")}</button>`;
}
function executiveNotificationsWidget(items) {
  return `<section class="exec-panel"><div class="exec-panel-head"><div><h3>Notifications</h3><p>Important executive alerts</p></div><button data-executive-page="notifications">View all ></button></div><div class="exec-notification-list">${items.map(n=>`<div><span>${icons.bell}</span><div><strong>${n.title}</strong><small>${n.detail} - ${relativeTime(n.createdAt||n.time)}</small></div></div>`).join("")}</div></section>`;
}
function executiveCalendarWidget(items) {
  return `<section class="exec-panel"><div class="exec-panel-head"><div><h3>Organization Calendar</h3><p>Upcoming meetings and deadlines</p></div><button data-executive-page="executive-meetings">Open calendar &gt;</button></div><div class="exec-calendar-list">${items.map(m=>{const date=new Date(m.scheduledAt);return `<div><time><strong>${date.getDate()}</strong><span>${date.toLocaleString("en",{month:"short"})}</span></time><div><strong>${m.title}</strong><small>${m.meetingType} - ${m.venue||"Venue pending"}</small></div><b>${date.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</b></div>`}).join("")}</div></section>`;
}
function executiveQuickPanel() {
  return `<div class="exec-floating"><button class="exec-fab" data-action="executive-quick">${icons.plus}<span>Quick Actions</span></button>${state.execQuickOpen?`<div class="exec-quick-menu">
    <button data-executive-page="executive-approvals">${icons.approvals}Approve requests</button><button data-action="schedule-meeting">${icons.clock}Schedule meeting</button>
    <button data-action="new-channel">${icons.bell}Send announcement</button><button data-executive-page="executive-reports">${icons.reports}Generate report</button>
    <button data-executive-page="notifications">${icons.bell}Urgent notifications</button><button data-action="assign-task">${icons.users}Assign task</button>
    <button data-executive-page="executive-meetings">${icons.clock}Organization calendar</button></div>`:""}</div>`;
}
function executiveDepartmentsView() {
  const e=state.executive;
  const modules=[
    ["executive","Executive Department","Strategy and authority","Pending approvals",e.stats.pendingApprovals,"Upcoming meetings",e.stats.upcomingMeetings,e.performance.executive,"dashboard","blue",null],
    ["finance","Finance Department","Budgets and finances","Income this month",money(e.stats.organizationIncome),"Expenses",money(e.stats.organizationExpenditure),e.performance.finance,"executive-finance","green","finance"],
    ["credits","Credits Department (SACCO)","Savings, loans and credit","Total savings",money(e.stats.totalSavings),"Outstanding loans",money(e.stats.outstandingLoans),e.performance.credits,"executive-credits","blue","credits"],
    ["investment","Investment Department","Ventures and projects","Active projects",e.investment.running,"Expected returns",money(e.investment.expected_return),e.performance.investment,"executive-investments","violet","investment"],
    ["welfare","Welfare Department","Member welfare support","Fund balance",money(e.welfare.fundBalance),"Pending requests",e.welfare.pending,e.performance.welfare,"executive-welfare","orange","welfare"],
    ["legal","Legal Department","Contracts and compliance","Active cases",e.legal.open_cases,"Contracts under review",e.legal.contracts,e.performance.legal,"executive-legal","red","legal"],
    ["audit","Audit Department","Financial integrity","Open audit issues",e.audit.open,"Compliance score",`${Math.round(Number(e.audit.compliance)||0)}%`,e.performance.audit,"executive-audit","teal","audit"],
    ["supervisory","Supervisory Department","Oversight and accountability","Pending follow-ups",e.supervisory.followups,"Department compliance",`${e.performance.supervisory}%`,e.performance.supervisory,"executive-supervisory","amber","supervisory"]
  ];
  const totalDepartments=e.departments.length,activeDepartments=e.departments.length;
  const scores=modules.map(module=>Number(module[7]||0));
  const performingWell=scores.filter(score=>score>=85).length,needAttention=scores.filter(score=>score<85).length;
  return `<div class="exec-dept-top"><div class="exec-mini-stat"><span>${icons.building}</span><div><small>Total Departments</small><strong>${totalDepartments}</strong><em>Active organization arms</em></div></div>
    <div class="exec-mini-stat"><span class="green">${icons.check}</span><div><small>Active Departments</small><strong>${activeDepartments}</strong><em>${activeDepartments===totalDepartments?"100% active":`${totalDepartments-activeDepartments} inactive`}</em></div></div>
    <div class="exec-mini-stat"><span class="violet">${icons.reports}</span><div><small>Performing Well</small><strong>${performingWell}</strong><em>85% or above</em></div></div>
    <div class="exec-mini-stat"><span class="orange">${icons.info}</span><div><small>Need Attention</small><strong>${needAttention}</strong><em>Below 85% target</em></div></div></div>
    <div class="exec-department-layout"><div class="exec-department-cards">${modules.map(m=>`<article class="exec-department-card"><div class="exec-dept-title"><span class="${m[9]}">${icons[departmentIcon(m[0])]}</span><div><h3>${m[1]}</h3><p>${m[2]}</p></div></div><div class="exec-dept-values"><div><small>${m[3]}</small><strong>${m[4]}</strong><small>${m[5]}</small><strong>${m[6]}</strong></div><div class="exec-ring" style="--score:${m[7]}"><span>${m[7]}%</span></div></div><div class="exec-dept-actions"><button data-executive-page="${m[8]}">View summary <b>&gt;</b></button></div></article>`).join("")}</div>${executivePerformanceWidget(e)}</div>
    <div class="exec-panel exec-dept-chart"><div class="exec-panel-head"><div><h3>Department Performance Chart</h3><p>Live scores from current operations</p></div></div><div class="exec-wide-bars">${modules.map(m=>`<div><div><i style="height:${Math.max(2,Number(m[7]||0))}%"></i></div><span>${m[0]} - ${m[7]}%</span></div>`).join("")}</div></div>`;
}
function executiveModuleView(module) {
  const e=state.executive;
  if(module==="finance") return executiveFinanceSummary(e);
  if(module==="credits") {
    const active=(e.recentLoans||[]).filter(x=>["active","overdue"].includes(x.status));
    return `<div class="exec-module-metrics">${executiveModuleMetric("Total savings",money(e.stats.totalSavings),"green")}${executiveModuleMetric("Outstanding loans",money(e.stats.outstandingLoans),"red")}${executiveModuleMetric("Active loans",e.loans.active,"blue")}${executiveModuleMetric("Recovery rate",`${e.loans.recoveryRate}%`,"violet")}</div>
      ${executiveRecordTable("Active and recent loans by Legal-registered member",["Loan","Member","Product","Amount","Balance","Status"],e.recentLoans.map(x=>[x.reference,x.member,x.product,money(x.amount),money(x.balance),status(x.status)]))}
      ${active.length?`<section class="exec-panel"><div class="exec-panel-head"><div><h3>Borrowers needing follow-up</h3><p>People currently holding active SACCO facilities</p></div></div><div class="credits-loan-list">${active.map(x=>`<article><div class="credits-loan-main"><span>${escapeHtml(x.reference)}</span><h3>${escapeHtml(x.member)}</h3><p>${escapeHtml(x.product)}</p></div><div><strong>${money(x.amount)}</strong><small>Balance ${money(x.balance)}</small></div>${status(x.status)}</article>`).join("")}</div></section>`:""}`;
  }
  if(module==="investments") return executiveProjectsView();
  if(module==="welfare") return `<div class="exec-module-metrics">${executiveModuleMetric("Fund balance",money(e.welfare.fundBalance),"green")}${executiveModuleMetric("Pending requests",e.welfare.pending,"orange")}${executiveModuleMetric("Approved requests",e.welfare.approved,"blue")}${executiveModuleMetric("Monthly contributions",money(e.welfare.monthlyContributions),"violet")}</div>${executiveRecordTable("Welfare request summary",["Reference","Member","Request","Amount","Status"],e.welfareRequests.map(x=>[x.reference,x.member,x.requestType,money(x.amount),status(x.status)]))}`;
  if(["legal","audit","supervisory"].includes(module)) {
    const rows=e.governance.filter(x=>module==="legal"?x.departmentCode==="legal":x.departmentCode==="supervisory"&&(module==="audit"?x.recordType==="audit":true));
    const title=module==="legal"?"Legal cases, contracts and policies":module==="audit"?"Audit issues":"Supervisory recommendations and follow-ups";
    return `<div class="exec-module-metrics">${executiveModuleMetric("Open items",rows.filter(x=>x.status==="open").length,"red")}${executiveModuleMetric("Resolved",rows.filter(x=>x.status==="resolved").length,"green")}${executiveModuleMetric("High priority",rows.filter(x=>x.severity==="high").length,"orange")}${executiveModuleMetric("Performance",`${e.performance[module]}%`,"blue")}</div>${executiveRecordTable(title,["Reference","Type","Title","Severity","Status"],rows.map(x=>[x.reference,x.recordType,x.title,x.severity||"?",status(x.status)]))}`;
  }
  return executiveDashboardView();
}
function executiveFinanceSummary(e) {
  const f=e.finance,c=f.cashPosition||{},accounts=f.accounts||[];
  return `<div class="exec-module-metrics executive-finance-metrics">
    ${executiveModuleMetric("Organization income",money(e.stats.organizationIncome),"green")}
    ${executiveModuleMetric("Expenditure",money(e.stats.organizationExpenditure),"red")}
    ${executiveModuleMetric("Net balance",money(e.stats.netBalance),"blue")}
    ${executiveModuleMetric("Budget utilized",`${f.budgetUtilization}%`,"violet")}
    ${executiveModuleMetric("Bank balance",money(c.bankBalance||0),"green")}
    ${executiveModuleMetric("Cash & petty cash",money((c.cashBalance||0)+(c.pettyCash||0)),"orange")}
    ${executiveModuleMetric("Restricted funds",money(c.restrictedFunds||0),"violet")}
    ${executiveModuleMetric("Pending payments",money(f.pending_payments||0),"red")}
  </div>
  <section class="exec-panel executive-account-summary"><div class="exec-panel-head"><div><h3>Bank, Cash &amp; Fund Accounts</h3><p>Read-only Finance summary - account numbers are masked and credentials are never exposed</p></div><span class="executive-readonly-badge">${icons.shield} Read only</span></div>
    <div class="executive-account-overview"><span>Registered accounts<strong>${accounts.length}</strong></span><span>Available funds<strong>${money(c.availableFunds||0)}</strong></span><span>Approved budget<strong>${money(f.budgetAllocated||0)}</strong></span><span>Budget used<strong>${money(f.budgetUsed||0)}</strong></span></div>
    <div class="executive-account-grid">${accounts.length?accounts.map(account=>`<article><div class="executive-account-icon">${account.accountType==="bank"?icons.building:icons.wallet}</div><div class="executive-account-title"><span>${escapeHtml(String(account.accountType||"account").replaceAll("_"," "))}</span><h4>${escapeHtml(account.accountName)}</h4><p>${escapeHtml(account.bankName||"Organization funds")} ${account.maskedAccountNumber?`? ${escapeHtml(account.maskedAccountNumber)}`:""}</p></div><strong>${money(account.balance)}</strong><div class="executive-account-meta"><span class="status ${account.restricted?"pending":"active"}">${account.restricted?"Restricted":"Available"}</span><small>${account.lastReconciledAt?`Reconciled ${new Date(account.lastReconciledAt).toLocaleDateString()}`:"Not yet reconciled"}</small></div></article>`).join(""):`<div class="exec-empty">Finance has not registered any bank, cash or fund accounts yet.</div>`}</div>
  </section>${executiveFinancialWidget(e)}${executiveRecordTable("Major finance entries",["Reference","Category","Description","Amount","Status"],e.financeEntries.map(x=>[x.reference,x.category,x.description,money(x.amount),status(x.status)]))}`;
}
function executiveModuleMetric(label,value,color) { return `<div class="exec-module-metric ${color}"><small>${label}</small><strong>${value}</strong><span>Executive summary</span></div>`; }
function executiveRecordTable(title,headers,rows) {
  return `<section class="exec-panel exec-table-panel"><div class="exec-panel-head"><div><h3>${title}</h3><p>Summary view?operational entry remains with the responsible department</p></div></div><div class="table-scroll"><table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.length?rows.map(r=>`<tr>${r.map(v=>`<td>${v}</td>`).join("")}</tr>`).join(""):`<tr><td colspan="${headers.length}">No records found.</td></tr>`}</tbody></table></div></section>`;
}
function executiveApprovalsView() {
  const items=state.executive.approvals||[],history=state.executive.approvalHistory||[];
  const pendingDocuments=(state.executive.documents||[]).filter(d=>d.status==="pending_executive");
  const waitingCount=items.length+pendingDocuments.length;
  const groups=[["Large Loans","large-loan"],["Document Publications","documents"],["Department Budgets","finance-budget"],["Large Payments","finance-payment"],["Investment Proposals","investment-proposal"],["Major Welfare Requests","welfare-request"],["Contract Signing","legal-contract"],["Policy Changes","policy"]];
  const itemTime=item=>new Date(item?.createdAt||item?.updatedAt||0).getTime()||0;
  const newestAt=list=>Array.isArray(list)&&list.length?list.reduce((max,item)=>Math.max(max,itemTime(item)),0):0;
  const byNewest=(a,b)=>itemTime(b)-itemTime(a)||Number(b.id||b.loanId||0)-Number(a.id||a.loanId||0);
  const row=x=>{
    const canDecide=Boolean(x.canCurrentUserDecide)||(x.recordType==="loan"&&(x.pendingReviewers||[]).some(r=>Number(r.userId)===Number(state.user?.id)));
    return x.recordType==="loan"?`<div class="exec-approval-row executive-loan-approval"><div><span>${x.reference} - ${x.department}</span><strong>${escapeHtml(x.title)}</strong><p>${escapeHtml(x.description||"")}</p><small>${x.approvalProgress?`${x.approvalProgress.approvedCount}/${x.approvalProgress.requiredCount} Executive approvals recorded. Any remaining Executive member may decide. Credits already cleared this loan.`:`Credits already cleared this loan.`}</small></div><div class="exec-loan-actions">${x.amount?`<b>${money(x.amount)}</b>`:""}${status(x.status)}<button type="button" data-loan-detail-id="${x.loanId||x.id}">View details</button>${canDecide?`<button type="button" class="approve" data-exec-loan-decision="${x.loanId||x.id}" data-decision="authorize">Approve loan</button><button type="button" class="more" data-exec-loan-decision="${x.loanId||x.id}" data-decision="return">Request information</button><button type="button" class="reject" data-exec-loan-decision="${x.loanId||x.id}" data-decision="reject">Reject</button>`:`<span class="maker-checker-note">${(x.pendingReviewers||[]).length?`You already decided, or ${ (x.pendingReviewers||[]).length} other reviewer${(x.pendingReviewers||[]).length===1?"":"s"} still pending`:`Awaiting committee`}</span>`}</div></div>`:`<div class="exec-approval-row"><div><span>${x.reference} - ${x.department}</span><strong>${escapeHtml(x.title)}</strong><p>${escapeHtml(x.description||"")}${x.assignedTo?` - Reviewer: ${escapeHtml(x.assignedTo)}`:""}</p></div><div>${x.amount?`<b>${money(x.amount)}</b>`:""}${status(x.status)}<button type="button" data-exec-details="${x.id}">View details</button><button type="button" data-exec-reviewer="${x.id}">Assign reviewer</button><button type="button" class="approve" data-exec-decision="${x.id}" data-decision="approve">Approve</button><button type="button" class="more" data-exec-decision="${x.id}" data-decision="more_information">Request information</button><button type="button" class="reject" data-exec-decision="${x.id}" data-decision="reject">Reject</button></div></div>`;
  };
  const documentRows=pendingDocuments.slice().sort(byNewest).map(d=>`<div class="exec-approval-row executive-document-approval"><div><span>${escapeHtml(d.reference)} - ${escapeHtml(d.department||"Legal")}</span><strong>${escapeHtml(d.title)}</strong><p>${escapeHtml(d.documentType)} - Version ${escapeHtml(d.version)} awaiting Executive publication approval.</p></div><div>${status(d.status)}${d.hasFile?`<div class="document-actions"><a href="/api/documents/${d.id}/view" target="_blank" title="View document">${icons.eye}<span>View</span></a><a href="/api/documents/${d.id}/download" title="Download document">${icons.download}</a></div>`:`<span class="status pending no-file-badge">No file</span>`}<button class="approve" data-document-publication="${d.id}" data-decision="approve">Publish</button><button class="more" data-document-publication="${d.id}" data-decision="reject">Return</button></div></div>`);
  const sections=groups.map(([label,type])=>{
    if(type==="documents")return{label,type,count:pendingDocuments.length,freshness:newestAt(pendingDocuments),empty:`No document publications are waiting.`,body:documentRows.length?documentRows.join(""):null,subtitle:`${pendingDocuments.length} document${pendingDocuments.length===1?"":"s"} awaiting Executive publication`};
    const list=items.filter(x=>x.activityType===type).slice().sort(byNewest);
    return{label,type,count:list.length,freshness:newestAt(list),empty:`No ${label.toLowerCase()} are waiting.`,body:list.length?list.map(row).join(""):null,subtitle:`${list.length} item${list.length===1?"":"s"} awaiting executive decision`};
  }).sort((a,b)=>(b.count>0)-(a.count>0)||b.freshness-a.freshness||groups.findIndex(g=>g[1]===a.type)-groups.findIndex(g=>g[1]===b.type));
  return `<div class="exec-approval-summary">${executiveModuleMetric("Waiting now",waitingCount,"red")}${executiveModuleMetric("High-value requests",items.filter(x=>x.amount>=10000000).length,"orange")}${executiveModuleMetric("Document publications",pendingDocuments.length,"violet")}${executiveModuleMetric("Decision trail","Fully audited","green")}</div><div class="exec-approval-page">${sections.map(s=>`<section class="exec-panel"><div class="exec-panel-head"><div><h3>${s.label}</h3><p>${s.subtitle}</p></div></div>${s.body||`<div class="exec-empty">${s.empty}</div>`}</section>`).join("")}</div>${executiveApprovalHistory(history)}`;
}function executiveApprovalHistory(history) {
  const approved=history.filter(x=>x.status==="approved").length,rejected=history.filter(x=>x.status==="rejected").length,returned=history.filter(x=>x.status==="information_requested").length;
  return `<section class="exec-panel exec-approval-history"><div class="exec-panel-head"><div><h3>Approval History</h3><p>Permanent record of Executive requests, loan authorizations and responsible officers</p></div><div class="exec-history-counts"><span>${approved} approved</span><span>${rejected} rejected</span><span>${returned} information requests</span></div></div><div class="table-scroll"><table><thead><tr><th>Reference</th><th>Request</th><th>Requested by</th><th>Requested on</th><th>Decision</th><th>Decision by</th><th>Decision date</th><th>Action</th></tr></thead><tbody>${history.length?history.map(item=>`<tr><td><strong>${escapeHtml(item.reference)}</strong><small>${escapeHtml(item.department)}</small></td><td><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(String(item.activityType||"").replaceAll("-"," "))}${item.amount?` - ${money(item.amount)}`:""}</small></td><td>${escapeHtml(item.createdBy||"—")}</td><td>${item.createdAt?new Date(item.createdAt).toLocaleString():"—"}</td><td><span class="status ${item.status}">${escapeHtml(String(item.status||"").replaceAll("_"," "))}</span></td><td>${escapeHtml(item.decisionBy||(item.recordType==="loan"?"See loan process":"Recorded in audit log"))}</td><td>${item.decisionAt?new Date(item.decisionAt).toLocaleString():"—"}</td><td><button class="mini-btn" data-${item.recordType==="loan"?"loan-detail-id":"exec-details"}="${item.loanId||item.id}" title="View full process">${icons.eye}</button></td></tr>`).join(""):`<tr><td colspan="8">No Executive decisions have been recorded yet.</td></tr>`}</tbody></table></div></section>`;
}
function executiveMeetingsView() {
  return `<div class="exec-calendar-page">${state.executive.meetings.map(m=>{const d=new Date(m.scheduledAt);return `<article><time><strong>${d.getDate()}</strong><span>${d.toLocaleString("en",{month:"long"})}</span><em>${d.getFullYear()}</em></time><div><span>${m.meetingType} - ${m.department||"Organization-wide"}</span><h3>${m.title}</h3><p>${m.agenda||"Agenda pending"}</p><small>${icons.clock}${d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})} - ${m.venue||"Venue pending"}</small></div><button data-action="meeting-details" data-id="${m.id}">View details ></button></article>`}).join("")}</div>`;
}
function executiveProjectsView() {
  const e=state.executive;
  const projects=e.investmentProjects||[],atRisk=projects.filter(p=>["watch","losing","underperforming"].includes(p.performanceStatus)||p.status==="suspended").length;
  return `<div class="exec-module-metrics">${executiveModuleMetric("Active projects",projects.filter(p=>["active","running","construction"].includes(p.status)).length,"blue")}${executiveModuleMetric("Current value",money(e.investment.current_value),"green")}${executiveModuleMetric("Expected returns",money(e.investment.expected_return),"violet")}${executiveModuleMetric("Need attention",atRisk,"orange")}</div>
    <section class="exec-panel executive-project-note"><div>${icons.shield}<div><strong>Executive project governance</strong><span>Monitor results, review evidence, record strategic comments, escalate concerns, and control suspension or closure. Operational editing remains with Investment.</span></div></div></section>
    <div class="exec-project-grid executive-governance-projects">${projects.map(p=>{const utilization=p.targetAmount?Math.round(p.expenses/p.targetAmount*100):0,profit=Number(p.profit||0);return `<article class="exec-project-card"><div><span>${p.reference} - ${escapeHtml(p.category||"Investment")}</span>${status(p.status)}</div><h3>${escapeHtml(p.name)}</h3><p>${escapeHtml(p.description)}</p><div class="executive-project-meta"><span>Manager<strong>${escapeHtml(p.manager||"Not assigned")}</strong></span><span>Location<strong>${escapeHtml(p.location||"Not recorded")}</strong></span><span>Completion<strong>${Number(p.progress||0)}%</strong></span><span>Performance<strong>${escapeHtml(String(p.performanceStatus||"unrated").replaceAll("_"," "))}</strong></span></div>${progress("Project completion",`${p.progress||0}%`,p.progress||0,p.progress<50?"amber":"lime")}${progress("Budget spent",`${utilization}%`,Math.min(100,utilization),utilization>=80?"amber":"blue")}<div><span>Current value<strong>${money(p.currentValue)}</strong></span><span>Net position<strong class="${profit>=0?"positive":"negative"}">${money(profit)}</strong></span></div><small class="executive-project-proposal">${p.proposalReference?`Approved proposal ${escapeHtml(p.proposalReference)}`:"Legacy project - no linked proposal"}</small><button data-executive-project="${p.id}">${icons.eye} Open governance summary</button></article>`}).join("")||`<section class="exec-panel exec-empty">No investment projects have been registered.</section>`}</div>`;
}
async function openExecutiveProject(id) {
  try{
    const data=await api(`/api/executive/projects/${id}`),p=data.project,profit=Number(p.profit||0);
    closeModal();document.body.insertAdjacentHTML("beforeend",`<div class="modal-backdrop" id="modal-backdrop"><div class="modal executive-project-modal"><div class="modal-head"><div><h2>${escapeHtml(p.name)}</h2><p>${p.reference} - Executive governance summary</p></div><button class="modal-close" data-close>${icons.x}</button></div><div class="executive-project-detail">
      ${p.photoUrl?`<img class="executive-project-hero" src="${p.photoUrl}" alt="${escapeHtml(p.name)}">`:""}<div class="executive-project-kpis"><span>Budget<strong>${money(p.budget)}</strong></span><span>Spent<strong>${money(p.expenses)}</strong></span><span>Revenue<strong>${money(p.revenue)}</strong></span><span>Net position<strong class="${profit>=0?"positive":"negative"}">${money(profit)}</strong></span><span>ROI<strong>${p.roi}%</strong></span><span>Progress<strong>${p.progress}%</strong></span></div>
      <div class="executive-project-columns"><section><h3>Project profile</h3><p>${escapeHtml(p.description)}</p><dl><dt>Status</dt><dd>${status(p.status)}</dd><dt>Manager</dt><dd>${escapeHtml(p.manager||"Not assigned")}</dd><dt>Location</dt><dd>${escapeHtml(p.location||"Not recorded")}</dd><dt>Period</dt><dd>${p.startsOn?new Date(p.startsOn).toLocaleDateString():"Not set"} - ${p.endsOn?new Date(p.endsOn).toLocaleDateString():"Not set"}</dd><dt>Funding</dt><dd>${escapeHtml(p.fundingSource||"Not recorded")}</dd><dt>Budget utilization</dt><dd>${p.budgetUtilization}%</dd></dl></section><section><h3>Approval and risk</h3><dl><dt>Proposal</dt><dd>${escapeHtml(p.proposalReference||"Legacy project")}</dd><dt>Approved by</dt><dd>${escapeHtml(p.proposalApprovedBy||"Historical record")}</dd><dt>Approved on</dt><dd>${p.proposalApprovedAt?new Date(p.proposalApprovedAt).toLocaleString():"Not recorded"}</dd><dt>Risk assessment</dt><dd>${escapeHtml(p.riskAssessment||"Not recorded")}</dd><dt>Finance analysis</dt><dd>${escapeHtml(p.financeAnalysis||"Not recorded")}</dd><dt>Finance recommendation</dt><dd>${escapeHtml(p.financeRecommendation||"Not recorded")}</dd></dl>${p.supportingDocument?`<a class="button secondary" href="${p.supportingDocument}" target="_blank">${icons.file} View supporting evidence</a>`:"<p>No project evidence uploaded.</p>"}</section></div>
      <section class="executive-project-related"><h3>Related records</h3><div><span>Transactions<strong>${data.transactions.length}</strong></span><span>Contracts<strong>${data.contracts.length}</strong></span><span>Assets<strong>${data.assets.length}</strong></span></div></section>
      <section><h3>Executive oversight history</h3><div class="executive-oversight-list">${data.oversight.map(o=>`<article><div>${status(o.actionType)}</div><strong>${escapeHtml(o.createdBy)}</strong><span>${new Date(o.createdAt).toLocaleString()}${o.targetDepartment?` - ${escapeHtml(o.targetDepartment)}`:""}</span><p>${escapeHtml(o.comment)}</p></article>`).join("")||`<div class="exec-empty">No Executive oversight actions recorded yet.</div>`}</div></section>
      <div class="executive-project-actions"><button data-project-action="comment">Add strategic comment</button><button data-project-action="escalate">Escalate concern</button>${p.status==="suspended"?`<button class="approve" data-project-action="reactivate">Reactivate</button>`:!(["completed"].includes(p.status))?`<button class="more" data-project-action="suspend">Suspend</button>`:""}${p.status!=="completed"?`<button class="reject" data-project-action="close">Authorize closure</button>`:""}</div></div></div></div>`);
    document.querySelector("[data-close]").onclick=closeModal;
    document.querySelectorAll("[data-project-action]").forEach(button=>button.onclick=()=>executiveProjectAction(p.id,button.dataset.projectAction));
  }catch(error){toast(error.message);}
}
async function executiveProjectAction(id,action){
  let targetDepartment=null;
  if(action==="escalate"){const choice=await promptDialog("Escalate to which department? Enter Audit, Legal, or Supervisory:","Audit");if(choice===null)return;targetDepartment=choice.trim().toLowerCase();}
  const labels={comment:"Strategic comment",suspend:"Reason for suspending this project",reactivate:"Reason for reactivating this project",close:"Final verification and reason for closure",escalate:"Describe the concern and required investigation"};
  const comment=await promptDialog(`${labels[action]}:`,"");if(!comment)return;
  if(action!=="comment"&&action!=="escalate"&&!await confirmDialog(`${action} this project? This Executive decision will be permanently audited.`))return;
  try{await api(`/api/executive/projects/${id}/actions`,{method:"POST",body:JSON.stringify({action,comment,targetDepartment})});closeModal();state.executive=await api("/api/executive/command-center");render();toast(`Executive project action recorded: ${action}.`);}catch(error){toast(error.message);}
}
function executiveReportsView() {
  const reports=[["Governance Structure Report","Board, EXCO and committee appointments from the Executive Memo"],["FY2026 Historical Financial Statements","Imported draft statements for the year ended 30 June 2026"],["Financial Report","Finance income, expenditure and budget"],["Loan Report","Savings, loans, defaults and recovery"],["Investment Report","Project performance and expected returns"],["Welfare Report","Fund health and support requests"],["Audit Report","Findings, controls and resolution"],["Supervisory Report","Recommendations and departmental follow-up"],["Legal Report","Cases, policies, contracts and alerts"],["Department Performance Report","Performance against organizational targets"],["Executive Report","Complete command-center report"],["Annual Report","Annual organization performance pack"]];
  return `<div class="exec-report-grid">${reports.map(([name,desc],i)=>`<article><span class="${["blue","green","violet","orange","teal"][i%5]}">${icons.file}</span><div><h3>${name}</h3><p>${desc}</p><small>PDF and Excel - Current verified data</small></div><div class="exec-report-actions"><button type="button" data-executive-report-preview="${name}">${icons.eye}Preview</button><button type="button" data-executive-report="${name}">${icons.download}Download</button></div></article>`).join("")}</div>`;
}
function executiveAnalyticsView() {
  const e=state.executive,series=[["Membership Growth","savings","green"],["Monthly Revenue","income","blue"],["Monthly Expenses","expenses","red"],["Loan Growth","loans","orange"],["Savings Growth","savings","violet"],["Investment Growth","investment","teal"]];
  return `<div class="exec-analytics-grid">${series.map(([title,key,color])=>`<section class="exec-panel"><div class="exec-panel-head"><div><h3>${title}</h3><p>Six-month organizational trend</p></div><strong class="trend-up">? ${key==="expenses"?"Controlled":"Growing"}</strong></div><div class="exec-line-chart ${color}">${e.monthly.map((m,i)=>`<div><i style="height:${Math.min(100,(m[key]||m.income)/(Math.max(...e.monthly.map(x=>x[key]||x.income)))*100)}%"></i><span>${m.month}</span></div>`).join("")}</div></section>`).join("")}</div>
    <section class="exec-panel"><div class="exec-panel-head"><div><h3>Department Performance</h3><p>Attendance, budget and goal achievement indicators</p></div></div>${executivePerformanceWidget(e).replace('<section class="exec-panel exec-performance">','<div class="embedded-performance">').replace("</section>","</div>")}</section>`;
}
function executiveNotificationsView() {
  return `<section class="exec-panel"><div class="exec-notification-page">${state.executive.notifications.map(n=>`<article><span>${icons.bell}</span><div><small>${n.type}</small><h3>${n.title}</h3><p>${n.detail}</p></div><time>${relativeTime(n.createdAt||n.time)}</time><button>Mark read</button></article>`).join("")}</div></section>`;
}
function executiveDocumentsView() {
  const types=["Constitution","Policies","Minutes","Signed Contracts","Annual Reports","Audit Reports","Legal Documents"];
  const libraryDocs=(state.executive.documents||[]).filter(d=>d.status!=="pending_executive");
  const pendingCount=(state.executive.documents||[]).filter(d=>d.status==="pending_executive").length;
  return `${pendingCount?`<div class="credits-verification-banner"><div>${icons.info}<span><strong>${pendingCount} document${pendingCount===1?"":"s"} awaiting publication</strong><small>Review and publish them from the Approvals tab.</small></span></div><button class="button small primary" data-executive-page="executive-approvals">Open Approvals</button></div>`:""}<div class="exec-document-groups">${types.map(type=>{const docs=libraryDocs.filter(d=>type==="Minutes"?["Minutes","Board Minutes","Meeting Minutes"].includes(d.documentType):d.documentType===type);return `<section class="exec-panel"><div class="exec-panel-head"><div><h3>${type}</h3><p>${docs.length} official document${docs.length===1?"":"s"}</p></div></div>${docs.map(d=>`<div class="exec-document-row"><span>${icons.file}</span><div class="exec-document-copy"><strong>${escapeHtml(d.title)}</strong><small>${escapeHtml(d.reference)} - Version ${escapeHtml(d.version)} - ${escapeHtml(d.department||"")}</small></div><div class="exec-document-controls">${status(d.status)}${d.hasFile?`<div class="document-actions"><a href="/api/documents/${d.id}/view" target="_blank" title="View document">${icons.eye}<span>View</span></a><a href="/api/documents/${d.id}/download" title="Download document">${icons.download}</a></div>`:`<span class="status pending no-file-badge">No file</span>`}<button type="button" class="document-delete" data-delete-document="${d.id}" data-document-title="${escapeHtml(d.title)}" title="Delete document">${icons.trash}</button></div></div>`).join("")||`<div class="exec-empty">No documents in this category.</div>`}</section>`}).join("")}</div>`;
}
function executiveSettingsView() {
  return `<div class="settings-grid"><div class="card setting-card"><div class="card-head" style="padding:0 0 16px"><div><h2 class="card-title">Executive preferences</h2><p class="card-subtitle">Command-center display and alerts</p></div></div>
    <div class="setting-row"><div class="setting-icon">${icons.bell}</div><div class="setting-copy"><strong>Urgent approval alerts</strong><span>Enabled for large loans, payments, contracts and policies</span></div>${status("active")}</div>
    <div class="setting-row"><div class="setting-icon">${icons.clock}</div><div class="setting-copy"><strong>Meeting reminders</strong><span>Notify 24 hours before executive and board meetings</span></div>${status("active")}</div>
    <div class="setting-row"><div class="setting-icon">${icons.reports}</div><div class="setting-copy"><strong>Weekly performance digest</strong><span>Every Monday at 8:00 AM</span></div>${status("active")}</div></div>
    <div class="card setting-card"><div class="card-head" style="padding:0 0 16px"><div><h2 class="card-title">Authority safeguards</h2><p class="card-subtitle">Read-only policy summary</p></div></div>
    <div class="setting-row"><div class="setting-icon">${icons.shield}</div><div class="setting-copy"><strong>Executive authority level</strong><span>Level 4 - Strategic approvals and organization oversight</span></div></div>
    <div class="setting-row"><div class="setting-icon">${icons.audit}</div><div class="setting-copy"><strong>Decision audit trail</strong><span>Every approval, rejection, comment and reviewer assignment is permanent</span></div></div>
    <div class="setting-row"><div class="setting-icon">${icons.lock}</div><div class="setting-copy"><strong>Operational separation</strong><span>Executive cannot post routine savings, expenses or departmental transactions</span></div></div></div></div>`;
}
function financeDashboardView() {
  const f=state.finance;if(!f)return `<div class="executive-loading">Loading Finance workspace?</div>`;
  const s=f.stats;
  const historical=f.historicalPeriod;
  const cards=[
    [historical?"Cash & Bank at Year End":"Current Bank Balance",money(s.currentBankBalance),"wallet","finance-bank",historical?`FY ${f.selectedFiscalYear} closing balance`:"Organization bank accounts"],
    ["Cash on Hand",money(s.cashOnHand),"savings","finance-bank","Cash and petty cash"],
    [historical?"Financial-year Income":"Total Income (Today)",money(s.incomeToday),"arrowDown","finance-income",historical?`FY ${f.selectedFiscalYear} supplied statement`:"Received today"],
    [historical?"Financial-year Expenses":"Total Expenses (Today)",money(s.expensesToday),"arrowUp","finance-expenses",historical?`FY ${f.selectedFiscalYear} supplied statement`:"Paid today"],
    ["Monthly Income",money(s.monthlyIncome),"receipt","finance-income","This month"],
    ["Monthly Expenses",money(s.monthlyExpenses),"reports","finance-expenses","This month"],
    ["Outstanding Payments",money(s.outstandingPayments),"clock","finance-vouchers","Awaiting completion"],
    ["Pending Payment Requests",s.pendingPaymentRequests,"approvals","finance-approvals","Finance review queue"],
    ["Approved Budget",money(s.approvedBudget),"building","finance-budgets","FY 2026"],
    ["Budget Utilized",`${s.budgetUtilized}%`,"reports","finance-budgets",`${money(s.approvedBudget*s.budgetUtilized/100)} used`],
    ["Total Assets",money(s.totalAssets),"building","finance-assets","Current asset value"],
    ["Total Liabilities",money(s.totalLiabilities),"file","finance-invoices","Open invoices"]
  ];
  const yearOptions=(f.availableFiscalYears||[]).map(y=>`<option value="${y.year}" ${Number(y.year)===Number(f.selectedFiscalYear)?"selected":""}>${escapeHtml(y.label||`FY ending ${y.year}`)}</option>`).join("");
  return `<div class="finance-title-strip"><div><p class="eyebrow">Finance Department</p><h2>Financial control center</h2><p>Organization money only - SACCO savings and loans remain in Credits.</p></div><div class="dashboard-year-control"><label>Financial year</label><select data-finance-fy>${yearOptions}</select></div></div>
    ${financeHistoricalSnapshot(f)}
    <div class="finance-period-heading"><div><strong>Current operations</strong><span>Live receipts, payments and registered cash accounts for the current period</span></div><small>${new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</small></div>
    <div class="finance-stat-grid finance-current-grid">${cards.slice(0,4).map((card,index)=>financeStatCard(...card,index)).join("")}</div>
    ${financePendingEntriesWidget(f)}
    <div class="finance-dashboard-grid">
      ${financeRevenueGraph(f)}
      ${financeBudgetWidget(f)}
      ${financeApprovalWidget(f)}
      ${financeCashPositionWidget(f)}
      ${financeIncomeWidget(f)}
      ${financeExpenseWidget(f)}
    </div>
    <div class="finance-lower-grid">${financeRecentTransactionsWidget(f)}${financeDepartmentSpendingWidget(f)}${financeNotificationsWidget(f)}</div>
    ${financeQuickPanel()}`;
}
function financeHistoricalSnapshot(f) {
  const snapshot=f.financialSnapshot;if(!snapshot)return "";const v=snapshot.values||{},amount=code=>Number(v[code]?.current||0);
  const cards=[
    ["Total income",amount("total_income"),"arrowDown"],["Operating expenses",amount("total_operating_expenses"),"arrowUp"],
    ["Surplus after tax",amount("surplus_after_tax"),"wallet"],["Total assets",amount("total_assets"),"building"],
    ["Total liabilities",amount("total_liabilities"),"file"],["Equity & reserves",amount("total_equity"),"reports"],
    ["Members' savings payable",amount("member_savings"),"savings"],["Unit Trust investment",amount("unit_trust_investment"),"building"],
    ["Cash & bank at year end",amount("cash_bank"),"wallet"]
  ];
  return `<section class="finance-snapshot-block"><div class="finance-period-heading"><div><strong>Imported FY${snapshot.fiscalYear} financial position</strong><span>Draft statements supplied by the organization  -  period ended ${new Date(snapshot.periodEnd).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}</span></div><button class="button secondary small" data-finance-page="finance-reports">View statements</button></div><div class="finance-snapshot-grid">${cards.map(([label,value,icon],index)=>`<button class="finance-snapshot-card" data-finance-page="finance-reports"><span class="${["green","red","blue","violet","orange","teal","purple","green","blue"][index]}">${icons[icon]}</span><div><small>${label}</small><strong>${money(value)}</strong><em>${index===8?"Closing balance":"FY2026 supplied figure"}</em></div></button>`).join("")}</div><p class="finance-snapshot-note">These are historical closing figures. Current cards below change only when Finance records operational accounts, income, expenses, assets or approved payments.</p></section>`;
}
function financeStatCard(label,value,icon,target,note,index) {
  const colors=["blue","green","violet","red","teal","purple","orange","red","blue","green","violet","orange"];
  return `<button class="finance-stat-card" data-finance-page="${target}"><span class="${colors[index]}">${icons[icon]}</span><div><small>${label}</small><strong>${value}</strong><em>${note}</em></div><b>View details ></b></button>`;
}
function financePendingEntriesWidget(f) {
  const rows=(f.pendingEntries||f.entries||[]).filter(x=>x.status==="pending_finance_review");
  if(!rows.length)return "";
  const accountOptions=(f.accounts||[]).map(a=>`<option value="${a.id}">${escapeHtml(a.accountName)} (${money(a.balance)})</option>`).join("");
  return `<section class="finance-panel finance-entry-review"><div class="finance-panel-head"><div><h3>Payments awaiting Finance verification</h3><p>Welfare, investment and subscription receipts that must be posted to an account</p></div><strong>${rows.length} waiting</strong></div>
    <div class="finance-voucher-list">${rows.map(x=>`<article><div class="finance-voucher-main"><span>${escapeHtml(x.reference)} · ${escapeHtml(x.entryType||"")}</span><h3>${escapeHtml(x.category||"Payment")}</h3><p>${escapeHtml(x.description||"")} · ${escapeHtml(x.counterparty||"—")}</p><small>${x.transactionDate?new Date(x.transactionDate).toLocaleDateString():""} · ${escapeHtml(x.recordedBy||"")}</small></div><div class="finance-voucher-value"><strong>${money(x.amount)}</strong>${status(x.status)}</div><div class="finance-voucher-actions">${f.access?.canApprove?`<select data-finance-entry-account="${x.id}"><option value="">Post to account…</option>${accountOptions}</select><button class="approve" data-finance-entry-review="${x.id}" data-decision="approve">Verify &amp; post</button><button class="reject" data-finance-entry-review="${x.id}" data-decision="reject">Reject</button>`:`<span class="maker-checker-note">Awaiting Finance approver</span>`}</div></article>`).join("")}</div></section>`;
}
async function reviewFinanceEntry(id,decision){
  if(!state.finance?.access?.canApprove)return toast("Finance approval authority is required.");
  const accountSelect=document.querySelector(`[data-finance-entry-account="${id}"]`);
  const accountId=accountSelect?Number(accountSelect.value):null;
  if(decision==="approve"&&!accountId)return toast("Choose the Finance account that received or paid this amount.");
  let comment="";
  if(decision==="reject"){comment=await promptDialog("Reason for rejecting this payment verification:","");if(comment===null)return;}
  try{
    await api(`/api/finance/entries/${id}/review`,{method:"POST",body:JSON.stringify({decision,accountId,comment})});
    state.finance=await api("/api/finance/command-center");
    render();
    toast(decision==="approve"?"Payment verified and posted to the selected account.":"Payment verification rejected.");
  }catch(error){toast(error.message);}
}
function financeRevenueGraph(f) {
  const max=Math.max(...f.monthly.flatMap(row=>[row.income,row.expenses]),1);
  return `<section class="finance-panel finance-revenue"><div class="finance-panel-head"><div><h3>Revenue vs Expenses</h3><p>Monthly income, expenses and net position</p></div><button data-finance-page="finance-analytics">View analytics &gt;</button></div>
    <div class="finance-summary-row"><span>Income<strong class="positive">${money(f.stats.monthlyIncome)}</strong></span><span>Expenses<strong class="negative">${money(f.stats.monthlyExpenses)}</strong></span><span>Net position<strong>${money(f.stats.monthlyIncome-f.stats.monthlyExpenses)}</strong></span></div>
    <div class="finance-chart">${f.monthly.length?f.monthly.map(row=>`<div><div><i style="height:${row.income/max*100}%"></i><i class="expense" style="height:${row.expenses/max*100}%"></i></div><span>${row.month}</span></div>`).join(""):`<div class="exec-empty">No financial history recorded yet.</div>`}</div><div class="exec-legend"><span><i></i>Income</span><span><i class="expense"></i>Expenses</span></div></section>`;
}
function financeBudgetWidget(f) {
  return `<section class="finance-panel finance-budget-widget"><div class="finance-panel-head"><div><h3>Budget Utilization by Department</h3><p>FY 2026 approved budgets</p></div><button data-finance-page="finance-budgets">View all ></button></div>
    <div class="finance-budget-table"><div class="head"><span>Department</span><span>Budget</span><span>Used</span><span>Utilization</span></div>${f.budgets.map(b=>`<div><strong>${b.department}</strong><span>${money(b.allocated)}</span><span>${money(b.used)}</span><span><i class="${b.utilization>=100?"danger":b.utilization>=80?"warning":""}" style="width:${Math.min(b.utilization,100)}%"></i><b>${b.utilization}%</b></span></div>`).join("")}</div></section>`;
}
function financeApprovalActions(v,compact=false) {
  if(v.status!=="finance_review"||!state.finance.access.canApprove)return "";
  if(Number(v.requestedById)===Number(state.user.id))return `<span class="maker-checker-note" title="A different authorized Finance user must review this request">Created by you - awaiting another approver</span>`;
  return compact?`<button data-finance-voucher="${v.id}" data-decision="approve">Approve</button>`:`<button class="approve" data-finance-voucher="${v.id}" data-decision="approve">Approve</button><button class="return" data-finance-voucher="${v.id}" data-decision="return">Return</button><button class="reject" data-finance-voucher="${v.id}" data-decision="reject">Reject</button>`;
}
function financeApprovalWidget(f) {
  const items=f.vouchers.filter(v=>v.status==="finance_review").slice(0,5);
  return `<section class="finance-panel"><div class="finance-panel-head"><div><h3>Payment Approvals</h3><p>Routine finance review queue</p></div><button data-finance-page="finance-approvals">View all ></button></div>
    <div class="finance-approval-list">${items.map(item=>`<div><span>${icons.file}</span><div><strong>${item.voucherNumber}</strong><small>${item.supplier} - ${item.category}</small></div><b>${money(item.amount)}</b>${financeApprovalActions(item,true)}</div>`).join("")||`<div class="exec-empty">No vouchers await Finance review.</div>`}</div></section>`;
}
function financeCashPositionWidget(f) {
  const c=f.cashPosition,available=c.bankBalance+c.cashBalance+c.pettyCash;
  const liquidityTotal=available+c.restrictedFunds,liquidity=liquidityTotal?Math.round(c.availableFunds/liquidityTotal*100):0;
  return `<section class="finance-panel"><div class="finance-panel-head"><div><h3>Cash Position</h3><p>Available and restricted organization funds</p></div><button data-finance-page="finance-bank">Accounts ></button></div><div class="finance-position-grid">
    ${[["Bank balance",c.bankBalance],["Cash balance",c.cashBalance],["Petty cash",c.pettyCash],["Available funds",c.availableFunds],["Restricted funds",c.restrictedFunds]].map(([label,value])=>`<div><span>${label}</span><strong>${money(value)}</strong></div>`).join("")}</div>
    ${progress("Available liquidity",`${liquidity}%`,liquidity,"lime")}</section>`;
}
function financeIncomeWidget(f) {
  const max=Math.max(...f.incomeBySource.map(x=>x.amount),1);
  return `<section class="finance-panel"><div class="finance-panel-head"><div><h3>Income by Source</h3><p>Organization revenue - not member savings</p></div><button data-finance-page="finance-income">Income ledger ></button></div><div class="finance-category-list">${f.incomeBySource.map(x=>`<div><span>${x.label}</span><i><b style="width:${x.amount/max*100}%"></b></i><strong>${money(x.amount)}</strong></div>`).join("")}</div></section>`;
}
function financeExpenseWidget(f) {
  const max=Math.max(...f.expensesByCategory.map(x=>x.amount),1);
  return `<section class="finance-panel"><div class="finance-panel-head"><div><h3>Expenses by Category</h3><p>Where organization funds are spent</p></div><button data-finance-page="finance-expenses">Expense ledger ></button></div><div class="finance-category-list expenses">${f.expensesByCategory.map(x=>`<div><span>${x.label}</span><i><b style="width:${x.amount/max*100}%"></b></i><strong>${money(x.amount)}</strong></div>`).join("")}</div></section>`;
}
function financeRecentTransactionsWidget(f) {
  return `<section class="finance-panel"><div class="finance-panel-head"><div><h3>Recent Transactions</h3><p>Latest receipts, payments and journal records</p></div><button data-finance-page="finance-cashbook">View all ></button></div>
    <div class="table-scroll"><table class="finance-compact-table"><thead><tr><th>Date</th><th>Type</th><th>Description</th><th>Category</th><th>Amount</th><th>Status</th></tr></thead><tbody>${f.entries.slice(0,8).map(x=>`<tr><td>${new Date(x.transactionDate).toLocaleDateString()}</td><td>${status(x.entryType==="income"?"receipt":"payment")}</td><td>${x.description}</td><td>${x.category}</td><td class="cell-main">${money(x.amount)}</td><td>${status(x.status)}</td></tr>`).join("")}</tbody></table></div></section>`;
}
function financeDepartmentSpendingWidget(f) {
  return `<section class="finance-panel"><div class="finance-panel-head"><div><h3>Department Spending</h3><p>Utilization and overspending alerts</p></div><button data-finance-page="finance-budgets">Budgets &gt;</button></div><div class="finance-spending-list">${[...f.budgets].sort((a,b)=>b.used-a.used).map(b=>`<div><div><span>${b.department}</span><strong>${money(b.used)}</strong></div><div class="exec-track"><i class="${b.utilization>=100?"low":b.utilization>=80?"watch":""}" style="width:${Math.min(100,b.utilization)}%"></i></div><small>${b.utilization}% of ${money(b.allocated)}</small></div>`).join("")}</div></section>`;
}
function financeNotificationsWidget(f) {
  return `<section class="finance-panel"><div class="finance-panel-head"><div><h3>Notifications</h3><p>Financial alerts requiring attention</p></div></div><div class="finance-notifications">${f.notifications.map(n=>`<div class="${n.level}"><span>${n.level==="success"?icons.check:icons.info}</span><strong>${n.title}</strong><time>${relativeTime(n.createdAt||n.time)}</time></div>`).join("")}</div></section>`;
}
function financeQuickPanel() {
  return `<div class="exec-floating"><button class="exec-fab finance-fab" data-action="finance-quick">${icons.plus}<span>Quick Actions</span></button>${state.financeQuickOpen?`<div class="exec-quick-menu">
    <button data-finance-modal="income">${icons.arrowDown}Record income</button><button data-finance-modal="expense">${icons.arrowUp}Expense request</button>
    <button data-finance-page="finance-approvals">${icons.approvals}Review vouchers</button><button data-finance-modal="invoice">${icons.file}Record invoice</button>
    <button data-finance-report="Financial Statement">${icons.reports}Generate report</button><button data-finance-page="finance-bank">${icons.building}Reconcile bank</button></div>`:""}</div>`;
}
function financeIncomeView() {
  const f=state.finance,rows=f.entries.filter(x=>x.entryType==="income");
  const topSource=[...(f.incomeBySource||[])].sort((a,b)=>b.amount-a.amount)[0];
  return `<div class="exec-module-metrics">${executiveModuleMetric("Today",money(f.stats.incomeToday),"green")}${executiveModuleMetric("This month",money(f.stats.monthlyIncome),"blue")}${executiveModuleMetric("Receipts",rows.length,"violet")}${executiveModuleMetric("Top source",topSource?topSource.label:"—","orange")}</div>${financeIncomeWidget(f)}${financeDataTable("Organization income ledger",["Receipt","Date","Payer / Organization","Category","Method","Amount","Status"],rows.map(x=>[x.receiptNumber||x.reference,new Date(x.transactionDate).toLocaleDateString(),x.counterparty||"?",x.category,x.paymentMethod||"?",money(x.amount),status(x.status)]))}`;
}
function financeExpensesView() {
  const f=state.finance,rows=f.entries.filter(x=>x.entryType==="expense");
  return `<div class="exec-module-metrics">${executiveModuleMetric("Today",money(f.stats.expensesToday),"red")}${executiveModuleMetric("This month",money(f.stats.monthlyExpenses),"orange")}${executiveModuleMetric("Pending requests",f.stats.pendingPaymentRequests,"blue")}${executiveModuleMetric("Outstanding",money(f.stats.outstandingPayments),"violet")}</div>${financeExpenseWidget(f)}${financeDataTable("Completed organization expenses",["Voucher","Date","Supplier","Category","Budget line","Method","Amount"],rows.map(x=>[x.voucherNumber||x.reference,new Date(x.transactionDate).toLocaleDateString(),x.counterparty||"?",x.category,x.budgetLine||"?",x.paymentMethod||"?",money(x.amount)]))}`;
}
function financeVouchersView() {
  const f=state.finance;
  return `${financeInvestmentAnalysisQueue(f)}<div class="finance-voucher-filters">${["finance_review","executive_approval","finance_approved","executive_approved","processed","returned_for_correction","rejected"].map(value=>`<span>${value.replaceAll("_"," ")} <b>${f.vouchers.filter(v=>v.status===value).length}</b></span>`).join("")}</div>
    <div class="finance-voucher-list">${f.vouchers.map(v=>`<article><div class="finance-voucher-main"><span>${v.voucherNumber} - ${v.department}</span><h3>${v.supplier}</h3><p>${v.description} - ${v.category} - ${v.budgetLine}</p><small>Requested by ${v.requestedBy}${v.reviewedBy?` - Reviewed by ${v.reviewedBy}`:""}</small></div><div class="finance-voucher-value"><strong>${money(v.amount)}</strong>${status(v.status)}</div><div class="finance-voucher-actions">${financeApprovalActions(v)}${["finance_approved","executive_approved"].includes(v.status)?`<button class="process" data-finance-process="${v.id}">Process payment</button>`:""}<button data-finance-voucher-detail="${v.id}">Details</button></div></article>`).join("")}</div>`;
}
function financeInvestmentAnalysisQueue(f){const items=f.investmentAnalyses||[];return `<section class="finance-panel finance-analysis-queue"><div class="finance-panel-head"><div><h3>Investment Financial Analysis</h3><p>Finance feasibility review required before a proposal reaches Executive</p></div><strong>${items.length} waiting</strong></div>${items.map(p=>`<article><div><span>${p.reference} - ${escapeHtml(p.category)}</span><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.description)}</p><small>Submitted by ${escapeHtml(p.createdBy)} - Risk: ${escapeHtml(p.riskAssessment)}</small></div><div><strong>${money(p.estimatedCost)}</strong><small>Expected revenue ${money(p.expectedRevenue)} - ROI ${p.expectedRoi}%</small>${p.supportingDocument?`<a href="${p.supportingDocument}" target="_blank">${icons.file} Evidence</a>`:""}</div><div class="record-actions"><button data-finance-investment="${p.id}" data-decision="approve">Approve analysis</button><button data-finance-investment="${p.id}" data-decision="more_information">More information</button><button class="danger-action" data-finance-investment="${p.id}" data-decision="reject">Reject</button></div></article>`).join("")||`<div class="exec-empty">No investment proposals await Finance analysis.</div>`}</section>`;}
async function financeInvestmentDecision(id,decision){const analysis=await promptDialog("Financial analysis (affordability, cash flow, funding and budget impact):","");if(!analysis)return;const recommendation=await promptDialog("Finance recommendation:",decision==="approve"?"Financially viable and recommended for Executive review.":"");if(!recommendation)return;try{const result=await api(`/api/finance/investment-proposals/${id}/review`,{method:"POST",body:JSON.stringify({decision,analysis,recommendation})});state.finance=await api("/api/finance/command-center");render();toast(result.status==="executive_approval"?"Finance analysis completed; proposal sent to Executive.":"Finance decision recorded.");}catch(error){toast(error.message);}}
function financeReceiptsView() {
  const rows=state.finance.entries.filter(x=>x.entryType==="income");
  return financeDataTable("Issued organization receipts",["Receipt number","Date","Received from","Category","Method","Amount","Actions"],rows.map(x=>[x.receiptNumber||x.reference,new Date(x.transactionDate).toLocaleDateString(),x.counterparty||"?",x.category,x.paymentMethod||"?",money(x.amount),`<button class="button small secondary" data-finance-receipt="${x.id}">Download receipt</button>`]));
}
function financeInvoicesView() {
  const f=state.finance;
  return `<div class="exec-module-metrics">${executiveModuleMetric("Total liabilities",money(f.stats.totalLiabilities),"red")}${executiveModuleMetric("Unpaid",f.invoices.filter(i=>i.status==="unpaid").length,"orange")}${executiveModuleMetric("Overdue",f.invoices.filter(i=>new Date(i.dueDate)<new Date()&&i.status!=="paid").length,"red")}${executiveModuleMetric("Part paid",f.invoices.filter(i=>i.status==="part_paid").length,"blue")}</div>${financeDataTable("Supplier invoices",["Invoice","Supplier","Description","Invoice date","Due date","Amount","Status"],f.invoices.map(i=>[i.invoiceNumber,i.supplier,i.description,new Date(i.invoiceDate).toLocaleDateString(),new Date(i.dueDate).toLocaleDateString(),money(i.amount),status(i.status)]))}`;
}
function financeBudgetsView() {
  const f=state.finance;
  return `<div class="finance-budget-cards">${f.budgets.map(b=>`<article class="${b.utilization>=100?"danger":b.utilization>=80?"warning":""}"><div><span>${b.department}</span>${status(b.status)}</div><h3>${money(b.allocated)}</h3><p>Used ${money(b.used)} - Remaining ${money(b.remaining)}</p>${progress("Budget utilization",`${b.utilization}%`,Math.min(100,b.utilization),b.utilization>=90?"amber":"lime")}<small>${b.utilization>=100?"Budget exceeded?spending must stop":b.utilization>=90?"Critical: 90% threshold reached":b.utilization>=80?"Warning: 80% threshold reached":"Within approved budget"}</small></article>`).join("")}</div>`;
}
function financeBankView() {
  const f=state.finance;
  return `<div class="finance-account-grid">${f.accounts.map(a=>`<article><div><span>${icons[a.accountType==="bank"?"building":"wallet"]}</span><div><small>${a.accountType.replaceAll("_"," ")}</small><h3>${a.accountName}</h3><p>${a.bankName||"Organization cash"} ${a.accountNumber||""}</p></div></div><strong>${money(a.balance)}</strong><small>Opening balance: ${money(a.openingBalance)} - ${a.openingBalanceDate?new Date(a.openingBalanceDate).toLocaleDateString():"Date unavailable"}</small><small>Last reconciled: ${a.lastReconciledAt?new Date(a.lastReconciledAt).toLocaleDateString():"Never"}</small><div class="finance-account-actions">${a.supportingDocument?`<a href="${a.supportingDocument}" target="_blank" rel="noopener">View opening statement</a>`:""}${a.accountType==="bank"?`<button data-finance-reconcile="${a.id}">Reconcile</button>`:""}<button data-finance-account-edit="${a.id}">Edit</button><button class="danger-action" data-finance-account-delete="${a.id}">Deactivate</button></div></article>`).join("")}</div>${financeCashPositionWidget(f)}`;
}
function financeCashbookView() {
  const f=state.finance;
  return financeDataTable("Organization cashbook",["Reference","Date","Account","Entry","Counterparty","Description","Debit / Expense","Credit / Funds In","Status"],f.entries.map(x=>[x.reference,new Date(x.transactionDate).toLocaleDateString(),x.accountName||"Not assigned",x.entryType.replaceAll("_"," "),x.counterparty||"?",x.description,x.entryType==="expense"?money(x.amount):"?",["income","opening_balance"].includes(x.entryType)?money(x.amount):"?",status(x.status)]));
}
function financeAssetsView() {
  const f=state.finance;
  return `<div class="exec-module-metrics">${executiveModuleMetric("Asset value",money(f.stats.totalAssets),"green")}${executiveModuleMetric("Registered assets",f.assets.length,"blue")}${executiveModuleMetric("Active",f.assets.filter(a=>a.status==="active").length,"violet")}${executiveModuleMetric("Departments",new Set(f.assets.map(a=>a.department)).size,"orange")}</div>${financeDataTable("Organization asset register",["Asset code","Asset","Type","Purchase date","Purchase value","Current value","Department","Location","Status"],f.assets.map(a=>[a.assetCode,a.assetName,a.assetType,new Date(a.purchaseDate).toLocaleDateString(),money(a.purchaseValue),money(a.currentValue),a.department||"?",a.location||"?",status(a.status)]))}`;
}
function financeProcurementView() {
  const stages=["department_request","finance_review","executive_approval","purchase_order","goods_received","invoice","payment","closed"];
  return `<div class="finance-procurement-flow">${stages.map((stage,index)=>`<span><b>${index+1}</b>${stage.replaceAll("_"," ")}</span>`).join("<i>&gt;</i>")}</div><div class="finance-procurement-list">${state.finance.procurements.map(p=>`<article><div><span>${p.reference} - ${p.department}</span><h3>${p.itemDescription}</h3><p>${p.supplier||"Supplier not selected"} - Requested by ${p.requestedBy}</p></div><strong>${money(p.estimatedAmount)}</strong>${status(p.stage)}<button data-procurement-advance="${p.id}">Advance stage &gt;</button></article>`).join("")}</div>`;
}
function financeReportsView() {
  const reports=[["FY2026 Historical Financial Statements","Imported draft statements for the year ended 30 June 2026"],["Income Report","Organization revenue by source"],["Expense Report","Spending by category"],["Cash Flow Report","Cash inflows and outflows"],["Trial Balance","Organization ledger balances"],["Budget Performance Report","Department allocation and utilization"],["Bank Reconciliation","Account reconciliation status"],["Asset Register","Organization property and current values"],["Procurement Report","Requests through payment"],["Department Spending Report","Spending comparison and alerts"],["Financial Statement","Income, expenditure, assets and liabilities"],["Annual Financial Report","Complete annual finance pack"]];
  return `<div class="exec-report-grid">${reports.map(([name,desc],index)=>`<article><span class="${["blue","green","violet","orange","teal"][index%5]}">${icons.file}</span><div><h3>${name}</h3><p>${desc}</p><small>Current verified Finance data</small></div><div class="finance-report-actions"><button data-finance-report-preview="${name}">${icons.eye}Preview</button><button data-finance-report="${name}" data-format="excel">${icons.download}Excel</button><button data-finance-report="${name}" data-format="pdf">${icons.file}PDF</button></div></article>`).join("")}</div>`;
}
function financeAnalyticsView() {
  const f=state.finance;
  return `<div class="exec-analytics-grid">${financeRevenueGraph(f)}${financeIncomeWidget(f)}${financeExpenseWidget(f)}${financeBudgetWidget(f)}${financeDepartmentSpendingWidget(f)}${financeForecastWidget(f)}</div>`;
}
function financeForecastWidget(f) {
  const avg=f.monthly.length?f.monthly.reduce((sum,m)=>sum+m.net,0)/f.monthly.length:0;
  return `<section class="finance-panel"><div class="finance-panel-head"><div><h3>Financial Forecast</h3><p>Projected next-quarter net position</p></div></div><div class="finance-forecast"><strong>${money(avg*3)}</strong><span>Projected three-month surplus</span>${progress("Forecast confidence","82%",82,"lime")}<p>Based on six-month revenue and expenditure trends.</p></div></section>`;
}
function financeDocumentsView() {
  return `<div class="exec-document-groups">${["Annual Reports","Audit Reports","Financial Statements","Bank Reconciliations","Payment Support"].map(type=>{const docs=state.finance.documents.filter(d=>d.documentType===type);return `<section class="finance-panel"><div class="finance-panel-head"><div><h3>${type}</h3><p>${docs.length} finance document${docs.length===1?"":"s"}</p></div></div>${docs.map(d=>`<div class="exec-document-row"><span>${icons.file}</span><div><strong>${d.title}</strong><small>${d.reference} - Version ${d.version}</small></div>${status(d.status)}${d.hasFile?`<div class="document-actions"><a href="/api/documents/${d.id}/view" target="_blank">${icons.eye}View</a><a href="/api/documents/${d.id}/download">${icons.download}</a></div>`:`<span class="status pending">No file</span>`}</div>`).join("")||`<div class="exec-empty">No documents in this category yet.</div>`}</section>`}).join("")}</div>`;
}
function financeSettingsView() {
  return `<div class="settings-grid"><div class="card setting-card"><div class="card-head" style="padding:0 0 16px"><div><h2 class="card-title">Finance controls</h2><p class="card-subtitle">Accounting and payment safeguards</p></div></div>
    <div class="setting-row"><div class="setting-icon">${icons.approvals}</div><div class="setting-copy"><strong>Large-payment threshold</strong><span>UGX 10,000,000 - Executive approval required</span></div></div>
    <div class="setting-row"><div class="setting-icon">${icons.reports}</div><div class="setting-copy"><strong>Budget alerts</strong><span>Warnings at 80%, 90% and 100%</span></div></div>
    <div class="setting-row"><div class="setting-icon">${icons.building}</div><div class="setting-copy"><strong>Fiscal period</strong><span>FY 2026</span></div></div></div>
    <div class="card setting-card"><div class="card-head" style="padding:0 0 16px"><div><h2 class="card-title">Separation of duties</h2><p class="card-subtitle">Enforced by the server</p></div></div>
    <div class="setting-row"><div class="setting-icon">${icons.lock}</div><div class="setting-copy"><strong>SACCO isolation</strong><span>Finance cannot read or modify member savings, loans or guarantors</span></div>${status("active")}</div>
    <div class="setting-row"><div class="setting-icon">${icons.shield}</div><div class="setting-copy"><strong>Self-approval prevention</strong><span>Finance officers cannot approve their own payment requests</span></div>${status("active")}</div>
    <div class="setting-row"><div class="setting-icon">${icons.audit}</div><div class="setting-copy"><strong>Permanent audit trail</strong><span>Receipts, vouchers, decisions and payments are logged</span></div>${status("active")}</div></div></div>`;
}
function financeSearchView() {
  const results=state.financeSearchResults||[];
  return `<div class="exec-search-summary">${icons.search}<div><strong>${results.length} finance result${results.length===1?"":"s"}</strong><span>for &quot;${escapeHtml(state.financeSearchTerm||"")}&quot;</span></div></div><section class="finance-panel"><div class="exec-global-results">${results.map(r=>`<button data-finance-page="${r.target}"><span>${r.type}</span><div><strong>${r.title}</strong><small>${r.reference} - ${r.detail||""}</small></div><b>&gt;</b></button>`).join("")||`<div class="exec-empty">Type at least two characters to search Finance.</div>`}</div></section>`;
}
function financeDataTable(title,headers,rows) {
  return `<section class="finance-panel finance-data-panel"><div class="finance-panel-head"><div><h3>${title}</h3><p>${rows.length} verified record${rows.length===1?"":"s"}</p></div></div><div class="table-scroll"><table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.length?rows.map(row=>`<tr>${row.map(value=>`<td>${value}</td>`).join("")}</tr>`).join(""):`<tr><td colspan="${headers.length}">No records found.</td></tr>`}</tbody></table></div></section>`;
}
function financeAccountOptions() {
  return state.finance.accounts.map(a=>`<option value="${a.id}" data-account-type="${a.accountType}">${escapeHtml(a.accountName)} - ${money(a.balance)}</option>`).join("");
}
function financeDepartmentOptions() {
  return (state.finance.departments||[]).map(department=>`<option value="${department.id}">${escapeHtml(department.name)}</option>`).join("");
}
function openFinanceModal(type) {
  const forms={
    income:["Record organization income","A receipt will be issued and the selected account balance updated",`<form class="form" data-finance-form="income"><div class="form-grid"><div class="field"><label>Income category</label><select name="category"><option>Membership Fees</option><option>Registration Fees</option><option>Donations</option><option>Grants</option><option>Investment Income</option><option>Rental Income</option><option>Welfare Contributions</option><option>Miscellaneous Income</option></select></div><div class="field"><label>Amount (UGX)</label><input name="amount" type="number" min="1" required></div><div class="field full"><label>Member / Organization paying</label><input name="counterparty" required></div><div class="field"><label>Payment method</label><select name="paymentMethod"><option>Bank transfer</option><option>Cash</option><option>Mobile Money</option><option>Cheque</option></select></div><div class="field"><label>Receiving account</label><select name="accountId" required>${financeAccountOptions()}</select><small data-account-help>Select where the money was received.</small></div><div class="field"><label>Date</label><input name="date" type="date" value="${new Date().toISOString().slice(0,10)}" required></div><div class="field full"><label>Description</label><textarea name="description" required></textarea></div><div class="field full"><label>Supporting document</label><input name="supportingDocument"></div></div>${formActions("Record income and issue receipt")}</form>`],
    account:["Add finance cash account","Register a bank, cash, petty cash, mobile money or restricted-fund account",`<form class="form" data-finance-form="account"><div class="form-grid"><div class="field"><label>Account type</label><select name="accountType"><option value="bank">Bank account</option><option value="cash">Cash account</option><option value="petty_cash">Petty cash</option><option value="mobile_money">Mobile money</option><option value="restricted">Restricted funds</option></select></div><div class="field"><label>Account code (optional)</label><input name="accountCode" placeholder="Generated if empty"></div><div class="field full"><label>Account name</label><input name="accountName" required placeholder="e.g. Stanbic Operating Account"></div><div class="field"><label>Bank / provider name</label><input name="bankName"></div><div class="field"><label>Account / wallet number</label><input name="accountNumber"></div><div class="field"><label>Opening balance (UGX)</label><input name="openingBalance" type="number" min="0" value="0" required></div><div class="field"><label>Opening balance date</label><input name="openingBalanceDate" type="date" max="${new Date().toISOString().slice(0,10)}" value="${new Date().toISOString().slice(0,10)}" required></div><div class="field"><label class="check-field"><input name="restricted" type="checkbox"> Restricted funds</label></div><div class="field full"><label>Notes / balance description</label><textarea name="notes" placeholder="Explain the source and date of the starting balance"></textarea></div><div class="field full"><label>Opening statement or supporting document</label><input name="supportingDocument"><small>Required when the opening balance is greater than zero.</small></div></div>${formActions("Add account")}</form>`],
    expense:["Create expense request","This creates a controlled payment voucher?not a completed expense",`<form class="form" data-finance-form="expense"><div class="form-grid"><div class="field full"><label>Supplier / Payee</label><input name="supplier" required></div><div class="field"><label>Department</label><select name="departmentId">${financeDepartmentOptions()}</select></div><div class="field"><label>Category</label><select name="category"><option>Utilities</option><option>Office Supplies</option><option>Fuel</option><option>Repairs</option><option>Internet</option><option>Salaries</option><option>Welfare Transfer</option><option>Purchase</option><option>Transport</option><option>Maintenance</option></select></div><div class="field"><label>Budget line</label><input name="budgetLine" required></div><div class="field"><label>Amount (UGX)</label><input name="amount" type="number" min="1" required></div><div class="field"><label>Payment method</label><select name="paymentMethod"><option>Bank transfer</option><option>Cash</option><option>Mobile Money</option><option>Cheque</option></select></div><div class="field full"><label>Description</label><textarea name="description" required></textarea></div><div class="field full"><label>Attachment reference</label><input name="supportingDocument"></div></div>${formActions("Create payment voucher")}</form>`],
    invoice:["Record supplier invoice","Track an obligation and its due date",`<form class="form" data-finance-form="invoice"><div class="form-grid"><div class="field"><label>Invoice number</label><input name="invoiceNumber" required></div><div class="field"><label>Supplier</label><input name="supplier" required></div><div class="field full"><label>Description</label><input name="description" required></div><div class="field"><label>Amount (UGX)</label><input name="amount" type="number" min="1" required></div><div class="field"><label>Invoice date</label><input name="invoiceDate" type="date" required></div><div class="field"><label>Due date</label><input name="dueDate" type="date" required></div><div class="field full"><label>Supporting document</label><input name="supportingDocument"></div></div>${formActions("Record invoice")}</form>`],
    budget:["Create or update department budget","Submit a spending plan for Executive approval; alerts appear at 80%, 90% and 100% utilization",`<form class="form" data-finance-form="budget"><div class="form-grid"><div class="field"><label>Department</label><select name="departmentId" required>${financeDepartmentOptions()}</select></div><div class="field"><label>Fiscal period</label><input name="fiscalPeriod" value="FY 2026" required></div><div class="field full"><label>Budget allocation (UGX)</label><input name="allocatedAmount" type="number" min="1" required></div></div>${formActions("Submit budget for approval")}</form>`],
    asset:["Register organization asset","Maintain the official asset register",`<form class="form" data-finance-form="asset"><div class="form-grid"><div class="field"><label>Asset code</label><input name="assetCode" required></div><div class="field"><label>Asset name</label><input name="assetName" required></div><div class="field"><label>Asset type</label><select name="assetType"><option>Land</option><option>Building</option><option>Vehicle</option><option>Furniture</option><option>Computers</option><option>Project Equipment</option></select></div><div class="field"><label>Purchase date</label><input name="purchaseDate" type="date" required></div><div class="field"><label>Purchase value</label><input name="purchaseValue" type="number" min="1" required></div><div class="field"><label>Current value</label><input name="currentValue" type="number" min="0"></div><div class="field"><label>Assigned department</label><select name="departmentId"><option value="">Organization-wide</option>${financeDepartmentOptions()}</select></div><div class="field"><label>Location</label><input name="location"></div><div class="field full"><label>Custodian</label><input name="custodian"></div></div>${formActions("Register asset")}</form>`],
    procurement:["Create procurement request","Begin the controlled request-to-payment workflow",`<form class="form" data-finance-form="procurement"><div class="form-grid"><div class="field"><label>Department</label><select name="departmentId">${financeDepartmentOptions()}</select></div><div class="field"><label>Estimated amount (UGX)</label><input name="estimatedAmount" type="number" min="1" required></div><div class="field full"><label>Item or service description</label><textarea name="itemDescription" required></textarea></div><div class="field full"><label>Suggested supplier</label><input name="supplier"></div></div>${formActions("Create procurement request")}</form>`]
  };
  const [title,subtitle,form]=forms[type]||forms.income;
  document.body.insertAdjacentHTML("beforeend",`<div class="modal-backdrop" id="modal-backdrop"><div class="modal"><div class="modal-head"><div><h2>${title}</h2><p>${subtitle}</p></div><button class="modal-close" data-close>${icons.x}</button></div>${form}</div></div>`);
  document.querySelector("[data-close]").onclick=closeModal;const financeForm=document.querySelector("[data-finance-form]");
  enhanceDepartmentRecordForm(financeForm,{department:"finance",attachment:["income","account","expense","invoice","asset"].includes(type),photo:type==="asset"});
  if(type==="income")configureFinanceIncomeAccounts(financeForm);
  financeForm.onsubmit=submitFinanceForm;
}
function configureFinanceIncomeAccounts(form) {
  const method=form.elements.paymentMethod,account=form.elements.accountId;
  const map={"Bank transfer":["bank"],Cheque:["bank"],Cash:["cash","petty_cash"],"Mobile Money":["mobile_money"]};
  const refresh=()=>{
    const allowed=map[method.value]||[];
    [...account.options].forEach(option=>{option.hidden=!allowed.includes(option.dataset.accountType);option.disabled=option.hidden;});
    const first=[...account.options].find(option=>!option.disabled);
    if(![...account.options].some(option=>option.selected&&!option.disabled))account.value=first?.value||"";
    form.querySelector("[data-account-help]").textContent=first?`Showing registered ${method.value.toLowerCase()} accounts.`:`No compatible account exists. Add one from Bank Accounts first.`;
  };
  method.addEventListener("change",refresh);refresh();
}
async function submitFinanceForm(event) {
  event.preventDefault();const form=event.currentTarget,type=form.dataset.financeForm;
  const endpoints={income:"/api/finance/income",account:"/api/finance/accounts",expense:"/api/finance/expenses",invoice:"/api/finance/invoices",budget:"/api/finance/budgets",asset:"/api/finance/assets",procurement:"/api/finance/procurements"};
  const button=form.querySelector("button[type=submit]");button.disabled=true;button.textContent="Saving?";
  try {
    const data=await departmentFormPayload(form);
    const accountId=form.dataset.accountId;
    const result=await api(accountId?`/api/finance/accounts/${accountId}`:endpoints[type],{method:accountId?"PATCH":"POST",body:JSON.stringify(data)});
    closeModal();state.finance=await api("/api/finance/command-center");render();
    toast(type==="income"?`Income recorded. Receipt ${result.receiptNumber}.`:type==="expense"?`Payment voucher ${result.voucherNumber} created.`:`${type[0].toUpperCase()+type.slice(1)} record saved.`);
  } catch(error){button.disabled=false;button.textContent="Try again";toast(error.message);}
}
async function financeVoucherDecision(id,decision) {
  let comment="";
  if(decision!=="approve"){comment=await promptDialog(decision==="reject"?"Reason for rejection:":"Correction required:","");if(comment===null||!comment.trim())return;}
  else if(!await confirmDialog("Approve this voucher at Finance review? Payments of UGX 10,000,000 or more will be forwarded to Executive."))return;
  try{const result=await api(`/api/finance/vouchers/${id}/decision`,{method:"POST",body:JSON.stringify({decision,comment})});state.finance=await api("/api/finance/command-center");render();toast(result.status==="executive_approval"?"Finance review complete; sent to Executive.":"Voucher decision recorded.");}catch(error){toast(error.message);}
}
function editFinanceAccount(id) {
  const account=state.finance.accounts.find(item=>String(item.id)===String(id));if(!account)return;
  openFinanceModal("account");
  const form=document.querySelector('[data-finance-form="account"]');form.dataset.accountId=account.id;
  form.elements.accountType.value=account.accountType;form.elements.accountCode.value=account.accountCode;form.elements.accountCode.disabled=true;
  form.elements.accountName.value=account.accountName;form.elements.bankName.value=account.bankName||"";form.elements.accountNumber.value=account.accountNumber||"";
  form.elements.openingBalance.closest(".field").remove();form.elements.openingBalanceDate.closest(".field").remove();form.elements.restricted.checked=Boolean(account.restricted);
  form.elements.notes.value=account.notes||"";
  form.querySelector("button[type=submit]").textContent="Save account";
}
async function deactivateFinanceAccount(id) {
  const account=state.finance.accounts.find(item=>String(item.id)===String(id));if(!account)return;
  if(!await confirmDialog(`Deactivate ${account.accountName}? Existing ledger history will remain available.`))return;
  try{await api(`/api/finance/accounts/${id}`,{method:"DELETE"});state.finance=await api("/api/finance/command-center");render();toast("Finance account deactivated.");}catch(error){toast(error.message);}
}
async function processFinanceVoucher(id) {
  const voucher=state.finance.vouchers.find(v=>String(v.id)===String(id));if(!voucher)return;
  const accounts=state.finance.accounts.filter(a=>!a.restricted&&a.balance>=voucher.amount);
  const list=accounts.map((a,index)=>`${index+1}. ${a.accountName} - ${money(a.balance)}`).join("\n");
  const choice=await promptDialog(`Select the paying account:\n\n${list}`,"1");if(choice===null)return;
  const account=accounts[Number(choice)-1];if(!account)return toast("Invalid account selection.");
  if(!await confirmDialog(`Process ${money(voucher.amount)} to ${voucher.supplier} from ${account.accountName}?`))return;
  try{await api(`/api/finance/vouchers/${id}/process`,{method:"POST",body:JSON.stringify({accountId:account.id,paymentMethod:voucher.paymentMethod})});state.finance=await api("/api/finance/command-center");render();toast("Payment processed and posted to the cashbook.");}catch(error){toast(error.message);}
}
function financeVoucherDetails(id) {
  const v=state.finance.vouchers.find(x=>String(x.id)===String(id));if(!v)return;
  detailModal("Payment voucher",`${v.voucherNumber} - ${v.department}`,[["Supplier",v.supplier],["Description",v.description],["Category",v.category],["Budget line",v.budgetLine],["Amount",money(v.amount)],["Requested by",v.requestedBy],["Status",v.status],["Finance comment",v.financeComment||"?"]]);
}
function downloadFinanceReceipt(id) {
  const row=state.finance.entries.find(x=>String(x.id)===String(id));if(!row)return;
  const text=`KASANGATI G40 KWAGALANA\nOFFICIAL RECEIPT\n\nReceipt: ${row.receiptNumber}\nDate: ${new Date(row.transactionDate).toLocaleDateString()}\nReceived from: ${row.counterparty}\nCategory: ${row.category}\nPayment method: ${row.paymentMethod}\nAmount: ${money(row.amount)}\nDescription: ${row.description}\n\nRecorded by: ${row.recordedBy}`;
  const link=document.createElement("a");link.href=URL.createObjectURL(new Blob([text],{type:"text/plain"}));link.download=`${row.receiptNumber}.txt`;link.click();URL.revokeObjectURL(link.href);toast("Receipt downloaded.");
}
async function reconcileFinanceAccount(id) {
  const account=state.finance.accounts.find(a=>String(a.id)===String(id));if(!account)return;
  if(!await confirmDialog(`Confirm that ${account.accountName} has been reconciled against the bank statement?`))return;
  try{await api(`/api/finance/accounts/${id}/reconcile`,{method:"POST",body:"{}"});state.finance=await api("/api/finance/command-center");render();toast("Bank reconciliation recorded.");}catch(error){toast(error.message);}
}
async function advanceProcurement(id) {
  try{const result=await api(`/api/finance/procurements/${id}/advance`,{method:"POST",body:"{}"});state.finance=await api("/api/finance/command-center");render();toast(`Procurement advanced to ${result.stage.replaceAll("_"," ")}.`);}catch(error){toast(error.message);}
}
function downloadGeneratedReport(scope,name,format="excel") {
  const extension=format==="pdf"?"pdf":"xml";
  const link=document.createElement("a");
  link.href=`/api/department-reports/${scope}.${extension}?name=${encodeURIComponent(name)}`;
  link.download="";document.body.appendChild(link);link.click();link.remove();
  toast(`${name} ${extension==="pdf"?"PDF":"Excel"} export started.`);
}
function operationalReportRows(scope,name){
  const lower=String(name).toLowerCase();
  if(scope==="investment"){const i=state.investment;if(lower.includes("revenue"))return i.transactions.filter(x=>x.transactionType==="revenue").map(x=>[x.reference,x.project,x.category,money(x.amount),new Date(x.transactionDate).toLocaleDateString()]);if(lower.includes("expense")||lower.includes("profit"))return i.transactions.map(x=>[x.reference,x.project,x.transactionType,money(x.amount),new Date(x.transactionDate).toLocaleDateString()]);if(lower.includes("investor"))return i.investors.map(x=>[x.investorName,x.project,x.fundingSource,money(x.amountInvested),x.status]);return i.projects.map(x=>[x.reference,x.name,x.status,money(x.currentValue),`${x.roi}% ROI`]);}
  if(scope==="welfare"){const w=state.welfare;if(lower.includes("contribution"))return w.contributions.map(x=>[x.reference,x.member,x.contributionType,money(x.amount),x.status]);if(lower.includes("payment")||lower.includes("beneficiary"))return w.payments.map(x=>[x.reference,x.beneficiary,x.category,money(x.amount),x.status]);return w.requests.map(x=>[x.reference,x.member,x.category,money(x.amount),x.status]);}
  if(scope==="finance")return (state.finance?.entries||[]).map(x=>[x.reference,x.counterparty,x.category,money(x.amount),x.status]);
  if(scope==="credits"){const c=state.credits||{},transactions=c.transactions||[],loans=c.loans||[],guarantors=c.guarantors||[],members=c.members||[],recovery=c.recovery||[],charges=c.charges||[];
    if(lower.includes("saving"))return transactions.filter(x=>/savings deposit|withdrawal/i.test(x.type)).map(x=>[x.receiptNumber||x.reference,x.member,x.type,money(x.amount),`${x.status} - ${new Date(x.createdAt).toLocaleDateString()}`]);
    if(lower.includes("daily transaction"))return transactions.map(x=>[x.receiptNumber||x.reference,x.member,x.type,money(x.amount),`${x.status} - ${new Date(x.createdAt).toLocaleDateString()}`]);
    if(lower.includes("guarantor"))return guarantors.map(x=>[x.loanReference,x.guarantor,`Guarantee for ${x.borrower}`,money(x.guaranteedAmount),x.status]);
    if(lower.includes("recovery"))return recovery.map(x=>[x.loanReference,x.member,x.actionType,money(x.outstanding),x.recoveryStatus]);
    if(lower.includes("defaulter"))return loans.filter(x=>x.status==="overdue"||Number(x.daysOverdue)>0).map(x=>[x.reference,x.member,x.product,money(x.balance),`${x.daysOverdue} days overdue`]);
    if(lower.includes("interest"))return charges.map(x=>[x.loanReference,x.member,x.chargeType,money(x.amount),x.status]);
    if(lower.includes("statement"))return members.map(x=>[x.memberNumber,x.name,"Member account",money(x.savings),x.status]);
    return loans.map(x=>[x.reference,x.member,x.product,money(x.amount),x.status]);}
  const center=scope==="legal"?state.legal:scope==="audit"?state.auditCenter:scope==="supervisory"?state.supervisory:null;
  const source=center?.cases||center?.findings||center?.recommendations||center?.contracts||[];
  return source.map(x=>[x.reference||x.caseNumber||x.findingNumber||x.recommendationNumber||"?",x.title||x.subject||x.description||"Record",x.department||x.category||scope,x.amount?money(x.amount):"?",x.status||x.riskLevel||"active"]);
}
function relativeTime(value){if(!value)return "Time unavailable";const timestamp=new Date(value).getTime();if(!Number.isFinite(timestamp))return String(value);const seconds=Math.max(0,Math.floor((Date.now()-timestamp)/1000));if(seconds<60)return "just now";if(seconds<3600){const n=Math.floor(seconds/60);return `${n} minute${n===1?"":"s"} ago`;}if(seconds<86400){const n=Math.floor(seconds/3600);return `${n} hour${n===1?"":"s"} ago`;}if(seconds<604800){const n=Math.floor(seconds/86400);return `${n} day${n===1?"":"s"} ago`;}return new Date(timestamp).toLocaleString();}
function openOperationalReportPreview(scope,name){const rows=operationalReportRows(scope,name),headers=["Reference","Record","Category / Type","Value","Status / Date"];closeModal();document.body.insertAdjacentHTML("beforeend",`<div class="modal-backdrop document-viewer-backdrop" id="modal-backdrop"><div class="modal document-viewer-modal"><div class="modal-head"><div><h2>${escapeHtml(name)}</h2><p>Live in-system preview - ${rows.length} current record${rows.length===1?"":"s"}</p></div><button class="modal-close" data-report-preview-close>${icons.x}</button></div><div class="document-viewer-frame report-preview-frame"><div class="exec-html-report-preview"><div class="exec-report-preview-meta"><strong>Kasangati G40 Kwagalana</strong><span>Generated ${new Date().toLocaleString()}</span></div><div class="exec-report-preview-table"><table><thead><tr>${headers.map(x=>`<th>${x}</th>`).join("")}</tr></thead><tbody>${rows.slice(0,100).map(row=>`<tr>${row.map(value=>`<td>${escapeHtml(String(value??"?"))}</td>`).join("")}</tr>`).join("")||`<tr><td colspan="5">No current records.</td></tr>`}</tbody></table></div><p class="exec-report-preview-note">Preview shows up to 100 live records. Downloads contain the complete report.</p></div></div><div class="document-viewer-actions"><span>${icons.shield} Generated from current authorized records</span><button class="button secondary" data-operational-report-download="excel">${icons.download}Excel</button><button class="button secondary" data-operational-report-download="pdf">${icons.download}PDF</button><button class="button primary" data-report-preview-close>Close</button></div></div></div>`);document.querySelectorAll("[data-report-preview-close]").forEach(x=>x.onclick=closeModal);document.querySelectorAll("[data-operational-report-download]").forEach(x=>x.onclick=()=>downloadGeneratedReport(scope,name,x.dataset.operationalReportDownload));}
function downloadFinanceReport(name,format) { downloadGeneratedReport("finance",name,format); }
function executiveSearchView() {
  const results=state.executiveSearchResults||[];
  return `<div class="exec-search-summary">${icons.search}<div><strong>${results.length} result${results.length===1?"":"s"}</strong><span>for &quot;${escapeHtml(state.executiveSearchTerm||"")}&quot; across the organization</span></div></div><section class="exec-panel"><div class="exec-global-results">${results.map(r=>`<button data-executive-page="${r.target}"><span>${r.type}</span><div><strong>${r.title}</strong><small>${r.reference} - ${r.detail||""}</small></div><b>&gt;</b></button>`).join("")||`<div class="exec-empty">Type at least two characters in the global search bar.</div>`}</div></section>`;
}
async function executiveLoanDecision(id,decision) {
  const item=(state.executive.approvals||[]).find(x=>String(x.loanId||x.id)===String(id));
  if(!item)return toast("Loan authorization is no longer available.");
  const canDecide=Boolean(item.canCurrentUserDecide)||(item.pendingReviewers||[]).some(r=>Number(r.userId)===Number(state.user?.id));
  if(!canDecide)return toast("You are not an assigned Executive reviewer for this loan, or you already decided.");
  let comment="";
  if(decision!=="authorize") { comment=await promptDialog(decision==="reject"?"Reason for rejecting this loan:":"What information should Credits provide:",""); if(comment===null||!comment.trim())return; }
  else { if(!await confirmDialog(`Approve ${item.reference} for ${money(item.amount)}? Other Executive members may still need to record their decisions.`))return; }
  try {
    const result=await api(`/api/loans/${id}/decision`,{method:"POST",body:JSON.stringify({decision,comment})});
    state.executive=await api("/api/executive/command-center");
    render();
    toast(decision==="authorize"?"Executive approval recorded.":decision==="reject"?(result.advisoryReject?"Rejection recorded with reason. Loan continues — only Tabula can finally reject.":result.finalReject?"Loan finally rejected by Tabula Robert.":"Loan rejected."):"Loan returned to Credits for another full review.");
  } catch(error){toast(error.message);}
}async function executiveDecision(id,decision) {
  const item=state.executive.approvals.find(x=>String(x.id)===String(id)||String(x.loanId)===String(id));
  if(!item)return toast("Approval item is no longer available.");
  if(item.recordType==="loan")return executiveLoanDecision(item.loanId||item.id,decision==="approve"?"authorize":decision);
  let comment="";
  if(decision!=="approve") {
    comment=await promptDialog(decision==="reject"?"Reason for rejecting this request:":"What additional information is required:","");
    if(comment===null||!comment.trim())return;
  } else {
    if(!await confirmDialog(`Approve ${item.title}${item.amount?` for ${money(item.amount)}`:""}? This decision will be audited.`)) return;
    const optional=await promptDialog("Optional executive comment:","Approved within executive authority.");
    if(optional===null)return;
    comment=optional.trim();
  }
  try {
    await api(`/api/executive/approvals/${id}/decision`,{method:"POST",body:JSON.stringify({decision,comment})});
    state.executive=await api("/api/executive/command-center");render();
    toast(decision==="approve"?"Request approved.":decision==="reject"?"Request rejected.":"More information requested.");
  } catch(error){toast(error.message);}
}
async function executiveAssignReviewer(id) {
  try {
    if(!state.users) {
      const response=await api("/api/users");
      state.users=response.users;
    }
    const candidates=state.users.filter(user=>user.active&&user.id!==state.user.id).slice(0,25);
    const list=candidates.map((user,index)=>`${index+1}. ${user.fullName} - ${user.role}`).join("\n");
    const choice=await promptDialog(`Choose a reviewer by number:\n\n${list}`,"1");
    if(choice===null)return;
    const reviewer=candidates[Number(choice)-1];
    if(!reviewer)return toast("That reviewer number is invalid.");
    const comment=await promptDialog("Instructions for the reviewer:","Review the supporting information and submit a recommendation.");
    if(comment===null)return;
    const result=await api(`/api/executive/approvals/${id}/reviewer`,{method:"POST",body:JSON.stringify({reviewerId:reviewer.id,comment})});
    state.executive=await api("/api/executive/command-center");
    render();
    toast(`${result.reviewer} assigned as reviewer.`);
  } catch(error){toast(error.message);}
}
function executiveApprovalDetails(id) {
  const item=[...(state.executive.approvals||[]),...(state.executive.approvalHistory||[])].find(x=>String(x.id)===String(id)||String(x.loanId)===String(id));
  if(!item)return toast("Approval details are unavailable.");
  if(item.recordType==="loan")return openLoanDetails(item.loanId||item.id||item.reference);
  detailModal("Executive approval",`${item.reference} - ${item.department}`,[["Request",item.title],["Category",item.activityType.replaceAll("-"," ")],
    ["Amount",item.amount?money(item.amount):"Not financial"],["Requested by",item.createdBy],["Requested on",item.createdAt?new Date(item.createdAt).toLocaleDateString():"—"],
    ["Details",item.description||"—"],["Assigned reviewer",item.assignedTo||"Not assigned"],["Authority level",item.visibilityLevel],["Status",item.status.replaceAll("_"," ")],
    ["Decision by",item.decisionBy||"Pending"],["Decision date",item.decisionAt?new Date(item.decisionAt).toLocaleString():"Pending"],["Decision comment",item.decisionComment||"—"]]);
}
function downloadExecutiveReport(name,format="excel") { downloadGeneratedReport("executive",name,format); }
function executiveReportPreviewContent(name) {
  const e=state.executive,s=e.stats;
  let metrics=[],columns=[],rows=[];
  if(name==="Financial Report") {
    metrics=[["Approved income",money(s.organizationIncome)],["Approved expenditure",money(s.organizationExpenditure)],["Net balance",money(s.netBalance)],["Pending payments",money(e.finance.pending_payments)],["Budget utilized",`${e.finance.budgetUtilization}%`]];
    columns=["Reference","Type","Description","Department","Amount","Status"];
    rows=e.financeEntries.map(x=>[x.reference,x.entryType,x.description,x.department,money(x.amount),x.status]);
  } else if(name==="Loan Report") {
    metrics=[["Total savings",money(s.totalSavings)],["Outstanding loans",money(s.outstandingLoans)],["Active loans",e.loans.active],["Loans in default",e.loans.defaults],["Recovery rate",`${e.loans.recoveryRate}%`]];
    columns=["Loan","Member","Product","Amount","Balance","Status"];
    rows=e.recentLoans.map(x=>[x.reference,x.member,x.product,money(x.amount),money(x.balance),x.status]);
  } else if(name==="Investment Report") {
    metrics=[["Active projects",e.investment.running],["Current portfolio value",money(e.investment.current_value)],["Capital invested",money(e.investment.invested)],["Expected returns",money(e.investment.expected_return)],["Growth",`${e.investment.growth}%`]];
    columns=["Project","Name","Status","Performance","Current value","Expected return"];
    rows=e.investmentProjects.map(x=>[x.reference,x.name,x.status,x.performanceStatus,money(x.currentValue),money(x.expectedReturn)]);
  } else if(name==="Welfare Report") {
    metrics=[["Fund balance",money(s.welfareFundBalance)],["Monthly contributions",money(e.welfare.monthlyContributions)],["Pending requests",e.welfare.pending],["Approved requests",e.welfare.approved],["Approved assistance",money(e.welfare.approved_amount)]];
    columns=["Reference","Member","Category","Amount","Status","Submitted"];
    rows=e.welfareRequests.map(x=>[x.reference,x.member,x.requestType,money(x.amount),x.status,new Date(x.createdAt).toLocaleDateString()]);
  } else if(name==="Legal Report") {
    metrics=[["Open legal cases",s.legalCases],["Contracts under review",e.legal.contracts],["Policies awaiting review",e.legal.policies],["Compliance alerts",e.legal.alerts]];
  } else if(name==="Audit Report") {
    metrics=[["Open findings",s.auditIssues],["Resolved findings",e.audit.resolved],["Departments under review",e.audit.departmentsUnderReview],["Compliance score",`${Number(e.audit.compliance).toFixed(1)}%`]];
  } else if(name==="Supervisory Report") {
    metrics=[["Pending recommendations",s.supervisoryRecommendations],["Pending follow-ups",e.supervisory.followups],["Departments below target",e.supervisory.departmentsBelowTarget],["Department performance",`${Math.round(Object.values(e.performance).reduce((a,b)=>a+b,0)/Math.max(1,Object.values(e.performance).length))}%`]];
  } else if(name==="Department Performance Report") {
    metrics=[["Departments",s.totalDepartments],["Below target",e.supervisory.departmentsBelowTarget],["Open audit issues",s.auditIssues],["Pending recommendations",s.supervisoryRecommendations]];
    columns=["Department","Performance","Status"];
    rows=Object.entries(e.performance).map(([department,value])=>[department.replace(/^./,c=>c.toUpperCase()),`${value}%`,value>=85?"On target":value>=80?"Needs monitoring":"Needs attention"]);
  } else {
    metrics=[["Total members",s.totalMembers],["Active members",s.activeMembers],["Organization net balance",money(s.netBalance)],["Total SACCO savings",money(s.totalSavings)],["Outstanding loans",money(s.outstandingLoans)],["Active investments",s.activeInvestments],["Welfare fund",money(s.welfareFundBalance)],["Pending approvals",s.pendingApprovals],["Open legal cases",s.legalCases],["Open audit issues",s.auditIssues],["Upcoming meetings",s.upcomingMeetings]];
    columns=["Department","Performance"];
    rows=Object.entries(e.performance).map(([department,value])=>[department.replace(/^./,c=>c.toUpperCase()),`${value}%`]);
  }
  const table=columns.length?`<div class="exec-report-preview-table"><table><thead><tr>${columns.map(x=>`<th>${escapeHtml(x)}</th>`).join("")}</tr></thead><tbody>${rows.slice(0,25).map(row=>`<tr>${row.map(value=>`<td>${escapeHtml(String(value??"?"))}</td>`).join("")}</tr>`).join("")||`<tr><td colspan="${columns.length}">No records are currently available.</td></tr>`}</tbody></table></div>`:"";
  return `<div class="exec-html-report-preview"><div class="exec-report-preview-meta"><strong>Kasangati G40 Kwagalana</strong><span>Generated ${new Date().toLocaleString()} - Live verified system data</span></div><div class="exec-report-preview-metrics">${metrics.map(([label,value])=>`<article><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value))}</strong></article>`).join("")}</div>${table}<p class="exec-report-preview-note">Preview shows up to 25 current records. Use PDF or Excel to export the complete report.</p></div>`;
}
function openExecutiveReportPreview(name) {
  closeModal();
  document.body.insertAdjacentHTML("beforeend",`<div class="modal-backdrop document-viewer-backdrop" id="modal-backdrop"><div class="modal document-viewer-modal" role="dialog" aria-modal="true" aria-labelledby="report-preview-title"><div class="modal-head"><div><h2 id="report-preview-title">${escapeHtml(name)}</h2><p>Live verified report preview generated from current system records</p></div><button class="modal-close" data-report-preview-close aria-label="Close preview">${icons.x}</button></div><div class="document-viewer-frame report-preview-frame" aria-live="polite">${executiveReportPreviewContent(name)}</div><div class="document-viewer-actions"><span>${icons.shield} Figures follow the same rules as the dashboard cards</span><button class="button secondary" data-report-download-format="excel">${icons.download}Excel</button><button class="button secondary" data-report-download-format="pdf">${icons.download}PDF</button><button class="button primary" data-report-preview-close>Close</button></div></div></div>`);
  document.querySelectorAll("[data-report-preview-close]").forEach(button=>button.addEventListener("click",closeModal));
  document.querySelectorAll("[data-report-download-format]").forEach(button=>button.addEventListener("click",()=>downloadExecutiveReport(name,button.dataset.reportDownloadFormat)));
  document.getElementById("modal-backdrop")?.addEventListener("click",event=>{if(event.target.id==="modal-backdrop")closeModal();});
}
function openExecutiveMeetingModal() {
  const tomorrow=new Date(Date.now()+86400000);const date=tomorrow.toISOString().slice(0,10);
  document.body.insertAdjacentHTML("beforeend",`<div class="modal-backdrop" id="modal-backdrop"><div class="modal"><div class="modal-head"><div><h2>Schedule organization meeting</h2><p>Add an executive, board, committee or departmental meeting</p></div><button class="modal-close" data-close>${icons.x}</button></div>
    <form class="form" id="executive-meeting-form"><div class="form-grid"><div class="field full"><label>Meeting title</label><input name="title" required></div><div class="field"><label>Meeting type</label><select name="meetingType"><option>Board Meeting</option><option>Executive Meeting</option><option>Loan Committee</option><option>Welfare Meeting</option><option>Investment Meeting</option><option>Training</option></select></div><div class="field"><label>Venue</label><input name="venue"></div><div class="field"><label>Date</label><input name="date" type="date" min="${date}" value="${date}" required></div><div class="field"><label>Time</label><input name="time" type="time" value="10:00" required></div><div class="field full"><label>Agenda</label><textarea name="agenda"></textarea></div></div>${formActions("Schedule meeting")}</form></div></div>`);
  document.querySelector("[data-close]").onclick=closeModal;document.getElementById("executive-meeting-form").onsubmit=submitExecutiveMeeting;
}
async function submitExecutiveMeeting(event) {
  event.preventDefault();const data=Object.fromEntries(new FormData(event.currentTarget));data.scheduledAt=`${data.date}T${data.time}:00`;
  try{await api("/api/executive/meetings",{method:"POST",body:JSON.stringify(data)});closeModal();state.executive=await api("/api/executive/command-center");state.page="executive-meetings";render();toast("Meeting scheduled.");}
  catch(error){toast(error.message);}
}
function openExecutiveTaskModal() {
  document.body.insertAdjacentHTML("beforeend",`<div class="modal-backdrop" id="modal-backdrop"><div class="modal"><div class="modal-head"><div><h2>Assign executive task</h2><p>Create a traceable task for executive follow-up</p></div><button class="modal-close" data-close>${icons.x}</button></div>
    <form class="form" id="executive-task-form"><div class="form-grid"><div class="field full"><label>Task title</label><input name="title" required></div><div class="field full"><label>Instructions</label><textarea name="description" required></textarea></div><div class="field"><label>Visibility</label><select name="visibilityLevel"><option value="2">Operational</option><option value="3" selected>Officer</option><option value="4">Executive only</option></select></div></div>${formActions("Assign task")}</form></div></div>`);
  document.querySelector("[data-close]").onclick=closeModal;document.getElementById("executive-task-form").onsubmit=async event=>{event.preventDefault();const data=Object.fromEntries(new FormData(event.currentTarget));data.activityType="executive-task";try{await api("/api/organization/departments/executive/activities",{method:"POST",body:JSON.stringify(data)});closeModal();state.executive=await api("/api/executive/command-center");render();toast("Executive task assigned and added to the audit trail.");}catch(error){toast(error.message);}};
}

function investmentDashboardView() {
  const i=state.investment;if(!i)return `<div class="executive-loading">Loading Investment workspace?</div>`;
  const s=i.stats,cards=[
    ["Total Portfolio",money(s.totalPortfolio),"building","investment-portfolio","Current portfolio value"],
    ["Active Projects",s.activeProjects,"reports","investment-projects","Income-generating projects"],
    ["Under Construction",s.underConstruction,"building","investment-projects","Implementation stage"],
    ["Completed Projects",s.completedProjects,"check","investment-projects","Closed implementation"],
    ["Monthly Profit",money(s.monthlyProfit),"arrowUp","investment-pl","Revenue less expenses"],
    ["Monthly Loss",money(s.monthlyLoss),"arrowDown","investment-pl","Loss-making position"],
    ["Expected Returns",money(s.expectedReturns),"clock","investment-portfolio","Forecast returns"],
    ["Actual Returns",money(s.actualReturns),"receipt","investment-revenue","Recorded net return"],
    ["Pending Proposals",s.pendingProposals,"file","investment-proposals","Review pipeline"],
    ["Available Capital",money(s.availableCapital),"wallet","investment-budgets","Unallocated project capital"],
    ["Total Investors",s.totalInvestors,"users","investment-investors","Active funding sources"],
    ["Portfolio ROI",`${s.roi}%`,"reports","investment-analytics","Return on invested capital"]
  ];
  return `<div class="finance-title-strip investment-title-strip"><div><p class="eyebrow">Investment Department</p><h2>Portfolio intelligence center</h2><p>Projects, capital, opportunities and returns?operational accounting remains in Finance.</p></div><time>${new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</time></div>
    <div class="finance-stat-grid investment-stat-grid">${cards.slice(0,8).map((card,index)=>investmentStatCard(...card,index)).join("")}</div>
    <div class="investment-dashboard-grid">
      ${investmentPortfolioWidget(i)}${investmentActiveProjectsWidget(i)}${investmentTrendWidget(i)}${investmentNotificationsWidget(i)}
      ${investmentProfitLossWidget(i)}${investmentTopProjectsWidget(i)}${investmentBudgetWidget(i)}${investmentProposalWidget(i)}
    </div>
    <div class="investment-lower-grid">${investmentTransactionsWidget(i)}${investmentMilestonesWidget(i)}${investmentQuickStatsWidget(i)}</div>
    ${investmentQuickPanel()}`;
}
function investmentStatCard(label,value,icon,target,note,index) {
  const colors=["blue","green","violet","orange","green","red","orange","teal","violet","blue","red","green"];
  return `<button class="finance-stat-card investment-stat-card" data-investment-page="${target}"><span class="${colors[index]}">${icons[icon]}</span><div><small>${label}</small><strong>${value}</strong><em>${note}</em></div><b>View details ></b></button>`;
}
function investmentPortfolioWidget(i) {
  const total=Math.max(i.categories.reduce((s,x)=>s+x.value,0),1),colors=["blue","green","violet","orange","red","teal"];
  let cursor=0;const stops=i.categories.map((x,index)=>{const start=cursor;cursor+=x.value/total*100;return `${["#2372d8","#d89b00","#724bdc","#ed8e09","#ec3349","#0aa0a8"][index%6]} ${start}% ${cursor}%`}).join(",");
  return `<section class="finance-panel investment-portfolio-panel"><div class="finance-panel-head"><div><h3>Investment Portfolio Overview</h3><p>Capital allocation and current value</p></div><button data-investment-page="investment-portfolio">Open portfolio &gt;</button></div>
    <div class="investment-portfolio-layout"><div class="investment-donut" style="background:radial-gradient(circle,#fff 0 52%,transparent 53%),conic-gradient(${stops||"#ddd 0 100%"})"><strong>${money(i.portfolio.portfolioValue)}</strong><span>Total portfolio</span></div><div class="investment-allocation">${i.categories.map((x,index)=>`<div><i class="${colors[index%colors.length]}"></i><span>${x.category}</span><strong>${money(x.value)} - ${Math.round(x.value/total*100)}%</strong></div>`).join("")}</div></div>
    <div class="investment-portfolio-metrics"><span>Capital invested<strong>${money(i.portfolio.totalInvested)}</strong></span><span>Profit earned<strong>${money(i.portfolio.profit)}</strong></span><span>Growth<strong>${i.portfolio.growth}%</strong></span></div></section>`;
}
function investmentActiveProjectsWidget(i) {
  return `<section class="finance-panel"><div class="finance-panel-head"><div><h3>Active Projects</h3><p>Progress, budgets and profit</p></div><button data-investment-page="investment-projects">View all ></button></div><div class="investment-project-mini">${i.projects.slice(0,4).map(p=>`<article><div class="investment-project-icon ${p.category?.toLowerCase().replaceAll(" ","-")}">${icons.building}</div><div><span>${p.category||"Investment"}</span><strong>${p.name}</strong>${progress(`Completion - ${p.progress}%`,money(p.budget),p.progress,p.progress<50?"amber":"lime")}</div><div><small>Profit</small><b class="${p.profit>=0?"positive":"negative"}">${money(p.profit)}</b></div></article>`).join("")}</div></section>`;
}
function investmentTrendWidget(i) {
  const max=Math.max(...i.monthly.flatMap(x=>[x.revenue,x.expenses,x.profit]),1);
  return `<section class="finance-panel"><div class="finance-panel-head"><div><h3>Investment Performance</h3><p>Revenue, expenses and profit trend</p></div><button data-investment-page="investment-analytics">Analytics ></button></div><div class="investment-trend-chart">${i.monthly.map(x=>`<div><div><i class="revenue" style="height:${x.revenue/max*100}%"></i><i class="expense" style="height:${x.expenses/max*100}%"></i><i class="profit" style="height:${Math.max(2,x.profit/max*100)}%"></i></div><span>${x.month}</span></div>`).join("")}</div><div class="exec-legend"><span><i class="revenue"></i>Revenue</span><span><i class="expense"></i>Expenses</span><span><i class="profit"></i>Profit</span></div></section>`;
}
function investmentNotificationsWidget(i) {
  return `<section class="finance-panel"><div class="finance-panel-head"><div><h3>Alerts & Notifications</h3><p>Portfolio attention items</p></div><button data-investment-page="investment-notifications">View all ></button></div><div class="finance-notifications">${i.notifications.map(n=>`<div class="${n.level}"><span>${n.level==="success"?icons.check:icons.info}</span><strong>${n.title}</strong><time>${relativeTime(n.createdAt||n.time)}</time></div>`).join("")}</div></section>`;
}
function investmentProfitLossWidget(i) {
  const revenue=i.transactions.filter(t=>t.transactionType==="revenue").reduce((s,t)=>s+t.amount,0),expenses=i.transactions.filter(t=>t.transactionType==="expense").reduce((s,t)=>s+t.amount,0),profit=revenue-expenses;
  return `<section class="finance-panel"><div class="finance-panel-head"><div><h3>Profit & Loss Summary</h3><p>Current recorded investment activity</p></div><button data-investment-page="investment-pl">Full P&L &gt;</button></div><div class="investment-pl-flow"><div><span>Total Revenue</span><strong>${money(revenue)}</strong></div><i>-</i><div><span>Expenses</span><strong class="negative">${money(expenses)}</strong></div><i>=</i><div><span>Net Profit</span><strong class="positive">${money(profit)}</strong></div></div>${progress("Profit margin",`${revenue?Math.round(profit/revenue*100):0}%`,revenue?Math.max(0,profit/revenue*100):0,"lime")}</section>`;
}
function investmentTopProjectsWidget(i) {
  return `<section class="finance-panel"><div class="finance-panel-head"><div><h3>Top Performing Projects</h3><p>ROI and current profitability</p></div><button data-investment-page="investment-projects">All projects &gt;</button></div><div class="investment-ranking">${[...i.projects].sort((a,b)=>b.roi-a.roi).map((p,index)=>`<div><b>${index+1}</b><div><strong>${p.name}</strong><small>${p.performanceStatus.replaceAll("_"," ")}</small></div><span>${p.roi}% ROI</span><strong>${money(p.profit)}</strong></div>`).join("")}</div></section>`;
}
function investmentBudgetWidget(i) {
  return `<section class="finance-panel"><div class="finance-panel-head"><div><h3>Budget Utilization by Project</h3><p>Project costs against approved budget</p></div><button data-investment-page="investment-budgets">View budgets &gt;</button></div><div class="finance-budget-table investment-budget-table"><div class="head"><span>Project</span><span>Budget</span><span>Spent</span><span>Utilization</span></div>${i.projects.map(p=>`<div><strong>${p.name}</strong><span>${money(p.budget)}</span><span>${money(p.expenses)}</span><span><i class="${p.budgetUtilization>=100?"danger":p.budgetUtilization>=80?"warning":""}" style="width:${Math.min(100,p.budgetUtilization)}%"></i><b>${p.budgetUtilization}%</b></span></div>`).join("")}</div></section>`;
}
function investmentProposalWidget(i) {
  return `<section class="finance-panel"><div class="finance-panel-head"><div><h3>Pending Investment Proposals</h3><p>Opportunity approval pipeline</p></div><button data-investment-page="investment-proposals">View all ></button></div><div class="investment-proposal-mini">${i.proposals.filter(p=>!["approved","rejected","closed"].includes(p.status)).slice(0,5).map(p=>`<div><div><strong>${p.title}</strong><small>${p.reference} - ${p.expectedRoi}% expected ROI</small></div><b>${money(p.estimatedCost)}</b>${status(p.status)}</div>`).join("")||`<div class="exec-empty">No pending proposals.</div>`}</div></section>`;
}
function investmentTransactionsWidget(i) {
  return `<section class="finance-panel"><div class="finance-panel-head"><div><h3>Recent Investment Transactions</h3><p>Project revenue and expenses</p></div><button data-investment-page="investment-revenue">View all ></button></div><div class="table-scroll"><table class="finance-compact-table"><thead><tr><th>Date</th><th>Type</th><th>Description</th><th>Project</th><th>Amount</th><th>By</th></tr></thead><tbody>${i.transactions.slice(0,8).map(t=>`<tr><td>${new Date(t.transactionDate).toLocaleDateString()}</td><td>${status(t.transactionType)}</td><td>${t.description}</td><td>${t.project}</td><td class="${t.transactionType==="revenue"?"positive":"negative"}">${money(t.amount)}</td><td>${t.recordedBy}</td></tr>`).join("")}</tbody></table></div></section>`;
}
function investmentMilestonesWidget(i) {
  return `<section class="finance-panel"><div class="finance-panel-head"><div><h3>Project Timeline & Milestones</h3><p>Upcoming completion targets</p></div><button data-investment-page="investment-projects">Open timeline &gt;</button></div><div class="investment-milestones">${[...i.projects].sort((a,b)=>new Date(a.endsOn)-new Date(b.endsOn)).map(p=>`<div><span>${icons.clock}</span><div><strong>${p.name}</strong><small>${p.endsOn?`Expected ${new Date(p.endsOn).toLocaleDateString()}`:"Completion date pending"}</small></div><div class="exec-track"><i style="width:${p.progress}%"></i></div><b>${p.progress}%</b></div>`).join("")}</div></section>`;
}
function investmentQuickStatsWidget(i) {
  return `<section class="finance-panel"><div class="finance-panel-head"><div><h3>Quick Investment Stats</h3><p>Portfolio composition</p></div></div><div class="investment-quick-stats">${[
    ["Total projects",i.projects.length],["Profitable projects",i.projects.filter(p=>p.profit>0).length],["Loss-making projects",i.projects.filter(p=>p.profit<0).length],
    ["Projects in planning",i.projects.filter(p=>p.status==="planning").length],["Projects completed",i.stats.completedProjects],["Average ROI",`${i.stats.roi}%`]
  ].map(([label,value])=>`<div><span>${label}</span><strong>${value}</strong></div>`).join("")}</div></section>`;
}
function investmentQuickPanel() {
  return `<div class="exec-floating"><button class="exec-fab investment-fab" data-action="investment-quick">${icons.plus}<span>Quick Actions</span></button>${state.investmentQuickOpen?`<div class="exec-quick-menu">
    <button data-investment-modal="project">${icons.building}Add project</button><button data-investment-modal="proposal">${icons.file}Create proposal</button>
    <button data-investment-modal="revenue">${icons.arrowDown}Record revenue</button><button data-investment-modal="expense">${icons.arrowUp}Record expense</button>
    <button data-investment-report="Project Performance Report" data-format="pdf">${icons.reports}Generate report</button></div>`:""}</div>`;
}
function investmentProjectsView() {
  const i=state.investment;
  return `<div class="investment-project-grid">${i.projects.map(p=>`<article class="investment-project-card"><div class="investment-card-banner ${p.category?.toLowerCase().replaceAll(" ","-")}" ${p.photoUrl?`style="background-image:linear-gradient(135deg,rgba(8,37,70,.75),rgba(35,113,215,.58)),url('${p.photoUrl}')"`:""}><span>${p.category||"Investment"}</span><b>${p.reference}</b></div><div class="investment-card-body"><div><h3>${p.name}</h3>${status(p.status)}</div><p>${p.description}</p><div class="investment-project-facts"><span>Location<strong>${p.location||"?"}</strong></span><span>Manager<strong>${p.manager||"?"}</strong></span><span>Budget<strong>${money(p.budget)}</strong></span><span>Profit<strong class="${p.profit>=0?"positive":"negative"}">${money(p.profit)}</strong></span></div>${progress(`Project progress - ${p.progress}%`,p.performanceStatus.replaceAll("_"," "),p.progress,p.progress<50?"amber":"lime")}<div class="record-actions"><button data-investment-project="${p.id}">${icons.eye} View</button><button data-investment-edit="project" data-record-id="${p.id}">Edit</button><button class="danger-action" data-investment-delete="project" data-record-id="${p.id}">${icons.trash} Delete</button></div></div></article>`).join("")}</div>`;
}
function investmentPortfolioView() {
  const i=state.investment;
  return `<div class="exec-module-metrics">${executiveModuleMetric("Capital invested",money(i.portfolio.totalInvested),"blue")}${executiveModuleMetric("Current value",money(i.portfolio.portfolioValue),"green")}${executiveModuleMetric("Profit",money(i.portfolio.profit),"violet")}${executiveModuleMetric("Growth",`${i.portfolio.growth}%`,"orange")}</div>
    <div class="exec-analytics-grid">${investmentPortfolioWidget(i)}${investmentTrendWidget(i)}${investmentTopProjectsWidget(i)}${investmentBudgetWidget(i)}</div>`;
}
function investmentProposalsView() {
  const stages=["investment_review","financial_analysis","executive_approval","approved","funded","project_started","monitoring","closed"];
  return `<div class="credits-workflow investment-workflow">${["Proposal","Investment Review","Financial Analysis","Executive Approval","Funding","Project Starts","Monitoring","Closed"].map((x,index)=>`<span><b>${index+1}</b>${x}</span>`).join("<i>&gt;</i>")}</div><div class="investment-proposal-list">${state.investment.proposals.map(p=>`<article><div><span>${p.reference} - ${p.category}</span><h3>${p.title}</h3><p>${p.description}</p><small>Risk: ${p.riskAssessment} - Created by ${p.createdBy}</small></div><div><strong>${money(p.estimatedCost)}</strong><small>Revenue ${money(p.expectedRevenue)} - ROI ${p.expectedRoi}%</small></div>${status(p.status)}<div>${!["executive_approval","approved","rejected","closed"].includes(p.status)?`<button class="advance" data-investment-proposal="${p.id}">Advance to ${stages[stages.indexOf(p.status)+1]?.replaceAll("_"," ")||"next stage"} &gt;</button>`:""}<button data-investment-proposal-detail="${p.id}">Details</button></div></article>`).join("")}</div>`;
}
function investmentInvestorsView() {
  const i=state.investment;
  return `<div class="exec-module-metrics">${executiveModuleMetric("Funding sources",i.stats.totalInvestors,"blue")}${executiveModuleMetric("Capital provided",money(i.investors.reduce((s,x)=>s+x.amountInvested,0)),"green")}${executiveModuleMetric("Expected returns",money(i.investors.reduce((s,x)=>s+x.expectedReturns,0)),"violet")}${executiveModuleMetric("Outstanding returns",money(i.investors.reduce((s,x)=>s+x.outstandingReturns,0)),"orange")}</div>
    ${financeDataTable("Member investment applications",["Reference","Member","Project","Amount","Payment","Submitted","Status","Evidence / Actions"],(i.memberApplications||[]).map(x=>[x.reference,`${x.member}<small>${x.memberNumber}</small>`,x.project,money(x.amount),`${x.paymentMethod}<small>${x.paymentReference}</small>`,new Date(x.createdAt).toLocaleString(),status(x.status),`<div class="record-actions">${x.hasEvidence?`<a href="/api/member/investments/${x.id}/evidence" target="_blank">${icons.eye} Proof</a>`:""}${x.status==="investment_review"?`<button data-member-investment-decision="approve" data-application-id="${x.id}">Approve</button><button data-member-investment-decision="more_information" data-application-id="${x.id}">More info</button><button class="danger-action" data-member-investment-decision="reject" data-application-id="${x.id}">Reject</button>`:""}</div>`]))}
    ${financeDataTable("Investors and funding sources",["Investor / Source","Project","Funding type","Investment date","Amount","Ownership","Expected returns","Paid","Outstanding","Status"],i.investors.map(x=>[x.investorName,x.project,x.fundingSource,new Date(x.investmentDate).toLocaleDateString(),money(x.amountInvested),`${x.ownershipPercentage}%`,money(x.expectedReturns),money(x.paymentsReceived),money(x.outstandingReturns),status(x.status)]))}`;
}
function investmentRevenueView() {
  const i=state.investment,rows=i.transactions.filter(t=>t.transactionType==="revenue");
  return `<div class="exec-module-metrics">${executiveModuleMetric("Monthly revenue",money(rows.reduce((s,x)=>s+x.amount,0)),"green")}${executiveModuleMetric("Transactions",rows.length,"blue")}${executiveModuleMetric("Top project",[...i.projects].sort((a,b)=>b.revenue-a.revenue)[0]?.name||"?","violet")}${executiveModuleMetric("Revenue sources",new Set(rows.map(x=>x.category)).size,"orange")}</div>
    ${financeDataTable("Investment revenue ledger",["Reference","Date","Project","Category","Description","Amount","Recorded by","Actions"],rows.map(x=>[x.reference,new Date(x.transactionDate).toLocaleDateString(),x.project,x.category,x.description,money(x.amount),x.recordedBy,`<div class="record-actions"><button data-investment-transaction="${x.id}">${icons.eye} View</button>${x.supportingDocument?`<a href="${x.supportingDocument}" target="_blank">${icons.file} File</a>`:""}<button class="danger-action" data-investment-delete="transaction" data-record-id="${x.id}">${icons.trash}</button></div>`]))}`;
}
function investmentExpensesView() {
  const i=state.investment,rows=i.transactions.filter(t=>t.transactionType==="expense");
  return `<div class="exec-module-metrics">${executiveModuleMetric("Monthly expenses",money(rows.reduce((s,x)=>s+x.amount,0)),"red")}${executiveModuleMetric("Cost records",rows.length,"blue")}${executiveModuleMetric("Highest-cost project",[...i.projects].sort((a,b)=>b.expenses-a.expenses)[0]?.name||"?","violet")}${executiveModuleMetric("Cost categories",new Set(rows.map(x=>x.category)).size,"orange")}</div>
    ${financeDataTable("Investment expense ledger",["Reference","Date","Project","Category","Description","Amount","Recorded by","Actions"],rows.map(x=>[x.reference,new Date(x.transactionDate).toLocaleDateString(),x.project,x.category,x.description,money(x.amount),x.recordedBy,`<div class="record-actions"><button data-investment-transaction="${x.id}">${icons.eye} View</button>${x.supportingDocument?`<a href="${x.supportingDocument}" target="_blank">${icons.file} File</a>`:""}<button class="danger-action" data-investment-delete="transaction" data-record-id="${x.id}">${icons.trash}</button></div>`]))}`;
}
function investmentProfitLossView() {
  const i=state.investment;
  return `<div class="exec-analytics-grid">${investmentProfitLossWidget(i)}${investmentTrendWidget(i)}${investmentTopProjectsWidget(i)}
    ${financeDataTable("Project profit and loss",["Project","Revenue","Expenses","Net profit","ROI","Performance"],i.projects.map(p=>[p.name,money(p.revenue),money(p.expenses),`<strong class="${p.profit>=0?"positive":"negative"}">${money(p.profit)}</strong>`,`${p.roi}%`,status(p.performanceStatus)]))}</div>`;
}
function investmentBudgetsView() {
  const i=state.investment;
  return `<div class="finance-budget-cards investment-budget-cards">${i.projects.map(p=>`<article class="${p.budgetUtilization>=100?"danger":p.budgetUtilization>=80?"warning":""}"><div><span>${p.reference}</span>${status(p.status)}</div><h3>${p.name}</h3><p>Budget ${money(p.budget)} - Invested ${money(p.capitalInvested)}</p>${progress("Actual project spending",`${p.budgetUtilization}%`,Math.min(100,p.budgetUtilization),p.budgetUtilization>=80?"amber":"lime")}<small>Spent ${money(p.expenses)} - Budget remaining ${money(Math.max(0,p.budget-p.expenses))}</small></article>`).join("")}</div>`;
}
function investmentAssetsView() {
  const i=state.investment;
  return `<div class="exec-module-metrics">${executiveModuleMetric("Registered assets",i.assets.length,"blue")}${executiveModuleMetric("Acquisition value",money(i.assets.reduce((s,x)=>s+x.acquisitionValue,0)),"violet")}${executiveModuleMetric("Current value",money(i.assets.reduce((s,x)=>s+x.currentValue,0)),"green")}${executiveModuleMetric("Locations",new Set(i.assets.map(x=>x.location)).size,"orange")}</div>
    ${financeDataTable("Investment asset register",["Photo","Asset code","Asset","Type","Project","Acquisition value","Current value","Location","Status","Actions"],i.assets.map(a=>[a.photoUrl?`<img class="asset-table-photo" src="${a.photoUrl}" alt="${escapeHtml(a.assetName)}">`:"?",a.assetCode,a.assetName,a.assetType,a.project||"Portfolio-wide",money(a.acquisitionValue),money(a.currentValue),a.location||"?",status(a.status),`<div class="record-actions"><button data-investment-asset="${a.id}">${icons.eye} View</button><button data-investment-edit="asset" data-record-id="${a.id}">Edit</button><button class="danger-action" data-investment-delete="asset" data-record-id="${a.id}">${icons.trash}</button></div>`]))}`;
}
function investmentContractsView() {
  return financeDataTable("Investment contracts",["Reference","Agreement","Type","Project","Counterparty","Value","Start","End","Status","Document"],state.investment.contracts.map(c=>[c.reference,c.title,c.contractType,c.project||"Portfolio-wide",c.counterparty,money(c.contractValue),c.startsOn?new Date(c.startsOn).toLocaleDateString():"?",c.endsOn?new Date(c.endsOn).toLocaleDateString():"?",status(c.status),c.documentReference||"?"]));
}
function investmentReportsView() {
  const reports=[["Historical Unit Trust Ledger","Imported asset movements through 30 June 2026"],["Investment Portfolio Report","Capital, value, growth and allocation"],["Project Performance Report","Progress, profitability and status"],["Profit & Loss Report","Revenue, expenses and net position"],["Revenue Report","Project income by source"],["Expense Report","Costs by project and category"],["ROI Report","Return comparison across investments"],["Budget Utilization Report","Budget versus actual project spending"],["Investor Report","Funding, ownership and return obligations"],["Annual Investment Report","Complete annual investment pack"]];
  return `<div class="exec-report-grid">${reports.map(([name,desc],index)=>`<article><span class="${["blue","green","violet","orange","teal"][index%5]}">${icons.file}</span><div><h3>${name}</h3><p>${desc}</p><small>Generated from verified portfolio data</small></div><div class="finance-report-actions"><button data-investment-report-preview="${name}">${icons.eye}Preview</button><button data-investment-report="${name}" data-format="excel">${icons.download}Excel</button><button data-investment-report="${name}" data-format="pdf">${icons.file}PDF</button></div></article>`).join("")}</div>`;
}
function investmentAnalyticsView() {
  const i=state.investment;
  return `<div class="exec-analytics-grid">${investmentTrendWidget(i)}${investmentPortfolioWidget(i)}${investmentTopProjectsWidget(i)}${investmentBudgetWidget(i)}
    <section class="finance-panel"><div class="finance-panel-head"><div><h3>Project Progress</h3><p>Completion comparison</p></div></div><div class="finance-spending-list">${i.projects.map(p=>`<div><div><span>${p.name}</span><strong>${p.progress}%</strong></div><div class="exec-track"><i style="width:${p.progress}%"></i></div><small>${p.status} - ${p.performanceStatus.replaceAll("_"," ")}</small></div>`).join("")}</div></section>
    <section class="finance-panel"><div class="finance-panel-head"><div><h3>ROI Comparison</h3><p>Return by project</p></div></div><div class="finance-category-list">${i.projects.map(p=>`<div><span>${p.name}</span><i><b style="width:${Math.max(0,Math.min(100,p.roi*4))}%"></b></i><strong>${p.roi}%</strong></div>`).join("")}</div></section></div>`;
}
function investmentDocumentsView() {
  return `<div class="exec-document-groups">${["Policies","Signed Contracts","Investment Proposals","Performance Reports"].map(type=>{const docs=state.investment.documents.filter(d=>d.documentType===type);return `<section class="finance-panel"><div class="finance-panel-head"><div><h3>${type}</h3><p>${docs.length} investment document${docs.length===1?"":"s"}</p></div></div>${docs.map(d=>`<div class="exec-document-row"><span>${icons.file}</span><div><strong>${d.title}</strong><small>${d.reference} - Version ${d.version}</small></div>${status(d.status)}${d.hasFile?`<div class="document-actions"><a href="/api/documents/${d.id}/view" target="_blank">${icons.eye}View</a><a href="/api/documents/${d.id}/download">${icons.download}</a></div>`:`<span class="status pending">No file</span>`}</div>`).join("")||`<div class="exec-empty">No documents in this category.</div>`}</section>`}).join("")}</div>`;
}
function investmentNotificationsView() {
  return `<section class="finance-panel"><div class="exec-notification-page">${state.investment.notifications.map(n=>`<article><span>${icons.bell}</span><div><small>${n.level}</small><h3>${n.title}</h3><p>Investment Department portfolio alert</p></div><time>${relativeTime(n.createdAt||n.time)}</time><button>Mark read</button></article>`).join("")}</div></section>`;
}
function investmentSettingsView() {
  return `<div class="settings-grid"><div class="card setting-card"><div class="card-head" style="padding:0 0 16px"><div><h2 class="card-title">Portfolio controls</h2><p class="card-subtitle">Performance and monitoring rules</p></div></div>
    <div class="setting-row"><div class="setting-icon">${icons.reports}</div><div class="setting-copy"><strong>ROI monitoring</strong><span>Project revenue, expenses and invested capital update ROI automatically</span></div>${status("active")}</div>
    <div class="setting-row"><div class="setting-icon">${icons.clock}</div><div class="setting-copy"><strong>Milestone alerts</strong><span>Upcoming completion dates and underperforming progress are highlighted</span></div>${status("active")}</div>
    <div class="setting-row"><div class="setting-icon">${icons.approvals}</div><div class="setting-copy"><strong>Executive proposal authority</strong><span>Financially analyzed proposals require Executive decision before funding</span></div>${status("active")}</div></div>
    <div class="card setting-card"><div class="card-head" style="padding:0 0 16px"><div><h2 class="card-title">Department boundaries</h2><p class="card-subtitle">Enforced by server permissions</p></div></div>
    <div class="setting-row"><div class="setting-icon">${icons.lock}</div><div class="setting-copy"><strong>Credits isolation</strong><span>Investment cannot access member savings, loans, guarantors or repayments</span></div>${status("active")}</div>
    <div class="setting-row"><div class="setting-icon">${icons.lock}</div><div class="setting-copy"><strong>Finance isolation</strong><span>Project tracking does not permit editing organization cashbooks or bank accounts</span></div>${status("active")}</div>
    <div class="setting-row"><div class="setting-icon">${icons.audit}</div><div class="setting-copy"><strong>Audit trail</strong><span>Projects, proposals, income, costs and decisions are permanently logged</span></div>${status("active")}</div></div></div>`;
}
function investmentSearchView() {
  const results=state.investmentSearchResults||[];
  return `<div class="exec-search-summary">${icons.search}<div><strong>${results.length} investment result${results.length===1?"":"s"}</strong><span>for &quot;${escapeHtml(state.investmentSearchTerm||"")}&quot;</span></div></div><section class="finance-panel"><div class="exec-global-results">${results.map(r=>`<button data-investment-page="${r.target}"><span>${r.type}</span><div><strong>${r.title}</strong><small>${r.reference} - ${r.detail||""}</small></div><b>&gt;</b></button>`).join("")||`<div class="exec-empty">Type at least two characters to search Investment.</div>`}</div></section>`;
}
function investmentProjectOptions() {
  return state.investment.projects.map(p=>`<option value="${p.id}">${p.reference} - ${p.name}</option>`).join("");
}
function approvedInvestmentProposalOptions(){const used=new Set(state.investment.projects.map(p=>p.proposalId).filter(Boolean).map(String));return state.investment.proposals.filter(p=>["approved","funded"].includes(p.status)&&!used.has(String(p.id))).map(p=>`<option value="${p.id}">${p.reference} - ${escapeHtml(p.title)} - ${money(p.estimatedCost)}</option>`).join("");}
function openInvestmentModal(type,existing=null) {
  const transactionType=type==="expense"?"expense":"revenue";
  const forms={
    project:["Add investment project","Register a monitored income-generating venture",`<form class="form" data-investment-form="project"><div class="form-grid"><div class="field full"><label>Project name</label><input name="name" required></div><div class="field"><label>Category</label><select name="category"><option>Real Estate</option><option>Agriculture</option><option>Transport</option><option>Retail & Trade</option><option>Manufacturing</option><option>Hospitality</option><option>Other</option></select></div><div class="field"><label>Location</label><input name="location" required></div><div class="field"><label>Budget (UGX)</label><input name="budget" type="number" min="1" required></div><div class="field"><label>Capital invested</label><input name="capitalInvested" type="number" min="0"></div><div class="field"><label>Current value</label><input name="currentValue" type="number" min="0"></div><div class="field"><label>Expected return</label><input name="expectedReturn" type="number" min="0"></div><div class="field"><label>Status</label><select name="status"><option>planning</option><option>active</option><option>construction</option><option>completed</option></select></div><div class="field"><label>Progress (%)</label><input name="progress" type="number" min="0" max="100" value="0"></div><div class="field"><label>Manager</label><input name="manager"></div><div class="field"><label>Funding source</label><input name="fundingSource" value="Organization Capital"></div><div class="field"><label>Start date</label><input name="startDate" type="date"></div><div class="field"><label>Completion date</label><input name="completionDate" type="date"></div><div class="field full"><label>Description</label><textarea name="description" required></textarea></div><div class="field full"><label>Document reference</label><input name="supportingDocument"></div></div>${formActions("Register project")}</form>`],
    proposal:["Create investment proposal","Begin the review and Executive approval workflow",`<form class="form" data-investment-form="proposal"><div class="form-grid"><div class="field full"><label>Proposal title</label><input name="title" required></div><div class="field"><label>Category</label><select name="category"><option>Real Estate</option><option>Agriculture</option><option>Transport</option><option>Retail & Trade</option><option>Manufacturing</option><option>Hospitality</option><option>Other</option></select></div><div class="field"><label>Estimated cost</label><input name="estimatedCost" type="number" min="1" required></div><div class="field"><label>Expected revenue</label><input name="expectedRevenue" type="number" min="0" required></div><div class="field"><label>Expected ROI (%)</label><input name="expectedRoi" type="number" step=".1" required></div><div class="field full"><label>Description</label><textarea name="description" required></textarea></div><div class="field full"><label>Risk assessment</label><textarea name="riskAssessment" required></textarea></div><div class="field full"><label>Recommendation</label><textarea name="recommendation"></textarea></div><div class="field full"><label>Supporting document</label><input name="supportingDocument"></div></div>${formActions("Create proposal")}</form>`],
    revenue:[`Record project revenue`,`Post income to a specific investment project`,`<form class="form" data-investment-form="transaction"><input type="hidden" name="transactionType" value="${transactionType}"><div class="form-grid"><div class="field full"><label>Project</label><select name="projectId">${investmentProjectOptions()}</select></div><div class="field"><label>Revenue category</label><select name="category"><option>Rental Income</option><option>Sales Revenue</option><option>Service Income</option><option>Agricultural Income</option><option>Dividends</option><option>Interest Earned</option><option>Other Investment Income</option></select></div><div class="field"><label>Amount</label><input name="amount" type="number" min="1" required></div><div class="field"><label>Date</label><input name="date" type="date" value="${new Date().toISOString().slice(0,10)}"></div><div class="field full"><label>Description</label><textarea name="description" required></textarea></div><div class="field full"><label>Supporting document</label><input name="supportingDocument"></div></div>${formActions("Record revenue")}</form>`],
    expense:[`Record project expense`,`Track a cost against a specific project`,`<form class="form" data-investment-form="transaction"><input type="hidden" name="transactionType" value="${transactionType}"><div class="form-grid"><div class="field full"><label>Project</label><select name="projectId">${investmentProjectOptions()}</select></div><div class="field"><label>Expense category</label><select name="category"><option>Construction Costs</option><option>Maintenance</option><option>Salaries</option><option>Utilities</option><option>Repairs</option><option>Marketing</option><option>Taxes</option><option>Insurance</option><option>Operational Costs</option></select></div><div class="field"><label>Amount</label><input name="amount" type="number" min="1" required></div><div class="field"><label>Date</label><input name="date" type="date" value="${new Date().toISOString().slice(0,10)}"></div><div class="field full"><label>Description</label><textarea name="description" required></textarea></div><div class="field full"><label>Supporting document</label><input name="supportingDocument"></div></div>${formActions("Record expense")}</form>`],
    investor:["Add investor or funding source","Track capital, ownership and expected returns",`<form class="form" data-investment-form="investor"><div class="form-grid"><div class="field full"><label>Project</label><select name="projectId">${investmentProjectOptions()}</select></div><div class="field"><label>Investor / Funding source name</label><input name="investorName" required></div><div class="field"><label>Funding type</label><select name="fundingSource"><option>Member investment</option><option>Organizational capital</option><option>Grant</option><option>Partnership capital</option><option>Loan funding</option></select></div><div class="field"><label>Amount invested</label><input name="amountInvested" type="number" min="1" required></div><div class="field"><label>Ownership percentage</label><input name="ownershipPercentage" type="number" min="0" max="100" step=".01"></div><div class="field"><label>Expected returns</label><input name="expectedReturns" type="number" min="0"></div><div class="field"><label>Investment date</label><input name="investmentDate" type="date" value="${new Date().toISOString().slice(0,10)}"></div></div>${formActions("Add funding source")}</form>`],
    contract:["Add investment contract","Store a commercial agreement and renewal dates",`<form class="form" data-investment-form="contract"><div class="form-grid"><div class="field"><label>Project</label><select name="projectId"><option value="">Portfolio-wide</option>${investmentProjectOptions()}</select></div><div class="field"><label>Contract type</label><select name="contractType"><option>Contractor Agreement</option><option>Supplier Contract</option><option>Lease Agreement</option><option>Partnership Agreement</option><option>Insurance Document</option></select></div><div class="field full"><label>Agreement title</label><input name="title" required></div><div class="field"><label>Counterparty</label><input name="counterparty" required></div><div class="field"><label>Contract value</label><input name="contractValue" type="number" min="0"></div><div class="field"><label>Start date</label><input name="startDate" type="date"></div><div class="field"><label>End date</label><input name="endDate" type="date"></div><div class="field full"><label>Document reference</label><input name="documentReference"></div></div>${formActions("Register contract")}</form>`],
    asset:["Register investment asset","Track property assigned to the portfolio",`<form class="form" data-investment-form="asset"><div class="form-grid"><div class="field"><label>Asset code</label><input name="assetCode" required></div><div class="field"><label>Project</label><select name="projectId"><option value="">Portfolio-wide</option>${investmentProjectOptions()}</select></div><div class="field full"><label>Asset name</label><input name="assetName" required></div><div class="field"><label>Asset type</label><select name="assetType"><option>Building</option><option>Land</option><option>Vehicle</option><option>Equipment</option><option>Furniture</option></select></div><div class="field"><label>Acquisition value</label><input name="acquisitionValue" type="number" min="0" required></div><div class="field"><label>Current value</label><input name="currentValue" type="number" min="0"></div><div class="field"><label>Location</label><input name="location"></div></div>${formActions("Register asset")}</form>`]
  };
  const [title,subtitle,form]=forms[type]||forms.project;
  document.body.insertAdjacentHTML("beforeend",`<div class="modal-backdrop" id="modal-backdrop"><div class="modal"><div class="modal-head"><div><h2>${title}</h2><p>${subtitle}</p></div><button class="modal-close" data-close>${icons.x}</button></div>${form}</div></div>`);
  document.querySelector("[data-close]").onclick=closeModal;const investmentForm=document.querySelector("[data-investment-form]");
  if(type==="project"&&!existing)investmentForm.querySelector(".form-grid").insertAdjacentHTML("afterbegin",`<div class="field full"><label>Executive-approved proposal</label><select name="proposalId" required><option value="">Select approved proposal</option>${approvedInvestmentProposalOptions()}</select><small>Finance analysis and Executive approval must be completed first.</small></div>`);
  if(type==="project")investmentForm.querySelector(".form-grid").insertAdjacentHTML("beforeend",`<label class="field check-field"><input name="openToMembers" type="checkbox" checked><span>Open this project to member investments</span></label><div class="field"><label>Minimum member investment</label><input name="minimumMemberInvestment" type="number" min="0" step="1000" value="50000"></div><div class="field"><label>Expected member return (%)</label><input name="memberExpectedReturnRate" type="number" min="0" step=".1" value="10"></div><div class="field"><label>Member investment deadline</label><input name="memberInvestmentDeadline" type="date"></div>`);
  enhanceDepartmentRecordForm(investmentForm,{department:"investment",attachment:["project","proposal","transaction","contract","asset"].includes(type),photo:["project","asset"].includes(type)});
  if(existing){investmentForm.dataset.recordId=existing.id;document.querySelector("#modal-backdrop .modal-head h2").textContent=`Edit ${type}`;populateInvestmentForm(investmentForm,type,existing);}
  investmentForm.onsubmit=submitInvestmentForm;
}
function populateInvestmentForm(form,type,record) {
  const mappings=type==="project"?{name:"name",category:"category",location:"location",budget:"budget",capitalInvested:"capitalInvested",currentValue:"currentValue",expectedReturn:"expectedReturn",status:"status",progress:"progress",manager:"manager",fundingSource:"fundingSource",startDate:"startsOn",completionDate:"endsOn",description:"description",minimumMemberInvestment:"minimumMemberInvestment",memberExpectedReturnRate:"memberExpectedReturnRate",memberInvestmentDeadline:"memberInvestmentDeadline"}:
    type==="asset"?{assetCode:"assetCode",projectId:"projectId",assetName:"assetName",assetType:"assetType",acquisitionValue:"acquisitionValue",currentValue:"currentValue",location:"location",status:"status"}:
    type==="proposal"?{title:"title",category:"category",estimatedCost:"estimatedCost",expectedRevenue:"expectedRevenue",expectedRoi:"expectedRoi",description:"description",riskAssessment:"riskAssessment",recommendation:"recommendation"}:
    type==="investor"?{projectId:"projectId",investorName:"investorName",fundingSource:"fundingSource",amountInvested:"amountInvested",ownershipPercentage:"ownershipPercentage",expectedReturns:"expectedReturns",investmentDate:"investmentDate",status:"status"}:
    type==="contract"?{projectId:"projectId",contractType:"contractType",title:"title",counterparty:"counterparty",contractValue:"contractValue",startDate:"startsOn",endDate:"endsOn"}:{};
  Object.entries(mappings).forEach(([name,key])=>{const input=form.elements[name],value=record[key];if(input&&value!==null&&value!==undefined)input.value=input.type==="date"?String(value).slice(0,10):value;});
  if(type==="project"&&form.elements.openToMembers)form.elements.openToMembers.checked=Boolean(record.openToMembers);
}
async function submitInvestmentForm(event) {
  event.preventDefault();const form=event.currentTarget,type=form.dataset.investmentForm,recordId=form.dataset.recordId;
  const endpoints={project:"/api/investment/projects",proposal:"/api/investment/proposals",transaction:"/api/investment/transactions",investor:"/api/investment/investors",contract:"/api/investment/contracts",asset:"/api/investment/assets"};
  const button=form.querySelector("button[type=submit]");button.disabled=true;button.textContent="Saving?";
  try{const data=await departmentFormPayload(form);const url=recordId?`${endpoints[type]}/${recordId}`:endpoints[type];const result=await api(url,{method:recordId?"PATCH":"POST",body:JSON.stringify(data)});closeModal();state.investment=await api("/api/investment/command-center");render();toast(`${type==="transaction"?data.transactionType:type} record ${recordId?"updated":"saved"}${result.reference?` - ${result.reference}`:""}.`);}catch(error){button.disabled=false;button.textContent="Try again";toast(error.message);}
}
async function advanceInvestmentProposal(id) {
  if(!await confirmDialog("Advance this proposal to the next controlled workflow stage?"))return;
  try{const result=await api(`/api/investment/proposals/${id}/advance`,{method:"POST",body:"{}"});state.investment=await api("/api/investment/command-center");render();toast(result.status==="executive_approval"?"Proposal sent to Executive Approvals.":`Proposal advanced to ${result.status.replaceAll("_"," ")}.`);}catch(error){toast(error.message);}
}
async function decideMemberInvestment(id,decision){let comment="";if(decision!=="approve"){comment=await promptDialog(decision==="reject"?"Reason for rejecting this investment request:":"What more information should the member provide?","");if(comment===null)return;}if(!await confirmDialog(`${decision.replaceAll("_"," ")} this member investment request?`))return;try{const result=await api(`/api/investment/member-applications/${id}/decision`,{method:"POST",body:JSON.stringify({decision,comment})});state.investment=await api("/api/investment/command-center");render();toast(`Member investment moved to ${result.status.replaceAll("_"," ")}.`);}catch(error){toast(error.message);}}
function investmentProjectDetails(id) {
  const i=state.investment,p=i.projects.find(x=>String(x.id)===String(id));if(!p)return;
  detailModal("Investment project",`${p.reference} - ${p.category}`,[["Project",p.name],["Photo",p.photoUrl?`<img class="record-photo-preview" src="${p.photoUrl}" alt="${escapeHtml(p.name)}">`:"No photo uploaded"],["Description",p.description],["Location",p.location||"?"],["Manager",p.manager||"?"],["Funding source",p.fundingSource||"?"],["Budget",money(p.budget)],["Capital invested",money(p.capitalInvested)],["Current value",money(p.currentValue)],["Revenue",money(p.revenue)],["Expenses",money(p.expenses)],["Net profit",money(p.profit)],["ROI",`${p.roi}%`],["Progress",`${p.progress}%`],["Performance",p.performanceStatus],["Supporting file",p.supportingDocument?`<a class="button secondary" href="${p.supportingDocument}" target="_blank">${icons.eye} View file</a>`:"No file uploaded"]]);
}
function investmentAssetDetails(id){const a=state.investment.assets.find(x=>String(x.id)===String(id));if(!a)return;detailModal("Investment asset",`${a.assetCode} - ${a.assetName}`,[["Photo",a.photoUrl?`<img class="record-photo-preview" src="${a.photoUrl}" alt="${escapeHtml(a.assetName)}">`:"No photo uploaded"],["Type",a.assetType],["Project",a.project||"Portfolio-wide"],["Acquisition value",money(a.acquisitionValue)],["Current value",money(a.currentValue)],["Location",a.location||"?"],["Status",a.status],["Supporting file",a.supportingDocument?`<a class="button secondary" href="${a.supportingDocument}" target="_blank">${icons.eye} View file</a>`:"No file uploaded"]]);}
function investmentTransactionDetails(id){const t=state.investment.transactions.find(x=>String(x.id)===String(id));if(!t)return;detailModal("Investment transaction",`${t.reference} - ${t.transactionType}`,[["Project",t.project],["Category",t.category],["Description",t.description],["Amount",money(t.amount)],["Date",new Date(t.transactionDate).toLocaleDateString()],["Recorded by",t.recordedBy],["Supporting file",t.supportingDocument?`<a class="button secondary" href="${t.supportingDocument}" target="_blank">${icons.eye} View file</a>`:"No file uploaded"]]);}
async function deleteInvestmentRecord(type,id){const labels={project:"project",asset:"asset",transaction:"revenue/expense record"};if(!await confirmDialog(`Delete this ${labels[type]||type}? The action is retained in the audit log.`))return;try{await api(`/api/investment/${type==="project"?"projects":type==="asset"?"assets":"transactions"}/${id}`,{method:"DELETE"});state.investment=await api("/api/investment/command-center");render();toast(`${labels[type]||type} removed from active records.`);}catch(error){toast(error.message);}}
function investmentProposalDetails(id) {
  const p=state.investment.proposals.find(x=>String(x.id)===String(id));if(!p)return;
  detailModal("Investment proposal",`${p.reference} - ${p.category}`,[["Title",p.title],["Description",p.description],["Estimated cost",money(p.estimatedCost)],["Expected revenue",money(p.expectedRevenue)],["Expected ROI",`${p.expectedRoi}%`],["Risk assessment",p.riskAssessment],["Recommendation",p.recommendation||"?"],["Status",p.status],["Created by",p.createdBy]]);
}
function downloadInvestmentReport(name,format="excel") { downloadGeneratedReport("investment",name,format); }
function creditsDashboardView() {
  const c=state.credits;if(!c)return `<div class="executive-loading">Loading Credits workspace?</div>`;
  const s=c.stats;
  const pendingRepays=(c.verificationQueue||[]).filter(x=>x.type==="Loan repayment");
  const pendingQueue=c.verificationQueue||[];
  const cards=[
    ["SACCO Members",s.totalMembers,"members","credits-members","Active SACCO accounts"],
    ["Total Savings",money(s.totalSavings),"wallet","credits-savings",`${s.savingsGrowth}% growth this month`],
    ["Available Funds",money(s.availableFunds),"savings","credits-analytics","Available for lending"],
    ["Active Loans",s.activeLoans,"loans","credits-active",money(c.portfolio.outstanding)],
    ["Pending Applications",s.pendingApplications,"file","credits-applications","Across approval stages"],
    ["Awaiting Disbursement",s.awaitingDisbursement,"wallet","credits-disbursement","Approved facilities"],
    ["Repayments to approve",s.pendingRepaymentVerifications||pendingRepays.length,"receipt","credits-repayments",c.primaryCreditsOfficer?`Assigned to ${c.primaryCreditsOfficer}`:"Member payments awaiting verification"],
    ["Overdue Loans",s.overdueLoans,"clock","credits-recovery","Recovery attention"],
    ["Loan Recovery Rate",`${s.recoveryRate}%`,"reports","credits-analytics","Scheduled principal recovered"],
    ["Interest Earned (Month)",money(s.interestEarned),"receipt","credits-charges","From repayments"],
    ["Savings Growth (Month)",`${s.savingsGrowth}%`,"arrowUp","credits-analytics",money(c.savings.monthlyDeposits)],
    ["Guarantors Pending",s.pendingGuarantors,"users","credits-guarantors","Awaiting confirmation"],
    ["Applications Under Review",s.applicationsUnderReview,"approvals","credits-approvals","Officer and committee"]
  ];
  const approvalBanner=pendingRepays.length?`<div class="credits-verification-banner"><div>${icons.bell}<span><strong>${pendingRepays.length} loan repayment${pendingRepays.length===1?"":"s"} awaiting your approval</strong><small>${c.primaryCreditsOfficer?`${c.primaryCreditsOfficer} (Credits Officer)`:"Credits Officer"} — open Repayments, verify the receipt, then approve to update the member loan.</small></span></div></div>`:"";
  return `<div class="finance-title-strip credits-title-strip"><div><p class="eyebrow">Credits Department - SACCO</p><h2>Savings and credit control center</h2><p>Member savings, loans, guarantors and recovery only?organization Finance remains separate.</p></div><time>${new Date().toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</time></div>
    ${approvalBanner}
    <div class="finance-stat-grid credits-stat-grid">${cards.slice(0,8).map((card,index)=>creditsStatCard(...card,index)).join("")}</div>
    ${creditsApprovalQueueWidget(c,pendingQueue)}
    ${creditsContributionProgress(c)}
    <div class="credits-dashboard-grid">
      ${creditsSavingsLoanChart(c)}${creditsPortfolioWidget(c)}${creditsPendingApplicationsWidget(c)}
      ${creditsSavingsOverviewWidget(c)}${creditsRecoveryWidget(c)}${creditsGuarantorWidget(c)}
    </div>
    <div class="credits-lower-grid">${creditsTransactionsWidget(c)}${creditsDisbursementWidget(c)}${creditsNotificationsWidget(c)}</div>
    ${creditsQuickPanel()}`;
}
function creditsApprovalQueueWidget(c,rows=[]) {
  if(!rows.length)return "";
  return `<section class="finance-panel credits-approval-queue"><div class="finance-panel-head"><div><h3>Payments awaiting approval</h3><p>${c.primaryCreditsOfficer?`Routed to ${c.primaryCreditsOfficer} (Credits Officer)`:"Credits Officer verification queue"}</p></div><button data-credits-page="credits-repayments">Open repayments ></button></div>
    <div class="credits-application-list">${rows.map(t=>`<article class="credits-queue-row"><div class="credits-row-main"><strong>${escapeHtml(t.member)}</strong><small><span class="credits-ref" title="${escapeHtml(t.reference)}">${escapeHtml(displayRef(t.reference))}</span>${t.loanReference?`<span class="credits-ref" title="${escapeHtml(t.loanReference)}">${escapeHtml(displayRef(t.loanReference))}</span>`:""}<span>${escapeHtml(t.type)}</span></small></div><div class="credits-row-actions"><b>${money(t.amount)}</b>${status("pending")}<button type="button" class="credits-review-btn" data-credits-transaction="${t.id}">${icons.eye}<span>Review</span></button></div></article>`).join("")}</div></section>`;
}
function creditsStatCard(label,value,icon,target,note,index) {
  const colors=["blue","green","violet","red","orange","violet","red","teal","green","blue","violet","orange"];
  return `<button class="finance-stat-card credits-stat-card" data-credits-page="${target}"><span class="${colors[index]}">${icons[icon]}</span><div><small>${label}</small><strong>${value}</strong><em>${note}</em></div><b>View details ></b></button>`;
}
function creditsContributionProgress(c) {
  const p=c.contributionProgress,past=c.pastContributionProgress;if(!p&&!past)return "";
  const variance=p?Number(p.verifiedSavings)-Number(p.expectedSavingsToDate):0,rate=p?.expectedSavingsToDate?Math.round(p.verifiedSavings/p.expectedSavingsToDate*100):0;
  const pastVariance=Number(past?.variance||0),pastRate=past?.expected?Math.round(Number(past.totalPaid)/Number(past.expected)*100):0;
  return `<section class="finance-panel credits-contribution-panel"><div class="finance-panel-head"><div><h3>Member Savings Targets by Financial Year</h3><p>Past-year arrears stay separate from the current target; lifetime savings includes both.</p></div><button data-credits-page="credits-members">Member progress &gt;</button></div>
    <div class="credits-year-progress-grid">
      ${past?`<article class="credits-year-card past"><header><span>${past.fiscalYear}</span><strong>Past-year completion</strong></header><div class="credits-year-metrics"><div><span>Paid by 30 June</span><strong>${money(past.paidAtClose)}</strong></div><div><span>Arrears cleared later</span><strong>${money(past.arrearsPaid)}</strong></div><div><span>Adjusted total</span><strong>${money(past.totalPaid)}</strong></div><div><span>Expected target</span><strong>${money(past.expected)}</strong></div></div>${progress("Past-year collection",`${pastRate}%`,Math.min(100,pastRate),pastVariance<0?"orange":"lime")}<small class="${pastVariance<0?"negative":"positive"}">${pastVariance<0?`Outstanding arrears: ${money(Math.abs(pastVariance))}`:`Surplus: ${money(pastVariance)}`}</small></article>`:""}
      ${p?`<article class="credits-year-card current"><header><span>${p.fiscalYear}</span><strong>Current-year target</strong></header><div class="credits-year-metrics"><div><span>Expected to date</span><strong>${money(p.expectedSavingsToDate)}</strong></div><div><span>Verified savings</span><strong>${money(p.verifiedSavings)}</strong></div><div><span>Annual shares</span><strong>${money(p.verifiedShares)} / ${money(p.expectedShares)}</strong></div><div><span>Subscriptions</span><strong>${money(p.verifiedSubscriptions)} / ${money(p.expectedSubscriptions)}</strong></div></div>${progress("Current-year collection",`${rate}%`,Math.min(100,rate),variance<0?"orange":"lime")}<small class="${variance<0?"negative":"positive"}">${variance<0?`Short by ${money(Math.abs(variance))}`:`Ahead by ${money(variance)}`}</small></article>`:""}
    </div><div class="credits-lifetime-total"><span>Total lifetime member funds</span><strong>${money(p?.totalMemberFunds||0)}</strong><small>All verified savings since joining plus share capital</small></div></section>`;
}function creditsSavingsLoanChart(c) {
  const max=Math.max(...c.monthly.flatMap(x=>[x.savings,x.loans]),1);
  return `<section class="finance-panel credits-chart-panel"><div class="finance-panel-head"><div><h3>Savings vs Loan Portfolio</h3><p>Six-month SACCO position</p></div><button data-credits-page="credits-analytics">Analytics ></button></div>
    <div class="finance-summary-row"><span>Total savings<strong class="positive">${money(c.savings.totalSavings)}</strong></span><span>Outstanding loans<strong>${money(c.portfolio.outstanding)}</strong></span><span>Available to lend<strong>${money(c.stats.availableFunds)}</strong></span></div>
    <div class="credits-combo-chart">${c.monthly.map(x=>`<div><div><i style="height:${x.savings/max*100}%"></i><i class="loan" style="height:${x.loans/max*100}%"></i></div><span>${x.month}</span></div>`).join("")}</div>
    <div class="exec-legend"><span><i class="saving"></i>Savings</span><span><i class="loan"></i>Loans</span></div></section>`;
}
function creditsPortfolioWidget(c) {
  const total=Math.max(1,c.portfolio.active+c.portfolio.completed+c.portfolio.pending+c.portfolio.rejected);
  const performing=Math.max(0,c.portfolio.active-c.portfolio.arrears),performingPct=Math.round(performing/Math.max(c.portfolio.active,1)*100);
  return `<section class="finance-panel"><div class="finance-panel-head"><div><h3>Loan Portfolio Overview</h3><p>Status and portfolio quality</p></div><button data-credits-page="credits-approvals">View loans ></button></div>
    <div class="credits-portfolio"><div class="credits-donut" style="--performing:${performingPct}"><strong>${c.portfolio.active}</strong><span>Active loans</span></div><div class="credits-portfolio-legend">
      ${[["Performing",performing,"green"],["In arrears",c.portfolio.arrears,"red"],["Pending",c.portfolio.pending,"orange"],["Completed",c.portfolio.completed,"blue"],["Rejected",c.portfolio.rejected,"violet"]].map(([label,value,color])=>`<div><i class="${color}"></i><span>${label}</span><strong>${value} - ${Math.round(value/total*100)}%</strong></div>`).join("")}</div></div></section>`;
}
function creditsPendingApplicationsWidget(c) {
  const rows=c.loans.filter(l=>["pending","review","pending-guarantors","officer-review","committee-review","correction","finance-verification","executive-authorization"].includes(l.status)).slice(0,5);
  return `<section class="finance-panel credits-pending-apps"><div class="finance-panel-head"><div><h3>Pending Loan Applications</h3><p>Applications requiring progress</p></div><button data-credits-page="credits-applications">View all ></button></div>
    <div class="credits-application-list">${rows.map(l=>`<article class="credits-queue-row"><div class="credits-row-main"><strong>${escapeHtml(l.member)}</strong><small><span class="credits-ref" title="${escapeHtml(l.reference)}">${escapeHtml(displayRef(l.reference))}</span><span>${new Date(l.createdAt).toLocaleDateString()}</span></small></div><div class="credits-row-actions"><b>${money(l.amount)}</b>${status(l.status)}<button type="button" class="credits-icon-btn" data-loan-detail-id="${l.id}" title="View full process">${icons.eye}</button></div></article>`).join("")||`<div class="exec-empty">No pending applications.</div>`}</div></section>`;
}
function creditsSavingsOverviewWidget(c) {
  const s=c.savings;
  return `<section class="finance-panel"><div class="finance-panel-head"><div><h3>Savings Overview</h3><p>Member deposits and withdrawals</p></div><button data-credits-page="credits-savings">Savings ledger ></button></div><div class="credits-summary-cards">
    ${[["Total savings",s.totalSavings,"green"],["Today's deposits",s.depositsToday,"blue"],["Monthly deposits",s.monthlyDeposits,"violet"],["Withdrawals",s.withdrawals,"orange"]].map(([label,value,color])=>`<div class="${color}"><span>${label}</span><strong>${money(value)}</strong></div>`).join("")}</div>${progress("Savings growth",`${s.growth}%`,Math.max(0,Math.min(100,s.growth*5)),"lime")}</section>`;
}
function creditsRecoveryWidget(c) {
  const danger=c.loans.filter(l=>l.inDangerPeriod&&Number(l.balance)>0).slice(0,5);
  const rows=c.loans.filter(l=>l.status==="overdue"||l.daysOverdue>0&&l.balance>0).slice(0,5);
  return `<section class="finance-panel"><div class="finance-panel-head"><div><h3>Loan Recovery & danger alerts</h3><p>5-day grace window, then 5% on principal only</p></div><button data-credits-page="credits-recovery">Recovery desk ></button></div>
    ${danger.length?`<div class="credits-danger-banner"><strong>${danger.length} loan${danger.length===1?"":"s"} in danger period</strong><small>Due date reached — grace ends in up to 5 days. Remind members before the principal penalty.</small></div>
      <div class="credits-recovery-list danger">${danger.map(l=>`<div><div><strong>${l.member}</strong><small>${l.reference} · due ${l.nextDueDate?new Date(l.nextDueDate).toLocaleDateString():"—"} · next ${money(l.nextPaymentAmount||0)}</small></div><b>${money(l.balance)}</b><button data-credits-recover="${l.id}">Remind</button></div>`).join("")}</div>`:""}
    <div class="credits-recovery-list">${rows.map(l=>`<div><div><strong>${l.member}</strong><small>${l.reference} - ${l.daysOverdue} days overdue (after grace)</small></div><b>${money(l.balance)}</b><button data-credits-recover="${l.id}">Follow up</button></div>`).join("")||(danger.length?"":`<div class="exec-empty">No overdue loans.</div>`)}</div></section>`;
}
function creditsGuarantorWidget(c) {
  const g=c.guarantorSummary;
  return `<section class="finance-panel"><div class="finance-panel-head"><div><h3>Guarantors Overview</h3><p>Capacity and confirmation status</p></div><button data-credits-page="credits-guarantors">View all ></button></div><div class="credits-guarantor-summary">
    ${[["Active guarantees",g.totalActive,"green"],["Guaranteed amount",money(g.guaranteedAmount),"blue"],["Pending confirmations",g.pending,"orange"],["Declined requests",g.rejected,"red"],["Over-guaranteed members",g.overGuaranteed,"violet"]].map(([label,value,color])=>`<div><span class="${color}">${icons.users}</span><strong>${label}</strong><b>${value}</b></div>`).join("")}</div></section>`;
}
function creditsTransactionsWidget(c) {
  return `<section class="finance-panel"><div class="finance-panel-head"><div><h3>Recent Savings Transactions</h3><p>Deposits, withdrawals and repayments</p></div><button data-credits-page="credits-savings">View all ></button></div><div class="table-scroll"><table class="finance-compact-table"><thead><tr><th>Receipt</th><th>Member</th><th>Type</th><th>Amount</th><th>Financial year</th><th>Date</th><th>Officer</th><th>Status</th></tr></thead><tbody>${c.transactions.slice(0,8).map(t=>`<tr><td>${t.receiptNumber}</td><td class="cell-main">${t.member}</td><td>${t.type}</td><td>${money(t.amount)}</td><td>${t.targetFiscalYear?`FY ending ${t.targetFiscalYear}`:"By transaction date"}</td><td>${new Date(t.createdAt).toLocaleDateString()}</td><td>${t.officer}</td><td>${status(t.status)}</td></tr>`).join("")}</tbody></table></div></section>`;
}
function creditsDisbursementWidget(c) {
  return `<section class="finance-panel"><div class="finance-panel-head"><div><h3>Disbursement & Repayments</h3><p>This month's SACCO movement</p></div><button data-credits-page="credits-disbursement">Open desk ></button></div><div class="credits-summary-cards">
    <div class="violet"><span>Amount disbursed</span><strong>${money(c.portfolio.disbursedMonth)}</strong></div>
    <div class="green"><span>Amount repaid</span><strong>${money(c.transactions.filter(t=>t.type==="Loan repayment"&&new Date(t.createdAt).getMonth()===new Date().getMonth()).reduce((n,t)=>n+t.amount,0))}</strong></div>
    <div class="blue"><span>Recovery rate</span><strong>${c.stats.recoveryRate}%</strong></div>
    <div class="orange"><span>Interest earned</span><strong>${money(c.stats.interestEarned)}</strong></div></div></section>`;
}
function creditsNotificationsWidget(c) {
  return `<section class="finance-panel"><div class="finance-panel-head"><div><h3>Notifications</h3><p>SACCO alerts requiring attention</p></div><button data-credits-page="credits-notifications">View all ></button></div><div class="finance-notifications">${c.notifications.map(n=>`<button type="button" class="finance-notification-item ${n.level}" ${n.target?`data-credits-page="${n.target}"`:""} ${n.transactionId?`data-credits-transaction="${n.transactionId}"`:""}><span>${n.level==="success"?icons.check:icons.info}</span><div><strong>${escapeHtml(n.title)}</strong>${n.detail?`<small>${escapeHtml(n.detail)}</small>`:""}</div><time>${relativeTime(n.createdAt||n.time)}</time></button>`).join("")}</div></section>`;
}
function creditsQuickPanel() {
  if(isExecutiveReadOnly()) return `<div class="notice"><div>${icons.shield}</div><div><strong>Executive read-only mode</strong><p>You can inspect the live Credits dashboard. Recording deposits, loans and repayments remains with Credits officers.</p></div></div>`;
  return `<div class="exec-floating"><button class="exec-fab credits-fab" data-action="credits-quick">${icons.plus}<span>Quick Actions</span></button>${state.creditsQuickOpen?`<div class="exec-quick-menu">
    <button data-credits-modal="deposit">${icons.savings}Record deposit</button><button data-credits-modal="loan">${icons.loans}New loan application</button>
    <button data-credits-modal="repayment">${icons.receipt}Record repayment</button><button data-open-loan-calculator>${icons.reports}Loan calculator</button><button data-credits-page="credits-approvals">${icons.approvals}Review loans</button>
    <button data-credits-modal="recovery">${icons.clock}Recovery follow-up</button><button data-credits-report="Monthly Performance Report" data-format="pdf">${icons.reports}Generate report</button></div>`:""}</div>`;
}
function creditsMembersView() {
  const c=state.credits,p=c.contributionPolicy;
  const rows=c.members.map(m=>{const variance=Number(m.savingsVariance||0),expected=Number(m.expectedSavingsToDate||0),rate=expected?Math.min(100,Math.round(Number(m.currentYearSavings||0)/expected*100)):0;return [`${m.name}<small class="table-sub">${m.memberNumber}</small>`,m.closingSavings==null?"Not imported":money(m.closingSavings),money(m.totalMemberFunds),`${money(m.currentYearSavings)}<small class="table-sub">${rate}% of amount due</small>`,money(expected),`<span class="${variance<0?"negative":"positive"}">${variance<0?`Short ${money(Math.abs(variance))}`:`Ahead ${money(variance)}`}</span>`,`${money(m.currentYearShares)}<small class="table-sub">of ${money(p?.annualShareTarget||0)}</small>`,`${money(m.currentYearSubscription)}<small class="table-sub">of ${money(p?.annualSubscriptionFee||0)}</small>`,status(m.status),`<button class="mini-btn" data-credits-member="${m.id}">${icons.eye}</button>`];});
  return `<div class="exec-module-metrics">${executiveModuleMetric("SACCO accounts",c.stats.totalMembers,"blue")}${executiveModuleMetric("Savings + capital",money(c.contributionProgress?.totalMemberFunds||0),"green")}${executiveModuleMetric("Expected savings to date",money(c.contributionProgress?.expectedSavingsToDate||0),"violet")}${executiveModuleMetric("Verified this year",money(c.contributionProgress?.verifiedSavings||0),"orange")}</div>
    <div class="credits-policy-explainer"><strong>${p?.fiscalYear||"Current year"} rules</strong><span>Monthly savings ${money(p?.monthlySavingsTarget||0)}</span><span>Annual shares ${money(p?.annualShareTarget||0)}</span><span>Annual subscription ${money(p?.annualSubscriptionFee||0)}</span><small>The 30 June balance carries forward; only yearly targets restart on 1 July.</small></div>
    ${financeDataTable("Member savings and annual obligations",["Member","Savings at 30 Jun 2026","Current savings + capital","Savings paid this FY","Expected by today","Short / ahead","Shares this FY","Subscription this FY","Status","Profile"],rows)}`;
}function creditsSavingsView() {
  const c=state.credits,rows=c.transactions.filter(t=>["Savings deposit","Withdrawal","Share purchase","Annual subscription fee"].includes(t.type));
  const pendingMember=rows.filter(t=>["Savings deposit","Share purchase","Annual subscription fee"].includes(t.type)&&t.status==="pending"&&t.submissionSource==="member");
  return `<div class="exec-module-metrics">${executiveModuleMetric("Total savings",money(c.savings.totalSavings),"green")}${executiveModuleMetric("Deposits today",money(c.savings.depositsToday),"blue")}${executiveModuleMetric("Monthly deposits",money(c.savings.monthlyDeposits),"violet")}${executiveModuleMetric("Monthly withdrawals",money(c.savings.withdrawals),"orange")}</div>
    ${pendingMember.length?`<div class="credits-verification-banner"><div>${icons.info}<span><strong>${pendingMember.length} member contribution${pendingMember.length===1?"":"s"} awaiting verification</strong><small>Open each submission, compare its payment reference and uploaded receipt, then confirm that funds were received.</small></span></div></div>`:""}
    ${financeDataTable("Savings transaction ledger",["Submission / receipt","Date","Member","Method","Payment reference","Submitted by","Amount","Evidence","Status","Review"],rows.map(t=>[
      t.receiptNumber||`<span class="pending-receipt">Pending verification</span>`,new Date(t.createdAt).toLocaleString(),`${t.member}<small class="table-sub">${t.memberNumber}</small>`,t.method,t.externalReference||"?",`${t.officer}<small class="table-sub">${t.submissionSource==="member"?"Member submission":"Credits entry"}</small>`,money(t.amount),t.hasEvidence?`<a class="mini-btn" href="/api/transactions/${t.id}/evidence" target="_blank" title="View receipt evidence">${icons.eye}</a>`:"?",status(t.status),`<button class="button small ${t.status==="pending"&&t.submissionSource==="member"?"primary":"secondary"}" data-credits-transaction="${t.id}">${t.status==="pending"&&t.submissionSource==="member"?"Review":"Details"}</button>`
    ]))}`;
}

function creditsTransactionDetails(id) {
  const t=state.credits.transactions.find(item=>String(item.id)===String(id));if(!t)return;
  const pending=t.status==="pending"&&t.submissionSource==="member";
  const isLoanRepayment=t.type==="Loan repayment";
  const proof=t.hasEvidence?(String(t.evidenceName||"").toLowerCase().endsWith(".pdf")?`<a class="button secondary" href="/api/transactions/${t.id}/evidence" target="_blank">${icons.eye} Open receipt PDF</a>`:`<a class="deposit-proof" href="/api/transactions/${t.id}/evidence" target="_blank"><img src="/api/transactions/${t.id}/evidence" alt="Uploaded payment receipt for ${escapeHtml(t.member)}"></a>`):`<div class="exec-empty">No payment evidence was uploaded.</div>`;
  document.body.insertAdjacentHTML("beforeend",`<div class="modal-backdrop" id="modal-backdrop"><div class="modal loan-detail-modal"><div class="modal-head"><div><h2>${isLoanRepayment?"Loan repayment verification":"Contribution verification"}</h2><p>${escapeHtml(t.member)} - ${escapeHtml(t.memberNumber||"")}</p></div><button class="modal-close" data-close>${icons.x}</button></div><div class="form"><div class="transaction-detail-grid"><div><span>Amount claimed</span><strong>${money(t.amount)}</strong></div><div><span>Payment method</span><strong>${escapeHtml(t.method||"?")}</strong></div><div><span>Payment reference</span><strong>${escapeHtml(t.externalReference||"?")}</strong></div>${isLoanRepayment?`<div><span>Loan</span><strong>${escapeHtml(t.loanReference||"?")}</strong></div>`:""}<div><span>Submitted by</span><strong>${escapeHtml(t.officer||t.member)}</strong></div><div><span>Submitted</span><strong>${new Date(t.createdAt).toLocaleString()}</strong></div><div><span>Status</span><strong>${status(t.status)}</strong></div><div><span>Official receipt</span><strong>${escapeHtml(t.receiptNumber||"Issued only after approval")}</strong></div><div><span>Verified</span><strong>${t.verifiedAt?new Date(t.verifiedAt).toLocaleString():"Not yet verified"}</strong></div><div class="full"><span>Member notes</span><strong>${escapeHtml(t.notes||"No notes provided")}</strong></div>${t.verificationComment?`<div class="full"><span>Credits decision</span><strong>${escapeHtml(t.verificationComment)}</strong></div>`:""}</div><h3 class="loan-section-title">Payment evidence</h3>${proof}<div class="modal-actions">${pending?`<button class="button danger" data-deposit-decision="reject">Reject submission</button><button class="button primary" data-deposit-decision="approve">${isLoanRepayment?"Confirm money received & update loan":"Confirm money received & approve"}</button>`:`<button class="button secondary" data-close-footer>Close</button>`}</div></div></div></div>`);
  document.querySelector("[data-close]").onclick=closeModal;const footer=document.querySelector("[data-close-footer]");if(footer)footer.onclick=closeModal;
  document.querySelectorAll("[data-deposit-decision]").forEach(button=>button.onclick=()=>decideCreditsDeposit(t.id,button.dataset.depositDecision,isLoanRepayment));
}

async function decideCreditsDeposit(id,decision,isLoanRepayment=false) {
  let comment=decision==="approve"?"Funds received and uploaded receipt evidence matched":"";
  if(decision==="reject"){comment=await promptDialog(`Reason for rejecting this ${isLoanRepayment?"loan payment":"deposit"}:`,"");if(comment===null||!comment.trim())return;}
  else if(!await confirmDialog(isLoanRepayment?"Confirm that the money was received and the uploaded receipt matches this loan payment? The loan progress and schedule will update immediately.":"Confirm that the money was received and the uploaded receipt matches this contribution? The correct member obligation will update immediately."))return;
  try{await api(`/api/transactions/${id}/verify`,{method:"POST",body:JSON.stringify({decision,comment})});closeModal();await refreshCredits();render();toast(decision==="approve"?(isLoanRepayment?"Loan repayment verified. The member loan progress and official receipt are now updated.":"Contribution verified. The member record and official receipt are now updated."):(isLoanRepayment?"Loan payment rejected. The loan balance was not changed.":"Contribution rejected. The member record was not changed."));}catch(error){toast(error.message);}
}

function creditsApplicationsView() {
  const rows=state.credits.loans;
  return `<div class="module-actions"><button class="button primary" data-open-loan-calculator>${icons.reports}Loan calculator</button></div><div class="credits-workflow">${["Member applies","Guarantors confirm","Credit Committee (3)","Executive Committee (5)","Chairperson Tabula final","Credits disbursement","Repayment","Closed"].map((x,i)=>`<span><b>${i+1}</b>${x}</span>`).join("<i>&gt;</i>")}</div>
    <div class="credits-loan-list">${rows.map(l=>creditsLoanRow(l,true)).join("")}</div>`;
}
function creditsApprovalsView() {
  const rows=state.credits.loans.filter(l=>!["active","completed","rejected","overdue","closed"].includes(l.status));
  const history=state.credits.loans.filter(l=>["ready-disbursement","active","overdue","completed","closed","rejected"].includes(l.status)
    ||(l.approvalProgress&&(l.approvalProgress.approvedCount>0||(l.approvalProgress.advisoryRejects||[]).length)));
  const decided=history.filter(l=>["ready-disbursement","active","overdue","completed","closed","rejected"].includes(l.status));
  return `<div class="exec-module-metrics">${executiveModuleMetric("Pending",state.credits.stats.pendingApplications,"orange")}${executiveModuleMetric("Credits review",rows.filter(l=>["officer-review","pending","review","correction"].includes(l.status)).length,"blue")}${executiveModuleMetric("Awaiting Executive",rows.filter(l=>l.status==="executive-authorization").length,"gold")}${executiveModuleMetric("History records",decided.length,"green")}</div>
    <div class="notice"><div>${icons.shield}</div><div><strong>Who approves a loan?</strong><p>Credit Committee then Executive Committee, with Chairperson Tabula Robert last and final on rejection.</p></div></div>
    <div class="credits-loan-list">${rows.map(l=>creditsLoanRow(l,true)).join("")||`<div class="exec-empty">No applications await approval.</div>`}</div>
    <section class="exec-panel exec-approval-history" style="margin-top:16px"><div class="exec-panel-head"><div><h3>Loan process history</h3><p>Completed and decided loans — open View details for the full Credit and Executive process</p></div></div>
      <div class="table-scroll"><table><thead><tr><th>Loan</th><th>Member</th><th>Amount</th><th>Stage</th><th>Action</th></tr></thead><tbody>
      ${decided.length?decided.map(l=>`<tr><td><strong>${escapeHtml(l.reference)}</strong><small>${escapeHtml(l.product||"")}</small></td><td>${escapeHtml(l.member)}</td><td>${money(l.amount)}</td><td>${status(l.status)}</td><td><button class="mini-btn" data-loan-detail-id="${l.id}" title="View full process">${icons.eye}</button></td></tr>`).join(""):`<tr><td colspan="5">No completed loan process records yet.</td></tr>`}
      </tbody></table></div></section>`;
}
function loanRepaymentProgress(l) {
  const totalDue=Number(l.totalDue||l.amount||0),totalPaid=Number(l.totalPaid||Math.max(0,Number(l.amount||0)-Number(l.balance||0))),totalInterest=Number(l.totalInterest||Math.max(0,totalDue-Number(l.amount||0)));
  const remaining=Math.max(0,totalDue-totalPaid);
  const progressPct=totalDue?Math.min(100,Math.round(totalPaid/totalDue*100)):0;
  return {totalDue,totalPaid,totalInterest,remaining,progressPct};
}
function creditsActiveLoansView() {
  const rows=state.credits.loans.filter(l=>["active","overdue"].includes(l.status));
  return `<div class="exec-module-metrics">${executiveModuleMetric("Active loans",rows.length,"blue")}${executiveModuleMetric("Outstanding principal",money(rows.reduce((n,l)=>n+Number(l.balance||0),0)),"violet")}${executiveModuleMetric("Total repayment",money(rows.reduce((n,l)=>n+Number(l.totalDue||l.amount||0),0)),"orange")}${executiveModuleMetric("Cash disbursed",money(rows.reduce((n,l)=>n+Math.max(0,Number(l.amount||0)-Number(l.processingFee||0)),0)),"green")}</div>
    <div class="credits-loan-list">${rows.map(l=>{
      const p=loanRepaymentProgress(l);
      const fee=Number(l.processingFee||0),netDisbursed=Math.max(0,Number(l.amount||0)-fee);
      return `<article class="credits-active-loan">
        <div class="credits-loan-main">
          <span>${escapeHtml(l.reference)} · ${escapeHtml(l.product)}</span>
          <h3>${escapeHtml(l.member)}</h3>
          <p class="credits-borrower-meta"><strong>${escapeHtml(l.memberNumber||"No member number")}</strong>${l.phone?` · ${escapeHtml(l.phone)}`:""}${l.email?` · ${escapeHtml(l.email)}`:""}</p>
          <small>${l.termMonths} months · Applied ${new Date(l.createdAt).toLocaleDateString()}</small>
        </div>
        <div class="credits-active-figures">
          <div><span>Total repayment</span><strong>${money(p.totalDue)}</strong></div>
          <div><span>Cash given</span><strong>${money(netDisbursed)}</strong></div>
          <div><span>Principal left</span><strong>${money(l.balance)}</strong></div>
        </div>
        ${status(l.status)}
        <div class="credits-row-progress"><div><span>Repayment progress</span><strong>${p.progressPct}%</strong></div><i><u style="width:${p.progressPct}%"></u></i>
          <small>Paid ${money(p.totalPaid)} of ${money(p.totalDue)} · Fee ${money(fee)} · Next ${money(l.nextPaymentAmount||0)}${l.nextDueDate?` on ${new Date(l.nextDueDate).toLocaleDateString()}`:""}</small></div>
        <div class="credits-loan-actions"><button data-credits-member="${l.memberId}">${icons.users} Member</button><button data-loan-detail-id="${l.id}">View details</button>${!isExecutiveReadOnly()&&state.credits?.access?.canEdit?`<button class="approve" data-credits-modal="repayment">Record repayment</button>`:""}</div>
      </article>`;
    }).join("")||`<div class="exec-empty">No active loans.</div>`}</div>`;
}
function loanApprovalQueue(l) {
  const p=l.approvalProgress;if(!p?.reviewers?.length)return "";
  const body=p.body||(p.stage==="credits"?"Credit Committee":"Executive Committee");
  const pending=p.pendingReviewers||p.reviewers.filter(r=>!r.decision);
  const tabulaWaiting=p.stage==="executive"&&p.reviewers.some(r=>r.isFinalRejector&&!r.decision&&p.reviewers.some(o=>!o.isFinalRejector&&!o.decision));
  const next=`<strong>${tabulaWaiting?`Waiting for other Executive votes — Tabula Robert decides last`:pending.length?`${pending.length} pending · any remaining member may decide`:`${escapeHtml(body)} complete`}</strong>`;
  return `<div class="loan-approval-queue"><div><span>${escapeHtml(body)} · ${p.approvedCount}/${p.requiredCount} approved</span>${next}</div>
    <ol>${p.reviewers.map(r=>{
      const cls=r.decision||"pending";
      let mark=" · pending";
      if(r.decision==="approve")mark=` · approved${r.comment?`: ${escapeHtml(r.comment)}`:""}`;
      else if(r.advisoryReject)mark=` · advisory reject${r.comment?`: ${escapeHtml(r.comment)}`:""}`;
      else if(r.decision==="reject"&&r.isFinalRejector)mark=` · final reject${r.comment?`: ${escapeHtml(r.comment)}`:""}`;
      else if(r.decision)mark=` · ${r.decision}${r.comment?`: ${escapeHtml(r.comment)}`:""}`;
      return `<li class="${cls}${r.advisoryReject?" advisory-reject":""}">${escapeHtml(r.fullName)}${r.positionTitle?` · ${escapeHtml(r.positionTitle)}`:""}${mark}</li>`;
    }).join("")}</ol></div>`;
}
function creditsLoanRow(l,actions=false) {
  const inCreditsReview=["officer-review","pending","review","correction","committee-review"].includes(l.status);
  const canDecide=inCreditsReview&&l.canCurrentUserDecide&&!isExecutiveReadOnly()&&(state.credits.access.canEdit||state.credits.access.canApprove);
  const active=["active","overdue"].includes(l.status),p=loanRepaymentProgress(l);
  const pendingCount=(l.pendingReviewers||l.approvalProgress?.pendingReviewers||[]).length;
  const nextLine=inCreditsReview?(pendingCount?`${pendingCount} Credit Committee vote${pendingCount===1?"":"s"} still needed · any remaining member may decide`:`Credit Committee complete`):(l.status==="executive-authorization"?"Awaiting Executive Committee":"");
  const repayment=active?`<div class="credits-row-progress"><div><span>Repayment progress</span><strong>${p.progressPct}%</strong></div><i><u style="width:${p.progressPct}%"></u></i><small>${money(p.totalPaid)} of ${money(p.totalDue)} · Next ${money(l.nextPaymentAmount||0)}</small></div>`:"";
  const officerActions=canDecide?`<button class="approve" data-credits-loan="${l.id}" data-credit-decision="approve">Approve</button><button class="return" data-credits-loan="${l.id}" data-credit-decision="return">Request information</button><button class="reject" data-credits-loan="${l.id}" data-credit-decision="reject">Reject</button>`:"";
  return `<article class="credits-loan-card">
    <div class="credits-loan-main">
      <span>${escapeHtml(l.reference)} · ${escapeHtml(l.product)}</span>
      <h3>${escapeHtml(l.member)}</h3>
      <p>${escapeHtml(l.memberNumber||"")}${l.purpose?` · ${escapeHtml(l.purpose)}`:""} · ${l.termMonths} months</p>
      <small>Applied ${new Date(l.createdAt).toLocaleDateString()}${nextLine?` · ${nextLine}`:""}</small>
      ${repayment}
    </div>
    <div class="credits-loan-meta">
      <strong>${money(l.amount)}</strong>
      ${status(l.status)}
    </div>
    <div class="credits-loan-actions">${officerActions}<button data-loan-detail-id="${l.id}">View details</button></div>
  </article>`;
}
function creditsDisbursementView() {
  if(isExecutiveReadOnly()){
    return `<div class="notice"><div>${icons.shield}</div><div><strong>Credits Officer disbursement only</strong><p>Authorized loans are disbursed only by the Credits Officer (Nakayiza Baraza Olivia). Executive authorization ends when the loan reaches ready for disbursement.</p></div></div>`;
  }
  const rows=state.credits.loans.filter(l=>["ready-disbursement","executive-authorization"].includes(l.status));
  const receipts=(state.credits.transactions||[]).filter(t=>t.type==="Loan disbursement"&&t.status==="completed");
  return `<div class="credits-workflow">${["Credit Committee approved","Executive authorized","Credits Officer disburses","Schedule created"].map((x,i)=>`<span><b>${i+1}</b>${x}</span>`).join("<i>&gt;</i>")}</div>
    <div class="credits-loan-list">${rows.map(l=>{
      const fee=Number(l.processingFee||Math.round(Number(l.verifiedAmount||l.amount)*0.02));
      const net=Math.max(0,Number(l.verifiedAmount||l.amount)-fee);
      return `<article><div class="credits-loan-main"><span>${l.reference} - ${l.product}</span><h3>${l.member}</h3><p>${l.purpose||"Purpose not provided"} - ${l.termMonths} months</p>
        <small>Approved ${money(l.verifiedAmount||l.amount)} · Fee ${money(fee)} · Cash to send ${money(net)}</small></div>
        <div><strong>${money(net)}</strong><small>Cash to member</small></div>${status(l.status)}
        <div class="credits-loan-actions">${l.status==="ready-disbursement"&&canCreditsDisburse()?`<button class="approve" data-credits-disburse="${l.id}">Disburse</button>`:""}<button data-loan-detail-id="${l.id}">View details</button></div></article>`;
    }).join("")||`<div class="exec-empty">No loans currently await disbursement.</div>`}</div>
    <section class="exec-panel exec-approval-history" style="margin-top:16px"><div class="exec-panel-head"><div><h3>Disbursement receipts</h3><p>Money actually given to members after the processing fee</p></div><button data-credits-page="credits-receipts">Open receipts &gt;</button></div>
      <div class="table-scroll"><table><thead><tr><th>Receipt / Ref</th><th>Member</th><th>Loan</th><th>Cash given</th><th>Method</th><th>Date</th></tr></thead><tbody>
      ${receipts.length?receipts.slice(0,8).map(t=>`<tr><td><strong>${escapeHtml(t.receiptNumber||t.reference)}</strong></td><td>${escapeHtml(t.member)}</td><td>${escapeHtml(t.loanReference||"—")}</td><td>${money(t.amount)}</td><td>${escapeHtml(t.method||"—")}</td><td>${new Date(t.verifiedAt||t.createdAt).toLocaleString()}</td></tr>`).join(""):`<tr><td colspan="6">No disbursement receipts yet.</td></tr>`}
      </tbody></table></div></section>`;
}
function creditsReceiptsView() {
  const rows=(state.credits.transactions||[]).filter(t=>t.type==="Loan disbursement"&&t.status==="completed");
  const totalCash=rows.reduce((n,t)=>n+Number(t.amount||0),0);
  return `<div class="exec-module-metrics">${executiveModuleMetric("Receipts",rows.length,"blue")}${executiveModuleMetric("Cash given out",money(totalCash),"green")}${executiveModuleMetric("This month",money(rows.filter(t=>new Date(t.verifiedAt||t.createdAt).getMonth()===new Date().getMonth()).reduce((n,t)=>n+Number(t.amount||0),0)),"orange")}</div>
    <div class="notice"><div>${icons.wallet}</div><div><strong>Net cash after processing fee</strong><p>Each receipt shows the money actually sent to the member. The processing fee stays with the organization and is not part of this cash figure.</p></div></div>
    ${financeDataTable("Loan disbursement receipts",["Receipt / Ref","Date","Member","Loan","Method","Destination / notes","Cash given","Status"],rows.map(t=>[
      t.receiptNumber||t.reference,new Date(t.verifiedAt||t.createdAt).toLocaleString(),`${escapeHtml(t.member)}<small class="table-sub">${escapeHtml(t.memberNumber||"")}</small>`,
      escapeHtml(t.loanReference||"—"),escapeHtml(t.method||"—"),escapeHtml(t.externalReference||t.notes||"—"),money(t.amount),status(t.status)
    ]))}`;
}
function creditsRepaymentsView() {
  const c=state.credits,rows=c.transactions.filter(t=>t.type==="Loan repayment");
  const pendingMember=rows.filter(t=>t.status==="pending"&&t.submissionSource==="member");
  return `<div class="exec-module-metrics">${executiveModuleMetric("Repayments this month",money(rows.filter(t=>new Date(t.createdAt).getMonth()===new Date().getMonth()&&t.status==="completed").reduce((n,t)=>n+t.amount,0)),"green")}${executiveModuleMetric("Outstanding",money(c.portfolio.outstanding),"violet")}${executiveModuleMetric("Recovery rate",`${c.stats.recoveryRate}%`,"blue")}${executiveModuleMetric("Loans in arrears",c.portfolio.arrears,"red")}</div>
    ${pendingMember.length?`<div class="credits-verification-banner"><div>${icons.info}<span><strong>${pendingMember.length} member loan payment${pendingMember.length===1?"":"s"} awaiting verification</strong><small>Open each submission, compare its payment reference and uploaded receipt, then confirm that funds were received before the loan progress updates.</small></span></div></div>`:""}
    ${financeDataTable("Loan repayment history",["Receipt","Date","Member","Loan","Method","Reference","Submitted by","Amount","Evidence","Status","Review"],rows.map(t=>[
      t.receiptNumber||`<span class="pending-receipt">Pending verification</span>`,new Date(t.createdAt).toLocaleString(),`${t.member}<small class="table-sub">${t.memberNumber||""}</small>`,t.loanReference||"—",t.method,t.externalReference||"—",`${t.officer}<small class="table-sub">${t.submissionSource==="member"?"Member submission":"Credits entry"}</small>`,money(t.amount),t.hasEvidence?`<a class="mini-btn" href="/api/transactions/${t.id}/evidence" target="_blank" title="View receipt evidence">${icons.eye}</a>`:"—",status(t.status),`<button class="button small ${t.status==="pending"&&t.submissionSource==="member"?"primary":"secondary"}" data-credits-transaction="${t.id}">${t.status==="pending"&&t.submissionSource==="member"?"Review":"Details"}</button>`
    ]))}`;
}
function creditsGuarantorsView() {
  const c=state.credits;
  return `<div class="exec-module-metrics">${executiveModuleMetric("Pending",c.guarantorSummary.pending,"orange")}${executiveModuleMetric("Accepted",c.guarantorSummary.accepted,"green")}${executiveModuleMetric("Declined",c.guarantorSummary.rejected,"red")}${executiveModuleMetric("Over-guaranteed",c.guarantorSummary.overGuaranteed,"violet")}</div>
    ${financeDataTable("Guarantor register",["Guarantor","Membership","Borrower","Loan","Guaranteed share","Savings capacity","Available capacity","Response","Date"],c.guarantors.map(g=>{const committed=c.guarantors.filter(x=>x.memberId===g.memberId&&x.status==="accepted").reduce((n,x)=>n+x.guaranteedAmount,0);return [g.guarantor,g.memberNumber,g.borrower,g.loanReference,money(g.guaranteedAmount),money(g.savings),money(Math.max(0,g.savings-committed)),status(g.status),g.respondedAt?new Date(g.respondedAt).toLocaleDateString():"Pending"];}))}`;
}
function creditsRecoveryView() {
  const c=state.credits;
  const danger=c.loans.filter(l=>l.inDangerPeriod&&Number(l.balance)>0);
  const overdue=c.loans.filter(l=>l.status==="overdue"||l.daysOverdue>0&&l.balance>0);
  return `<div class="exec-module-metrics">${executiveModuleMetric("Danger period",danger.length,"orange")}${executiveModuleMetric("Overdue (after grace)",overdue.length,"red")}${executiveModuleMetric("Amount outstanding",money(overdue.reduce((n,l)=>n+l.balance,0)),"orange")}${executiveModuleMetric("Recovery rate",`${c.stats.recoveryRate}%`,"green")}</div>
    ${danger.length?`<section class="finance-panel" style="margin-bottom:16px"><div class="finance-panel-head"><div><h3>Danger period — active due loans</h3><p>Due date reached through day 5. After grace, 5% penalty applies on unpaid principal only (not interest).</p></div></div>
      <div class="credits-recovery-cards">${danger.map(l=>`<article class="danger-period"><div><span>${l.reference}</span><h3>${l.member}</h3><p>Due ${l.nextDueDate?new Date(l.nextDueDate).toLocaleDateString():"—"} · installment ${money(l.nextPaymentAmount||0)} · principal ${money(l.balance)}</p></div><span class="status review">Danger</span><button data-credits-recover="${l.id}">Record reminder</button></article>`).join("")}</div></section>`:""}
    <div class="credits-recovery-cards">${overdue.map(l=>{const history=c.recovery.filter(r=>r.loanId===l.id);return `<article><div><span>${l.reference}</span><h3>${l.member}</h3><p>${l.daysOverdue} days overdue after grace - ${money(l.balance)}</p></div>${status(l.status)}<div class="credits-recovery-history">${history.map(r=>`<div><strong>${r.actionType}</strong><span>${r.notes}</span><small>${new Date(r.createdAt).toLocaleDateString()} - Follow-up ${r.followUpDate?new Date(r.followUpDate).toLocaleDateString():"not set"}</small></div>`).join("")||"<small>No recovery action recorded yet.</small>"}</div><button data-credits-recover="${l.id}">Record follow-up</button></article>`}).join("")||`<div class="exec-empty">No defaulted loans.</div>`}</div>`;
}
function creditsStatementsView() {
  return `<div class="credits-statement-grid">${state.credits.members.map(m=>`<article><div class="avatar blue">${initials(m.name)}</div><div><span>${m.memberNumber}</span><h3>${m.name}</h3><p>Savings ${money(m.savings)} - Loans ${money(m.outstandingBalance)}</p></div><button data-credits-statement="${m.id}">${icons.download}Statement</button></article>`).join("")}</div>`;
}
function creditsChargesView() {
  const c=state.credits;
  return `<div class="exec-module-metrics">${executiveModuleMetric("Interest earned",money(c.stats.interestEarned),"green")}${executiveModuleMetric("Outstanding charges",money(c.charges.filter(x=>x.status==="outstanding").reduce((n,x)=>n+x.amount,0)),"orange")}${executiveModuleMetric("Penalties",c.charges.filter(x=>x.chargeType.toLowerCase().includes("penalty")).length,"red")}${executiveModuleMetric("Waived",c.charges.filter(x=>x.status==="waived").length,"blue")}</div>
    ${financeDataTable("Interest, fees and penalties",["Loan","Member","Charge","Reason","Assessed","Amount","Status","Action"],c.charges.map(x=>[x.loanReference,x.member,x.chargeType,x.reason||"?",new Date(x.assessedAt).toLocaleDateString(),money(x.amount),status(x.status),x.status==="outstanding"&&c.access.canApprove?`<button class="button small secondary" data-credits-waive="${x.id}">Waive</button>`:"?"]))}`;
}
function creditsReportsView() {
  const reports=[["FY2026 Opening Savings Balances","Imported member balances awaiting Legal identity linkage"],["Savings Report","Member balances, deposits and withdrawals"],["Loan Portfolio Report","Active, completed, pending and rejected loans"],["Loan Recovery Report","Defaulters and follow-up actions"],["Interest Income Report","Interest and charge performance"],["Defaulters Report","Overdue loans and days in arrears"],["Member Statements","Individual SACCO account histories"],["Guarantor Report","Guarantees and available capacity"],["Daily Transactions","Daily deposits and repayments"],["Monthly Performance Report","Savings, disbursement and recovery KPIs"],["Annual Credit Report","Complete annual SACCO credit pack"]];
  return `<div class="exec-report-grid">${reports.map(([name,desc],i)=>`<article><span class="${["blue","green","violet","orange","teal"][i%5]}">${icons.file}</span><div><h3>${name}</h3><p>${desc}</p><small>Generated from verified Credits data</small></div><div class="finance-report-actions"><button data-credits-report-preview="${name}">${icons.eye}Preview</button><button data-credits-report="${name}" data-format="excel">${icons.download}Excel</button><button data-credits-report="${name}" data-format="pdf">${icons.file}PDF</button></div></article>`).join("")}</div>`;
}
function creditsAnalyticsView() {
  const c=state.credits;
  return `<div class="exec-analytics-grid">${creditsSavingsLoanChart(c)}${creditsPortfolioWidget(c)}${creditsSavingsOverviewWidget(c)}${creditsRecoveryWidget(c)}${creditsGuarantorWidget(c)}
    <section class="finance-panel"><div class="finance-panel-head"><div><h3>Loan Category Distribution</h3><p>Outstanding balance by loan product</p></div></div><div class="finance-category-list">${[...new Set(c.loans.map(l=>l.product))].map(product=>{const amount=c.loans.filter(l=>l.product===product).reduce((n,l)=>n+l.balance,0);return `<div><span>${product}</span><i><b style="width:${c.portfolio.outstanding?amount/c.portfolio.outstanding*100:0}%"></b></i><strong>${money(amount)}</strong></div>`}).join("")}</div></section></div>`;
}
function creditsDocumentsView() {
  return `<div class="exec-document-groups">${["Policies","Credit Reports","Loan Supporting Documents","Annual Reports"].map(type=>{const docs=state.credits.documents.filter(d=>d.documentType===type);return `<section class="finance-panel"><div class="finance-panel-head"><div><h3>${type}</h3><p>${docs.length} Credits document${docs.length===1?"":"s"}</p></div></div>${docs.map(d=>`<div class="exec-document-row"><span>${icons.file}</span><div><strong>${d.title}</strong><small>${d.reference} - Version ${d.version}</small></div>${status(d.status)}${d.hasFile?`<div class="document-actions"><a href="/api/documents/${d.id}/view" target="_blank">${icons.eye}View</a><a href="/api/documents/${d.id}/download">${icons.download}</a></div>`:`<span class="status pending">No file</span>`}</div>`).join("")||`<div class="exec-empty">No documents in this category yet.</div>`}</section>`}).join("")}</div>`;
}
function creditsNotificationsView() {
  return `<section class="finance-panel"><div class="exec-notification-page">${state.credits.notifications.map(n=>`<article><span>${icons.bell}</span><div><small>${n.level}</small><h3>${n.title}</h3><p>Credits Department notification</p></div><time>${relativeTime(n.createdAt||n.time)}</time></article>`).join("")||`<div class="exec-empty">No current Credits notifications.</div>`}</div></section>`;
}
function creditsSettingsView() {
  return `<div class="settings-grid"><div class="card setting-card"><div class="card-head" style="padding:0 0 16px"><div><h2 class="card-title">SACCO credit controls</h2><p class="card-subtitle">Savings and lending safeguards</p></div></div>
    <div class="setting-row"><div class="setting-icon">${icons.savings}</div><div class="setting-copy"><strong>Minimum savings balance</strong><span>${money(Number(state.settings.minimumBalance||100000))} must remain after withdrawal</span></div></div>
    <div class="setting-row"><div class="setting-icon">${icons.users}</div><div class="setting-copy"><strong>Guarantor capacity</strong><span>Accepted and pending guarantees cannot exceed allowable member savings</span></div>${status("active")}</div>
    <div class="setting-row"><div class="setting-icon">${icons.clock}</div><div class="setting-copy"><strong>Automatic repayment schedule</strong><span>Created immediately after authorized disbursement</span></div>${status("active")}</div></div>
    <div class="card setting-card"><div class="card-head" style="padding:0 0 16px"><div><h2 class="card-title">Department boundaries</h2><p class="card-subtitle">Enforced by role and department assignment</p></div></div>
    <div class="setting-row"><div class="setting-icon">${icons.lock}</div><div class="setting-copy"><strong>Finance isolation</strong><span>Credits cannot manage organization budgets, invoices, procurement or bank accounts</span></div>${status("active")}</div>
    <div class="setting-row"><div class="setting-icon">${icons.shield}</div><div class="setting-copy"><strong>Approval stages</strong><span>Officer review, guarantor consent, committee decision and authorized disbursement stay separate</span></div>${status("active")}</div>
    <div class="setting-row"><div class="setting-icon">${icons.audit}</div><div class="setting-copy"><strong>Complete audit trail</strong><span>Applications, decisions, repayments, charges and recovery actions are logged</span></div>${status("active")}</div></div></div>`;
}
function creditsSearchView() {
  const results=state.creditsSearchResults||[];
  return `<div class="exec-search-summary">${icons.search}<div><strong>${results.length} Credits result${results.length===1?"":"s"}</strong><span>for &quot;${escapeHtml(state.creditsSearchTerm||"")}&quot;</span></div></div><section class="finance-panel"><div class="exec-global-results">${results.map(r=>`<button data-credits-page="${r.target}"><span>${r.type}</span><div><strong>${r.title}</strong><small>${r.reference} - ${r.detail||""}</small></div><b>&gt;</b></button>`).join("")||`<div class="exec-empty">Type at least two characters to search Credits.</div>`}</div></section>`;
}
function creditsMemberOptions(selected="") {
  return state.credits.members.map(m=>`<option value="${m.id}" ${String(m.id)===String(selected)?"selected":""}>${m.memberNumber} - ${m.name} - ${money(m.savings)}</option>`).join("");
}
function creditsLoanOptions(filter=()=>true,selected="") {
  return state.credits.loans.filter(filter).map(l=>`<option value="${l.id}" ${String(l.id)===String(selected)?"selected":""}>${l.reference} - ${l.member} - ${money(l.balance)}</option>`).join("");
}
async function openCreditsModal(type,context="") {
  if(isExecutiveReadOnly()) return toast("Executive is viewing this dashboard read-only. Operational posting stays with the department officers.");
  if(type==="loan"&&!state.guarantorCandidates) {
    try{state.guarantorCandidates=(await api("/api/loans/guarantor-candidates")).candidates;}catch{state.guarantorCandidates=[];}
  }
  const forms={
    deposit:["Record savings deposit","A pending transaction and receipt will be created for verification",`<form class="form" data-credits-form="deposit"><div class="form-grid"><div class="field full"><label>Member SACCO account</label><select name="memberId" required><option value="">Select member</option>${creditsMemberOptions()}</select></div><div class="field"><label>Amount (UGX)</label><input name="amount" type="number" min="1000" step="1000" required></div><div class="field"><label>Payment method</label><select name="method"><option>Cash</option><option>Mobile Money</option><option>Bank transfer</option><option>Cheque</option></select></div><div class="field full"><label>Transaction reference</label><input name="externalReference" placeholder="Mobile money, bank or cheque reference"></div><div class="field full"><label>Notes</label><textarea name="notes"></textarea></div></div>${formActions("Record deposit and issue receipt")}</form>`],
    withdrawal:["Request savings withdrawal","Savings and active loan security rules are checked automatically",`<form class="form" data-credits-form="withdrawal"><div class="form-grid"><div class="field full"><label>Member SACCO account</label><select name="memberId" required><option value="">Select member</option>${creditsMemberOptions()}</select></div><div class="field"><label>Amount (UGX)</label><input name="amount" type="number" min="1000" required></div><div class="field"><label>Payment method</label><select name="method"><option>Mobile Money</option><option>Cash</option><option>Bank transfer</option></select></div><div class="field full"><label>Reason</label><textarea name="reason" required></textarea></div></div>${formActions("Submit controlled withdrawal")}</form>`],
    repayment:["Record loan repayment","The loan balance and installment schedule update immediately",`<form class="form" data-credits-form="repayment"><div class="form-grid"><div class="field full"><label>Active loan</label><select name="loanId" required><option value="">Select loan</option>${creditsLoanOptions(l=>["active","overdue"].includes(l.status))}</select></div><div class="field"><label>Amount (UGX)</label><input name="amount" type="number" min="1000" step="1000" required></div><div class="field"><label>Payment method</label><select name="method"><option>Cash</option><option>Mobile Money</option><option>Bank transfer</option></select></div><div class="field full"><label>Payment reference</label><input name="externalReference"></div><div class="field full"><label>Notes</label><textarea name="notes"></textarea></div></div>${formActions("Post repayment and issue receipt")}</form>`],
    recovery:["Record recovery follow-up","Keep a permanent reminder and action history",`<form class="form" data-credits-form="recovery"><div class="form-grid"><div class="field full"><label>Overdue loan</label><select name="loanId" required><option value="">Select loan</option>${creditsLoanOptions(l=>l.status==="overdue"||l.daysOverdue>0&&l.balance>0,context)}</select></div><div class="field"><label>Action type</label><select name="actionType"><option>Phone reminder</option><option>SMS reminder</option><option>Demand notice</option><option>Guarantor contact</option><option>Recovery meeting</option><option>Legal referral</option><option>Payment arrangement</option></select></div><div class="field"><label>Next follow-up</label><input name="followUpDate" type="date"></div><div class="field full"><label>Action notes</label><textarea name="notes" required></textarea></div></div>${formActions("Record recovery action")}</form>`],
    charge:["Assess interest, fee or penalty","Charges remain outstanding until settled or formally waived",`<form class="form" data-credits-form="charge"><div class="form-grid"><div class="field full"><label>Loan</label><select name="loanId" required><option value="">Select loan</option>${creditsLoanOptions(l=>["active","overdue"].includes(l.status))}</select></div><div class="field"><label>Charge type</label><select name="chargeType"><option>Late payment penalty</option><option>Service charge</option><option>Processing fee</option><option>Additional interest</option></select></div><div class="field"><label>Amount (UGX)</label><input name="amount" type="number" min="1" required></div><div class="field full"><label>Reason</label><textarea name="reason" required></textarea></div></div>${formActions("Assess charge")}</form>`],
    loan:["New loan application","Eligibility and guarantor capacity are checked automatically",`<form class="form" data-credits-form="loan"><div class="form-grid"><div class="field full"><label>Member</label><select name="memberId" required><option value="">Select member</option>${creditsMemberOptions()}</select></div><div class="field"><label>Loan product</label><select name="productId" data-loan-product>${state.products.map(p=>`<option value="${p.id}" data-product-name="${p.name}">${p.name} - ${p.annualRate}% p.a.</option>`).join("")}</select></div><div class="field full" data-other-loan-fields hidden><label>Specify loan product</label><input name="customProductName" maxlength="120" placeholder="Type the loan product name"></div><div class="field"><label>Amount (UGX)</label><input name="amount" type="number" min="100000" step="50000" required></div><div class="field"><label>Repayment term</label><select name="termMonths"><option value="6">6 months</option><option value="12">12 months</option><option value="18">18 months</option><option value="24">24 months</option></select></div><div class="field full"><label>Choose guarantors (1-3)</label><div class="group-member-picker">${(state.guarantorCandidates||[]).map(g=>`<label class="group-member-option"><input type="checkbox" name="guarantorIds" value="${g.id}"><div class="chat-avatar">${initials(g.fullName)}</div><div><strong>${g.fullName}</strong><span>${g.memberNumber} - Savings ${money(g.savings)}</span></div></label>`).join("")||`<div class="empty-state">No eligible guarantor accounts.</div>`}</div><small>Each guarantor's current commitments and savings capacity are checked at submission.</small></div><div class="field full"><label>Purpose</label><textarea name="purpose" required></textarea></div><div class="field full"><label>Supporting document reference</label><input name="supportingDocument"></div></div>${formActions("Submit for guarantor consent")}</form>`]
  };
  const [title,subtitle,form]=forms[type]||forms.deposit;
  document.body.insertAdjacentHTML("beforeend",`<div class="modal-backdrop" id="modal-backdrop"><div class="modal"><div class="modal-head"><div><h2>${title}</h2><p>${subtitle}</p></div><button class="modal-close" data-close>${icons.x}</button></div>${form}</div></div>`);
  document.querySelector("[data-close]").onclick=closeModal;document.querySelector("[data-credits-form]").onsubmit=submitCreditsForm;
  const syncOtherLoan=()=>{const select=document.querySelector("[data-loan-product]"),box=document.querySelector("[data-other-loan-fields]"),input=document.querySelector("[name=customProductName]");if(!select||!box||!input)return;const option=select.selectedOptions?.[0];const isOther=/^other loan$/i.test(option?.dataset.productName||"");box.hidden=!isOther;input.required=isOther;if(!isOther)input.value="";};
  document.querySelector("[data-loan-product]")?.addEventListener("change",syncOtherLoan);syncOtherLoan();
}
async function submitCreditsForm(event) {
  event.preventDefault();const form=event.currentTarget,data=Object.fromEntries(new FormData(form)),type=form.dataset.creditsForm;
  if(type==="loan"){
    data.guarantorIds=new FormData(form).getAll("guarantorIds").map(Number);
    data.borrowerDeclaration=data.borrowerDeclaration||"accepted";
    data.overdueDeclaration=data.overdueDeclaration||"accepted";
    data.securityType=data.securityType||"savings_and_shares";
    const option=form.elements.productId?.selectedOptions?.[0];
    if(/^other loan$/i.test(option?.dataset.productName||"")&&!String(data.customProductName||"").trim())return toast("Type the loan product name for Other Loan.");
  }
  const endpoints={deposit:"/api/credits/deposits",withdrawal:"/api/credits/withdrawals",repayment:"/api/credits/repayments",
    charge:"/api/credits/charges",loan:"/api/loans",recovery:`/api/credits/recovery/${data.loanId}`};
  if(type==="recovery")delete data.loanId;
  const button=form.querySelector("button[type=submit]");button.disabled=true;button.textContent="Saving?";
  try{const result=await api(endpoints[type],{method:"POST",body:JSON.stringify(data)});closeModal();await refreshCredits();render();
    toast(type==="deposit"?`Deposit recorded. Receipt ${result.receiptNumber}.`:type==="repayment"?`Repayment completed. Receipt ${result.receiptNumber}.`:type==="loan"?`Loan ${result.reference} submitted for guarantor consent.`:`${type[0].toUpperCase()+type.slice(1)} record saved.`);}
  catch(error){button.disabled=false;button.textContent="Try again";toast(error.message);}
}
async function refreshCredits(){state.credits=await api("/api/credits/command-center");const boot=normalize(await api("/api/bootstrap"));state.loans=boot.loans;state.transactions=boot.transactions;state.members=boot.members;}
async function openExecutiveWorkspace(code) {
  if(state.role!=="Executive Officer") return;
  const endpoints={credits:"/api/credits/command-center",finance:"/api/finance/command-center",investment:"/api/investment/command-center",welfare:"/api/welfare/command-center",legal:"/api/legal/command-center",audit:"/api/audit/command-center",supervisory:"/api/supervisory/command-center"};
  const stateKeys={credits:"credits",finance:"finance",investment:"investment",welfare:"welfare",legal:"legal",audit:"auditCenter",supervisory:"supervisory"};
  if(!endpoints[code]) return toast("That department dashboard is not available.");
  try{
    toast(`Opening ${code} dashboard...`);
    state[stateKeys[code]]=await api(endpoints[code]);
    state.executiveWorkspace=code;
    state.page="dashboard";
    render();
    window.scrollTo(0,0);
    toast(`${code[0].toUpperCase()+code.slice(1)} dashboard opened in Executive read-only mode.`);
  }catch(error){toast(error.message||"Could not open that department dashboard.");}
}
function exitExecutiveWorkspace(){state.executiveWorkspace=null;state.page="departments";render();window.scrollTo(0,0);}
async function openMemberDashboard(memberId) {
  if(!memberId) return toast("This member record cannot be opened.");
  try {
    toast("Opening member dashboard...");
    state.memberCenter = await api(`/api/members/${memberId}/command-center`);
    state.memberSelfService = { opportunities: [], applications: [] };
    state.memberOversight = true;
    state.memberContext = true;
    state.page = "member-dashboard";
    if (typeof window.MemberPortal?.syncMemberPending === "function") window.MemberPortal.syncMemberPending();
    render();
    window.scrollTo(0, 0);
    toast(`Viewing ${state.memberCenter.member.fullName}'s member dashboard.`);
  } catch (error) {
    toast(error.message || "Could not open that member dashboard.");
  }
}
function exitMemberDashboard() {
  state.memberOversight = false;
  state.memberContext = false;
  state.memberCenter = state.user?.member_id ? state.memberCenter : null;
  state.page = "members";
  render();
  window.scrollTo(0, 0);
}
async function creditsLoanDecision(id,decision) {
  let comment="";
  if(decision==="approve"){
    if(!await confirmDialog("Record your Credits approval? Other committee members may still need to decide."))return;
  } else {
    comment=await promptDialog(decision==="return"?"Information or correction required:":"Reason for rejection:","");
    if(comment===null||!comment.trim())return;
  }
  try{const result=await api(`/api/loans/${id}/decision`,{method:"POST",body:JSON.stringify({decision,comment})});await refreshCredits();render();toast(decision==="approve"?"Your Credits approval was recorded.":decision==="reject"?(result.advisoryReject?"Rejection reason recorded. The loan continues — only Tabula can finally reject.":"Loan rejected."):"Loan decision recorded.");}catch(error){toast(error.message);}
}
async function creditsDisburse(id) {
  const loan=state.credits.loans.find(l=>String(l.id)===String(id));if(!loan)return;
  const fee=Number(loan.processingFee||Math.round(Number(loan.verifiedAmount||loan.amount)*0.02));
  const net=Math.max(0,Number(loan.verifiedAmount||loan.amount)-fee);
  if(!await confirmDialog(`Disburse net ${money(net)} to ${loan.member}? Full principal ${money(loan.verifiedAmount||loan.amount)} remains repayable after the ${money(fee)} processing fee deduction.`))return;
  try{const result=await api(`/api/loans/${id}/disburse`,{method:"POST",body:"{}"});await refreshCredits();render();toast(`Loan disbursed. Net cash ${money(result.netCash)}. Transaction ${result.transactionReference}.`);}catch(error){toast(error.message);}
}
async function waiveCreditCharge(id) {
  const reason=await promptDialog("Approved reason for waiving this charge:","");if(reason===null||!reason.trim())return;
  try{await api(`/api/credits/charges/${id}/waive`,{method:"POST",body:JSON.stringify({reason})});await refreshCredits();render();toast("Charge waiver recorded in the audit trail.");}catch(error){toast(error.message);}
}
function creditsMemberDetails(id) {
  const c=state.credits,m=c.members.find(x=>String(x.id)===String(id));if(!m)return;
  const loans=c.loans.filter(l=>l.memberId===m.id),transactions=c.transactions.filter(t=>t.memberId===m.id);
  document.body.insertAdjacentHTML("beforeend",`<div class="modal-backdrop" id="modal-backdrop"><div class="modal loan-detail-modal"><div class="modal-head"><div><h2>${m.name}</h2><p>${m.memberNumber} - ${m.phone}</p></div><button class="modal-close" data-close>${icons.x}</button></div><div class="form">
    <div class="loan-detail-summary"><div><span>Total savings</span><strong>${money(m.savings)}</strong></div><div><span>Outstanding loans</span><strong>${money(m.outstandingBalance)}</strong></div><div><span>Guarantees given</span><strong>${m.guaranteesGiven}</strong></div><div><span>Guarantees received</span><strong>${m.guaranteesReceived}</strong></div></div>
    <h3 class="loan-section-title">Loan history</h3>${financeDataTable("Facilities",["Loan","Product","Amount","Balance","Status"],loans.map(l=>[l.reference,l.product,money(l.amount),money(l.balance),status(l.status)]))}
    <h3 class="loan-section-title">Savings history</h3>${financeDataTable("Transactions",["Receipt","Date","Type","Amount","Status"],transactions.slice(0,20).map(t=>[t.receiptNumber,new Date(t.createdAt).toLocaleDateString(),t.type,money(t.amount),status(t.status)]))}
    <button class="button primary" data-credits-statement="${m.id}">${icons.download}Download member statement</button></div></div>`);
  document.querySelector("[data-close]").onclick=closeModal;document.querySelector("[data-credits-statement]").onclick=()=>downloadCreditsStatement(m.id);
}
function downloadCreditsStatement(memberId) {
  const c=state.credits,m=c.members.find(x=>String(x.id)===String(memberId));if(!m)return;
  const tx=c.transactions.filter(t=>t.memberId===m.id),loans=c.loans.filter(l=>l.memberId===m.id);
  const lines=["KASANGATI G40 KWAGALANA","SACCO MEMBER STATEMENT",`Member: ${m.name}`,`Membership: ${m.memberNumber}`,`Generated: ${new Date().toLocaleString()}`,"",`Savings balance: ${money(m.savings)}`,`Outstanding loans: ${money(m.outstandingBalance)}`,"","TRANSACTIONS","Receipt,Date,Type,Method,Amount,Status",
    ...tx.map(t=>`${t.receiptNumber},${new Date(t.createdAt).toLocaleDateString()},${t.type},${t.method},${t.amount},${t.status}`),"","LOANS","Reference,Product,Amount,Balance,Status",...loans.map(l=>`${l.reference},${l.product},${l.amount},${l.balance},${l.status}`)];
  const link=document.createElement("a");link.href=URL.createObjectURL(new Blob([lines.join("\n")],{type:"text/csv"}));link.download=`${m.memberNumber}-SACCO-statement.csv`;link.click();URL.revokeObjectURL(link.href);toast("Member statement downloaded.");
}
function downloadCreditsReport(name,format="excel") { downloadGeneratedReport("credits",name,format); }
function dashboardView() {
  if (state.role === "Member") return memberDashboard();
  if (state.role === "Executive Officer") return executiveDashboardView();
  if (state.role === "Finance Officer") return financeDashboardView();
  if (state.role === "Credits Officer") return creditsDashboardView();
  if (state.role === "Investment Officer") return investmentDashboardView();
  const totalSavings = state.members.reduce((n, m) => n + m.savings, 0);
  const outstanding = state.loans.filter(l => ["active", "overdue"].includes(l.status)).reduce((n, l) => n + l.balance, 0);
  const pending = state.loans.filter(l => ["pending", "review"].includes(l.status)).length + state.withdrawals.filter(w => w.status === "pending").length;
  return `<div class="organization-strip"><div><span>Central organization system</span><strong>${state.organization?.name||"Kasangati G40 Kwagalana"}</strong></div><button class="button secondary" data-page="departments">${icons.building}Open departmental dashboards</button></div>
    <div class="metric-grid">
      ${metric("Total members", state.members.length.toLocaleString(), "users", `<span class="up">? 8.4%</span> from last month`, "dark")}
      ${metric("Total savings", money(totalSavings), "wallet", `<span class="up">? 6.2%</span> this month`)}
      ${metric("Outstanding loans", money(outstanding), "loans", `<span class="warn">3.8%</span> portfolio at risk`, "amber")}
      ${metric("Pending approvals", pending, "clock", "Loans and withdrawals", "blue")}
    </div>
    <div class="dashboard-grid">
      <div>
        ${performanceChart()}
        <div class="card stack"><div class="card-head"><div><h2 class="card-title">Recent transactions</h2><p class="card-subtitle">Latest activity across all channels</p></div><button class="text-button" data-page="savings">View all ></button></div>${activityList(state.transactions.slice(0,5))}</div>
      </div>
      <div>
        ${quickActions()}
        <div class="card stack"><div class="card-head"><div><h2 class="card-title">Portfolio health</h2><p class="card-subtitle">Current operational targets</p></div></div>
          <div class="progress-list">
            ${progress("Monthly collection target", "82%", 82, "")}
            ${progress("Loans repaid on time", "91%", 91, "lime")}
            ${progress("Member KYC complete", "76%", 76, "amber")}
          </div>
        </div>
        <div class="notice warning" style="margin-top:18px;margin-bottom:0">${icons.info}<div><strong>4 items need attention</strong><p>Two loan reviews, one overdue loan and one withdrawal.</p></div></div>
      </div>
    </div>`;
}

function memberDashboard() {
  const member = state.members[0];
  const memberLoans = state.loans.filter(l => l.member === member.name);
  return `
    <div class="notice">${icons.info}<div><strong>July contribution received</strong><p>Your monthly saving of UGX 350,000 was posted successfully. Receipt TRX-90842 is available.</p></div></div>
    <div class="metric-grid">
      ${metric("Total savings", money(member.savings), "wallet", `<span class="up">? ${money(350000)}</span> this month`, "dark")}
      ${metric("Share capital", money(member.shares), "building", "25 shares owned")}
      ${metric("Loan balance", money(memberLoans.reduce((n,l)=>n+l.balance,0)), "loans", "Next payment: 05 Aug", "amber")}
      ${metric("Dividends earned", money(482500), "reports", "Projected for FY 2026", "blue")}
    </div>
    <div class="dashboard-grid">
      <div><div class="card"><div class="card-head"><div><h2 class="card-title">My recent transactions</h2><p class="card-subtitle">Your latest account activity</p></div><button class="text-button" data-action="statement">Download statement &gt;</button></div>${activityList(state.transactions.filter(t => t.member === member.name))}</div></div>
      <div>
        <div class="card"><div class="card-head"><div><h2 class="card-title">Quick actions</h2><p class="card-subtitle">What would you like to do?</p></div></div><div class="quick-grid">
          <button class="quick-action" data-modal="loan">${icons.loans}<strong>Apply for loan</strong></button>
          <button class="quick-action" data-modal="withdrawal">${icons.withdraw}<strong>Request withdrawal</strong></button>
          <button class="quick-action" data-action="statement">${icons.file}<strong>Get statement</strong></button>
          <button class="quick-action" data-action="notifications">${icons.bell}<strong>Notifications</strong></button>
        </div></div>
        <div class="card stack"><div class="card-head"><div><h2 class="card-title">Savings goal</h2><p class="card-subtitle">UGX 4,850,000 of UGX 6,000,000</p></div></div><div class="progress-list">${progress("Annual savings target","81%",81,"lime")}</div></div>
      </div>
    </div>`;
}

function performanceChart() {
  const savings = [48, 62, 57, 73, 68, 84, 79, 91];
  const loans = [35, 42, 51, 48, 61, 57, 72, 66];
  return `<div class="card"><div class="card-head"><div><h2 class="card-title">Savings & loan performance</h2><p class="card-subtitle">Monthly collections in millions (UGX)</p></div><button class="filter-chip">Last 8 months</button></div>
    <div class="chart-wrap"><div class="chart"><div class="chart-grid"><span></span><span></span><span></span><span></span><span></span></div><div class="y-labels"><span>100m</span><span>75m</span><span>50m</span><span>25m</span><span>0</span></div>
    ${["Dec","Jan","Feb","Mar","Apr","May","Jun","Jul"].map((m,i)=>`<div class="bar-group"><i class="bar" style="height:${savings[i]}%"></i><i class="bar alt" style="height:${loans[i]}%"></i><span class="bar-label">${m}</span></div>`).join("")}</div>
    <div class="legend"><span><i></i>Savings collected</span><span><i class="alt"></i>Loan repayments</span></div></div></div>`;
}

function quickActions() {
  const actionsByRole = {
    default: [["deposit","savings","Record deposit"],["loan","loans","New loan"],["report","reports","View reports"]]
  };
  const items = actionsByRole[state.role] || actionsByRole.default;
  return `<div class="card"><div class="card-head"><div><h2 class="card-title">Quick actions</h2><p class="card-subtitle">Common tasks for your role</p></div></div><div class="quick-grid">${items.map(([action,icon,label]) => `<button class="quick-action" ${action.startsWith("page-") ? `data-page="${action.slice(5)}"` : action === "report" ? `data-page="reports"` : action === "close" ? `data-action="close-session"` : `data-modal="${action}"`}>${icons[icon]}<strong>${label}</strong></button>`).join("")}</div></div>`;
}
function progress(label, value, width, color) { return `<div class="progress-row"><div class="progress-info"><span>${label}</span><strong>${value}</strong></div><div class="track"><div class="fill ${color}" style="width:${width}%"></div></div></div>`; }

function activityList(items) {
  if (!items.length) return `<div class="empty-state">${icons.receipt}<p>No transactions found.</p></div>`;
  return `<div class="activity-list">${items.map(t => {
    const outgoing = t.amount < 0;
    return `<div class="activity"><div class="activity-icon ${outgoing ? "out" : t.type.includes("Loan") ? "info" : ""}">${outgoing ? icons.arrowUp : icons.arrowDown}</div><div><div class="activity-title">${t.type} - ${t.member}</div><div class="activity-meta">${t.id} - ${t.method} - ${t.date}</div></div><div><div class="activity-amount ${outgoing ? "negative" : ""}">${outgoing ? "-" : "+"}${money(t.amount)}</div><div class="activity-status">${status(t.status)}</div></div></div>`;
  }).join("")}</div>`;
}

function membersView() {
  const rows = state.members.filter(m => `${m.name} ${m.id} ${m.phone||""}`.toLowerCase().includes(searchTerm.toLowerCase()));
  return `<div class="card table-card"><div class="card-head"><div><h2 class="card-title">Member directory</h2><p class="card-subtitle">${rows.length} member records - open any member dashboard with the eye icon</p></div></div><div class="table-tools"><div class="filter-set"><button class="filter-chip active">All members</button><button class="filter-chip">Active</button><button class="filter-chip">Suspended</button></div></div><div class="table-scroll"><table><thead><tr><th>Member</th><th>Contact</th><th>Joined</th><th>Savings</th><th>Share capital</th><th>Status</th><th></th></tr></thead><tbody>${rows.map(m => `<tr><td><div class="member-cell"><div class="avatar green">${m.initials}</div><div><div class="cell-main">${escapeHtml(m.name)}</div><div class="cell-sub">${escapeHtml(m.id)}</div></div></div></td><td><div class="cell-main">${escapeHtml(m.phone||"Not recorded")}</div></td><td>${m.joined?new Date(m.joined).toLocaleDateString():"—"}</td><td class="cell-main mono">${money(m.savings)}</td><td class="mono">${money(m.shares)}</td><td>${status(m.status)}</td><td><div class="table-actions"><button class="mini-btn" title="Open member dashboard" data-open-member-dashboard="${m.databaseId||m.memberId||""}">${icons.eye}</button></div></td></tr>`).join("")}</tbody></table></div></div>`;
}

function savingsView() {
  const memberMode = state.role === "Member";
  const currentMember = state.members[0];
  const tx = state.transactions.filter(t => (!memberMode || t.member === currentMember.name) && (!searchTerm || `${t.member} ${t.id} ${t.type}`.toLowerCase().includes(searchTerm.toLowerCase())));
  const total = state.members.reduce((n,m)=>n+m.savings,0);
  if (memberMode) return `<div class="metric-grid">
    ${metric("My savings", money(currentMember.savings), "wallet", `<span class="up">? ${money(350000)}</span> this month`, "dark")}
    ${metric("Monthly contribution", money(350000), "savings", "July contribution received")}
    ${metric("Share capital", money(currentMember.shares), "building", "25 shares owned")}
    ${metric("Available to withdraw", money(Math.max(0,currentMember.savings-100000)), "withdraw", "After minimum balance", "blue")}
  </div>
  <div class="card table-card"><div class="card-head"><div><h2 class="card-title">My savings statement</h2><p class="card-subtitle">Transactions on your member account</p></div></div><div class="table-scroll"><table><thead><tr><th>Reference</th><th>Transaction</th><th>Method</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>${tx.map(t=>`<tr><td class="cell-main">${t.id}</td><td>${t.type}</td><td>${t.method}</td><td class="cell-main mono">${money(t.amount)}</td><td>${status(t.status)}</td><td>${t.date}</td></tr>`).join("")}</tbody></table></div></div>`;
  return `<div class="metric-grid">
    ${metric("Members' savings", money(total), "wallet", `<span class="up">? 6.2%</span> this month`, "dark")}
    ${metric("July collections", money(12840000), "savings", "82% of monthly target")}
    ${metric("Share capital", money(state.members.reduce((n,m)=>n+m.shares,0)), "building", "Tracked separately")}
    ${metric("Pending deposits", money(740000), "clock", "4 awaiting verification", "amber")}
  </div>
  <div class="card table-card"><div class="card-head"><div><h2 class="card-title">Savings transactions</h2><p class="card-subtitle">Deposits, repayments and share purchases</p></div></div><div class="table-tools"><div class="filter-set"><button class="filter-chip active">All transactions</button><button class="filter-chip">Deposits</button><button class="filter-chip">Repayments</button></div></div><div class="table-scroll"><table><thead><tr><th>Reference</th><th>Member</th><th>Transaction</th><th>Method</th><th>Amount</th><th>Status</th><th>Date</th><th></th></tr></thead><tbody>${tx.map(t=>`<tr><td class="cell-main">${t.id}</td><td>${t.member}</td><td>${t.type}</td><td>${t.method}</td><td class="cell-main mono ${t.amount<0?"negative":""}">${money(t.amount)}</td><td>${status(t.status)}</td><td>${new Date(t.date).toLocaleString()}</td><td>${state.permissions.includes("transaction:verify")&&t.status==="pending"?`<button class="button small primary" data-verify="${t.databaseId}">Verify</button>`:""}</td></tr>`).join("")}</tbody></table></div></div>`;
}

function loansView() {
  const rows = state.loans.filter(l => (state.role !== "Member" || l.member === state.members[0].name) && (!searchTerm || `${l.member} ${l.id} ${l.product}`.toLowerCase().includes(searchTerm.toLowerCase())));
  const guaranteeRequests=state.guarantorRequests||[];
  return `<div class="loan-hero"><div><span class="eyebrow" style="color:var(--lime)">Responsible credit</span><h2>Loans that help members move forward</h2><p>Applications follow savings checks, guarantor consent, officer appraisal and committee approval before disbursement.</p></div>${(state.permissions.includes("loan:create")||state.permissions.includes("loan:manage"))?`<button class="button lime" data-modal="loan">${icons.plus}Apply for a loan</button>`:""}</div>
  ${state.role==="Member"&&guaranteeRequests.length?`<div class="card table-card" style="margin-bottom:18px"><div class="card-head"><div><h2 class="card-title">Guarantee requests</h2><p class="card-subtitle">Members asking you to guarantee their loan</p></div><span class="nav-badge">${guaranteeRequests.filter(r=>r.guarantorStatus==="pending").length}</span></div><div class="table-scroll"><table><thead><tr><th>Borrower</th><th>Product</th><th>Amount</th><th>Purpose</th><th>Your response</th><th></th></tr></thead><tbody>${guaranteeRequests.map(r=>`<tr><td class="cell-main">${r.member}</td><td>${r.product}</td><td class="cell-main">${money(r.amount)}</td><td>${r.purpose}</td><td>${status(r.guarantorStatus)}</td><td>${r.guarantorStatus==="pending"?`<div class="table-actions"><button class="button small danger" data-guarantee="reject" data-id="${r.databaseId}">Reject</button><button class="button small primary" data-guarantee="accept" data-id="${r.databaseId}">Accept</button></div>`:""}</td></tr>`).join("")}</tbody></table></div></div>`:""}
  <div class="products">
    ${loanProduct("Development Loan","Business, housing and productive assets","18% p.a.","24 months","building")}
    ${loanProduct("School Fees Loan","Education expenses for members' families","15% p.a.","12 months","file")}
    ${loanProduct("Emergency Loan","Fast support for urgent personal needs","12% p.a.","6 months","shield")}
  </div>
  <div class="card table-card"><div class="card-head"><div><h2 class="card-title">${state.role==="Member"?"My loans":"Loan portfolio"}</h2><p class="card-subtitle">Applications, workflow stages, and active facilities</p></div></div><div class="table-scroll"><table><thead><tr><th>Loan ID</th><th>Member</th><th>Product</th><th>Amount</th><th>Balance</th><th>Term</th><th>Next repayment</th><th>Status</th><th></th></tr></thead><tbody>${rows.map(l=>`<tr><td class="cell-main">${l.id}</td><td>${l.member}</td><td>${l.product}</td><td class="mono">${money(l.amount)}</td><td class="cell-main mono">${money(l.balance)}</td><td>${l.term}</td><td>${l.nextRepaymentDate?new Date(l.nextRepaymentDate).toLocaleDateString():"?"}</td><td>${status(l.status)}</td><td><button class="mini-btn" data-action="view-loan" data-id="${l.id}">${icons.eye}</button></td></tr>`).join("")}</tbody></table></div></div>`;
}
function loanProduct(name, description, rate, term, icon) { return `<div class="product"><div class="product-icon">${icons[icon]}</div><h3>${name}</h3><p>${description}</p><div class="product-meta"><span>Interest<strong>${rate}</strong></span><span>Up to<strong>${term}</strong></span></div></div>`; }

function withdrawalsView() {
  const rows = state.withdrawals.filter(w => state.role !== "Member" || w.member === state.members[0].name);
  return `${state.role==="Member"?`<div class="notice">${icons.info}<div><strong>Withdrawal rules apply</strong><p>Requests are checked against minimum savings, loan security and pending obligations before approval.</p></div></div>`:""}
  <div class="metric-grid">
    ${metric("Pending requests", rows.filter(w=>w.status==="pending").length, "clock", money(rows.filter(w=>w.status==="pending").reduce((n,w)=>n+w.amount,0)), "dark")}
    ${metric("Approved this month", "18", "check", money(6280000))}
    ${metric("Average processing", "1.4 days", "clock", "Within the 2-day target", "blue")}
    ${metric("Minimum balance", money(100000), "shield", "Standard savings rule", "amber")}
  </div>
  <div class="card table-card"><div class="card-head"><div><h2 class="card-title">${state.role==="Member"?"My withdrawal requests":"Withdrawal requests"}</h2><p class="card-subtitle">Requests require a separate approver</p></div>${canWrite()?`<button class="button primary small" data-modal="withdrawal">${icons.plus}New request</button>`:""}</div><div class="table-scroll"><table><thead><tr><th>Reference</th><th>Member</th><th>Amount</th><th>Method</th><th>Date</th><th>Status</th><th></th></tr></thead><tbody>${rows.map(w=>`<tr><td class="cell-main">${w.id}</td><td>${w.member}</td><td class="cell-main mono">${money(w.amount)}</td><td>${w.method}</td><td>${w.date}</td><td>${status(w.status)}</td><td><button class="mini-btn" data-action="view-withdrawal" data-id="${w.id}">${icons.eye}</button></td></tr>`).join("")}</tbody></table></div></div>`;
}

function approvalsView() {
  const stages=state.role==="Finance Officer"?[]:
    state.role==="Executive Officer"?["executive-authorization"]:
    state.role==="Credits Officer"?["ready-disbursement"]:
    ["pending-guarantors","officer-review","committee-review","executive-authorization","ready-disbursement"];
  const loans = state.loans.filter(l=>stages.includes(l.status));
  const withdrawals = state.withdrawals.filter(w=>w.status==="pending");
  return `<div class="notice warning">${icons.shield}<div><strong>Maker?checker control is active</strong><p>You cannot approve a financial transaction you created. Every decision is recorded in the audit log.</p></div></div>
  <div class="metric-grid">
    ${metric("Awaiting decision", loans.length+withdrawals.length, "clock", "Across all workflows", "dark")}
    ${metric("Loan applications", loans.length, "loans", money(loans.reduce((n,l)=>n+l.amount,0)))}
    ${metric("Withdrawals", withdrawals.length, "withdraw", money(withdrawals.reduce((n,w)=>n+w.amount,0)), "amber")}
    ${metric("Approved this month", "42", "check", "Median time: 7.2 hours", "blue")}
  </div>
  <div class="card table-card"><div class="card-head"><div><h2 class="card-title">Approval queue</h2><p class="card-subtitle">Review supporting details before making a decision</p></div></div><div class="table-scroll"><table><thead><tr><th>Reference</th><th>Request</th><th>Member</th><th>Amount</th><th>Stage</th><th>Actions</th></tr></thead><tbody>
    ${loans.map(l=>approvalRow(l.id,l.product,l.member,l.amount,l.status,"loan")).join("")}
    ${withdrawals.map(w=>approvalRow(w.id,"Savings withdrawal",w.member,w.amount,w.status,"withdrawal")).join("")}
  </tbody></table></div></div>`;
}
function approvalRow(id,type,member,amount,stage,kind) {
  const canDecide=(kind==="withdrawal"&&state.role==="Credits Officer")||(kind==="loan"&&["Credits Officer","Executive Officer"].includes(state.role));
  let actions=`<button class="mini-btn" data-action="view-${kind}" data-id="${id}">${icons.eye}</button>`;
  if(canDecide)actions=`<div class="table-actions"><button class="button small secondary" data-decision="reject" data-kind="${kind}" data-id="${id}">Reject</button><button class="button small primary" data-decision="approve" data-kind="${kind}" data-id="${id}">${state.role==="Executive Officer"&&kind==="loan"?"Authorize":"Approve"}</button></div>`;
  if(kind==="loan"&&state.role==="Finance Officer")actions=`<button class="button small primary" data-loan-action="verify" data-id="${id}">Verify amount</button>`;
  if(kind==="loan"&&state.role==="Credits Officer")actions=`<button class="button small primary" data-loan-action="disburse" data-id="${id}">Disburse</button>`;
  return `<tr><td class="cell-main">${id}</td><td>${type}</td><td>${member}</td><td class="cell-main mono">${money(amount)}</td><td>${status(stage)}</td><td>${actions}</td></tr>`;
}

function reportsView() {
  return `<div class="metric-grid">
    ${metric("Operating income", money(18460000), "reports", `<span class="up">? 11.6%</span> vs last month`, "dark")}
    ${metric("Operating expenses", money(7280000), "receipt", "39.4% expense ratio", "amber")}
    ${metric("Net surplus", money(11180000), "savings", `<span class="up">? 8.3%</span> vs plan`)}
    ${metric("Portfolio at risk", "3.8%", "loans", "Target is below 5%", "blue")}
  </div>
  <div class="dashboard-grid">
    ${performanceChart()}
    <div>
      <div class="card"><div class="card-head"><div><h2 class="card-title">Report library</h2><p class="card-subtitle">Ready to generate</p></div></div><div class="activity-list">
        ${["Member savings report","Loan portfolio report","Loan arrears report","Income & expense report","Daily collections report","Audit report"].map((name,i)=>`<div class="activity"><div class="activity-icon ${i>2?"info":""}">${icons.file}</div><div><div class="activity-title">${name}</div><div class="activity-meta">Updated today</div></div><button class="mini-btn" data-action="download-report" data-name="${name}">${icons.download}</button></div>`).join("")}
      </div></div>
    </div>
  </div>`;
}

function auditView() {
  return `<div class="notice">${icons.shield}<div><strong>Audit records are append-only</strong><p>Financial actions cannot be permanently deleted. Corrections use a documented reversal and approval process.</p></div></div>
  <div class="card table-card"><div class="card-head"><div><h2 class="card-title">System activity</h2><p class="card-subtitle">Who did what, and when</p></div></div><div class="table-scroll"><table><thead><tr><th>Event</th><th>User</th><th>Role</th><th>Action</th><th>Details</th><th>Time</th></tr></thead><tbody>${state.audit.map(a=>`<tr><td class="cell-main">${a.id}</td><td>${a.actor}</td><td>${a.role}</td><td class="cell-main">${a.action}</td><td>${a.detail}</td><td>${a.time}</td></tr>`).join("")}</tbody></table></div></div>`;
}

function messagesView() {
  const messenger=state.messenger;
  if(!messenger) return `<div class="card messenger-loading"><div class="spinner"></div><p>Loading your conversations?</p></div>`;
  const conversations=messenger.conversations||[], active=messenger.active;
  return `<div class="messenger ${active?"chat-open":""}">
    <aside class="conversation-panel">
      <div class="conversation-search">${icons.search}<input id="conversation-search" placeholder="Search conversations"></div>
      <div class="chat-filters"><button class="active" data-chat-filter="all">All</button><button data-chat-filter="group">Groups</button><button data-chat-filter="channel">Channels</button><button data-chat-filter="unread">Unread</button><button data-chat-filter="archived">Archived</button><button class="chat-search-action" data-action="message-search" title="Search messages">${icons.search}</button></div>
      <div class="conversation-list" id="conversation-list">
        ${conversations.length?conversations.map(c=>conversationItem(c,active?.conversationId)).join(""):`<div class="message-empty compact">${icons.messages}<strong>No conversations yet</strong><span>Start a message with any member or staff user.</span></div>`}
      </div>
      <div class="conversation-footer"><button class="button primary" data-action="new-message">${icons.plus} Start new chat</button></div>
    </aside>
    <section class="chat-panel">
      ${active?chatView(active):`<div class="message-empty">${icons.messages}<strong>Your organization conversations</strong><span>Choose a conversation or start a new message.</span><button class="button primary" data-action="new-message">${icons.plus}New message</button></div>`}
    </section>
  </div>`;
}
function conversationItem(c,activeId) {
  const mine=Number(c.lastSenderId)===Number(state.user.id);
  return `<button class="conversation-item ${String(c.id)===String(activeId)?"active":""} ${c.archived?"archived":""}" data-conversation="${c.id}" data-chat-type="${c.type}" data-unread="${c.unreadCount?1:0}" data-archived="${c.archived?1:0}" data-search-name="${c.otherName.toLowerCase()} ${c.otherRole.toLowerCase()}">
    <span class="chat-avatar ${c.type!=="direct"?"group":""} ${c.type==="direct"?"clickable-profile":""}" ${c.type==="direct"?`data-user-profile="${c.otherUserId}"`:""}>${c.type!=="direct"?(c.type==="channel"?icons.bell:icons.users):profileImage(c.otherUserId,c.otherName,c.otherHasProfilePhoto)}${c.online?`<i></i>`:""}</span>
    <div class="conversation-copy"><div class="conversation-name"><strong>${c.otherName}</strong><time>${messageTime(c.lastMessageDate)}</time></div>
    <div class="conversation-preview"><span>${c.mutedUntil?"?? ":""}${mine&&c.lastMessage?"You: ":""}${escapeHtml(c.lastMessage||"Conversation started")}</span>${c.unreadCount?`<b>${c.unreadCount}</b>`:""}</div></div>
  </button>`;
}
function chatView(active) {
  const cannotPost=active.onlyAdminsCanPost&&active.memberRole!=="admin";
  return `<header class="chat-head"><button class="chat-back" data-action="chat-back" title="Back to conversations">${icons.arrowDown}</button><span class="chat-avatar chat-head-avatar ${active.type!=="direct"?"group":""} ${active.type==="direct"?"clickable-profile":""}" ${active.type==="direct"?`data-user-profile="${active.other.id}"`:""}>${active.type!=="direct"?(active.type==="channel"?icons.bell:icons.users):profileImage(active.other.id,active.other.fullName,active.other.hasProfilePhoto)}${active.other.online?`<i></i>`:""}</span><div class="chat-head-copy"><strong>${active.other.fullName}</strong><span>${active.typingUsers?.length?`${active.typingUsers.join(", ")} typing?`:active.other.online?"Online":active.other.role}${active.type==="group"&&active.onlyAdminsCanPost?" - Admins post only":""}</span></div><button class="icon-button" data-action="chat-info">${icons.info}</button></header>
    <div class="chat-messages" id="chat-messages">
      <div class="chat-day"><span>Secure conversation</span></div>
      ${active.messages.length?active.messages.map(messageBubble).join(""):`<div class="message-empty compact">${icons.messages}<strong>Say hello to ${active.other.fullName.split(" ")[0]}</strong><span>Messages are private to participants.</span></div>`}
    </div>
    <div class="reply-preview ${state.messageReply?"show":""}" id="reply-preview">${state.messageReply?`<div><span>Replying to ${state.messageReply.senderName}</span><strong>${escapeHtml(state.messageReply.body)}</strong></div><button data-action="cancel-reply">${icons.x}</button>`:""}</div>
    ${cannotPost?`<div class="admin-only-notice">${icons.lock} Only administrators can send messages in this conversation.</div>`:`<form class="message-composer" id="message-form">
      <button type="button" class="composer-tool" data-action="attach-file" title="Share files">${icons.plus}</button><input type="file" id="message-files" multiple hidden accept="image/*,video/mp4,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt,.csv">
      <button type="button" class="composer-tool" data-action="emoji" title="Add emoji">:)</button>
      <textarea name="body" rows="1" maxlength="2000" placeholder="Type a message? Use @name to mention someone" required></textarea>
      <span class="composer-count" id="composer-count">0/2000</span>
      <button class="send-button" type="submit" aria-label="Send message">${icons.arrowUp}</button>
    </form>`}`;
}
function messageBubble(message) {
  const mine=Number(message.senderId)===Number(state.user.id);
  return `<div class="message-row ${mine?"mine":""}">${!mine?`<button class="message-avatar clickable-profile" data-user-profile="${message.senderId}" title="View ${escapeHtml(message.senderName)} profile">${profileImage(message.senderId,message.senderName,message.senderHasProfilePhoto)}</button>`:""}<div class="message-wrap">
    <div class="message-actions"><button data-message-reply="${message.id}" title="Reply">Reply</button><button data-message-menu="${message.id}" title="More actions">...</button></div>
    <div class="message-bubble" data-reply-message="${message.id}" title="Double-click to reply">
    ${state.messenger?.active?.type!=="direct"&&!mine?`<div class="message-sender">${escapeHtml(message.senderName)}</div>`:""}
    ${message.forwardedFromId?`<div class="forwarded-label">? Forwarded</div>`:""}
    ${message.starred?`<div class="starred-label">? Starred</div>`:""}
    ${message.pinnedAt?`<div class="pinned-label">?? Pinned</div>`:""}
    ${message.replyBody?`<div class="quoted-message">${escapeHtml(message.replyBody)}</div>`:""}
    <p>${escapeHtml(message.body).replace(/\n/g,"<br>")}</p>
    ${(message.attachments||[]).length?`<div class="message-attachments">${message.attachments.map(attachmentCard).join("")}</div>`:""}
    <div class="message-meta">${message.editedAt?"<em>edited</em>":""}<time>${messageTime(message.createdAt,true)}</time>${mine?`<span class="${message.readAt?"read":""}" title="${message.readAt?"Read":message.deliveredAt?"Delivered":"Sent"}">${message.deliveredAt?"??":"?"}</span>`:""}</div>
    </div>
    <div class="reaction-row">${(message.reactions||[]).map(r=>`<button class="${r.mine?"mine":""}" data-reaction="${message.id}" data-emoji="${r.emoji}">${r.emoji} <span>${r.count}</span></button>`).join("")}<div class="quick-reactions">${["??","??","??","??"].map(emoji=>`<button data-reaction="${message.id}" data-emoji="${emoji}">${emoji}</button>`).join("")}</div></div>
  </div></div>`;
}
function attachmentCard(file) {
  const url=`/api/messages/attachments/${file.id}/download`,image=String(file.mimeType).startsWith("image/");
  return `<a class="attachment-card ${image?"image":""}" href="${url}" target="_blank" download="${escapeHtml(file.name)}">${image?`<img src="${url}" alt="${escapeHtml(file.name)}">`:`<span class="file-icon">${file.mimeType.includes("pdf")?"PDF":"FILE"}</span>`}<div><strong>${escapeHtml(file.name)}</strong><span>${formatBytes(file.size)} - ${file.downloads||0} downloads</span></div>${icons.download}</a>`;
}
function formatBytes(value) {
  const bytes=Number(value);if(bytes<1024)return `${bytes} B`;if(bytes<1048576)return `${(bytes/1024).toFixed(1)} KB`;return `${(bytes/1048576).toFixed(1)} MB`;
}
function messageTime(value,full=false) {
  if(!value) return "";
  const date=new Date(value), now=new Date(), same=date.toDateString()===now.toDateString();
  return same||full?date.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):date.toLocaleDateString([],{month:"short",day:"numeric"});
}
function escapeHtml(value) {
  return String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char]));
}
async function loadMessenger(preferredId=null) {
  const result=await api("/api/messages/conversations");
  const currentId=preferredId||state.messenger?.active?.conversationId||result.conversations.find(c=>!c.archived)?.id;
  let active=null;
  if(currentId) active=await api(`/api/messages/conversations/${currentId}`);
  state.messenger={conversations:result.conversations,active};
  state.unreadMessages=result.conversations.reduce((sum,c)=>sum+Number(c.unreadCount||0),0);
  if(active) {
    const conversation=state.messenger.conversations.find(c=>String(c.id)===String(active.conversationId));
    if(conversation) conversation.unreadCount=0;
    state.unreadMessages=state.messenger.conversations.reduce((sum,c)=>sum+Number(c.unreadCount||0),0);
  }
  if(!messagePoll) messagePoll=setInterval(pollMessages,5000);
}
async function pollMessages() {
  if(state.page!=="messages") return;
  if(document.activeElement?.closest?.(".message-composer")) return;
  try {
    const previousUnread=Number(state.unreadMessages||0);
    const current=state.messenger?.active?.conversationId;
    await loadMessenger(current);
    if(state.unreadMessages>previousUnread&&"Notification" in window&&Notification.permission==="granted") {
      new Notification("New Kasangati G40 message",{body:"You have a new secure message.",icon:"/icon.svg"});
    }
    render();
  } catch {}
}
async function openConversation(id) {
  try {
    state.messageReply=null;
    await loadMessenger(id); render();
  } catch(error) { toast(error.message); }
}
async function openMessengerUserProfile(userId){
  try{const {user}=await api(`/api/messages/users/${userId}/profile`);closeModal();document.body.insertAdjacentHTML("beforeend",`<div class="modal-backdrop" id="modal-backdrop"><div class="modal messenger-profile-modal"><div class="modal-head"><div><h2>User profile</h2><p>Verified organization account</p></div><button class="modal-close" data-close>${icons.x}</button></div><div class="messenger-profile-card"><button class="messenger-profile-photo" disabled>${profileImage(user.id,user.fullName,user.hasProfilePhoto)}</button><h3>${escapeHtml(user.fullName)}</h3><p>${escapeHtml(user.role)}</p>${user.departments?.length?`<div class="messenger-profile-departments">${user.departments.map(d=>`<span>${escapeHtml(d.name)} - ${escapeHtml(d.title||user.role)}</span>`).join("")}</div>`:""}<dl><dt>Email</dt><dd>${escapeHtml(user.email)}</dd><dt>Branch</dt><dd>${escapeHtml(user.branch||"Not assigned")}</dd>${user.memberNumber?`<dt>Member number</dt><dd>${escapeHtml(user.memberNumber)}</dd><dt>Membership</dt><dd>${escapeHtml(user.memberStatus||"active")}</dd>`:""}</dl></div><div class="form-actions"><button class="button secondary" data-close-2>Close</button>${Number(user.id)!==Number(state.user.id)?`<button class="button primary" data-profile-message="${user.id}">${icons.messages} Message ${escapeHtml(user.fullName.split(" ")[0])}</button>`:""}</div></div></div>`);document.querySelector("[data-close]").onclick=closeModal;document.querySelector("[data-close-2]").onclick=closeModal;document.querySelector("[data-profile-message]")?.addEventListener("click",()=>startConversation(user.id));}catch(error){toast(error.message);}
}
document.addEventListener("click",event=>{const target=event.target.closest?.("[data-user-profile]");if(!target)return;event.preventDefault();event.stopPropagation();openMessengerUserProfile(target.dataset.userProfile);});
async function sendMessage(event) {
  event.preventDefault();
  const form=event.currentTarget,area=form.querySelector("textarea"),body=area.value.trim();
  if(!body) return;
  const button=form.querySelector("button[type=submit]");button.disabled=true;
  try {
    await api(`/api/messages/conversations/${state.messenger.active.conversationId}/messages`,{method:"POST",body:JSON.stringify({body,replyToId:state.messageReply?.id||null})});
    state.messageReply=null; await loadMessenger(state.messenger.active.conversationId); render();
  } catch(error) { button.disabled=false;toast(error.message); }
}
function setMessageReply(id) {
  const message=state.messenger?.active?.messages.find(m=>String(m.id)===String(id));
  if(!message)return;
  state.messageReply={id:message.id,body:message.body,senderName:message.senderName};render();
  document.querySelector(".message-composer textarea")?.focus();
}
function filterConversations(term) {
  const value=term.trim().toLowerCase();
  document.querySelectorAll("[data-search-name]").forEach(item=>item.style.display=item.dataset.searchName.includes(value)?"":"none");
}
function filterChatType(button) {
  document.querySelectorAll("[data-chat-filter]").forEach(el=>el.classList.toggle("active",el===button));
  const filter=button.dataset.chatFilter;
  document.querySelectorAll("[data-conversation]").forEach(item=>{
    item.style.display=(filter==="all"&&item.dataset.archived!=="1")||item.dataset.chatType===filter||(filter==="unread"&&item.dataset.unread==="1")||(filter==="archived"&&item.dataset.archived==="1")?"":"none";
  });
}
async function openNewMessageModal() {
  try {
    const {contacts}=await api("/api/messages/contacts");
    document.body.insertAdjacentHTML("beforeend",`<div class="modal-backdrop" id="modal-backdrop"><div class="modal"><div class="modal-head"><div><h2>New message</h2><p>Message any active member or staff user</p></div><button class="modal-close" data-close>${icons.x}</button></div><div class="form"><div class="field"><label>Find someone</label><input id="contact-search" placeholder="Search by name, role or email"></div><div class="contact-list" id="contact-list">${contacts.map(contactItem).join("")}</div></div></div></div>`);
    document.querySelector("[data-close]").onclick=closeModal;
    document.getElementById("modal-backdrop").addEventListener("click",event=>{if(event.target.id==="modal-backdrop")closeModal();});
    document.querySelectorAll("[data-contact]").forEach(el=>el.addEventListener("click",()=>startConversation(el.dataset.contact)));
    document.getElementById("contact-search").addEventListener("input",event=>{
      const value=event.target.value.toLowerCase();
      document.querySelectorAll("[data-contact-name]").forEach(el=>el.style.display=el.dataset.contactName.includes(value)?"":"none");
    });
  } catch(error) { toast(error.message); }
}
function contactItem(contact) {
  return `<div class="contact-item" data-contact-name="${`${contact.fullName} ${contact.role} ${contact.email}`.toLowerCase()}"><button class="chat-avatar clickable-profile" data-user-profile="${contact.id}" title="View profile">${profileImage(contact.id,contact.fullName,contact.hasProfilePhoto)}${contact.online?`<i></i>`:""}</button><button class="contact-start" data-contact="${contact.id}"><span class="contact-copy"><strong>${contact.fullName}</strong><span>${contact.role} - ${contact.email}</span></span>${icons.messages}</button></div>`;
}
async function startConversation(userId) {
  try {
    const result=await api("/api/messages/conversations",{method:"POST",body:JSON.stringify({userId})});
    closeModal();state.page="messages";await loadMessenger(result.conversationId);render();
    document.querySelector(".message-composer textarea")?.focus();
  } catch(error) { toast(error.message); }
}
async function openNewGroupModal() {
  try {
    const {contacts}=await api("/api/messages/contacts");
    document.body.insertAdjacentHTML("beforeend",`<div class="modal-backdrop" id="modal-backdrop"><div class="modal"><div class="modal-head"><div><h2>Create a group</h2><p>Bring members and staff together in one conversation</p></div><button class="modal-close" data-close>${icons.x}</button></div>
      <form class="form" id="group-form"><div class="form-grid"><div class="field full"><label>Group name</label><input name="title" maxlength="80" required placeholder="e.g. Loan Committee 2026"></div><div class="field full"><label>Description</label><textarea name="description" maxlength="500" placeholder="What is this group for?"></textarea></div>
      <div class="field full"><label>Select members</label><input id="group-contact-search" placeholder="Search people"><div class="group-member-picker" id="group-member-picker">${contacts.map(groupContactOption).join("")}</div></div>
      <div class="field full"><div class="group-permission"><div><strong>Administrators only</strong><span>Only admins can send messages</span></div><button type="button" class="toggle" id="admin-post-toggle"></button><input type="hidden" name="onlyAdminsCanPost" value="false"></div></div></div>${formActions("Create group")}</form></div></div>`);
    document.querySelector("[data-close]").onclick=closeModal;
    document.getElementById("group-form").addEventListener("submit",createGroup);
    document.getElementById("admin-post-toggle").onclick=event=>{event.currentTarget.classList.toggle("on");document.querySelector("[name=onlyAdminsCanPost]").value=event.currentTarget.classList.contains("on");};
    document.getElementById("group-contact-search").addEventListener("input",event=>{
      const value=event.target.value.toLowerCase();
      document.querySelectorAll("[data-group-contact-name]").forEach(el=>el.style.display=el.dataset.groupContactName.includes(value)?"":"none");
    });
  } catch(error) { toast(error.message); }
}
function groupContactOption(contact) {
  return `<label class="group-member-option" data-group-contact-name="${`${contact.fullName} ${contact.role}`.toLowerCase()}"><input type="checkbox" name="memberIds" value="${contact.id}"><span class="chat-avatar clickable-profile" data-user-profile="${contact.id}">${profileImage(contact.id,contact.fullName,contact.hasProfilePhoto)}</span><div><strong>${contact.fullName}</strong><span>${contact.role}</span></div></label>`;
}
async function createGroup(event) {
  event.preventDefault();
  const data=new FormData(event.currentTarget);
  const payload={title:data.get("title"),description:data.get("description"),onlyAdminsCanPost:data.get("onlyAdminsCanPost")==="true",memberIds:data.getAll("memberIds").map(Number)};
  const button=event.currentTarget.querySelector("[type=submit]");button.disabled=true;button.textContent="Creating?";
  try {
    const result=await api("/api/messages/groups",{method:"POST",body:JSON.stringify(payload)});
    closeModal();state.page="messages";await loadMessenger(result.conversationId);render();toast(`${payload.title} created.`);
  } catch(error) { button.disabled=false;button.textContent="Create group";toast(error.message); }
}
async function reactToMessage(messageId,emoji) {
  try {
    await api(`/api/messages/messages/${messageId}/reactions`,{method:"POST",body:JSON.stringify({emoji})});
    await loadMessenger(state.messenger.active.conversationId);render();
  } catch(error) { toast(error.message); }
}
function openMessageMenu(messageId) {
  const message=state.messenger.active.messages.find(item=>String(item.id)===String(messageId));
  if(!message)return;
  const mine=Number(message.senderId)===Number(state.user.id);
  document.body.insertAdjacentHTML("beforeend",`<div class="modal-backdrop" id="modal-backdrop"><div class="modal" style="max-width:380px"><div class="modal-head"><div><h2>Message actions</h2><p>${mine?"Your message":`From ${escapeHtml(message.senderName)}`}</p></div><button class="modal-close" data-close>${icons.x}</button></div><div class="form">
    <div class="setting-row"><div class="setting-icon">${icons.receipt}</div><div class="setting-copy"><strong>Reply</strong><span>Quote this message in your response</span></div><button class="button small secondary" data-menu-action="reply">Select</button></div>
    <div class="setting-row"><div class="setting-icon">${icons.file}</div><div class="setting-copy"><strong>Copy text</strong><span>Copy message to clipboard</span></div><button class="button small secondary" data-menu-action="copy">Copy</button></div>
    <div class="setting-row"><div class="setting-icon">${icons.info}</div><div class="setting-copy"><strong>${message.pinnedAt?"Unpin":"Pin"} message</strong><span>Keep important information visible</span></div><button class="button small secondary" data-menu-action="pin">${message.pinnedAt?"Unpin":"Pin"}</button></div>
    <div class="setting-row"><div class="setting-icon">${icons.savings}</div><div class="setting-copy"><strong>${message.starred?"Unstar":"Star"} message</strong><span>Save it in your important messages</span></div><button class="button small secondary" data-menu-action="star">${message.starred?"Unstar":"Star"}</button></div>
    <div class="setting-row"><div class="setting-icon">${icons.arrowUp}</div><div class="setting-copy"><strong>Forward message</strong><span>Share it in another conversation</span></div><button class="button small secondary" data-menu-action="forward">Forward</button></div>
    ${mine?`<div class="setting-row"><div class="setting-icon">${icons.file}</div><div class="setting-copy"><strong>Edit message</strong><span>Update the message text</span></div><button class="button small secondary" data-menu-action="edit">Edit</button></div>`:""}
    ${(mine||state.messenger.active.memberRole==="admin")?`<div class="setting-row"><div class="setting-icon">${icons.x}</div><div class="setting-copy"><strong>Delete message</strong><span>Remove it for everyone</span></div><button class="button small danger" data-menu-action="delete">Delete</button></div>`:""}
  </div></div></div>`);
  document.querySelector("[data-close]").onclick=closeModal;
  document.querySelectorAll("[data-menu-action]").forEach(el=>el.onclick=()=>performMessageAction(el.dataset.menuAction,message));
}
async function performMessageAction(action,message) {
  try {
    if(action==="reply"){closeModal();return setMessageReply(message.id);}
    if(action==="copy"){await navigator.clipboard.writeText(message.body);closeModal();return toast("Message copied.");}
    if(action==="forward"){closeModal();return openForwardMessage(message);}
    if(action==="edit"){
      const body=await promptDialog("Edit your message:",message.body);if(!body)return;
      await api(`/api/messages/messages/${message.id}`,{method:"PATCH",body:JSON.stringify({action:"edit",body})});
    }
    if(action==="pin") await api(`/api/messages/messages/${message.id}`,{method:"PATCH",body:JSON.stringify({action:"pin"})});
    if(action==="star") await api(`/api/messages/messages/${message.id}/star`,{method:"POST",body:"{}"});
    if(action==="delete"){
      if(!await confirmDialog("Delete this message for everyone?"))return;
      await api(`/api/messages/messages/${message.id}`,{method:"DELETE"});
    }
    closeModal();await loadMessenger(state.messenger.active.conversationId);render();toast("Message updated.");
  } catch(error) { toast(error.message); }
}
function openGroupInfo() {
  const group=state.messenger.active,isGroup=group.type==="group",isAdmin=isGroup&&group.memberRole==="admin";
  document.body.insertAdjacentHTML("beforeend",`<div class="modal-backdrop" id="modal-backdrop"><div class="modal"><div class="modal-head"><div><h2>${isGroup?"Group":"Channel"} information</h2><p>${group.participants.length} participants</p></div><button class="modal-close" data-close>${icons.x}</button></div>
    <div class="group-info-header"><div class="chat-avatar group">${isGroup?icons.users:icons.bell}</div><h3>${escapeHtml(group.title)}</h3><p>${escapeHtml(group.description||`No ${isGroup?"group":"channel"} description`)}</p></div>
    <div class="form">${isAdmin?`<div class="form-actions" style="margin:0 0 12px;padding:0 0 12px"><button class="button secondary" data-group-edit>Edit group</button><button class="button primary" data-group-add>${icons.plus}Add member</button></div>`:""}
      <div class="setting-row"><div class="setting-icon">${icons.bell}</div><div class="setting-copy"><strong>${group.mutedUntil?"Unmute":"Mute"} notifications</strong><span>Control alerts for this conversation</span></div><button class="button small secondary" data-chat-preference="mute">${group.mutedUntil?"Unmute":"Mute"}</button></div>
      <div class="setting-row"><div class="setting-icon">${icons.file}</div><div class="setting-copy"><strong>${group.archived?"Unarchive":"Archive"} conversation</strong><span>Manage where it appears in your list</span></div><button class="button small secondary" data-chat-preference="archive">${group.archived?"Unarchive":"Archive"}</button></div>
      <div class="card-title" style="margin-bottom:8px">Participants</div>
      ${group.participants.map(p=>`<div class="group-participant"><button class="chat-avatar clickable-profile" data-user-profile="${p.id}">${profileImage(p.id,p.fullName,p.hasProfilePhoto)}</button><div class="group-participant-copy"><strong>${escapeHtml(p.fullName)} ${Number(p.id)===Number(state.user.id)?"(You)":""}</strong><span>${p.role}</span></div>${p.memberRole==="admin"?`<span class="admin-chip">Group admin</span>`:""}${isAdmin&&Number(p.id)!==Number(state.user.id)?`<button class="mini-btn" data-group-promote="${p.id}" data-role="${p.memberRole==="admin"?"member":"admin"}" title="${p.memberRole==="admin"?"Remove admin":"Make admin"}">${icons.shield}</button><button class="mini-btn" data-group-remove="${p.id}" title="Remove">${icons.x}</button>`:""}</div>`).join("")}
      ${isGroup?`<div class="form-actions"><button class="button danger" data-group-leave>Leave group</button></div>`:""}
    </div></div></div>`);
  document.querySelector("[data-close]").onclick=closeModal;
  document.querySelector("[data-group-edit]")?.addEventListener("click",editGroup);
  document.querySelector("[data-group-add]")?.addEventListener("click",addGroupMember);
  if(isGroup)document.querySelector("[data-group-leave]").onclick=()=>removeGroupMember(state.user.id,true);
  document.querySelectorAll("[data-group-promote]").forEach(el=>el.onclick=()=>changeGroupRole(el.dataset.groupPromote,el.dataset.role));
  document.querySelectorAll("[data-group-remove]").forEach(el=>el.onclick=()=>removeGroupMember(el.dataset.groupRemove,false));
  document.querySelectorAll("[data-chat-preference]").forEach(el=>el.onclick=()=>updateChatPreference(el.dataset.chatPreference));
}
async function editGroup() {
  const group=state.messenger.active,title=await promptDialog("Group name:",group.title);if(!title)return;
  const description=await promptDialog("Group description:",group.description||"");
  const onlyAdminsCanPost=await confirmDialog("Restrict sending messages to group administrators?\n\nOK: admins only - Cancel: everyone can post");
  try {await api(`/api/messages/groups/${group.conversationId}`,{method:"PATCH",body:JSON.stringify({title,description,onlyAdminsCanPost})});closeModal();await loadMessenger(group.conversationId);render();toast("Group information updated.");}catch(error){toast(error.message);}
}
async function addGroupMember() {
  const group=state.messenger.active,existing=new Set(group.participants.map(p=>String(p.id)));
  try {
    const {contacts}=await api("/api/messages/contacts"),available=contacts.filter(c=>!existing.has(String(c.id)));
    if(!available.length)return toast("Every active user is already in this group.");
    const selection=await promptDialog(`Enter the number of the person to add:\n${available.map((c,i)=>`${i+1}. ${c.fullName} (${c.role})`).join("\n")}`,"1");
    const contact=available[Number(selection)-1];if(!contact)return;
    await api(`/api/messages/groups/${group.conversationId}/members`,{method:"POST",body:JSON.stringify({userId:contact.id})});
    closeModal();await loadMessenger(group.conversationId);render();toast(`${contact.fullName} added to the group.`);
  } catch(error){toast(error.message);}
}
async function changeGroupRole(userId,role) {
  try {await api(`/api/messages/groups/${state.messenger.active.conversationId}/members/${userId}`,{method:"PATCH",body:JSON.stringify({role})});closeModal();await loadMessenger(state.messenger.active.conversationId);render();toast("Group administrator updated.");}catch(error){toast(error.message);}
}
async function removeGroupMember(userId,self) {
  if(!await confirmDialog(self?"Leave this group?":"Remove this person from the group?"))return;
  try {const id=state.messenger.active.conversationId;await api(`/api/messages/groups/${id}/members/${userId}`,{method:"DELETE"});closeModal();if(self){await loadMessenger();}else{await loadMessenger(id);}render();toast(self?"You left the group.":"Member removed.");}catch(error){toast(error.message);}
}
function signalTyping() {
  if(!state.messenger?.active)return;
  api(`/api/messages/conversations/${state.messenger.active.conversationId}/typing`,{method:"POST",body:JSON.stringify({typing:true})}).catch(()=>{});
  clearTimeout(typingTimer);
  typingTimer=setTimeout(()=>api(`/api/messages/conversations/${state.messenger.active.conversationId}/typing`,{method:"POST",body:JSON.stringify({typing:false})}).catch(()=>{}),2200);
}
async function uploadChatFiles(fileList) {
  const files=[...fileList];
  if(!files.length)return;
  if(files.length>5)return toast("You can share up to 5 files at once.");
  if(files.some(file=>file.size>15*1024*1024))return toast("Each file must be 15 MB or smaller.");
  const form=new FormData();files.forEach(file=>form.append("files",file));form.append("caption","");
  toast(`Uploading ${files.length} file${files.length>1?"s":""}...`);
  try {
    const response=await fetch(`/api/messages/conversations/${state.messenger.active.conversationId}/files`,{method:"POST",body:form,credentials:"same-origin"});
    const result=await response.json();
    if(!response.ok)throw new Error(result.error||"Upload failed");
    await loadMessenger(state.messenger.active.conversationId);render();toast("Files shared securely.");
  } catch(error){toast(error.message);}
}
function openNewChannelModal() {
  document.body.insertAdjacentHTML("beforeend",`<div class="modal-backdrop" id="modal-backdrop"><div class="modal"><div class="modal-head"><div><h2>Create announcement channel</h2><p>Broadcast verified updates to a selected organization audience</p></div><button class="modal-close" data-close>${icons.x}</button></div>
    <form class="form" id="channel-form"><div class="form-grid"><div class="field full"><label>Channel name</label><input name="title" maxlength="80" required placeholder="e.g. Official Organization Updates"></div><div class="field full"><label>Description</label><textarea name="description" maxlength="500" placeholder="Purpose of this channel"></textarea></div><div class="field full"><label>Audience</label><select name="audience"><option value="all">Everyone in the system</option><option value="members">Members only</option><option value="staff">Staff and leadership only</option></select><small>Only channel administrators can publish announcements.</small></div></div>${formActions("Create channel")}</form></div></div>`);
  document.querySelector("[data-close]").onclick=closeModal;
  document.getElementById("channel-form").onsubmit=async event=>{
    event.preventDefault();const payload=Object.fromEntries(new FormData(event.currentTarget));
    try {const result=await api("/api/messages/channels",{method:"POST",body:JSON.stringify(payload)});closeModal();await loadMessenger(result.conversationId);render();toast(`${payload.title} channel created.`);}catch(error){toast(error.message);}
  };
}
function openMessageSearch() {
  document.body.insertAdjacentHTML("beforeend",`<div class="modal-backdrop" id="modal-backdrop"><div class="modal"><div class="modal-head"><div><h2>Search messages</h2><p>Find text, shared files, and starred information</p></div><button class="modal-close" data-close>${icons.x}</button></div><div class="form"><div class="form-grid"><div class="field"><label>Search terms</label><input id="message-search-term" placeholder="Type at least 2 characters"></div><div class="field"><label>Filter</label><select id="message-search-filter"><option value="all">All messages</option><option value="files">Messages with files</option><option value="starred">Starred messages</option></select></div></div><div id="message-search-results" class="search-result-list"><div class="message-empty compact">${icons.search}<strong>Search your conversations</strong><span>Only messages you are allowed to access will appear.</span></div></div></div></div></div>`);
  document.querySelector("[data-close]").onclick=closeModal;
  let timer;const input=document.getElementById("message-search-term"),filter=document.getElementById("message-search-filter");
  const run=()=>{clearTimeout(timer);timer=setTimeout(()=>searchMessages(input.value,filter.value),300);};
  input.oninput=run;filter.onchange=run;input.focus();
}
async function searchMessages(term,filter) {
  const root=document.getElementById("message-search-results");if(!root)return;
  if(term.trim().length<2&&filter!=="starred"){root.innerHTML=`<div class="message-empty compact">${icons.search}<strong>Keep typing</strong><span>Enter at least 2 characters, or choose Starred messages.</span></div>`;return;}
  try {
    const {results}=await api(`/api/messages/search?q=${encodeURIComponent(term)}&filter=${encodeURIComponent(filter)}`);
    root.innerHTML=results.length?results.map(result=>`<button class="message-search-result" data-search-conversation="${result.conversationId}"><div class="activity-icon ${result.hasFile?"info":""}">${result.hasFile?icons.file:icons.messages}</div><div><strong>${escapeHtml(result.conversationName)}</strong><p>${escapeHtml(result.body)}</p><span>${escapeHtml(result.senderName)} - ${messageTime(result.createdAt)}</span></div></button>`).join(""):`<div class="message-empty compact">${icons.search}<strong>No results</strong><span>Try a different word or filter.</span></div>`;
    root.querySelectorAll("[data-search-conversation]").forEach(el=>el.onclick=async()=>{const id=el.dataset.searchConversation;closeModal();await openConversation(id);});
  } catch(error){root.innerHTML=`<div class="login-error">${escapeHtml(error.message)}</div>`;}
}
function openConversationInfo() {
  const chat=state.messenger.active;
  document.body.insertAdjacentHTML("beforeend",`<div class="modal-backdrop" id="modal-backdrop"><div class="modal" style="max-width:430px"><div class="modal-head"><div><h2>Conversation details</h2><p>Privacy and notification controls</p></div><button class="modal-close" data-close>${icons.x}</button></div><div class="group-info-header"><div class="chat-avatar">${profileImage(chat.other.id,chat.other.fullName,chat.other.hasProfilePhoto)}</div><h3>${escapeHtml(chat.other.fullName)}</h3><p>${escapeHtml(chat.other.role)} - ${escapeHtml(chat.other.email)}</p></div><div class="form">
    <div class="setting-row"><div class="setting-icon">${icons.bell}</div><div class="setting-copy"><strong>${chat.mutedUntil?"Unmute":"Mute"} notifications</strong><span>${chat.mutedUntil?"Resume notifications":"Silence this conversation until unmuted"}</span></div><button class="button small secondary" data-chat-preference="mute">${chat.mutedUntil?"Unmute":"Mute"}</button></div>
    <div class="setting-row"><div class="setting-icon">${icons.file}</div><div class="setting-copy"><strong>${chat.archived?"Unarchive":"Archive"} conversation</strong><span>${chat.archived?"Return it to your active list":"Hide it from your active conversation list"}</span></div><button class="button small secondary" data-chat-preference="archive">${chat.archived?"Unarchive":"Archive"}</button></div>
    <div class="setting-row"><div class="setting-icon">${icons.shield}</div><div class="setting-copy"><strong>Private conversation</strong><span>Only you and ${escapeHtml(chat.other.fullName)} can access these messages</span></div></div>
  </div></div></div>`);
  document.querySelector("[data-close]").onclick=closeModal;
  document.querySelectorAll("[data-chat-preference]").forEach(el=>el.onclick=()=>updateChatPreference(el.dataset.chatPreference));
}
async function updateChatPreference(type) {
  const chat=state.messenger.active,id=chat.conversationId,payload=type==="mute"?{muted:!chat.mutedUntil}:{archived:!chat.archived};
  try {await api(`/api/messages/conversations/${id}/preferences`,{method:"PATCH",body:JSON.stringify(payload)});closeModal();if(payload.archived)state.messenger.active=null;await loadMessenger(payload.archived?undefined:id);render();toast(type==="mute"?(payload.muted?"Conversation muted.":"Conversation unmuted."):(payload.archived?"Conversation archived.":"Conversation restored."));}catch(error){toast(error.message);}
}
function openForwardMessage(message) {
  const conversations=state.messenger.conversations.filter(c=>String(c.id)!==String(state.messenger.active.conversationId));
  document.body.insertAdjacentHTML("beforeend",`<div class="modal-backdrop" id="modal-backdrop"><div class="modal"><div class="modal-head"><div><h2>Forward message</h2><p>Select a destination conversation</p></div><button class="modal-close" data-close>${icons.x}</button></div><div class="form"><div class="quoted-message">${escapeHtml(message.body)}</div><div class="contact-list">${conversations.map(c=>`<button class="contact-item" data-forward-target="${c.id}"><div class="chat-avatar ${c.type!=="direct"?"group":""}">${c.type!=="direct"?icons.users:initials(c.otherName)}</div><div class="contact-copy"><strong>${escapeHtml(c.otherName)}</strong><span>${escapeHtml(c.otherRole)}</span></div>${icons.arrowUp}</button>`).join("")||`<div class="message-empty compact"><strong>No other conversations</strong><span>Start another conversation first.</span></div>`}</div></div></div></div>`);
  document.querySelector("[data-close]").onclick=closeModal;
  document.querySelectorAll("[data-forward-target]").forEach(el=>el.onclick=async()=>{
    try {await api(`/api/messages/messages/${message.id}/forward`,{method:"POST",body:JSON.stringify({conversationId:el.dataset.forwardTarget})});closeModal();toast("Message forwarded.");}catch(error){toast(error.message);}
  });
}

function ensureSystemAccountStyles(){
  if(document.querySelector('link[href*="legal-biodata-styles.css"]'))return;
  const link=document.createElement("link");link.rel="stylesheet";link.href="/legal-biodata-styles.css?v=36";document.head.appendChild(link);
}
function formatUserLastLogin(value){
  if(!value)return "Never";
  const parsed=new Date(String(value).includes("T")&&!String(value).endsWith("Z")?value:value.endsWith("Z")?value:`${value}Z`);
  return Number.isNaN(parsed.getTime())?"Never":parsed.toLocaleString();
}
function applyUsersApiResult(result){
  state.users=result.users;
  state.roles=result.roles;
  state.departmentRoster=result.departmentRoster;
  state.otherAccounts=result.otherAccounts;
  state.branches=result.branches;
  state.departments=result.departments;
}
function filteredSystemUsers(){
  const users=state.users||[],filter=state.userAccountsFilter||{q:"",department:"all",stat:"all"};
  const q=String(filter.q||"").trim().toLowerCase();
  const dept=filter.department||filter.role||"all";
  return users.filter(u=>{
    if(dept&&dept!=="all"){
      const codes=(u.governanceDepartments||[]).map(d=>d.code);
      if(dept==="other"&&codes.length)return false;
      if(dept!=="other"&&!codes.includes(dept))return false;
    }
    if(filter.stat==="active"&&!u.active)return false;
    if(filter.stat==="inactive"&&u.active)return false;
    if(filter.stat==="staff"&&!(u.governanceDepartments||[]).length)return false;
    if(filter.stat==="recent"&&!u.lastLogin)return false;
    if(!q)return true;
    const haystack=[u.fullName,u.email,u.phone,u.role,u.memberNumber,u.branch,...(u.assignments||[]).flatMap(a=>[a.department,a.code,a.position]),...(u.governanceDepartments||[]).flatMap(a=>[a.name,a.code,a.title])].join(" ").toLowerCase();
    return haystack.includes(q);
  });
}
function userAccountCard(u){
  const assignments=u.assignments||[];
  return `<article class="bio-card ${u.active?"active-user":"inactive"}">
    <header><div class="bio-avatar">${u.hasProfilePhoto?profileImage(u.id,u.fullName,true):initials(u.fullName)}</div><div><small>${escapeHtml(u.memberNumber||u.role)}</small><h3>${escapeHtml(u.fullName)}</h3><span>${escapeHtml(u.email)}</span></div>${status(u.active?"active":"suspended")}</header>
    <div class="bio-dept-tags">${assignments.length?assignments.slice(0,3).map(a=>`<span class="bio-dept-tag" title="${escapeHtml(a.position||"")}">${escapeHtml(a.department)} · L${a.level}</span>`).join(""):`<span class="bio-dept-tag">No department assignment</span>`}${assignments.length>3?`<span class="bio-dept-tag">+${assignments.length-3} more</span>`:""}</div>
    <dl><div><dt>Role</dt><dd>${escapeHtml(u.role)}</dd></div><div><dt>Phone</dt><dd>${escapeHtml(u.phone||"—")}</dd></div><div><dt>Branch</dt><dd>${escapeHtml(u.branch||"—")}</dd></div><div><dt>Last login</dt><dd>${formatUserLastLogin(u.lastLogin)}</dd></div></dl>
    <div class="bio-login-summary ${u.active?"active":"inactive"}"><span>${icons.lock}</span><div><small>Login security</small><strong>${u.mustChangePassword?"Temporary password pending change":"Password is set"}</strong><em>${u.active?"Active and allowed to sign in":"Account deactivated"}</em></div></div>
    <footer><button data-user-view="${u.id}">${icons.eye}View details</button><button data-user-reset="${u.id}">${icons.lock}Reset password</button>${u.id!==state.user.id?`<button class="${u.active?"danger-action":""}" data-user-status="${u.id}" data-active="${u.active?0:1}">${u.active?"Deactivate":"Activate"}</button>`:""}</footer>
  </article>`;
}
function openUserAccountDetail(id){
  const user=(state.users||[]).find(u=>String(u.id)===String(id));if(!user)return;
  const assignments=user.assignments||[];
  document.body.insertAdjacentHTML("beforeend",`<div class="modal-backdrop" id="modal-backdrop"><div class="modal"><div class="modal-head"><div><h2>System account</h2><p>${escapeHtml(user.fullName)} — ${escapeHtml(user.email)}</p></div><button class="modal-close" data-close-modal>${icons.x}</button></div>
    <div class="bio-detail">
      <header><div class="bio-avatar large">${user.hasProfilePhoto?profileImage(user.id,user.fullName,true):initials(user.fullName)}</div><div><small>${escapeHtml(user.memberNumber||"Staff account")} · Created ${formatUserLastLogin(user.createdAt).replace("Never","—")}</small><h2>${escapeHtml(user.fullName)}</h2><p>${escapeHtml(user.role)}${user.branch?` · ${escapeHtml(user.branch)}`:""}</p></div>${status(user.active?"active":"suspended")}</header>
      <section><h3>Login credentials</h3><dl><div><dt>Email</dt><dd>${escapeHtml(user.email)}</dd></div><div><dt>Phone</dt><dd>${escapeHtml(user.phone||"—")}</dd></div><div><dt>Last login</dt><dd>${formatUserLastLogin(user.lastLogin)}</dd></div><div><dt>Password</dt><dd>Protected — cannot be displayed</dd></div><div><dt>Password status</dt><dd>${user.mustChangePassword?"Temporary password must be changed at next sign-in":"Password is set"}</dd></div><div><dt>Account status</dt><dd>${user.active?"Active":"Inactive"}</dd></div></dl></section>
      <section><h3>Department access</h3>${assignments.length?`<dl>${assignments.map(a=>`<div><dt>${escapeHtml(a.department)}</dt><dd>${escapeHtml(a.position||"Assigned")} · Level ${a.level}${a.canApprove?" · Can approve":""}${a.canEdit?" · Can edit":""}${a.canCreate?" · Can create":""}</dd></div>`).join("")}</dl>`:`<p>No active department assignments recorded for this account.</p>`}</section>
      <div class="form-actions"><button type="button" class="button secondary" data-close-modal>Close</button><button type="button" class="button secondary" data-user-reset="${user.id}">${icons.lock}Reset password</button>${user.id!==state.user.id?`<button type="button" class="button ${user.active?"danger":"primary"}" data-user-status="${user.id}" data-active="${user.active?0:1}">${user.active?"Deactivate account":"Activate account"}</button>`:""}</div>
    </div></div></div>`);
  document.querySelectorAll("#modal-backdrop [data-close-modal]").forEach(el=>el.addEventListener("click",closeModal));
  document.querySelector("#modal-backdrop [data-user-reset]")?.addEventListener("click",()=>{closeModal();resetUserPassword(user.id);});
  document.querySelector("#modal-backdrop [data-user-status]")?.addEventListener("click",el=>changeUserStatus(el.currentTarget));
}
function usersView() {
  ensureSystemAccountStyles();
  if(!state.userAccountsFilter)state.userAccountsFilter={q:"",department:"all",stat:"all"};
  const users=state.users||[],filter=state.userAccountsFilter;
  const filtered=filteredSystemUsers();
  const active=users.filter(u=>u.active).length;
  const rosterStaff=users.filter(u=>(u.governanceDepartments||[]).length).length;
  const recent=users.filter(u=>u.lastLogin).length;
  const deptFilter=filter.department||filter.role||"all";
  const roster=state.departmentRoster||[];
  const deptChips=[["all","All accounts",users.length],...roster.map(d=>[d.code,d.name,d.accountCount]),["other","Other accounts",state.otherAccounts||0]];
  const deptLabel=deptFilter==="all"?"":deptFilter==="other"?"Other accounts":(roster.find(d=>d.code===deptFilter)||{}).name||deptFilter;
  const statCards=[["all","User accounts",users.length,"users","dark","All secure login accounts"],["active","Active accounts",active,"check","green",`${users.length-active} inactive`],["staff","Department runners",rosterStaff,"shield","blue","Official committee accounts"],["recent","Recent logins",recent,"clock","orange","Recorded with IP and device"]];
  return `<div class="bio-page system-accounts-page">
    <div class="bio-protection">${icons.shield}<div><strong>Executive System accounts</strong><span>Reset passwords and activate or deactivate login accounts here. Legal registers members and can update login email or status, but password resets stay with Executive.</span></div><b>EXEC ACCESS</b></div>
    <div class="bio-stats">${statCards.map(([key,label,value,icon,color,note])=>`<button type="button" class="bio-stat-btn ${color} ${filter.stat===key?"active":""}" data-user-stat-filter="${key}"><span>${icons[icon]}</span><div><small>${label}</small><strong>${value}</strong><em>${note}</em></div></button>`).join("")}</div>
    <form class="bio-search" data-user-search>
      <div>${icons.search}<input name="q" value="${escapeHtml(filter.q||"")}" placeholder="Search name, email, phone, role, member number or department..."></div>
      <select name="department"><option value="all">All departments</option>${roster.map(d=>`<option value="${escapeHtml(d.code)}" ${deptFilter===d.code?"selected":""}>${escapeHtml(d.name)} (${d.accountCount})</option>`).join("")}<option value="other" ${deptFilter==="other"?"selected":""}>Other accounts (${state.otherAccounts||0})</option></select>
      <button class="button primary">${icons.search}Search accounts</button>
      <button type="button" class="button secondary" data-user-clear>Clear</button>
    </form>
    <div class="bio-dept-chips">${deptChips.map(([code,label,count])=>`<button type="button" class="bio-dept-chip ${deptFilter===code?"active":""}" data-user-dept-filter="${escapeHtml(code)}">${escapeHtml(label)}${code!=="all"?` <b>${count}</b>`:""}</button>`).join("")}</div>
    <div class="bio-result-head"><div><h2>System accounts register</h2><p>${filtered.length} matching account${filtered.length===1?"":"s"}${filter.stat!=="all"?` · ${statCards.find(x=>x[0]===filter.stat)?.[1]||"Filtered"}`:""}${deptFilter!=="all"?` · ${escapeHtml(deptLabel)}`:""}</p></div><span>${icons.lock}Password resets are logged and role controlled</span></div>
    <div class="bio-grid">${filtered.map(userAccountCard).join("")||`<div class="exec-empty">No system accounts matched this search.</div>`}</div>
  </div>`;
}

function settingsView() {
  return `<div class="settings-grid">
    <div class="card setting-card"><div class="card-head" style="padding:0 0 16px"><div><h2 class="card-title">Security & access</h2><p class="card-subtitle">Authentication and approval controls</p></div></div>
      ${settingRow("twoFactor","Two-factor authentication","Require a code for staff logins","lock")}
      ${settingRow("dualApproval","Dual approval for large loans","Two committee decisions above UGX 5M","shield")}
    </div>
    <div class="card setting-card"><div class="card-head" style="padding:0 0 16px"><div><h2 class="card-title">Member communication</h2><p class="card-subtitle">Automated confirmations and reminders</p></div></div>
      ${settingRow("sms","SMS notifications","Deposits, approvals and repayment reminders","phone")}
      ${settingRow("email","Email statements","Monthly member account statements","file")}
    </div>
    <div class="card setting-card"><div class="card-head" style="padding:0 0 16px"><div><h2 class="card-title">Organization configuration</h2><p class="card-subtitle">Core operating rules</p></div></div>
      <div class="setting-row"><div class="setting-icon">${icons.building}</div><div class="setting-copy"><strong>Share value</strong><span>UGX 50,000 per share - controlled by approved policy</span></div></div>
      <div class="setting-row"><div class="setting-icon">${icons.wallet}</div><div class="setting-copy"><strong>Minimum savings balance</strong><span>UGX 100,000 - controlled by approved policy</span></div></div>
    </div>
    <div class="card setting-card"><div class="card-head" style="padding:0 0 16px"><div><h2 class="card-title">Database protection</h2><p class="card-subtitle">Operational safeguards</p></div></div>
      <div class="setting-row"><div class="setting-icon">${icons.refresh}</div><div class="setting-copy"><strong>Production database backup</strong><span>Not configured yet - encrypted off-device backups and restore testing are required before deployment</span></div>${status("pending")}</div>
    </div>
  </div>`;
}
function settingRow(key,title,description,icon) { return `<div class="setting-row"><div class="setting-icon">${icons[icon]}</div><div class="setting-copy"><strong>${title}</strong><span>${description}</span></div><button class="toggle ${state.settings[key]?"on":""}" data-toggle="${key}" aria-label="${title}"></button></div>`; }

function bind() {
  document.querySelectorAll('a[href^="/api/documents/"][href$="/view"]').forEach(link=>link.addEventListener("click",event=>{
    event.preventDefault();openDocumentViewer(link);
  }));
  document.querySelectorAll("[data-page]").forEach(el => el.addEventListener("click", async () => {
    state.page=el.dataset.page;
    if(state.page==="departments") state.departmentData=null;
    if(state.page!=="messages"&&messagePoll){clearInterval(messagePoll);messagePoll=null;}
    if(state.page==="messages") {
      state.messenger=null; render();
      try { await loadMessenger(); } catch(error) { toast(error.message); }
    }
    if(state.page==="users"&&!state.users) {
      try { const result=await api("/api/users"); applyUsersApiResult(result); } catch(error) { toast(error.message); }
    }
    render(); window.scrollTo(0,0);
  }));
  document.querySelectorAll("[data-department]").forEach(el=>el.addEventListener("click",async()=>{
    try {
      el.disabled=true;
      state.departmentData=await api(`/api/organization/departments/${el.dataset.department}`);
      render();window.scrollTo(0,0);
    } catch(error){el.disabled=false;toast(error.message);}
  }));
  document.querySelectorAll("[data-executive-page]").forEach(el=>el.addEventListener("click",event=>{
    event.preventDefault();const target=el.dataset.executivePage;
    if(!rolePages["Executive Officer"].includes(target)&&target!=="executive-search")return toast("This Executive page is not available.");
    state.executiveWorkspace=null;state.page=target;state.execQuickOpen=false;render();window.scrollTo(0,0);
  }));
  document.querySelectorAll("[data-executive-workspace]").forEach(el=>el.addEventListener("click",()=>openExecutiveWorkspace(el.dataset.executiveWorkspace)));
  document.querySelectorAll("[data-executive-workspace-exit]").forEach(el=>el.addEventListener("click",exitExecutiveWorkspace));
  document.querySelectorAll("[data-open-member-dashboard]").forEach(el=>el.addEventListener("click",()=>openMemberDashboard(el.dataset.openMemberDashboard)));
  document.querySelector("[data-executive-fy]")?.addEventListener("change",async event=>{try{event.target.disabled=true;state.executive=await api(`/api/executive/command-center?fy=${event.target.value}`);render();}catch(error){toast(error.message);}});
  document.querySelectorAll("[data-executive-project]").forEach(el=>el.addEventListener("click",()=>openExecutiveProject(el.dataset.executiveProject)));
  document.querySelectorAll("[data-finance-page]").forEach(el=>el.addEventListener("click",()=>{
    state.page=el.dataset.financePage;state.financeQuickOpen=false;render();window.scrollTo(0,0);
  }));
  document.querySelector("[data-finance-fy]")?.addEventListener("change",async event=>{try{event.target.disabled=true;state.finance=await api(`/api/finance/command-center?fy=${event.target.value}`);render();}catch(error){toast(error.message);}});
  document.querySelectorAll("[data-finance-modal]").forEach(el=>el.addEventListener("click",()=>openFinanceModal(el.dataset.financeModal)));
  document.querySelectorAll("[data-finance-voucher]").forEach(el=>el.addEventListener("click",()=>financeVoucherDecision(el.dataset.financeVoucher,el.dataset.decision)));
  document.querySelectorAll("[data-finance-entry-review]").forEach(el=>el.addEventListener("click",()=>reviewFinanceEntry(el.dataset.financeEntryReview,el.dataset.decision)));
  document.querySelectorAll("[data-finance-investment]").forEach(el=>el.addEventListener("click",()=>financeInvestmentDecision(el.dataset.financeInvestment,el.dataset.decision)));
  document.querySelectorAll("[data-finance-process]").forEach(el=>el.addEventListener("click",()=>processFinanceVoucher(el.dataset.financeProcess)));
  document.querySelectorAll("[data-finance-voucher-detail]").forEach(el=>el.addEventListener("click",()=>financeVoucherDetails(el.dataset.financeVoucherDetail)));
  document.querySelectorAll("[data-finance-receipt]").forEach(el=>el.addEventListener("click",()=>downloadFinanceReceipt(el.dataset.financeReceipt)));
  document.querySelectorAll("[data-finance-reconcile]").forEach(el=>el.addEventListener("click",()=>reconcileFinanceAccount(el.dataset.financeReconcile)));
  document.querySelectorAll("[data-finance-account-edit]").forEach(el=>el.addEventListener("click",()=>editFinanceAccount(el.dataset.financeAccountEdit)));
  document.querySelectorAll("[data-finance-account-delete]").forEach(el=>el.addEventListener("click",()=>deactivateFinanceAccount(el.dataset.financeAccountDelete)));
  document.querySelectorAll("[data-procurement-advance]").forEach(el=>el.addEventListener("click",()=>advanceProcurement(el.dataset.procurementAdvance)));
  document.querySelectorAll("[data-finance-report]").forEach(el=>el.addEventListener("click",()=>downloadFinanceReport(el.dataset.financeReport,el.dataset.format||"excel")));
  document.querySelectorAll("[data-finance-report-preview]").forEach(el=>el.addEventListener("click",()=>openOperationalReportPreview("finance",el.dataset.financeReportPreview)));
  document.querySelectorAll("[data-credits-page]").forEach(el=>el.addEventListener("click",()=>{
    state.page=el.dataset.creditsPage;state.creditsQuickOpen=false;render();window.scrollTo(0,0);
  }));
  document.querySelectorAll("[data-credits-modal]").forEach(el=>el.addEventListener("click",()=>openCreditsModal(el.dataset.creditsModal)));
  document.querySelectorAll("[data-credit-decision]").forEach(el=>el.addEventListener("click",()=>creditsLoanDecision(el.dataset.creditsLoan,el.dataset.creditDecision)));
  document.querySelectorAll("[data-credits-disburse]").forEach(el=>el.addEventListener("click",()=>creditsDisburse(el.dataset.creditsDisburse)));
  document.querySelectorAll("[data-credits-recover]").forEach(el=>el.addEventListener("click",()=>openCreditsModal("recovery",el.dataset.creditsRecover)));
  document.querySelectorAll("[data-credits-waive]").forEach(el=>el.addEventListener("click",()=>waiveCreditCharge(el.dataset.creditsWaive)));
  document.querySelectorAll("[data-credits-member]").forEach(el=>el.addEventListener("click",()=>creditsMemberDetails(el.dataset.creditsMember)));
  document.querySelectorAll("[data-credits-transaction]").forEach(el=>el.addEventListener("click",()=>creditsTransactionDetails(el.dataset.creditsTransaction)));
  document.querySelectorAll(".finance-notification-item[data-credits-transaction]").forEach(el=>el.addEventListener("click",()=>creditsTransactionDetails(el.dataset.creditsTransaction)));
  document.querySelectorAll(".finance-notification-item[data-credits-page]").forEach(el=>el.addEventListener("click",()=>{if(!el.dataset.creditsTransaction){state.page=el.dataset.creditsPage;render();window.scrollTo(0,0);}}));
  document.querySelectorAll("[data-credits-statement]").forEach(el=>el.addEventListener("click",()=>downloadCreditsStatement(el.dataset.creditsStatement)));
  document.querySelectorAll("[data-credits-report]").forEach(el=>el.addEventListener("click",()=>downloadCreditsReport(el.dataset.creditsReport,el.dataset.format||"excel")));
  document.querySelectorAll("[data-credits-report-preview]").forEach(el=>el.addEventListener("click",()=>openOperationalReportPreview("credits",el.dataset.creditsReportPreview)));
  document.querySelectorAll("[data-credits-loan-detail]").forEach(el=>el.addEventListener("click",()=>openLoanDetails(el.dataset.creditsLoanDetail)));
  document.querySelectorAll("[data-loan-detail-id]").forEach(el=>el.addEventListener("click",()=>openLoanDetails(el.dataset.loanDetailId)));
  document.querySelectorAll("[data-investment-page]").forEach(el=>el.addEventListener("click",()=>{
    state.page=el.dataset.investmentPage;state.investmentQuickOpen=false;render();window.scrollTo(0,0);
  }));
  document.querySelectorAll("[data-investment-modal]").forEach(el=>el.addEventListener("click",()=>openInvestmentModal(el.dataset.investmentModal)));
  document.querySelectorAll("[data-investment-edit]").forEach(el=>el.addEventListener("click",()=>{const type=el.dataset.investmentEdit,id=el.dataset.recordId,collection={project:"projects",asset:"assets",proposal:"proposals",investor:"investors",contract:"contracts"}[type];const record=state.investment?.[collection]?.find(item=>String(item.id)===String(id));if(record)openInvestmentModal(type,record);}));
  document.querySelectorAll("[data-investment-delete]").forEach(el=>el.addEventListener("click",()=>deleteInvestmentRecord(el.dataset.investmentDelete,el.dataset.recordId)));
  document.querySelectorAll("[data-investment-asset]").forEach(el=>el.addEventListener("click",()=>investmentAssetDetails(el.dataset.investmentAsset)));
  document.querySelectorAll("[data-investment-transaction]").forEach(el=>el.addEventListener("click",()=>investmentTransactionDetails(el.dataset.investmentTransaction)));
  document.querySelectorAll("[data-investment-proposal]").forEach(el=>el.addEventListener("click",()=>advanceInvestmentProposal(el.dataset.investmentProposal)));
  document.querySelectorAll("[data-member-investment-decision]").forEach(el=>el.addEventListener("click",()=>decideMemberInvestment(el.dataset.applicationId,el.dataset.memberInvestmentDecision)));
  document.querySelectorAll("[data-investment-project]").forEach(el=>el.addEventListener("click",()=>investmentProjectDetails(el.dataset.investmentProject)));
  document.querySelectorAll("[data-investment-proposal-detail]").forEach(el=>el.addEventListener("click",()=>investmentProposalDetails(el.dataset.investmentProposalDetail)));
  document.querySelectorAll("[data-investment-report]").forEach(el=>el.addEventListener("click",()=>downloadInvestmentReport(el.dataset.investmentReport,el.dataset.format||"excel")));
  document.querySelectorAll("[data-investment-report-preview]").forEach(el=>el.addEventListener("click",()=>openOperationalReportPreview("investment",el.dataset.investmentReportPreview)));
  document.querySelectorAll("[data-exec-decision]").forEach(el=>el.addEventListener("click",()=>executiveDecision(el.dataset.execDecision,el.dataset.decision)));
  document.querySelectorAll('[data-exec-loan-decision]').forEach(el=>el.addEventListener('click',()=>executiveLoanDecision(el.dataset.execLoanDecision,el.dataset.decision)));
  document.querySelectorAll("[data-exec-reviewer]").forEach(el=>el.addEventListener("click",()=>executiveAssignReviewer(el.dataset.execReviewer)));
  document.querySelectorAll("[data-exec-details]").forEach(el=>el.addEventListener("click",()=>executiveApprovalDetails(el.dataset.execDetails)));
  document.querySelectorAll("[data-executive-report]").forEach(el=>el.addEventListener("click",()=>downloadExecutiveReport(el.dataset.executiveReport)));
  document.querySelectorAll("[data-executive-report-preview]").forEach(el=>el.addEventListener("click",()=>openExecutiveReportPreview(el.dataset.executiveReportPreview)));
  document.querySelectorAll("[data-delete-document]").forEach(el=>el.addEventListener("click",()=>deleteOrganizationDocument(el.dataset.deleteDocument,el.dataset.documentTitle)));
  document.querySelectorAll("[data-document-publication]").forEach(el=>el.addEventListener("click",()=>decideDocumentPublication(el.dataset.documentPublication,el.dataset.decision)));
  document.querySelectorAll("[data-department-decision]").forEach(el=>el.addEventListener("click",async()=>{
    try {
      await api(`/api/organization/departments/${state.departmentData.department.code}/activities/${el.dataset.departmentDecision}/decision`,
        {method:"POST",body:JSON.stringify({decision:el.dataset.decision})});
      state.departmentData=await api(`/api/organization/departments/${state.departmentData.department.code}`);
      render();toast(`Department activity ${el.dataset.decision}.`);
    } catch(error){toast(error.message);}
  }));
  document.querySelectorAll("[data-modal]").forEach(el => el.addEventListener("click", async () => {
    if(el.dataset.modal==="loan") {
      try { state.guarantorCandidates=(await api(`/api/loans/guarantor-candidates${state.role==="Member"?"":""}`)).candidates; }
      catch(error) { return toast(error.message); }
    }
    openModal(el.dataset.modal);
  }));
  document.querySelectorAll("[data-action]").forEach(el => el.addEventListener("click", () => handleAction(el.dataset.action, el)));
  document.querySelectorAll("[data-decision][data-kind]").forEach(el => el.addEventListener("click", () => decide(el.dataset.kind, el.dataset.id, el.dataset.decision)));
  document.querySelectorAll("[data-verify]").forEach(el=>el.addEventListener("click",()=>verifyTransaction(el.dataset.verify)));
  document.querySelectorAll("[data-loan-action]").forEach(el=>el.addEventListener("click",()=>handleLoanAction(el.dataset.loanAction,el.dataset.id)));
  document.querySelectorAll("[data-guarantee]").forEach(el=>el.addEventListener("click",()=>respondToGuarantee(el.dataset.id,el.dataset.guarantee)));
  document.querySelectorAll("[data-toggle]").forEach(el => el.addEventListener("click", async () => {
    const key=el.dataset.toggle, value=!state.settings[key];
    try { await api(`/api/settings/${key}`,{method:"PATCH",body:JSON.stringify({value})}); state.settings[key]=value; render(); toast("Setting updated successfully."); } catch(error){toast(error.message);}
  }));
  document.querySelectorAll("[data-user-status]").forEach(el=>el.addEventListener("click",()=>changeUserStatus(el)));
  document.querySelectorAll("[data-user-reset]").forEach(el=>el.addEventListener("click",()=>resetUserPassword(el.dataset.userReset)));
  document.querySelectorAll("[data-user-view]").forEach(el=>el.addEventListener("click",()=>openUserAccountDetail(el.dataset.userView)));
  document.querySelector("[data-user-search]")?.addEventListener("submit",event=>{
    event.preventDefault();
    const data=Object.fromEntries(new FormData(event.currentTarget));
    state.userAccountsFilter={...(state.userAccountsFilter||{}),q:data.q||"",department:data.department||"all"};
    render();
  });
  document.querySelector("[data-user-clear]")?.addEventListener("click",()=>{state.userAccountsFilter={q:"",department:"all",stat:"all"};render();});
  document.querySelectorAll("[data-user-stat-filter]").forEach(el=>el.addEventListener("click",()=>{
    state.userAccountsFilter={...(state.userAccountsFilter||{}),stat:el.dataset.userStatFilter};
    render();window.scrollTo(0,0);
  }));
  document.querySelectorAll("[data-user-dept-filter]").forEach(el=>el.addEventListener("click",()=>{
    const department=el.dataset.userDeptFilter;
    state.userAccountsFilter={...(state.userAccountsFilter||{}),department:state.userAccountsFilter?.department===department?"all":department};
    render();
  }));
  document.querySelectorAll("[data-conversation]").forEach(el=>el.addEventListener("click",()=>openConversation(el.dataset.conversation)));
  document.querySelectorAll("[data-reply-message]").forEach(el=>el.addEventListener("dblclick",()=>setMessageReply(el.dataset.replyMessage)));
  document.querySelectorAll("[data-message-reply]").forEach(el=>el.addEventListener("click",()=>setMessageReply(el.dataset.messageReply)));
  document.querySelectorAll("[data-reaction]").forEach(el=>el.addEventListener("click",event=>{event.stopPropagation();reactToMessage(el.dataset.reaction,el.dataset.emoji);}));
  document.querySelectorAll("[data-message-menu]").forEach(el=>el.addEventListener("click",event=>{event.stopPropagation();openMessageMenu(el.dataset.messageMenu);}));
  document.querySelectorAll("[data-chat-filter]").forEach(el=>el.addEventListener("click",()=>filterChatType(el)));
  const messageForm=document.getElementById("message-form");
  if(messageForm) {
    messageForm.addEventListener("submit",sendMessage);
    const area=messageForm.querySelector("textarea");
    area.addEventListener("input",()=>{document.getElementById("composer-count").textContent=`${area.value.length}/2000`;area.style.height="auto";area.style.height=`${Math.min(area.scrollHeight,120)}px`;signalTyping();});
    area.addEventListener("keydown",event=>{if(event.key==="Enter"&&!event.shiftKey){event.preventDefault();messageForm.requestSubmit();}});
    requestAnimationFrame(()=>{const box=document.getElementById("chat-messages");if(box)box.scrollTop=box.scrollHeight;});
  }
  const conversationSearch=document.getElementById("conversation-search");
  if(conversationSearch) conversationSearch.addEventListener("input",()=>filterConversations(conversationSearch.value));
  const messageFiles=document.getElementById("message-files");
  if(messageFiles) messageFiles.addEventListener("change",()=>uploadChatFiles(messageFiles.files));
  document.getElementById("global-search").addEventListener("input", e => {
    searchTerm=e.target.value;
    if(state.role==="Executive Officer") {
      state.executiveSearchTerm=searchTerm;
      clearTimeout(executiveSearchTimer);
      if(searchTerm.length<2){state.executiveSearchResults=[];if(state.page==="executive-search")render();return;}
      executiveSearchTimer=setTimeout(async()=>{
        try {
          state.executiveSearchResults=(await api(`/api/executive/search?q=${encodeURIComponent(searchTerm)}`)).results;
          state.page="executive-search";render();
          const input=document.getElementById("global-search");input.focus();input.setSelectionRange(searchTerm.length,searchTerm.length);
        } catch(error){toast(error.message);}
      },280);
      return;
    }
    if(state.role==="Finance Officer") {
      state.financeSearchTerm=searchTerm;clearTimeout(financeSearchTimer);
      if(searchTerm.length<2){state.financeSearchResults=[];if(state.page==="finance-search")render();return;}
      financeSearchTimer=setTimeout(async()=>{
        try {
          state.financeSearchResults=(await api(`/api/finance/search?q=${encodeURIComponent(searchTerm)}`)).results;
          state.page="finance-search";render();
          const input=document.getElementById("global-search");input.focus();input.setSelectionRange(searchTerm.length,searchTerm.length);
        } catch(error){toast(error.message);}
      },280);
      return;
    }
    if(state.role==="Credits Officer") {
      state.creditsSearchTerm=searchTerm;clearTimeout(creditsSearchTimer);
      if(searchTerm.length<2){state.creditsSearchResults=[];if(state.page==="credits-search")render();return;}
      creditsSearchTimer=setTimeout(async()=>{
        try {
          state.creditsSearchResults=(await api(`/api/credits/search?q=${encodeURIComponent(searchTerm)}`)).results;
          state.page="credits-search";render();
          const input=document.getElementById("global-search");input.focus();input.setSelectionRange(searchTerm.length,searchTerm.length);
        } catch(error){toast(error.message);}
      },280);
      return;
    }
    if(state.role==="Investment Officer") {
      state.investmentSearchTerm=searchTerm;clearTimeout(investmentSearchTimer);
      if(searchTerm.length<2){state.investmentSearchResults=[];if(state.page==="investment-search")render();return;}
      investmentSearchTimer=setTimeout(async()=>{
        try {
          state.investmentSearchResults=(await api(`/api/investment/search?q=${encodeURIComponent(searchTerm)}`)).results;
          state.page="investment-search";render();
          const input=document.getElementById("global-search");input.focus();input.setSelectionRange(searchTerm.length,searchTerm.length);
        } catch(error){toast(error.message);}
      },280);
      return;
    }
    if (searchTerm && !["members","savings","loans"].includes(state.page)) state.page="members";
    render();
    const input=document.getElementById("global-search"); input.focus(); input.setSelectionRange(searchTerm.length,searchTerm.length);
  });
}

async function handleAction(action, element) {
  if (action==="menu") return document.getElementById("sidebar").classList.toggle("open");
  if (action==="executive-quick") { state.execQuickOpen=!state.execQuickOpen;render();return; }
  if (action==="finance-quick") { state.financeQuickOpen=!state.financeQuickOpen;render();return; }
  if (action==="credits-quick") { state.creditsQuickOpen=!state.creditsQuickOpen;render();return; }
  if (action==="investment-quick") { state.investmentQuickOpen=!state.investmentQuickOpen;render();return; }
  if (action==="executive-refresh") {
    try{state.executive=await api("/api/executive/command-center");render();toast("Executive command center refreshed.");}catch(error){toast(error.message);}return;
  }
  if (action==="schedule-meeting") return openExecutiveMeetingModal();
  if (action==="assign-task") return openExecutiveTaskModal();
  if (action==="back-departments") { state.departmentData=null; render(); return window.scrollTo(0,0); }
  if (action==="new-message") return openNewMessageModal();
  if (action==="new-group") return openNewGroupModal();
  if (action==="new-channel") return openNewChannelModal();
  if (action==="message-search") return openMessageSearch();
  if (action==="attach-file") return document.getElementById("message-files")?.click();
  if (action==="chat-back") { state.messenger.active=null; return render(); }
  if (action==="cancel-reply") { state.messageReply=null; return render(); }
  if (action==="emoji") {
    const area=document.querySelector(".message-composer textarea");
    if(area){area.value+=" ??";area.focus();area.dispatchEvent(new Event("input"));}
    return;
  }
  if (action==="chat-info") return state.messenger.active.type!=="direct"?openGroupInfo():openConversationInfo();
  if (action==="help") return toast("Your navigation and actions are limited automatically by your assigned role.");
  if (action==="notifications") {
    if("Notification" in window&&Notification.permission==="default") {
      const result=await Notification.requestPermission();
      toast(result==="granted"?"Desktop message notifications enabled.":"You can still view notifications inside the system.");
    } else toast(`You have ${state.notifications.length} system notifications and ${state.unreadMessages||0} unread messages.`);
    return;
  }
  if (action==="logout") { try{await api("/api/auth/logout",{method:"POST"});}catch{} state.user=null; return loginView(); }
  if (["export","statement","download-report"].includes(action)) return downloadReport(state.page==="loans"?"loans":state.page==="members"?"members":"transactions");
  if (action==="close-session") return toast("Cash session submitted for accountant reconciliation.");
  if (action==="view-member") {
    const m=state.members.find(x=>x.id===element.dataset.id);
    if(!m)return;
    if(m.databaseId||m.memberId) return openMemberDashboard(m.databaseId||m.memberId);
    return detailModal("Member profile", `${m.name} - ${m.id}`, [["Phone",m.phone||"Not recorded"],["Savings",money(m.savings)],["Share capital",money(m.shares)],["Status",m.status]]);
  }
  if (action==="view-loan") return openLoanDetails(element.dataset.id);
  if (action==="view-withdrawal") { const w=state.withdrawals.find(x=>x.id===element.dataset.id); return detailModal("Withdrawal request", w.id, [["Member",w.member],["Amount",money(w.amount)],["Payment method",w.method],["Status",w.status]]); }
  console.warn("Unhandled interface action",action);
}

async function deleteOrganizationDocument(id,title="this document") {
  const confirmed=await confirmDialog(`Delete "${title}" from active documents? The record and audit history will be retained securely for recovery.`);
  if(!confirmed)return;
  try {
    await api(`/api/documents/${id}`,{method:"DELETE"});
    if(state.role==="Executive Officer")state.executive=await api("/api/executive/command-center");
    else if(state.role==="Legal Officer")state.legal=await api("/api/legal/command-center");
    else await refreshData();
    render();toast("Document deleted from active records.");
  } catch(error) { toast(error.message); }
}

async function decideDocumentPublication(id,decision) {
  const comment=await promptDialog(decision==="approve"?"Optional publication note:":"Explain what Legal should correct before publication:","");
  if(comment===null)return;
  try {
    await api(`/api/documents/${id}/publication-decision`,{method:"POST",body:JSON.stringify({decision,comment})});
    state.executive=await api("/api/executive/command-center");render();
    toast(decision==="approve"?"Document published to its approved audience.":"Document returned to Legal as a draft.");
  } catch(error) { toast(error.message); }
}

function promptDialog(message,defaultValue="") {
  return new Promise(resolve=>{
    const id=`prompt-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    document.body.insertAdjacentHTML("beforeend",`<div class="modal-backdrop" id="${id}"><div class="modal compact-dialog" role="dialog" aria-modal="true" aria-labelledby="${id}-title"><div class="modal-head"><div><h2 id="${id}-title">Information required</h2><p>${escapeHtml(message).replaceAll("\n","<br>")}</p></div><button class="modal-close" data-dialog-cancel aria-label="Cancel">${icons.x}</button></div><form class="form"><div class="field"><label for="${id}-value">Response</label><input id="${id}-value" name="value" value="${escapeHtml(defaultValue??"")}" autocomplete="off"></div><div class="form-actions"><button type="button" class="button secondary" data-dialog-cancel>Cancel</button><button type="submit" class="button primary">Continue</button></div></form></div></div>`);
    const root=document.getElementById(id),input=root.querySelector("input");
    const finish=value=>{root.remove();resolve(value);};
    root.querySelectorAll("[data-dialog-cancel]").forEach(button=>button.onclick=()=>finish(null));
    root.querySelector("form").onsubmit=event=>{event.preventDefault();finish(input.value);};
    root.onkeydown=event=>{if(event.key==="Escape")finish(null);};input.focus();input.select();
  });
}
function confirmDialog(message) {
  return new Promise(resolve=>{
    const id=`confirm-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    document.body.insertAdjacentHTML("beforeend",`<div class="modal-backdrop" id="${id}"><div class="modal compact-dialog" role="alertdialog" aria-modal="true" aria-labelledby="${id}-title"><div class="modal-head"><div><h2 id="${id}-title">Confirm action</h2><p>${escapeHtml(message).replaceAll("\n","<br>")}</p></div></div><div class="form-actions"><button type="button" class="button secondary" data-no>Cancel</button><button type="button" class="button primary" data-yes>Confirm</button></div></div></div>`);
    const root=document.getElementById(id),finish=value=>{root.remove();resolve(value);};
    root.querySelector("[data-no]").onclick=()=>finish(false);root.querySelector("[data-yes]").onclick=()=>finish(true);
    root.onkeydown=event=>{if(event.key==="Escape")finish(false);};root.querySelector("[data-yes]").focus();
  });
}
function openModal(type) {
  const map = {
    user: ["Create user account","Assign a secure role and temporary password", userForm()],
    member: ["Register new member","Create a verified organization membership record", memberForm()],
    deposit: ["Record savings deposit","The transaction will be recorded in the audit log", depositForm("Savings deposit")],
    repayment: ["Record loan repayment","Post a payment against a member loan", depositForm("Loan repayment")],
    loan: ["New loan application","Savings and existing obligations will be checked", loanForm()],
    withdrawal: ["Request withdrawal","A separate authorised person must approve this request", withdrawalForm()],
    "department-activity": ["Create department activity",`Record work in ${state.departmentData?.department?.name||"this department"}`, departmentActivityForm()]
  };
  const [title, sub, form] = map[type] || map.deposit;
  document.body.insertAdjacentHTML("beforeend", `<div class="modal-backdrop" id="modal-backdrop"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1"><div class="modal-head"><div><h2 id="modal-title">${title}</h2><p>${sub}</p></div><button class="modal-close" data-close aria-label="Close dialog">${icons.x}</button></div>${form}</div></div>`);
  document.querySelector("[data-close]").onclick=closeModal;
  document.getElementById("modal-backdrop").addEventListener("click", e=>{ if(e.target.id==="modal-backdrop") closeModal(); });
  document.querySelector(".modal form")?.addEventListener("submit", submitForm);
  const dialog=document.querySelector(".modal"); dialog?.addEventListener("keydown",event=>{if(event.key==="Escape")closeModal();});
  dialog?.querySelector("input,select,textarea,button")?.focus();
}
function closeModal() { document.getElementById("modal-backdrop")?.remove(); }
function openDocumentViewer(link) {
  const href=link.getAttribute("href")||"";
  if(!/^\/api\/documents\/\d+\/view$/.test(href))return;
  const row=link.closest("tr"),card=link.closest("article,.exec-document-row");
  const title=(row?.querySelector("td:nth-child(2)")?.childNodes?.[0]?.textContent||card?.querySelector("h3,strong")?.textContent||"Organization document").trim();
  const downloadHref=href.replace(/\/view$/,"/download");
  closeModal();
  document.body.insertAdjacentHTML("beforeend",`<div class="modal-backdrop document-viewer-backdrop" id="modal-backdrop"><div class="modal document-viewer-modal" role="dialog" aria-modal="true" aria-labelledby="document-viewer-title"><div class="modal-head"><div><h2 id="document-viewer-title">${escapeHtml(title)}</h2><p>Secure in-system document preview</p></div><button class="modal-close" data-document-viewer-close aria-label="Close preview">${icons.x}</button></div><div class="document-viewer-frame" aria-live="polite"><div class="document-viewer-loading"><span></span><strong>Loading document?</strong></div></div><div class="document-viewer-actions"><span>${icons.shield} Viewing is recorded in the audit log</span><a class="button secondary" href="${downloadHref}">${icons.download}Download</a><button class="button primary" data-document-viewer-close>Close</button></div></div></div>`);
  document.querySelectorAll("[data-document-viewer-close]").forEach(button=>button.addEventListener("click",closeModal));
  document.getElementById("modal-backdrop")?.addEventListener("click",event=>{if(event.target.id==="modal-backdrop")closeModal();});
  renderDocumentPreview(href,title);
}
function renderDocumentPreview(href,title) { return renderSecurePreview(href.replace(/\/view$/,"/content"),title); }
async function renderSecurePreview(contentHref,title) {
  const host=document.querySelector(".document-viewer-frame");if(!host)return;
  try {
    const response=await fetch(contentHref,{credentials:"same-origin"});if(!response.ok)throw new Error(`Preview failed (${response.status})`);
    const type=String(response.headers.get("x-document-mime-type")||response.headers.get("content-type")||"").split(";")[0].toLowerCase();
    if(type==="application/pdf") {
      const pdfjs=await import("/vendor/pdfjs/pdf.min.mjs?v=28");
      pdfjs.GlobalWorkerOptions.workerSrc="/vendor/pdfjs/pdf.worker.min.mjs?v=28";
      const pdf=await pdfjs.getDocument({data:new Uint8Array(await response.arrayBuffer()),isEvalSupported:false}).promise;
      if(!host.isConnected)return;host.innerHTML=`<div class="pdf-preview-toolbar"><strong>${escapeHtml(title)}</strong><span>${pdf.numPages} page${pdf.numPages===1?"":"s"}</span></div><div class="pdf-preview-pages"></div>`;
      const pages=host.querySelector(".pdf-preview-pages"),pixelRatio=Math.min(window.devicePixelRatio||1,2);
      for(let number=1;number<=pdf.numPages;number++) {
        if(!host.isConnected)return;const page=await pdf.getPage(number),base=page.getViewport({scale:1}),available=Math.max(280,Math.min(980,host.clientWidth-42)),scale=Math.min(1.7,available/base.width),viewport=page.getViewport({scale});
        const sheet=document.createElement("article"),label=document.createElement("span"),canvas=document.createElement("canvas"),context=canvas.getContext("2d",{alpha:false});label.textContent=`Page ${number} of ${pdf.numPages}`;sheet.className="pdf-preview-page";canvas.width=Math.floor(viewport.width*pixelRatio);canvas.height=Math.floor(viewport.height*pixelRatio);canvas.style.width=`${Math.floor(viewport.width)}px`;canvas.style.height=`${Math.floor(viewport.height)}px`;sheet.append(label,canvas);pages.appendChild(sheet);
        await page.render({canvasContext:context,viewport,transform:pixelRatio===1?null:[pixelRatio,0,0,pixelRatio,0,0]}).promise;
      }
      return;
    }
    if(type.startsWith("image/")){const url=URL.createObjectURL(await response.blob());host.innerHTML=`<div class="image-document-preview"><img src="${url}" alt="${escapeHtml(title)}"></div>`;return;}
    if(type.startsWith("text/")||type.includes("csv")){const pre=document.createElement("pre");pre.className="text-document-preview";pre.textContent=await response.text();host.replaceChildren(pre);return;}
    host.innerHTML=`<div class="document-preview-unavailable">${icons.file}<h3>Preview is unavailable for this file type</h3><p>Use the Download button below to open it in its supported application.</p></div>`;
  } catch(error) {if(host.isConnected)host.innerHTML=`<div class="document-preview-unavailable danger">${icons.bell}<h3>Document could not be displayed</h3><p>${escapeHtml(error.message)}</p></div>`;}
}
function memberOptions(selected="") { return state.members.map(m=>`<option value="${m.databaseId}" ${String(m.databaseId)===String(selected)?"selected":""}>${m.id} - ${m.name}</option>`).join(""); }
function userForm() { return `<form class="form" data-form="user"><div class="form-grid"><div class="field full"><label>Full name</label><input name="fullName" required></div><div class="field"><label>Email</label><input name="email" type="email" required></div><div class="field"><label>Phone</label><input name="phone" required></div><div class="field"><label>System role</label><select name="role">${roles.map(r=>`<option>${r}</option>`).join("")}</select></div><div class="field"><label>Branch</label><select name="branchId">${(state.branches||[{id:state.user.branch_id,name:state.user.branch_name}]).map(b=>`<option value="${b.id}">${b.name}</option>`).join("")}</select></div><div class="field"><label>Department dashboard</label><select name="departmentId"><option value="">No staff department</option>${(state.departments||[]).map(d=>`<option value="${d.id}">${d.name}</option>`).join("")}</select></div><div class="field"><label>Department position</label><input name="positionTitle" placeholder="e.g. Welfare Officer"></div><div class="field"><label>Authority level</label><select name="authorityLevel"><option value="1">1 - Member information</option><option value="2">2 - Operational</option><option value="3">3 - Officer</option><option value="4">4 - Department leadership</option><option value="5">5 - Executive / Board</option></select></div><div class="field full"><label>Department rights</label><div class="permission-picker"><label><input type="checkbox" name="canCreate"> Create</label><label><input type="checkbox" name="canEdit"> Edit</label><label><input type="checkbox" name="canApprove"> Approve</label><label><input type="checkbox" name="isHead"> Department head</label></div></div><div class="field full"><label>Link member record (for Member login)</label><select name="memberId"><option value="">Not linked</option>${memberOptions()}</select></div><div class="field full"><label>Temporary password</label><input name="password" type="password" autocomplete="new-password" placeholder="Leave blank to generate securely"><small>Enter a strong password or let the system generate a one-time password.</small></div></div>${formActions("Create secure account")}</form>`; }
function memberForm() { return `<form class="form" data-form="member"><div class="form-grid"><div class="field full"><label>Full legal name</label><input name="fullName" required></div><div class="field"><label>Phone</label><input name="phone" required></div><div class="field"><label>Email</label><input name="email" type="email"></div><div class="field"><label>National ID</label><input name="nationalId" required></div><div class="field"><label>Opening savings</label><input name="savings" type="number" min="0" value="0"></div><div class="field"><label>Share capital</label><input name="shares" type="number" min="0" value="50000"></div><div class="field"><label>Occupation</label><input name="occupation"></div><div class="field"><label>Employer / Business</label><input name="employer"></div><div class="field full"><label>Address</label><input name="address"></div><div class="field full"><label>Next of kin</label><input name="nextOfKin" required></div></div>${formActions("Register member")}</form>`; }
function depositForm(type) { return `<form class="form" data-form="deposit"><input type="hidden" name="type" value="${type}"><div class="form-grid"><div class="field full"><label>Member</label><select name="memberId" required><option value="">Select member</option>${memberOptions()}</select></div><div class="field"><label>Amount (UGX)</label><input name="amount" type="number" min="1000" step="1000" required></div><div class="field"><label>Payment method</label><select name="method"><option>Cash</option><option>Mobile Money</option><option>Bank transfer</option><option>Cheque</option></select></div><div class="field full"><label>External reference</label><input name="externalReference"></div></div>${formActions(type==="Loan repayment"?"Record repayment":"Record pending deposit")}</form>`; }
function loanForm() { return `<form class="form" data-form="loan"><div class="form-grid"><div class="field full"><label>Member</label><select name="memberId" required>${state.role==="Member"?memberOptions(state.members[0].databaseId):`<option value="">Select member</option>${memberOptions()}`}</select></div><div class="field"><label>Loan product</label><select name="productId" data-loan-product>${state.products.map(p=>`<option value="${p.id}" data-product-name="${p.name}">${p.name} - ${p.annualRate}% p.a.</option>`).join("")}</select></div><div class="field full" data-other-loan-fields hidden><label>Specify loan product</label><input name="customProductName" maxlength="120" placeholder="Type the loan product name"></div><div class="field"><label>Amount (UGX)</label><input name="amount" type="number" min="100000" step="50000" required></div><div class="field"><label>Repayment term</label><select name="termMonths"><option value="6">6 months</option><option value="12">12 months</option><option value="18">18 months</option><option value="24">24 months</option></select></div><div class="field full"><label>Choose guarantors (1-3)</label><div class="group-member-picker">${(state.guarantorCandidates||[]).map(g=>`<label class="group-member-option"><input type="checkbox" name="guarantorIds" value="${g.id}"><div class="chat-avatar">${initials(g.fullName)}</div><div><strong>${g.fullName}</strong><span>${g.memberNumber} - Savings ${money(g.savings)}</span></div></label>`).join("")||`<div class="empty-state">No eligible guarantors with login accounts.</div>`}</div><small>Guarantors must accept from their own dashboards before officer review begins.</small></div><div class="field full"><label>Loan purpose</label><textarea name="purpose" required placeholder="Explain how this loan will be used"></textarea></div></div>${formActions("Submit for guarantor consent")}</form>`; }
function withdrawalForm() { return `<form class="form" data-form="withdrawal"><div class="form-grid"><div class="field full"><label>Member</label><select name="memberId" required>${state.role==="Member"?memberOptions(state.members[0].databaseId):`<option value="">Select member</option>${memberOptions()}`}</select></div><div class="field"><label>Amount (UGX)</label><input name="amount" type="number" min="10000" step="10000" required></div><div class="field"><label>Payment method</label><select name="method"><option>Mobile Money</option><option>Bank transfer</option><option>Cash</option></select></div><div class="field full"><label>Reason</label><textarea name="reason" required></textarea><small>A minimum balance of UGX 100,000 must remain.</small></div></div>${formActions("Submit request")}</form>`; }
function departmentActivityForm() { return `<form class="form" data-form="department-activity"><div class="form-grid"><div class="field"><label>Activity type</label><select name="activityType"><option>General</option><option>Project</option><option>Request</option><option>Review</option><option>Meeting</option><option>Report</option></select></div><div class="field"><label>Visibility level</label><select name="visibilityLevel">${Array.from({length:state.departmentData.access.authorityLevel},(_,i)=>`<option value="${i+1}">Level ${i+1}</option>`).join("")}</select></div><div class="field full"><label>Title</label><input name="title" maxlength="150" required></div><div class="field full"><label>Description</label><textarea name="description" maxlength="1000"></textarea></div><div class="field full"><label>Amount (UGX, optional)</label><input name="amount" type="number" min="0" step="1000"></div></div>${formActions("Create activity")}</form>`; }
function formActions(label) { return `<div class="form-actions"><button type="button" class="button secondary" data-close-modal>Cancel</button><button type="submit" class="button primary">${label}</button></div>`; }

async function submitForm(event) {
  event.preventDefault();
  const form=event.currentTarget, formData=new FormData(form), data=Object.fromEntries(formData);
  if(form.dataset.form==="loan")data.guarantorIds=formData.getAll("guarantorIds").map(Number);
  const button=form.querySelector("button[type=submit]"); button.disabled=true; button.textContent="Saving?";
  try {
    let result, message, credential;
    if(form.dataset.form==="user") { result=await api("/api/users",{method:"POST",body:JSON.stringify(data)}); credential=result.temporaryPassword; message="Secure user account created."; state.users=null; }
    if(form.dataset.form==="member") { result=await api("/api/members",{method:"POST",body:JSON.stringify(data)}); message=`Member registered as ${result.memberNumber}.`; }
    if(form.dataset.form==="deposit") { result=await api("/api/transactions",{method:"POST",body:JSON.stringify(data)}); message=`Transaction ${result.reference} recorded for verification.`; }
    if(form.dataset.form==="loan") { result=await api("/api/loans",{method:"POST",body:JSON.stringify(data)}); message=`Loan application ${result.reference} submitted.`; }
    if(form.dataset.form==="withdrawal") { result=await api("/api/withdrawals",{method:"POST",body:JSON.stringify(data)}); message=`Withdrawal ${result.reference} submitted for approval.`; }
    if(form.dataset.form==="department-activity") {
      const code=state.departmentData.department.code;
      result=await api(`/api/organization/departments/${code}/activities`,{method:"POST",body:JSON.stringify(data)});
      message=`Department activity ${result.reference} created.`;
      state.departmentData=await api(`/api/organization/departments/${code}`);
    }
    closeModal(); await refreshData();
    if(state.page==="users") applyUsersApiResult(await api("/api/users"));
    render(); toast(message); if(credential) detailModal("Account created","Copy this one-time password now",[["Temporary password",credential],["Next step","The user must change it after signing in."]]);
  } catch(error) { button.disabled=false; button.textContent="Try again"; toast(error.message); }
}

async function decide(kind,id,decision) {
  const item=(kind==="loan"?state.loans:state.withdrawals).find(x=>x.id===id);
  try {
    if(kind==="withdrawal") await api(`/api/withdrawals/${item.databaseId}/decision`,{method:"POST",body:JSON.stringify({decision})});
    else {
      const mapped=state.role==="Executive Officer"?(decision==="approve"?"authorize":decision):state.role==="Credits Officer"?(decision==="approve"?"recommend":decision):decision;
      await api(`/api/loans/${item.databaseId}/decision`,{method:"POST",body:JSON.stringify({decision:mapped,comment:"Reviewed from approval dashboard"})});
    }
    await refreshData(); render(); toast(`${id} decision recorded.`);
  } catch(error) { toast(error.message); }
}
async function respondToGuarantee(loanId,decision) {
  const note=await promptDialog(decision==="accept"?"Optional note for accepting this guarantee:":"Give a reason for rejecting this guarantee:","");
  if(note===null)return;
  try {
    const loan=state.guarantorRequests.find(item=>String(item.databaseId)===String(loanId));
    await api(`/api/loans/${loanId}/guarantor-response`,{method:"POST",body:JSON.stringify({decision,note})});
    await refreshData();render();toast(`Guarantee request ${decision==="accept"?"accepted":"rejected"}.`);
  } catch(error){toast(error.message);}
}
async function handleLoanAction(action,loanReference) {
  const loan=state.loans.find(item=>item.id===loanReference);
  if(!loan)return toast("Loan record not found.");
  try {
    if(action==="verify") {
      const amount=await promptDialog("Enter the verified loan amount:",String(loan.amount));if(!amount)return;
      const comment=await promptDialog("Finance verification comment:","Approved amount and documentation verified.");if(comment===null)return;
      await api(`/api/loans/${loan.databaseId}/finance-verification`,{method:"POST",body:JSON.stringify({amount:Number(amount),comment})});
      toast("Amount verified and sent to the Executive Department for authorization.");
    }
    if(action==="disburse") {
      if(!await confirmDialog(`Confirm that ${money(loan.verifiedAmount||loan.amount)} is being sent to ${loan.member}? This creates the repayment schedule.`))return;
      const result=await api(`/api/loans/${loan.databaseId}/disburse`,{method:"POST",body:"{}"});
      toast(`Loan disbursed successfully. Reference ${result.transactionReference}.`);
    }
    await refreshData();render();
  } catch(error){toast(error.message);}
}
function loanSecurityLabel(type) {
  if(type==="collateral")return "Collateral";
  if(type==="savings_and_shares")return "Savings and shares";
  return type?String(type).replaceAll("_"," "):"Not recorded";
}
function loanApplicationDetailsHtml(loan) {
  const security=String(loan.security_type||"").toLowerCase();
  const isCollateral=security==="collateral";
  const policyAccepted=loan.borrower_declaration_accepted===true||loan.borrower_declaration_accepted==="t";
  const overdueAccepted=loan.overdue_declaration_accepted===true||loan.overdue_declaration_accepted==="t"||policyAccepted;
  const collateralConsent=loan.collateral_owner_consent===true||loan.collateral_owner_consent==="t";
  const hasDocument=!!loan.supporting_document_stored_name;
  const rows=[
    ["Loan product",escapeHtml(loan.product||"—")],
    ["Repayment term",`${loan.term_months||"—"} months`],
    ["Loan purpose",loan.purpose?escapeHtml(loan.purpose):"Not provided"],
    ["Security offered",escapeHtml(loanSecurityLabel(security))],
    ["Loan policy accepted",policyAccepted?`<span class="status active">Accepted</span>`:`<span class="status pending">Not recorded</span>`],
    ["Policy reference",escapeHtml(loan.policy_reference||"—")],
    ["Overdue penalty declaration",overdueAccepted?`<span class="status active">Accepted</span>`:`<span class="status pending">Not recorded</span>`],
    ["Savings at application",money(loan.savings_at_application||0)]
  ];
  const collateral=isCollateral?`
    <h3 class="loan-section-title">Collateral details</h3>
    <div class="loan-application-grid">
      <div><span>Description</span><strong>${escapeHtml(loan.collateral_description||"Not provided")}</strong></div>
      <div><span>Estimated value</span><strong>${money(loan.collateral_value||0)}</strong></div>
      <div><span>Owner</span><strong>${escapeHtml(loan.collateral_owner||"—")}</strong></div>
      <div><span>Owner phone</span><strong>${escapeHtml(loan.collateral_owner_phone||"—")}</strong></div>
      <div><span>Owner consent</span><strong>${collateralConsent?`<span class="status active">Consent given</span>`:`<span class="status pending">Not recorded</span>`}</strong></div>
    </div>`:"";
  const document=hasDocument?`<div class="notice"><div>${icons.file}</div><div><strong>Supporting document</strong><p>${escapeHtml(loan.supporting_document_original_name||"Attached file")}</p><p><a class="button secondary" href="/api/loans/${loan.id}/supporting-document" target="_blank">${icons.eye} View document</a></p></div></div>`:"";
  return `<h3 class="loan-section-title">Member application</h3>
    <div class="loan-application-grid">${rows.map(([label,value])=>`<div><span>${label}</span><strong>${value}</strong></div>`).join("")}</div>
    ${collateral}${document}`;
}
async function openLoanDetails(referenceOrId) {
  const key=String(referenceOrId||"");
  let loanId=null;
  if(/^\d+$/.test(key))loanId=key;
  else {
    const fromBootstrap=(state.loans||[]).find(item=>item.id===key||item.reference===key);
    const fromCredits=(state.credits?.loans||[]).find(item=>item.reference===key||String(item.id)===key);
    const fromExec=[...(state.executive?.approvals||[]),...(state.executive?.approvalHistory||[])]
      .find(item=>item.recordType==="loan"&&(item.reference===key||String(item.loanId)===key||String(item.id)===key));
    loanId=fromBootstrap?.databaseId||fromCredits?.id||fromExec?.loanId||fromExec?.id||null;
  }
  if(!loanId)return toast("Loan details are unavailable.");
  try {
    const details=await api(`/api/loans/${loanId}/details`);
    const loan=details.loan;
    const creditsQueue=details.approvalQueues?.credits;
    const executiveQueue=details.approvalQueues?.executive;
    closeModal();
    document.body.insertAdjacentHTML("beforeend",`<div class="modal-backdrop" id="modal-backdrop"><div class="modal loan-detail-modal"><div class="modal-head"><div><h2>${escapeHtml(loan.reference)} - ${escapeHtml(loan.product)}</h2><p>${escapeHtml(loan.member)} · ${loan.term_months} months · ${status(loan.status)}</p></div><button class="modal-close" data-close>${icons.x}</button></div>
      <div class="form">
      <div class="loan-detail-summary">
        <div><span>Applied amount</span><strong>${money(loan.amount)}</strong></div>
        <div><span>Outstanding</span><strong>${money(loan.balance)}</strong></div>
        <div><span>Processing fee</span><strong>${money(loan.processing_fee||0)}</strong></div>
      </div>
      ${loan.eligibility_result?`<div class="notice">${icons.shield}<div><strong>Eligibility</strong><p>${escapeHtml(loan.eligibility_result)}</p></div></div>`:""}
      ${loanApplicationDetailsHtml(loan)}
      <h3 class="loan-section-title">Guarantors</h3>
      <div class="loan-guarantors">${details.guarantors.length?details.guarantors.map(g=>`<div class="setting-row"><div class="chat-avatar">${initials(g.name)}</div><div class="setting-copy"><strong>${escapeHtml(g.name)}</strong><span>${escapeHtml(g.memberNumber||"")}${g.note?` · ${escapeHtml(g.note)}`:""}</span></div>${status(g.status)}</div>`).join(""):`<p class="page-subtitle">${String(loan.security_type||"").toLowerCase()==="collateral"?"No guarantors — collateral security was offered.":"No guarantors recorded."}</p>`}</div>
      <h3 class="loan-section-title">Full approval process</h3>
      <div class="workflow-timeline">${details.events.length?details.events.map(event=>`<div class="workflow-event"><i></i><div><strong>${workflowLabel(event.stage,event.action)}</strong><span>${escapeHtml(event.actor)} · ${new Date(event.createdAt).toLocaleString()}</span>${event.comment?`<p>${escapeHtml(event.comment)}</p>`:""}</div></div>`).join(""):`<p class="page-subtitle">No workflow events recorded yet.</p>`}</div>
      <h3 class="loan-section-title">Credit Committee</h3>
      ${loanApprovalQueue({approvalProgress:creditsQueue})||`<p class="page-subtitle">Credit Committee queue not started.</p>`}
      <h3 class="loan-section-title">Executive Committee</h3>
      ${loanApprovalQueue({approvalProgress:executiveQueue})||`<p class="page-subtitle">Executive Committee queue not started.</p>`}
      ${details.canCurrentUserDecide?.executive?`<div class="form-actions loan-decision-actions"><button type="button" class="button primary" data-exec-loan-decision="${loan.id}" data-decision="authorize">Approve loan</button><button type="button" class="button secondary" data-exec-loan-decision="${loan.id}" data-decision="return">Request information</button><button type="button" class="button secondary" data-exec-loan-decision="${loan.id}" data-decision="reject">Reject</button></div>`:""}
      ${details.canCurrentUserDecide?.credits&&["officer-review","pending","review","correction","committee-review"].includes(loan.status)?`<div class="form-actions loan-decision-actions"><button type="button" class="button primary" data-credits-loan="${loan.id}" data-credit-decision="approve">Approve (Credits)</button><button type="button" class="button secondary" data-credits-loan="${loan.id}" data-credit-decision="return">Request information</button><button type="button" class="button secondary" data-credits-loan="${loan.id}" data-credit-decision="reject">Reject</button></div>`:""}
      ${details.disbursement?`<h3 class="loan-section-title">Disbursement</h3><div class="notice ${details.disbursement.status==="disbursed"?"":"warning"}">${icons.wallet}<div><strong>${money(details.disbursement.amount)} · ${escapeHtml(details.disbursement.status)}</strong><p>${escapeHtml(details.disbursement.method||"")} to ${escapeHtml(details.disbursement.destination||"")}${details.disbursement.transactionReference?` · ${escapeHtml(details.disbursement.transactionReference)}`:""}</p><p>Processing fee ${money(loan.processing_fee||0)} · Cash given to member ${money(Math.max(0,Number(details.disbursement.amount||loan.amount||0)-Number(loan.processing_fee||0)))}</p></div></div>`:""}
      ${details.schedule.length?`<h3 class="loan-section-title">Repayment schedule</h3><div class="table-scroll repayment-scroll"><table><thead><tr><th>#</th><th>Due date</th><th>Opening balance</th><th>Principal</th><th>Interest</th><th>Total due</th><th>Status</th></tr></thead><tbody>${details.schedule.map(row=>`<tr><td>${row.installment}</td><td>${new Date(row.dueDate).toLocaleDateString()}</td><td>${money(row.openingBalance)}</td><td>${money(row.principal)}</td><td>${money(row.interest)}</td><td class="cell-main">${money(row.totalDue)}</td><td>${status(row.status)}</td></tr>`).join("")}</tbody></table></div>`:""}
      <div class="form-actions"><button class="button primary" data-close-2>Done</button></div></div></div></div>`);
    document.querySelector("[data-close]").onclick=closeModal;document.querySelector("[data-close-2]").onclick=closeModal;
    document.querySelectorAll("#modal-backdrop [data-exec-loan-decision]").forEach(el=>el.addEventListener("click",async()=>{closeModal();await executiveLoanDecision(el.dataset.execLoanDecision,el.dataset.decision);}));
    document.querySelectorAll("#modal-backdrop [data-credits-loan]").forEach(el=>el.addEventListener("click",async()=>{closeModal();await creditsLoanDecision(el.dataset.creditsLoan,el.dataset.creditDecision);}));
  } catch(error){toast(error.message);}
}
function workflowLabel(stage,action) {
  const labels={"application":"Application submitted","guarantor-consent":"Guarantor response","officer-review":"Loans officer review","committee-review":"Credit committee decision","executive-authorization":"Executive authorization","disbursement":"Funds disbursed"};
  const actions={"advisory-reject":"advisory rejection (loan continues)","reject":"rejection","approve":"approval","return":"returned for information","submitted":"submitted","accepted":"accepted","rejected":"rejected"};
  return `${labels[stage]||stage.replaceAll("-"," ")} - ${actions[action]||action}`;
}

function detailModal(title,subtitle,rows) {
  document.body.insertAdjacentHTML("beforeend",`<div class="modal-backdrop" id="modal-backdrop"><div class="modal"><div class="modal-head"><div><h2>${title}</h2><p>${subtitle}</p></div><button class="modal-close" data-close>${icons.x}</button></div><div class="form">${rows.map(([a,b])=>`<div class="setting-row"><div class="setting-copy"><span>${a}</span><strong style="margin-top:3px">${b}</strong></div></div>`).join("")}<div class="form-actions"><button class="button primary" data-close-2>Done</button></div></div></div></div>`);
  document.querySelector("[data-close]").onclick=closeModal; document.querySelector("[data-close-2]").onclick=closeModal;
}
function downloadCsv(name) {
  const csv=["Kasangati G40 Kwagalana Export","Generated,27 July 2026",`Module,${state.page}`,"","Reference,Member,Type,Amount,Status",...state.transactions.map(t=>`${t.id},${t.member},${t.type},${t.amount},${t.status}`)].join("\n");
  const link=document.createElement("a"); link.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"})); link.download=`${String(name).toLowerCase().replace(/\s+/g,"-")}.csv`; link.click(); URL.revokeObjectURL(link.href); toast("Your CSV export has been downloaded.");
}
function downloadReport(type) {
  const link=document.createElement("a");
  link.href=`/api/reports/${type}.csv`;
  link.download=`${type}-report.csv`;
  document.body.appendChild(link); link.click(); link.remove();
  toast("Secure report export started.");
}
async function changeUserStatus(element) {
  try {
    await api(`/api/users/${element.dataset.userStatus}/status`,{method:"PATCH",body:JSON.stringify({active:element.dataset.active==="1"})});
    const result=await api("/api/users"); applyUsersApiResult(result); render(); toast("User account status updated.");
  } catch(error) { toast(error.message); }
}
async function resetUserPassword(id) {
  const user=(state.users||[]).find(u=>String(u.id)===String(id));
  if(!user)return toast("User account not found.");
  const temporary=await promptDialog("Enter a strong temporary password, or leave blank to generate one automatically:","");
  if(temporary===null)return;
  try {
    const result=await api(`/api/users/${id}/reset-password`,{method:"POST",body:JSON.stringify(temporary?{password:temporary}:{})});
    closeModal();
    document.body.insertAdjacentHTML("beforeend",`<div class="modal-backdrop" id="modal-backdrop"><div class="modal"><div class="modal-head"><div><h2>Temporary password issued</h2><p>${escapeHtml(user.fullName)} - ${escapeHtml(user.email)}</p></div><button class="modal-close" data-close-modal>${icons.x}</button></div><div class="bio-password-result"><p>Give this password securely to the user. It is shown only now and must be changed at the next sign-in.</p><code>${escapeHtml(result.temporaryPassword)}</code><button class="button primary" data-close-modal>Done</button></div></div></div>`);
    document.querySelectorAll("#modal-backdrop [data-close-modal]").forEach(x=>x.addEventListener("click",closeModal));
  } catch(error) { toast(error.message); }
}async function verifyTransaction(id) {
  try {
    await api(`/api/transactions/${id}/verify`,{method:"POST",body:"{}"});
    await refreshData(); render(); toast("Transaction verified and member balance updated.");
  } catch(error) { toast(error.message); }
}
function toast(message) {
  const root=document.getElementById("toast-root"); const el=document.createElement("div"); el.className="toast"; el.innerHTML=`${icons.check}<span>${message}</span>`; root.appendChild(el); setTimeout(()=>el.remove(),3500);
}

init();

document.addEventListener("click",event=>{
  const close=event.target.closest("[data-close-modal]");
  if(close){event.preventDefault();closeModal();return;}
  const supervisory=event.target.closest("[data-supervisory-quick]");
  if(supervisory){event.preventDefault();const action=supervisory.dataset.supervisoryQuick;closeModal();window.DepartmentUi?.quick?.supervisory?.(action);}
});




