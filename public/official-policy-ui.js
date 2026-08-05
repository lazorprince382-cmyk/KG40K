/* Approved Kwagalana loan controls shared by staff loan-entry screens. */
window.LoanSecurity = {
  rate: 0.75,
  capacity(savings) {
    return Math.round(Number(savings || 0) * this.rate * 100) / 100;
  },
  estimate(loanAmount, borrowerSavings, candidateSavingsList = []) {
    const amount = Number(loanAmount) || 0;
    const borrowerCover = Math.min(amount, this.capacity(borrowerSavings));
    const remaining = Math.max(0, Math.round((amount - borrowerCover) * 100) / 100);
    if (remaining <= 0) {
      return { needed: 0, remaining: 0, borrowerCover, estimatedCover: 0, covered: true };
    }
    const caps = (candidateSavingsList || [])
      .map((value) => this.capacity(value))
      .filter((value) => value > 0)
      .sort((a, b) => b - a);
    let sum = 0;
    let needed = 0;
    for (const cap of caps) {
      if (sum >= remaining) break;
      sum += cap;
      needed += 1;
    }
    return {
      needed,
      remaining,
      borrowerCover,
      estimatedCover: Math.round(sum * 100) / 100,
      covered: sum + 0.005 >= remaining
    };
  },
  selectedCover(savingsList = []) {
    return Math.round((savingsList || []).reduce((sum, value) => sum + this.capacity(value), 0) * 100) / 100;
  }
};

function guarantorOptionHtml(g) {
  const savings = Number(g.savings || 0);
  const capacity = Number(g.securityCapacity != null ? g.securityCapacity : window.LoanSecurity.capacity(savings));
  const busy = g.available === false || Number(g.activeGuarantees || 0) > 0 || Number(g.runningLoans || 0) > 0;
  const reason = g.unavailableReason
    || (Number(g.runningLoans || 0) > 0 ? `Has a running loan${g.runningLoanReference ? ` (${g.runningLoanReference})` : ""} — cannot guarantee` : null)
    || (Number(g.activeGuarantees || 0) > 0 ? "Already guaranteeing an active loan — unavailable until that loan is completed" : null)
    || (g.available === false ? "Unavailable" : null);
  return `<label class="group-member-option ${busy ? "guarantor-unavailable" : ""}"><input type="checkbox" name="guarantorIds" value="${g.id}" data-guarantor-savings="${savings}" ${busy ? "disabled" : ""}><div class="chat-avatar">${initials(g.fullName)}</div><div><strong>${escapeHtml(g.fullName)}</strong><span>${escapeHtml(g.memberNumber || "")}</span><em>${busy ? escapeHtml(reason) : `Savings ${money(savings)} · 75% security ${money(capacity)}`}</em></div></label>`;
}

