#!/bin/bash

echo "Waiting for database to be ready..."
# Use netcat to check if the database port is open
until nc -z db 5432
do
    sleep 1
done
echo "Database is ready."

echo "Initializing database (migrations and seeding)..."
if npm run init-db; then
    echo "Database initialization finished."
else
    echo "Database initialization failed. Exiting."
    exit 1
fi

echo "Starting application..."
if [ "$NODE_ENV" = "production" ]; then
    exec npm start
else
    exec npm run dev
fi