/* Supervisory workspace: a simple oversight view of the Kwagalana group and the follow-up of decisions, complaints and recommendations. */
(() => {
  const D=window.DepartmentUi;
  if(!D) return;
  const {esc,date,badge,risk,panel,empty,table,options,modal,reload,download}=D;
  if(!document.querySelector('link[href*="supervisory-styles.css"]')){const link=document.createElement("link");link.rel="stylesheet";link.href="/supervisory-styles.css?v=43";document.head.appendChild(link);}
  const role="Supervisory Officer",key="supervisory";
  const config={
    key,title:"Supervisory Department",dashboardTitle:"",
    pages:["dashboard","supervisory-group","supervisory-resolutions","supervisory-complaints","supervisory-recommendations",
      "supervisory-documents","supervisory-notifications","messages","settings","supervisory-search"],
    sidebarPages:["dashboard","supervisory-group","supervisory-resolutions","supervisory-complaints","supervisory-recommendations",
      "supervisory-documents","supervisory-notifications","messages","settings"],
    labels:{dashboard:"Dashboard",messages:"Messages","supervisory-group":"Group Health","supervisory-resolutions":"Resolutions",
      "supervisory-complaints":"Complaints","supervisory-recommendations":"Recommendations",
      "supervisory-documents":"Documents","supervisory-notifications":"Notifications",settings:"Settings"},
    icons:{"supervisory-group":"users","supervisory-resolutions":"approvals","supervisory-complaints":"messages",
      "supervisory-recommendations":"check","supervisory-documents":"file","supervisory-notifications":"bell"}
  };
  D.configs[role]=config;
  rolePages[role]=config.pages;
  Object.assign(pageMeta,{
    "supervisory-group":["Kwagalana oversight","Group Health"],
    "supervisory-resolutions":["Meeting decisions","Resolutions"],
    "supervisory-complaints":["Member concerns","Complaints"],
    "supervisory-recommendations":["Corrective action","Recommendations"],
    "supervisory-documents":["Supervisory evidence","Documents"],
    "supervisory-notifications":["What needs attention","Notifications"],
    "supervisory-search":["Organization oversight","Search results"]
  });

  const S=()=>state.supervisory;
  const G=()=>S()?.group||{};
  const pct=value=>`${Number(value||0).toFixed(Number(value)%1?1:0)}%`;
  const formEnd=label=>`<div class="form-actions"><button type="button" class="button secondary" data-close-modal>Cancel</button><button type="submit" class="button primary">${label}</button></div>`;
  const departments=()=>`<option value="">Whole group</option>${options(S().departments)}`;
  const statusTone=status=>["overdue","at_risk","escalated"].includes(status)?"risk-high":"";
  const isOpen=(status,done)=>!done.includes(status);
  function progress(value,tone=""){return `<div class="sup-progress ${tone}"><i><u style="width:${Math.max(0,Math.min(100,Number(value||0)))}%"></u></i><b>${pct(value)}</b></div>`;}
  function card(label,value,note,target,tone=""){
    return `<button class="sup-card ${tone}" data-dept-target="${target}"><small>${label}</small><strong>${value}</strong><em>${note}</em></button>`;
  }
  function openCounts(){
    const s=S();
    return {
      resolutions:s.resolutions.filter(x=>isOpen(x.status,["implemented","closed"])).length,
      complaints:s.complaints.filter(x=>isOpen(x.status,["resolved","closed"])).length,
      recommendations:s.recommendations.filter(x=>isOpen(x.status,["implemented","closed"])).length
    };
  }
  function alerts(){
    const g=G(),s=S(),open=openCounts(),list=[];
    if(g.behind?.length)list.push({level:"warning",title:`${g.behind.length} member${g.behind.length===1?" is":"s are"} behind on savings for ${g.monthLabel||"this month"}`,target:"supervisory-group"});
    if(g.overdueLoans)list.push({level:"danger",title:`${g.overdueLoans} loan${g.overdueLoans===1?" is":"s are"} overdue`,target:"supervisory-group"});
    const lateResolutions=s.resolutions.filter(x=>isOpen(x.status,["implemented","closed"])&&x.dueDate&&new Date(x.dueDate)<new Date()).length;
    if(lateResolutions)list.push({level:"danger",title:`${lateResolutions} resolution${lateResolutions===1?" is":"s are"} past the due date`,target:"supervisory-resolutions"});
    if(open.complaints)list.push({level:"info",title:`${open.complaints} complaint${open.complaints===1?"":"s"} still open`,target:"supervisory-complaints"});
    if(open.recommendations)list.push({level:"info",title:`${open.recommendations} recommendation${open.recommendations===1?"":"s"} not yet implemented`,target:"supervisory-recommendations"});
    return list;
  }
  const alertList=list=>`<div class="dept-notification-list">${list.map(x=>`<button data-dept-target="${x.target}"><span class="${x.level}">${icons[x.level==="info"?"info":"bell"]}</span><div><strong>${esc(x.title)}</strong></div></button>`).join("")||empty("Nothing needs attention right now.")}</div>`;
  const behindTable=rows=>rows.length?table(["Member"],rows.map(x=>`<tr><td><strong>${esc(x.name)}</strong></td></tr>`).join("")):empty("Every active member is up to date.");

  D.dashboards.supervisory=()=>{
    const s=S();
    if(!s||!s.stats)return `<div class="executive-loading">Loading Supervisory workspace…</div>`;
    const g=G(),open=openCounts();
    const cards=[
      card("Active members",g.activeMembers||0,"On the member roll","supervisory-group"),
      card(`Up to date for ${String(g.monthLabel||"this month").split(" ")[0]}`,`${g.upToDate||0} / ${g.activeMembers||0}`,"Members current on savings","supervisory-group","good"),
      card("Behind on savings",(g.behind||[]).length,"Members short this month","supervisory-group",(g.behind||[]).length?"warn":""),
      card("Overdue loans",g.overdueLoans||0,"Need follow-up","supervisory-group",g.overdueLoans?"warn":""),
      card("Open resolutions",open.resolutions,"AGM and Executive decisions","supervisory-resolutions"),
      card("Open complaints",open.complaints,"Member concerns still open","supervisory-complaints"),
      card("Open recommendations",open.recommendations,"Not yet implemented","supervisory-recommendations")
    ];
    const oversight=`<div class="sup-open-grid">
      <button data-dept-target="supervisory-resolutions"><strong>${open.resolutions}</strong><span>Open resolutions</span></button>
      <button data-dept-target="supervisory-complaints"><strong>${open.complaints}</strong><span>Open complaints</span></button>
      <button data-dept-target="supervisory-recommendations"><strong>${open.recommendations}</strong><span>Open recommendations</span></button></div>`;
    return `${D.dashboardGreeting()}<div class="supervisory-command"><div class="sup-cards">${cards.join("")}</div>
      <div class="sup-two-col">${panel(`Members behind for ${esc(g.monthLabel||"this month")}`,"Who still needs to catch up",behindTable((g.behind||[]).slice(0,12)))}
      ${panel("Follow-up at a glance","Decisions, complaints and recommendations still open",oversight+alertList(alerts()))}</div></div>`;
  };
  D.subtitles.supervisory=()=>"";

  D.views["supervisory-group"]=()=>{
    const g=G();
    const loans=(g.overdueLoanList||[]).length
      ?table(["Loan","Member","Overdue since"],g.overdueLoanList.map(x=>`<tr><td><strong>${esc(x.reference)}</strong></td><td>${esc(x.member)}</td><td>${date(x.dueSince)}</td></tr>`).join(""))
      :empty("No overdue loans.");
    return `<div class="dept-page"><div class="sup-cards">
      ${card("Up to date",`${g.upToDate||0} / ${g.activeMembers||0}`,"Members current on savings","supervisory-group","good")}
      ${card("Behind on savings",(g.behind||[]).length,`For ${esc(g.monthLabel||"this month")}`,"supervisory-group",(g.behind||[]).length?"warn":"")}
      ${card("Overdue loans",g.overdueLoans||0,"Need follow-up","supervisory-group",g.overdueLoans?"warn":"")}
      ${card("Loans waiting",g.loansWaiting||0,"Applications in progress","supervisory-group")}</div>
      <div class="sup-two-col">${panel("Savings: members behind","Who still needs to catch up",behindTable(g.behind||[]))}
      ${panel("Loans: overdue","Loans with missed repayments",loans)}</div></div>`;
  };
  D.views["supervisory-resolutions"]=()=>panel("Meeting resolutions","Each decision, who is responsible, the deadline and progress",table(["Resolution","Meeting","Responsible","Due","Progress","Status","Update"],S().resolutions.map(x=>`<tr><td class="wide-cell"><strong>${esc(x.resolutionNumber)}</strong><small>${esc(x.title)}</small></td><td>${date(x.meetingDate)}</td><td>${esc(x.responsibleOfficer)}<small>${esc(x.department||"Whole group")}</small></td><td>${date(x.dueDate)}</td><td>${progress(x.completionPercentage)}</td><td>${badge(x.status,statusTone(x.status))}</td><td><button class="mini-btn" data-sup-resolution="${x.id}">${icons.refresh}</button></td></tr>`).join("")));
  D.views["supervisory-complaints"]=()=>panel("Member complaints","Concerns raised by members about the group, its leaders or departments",table(["Complaint","Category","About","Description","Handled by","Status","Update"],S().complaints.map(x=>`<tr><td><strong>${esc(x.complaintNumber)}</strong></td><td>${esc(x.category)}</td><td>${esc(x.department||x.subjectType)}</td><td class="wide-cell">${esc(x.description)}${x.finding?`<small>Finding: ${esc(x.finding)}</small>`:""}</td><td>${esc(x.assignedSupervisor)}</td><td>${badge(x.status,statusTone(x.status))}</td><td><button class="mini-btn" data-sup-complaint="${x.id}">${icons.refresh}</button></td></tr>`).join("")));
  D.views["supervisory-recommendations"]=()=>panel("Recommendations","What Supervisory asked a department to fix, and whether it was done",table(["Recommendation","Department","Action required","Responsible / due","Response","Progress","Status","Update"],S().recommendations.map(x=>`<tr><td><strong>${esc(x.recommendationNumber)}</strong></td><td>${esc(x.department||"Whole group")}</td><td class="wide-cell">${esc(x.description)}</td><td>${esc(x.responsibleOfficer)}<small>${date(x.dueDate)}</small></td><td class="wide-cell">${esc(x.departmentResponse||"Awaiting response")}</td><td>${progress(x.implementationProgress)}</td><td>${badge(x.status,statusTone(x.status))}</td><td><button class="mini-btn" data-sup-recommendation="${x.id}">${icons.refresh}</button></td></tr>`).join("")));
  D.views["supervisory-documents"]=()=>panel("Documents","Minutes, policies, annual reports and Supervisory evidence",table(["Reference","Document","Type","Updated","Open"],S().documents.map(x=>`<tr><td><strong>${esc(x.reference)}</strong></td><td>${esc(x.title)}</td><td>${esc(x.documentType)}</td><td>${date(x.updatedAt,true)}</td><td>${x.hasFile?`<div class="document-actions"><a class="mini-btn" href="/api/documents/${x.id}/view" target="_blank">${icons.eye}</a><a class="mini-btn" href="/api/documents/${x.id}/download">${icons.download}</a></div>`:`<span class="status pending">No file</span>`}</td></tr>`).join("")));
  D.views["supervisory-notifications"]=()=>panel("What needs attention","Generated from live group figures and open follow-ups",alertList(alerts()));
  D.views["supervisory-search"]=()=>panel("Search results",`${(state.supervisorySearchResults||[]).length} records found`,table(["Type","Reference","Record","Detail"],(state.supervisorySearchResults||[]).map(x=>`<tr><td>${badge(x.type)}</td><td><strong>${esc(x.reference)}</strong></td><td>${esc(x.title)}</td><td>${esc(x.detail)}</td></tr>`).join("")));
  D.settings.supervisory=()=>panel("Supervisory settings","Resolutions, complaints and recommendations",`<p class="page-subtitle">Use Resolutions for AGM and Executive decisions, Complaints for member concerns, and Recommendations to follow work until it is done.</p>`);

  D.actions.supervisory=()=>{
    const map={"supervisory-resolutions":["resolution","Add resolution"],"supervisory-complaints":["complaint","Register complaint"],
      "supervisory-recommendations":["recommendation","Issue recommendation"]},item=map[state.page];
    return item?`<div class="head-actions"><button class="button primary" data-dept-modal="${item[0]}">${icons.plus}${item[1]}</button></div>`:"";
  };
  D.actions.supervisoryReport=name=>{
    const s=S(),rows=name.includes("Resolution")?s.resolutions:name.includes("Complaint")?s.complaints:s.recommendations;
    download(name,rows);
  };

  function formModal(type){
    if(type==="menu") return modal("Supervisory quick actions","Record a decision, a complaint or a recommendation",`<div class="dept-quick-grid"><button data-supervisory-quick="resolution">${icons.approvals}<b>Add resolution</b></button><button data-supervisory-quick="complaint">${icons.messages}<b>Complaint</b></button><button data-supervisory-quick="recommendation">${icons.check}<b>Recommendation</b></button></div>`);
    const forms={
      resolution:["Add meeting resolution","Who is responsible and by when",`<form class="form" data-sup-form="resolution"><div class="form-grid"><div class="field full"><label>Resolution</label><input name="title" required></div><div class="field"><label>Meeting date</label><input name="meetingDate" type="date" required></div><div class="field"><label>Department</label><select name="departmentId">${departments()}</select></div><div class="field"><label>Responsible person</label><input name="responsibleOfficer" required></div><div class="field"><label>Due date</label><input name="dueDate" type="date" required></div><div class="field"><label>Priority</label><select name="priority"><option>low</option><option selected>medium</option><option>high</option><option>critical</option></select></div><div class="field full"><label>Notes</label><textarea name="evidence"></textarea></div></div>${formEnd("Save resolution")}</form>`],
      complaint:["Register complaint","A member concern to follow up",`<form class="form" data-sup-form="complaint"><div class="form-grid"><div class="field"><label>Category</label><input name="category" placeholder="e.g. Loans, Savings, Welfare" required></div><div class="field"><label>About</label><select name="subjectType"><option>department</option><option>leader</option><option>committee</option><option>official</option><option>activity</option></select></div><div class="field"><label>Department</label><select name="departmentId">${departments()}</select></div><div class="field"><label>Handled by</label><input name="assignedSupervisor" required></div><div class="field full"><label>Description</label><textarea name="description" required></textarea></div><div class="field full"><label>Evidence</label><textarea name="evidence"></textarea></div><label class="check-row"><input name="escalated" type="checkbox"> Urgent</label></div>${formEnd("Register complaint")}</form>`],
      recommendation:["Issue recommendation","Ask a department to fix something",`<form class="form" data-sup-form="recommendation"><div class="form-grid"><div class="field"><label>Comes from</label><select name="sourceType"><option value="complaint">Complaint</option><option value="resolution">Resolution</option><option value="assessment">Group health check</option></select></div><div class="field"><label>Reference</label><input name="sourceReference"></div><div class="field"><label>Department</label><select name="departmentId">${departments()}</select></div><div class="field"><label>Responsible person</label><input name="responsibleOfficer" required></div><div class="field"><label>Due date</label><input name="dueDate" type="date" required></div><div class="field full"><label>Recommendation</label><textarea name="description" required></textarea></div></div>${formEnd("Issue recommendation")}</form>`]
    },item=forms[type];
    if(!item)return;
    modal(item[0],item[1],item[2]);
    document.querySelector("[data-sup-form]")?.addEventListener("submit",async event=>{
      event.preventDefault();
      const form=event.currentTarget,data=Object.fromEntries(new FormData(form));
      if(data.departmentId)data.departmentId=Number(data.departmentId);else delete data.departmentId;
      data.escalated=data.escalated==="on";
      const endpoint={resolution:"resolutions",complaint:"complaints",recommendation:"recommendations"}[form.dataset.supForm];
      try{await api(`/api/supervisory/${endpoint}`,{method:"POST",body:JSON.stringify(data)});closeModal();await reload("Supervisory record saved.");}catch(error){toast(error.message);}
    });
  }
  D.quick.supervisory=formModal;

  async function statusUpdate(type,id,currentStatus,currentProgress){
    const valid={
      resolution:"pending, in_progress, at_risk, overdue, implemented, closed",
      complaint:"received, review, investigation, follow_up, escalated, resolved, closed",
      recommendation:"issued, accepted, in_progress, overdue, implemented, closed"
    };
    const status=prompt(`Status (${valid[type]})`,currentStatus);if(!status)return;
    const progress=Number(prompt("Progress (0-100)",String(currentProgress||0)));if(!Number.isFinite(progress))return;
    const body={status,progress,actualProgress:progress,comment:prompt("Comment","")||""};
    if(type==="complaint"){body.finding=body.comment;body.recommendation=prompt("Recommendation","")||"";body.escalated=status==="escalated";}
    if(type==="recommendation"){body.response=body.comment;body.evidence=prompt("Evidence reference","")||"";}
    try{await api(`/api/supervisory/${type}s/${id}/status`,{method:"POST",body:JSON.stringify(body)});await reload("Supervisory status updated.");}catch(error){toast(error.message);}
  }
  D.binders.push(cfg=>{
    if(cfg.key!=="supervisory")return;
    document.querySelectorAll("[data-sup-resolution]").forEach(x=>x.addEventListener("click",()=>{const r=S().resolutions.find(v=>String(v.id)===x.dataset.supResolution);statusUpdate("resolution",x.dataset.supResolution,r?.status,r?.completionPercentage);}));
    document.querySelectorAll("[data-sup-complaint]").forEach(x=>x.addEventListener("click",()=>{const r=S().complaints.find(v=>String(v.id)===x.dataset.supComplaint);statusUpdate("complaint",x.dataset.supComplaint,r?.status,r?.investigationProgress);}));
    document.querySelectorAll("[data-sup-recommendation]").forEach(x=>x.addEventListener("click",()=>{const r=S().recommendations.find(v=>String(v.id)===x.dataset.supRecommendation);statusUpdate("recommendation",x.dataset.supRecommendation,r?.status,r?.implementationProgress);}));
  });
})();
