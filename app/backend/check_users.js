const db = require('./config/db');

async function checkUsers() {
  try {
    const result = await db.query('SELECT id, email, first_name, last_name FROM users LIMIT 5;');
    console.log('Users in database:');
    console.log(result.rows);
  } catch (err) {
    console.error('Error querying database:', err);
  } finally {
    process.exit(0);
  }
}

checkUsers();