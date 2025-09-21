-- Migration: 17_create_passes_table
-- Tracks which users the viewer has passed, to exclude them from discovery

CREATE TABLE IF NOT EXISTS passes (
  id SERIAL PRIMARY KEY,
  viewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  passed_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(viewer_id, passed_user_id)
);

CREATE INDEX IF NOT EXISTS idx_passes_viewer_id ON passes(viewer_id);
CREATE INDEX IF NOT EXISTS idx_passes_passed_user_id ON passes(passed_user_id);
