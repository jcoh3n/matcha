-- Migration: 19_add_performance_indexes.sql
-- Description: Add indexes to optimize filtered queries for better performance

-- Add indexes for columns used in WHERE clauses for filtering

-- Index on profiles.birth_date for age filtering
CREATE INDEX IF NOT EXISTS idx_profiles_birth_date ON profiles(birth_date);

-- Index on profiles.fame_rating for fame rating filtering
-- This already exists from the original migration but is important for performance
-- Ensure this index exists
CREATE INDEX IF NOT EXISTS idx_profiles_fame_rating ON profiles(fame_rating);

-- Index on locations.city for city filtering
CREATE INDEX IF NOT EXISTS idx_locations_city ON locations(city);

-- Index on locations.country for country filtering
CREATE INDEX IF NOT EXISTS idx_locations_country ON locations(country);

-- Index on locations latitude and longitude for distance calculations
-- This is a composite index to optimize distance-based queries
CREATE INDEX IF NOT EXISTS idx_locations_coordinates_optimized ON locations(latitude, longitude);

-- Index on tags.name for tag filtering performance
-- This already exists from the original migration but is important for performance
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

-- Index on user_tags.tag_id and user_id for tag-related queries
-- This already exists from the original migration but is important for performance
CREATE INDEX IF NOT EXISTS idx_user_tags_tag_id ON user_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_user_tags_user_id ON user_tags(user_id);

-- Composite indexes for common query patterns

-- Index for combined age and fame rating filtering
CREATE INDEX IF NOT EXISTS idx_profiles_age_fame ON profiles(birth_date, fame_rating);

-- Index for combined city and fame rating filtering (useful for location + fame queries)
CREATE INDEX IF NOT EXISTS idx_locations_city_fame ON locations(city, user_id);

-- Index for combined gender and fame rating (useful for orientation + fame queries)
CREATE INDEX IF NOT EXISTS idx_profiles_gender_fame ON profiles(gender, fame_rating);

-- Index for birth_date, gender, and fame_rating combined (for complex filtering)
CREATE INDEX IF NOT EXISTS idx_profiles_birth_gender_fame ON profiles(birth_date, gender, fame_rating);

-- Index on users.email_verified for the common filter in queries
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);

-- Index for the passes table to optimize "not passed" queries
CREATE INDEX IF NOT EXISTS idx_passes_viewer_passed ON passes(viewer_id, passed_user_id);

-- Index for the profile_views table to optimize "not viewed" queries  
CREATE INDEX IF NOT EXISTS idx_profile_views_viewer_viewed ON profile_views(viewer_id, viewed_user_id);

-- Index on profiles for optimized sorting by fame rating and last active
CREATE INDEX IF NOT EXISTS idx_profiles_fame_last_active ON profiles(fame_rating DESC, last_active DESC NULLS LAST);

-- Index for optimized tag-based matching (for common tags queries)
CREATE INDEX IF NOT EXISTS idx_user_tags_user_tag ON user_tags(user_id, tag_id);