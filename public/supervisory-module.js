/* Supervisory governance, performance, resolutions and accountability workspace. */
(() => {
  const D=window.DepartmentUi;
  if(!D) return;
  const {esc,date,badge,risk,panel,empty,table,options,modal,reload,download}=D;
  if(!document.querySelector('link[href*="supervisory-styles.css"]')){const link=document.createElement("link");link.rel="stylesheet";link.href="/supervisory-styles.css?v=41";document.head.appendChild(link);}
  const role="Supervisory Officer",key="supervisory";
  const config={
    key,title:"Supervisory Department",dashboardTitle:"Supervisory Department Dashboard",
    pages:["dashboard","messages","supervisory-performance","supervisory-executive","supervisory-committees",
      "supervisory-projects","supervisory-resolutions","supervisory-complaints","supervisory-recommendations",
      "supervisory-kpis","supervisory-visits","supervisory-reports","supervisory-analytics",
      "supervisory-documents","supervisory-calendar","supervisory-notifications","settings","supervisory-search"],
    sidebarPages:["dashboard","messages","supervisory-performance","supervisory-executive","supervisory-projects","supervisory-resolutions","supervisory-complaints","supervisory-recommendations","supervisory-visits","supervisory-reports","supervisory-documents","supervisory-notifications","settings"],
    labels:{dashboard:"Dashboard",messages:"Messages","supervisory-performance":"Department Performance","supervisory-executive":"Executive Monitoring",
      "supervisory-committees":"Committee Monitoring","supervisory-projects":"Projects Monitoring",
      "supervisory-resolutions":"Resolution Tracker","supervisory-complaints":"Complaints",
      "supervisory-recommendations":"Recommendations","supervisory-kpis":"Organization KPIs",
      "supervisory-visits":"Site Visits","supervisory-reports":"Reports","supervisory-analytics":"Analytics",
      "supervisory-documents":"Documents","supervisory-calendar":"Calendar",
      "supervisory-notifications":"Notifications",settings:"Settings"},
    icons:{"supervisory-performance":"reports","supervisory-executive":"users","supervisory-committees":"building",
      "supervisory-projects":"building","supervisory-resolutions":"approvals","supervisory-complaints":"messages",
      "supervisory-recommendations":"check","supervisory-kpis":"reports","supervisory-visits":"eye",
      "supervisory-reports":"file","supervisory-analytics":"reports","supervisory-documents":"file",
      "supervisory-calendar":"clock","supervisory-notifications":"bell"}
  };
  D.configs[role]=config;
  rolePages[role]=config.pages;
  Object.assign(pageMeta,{
    "supervisory-performance":["Performance assurance","Department Performance"],
    "supervisory-executive":["Leadership accountability","Executive Monitoring"],
    "supervisory-committees":["Committee accountability","Committee Monitoring"],
    "supervisory-projects":["Strategic delivery","Projects Monitoring"],
    "supervisory-resolutions":["Implementation control","Resolution Tracker"],
    "supervisory-complaints":["Oversight intervention","Complaints"],
    "supervisory-recommendations":["Corrective action","Recommendations"],
    "supervisory-kpis":["Strategic results","Organization KPIs"],
    "supervisory-visits":["Field verification","Site Visits"],
    "supervisory-reports":["Governance reporting","Reports"],
    "supervisory-analytics":["Performance intelligence","Analytics"],
    "supervisory-documents":["Supervisory evidence","Documents"],
    "supervisory-calendar":["Deadlines and visits","Calendar"],
    "supervisory-notifications":["Accountability alerts","Notifications"],
    "supervisory-search":["Organization oversight","Search results"]
  });

  const S=()=>state.supervisory;
  const pct=value=>`${Number(value||0).toFixed(Number(value)%1?1:0)}%`;
  const formEnd=label=>`<div class="form-actions"><button type="button" class="button secondary" data-close-modal>Cancel</button><button type="submit" class="button primary">${label}</button></div>`;
  const departments=()=>`<option value="">Organization-wide</option>${options(S().departments)}`;
  const statusTone=status=>["overdue","at_risk","behind_schedule","escalated"].includes(status)?"risk-high":"";
  function progress(value,tone=""){return `<div class="sup-progress ${tone}"><i><u style="width:${Math.max(0,Math.min(100,Number(value||0)))}%"></u></i><b>${pct(value)}</b></div>`;}
  function stat(label,value,icon,tone,note,target){
    return `<button class="sup-stat ${tone}" data-dept-target="${target}"><span>${icons[icon]||icons.reports}</span><div><small>${label}</small><strong>${value}</strong><em>${note}</em></div></button>`;
  }
  function performanceWidget(s){
    return panel("Organization performance overview","Target achievement across the seven monitored departments",
      `<div class="sup-performance-list">${s.scorecards.map(x=>`<button data-dept-target="supervisory-performance" class="${x.performanceScore<85?"attention":""}"><span><b>${esc(x.department)}</b><em>${esc(x.status.replaceAll("_"," "))}</em></span>${progress(x.performanceScore,x.performanceScore<85?"danger":"")}</button>`).join("")||empty("No scorecards available.")}</div>`,
      "sup-performance-widget");
  }
  function followupWidget(s){
    return panel("Department follow-up tracker","Actions, accountable officers, deadlines and verified progress",
      `<div class="sup-followup-list">${s.followups.slice(0,5).map(x=>`<article><div><strong>${esc(x.department)}  -  ${esc(x.actionRequired)}</strong><small>${esc(x.responsibleOfficer)}  -  Due ${date(x.deadline)}</small></div>${progress(x.progress)}${badge(x.status,statusTone(x.status))}</article>`).join("")||empty("No follow-ups require attention.")}</div><button class="dept-link" data-dept-target="supervisory-performance">Open all follow-ups ></button>`,
      "sup-followups-widget");
  }
  function executiveWidget(s){
    const x=s.executive||{};
    return panel("Executive monitoring","Leadership decisions, strategic objectives and implementation",
      `<div class="sup-exec-score"><div class="sup-score-ring" style="--score:${x.performanceScore||0}"><strong>${pct(x.performanceScore)}</strong><span>Performance</span></div><div class="sup-exec-kpis"><span><b>${x.meetingsHeld||0}</b>Meetings held</span><span><b>${x.decisionsMade||0}</b>Decisions made</span><span><b>${x.decisionsImplemented||0}</b>Implemented</span><span class="warning"><b>${x.decisionsPending||0}</b>Pending</span></div></div>${progress(x.implementationRate)}<button class="dept-link" data-dept-target="supervisory-executive">Review Executive accountability ></button>`,
      "sup-executive-widget");
  }
  function resolutionWidget(s){
    return panel("Resolution implementation tracker","Board and leadership decisions requiring evidence",
      `<div class="sup-resolution-list">${s.resolutions.slice(0,5).map(x=>`<button data-dept-target="supervisory-resolutions"><span><b>${esc(x.resolutionNumber)}</b><small>${esc(x.title)}</small></span>${progress(x.completionPercentage)}${badge(x.status,statusTone(x.status))}</button>`).join("")||empty("No resolutions recorded.")}</div>`,
      "sup-resolution-widget");
  }
  function complaintsWidget(s){
    const open=s.complaints.filter(x=>!["resolved","closed"].includes(x.status));
    return panel("Complaints & oversight","Independent tracking of complaints against departments, leaders and committees",
      `<div class="sup-complaint-kpis"><div><strong>${s.complaints.length}</strong><span>Received</span></div><div><strong>${open.filter(x=>x.status==="investigation").length}</strong><span>Investigated</span></div><div><strong>${s.stats.resolvedComplaints}</strong><span>Resolved</span></div><div class="danger"><strong>${open.filter(x=>x.escalated).length}</strong><span>Escalated</span></div></div><div class="sup-mini-list">${open.slice(0,3).map(x=>`<button data-dept-target="supervisory-complaints"><span>${icons.messages}</span><div><b>${esc(x.complaintNumber)}  -  ${esc(x.category)}</b><small>${esc(x.department||x.subjectType)}</small></div>${badge(x.status,statusTone(x.status))}</button>`).join("")}</div>`,
      "sup-complaints-widget");
  }
  function projectsWidget(s){
    return panel("Project monitoring","Schedule, delivery risk and field verification",
      `<div class="sup-project-list">${s.projects.slice(0,5).map(x=>`<article><div><strong>${esc(x.projectName)}</strong><small>${esc(x.department||"Organization")}  -  ${esc(x.projectManager)}</small></div><div class="sup-plan-actual"><span>Plan ${pct(x.plannedProgress)}</span>${progress(x.actualProgress,x.actualProgress<x.plannedProgress?"danger":"")}</div>${risk(x.riskLevel)}</article>`).join("")||empty("No projects under supervision.")}</div>`,
      "sup-projects-widget");
  }
  function recommendationWidget(s){
    return panel("Recommendation tracker","Accepted, implemented and overdue corrective actions",
      `<div class="sup-rec-summary"><div><strong>${s.stats.recommendationsIssued}</strong><span>Issued</span></div><div><strong>${s.recommendations.filter(x=>x.accepted).length}</strong><span>Accepted</span></div><div><strong>${s.stats.recommendationsImplemented}</strong><span>Implemented</span></div><div class="danger"><strong>${s.recommendations.filter(x=>x.status==="overdue").length}</strong><span>Overdue</span></div></div>${progress(s.analytics.recommendationRate)}<button class="dept-link" data-dept-target="supervisory-recommendations">Track corrective actions ></button>`,
      "sup-recommendations-widget");
  }
  function kpiWidget(s){
    return panel("Organization KPI dashboard","Strategic outcomes from verified departmental data",
      `<div class="sup-kpi-grid">${s.kpis.slice(0,7).map(x=>`<button data-dept-target="supervisory-kpis" class="${x.achievementPercentage<85?"attention":""}"><span>${esc(x.kpiName)}</span><strong>${pct(x.achievementPercentage)}</strong><small>${esc(x.trend)}  -  ${esc(x.status)}</small></button>`).join("")}</div>`,
      "sup-kpi-widget");
  }
  function notificationsWidget(s){
    return panel("Supervisory notifications","Deadlines, performance drops, escalations and scheduled action",
      `<div class="dept-notification-list">${s.notifications.map(x=>`<button data-dept-target="${esc(x.target)}"><span class="${esc(x.level)}">${icons[x.level==="success"?"check":x.level==="info"?"info":"bell"]}</span><div><strong>${esc(x.title)}</strong><small>${esc(relativeTime(x.createdAt||x.time))}</small></div></button>`).join("")}</div>`,
      "sup-notifications-widget");
  }

  D.dashboards.supervisory=()=>{
    const s=S(),x=s.stats,cards=[
      ["Department Performance",pct(x.departmentPerformance),"reports","blue","Organization average","supervisory-performance"],
      ["Departments Below Target",x.departmentsBelowTarget,"bell","red","Below 85% target","supervisory-performance"],
      ["Recommendations Issued",x.recommendationsIssued,"approvals","violet","Corrective actions","supervisory-recommendations"],
      ["Recommendations Implemented",x.recommendationsImplemented,"check","green","Verified complete","supervisory-recommendations"],
      ["Pending Follow-ups",x.pendingFollowups,"clock","orange","Require verification","supervisory-performance"],
      ["Committee Performance",pct(x.committeePerformance),"building","teal","Committee average","supervisory-committees"],
      ["Executive Performance",pct(x.executivePerformance),"users","blue","Leadership score","supervisory-executive"],
      ["Projects Under Supervision",x.projectsUnderSupervision,"building","violet","Active delivery","supervisory-projects"],
      ["Resolved Complaints",x.resolvedComplaints,"check","green","Oversight closed","supervisory-complaints"],
      ["Pending Complaints",x.pendingComplaints,"messages","orange","Open intervention","supervisory-complaints"],
      ["Board Resolutions Pending",x.boardResolutionsPending,"approvals","red","Implementation open","supervisory-resolutions"],
      ["Organization Performance",pct(x.organizationPerformanceScore),"reports","teal","Strategic score","supervisory-kpis"]
    ];
    return `<div class="supervisory-command"><div class="sup-authority">${icons.eye}<div><strong>Governance and performance command center</strong><span>Monitor every department, resolution and strategic target. Operational source records remain read-only.</span></div><b>OVERSIGHT</b></div><div class="sup-stats">${cards.slice(0,8).map(x=>stat(...x)).join("")}</div><div class="sup-dashboard-grid">${performanceWidget(s)}${followupWidget(s)}${executiveWidget(s)}${resolutionWidget(s)}${complaintsWidget(s)}${projectsWidget(s)}${recommendationWidget(s)}${kpiWidget(s)}${notificationsWidget(s)}</div></div>`;
  };
  D.subtitles.supervisory=()=>state.page==="dashboard"?"Organization-wide performance, implementation, complaints and accountability in one command center.":"Governance oversight with traceable findings, recommendations and follow-up evidence.";

  D.views["supervisory-performance"]=()=>{
    const s=S();
    return `<div class="dept-page"><div class="sup-scorecard-grid">${s.scorecards.map(x=>`<article class="${x.performanceScore<85?"attention":""}"><header><span>${icons.building}</span><div><small>${esc(x.reference)}  -  ${esc(x.reviewPeriod)}</small><h3>${esc(x.department)}</h3></div><div class="sup-score-ring" style="--score:${x.performanceScore}"><strong>${pct(x.performanceScore)}</strong></div></header><dl><div><dt>Annual target</dt><dd>${pct(x.annualTarget)}</dd></div><div><dt>Monthly target</dt><dd>${pct(x.monthlyTarget)}</dd></div><div><dt>Completed tasks</dt><dd>${x.completedTasks}</dd></div><div><dt>Outstanding tasks</dt><dd>${x.outstandingTasks}</dd></div><div><dt>Budget utilization</dt><dd>${pct(x.budgetUtilization)}</dd></div><div><dt>Target achieved</dt><dd>${pct(x.targetAchievement)}</dd></div></dl><blockquote>${esc(x.supervisorComment||"No supervisor comment.")}</blockquote>${badge(x.status)}</article>`).join("")}</div>${panel("Department follow-up register","Action, ownership, deadline, evidence and current verified progress",table(["Reference","Department","Action required","Responsible officer","Deadline","Progress","Evidence","Status","Update"],s.followups.map(x=>`<tr><td><strong>${esc(x.reference)}</strong></td><td>${esc(x.department)}</td><td class="wide-cell">${esc(x.actionRequired)}</td><td>${esc(x.responsibleOfficer)}</td><td>${date(x.deadline)}</td><td>${progress(x.progress)}</td><td>${esc(x.evidence||"Pending")}</td><td>${badge(x.status,statusTone(x.status))}</td><td><button class="mini-btn" data-sup-followup="${x.id}">${icons.refresh}</button></td></tr>`).join("")))}</div>`;
  };
  D.views["supervisory-executive"]=()=>{
    const x=S().executive||{};
    const objectives=x.strategicObjectivesTotal?x.strategicObjectivesCompleted/x.strategicObjectivesTotal*100:0;
    return `<div class="dept-page"><div class="sup-executive-hero"><div class="sup-score-ring large" style="--score:${x.performanceScore||0}"><strong>${pct(x.performanceScore)}</strong><span>Executive score</span></div><div><small>${esc(x.reference||"Current review")}  -  ${esc(x.reviewPeriod||"Current period")}</small><h2>Executive accountability overview</h2><p>${esc(x.supervisorComment||"Leadership implementation performance is monitored independently.")}</p></div></div><div class="sup-metric-grid">${[["Meetings held",x.meetingsHeld],["Attendance rate",pct(x.attendanceRate)],["Decisions made",x.decisionsMade],["Decisions implemented",x.decisionsImplemented],["Decisions pending",x.decisionsPending],["Delayed actions",x.delayedActions],["Implementation rate",pct(x.implementationRate)],["Strategic objectives",`${x.strategicObjectivesCompleted||0}/${x.strategicObjectivesTotal||0}`]].map(v=>`<article><strong>${v[1]??0}</strong><span>${v[0]}</span></article>`).join("")}</div>${panel("Strategic objective completion","Leadership decisions should translate into verified organizational delivery",progress(objectives))}${panel("Executive monitoring boundary","Supervisory assesses attendance, decisions and implementation; it does not replace Executive authority.",`<div class="audit-readonly-note">${icons.shield}<div><strong>Independent performance review</strong><p>Supervisory records assessments and recommendations but cannot edit Executive resolutions or approve operational transactions.</p></div></div>`)}</div>`;
  };
  D.views["supervisory-committees"]=()=>{
    const s=S();
    return `<div class="dept-page"><div class="sup-committee-grid">${s.committees.map(x=>`<article class="${x.performanceScore<85?"attention":""}"><header><span>${icons.users}</span><div><small>${esc(x.reference)}  -  ${esc(x.reviewPeriod)}</small><h3>${esc(x.committeeName)}</h3></div>${badge(x.status)}</header><div class="sup-score-line"><strong>${pct(x.performanceScore)}</strong>${progress(x.performanceScore)}</div><dl><div><dt>Members</dt><dd>${x.members}</dd></div><div><dt>Meetings</dt><dd>${x.meetingsHeld}</dd></div><div><dt>Attendance</dt><dd>${pct(x.attendanceRate)}</dd></div><div><dt>Decisions</dt><dd>${x.decisionsMade}</dd></div><div><dt>Outstanding actions</dt><dd>${x.outstandingActions}</dd></div><div><dt>Chairperson</dt><dd>${esc(x.chairperson)}</dd></div></dl><blockquote>${esc(x.supervisorComment||"No comment.")}</blockquote></article>`).join("")}</div></div>`;
  };
  D.views["supervisory-projects"]=()=>{
    const s=S();
    return `<div class="dept-page"><div class="sup-project-cards">${s.projects.map(x=>`<article class="${["high","critical"].includes(x.riskLevel)?"attention":""}"><header><span>${icons.building}</span><div><small>${esc(x.reference)}  -  ${esc(x.department||"Organization")}</small><h3>${esc(x.projectName)}</h3></div>${risk(x.riskLevel)}</header><p>Manager: <b>${esc(x.projectManager)}</b>  -  Deadline: <b>${date(x.deadline)}</b></p><div class="sup-project-compare"><div><span>Planned</span>${progress(x.plannedProgress)}</div><div><span>Actual</span>${progress(x.actualProgress,x.actualProgress<x.plannedProgress?"danger":"")}</div></div><blockquote>${esc(x.supervisorComment||"No supervisory comment.")}</blockquote><footer>${badge(x.status,statusTone(x.status))}<span>${x.siteVisitsCompleted} site visits</span><button data-sup-project="${x.id}">Update monitoring ></button></footer></article>`).join("")}</div></div>`;
  };
  D.views["supervisory-resolutions"]=()=>panel("Resolution implementation register","Meeting decision, accountable department, deadline, evidence and completion",table(["Resolution","Meeting","Department / officer","Deadline","Completion","Evidence","Priority","Status","Update"],S().resolutions.map(x=>`<tr><td class="wide-cell"><strong>${esc(x.resolutionNumber)}  -  ${esc(x.title)}</strong></td><td>${date(x.meetingDate)}</td><td>${esc(x.department||"Organization")}<small>${esc(x.responsibleOfficer)}</small></td><td>${date(x.dueDate)}</td><td>${progress(x.completionPercentage)}</td><td>${esc(x.evidence||"Evidence pending")}</td><td>${risk(x.priority)}</td><td>${badge(x.status,statusTone(x.status))}</td><td><button class="mini-btn" data-sup-resolution="${x.id}">${icons.refresh}</button></td></tr>`).join("")));
  D.views["supervisory-complaints"]=()=>panel("Complaints oversight register","Complaints against departments, leaders, committees, officials and activities",table(["Complaint","Category / subject","Department","Description","Supervisor","Investigation","Escalated","Status","Update"],S().complaints.map(x=>`<tr><td><strong>${esc(x.complaintNumber)}</strong></td><td>${esc(x.category)}<small>${esc(x.subjectType)}</small></td><td>${esc(x.department||"Organization")}</td><td class="wide-cell">${esc(x.description)}${x.finding?`<small>Finding: ${esc(x.finding)}</small>`:""}</td><td>${esc(x.assignedSupervisor)}</td><td>${progress(x.investigationProgress)}</td><td>${x.escalated?badge("Escalated","risk-high"):badge("Standard")}</td><td>${badge(x.status,statusTone(x.status))}</td><td><button class="mini-btn" data-sup-complaint="${x.id}">${icons.refresh}</button></td></tr>`).join("")));
  D.views["supervisory-recommendations"]=()=>{
    const s=S();
    return `<div class="dept-page"><div class="sup-rec-banner"><div><strong>${s.recommendations.length}</strong><span>Issued</span></div><div><strong>${s.recommendations.filter(x=>x.accepted).length}</strong><span>Accepted</span></div><div><strong>${s.stats.recommendationsImplemented}</strong><span>Implemented</span></div><div><strong>${s.recommendations.filter(x=>x.status==="overdue").length}</strong><span>Overdue</span></div></div>${panel("Recommendation implementation register","Department response, evidence, accountable officer and independent verification",table(["Recommendation","Source","Department","Required action","Officer / due","Response","Progress","Status","Update"],s.recommendations.map(x=>`<tr><td><strong>${esc(x.recommendationNumber)}</strong></td><td>${esc(x.sourceType)}<small>${esc(x.sourceReference||" - ")}</small></td><td>${esc(x.department||"Organization")}</td><td class="wide-cell">${esc(x.description)}</td><td>${esc(x.responsibleOfficer)}<small>${date(x.dueDate)}</small></td><td class="wide-cell">${esc(x.departmentResponse||"Awaiting response")}</td><td>${progress(x.implementationProgress)}</td><td>${badge(x.status,statusTone(x.status))}</td><td><button class="mini-btn" data-sup-recommendation="${x.id}">${icons.refresh}</button></td></tr>`).join("")))}</div>`;
  };
  D.views["supervisory-kpis"]=()=>{
    const s=S();
    return `<div class="dept-page"><div class="sup-kpi-cards">${s.kpis.map(x=>`<article class="${x.achievementPercentage<85?"attention":""}"><header><span>${icons.reports}</span>${badge(x.status)}</header><small>${esc(x.category)}  -  ${esc(x.reviewPeriod)}</small><h3>${esc(x.kpiName)}</h3><div class="sup-kpi-value"><strong>${Number(x.actualValue).toLocaleString()}${esc(x.unit)}</strong><span>Target ${Number(x.targetValue).toLocaleString()}${esc(x.unit)}</span></div>${progress(x.achievementPercentage)}<footer>${esc(x.trend)}  -  Source: ${esc(x.dataSource)}</footer></article>`).join("")}</div>${panel("Operational source summaries","Read-only signals received from departmental systems",table(["Department","Metric","Current value","Updated"],s.operationalSummaries.map(x=>`<tr><td><strong>${esc(x.department)}</strong></td><td>${esc(x.metric)}</td><td>${Number(x.value||0).toLocaleString()} ${esc(x.unit)}</td><td>${date(x.updatedAt,true)}</td></tr>`).join("")),"sup-readonly-panel")}</div>`;
  };
  D.views["supervisory-visits"]=()=>panel("Site visit register","Field observations, photos, recommendations and follow-up dates",table(["Visit","Site / project","Department","Date / supervisor","Observations","Recommendations","Follow-up","Status"],S().siteVisits.map(x=>`<tr><td><strong>${esc(x.visitNumber)}</strong></td><td>${esc(x.siteName)}<small>${esc(x.projectName||"General oversight")}</small></td><td>${esc(x.department||"Organization")}</td><td>${date(x.visitDate)}<small>${esc(x.supervisor)}</small></td><td class="wide-cell">${esc(x.observations)}</td><td class="wide-cell">${esc(x.recommendations)}</td><td>${date(x.followUpDate)}</td><td>${badge(x.status)}</td></tr>`).join("")));
  D.views["supervisory-reports"]=()=>{
    const reports=["Department Performance Report","Executive Performance Report","Committee Performance Report","Resolution Status Report","Complaints Report","Project Monitoring Report","Recommendation Report","Organization KPI Report","Annual Supervisory Report"];
    return `<div class="exec-report-grid">${reports.map((name,i)=>`<article><span class="${["blue","green","violet","orange","teal"][i%5]}">${icons.file}</span><div><h3>${name}</h3><p>Governance evidence, performance scores and verified implementation status.</p><small>Traceable  -  Current  -  Role controlled</small></div><div class="finance-report-actions"><button data-dept-report="${name}">${icons.download}Excel</button><button data-dept-report="${name}">${icons.file}PDF</button></div></article>`).join("")}</div>`;
  };
  D.views["supervisory-analytics"]=()=>{
    const s=S(),max=Math.max(1,...s.scorecards.map(x=>x.performanceScore));
    return `<div class="dept-page"><div class="sup-analytics-grid">${panel("Department performance","Current score comparison",`<div class="horizontal-chart">${s.scorecards.map(x=>`<div><span>${esc(x.department)}</span><i><u style="width:${x.performanceScore/max*100}%"></u></i><b>${pct(x.performanceScore)}</b></div>`).join("")}</div>`)}${panel("Resolution completion","Implemented and verified decisions",`<div class="sup-analytics-score"><strong>${pct(s.analytics.resolutionRate)}</strong>${progress(s.analytics.resolutionRate)}<span>Implementation rate</span></div>`)}${panel("Complaint resolution","Oversight cases brought to closure",`<div class="sup-analytics-score"><strong>${pct(s.analytics.complaintRate)}</strong>${progress(s.analytics.complaintRate)}<span>Resolution rate</span></div>`)}${panel("Performance trend","Seven review periods",`<div class="audit-line-bars">${s.analytics.departmentTrend.map((x,i)=>`<div><i style="height:${x}%"></i><b>${pct(x)}</b><span>P${i+1}</span></div>`).join("")}</div>`)}${panel("Committee performance","Attendance, decisions and outstanding actions",`<div class="horizontal-chart">${s.analytics.committeeScores.map(x=>`<div><span>${esc(x.label)}</span><i><u style="width:${x.value}%"></u></i><b>${pct(x.value)}</b></div>`).join("")}</div>`)}${panel("Project progress variance","Planned versus actual delivery",`<div class="sup-variance-list">${s.analytics.projectProgress.map(x=>`<div><b>${esc(x.label)}</b><span>Plan ${pct(x.planned)}  -  Actual ${pct(x.actual)}</span>${progress(x.actual,x.actual<x.planned?"danger":"")}</div>`).join("")}</div>`)}</div></div>`;
  };
  D.views["supervisory-documents"]=()=>panel("Supervisory documents","Performance reports, resolutions, visit evidence, Board minutes and policies",table(["Reference","Document","Type","Version","Status","Updated","Actions"],S().documents.map(x=>`<tr><td><strong>${esc(x.reference)}</strong></td><td>${esc(x.title)}<small>${esc(x.fileName||"Secure document store")}</small></td><td>${esc(x.documentType)}</td><td>${esc(x.version||"1.0")}</td><td>${badge(x.status)}</td><td>${date(x.updatedAt,true)}</td><td>${x.hasFile?`<div class="document-actions"><a class="mini-btn" href="/api/documents/${x.id}/view" target="_blank">${icons.eye}</a><a class="mini-btn" href="/api/documents/${x.id}/download">${icons.download}</a></div>`:`<span class="status pending">No file</span>`}</td></tr>`).join("")));
  D.views["supervisory-calendar"]=()=>panel("Supervisory calendar","Resolution deadlines, department follow-ups and site visit reviews",`<div class="audit-full-calendar">${S().calendar.map(x=>`<article><time><b>${new Date(x.date).getDate()}</b><span>${new Date(x.date).toLocaleString("en",{month:"short",year:"numeric"})}</span></time><div><small>${esc(x.type)}  -  ${esc(x.reference)}</small><h3>${esc(x.title)}</h3></div>${risk(x.risk)}<button data-dept-target="${esc(x.target)}">Open</button></article>`).join("")||empty("No oversight deadlines are scheduled.")}</div>`);
  D.views["supervisory-notifications"]=()=>panel("Supervisory notifications","Performance drops, missed deadlines, escalations and governance actions",`<div class="dept-notification-list large">${S().notifications.map(x=>`<button data-dept-target="${esc(x.target)}"><span class="${esc(x.level)}">${icons[x.level==="success"?"check":x.level==="info"?"info":"bell"]}</span><div><strong>${esc(x.title)}</strong><small>${esc(relativeTime(x.createdAt||x.time))}</small></div></button>`).join("")}</div>`);
  D.views["supervisory-search"]=()=>panel("Supervisory search results",`${(state.supervisorySearchResults||[]).length} oversight records found`,table(["Type","Reference","Record","Detail","Open"],(state.supervisorySearchResults||[]).map(x=>`<tr><td>${badge(x.type)}</td><td><strong>${esc(x.reference)}</strong></td><td>${esc(x.title)}</td><td>${esc(x.detail)}</td><td><button class="mini-btn" data-dept-target="${esc(x.target)}">${icons.eye}</button></td></tr>`).join("")));
  D.settings.supervisory=()=>`<div class="audit-settings-grid">${panel("Supervisory authority","Organization-wide governance and performance access",`<div class="audit-permission-list"><div>${icons.check}<span><b>Monitor all seven departments</b><small>Authority level ${S().access.authorityLevel}</small></span></div><div>${icons.check}<span><b>Record findings, recommendations and visits</b><small>Traceable Supervisory records</small></span></div><div>${icons.check}<span><b>Track resolutions, projects and complaints</b><small>Implementation evidence required</small></span></div></div>`)}${panel("Operational boundary","Source systems are strictly read-only",`<div class="audit-readonly-note">${icons.lock}<div><strong>${esc(S().access.operationalAccess.replace("_"," ").toUpperCase())}</strong><p>Supervisory cannot edit Finance records, savings or loans, investments, welfare decisions, Legal files or Audit findings. It cannot approve operational transactions unless a policy explicitly grants that authority.</p></div></div>`)}</div>`;

  D.actions.supervisory=()=>{
    const map={"supervisory-performance":["scorecard","New scorecard"],"supervisory-resolutions":["resolution","Add resolution"],
      "supervisory-complaints":["complaint","Register complaint"],"supervisory-recommendations":["recommendation","Issue recommendation"],
      "supervisory-visits":["visit","Record site visit"]},item=map[state.page];
    return item?`<div class="head-actions"><button class="button primary" data-dept-modal="${item[0]}">${icons.plus}${item[1]}</button></div>`:"";
  };
  D.actions.supervisoryReport=name=>{
    const s=S(),rows=name.includes("Department")?s.scorecards:name.includes("Executive")?[s.executive]:name.includes("Committee")?s.committees:name.includes("Resolution")?s.resolutions:name.includes("Complaint")?s.complaints:name.includes("Project")?s.projects:name.includes("Recommendation")?s.recommendations:s.kpis;
    download(name,rows);
  };

  function formModal(type){
    if(type==="menu") return modal("Supervisory quick actions","Record an assessment, decision follow-up or field verification",`<div class="dept-quick-grid"><button data-supervisory-quick="scorecard">${icons.reports}<b>New scorecard</b></button><button data-supervisory-quick="followup">${icons.clock}<b>Add follow-up</b></button><button data-supervisory-quick="resolution">${icons.approvals}<b>Add resolution</b></button><button data-supervisory-quick="complaint">${icons.messages}<b>Complaint</b></button><button data-supervisory-quick="recommendation">${icons.check}<b>Recommendation</b></button><button data-supervisory-quick="visit">${icons.eye}<b>Site visit</b></button></div>`);
    const forms={
      scorecard:["New department scorecard","Record verified target achievement and performance",`<form class="form" data-sup-form="scorecard"><div class="form-grid"><div class="field"><label>Department</label><select name="departmentId" required>${departments()}</select></div><div class="field"><label>Review period</label><input name="reviewPeriod" placeholder="2026 Q3" required></div><div class="field"><label>Annual target %</label><input name="annualTarget" type="number" value="100"></div><div class="field"><label>Monthly target %</label><input name="monthlyTarget" type="number" value="100"></div><div class="field"><label>Performance score %</label><input name="performanceScore" type="number" min="0" max="100" required></div><div class="field"><label>Target achievement %</label><input name="targetAchievement" type="number" min="0" max="150" required></div><div class="field"><label>Completed tasks</label><input name="completedTasks" type="number" value="0"></div><div class="field"><label>Outstanding tasks</label><input name="outstandingTasks" type="number" value="0"></div><div class="field"><label>Budget utilization %</label><input name="budgetUtilization" type="number" value="0"></div><div class="field full"><label>Supervisor comment</label><textarea name="supervisorComment"></textarea></div></div>${formEnd("Save scorecard")}</form>`],
      followup:["Add department follow-up","Assign a corrective action with a clear deadline",`<form class="form" data-sup-form="followup"><div class="form-grid"><div class="field"><label>Department</label><select name="departmentId" required>${departments()}</select></div><div class="field"><label>Responsible officer</label><input name="responsibleOfficer" required></div><div class="field"><label>Deadline</label><input name="deadline" type="date" required></div><div class="field"><label>Evidence expected</label><input name="evidence"></div><div class="field full"><label>Action required</label><textarea name="actionRequired" required></textarea></div><div class="field full"><label>Supervisor comment</label><textarea name="supervisorComment"></textarea></div></div>${formEnd("Assign follow-up")}</form>`],
      resolution:["Register approved resolution","Track responsibility, deadline and implementation evidence",`<form class="form" data-sup-form="resolution"><div class="form-grid"><div class="field full"><label>Resolution title</label><input name="title" required></div><div class="field"><label>Meeting date</label><input name="meetingDate" type="date" required></div><div class="field"><label>Department</label><select name="departmentId">${departments()}</select></div><div class="field"><label>Responsible officer</label><input name="responsibleOfficer" required></div><div class="field"><label>Due date</label><input name="dueDate" type="date" required></div><div class="field"><label>Priority</label><select name="priority"><option>low</option><option selected>medium</option><option>high</option><option>critical</option></select></div><div class="field full"><label>Evidence reference</label><textarea name="evidence"></textarea></div></div>${formEnd("Register resolution")}</form>`],
      complaint:["Register oversight complaint","Create a confidential intervention record",`<form class="form" data-sup-form="complaint"><div class="form-grid"><div class="field"><label>Category</label><input name="category" required></div><div class="field"><label>Subject type</label><select name="subjectType"><option>department</option><option>leader</option><option>committee</option><option>official</option><option>activity</option></select></div><div class="field"><label>Department</label><select name="departmentId">${departments()}</select></div><div class="field"><label>Assigned supervisor</label><input name="assignedSupervisor" required></div><div class="field full"><label>Description</label><textarea name="description" required></textarea></div><div class="field full"><label>Evidence</label><textarea name="evidence"></textarea></div><label class="check-row"><input name="escalated" type="checkbox"> Escalate for urgent intervention</label></div>${formEnd("Register complaint")}</form>`],
      recommendation:["Issue recommendation","Assign a traceable corrective action",`<form class="form" data-sup-form="recommendation"><div class="form-grid"><div class="field"><label>Source</label><select name="sourceType"><option>assessment</option><option>complaint</option><option>site_visit</option><option>resolution</option><option>performance_review</option></select></div><div class="field"><label>Source reference</label><input name="sourceReference"></div><div class="field"><label>Department</label><select name="departmentId">${departments()}</select></div><div class="field"><label>Responsible officer</label><input name="responsibleOfficer" required></div><div class="field"><label>Due date</label><input name="dueDate" type="date" required></div><div class="field full"><label>Recommendation</label><textarea name="description" required></textarea></div><div class="field full"><label>Evidence</label><textarea name="evidence"></textarea></div></div>${formEnd("Issue recommendation")}</form>`],
      visit:["Record site visit","Store field observations, evidence and follow-up",`<form class="form" data-sup-form="visit"><div class="form-grid"><div class="field"><label>Site visited</label><input name="siteName" required></div><div class="field"><label>Department</label><select name="departmentId">${departments()}</select></div><div class="field"><label>Visit date</label><input name="visitDate" type="date" required></div><div class="field"><label>Supervisor</label><input name="supervisor" required></div><div class="field"><label>Follow-up date</label><input name="followUpDate" type="date"></div><div class="field"><label>Photo reference</label><input name="photosReference"></div><div class="field full"><label>Observations</label><textarea name="observations" required></textarea></div><div class="field full"><label>Recommendations</label><textarea name="recommendations" required></textarea></div></div>${formEnd("Save site visit")}</form>`]
    },item=forms[type];
    if(!item)return;
    modal(item[0],item[1],item[2]);
    document.querySelector("[data-sup-form]")?.addEventListener("submit",async event=>{
      event.preventDefault();
      const form=event.currentTarget,data=Object.fromEntries(new FormData(form));
      if(data.departmentId)data.departmentId=Number(data.departmentId);else delete data.departmentId;
      data.escalated=data.escalated==="on";
      const endpoint={scorecard:"scorecards",followup:"followups",resolution:"resolutions",complaint:"complaints",recommendation:"recommendations",visit:"site-visits"}[form.dataset.supForm];
      try{await api(`/api/supervisory/${endpoint}`,{method:"POST",body:JSON.stringify(data)});closeModal();await reload("Supervisory record saved.");}catch(error){toast(error.message);}
    });
  }
  D.quick.supervisory=formModal;

  async function statusUpdate(type,id,currentStatus,currentProgress){
    const valid={
      followup:"pending, in_progress, at_risk, overdue, completed, closed",
      resolution:"pending, in_progress, at_risk, overdue, implemented, closed",
      complaint:"received, review, investigation, follow_up, escalated, resolved, closed",
      recommendation:"issued, accepted, in_progress, overdue, implemented, closed",
      project:"active, at_risk, behind_schedule, completed, closed"
    };
    const status=prompt(`Status (${valid[type]})`,currentStatus);if(!status)return;
    const progress=Number(prompt("Verified progress (0-100)",String(currentProgress||0)));if(!Number.isFinite(progress))return;
    const body={status,progress,actualProgress:progress,comment:prompt("Supervisory comment or evidence note","")||""};
    if(type==="complaint"){body.finding=body.comment;body.recommendation=prompt("Recommendation","")||"";body.escalated=status==="escalated";}
    if(type==="recommendation"){body.response=body.comment;body.evidence=prompt("Evidence reference","")||"";}
    if(type==="project"){body.riskLevel=prompt("Risk level: low, medium, high, critical","medium")||"medium";}
    try{await api(`/api/supervisory/${type==="project"?"projects":`${type}s`}/${id}/status`,{method:"POST",body:JSON.stringify(body)});await reload("Supervisory status updated.");}catch(error){toast(error.message);}
  }
  D.binders.push(cfg=>{
    if(cfg.key!=="supervisory")return;
    document.querySelectorAll("[data-sup-followup]").forEach(x=>x.addEventListener("click",()=>{const r=S().followups.find(v=>String(v.id)===x.dataset.supFollowup);statusUpdate("followup",x.dataset.supFollowup,r?.status,r?.progress);}));
    document.querySelectorAll("[data-sup-resolution]").forEach(x=>x.addEventListener("click",()=>{const r=S().resolutions.find(v=>String(v.id)===x.dataset.supResolution);statusUpdate("resolution",x.dataset.supResolution,r?.status,r?.completionPercentage);}));
    document.querySelectorAll("[data-sup-complaint]").forEach(x=>x.addEventListener("click",()=>{const r=S().complaints.find(v=>String(v.id)===x.dataset.supComplaint);statusUpdate("complaint",x.dataset.supComplaint,r?.status,r?.investigationProgress);}));
    document.querySelectorAll("[data-sup-recommendation]").forEach(x=>x.addEventListener("click",()=>{const r=S().recommendations.find(v=>String(v.id)===x.dataset.supRecommendation);statusUpdate("recommendation",x.dataset.supRecommendation,r?.status,r?.implementationProgress);}));
    document.querySelectorAll("[data-sup-project]").forEach(x=>x.addEventListener("click",()=>{const r=S().projects.find(v=>String(v.id)===x.dataset.supProject);statusUpdate("project",x.dataset.supProject,r?.status,r?.actualProgress);}));
  });
})();
