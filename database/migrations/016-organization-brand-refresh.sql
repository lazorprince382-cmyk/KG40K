UPDATE organizations
SET name='Kasangati G40 Kwagalana'
WHERE code='KG40';

UPDATE legal_cases
SET subject_name=REPLACE(subject_name,'Kasangati G40 Kwegatta','Kasangati G40 Kwagalana'), updated_at=NOW()
WHERE subject_name LIKE '%Kasangati G40 Kwegatta%';

UPDATE legal_contracts
SET parties=REPLACE(parties,'Kasangati G40 Kwegatta','Kasangati G40 Kwagalana'), updated_at=NOW()
WHERE parties LIKE '%Kasangati G40 Kwegatta%';

UPDATE organization_documents
SET title=REPLACE(title,'Kasangati G40 Kwegatta','Kasangati G40 Kwagalana'), updated_at=NOW()
WHERE title LIKE '%Kasangati G40 Kwegatta%';
