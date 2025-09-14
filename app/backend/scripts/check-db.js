#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

// Database configuration
const pool = new Pool({
  user: process.env.POSTGRES_USER || process.env.DB_USER || 'matcha_user',
  host: process.env.POSTGRES_HOST || process.env.DB_HOST || 'localhost',
  database: process.env.POSTGRES_DB || process.env.DB_NAME || 'matcha_db',
  password: process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD || 'matcha_password',
  port: process.env.POSTGRES_PORT || process.env.DB_PORT || 5432,
});

async function checkDatabase() {
  let client;
  
  try {
    // Get database client
    client = await pool.connect();
    
    // Check if users table exists and has data
    const userCountResult = await client.query('SELECT COUNT(*) FROM users');
    const userCount = parseInt(userCountResult.rows[0].count);
    
    console.log(`Found ${userCount} users in the database`);
    
    if (userCount > 0) {
      console.log('✅ Database is properly seeded with user data');
      
      // Show some sample users
      const sampleUsers = await client.query('SELECT id, username, email FROM users LIMIT 5');
      console.log('\nSample users:');
      sampleUsers.rows.forEach(user => {
        console.log(`  - ${user.username} (${user.email})`);
      });
    } else {
      console.log('❌ Database is empty - no users found');
    }
    
    // Check other tables
    const tables = ['profiles', 'photos', 'locations'];
    for (const table of tables) {
      const countResult = await client.query(`SELECT COUNT(*) FROM ${table}`);
      const count = parseInt(countResult.rows[0].count);
      console.log(`Found ${count} records in ${table} table`);
    }
    
  } catch (error) {
    console.error('Error checking database:', error.message);
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Run the check if this script is executed directly
if (require.main === module) {
  checkDatabase();
}