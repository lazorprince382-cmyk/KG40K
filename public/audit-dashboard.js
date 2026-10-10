/* Audit command center dashboard. */
(() => {
  const D=window.DepartmentUi,{esc,date,badge,risk,panel,empty}=D;
  const data=()=>state.auditCenter;
  function stat(label,value,iconName,tone,note,target){return `<button class="audit-stat ${tone}" data-dept-target="${target}"><span class="audit-stat-icon">${icons[iconName]}</span><span><small>${label}</small><strong>${value}</strong><em>${note}</em></span></button>`;}
  function calendar(a){
    return panel("Audit calendar","Plans, deadlines and follow-up reviews",`<div class="dept-calendar-list">${a.calendar.slice(0,6).map(x=>`<button data-dept-target="${esc(x.target)}"><time><b>${new Date(x.date).getDate()}</b><span>${new Date(x.date).toLocaleString("en",{month:"short"})}</span></time><div><strong>${esc(x.type)}  -  ${esc(x.reference)}</strong><p>${esc(x.title)}</p></div>${risk(x.risk)}</button>`).join("")||empty("No assurance dates are scheduled.")}</div>`,"audit-calendar-widget");
  }
  function notifications(a){
    return panel("Audit alerts","Risk and assurance updates",`<div class="dept-notification-list">${a.notifications.map(x=>`<button data-dept-target="${esc(x.target)}"><span class="${esc(x.level)}">${icons[x.level==="success"?"check":x.level==="info"?"info":"bell"]}</span><div><strong>${esc(x.title)}</strong><small>${esc(relativeTime(x.createdAt||x.time))}</small></div></button>`).join("")}</div>`,"audit-notifications-widget");
  }
  D.dashboards.audit=()=>{
    const a=data();
    if(!a||!a.stats)return `<div class="executive-loading">Loading Audit workspace…</div>`;
    const s=a.stats,cards=[
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
    return `${D.dashboardGreeting()}<div class="audit-command"><div class="audit-independence">${icons.shield}<div><strong>Independent assurance workspace</strong><span>Audit can inspect operational records across departments. Source records remain read-only and cannot be changed here.</span></div><b>READ ONLY</b></div><div class="audit-stats">${cards.slice(0,8).map(x=>stat(...x)).join("")}</div><div class="audit-dashboard-grid">${calendar(a)}${notifications(a)}</div></div>`;
  };
  D.subtitles.audit=()=>"";
})();
