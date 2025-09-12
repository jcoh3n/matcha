-- Migration: 001_create_users_and_profiles_tables
-- Description: Create initial tables for users and profiles

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    birth_date DATE,
    gender VARCHAR(20),
    sexual_orientation VARCHAR(20),
    biography TEXT,
    location POINT,
    fame_rating INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_fame_rating ON profiles(fame_rating);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at'
    ) THEN
        CREATE TRIGGER update_users_updated_at 
        BEFORE UPDATE ON users
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at'
    ) THEN
        CREATE TRIGGER update_profiles_updated_at 
        BEFORE UPDATE ON profiles
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;