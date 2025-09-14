const db = require('../config/db');

// User model
class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.username = data.username;
    this.firstName = data.first_name || data.firstName;
    this.lastName = data.last_name || data.lastName;
    this.password = data.password;  // This will be the hashed password
    this.emailVerified = data.email_verified || data.emailVerified || false;
    this.emailVerificationToken = data.email_verification_token || data.emailVerificationToken;
    this.emailVerificationSentAt = data.email_verification_sent_at || data.emailVerificationSentAt;
    this.passwordResetToken = data.password_reset_token || data.passwordResetToken;
    this.passwordResetExpiresAt = data.password_reset_expires_at || data.passwordResetExpiresAt;
    this.createdAt = data.created_at || data.createdAt || new Date();
    this.updatedAt = data.updated_at || data.updatedAt || new Date();
  }

  // Convert to JSON format (exclude password and sensitive fields)
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      username: this.username,
      firstName: this.firstName,
      lastName: this.lastName,
      emailVerified: this.emailVerified,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Validate user data
  static validate(userData) {
    const errors = [];
    
    if (!userData.email) {
      errors.push('Email is required');
    }
    
    // Username is now optional (will be auto-generated from email if not provided)
    if (!userData.username) {
      userData.username = userData.email.split('@')[0];
    }
    
    if (!userData.firstName) {
      errors.push('First name is required');
    }
    
    if (!userData.lastName) {
      errors.push('Last name is required');
    }
    
    // Only validate password for create operations
    if (userData.password && userData.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
    
    return errors;
  }

  // Create a new user in the database
  static async create(userData) {
    const { email, username, firstName, lastName, password } = userData;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    // Generate email verification token
    const crypto = require('crypto');
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    
    const query = `
      INSERT INTO users (email, username, first_name, last_name, password, email_verification_token, email_verification_sent_at, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [email, username, firstName, lastName, password, emailVerificationToken, createdAt, createdAt, updatedAt];
    const result = await db.query(query, values);
    return new User(result.rows[0]);
  }

  // Find all users
  static async findAll() {
    const result = await db.query('SELECT * FROM users ORDER BY id');
    return result.rows.map(row => new User(row));
  }

  // Find user by ID
  static async findById(id) {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows.length ? new User(result.rows[0]) : null;
  }

  // Find user by email
  static async findByEmail(email) {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows.length ? new User(result.rows[0]) : null;
  }

  // Update user
  static async update(id, userData) {
    const { email, username, firstName, lastName } = userData;
    const updatedAt = new Date();
    
    const query = `
      UPDATE users
      SET email = $1, username = $2, first_name = $3, last_name = $4, updated_at = $5
      WHERE id = $6
      RETURNING *
    `;
    
    const values = [email, username, firstName, lastName, updatedAt, id];
    const result = await db.query(query, values);
    return result.rows.length ? new User(result.rows[0]) : null;
  }

  // Delete user
  static async delete(id) {
    const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    return result.rows.length > 0;
  }
}

module.exports = User;