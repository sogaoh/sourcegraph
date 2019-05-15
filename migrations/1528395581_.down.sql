BEGIN;

ALTER TABLE discussion_threads DROP COLUMN settings;

COMMIT;
