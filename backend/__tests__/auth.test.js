const request = require('supertest');
const app = require('../src/app');
const db = require('../config/db');
const User = require('../models/User');

describe('Email Verification', () => {
  beforeEach(async () => {
    // Clear the users table before each test
    await db.query('DELETE FROM users');
  });

  afterAll(async () => {
    // Close the database connection
    await db.end();
  });

  describe('POST /api/auth/register', () => {
    it('should register a user and send verification email', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.user).toHaveProperty('emailVerified', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Please check your email to verify your account');
    });
  });

  describe('POST /api/auth/verify-email', () => {
    it('should verify user email with valid token', async () => {
      // First, register a user
      const userData = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);

      const user = await User.findByEmail(userData.email);
      expect(user.emailVerified).toBe(false);

      // Then, verify the email
      const verifyResponse = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: user.emailVerificationToken })
        .expect(200);

      expect(verifyResponse.body.message).toContain('Email verified successfully');

      // Check that the user is now verified
      const updatedUser = await User.findByEmail(userData.email);
      expect(updatedUser.emailVerified).toBe(true);
      expect(updatedUser.emailVerificationToken).toBeNull();
    });

    it('should return error for invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: 'invalid-token' })
        .expect(400);

      expect(response.body.message).toContain('Invalid or expired verification token');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should not allow login for unverified email', async () => {
      // First, register a user
      const userData = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Try to login without verifying email
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(401);

      expect(response.body.message).toContain('Please verify your email address before logging in');
    });

    it('should allow login for verified email', async () => {
      // First, register a user
      const userData = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'password123'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Verify the email
      const user = await User.findByEmail(userData.email);
      await request(app)
        .post('/api/auth/verify-email')
        .send({ token: user.emailVerificationToken });

      // Try to login with verified email
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(response.body.user).toHaveProperty('email', userData.email);
      expect(response.body.user).toHaveProperty('emailVerified', true);
    });
  });
});