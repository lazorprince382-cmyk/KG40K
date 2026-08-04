module.exports=function registerLegalFamilyApi({app,auth,asyncRoute,departmentPermission,query,one,audit,metadata}){
  const requireLegal=action=>asyncRoute(async(req,res,next)=>{
    const access=await departmentPermission(req.user,"legal",action);
    if(!access)return res.status(403).json({error:"Legal bio-data authority is required"});next();
  });
  const relationships=["spouse","parent","guardian","child"];
  app.get("/api/legal/bio-data/:memberId/family",auth,requireLegal("view"),asyncRoute(async(req,res)=>{
    const member=await one("SELECT id FROM members WHERE id=$1",[req.params.memberId]);
    if(!member)return res.status(404).json({error:"Member not found"});
    const family=(await query(`SELECT id,full_name AS "fullName",relationship,phone,
      eligible_for_welfare AS "eligibleForWelfare",active,created_at AS "createdAt"
      FROM member_family_records WHERE member_id=$1 ORDER BY active DESC,relationship,full_name`,[member.id])).rows;
    res.json({family});
  }));
  app.post("/api/legal/bio-data/:memberId/family",auth,requireLegal("edit"),asyncRoute(async(req,res)=>{
    const b=req.body,name=String(b.fullName||"").trim(),relationship=String(b.relationship||"").toLowerCase();
    if(!name||!relationships.includes(relationship))return res.status(400).json({error:"Enter the family member name and choose spouse, parent, guardian or child"});
    if(relationship==="child"){
      const count=await one("SELECT COUNT(*)::int AS count FROM member_family_records WHERE member_id=$1 AND relationship='child' AND active=true",[req.params.memberId]);
      if(Number(count?.count||0)>=4)return res.status(409).json({error:"The approved welfare register allows a maximum of four eligible children"});
    }
    const row=await one(`INSERT INTO member_family_records(member_id,full_name,relationship,phone,eligible_for_welfare,recorded_by)
      VALUES ($1,$2,$3,NULLIF($4,''),$5,$6) RETURNING id`,[req.params.memberId,name,relationship,String(b.phone||"").trim(),b.eligibleForWelfare!==false,req.user.id]);
    await audit({userId:req.user.id,action:"MEMBER_FAMILY_REGISTERED",entityType:"member_family_record",entityId:String(row.id),details:`${relationship} - ${name}`,...metadata(req)});
    res.status(201).json({id:row.id});
  }));
  app.patch("/api/legal/bio-data/:memberId/family/:id",auth,requireLegal("edit"),asyncRoute(async(req,res)=>{
    const b=req.body,name=String(b.fullName||"").trim(),relationship=String(b.relationship||"").toLowerCase();
    if(!name||!relationships.includes(relationship))return res.status(400).json({error:"Complete the family member record"});
    const row=await one(`UPDATE member_family_records SET full_name=$1,relationship=$2,phone=NULLIF($3,''),
      eligible_for_welfare=$4,active=$5,updated_at=NOW() WHERE id=$6 AND member_id=$7 RETURNING id`,
      [name,relationship,String(b.phone||"").trim(),b.eligibleForWelfare!==false,b.active!==false,req.params.id,req.params.memberId]);
    if(!row)return res.status(404).json({error:"Family record not found"});
    await audit({userId:req.user.id,action:"MEMBER_FAMILY_UPDATED",entityType:"member_family_record",entityId:String(row.id),details:`${relationship} - ${name}`,...metadata(req)});
    res.json({ok:true});
  }));
  app.delete("/api/legal/bio-data/:memberId/family/:id",auth,requireLegal("edit"),asyncRoute(async(req,res)=>{
    const row=await one("UPDATE member_family_records SET active=false,updated_at=NOW() WHERE id=$1 AND member_id=$2 RETURNING id,full_name",[req.params.id,req.params.memberId]);
    if(!row)return res.status(404).json({error:"Family record not found"});
    await audit({userId:req.user.id,action:"MEMBER_FAMILY_DEACTIVATED",entityType:"member_family_record",entityId:String(row.id),details:row.full_name,...metadata(req)});
    res.json({ok:true,recoverable:true});
  }));
};
