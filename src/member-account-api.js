module.exports = function registerMemberAccountApi({
  app, auth, asyncRoute, query, one, transaction, audit, metadata, upload, fs, path, uploadsDir
}) {
  const imageTypes = new Set(["image/jpeg","image/png","image/webp"]);
  const receiptTypes = new Set(["image/jpeg","image/png","image/webp","application/pdf"]);
  const removeStoredFile = storedName => {
    if (!storedName || path.basename(storedName) !== storedName) return;
    const target = path.join(uploadsDir, storedName);
    if (target.startsWith(`${uploadsDir}${path.sep}`)) fs.unlink(target, () => {});
  };
  const requireLinkedMember = (req,res,next) => req.user.member_id
    ? next()
    : res.status(403).json({error:"This account is not linked to a registered member"});

  app.patch("/api/account/profile",auth,asyncRoute(async(req,res)=>{
    const b=req.body,fullName=String(b.fullName||"").trim(),email=String(b.email||"").trim().toLowerCase(),
      phone=String(b.phone||"").trim();
    if(fullName.length<2||fullName.length>120)return res.status(400).json({error:"Enter a valid account name"});
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return res.status(400).json({error:"Enter a valid email address"});
    if(phone.length<7||phone.length>30)return res.status(400).json({error:"Enter a valid phone number"});
    try {
      await transaction(async client=>{
        await client.query("UPDATE users SET full_name=$1,email=$2,phone=$3 WHERE id=$4",[fullName,email,phone,req.user.id]);
        if(!req.user.member_id)return;
        const membershipStatus=["active","suspended","inactive"].includes(b.membershipStatus)?b.membershipStatus:"active";
        await client.query(`UPDATE members SET full_name=$1,email=$2,phone=$3,national_id=NULLIF($4,''),
          provisional=CASE WHEN NULLIF($4,'') IS NOT NULL THEN false ELSE provisional END,
          occupation=NULLIF($5,''),employer=NULLIF($6,''),address=NULLIF($7,''),next_of_kin=NULLIF($8,''),
          beneficiaries=NULLIF($9,''),status=$10 WHERE id=$11`,
        [fullName,email,phone,String(b.nationalId||"").trim(),String(b.occupation||"").trim(),
          String(b.employer||"").trim(),String(b.address||"").trim(),String(b.nextOfKin||"").trim(),
          String(b.beneficiaries||"").trim(),membershipStatus,req.user.member_id]);
        await client.query(`INSERT INTO member_bio_data
          (member_id,date_of_birth,gender,marital_status,nationality,home_district,subcounty,parish,village,
           emergency_contact_name,emergency_contact_phone,emergency_contact_relationship,blood_group,
           disability_notes,bio_status,created_by,updated_at)
          VALUES ($1,NULLIF($2,'')::date,NULLIF($3,''),NULLIF($4,''),NULLIF($5,''),NULLIF($6,''),
            NULLIF($7,''),NULLIF($8,''),NULLIF($9,''),NULLIF($10,''),NULLIF($11,''),NULLIF($12,''),
            NULLIF($13,''),NULLIF($14,''),'complete',$15,NOW())
          ON CONFLICT (member_id) DO UPDATE SET date_of_birth=EXCLUDED.date_of_birth,gender=EXCLUDED.gender,
            marital_status=EXCLUDED.marital_status,nationality=EXCLUDED.nationality,
            home_district=EXCLUDED.home_district,subcounty=EXCLUDED.subcounty,parish=EXCLUDED.parish,
            village=EXCLUDED.village,emergency_contact_name=EXCLUDED.emergency_contact_name,
            emergency_contact_phone=EXCLUDED.emergency_contact_phone,
            emergency_contact_relationship=EXCLUDED.emergency_contact_relationship,
            blood_group=EXCLUDED.blood_group,disability_notes=EXCLUDED.disability_notes,updated_at=NOW()`,
        [req.user.member_id,b.dateOfBirth||"",b.gender||"",b.maritalStatus||"",String(b.nationality||"").trim(),
          String(b.homeDistrict||"").trim(),String(b.subcounty||"").trim(),String(b.parish||"").trim(),
          String(b.village||"").trim(),String(b.emergencyContactName||"").trim(),
          String(b.emergencyContactPhone||"").trim(),String(b.emergencyContactRelationship||"").trim(),
          String(b.bloodGroup||"").trim(),String(b.disabilityNotes||"").trim(),req.user.id]);
      });
    } catch(error) {
      if(error.code==="23505")return res.status(409).json({error:"That email address or National ID is already registered"});
      throw error;
    }
    await audit({userId:req.user.id,action:"ACCOUNT_PROFILE_UPDATED",entityType:"user",entityId:String(req.user.id),
      details:req.user.member_id?"Account and linked membership profile updated":"Account profile updated",...metadata(req)});
    res.json({ok:true,fullName,email,phone});
  }));

  app.get("/api/account/profile-photo",auth,asyncRoute(async(req,res)=>{
    const photo=await one(`SELECT profile_photo_stored_name AS stored,profile_photo_mime_type AS mime
      FROM users WHERE id=$1`,[req.user.id]);
    if(!photo?.stored)return res.status(404).json({error:"Profile photo not found"});
    const filePath=path.join(uploadsDir,path.basename(photo.stored));
    if(!fs.existsSync(filePath))return res.status(404).json({error:"Profile photo not found"});
    res.type(photo.mime||"application/octet-stream").sendFile(filePath);
  }));

  app.get("/api/users/:userId/profile-photo",auth,asyncRoute(async(req,res)=>{
    const photo=await one(`SELECT profile_photo_stored_name AS stored,profile_photo_mime_type AS mime
      FROM users WHERE id=$1 AND active=true`,[req.params.userId]);
    if(!photo?.stored)return res.status(404).json({error:"Profile photo not found"});
    const filePath=path.join(uploadsDir,path.basename(photo.stored));
    if(!fs.existsSync(filePath))return res.status(404).json({error:"Profile photo not found"});
    res.set("Cache-Control","private, max-age=300");
    res.type(photo.mime||"application/octet-stream").sendFile(filePath);
  }));

  app.post("/api/account/profile-photo",auth,upload.single("photo"),asyncRoute(async(req,res)=>{
    if(!req.file)return res.status(400).json({error:"Choose a JPG, PNG or WebP photo"});
    if(!imageTypes.has(req.file.mimetype)){
      removeStoredFile(req.file.filename);
      return res.status(400).json({error:"Profile photos must be JPG, PNG or WebP"});
    }
    const old=await one("SELECT profile_photo_stored_name AS stored FROM users WHERE id=$1",[req.user.id]);
    await query(`UPDATE users SET profile_photo_stored_name=$1,profile_photo_original_name=$2,
      profile_photo_mime_type=$3 WHERE id=$4`,[req.file.filename,req.file.originalname,req.file.mimetype,req.user.id]);
    removeStoredFile(old?.stored);
    await audit({userId:req.user.id,action:"PROFILE_PHOTO_UPDATED",entityType:"user",entityId:String(req.user.id),...metadata(req)});
    res.json({ok:true});
  }));

  app.delete("/api/account/profile-photo",auth,asyncRoute(async(req,res)=>{
    const old=await one("SELECT profile_photo_stored_name AS stored FROM users WHERE id=$1",[req.user.id]);
    await query(`UPDATE users SET profile_photo_stored_name=NULL,profile_photo_original_name=NULL,
      profile_photo_mime_type=NULL WHERE id=$1`,[req.user.id]);
    removeStoredFile(old?.stored);
    await audit({userId:req.user.id,action:"PROFILE_PHOTO_REMOVED",entityType:"user",entityId:String(req.user.id),...metadata(req)});
    res.json({ok:true});
  }));

  app.post("/api/member/deposits",auth,requireLinkedMember,upload.single("receipt"),asyncRoute(async(req,res)=>{
    const amount=Number(req.body.amount),method=String(req.body.method||"").trim(),externalReference=String(req.body.externalReference||"").trim();
    const contributionTypes={savings:"Savings deposit",shares:"Share purchase",subscription:"Annual subscription fee"};
    const transactionType=contributionTypes[String(req.body.contributionType||"savings")]||contributionTypes.savings;
    const currentPolicy=await one(`SELECT EXTRACT(YEAR FROM ends_on)::int AS year,starts_on AS "startsOn",ends_on AS "endsOn",
      monthly_savings_target::float AS "monthlySavingsTarget",annual_share_target::float AS "annualShareTarget",
      annual_subscription_fee::float AS "annualSubscriptionFee",
      LEAST(12,GREATEST(0,(EXTRACT(YEAR FROM age(LEAST(CURRENT_DATE,ends_on),starts_on))*12+
        EXTRACT(MONTH FROM age(LEAST(CURRENT_DATE,ends_on),starts_on))+1)::int)) AS "monthsDue"
      FROM member_financial_year_policies WHERE status='active' AND CURRENT_DATE BETWEEN starts_on AND ends_on ORDER BY starts_on DESC LIMIT 1`);
    const previousPeriod=await one("SELECT fiscal_year AS year FROM financial_reporting_periods ORDER BY period_end DESC LIMIT 1");
    const targetFiscalYear=Number(req.body.fiscalYear||currentPolicy?.year||new Date().getUTCFullYear());
    const allowedYears=[Number(currentPolicy?.year),Number(previousPeriod?.year),new Date().getUTCFullYear()].filter(Number.isFinite);
    if(!allowedYears.includes(targetFiscalYear)){removeStoredFile(req.file?.filename);return res.status(400).json({error:"Choose a valid current or previous financial year"});}
    if(targetFiscalYear===Number(previousPeriod?.year)&&transactionType!=="Savings deposit"){removeStoredFile(req.file?.filename);return res.status(400).json({error:"Previous-year allocation is available only for clearing savings arrears"});}
    if(!req.file)return res.status(400).json({error:"Upload a receipt photo or PDF showing the payment"});
    if(!receiptTypes.has(req.file.mimetype)){
      removeStoredFile(req.file.filename);
      return res.status(400).json({error:"Deposit evidence must be a JPG, PNG, WebP or PDF file"});
    }
    if(!Number.isFinite(amount)||amount<1000||!["Mobile Money","Bank transfer","Cheque","Cash"].includes(method)||externalReference.length<3){
      removeStoredFile(req.file.filename);
      return res.status(400).json({error:"Enter an amount of at least UGX 1,000, payment method and transaction reference"});
    }
    const active=await one("SELECT id FROM members WHERE id=$1 AND status='active'",[req.user.member_id]);
    if(!active){removeStoredFile(req.file.filename);return res.status(409).json({error:"Only an active member can submit a contribution"});}
    let outstanding=0;
    if(targetFiscalYear===Number(previousPeriod?.year)){
      const past=await one(`SELECT COALESCE(legacy.expected_savings,0)::float AS expected,
        COALESCE(legacy.savings_balance,0)::float+COALESCE((SELECT SUM(t.amount) FROM transactions t
          WHERE t.member_id=m.id AND t.type='Savings deposit' AND t.status='completed' AND t.target_fiscal_year=$2),0)::float AS paid
        FROM members m LEFT JOIN legacy_member_opening_balances legacy ON legacy.id=m.legacy_opening_balance_id WHERE m.id=$1`,[req.user.member_id,targetFiscalYear]);
      outstanding=Math.max(0,Number(past?.expected||0)-Number(past?.paid||0));
    } else if(currentPolicy) {
      const typeTarget=transactionType==='Savings deposit'?Number(currentPolicy.monthlySavingsTarget)*Number(currentPolicy.monthsDue):
        transactionType==='Share purchase'?Number(currentPolicy.annualShareTarget):Number(currentPolicy.annualSubscriptionFee);
      const paid=Number((await one(`SELECT COALESCE(SUM(amount),0)::float AS amount FROM transactions
        WHERE member_id=$1 AND type=$2 AND status='completed' AND
          (target_fiscal_year=$3 OR (target_fiscal_year IS NULL AND created_at::date BETWEEN $4 AND $5))`,
      [req.user.member_id,transactionType,targetFiscalYear,currentPolicy.startsOn,currentPolicy.endsOn]))?.amount||0);
      outstanding=Math.max(0,typeTarget-paid);
    } else {
      outstanding=transactionType==="Savings deposit"?Number.POSITIVE_INFINITY:0;
    }
    if(outstanding<=0&&transactionType!=="Savings deposit"){removeStoredFile(req.file.filename);return res.status(409).json({error:"That contribution is already fully paid for the selected financial year"});}
    if(transactionType!=="Savings deposit"&&amount>outstanding){removeStoredFile(req.file.filename);return res.status(400).json({error:`The amount exceeds the remaining ${transactionType.toLowerCase()} balance of UGX ${outstanding.toLocaleString()}`});}
    const reference=`MDP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
    try {
      const row=await one(`INSERT INTO transactions
        (reference,member_id,type,method,amount,status,external_reference,notes,recorded_by,submission_source,
         evidence_stored_name,evidence_original_name,evidence_mime_type,target_fiscal_year)
        VALUES ($1,$2,$3,$4,$5,'pending',$6,$7,$8,'member',$9,$10,$11,$12)
        RETURNING id,reference,status,created_at AS "createdAt"`,
      [reference,req.user.member_id,transactionType,method,amount,externalReference,String(req.body.notes||"").trim()||null,req.user.id,
        req.file.filename,req.file.originalname,req.file.mimetype,targetFiscalYear]);
      await query("INSERT INTO notifications (member_id,title,message) VALUES ($1,$2,$3)",
        [req.user.member_id,`${transactionType} submitted`,`${reference} is awaiting Credits verification.`]);
      await query(`INSERT INTO notifications (user_id,title,message) SELECT DISTINCT u.id,'Member contribution awaiting verification',$1
        FROM departments d JOIN department_assignments da ON da.department_id=d.id AND da.active=true AND da.can_view=true
        JOIN users u ON u.id=da.user_id AND u.active=true WHERE d.code='credits'`,[`${reference} has payment evidence ready for review.`]);
      await audit({userId:req.user.id,action:"MEMBER_DEPOSIT_SUBMITTED",entityType:"transaction",entityId:String(row.id),
        details:`${reference} - ${method} - UGX ${amount}`,...metadata(req)});
      res.status(201).json(row);
    } catch(error){removeStoredFile(req.file.filename);throw error;}
  }));

  async function buildMemberCommandCenter(memberId, { viewerUserId = null } = {}) {
    const [member, transactions, loans, guarantees, investments, welfareRequests, welfareContributions,
      meetings, documents, notifications, announcements, support] = await Promise.all([
      one(`SELECT m.id,m.member_number AS "memberNumber",m.full_name AS "fullName",m.email,CASE WHEN m.provisional THEN NULL ELSE m.phone END AS phone,CASE WHEN m.provisional THEN NULL ELSE m.national_id END AS "nationalId",
        m.occupation,m.employer,m.address,m.next_of_kin AS "nextOfKin",m.beneficiaries,m.status,m.joined_at AS "joinedAt",
        m.savings_balance::float AS savings,m.share_capital::float AS shares,m.dividends::float,br.name AS branch,
        b.date_of_birth AS "dateOfBirth",b.gender,b.marital_status AS "maritalStatus",b.nationality,
        b.home_district AS "homeDistrict",b.subcounty,b.parish,b.village,b.emergency_contact_name AS "emergencyContactName",
        b.emergency_contact_phone AS "emergencyContactPhone",b.emergency_contact_relationship AS "emergencyContactRelationship",
        b.blood_group AS "bloodGroup",b.disability_notes AS "disabilityNotes",
        b.bio_status AS "bioStatus",(b.passport_photo_stored_name IS NOT NULL) AS "hasPassportPhoto"
        FROM members m LEFT JOIN branches br ON br.id=m.branch_id LEFT JOIN member_bio_data b ON b.member_id=m.id WHERE m.id=$1 AND m.deleted_at IS NULL`,[memberId]),
      query(`SELECT t.id,t.reference,t.type,t.method,t.amount::float,t.status,t.receipt_number AS "receiptNumber",
        t.external_reference AS "externalReference",t.notes,t.submission_source AS "submissionSource",
        (t.evidence_stored_name IS NOT NULL) AS "hasEvidence",t.evidence_original_name AS "evidenceName",
        t.verification_comment AS "verificationComment",t.target_fiscal_year AS "targetFiscalYear",t.created_at AS "createdAt",t.verified_at AS "verifiedAt",
        verifier.full_name AS "verifiedBy" FROM transactions t LEFT JOIN users verifier ON verifier.id=t.verified_by
        WHERE t.member_id=$1 ORDER BY t.id DESC LIMIT 100`,[memberId]),
      query(`SELECT l.id,l.reference,p.name AS product,l.amount::float,l.balance::float,l.term_months AS "termMonths",
        l.purpose,l.status,l.due_date AS "dueDate",l.created_at AS "createdAt",l.verified_amount::float AS "verifiedAmount",
        COALESCE((SELECT SUM(s.total_due) FROM loan_repayment_schedule s WHERE s.loan_id=l.id),l.amount)::float AS "totalDue",
        COALESCE((SELECT SUM(s.paid_amount) FROM loan_repayment_schedule s WHERE s.loan_id=l.id),0)::float AS "totalPaid",
        COALESCE((SELECT SUM(s.interest) FROM loan_repayment_schedule s WHERE s.loan_id=l.id),0)::float AS "totalInterest",
        COALESCE((SELECT SUM(GREATEST(0,c.amount-c.paid_amount)) FROM loan_charges c WHERE c.loan_id=l.id AND c.status IN ('outstanding','partial') AND c.charge_type <> 'Processing fee'),0)::float AS "outstandingCharges",
        (SELECT MIN(due_date) FROM loan_repayment_schedule WHERE loan_id=l.id AND status<>'paid') AS "nextDueDate",
        COALESCE((SELECT (total_due-paid_amount)::float FROM loan_repayment_schedule WHERE loan_id=l.id AND status<>'paid' ORDER BY installment_number LIMIT 1),0)::float AS "nextPaymentAmount",
        (SELECT COUNT(*)::int FROM loan_repayment_schedule WHERE loan_id=l.id) AS "totalInstallments",
        (SELECT COUNT(*)::int FROM loan_repayment_schedule WHERE loan_id=l.id AND status='paid') AS "paidInstallments"
        FROM loans l JOIN loan_products p ON p.id=l.product_id WHERE l.member_id=$1 ORDER BY l.id DESC`,[memberId]),
      query(`SELECT l.id AS "loanId",l.reference,l.amount::float,l.balance::float,l.status,
        borrower.full_name AS borrower,lg.status AS "guaranteeStatus",lg.response_note AS note,lg.created_at AS "createdAt"
        FROM loan_guarantors lg JOIN loans l ON l.id=lg.loan_id JOIN members borrower ON borrower.id=l.member_id
        WHERE lg.member_id=$1 ORDER BY lg.id DESC`,[memberId]),
      query(`SELECT i.id,p.reference,p.name AS project,i.amount_invested::float AS "amountInvested",
        i.expected_returns::float AS "expectedReturns",i.payments_received::float AS "paymentsReceived",
        i.ownership_percentage::float AS "ownershipPercentage",i.investment_date AS "investmentDate",i.status
        FROM investment_investors i JOIN investment_projects p ON p.id=i.project_id WHERE i.member_id=$1 ORDER BY i.id DESC`,[memberId]),
      query(`SELECT id,reference,request_type AS category,description,amount::float,status,urgency,payment_status AS "paymentStatus",
        (evidence_stored_name IS NOT NULL) AS "hasEvidence",evidence_original_name AS "evidenceName",created_at AS "createdAt"
        FROM welfare_requests WHERE member_id=$1 ORDER BY id DESC`,[memberId]),
      query(`SELECT id,reference,contribution_type AS type,period,expected_amount::float AS expected,
        amount::float,payment_method AS "paymentMethod",payment_reference AS "paymentReference",
        receipt_number AS "receiptNumber",status,(evidence_stored_name IS NOT NULL) AS "hasEvidence",
        evidence_original_name AS "evidenceName",contribution_date AS "contributionDate"
        FROM welfare_contributions WHERE member_id=$1 ORDER BY id DESC`,[memberId]),
      query(`SELECT id,reference,title,meeting_type AS "meetingType",agenda,venue,scheduled_at AS "scheduledAt",status
        FROM organization_meetings WHERE visibility_level<=1 ORDER BY scheduled_at DESC LIMIT 100`),
      query(`SELECT id,reference,document_type AS "documentType",title,version,file_name AS "fileName",updated_at AS "updatedAt",
        EXISTS(SELECT 1 FROM organization_document_versions v WHERE v.document_id=organization_documents.id) AS "hasFile"
        FROM organization_documents WHERE status='published' AND visibility_level<=1 ORDER BY updated_at DESC LIMIT 100`),
      viewerUserId
        ? query(`SELECT id,title,message,read_at AS "readAt",created_at AS "createdAt"
            FROM notifications WHERE user_id=$1 OR member_id=$2 ORDER BY id DESC LIMIT 100`,[viewerUserId,memberId])
        : query(`SELECT id,title,message,read_at AS "readAt",created_at AS "createdAt"
            FROM notifications WHERE member_id=$1 ORDER BY id DESC LIMIT 100`,[memberId]),
      query(`SELECT id,title,body,created_at AS "createdAt" FROM announcements ORDER BY id DESC LIMIT 30`),
      query(`SELECT id,reference,category,subject,description,status,response,created_at AS "createdAt",updated_at AS "updatedAt"
        FROM member_support_requests WHERE member_id=$1 ORDER BY id DESC`,[memberId])
    ]);
    if (!member) return null;
    const financialYear = await one(`SELECT id,fiscal_year_label AS "fiscalYear",starts_on AS "startsOn",ends_on AS "endsOn",
      monthly_savings_target::float AS "monthlySavingsTarget",annual_share_target::float AS "annualShareTarget",
      annual_subscription_fee::float AS "annualSubscriptionFee",
      LEAST(12,GREATEST(0,(EXTRACT(YEAR FROM age(LEAST(CURRENT_DATE,ends_on),starts_on))*12+
        EXTRACT(MONTH FROM age(LEAST(CURRENT_DATE,ends_on),starts_on))+1)::int)) AS "monthsDue"
      FROM member_financial_year_policies
      WHERE status='active' AND CURRENT_DATE BETWEEN starts_on AND ends_on ORDER BY starts_on DESC LIMIT 1`);
    const yearContributions = financialYear ? await one(`SELECT
      COALESCE(SUM(amount) FILTER (WHERE type='Savings deposit' AND status='completed'),0)::float AS savings,
      COALESCE(SUM(amount) FILTER (WHERE type='Share purchase' AND status='completed'),0)::float AS shares,
      COALESCE(SUM(amount) FILTER (WHERE type='Annual subscription fee' AND status='completed'),0)::float AS subscription
      FROM transactions WHERE member_id=$1 AND (target_fiscal_year=EXTRACT(YEAR FROM $3::date)::int OR (target_fiscal_year IS NULL AND created_at::date BETWEEN $2 AND $3))`,[memberId,financialYear.startsOn,financialYear.endsOn]) : { savings: 0, shares: 0, subscription: 0 };
    const closingPosition = await one(`SELECT p.period_end AS "periodEnd",b.savings_balance::float AS savings,
      b.share_capital::float AS shares,b.expected_savings::float AS expected,
      b.deficit_surplus::float AS "deficitSurplus",b.proposed_dividend::float AS "proposedDividend"
      FROM members m JOIN legacy_member_opening_balances b ON b.id=m.legacy_opening_balance_id
      JOIN financial_reporting_periods p ON p.id=b.period_id WHERE m.id=$1`,[memberId]);
    const previousArrearsPaid = closingPosition ? Number((await one(`SELECT COALESCE(SUM(amount),0)::float AS amount FROM transactions
      WHERE member_id=$1 AND type='Savings deposit' AND status='completed' AND target_fiscal_year=EXTRACT(YEAR FROM $2::date)::int`,[memberId,closingPosition.periodEnd])).amount) : 0;
    const pastYearProgress = closingPosition ? {
      fiscalYear: `FY ${new Date(closingPosition.periodEnd).getUTCFullYear() - 1}/${String(new Date(closingPosition.periodEnd).getUTCFullYear()).slice(-2)}`,
      periodEnd: closingPosition.periodEnd, paidAtClose: Number(closingPosition.savings), arrearsPaid: previousArrearsPaid,
      totalPaid: Number(closingPosition.savings) + previousArrearsPaid, expected: Number(closingPosition.expected),
      variance: Number(closingPosition.savings) + previousArrearsPaid - Number(closingPosition.expected)
    } : null;
    const financialYearProgress = financialYear ? {
      ...financialYear, annualSavingsTarget: Number(financialYear.monthlySavingsTarget) * 12,
      expectedSavingsToDate: Number(financialYear.monthlySavingsTarget) * Number(financialYear.monthsDue),
      savingsPaid: Number(yearContributions.savings), sharePaid: Number(yearContributions.shares),
      subscriptionPaid: Number(yearContributions.subscription)
    } : null;
    const activeLoans = loans.rows.filter(item => ["active", "overdue"].includes(item.status));
    const contributionsTotal = welfareContributions.rows.filter(item => ["verified", "recorded", "completed"].includes(item.status)).reduce((sum, item) => sum + Number(item.amount), 0);
    const investmentTotal = investments.rows.reduce((sum, item) => sum + Number(item.amountInvested), 0);
    const pendingRequests = transactions.rows.filter(item => ["pending", "pending_finance_review"].includes(item.status)).length +
      loans.rows.filter(item => !["active", "completed", "rejected", "closed"].includes(item.status)).length +
      welfareRequests.rows.filter(item => !["paid", "closed", "rejected"].includes(item.status)).length +
      guarantees.rows.filter(item => item.guaranteeStatus === "pending").length;
    const recentActivity = [
      ...transactions.rows.map(item => ({ type: "transaction", title: item.type, detail: `UGX ${Number(item.amount).toLocaleString()}`, date: item.createdAt, status: item.status })),
      ...welfareRequests.rows.map(item => ({ type: "welfare", title: `Welfare ${item.category}`, detail: `UGX ${Number(item.amount).toLocaleString()}`, date: item.createdAt, status: item.status })),
      ...notifications.rows.map(item => ({ type: "notification", title: item.title, detail: item.message, date: item.createdAt, status: item.readAt ? "read" : "new" }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20);
    return {
      member, summary: {
        savings: member.savings, totalMemberFunds: Number(member.savings) + Number(member.shares),
        activeLoanBalance: activeLoans.reduce((sum, item) => sum + Number(item.balance), 0),
        availableLoanLimit: Math.max(0, member.savings * 3 - activeLoans.reduce((sum, item) => sum + Number(item.balance), 0)),
        welfareContributions: contributionsTotal, investments: investmentTotal, shares: member.shares,
        pendingRequests, notifications: notifications.rows.filter(item => !item.readAt).length
      },
      transactions: transactions.rows, loans: loans.rows, guarantees: guarantees.rows, investments: investments.rows,
      welfare: { requests: welfareRequests.rows, contributions: welfareContributions.rows }, meetings: meetings.rows,
      documents: documents.rows, notifications: notifications.rows, announcements: announcements.rows, support: support.rows, recentActivity,
      financialYearProgress, pastYearProgress, closingPosition
    };
  }

  app.get("/api/member/command-center", auth, requireLinkedMember, asyncRoute(async (req, res) => {
    const payload = await buildMemberCommandCenter(req.user.member_id, { viewerUserId: req.user.id });
    if (!payload) return res.status(404).json({ error: "Linked member record not found" });
    res.json(payload);
  }));

  const memberOversightRoles = new Set(["Executive Officer", "Credits Officer", "Legal Officer", "Auditor", "Supervisory Officer", "System Admin"]);
  app.get("/api/members/:memberId/command-center", auth, asyncRoute(async (req, res) => {
    if (!memberOversightRoles.has(req.user.role)) {
      return res.status(403).json({ error: "Member account oversight is limited to leadership and membership officers" });
    }
    const memberId = Number(req.params.memberId);
    if (!Number.isInteger(memberId) || memberId < 1) return res.status(400).json({ error: "Choose a valid member" });
    const payload = await buildMemberCommandCenter(memberId);
    if (!payload) return res.status(404).json({ error: "Member record not found" });
    res.json({ ...payload, oversight: true, readOnly: true });
  }));

  const memberFinanceRoles = new Set(["Executive Officer", "Credits Officer", "System Admin"]);
  app.post("/api/members/:memberId/deposits", auth, upload.single("receipt"), asyncRoute(async (req, res) => {
    if (!memberFinanceRoles.has(req.user.role)) {
      removeStoredFile(req.file?.filename);
      return res.status(403).json({ error: "Only Executive or Credits can submit a deposit for another member" });
    }
    const memberId = Number(req.params.memberId);
    if (!Number.isInteger(memberId) || memberId < 1) {
      removeStoredFile(req.file?.filename);
      return res.status(400).json({ error: "Choose a valid member" });
    }
    req.user = { ...req.user, member_id: memberId };
    // Reuse linked-member deposit rules by forwarding body through the same validation path inline:
    const amount=Number(req.body.amount),method=String(req.body.method||"").trim(),externalReference=String(req.body.externalReference||"").trim();
    const contributionTypes={savings:"Savings deposit",shares:"Share purchase",subscription:"Annual subscription fee"};
    const transactionType=contributionTypes[String(req.body.contributionType||"savings")]||contributionTypes.savings;
    const currentPolicy=await one(`SELECT EXTRACT(YEAR FROM ends_on)::int AS year,starts_on AS "startsOn",ends_on AS "endsOn",
      monthly_savings_target::float AS "monthlySavingsTarget",annual_share_target::float AS "annualShareTarget",
      annual_subscription_fee::float AS "annualSubscriptionFee",
      LEAST(12,GREATEST(0,(EXTRACT(YEAR FROM age(LEAST(CURRENT_DATE,ends_on),starts_on))*12+
        EXTRACT(MONTH FROM age(LEAST(CURRENT_DATE,ends_on),starts_on))+1)::int)) AS "monthsDue"
      FROM member_financial_year_policies WHERE status='active' AND CURRENT_DATE BETWEEN starts_on AND ends_on ORDER BY starts_on DESC LIMIT 1`);
    const previousPeriod=await one("SELECT fiscal_year AS year FROM financial_reporting_periods ORDER BY period_end DESC LIMIT 1");
    const targetFiscalYear=Number(req.body.fiscalYear||currentPolicy?.year||new Date().getUTCFullYear());
    const allowedYears=[Number(currentPolicy?.year),Number(previousPeriod?.year),new Date().getUTCFullYear()].filter(Number.isFinite);
    if(!allowedYears.includes(targetFiscalYear)){removeStoredFile(req.file?.filename);return res.status(400).json({error:"Choose a valid current or previous financial year"});}
    if(!req.file)return res.status(400).json({error:"Upload a receipt photo or PDF showing the payment"});
    if(!receiptTypes.has(req.file.mimetype)){removeStoredFile(req.file.filename);return res.status(400).json({error:"Deposit evidence must be a JPG, PNG, WebP or PDF file"});}
    if(!Number.isFinite(amount)||amount<1000||!["Mobile Money","Bank transfer","Cheque","Cash"].includes(method)||externalReference.length<3){
      removeStoredFile(req.file.filename);
      return res.status(400).json({error:"Enter an amount of at least UGX 1,000, payment method and transaction reference"});
    }
    const active=await one("SELECT id FROM members WHERE id=$1 AND status='active'",[memberId]);
    if(!active){removeStoredFile(req.file.filename);return res.status(409).json({error:"Only an active member can receive a contribution"});}
    const reference=`MDP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
    try {
      const row=await one(`INSERT INTO transactions
        (reference,member_id,type,method,amount,status,external_reference,notes,recorded_by,submission_source,
         evidence_stored_name,evidence_original_name,evidence_mime_type,target_fiscal_year)
        VALUES ($1,$2,$3,$4,$5,'pending',$6,$7,$8,'staff',$9,$10,$11,$12)
        RETURNING id,reference,status,created_at AS "createdAt"`,
      [reference,memberId,transactionType,method,amount,externalReference,String(req.body.notes||"").trim()||null,req.user.id,
        req.file.filename,req.file.originalname,req.file.mimetype,targetFiscalYear]);
      await query("INSERT INTO notifications (member_id,title,message) VALUES ($1,$2,$3)",
        [memberId,`${transactionType} submitted`,`${reference} is awaiting Credits verification.`]);
      await audit({userId:req.user.id,action:"MEMBER_DEPOSIT_SUBMITTED",entityType:"transaction",entityId:String(row.id),
        details:`${reference} - ${method} - UGX ${amount} (oversight)`,...metadata(req)});
      res.status(201).json(row);
    } catch(error){removeStoredFile(req.file.filename);throw error;}
  }));

  app.get("/api/member/passport-photo",auth,requireLinkedMember,asyncRoute(async(req,res)=>{
    const photo=await one(`SELECT passport_photo_stored_name AS stored,passport_photo_mime_type AS mime
      FROM member_bio_data WHERE member_id=$1`,[req.user.member_id]);
    if(!photo?.stored)return res.status(404).json({error:"Passport photo not found"});
    const filePath=path.join(uploadsDir,path.basename(photo.stored));
    if(!fs.existsSync(filePath))return res.status(404).json({error:"Passport photo not found"});
    res.type(photo.mime||"application/octet-stream").sendFile(filePath);
  }));

  app.post("/api/member/support",auth,requireLinkedMember,asyncRoute(async(req,res)=>{
    const category=String(req.body.category||"General help").trim(),subject=String(req.body.subject||"").trim(),
      description=String(req.body.description||"").trim();
    if(subject.length<3||description.length<10)return res.status(400).json({error:"Enter a subject and a clear description"});
    const legal=await one("SELECT id FROM departments WHERE code='legal'");
    const reference=`SUP-${Date.now().toString(36).toUpperCase()}`;
    const row=await one(`INSERT INTO member_support_requests
      (reference,member_id,category,subject,description,assigned_department_id)
      VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,[reference,req.user.member_id,category,subject,description,legal?.id||null]);
    await audit({userId:req.user.id,action:"MEMBER_SUPPORT_REQUESTED",entityType:"member_support",entityId:String(row.id),details:reference,...metadata(req)});
    res.status(201).json({id:row.id,reference});
  }));
};





