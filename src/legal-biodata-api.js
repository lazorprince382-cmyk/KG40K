module.exports = function registerLegalBioDataApi({
  app, auth, asyncRoute, departmentPermission, query, one, transaction, audit, metadata
}) {
  function requireLegal(action="view") {
    return asyncRoute(async(req,res,next)=>{
      const access=await departmentPermission(req.user,"legal",action);
      if(!access)return res.status(403).json({error:`Your Legal assignment does not allow ${action} access to member bio data`});
      req.legalAccess=access;next();
    });
  }
  const selectBio=`SELECT m.id AS "memberId",m.member_number AS "memberNumber",m.full_name AS "fullName",
    m.email,CASE WHEN m.provisional THEN NULL ELSE m.phone END AS phone,CASE WHEN m.provisional THEN NULL ELSE m.national_id END AS "nationalId",m.occupation,m.employer,m.address,m.next_of_kin AS "nextOfKin",
    m.beneficiaries,m.status AS "membershipStatus",m.joined_at AS "joinedAt",br.name AS branch,
    b.date_of_birth AS "dateOfBirth",b.gender,b.marital_status AS "maritalStatus",
    COALESCE(b.nationality,'Ugandan') AS nationality,b.home_district AS "homeDistrict",b.subcounty,b.parish,b.village,
    b.emergency_contact_name AS "emergencyContactName",b.emergency_contact_phone AS "emergencyContactPhone",
    b.emergency_contact_relationship AS "emergencyContactRelationship",b.blood_group AS "bloodGroup",
    b.disability_notes AS "disabilityNotes",b.profile_photo_reference AS "profilePhotoReference",
    b.identity_document_reference AS "identityDocumentReference",b.record_notes AS "recordNotes",
    COALESCE(b.bio_status,'pending') AS "bioStatus",b.verified_at AS "verifiedAt",
    verifier.full_name AS "verifiedBy",b.updated_at AS "updatedAt",
    login_account.id AS "userId",login_account.email AS "loginEmail",login_account.role AS "accountRole",
    login_account.active AS "accountActive",login_account.must_change_password AS "mustChangePassword",
    login_account.last_login AS "lastLogin",
    (b.passport_photo_stored_name IS NOT NULL) AS "hasPassportPhoto",
    (CASE WHEN b.date_of_birth IS NOT NULL THEN 1 ELSE 0 END+
     CASE WHEN b.gender IS NOT NULL THEN 1 ELSE 0 END+
     CASE WHEN b.nationality IS NOT NULL THEN 1 ELSE 0 END+
     CASE WHEN b.home_district IS NOT NULL THEN 1 ELSE 0 END+
     CASE WHEN b.emergency_contact_name IS NOT NULL THEN 1 ELSE 0 END+
     CASE WHEN b.identity_document_reference IS NOT NULL THEN 1 ELSE 0 END)*100/6 AS "completionPercentage"
    FROM members m LEFT JOIN member_bio_data b ON b.member_id=m.id
    LEFT JOIN branches br ON br.id=m.branch_id LEFT JOIN users verifier ON verifier.id=b.verified_by
    LEFT JOIN users login_account ON login_account.member_id=m.id`;

  app.get("/api/legal/bio-data",auth,requireLegal("view"),asyncRoute(async(req,res)=>{
    const term=String(req.query.q||"").trim(),status=String(req.query.status||"all");
    const limit=Math.min(200,Math.max(1,Number(req.query.limit)||100)),like=`%${term}%`;
    const params=[like,status,limit];
    const result=await query(`${selectBio}
      WHERE ($1='%%' OR m.full_name ILIKE $1 OR m.member_number ILIKE $1 OR m.phone ILIKE $1
        OR COALESCE(m.email,'') ILIKE $1 OR COALESCE(login_account.email,'') ILIKE $1 OR m.national_id ILIKE $1 OR COALESCE(m.occupation,'') ILIKE $1
        OR COALESCE(m.employer,'') ILIKE $1 OR COALESCE(m.address,'') ILIKE $1
        OR COALESCE(m.next_of_kin,'') ILIKE $1 OR COALESCE(b.home_district,'') ILIKE $1
        OR COALESCE(b.subcounty,'') ILIKE $1 OR COALESCE(b.parish,'') ILIKE $1
        OR COALESCE(b.village,'') ILIKE $1 OR COALESCE(b.emergency_contact_name,'') ILIKE $1)
      AND m.deleted_at IS NULL
      AND ($2='all' OR COALESCE(b.bio_status,'pending')=$2)
      ORDER BY m.full_name LIMIT $3`,params);
    const totals=await one(`SELECT COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE COALESCE(b.bio_status,'pending')='verified')::int AS verified,
      COUNT(*) FILTER (WHERE COALESCE(b.bio_status,'pending')='complete')::int AS complete,
      COUNT(*) FILTER (WHERE COALESCE(b.bio_status,'pending') IN ('pending','needs_update'))::int AS attention
      FROM members m LEFT JOIN member_bio_data b ON b.member_id=m.id
      WHERE m.deleted_at IS NULL`);
    await audit({userId:req.user.id,action:"MEMBER_BIO_SEARCHED",entityType:"member_bio_data",details:`query=${term||"all"}; status=${status}; results=${result.rowCount}`,...metadata(req)});
    res.json({records:result.rows,stats:totals,query:term,status,
      access:{canEdit:Boolean(req.legalAccess.can_edit),authorityLevel:req.legalAccess.authority_level}});
  }));

  app.get("/api/legal/bio-data/:memberId",auth,requireLegal("view"),asyncRoute(async(req,res)=>{
    const record=await one(`${selectBio} WHERE m.id=$1 AND m.deleted_at IS NULL`,[req.params.memberId]);
    if(!record)return res.status(404).json({error:"Member bio data not found"});
    await audit({userId:req.user.id,action:"MEMBER_BIO_VIEWED",entityType:"member_bio_data",entityId:String(record.memberId),details:record.memberNumber,...metadata(req)});
    res.json(record);
  }));

  app.put("/api/legal/bio-data/:memberId",auth,requireLegal("edit"),asyncRoute(async(req,res)=>{
    const b=req.body,member=await one("SELECT id,member_number,full_name FROM members WHERE id=$1",[req.params.memberId]);
    if(!member)return res.status(404).json({error:"Registered member not found"});
    const genders=["female","male","other","prefer_not_to_say"],marital=["single","married","divorced","widowed","separated","other"],
      statuses=["pending","complete","verified","needs_update"];
    if(b.gender&&!genders.includes(b.gender))return res.status(400).json({error:"Choose a valid gender value"});
    if(b.maritalStatus&&!marital.includes(b.maritalStatus))return res.status(400).json({error:"Choose a valid marital status"});
    if(!statuses.includes(b.bioStatus))return res.status(400).json({error:"Choose pending, complete, verified, or needs update"});
    try {
      await transaction(async client=>{
        await client.query(`UPDATE members SET full_name=$1,email=NULLIF($2,''),phone=COALESCE(NULLIF($3,''),phone),national_id=COALESCE(NULLIF($4,''),national_id),
          provisional=CASE WHEN NULLIF($3,'') IS NOT NULL AND NULLIF($4,'') IS NOT NULL THEN false ELSE provisional END,
          occupation=NULLIF($5,''),employer=NULLIF($6,''),address=NULLIF($7,''),next_of_kin=NULLIF($8,''),
          beneficiaries=NULLIF($9,''),status=$10 WHERE id=$11`,
        [String(b.fullName||member.full_name).trim(),String(b.email||"").trim().toLowerCase(),String(b.phone||"").trim(),
          String(b.nationalId||"").trim(),String(b.occupation||"").trim(),String(b.employer||"").trim(),
          String(b.address||"").trim(),String(b.nextOfKin||"").trim(),String(b.beneficiaries||"").trim(),
          ["active","suspended","inactive"].includes(b.membershipStatus)?b.membershipStatus:"active",member.id]);
        await client.query(`INSERT INTO member_bio_data
      (member_id,date_of_birth,gender,marital_status,nationality,home_district,subcounty,parish,village,
       emergency_contact_name,emergency_contact_phone,emergency_contact_relationship,blood_group,
       disability_notes,profile_photo_reference,identity_document_reference,record_notes,bio_status,
       created_by,verified_by,verified_at,updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,
        CASE WHEN $18='verified' THEN $19::bigint ELSE NULL END,CASE WHEN $18='verified' THEN NOW() ELSE NULL END,NOW())
      ON CONFLICT (member_id) DO UPDATE SET date_of_birth=EXCLUDED.date_of_birth,gender=EXCLUDED.gender,
        marital_status=EXCLUDED.marital_status,nationality=EXCLUDED.nationality,home_district=EXCLUDED.home_district,
        subcounty=EXCLUDED.subcounty,parish=EXCLUDED.parish,village=EXCLUDED.village,
        emergency_contact_name=EXCLUDED.emergency_contact_name,emergency_contact_phone=EXCLUDED.emergency_contact_phone,
        emergency_contact_relationship=EXCLUDED.emergency_contact_relationship,blood_group=EXCLUDED.blood_group,
        disability_notes=EXCLUDED.disability_notes,profile_photo_reference=EXCLUDED.profile_photo_reference,
        identity_document_reference=EXCLUDED.identity_document_reference,record_notes=EXCLUDED.record_notes,
        bio_status=EXCLUDED.bio_status,verified_by=EXCLUDED.verified_by,verified_at=EXCLUDED.verified_at,updated_at=NOW()`,
        [member.id,b.dateOfBirth||null,b.gender||null,b.maritalStatus||null,String(b.nationality||"Ugandan").trim(),
      String(b.homeDistrict||"").trim()||null,String(b.subcounty||"").trim()||null,String(b.parish||"").trim()||null,
      String(b.village||"").trim()||null,String(b.emergencyContactName||"").trim()||null,
      String(b.emergencyContactPhone||"").trim()||null,String(b.emergencyContactRelationship||"").trim()||null,
      String(b.bloodGroup||"").trim()||null,String(b.disabilityNotes||"").trim()||null,
      String(b.profilePhotoReference||"").trim()||null,String(b.identityDocumentReference||"").trim()||null,
          String(b.recordNotes||"").trim()||null,b.bioStatus,req.user.id]);
        await client.query(`UPDATE users SET full_name=$1,email=COALESCE(NULLIF($2,''),email),phone=$3
          WHERE member_id=$4`,[String(b.fullName||member.full_name).trim(),String(b.email||"").trim().toLowerCase(),
          String(b.phone||"").trim(),member.id]);
      });
    } catch(error) {
      if(error.code==="23505")return res.status(409).json({error:"That email address or National ID belongs to another record"});
      throw error;
    }
    await audit({userId:req.user.id,action:b.bioStatus==="verified"?"MEMBER_BIO_VERIFIED":"MEMBER_BIO_UPDATED",
      entityType:"member_bio_data",entityId:String(member.id),
      details:`${member.member_number} - ${member.full_name}`,...metadata(req)});
    res.json({ok:true,memberId:member.id,bioStatus:b.bioStatus});
  }));
  app.patch("/api/legal/member-accounts/:userId",auth,requireLegal("edit"),asyncRoute(async(req,res)=>{
    const loginEmail=String(req.body.loginEmail||"").trim().toLowerCase();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail))return res.status(400).json({error:"Enter a valid login email address"});
    const active=req.body.active!==false;
    if(Number(req.params.userId)===Number(req.user.id)&&!active)return res.status(400).json({error:"You cannot deactivate your own account"});
    try {
      const account=await one(`UPDATE users SET email=$1,active=$2
        WHERE id=$3 AND member_id IS NOT NULL RETURNING id,member_id AS "memberId",email,active,role`,
        [loginEmail,active,req.params.userId]);
      if(!account)return res.status(404).json({error:"Linked member login account not found"});
      await query("UPDATE members SET email=$1 WHERE id=$2",[loginEmail,account.memberId]);
      await audit({userId:req.user.id,action:"LEGAL_MEMBER_ACCOUNT_UPDATED",entityType:"user",entityId:String(account.id),details:`${account.email} - ${account.role} - ${account.active?"active":"inactive"}`,...metadata(req)});
      res.json({ok:true,account});
    } catch(error) {
      if(error.code==="23505")return res.status(409).json({error:"That login email is already used by another account"});
      throw error;
    }
  }));

  app.delete("/api/legal/bio-data/:memberId",auth,requireLegal("edit"),asyncRoute(async(req,res)=>{
    const memberId=Number(req.params.memberId),reason=String(req.body?.reason||"").trim();
    if(!Number.isInteger(memberId)||memberId<1)return res.status(400).json({error:"Choose a valid member record"});
    if(reason.length<5)return res.status(400).json({error:"Enter a clear reason for deleting this member"});
    if(Number(req.user.member_id)===memberId)return res.status(400).json({error:"You cannot delete your own member record"});

    const result=await transaction(async client=>{
      const member=(await client.query(`SELECT id,member_number,full_name,savings_balance,share_capital,status,deleted_at
        FROM members WHERE id=$1 FOR UPDATE`,[memberId])).rows[0];
      if(!member){const error=new Error("Registered member not found");error.status=404;throw error;}
      if(member.deleted_at||member.status==="deleted"){const error=new Error("This member has already been deleted");error.status=409;throw error;}

      const activeLoan=(await client.query(`SELECT reference,status FROM loans
        WHERE member_id=$1 AND status NOT IN ('completed','rejected','closed','cancelled')
        ORDER BY id DESC LIMIT 1`,[memberId])).rows[0];
      if(activeLoan){const error=new Error(`Member cannot be deleted while loan ${activeLoan.reference} is ${activeLoan.status}`);error.status=409;throw error;}

      const activeGuarantee=(await client.query(`SELECT l.reference,l.status FROM loan_guarantors lg JOIN loans l ON l.id=lg.loan_id
        WHERE lg.member_id=$1 AND lg.status='accepted' AND l.status NOT IN ('completed','rejected','closed','cancelled')
        ORDER BY lg.id DESC LIMIT 1`,[memberId])).rows[0];
      if(activeGuarantee){const error=new Error(`Member cannot be deleted while guaranteeing loan ${activeGuarantee.reference}`);error.status=409;throw error;}

      const pendingTransaction=(await client.query(`SELECT reference,status FROM transactions
        WHERE member_id=$1 AND status IN ('pending','submitted','verified','pending_credits_review') ORDER BY id DESC LIMIT 1`,[memberId])).rows[0];
      if(pendingTransaction){const error=new Error(`Complete or reject pending transaction ${pendingTransaction.reference} before deleting this member`);error.status=409;throw error;}

      const pendingWithdrawal=(await client.query(`SELECT reference,status FROM withdrawals
        WHERE member_id=$1 AND status IN ('pending','approved') ORDER BY id DESC LIMIT 1`,[memberId])).rows[0];
      if(pendingWithdrawal){const error=new Error(`Complete or reject withdrawal ${pendingWithdrawal.reference} before deleting this member`);error.status=409;throw error;}

      await client.query(`UPDATE members SET status='deleted',deleted_at=NOW(),deleted_by=$1,exit_reason=$2,
        exit_savings_balance=savings_balance,exit_share_capital=share_capital WHERE id=$3`,[req.user.id,reason,memberId]);
      const linkedUsers=(await client.query(`UPDATE users SET active=false,locked_until=NULL
        WHERE member_id=$1 RETURNING id`,[memberId])).rows;
      if(linkedUsers.length)await client.query(`UPDATE department_assignments SET active=false
        WHERE user_id=ANY($1::bigint[])`,[linkedUsers.map(row=>row.id)]);
      return {member,disabledAccounts:linkedUsers.length};
    });

    await audit({userId:req.user.id,action:"MEMBER_DELETED",entityType:"member",entityId:String(memberId),
      details:`${result.member.member_number} - ${result.member.full_name}; reason=${reason}; archived savings=${result.member.savings_balance}; archived shares=${result.member.share_capital}; disabled accounts=${result.disabledAccounts}`,
      ...metadata(req)});
    res.json({ok:true,memberId,memberNumber:result.member.member_number,fullName:result.member.full_name,
      disabledAccounts:result.disabledAccounts,activeTotalsUpdated:true});
  }));
};

