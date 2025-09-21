#!/usr/bin/env node

// Simple script to check database coordinates
const { Client } = require('pg');
require('dotenv').config();

async function checkDatabaseCoordinates() {
  const client = new Client({
    user: process.env.POSTGRES_USER || process.env.DB_USER || "postgres",
    host: process.env.POSTGRES_HOST || process.env.DB_HOST || "db",
    database: process.env.POSTGRES_DB || process.env.DB_NAME || "matcha_db",
    password: process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD || "postgres",
    port: process.env.POSTGRES_PORT || process.env.DB_PORT || 5432,
  });

  try {
    await client.connect();
    console.log("Connected to database successfully.\n");
    
    console.log("Checking coordinate data in database...\n");
    
    // Get a few user locations to see what's stored
    const result = await client.query(`
      SELECT u.id, u.username, u.first_name, u.last_name, 
             l.latitude, l.longitude, l.city, l.country
      FROM users u
      LEFT JOIN locations l ON u.id = l.user_id
      WHERE l.latitude IS NOT NULL AND l.longitude IS NOT NULL
      LIMIT 10
    `);
    
    console.log("Sample user locations from database:");
    console.log("ID\tUsername\t\tName\t\t\t\tLatitude\tLongitude\tCity\t\tCountry");
    console.log("---\t--------\t\t----\t\t\t\t--------\t---------\t----\t\t-------");
    
    result.rows.forEach(row => {
      console.log(`${row.id}\t${row.username}\t${row.first_name} ${row.last_name}\t${row.latitude}\t${row.longitude}\t${row.city}\t\t${row.country}`);
    });
    
    // Check if any coordinates seem invalid
    console.log("\nChecking for invalid coordinates:");
    let invalidCount = 0;
    
    result.rows.forEach(row => {
      const lat = parseFloat(row.latitude);
      const lon = parseFloat(row.longitude);
      
      // Check for obviously wrong coordinates
      if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        console.log(`INVALID: User ${row.id} (${row.username}) has coordinates: ${lat}, ${lon}`);
        invalidCount++;
      }
      
      // Check for coordinates that are likely wrong for France
      if (lat < 40 || lat > 52 || lon < -5 || lon > 10) {
        // Only show as suspicious if not already marked as invalid
        if (!(lat < -90 || lat > 90 || lon < -180 || lon > 180)) {
          console.log(`SUSPICIOUS: User ${row.id} (${row.username}) has coordinates: ${lat}, ${lon} (${row.city}, ${row.country})`);
        }
      }
    });
    
    console.log(`\nFound ${invalidCount} invalid coordinate entries.`);
    
  } catch (error) {
    console.error("Error checking database coordinates:", error.message);
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  checkDatabaseCoordinates();
}