/* Legal-controlled membership registration and linked account creation. */
(() => {
  const D=window.DepartmentUi;
  if(!D?.views["legal-bio-data"])return;
  const esc=value=>escapeHtml(value==null?"":String(value));
  let options=null;
  const original=D.views["legal-bio-data"];
  D.views["legal-bio-data"]=()=>`<div class="legal-registration-actions"><button class="button primary" data-legal-register>${icons.plus}Register member</button><button class="button secondary" data-legal-account>${icons.users}Create account for existing member</button></div>${original()}`;
  async function getOptions(){return options||(options=await api("/api/legal/membership-options"));}
  const departmentOptions=data=>data.departments.map(x=>`<option value="${x.code}">${esc(x.name)}</option>`).join("");
  const branchOptions=data=>data.branches.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join("");
  function show(title,body){
    document.body.insertAdjacentHTML("beforeend",`<div class="modal-backdrop" id="modal-backdrop"><div class="modal legal-register-modal"><div class="modal-head"><div><h2>${title}</h2><p>Legal Department  -  Administration & Records</p></div><button class="modal-close" data-close>${icons.x}</button></div>${body}</div></div>`);
    document.querySelector("[data-close]").onclick=closeModal;
  }
  function roleFields(data,prefix=""){
    return `<div class="field full organization-role-box"><label><input type="checkbox" name="hasOrganizationRole" data-role-toggle> This member has a role in the organization</label><p>The login remains one account; the department dashboard will also include the member workspace.</p></div>
      <div class="form-grid full role-fields" hidden><div class="field"><label>Department</label><select name="departmentCode">${departmentOptions(data)}</select></div><div class="field"><label>Position title</label><input name="positionTitle" placeholder="e.g. Records Officer"></div><div class="field full"><small>A standard operational account is created. Approval/head authority must be assigned through governance controls.</small></div></div>`;
  }
  async function register(){
    try{
      const data=await getOptions();
      show("Register a new member",`<form class="form" data-legal-member-form enctype="multipart/form-data"><div class="legal-form-section"><h3>Registration identity</h3><div class="form-grid">
        <div class="field full"><label>Full legal name</label><input name="fullName" required></div><div class="field"><label>Phone</label><input name="phone" required></div><div class="field"><label>Email</label><input name="email" type="email"></div>
        <div class="field"><label>National ID</label><input name="nationalId" required></div><div class="field"><label>Residence / address</label><input name="address" placeholder="Village, parish, town or district"></div>
        <div class="field"><label>Date of birth</label><input name="dateOfBirth" type="date"></div><div class="field"><label>Gender</label><select name="gender"><option value="">Not recorded</option><option>female</option><option>male</option><option>other</option><option value="prefer_not_to_say">Prefer not to say</option></select></div>
        <div class="field"><label>Marital status</label><select name="maritalStatus"><option value="">Not recorded</option><option>single</option><option>married</option><option>divorced</option><option>widowed</option><option>separated</option><option>other</option></select></div>
        <div class="field"><label>Nationality</label><input name="nationality" value="Ugandan"></div><div class="field"><label>Passport photo</label><input name="passportPhoto" type="file" accept="image/jpeg,image/png,image/webp"></div>
      </div></div><div class="legal-form-section"><h3>Contact, family and employment</h3><div class="form-grid">
        <div class="field"><label>Occupation</label><input name="occupation"></div><div class="field"><label>Employer / business</label><input name="employer"></div>
        <div class="field"><label>Home district</label><input name="homeDistrict"></div><div class="field"><label>Subcounty</label><input name="subcounty"></div><div class="field"><label>Parish</label><input name="parish"></div><div class="field"><label>Village</label><input name="village"></div>
        <div class="field full"><label>Next of kin</label><input name="nextOfKin"></div><div class="field full"><label>Beneficiaries</label><textarea name="beneficiaries"></textarea></div>
        <div class="field"><label>Emergency contact name</label><input name="emergencyContactName"></div><div class="field"><label>Emergency contact phone</label><input name="emergencyContactPhone"></div><div class="field"><label>Relationship</label><input name="emergencyContactRelationship"></div>
        <div class="field full"><label>Record notes</label><textarea name="recordNotes"></textarea></div>
      </div></div><div class="legal-form-section"><h3>Login account</h3><div class="form-grid"><div class="field full"><label><input type="checkbox" name="createAccount" data-account-toggle> Create a login account now</label></div>${roleFields(data)}
        <div class="field full account-password" hidden><label>Temporary password</label><input name="password" type="password" autocomplete="new-password" placeholder="Leave blank to generate securely"><small>The user must change it after signing in.</small></div>
      </div></div><div class="form-actions"><button type="button" class="button secondary" data-close-modal>Cancel</button><button class="button primary">Register member</button></div></form>`);
      bindModal();
    }catch(error){toast(error.message);}
  }
  async function existingAccount(){
    try{
      const data=await getOptions(),members=data.members.filter(x=>!x.hasAccount);
      show("Create a login for an existing member",`<form class="form" data-existing-account><div class="form-grid"><div class="field full"><label>Registered member</label><select name="memberId" required>${members.map(x=>`<option value="${x.id}">${esc(x.memberNumber)}  -  ${esc(x.fullName)}</option>`).join("")}</select></div>
        <div class="field full"><label>Email (uses member email when left blank)</label><input name="email" type="email"></div>${roleFields(data)}
        <div class="field full"><label>Temporary password</label><input name="password" type="password" placeholder="Leave blank to generate securely"></div></div>
        <div class="form-actions"><button type="button" class="button secondary" data-close-modal>Cancel</button><button class="button primary">Create linked account</button></div></form>`);
      bindModal();
    }catch(error){toast(error.message);}
  }
  function bindModal(){
    document.querySelectorAll("[data-close-modal]").forEach(x=>x.onclick=closeModal);
    document.querySelector("[data-role-toggle]")?.addEventListener("change",event=>{document.querySelector(".role-fields").hidden=!event.target.checked;});
    document.querySelector("[data-account-toggle]")?.addEventListener("change",event=>{document.querySelector(".account-password").hidden=!event.target.checked;});
    document.querySelector("[data-legal-member-form]")?.addEventListener("submit",async event=>{
      event.preventDefault();const button=event.currentTarget.querySelector(".form-actions .primary");button.disabled=true;
      try{const response=await fetch("/api/legal/members",{method:"POST",credentials:"same-origin",body:new FormData(event.currentTarget)}),result=await response.json();if(!response.ok)throw new Error(result.error);closeModal();options=null;await refreshData();render();toast(`Member ${result.memberNumber} registered.`);if(result.temporaryPassword)detailModal("Member account created",result.role,[["Member number",result.memberNumber],["Temporary password",result.temporaryPassword],["Next step","User changes it at first sign-in."]]);}catch(error){button.disabled=false;toast(error.message);}
    });
    document.querySelector("[data-existing-account]")?.addEventListener("submit",async event=>{
      event.preventDefault();const raw=Object.fromEntries(new FormData(event.currentTarget));raw.hasOrganizationRole=Boolean(event.currentTarget.querySelector("[name=hasOrganizationRole]:checked"));
      try{const result=await api("/api/legal/member-accounts",{method:"POST",body:JSON.stringify(raw)});closeModal();options=null;detailModal("Linked account created",result.role,[["Temporary password",result.temporaryPassword],["Member access","Enabled on the same account"],["Authority","Standard operational access"]]);}catch(error){toast(error.message);}
    });
  }
  D.binders.push(cfg=>{
    if(cfg.key!=="legal"||state.page!=="legal-bio-data")return;
    document.querySelector("[data-legal-register]")?.addEventListener("click",register);
    document.querySelector("[data-legal-account]")?.addEventListener("click",existingAccount);
  });
})();
