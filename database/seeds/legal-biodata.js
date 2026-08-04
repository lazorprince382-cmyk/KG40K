module.exports = async function seedLegalBioData({ query, one }) {
  const legalOfficer = await one("SELECT id FROM users WHERE role='Legal Officer' ORDER BY id LIMIT 1");
  const creator = legalOfficer?.id || (await one("SELECT id FROM users ORDER BY id LIMIT 1"))?.id;
  const rows = [
    ["TJS-000184","1990-04-18","female","married","Ugandan","Kampala","Nakawa","Ntinda","Kyambogo","Fatuma Nansubuga","+256 700 111 222","Sister","O+","No disability recorded","PHOTO-TJS-000184","NIN-COPY-TJS-000184","Membership identity verified.","verified"],
    ["TJS-000207","1987-09-02","male","married","Ugandan","Wakiso","Kira","Bweyogerere","Kirinya","Mary Okello","+256 700 222 333","Spouse","A+","No disability recorded","PHOTO-TJS-000207","NIN-COPY-TJS-000207","Bio data complete and awaiting final verification.","complete"],
    ["TJS-000231","1993-01-26","female","single","Ugandan","Mukono","Goma","Seeta","Namilyango","John Namusoke","+256 700 333 444","Brother","B+","No disability recorded","PHOTO-TJS-000231","NIN-COPY-TJS-000231","Member record reviewed against registration form.","verified"],
    ["TJS-000256","1982-06-11","male","married","Ugandan","Mbarara","Kashari","Bwizibwera","Rutooma","Grace Mugisha","+256 700 444 555","Spouse","O-","Mobility support noted in confidential registration record","PHOTO-TJS-000256","NIN-COPY-TJS-000256","Contact details require confirmation.","needs_update"],
    ["TJS-000291","1991-12-08","female","married","Ugandan","Kampala","Kawempe","Makerere III","Mulago","Paul Atim","+256 700 555 666","Spouse","AB+","No disability recorded","PHOTO-TJS-000291","NIN-COPY-TJS-000291","Bio data complete.","complete"],
    ["TJS-000318","1988-03-20","male","single","Ugandan","Wakiso","Entebbe Division B","Katabi","Kitooro","Joan Ssemanda","+256 700 666 777","Sister","A-","No disability recorded","PHOTO-TJS-000318","NIN-COPY-TJS-000318","Identification copy pending verification.","complete"]
  ];
  for (const row of rows) {
    const member = await one("SELECT id FROM members WHERE member_number=$1", [row[0]]);
    if (!member) continue;
    await query(`INSERT INTO member_bio_data
      (member_id,date_of_birth,gender,marital_status,nationality,home_district,subcounty,parish,village,
       emergency_contact_name,emergency_contact_phone,emergency_contact_relationship,blood_group,
       disability_notes,profile_photo_reference,identity_document_reference,record_notes,bio_status,
       created_by,verified_by,verified_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,
        CASE WHEN $18='verified' THEN $19::bigint ELSE NULL END,
        CASE WHEN $18='verified' THEN NOW()-INTERVAL '3 days' ELSE NULL END)
      ON CONFLICT (member_id) DO NOTHING`,
    [member.id,...row.slice(1),creator]);
  }
};
