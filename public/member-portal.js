/* Self-only member workspace and shared personal account settings. */
(() => {
  const pages=["member-dashboard","messages","member-profile","member-savings","member-requests","member-loans","member-guarantorship",
    "member-welfare","member-documents","member-meetings","member-notifications","member-support"];
  const labels={"member-dashboard":"Dashboard",messages:"Messages","member-profile":"My Profile","member-savings":"My Savings",
    "member-requests":"My Requests","member-loans":"My Loans","member-guarantorship":"Guarantorship",
    "member-welfare":"Welfare","member-documents":"Documents","member-meetings":"Meetings",
    "member-notifications":"Notifications","member-support":"Support"};
  const pageIcons={"member-dashboard":"dashboard",messages:"messages","member-profile":"members","member-savings":"savings","member-loans":"loans",
    "member-requests":"clock","member-guarantorship":"users","member-welfare":"shield","member-documents":"file",
    "member-meetings":"clock","member-notifications":"bell","member-support":"help"};
  const esc=value=>escapeHtml(value==null?"":String(value)),date=value=>value?new Date(value).toLocaleDateString():"—";
  const C=()=>state.memberCenter,S=()=>state.memberSelfService||{opportunities:[],applications:[]},linked=()=>Boolean(state.user?.member_id);
  const inMemberSpace=()=>Boolean(state.memberCenter)&&((linked()&&(state.role==="Member"||state.memberContext))||state.memberOversight)&&pages.includes(state.page);
  const readOnlyMember=()=>Boolean(state.memberOversight||state.memberCenter?.readOnly);
  const canActOnMember=()=>!readOnlyMember()||(state.memberOversight&&["Executive Officer","Credits Officer","System Admin"].includes(state.role));
  const gridTable=(heads,rows)=>`<div class="table-scroll"><table><thead><tr>${heads.map(x=>`<th>${x}</th>`).join("")}</tr></thead><tbody>${rows||`<tr><td colspan="${heads.length}"><div class="member-empty">No records yet.</div></td></tr>`}</tbody></table></div>`;
  const metric=(name,value,icon,target,sub="")=>`<button class="member-summary-card" data-member-page="${target}"><span>${icons[icon]}</span><div><small>${name}</small><strong>${value}</strong><em>${sub}</em></div></button>`;
  const panel=(title,sub,body)=>`<section class="card member-panel"><div class="card-head"><div><h2 class="card-title">${title}</h2><p class="card-subtitle">${sub}</p></div></div>${body}</section>`;
  const targetLine=(label,paid,target,options={})=>{const p=Number(paid),t=Number(target),percent=t?Math.min(100,Math.round(p/t*100)):0,variance=p-t,surplusLabel=options.surplusLabel||"Ahead by";let statusClass="met",statusText="Target met";if(variance<-0.005){statusClass="behind";statusText=`Short by ${money(Math.abs(variance))}`;}else if(variance>0.005){statusClass="ahead";statusText=`${surplusLabel} ${money(variance)}`;}const barTone=statusClass==="met"?"met":statusClass;return `<div class="member-target-line ${statusClass}"><div><strong>${label}</strong><span>${money(paid)} paid of ${money(t)}</span></div><b>${percent}%</b><i class="${barTone}"><em style="width:${percent}%"></em></i><small class="${statusClass}">${statusText}</small></div>`;};
  function financialYearPanel(){
    const f=C()?.financialYearProgress;if(!f)return "";
    const savingsToward=Number(f.savingsTowardTarget??f.savingsPaid);
    const shareToward=Number(f.sharePaidTowardTarget??f.sharePaid);
    const annualMet=savingsToward>=Number(f.annualSavingsTarget)-0.005;
    const annualSurplus=Math.max(0,savingsToward-Number(f.annualSavingsTarget));
    const covered=Number(f.coveredMonths||0);
    const surplusApplied=Number(f.pastYearSurplusApplied||0);
    const surplusNote=surplusApplied>0
      ?`<div class="member-policy-note member-advance-note"><b>Past-year surplus applied:</b> ${money(surplusApplied)} carries into ${esc(f.fiscalYear)} savings and covers about <b>${covered} month${covered===1?"":"s"}</b>${Number(f.coveredMonthsRemainder)>0?` (plus ${money(f.coveredMonthsRemainder)} toward the next month)`:""}.</div>`
      :"";
    const advanceNote=annualMet&&annualSurplus>0
      ?`<div class="member-policy-note member-advance-note"><b>Annual savings target met.</b> Extra ${money(annualSurplus)} remains as surplus toward future months.</div>`
      :"";
    return panel(`${f.fiscalYear} contribution progress`,
      `Annual targets for ${esc(f.fiscalYear)}  -  monthly savings ${money(f.monthlySavingsTarget)}`,
      `${targetLine("Full-year savings target",savingsToward,f.annualSavingsTarget,{surplusLabel:"Surplus toward future months"})}
       ${targetLine("Annual share contribution",shareToward,f.annualShareTarget)}
       ${targetLine("Annual subscription fee",f.subscriptionPaid,f.annualSubscriptionFee)}
       ${targetLine("Combined annual contribution",Number(f.combinedAnnualPaid||0),Number(f.combinedAnnualTarget||0))}
       <div class="member-policy-note"><b>Monthly savings:</b> ${money(f.monthlySavingsTarget)}  -  <b>Full-year savings:</b> ${money(f.annualSavingsTarget)}  -  <b>Shares:</b> ${money(f.annualShareTarget)}  -  <b>Subscription:</b> ${money(f.annualSubscriptionFee)}  -  <b>Combined target:</b> ${money(f.combinedAnnualTarget||0)}</div>
       ${surplusNote}${advanceNote}`);
  }
  function closingPositionPanel(){
    const x=C()?.pastYearProgress;if(!x)return "";
    const variance=Number(x.variance||0),percent=x.expected?Math.min(100,Math.round(x.totalPaid/x.expected*100)):0;
    const f=C()?.financialYearProgress;
    const monthly=Number(f?.monthlySavingsTarget||0);
    const covered=monthly>0&&variance>0?Math.floor(variance/monthly):0;
    const remainder=monthly>0&&variance>0?Math.max(0,variance-(covered*monthly)):0;
    const carryNote=variance>0
      ?`<p class="member-policy-note member-advance-note"><b>Surplus carries forward:</b> ${money(variance)} jumps into ${esc(f?.fiscalYear||"this year")} savings and covers about <b>${covered} month${covered===1?"":"s"}</b>${remainder>0?` plus ${money(remainder)}`:""}.</p>`
      :`<p class="member-policy-note">Your lifetime savings balance includes every verified savings payment from all years.</p>`;
    return panel(`${x.fiscalYear} closing-target progress`,`Year ended ${date(x.periodEnd)} - later arrears payments reduce the shortfall without changing the original closing report`,`${targetLine("Adjusted past-year savings",x.totalPaid,x.expected)}<div class="member-closing-grid"><div><span>Paid by 30 June</span><strong>${money(x.paidAtClose)}</strong></div><div><span>Arrears cleared later</span><strong>${money(x.arrearsPaid)}</strong></div><div><span>Expected target</span><strong>${money(x.expected)}</strong></div><div><span>Progress</span><strong>${percent}%</strong></div><div class="${variance<0?"behind":"ahead"}"><span>Remaining position</span><strong>${variance<0?`Still owing ${money(Math.abs(variance))}`:`Surplus ${money(variance)}`}</strong></div></div>${carryNote}`);
  }

  function accountSettings(){
    const photo=state.user?.has_profile_photo,m=C()?.member;
    return `<section class="account-settings"><div class="account-settings-head"><div><p class="eyebrow">Personal account</p><h2>Account & security</h2><p>Edit your profile information, profile picture and password.</p></div><div class="account-photo">${photo?`<img src="/api/account/profile-photo?v=${state.profilePhotoVersion||0}" alt="Profile photo">`:`<span>${initials(actor())}</span>`}</div></div>
      <div class="account-settings-grid">
        <form class="card account-form account-profile-form" data-account-profile><h3>Profile information</h3><p>Saved details are used throughout dashboards, messages and your linked member record.</p><div class="form-grid">
          <div class="field"><label>Full name</label><input name="fullName" value="${esc(actor())}" minlength="2" maxlength="120" required></div>
          <div class="field"><label>Email address</label><input name="email" type="email" value="${esc(state.user?.email||m?.email||"")}" required></div>
          <div class="field"><label>Phone number</label><input name="phone" value="${esc(state.user?.phone||m?.phone||"")}" required></div>
          ${m?`<div class="field"><label>National ID</label><input name="nationalId" value="${esc(m.nationalId||"")}"></div><div class="field"><label>Date of birth</label><input name="dateOfBirth" type="date" value="${m.dateOfBirth?String(m.dateOfBirth).slice(0,10):""}"></div><div class="field"><label>Gender</label><select name="gender"><option value="">Not recorded</option>${["female","male","other","prefer_not_to_say"].map(x=>`<option value="${x}" ${m.gender===x?"selected":""}>${x.replaceAll("_"," ")}</option>`).join("")}</select></div><div class="field"><label>Marital status</label><select name="maritalStatus"><option value="">Not recorded</option>${["single","married","divorced","widowed","separated","other"].map(x=>`<option value="${x}" ${m.maritalStatus===x?"selected":""}>${x}</option>`).join("")}</select></div><div class="field"><label>Nationality</label><input name="nationality" value="${esc(m.nationality||"")}"></div><div class="field"><label>Occupation</label><input name="occupation" value="${esc(m.occupation||"")}"></div><div class="field"><label>Employer</label><input name="employer" value="${esc(m.employer||"")}"></div><div class="field full"><label>Residence / address</label><input name="address" value="${esc(m.address||"")}"></div><div class="field"><label>Home district</label><input name="homeDistrict" value="${esc(m.homeDistrict||"")}"></div><div class="field"><label>Subcounty</label><input name="subcounty" value="${esc(m.subcounty||"")}"></div><div class="field"><label>Parish</label><input name="parish" value="${esc(m.parish||"")}"></div><div class="field"><label>Village</label><input name="village" value="${esc(m.village||"")}"></div><div class="field"><label>Next of kin</label><input name="nextOfKin" value="${esc(m.nextOfKin||"")}"></div><div class="field"><label>Beneficiaries</label><input name="beneficiaries" value="${esc(m.beneficiaries||"")}"></div><div class="field"><label>Emergency contact</label><input name="emergencyContactName" value="${esc(m.emergencyContactName||"")}"></div><div class="field"><label>Emergency phone</label><input name="emergencyContactPhone" value="${esc(m.emergencyContactPhone||"")}"></div><div class="field"><label>Emergency relationship</label><input name="emergencyContactRelationship" value="${esc(m.emergencyContactRelationship||"")}"></div><input type="hidden" name="membershipStatus" value="${esc(m.status||"active")}">`:""}
        </div><button class="button primary">Save profile information</button></form>
        <form class="card account-form" data-account-photo><h3>Profile picture</h3><p>JPG, PNG or WebP.</p><div class="field"><label>Choose photo</label><input name="photo" type="file" accept="image/jpeg,image/png,image/webp" required></div><div class="form-actions"><button class="button primary">Upload</button>${photo?`<button class="button secondary" type="button" data-remove-photo>Remove</button>`:""}</div></form>
        <form class="card account-form" data-account-password><h3>Change password</h3><p>Changing it signs out every session.</p><div class="field"><label>Current password</label><input name="currentPassword" type="password" required></div><div class="field"><label>New password</label><input name="newPassword" type="password" minlength="8" required><small>Uppercase, lowercase, number and symbol.</small></div><button class="button primary">Change password</button></form>
      </div></section>`;
  }
  function sidebar(){
    return `<aside class="sidebar executive-sidebar member-sidebar" id="sidebar"><div class="executive-brand"><div class="executive-crest member-crest">${icons.users}</div><div><strong>KASANGATI G40<br>KWAGALANA</strong><span>MEMBER ACCOUNT</span></div></div>
      <nav class="nav executive-nav">${pages.map(page=>`<button class="nav-item ${state.page===page?"active":""}" data-member-page="${page}">${icons[pageIcons[page]]}<span>${labels[page]}</span>${page==="member-guarantorship"&&(C()?.guarantees||[]).some(g=>g.guaranteeStatus==="pending")?`<span class="nav-alert-dot" aria-hidden="true"></span>`:page==="member-notifications"&&C()?.summary.notifications?`<span class="nav-alert-dot" aria-hidden="true"></span>`:page==="member-requests"&&(C()?.summary?.pendingRequests||0)?`<span class="nav-alert-dot" aria-hidden="true"></span>`:""}</button>`).join("")}</nav>
      <div class="sidebar-bottom">${state.role!=="Member"||state.memberOversight?`<button class="executive-quick" data-member-back>${icons.arrowUp}<span>${state.memberOversight?"Back to members":"Back to department"}</span></button>`:""}<div class="sidebar-user"><div class="avatar">${profileImage(state.user.id,actor(),state.user.has_profile_photo)}</div><div><div class="user-name">${esc(state.memberOversight?C()?.member?.fullName:actor())}</div><div class="user-role">${esc(C()?.member?.memberNumber||"Member")}${state.memberOversight?" · oversight":""}</div></div></div></div></aside>`;
  }
  function oversightBanner(){
    if(!state.memberOversight)return "";
    return `<div class="notice"><div>${icons.shield}</div><div><strong>Viewing ${esc(C()?.member?.fullName||"member")} dashboard</strong><p>${canActOnMember()?"You can submit deposits and loan payments for this member from this view.":"Read-only oversight of this Legal-registered member account. Deposit, loan application and repayment actions stay with the member or Credits officers."}</p></div></div>`;
  }
  function dashboardNextUp(c){
    const items=[];
    const pendingGuarantee=(c.guarantees||[]).find(x=>x.guaranteeStatus==="pending");
    if(pendingGuarantee){
      items.push({tone:"warning",title:`Guarantee request from ${pendingGuarantee.borrower}`,detail:`${money(pendingGuarantee.amount)} · ${pendingGuarantee.reference}`,action:"member-guarantorship",label:"Respond"});
    }
    const activeLoan=(c.loans||[]).find(x=>["active","overdue"].includes(x.status));
    if(activeLoan&&Number(activeLoan.nextPaymentAmount||0)>0){
      items.push({tone:activeLoan.inDangerPeriod||activeLoan.status==="overdue"?"danger":"info",title:`Next loan repayment · ${activeLoan.reference}`,detail:`${money(activeLoan.nextPaymentAmount)} due ${date(activeLoan.nextDueDate)}`,action:"member-loans",label:"Pay loan"});
    }
    const fy=c.financialYearProgress;
    if(fy&&Number(fy.expectedSavingsToDate)>0&&Number(fy.savingsTowardTarget??fy.savingsPaid)<Number(fy.expectedSavingsToDate)){
      const short=Number(fy.expectedSavingsToDate)-Number(fy.savingsTowardTarget??fy.savingsPaid);
      items.push({tone:"info",title:`${fy.fiscalYear} savings still short`,detail:`${money(short)} needed to stay on target`,action:"member-savings",label:"Submit deposit"});
    }
    if(!items.length)return "";
    return `<section class="member-next-up"><div class="member-next-up-head"><h3>Next for you</h3><p>Only what needs attention now</p></div><div class="member-next-up-list">${items.slice(0,2).map(item=>`<article class="${item.tone}"><div><strong>${esc(item.title)}</strong><span>${esc(item.detail)}</span></div><button type="button" class="button small ${item.tone==="danger"?"primary":"secondary"}" data-member-page="${item.action}">${item.label}</button></article>`).join("")}</div></section>`;
  }
  function dashboardActions(c){
    if(!canActOnMember())return `<button class="button secondary" data-member-page="member-profile">View profile</button>`;
    const activeLoan=(c.loans||[]).find(x=>["active","overdue"].includes(x.status));
    return `<button class="button primary" data-member-action="deposit">${icons.plus}Submit deposit</button>${activeLoan?`<button class="button secondary" data-member-repay="${activeLoan.id}" data-settle="0">${icons.receipt}Pay loan</button>`:`<button class="button secondary" data-member-action="apply-loan">${icons.loans}Apply for a loan</button>`}`;
  }
  function dashboard(){
    const c=C(),m=c.member,s=c.summary,h=new Date().getHours(),g=h<12?"Good morning":h<18?"Good afternoon":"Good evening";
    return `${oversightBanner()}<div class="member-portal"><section class="member-welcome"><div><span>${g}</span><h2>${esc(m.fullName)}</h2><p>Member ID: <b>${esc(m.memberNumber)}</b> - Status: <b>${esc(m.status)}</b> - Joined ${date(m.joinedAt)}</p></div><div class="module-actions">${dashboardActions(c)}</div></section>
      <div class="member-summary-grid">${metric("My Savings",money(s.savings),"savings","member-savings","Current carried-forward balance")}${metric("Share Capital",money(s.shares),"building","member-savings","Current share balance")}${metric("Total Member Funds",money(s.totalMemberFunds),"wallet","member-savings","Savings plus share capital")}${metric("Active Loan Balance",money(s.activeLoanBalance),"loans","member-loans","Remaining total repayment including interest")}</div>
      ${dashboardNextUp(c)}
      <div class="member-target-layout">${financialYearPanel()}${closingPositionPanel()}</div>
      ${panel("Recent activity","Your latest account events",`<div class="member-list">${(c.recentActivity||[]).slice(0,5).map(x=>`<article><span>${icons[x.type==="notification"?"bell":"receipt"]}</span><div><strong>${esc(x.title)}</strong><p>${esc(x.detail)}</p></div><time>${date(x.date)}</time></article>`).join("")||`<div class="member-empty">No activity.</div>`}</div>`)}</div>`;
  }
  function profile(){
    const m=C().member,items=[["Member ID",m.memberNumber],["Membership status",m.status],["National ID",m.nationalId],["Phone",m.phone],["Email",m.email||"Not recorded"],["Joined",date(m.joinedAt)],["Date of birth",date(m.dateOfBirth)],["Gender",m.gender||"Not recorded"],["Nationality",m.nationality||"Not recorded"],["Address",m.address||"Not recorded"],["Occupation",m.occupation||"Not recorded"],["Employer",m.employer||"Not recorded"],["Next of kin",m.nextOfKin||"Not recorded"],["Emergency contact",`${m.emergencyContactName||"Not recorded"} ${m.emergencyContactPhone||""}`]];
    return `<div class="member-profile-layout"><section class="card member-identity"><div class="member-passport">${state.user.has_profile_photo?`<img src="/api/account/profile-photo?v=${state.profilePhotoVersion||0}" alt="Profile photo">`:m.hasPassportPhoto?`<img src="/api/member/passport-photo" alt="Passport photo">`:`<span>${initials(m.fullName)}</span>`}</div><div><p class="eyebrow">Verified membership record</p><h2>${esc(m.fullName)}</h2><p>${esc(m.memberNumber)} - ${esc(m.branch||"Organization")}</p>${status(m.bioStatus||"pending")}</div></section>
      ${panel("Personal information","Official membership data maintained by Legal",`<dl class="member-profile-grid">${items.map(([a,b])=>`<div><dt>${a}</dt><dd>${esc(b)}</dd></div>`).join("")}</dl>`)}${accountSettings()}</div>`;
  }
  function savings(){
    const c=C(),monthly=c.transactions.filter(x=>/deposit/i.test(x.type)&&x.status==="completed"&&new Date(x.createdAt).getMonth()===new Date().getMonth()).reduce((s,x)=>s+Number(x.amount),0);
    const rows=c.transactions.map(x=>`<tr><td><strong>${esc(x.reference)}</strong><small>${esc(x.externalReference||"")}</small></td><td>${esc(x.type)}</td><td>${esc(x.method)}</td><td>${money(x.amount)}</td><td>${esc(x.receiptNumber||"Issued after verification")}</td><td>${date(x.createdAt)}</td><td>${status(x.status)}</td><td><button class="button small secondary" data-member-transaction="${x.id}">${icons.eye}Details</button></td></tr>`).join("");
    return `<div class="member-module"><div class="member-summary-grid compact">${metric("Current balance",money(c.member.savings),"savings","member-savings")}${metric("Verified this month",money(monthly),"receipt","member-savings")}${metric("Share capital",money(c.member.shares),"building","member-savings")}</div><div class="module-actions">${canActOnMember()?`<button class="button primary" data-member-action="deposit">${icons.plus}Submit deposit</button>`:""}${!readOnlyMember()?`<button class="button secondary" data-member-action="withdraw">${icons.arrowUp}Request withdrawal</button><a class="button secondary" href="/api/member/reports/transactions.csv">${icons.download}Download statement</a>`:""}</div>${panel("Savings history","Submitted evidence, verification decisions and official receipts",gridTable(["Reference","Type","Method","Amount","Official receipt","Submitted","Status","Actions"],rows))}</div>`;
  }
  function requests(){
    const c=C(),pendingTransactions=c.transactions.filter(x=>["pending","pending_finance_review"].includes(x.status)),pendingLoans=c.loans.filter(x=>!["active","completed","rejected","closed"].includes(x.status)),pendingGuarantees=c.guarantees.filter(x=>x.guaranteeStatus==="pending"),pendingWelfare=c.welfare.requests.filter(x=>!["paid","closed","rejected"].includes(x.status));
    const deposits=pendingTransactions.filter(x=>x.type!=="Loan repayment").map(x=>`<tr><td><strong>${esc(x.reference)}</strong><small>${esc(x.externalReference||"")}</small></td><td>${esc(x.type)}</td><td>${money(x.amount)}</td><td>${date(x.createdAt)}</td><td>${status(x.status)}</td><td><button class="button small secondary" data-member-transaction="${x.id}">${icons.eye}Details</button></td></tr>`).join("");
    const loanRepayments=pendingTransactions.filter(x=>x.type==="Loan repayment").map(x=>`<tr><td><strong>${esc(x.reference)}</strong><small>${esc(x.externalReference||"")}</small></td><td>${esc(x.type)}</td><td>${money(x.amount)}</td><td>${date(x.createdAt)}</td><td>${status(x.status)}</td><td><button class="button small secondary" data-member-transaction="${x.id}">${icons.eye}Details</button></td></tr>`).join("");
    const loans=pendingLoans.map(x=>`<tr><td><strong>${esc(x.reference)}</strong></td><td>${esc(x.product)}</td><td>${money(x.amount)}</td><td>${date(x.createdAt)}</td><td>${status(x.status)}</td></tr>`).join("");
    const guarantees=pendingGuarantees.map(x=>`<tr><td><strong>${esc(x.reference)}</strong></td><td>${esc(x.borrower)}</td><td>${money(x.amount)}</td><td>${status(x.guaranteeStatus)}</td><td><div class="table-actions"><button class="button small secondary" data-member-guarantee="${x.loanId}" data-response="reject">Reject</button><button class="button small primary" data-member-guarantee="${x.loanId}" data-response="accept">Accept</button></div></td></tr>`).join("");
    const welfare=pendingWelfare.map(x=>`<tr><td><strong>${esc(x.reference)}</strong></td><td>${esc(x.category)}</td><td>${money(x.amount)}</td><td>${status(x.urgency)}</td><td>${status(x.status)}</td></tr>`).join("");
    const contributions=c.welfare.contributions.filter(x=>["pending","pending_finance_review"].includes(x.status)).map(x=>`<tr><td><strong>${esc(x.reference)}</strong></td><td>${esc(x.type)}</td><td>${money(x.amount)}</td><td>${date(x.contributionDate)}</td><td>${status(x.status)}</td></tr>`).join("");
    return `<div class="member-stack">${panel("Pending savings transactions","Deposits awaiting Credits verification",gridTable(["Reference","Type","Amount","Submitted","Status","Actions"],deposits))}${loanRepayments?panel("Pending loan repayments","Loan payments awaiting Credits verification before progress updates",gridTable(["Reference","Type","Amount","Submitted","Status","Actions"],loanRepayments)):""}${panel("Pending welfare contributions","Payment evidence awaiting Finance verification",gridTable(["Reference","Type","Amount","Submitted","Status"],contributions))}${panel("Pending loan applications","Applications still moving through approval",gridTable(["Loan","Product","Amount","Submitted","Stage"],loans))}${panel("Guarantee requests","Loan guarantees awaiting your response",gridTable(["Loan","Borrower","Amount","Status","Actions"],guarantees))}${panel("Welfare requests","Support requests awaiting a final decision",gridTable(["Request","Category","Amount","Urgency","Status"],welfare))}</div>`;
  }
  function loans(){
    const all=C().loans,active=all.filter(x=>["active","overdue"].includes(x.status)),history=all.filter(x=>["completed","closed"].includes(x.status));
    const payments=(C().transactions||[]).filter(t=>t.type==="Loan repayment");
    const activeCards=active.map(x=>{
      const totalDue=Number(x.totalDue||x.amount||0),totalPaid=Number(x.totalPaid||0),totalInterest=Number(x.totalInterest||Math.max(0,totalDue-Number(x.amount||0)));
      const fee=Number(x.processingFee||0),netDisbursed=Math.max(0,Number(x.amount||0)-fee);
      const remaining=Math.max(0,totalDue-totalPaid);
      const progressPct=totalDue?Math.min(100,Math.round(totalPaid/totalDue*100)):0;
      const lastPaid=x.lastPaidAmount!=null?`<div class="member-next-repayment"><span>Last paid<strong>${money(x.lastPaidAmount)}</strong></span><span>Paid on<strong>${date(x.lastPaidAt)}</strong></span></div>`:`<div class="member-next-repayment"><span>Last paid<strong>None yet</strong></span><span>Receipt<strong>—</strong></span></div>`;
      return `<article class="card member-loan-progress"><header><div><small>${esc(x.reference)} · ${esc(x.product)}</small><h3>${money(remaining)} still due</h3></div>${status(x.status)}</header>
        <div class="member-loan-progress-bar"><i style="width:${progressPct}%"></i></div>
        <div class="member-loan-progress-meta"><span>${progressPct}% repaid</span><span>${money(totalPaid)} of ${money(totalDue)}</span></div>
        <div class="member-loan-totals">
          <span>Total repayment <strong>${money(totalDue)}</strong></span>
          <span>Cash received <strong>${money(netDisbursed)}</strong></span>
          <span>Interest (2%/mo) <strong>${money(totalInterest)}</strong></span>
        </div>
        <div class="member-next-repayment"><span>Next repayment<strong>${money(x.nextPaymentAmount||0)}</strong></span><span>Due date<strong>${date(x.nextDueDate)}</strong></span></div>
        ${x.inDangerPeriod?`<div class="member-loan-danger">Danger period — pay before grace ends or a 5% penalty applies on principal only.</div>`:""}
        ${lastPaid}
        <small class="member-loan-fee-note">Pay in full: principal ${money(x.balance)} + first-month interest ${money(x.firstMonthInterestRemaining||0)}.</small>
        ${canActOnMember()?`<div class="member-loan-actions"><button class="button primary" data-member-repay="${x.id}" data-settle="0">${icons.receipt}Pay loan</button><button class="button secondary" data-member-repay="${x.id}" data-settle="1">${icons.check}Pay in full</button></div>`:""}</article>`;
    }).join("");
    const rows=all.map(x=>`<tr><td><strong>${esc(x.reference)}</strong></td><td>${esc(x.product)}</td><td>${money(x.totalDue||x.amount)}</td><td>${money(Math.max(0,Number(x.amount||0)-Number(x.processingFee||0)))}</td><td>${x.termMonths} months</td><td>${x.lastPaidAmount!=null?`${money(x.lastPaidAmount)}<small class="table-sub">${date(x.lastPaidAt)}${x.lastPaidReceipt?` · ${esc(x.lastPaidReceipt)}`:""}</small>`:"—"}</td><td>${money(x.nextPaymentAmount||0)}</td><td>${date(x.nextDueDate)}</td><td>${status(x.status)}</td></tr>`).join("");
    const historyRows=history.map(x=>`<tr><td><strong>${esc(x.reference)}</strong></td><td>${esc(x.product)}</td><td>${money(x.totalDue||x.amount)}</td><td>${money(x.totalPaid||x.totalDue||x.amount)}</td><td>${x.lastPaidAmount!=null?`${money(x.lastPaidAmount)}<small class="table-sub">${date(x.lastPaidAt)}</small>`:"—"}</td><td>${x.termMonths} months</td><td>${date(x.dueDate||x.createdAt)}</td><td>${status(x.status)}</td></tr>`).join("");
    const paymentRows=payments.map(t=>`<tr><td><strong>${esc(t.receiptNumber||t.reference)}</strong><small class="table-sub">${esc(t.externalReference||"")}</small></td><td>${esc(t.loanReference||"—")}</td><td>${money(t.amount)}</td><td>${esc(t.method||"—")}</td><td>${date(t.verifiedAt||t.createdAt)}</td><td>${status(t.status)}</td></tr>`).join("");
    const pastMet=Boolean(C()?.loanEligibility?.pastYearTargetCompleted)||(Boolean(C()?.pastYearProgress)&&Number(C().pastYearProgress.variance)>=0);
    const runningLoans=(C()?.loans||[]).filter(l=>["active","overdue"].includes(l.status));
    const openGuarantees=(C()?.guarantees||[]).filter(g=>["pending","accepted"].includes(g.guaranteeStatus)&&!["rejected","completed","closed"].includes(g.status));
    const eligibilityNote=runningLoans.length
      ?`<div class="notice warning"><div>${icons.info}</div><div><strong>Running loan in progress</strong><p>Settle ${esc(runningLoans[0].reference)} fully before applying for another loan or guaranteeing another member.</p></div></div>`
      :(openGuarantees.length
      ?`<div class="notice warning"><div>${icons.info}</div><div><strong>Active guarantorship</strong><p>You are guaranteeing ${esc(openGuarantees[0].borrower)} (${esc(openGuarantees[0].reference)}). Settle that loan before applying for your own.</p></div></div>`
      :(pastMet
      ?`<div class="notice success member-loan-eligible"><div>${icons.check}</div><div><strong>${esc(C()?.pastYearProgress?.fiscalYear||"FY 25/26")} savings target completed</strong><p>You can apply for a loan. Current-year savings progress is not required once the closing target is met.</p></div></div>`
      :(C()?.pastYearProgress&&Number(C().pastYearProgress.variance)<0
        ?`<div class="notice warning"><div>${icons.info}</div><div><strong>Complete ${esc(C().pastYearProgress.fiscalYear)} savings first</strong><p>Amount remaining: ${money(Math.abs(Number(C().pastYearProgress.variance)))}. Finish this target to unlock loan applications.</p></div></div>`
        :"")));
    return `${oversightBanner()}<div class="member-module"><div class="module-actions">${readOnlyMember()?"":`<button class="button primary" data-member-action="apply-loan">${icons.plus}Apply for a loan</button>`}<button class="button secondary" data-open-loan-calculator>${icons.reports}Loan calculator</button>${readOnlyMember()?"":`<a class="button secondary" href="/api/member/reports/loans.csv">${icons.download}Loan statement</a>`}</div>
      ${eligibilityNote}
      ${activeCards?`<div class="member-active-loans">${activeCards}</div>`:`<div class="member-empty">No active loans.</div>`}
      ${panel("My loans","Applications and facilities. Total repayment includes organization interest of 2% every month.",gridTable(["Loan","Product","Total repayment","Cash received","Term","Last paid","Next repayment","Next due","Status"],rows))}
      ${panel("Payment history","Verified and pending loan repayments on your facilities",gridTable(["Receipt / Ref","Loan","Amount","Method","Date","Status"],paymentRows))}
      ${panel("Loan history","Closed and fully repaid facilities",gridTable(["Loan","Product","Total repayment","Paid","Last paid","Term","Closed / due","Status"],historyRows))}</div>`;
  }
  function guarantees(){
    const running=(C()?.loans||[]).filter(l=>["active","overdue"].includes(l.status));
    const past=C()?.pastYearProgress;
    const fy=C()?.financialYearProgress;
    const pastBehind=past&&Number(past.variance)<0;
    const pastOk=Boolean(past)&&Number(past.variance)>=0;
    const currentBehind=!pastOk&&fy&&Number(fy.expectedSavingsToDate||0)-Number(fy.savingsPaid||0)>0.005;
    const notice=running.length
      ?`<div class="notice warning"><div>${icons.info}</div><div><strong>Cannot guarantee while you have a running loan</strong><p>Settle ${esc(running[0].reference)} fully before accepting or offering a guarantee.</p></div></div>`
      :(pastBehind||currentBehind
        ?`<div class="notice warning"><div>${icons.info}</div><div><strong>Savings must be up to date to guarantee</strong><p>${pastBehind?`Complete ${esc(past.fiscalYear)} first (${money(Math.abs(Number(past.variance)))} remaining).`:`Bring ${esc(fy.fiscalYear)} savings up to date before guaranteeing.`}</p></div></div>`
        :"");
    const canAccept=!running.length&&!pastBehind&&!currentBehind;
    const openGuarantees=C().guarantees.filter(x=>!["completed","closed","rejected"].includes(String(x.status||"")));
    const rows=openGuarantees.map(x=>`<tr><td><strong>${esc(x.reference)}</strong></td><td>${esc(x.borrower)}</td><td>${money(x.amount)}</td><td>${money(x.balance)}</td><td>${status(x.status)}</td><td>${status(x.guaranteeStatus)}</td><td>${x.guaranteeStatus==="pending"?`<div class="table-actions"><button class="button small secondary" data-member-guarantee="${x.loanId}" data-response="reject">Reject</button><button class="button small primary" data-member-guarantee="${x.loanId}" data-response="accept" ${canAccept?"":"disabled title=\"Not eligible to accept guarantees\""}>Accept</button></div>`:(x.guaranteeStatus==="accepted"?`<span class="status active">${esc(x.status||"in progress")}</span>`:"—")}</td></tr>`).join("");
    return `${notice}${panel("My guarantorship","Pending requests stay until you respond. Accepted guarantees remain with loan status until the loan is completed.",gridTable(["Loan","Borrower","Amount","Outstanding","Loan status","My response","Actions"],rows))}`;
  }
  function investments(){
    const service=S(),portfolio=C().investments.map(x=>`<tr><td><strong>${esc(x.project)}</strong><small>${esc(x.reference)}</small></td><td>${money(x.amountInvested)}</td><td>${x.ownershipPercentage}%</td><td>${money(x.expectedReturns)}</td><td>${money(x.paymentsReceived)}</td><td>${date(x.investmentDate)}</td><td>${status(x.status)}</td></tr>`).join("");
    const applications=service.applications.map(x=>`<tr><td><strong>${esc(x.reference)}</strong><small>${esc(x.paymentReference)}</small></td><td>${esc(x.project)}</td><td>${money(x.amount)}</td><td>${date(x.createdAt)}</td><td>${status(x.status)}</td><td>${x.hasEvidence?`<a class="button small secondary" href="/api/member/investments/${x.id}/evidence" target="_blank">${icons.eye}Proof</a>`:"—"}</td></tr>`).join("");
    const opportunities=service.opportunities.map(x=>`<article class="card member-opportunity"><div><small>${esc(x.category||"Investment")} - ${esc(x.reference)}</small><h3>${esc(x.name)}</h3><p>${esc(x.description)}</p></div><dl><div><dt>Minimum</dt><dd>${money(x.minimumInvestment)}</dd></div><div><dt>Expected return</dt><dd>${Number(x.expectedReturnRate||0)}%</dd></div><div><dt>Capital raised</dt><dd>${money(x.raisedAmount)} / ${money(x.targetAmount)}</dd></div><div><dt>Deadline</dt><dd>${date(x.deadline)}</dd></div></dl><button class="button primary" data-member-invest="${x.id}">${icons.plus}Invest in this project</button></article>`).join("")||`<div class="card member-empty">No projects are currently open to member investment. Investment Department controls availability.</div>`;
    return `<div class="member-stack"><div class="member-opportunity-grid">${opportunities}</div>${panel("My investment requests","Investment review and Finance verification status",gridTable(["Reference","Project","Amount","Submitted","Status","Evidence"],applications))}${panel("My confirmed investments","Personal project capital, ownership and returns",gridTable(["Project","Invested","Ownership","Expected","Received","Date","Status"],portfolio))}</div>`;
  }
  function welfare(){
    const w=C().welfare,contributions=w.contributions.map(x=>`<tr><td><strong>${esc(x.receiptNumber||x.reference)}</strong><small>${x.receiptNumber?"Official receipt":esc(x.paymentReference||"Awaiting verification")}</small></td><td>${esc(x.type)}</td><td>${esc(x.period||"—")}</td><td>${money(x.expected)}</td><td>${money(x.amount)}</td><td>${date(x.contributionDate)}</td><td>${status(x.status)}</td><td>${x.hasEvidence?`<a class="button small secondary" href="/api/welfare/contributions/${x.id}/evidence" target="_blank">${icons.eye}Proof</a>`:"—"}</td></tr>`).join(""),requests=w.requests.map(x=>`<tr><td><strong>${esc(x.reference)}</strong></td><td>${esc(x.category)}</td><td>${money(x.amount)}</td><td>${status(x.urgency)}</td><td>${status(x.status)}</td><td>${status(x.paymentStatus)}</td><td>${x.hasEvidence?`<a class="button small secondary" href="/api/welfare/requests/${x.id}/evidence" target="_blank">${icons.eye}Document</a>`:"—"}</td></tr>`).join("");
    return `<div class="member-stack"><div class="module-actions">${!readOnlyMember()?`<button class="button primary" data-member-action="welfare-contribution">${icons.plus}Make contribution</button><button class="button secondary" data-member-action="welfare-request">${icons.shield}Request support</button>`:""}</div>${panel("Welfare contributions","Submitted proof, Finance verification and official receipts",gridTable(["Reference / Receipt","Type","Period","Expected","Paid","Date","Status","Evidence"],contributions))}${panel("My welfare requests","Applications, evidence, decisions and payment status",gridTable(["Request","Category","Amount","Urgency","Decision","Payment","Document"],requests))}</div>`;
  }
  function documents(){return `<section class="member-document-grid">${C().documents.map(x=>`<article class="card"><span>${icons.file}</span><div><small>${esc(x.documentType)} - v${esc(x.version)}</small><h3>${esc(x.title)}</h3><p>Updated ${date(x.updatedAt)}</p></div>${x.hasFile?`<div class="document-actions"><a class="button primary" href="/api/documents/${x.id}/view" target="_blank">${icons.eye}View</a><a class="button secondary" href="/api/documents/${x.id}/download">${icons.download}Download</a></div>`:`<button class="button secondary" disabled>No file attached</button>`}</article>`).join("")||`<div class="card member-empty">No member-visible documents.</div>`}</section>`;}
  function meetings(){return `<section class="member-meeting-list">${C().meetings.map(x=>`<article class="card"><time><b>${new Date(x.scheduledAt).getDate()}</b><span>${new Date(x.scheduledAt).toLocaleString("en",{month:"short"})}</span></time><div><small>${esc(x.meetingType)}</small><h3>${esc(x.title)}</h3><p>${esc(x.agenda||"Agenda pending")} - ${esc(x.venue||"Venue pending")}</p></div>${status(x.status)}</article>`).join("")||`<div class="card member-empty">No member-visible meetings.</div>`}</section>`;}
  function notifications(){const relative=value=>{const seconds=Math.max(1,Math.round((Date.now()-new Date(value))/1000));if(seconds<60)return `${seconds} sec ago`;if(seconds<3600)return `${Math.floor(seconds/60)} min ago`;if(seconds<86400)return `${Math.floor(seconds/3600)} hr ago`;return `${Math.floor(seconds/86400)} day(s) ago`;};return `<div class="member-stack"><div class="module-actions"><button class="button secondary" data-member-read-all>Mark all as read</button></div>${panel("My notifications","Real account and workflow events",`<div class="member-list">${C().notifications.map(x=>`<article class="${x.readAt?"":"unread"}"><span>${icons.bell}</span><div><strong>${esc(x.title)}</strong><p>${esc(x.message)}</p></div><time>${relative(x.createdAt)}</time>${x.readAt?"":`<button class="button small secondary" data-member-read="${x.id}">Mark read</button>`}</article>`).join("")||`<div class="member-empty">No notifications yet. New submissions and departmental decisions will appear here.</div>`}</div>`)}</div>`;}
  function support(){
    const rows=C().support.map(x=>`<tr><td><strong>${esc(x.reference)}</strong></td><td>${esc(x.category)}</td><td>${esc(x.subject)}</td><td>${status(x.status)}</td><td>${esc(x.response||"Awaiting response")}</td></tr>`).join("");
    return `<div class="member-home-grid"><form class="card account-form" data-member-support><h2>Ask for help</h2><p>Raise a complaint, question or support request.</p><div class="field"><label>Category</label><select name="category"><option>General help</option><option>Complaint</option><option>Account question</option><option>Loan question</option><option>Welfare question</option><option>Technical support</option></select></div><div class="field"><label>Subject</label><input name="subject" required></div><div class="field"><label>Description</label><textarea name="description" minlength="10" required></textarea></div><button class="button primary">Submit request</button></form>${panel("Request tracking","Responses from the organization",gridTable(["Reference","Category","Subject","Status","Response"],rows))}</div>`;
  }
  function view(){
    if(!C())return `<div class="card member-empty">Loading your member account?</div>`;
    return ({"member-dashboard":dashboard,messages:messagesView,"member-profile":profile,"member-savings":savings,"member-requests":requests,"member-loans":loans,
      "member-guarantorship":guarantees,"member-welfare":welfare,
      "member-documents":documents,"member-meetings":meetings,"member-notifications":notifications,"member-support":support}[state.page]||dashboard)();
  }
  function modal(title,form){document.body.insertAdjacentHTML("beforeend",`<div class="modal-backdrop" id="modal-backdrop"><div class="modal"><div class="modal-head"><h2>${title}</h2><button class="modal-close" data-close>${icons.x}</button></div>${form}</div></div>`);document.querySelector("[data-close]").onclick=closeModal;}
  function loanEligibilityCheck(){
    const past=C()?.pastYearProgress,fy=C()?.financialYearProgress;
    const running=(C()?.loans||[]).filter(l=>["active","overdue"].includes(l.status));
    if(running.length){
      const loan=running[0];
      return {blocked:true,type:"running-loan",reference:loan.reference,amount:Number(loan.amount||0),balance:Number(loan.balance||0)};
    }
    // Incomplete FY 25/26 closing target still blocks loan apply
    if(past&&Number(past.variance)<0){
      const remaining=Math.abs(Number(past.variance));
      return {blocked:true,type:"savings",fiscalYear:past.fiscalYear,remaining,expected:Number(past.expected||0),paid:Number(past.totalPaid||0),label:"closing-target"};
    }
    // Completed FY 25/26 unlocks loan apply — do not also require current-year to-date progress
    const pastYearCompleted=Boolean(past)&&Number(past.variance)>=0;
    if(!pastYearCompleted&&fy){
      const expected=Number(fy.expectedSavingsToDate||0),paid=Number(fy.savingsPaid||0);
      const shortfall=Math.max(0,expected-paid);
      if(shortfall>0.005)return {blocked:true,type:"savings",fiscalYear:fy.fiscalYear,remaining:shortfall,expected,paid,label:"current-year"};
    }
    const openGuarantees=(C()?.guarantees||[]).filter(g=>["pending","accepted"].includes(g.guaranteeStatus)&&!["rejected","completed","closed"].includes(g.status));
    if(openGuarantees.length){
      const g=openGuarantees[0];
      return {blocked:true,type:"guarantor",borrower:g.borrower,reference:g.reference,amount:Number(g.amount||0),balance:Number(g.balance||0)};
    }
    return {blocked:false};
  }
  function showLoanEligibilityCard(info){
    if(!info?.blocked)return;
    const isSavings=info.type==="savings";
    const isRunning=info.type==="running-loan";
    const progressPct=info.expected?Math.min(100,Math.round((Number(info.paid||0)/Number(info.expected))*100)):0;
    const body=isRunning?`<div class="loan-eligibility-card">
        <p class="loan-eligibility-message">Sorry, you are not eligible to take another loan while you still have a running loan. Settle your current loan fully before applying again. Members with a running loan also cannot guarantee others.</p>
        <div class="loan-eligibility-details">
          <div><span>Loan reference</span><strong>${esc(info.reference||"—")}</strong></div>
          ${info.amount?`<div><span>Loan amount</span><strong>${money(info.amount)}</strong></div>`:""}
          ${info.balance!=null?`<div><span>Outstanding balance</span><strong>${money(info.balance)}</strong></div>`:""}
        </div>
        <div class="loan-eligibility-actions"><button type="button" class="button primary" data-member-eligibility-loans>${icons.loans}View my loans</button><button type="button" class="button secondary" data-close-eligibility>Close</button></div>
      </div>`:isSavings?`<div class="loan-eligibility-card">
        <p class="loan-eligibility-message">Sorry, you are not eligible to take a loan at the moment. Please update your savings to date then reapply. Thank you.</p>
        <div class="loan-eligibility-highlight">
          <span>Amount remaining to complete target</span>
          <strong>${money(info.remaining)}</strong>
          <small>${esc(info.fiscalYear||"Savings target")} · save this amount to unlock loan applications</small>
        </div>
        ${info.expected?`<div class="loan-eligibility-progress">
          <div class="loan-eligibility-progress-head">
            <div><strong>${esc(info.fiscalYear||"Target progress")}</strong><span>${money(info.paid||0)} paid of ${money(info.expected)}</span></div>
            <b>${progressPct}%</b>
          </div>
          <div class="loan-eligibility-progress-bar" role="progressbar" aria-valuenow="${progressPct}" aria-valuemin="0" aria-valuemax="100"><em style="width:${progressPct}%"></em></div>
          <p class="loan-eligibility-progress-note ${Number(info.paid||0)>=Number(info.expected)?"ahead":"behind"}">${Number(info.paid||0)>=Number(info.expected)?"Target met":"Still short by "+money(info.remaining)}</p>
        </div>`:""}
        <div class="loan-eligibility-actions"><button type="button" class="button primary" data-member-eligibility-savings>${icons.savings}Update savings</button><button type="button" class="button secondary" data-close-eligibility>Close</button></div>
      </div>`:`<div class="loan-eligibility-card">
        <p class="loan-eligibility-message">Sorry, you are not eligible to take a loan at the moment because you are currently guaranteeing another member's loan. Once that loan is fully settled you may apply again. Thank you.</p>
        <div class="loan-eligibility-details">
          <div><span>Borrower</span><strong>${esc(info.borrower||"Member")}</strong></div>
          <div><span>Loan reference</span><strong>${esc(info.reference||"—")}</strong></div>
          ${info.amount?`<div><span>Loan amount</span><strong>${money(info.amount)}</strong></div>`:""}
          ${info.balance?`<div><span>Outstanding balance</span><strong>${money(info.balance)}</strong></div>`:""}
        </div>
        <div class="loan-eligibility-actions"><button type="button" class="button secondary" data-member-eligibility-guarantors>View my guarantorship</button><button type="button" class="button secondary" data-close-eligibility>Close</button></div>
      </div>`;
    const subtitle=isRunning?"Running loan":isSavings?"Complete your savings target first":"Active guarantorship";
    document.body.insertAdjacentHTML("beforeend",`<div class="modal-backdrop loan-eligibility-backdrop" id="modal-backdrop"><div class="modal loan-eligibility-modal"><div class="modal-head"><div><h2>Loan application not available</h2><p>${subtitle}</p></div><button class="modal-close" data-close-eligibility aria-label="Close">${icons.x}</button></div>${body}</div></div>`);
    document.querySelectorAll("[data-close-eligibility]").forEach(el=>el.addEventListener("click",closeModal));
    document.querySelector("[data-member-eligibility-savings]")?.addEventListener("click",()=>{closeModal();state.page="member-savings";window.render();window.scrollTo(0,0);});
    document.querySelector("[data-member-eligibility-guarantors]")?.addEventListener("click",()=>{closeModal();state.page="member-guarantorship";window.render();window.scrollTo(0,0);});
    document.querySelector("[data-member-eligibility-loans]")?.addEventListener("click",()=>{closeModal();state.page="member-loans";window.render();window.scrollTo(0,0);});
  }
  function loanEligibilityFromError(message){
    const text=String(message||"");
    if(/running loan/i.test(text)||/already have a running loan/i.test(text)){
      const refMatch=text.match(/\(([A-Z]+-[\w]+)\)/);
      return {blocked:true,type:"running-loan",reference:refMatch?refMatch[1]:"",amount:0,balance:0};
    }
    if(/remaining to complete target/i.test(text)||/savings target/i.test(text)||/savings progress/i.test(text)){
      const amountMatch=text.match(/UGX\s*([\d,]+(?:\.\d+)?)/i);
      const remaining=amountMatch?Number(amountMatch[1].replace(/,/g,"")):0;
      const fyMatch=text.match(/FY\s*[\d\/\-]+/i);
      return {blocked:true,type:"savings",fiscalYear:fyMatch?fyMatch[0]:"Savings target",remaining,expected:0,paid:0};
    }
    if(/guarantee/i.test(text)&&(/cannot apply|not eligible|while guaranteeing|guaranteeing/i.test(text))){
      const refMatch=text.match(/loan\s+([A-Z]+-[\w]+)/i);
      const borrowerMatch=text.match(/guaranteeing\s+(.+?)'s\s+loan/i);
      return {blocked:true,type:"guarantor",borrower:borrowerMatch?borrowerMatch[1].trim():"",reference:refMatch?refMatch[1]:"",amount:0,balance:0};
    }
    return null;
  }
  async function loanForm(){
    try{
      const blocked=loanEligibilityCheck();
      if(blocked.blocked)return showLoanEligibilityCard(blocked);
      const result=await api("/api/loans/guarantor-candidates");
      const candidates=result.candidates||[];
      const borrowerSavings=Number(result.borrower?.savings||C()?.member?.savings||0);
      modal("Apply for a loan",`<form class="form" data-member-loan-form enctype="multipart/form-data" data-borrower-savings="${borrowerSavings}"><div class="form-grid">
        <label class="field full check-field loan-policy-check"><input type="checkbox" name="borrowerDeclaration" value="accepted" required><span>I have read and understood the Kwagalana loan policy.</span></label>
        <div class="field"><label>Loan product</label><select name="productId" required data-loan-product>${state.products.map(x=>`<option value="${x.id}" data-product-name="${esc(x.name)}">${esc(x.name)}</option>`).join("")}</select></div>
        <div class="field full" data-other-loan-fields hidden><label>Specify loan product</label><input name="customProductName" maxlength="120" placeholder="Type the loan product name"><small>Required when Other Loan is selected.</small></div>
        <div class="field"><label>Amount (UGX)</label><input name="amount" type="number" min="100000" max="25000000" step="50000" required data-loan-amount><small data-loan-amount-help>Up to UGX 25,000,000. Your first security is 75% of your savings (${money(window.LoanSecurity.capacity(borrowerSavings))} capacity).</small></div>
        <div class="field"><label>Repayment term</label><select name="termMonths">${Array.from({length:10},(_,i)=>`<option value="${i+1}" ${i===4?"selected":""}>${i+1} month${i?"s":""}</option>`).join("")}</select></div>
        <div class="field"><label>Security offered</label><select name="securityType" required data-loan-security><option value="">Choose security</option><option value="savings">Savings</option><option value="collateral">Collateral</option></select></div>
        <div class="field full"><label>Loan purpose (optional)</label><textarea name="purpose" placeholder="You may explain the purpose and repayment plan"></textarea></div>
        <div class="field full" data-collateral-fields hidden><div class="form-grid">
          <div class="field full"><label>Collateral description</label><textarea name="collateralDescription" placeholder="Land title, vehicle/logbook, type, identifying details and condition"></textarea></div>
          <div class="field"><label>Estimated collateral value (UGX)</label><input name="collateralValue" type="number" min="0" step="1000"></div>
          <div class="field"><label>Collateral owner</label><input name="collateralOwner" placeholder="Borrower or consenting owner"></div>
          <div class="field"><label>Collateral owner phone number</label><input name="collateralOwnerPhone" type="tel" placeholder="e.g. +256 7xx xxx xxx"></div>
          <label class="field full check-field"><input type="checkbox" name="collateralOwnerConsent" value="accepted"><span>I consent to use my collateral as security.</span></label>
        </div></div>
        <div class="field full" data-guarantor-fields hidden>
          <div class="loan-security-summary" data-loan-security-summary aria-live="polite"></div>
          <label>Choose guarantors</label>
          <div class="group-member-picker" data-guarantor-picker>${candidates.map(x=>{
            const busy=x.available===false||Number(x.activeGuarantees||0)>0||Number(x.runningLoans||0)>0;
            const reason=x.unavailableReason||(Number(x.runningLoans||0)>0?`Has a running loan${x.runningLoanReference?` (${x.runningLoanReference})`:""} — cannot guarantee`:(Number(x.activeGuarantees||0)>0?"Already guaranteeing an active loan — unavailable until that loan is completed":"Unavailable"));
            return typeof guarantorOptionHtml==="function"?guarantorOptionHtml(x):`<label class="group-member-option ${busy?"guarantor-unavailable":""}"><input type="checkbox" name="guarantorIds" value="${x.id}" data-guarantor-savings="${Number(x.savings||0)}" ${busy?"disabled":""}><div class="chat-avatar">${initials(x.fullName)}</div><div><strong>${esc(x.fullName)}</strong><span>${esc(x.memberNumber)}</span><em>${busy?esc(reason):`Savings ${money(x.savings||0)} · 75% security ${money(window.LoanSecurity.capacity(x.savings||0))}`}</em></div></label>`;
          }).join("")||`<div class="member-empty">No eligible guarantor accounts are currently available.</div>`}</div>
          <small>Select enough guarantors so 75% of their savings covers what your own 75% does not. Call them to accept from their dashboards.</small>
        </div>
        <div class="field full record-file-field"><label>Supporting document (optional)</label><input name="supportingDocument" type="file" accept="image/jpeg,image/png,image/webp,application/pdf,.doc,.docx"><small>Attach a land title, vehicle logbook, collateral evidence, quotation or other relevant document.</small></div>
        <label class="field full check-field loan-overdue-check"><input type="checkbox" name="overdueDeclaration" value="accepted" required><span>I understand that after a 5-day grace from the due date, unpaid principal attracts a 5% late-payment penalty (interest is not included in the penalty base), plus recovery costs and security enforcement.</span></label>
      </div><div class="member-form-message" data-loan-message aria-live="polite"></div><div class="form-actions"><button type="button" class="button secondary" data-close-modal>Cancel</button><button type="submit" class="button primary">Submit loan application</button></div></form>`);
      const form=document.querySelector("[data-member-loan-form]");
      if(typeof bindLoanSecurityCalculator==="function")bindLoanSecurityCalculator(form,{borrowerSavings,candidates});
      bindMember();
    }catch(error){toast(error.message);}
  }
  function withdrawalForm(){modal("Request savings withdrawal",`<form class="form" data-member-withdrawal><div class="field"><label>Amount</label><input name="amount" type="number" min="10000" step="10000" required></div><div class="field"><label>Payment method</label><select name="method"><option>Mobile Money</option><option>Bank transfer</option><option>Cash</option></select></div><div class="field"><label>Reason</label><textarea name="reason" required></textarea></div><div class="form-actions"><button type="button" class="button secondary" data-close-modal>Cancel</button><button class="button primary">Submit request</button></div></form>`);bindMember();}
  function repayForm(loanId,settleFull=false){
    const loan=C().loans.find(x=>String(x.id)===String(loanId));if(!loan||!["active","overdue"].includes(loan.status))return;
    const totalDue=Number(loan.totalDue||loan.amount||0),totalPaid=Number(loan.totalPaid||0);
    const remainingContract=Math.max(0,totalDue-totalPaid);
    const remainingPrincipal=Math.max(0,Number(loan.balance||0));
    const firstMonthInterest=Math.max(0,Number(loan.firstMonthInterestRemaining||0));
    const earlySettlement=Math.max(0,Number(loan.earlySettlementAmount||remainingPrincipal+firstMonthInterest));
    const suggested=settleFull?earlySettlement:Number(loan.nextPaymentAmount||remainingContract);
    const maxAmount=settleFull?earlySettlement:remainingContract;
    const helpText=settleFull
      ?`Settlement: principal ${money(remainingPrincipal)} + first-month interest ${money(firstMonthInterest)}. Later months waived.`
      :`Remaining balance ${money(remainingContract)} of ${money(totalDue)} total.`;
    const amountHelp=settleFull?"":"Up to remaining balance.";
    modal(settleFull?"Pay loan in full":"Pay loan",`<form class="form" data-member-repay-form enctype="multipart/form-data" novalidate action="#" method="post">
      <input type="hidden" name="loanId" value="${loan.id}">
      <input type="hidden" name="settleFull" value="${settleFull?"1":"0"}">
      <input type="hidden" name="maxAmount" value="${Math.ceil(maxAmount)}">
      <div class="form-grid">
        <div class="field full"><label>Active loan</label><input value="${esc(loan.reference)} - ${esc(loan.product)}" disabled><small>${helpText}</small></div>
        <div class="field"><label>Amount (UGX)</label><input name="amount" type="number" min="1000" step="1000" value="${Math.round(suggested)}" max="${Math.ceil(maxAmount)}" required>${amountHelp?`<small>${amountHelp}</small>`:""}</div>
        <div class="field"><label>Payment method</label><select name="method" required><option>Mobile Money</option><option>Bank transfer</option><option>Cheque</option><option>Cash</option></select></div>
        <div class="field full"><label>Transaction reference</label><input name="externalReference" minlength="3" required placeholder="Payment reference from your slip or message"></div>
        <div class="field full"><label>Notes</label><textarea name="notes" placeholder="Optional note for Credits">${settleFull?"Early full settlement":""}</textarea></div>
        <div class="field full record-file-field"><label>Receipt photo or PDF</label><input name="receipt" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" required></div>
      </div>
      <div class="member-form-message" data-repay-message aria-live="polite"></div>
      <div class="form-actions">
        <button type="button" class="button secondary" data-close-modal>Cancel</button>
        <button type="button" class="button primary" data-repay-submit>${settleFull?"Send full settlement for verification":"Send for verification"}</button>
      </div>
    </form>`);
    const form=document.querySelector("[data-member-repay-form]");
    document.querySelectorAll("#modal-backdrop [data-close-modal], #modal-backdrop [data-close]").forEach(el=>{el.onclick=closeModal;});
    if(!form){toast("Payment form failed to open.");return;}
    form.addEventListener("submit",submitMemberRepayment);
    form.querySelector("[data-repay-submit]")?.addEventListener("click",()=>form.requestSubmit?form.requestSubmit():submitMemberRepayment({preventDefault(){},currentTarget:form,target:form}));
  }
  async function submitMemberRepayment(event){
    event.preventDefault();
    event.stopPropagation?.();
    const form=event.currentTarget||document.querySelector("[data-member-repay-form]");
    if(!form)return;
    const button=form.querySelector("[data-repay-submit], button[type=submit]");
    const message=form.querySelector("[data-repay-message]");
    const amount=form.elements.amount,reference=form.elements.externalReference,file=form.elements.receipt?.files?.[0];
    const settleFull=String(form.elements.settleFull?.value||"")==="1";
    const maxAmount=Number(form.elements.maxAmount?.value||0);
    const fail=text=>{if(message){message.className="member-form-message error";message.textContent=text;}else toast(text);};
    if(!amount?.value||Number(amount.value)<1000)return fail("Enter a payment amount of at least UGX 1,000.");
    if(maxAmount>0&&Number(amount.value)>maxAmount+0.005)return fail(settleFull?"Pay in full cannot exceed remaining principal plus first-month interest.":"Amount exceeds the remaining schedule balance.");
    if(!reference?.value?.trim()||reference.value.trim().length<3)return fail("Enter the payment transaction reference.");
    if(!file)return fail("Choose a receipt photo or PDF before sending.");
    if(file.size>15*1024*1024)return fail("The receipt is larger than 15 MB.");
    if(button)button.disabled=true;
    if(message){message.textContent="Uploading receipt and sending to Credits...";message.className="member-form-message sending";}
    try{
      const response=await fetch("/api/credits/repayments",{method:"POST",credentials:"same-origin",body:new FormData(form)});
      const raw=await response.text();
      let result={};try{result=raw?JSON.parse(raw):{};}catch{result={error:raw||"Unreadable server response"};}
      if(!response.ok)throw new Error(result.error||"Loan payment failed");
      closeModal();
      await reload(result.status==="pending"
        ?`${result.message||"Loan payment sent to the Credits Officer for approval."} Reference ${result.reference}.`
        :`Loan payment recorded. Receipt ${result.receiptNumber}. Remaining principal ${money(result.balance)}.`);
    }catch(error){
      if(button)button.disabled=false;
      fail(error.message||"Loan payment failed.");
    }
  }
  function depositForm(){
    const f=C()?.financialYearProgress,past=C()?.pastYearProgress,currentYear=f?new Date(f.endsOn).getUTCFullYear():new Date().getUTCFullYear(),pastYear=past?new Date(past.periodEnd).getUTCFullYear():currentYear-1;
    const balances=[];
    const add=(year,type,label,balance,force=false)=>{balance=Math.max(0,Number(balance||0));if(balance>0||force)balances.push({year,type,label,balance});};
    add(currentYear,"savings","Monthly savings / advance",f?Math.max(0,Number(f.expectedSavingsToDate)-Number(f.savingsTowardTarget??f.savingsPaid)):0,true);
    if(f){add(currentYear,"shares","Annual share contribution",Math.max(0,Number(f.annualShareTarget)-Number(f.sharePaidTowardTarget??f.sharePaid)));add(currentYear,"subscription","Annual subscription fee",Math.max(0,Number(f.annualSubscriptionFee)-Number(f.subscriptionPaid)));}
    if(past&&Number(past.variance)<0)add(pastYear,"savings","Past-year savings arrears",Math.abs(Number(past.variance)));
    const years=[...new Set(balances.map(x=>x.year))],yearLabel=year=>year===currentYear?(f?.fiscalYear||`FY ending ${year}`):(past?.fiscalYear||`FY ending ${year}`);
    const yearOptions=years.map(year=>`<option value="${year}">${esc(yearLabel(year))}${year===pastYear?" - arrears":" - current year"}</option>`).join("");
    const typeOptions=balances.map(x=>`<option value="${x.type}" data-year="${x.year}" data-balance="${x.balance}">${esc(x.label)} - ${x.balance>0?`balance ${money(x.balance)}`:"open for advance / surplus"}</option>`).join("");
    modal("Submit member contribution",`<form class="form" data-member-deposit enctype="multipart/form-data" novalidate><div class="form-grid">
      <div class="field full"><label>Financial year to pay</label><select name="fiscalYear" required data-deposit-year>${yearOptions}</select><small>Choose the year this payment should clear or advance.</small></div>
      <div class="field full"><label>Contribution type</label><select name="contributionType" required data-deposit-type>${typeOptions}</select><small data-deposit-balance>Savings can be paid even after the target is met.</small></div>
      <div class="field"><label>Amount (UGX)</label><input name="amount" type="number" min="1000" step="1000" required><small>Minimum payment: UGX 1,000. Savings above target become a surplus.</small></div>
      <div class="field"><label>Payment method</label><select name="method" required><option>Mobile Money</option><option>Bank transfer</option><option>Cheque</option><option>Cash</option></select></div>
      <div class="field full"><label>Transaction reference</label><input name="externalReference" minlength="3" required placeholder="Mobile money, bank, cheque or deposit-slip reference"><small>Enter the reference printed on the payment message or slip.</small></div>
      <div class="field full"><label>Notes</label><textarea name="notes" placeholder="Add details that will help Credits confirm the funds"></textarea></div>
      <div class="field full record-file-field"><label>Receipt photo or PDF</label><input name="receipt" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" required><small>Credits verifies the evidence before updating balances.</small></div>
    </div><div class="member-form-message" data-deposit-message aria-live="polite"></div><div class="form-actions"><button type="button" class="button secondary" data-close-modal>Cancel</button><button type="submit" class="button primary">Send for verification</button></div></form>`);
    bindMember();
    const year=document.querySelector("[data-deposit-year]"),type=document.querySelector("[data-deposit-type]"),amount=document.querySelector("[data-member-deposit] [name=amount]"),hint=document.querySelector("[data-deposit-balance]");
    const sync=()=>{if(!year||!type)return;let first=null;[...type.options].forEach(option=>{const show=option.dataset.year===year.value;option.hidden=!show;option.disabled=!show;if(show&&!first)first=option;});if(first){type.value=first.value;first.selected=true;}syncAmount();};
    const syncAmount=()=>{const option=type?.selectedOptions?.[0];if(!option)return;const balance=Number(option.dataset.balance||0);amount.placeholder=balance>0?`Balance due: ${money(balance)}`:"Enter amount to deposit";if(option.value==="shares"||option.value==="subscription")amount.max=String(Math.max(balance,1000));else amount.removeAttribute("max");if(hint)hint.textContent=balance>0?`Selected balance: ${money(balance)}. Credits will allocate the verified payment to ${yearLabel(Number(option.dataset.year))}.`:`No target balance due — this savings payment will be treated as advance or surplus for ${yearLabel(Number(option.dataset.year))}.`;};
    year?.addEventListener("change",sync);type?.addEventListener("change",syncAmount);sync();
  }
  function investmentForm(projectId){const project=S().opportunities.find(x=>String(x.id)===String(projectId));if(!project)return;modal("Invest in project",`<form class="form" data-member-investment enctype="multipart/form-data"><input type="hidden" name="projectId" value="${project.id}"><div class="form-grid"><div class="field full"><label>Project</label><input value="${esc(project.name)}" disabled><small>Minimum ${money(project.minimumInvestment)} - expected return ${Number(project.expectedReturnRate||0)}%</small></div><div class="field"><label>Amount (UGX)</label><input name="amount" type="number" min="${Number(project.minimumInvestment||1)}" step="1000" required></div><div class="field"><label>Payment method</label><select name="paymentMethod"><option>Mobile Money</option><option>Bank transfer</option><option>Cheque</option></select></div><div class="field full"><label>Transaction reference</label><input name="paymentReference" minlength="3" required></div><div class="field full"><label>Notes</label><textarea name="notes" placeholder="Optional instructions for Investment Department"></textarea></div><div class="field full record-file-field"><label>Payment receipt photo or PDF</label><input name="evidence" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" required><small>Investment reviews the application first; Finance then verifies the payment.</small></div></div>${memberSubmitActions("Send investment request")}</form>`);bindMember();}
  function welfareContributionForm(){modal("Make welfare contribution",`<form class="form" data-member-welfare-contribution enctype="multipart/form-data"><div class="form-grid"><div class="field"><label>Contribution type</label><select name="contributionType"><option>Monthly Welfare Contribution</option><option>Emergency Collection</option><option>Fundraising Contribution</option><option>One-time Contribution</option></select></div><div class="field"><label>Period</label><input name="period" type="month" value="${new Date().toISOString().slice(0,7)}"></div><div class="field"><label>Amount (UGX)</label><input name="amount" type="number" min="1000" step="1000" required></div><div class="field"><label>Payment method</label><select name="paymentMethod"><option>Mobile Money</option><option>Bank transfer</option><option>Cheque</option></select></div><div class="field full"><label>Transaction reference</label><input name="paymentReference" minlength="3" required></div><div class="field full record-file-field"><label>Payment receipt photo or PDF</label><input name="evidence" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" required><small>Your contribution total changes only after Finance verifies the money.</small></div></div>${memberSubmitActions("Send contribution for verification")}</form>`);bindMember();}
  function welfareRequestForm(){modal("Request welfare support",`<form class="form" data-member-welfare-request enctype="multipart/form-data"><div class="form-grid"><div class="field"><label>Support category</label><select name="category"><option>Funeral assistance</option><option>Marriage assistance</option><option>Accident assistance</option><option>Other assistance</option></select></div><div class="field"><label>Beneficiary relationship</label><select name="beneficiaryRelationship"><option value="self">Member (myself)</option><option value="spouse">Registered spouse</option><option value="parent">Registered biological parent</option><option value="guardian">Registered guardian</option><option value="child">Registered child</option></select></div><div class="field full"><label>Beneficiary name</label><input name="beneficiaryName" placeholder="Leave blank only when requesting for yourself"><small>Spouse, parent, guardian and child claims must match a family record registered by Legal in Bio Data.</small></div><div class="field"><label>Urgency</label><select name="urgency"><option>low</option><option>medium</option><option>high</option><option>critical</option></select></div><div class="field full"><label>Amount requested (UGX)</label><input name="amount" type="number" min="1" step="1000" required></div><div class="field full"><label>Explain the support needed</label><textarea name="description" minlength="10" required></textarea></div><div class="field full record-file-field"><label>Supporting document (optional)</label><input name="evidence" type="file" accept="image/jpeg,image/png,image/webp,application/pdf"><small>Attach a letter, police report, receipt or other evidence when available.</small></div></div>${memberSubmitActions("Submit welfare request")}</form>`);bindMember();}
  function memberSubmitActions(label){return `<div class="member-form-message" data-workflow-message aria-live="polite"></div><div class="form-actions"><button type="button" class="button secondary" data-close-modal>Cancel</button><button type="submit" class="button primary">${label}</button></div>`;}
  async function submitMultipart(event,url,success){event.preventDefault();const form=event.currentTarget,button=form.querySelector("button[type=submit]"),message=form.querySelector("[data-workflow-message]"),file=form.elements.evidence?.files?.[0];if(file&&file.size>15*1024*1024){message.textContent="The selected file exceeds 15 MB.";message.className="member-form-message error";return;}button.disabled=true;message.textContent="Uploading and creating your request...";message.className="member-form-message sending";try{const response=await fetch(url,{method:"POST",credentials:"same-origin",body:new FormData(form)}),raw=await response.text();let result={};try{result=raw?JSON.parse(raw):{};}catch{result={error:raw};}if(!response.ok)throw new Error(result.error||"Submission failed");closeModal();await reload(`${success} ${result.reference}.`);}catch(error){button.disabled=false;message.textContent=error.message;message.className="member-form-message error";}}
  function transactionDetails(id){const x=C().transactions.find(item=>String(item.id)===String(id));if(!x)return;const proof=x.hasEvidence?`<div class="deposit-proof">${/\.pdf$/i.test(x.evidenceName||"")?`<a class="button primary" href="/api/transactions/${x.id}/evidence" target="_blank">${icons.eye}View receipt PDF</a>`:`<img src="/api/transactions/${x.id}/evidence" alt="Deposit receipt evidence">`}<a class="button secondary" href="/api/transactions/${x.id}/evidence" target="_blank">Open original</a></div>`:`<div class="member-empty">No evidence attached.</div>`;modal("Deposit details",`<div class="transaction-detail-grid"><div><span>Submission</span><strong>${esc(x.reference)}</strong></div><div><span>Payment reference</span><strong>${esc(x.externalReference||"Not recorded")}</strong></div><div><span>Amount</span><strong>${money(x.amount)}</strong></div><div><span>Financial year paid</span><strong>${x.targetFiscalYear?`FY ending ${x.targetFiscalYear}`:"Assigned by transaction date"}</strong></div><div><span>Method</span><strong>${esc(x.method)}</strong></div><div><span>Status</span><strong>${esc(x.status)}</strong></div><div><span>Official receipt</span><strong>${esc(x.receiptNumber||"Pending verification")}</strong></div><div><span>Submitted</span><strong>${date(x.createdAt)}</strong></div><div><span>Verified</span><strong>${x.verifiedAt?date(x.verifiedAt):"Not yet"}</strong></div><div class="full"><span>Credits decision</span><strong>${esc(x.verificationComment||"Awaiting review")}</strong></div></div>${proof}`);}
  async function reload(message){
    if(state.memberOversight&&C()?.member?.id){
      state.memberCenter=await api(`/api/members/${C().member.id}/command-center`);
      state.memberSelfService=state.memberSelfService||{opportunities:[],applications:[]};
    }else{
      [state.memberCenter,state.memberSelfService]=await Promise.all([api("/api/member/command-center"),api("/api/member/self-service")]);
    }
    syncMemberPending();render();if(message)toast(message);
  }
  function syncMemberPending(){if(!C())return;const extra=C().welfare.contributions.filter(x=>["pending","pending_finance_review"].includes(x.status)).length;C().summary.pendingRequests+=extra;}
  function bindMember(){
    document.querySelectorAll("[data-member-page]").forEach(x=>x.onclick=async()=>{state.memberContext=true;state.page=x.dataset.memberPage;if(state.page==="messages"){state.messenger=null;window.render();await loadMessenger();}window.render();window.scrollTo(0,0);});
    document.querySelector("[data-member-back]")?.addEventListener("click",async()=>{
      if(state.memberOversight){
        state.memberOversight=false;state.memberContext=false;state.memberCenter=null;state.page="members";window.render();window.scrollTo(0,0);return;
      }
      const dept=availableWorkspaces().find(item=>item.type==="department"&&(item.primary||item.role===state.primaryRole||item.role===state.user?.role))
        ||availableWorkspaces().find(item=>item.type==="department");
      if(dept&&typeof enterWorkspace==="function"){await enterWorkspace(dept);return;}
      state.memberContext=false;state.page="dashboard";window.render();
    });
    document.querySelectorAll("[data-member-transaction]").forEach(x=>x.addEventListener("click",()=>transactionDetails(x.dataset.memberTransaction)));
    document.querySelectorAll("[data-close-modal]").forEach(x=>x.onclick=closeModal);
    if(!canActOnMember())return;
    document.querySelector("[data-member-action='apply-loan']")?.addEventListener("click",loanForm);
    document.querySelectorAll("[data-member-repay]").forEach(x=>x.addEventListener("click",()=>repayForm(x.dataset.memberRepay,x.dataset.settle==="1")));
    const memberLoanForm=document.querySelector("[data-member-loan-form]");
    if(memberLoanForm&&!memberLoanForm._loanSecurityState&&typeof bindLoanSecurityCalculator==="function"){
      const candidates=[...memberLoanForm.querySelectorAll("[name=guarantorIds]")].map(input=>({id:input.value,savings:Number(input.dataset.guarantorSavings||0)}));
      bindLoanSecurityCalculator(memberLoanForm,{borrowerSavings:Number(memberLoanForm.dataset.borrowerSavings||0),candidates});
    }
    const syncOtherLoan=()=>{const select=document.querySelector("[data-loan-product]"),box=document.querySelector("[data-other-loan-fields]"),input=document.querySelector("[name=customProductName]");if(!select||!box||!input)return;const option=select.selectedOptions?.[0];const isOther=/^other loan$/i.test(option?.dataset.productName||option?.textContent||"");box.hidden=!isOther;input.required=isOther;if(!isOther)input.value="";};
    document.querySelector("[data-loan-product]")?.addEventListener("change",syncOtherLoan);syncOtherLoan();
    document.querySelectorAll("[data-member-action='deposit']").forEach(x=>x.addEventListener("click",depositForm));
    document.querySelector("[data-member-action='withdraw']")?.addEventListener("click",withdrawalForm);
    document.querySelector("[data-member-action='welfare-contribution']")?.addEventListener("click",welfareContributionForm);
    document.querySelector("[data-member-action='welfare-request']")?.addEventListener("click",welfareRequestForm);
    document.querySelectorAll("[data-member-invest]").forEach(x=>x.addEventListener("click",()=>investmentForm(x.dataset.memberInvest)));
    document.querySelector("[data-member-loan-form]")?.addEventListener("submit",async e=>{
      e.preventDefault();
      const form=e.currentTarget,data=new FormData(form),message=form.querySelector("[data-loan-message]"),button=form.querySelector("button[type=submit]"),security=data.get("securityType"),guarantors=data.getAll("guarantorIds");
      const productOption=form.elements.productId?.selectedOptions?.[0];
      const isOther=/^other loan$/i.test(productOption?.dataset.productName||productOption?.textContent||"");
      if(data.get("borrowerDeclaration")!=="accepted"){message.textContent="You must read and accept the Kwagalana loan policy.";message.className="member-form-message error";return;}
      if(data.get("overdueDeclaration")!=="accepted"){message.textContent="Accept the overdue repayment declaration before submitting.";message.className="member-form-message error";return;}
      if(isOther&&!String(data.get("customProductName")||"").trim()){message.textContent="Type the loan product name for Other Loan.";message.className="member-form-message error";return;}
      if(security==="savings"||security==="savings_and_shares"){
        const amount=Number(data.get("amount")||0),borrowerSavings=Number(form.dataset.borrowerSavings||0);
        const estimate=window.LoanSecurity.estimate(amount,borrowerSavings,[...form.querySelectorAll("[name=guarantorIds]")].map(input=>Number(input.dataset.guarantorSavings||0)));
        const selectedCover=window.LoanSecurity.selectedCover([...form.querySelectorAll("[name=guarantorIds]:checked")].map(input=>Number(input.dataset.guarantorSavings||0)));
        if(estimate.remaining>0&&guarantors.length===0){message.textContent=`Choose guarantors to cover the remaining ${money(estimate.remaining)} after your 75% savings security.`;message.className="member-form-message error";return;}
        if(estimate.remaining>0&&selectedCover+0.005<estimate.remaining){message.textContent=`Selected guarantors cover ${money(selectedCover)}, but ${money(estimate.remaining)} is still needed.`;message.className="member-form-message error";return;}
      }
      if(security==="collateral"&&(!data.get("collateralDescription")||!data.get("collateralValue")||!data.get("collateralOwner")||!data.get("collateralOwnerPhone")||data.get("collateralOwnerConsent")!=="accepted")){message.textContent="Complete the collateral details, owner phone number and consent.";message.className="member-form-message error";return;}
      button.disabled=true;message.textContent="Checking the application and policy rules...";message.className="member-form-message sending";
      let result={};
      try{
        const response=await fetch("/api/loans",{method:"POST",credentials:"same-origin",body:data}),raw=await response.text();
        try{result=raw?JSON.parse(raw):{};}catch{}
        if(!response.ok)throw new Error(result.error||"Loan submission failed");
        closeModal();await reload(`Loan ${result.reference} submitted successfully.`);
      }catch(error){
        button.disabled=false;
        const eligibility=loanEligibilityFromError(error.message);
        if(eligibility){
          closeModal();
          showLoanEligibilityCard({...eligibility,remaining:Number(result.remainingToCompleteTarget||eligibility.remaining||0),fiscalYear:result.fiscalYear||eligibility.fiscalYear,expected:Number(result.remainingToCompleteTarget||eligibility.remaining||0)+Number(C()?.financialYearProgress?.savingsPaid||C()?.pastYearProgress?.totalPaid||0),paid:Number(C()?.financialYearProgress?.savingsPaid||C()?.pastYearProgress?.totalPaid||0)});
          return;
        }
        message.textContent=error.message;message.className="member-form-message error";
      }
    });
    document.querySelector("[data-member-withdrawal]")?.addEventListener("submit",async e=>{e.preventDefault();try{const result=await api("/api/withdrawals",{method:"POST",body:JSON.stringify(Object.fromEntries(new FormData(e.currentTarget)))});closeModal();await reload(`Withdrawal ${result.reference} submitted.`);}catch(error){toast(error.message);}});
    document.querySelector("[data-member-deposit]")?.addEventListener("submit",submitMemberDeposit);
    document.querySelector("[data-member-repay-form]")?.addEventListener("submit",submitMemberRepayment);
    document.querySelector("[data-member-investment]")?.addEventListener("submit",e=>submitMultipart(e,"/api/member/investments","Investment request submitted:"));
    document.querySelector("[data-member-welfare-contribution]")?.addEventListener("submit",e=>submitMultipart(e,"/api/member/welfare/contributions","Welfare contribution submitted:"));
    document.querySelector("[data-member-welfare-request]")?.addEventListener("submit",e=>submitMultipart(e,"/api/member/welfare/requests","Welfare request submitted:"));
    document.querySelectorAll("[data-member-read]").forEach(x=>x.addEventListener("click",async()=>{await api(`/api/member/notifications/${x.dataset.memberRead}/read`,{method:"PATCH"});await reload();}));
    document.querySelector("[data-member-read-all]")?.addEventListener("click",async()=>{await api("/api/member/notifications/read-all",{method:"POST"});await reload("Notifications marked as read.");});
    document.querySelectorAll("[data-member-guarantee]").forEach(x=>x.onclick=async()=>{
      let note="";
      if(x.dataset.response==="accept"){
        if(!await confirmDialog("Accept this guarantee request?"))return;
      }else{
        note=await promptDialog("Reason for rejecting:","");
        if(note===null)return;
        if(!String(note).trim())return toast("A rejection reason is required.");
      }
      try{await api(`/api/loans/${x.dataset.memberGuarantee}/guarantor-response`,{method:"POST",body:JSON.stringify({decision:x.dataset.response,note})});await reload("Guarantor response recorded.");}catch(error){toast(error.message);}
    });
    document.querySelector("[data-member-support]")?.addEventListener("submit",async e=>{e.preventDefault();try{const result=await api("/api/member/support",{method:"POST",body:JSON.stringify(Object.fromEntries(new FormData(e.currentTarget)))});await reload(`Support request ${result.reference} submitted.`);}catch(error){toast(error.message);}});
  }
  async function submitMemberDeposit(event){
    event.preventDefault();const form=event.currentTarget,message=form.querySelector("[data-deposit-message]"),button=form.querySelector("button[type=submit]"),amount=form.elements.amount,reference=form.elements.externalReference,file=form.elements.receipt.files[0];
    const fail=(text,field)=>{message.className="member-form-message error";message.textContent=text;if(field){field.focus();field.scrollIntoView({behavior:"smooth",block:"center"});}};
    if(!amount.value||Number(amount.value)<1000)return fail("Enter a deposit amount of at least UGX 1,000.",amount);
    if(!reference.value.trim()||reference.value.trim().length<3)return fail("Enter the payment transaction reference from your message or deposit slip.",reference);
    if(!file)return fail("Choose a receipt photo or PDF before sending.",form.elements.receipt);
    if(file.size>15*1024*1024)return fail("The receipt is larger than 15 MB. Choose a smaller photo or PDF.",form.elements.receipt);
    message.className="member-form-message sending";message.textContent="Uploading receipt and creating the pending deposit...";button.disabled=true;button.textContent="Sending...";
    try{
      const url=state.memberOversight&&C()?.member?.id?`/api/members/${C().member.id}/deposits`:"/api/member/deposits";
      const response=await fetch(url,{method:"POST",credentials:"same-origin",body:new FormData(form)}),raw=await response.text();let result={};try{result=raw?JSON.parse(raw):{};}catch{result={error:raw||"The server returned an unreadable response"};}
      if(!response.ok)throw new Error(result.error||`Deposit submission failed (${response.status})`);
      closeModal();await reload(`Deposit ${result.reference} sent to Credits for verification.`);
    }catch(error){button.disabled=false;button.textContent="Send for verification";fail(error.message||"Deposit submission failed. Please try again.");}
  }
  function bindAccount(){
    document.querySelector("[data-account-profile]")?.addEventListener("submit",async e=>{e.preventDefault();try{await api("/api/account/profile",{method:"PATCH",body:JSON.stringify(Object.fromEntries(new FormData(e.currentTarget)))});await refreshData();render();toast("Profile information updated throughout the system.");}catch(error){toast(error.message);}});
    document.querySelector("[data-account-photo]")?.addEventListener("submit",async e=>{e.preventDefault();try{const response=await fetch("/api/account/profile-photo",{method:"POST",credentials:"same-origin",body:new FormData(e.currentTarget)}),data=await response.json();if(!response.ok)throw new Error(data.error);state.user.has_profile_photo=true;state.profilePhotoVersion=Date.now();render();toast("Profile picture updated throughout the system.");}catch(error){toast(error.message);}});
    document.querySelector("[data-remove-photo]")?.addEventListener("click",async()=>{try{await api("/api/account/profile-photo",{method:"DELETE"});state.user.has_profile_photo=false;state.profilePhotoVersion=Date.now();render();toast("Profile picture removed throughout the system.");}catch(error){toast(error.message);}});
    document.querySelector("[data-account-password]")?.addEventListener("submit",async e=>{e.preventDefault();try{await api("/api/auth/change-password",{method:"POST",body:JSON.stringify(Object.fromEntries(new FormData(e.currentTarget)))});state.user=null;loginView();toast("Password changed. Sign in again.");}catch(error){toast(error.message);}});
  }
  document.addEventListener("click",async event=>{
    const trigger=event.target.closest?.(".member-context-link");if(!trigger)return;
    event.preventDefault();event.stopImmediatePropagation();
    try{
      const memberWorkspace=findWorkspace("member");
      if(memberWorkspace){await enterWorkspace(memberWorkspace);return;}
      if(!state.memberCenter){[state.memberCenter,state.memberSelfService]=await Promise.all([api("/api/member/command-center"),api("/api/member/self-service")]);syncMemberPending();}
      state.memberContext=true;state.page="member-dashboard";window.render();window.scrollTo(0,0);
    }
    catch(error){toast(error.message||"Could not open your linked member account.");}
  },true);
  rolePages.Member=pages;
  const oldRefresh=refreshData;refreshData=async function(){await oldRefresh();if(linked()){state.memberSelfService=await api("/api/member/self-service");syncMemberPending();}if(linked()&&state.role==="Member"&&!pages.includes(state.page))state.page="member-dashboard";};
  const oldSidebar=window.sidebar;window.sidebar=function(){
    if(inMemberSpace()){
      let html=sidebar();
      if(typeof injectWorkspaceSwitcher==="function")html=injectWorkspaceSwitcher(html);
      return html;
    }
    let html=oldSidebar();
    if(linked()&&state.role!=="Member"&&!state.memberOversight&&!workspaceNeedsPicker())html=html.replace("</nav>",`<button class="nav-item member-context-link" data-member-page="member-dashboard">${icons.users}<span>My Member Account</span></button></nav>`);
    return html;
  };
  const oldView=window.view;window.view=function(){if(inMemberSpace())return view();const output=oldView();return state.page==="settings"?`${accountSettings()}${output}`:output;};
  const oldSubtitle=window.subtitle;window.subtitle=function(){return pages.includes(state.page)?(state.memberOversight?"Read-only view of this member's account records.":"Only your own membership, financial and support records are shown."):oldSubtitle();};
  const oldRender=window.render;window.render=function(){oldRender();if(pages.includes(state.page)&&state.memberCenter){const eyebrow=document.querySelector(".page-head .eyebrow"),heading=document.querySelector(".page-head h1");if(eyebrow)eyebrow.textContent=state.memberOversight?"Member oversight":"Member Account";if(heading)heading.textContent=labels[state.page];const search=document.getElementById("global-search");if(search)search.placeholder="Search statements, loans and documents...";}};
  const oldBind=window.bind;window.bind=function(){oldBind();bindMember();if(!readOnlyMember())bindAccount();};
  window.MemberPortal={pages,accountSettings,syncMemberPending};
})();




