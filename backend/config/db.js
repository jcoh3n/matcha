const { Pool } = require('pg');
require('dotenv').config();

// Create a PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'matcha_dev',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Test the database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database successfully');
    client.release();
    return true;
  } catch (err) {
    console.error('Error connecting to PostgreSQL database:', err);
    return false;
  }
};

// Helper function to run queries
const query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
};

module.exports = {
  query,
  testConnection,
  pool
};