async function buildLoanApprovalHelpers({ query, one }) {
  // Official loan flow uses governance bodies, not every department assignee.
  // Credit Committee -> then Executive Committee, with EXCO Chairperson Tabula Robert last.
  // Only Tabula Robert's rejection is final. Other reject votes are recorded as reasons and the queue continues.
  const STAGE_BODY = { credits: "credit-committee", executive: "exco" };

  function isFinalRejectAuthority(reviewer) {
    return /tabula\s*robert/i.test(String(reviewer?.fullName || ""));
  }

  async function committeeReviewers(stage) {
    const bodyCode = STAGE_BODY[stage] || stage;
    const rows = (await query(`SELECT u.id,u.full_name AS "fullName",g.position_title AS "positionTitle",
      CASE WHEN LOWER(g.position_title) LIKE '%chairperson%'
        AND LOWER(g.position_title) NOT LIKE '%vice%' THEN true ELSE false END AS "isChair",
      CASE g.position_title
        WHEN 'Vice Chairperson' THEN 1
        WHEN 'Secretary' THEN 2
        WHEN 'Treasurer' THEN 3
        WHEN 'Member' THEN 4
        WHEN 'Chairperson' THEN 99
        ELSE 50
      END AS sort_order
      FROM governance_appointments g
      JOIN governance_bodies b ON b.id=g.body_id
      JOIN members m ON m.id=g.linked_member_id
      JOIN users u ON u.member_id=m.id
      WHERE b.code=$1 AND g.status='active' AND u.active=true
      ORDER BY sort_order,u.full_name`,[bodyCode])).rows;

    if (rows.length) return rows.map(({ sort_order, ...rest }) => rest);

    // Fallback if governance links are missing: department assignees with loan authority.
    const deptCode = stage === "credits" ? "credits" : "executive";
    return (await query(`SELECT u.id,u.full_name AS "fullName",da.position_title AS "positionTitle",
      CASE
        WHEN LOWER(u.full_name) LIKE '%tabula%robert%' THEN true
        WHEN LOWER(COALESCE(da.position_title,'')) LIKE '%chairperson%'
          AND LOWER(COALESCE(da.position_title,'')) NOT LIKE '%vice%' THEN true
        ELSE false
      END AS "isChair"
      FROM department_assignments da
      JOIN departments d ON d.id=da.department_id
      JOIN users u ON u.id=da.user_id
      WHERE d.code=$1 AND da.active=true AND u.active=true
        AND (da.can_edit=true OR da.can_approve=true)
      ORDER BY
        CASE WHEN LOWER(u.full_name) LIKE '%tabula%robert%' THEN 1 ELSE 0 END,
        CASE WHEN LOWER(COALESCE(da.position_title,'')) LIKE '%chairperson%'
          AND LOWER(COALESCE(da.position_title,'')) NOT LIKE '%vice%' THEN 1 ELSE 0 END,
        da.authority_level DESC,u.full_name`,[deptCode])).rows;
  }

  async function departmentReviewers(code) {
    return committeeReviewers(code === "credits" || code === "credit-committee" ? "credits" : "executive");
  }

  async function stageVotes(loanId, stage) {
    return (await query(`SELECT v.user_id AS "userId",v.decision,v.comment,v.created_at AS "createdAt",u.full_name AS "fullName"
      FROM loan_stage_votes v JOIN users u ON u.id=v.user_id
      WHERE v.loan_id=$1 AND v.stage=$2 ORDER BY v.id`,[loanId, stage])).rows;
  }

  async function approvalProgress(loanId, stage) {
    const reviewers = await committeeReviewers(stage === "credits" ? "credits" : "executive");
    const votes = await stageVotes(loanId, stage);
    const voteByUser = new Map(votes.map(v => [Number(v.userId), v]));
    const queue = reviewers.map((r, index) => {
      const vote = voteByUser.get(Number(r.id));
      const finalRejector = isFinalRejectAuthority(r);
      return {
        userId: Number(r.id),
        fullName: r.fullName,
        positionTitle: r.positionTitle,
        isChair: Boolean(r.isChair),
        isFinalRejector: finalRejector,
        order: index + 1,
        decision: vote?.decision || null,
        comment: vote?.comment || null,
        decidedAt: vote?.createdAt || null,
        advisoryReject: vote?.decision === "reject" && !finalRejector
      };
    });
    const next = queue.find(r => !r.decision) || null;
    const approvedCount = queue.filter(r => r.decision === "approve").length;
    const advisoryRejects = queue.filter(r => r.advisoryReject);
    const finalReject = queue.find(r => r.decision === "reject" && r.isFinalRejector);
    const returned = queue.find(r => r.decision === "return");
    const allVoted = queue.length > 0 && queue.every(r => r.decision);
    return {
      stage,
      body: stage === "credits" ? "Credit Committee" : "Executive Committee",
      reviewers: queue,
      nextReviewer: next,
      approvedCount,
      requiredCount: queue.length,
      advisoryRejects,
      // Stage advances once everyone has voted, unless Tabula finally rejected.
      complete: allVoted && !finalReject && !returned,
      blockedBy: finalReject || returned || null,
      finalRejectOnly: true
    };
  }

  async function attachLoanApprovalMeta(loans) {
    if (!loans?.length) return loans || [];
    return Promise.all(loans.map(async loan => {
      const status = loan.status;
      let progress = null;
      if (["officer-review","pending","review","correction","committee-review"].includes(status)) {
        progress = await approvalProgress(loan.id || loan.loanId, "credits");
      } else if (status === "executive-authorization") {
        progress = await approvalProgress(loan.id || loan.loanId, "executive");
      }
      const productLabel = loan.customProductName || loan.custom_product_name
        ? `${loan.product || loan.productName || "Other Loan"} (${loan.customProductName || loan.custom_product_name})`
        : (loan.product || loan.productName || null);
      return {
        ...loan,
        product: productLabel || loan.product,
        customProductName: loan.customProductName || loan.custom_product_name || null,
        processingFee: Number(loan.processingFee ?? loan.processing_fee ?? 0),
        approvalProgress: progress,
        nextReviewer: progress?.nextReviewer || null,
        canCurrentUserDecide: false
      };
    }));
  }

  return {
    departmentReviewers,
    committeeReviewers,
    stageVotes,
    approvalProgress,
    attachLoanApprovalMeta,
    isFinalRejectAuthority
  };
}

module.exports = buildLoanApprovalHelpers;
