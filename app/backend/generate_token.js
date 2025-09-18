const jwt = require('jsonwebtoken');
require('dotenv').config();

// Generate a JWT token for user with id 1
const userId = 1;
const secret = process.env.JWT_SECRET || 'your_jwt_secret_here';
const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

const token = jwt.sign({ id: userId }, secret, { expiresIn });

console.log('Generated token for user ID 1:');
console.log(token);

// Test the token
try {
  const decoded = jwt.verify(token, secret);
  console.log('Token verification successful:');
  console.log(decoded);
} catch (err) {
  console.error('Token verification failed:', err);
}