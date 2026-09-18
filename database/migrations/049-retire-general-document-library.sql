-- Retire unused General document library shelf
UPDATE departments SET active=false WHERE code='general';
