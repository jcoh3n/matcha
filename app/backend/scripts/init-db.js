#!/usr/bin/env node

const { runMigrations } = require('./runMigrations');
const { seedDatabase } = require('./seedUsers');

async function initDatabase() {
  try {
    console.log('Starting database initialization...');
    
    // Run migrations
    console.log('Running migrations...');
    await runMigrations();
    console.log('Migrations completed successfully');
    
    // Run seeding
    console.log('Seeding database with initial data...');
    await seedDatabase();
    console.log('Database seeding completed successfully');
    
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

// Run initialization if this script is executed directly
if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase };