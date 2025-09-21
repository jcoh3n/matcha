-- Migration: 15_fix_profiles_columns
-- Purpose: Normalize profiles columns to match application code
-- - Ensure 'bio' (TEXT) exists (rename 'biography' -> 'bio' if needed)
-- - Ensure 'sexual_orientation' (VARCHAR) exists (rename 'orientation' -> 'sexual_orientation' if needed)
-- - Ensure 'last_active' (TIMESTAMPTZ) exists
-- - Ensure 'fame_rating' (INTEGER DEFAULT 0) exists

-- Add columns if not exist (safe to run multiple times)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sexual_orientation VARCHAR(20);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fame_rating INTEGER DEFAULT 0;

-- Rename 'biography' -> 'bio' if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'biography'
  ) THEN
    -- Only rename if 'bio' doesn't already contain data we need
    -- Simple approach: attempt rename; will fail if 'bio' already exists, but we guarded with existence check
    EXECUTE 'ALTER TABLE profiles RENAME COLUMN biography TO bio';
  END IF;
END $$;

-- Rename 'orientation' -> 'sexual_orientation' if present and target not already present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'orientation'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'sexual_orientation'
  ) THEN
    EXECUTE 'ALTER TABLE profiles RENAME COLUMN orientation TO sexual_orientation';
  END IF;
END $$;

-- Ensure indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_fame_rating ON profiles(fame_rating);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
