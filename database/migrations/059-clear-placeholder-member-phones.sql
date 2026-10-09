-- Historical (exited) members were seeded with a placeholder phone that is not theirs.
UPDATE members SET phone=''
WHERE phone IN ('+256700000000','256700000000','0700000000');
