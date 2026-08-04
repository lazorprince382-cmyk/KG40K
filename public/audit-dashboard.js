/* Audit command center dashboard. */
(() => {
  const D=window.DepartmentUi,{esc,date,badge,risk,panel,empty}=D;
  const data=()=>state.auditCenter;
  function stat(label,value,iconName,tone,note,target){return `<button class="audit-stat ${tone}" data-dept-target="${target}"><span class="audit-stat-icon">${icons[iconName]}</span><span><small>${label}</small><strong>${value}</strong><em>${note}</em></span></button>`;}
  function overview(a){
    const stages=[["Scheduled",a.plans.filter(x=>["planned","scheduled"].includes(x.status)).length,"blue"],["In progress",a.plans.filter(x=>x.status==="in_progress").length,"orange"],["Completed",a.plans.filter(x=>x.status==="completed").length,"green"],["Overdue",a.plans.filter(x=>x.status==="overdue").length,"red"]];
    return panel("Audit overview","Engagement coverage and current schedule",`<div class="audit-stage-grid">${stages.map(x=>`<button data-dept-target="audits"><span class="${x[2]}">${icons.audit}</span><strong>${x[1]}</strong><small>${x[0]}</small></button>`).join("")}</div><div class="audit-mini-list">${a.plans.slice(0,4).map(x=>`<div><span>${risk(x.status==="overdue"?"high":"low")}</span><p><strong>${esc(x.auditNumber)}  -  ${esc(x.auditType)}</strong><small>${esc(x.department||"Organization-wide")}  -  ${date(x.plannedDate)}</small></p></div>`).join("")||empty("No audit plans yet.")}</div>`,"audit-overview");
  }
  function findings(a){
    return panel("Priority audit findings","Highest-risk exceptions requiring response",`<div class="audit-finding-list">${a.findings.slice(0,5).map(x=>`<article><div><strong>${esc(x.findingNumber)}</strong>${risk(x.riskLevel)}${x.repeatFinding?badge("Repeat","risk-high"):""}</div><h4>${esc(x.description)}</h4><p>${esc(x.department||"Organization")}  -  Due ${date(x.dueDate)}</p><div class="audit-row-foot">${badge(x.status)}<button data-dept-target="audit-findings">Review evidence ></button></div></article>`).join("")||empty("No audit findings recorded.")}</div>`,"audit-findings-widget");
  }
  function compliance(a){
    return panel("Compliance monitoring",`${a.stats.complianceScore}% organization assurance score`,`<div class="audit-gauge" style="--score:${a.stats.complianceScore}"><div><strong>${a.stats.complianceScore}%</strong><span>Compliance</span></div></div><div class="compliance-bars">${a.compliance.map(x=>`<button data-dept-target="audit-compliance"><span><b>${esc(x.department)}</b><em>${x.complianceScore}%</em></span><i><u style="width:${x.complianceScore}%"></u></i></button>`).join("")}</div>`,"audit-compliance-widget");
  }
  function investigations(a){
    return panel("Investigation tracker","Independent review of suspected control failures",`<div class="audit-investigation-list">${a.investigations.slice(0,4).map(x=>`<article><span class="audit-priority ${esc(x.priority)}">${icons.search}</span><div><strong>${esc(x.investigationNumber)}  -  ${esc(x.caseDescription)}</strong><p>${esc(x.departmentsInvolved)}  -  Lead: ${esc(x.leadAuditor)}</p></div>${badge(x.status,x.priority==="critical"?"risk-critical":"")}</article>`).join("")||empty("No investigations are open.")}</div><button class="dept-link" data-dept-target="audit-investigations">Open investigation register ></button>`,"audit-investigations-widget");
  }
  function recommendations(a){
    const open=a.recommendations.filter(x=>!["implemented","closed"].includes(x.status)),overdue=open.filter(x=>x.dueDate&&new Date(x.dueDate)<new Date());
    return panel("Recommendation tracker","Implementation and independent follow-up",`<div class="audit-rec-kpis"><div><strong>${a.recommendations.length}</strong><span>Issued</span></div><div><strong>${a.stats.closedRecommendations}</strong><span>Implemented</span></div><div class="danger"><strong>${overdue.length}</strong><span>Overdue</span></div></div><div class="audit-progress"><span><b>Completion rate</b><em>${a.analytics.recommendationRate}%</em></span><i><u style="width:${a.analytics.recommendationRate}%"></u></i></div><button class="dept-link" data-dept-target="audit-recommendations">Track all recommendations ></button>`,"audit-recommendations-widget");
  }
  function riskWidget(a){
    const counts=Object.fromEntries(a.analytics.riskDistribution.map(x=>[x.label,x.value]));
    return panel("Risk dashboard","Exposure, repeat findings and fraud signals",`<div class="risk-quadrants">${["critical","high","medium","low"].map(level=>`<button class="${level}" data-dept-target="audit-risk"><strong>${counts[level]||0}</strong><span>${level} risks</span></button>`).join("")}</div><div class="audit-risk-summary"><span>${icons.bell}<b>${a.stats.fraudAlerts}</b> uncleared fraud alerts</span><span>${icons.refresh}<b>${a.findings.filter(x=>x.repeatFinding).length}</b> repeat findings</span></div>`,"audit-risk-widget");
  }
  function calendar(a){
    return panel("Audit calendar","Plans, deadlines and follow-up reviews",`<div class="dept-calendar-list">${a.calendar.slice(0,6).map(x=>`<button data-dept-target="${esc(x.target)}"><time><b>${new Date(x.date).getDate()}</b><span>${new Date(x.date).toLocaleString("en",{month:"short"})}</span></time><div><strong>${esc(x.type)}  -  ${esc(x.reference)}</strong><p>${esc(x.title)}</p></div>${risk(x.risk)}</button>`).join("")||empty("No assurance dates are scheduled.")}</div>`,"audit-calendar-widget");
  }
  function notifications(a){
    return panel("Audit alerts","Risk and assurance updates",`<div class="dept-notification-list">${a.notifications.map(x=>`<button data-dept-target="${esc(x.target)}"><span class="${esc(x.level)}">${icons[x.level==="success"?"check":x.level==="info"?"info":"bell"]}</span><div><strong>${esc(x.title)}</strong><small>${esc(relativeTime(x.createdAt||x.time))}</small></div></button>`).join("")}</div>`,"audit-notifications-widget");
  }
  D.dashboards.audit=()=>{
    const a=data(),s=a.stats,cards=[
      ["Total Audits Conducted",s.totalAuditsConducted,"audit","blue","Completed engagements","audits"],
      ["Audits in Progress",s.auditsInProgress,"clock","teal","Evidence review active","audits"],
      ["Pending Audits",s.pendingAudits,"clock","orange","Planned or scheduled","audit-plans"],
      ["Audit Findings",s.auditFindings,"file","red","Open exceptions","audit-findings"],
      ["Resolved Findings",s.resolvedFindings,"check","green","Verified resolution","audit-findings"],
      ["High-Risk Findings",s.highRiskFindings,"bell","red","High or critical","audit-findings"],
      ["Departments Audited",s.departmentsAudited,"building","violet","Coverage achieved","audits"],
      ["Compliance Score",`${s.complianceScore}%`,"shield","green","Organization average","audit-compliance"],
      ["Open Recommendations",s.openRecommendations,"approvals","orange","Awaiting implementation","audit-recommendations"],
      ["Closed Recommendations",s.closedRecommendations,"check","teal","Independently verified","audit-recommendations"],
      ["Fraud Alerts",s.fraudAlerts,"bell","red","Uncleared flags","audit-fraud"],
      ["Pending Investigations",s.pendingInvestigations,"search","violet","Independent review","audit-investigations"]];
    return `<div class="audit-command"><div class="audit-independence">${icons.shield}<div><strong>Independent assurance workspace</strong><span>Audit can inspect operational records across departments. Source records remain read-only and cannot be changed here.</span></div><b>READ ONLY</b></div><div class="audit-stats">${cards.slice(0,8).map(x=>stat(...x)).join("")}</div><div class="audit-dashboard-grid">${overview(a)}${findings(a)}${compliance(a)}${investigations(a)}${recommendations(a)}${riskWidget(a)}${calendar(a)}${notifications(a)}</div></div>`;
  };
  D.subtitles.audit=()=>state.page==="dashboard"?"Independent assurance across every department - review operational records without changing them.":state.page==="settings"?"Audit authority, evidence retention and read-only operational access.":"Evidence-led assurance, risk, compliance and remediation tracking.";
})();
