const db=require('../src/db');

const periodEnd='2026-06-30';
const statementLines=[
  ['comprehensive_income','interest_income','Interest income','2',8214012,20842818,-12628806,10],
  ['comprehensive_income','other_income','Other income','3',18140534,4239327,13901207,20],
  ['comprehensive_income','total_income','Total income',null,26354546,25082145,1272401,30],
  ['comprehensive_income','administration_expenses','Administration expenses','5',0,305000,-305000,40],
  ['comprehensive_income','professional_fees','Professional fees','7',1749600,3526528,-1776928,50],
  ['comprehensive_income','telephone_internet','Telephone and internet','10',100000,0,100000,60],
  ['comprehensive_income','annual_general_meeting','Annual General Meeting','11',2000000,2000000,0,70],
  ['comprehensive_income','financial_charges','Financial charges','12',413605,283669,129936,80],
  ['comprehensive_income','other_operating_expenses','Other operating expenses','13',0,4504198,-4504198,90],
  ['comprehensive_income','total_operating_expenses','Total operating expenses',null,4263205,10619395,-6356190,100],
  ['comprehensive_income','surplus_after_tax','Surplus after tax provision',null,22091341,14462750,7628591,110],
  ['financial_position','unit_trust_investment','Investments at fair value - Unit Trust','24',162392395,0,162392395,10],
  ['financial_position','trade_receivables','Trade receivables - loans and interest','14',19432301,21271790,-1839489,20],
  ['financial_position','other_receivables','Other receivables','15',0,603302,-603302,30],
  ['financial_position','cash_bank','Cash and bank balances','17',1773373,110295817,-108522444,40],
  ['financial_position','total_assets','Total assets',null,183598069,132170909,51427160,50],
  ['financial_position','share_capital','Share capital','18',36040000,29940000,6100000,60],
  ['financial_position','retained_income','Retained income',null,10966227,4338825,6627402,70],
  ['financial_position','total_equity','Total equity and reserves',null,47006227,34278825,12727402,80],
  ['financial_position','member_savings','Members savings - trade payables','19',113827903,71310200,42517703,90],
  ['financial_position','dividend_payable','Dividend payable','23',15463939,10123925,5340014,100],
  ['financial_position','other_payables','Other payables and accruals','20',7300000,16457959,-9157959,110],
  ['financial_position','total_liabilities','Total liabilities',null,136591842,97892084,38699758,120],
  ['financial_position','equity_liabilities','Total equity and liabilities',null,183598069,132170909,51427160,130],
  ['equity_changes','opening_share_capital','Share capital at 1 July 2025',null,29940000,null,null,10],
  ['equity_changes','share_purchases','Share purchases during the year',null,6100000,null,null,20],
  ['equity_changes','closing_share_capital','Share capital at 30 June 2026',null,36040000,null,null,30],
  ['equity_changes','opening_retained_earnings','Retained earnings at 1 July 2025',null,14462750,null,null,40],
  ['equity_changes','dividends_paid','Dividends paid',null,-10123925,null,null,50],
  ['equity_changes','profit_for_year','Profit for the year',null,22091341,null,null,60],
  ['equity_changes','retained_before_proposed_dividend','Retained earnings before proposed dividends',null,26430166,null,null,70],
  ['equity_changes','proposed_dividends','Proposed dividends',null,-15463939,null,null,80],
  ['equity_changes','closing_retained_earnings','Retained earnings at 30 June 2026',null,10966227,null,null,90],
  ['operating_notes','loan_processing_fees','Loan processing fees','3',1140000,1785600,-645600,10],
  ['operating_notes','prior_year_adjustments','Other income - prior year adjustments','3',4608139,1200,4606939,20],
  ['operating_notes','unit_trust_income','Unit Trust income','3',12392395,0,12392395,30],
  ['operating_notes','audit_fees','Audit fees','7',849600,1726528,-876928,40],
  ['operating_notes','consultancy_fees','Consultancy fees and other professional expenses','7',900000,1800000,-900000,50],
  ['operating_notes','welfare_fund','Welfare fund - weddings, exit and medical','20',5300000,6650000,-1350000,60],
  ['operating_notes','agm_accrual','AGM expenses accrual','20',2000000,2000000,0,70]
];

const members=[
  [1,'Charles Oketcho',434993,2000000,251251.82],
  [2,'Joshua Ssewanyana',1302451,2000000,null],
  [3,'Francis Banumba',3224954,2000000,545208.97],
  [4,'Josephine Babirye Kyobe',3619971,2000000,586427.86],
  [5,'Denis Tugume',3749954,2000000,599991.22],
  [6,'Tabula Robert',4844936,2000000,714249.45],
  [7,'Ntono Moreen',4850436,2000000,714823.36],
  [8,'Ritah Nakyanzi',7503927,2000000,991707.54],
  [9,'Mary Babirye',7861512,2000000,1029020.51],
  [10,'Nakayiza Baraza Olivia',7900000,2000000,1033036.62],
  [11,'Jude Tadieus Kyobe',7945071,2000000,1037739.65],
  [12,'Brian Mutiga',7975000,2000000,1040862.65],
  [13,'Justine Kaudha Inhensiko',8000456,2000000,1043518.91],
  [14,'Paul Kalemba',8150000,2000000,1059123.40],
  [15,'Dan Rwebingira Ssalongo',8162431,2000000,1060420.54],
  [16,'Christopher Muhoozi',8712431,2040000,1117811.46],
  [17,'Ralph Masaba',8976949,2040000,1149587.05],
  [18,'Ezrah Nayoga',10612431,2000000,1316071.02]
];

