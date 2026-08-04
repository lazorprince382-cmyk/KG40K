const bcrypt = require("bcryptjs");
const crypto = require("crypto");

module.exports = function registerLegalMembershipApi({
  app, auth, asyncRoute, departmentPermission, query, one, transaction, audit, metadata,
  upload, fs, path, uploadsDir, strongPassword, generateTemporaryPassword, roles
}) {
  const departmentRoles={
    executive:"Executive Officer",finance:"Finance Officer",credits:"Credits Officer",
    investment:"Investment Officer",welfare:"Welfare Officer",legal:"Legal Officer",
    audit:"Auditor",supervisory:"Supervisory Officer"
  };
  const imageTypes=new Set(["image/jpeg","image/png","image/webp"]);
  const requireLegal=action=>asyncRoute(async(req,res,next)=>{
    const access=await departmentPermission(req.user,"legal",action);
    if(!access)return res.status(403).json({error:`Legal ${action} authority is required`});
    next();
  });
  const removeUpload=file=>{
    if(!file||path.basename(file.filename)!==file.filename)return;
    const target=path.join(uploadsDir,file.filename);
    if(target.startsWith(`${uploadsDir}${path.sep}`))fs.unlink(target,()=>{});
  };
  const bool=value=>["true","1","yes","on"].includes(String(value||"").toLowerCase());
  const roleFor=departmentCode=>departmentCode?departmentRoles[departmentCode]:"Member";
  const addStandardAssignment=async(client,userId,departmentCode,positionTitle,assignedBy)=>{
    if(!departmentCode)return;
    const department=(await client.query("SELECT id FROM departments WHERE code=$1",[departmentCode])).rows[0];
    if(!department)throw Object.assign(new Error("Department not found"),{status:400});
    await client.query(`INSERT INTO department_assignments
      (user_id,department_id,position_title,authority_level,can_view,can_create,can_edit,can_approve,is_head,assigned_by)
      VALUES ($1,$2,$3,2,true,true,true,false,false,$4)`,
    [userId,department.id,String(positionTitle||departmentRoles[departmentCode]).trim(),assignedBy]);
  };

  app.get("/api/legal/membership-options",auth,requireLegal("view"),asyncRoute(async(req,res)=>{
    const [branches,departments,members]=await Promise.all([
      query("SELECT id,name,code FROM branches WHERE active=true ORDER BY name"),
      query("SELECT id,code,name FROM departments WHERE active=true ORDER BY sort_order"),
      query(`SELECT m.id,m.member_number AS "memberNumber",m.full_name AS "fullName",m.email,
        EXISTS(SELECT 1 FROM users u WHERE u.member_id=m.id) AS "hasAccount"
        FROM members m WHERE m.deleted_at IS NULL ORDER BY m.full_name`)
    ]);
    res.json({branches:branches.rows,departments:departments.rows,members:members.rows});
  }));

  app.post("/api/legal/members",auth,requireLegal("create"),upload.single("passportPhoto"),asyncRoute(async(req,res)=>{
    const b=req.body;
    if(!b.fullName||!b.phone||!b.nationalId){
      removeUpload(req.file);
      return res.status(400).json({error:"Full legal name, phone and National ID are required"});
    }
    if(req.file&&!imageTypes.has(req.file.mimetype)){
      removeUpload(req.file);
      return res.status(400).json({error:"Passport photo must be JPG, PNG or WebP"});
    }
    const createAccount=bool(b.createAccount),hasOrganizationRole=bool(b.hasOrganizationRole);
    const departmentCode=hasOrganizationRole?String(b.departmentCode||""):"";
    const accountRole=roleFor(departmentCode);
    if(!accountRole||!roles.includes(accountRole)){
      removeUpload(req.file);
      return res.status(400).json({error:"Choose a valid organization department"});
    }
    if(createAccount&&!String(b.email||"").trim()){
      removeUpload(req.file);
      return res.status(400).json({error:"An email address is required to create the member login"});
    }
    const temporaryPassword=createAccount?(b.password?String(b.password):generateTemporaryPassword()):null;
    if(createAccount&&!strongPassword(temporaryPassword)){
      removeUpload(req.file);
      return res.status(400).json({error:"Password must include uppercase, lowercase, number and symbol"});
    }
    const memberNumber=`G40-${new Date().getFullYear()}-${crypto.randomUUID().replaceAll("-","").slice(0,8).toUpperCase()}`;
    try{
      const created=await transaction(async client=>{
        const member=(await client.query(`INSERT INTO members
          (member_number,full_name,email,phone,national_id,occupation,employer,address,next_of_kin,beneficiaries,branch_id,created_by)
          VALUES ($1,$2,NULLIF($3,''),$4,$5,NULLIF($6,''),NULLIF($7,''),NULLIF($8,''),NULLIF($9,''),NULLIF($10,''),$11,$12)
          RETURNING id`,[memberNumber,String(b.fullName).trim(),String(b.email||"").trim().toLowerCase(),String(b.phone).trim(),
          String(b.nationalId).trim(),String(b.occupation||"").trim(),String(b.employer||"").trim(),String(b.address||"").trim(),
          String(b.nextOfKin||"").trim(),String(b.beneficiaries||"").trim(),b.branchId||req.user.branch_id,req.user.id])).rows[0];
        await client.query(`INSERT INTO member_bio_data
          (member_id,date_of_birth,gender,marital_status,nationality,home_district,subcounty,parish,village,
           emergency_contact_name,emergency_contact_phone,emergency_contact_relationship,blood_group,disability_notes,
           identity_document_reference,record_notes,bio_status,passport_photo_stored_name,passport_photo_original_name,
           passport_photo_mime_type,created_by)
          VALUES ($1,NULLIF($2,'')::date,NULLIF($3,''),NULLIF($4,''),COALESCE(NULLIF($5,''),'Ugandan'),
            NULLIF($6,''),NULLIF($7,''),NULLIF($8,''),NULLIF($9,''),NULLIF($10,''),NULLIF($11,''),NULLIF($12,''),
            NULLIF($13,''),NULLIF($14,''),NULLIF($15,''),NULLIF($16,''),'complete',$17,$18,$19,$20)`,
          [member.id,b.dateOfBirth||"",b.gender||"",b.maritalStatus||"",b.nationality||"Ugandan",b.homeDistrict||"",
          b.subcounty||"",b.parish||"",b.village||"",b.emergencyContactName||"",b.emergencyContactPhone||"",
          b.emergencyContactRelationship||"",b.bloodGroup||"",b.disabilityNotes||"",b.identityDocumentReference||"",
          b.recordNotes||"",req.file?.filename||null,req.file?.originalname||null,req.file?.mimetype||null,req.user.id]);
        let userId=null;
        if(createAccount){
          userId=(await client.query(`INSERT INTO users
            (full_name,email,phone,password_hash,role,branch_id,member_id,created_by,must_change_password)
            VALUES ($1,LOWER($2),$3,$4,$5,$6,$7,$8,true) RETURNING id`,
          [String(b.fullName).trim(),String(b.email).trim(),String(b.phone).trim(),await bcrypt.hash(temporaryPassword,12),
            accountRole,b.branchId||req.user.branch_id,member.id,req.user.id])).rows[0].id;
          await addStandardAssignment(client,userId,departmentCode,b.positionTitle,req.user.id);
        }
        return {memberId:member.id,userId};
      });
      await audit({userId:req.user.id,action:"LEGAL_MEMBER_REGISTERED",entityType:"member",entityId:String(created.memberId),
        details:`${memberNumber}  -  ${String(b.fullName).trim()}  -  ${accountRole}`,...metadata(req)});
      res.status(201).json({...created,memberNumber,role:createAccount?accountRole:null,temporaryPassword});
    }catch(error){
      removeUpload(req.file);
      if(error.code==="23505")return res.status(409).json({error:"National ID, email, or member details already exist"});
      throw error;
    }
  }));

  app.post("/api/legal/member-accounts",auth,requireLegal("create"),asyncRoute(async(req,res)=>{
    const b=req.body,member=await one("SELECT * FROM members WHERE id=$1 AND deleted_at IS NULL",[b.memberId]);
    if(!member)return res.status(404).json({error:"Registered member not found"});
    if(await one("SELECT id FROM users WHERE member_id=$1",[member.id]))return res.status(409).json({error:"This member already has a login account"});
    const departmentCode=b.hasOrganizationRole?String(b.departmentCode||""):"",role=roleFor(departmentCode);
    if(!role||!roles.includes(role))return res.status(400).json({error:"Choose a valid department role"});
    const email=String(b.email||member.email||"").trim().toLowerCase();
    if(!email)return res.status(400).json({error:"An email address is required"});
    const temporaryPassword=b.password?String(b.password):generateTemporaryPassword();
    if(!strongPassword(temporaryPassword))return res.status(400).json({error:"Password must include uppercase, lowercase, number and symbol"});
    const userId=await transaction(async client=>{
      const user=(await client.query(`INSERT INTO users
        (full_name,email,phone,password_hash,role,branch_id,member_id,created_by,must_change_password)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true) RETURNING id`,
      [member.full_name,email,member.phone,await bcrypt.hash(temporaryPassword,12),role,member.branch_id,member.id,req.user.id])).rows[0];
      await addStandardAssignment(client,user.id,departmentCode,b.positionTitle,req.user.id);
      return user.id;
    });
    await audit({userId:req.user.id,action:"LEGAL_MEMBER_ACCOUNT_CREATED",entityType:"user",entityId:String(userId),
      details:`${member.member_number}  -  ${role}`,...metadata(req)});
    res.status(201).json({userId,role,temporaryPassword});
  }));

  app.get("/api/legal/members/:memberId/passport-photo",auth,requireLegal("view"),asyncRoute(async(req,res)=>{
    const photo=await one(`SELECT passport_photo_stored_name AS stored,passport_photo_mime_type AS mime
      FROM member_bio_data WHERE member_id=$1`,[req.params.memberId]);
    if(!photo?.stored)return res.status(404).json({error:"Passport photo not found"});
    const filePath=path.join(uploadsDir,path.basename(photo.stored));
    if(!fs.existsSync(filePath))return res.status(404).json({error:"Passport photo not found"});
    res.type(photo.mime||"application/octet-stream").sendFile(filePath);
  }));

  app.post("/api/legal/members/:memberId/passport-photo",auth,requireLegal("edit"),upload.single("passportPhoto"),asyncRoute(async(req,res)=>{
    if(!req.file)return res.status(400).json({error:"Choose a JPG, PNG or WebP passport photo"});
    if(!imageTypes.has(req.file.mimetype)){removeUpload(req.file);return res.status(400).json({error:"Passport photo must be JPG, PNG or WebP"});}
    const old=await one(`SELECT passport_photo_stored_name AS stored FROM member_bio_data WHERE member_id=$1`,[req.params.memberId]);
    const result=await query(`UPDATE member_bio_data SET passport_photo_stored_name=$1,passport_photo_original_name=$2,
      passport_photo_mime_type=$3,updated_at=NOW() WHERE member_id=$4 RETURNING member_id`,
    [req.file.filename,req.file.originalname,req.file.mimetype,req.params.memberId]);
    if(!result.rowCount){removeUpload(req.file);return res.status(404).json({error:"Member bio record not found"});}
    if(old?.stored&&path.basename(old.stored)===old.stored){const target=path.join(uploadsDir,old.stored);if(target.startsWith(`${uploadsDir}${path.sep}`))fs.unlink(target,()=>{});}
    await audit({userId:req.user.id,action:"MEMBER_PASSPORT_PHOTO_UPDATED",entityType:"member_bio_data",
      entityId:String(req.params.memberId),...metadata(req)});
    res.json({ok:true});
  }));
};
