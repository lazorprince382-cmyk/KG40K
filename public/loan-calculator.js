(function(){
  const number=value=>Number(String(value??"").replaceAll(",",""))||0;
  const round=value=>Math.round((value+Number.EPSILON)*100)/100;
  const money=value=>`UGX ${number(value).toLocaleString("en-UG",{maximumFractionDigits:2})}`;

  /** Equal total payments (amortizing EMI) at a fixed monthly rate on reducing balance. */
  function calculateEqualTotalPayments(amount,months,monthlyRate=2){
    amount=number(amount);months=Math.trunc(number(months));monthlyRate=number(monthlyRate);
    if(amount<=0||months<1||monthlyRate<0)throw new Error("Enter a valid loan amount, repayment period and interest rate.");
    const rate=monthlyRate/100;
    let payment;
    if(rate===0)payment=round(amount/months);
    else{
      const factor=Math.pow(1+rate,months);
      payment=round(amount*rate*factor/(factor-1));
    }
    let balance=amount,totalInterest=0,totalPayment=0;
    const schedule=[];
    for(let month=1;month<=months;month++){
      const openingBalance=round(balance);
      const interest=round(openingBalance*rate);
      let principalDue=month===months?openingBalance:round(payment-interest);
      if(principalDue>openingBalance)principalDue=openingBalance;
      const installmentPayment=round(principalDue+interest);
      balance=round(Math.max(0,openingBalance-principalDue));
      totalInterest=round(totalInterest+interest);totalPayment=round(totalPayment+installmentPayment);
      schedule.push({month,openingBalance,principal:principalDue,interest,payment:installmentPayment,balance});
    }
    return {amount,months,monthlyRate,monthlyPayment:payment,totalInterest,totalPayment,schedule};
  }

  function calculatorForm(){
    return `<form class="loan-calculator-form" data-loan-calculator-form>
      <div class="loan-calculator-fields">
        <label>Amount borrowed (UGX)<input name="amount" type="number" placeholder="Enter amount" required></label>
        <label>Monthly interest rate (%)<input name="rate" type="number" min="0" step="0.01" value="2" placeholder="Enter monthly rate" required></label>
        <label>Number of monthly payments<input name="months" type="number" min="1" max="120" placeholder="Enter number of months" required></label>
      </div>
      <div class="loan-calculator-actions"><button class="button primary" type="submit">Calculate schedule</button><button class="button secondary" type="reset">Clear</button></div>
      <div class="loan-calculator-result" data-loan-calculator-result></div>
    </form>`;
  }

  function resultMarkup(result){
    return `<div class="loan-calculator-summary">
      <span>Payment method<strong>Equal total repayments</strong></span>
      <span>Fixed monthly payment<strong>${money(result.monthlyPayment)}</strong></span>
      <span>Total interest<strong>${money(result.totalInterest)}</strong></span>
      <span>Total repayment<strong>${money(result.totalPayment)}</strong></span>
    </div><div class="table-scroll"><table><thead><tr><th>Month</th><th>Opening balance</th><th>Interest</th><th>Principal</th><th>Total payment</th><th>Closing balance</th></tr></thead><tbody>${result.schedule.map(row=>`<tr><td>${row.month}</td><td>${money(row.openingBalance)}</td><td>${money(row.interest)}</td><td>${money(row.principal)}</td><td><strong>${money(row.payment)}</strong></td><td>${money(row.balance)}</td></tr>`).join("")}</tbody></table></div>`;
  }

  function bind(root=document){
    root.querySelectorAll("[data-loan-calculator-form]").forEach(form=>{
      if(form.dataset.bound)return;form.dataset.bound="true";
      const render=()=>{const output=form.querySelector("[data-loan-calculator-result]");try{output.innerHTML=resultMarkup(calculateEqualTotalPayments(form.amount.value,form.months.value,form.rate.value));}catch(error){output.innerHTML=`<p class="negative">${error.message}</p>`;}};
      form.addEventListener("submit",event=>{event.preventDefault();render();});
      form.addEventListener("reset",()=>setTimeout(()=>{form.querySelector("[data-loan-calculator-result]").innerHTML="";},0));
    });
  }

  function open(){
    document.getElementById("loan-calculator-modal")?.remove();
    document.body.insertAdjacentHTML("beforeend",`<div class="modal-backdrop" id="loan-calculator-modal"><div class="modal loan-calculator-modal"><div class="modal-head"><div><h2>Loan repayment calculator</h2><p>Equal total repayments — one fixed installment each month; interest is on the reducing balance (2% per month by default).</p></div><button class="modal-close" data-close-loan-calculator type="button">&times;</button></div>${calculatorForm()}</div></div>`);
    const modal=document.getElementById("loan-calculator-modal");
    modal.querySelector("[data-close-loan-calculator]").onclick=()=>modal.remove();
    bind(modal);
  }

  document.addEventListener("click",event=>{const button=event.target.closest("[data-open-loan-calculator]");if(button){event.preventDefault();open();}});
  window.LoanCalculator={
    calculateEqualTotalPayments,
    calculateEqualPrincipal:calculateEqualTotalPayments,
    calculatorForm,resultMarkup,bind,open,money
  };
})();
