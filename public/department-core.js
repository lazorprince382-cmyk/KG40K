/* Shared shell for Welfare, Legal and independent Audit workspaces. */
(() => {
  const configs = {
    "Welfare Officer": {
      key:"welfare", title:"Welfare Department", dashboardTitle:"Welfare Department Dashboard",
      pages:["dashboard","messages","welfare-requests","welfare-emergencies","welfare-contributions","welfare-beneficiaries","welfare-approvals",
        "welfare-payments","welfare-activities","welfare-meetings","welfare-reports","welfare-analytics","welfare-documents",
        "welfare-notifications","settings","welfare-search"],
      sidebarPages:["dashboard","messages","welfare-requests","welfare-contributions","welfare-approvals","welfare-activities","welfare-reports","welfare-documents","welfare-notifications","settings"],
      labels:{dashboard:"Dashboard",messages:"Messages","welfare-requests":"Welfare Requests","welfare-emergencies":"Emergency Cases",
        "welfare-contributions":"Contributions","welfare-beneficiaries":"Beneficiaries","welfare-approvals":"Approvals",
        "welfare-payments":"Payments","welfare-activities":"Activities & Events","welfare-meetings":"Committee Meetings",
        "welfare-reports":"Reports","welfare-analytics":"Analytics","welfare-documents":"Documents",
        "welfare-notifications":"Notifications",settings:"Settings"},
      icons:{"welfare-requests":"file","welfare-emergencies":"bell","welfare-contributions":"wallet","welfare-beneficiaries":"users",
        "welfare-approvals":"approvals","welfare-payments":"receipt","welfare-activities":"clock","welfare-meetings":"users",
        "welfare-reports":"reports","welfare-analytics":"reports","welfare-documents":"file","welfare-notifications":"bell"}
    },
    "Legal Officer": {
      key:"legal", title:"Legal Department", dashboardTitle:"Legal Department Dashboard",
      pages:["dashboard","messages","legal-cases","legal-contracts","legal-agreements","legal-policies","legal-constitution","legal-documents","legal-disciplinary","legal-complaints",
        "legal-opinions","legal-compliance","legal-court","legal-reports","legal-calendar",
        "legal-notifications","settings","legal-search"],
      sidebarPages:["dashboard","legal-bio-data","messages","legal-cases","legal-contracts","legal-policies","legal-documents","legal-complaints","legal-compliance","legal-reports","legal-notifications","settings"],
      labels:{dashboard:"Dashboard",messages:"Messages","legal-cases":"Legal Cases","legal-contracts":"Contracts","legal-agreements":"Agreements",
        "legal-policies":"Policies","legal-constitution":"Constitution","legal-disciplinary":"Disciplinary Cases","legal-complaints":"Complaints",
        "legal-opinions":"Legal Opinions","legal-compliance":"Compliance","legal-court":"Court Matters","legal-reports":"Reports",
        "legal-documents":"Documents","legal-calendar":"Calendar","legal-notifications":"Notifications",settings:"Settings"},
      icons:{"legal-cases":"shield","legal-contracts":"file","legal-agreements":"file","legal-policies":"reports","legal-constitution":"file",
        "legal-disciplinary":"users","legal-complaints":"messages","legal-opinions":"info","legal-compliance":"audit",
        "legal-court":"building","legal-reports":"reports","legal-documents":"file","legal-calendar":"clock",
        "legal-notifications":"bell"}
    },
    Auditor: {
      key:"audit", title:"Audit Department", dashboardTitle:"Audit Department Dashboard",
      pages:["dashboard","messages","audit-plans","audits","audit-findings","audit-investigations","audit-recommendations",
        "audit-compliance","audit-risk","audit-fraud","audit-reports","audit-analytics","audit-documents",
        "audit-calendar","audit-notifications","settings","audit-search"],
      sidebarPages:["dashboard","messages","audits","audit-findings","audit-investigations","audit-recommendations","audit-risk","audit-fraud","audit-reports","audit-documents","audit-notifications","settings"],
      labels:{dashboard:"Dashboard",messages:"Messages","audit-plans":"Audit Plans",audits:"Audits","audit-findings":"Audit Findings",
        "audit-investigations":"Investigations","audit-recommendations":"Recommendations",
        "audit-compliance":"Compliance Monitoring","audit-risk":"Risk Management","audit-fraud":"Fraud Detection",
        "audit-reports":"Reports","audit-analytics":"Analytics","audit-documents":"Documents","audit-calendar":"Calendar",
        "audit-notifications":"Notifications",settings:"Settings"},
      icons:{"audit-plans":"clock",audits:"audit","audit-findings":"file","audit-investigations":"search",
        "audit-recommendations":"approvals","audit-compliance":"shield","audit-risk":"reports","audit-fraud":"bell",
        "audit-reports":"reports","audit-analytics":"reports","audit-documents":"file","audit-calendar":"clock",
        "audit-notifications":"bell"}
    }
  };
  const meta={
    "welfare-requests":["Member support","Welfare Requests"],"welfare-emergencies":["Urgent support","Emergency Cases"],
    "welfare-contributions":["Welfare funding","Contributions"],"welfare-beneficiaries":["Support history","Beneficiaries"],
    "welfare-approvals":["Committee authority","Approvals"],"welfare-payments":["Finance handoff","Payments"],
    "welfare-activities":["Social support","Activities & Events"],"welfare-meetings":["Governance","Committee Meetings"],
    "welfare-reports":["Welfare reporting","Reports"],"welfare-analytics":["Support intelligence","Analytics"],
    "welfare-documents":["Welfare evidence","Documents"],"welfare-notifications":["Welfare alerts","Notifications"],
    "welfare-search":["Welfare search","Search results"],
    "legal-cases":["Confidential matters","Legal Cases"],"legal-contracts":["Lifecycle control","Contracts"],
    "legal-agreements":["Official agreements","Agreements"],"legal-policies":["Governance documents","Policies"],"legal-constitution":["Founding document","Organization Constitution"],
    "legal-disciplinary":["Member discipline","Disciplinary Cases"],"legal-complaints":["Case intake","Complaints"],
    "legal-opinions":["Legal advice","Legal Opinions"],"legal-compliance":["Legal assurance","Compliance"],
    "legal-court":["Litigation","Court Matters"],"legal-reports":["Legal reporting","Reports"],
    "legal-documents":["Secure records","Documents"],"legal-calendar":["Deadlines","Calendar"],
    "legal-notifications":["Legal alerts","Notifications"],"legal-search":["Legal search","Search results"],
    "audit-plans":["Assurance planning","Audit Plans"],audits:["Engagement management","Audits"],
    "audit-findings":["Evidence and exceptions","Audit Findings"],"audit-investigations":["Independent review","Investigations"],
    "audit-recommendations":["Remediation control","Recommendations"],"audit-compliance":["Control assurance","Compliance Monitoring"],
    "audit-risk":["Enterprise exposure","Risk Management"],"audit-fraud":["Automated monitoring","Fraud Detection"],
    "audit-reports":["Independent assurance","Reports"],"audit-analytics":["Risk intelligence","Analytics"],
    "audit-documents":["Protected evidence","Documents"],"audit-calendar":["Assurance schedule","Calendar"],
    "audit-notifications":["Risk alerts","Notifications"],"audit-search":["Audit search","Search results"]
  };
  Object.assign(pageMeta,meta);
  Object.entries(configs).forEach(([role,config])=>{ rolePages[role]=config.pages; });

  function esc(value){return escapeHtml(value==null?"":String(value));}
  function date(value,time=false){if(!value)return " - ";const d=new Date(value);return Number.isNaN(d.getTime())?esc(value):(time?d.toLocaleString():d.toLocaleDateString());}
  function badge(value,className=""){const text=String(value||"pending").replaceAll("_"," ");return `<span class="dept-tag ${className||text.toLowerCase().replaceAll(" ","-")}">${esc(text)}</span>`;}
  function risk(value){return badge(value,`risk-${String(value||"low").toLowerCase()}`);}
  function panel(title,sub,body,className=""){return `<section class="dept-panel ${className}"><div class="dept-panel-head"><div><h3>${title}</h3><p>${sub}</p></div></div>${body}</section>`;}
  function empty(text){return `<div class="dept-empty">${icons.file}<p>${text}</p></div>`;}
  function table(headers,rows){return `<div class="table-scroll"><table><thead><tr>${headers.map(x=>`<th>${x}</th>`).join("")}</tr></thead><tbody>${rows||`<tr><td colspan="${headers.length}">No records available.</td></tr>`}</tbody></table></div>`;}
  function options(items,label="name"){return (items||[]).map(x=>`<option value="${x.id}">${esc(x[label]||x.fullName||x.name)}</option>`).join("");}
  function go(page){state.page=page;render();window.scrollTo(0,0);}
  function modal(title,sub,form){document.body.insertAdjacentHTML("beforeend",`<div class="modal-backdrop" id="modal-backdrop"><div class="modal dept-modal"><div class="modal-head"><div><h2>${title}</h2><p>${sub}</p></div><button class="modal-close" data-close>${icons.x}</button></div>${form}</div></div>`);document.querySelector("[data-close]").onclick=closeModal;document.getElementById("modal-backdrop").addEventListener("click",event=>{if(event.target.id==="modal-backdrop")closeModal();});}
  function effectiveConfig(){
    if(state.executiveWorkspace==="welfare") return configs["Welfare Officer"];
    if(state.executiveWorkspace==="legal") return configs["Legal Officer"];
    if(state.executiveWorkspace==="audit") return configs.Auditor;
    if(state.executiveWorkspace==="supervisory") return configs["Supervisory Officer"];
    return configs[state.role];
  }
  async function reload(message=""){const cfg=effectiveConfig();if(!cfg)return;state[cfg.key==="audit"?"auditCenter":cfg.key]=await api(`/api/${cfg.key}/command-center`);render();if(message)toast(message);}
  function download(name,rows=[],format="excel"){const cfg=effectiveConfig();if(!cfg)return;downloadGeneratedReport(cfg.key,name,format);}

  const ui=window.DepartmentUi={configs,views:{},dashboards:{},settings:{},actions:{},binders:[],subtitles:{},quick:{},esc,date,badge,risk,panel,empty,table,options,go,modal,reload,download,effectiveConfig};

  const baseRefresh=refreshData;
  refreshData=async function(){await baseRefresh();const cfg=effectiveConfig();if(cfg&&(configs[state.role]||["welfare","legal","audit","supervisory"].includes(state.executiveWorkspace)))state[cfg.key==="audit"?"auditCenter":cfg.key]=await api(`/api/${cfg.key}/command-center`);};

  function deptSidebar(cfg){
    const data=state[cfg.key==="audit"?"auditCenter":cfg.key];
    const badgeValue=cfg.key==="audit"?data?.stats?.highRiskFindings:cfg.key==="legal"?data?.stats?.upcomingDeadlines:data?.stats?.emergencyCases;
    const badgePage=cfg.key==="audit"?"audit-findings":cfg.key==="legal"?"legal-calendar":"welfare-emergencies";
    return `<aside class="sidebar executive-sidebar ${cfg.key}-sidebar" id="sidebar"><div class="executive-brand"><div class="executive-crest ${cfg.key}-crest">${icons[cfg.key==="welfare"?"users":cfg.key==="legal"?"shield":"audit"]}</div><div><strong>KASANGATI G40<br>KWAGALANA</strong><span>${cfg.title.toUpperCase()}</span></div></div>
      <nav class="nav executive-nav">${(cfg.sidebarPages||cfg.pages).filter(x=>!x.endsWith("-search")&&cfg.pages.includes(x)).map(page=>`<button class="nav-item ${state.page===page?"active":""}" data-page="${page}">${icons[cfg.icons[page]||page]||icons.dashboard}<span>${cfg.labels[page]}</span>${page===badgePage&&badgeValue?`<b class="nav-badge">${badgeValue}</b>`:""}</button>`).join("")}</nav>
      <div class="sidebar-bottom">${state.executiveWorkspace?`<button class="executive-quick" data-executive-workspace-exit>${icons.arrowUp}<span>Back to Executive</span></button>`:`<button class="executive-quick" data-dept-quick="${cfg.key}">${icons.arrowUp}<span>Quick Actions</span><b>^</b></button>`}<div class="sidebar-user"><div class="avatar blue">${profileImage(state.user.id,actor(),state.user.has_profile_photo)}</div><div><div class="user-name">${esc(actor())}</div><div class="user-role">${state.executiveWorkspace?"Executive read-only view":cfg.title}</div></div></div></div></aside>`;
  }
  const baseSidebar=sidebar;
  sidebar=function(){const cfg=effectiveConfig();const html=cfg?deptSidebar(cfg):baseSidebar();return typeof injectWorkspaceSwitcher==="function"?injectWorkspaceSwitcher(html):html;};

  const baseSubtitle=subtitle;
  subtitle=function(){const cfg=effectiveConfig();if(!cfg)return baseSubtitle();if(ui.subtitles[cfg.key])return ui.subtitles[cfg.key]();return `${cfg.title} records, workflows, reports and controlled decisions.`;};

  const baseHeadActions=headActions;
  headActions=function(){const cfg=effectiveConfig();if(state.executiveWorkspace)return "";return cfg&&ui.actions[cfg.key]?ui.actions[cfg.key]():baseHeadActions();};

  const baseDashboard=dashboardView;
  dashboardView=function(){const cfg=effectiveConfig();return cfg&&ui.dashboards[cfg.key]?ui.dashboards[cfg.key]():baseDashboard();};

  const baseView=view;
  view=function(){const cfg=effectiveConfig();if(cfg){if(state.page==="settings"&&ui.settings[cfg.key])return ui.settings[cfg.key]();if(ui.views[state.page])return ui.views[state.page]();}return baseView();};

  const baseRender=render;
  render=function(){baseRender();const cfg=effectiveConfig();if(!cfg)return;const eyebrow=document.querySelector(".page-head .eyebrow");const title=document.querySelector(".page-head h1");if(state.page==="dashboard"){if(eyebrow)eyebrow.textContent=cfg.title;if(title)title.textContent=cfg.dashboardTitle;}const search=document.getElementById("global-search");if(search)search.placeholder=cfg.key==="audit"?"Search audit, finding, risk, investigation, recommendation...":cfg.key==="legal"?"Search case, contract, policy, complaint, court file...":"Search member, request, receipt, beneficiary, activity...";};

  function installSearch(){
    const cfg=effectiveConfig(),input=document.getElementById("global-search");if(!cfg||!input)return;
    const clone=input.cloneNode(true);input.replaceWith(clone);let timer;
    clone.addEventListener("input",event=>{searchTerm=event.target.value;clearTimeout(timer);if(searchTerm.length<2)return;timer=setTimeout(async()=>{try{state[`${cfg.key}SearchResults`]=(await api(`/api/${cfg.key}/search?q=${encodeURIComponent(searchTerm)}`)).results;state.page=`${cfg.key}-search`;render();const next=document.getElementById("global-search");next?.focus();next?.setSelectionRange(searchTerm.length,searchTerm.length);}catch(error){toast(error.message);}},260);});
  }
  const baseBind=bind;
  bind=function(){baseBind();const cfg=effectiveConfig();if(!cfg)return;installSearch();document.querySelectorAll("[data-dept-target]").forEach(x=>x.addEventListener("click",()=>go(x.dataset.deptTarget)));document.querySelectorAll("[data-dept-modal]").forEach(x=>x.addEventListener("click",()=>{if(state.executiveWorkspace)return toast("Executive is viewing this dashboard read-only.");ui.quick[cfg.key]?.(x.dataset.deptModal);}));document.querySelectorAll("[data-dept-report]").forEach(x=>{if(!x.parentElement.querySelector("[data-dept-report-preview]")){const preview=document.createElement("button");preview.type="button";preview.dataset.deptReportPreview=x.dataset.deptReport;preview.innerHTML=`${icons.eye}Preview`;x.before(preview);}x.addEventListener("click",()=>ui.actions[`${cfg.key}Report`]?.(x.dataset.deptReport));});document.querySelectorAll("[data-dept-report-preview]").forEach(x=>x.addEventListener("click",()=>openOperationalReportPreview(cfg.key,x.dataset.deptReportPreview)));document.querySelectorAll("[data-dept-quick]").forEach(x=>x.addEventListener("click",()=>{if(state.executiveWorkspace)return toast("Executive is viewing this dashboard read-only.");ui.quick[cfg.key]?.("menu");}));ui.binders.forEach(fn=>fn(cfg));};
})();
