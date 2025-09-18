-- Create profile_views table
CREATE TABLE IF NOT EXISTS profile_views (
  id SERIAL PRIMARY KEY,
  viewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  viewed_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_profile_views_viewer_id ON profile_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_user_id ON profile_views(viewed_user_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_created_at ON profile_views(created_at);