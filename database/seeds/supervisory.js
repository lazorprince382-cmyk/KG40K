module.exports = async function seedSupervisory({ query, one }) {
  const supervisor = await one("SELECT id FROM users WHERE role='Supervisory Officer' ORDER BY id LIMIT 1");
  if (!supervisor) return;
  const departmentRows = (await query("SELECT id,code FROM departments WHERE active=true")).rows;
  const departments = Object.fromEntries(departmentRows.map(row => [row.code, row.id]));

  const scorecards = [
    ["SCORE-EXE-2026-07","executive",95,92,24,2,64,93,94,"on_track","Executive decisions are generally implemented on time."],
    ["SCORE-FIN-2026-07","finance",92,90,38,3,71,92,96,"on_track","Reporting is strong; close the delayed reconciliation follow-up."],
    ["SCORE-CRE-2026-07","credits",90,88,31,6,66,88,91,"on_track","Loan recovery remains above target; consent evidence needs follow-up."],
    ["SCORE-INV-2026-07","investment",90,85,18,5,78,84,87,"attention","Two project milestones are behind the approved schedule."],
    ["SCORE-WEL-2026-07","welfare",85,82,27,7,63,81,85,"attention","Contribution collection and approval turnaround require improvement."],
    ["SCORE-LEG-2026-07","legal",95,92,21,1,62,95,98,"excellent","Contract and policy reviews are current."],
    ["SCORE-AUD-2026-07","audit",90,88,16,3,57,89,92,"on_track","Recommendation verification is progressing as planned."]
  ];
  for (const row of scorecards) await query(`INSERT INTO supervisory_scorecards
    (reference,department_id,annual_target,monthly_target,completed_tasks,outstanding_tasks,budget_utilization,
     performance_score,target_achievement,status,supervisor_comment,review_period,reviewed_by)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'July 2026',$12)
    ON CONFLICT (reference) DO NOTHING`,
  [row[0],departments[row[1]],...row.slice(2),supervisor.id]);

  const followups = [
    ["SUP-FUP-026","finance","Submit outstanding bank reconciliation evidence","Finance Manager","2026-08-05",72,"in_progress","Reconciliation pack","Evidence review scheduled."],
    ["SUP-FUP-025","investment","Recover delayed milestone on Commercial Centre Phase II","Investment Head","2026-08-12",48,"at_risk","Updated work plan","Weekly progress update required."],
    ["SUP-FUP-024","welfare","Improve monthly contribution collection to at least 85%","Welfare Head","2026-08-20",61,"in_progress","Collection register","Target high-arrears member groups."],
    ["SUP-FUP-023","credits","Complete member consent evidence for sampled credit files","Credits Head","2026-08-08",80,"in_progress","Credit file checklist","Final verification visit pending."],
    ["SUP-FUP-022","executive","Close delayed actions from the June Board meeting","Executive Secretary","2026-08-02",65,"overdue","Board action tracker","Escalated for completion."]
  ];
  for (const row of followups) await query(`INSERT INTO supervisory_followups
    (reference,department_id,action_required,responsible_officer,deadline,progress,status,evidence,supervisor_comment,created_by)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT (reference) DO NOTHING`,
  [row[0],departments[row[1]],...row.slice(2),supervisor.id]);

  await query(`INSERT INTO supervisory_executive_monitoring
    (reference,review_period,meetings_held,decisions_made,decisions_implemented,decisions_pending,
     strategic_objectives_completed,strategic_objectives_total,attendance_rate,implementation_rate,
     performance_score,delayed_actions,report_reference,supervisor_comment,created_by)
    VALUES ('EXEC-MON-2026-07','July 2026',4,18,15,3,8,10,94,83,91,2,
      'EXEC-JUL-2026','Implementation is strong; two strategic actions require escalation.',$1)
    ON CONFLICT (reference) DO NOTHING`, [supervisor.id]);

  const committees = [
    ["COM-CREDIT","Credit Committee",7,4,92,26,3,90,"on_track","Sarah Namusoke","Loan decisions are timely; three actions remain open."],
    ["COM-WELFARE","Welfare Committee",6,3,84,18,5,81,"attention","Winfred Nabukenya","Improve attendance and document decisions earlier."],
    ["COM-INVEST","Investment Committee",8,3,89,14,4,86,"on_track","Peter Ssemakula","Project variance reviews should be more frequent."],
    ["COM-FINANCE","Finance Committee",5,4,96,22,2,94,"excellent","Rebecca Nakato","Strong attendance and implementation rate."],
    ["COM-PROCURE","Procurement Committee",6,2,78,9,6,74,"attention","Moses Kato","Meeting frequency and action closure are below target."]
  ];
  for (const row of committees) await query(`INSERT INTO supervisory_committees
    (reference,committee_name,members,meetings_held,attendance_rate,decisions_made,outstanding_actions,
     performance_score,status,chairperson,supervisor_comment,review_period,created_by)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'July 2026',$12)
    ON CONFLICT (reference) DO NOTHING`, [...row,supervisor.id]);

  const resolutions = [
    ["RES-2026-041","Digitize departmental monthly performance reports","2026-06-28","executive","Executive Secretary","2026-08-15",70,"Digital reporting configuration","in_progress","high"],
    ["RES-2026-040","Complete Commercial Centre contractor review","2026-06-28","investment","Investment Head","2026-08-10",45,"Contractor review pack","at_risk","high"],
    ["RES-2026-039","Strengthen welfare contribution recovery","2026-06-12","welfare","Welfare Head","2026-08-20",60,"Collection action plan","in_progress","medium"],
    ["RES-2026-038","Adopt updated procurement policy","2026-06-12","legal","Legal Officer","2026-07-31",100,"Signed policy resolution","implemented","medium"],
    ["RES-2026-037","Close sampled loan consent exceptions","2026-06-12","credits","Credits Head","2026-08-08",80,"Remediation checklist","in_progress","high"],
    ["RES-2026-036","Submit annual financial statements","2026-05-30","finance","Finance Manager","2026-07-25",100,"Approved financial statements","implemented","high"]
  ];
  for (const row of resolutions) await query(`INSERT INTO supervisory_resolutions
    (resolution_number,title,meeting_date,department_id,responsible_officer,due_date,completion_percentage,
     evidence,status,priority,created_by,completed_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,
      CASE WHEN $9='implemented' THEN NOW()-INTERVAL '3 days' ELSE NULL END)
    ON CONFLICT (resolution_number) DO NOTHING`,
  [row[0],row[1],row[2],departments[row[3]],...row.slice(4),supervisor.id]);

  const complaints = [
    ["SUP-CMP-019","Reporting delay","Department","finance","Repeated delay in submitting a bank reconciliation evidence pack.","Susan Nambatya","investigation",65,"Submission timestamps verified.","Complete corrective action and monitor next cycle.",false,"Reporting register"],
    ["SUP-CMP-018","Project delay","Organizational activity","investment","Commercial Centre milestone is behind the approved delivery plan.","Susan Nambatya","escalated",75,"Contractor resources are below plan.","Executive intervention and revised milestone plan.",true,"Site visit notes"],
    ["SUP-CMP-017","Committee performance","Committee","welfare","Concern about low attendance at two Welfare Committee meetings.","Susan Nambatya","follow_up",80,"Attendance register confirms the concern.","Committee chair to implement attendance recovery plan.",false,"Committee minutes"],
    ["SUP-CMP-016","Leadership conduct","Official","executive","Complaint regarding delayed communication of an approved resolution.","Susan Nambatya","resolved",100,"Communication trail reviewed.","Resolution communication procedure updated.",false,"Executive correspondence"],
    ["SUP-CMP-015","Service delivery","Department","credits","Member complaint concerning loan status communication.","Susan Nambatya","resolved",100,"Member and officer interviews completed.","Automated status notification activated.",false,"Interview notes"]
  ];
  for (const row of complaints) await query(`INSERT INTO supervisory_complaints
    (complaint_number,category,subject_type,department_id,description,assigned_supervisor,status,
     investigation_progress,finding,recommendation,escalated,evidence,created_by,resolved_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,
      CASE WHEN $7='resolved' THEN NOW()-INTERVAL '5 days' ELSE NULL END)
    ON CONFLICT (complaint_number) DO NOTHING`,
  [row[0],row[1],row[2],departments[row[3]],...row.slice(4),supervisor.id]);

  const projects = [
    ["SUP-PRJ-011","Commercial Centre Phase II","investment","Peter Ssemakula",72,48,"high","behind_schedule","2026-10-30",120000000,2,"Contractor recovery plan is required."],
    ["SUP-PRJ-010","Digital Member Records","executive","Executive Secretary",65,70,"low","active","2026-09-15",45000000,1,"Progress is ahead of plan."],
    ["SUP-PRJ-009","Welfare Contribution Campaign","welfare","Welfare Head",75,61,"medium","at_risk","2026-08-31",12000000,3,"Focus on branches with high arrears."],
    ["SUP-PRJ-008","Credit Recovery Improvement","credits","Credits Head",80,84,"low","active","2026-09-30",18000000,2,"Recovery performance is above target."],
    ["SUP-PRJ-007","Policy Digitization","legal","Legal Officer",100,100,"low","completed","2026-07-20",8500000,1,"Project completed with evidence accepted."]
  ];
  for (const row of projects) await query(`INSERT INTO supervisory_projects
    (reference,project_name,department_id,project_manager,planned_progress,actual_progress,risk_level,status,
     deadline,budget_summary,site_visits_completed,supervisor_comment,created_by)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
    ON CONFLICT (reference) DO NOTHING`,
  [row[0],row[1],departments[row[2]],...row.slice(3),supervisor.id]);

  const recommendations = [
    ["SUP-REC-044","finance","Performance Review","SCORE-FIN-2026-07","Complete reconciliation evidence before the next reporting cycle.","Finance Manager","2026-08-05","in_progress","Evidence pack is being completed.",75,true],
    ["SUP-REC-043","investment","Site Visit","SUP-VIS-014","Submit and implement the Commercial Centre milestone recovery plan.","Investment Head","2026-08-10","overdue","Contractor meeting scheduled.",45,true],
    ["SUP-REC-042","welfare","Committee Review","COM-WELFARE","Improve committee attendance and contribution follow-up.","Welfare Head","2026-08-20","accepted","Committee accepted the recommendation.",30,true],
    ["SUP-REC-041","credits","Performance Review","SCORE-CRE-2026-07","Close sampled member consent documentation gaps.","Credits Head","2026-08-08","in_progress","Most affected files have been corrected.",80,true],
    ["SUP-REC-040","executive","Resolution Review","RES-2026-041","Accelerate organization-wide performance report digitization.","Executive Secretary","2026-08-15","accepted","Implementation team assigned.",70,true],
    ["SUP-REC-039","legal","Performance Review","SCORE-LEG-2026-07","Maintain current contract and policy review performance.","Legal Officer","2026-09-01","implemented","Monitoring controls remain active.",100,true]
  ];
  for (const row of recommendations) await query(`INSERT INTO supervisory_recommendations
    (recommendation_number,department_id,source_type,source_reference,description,responsible_officer,due_date,
     status,department_response,implementation_progress,accepted,created_by,verified_by,completed_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,
      CASE WHEN $8='implemented' THEN $12::bigint ELSE NULL END,
      CASE WHEN $8='implemented' THEN NOW()-INTERVAL '2 days' ELSE NULL END)
    ON CONFLICT (recommendation_number) DO NOTHING`,
  [row[0],departments[row[1]],...row.slice(2),supervisor.id]);

  const visits = [
    ["SUP-VIS-014","Commercial Centre Site","investment","SUP-PRJ-011","2026-07-24","Susan Nambatya","Construction progress was below the approved milestone; contractor staffing was insufficient.","visit-014-photos","Submit a recovery schedule and increase site resources.","2026-08-07","follow_up_due"],
    ["SUP-VIS-013","Kampala Central Records Office","executive","SUP-PRJ-010","2026-07-18","Susan Nambatya","Digitization equipment and indexing controls were functioning.","visit-013-photos","Complete quality review before full migration.","2026-08-15","completed"],
    ["SUP-VIS-012","Credits Recovery Desk","credits","SUP-PRJ-008","2026-07-11","Susan Nambatya","Recovery reminders and case assignment controls were operating.","visit-012-photos","Maintain weekly exception review.","2026-08-11","completed"],
    ["SUP-VIS-011","Welfare Outreach Activity","welfare","SUP-PRJ-009","2026-07-05","Susan Nambatya","Member participation was positive, but arrears follow-up lists were incomplete.","visit-011-photos","Issue branch-specific arrears lists.","2026-08-05","follow_up_due"]
  ];
  for (const row of visits) {
    const project = await one("SELECT id FROM supervisory_projects WHERE reference=$1", [row[3]]);
    await query(`INSERT INTO supervisory_site_visits
      (visit_number,site_name,department_id,project_id,visit_date,supervisor,observations,photos_reference,
       recommendations,follow_up_date,status,created_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      ON CONFLICT (visit_number) DO NOTHING`,
    [row[0],row[1],departments[row[2]],project?.id||null,...row.slice(4),supervisor.id]);
  }

  const kpis = [
    ["SUP-KPI-MEM","Membership Growth","Membership",8,8.4,"%",105,"up","above_target","Member register"],
    ["SUP-KPI-REV","Revenue Growth","Finance",12,10.8,"%",90,"up","attention","Finance reports"],
    ["SUP-KPI-LOAN","Loan Recovery Performance","Credits",92,92.4,"%",100.4,"up","above_target","Credit portfolio"],
    ["SUP-KPI-WEL","Welfare Performance","Welfare",85,81,"%",95.3,"stable","attention","Welfare dashboard"],
    ["SUP-KPI-INV","Investment Growth","Investment",15,13.2,"%",88,"up","attention","Investment reports"],
    ["SUP-KPI-DEPT","Department Performance","Organization",90,88.9,"%",98.8,"stable","on_track","Department scorecards"],
    ["SUP-KPI-STRAT","Strategic Goal Achievement","Executive",85,80,"%",94.1,"up","on_track","Strategic plan tracker"]
  ];
  for (const row of kpis) await query(`INSERT INTO supervisory_kpis
    (reference,kpi_name,category,target_value,actual_value,unit,achievement_percentage,trend,status,
     review_period,data_source,created_by)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'July 2026',$10,$11)
    ON CONFLICT (reference) DO NOTHING`, [...row,supervisor.id]);
};
