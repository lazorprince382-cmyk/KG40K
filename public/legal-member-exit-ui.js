/* Controlled member exit from the Legal Administration & Records register. */
(() => {
  const D=window.DepartmentUi;
  if(!D)return;

  async function deleteMember(memberId){
    const record=(state.legalBio?.records||[]).find(item=>String(item.memberId)===String(memberId));
    if(!record)return toast("Member record is no longer available.");
    const reason=await promptDialog(`Why is ${record.fullName} being deleted from active membership?`,"");
    if(reason===null)return;
    if(reason.trim().length<5)return toast("Enter a clear deletion reason.");
    const confirmed=await confirmDialog(
      `Delete ${record.fullName} (${record.memberNumber})?\n\n`+
      "Their login and departmental access will be disabled. Their savings and share capital will stop counting in active group totals, while the financial ledger remains preserved for audit."
    );
    if(!confirmed)return;
    try{
      await api(`/api/legal/bio-data/${record.memberId}`,{
        method:"DELETE",
        body:JSON.stringify({reason:reason.trim()})
      });
      await refreshData();
      render();
      toast(`${record.fullName} was removed from active membership. Live totals have been updated.`);
    }catch(error){
      toast(error.message);
    }
  }

  D.binders.push(cfg=>{
    if(cfg.key!=="legal"||state.page!=="legal-bio-data"||!state.legalBio?.access?.canEdit)return;
    document.querySelectorAll(".bio-card").forEach(card=>{
      const view=card.querySelector("[data-bio-view]");
      const footer=card.querySelector("footer");
      if(!view||!footer||footer.querySelector("[data-member-delete]"))return;
      const button=document.createElement("button");
      button.type="button";
      button.className="bio-delete-member";
      button.dataset.memberDelete=view.dataset.bioView;
      button.innerHTML=`${icons.trash||icons.x||""}<span>Delete member</span>`;
      button.addEventListener("click",()=>deleteMember(button.dataset.memberDelete));
      footer.appendChild(button);
    });
  });
})();
