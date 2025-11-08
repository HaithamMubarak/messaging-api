-- Add channel_limit per developer (default 50)

ALTER TABLE developers
    ADD COLUMN IF NOT EXISTS channel_limit INTEGER NOT NULL DEFAULT 50;

-- Ensure existing rows have default value
UPDATE developers SET channel_limit = 50 WHERE channel_limit IS NULL;