const investmentEntries=[
  ['63ed840a02191','2025-08-08','debit',100000000],
  ['655208398f631','2025-08-31','debit',701751.25],
  ['6552096f9a7b1','2025-09-30','debit',1010541.65],
  ['655209caf4f49','2025-10-31','debit',1046580.62],
  ['65520aa90c2e1','2025-11-30','debit',1020539.64],
  ['65520aa947431','2025-11-30','debit',1020539.64],
  ['65520c4434c59','2025-11-30','credit',1020539.64],
  ['65520b1ca4771','2025-12-31','debit',1058940.55],
  ['65520dee3b071','2026-01-31','debit',1097305.82],
  ['65520e58b5541','2026-02-28','debit',994550.33],
  ['6530bab1cd941','2026-03-27','debit',30000000],
  ['65520f2169749','2026-03-31','debit',1140152.53],
  ['65521008a4c49','2026-04-30','debit',1364008.45],
  ['655210586aa49','2026-05-31','debit',1421387.30],
  ['65556f4039e31','2026-06-08','debit',20000000],
  ['655cd0914d2a1','2026-06-30','debit',1536637.16]
];

async function main(){
  await db.initialize();
  const savingsTotal=members.reduce((sum,row)=>sum+row[2],0);
  if(savingsTotal!==113827903)throw new Error(`Savings schedule does not reconcile: ${savingsTotal}`);
  const investmentTotal=investmentEntries.reduce((sum,row)=>sum+(row[2]==='debit'?row[3]:-row[3]),0);
  if(Math.abs(investmentTotal-162392395.30)>0.001)throw new Error(`Investment ledger does not reconcile: ${investmentTotal}`);
  await db.transaction(async client=>{
    const period=(await client.query(`INSERT INTO financial_reporting_periods
      (fiscal_year,period_end,status,currency,source_name,notes)
      VALUES (2026,$1,'draft','UGX','User-supplied photographed draft financial statements',
      'Historical opening snapshot. Board approval date and signed final statements were not supplied.')
      ON CONFLICT(period_end) DO UPDATE SET source_name=EXCLUDED.source_name,notes=EXCLUDED.notes
      RETURNING id`,[periodEnd])).rows[0];
    for(const line of statementLines)await client.query(`INSERT INTO financial_statement_lines
      (period_id,statement_type,line_code,line_name,note_number,current_amount,prior_amount,variance,sort_order)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      ON CONFLICT(period_id,statement_type,line_code) DO UPDATE SET line_name=EXCLUDED.line_name,
      note_number=EXCLUDED.note_number,current_amount=EXCLUDED.current_amount,prior_amount=EXCLUDED.prior_amount,
      variance=EXCLUDED.variance,sort_order=EXCLUDED.sort_order`,[period.id,...line]);
    for(const [sourceRow,name,savings,shareCapital,proposedDividend] of members)await client.query(`INSERT INTO legacy_member_opening_balances
      (period_id,source_row,member_name,share_capital,savings_balance,expected_savings,deficit_surplus,proposed_dividend)
      VALUES ($1,$2,$3,$4::numeric,$5::numeric,8300000,$5::numeric-8300000,$6)
      ON CONFLICT(period_id,member_name) DO UPDATE SET source_row=EXCLUDED.source_row,share_capital=EXCLUDED.share_capital,
      savings_balance=EXCLUDED.savings_balance,expected_savings=EXCLUDED.expected_savings,
      deficit_surplus=EXCLUDED.deficit_surplus,proposed_dividend=EXCLUDED.proposed_dividend`,[period.id,sourceRow,name,shareCapital,savings,proposedDividend]);
    for(const [transactionId,date,type,amount] of investmentEntries)await client.query(`INSERT INTO historical_investment_ledger
      (period_id,transaction_id,transaction_date,account_name,account_code,entry_type,amount,source_reference)
      VALUES ($1,$2,$3,'Unit Trust Fund Investment','4500',$4,$5,'Photographed Unit Trust ledger')
      ON CONFLICT(period_id,transaction_id) DO UPDATE SET transaction_date=EXCLUDED.transaction_date,
      entry_type=EXCLUDED.entry_type,amount=EXCLUDED.amount`,[period.id,transactionId,date,type,amount]);
    await client.query(`INSERT INTO audit_logs(action,entity_type,entity_id,details)
      VALUES ('HISTORICAL_OPENING_DATA_IMPORTED','financial_reporting_period',$1,$2)`,[String(period.id),
      `FY2026 draft snapshot: 18 member balance rows, savings UGX ${savingsTotal}, investment ledger UGX ${investmentTotal.toFixed(2)}`]);
  });
  const shareCapitalTotal=members.reduce((sum,row)=>sum+row[3],0);
  console.log(JSON.stringify({periodEnd,members:members.length,savingsTotal,shareCapital:shareCapitalTotal,
    investmentLedgerTotal:investmentTotal,dividendAllocationStatus:'loaded_from_share_capital_schedule'},null,2));
  await db.pool.end();
}

main().catch(async error=>{console.error(error);try{await db.pool.end();}catch{}process.exitCode=1;});
