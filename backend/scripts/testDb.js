const db = require('../config/db');

async function testDatabase() {
  console.log('Testing database connection...');
  
  const connected = await db.testConnection();
  
  if (connected) {
    console.log('Database connection test passed!');
    
    // Test a simple query
    try {
      const result = await db.query('SELECT NOW() as now');
      console.log('Database query test passed:', result.rows[0]);
    } catch (error) {
      console.error('Database query test failed:', error);
    }
  } else {
    console.log('Database connection test failed!');
  }
  
  process.exit(connected ? 0 : 1);
}

testDatabase();