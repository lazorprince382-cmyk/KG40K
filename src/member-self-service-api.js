module.exports = function registerMemberSelfServiceApi({
  app,auth,asyncRoute,query,one,transaction,audit,metadata,departmentPermission,
  upload,fs,path,uploadsDir,reference
}) {
  const evidenceTypes=new Set(["image/jpeg","image/png","image/webp","application/pdf"]);
  const removeFile=name=>{if(!name||path.basename(name)!==name)return;const target=path.join(uploadsDir,name);if(target.startsWith(`${uploadsDir}${path.sep}`))fs.unlink(target,()=>{});};
  const linked=(req,res,next)=>req.user.member_id?next():res.status(403).json({error:"This account is not linked to a registered member"});
  const validateFile=(req,res)=>{if(!req.file){res.status(400).json({error:"Upload a receipt photo or PDF"});return false;}if(!evidenceTypes.has(req.file.mimetype)){removeFile(req.file.filename);res.status(400).json({error:"Evidence must be a JPG, PNG, WebP or PDF file"});return false;}return true;};
  const notifyDepartment=(client,code,title,message)=>client.query(`INSERT INTO notifications (user_id,title,message)
    SELECT DISTINCT u.id,$2,$3 FROM departments d JOIN department_assignments da ON da.department_id=d.id AND da.active=true AND da.can_view=true
    JOIN users u ON u.id=da.user_id AND u.active=true WHERE d.code=$1`,[code,title,message]);
  const notifyMember=(client,memberId,title,message)=>client.query("INSERT INTO notifications (member_id,title,message) VALUES ($1,$2,$3)",[memberId,title,message]);

  app.get("/api/member/self-service",auth,linked,asyncRoute(async(req,res)=>{
    const [opportunities,applications]=await Promise.all([
      query(`SELECT id,reference,name,description,category,location,target_amount::float AS "targetAmount",raised_amount::float AS "raisedAmount",
        minimum_member_investment::float AS "minimumInvestment",member_expected_return_rate::float AS "expectedReturnRate",
        member_investment_deadline AS deadline,status FROM investment_projects WHERE open_to_members=true
        AND status IN ('planning','active','running','construction') AND (member_investment_deadline IS NULL OR member_investment_deadline>=CURRENT_DATE) ORDER BY id DESC`),
      query(`SELECT a.id,a.reference,a.project_id AS "projectId",p.name AS project,a.amount::float,a.payment_method AS "paymentMethod",
        a.payment_reference AS "paymentReference",a.notes,a.status,a.review_comment AS "reviewComment",
        (a.evidence_stored_name IS NOT NULL) AS "hasEvidence",a.evidence_original_name AS "evidenceName",
        a.created_at AS "createdAt",a.reviewed_at AS "reviewedAt" FROM member_investment_applications a
        JOIN investment_projects p ON p.id=a.project_id WHERE a.member_id=$1 ORDER BY a.id DESC`,[req.user.member_id])
    ]);res.json({opportunities:opportunities.rows,applications:applications.rows});
  }));

  app.post("/api/member/investments",auth,linked,upload.single("evidence"),asyncRoute(async(req,res)=>{
    if(!validateFile(req,res))return;const projectId=Number(req.body.projectId),amount=Number(req.body.amount),paymentMethod=String(req.body.paymentMethod||"").trim(),paymentReference=String(req.body.paymentReference||"").trim();
    if(!Number.isInteger(projectId)||!Number.isFinite(amount)||amount<=0||!paymentMethod||paymentReference.length<3){removeFile(req.file.filename);return res.status(400).json({error:"Choose a project and enter a positive amount, payment method and transaction reference"});}
    try{const row=await transaction(async client=>{const project=(await client.query(`SELECT * FROM investment_projects WHERE id=$1 AND open_to_members=true AND status IN ('planning','active','running','construction') FOR UPDATE`,[projectId])).rows[0];
      if(!project){const error=new Error("This project is not currently accepting member investments");error.status=409;throw error;}
      if(project.member_investment_deadline&&new Date(project.member_investment_deadline)<new Date()){const error=new Error("The member investment deadline has passed");error.status=409;throw error;}
      if(amount<Number(project.minimum_member_investment||0)){const error=new Error(`Minimum investment is UGX ${Number(project.minimum_member_investment).toLocaleString()}`);error.status=400;throw error;}
      const ref=reference("MINV"),inserted=(await client.query(`INSERT INTO member_investment_applications
        (reference,project_id,member_id,amount,payment_method,payment_reference,notes,status,evidence_stored_name,evidence_original_name,evidence_mime_type,submitted_by)
        VALUES ($1,$2,$3,$4,$5,$6,$7,'investment_review',$8,$9,$10,$11) RETURNING id,reference,status,created_at AS "createdAt"`,
        [ref,project.id,req.user.member_id,amount,paymentMethod,paymentReference,String(req.body.notes||"").trim()||null,req.file.filename,req.file.originalname,req.file.mimetype,req.user.id])).rows[0];
      await notifyMember(client,req.user.member_id,"Investment request submitted",`${ref} for ${project.name} is awaiting Investment Department review.`);await notifyDepartment(client,"investment","New member investment request",`${ref} requires review before Finance verifies the payment.`);return inserted;});
      await audit({userId:req.user.id,action:"MEMBER_INVESTMENT_SUBMITTED",entityType:"member_investment_application",entityId:String(row.id),details:row.reference,...metadata(req)});res.status(201).json(row);
    }catch(error){removeFile(req.file.filename);throw error;}
  }));

  app.post("/api/member/welfare/contributions",auth,linked,upload.single("evidence"),asyncRoute(async(req,res)=>{
    if(!validateFile(req,res))return;const amount=Number(req.body.amount),type=String(req.body.contributionType||"").trim(),method=String(req.body.paymentMethod||"").trim(),paymentReference=String(req.body.paymentReference||"").trim();
    if(!Number.isFinite(amount)||amount<1000||!type||!method||paymentReference.length<3){removeFile(req.file.filename);return res.status(400).json({error:"Enter contribution type, at least UGX 1,000, payment method and transaction reference"});}
    try{const row=await transaction(async client=>{const member=(await client.query("SELECT full_name FROM members WHERE id=$1 AND status='active'",[req.user.member_id])).rows[0];if(!member){const error=new Error("Only an active member can submit a contribution");error.status=409;throw error;}
      const ref=reference("WCON"),department=(await client.query("SELECT id FROM departments WHERE code='welfare'")).rows[0];
      const contribution=(await client.query(`INSERT INTO welfare_contributions
        (reference,member_id,contribution_type,period,expected_amount,amount,payment_method,receipt_number,status,contribution_date,recorded_by,payment_reference,submission_source,evidence_stored_name,evidence_original_name,evidence_mime_type)
        VALUES ($1,$2,$3,$4,$5,$6,$7,NULL,'pending_finance_review',CURRENT_DATE,$8,$9,'member',$10,$11,$12) RETURNING id,reference,status,created_at AS "createdAt"`,
        [ref,req.user.member_id,type,String(req.body.period||"").trim()||null,Number(req.body.expectedAmount||25000),amount,method,req.user.id,paymentReference,req.file.filename,req.file.originalname,req.file.mimetype])).rows[0];
      const finance=(await client.query(`INSERT INTO organization_finance_entries
        (department_id,reference,entry_type,category,description,counterparty,payment_method,amount,status,supporting_document,transaction_date,recorded_by)
        VALUES ($1,$2,'income','Welfare Contribution',$3,$4,$5,$6,'pending_finance_review',$7,CURRENT_DATE,$8) RETURNING id`,
        [department.id,`FIN-${ref}`,type,member.full_name,method,amount,`/api/welfare/contributions/${contribution.id}/evidence`,req.user.id])).rows[0];
      await client.query("UPDATE welfare_contributions SET finance_entry_id=$1 WHERE id=$2",[finance.id,contribution.id]);await notifyMember(client,req.user.member_id,"Welfare contribution submitted",`${ref} is awaiting Finance verification.`);await notifyDepartment(client,"finance","Welfare contribution awaiting verification",`${ref} has member payment evidence and requires Finance review.`);return contribution;});
      await audit({userId:req.user.id,action:"MEMBER_WELFARE_CONTRIBUTION_SUBMITTED",entityType:"welfare_contribution",entityId:String(row.id),details:row.reference,...metadata(req)});res.status(201).json(row);
    }catch(error){removeFile(req.file.filename);throw error;}
  }));

  app.post("/api/member/welfare/requests",auth,linked,upload.single("evidence"),asyncRoute(async(req,res)=>{
    if(req.file&&!evidenceTypes.has(req.file.mimetype)){removeFile(req.file.filename);return res.status(400).json({error:"Supporting evidence must be JPG, PNG, WebP or PDF"});}
    const amount=Number(req.body.amount),category=String(req.body.category||"").trim(),urgency=String(req.body.urgency||"").toLowerCase(),description=String(req.body.description||"").trim();
    const relationship=String(req.body.beneficiaryRelationship||"self").trim().toLowerCase(),beneficiaryName=String(req.body.beneficiaryName||"").trim();
    const allowedCategories=new Set(["Funeral assistance","Marriage assistance","Accident assistance","Other assistance"]);
    if(!allowedCategories.has(category)||!["low","medium","high","critical"].includes(urgency)||!Number.isFinite(amount)||amount<=0||description.length<10){removeFile(req.file?.filename);return res.status(400).json({error:"Choose Funeral, Marriage, Accident or Other assistance, then enter urgency, amount and a clear description"});}
    const member=await one("SELECT full_name,joined_at FROM members WHERE id=$1 AND status='active'",[req.user.member_id]);
    if(!member)return res.status(409).json({error:"Only an active registered member can request welfare support"});
    const qualifiedAt=new Date(member.joined_at);qualifiedAt.setMonth(qualifiedAt.getMonth()+6);
    if(qualifiedAt>new Date())return res.status(409).json({error:`Welfare benefits start after six months of membership. You qualify on ${qualifiedAt.toLocaleDateString("en-UG")}.`});
    const allowedRelations={"Funeral assistance":["self","spouse","parent","guardian","child"],"Marriage assistance":["self","child"],"Accident assistance":["self"],"Other assistance":["self","spouse","parent","guardian","child"]};
    if(!allowedRelations[category].includes(relationship))return res.status(400).json({error:`${category} is not available for the selected relationship`});
    if(relationship!=="self"){
      if(!beneficiaryName)return res.status(400).json({error:"Enter the registered beneficiary name"});
      const family=await one("SELECT id FROM member_family_records WHERE member_id=$1 AND lower(full_name)=lower($2) AND lower(relationship)=lower($3) AND active=true AND eligible_for_welfare=true",[req.user.member_id,beneficiaryName,relationship]);
      if(!family)return res.status(409).json({error:"This beneficiary is not registered in your Legal Bio Data welfare family records"});
    }
    const policyLimit=category==="Funeral assistance"?(relationship==="self"?2000000:1000000):category==="Marriage assistance"||category==="Accident assistance"?1000000:null;
    if(policyLimit&&amount>policyLimit)return res.status(400).json({error:`The approved ${category.toLowerCase()} limit for this beneficiary is UGX ${policyLimit.toLocaleString()}`});    try{const row=await transaction(async client=>{const previous=(await client.query(`SELECT COALESCE(SUM(amount),0)::float AS amount FROM welfare_requests WHERE member_id=$1 AND status IN ('approved','closed')`,[req.user.member_id])).rows[0].amount,ref=reference("WEL");
      const inserted=(await client.query(`INSERT INTO welfare_requests
        (reference,member_id,request_type,description,amount,status,urgency,supporting_document,previous_support,submitted_by,evidence_stored_name,evidence_original_name,evidence_mime_type,
         beneficiary_name,beneficiary_relationship,policy_limit,policy_eligible,policy_reason)
        VALUES ($1,$2,$3,$4,$5,'submitted',$6,NULL,$7,$8,$9,$10,$11,$12,$13,$14,true,$15) RETURNING id,reference,status,created_at AS "createdAt"`,
        [ref,req.user.member_id,category,description,amount,urgency,previous,req.user.id,req.file?.filename||null,req.file?.originalname||null,req.file?.mimetype||null,
         beneficiaryName||member.full_name,relationship,policyLimit,policyLimit?`Within approved policy limit of UGX ${policyLimit.toLocaleString()}`:"Exceptional assistance requires committee and Executive review"])).rows[0];      if(req.file)await client.query("UPDATE welfare_requests SET supporting_document=$1 WHERE id=$2",[`/api/welfare/requests/${inserted.id}/evidence`,inserted.id]);await notifyMember(client,req.user.member_id,"Welfare request submitted",`${ref} is awaiting Welfare Department review.`);await notifyDepartment(client,"welfare","New welfare support request",`${ref} is a ${urgency} priority request requiring review.`);return inserted;});
      await audit({userId:req.user.id,action:"MEMBER_WELFARE_REQUEST_SUBMITTED",entityType:"welfare_request",entityId:String(row.id),details:row.reference,...metadata(req)});res.status(201).json(row);
    }catch(error){removeFile(req.file?.filename);throw error;}
  }));

  const sendEvidence=async(req,res,kind)=>{const table=kind==="investment"?"member_investment_applications":kind==="contribution"?"welfare_contributions":"welfare_requests",row=await one(`SELECT member_id,evidence_stored_name AS stored,evidence_mime_type AS mime FROM ${table} WHERE id=$1`,[req.params.id]);
    if(!row?.stored)return res.status(404).json({error:"Supporting evidence not found"});let allowed=Number(row.member_id)===Number(req.user.member_id);if(!allowed){const code=kind==="investment"?"investment":kind==="contribution"?"finance":"welfare";allowed=Boolean(await departmentPermission(req.user,code,"view"));}if(!allowed)return res.status(403).json({error:"Evidence access denied"});const file=path.join(uploadsDir,path.basename(row.stored));if(!fs.existsSync(file))return res.status(404).json({error:"Stored evidence file not found"});res.type(row.mime||"application/octet-stream").sendFile(file);};
  app.get("/api/member/investments/:id/evidence",auth,asyncRoute((req,res)=>sendEvidence(req,res,"investment")));
  app.get("/api/welfare/contributions/:id/evidence",auth,asyncRoute((req,res)=>sendEvidence(req,res,"contribution")));
  app.get("/api/welfare/requests/:id/evidence",auth,asyncRoute((req,res)=>sendEvidence(req,res,"request")));

  app.post("/api/investment/member-applications/:id/decision",auth,asyncRoute(async(req,res)=>{const decision=String(req.body.decision||"").toLowerCase(),access=await departmentPermission(req.user,"investment",decision==="approve"?"approve":"edit");if(!access)return res.status(403).json({error:"Your Investment assignment does not allow this decision"});const comment=String(req.body.comment||"").trim();if(!["approve","reject","more_information"].includes(decision))return res.status(400).json({error:"Choose approve, reject or request more information"});if(decision!=="approve"&&!comment)return res.status(400).json({error:"A review comment is required"});
    const result=await transaction(async client=>{const item=(await client.query(`SELECT a.*,p.name AS project,m.full_name AS member FROM member_investment_applications a JOIN investment_projects p ON p.id=a.project_id JOIN members m ON m.id=a.member_id WHERE a.id=$1 FOR UPDATE`,[req.params.id])).rows[0];if(!item){const error=new Error("Member investment request not found");error.status=404;throw error;}if(item.status!=="investment_review"){const error=new Error("This investment request is no longer awaiting Investment review");error.status=409;throw error;}let status=decision==="reject"?"rejected":decision==="more_information"?"more_information":"finance_review",financeId=null;
      if(decision==="approve"){const department=(await client.query("SELECT id FROM departments WHERE code='investment'")).rows[0],finance=(await client.query(`INSERT INTO organization_finance_entries (department_id,reference,entry_type,category,description,counterparty,payment_method,amount,status,supporting_document,transaction_date,recorded_by) VALUES ($1,$2,'income','Member Investment',$3,$4,$5,$6,'pending_finance_review',$7,CURRENT_DATE,$8) RETURNING id`,[department.id,`FIN-${item.reference}`,`Member investment in ${item.project}`,item.member,item.payment_method,item.amount,`/api/member/investments/${item.id}/evidence`,req.user.id])).rows[0];financeId=finance.id;await notifyDepartment(client,"finance","Member investment awaiting payment verification",`${item.reference} was approved by Investment and requires Finance verification.`);}
      await client.query(`UPDATE member_investment_applications SET status=$1,reviewed_by=$2,review_comment=$3,reviewed_at=NOW(),finance_entry_id=COALESCE($4,finance_entry_id),updated_at=NOW() WHERE id=$5`,[status,req.user.id,comment||"Approved for Finance verification",financeId,item.id]);await notifyMember(client,item.member_id,"Investment request updated",`${item.reference} is now ${status.replaceAll("_"," ")}.`);return {item,status};});
    await audit({userId:req.user.id,action:`MEMBER_INVESTMENT_${decision.toUpperCase()}`,entityType:"member_investment_application",entityId:String(result.item.id),details:`${result.item.reference}  -  ${result.status}`,...metadata(req)});res.json({ok:true,status:result.status});
  }));
  app.patch("/api/member/notifications/:id/read",auth,linked,asyncRoute(async(req,res)=>{const row=await one(`UPDATE notifications SET read_at=COALESCE(read_at,NOW()) WHERE id=$1 AND (user_id=$2 OR member_id=$3) RETURNING id`,[req.params.id,req.user.id,req.user.member_id]);if(!row)return res.status(404).json({error:"Notification not found"});res.json({ok:true});}));
  app.post("/api/member/notifications/read-all",auth,linked,asyncRoute(async(req,res)=>{await query("UPDATE notifications SET read_at=COALESCE(read_at,NOW()) WHERE user_id=$1 OR member_id=$2",[req.user.id,req.user.member_id]);res.json({ok:true});}));
};