function bindLoanSecurityCalculator(form, { borrowerSavings = 0, candidates = [] } = {}) {
  if (!form) return;
  const summary = form.querySelector("[data-loan-security-summary]");
  const amountInput = form.querySelector("[data-loan-amount], [name=amount]");
  const securitySelect = form.querySelector("[data-official-loan-security], [data-loan-security]");
  const picker = form.querySelector("[data-guarantor-picker]");
  let currentBorrowerSavings = Number(borrowerSavings || 0);
  let currentCandidates = candidates || [];
  form.dataset.borrowerSavings = String(currentBorrowerSavings);

  const renderSummary = () => {
    if (!summary) return;
    const security = securitySelect?.value || "";
    const isSavings = security === "savings" || security === "savings_and_shares";
    if (!isSavings) {
      summary.hidden = true;
      summary.innerHTML = "";
      return;
    }
    summary.hidden = false;
    const amount = Number(amountInput?.value || 0);
    const estimate = window.LoanSecurity.estimate(
      amount,
      currentBorrowerSavings,
      currentCandidates.filter((c) => c.available !== false && !(Number(c.activeGuarantees || 0) > 0) && !(Number(c.runningLoans || 0) > 0)).map((c) => c.savings)
    );
    const selected = [...form.querySelectorAll("[name=guarantorIds]:checked")].map((input) =>
      Number(input.dataset.guarantorSavings || 0)
    );
    const selectedCover = window.LoanSecurity.selectedCover(selected);
    if (!amount) {
      summary.innerHTML = `<strong>Savings security</strong><p>Your 75% security capacity is ${money(window.LoanSecurity.capacity(currentBorrowerSavings))}. Enter an amount to see how many guarantors you need.</p>`;
      return;
    }
    const enough = selectedCover + 0.005 >= estimate.remaining;
    summary.innerHTML = `<strong>Savings security at 75%</strong>
      <p>Your cover: <b>${money(estimate.borrowerCover)}</b> of ${money(amount)}. Remaining to cover: <b>${money(estimate.remaining)}</b>.</p>
      <p>${
        estimate.remaining <= 0
          ? "Your own savings security covers this loan — no additional guarantors are required."
          : `Estimated guarantors needed (highest savings first): <b>${estimate.needed}</b>. Selected cover: <b>${money(selectedCover)}</b>${enough ? " — covered." : " — select more guarantors."}`
      }</p>`;
  };

  const applySecurityVisibility = () => {
    const collateral = securitySelect?.value === "collateral";
    const guarantorBox = form.querySelector("[data-official-guarantors], [data-guarantor-fields]");
    const collateralBox = form.querySelector("[data-official-collateral], [data-collateral-fields]");
    if (guarantorBox) guarantorBox.hidden = collateral || !securitySelect?.value;
    if (collateralBox) collateralBox.hidden = !collateral;
    form
      .querySelectorAll(
        "[data-official-collateral] input,[data-official-collateral] textarea,[data-collateral-fields] input,[data-collateral-fields] textarea"
      )
      .forEach((input) => {
        if (["collateralDescription", "collateralValue", "collateralOwner", "collateralOwnerPhone"].includes(input.name)) {
          input.required = collateral;
        }
      });
    renderSummary();
  };

  form._loanSecurityState = {
    setBorrowerSavings(value) {
      currentBorrowerSavings = Number(value || 0);
      form.dataset.borrowerSavings = String(currentBorrowerSavings);
      renderSummary();
    },
    setCandidates(list) {
      currentCandidates = list || [];
      if (picker) {
        picker.innerHTML =
          currentCandidates.map(guarantorOptionHtml).join("") ||
          `<div class="empty-state">No eligible guarantor accounts.</div>`;
      }
      renderSummary();
    },
    renderSummary
  };

  securitySelect?.addEventListener("change", applySecurityVisibility);
  amountInput?.addEventListener("input", renderSummary);
  form.addEventListener("change", (event) => {
    if (event.target.matches("[name=guarantorIds]")) renderSummary();
  });
  applySecurityVisibility();
}

