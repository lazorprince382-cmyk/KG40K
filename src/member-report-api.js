module.exports = function registerMemberReportApi({app,auth,asyncRoute,query}) {
  app.get("/api/member/reports/:type.csv",auth,asyncRoute(async(req,res)=>{
    if(!req.user.member_id)return res.status(403).json({error:"A linked member account is required"});
    const type=String(req.params.type);
    let result;
    if(type==="transactions"){
      result=await query(`SELECT reference,type,method,amount,status,receipt_number,created_at
        FROM transactions WHERE member_id=$1 ORDER BY id DESC`,[req.user.member_id]);
    }else if(type==="loans"){
      result=await query(`SELECT l.reference,p.name AS product,l.amount,l.balance,l.term_months,l.status,l.due_date
        FROM loans l JOIN loan_products p ON p.id=l.product_id WHERE l.member_id=$1 ORDER BY l.id DESC`,[req.user.member_id]);
    }else return res.status(404).json({error:"Member report not found"});
    const quote=value=>`"${String(value??"").replaceAll('"','""')}"`,keys=result.fields.map(field=>field.name);
    res.type("text/csv").attachment(`my-${type}.csv`)
      .send([keys.map(quote).join(","),...result.rows.map(row=>keys.map(key=>quote(row[key])).join(","))].join("\r\n"));
  }));
};
