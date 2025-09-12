#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'matcha_dev',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function testDatabase() {
  try {
    // Check database connection
    const client = await pool.connect();
    console.log('Connected to database successfully');
    
    // Test if tables exist
    const tables = ['users', 'sessions', 'profiles', 'tags', 'user_tags', 'photos', 'locations'];
    
    for (const table of tables) {
      try {
        const result = await client.query(`SELECT 1 FROM ${table} LIMIT 1`);
        console.log(`✓ Table '${table}' exists`);
      } catch (error) {
        console.log(`✗ Table '${table}' does not exist or is not accessible`);
      }
    }
    
    client.release();
    console.log('Database test completed');
  } catch (error) {
    console.error('Database test failed:', error);
  } finally {
    await pool.end();
  }
}

// Run test if this script is executed directly
if (require.main === module) {
  testDatabase();
}

module.exports = { testDatabase };