function officialLoanPolicyFields(memberOptionsHtml) {
  const terms = Array.from({ length: 10 }, (_, index) => index + 1);
  return `<label class="field full check-field loan-policy-check"><input name="borrowerDeclaration" type="checkbox" value="accepted" required><span>I have read and understood the Kwagalana loan policy.</span></label>
    <div class="field full"><label>Member</label><select name="memberId" required data-loan-borrower><option value="">Select member</option>${memberOptionsHtml}</select></div>
    <div class="field"><label>Loan product</label><select name="productId" required>${state.products.map((p) => `<option value="${p.id}">${p.name}</option>`).join("")}</select></div>
    <div class="field"><label>Amount (UGX)</label><input name="amount" type="number" min="100000" max="25000000" step="50000" required data-loan-amount><small data-loan-amount-help>Up to UGX 25,000,000. Savings security uses 75% of the borrower's savings first.</small></div>
    <div class="field"><label>Repayment term</label><select name="termMonths">${terms.map((term) => `<option value="${term}" ${term === 5 ? "selected" : ""}>${term} month${term === 1 ? "" : "s"}</option>`).join("")}</select></div>
    <div class="field"><label>Security offered</label><select name="securityType" required data-official-loan-security><option value="">Choose security</option><option value="savings">Savings</option><option value="collateral">Collateral</option></select></div>
    <div class="field full"><label>Loan purpose (optional)</label><textarea name="purpose"></textarea></div>
    <div class="field full" data-official-guarantors hidden>
      <div class="loan-security-summary" data-loan-security-summary aria-live="polite"></div>
      <label>Choose guarantors</label>
      <div class="group-member-picker" data-guarantor-picker>${(state.guarantorCandidates || []).map(guarantorOptionHtml).join("") || `<div class="empty-state">No eligible guarantor accounts.</div>`}</div>
      <small>Select enough guarantors so 75% of their savings covers what the borrower's 75% does not. Call them to accept from their dashboards.</small>
    </div>
    <div class="field full" data-official-collateral hidden><div class="form-grid"><div class="field full"><label>Collateral description</label><textarea name="collateralDescription"></textarea></div><div class="field"><label>Collateral value (UGX)</label><input name="collateralValue" type="number" min="0"></div><div class="field"><label>Collateral owner</label><input name="collateralOwner"></div><div class="field"><label>Collateral owner phone number</label><input name="collateralOwnerPhone" type="tel"></div><label class="field full check-field"><input name="collateralOwnerConsent" type="checkbox" value="accepted"> Owner consent is confirmed.</label></div></div>
    <div class="field full"><label>Supporting evidence</label><input name="supportingDocument" type="file" accept="image/jpeg,image/png,image/webp,application/pdf,.doc,.docx"><small>Attach a land title, vehicle logbook, collateral evidence, quotation or other relevant document.</small></div>
    <label class="field full check-field loan-overdue-check"><input type="checkbox" name="overdueDeclaration" value="accepted" required><span>I understand that after a 5-day grace from the due date, unpaid principal attracts a 5% late-payment penalty (interest is not included in the penalty base), plus recovery costs and security enforcement.</span></label>`;
}

function bindOfficialLoanSecurity(form) {
  bindLoanSecurityCalculator(form, {
    borrowerSavings: Number(form.dataset.borrowerSavings || 0),
    candidates: state.guarantorCandidates || []
  });
  const memberSelect = form.querySelector("[data-loan-borrower], [name=memberId]");
  memberSelect?.addEventListener("change", async () => {
    const memberId = Number(memberSelect.value || 0);
    if (!memberId) {
      form.dataset.borrowerSavings = "0";
      form._loanSecurityState?.setBorrowerSavings(0);
      return;
    }
    try {
      const result = await api(`/api/loans/guarantor-candidates?memberId=${memberId}`);
      state.guarantorCandidates = result.candidates || [];
      form.dataset.borrowerSavings = String(result.borrower?.savings || 0);
      form._loanSecurityState?.setBorrowerSavings(result.borrower?.savings || 0);
      form._loanSecurityState?.setCandidates(state.guarantorCandidates);
    } catch (error) {
      toast(error.message);
    }
  });
}

function validateOfficialLoan(form, payload) {
  if (payload.get("borrowerDeclaration") !== "accepted") throw new Error("You must read and accept the Kwagalana loan policy.");
  if (payload.get("overdueDeclaration") !== "accepted") throw new Error("Accept the overdue repayment declaration before submitting.");
  const security = payload.get("securityType");
  const guarantors = payload.getAll("guarantorIds");
  const amount = Number(payload.get("amount") || 0);
  if (security === "savings" || security === "savings_and_shares") {
    const borrowerSavings = Number(form.dataset.borrowerSavings || 0);
    const estimate = window.LoanSecurity.estimate(amount, borrowerSavings, (state.guarantorCandidates || []).map((c) => c.savings));
    const selectedCover = window.LoanSecurity.selectedCover(
      [...form.querySelectorAll("[name=guarantorIds]:checked")].map((input) => Number(input.dataset.guarantorSavings || 0))
    );
    if (estimate.remaining > 0 && guarantors.length === 0) {
      throw new Error(`Choose guarantors to cover the remaining ${money(estimate.remaining)} after the borrower's 75% savings security.`);
    }
    if(estimate.remaining > 0 && selectedCover + 0.005 < estimate.remaining) {
      throw new Error(`Selected guarantors cover ${money(selectedCover)}, but ${money(estimate.remaining)} is still needed.`);
    }
  }
  if (
    security === "collateral" &&
    (!payload.get("collateralDescription") ||
      !payload.get("collateralValue") ||
      !payload.get("collateralOwner") ||
      !payload.get("collateralOwnerPhone") ||
      payload.get("collateralOwnerConsent") !== "accepted")
  ) {
    throw new Error("Complete the collateral details, owner phone number and consent.");
  }
}

