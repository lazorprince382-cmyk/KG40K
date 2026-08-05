const officialDeptSql = `CASE gb.code
  WHEN 'exco' THEN 'executive'
  WHEN 'credit-committee' THEN 'credits'
  WHEN 'investment-committee' THEN 'investment'
  WHEN 'legal-committee' THEN 'legal'
  WHEN 'finance-committee' THEN 'finance'
  WHEN 'welfare-committee' THEN 'welfare'
  WHEN 'supervisory-committee' THEN 'supervisory'
  WHEN 'audit-committee' THEN 'audit'
  ELSE NULL END`;

const officialMemberDepts = `SELECT ga.linked_member_id AS member_id, ${officialDeptSql} AS dept_code,
    d.name AS dept_name, gb.name AS body_name, ga.position_title
  FROM governance_appointments ga
  JOIN governance_bodies gb ON gb.id=ga.body_id
  JOIN departments d ON d.code=${officialDeptSql}
  WHERE ga.status='active' AND ga.linked_member_id IS NOT NULL
    AND gb.code IN ('exco','credit-committee','investment-committee','legal-committee',
      'finance-committee','welfare-committee','supervisory-committee','audit-committee')`;

const officialDeptCodes = [
  "executive", "credits", "investment", "legal", "finance", "welfare", "supervisory", "audit"
];

module.exports = { officialDeptSql, officialMemberDepts, officialDeptCodes };
