#!/bin/bash

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until docker exec matcha_db pg_isready > /dev/null 2>&1
do
    sleep 1
done

echo "PostgreSQL is ready. Running migrations..."

# Run migrations
docker exec matcha_backend npm run migrate

echo "Migrations completed."