#!/usr/bin/env node

const { Client } = require('pg');
const fs = require('fs').promises;
const path = require('path');

// Database connection configuration
const dbConfig = {
  user: process.env.POSTGRES_USER || 'matcha_user',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'matcha_db',
  password: process.env.POSTGRES_PASSWORD || 'matcha_password',
  port: process.env.POSTGRES_PORT || 5432,
};

// If running in Docker, use the 'db' service name as host
if (process.env.RUNNING_IN_DOCKER) {
  dbConfig.host = 'db';
}

async function runMigrations() {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Get list of migration files
    // The migrations directory is at the same level as the scripts directory
    const migrationsDir = path.join(__dirname, '..', 'migrations');
    const files = await fs.readdir(migrationsDir);
    const sqlFiles = files.filter(file => file.endsWith('.sql')).sort();
    
    console.log(`Found ${sqlFiles.length} migration files`);
    
    for (const file of sqlFiles) {
      console.log(`Running migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = await fs.readFile(filePath, 'utf8');
      
      try {
        await client.query(sql);
        console.log(`✓ Migration ${file} completed successfully`);
      } catch (error) {
        console.error(`✗ Error running migration ${file}:`, error.message);
        throw error;
      }
    }
    
    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration process failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };