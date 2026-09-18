/* Documents Department — central registry for operating departments plus General. */
(() => {
  const D=window.DepartmentUi,{esc,date,badge,risk,panel,empty,table,options,modal,reload,download}=D;
  const VIEW_DEPTS=[
    {code:"credits",page:"docs-credits",name:"Credits",tone:"orange",icon:"wallet",note:"Loan and credit records"},
    {code:"investment",page:"docs-investment",name:"Investment",tone:"teal",icon:"reports",note:"Projects and proposals"},
    {code:"finance",page:"docs-finance",name:"Finance",tone:"green",icon:"receipt",note:"Accounts and reports"},
    {code:"welfare",page:"docs-welfare",name:"Welfare",tone:"violet",icon:"users",note:"Support and contributions"},
    {code:"supervisory",page:"docs-supervisory",name:"Supervisory",tone:"blue",icon:"shield",note:"Oversight records"},
    {code:"audit",page:"docs-audit",name:"Audit",tone:"red",icon:"audit",note:"Assurance evidence"},
    {code:"executive",page:"docs-executive",name:"Executive",tone:"blue",icon:"building",note:"Governance and minutes"}
  ];
  const LIBRARY_DEPTS=[
    ...VIEW_DEPTS,
    {code:"general",page:"docs-general",name:"General",tone:"violet",icon:"file",note:"Shared organization documents"}
  ];
  const TYPE_BY_DEPT={
    credits:["Policies","Credit Reports","Loan Supporting Documents","Agreements","Minutes","Annual Reports"],
    investment:["Policies","Investment Proposals","Signed Contracts","Performance Reports","Agreements","Minutes"],
    finance:["Annual Reports","Financial Statements","Bank Reconciliations","Payment Support","Policies","Minutes"],
    welfare:["Policies","Welfare Reports","Contribution Records","Support Decisions","Minutes","Agreements"],
    supervisory:["Policies","Supervisory Reports","Inspection Notes","Minutes","Agreements"],
    audit:["Audit Reports","Findings","Working Papers","Policies","Minutes"],
    executive:["Constitution","Bylaws","Policies","Minutes","Board Minutes","Meeting Minutes","Signed Contracts","Agreements"],
    general:["Policies","Minutes","Agreements","Annual Reports","Legal Documents"]
  };
  const emptyLegal={
    stats:{activeCases:0,contractsUnderReview:0,contractsApproved:0,policiesAwaitingReview:0,disciplinaryCases:0,legalNotices:0,pendingLegalOpinions:0,complianceScore:0,courtCases:0,upcomingDeadlines:0,resolvedCases:0,legalDocuments:0,documentRecords:0},
    cases:[],contracts:[],policies:[],complaints:[],opinions:[],compliance:[],courtMatters:[],documents:[],documentLibrary:[],departments:[],deadlines:[],notifications:[],
    access:{authorityLevel:1,canCreate:false,canEdit:false,canApprove:false}
  };
  const L=()=>state.legal||emptyLegal;
  const formEnd=label=>`<div class="form-actions"><button type="button" class="button secondary" data-close-modal>Cancel</button><button type="submit" class="button primary">${label}</button></div>`;
  const parseAudience=value=>{
    if(Array.isArray(value))return value.map(x=>String(x||"").toLowerCase()).filter(Boolean);
    if(!value)return [];
    try{const parsed=JSON.parse(value);if(Array.isArray(parsed))return parsed.map(x=>String(x||"").toLowerCase()).filter(Boolean);}catch(_){/* ignore */}
    return String(value).split(/[,;]+/).map(x=>x.trim().toLowerCase()).filter(Boolean);
  };
  const audienceModeFromDoc=doc=>{
    const level=Number(doc?.visibilityLevel||2);
    if(level<=1)return "members";
    if(level===3)return "departments";
    return "all";
  };
  const audienceLabel=doc=>{
    const mode=audienceModeFromDoc(doc);
    if(mode==="members")return "Members";
    if(mode==="all")return "All departments";
    const codes=parseAudience(doc?.audienceDepartments);
    if(!codes.length)return "Selected departments";
    const names=codes.map(code=>VIEW_DEPTS.find(x=>x.code===code)?.name||code);
    return names.length<=2?names.join(", "):`${names.slice(0,2).join(", ")} +${names.length-2}`;
  };
  const canManageDocuments=()=>["Legal Officer","System Admin"].includes(state.role)||L().access.canEdit||L().access.canCreate;
  const libraryMeta=code=>LIBRARY_DEPTS.find(x=>x.code===code)||{code,page:`docs-${code}`,name:code,tone:"blue",icon:"file",note:"Department documents"};
  const libraryRows=()=>{
    const fromApi=L().documentLibrary;
    const base=Array.isArray(fromApi)&&fromApi.length?fromApi:LIBRARY_DEPTS.map(meta=>{
      const docs=(L().documents||[]).filter(d=>String(d.departmentCode||d.department||"").toLowerCase()===meta.code);
      return {...meta,documentCount:docs.length,documents:docs};
    });
    const byCode=new Map(base.map(row=>[String(row.code||"").toLowerCase(),row]));
    return LIBRARY_DEPTS.map(meta=>{
      const hit=byCode.get(meta.code);
      if(hit)return {...meta,...hit,name:hit.name||meta.name,page:hit.page||meta.page};
      return {...meta,documentCount:0,documents:[]};
    });
  };
  const docsForPage=page=>{
    const meta=LIBRARY_DEPTS.find(x=>x.page===page);
    if(!meta)return L().documents||[];
    const bucket=libraryRows().find(x=>x.code===meta.code);
    return bucket?.documents||(L().documents||[]).filter(d=>String(d.departmentCode||"").toLowerCase()===meta.code);
  };
  const pageDeptCode=()=>{
    const hit=LIBRARY_DEPTS.find(x=>x.page===state.page);
    return hit?.code||"";
  };
  function documentTable(rows){
    if(!rows.length)return empty("No documents uploaded for this department yet.");
    return `<div class="legal-document-list">${rows.map(x=>`<article class="legal-document-card">
      <div class="legal-document-copy"><small>${esc(x.reference)} · ${esc(x.documentType)} · v${esc(x.version||"1.0")}${x.departmentName?` · ${esc(x.departmentName)}`:""}</small>
        <strong>${esc(x.title)}</strong>
        <span>${badge(x.status)}<i>Updated ${date(x.updatedAt,true)}</i></span>
        <p>${esc(x.fileName||"No file uploaded")}</p>
      </div>
      <div class="document-actions legal-document-actions">
        ${x.hasFile?`<a class="mini-btn" href="/api/documents/${x.id}/view" target="_blank" title="View">${icons.eye}<span>View</span></a>
        <a class="mini-btn" href="/api/documents/${x.id}/download" title="Download">${icons.download}<span>Download</span></a>`:`<span class="status pending">No file</span>`}
        ${canManageDocuments()?`<button class="mini-btn" data-legal-document="${x.id}" title="Upload or replace file">${icons.refresh}<span>Replace</span></button>
        <button class="mini-btn document-delete" data-delete-document="${x.id}" data-document-title="${esc(x.title)}" title="Delete document">${icons.trash}<span>Delete</span></button>`:""}
      </div>
    </article>`).join("")}</div>`;
  }
  function departmentShelf(meta){
    const count=Number(meta.documentCount||meta.documents?.length||0);
    return `<button class="legal-stat ${meta.tone}" data-dept-target="${meta.page}">
      <span>${icons[meta.icon]||icons.file}</span>
      <div><small>${esc(meta.name)}</small><strong>${count}</strong><em>${count===1?"document on file":"documents on file"}</em></div>
    </button>`;
  }
  D.dashboards.legal=()=>{
    const shelves=libraryRows();
    return `<div class="legal-command">
      <div class="legal-confidential">${icons.file}<div><strong>Organization document registry</strong><span>Open a department card to browse or add its documents. Choose who can see each file when you upload.</span></div><b>REGISTRY</b></div>
      <div class="legal-stats">${shelves.map(departmentShelf).join("")}</div>
    </div>`;
  };
  D.subtitles.legal=()=>{
    const code=pageDeptCode();
    if(code){const meta=libraryMeta(code);return `${meta.name} documents — choose All departments, selected departments, or members for visibility.`;}
    if(state.page==="dashboard")return "Central document registry for Credits, Investment, Finance, Welfare, Supervisory, Audit, Executive and General.";
    return "Protected organization documents with controlled department visibility.";
  };
  function departmentDocumentsView(code){
    const meta=libraryMeta(code);
    const rows=docsForPage(meta.page);
    return panel(`${meta.name} documents`,`${rows.length} document${rows.length===1?"":"s"} · ${esc(meta.note||"Department documents")}`,documentTable(rows));
  }
  LIBRARY_DEPTS.forEach(meta=>{D.views[meta.page]=()=>departmentDocumentsView(meta.code);});
  D.views["legal-documents"]=()=>panel("All department documents","Every file held in the organization document registry",documentTable(L().documents||[]));
  D.views["legal-notifications"]=()=>panel("Document notifications","Uploads, publication and registry alerts",`<div class="dept-notification-list large">${(L().notifications||[]).map(x=>`<button data-dept-target="${esc(x.target||"dashboard")}"><span class="${esc(x.level)}">${icons[x.level==="success"?"check":x.level==="info"?"info":"bell"]}</span><div><strong>${esc(x.title)}</strong><small>${esc(relativeTime(x.createdAt||x.time))}</small></div></button>`).join("")||empty("No alerts yet.")}</div>`);
  D.views["legal-search"]=()=>panel("Document search results",`${(state.legalSearchResults||[]).length} records found`,table(["Type","Reference","Record","Detail","Open"],(state.legalSearchResults||[]).map(x=>`<tr><td>${badge(x.type)}</td><td><strong>${esc(x.reference)}</strong></td><td>${esc(x.title)}</td><td>${esc(x.detail)}</td><td><button class="mini-btn" data-dept-target="${esc(x.target)}">${icons.eye}</button></td></tr>`).join("")));
  function caseTable(rows,action=true){return table(["Case","Subject / category","Department","Risk","Officer","Hearing","Status","Action"],rows.map(x=>`<tr><td><strong>${esc(x.caseNumber)}</strong></td><td class="wide-cell"><b>${esc(x.subject)}</b><small>${esc(x.category)}  -  ${esc(x.description)}</small></td><td>${esc(x.department||"Organization")}</td><td>${risk(x.riskLevel)}</td><td>${esc(x.assignedOfficer||"Unassigned")}</td><td>${date(x.nextHearingAt,true)}</td><td>${badge(x.status)}</td><td>${action?`<button class="mini-btn" data-legal-case="${x.id}">${icons.refresh}</button>`:" - "}</td></tr>`).join(""));}
  function contractTable(rows,action=true){return table(["Contract","Parties / department","Value","Start / end","Responsible","Status","Action"],rows.map(x=>`<tr><td class="wide-cell"><strong>${esc(x.contractNumber)}  -  ${esc(x.title)}</strong><small>${esc(x.contractType)}</small></td><td>${esc(x.parties)}<small>${esc(x.department||"Organization")}</small></td><td><strong>${money(x.contractValue)}</strong></td><td>${date(x.startsOn)}<small>Ends ${date(x.endsOn)}</small></td><td>${esc(x.responsibleOfficer||"Unassigned")}</td><td>${badge(x.status)}</td><td>${action&&["draft","submitted","under_review","information_requested"].includes(x.status)?`<button class="mini-btn" data-legal-contract="${x.id}">${icons.eye}</button>`:" - "}</td></tr>`).join(""));}
  D.views["legal-cases"]=()=>panel("Legal case register","Legacy case register",caseTable(L().cases,true));
  D.views["legal-disciplinary"]=()=>panel("Disciplinary case register","Member violations",caseTable(L().cases.filter(x=>String(x.category||"").toLowerCase().includes("disciplinary")),true));
  D.views["legal-contracts"]=()=>panel("Contract lifecycle register","Contracts and agreements",contractTable(L().contracts,true));
  D.views["legal-agreements"]=()=>panel("Agreement register","MoUs and agreements",contractTable(L().contracts.filter(x=>/agreement|mou|partnership|lease/i.test(x.contractType)),true));
  D.views["legal-policies"]=()=>panel("Policy register","Policy versions",table(["Policy","Category","Version","Effective","Review","Status"],L().policies.map(x=>`<tr><td><strong>${esc(x.reference)}  -  ${esc(x.policyName)}</strong></td><td>${esc(x.policyCategory)}</td><td>${esc(x.version)}</td><td>${date(x.effectiveDate)}</td><td>${date(x.reviewDate)}</td><td>${badge(x.status)}</td></tr>`).join("")));
  D.views["legal-constitution"]=()=>panel("Organization Constitution","Constitution files held under Executive",documentTable((L().documents||[]).filter(x=>x.documentType==="Constitution")));
  D.views["legal-complaints"]=()=>panel("Complaint register","Complaint intake",table(["Complaint","Complainant","Department","Status"],L().complaints.map(x=>`<tr><td><strong>${esc(x.complaintNumber)}</strong></td><td>${esc(x.complainant)}</td><td>${esc(x.department||"Organization")}</td><td>${badge(x.status)}</td></tr>`).join("")));
  D.views["legal-opinions"]=()=>panel("Legal opinion register","Opinion requests",table(["Opinion","Department","Due","Status"],L().opinions.map(x=>`<tr><td><strong>${esc(x.reference)}  -  ${esc(x.title)}</strong></td><td>${esc(x.department||"Organization")}</td><td>${date(x.dueDate)}</td><td>${badge(x.status)}</td></tr>`).join("")));
  D.views["legal-compliance"]=()=>`<div class="dept-page"><div class="audit-compliance-cards">${L().compliance.map(x=>`<article><h3>${esc(x.department||"Organization")}</h3><p>${esc(x.requirement)}</p>${badge(x.status)}</article>`).join("")}</div></div>`;
  D.views["legal-court"]=()=>panel("Court matters","Litigation register",table(["Court file","Matter","Status"],L().courtMatters.map(x=>`<tr><td><strong>${esc(x.courtFile)}</strong></td><td>${esc(x.title)}</td><td>${badge(x.status)}</td></tr>`).join("")));
  D.views["legal-reports"]=()=>{const reports=["Department Document Report","Credits Document Report","Finance Document Report","Audit Document Report"];return `<div class="exec-report-grid">${reports.map((x,i)=>`<article><span class="${["blue","green","violet","orange"][i%4]}">${icons.file}</span><div><h3>${x}</h3><p>Registry extract by department.</p></div><button data-dept-report="${x}">${icons.download}Download</button></article>`).join("")}</div>`;};
  D.views["legal-calendar"]=()=>panel("Document calendar","Review dates and deadlines",`<div class="audit-full-calendar">${(L().deadlines||[]).map(x=>`<article><time><b>${new Date(x.date).getDate()}</b><span>${new Date(x.date).toLocaleString("en",{month:"short",year:"numeric"})}</span></time><div><small>${esc(x.type)}  -  ${esc(x.reference)}</small><h3>${esc(x.title)}</h3></div>${risk(x.risk)}<button data-dept-target="${esc(x.target)}">Open</button></article>`).join("")||empty("No deadlines recorded.")}</div>`);
  D.settings.legal=()=>`<div class="audit-settings-grid">${panel("Document authority","Central registry for all departments",`<div class="audit-permission-list"><div>${icons.check}<span><b>Upload documents for any department</b><small>Authority level ${L().access.authorityLevel}</small></span></div><div>${icons.check}<span><b>Set visibility</b><small>All departments, selected departments, or members</small></span></div></div>`)}${panel("Bio-data & settings","Member records stay available here",`<div class="audit-readonly-note">${icons.users}<div><strong>Bio Data remains in this workspace</strong><p>Member registration and bio-data stay under Documents Department administration.</p></div></div>`)}</div>`;
  D.actions.legal=()=>{
    const code=pageDeptCode();
    if(state.page==="dashboard"||state.page==="legal-documents"||code){
      return `<div class="head-actions"><button class="button primary" data-dept-modal="document">${icons.plus}${code?`Add ${libraryMeta(code).name} document`:"Upload document"}</button></div>`;
    }
    return "";
  };
  D.actions.legalReport=name=>download(name,L().documents||[]);
  function syncAudiencePicker(form){
    const mode=form.querySelector('[name="audienceMode"]')?.value||"all";
    const picker=form.querySelector("[data-audience-departments]");
    if(picker)picker.hidden=mode!=="departments";
  }
  function documentForm(existing=null,preset={}){
    const current=existing||preset||{};
    const preferred=String(current.departmentCode||pageDeptCode()||"credits");
    const types=TYPE_BY_DEPT[preferred]||TYPE_BY_DEPT.executive;
    const allTypes=[...new Set([...types,"Policies","Minutes","Agreements","Signed Contracts","Annual Reports","Audit Reports","Legal Documents","Constitution","Bylaws"])];
    const mode=audienceModeFromDoc(current);
    const selected=new Set(parseAudience(current.audienceDepartments));
    if(mode==="departments"&&!selected.size)selected.add(preferred);
    const deptOptions=LIBRARY_DEPTS.map(x=>`<option value="${x.code}" ${preferred===x.code?"selected":""}>${esc(x.name)}</option>`).join("");
    const deptChecks=VIEW_DEPTS.map(x=>`<label class="doc-audience-option"><input type="checkbox" name="audienceDepartments" value="${x.code}" ${selected.has(x.code)?"checked":""}><span>${esc(x.name)}</span></label>`).join("");
    modal(existing?"Update document":"Upload document","File under a department library, then choose who can see it.",`<form class="form" data-legal-document-form="${current.id||""}"><div class="form-grid">
      <div class="field full"><label>Document title</label><input name="title" value="${esc(current.title||"")}" required></div>
      <div class="field"><label>Department library</label><select name="department" required>${deptOptions}</select><small>Document is stored under this department.</small></div>
      <div class="field"><label>Document type</label><select name="documentType">${allTypes.map(x=>`<option ${current.documentType===x||(x==="Minutes"&&["Board Minutes","Meeting Minutes"].includes(current.documentType))?"selected":""}>${x}</option>`).join("")}</select></div>
      <div class="field"><label>Version</label><input name="version" value="${esc(current.version||"1.0")}" required></div>
      <div class="field"><label>Who can see it</label><select name="audienceMode">
        <option value="all" ${mode==="all"?"selected":""}>All departments</option>
        <option value="departments" ${mode==="departments"?"selected":""}>Departments</option>
        <option value="members" ${mode==="members"?"selected":""}>Members</option>
      </select><small>Choose Departments to pick one or more departments.</small></div>
      <div class="field"><label>Publication</label><select name="status">
        <option value="published" ${!current.status||current.status==="published"?"selected":""}>Publish now</option>
        <option value="draft" ${current.status==="draft"?"selected":""}>Save draft</option>
        <option value="pending_executive" ${current.status==="pending_executive"?"selected":""}>Request Executive publication</option>
      </select></div>
      <div class="field full doc-audience-picker" data-audience-departments ${mode==="departments"?"":"hidden"}><label>Select departments</label><div class="doc-audience-grid">${deptChecks}</div></div>
      <div class="field full"><label>${existing?"Upload a new file version":"Choose document file"}</label><input name="file" type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,image/*" ${existing?"":"required"}><small>Word (.docx) files are converted to PDF for clear in-app viewing.</small></div>
    </div>${formEnd(existing?"Save document":"Upload document")}</form>`);
    const form=document.querySelector("[data-legal-document-form]");
    form?.querySelector('[name="audienceMode"]')?.addEventListener("change",()=>syncAudiencePicker(form));
    syncAudiencePicker(form);
    form?.addEventListener("submit",async event=>{
      event.preventDefault();
      const data=new FormData(form),file=data.get("file");
      const audienceMode=String(data.get("audienceMode")||"all");
      const audienceDepartments=data.getAll("audienceDepartments").map(value=>String(value).toLowerCase());
      if(audienceMode==="departments"&&!audienceDepartments.length){toast("Select at least one department that can see this document.");return;}
      const body={
        title:data.get("title"),
        documentType:data.get("documentType"),
        version:data.get("version"),
        status:data.get("status"),
        audienceMode:audienceMode==="all"?"general":audienceMode,
        audienceDepartments,
        visibilityLevel:audienceMode==="members"?1:audienceMode==="departments"?3:2,
        department:String(data.get("department")||preferred).toLowerCase()
      };
      try{
        let id=form.dataset.legalDocumentForm;
        if(id){await api(`/api/documents/${id}`,{method:"PATCH",body:JSON.stringify(body)});}
        else{id=(await api("/api/documents",{method:"POST",body:JSON.stringify(body)})).id;}
        if(file?.size){
          const upload=new FormData();upload.append("file",file);upload.append("version",body.version);
          const response=await fetch(`/api/documents/${id}/versions`,{method:"POST",credentials:"same-origin",body:upload});
          const result=await response.json();
          if(!response.ok)throw new Error(result.error||"Document upload failed");
        }
        closeModal();
        await reload(body.status==="published"?`Document published (${audienceLabel(body)}).`:"Document saved.");
      }catch(error){toast(error.message);}
    });
  }
  function quick(type){
    if(type==="menu")return modal("Document quick actions","Add to a department library",`<div class="dept-quick-grid">${LIBRARY_DEPTS.map(x=>`<button data-dept-target="${x.page}">${icons[x.icon]||icons.file}<b>${esc(x.name)}</b></button>`).join("")}<button data-dept-modal="document">${icons.plus}<b>Upload document</b></button></div>`);
    if(type==="document")return documentForm(null,{departmentCode:pageDeptCode()||"credits",visibilityLevel:2});
  }
  D.quick.legal=quick;
  D.binders.push(cfg=>{if(cfg.key!=="legal")return;document.querySelectorAll("[data-legal-document]").forEach(x=>x.addEventListener("click",()=>documentForm(L().documents.find(d=>String(d.id)===x.dataset.legalDocument))));});
  D.binders.push(cfg=>{if(cfg.key!=="legal")return;document.querySelectorAll("[data-legal-contract]").forEach(x=>x.addEventListener("click",async()=>{const decision=prompt("Decision: approve, reject, more_information","approve");if(!decision)return;const comment=prompt("Legal review note:","Legal requirements verified.")||"";try{await api(`/api/legal/contracts/${x.dataset.legalContract}/decision`,{method:"POST",body:JSON.stringify({decision,comment})});await reload("Contract review recorded.");}catch(error){toast(error.message);}}));document.querySelectorAll("[data-legal-case]").forEach(x=>x.addEventListener("click",async()=>{const status=prompt("Case status: open, investigation, hearing, appeal, resolved, closed","investigation");if(!status)return;const note=prompt("Timeline note or decision:","")||"";try{await api(`/api/legal/cases/${x.dataset.legalCase}/update`,{method:"POST",body:JSON.stringify({status,note})});await reload("Case timeline updated.");}catch(error){toast(error.message);}}));document.querySelectorAll("[data-legal-complaint]").forEach(x=>x.addEventListener("click",async()=>{const status=prompt("Complaint stage: submitted, legal_review, investigation, recommendation, decision, closed","legal_review");if(!status)return;const comment=prompt("Recommendation or decision note:","")||"";try{await api(`/api/legal/complaints/${x.dataset.legalComplaint}/advance`,{method:"POST",body:JSON.stringify({status,comment})});await reload("Complaint stage updated.");}catch(error){toast(error.message);}}));});
})();
