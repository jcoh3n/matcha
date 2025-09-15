-- Migration: 11_create_seed_tracking_table
-- Description: Create a table to track if database seeding has been completed

-- Create seed_tracking table
CREATE TABLE IF NOT EXISTS seed_tracking (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial seed tracking record
INSERT INTO seed_tracking (name, completed) 
VALUES ('user_seeding', FALSE)
ON CONFLICT (name) DO NOTHING;

-- Create index on name for faster lookups
CREATE INDEX IF NOT EXISTS idx_seed_tracking_name ON seed_tracking(name);