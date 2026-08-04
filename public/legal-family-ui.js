/* Legal-maintained family register used by Welfare policy eligibility. */
(()=>{
  const D=window.DepartmentUi;if(!D)return;
  const esc=D.esc;
  async function openFamily(memberId,memberName){
    const {family}=await api(`/api/legal/bio-data/${memberId}/family`);
    const rows=family.length
      ?family.map(item=>`<tr>
          <td><strong>${esc(item.fullName)}</strong></td>
          <td>${esc(item.relationship)}</td>
          <td>${esc(item.phone||"—")}</td>
          <td>${item.active&&item.eligibleForWelfare?"Yes":"No"}</td>
          <td>${item.active?`<button type="button" class="button small secondary" data-family-remove="${item.id}">Remove</button>`:"Inactive"}</td>
        </tr>`).join("")
      :`<tr><td colspan="5" class="family-empty">No registered family records yet.</td></tr>`;
    D.modal("Registered family",`${memberName} - welfare eligibility register`,`
      <div class="family-register">
        <div class="family-policy-notice">
          <strong>Welfare eligibility</strong>
          <p>Only a registered spouse, parent, guardian, or one of up to four children may be selected for dependant welfare support.</p>
        </div>
        <div class="family-table-wrap">
          <table class="family-table">
            <thead><tr><th>Name</th><th>Relationship</th><th>Phone</th><th>Eligible</th><th></th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <form class="family-form" data-family-form>
          <h3>Add family record</h3>
          <div class="family-form-grid">
            <div class="field"><label for="family-full-name">Full name</label><input id="family-full-name" name="fullName" required autocomplete="name"></div>
            <div class="field"><label for="family-relationship">Relationship</label>
              <select id="family-relationship" name="relationship">
                <option value="spouse">Spouse</option>
                <option value="parent">Biological parent</option>
                <option value="guardian">One guardian</option>
                <option value="child">Child</option>
              </select>
            </div>
            <div class="field"><label for="family-phone">Phone (optional)</label><input id="family-phone" name="phone" type="tel" autocomplete="tel"></div>
            <label class="family-eligible-check"><input type="checkbox" name="eligibleForWelfare" checked><span>Eligible for welfare</span></label>
          </div>
          <div class="family-form-actions">
            <button type="button" class="button secondary" data-close-modal>Close</button>
            <button type="submit" class="button primary">Add family record</button>
          </div>
        </form>
      </div>`);
    const modal=document.querySelector("#modal-backdrop .modal");
    if(modal)modal.classList.add("family-modal");
    document.querySelector("[data-family-form]")?.addEventListener("submit",async event=>{
      event.preventDefault();
      const form=event.currentTarget,data=Object.fromEntries(new FormData(form));
      data.eligibleForWelfare=form.elements.eligibleForWelfare.checked;
      try{
        await api(`/api/legal/bio-data/${memberId}/family`,{method:"POST",body:JSON.stringify(data)});
        closeModal();
        await openFamily(memberId,memberName);
        toast("Family record added.");
      }catch(error){toast(error.message);}
    });
    document.querySelectorAll("[data-family-remove]").forEach(button=>button.addEventListener("click",async()=>{
      if(!await confirmDialog("Remove this person from the active welfare eligibility register?"))return;
      try{
        await api(`/api/legal/bio-data/${memberId}/family/${button.dataset.familyRemove}`,{method:"DELETE"});
        closeModal();
        await openFamily(memberId,memberName);
        toast("Family record deactivated.");
      }catch(error){toast(error.message);}
    }));
  }
  D.binders.push(cfg=>{
    if(cfg.key!=="legal"||state.page!=="legal-bio-data")return;
    document.querySelectorAll(".bio-card").forEach(card=>{
      const view=card.querySelector("[data-bio-view]"),footer=card.querySelector("footer");
      if(!view||!footer||footer.querySelector("[data-family-member]"))return;
      const record=(state.legalBio?.records||[]).find(item=>String(item.memberId)===String(view.dataset.bioView));
      if(!record)return;
      const button=document.createElement("button");
      button.type="button";
      button.dataset.familyMember=record.memberId;
      button.innerHTML=`${icons.users}Family`;
      button.addEventListener("click",()=>openFamily(record.memberId,record.fullName));
      footer.appendChild(button);
    });
  });
})();
