#!/bin/bash

echo "Waiting for database to be ready..."
# Use netcat to check if the database port is open
until nc -z db 5432
do
    sleep 1
done
echo "Database is ready."

echo "Initializing database (migrations and seeding)..."
npm run init-db

echo "Starting application..."
exec npm run dev