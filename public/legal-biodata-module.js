/* Protected member bio-data register inside the Legal Department. */
(() => {
  const D=window.DepartmentUi;
  if(!D)return;
  const {esc,date,badge,panel,empty,table,modal}=D,config=D.configs["Legal Officer"];
  if(!config)return;
  if(!document.querySelector('link[href*="legal-biodata-styles.css"]')){
    const link=document.createElement("link");link.rel="stylesheet";link.href="/legal-biodata-styles.css?v=35";document.head.appendChild(link);
  }
  if(!config.pages.includes("legal-bio-data"))config.pages.splice(1,0,"legal-bio-data");
  config.labels["legal-bio-data"]="Bio Data";
  config.icons["legal-bio-data"]="users";
  rolePages["Legal Officer"]=config.pages;
  pageMeta["legal-bio-data"]=["Administration & records","Member Bio Data"];

  const B=()=>state.legalBio||{records:[],stats:{total:0,verified:0,complete:0,attention:0},departments:[],access:{}};
  const value=v=>esc(v||" - ");
  const initials=name=>String(name||"?").split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase();
  const option=(current,name,label=name)=>`<option value="${esc(name)}" ${current===name?"selected":""}>${esc(label.replaceAll("_"," "))}</option>`;
  const deptList=record=>{
    const list=Array.isArray(record.departments)?record.departments:[];
    return list.length?list:[{code:"members",name:"General members",title:record.accountRole||"Member"}];
  };
  async function loadBio(q="",status="all",department="all"){
    state.legalBio=await api(`/api/legal/bio-data?q=${encodeURIComponent(q)}&status=${encodeURIComponent(status)}&department=${encodeURIComponent(department)}`);
    return state.legalBio;
  }
  const baseRefresh=refreshData;
  refreshData=async function(){await baseRefresh();if(state.role==="Legal Officer")await loadBio();};

  function profile(record){
    const depts=deptList(record);
    return `<article class="bio-card ${record.bioStatus}">
      <header><div class="bio-avatar">${record.hasPassportPhoto?`<img src="/api/legal/members/${record.memberId}/passport-photo" alt="${esc(record.fullName)}">`:initials(record.fullName)}</div><div><small>${esc(record.memberNumber)}</small><h3>${esc(record.fullName)}</h3><span>${esc(record.branch||"No branch")}</span></div>${badge(record.bioStatus,record.bioStatus==="needs_update"?"risk-high":"")}</header>
      <div class="bio-dept-tags">${depts.map(d=>`<button type="button" class="bio-dept-tag" data-bio-dept-filter="${esc(d.code)}" title="${esc(d.title||d.name)}">${esc(d.name)}</button>`).join("")}</div>
      <dl><div><dt>National ID</dt><dd>${value(record.nationalId)}</dd></div><div><dt>Phone</dt><dd>${value(record.phone)}</dd></div><div><dt>Occupation</dt><dd>${value(record.occupation)}</dd></div><div><dt>Home district</dt><dd>${value(record.homeDistrict||record.address)}</dd></div></dl>
      <div class="bio-login-summary ${record.userId&&record.accountActive?"active":"inactive"}"><span>${icons.lock}</span><div><small>Login account</small><strong>${record.userId?esc(record.loginEmail):"Not created"}</strong><em>${record.userId?`${esc(record.accountRole)} - ${record.accountActive?"Active":"Inactive"}`:"Create from member registration"}</em></div></div>
      <div class="bio-completion"><span>Bio record completeness</span><b>${record.completionPercentage||0}%</b><i><u style="width:${record.completionPercentage||0}%"></u></i></div>
      <footer><button data-bio-view="${record.memberId}">${icons.eye}View details</button>${B().access.canEdit?`<button data-bio-edit="${record.memberId}">${icons.edit||icons.file}Bio data</button>${record.userId?`<button data-bio-account="${record.memberId}">${icons.lock}Account</button>`:""}`:""}</footer>
    </article>`;
  }
  function groupedRecords(){
    const b=B(),selected=b.department||"all";
    if(selected!=="all"){
      const label=(b.departments||[]).find(d=>d.code===selected)?.name||selected;
      return `<section class="bio-dept-section"><div class="bio-dept-head"><h3>${esc(label)}</h3><p>${b.records.length} member${b.records.length===1?"":"s"}</p></div><div class="bio-grid">${b.records.map(profile).join("")||empty("No members in this department matched the search.")}</div></section>`;
    }
    const order=[...(b.departments||[])];
    const buckets=new Map(order.map(d=>[d.code,[]]));
    if(!buckets.has("members"))buckets.set("members",[]);
    for(const record of b.records){
      const depts=deptList(record);
      const codes=new Set(depts.map(d=>d.code));
      if(!codes.size)codes.add("members");
      for(const code of codes){
        if(!buckets.has(code))buckets.set(code,[]);
        buckets.get(code).push(record);
      }
    }
    const sections=[...buckets.entries()].filter(([,rows])=>rows.length).map(([code,rows])=>{
      const meta=order.find(d=>d.code===code)||{code,name:code==="members"?"General members":code};
      return `<section class="bio-dept-section" id="bio-dept-${esc(code)}"><div class="bio-dept-head"><h3>${esc(meta.name)}</h3><p>${rows.length} member${rows.length===1?"":"s"}</p><button type="button" class="text-button" data-bio-dept-filter="${esc(code)}">View only</button></div><div class="bio-grid">${rows.map(profile).join("")}</div></section>`;
    });
    return sections.join("")||empty("No member bio data matched this search.");
  }
  D.views["legal-bio-data"]=()=>{
    const b=B(),depts=b.departments||[];
    return `<div class="bio-page">
      <div class="bio-protection">${icons.lock}<div><strong>Protected Administration & Records register</strong><span>Bio data is linked automatically to verified membership registration. Filter by department to find officers quickly.</span></div><b>LEGAL ACCESS</b></div>
      <div class="bio-stats">${[["Registered members",b.stats.total,"users","blue"],["Verified bio records",b.stats.verified,"check","green"],["Complete, awaiting verification",b.stats.complete,"file","violet"],["Need attention",b.stats.attention,"bell","orange"]].map(x=>`<article class="${x[3]}"><span>${icons[x[2]]}</span><div><small>${x[0]}</small><strong>${x[1]}</strong></div></article>`).join("")}</div>
      <form class="bio-search" data-bio-search>
        <div>${icons.search}<input name="q" value="${esc(b.query||"")}" placeholder="Search name, member number, National ID, phone, occupation, village, district or next of kin..."></div>
        <select name="department"><option value="all">All departments</option>${depts.map(d=>option(b.department||"all",d.code,`${d.name} (${d.memberCount||0})`)).join("")}</select>
        <select name="status"><option value="all">All bio records</option>${["verified","complete","pending","needs_update"].map(x=>option(b.status,x)).join("")}</select>
        <button class="button primary">${icons.search}Search Bio Data</button>
        <button type="button" class="button secondary" data-bio-clear>Clear</button>
      </form>
      <div class="bio-dept-chips">${[["all","All departments"],...depts.map(d=>[d.code,d.name])].map(([code,label])=>`<button type="button" class="bio-dept-chip ${(b.department||"all")===code?"active":""}" data-bio-dept-filter="${esc(code)}">${esc(label)}${code!=="all"?` <b>${depts.find(d=>d.code===code)?.memberCount||0}</b>`:""}</button>`).join("")}</div>
      <div class="bio-result-head"><div><h2>Member bio-data register</h2><p>${b.records.length} matching protected records${b.department&&b.department!=="all"?` in ${(depts.find(d=>d.code===b.department)||{}).name||b.department}`:""}</p></div><span>${icons.shield}Access is logged and role controlled</span></div>
      ${groupedRecords()}
    </div>`;
  };

  function detail(record){
    modal("Member bio data",`${record.memberNumber}  -  Protected organization record`,`
      <div class="bio-detail">
        <header><div class="bio-avatar large">${record.hasPassportPhoto?`<img src="/api/legal/members/${record.memberId}/passport-photo" alt="${esc(record.fullName)}">`:initials(record.fullName)}</div><div><small>${esc(record.memberNumber)}  -  Joined ${date(record.joinedAt)}</small><h2>${esc(record.fullName)}</h2><p>${esc(record.membershipStatus)} membership  -  ${esc(record.branch||"No branch")}</p></div>${badge(record.bioStatus,record.bioStatus==="needs_update"?"risk-high":"")}</header>
        <section><h3>Registration information</h3><dl><div><dt>National ID</dt><dd>${value(record.nationalId)}</dd></div><div><dt>Phone</dt><dd>${value(record.phone)}</dd></div><div><dt>Email</dt><dd>${value(record.email)}</dd></div><div><dt>Address</dt><dd>${value(record.address)}</dd></div><div><dt>Occupation</dt><dd>${value(record.occupation)}</dd></div><div><dt>Employer</dt><dd>${value(record.employer)}</dd></div><div><dt>Next of kin</dt><dd>${value(record.nextOfKin)}</dd></div><div><dt>Beneficiaries</dt><dd>${value(record.beneficiaries)}</dd></div></dl></section>
        <section><h3>Personal bio data</h3><dl><div><dt>Date of birth</dt><dd>${date(record.dateOfBirth)}</dd></div><div><dt>Gender</dt><dd>${value(record.gender?.replaceAll("_"," "))}</dd></div><div><dt>Marital status</dt><dd>${value(record.maritalStatus)}</dd></div><div><dt>Nationality</dt><dd>${value(record.nationality)}</dd></div></dl></section>
        <section><h3>Home location</h3><dl><div><dt>District</dt><dd>${value(record.homeDistrict)}</dd></div><div><dt>Subcounty</dt><dd>${value(record.subcounty)}</dd></div><div><dt>Parish</dt><dd>${value(record.parish)}</dd></div><div><dt>Village</dt><dd>${value(record.village)}</dd></div></dl></section>
        <section><h3>Emergency contact</h3><dl><div><dt>Contact name</dt><dd>${value(record.emergencyContactName)}</dd></div><div><dt>Contact phone</dt><dd>${value(record.emergencyContactPhone)}</dd></div><div><dt>Relationship</dt><dd>${value(record.emergencyContactRelationship)}</dd></div><div><dt>Verified by</dt><dd>${value(record.verifiedBy)}${record.verifiedAt?`  -  ${date(record.verifiedAt,true)}`:""}</dd></div></dl></section>
        <section><h3>Member login account</h3>${record.userId?`<dl><div><dt>Login email</dt><dd>${value(record.loginEmail)}</dd></div><div><dt>Account role</dt><dd>${value(record.accountRole)}</dd></div><div><dt>Status</dt><dd>${record.accountActive?"Active":"Inactive"}</dd></div><div><dt>Last login</dt><dd>${record.lastLogin?date(record.lastLogin,true):"Never"}</dd></div><div><dt>Password</dt><dd>Protected - cannot be displayed</dd></div><div><dt>Password update</dt><dd>${record.mustChangePassword?"Temporary password must be changed":"Password is set"}</dd></div></dl>`:`<p>No login account is linked to this member yet.</p>`}</section><div class="form-actions"><button class="button secondary" type="button" data-close-modal>Close</button>${B().access.canEdit?`<button class="button primary" type="button" data-bio-edit="${record.memberId}">${icons.edit||icons.file}Update bio data</button>${record.userId?`<button class="button secondary" type="button" data-bio-account="${record.memberId}">${icons.lock}Manage login</button>`:""}`:""}</div>
      </div>`);
    document.querySelector(".bio-detail [data-bio-edit]")?.addEventListener("click",()=>{closeModal();edit(record);});document.querySelector(".bio-detail [data-bio-account]")?.addEventListener("click",()=>{closeModal();accountEditor(record);});
  }
  function accountEditor(record){
    if(!record?.userId)return toast("This member does not yet have a linked login account.");
    modal("Manage member login",`${record.memberNumber} - ${record.fullName}`,`<form class="form" data-bio-account-form="${record.userId}"><div class="bio-readonly-registration">${icons.lock}<span><b>Secure login account</b><small>Passwords are managed by Executive under System accounts. Legal can update email and activation status only.</small></span></div><div class="form-grid"><div class="field full"><label>Login email</label><input name="loginEmail" type="email" value="${esc(record.loginEmail||"")}" required></div><div class="field"><label>Role</label><input value="${esc(record.accountRole||"Member")}" disabled></div><div class="field"><label>Account status</label><label class="bio-account-toggle"><input name="active" type="checkbox" ${record.accountActive?"checked":""}> Active and allowed to sign in</label></div><div class="field full"><label>Password</label><input value="Managed by Executive — System accounts" disabled></div></div><div class="form-actions"><button type="button" class="button secondary" data-close-modal>Cancel</button><button type="submit" class="button primary">Save account</button></div></form>`);
    document.querySelector("[data-bio-account-form]")?.addEventListener("submit",async event=>{event.preventDefault();const form=event.currentTarget;try{await api(`/api/legal/member-accounts/${record.userId}`,{method:"PATCH",body:JSON.stringify({loginEmail:form.elements.loginEmail.value,active:form.elements.active.checked})});closeModal();await loadBio(B().query||"",B().status||"all",B().department||"all");render();toast("Member login account updated.");}catch(error){toast(error.message);}});
  }  function edit(record){
    const fields=[
      ["dateOfBirth","Date of birth","date"],["nationality","Nationality"],["homeDistrict","Home district"],
      ["subcounty","Subcounty"],["parish","Parish"],["village","Village"],
      ["emergencyContactName","Emergency contact name"],["emergencyContactPhone","Emergency contact phone"],
      ["emergencyContactRelationship","Relationship"]
    ];
    modal("Update member bio data",`${record.memberNumber}  -  ${record.fullName}`,`<form class="form bio-edit-form" data-bio-form="${record.memberId}">
      <div class="bio-readonly-registration">${icons.shield}<span><b>Complete editable membership profile</b><small>Changes synchronize to the linked login account and are written to the audit trail.</small></span></div>
      <div class="form-grid">
        <div class="field full"><label>Full legal name</label><input name="fullName" value="${esc(record.fullName||"")}" required></div>
        <div class="field"><label>Email address</label><input name="email" type="email" value="${esc(record.email||"")}"></div>
        <div class="field"><label>Phone number</label><input name="phone" value="${esc(record.phone||"")}" required></div>
        <div class="field"><label>National ID</label><input name="nationalId" value="${esc(record.nationalId||"")}" required></div>
        <div class="field"><label>Membership status</label><select name="membershipStatus">${["active","suspended","inactive"].map(x=>option(record.membershipStatus,x)).join("")}</select></div>
        <div class="field"><label>Occupation</label><input name="occupation" value="${esc(record.occupation||"")}"></div>
        <div class="field"><label>Employer</label><input name="employer" value="${esc(record.employer||"")}"></div>
        <div class="field full"><label>Address</label><input name="address" value="${esc(record.address||"")}"></div>
        <div class="field"><label>Next of kin</label><input name="nextOfKin" value="${esc(record.nextOfKin||"")}"></div>
        <div class="field"><label>Beneficiaries</label><input name="beneficiaries" value="${esc(record.beneficiaries||"")}"></div>
        <div class="field"><label>Gender</label><select name="gender"><option value="">Not recorded</option>${["female","male","other","prefer_not_to_say"].map(x=>option(record.gender,x)).join("")}</select></div>
        <div class="field"><label>Marital status</label><select name="maritalStatus"><option value="">Not recorded</option>${["single","married","divorced","widowed","separated","other"].map(x=>option(record.maritalStatus,x)).join("")}</select></div>
        ${fields.map(([name,label,type="text"])=>`<div class="field"><label>${label}</label><input name="${name}" type="${type}" value="${esc(record[name]||"")}"></div>`).join("")}
        <div class="field full"><label>Replace passport photo</label><input name="passportPhoto" type="file" accept="image/jpeg,image/png,image/webp"><small>Leave empty to keep the current photo.</small></div>
        <div class="field"><label>Record status</label><select name="bioStatus">${["pending","complete","verified","needs_update"].map(x=>option(record.bioStatus,x)).join("")}</select></div>
      </div>
      <div class="form-actions"><button type="button" class="button secondary" data-close-modal>Cancel</button><button type="submit" class="button primary">${icons.check}Save protected record</button></div>
    </form>`);
    document.querySelector("[data-bio-form]")?.addEventListener("submit",async event=>{
      event.preventDefault();const form=event.currentTarget,formData=new FormData(form),photo=formData.get("passportPhoto"),data=Object.fromEntries(formData);delete data.passportPhoto;
      try{await api(`/api/legal/bio-data/${form.dataset.bioForm}`,{method:"PUT",body:JSON.stringify(data)});if(photo?.size){const uploadData=new FormData();uploadData.append("passportPhoto",photo);const response=await fetch(`/api/legal/members/${form.dataset.bioForm}/passport-photo`,{method:"POST",credentials:"same-origin",body:uploadData});const result=await response.json();if(!response.ok)throw new Error(result.error||"Passport photo upload failed");}closeModal();await loadBio(B().query||"",B().status||"all",B().department||"all");render();toast("Complete member profile saved.");}catch(error){toast(error.message);}
    });
  }
  D.binders.push(cfg=>{
    if(cfg.key!=="legal"||state.page!=="legal-bio-data")return;
    document.querySelector("[data-bio-search]")?.addEventListener("submit",async event=>{
      event.preventDefault();const data=Object.fromEntries(new FormData(event.currentTarget));
      try{await loadBio(data.q,data.status,data.department||"all");render();}catch(error){toast(error.message);}
    });
    document.querySelector("[data-bio-clear]")?.addEventListener("click",async()=>{await loadBio();render();});
    document.querySelectorAll("[data-bio-dept-filter]").forEach(x=>x.addEventListener("click",async()=>{
      try{await loadBio(B().query||"",B().status||"all",x.dataset.bioDeptFilter);render();window.scrollTo(0,0);}catch(error){toast(error.message);}
    }));
    document.querySelectorAll("[data-bio-view]").forEach(x=>x.addEventListener("click",()=>detail(B().records.find(r=>String(r.memberId)===x.dataset.bioView))));
    document.querySelectorAll("[data-bio-edit]").forEach(x=>x.addEventListener("click",()=>{const record=B().records.find(r=>String(r.memberId)===x.dataset.bioEdit);closeModal();edit(record);}));
    document.querySelectorAll("[data-bio-account]").forEach(x=>x.addEventListener("click",()=>{const record=B().records.find(r=>String(r.memberId)===x.dataset.bioAccount);closeModal();accountEditor(record);}));
  });
})();
