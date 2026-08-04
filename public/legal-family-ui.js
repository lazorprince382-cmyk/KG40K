/* Legal-maintained family register used by Welfare policy eligibility. */
(()=>{
  const D=window.DepartmentUi;if(!D)return;
  const esc=D.esc;
  async function openFamily(memberId,memberName){
    const {family}=await api(`/api/legal/bio-data/${memberId}/family`);
    D.modal("Registered family",`${memberName} - welfare eligibility register`,`<div class="member-stack">
      <div class="policy-notice"><strong>Welfare eligibility</strong><span>Only a registered spouse, parent, guardian or one of up to four children may be selected for dependant welfare support.</span></div>
      <div class="table-wrap"><table><thead><tr><th>Name</th><th>Relationship</th><th>Phone</th><th>Eligible</th><th>Action</th></tr></thead><tbody>${family.map(item=>`<tr><td>${esc(item.fullName)}</td><td>${esc(item.relationship)}</td><td>${esc(item.phone||"-")}</td><td>${item.active&&item.eligibleForWelfare?"Yes":"No"}</td><td>${item.active?`<button class="button small danger" data-family-remove="${item.id}">Remove</button>`:"Inactive"}</td></tr>`).join("")||`<tr><td colspan="5">No registered family records.</td></tr>`}</tbody></table></div>
      <form class="form" data-family-form><div class="form-grid"><div class="field"><label>Full name</label><input name="fullName" required></div><div class="field"><label>Relationship</label><select name="relationship"><option value="spouse">Spouse</option><option value="parent">Biological parent</option><option value="guardian">One guardian</option><option value="child">Child</option></select></div><div class="field"><label>Phone (optional)</label><input name="phone"></div><div class="field"><label><input type="checkbox" name="eligibleForWelfare" checked> Eligible for welfare</label></div></div><div class="form-actions"><button type="button" class="button secondary" data-close-modal>Close</button><button class="button primary">Add family record</button></div></form>
    </div>`);
    document.querySelector("[data-family-form]")?.addEventListener("submit",async event=>{event.preventDefault();const form=event.currentTarget,data=Object.fromEntries(new FormData(form));data.eligibleForWelfare=form.elements.eligibleForWelfare.checked;try{await api(`/api/legal/bio-data/${memberId}/family`,{method:"POST",body:JSON.stringify(data)});closeModal();await openFamily(memberId,memberName);toast("Family record added.");}catch(error){toast(error.message);}});
    document.querySelectorAll("[data-family-remove]").forEach(button=>button.addEventListener("click",async()=>{if(!await confirmDialog("Remove this person from the active welfare eligibility register?"))return;try{await api(`/api/legal/bio-data/${memberId}/family/${button.dataset.familyRemove}`,{method:"DELETE"});closeModal();await openFamily(memberId,memberName);toast("Family record deactivated.");}catch(error){toast(error.message);}}));
  }
  D.binders.push(cfg=>{
    if(cfg.key!=="legal"||state.page!=="legal-bio-data")return;
    document.querySelectorAll(".bio-card").forEach(card=>{
      const view=card.querySelector("[data-bio-view]"),footer=card.querySelector("footer");if(!view||!footer||footer.querySelector("[data-family-member]"))return;
      const record=(state.legalBio?.records||[]).find(item=>String(item.memberId)===String(view.dataset.bioView));
      const button=document.createElement("button");button.type="button";button.dataset.familyMember=record.memberId;button.innerHTML=`${icons.users}Family`;button.addEventListener("click",()=>openFamily(record.memberId,record.fullName));footer.appendChild(button);
    });
  });
})();
