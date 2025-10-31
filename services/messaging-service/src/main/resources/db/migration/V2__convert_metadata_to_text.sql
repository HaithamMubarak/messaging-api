-- Flyway migration: convert channels.metadata from jsonb to text safely
-- This migration will only run the ALTER if the column exists and is jsonb.
-- It is safe to run multiple times (idempotent check) and will leave the column as text afterwards.

DO $$
BEGIN
  IF EXISTS(
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'channels'
      AND column_name = 'metadata'
      AND (udt_name = 'jsonb' OR data_type = 'jsonb')
  ) THEN
    RAISE NOTICE 'Converting channels.metadata from jsonb to text';
    ALTER TABLE channels ALTER COLUMN metadata TYPE text USING metadata::text;
  ELSE
    RAISE NOTICE 'channels.metadata is not jsonb or does not exist; skipping conversion';
  END IF;
END$$;

