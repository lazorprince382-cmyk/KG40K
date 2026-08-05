const PRIMARY_CREDITS_OFFICER_SQL = `
  SELECT u.id, u.full_name AS name
  FROM users u
  JOIN department_assignments da ON da.user_id = u.id AND da.active = true
  JOIN departments d ON d.id = da.department_id AND d.code = 'credits'
  WHERE u.active = true AND u.role = 'Credits Officer' AND da.can_approve = true
  ORDER BY da.is_head DESC, da.authority_level DESC,
    CASE WHEN lower(u.full_name) LIKE '%nakayiza%' OR lower(u.full_name) LIKE '%baraza olivia%' THEN 0 ELSE 1 END,
    u.id
  LIMIT 1`;

async function getPrimaryCreditsOfficer(executor) {
  const row = (await executor.query(PRIMARY_CREDITS_OFFICER_SQL)).rows[0];
  return row || null;
}

async function notifyCreditsVerificationQueue(executor, { title, message, kind = "submission" }) {
  const primary = await getPrimaryCreditsOfficer(executor);
  const page = kind === "repayment" ? "Repayments" : "Savings";
  if (primary) {
    await executor.query(
      `INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)`,
      [primary.id, title, `${message} Open Credits → ${page} on your dashboard to approve.`]
    );
    return primary;
  }
  await executor.query(
    `INSERT INTO notifications (user_id, title, message)
     SELECT DISTINCT u.id, $1, $2
     FROM departments d
     JOIN department_assignments da ON da.department_id = d.id AND da.active = true AND da.can_approve = true
     JOIN users u ON u.id = da.user_id AND u.active = true
     WHERE d.code = 'credits'`,
    [title, `${message} Open Credits → ${page} to review.`]
  );
  return null;
}

module.exports = { getPrimaryCreditsOfficer, notifyCreditsVerificationQueue };
