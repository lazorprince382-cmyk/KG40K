module.exports = function registerSupervisoryApi({
  app, auth, asyncRoute, departmentPermission, query, one, audit, metadata, reference
}) {
  function requireSupervisory(action = "view") {
    return asyncRoute(async (req, res, next) => {
      const access = await departmentPermission(req.user, "supervisory", action);
      if (!access) return res.status(403).json({ error: `Your Supervisory assignment does not allow ${action} access` });
      req.supervisoryAccess = access;
      next();
    });
  }

  app.get("/api/supervisory/command-center", auth, requireSupervisory("view"), asyncRoute(async (req, res) => {
    const [scorecards, followups, executive, committees, resolutions, complaints, projects, recommendations,
      siteVisits, kpis, documents, departments, operationalSummaries] = await Promise.all([
      query(`SELECT s.id,s.reference,s.department_id AS "departmentId",d.code AS "departmentCode",d.name AS department,
        s.annual_target::float AS "annualTarget",s.monthly_target::float AS "monthlyTarget",
        s.completed_tasks AS "completedTasks",s.outstanding_tasks AS "outstandingTasks",
        s.budget_utilization::float AS "budgetUtilization",s.performance_score::float AS "performanceScore",
        s.target_achievement::float AS "targetAchievement",s.status,s.supervisor_comment AS "supervisorComment",
        s.review_period AS "reviewPeriod",s.updated_at AS "updatedAt"
        FROM supervisory_scorecards s JOIN departments d ON d.id=s.department_id
        ORDER BY s.performance_score DESC,d.sort_order`),
      query(`SELECT f.id,f.reference,f.department_id AS "departmentId",d.name AS department,f.action_required AS "actionRequired",
        f.responsible_officer AS "responsibleOfficer",f.deadline,f.progress,f.status,f.evidence,
        f.supervisor_comment AS "supervisorComment",f.created_at AS "createdAt",f.updated_at AS "updatedAt"
        FROM supervisory_followups f JOIN departments d ON d.id=f.department_id
        ORDER BY CASE f.status WHEN 'overdue' THEN 1 WHEN 'at_risk' THEN 2 ELSE 3 END,f.deadline`),
      query(`SELECT id,reference,review_period AS "reviewPeriod",meetings_held AS "meetingsHeld",
        decisions_made AS "decisionsMade",decisions_implemented AS "decisionsImplemented",
        decisions_pending AS "decisionsPending",strategic_objectives_completed AS "strategicObjectivesCompleted",
        strategic_objectives_total AS "strategicObjectivesTotal",attendance_rate::float AS "attendanceRate",
        implementation_rate::float AS "implementationRate",performance_score::float AS "performanceScore",
        delayed_actions AS "delayedActions",report_reference AS "reportReference",
        supervisor_comment AS "supervisorComment" FROM supervisory_executive_monitoring ORDER BY id DESC`),
      query(`SELECT id,reference,committee_name AS "committeeName",members,meetings_held AS "meetingsHeld",
        attendance_rate::float AS "attendanceRate",decisions_made AS "decisionsMade",
        outstanding_actions AS "outstandingActions",performance_score::float AS "performanceScore",
        status,chairperson,supervisor_comment AS "supervisorComment",review_period AS "reviewPeriod"
        FROM supervisory_committees ORDER BY performance_score DESC`),
      query(`SELECT r.id,r.resolution_number AS "resolutionNumber",r.title,r.meeting_date AS "meetingDate",
        r.department_id AS "departmentId",d.name AS department,r.responsible_officer AS "responsibleOfficer",
        r.due_date AS "dueDate",r.completion_percentage AS "completionPercentage",r.evidence,r.status,r.priority,
        r.supervisor_comment AS "supervisorComment",r.created_at AS "createdAt"
        FROM supervisory_resolutions r LEFT JOIN departments d ON d.id=r.department_id
        ORDER BY CASE r.status WHEN 'overdue' THEN 1 WHEN 'at_risk' THEN 2 ELSE 3 END,r.due_date`),
      query(`SELECT c.id,c.complaint_number AS "complaintNumber",c.category,c.subject_type AS "subjectType",
        c.department_id AS "departmentId",d.name AS department,c.description,
        c.assigned_supervisor AS "assignedSupervisor",c.status,c.investigation_progress AS "investigationProgress",
        c.finding,c.recommendation,c.escalated,c.confidential,c.evidence,c.created_at AS "createdAt",
        c.updated_at AS "updatedAt",c.resolved_at AS "resolvedAt"
        FROM supervisory_complaints c LEFT JOIN departments d ON d.id=c.department_id
        ORDER BY c.escalated DESC,c.id DESC`),
      query(`SELECT p.id,p.reference,p.project_name AS "projectName",p.department_id AS "departmentId",
        d.name AS department,p.project_manager AS "projectManager",p.planned_progress AS "plannedProgress",
        p.actual_progress AS "actualProgress",p.risk_level AS "riskLevel",p.status,p.deadline,
        p.budget_summary::float AS "budgetSummary",p.site_visits_completed AS "siteVisitsCompleted",
        p.supervisor_comment AS "supervisorComment",p.updated_at AS "updatedAt"
        FROM supervisory_projects p LEFT JOIN departments d ON d.id=p.department_id
        ORDER BY CASE p.risk_level WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,p.deadline`),
      query(`SELECT r.id,r.recommendation_number AS "recommendationNumber",r.department_id AS "departmentId",
        d.name AS department,r.source_type AS "sourceType",r.source_reference AS "sourceReference",r.description,
        r.responsible_officer AS "responsibleOfficer",r.issued_on AS "issuedOn",r.due_date AS "dueDate",
        r.status,r.department_response AS "departmentResponse",r.implementation_progress AS "implementationProgress",
        r.accepted,r.evidence,r.completed_at AS "completedAt"
        FROM supervisory_recommendations r LEFT JOIN departments d ON d.id=r.department_id
        ORDER BY CASE r.status WHEN 'overdue' THEN 1 WHEN 'issued' THEN 2 ELSE 3 END,r.due_date`),
      query(`SELECT v.id,v.visit_number AS "visitNumber",v.site_name AS "siteName",v.department_id AS "departmentId",
        d.name AS department,v.project_id AS "projectId",p.project_name AS "projectName",v.visit_date AS "visitDate",
        v.supervisor,v.observations,v.photos_reference AS "photosReference",v.recommendations,
        v.follow_up_date AS "followUpDate",v.status,v.created_at AS "createdAt"
        FROM supervisory_site_visits v LEFT JOIN departments d ON d.id=v.department_id
        LEFT JOIN supervisory_projects p ON p.id=v.project_id ORDER BY v.visit_date DESC`),
      query(`SELECT id,reference,kpi_name AS "kpiName",category,target_value::float AS "targetValue",
        actual_value::float AS "actualValue",unit,achievement_percentage::float AS "achievementPercentage",
        trend,status,review_period AS "reviewPeriod",data_source AS "dataSource"
        FROM supervisory_kpis ORDER BY id`),
      query(`SELECT doc.id,doc.reference,doc.document_type AS "documentType",doc.title,doc.version,doc.status,
        doc.file_name AS "fileName",doc.updated_at AS "updatedAt",
        EXISTS(SELECT 1 FROM organization_document_versions v WHERE v.document_id=doc.id) AS "hasFile" FROM organization_documents doc
        LEFT JOIN departments d ON d.id=doc.department_id
        WHERE doc.status<>'archived' AND (d.code='supervisory' OR (doc.status='published' AND doc.visibility_level<=2 AND doc.document_type IN ('Annual Reports','Minutes','Board Minutes','Meeting Minutes','Policies','Audit Reports')))
        ORDER BY doc.updated_at DESC`),
      query("SELECT id,code,name FROM departments WHERE active=true ORDER BY sort_order"),
      query(`SELECT * FROM (
        SELECT d.name AS department,'Budget utilization' AS metric,
          ROUND(CASE WHEN b.allocated_amount=0 THEN 0 ELSE b.used_amount/b.allocated_amount*100 END,1)::float AS value,
          '%' AS unit,b.created_at AS "updatedAt"
          FROM finance_budgets b JOIN departments d ON d.id=b.department_id
        UNION ALL
        SELECT 'Credits','Loan recovery',COALESCE(ROUND(COUNT(*) FILTER (WHERE status<>'overdue')::numeric/
          NULLIF(COUNT(*),0)*100,1),100)::float,'%',MAX(created_at) FROM loans
        UNION ALL
        SELECT 'Investment','Active projects',COUNT(*)::float,'projects',MAX(created_at) FROM investment_projects WHERE status<>'completed'
      ) summaries ORDER BY department`)
    ]);

    const scores = scorecards.rows.map(row => row.performanceScore);
    const organizationPerformanceScore = scores.length ? Number((scores.reduce((sum, value) => sum + value, 0) / scores.length).toFixed(1)) : 0;
    const belowTarget = scorecards.rows.filter(row => row.performanceScore < 85);
    const implementedRecommendations = recommendations.rows.filter(row => ["implemented","closed"].includes(row.status));
    const pendingFollowups = followups.rows.filter(row => !["completed","closed"].includes(row.status));
    const pendingComplaints = complaints.rows.filter(row => !["resolved","closed"].includes(row.status));
    const pendingResolutions = resolutions.rows.filter(row => !["implemented","closed"].includes(row.status));
    const activeProjects = projects.rows.filter(row => row.status !== "completed");
    const committeePerformance = committees.rows.length ? Number((committees.rows.reduce((sum,row)=>sum+row.performanceScore,0)/committees.rows.length).toFixed(1)) : 0;
    const executiveRow = executive.rows[0] || {};
    const calendar = [
      ...followups.rows.filter(row=>row.deadline&&!["completed","closed"].includes(row.status)).map(row=>({
        type:"Department follow-up",reference:row.reference,title:`${row.department}  -  ${row.actionRequired}`,
        date:row.deadline,target:"supervisory-performance",risk:row.status==="overdue"?"high":"medium"
      })),
      ...resolutions.rows.filter(row=>row.dueDate&&!["implemented","closed"].includes(row.status)).map(row=>({
        type:"Resolution deadline",reference:row.resolutionNumber,title:row.title,date:row.dueDate,
        target:"supervisory-resolutions",risk:row.priority
      })),
      ...siteVisits.rows.filter(row=>row.followUpDate).map(row=>({
        type:"Site visit follow-up",reference:row.visitNumber,title:row.siteName,date:row.followUpDate,
        target:"supervisory-visits",risk:row.status==="follow_up_due"?"high":"low"
      }))
    ].sort((a,b)=>new Date(a.date)-new Date(b.date));

    res.json({
      stats:{
        departmentPerformance:organizationPerformanceScore,
        departmentsBelowTarget:belowTarget.length,
        recommendationsIssued:recommendations.rows.length,
        recommendationsImplemented:implementedRecommendations.length,
        pendingFollowups:pendingFollowups.length,
        committeePerformance,
        executivePerformance:executiveRow.performanceScore||0,
        projectsUnderSupervision:activeProjects.length,
        resolvedComplaints:complaints.rows.filter(row=>["resolved","closed"].includes(row.status)).length,
        pendingComplaints:pendingComplaints.length,
        boardResolutionsPending:pendingResolutions.length,
        organizationPerformanceScore
      },
      scorecards:scorecards.rows,followups:followups.rows,executive:executiveRow,committees:committees.rows,
      resolutions:resolutions.rows,complaints:complaints.rows,projects:projects.rows,
      recommendations:recommendations.rows,siteVisits:siteVisits.rows,kpis:kpis.rows,
      documents:documents.rows,departments:departments.rows,operationalSummaries:operationalSummaries.rows,calendar,
      analytics:{
        departmentTrend:[82,83.5,84.8,86.1,87.2,88.1,organizationPerformanceScore],
        resolutionRate:resolutions.rows.length?Math.round(resolutions.rows.filter(row=>["implemented","closed"].includes(row.status)).length/resolutions.rows.length*100):100,
        complaintRate:complaints.rows.length?Math.round(complaints.rows.filter(row=>["resolved","closed"].includes(row.status)).length/complaints.rows.length*100):100,
        committeeScores:committees.rows.map(row=>({label:row.committeeName,value:row.performanceScore})),
        projectProgress:projects.rows.map(row=>({label:row.projectName,planned:row.plannedProgress,actual:row.actualProgress})),
        recommendationRate:recommendations.rows.length?Math.round(implementedRecommendations.length/recommendations.rows.length*100):100,
        kpiScores:kpis.rows.map(row=>({label:row.kpiName,value:row.achievementPercentage}))
      },
      notifications:[
        belowTarget.length&&{level:"danger",title:`${belowTarget.length} departments are below the acceptable performance target`,createdAt:belowTarget[0]?.updatedAt||belowTarget[0]?.createdAt||belowTarget[0]?.periodEnd,target:"supervisory-performance"},
        pendingResolutions.some(row=>new Date(row.dueDate)<new Date())&&{level:"warning",title:`${pendingResolutions.filter(row=>new Date(row.dueDate)<new Date()).length} Executive or Board resolutions are overdue`,createdAt:pendingResolutions.find(row=>new Date(row.dueDate)<new Date())?.dueDate,target:"supervisory-resolutions"},
        projects.rows.some(row=>["behind_schedule","at_risk"].includes(row.status))&&{level:"danger",title:`${projects.rows.filter(row=>["behind_schedule","at_risk"].includes(row.status)).length} supervised projects require intervention`,createdAt:projects.rows.find(row=>["behind_schedule","at_risk"].includes(row.status))?.updatedAt||projects.rows.find(row=>["behind_schedule","at_risk"].includes(row.status))?.createdAt,target:"supervisory-projects"},
        pendingComplaints.some(row=>row.escalated)&&{level:"info",title:`${pendingComplaints.filter(row=>row.escalated).length} complaint is escalated for supervisory action`,createdAt:pendingComplaints.find(row=>row.escalated)?.createdAt,target:"supervisory-complaints"},
        {level:"success",title:`Organization performance is ${organizationPerformanceScore}% for the current review`,createdAt:scorecards.rows[0]?.updatedAt||scorecards.rows[0]?.createdAt,target:"supervisory-kpis"}
      ].filter(Boolean),
      access:{
        authorityLevel:req.supervisoryAccess.authority_level,
        canCreate:Boolean(req.supervisoryAccess.can_create),
        canEdit:Boolean(req.supervisoryAccess.can_edit),
        canApprove:Boolean(req.supervisoryAccess.can_approve),
        operationalAccess:"read_only"
      }
    });
  }));

  app.get("/api/supervisory/search", auth, requireSupervisory("view"), asyncRoute(async (req, res) => {
    const term=String(req.query.q||"").trim();
    if(term.length<2)return res.json({results:[]});
    const like=`%${term}%`;
    const result=await query(`SELECT * FROM (
      SELECT 'Department Scorecard' AS type,s.reference,d.name AS title,
        s.performance_score::text||'%  -  '||s.status AS detail,'supervisory-performance' AS target
        FROM supervisory_scorecards s JOIN departments d ON d.id=s.department_id
        WHERE s.reference ILIKE $1 OR d.name ILIKE $1 OR s.supervisor_comment ILIKE $1
      UNION ALL SELECT 'Resolution',r.resolution_number,r.title,d.name||'  -  '||r.status,'supervisory-resolutions'
        FROM supervisory_resolutions r LEFT JOIN departments d ON d.id=r.department_id
        WHERE r.resolution_number ILIKE $1 OR r.title ILIKE $1 OR r.responsible_officer ILIKE $1 OR d.name ILIKE $1
      UNION ALL SELECT 'Complaint',c.complaint_number,c.category,d.name||'  -  '||c.status,'supervisory-complaints'
        FROM supervisory_complaints c LEFT JOIN departments d ON d.id=c.department_id
        WHERE c.complaint_number ILIKE $1 OR c.category ILIKE $1 OR c.assigned_supervisor ILIKE $1 OR d.name ILIKE $1
      UNION ALL SELECT 'Committee',reference,committee_name,chairperson||'  -  '||status,'supervisory-committees'
        FROM supervisory_committees WHERE reference ILIKE $1 OR committee_name ILIKE $1 OR chairperson ILIKE $1
      UNION ALL SELECT 'Project',p.reference,p.project_name,d.name||'  -  '||p.status,'supervisory-projects'
        FROM supervisory_projects p LEFT JOIN departments d ON d.id=p.department_id
        WHERE p.reference ILIKE $1 OR p.project_name ILIKE $1 OR p.project_manager ILIKE $1 OR d.name ILIKE $1
      UNION ALL SELECT 'Recommendation',r.recommendation_number,r.description,
        COALESCE(d.name,'Organization')||'  -  '||r.status,'supervisory-recommendations'
        FROM supervisory_recommendations r LEFT JOIN departments d ON d.id=r.department_id
        WHERE r.recommendation_number ILIKE $1 OR r.description ILIKE $1 OR r.responsible_officer ILIKE $1 OR d.name ILIKE $1
      UNION ALL SELECT 'Site Visit',v.visit_number,v.site_name,v.supervisor||'  -  '||v.status,'supervisory-visits'
        FROM supervisory_site_visits v WHERE v.visit_number ILIKE $1 OR v.site_name ILIKE $1 OR v.supervisor ILIKE $1
    ) results LIMIT 100`,[like]);
    res.json({results:result.rows});
  }));

  app.post("/api/supervisory/scorecards",auth,requireSupervisory("create"),asyncRoute(async(req,res)=>{
    const b=req.body,score=Number(b.performanceScore),achievement=Number(b.targetAchievement),budget=Number(b.budgetUtilization||0);
    if(!b.departmentId||!b.reviewPeriod||!Number.isFinite(score)||score<0||score>100||!Number.isFinite(achievement))
      return res.status(400).json({error:"Department, review period, performance score and target achievement are required"});
    const row=await one(`INSERT INTO supervisory_scorecards
      (reference,department_id,annual_target,monthly_target,completed_tasks,outstanding_tasks,budget_utilization,
       performance_score,target_achievement,status,supervisor_comment,review_period,reviewed_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id,reference`,
    [reference("SCORE"),b.departmentId,Number(b.annualTarget||100),Number(b.monthlyTarget||100),
      Number(b.completedTasks||0),Number(b.outstandingTasks||0),budget,score,achievement,
      score>=90?"excellent":score>=85?"on_track":"attention",String(b.supervisorComment||"").trim()||null,
      String(b.reviewPeriod),req.user.id]);
    await audit({userId:req.user.id,action:"SUPERVISORY_SCORECARD_CREATED",entityType:"supervisory_scorecard",entityId:String(row.id),details:row.reference,...metadata(req)});
    res.status(201).json(row);
  }));

  app.post("/api/supervisory/followups",auth,requireSupervisory("create"),asyncRoute(async(req,res)=>{
    const b=req.body;if(!b.departmentId||!b.actionRequired||!b.responsibleOfficer||!b.deadline)
      return res.status(400).json({error:"Department, required action, responsible officer and deadline are required"});
    const row=await one(`INSERT INTO supervisory_followups
      (reference,department_id,action_required,responsible_officer,deadline,progress,status,evidence,supervisor_comment,created_by)
      VALUES ($1,$2,$3,$4,$5,0,'pending',$6,$7,$8) RETURNING id,reference`,
    [reference("SUP-FUP"),b.departmentId,String(b.actionRequired).trim(),String(b.responsibleOfficer).trim(),b.deadline,
      String(b.evidence||"").trim()||null,String(b.supervisorComment||"").trim()||null,req.user.id]);
    res.status(201).json(row);
  }));

  app.post("/api/supervisory/resolutions",auth,requireSupervisory("create"),asyncRoute(async(req,res)=>{
    const b=req.body;if(!b.title||!b.meetingDate||!b.responsibleOfficer||!b.dueDate)
      return res.status(400).json({error:"Title, meeting date, responsible officer and due date are required"});
    const row=await one(`INSERT INTO supervisory_resolutions
      (resolution_number,title,meeting_date,department_id,responsible_officer,due_date,completion_percentage,evidence,status,priority,created_by)
      VALUES ($1,$2,$3,$4,$5,$6,0,$7,'pending',$8,$9) RETURNING id,resolution_number AS "resolutionNumber"`,
    [reference("RES"),String(b.title).trim(),b.meetingDate,b.departmentId||null,String(b.responsibleOfficer).trim(),
      b.dueDate,String(b.evidence||"").trim()||null,b.priority||"medium",req.user.id]);
    res.status(201).json(row);
  }));

  app.post("/api/supervisory/complaints",auth,requireSupervisory("create"),asyncRoute(async(req,res)=>{
    const b=req.body;if(!b.category||!b.subjectType||!b.description||!b.assignedSupervisor)
      return res.status(400).json({error:"Category, subject type, description and assigned supervisor are required"});
    const row=await one(`INSERT INTO supervisory_complaints
      (complaint_number,category,subject_type,department_id,description,assigned_supervisor,status,
       investigation_progress,escalated,confidential,evidence,created_by)
      VALUES ($1,$2,$3,$4,$5,$6,'received',0,$7,true,$8,$9) RETURNING id,complaint_number AS "complaintNumber"`,
    [reference("SUP-CMP"),String(b.category),String(b.subjectType),b.departmentId||null,String(b.description).trim(),
      String(b.assignedSupervisor).trim(),Boolean(b.escalated),String(b.evidence||"").trim()||null,req.user.id]);
    res.status(201).json(row);
  }));

  app.post("/api/supervisory/recommendations",auth,requireSupervisory("create"),asyncRoute(async(req,res)=>{
    const b=req.body;if(!b.sourceType||!b.description||!b.responsibleOfficer||!b.dueDate)
      return res.status(400).json({error:"Source, recommendation, responsible officer and due date are required"});
    const row=await one(`INSERT INTO supervisory_recommendations
      (recommendation_number,department_id,source_type,source_reference,description,responsible_officer,due_date,
       status,implementation_progress,accepted,evidence,created_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,'issued',0,false,$8,$9) RETURNING id,recommendation_number AS "recommendationNumber"`,
    [reference("SUP-REC"),b.departmentId||null,String(b.sourceType),String(b.sourceReference||"").trim()||null,
      String(b.description).trim(),String(b.responsibleOfficer).trim(),b.dueDate,String(b.evidence||"").trim()||null,req.user.id]);
    res.status(201).json(row);
  }));

  app.post("/api/supervisory/site-visits",auth,requireSupervisory("create"),asyncRoute(async(req,res)=>{
    const b=req.body;if(!b.siteName||!b.visitDate||!b.supervisor||!b.observations||!b.recommendations)
      return res.status(400).json({error:"Site, date, supervisor, observations and recommendations are required"});
    const row=await one(`INSERT INTO supervisory_site_visits
      (visit_number,site_name,department_id,project_id,visit_date,supervisor,observations,photos_reference,
       recommendations,follow_up_date,status,created_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'completed',$11) RETURNING id,visit_number AS "visitNumber"`,
    [reference("SUP-VIS"),String(b.siteName).trim(),b.departmentId||null,b.projectId||null,b.visitDate,
      String(b.supervisor).trim(),String(b.observations).trim(),String(b.photosReference||"").trim()||null,
      String(b.recommendations).trim(),b.followUpDate||null,req.user.id]);
    res.status(201).json(row);
  }));

  app.post("/api/supervisory/followups/:id/status",auth,requireSupervisory("edit"),asyncRoute(async(req,res)=>{
    const b=req.body,progress=Number(b.progress);if(!["pending","in_progress","at_risk","overdue","completed","closed"].includes(b.status)||progress<0||progress>100)
      return res.status(400).json({error:"Valid status and progress from 0 to 100 are required"});
    const row=await one(`UPDATE supervisory_followups SET status=$1,progress=$2,evidence=COALESCE(NULLIF($3,''),evidence),
      supervisor_comment=COALESCE(NULLIF($4,''),supervisor_comment),updated_at=NOW(),
      closed_at=CASE WHEN $1 IN ('completed','closed') THEN NOW() ELSE closed_at END WHERE id=$5 RETURNING id`,
    [b.status,progress,String(b.evidence||"").trim(),String(b.comment||"").trim(),req.params.id]);
    if(!row)return res.status(404).json({error:"Follow-up not found"});res.json({ok:true});
  }));

  app.post("/api/supervisory/resolutions/:id/status",auth,requireSupervisory("edit"),asyncRoute(async(req,res)=>{
    const b=req.body,progress=Number(b.progress);if(!["pending","in_progress","at_risk","overdue","implemented","closed"].includes(b.status)||progress<0||progress>100)
      return res.status(400).json({error:"Valid status and completion percentage are required"});
    const row=await one(`UPDATE supervisory_resolutions SET status=$1,completion_percentage=$2,
      evidence=COALESCE(NULLIF($3,''),evidence),supervisor_comment=COALESCE(NULLIF($4,''),supervisor_comment),
      updated_at=NOW(),completed_at=CASE WHEN $1 IN ('implemented','closed') THEN NOW() ELSE completed_at END
      WHERE id=$5 RETURNING id`,[b.status,progress,String(b.evidence||"").trim(),String(b.comment||"").trim(),req.params.id]);
    if(!row)return res.status(404).json({error:"Resolution not found"});res.json({ok:true});
  }));

  app.post("/api/supervisory/complaints/:id/status",auth,requireSupervisory("edit"),asyncRoute(async(req,res)=>{
    const b=req.body,progress=Number(b.progress);if(!["received","review","investigation","follow_up","escalated","resolved","closed"].includes(b.status)||progress<0||progress>100)
      return res.status(400).json({error:"Valid complaint status and investigation progress are required"});
    const row=await one(`UPDATE supervisory_complaints SET status=$1,investigation_progress=$2,
      finding=COALESCE(NULLIF($3,''),finding),recommendation=COALESCE(NULLIF($4,''),recommendation),
      escalated=$5,updated_at=NOW(),resolved_at=CASE WHEN $1 IN ('resolved','closed') THEN NOW() ELSE resolved_at END
      WHERE id=$6 RETURNING id`,[b.status,progress,String(b.finding||"").trim(),String(b.recommendation||"").trim(),
      Boolean(b.escalated),req.params.id]);
    if(!row)return res.status(404).json({error:"Complaint not found"});res.json({ok:true});
  }));

  app.post("/api/supervisory/recommendations/:id/status",auth,requireSupervisory("edit"),asyncRoute(async(req,res)=>{
    const b=req.body,progress=Number(b.progress);if(!["issued","accepted","in_progress","overdue","implemented","closed"].includes(b.status)||progress<0||progress>100)
      return res.status(400).json({error:"Valid recommendation status and implementation progress are required"});
    const row=await one(`UPDATE supervisory_recommendations SET status=$1,implementation_progress=$2,
      department_response=COALESCE(NULLIF($3,''),department_response),evidence=COALESCE(NULLIF($4,''),evidence),
      accepted=CASE WHEN $1 IN ('accepted','in_progress','implemented','closed') THEN true ELSE accepted END,
      verified_by=CASE WHEN $1 IN ('implemented','closed') THEN $5 ELSE verified_by END,updated_at=NOW(),
      completed_at=CASE WHEN $1 IN ('implemented','closed') THEN NOW() ELSE completed_at END WHERE id=$6 RETURNING id`,
    [b.status,progress,String(b.response||"").trim(),String(b.evidence||"").trim(),req.user.id,req.params.id]);
    if(!row)return res.status(404).json({error:"Recommendation not found"});res.json({ok:true});
  }));

  app.post("/api/supervisory/projects/:id/status",auth,requireSupervisory("edit"),asyncRoute(async(req,res)=>{
    const b=req.body,actual=Number(b.actualProgress);if(!["active","at_risk","behind_schedule","completed","closed"].includes(b.status)||actual<0||actual>100)
      return res.status(400).json({error:"Valid project status and progress are required"});
    const row=await one(`UPDATE supervisory_projects SET status=$1,actual_progress=$2,
      risk_level=COALESCE(NULLIF($3,''),risk_level),supervisor_comment=COALESCE(NULLIF($4,''),supervisor_comment),
      updated_at=NOW() WHERE id=$5 RETURNING id`,
    [b.status,actual,String(b.riskLevel||"").trim(),String(b.comment||"").trim(),req.params.id]);
    if(!row)return res.status(404).json({error:"Supervised project not found"});res.json({ok:true});
  }));
};