const originalCreditsModal = openCreditsModal;
openCreditsModal = async function (type, context = "") {
  if (type !== "loan") return originalCreditsModal(type, context);
  state.guarantorCandidates = [];
  document.body.insertAdjacentHTML(
    "beforeend",
    `<div class="modal-backdrop" id="modal-backdrop"><div class="modal"><div class="modal-head"><div><h2>New loan application</h2><p>Equal principal with 2% monthly interest charged by the organization.</p></div><button class="modal-close" data-close>${icons.x}</button></div><form class="form" data-credits-form="loan" enctype="multipart/form-data"><div class="form-grid">${officialLoanPolicyFields(creditsMemberOptions())}</div>${formActions("Submit loan application")}</form></div></div>`
  );
  document.querySelector("[data-close]").onclick = closeModal;
  const form = document.querySelector("[data-credits-form]");
  bindOfficialLoanSecurity(form);
  form.onsubmit = submitCreditsForm;
};
const originalCreditsSubmit = submitCreditsForm;
submitCreditsForm = async function (event) {
  if (event.currentTarget.dataset.creditsForm !== "loan") return originalCreditsSubmit(event);
  event.preventDefault();
  const form = event.currentTarget,
    payload = new FormData(form);
  try {
    validateOfficialLoan(form, payload);
  } catch (error) {
    return toast(error.message);
  }
  const button = form.querySelector("button[type=submit]");
  button.disabled = true;
  button.textContent = "Submitting...";
  try {
    const result = await api("/api/loans", { method: "POST", body: payload });
    closeModal();
    await refreshCredits();
    render();
    toast(`Loan ${result.reference} submitted successfully.`);
  } catch (error) {
    button.disabled = false;
    button.textContent = "Try again";
    toast(error.message);
  }
};
loanForm = function () {
  return `<form class="form" data-form="loan" enctype="multipart/form-data"><div class="form-grid">${officialLoanPolicyFields(memberOptions())}</div>${formActions("Submit loan application")}</form>`;
};
const originalOpenModal = openModal;
openModal = function (type) {
  originalOpenModal(type);
  if (type === "loan") {
    const form = document.querySelector("[data-form=loan]");
    if (form) bindOfficialLoanSecurity(form);
  }
};
const originalGeneralSubmit = submitForm;
submitForm = async function (event) {
  if (event.currentTarget.dataset.form !== "loan") return originalGeneralSubmit(event);
  event.preventDefault();
  const form = event.currentTarget,
    payload = new FormData(form);
  try {
    validateOfficialLoan(form, payload);
  } catch (error) {
    return toast(error.message);
  }
  const button = form.querySelector("button[type=submit]");
  button.disabled = true;
  button.textContent = "Submitting...";
  try {
    const result = await api("/api/loans", { method: "POST", body: payload });
    closeModal();
    await refreshData();
    render();
    toast(`Loan application ${result.reference} submitted.`);
  } catch (error) {
    button.disabled = false;
    button.textContent = "Try again";
    toast(error.message);
  }
};
document.addEventListener("change", (event) => {
  if (event.target.matches("[data-official-loan-security]") && event.target.form && !event.target.form._loanSecurityState) {
    bindOfficialLoanSecurity(event.target.form);
  }
});
