BEGIN;

ALTER TABLE discussion_threads ADD COLUMN settings text;

COMMIT;
