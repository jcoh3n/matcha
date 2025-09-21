-- Migration: 16_set_fame_rating_baseline
-- Purpose: Ensure all users start at fame_rating = 200 and keep at least this baseline

ALTER TABLE profiles ALTER COLUMN fame_rating SET DEFAULT 200;

-- Backfill existing rows below baseline
UPDATE profiles SET fame_rating = 200 WHERE fame_rating IS NULL OR fame_rating < 200;

-- Keep index
CREATE INDEX IF NOT EXISTS idx_profiles_fame_rating ON profiles(fame_rating);
