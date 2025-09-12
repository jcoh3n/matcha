#!/bin/bash

# Stop any existing services
echo "Stopping existing services..."
docker-compose down

# Start database in background
echo "Starting database..."
docker-compose up -d db

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "Running database migrations..."
docker exec matcha_db psql -U matcha_user -d matcha_db -f /docker-entrypoint-initdb.d/init.sql

# Start backend and frontend
echo "Starting backend and frontend..."
concurrently "npm run backend" "npm run frontend"