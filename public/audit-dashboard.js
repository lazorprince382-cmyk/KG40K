/* Audit command center: live books plus findings, recommendations and follow-up. */
(() => {
  const D=window.DepartmentUi,{esc,date,risk,panel,empty,table}=D;
  const data=()=>state.auditCenter;
  function stat(label,value,iconName,tone,note,target){return `<button class="audit-stat ${tone}" data-dept-target="${target}"><span class="audit-stat-icon">${icons[iconName]}</span><span><small>${label}</small><strong>${value}</strong><em>${note}</em></span></button>`;}
  function book(label,value,note){return `<div class="audit-book"><small>${label}</small><strong>${value}</strong><em>${note}</em></div>`;}
  function calendar(a){
    return panel("Audit calendar","Plans, deadlines and follow-up reviews",`<div class="dept-calendar-list">${(a.calendar||[]).slice(0,6).map(x=>`<button data-dept-target="${esc(x.target)}"><time><b>${new Date(x.date).getDate()}</b><span>${new Date(x.date).toLocaleString("en",{month:"short"})}</span></time><div><strong>${esc(x.type)}  -  ${esc(x.reference)}</strong><p>${esc(x.title)}</p></div>${risk(x.risk)}</button>`).join("")||empty("No assurance dates are scheduled.")}</div>`,"audit-calendar-widget");
  }
  function notifications(a){
    return panel("Audit alerts","Live books and open work",`<div class="dept-notification-list">${(a.notifications||[]).map(x=>`<button data-dept-target="${esc(x.target)}"><span class="${esc(x.level)}">${icons[x.level==="success"?"check":x.level==="info"?"info":"bell"]}</span><div><strong>${esc(x.title)}</strong><small>${esc(relativeTime(x.createdAt||x.time))}</small></div></button>`).join("")||empty("Nothing needs attention.")}</div>`,"audit-notifications-widget");
  }
  D.dashboards.audit=()=>{
    const a=data();
    if(!a||!a.stats)return `<div class="executive-loading">Loading Audit workspace…</div>`;
    const s=a.stats,g=a.inspection||{};
    const cards=[
      ["Members up to date",`${g.upToDate||0} / ${g.activeMembers||0}`,"users","green",g.monthLabel||"This month","dashboard"],
      ["Behind on savings",(g.behind||[]).length,"users","orange","Need catch-up","dashboard"],
      ["Overdue loans",g.overdueLoans||0,"loans","red",`${g.activeLoans||0} running`,"dashboard"],
      ["Money in loans",money(g.moneyInLoans||0),"wallet","orange","Principal + interest + penalties","audit-reports"],
      ["Open findings",s.auditFindings,"file","red","Exceptions still open","audit-findings"],
      ["Open recommendations",s.openRecommendations,"approvals","orange","Awaiting implementation","audit-recommendations"],
      ["Investigations",s.pendingInvestigations,"search","violet","Independent review","audit-investigations"],
      ["Fraud alerts",s.fraudAlerts,"bell","red","Uncleared flags","audit-fraud"]
    ];
    const behind=(g.behind||[]).length
      ?table(["Member","Short by"],g.behind.slice(0,10).map(x=>`<tr><td><strong>${esc(x.name)}</strong></td><td class="negative">${money(x.shortBy)}</td></tr>`).join(""))
      :empty("Every active member is up to date.");
    const overdue=(g.overdueLoanList||[]).length
      ?table(["Loan","Member","Remaining","Overdue since"],g.overdueLoanList.map(x=>`<tr><td><strong>${esc(x.reference)}</strong></td><td>${esc(x.member)}</td><td>${money(x.remaining)}</td><td>${date(x.dueSince)}</td></tr>`).join(""))
      :empty("No overdue loans.");
    return `${D.dashboardGreeting()}<div class="audit-command">
      <div class="audit-stats">${cards.map(x=>stat(...x)).join("")}</div>
      <div class="audit-books">
        ${book("Centenary bank",money(g.centenary||0),"Live GL-4104")}
        ${book("UAP unit trust",money(g.uap||0),"Live GL-4500")}
        ${book("Welfare fund",money(g.welfareBalance||0),"Current closing balance")}
        ${book("Member savings",money(g.totalSavings||0),`${g.activeMembers||0} active members`)}
      </div>
      <div class="audit-dashboard-grid">
        ${panel(`Members behind for ${esc(g.monthLabel||"this month")}`,"Largest shortfall first",behind,"audit-findings-widget")}
        ${panel("Overdue loans","Principal, interest and penalties remaining",overdue,"audit-recommendations-widget")}
        ${calendar(a)}${notifications(a)}
      </div>
    </div>`;
  };
  D.subtitles.audit=()=>"";
})();
