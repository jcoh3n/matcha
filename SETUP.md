# Matcha - Sprint 0 Implementation

This document describes the implementation of Sprint 0 for the Matcha dating app project.

## Implemented Features

### 1. Docker Compose Setup
- PostgreSQL database service
- Node.js backend service
- React frontend service
- Properly configured networking between services

### 2. Database Migrations
- Initial migration script for `users` and `profiles` tables
- Migration runner script
- Proper indexing and triggers for updated_at fields

### 3. Tailwind CSS Configuration
- Custom color palette based on "Matcha Latte" theme
- Responsive design utilities
- Custom component styles

### 4. Frontend Routing
- Dedicated Login and Register pages
- Protected routes for authenticated users
- All required pages: Discover, Search, Profile, Chat

### 5. Health Check
- Backend `/health` endpoint
- Frontend health check display page

## Setup Instructions

1. Make sure no other PostgreSQL instance is running on port 5432:
   ```bash
   # Check if port 5432 is in use
   netstat -tulpn | grep :5432
   
   # If another PostgreSQL is running, you can stop it with:
   sudo systemctl stop postgresql
   ```

2. Start the services using Docker Compose:
   ```bash
   docker-compose up -d
   ```

3. Run database migrations:
   ```bash
   # Wait for PostgreSQL to be ready
   # Then run migrations
   docker exec matcha_backend npm run migrate
   ```

4. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Database: localhost:5432

## Troubleshooting

### Port 5432 Already Allocated

If you encounter the error "port is already allocated", it means another PostgreSQL instance is running on your system:

1. Stop the existing PostgreSQL service:
   ```bash
   sudo systemctl stop postgresql
   ```

2. Or change the port in docker-compose.yml:
   ```yaml
   ports:
     - "5433:5432"  # Change host port to 5433
   ```

   And update the migration script to use port 5433:
   ```javascript
   port: process.env.POSTGRES_PORT || 5433,
   ```

### Migration Issues

If migrations fail to run:

1. Check that all containers are running:
   ```bash
   docker-compose ps
   ```

2. Check the database logs:
   ```bash
   docker logs matcha_db
   ```

3. Check the backend logs:
   ```bash
   docker logs matcha_backend
   ```