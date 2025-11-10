const request = require('supertest');
const app = require('../src/app');
const db = require('../config/db');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Photo = require('../models/Photo');
const Location = require('../models/Location');
const Tag = require('../models/Tag');
const UserTag = require('../models/UserTag');

describe('Profiles API Tests', () => {
  let testUser, testUser2, testUser3;
  let authToken, authToken2, authToken3;

  beforeEach(async () => {
    // Clear the relevant tables before each test
    await db.query('DELETE FROM user_tags');
    await db.query('DELETE FROM tags');
    await db.query('DELETE FROM photos');
    await db.query('DELETE FROM locations');
    await db.query('DELETE FROM profiles');
    await db.query('DELETE FROM users');

    // Create test users
    testUser = await User.create({
      email: 'user1@example.com',
      username: 'user1',
      firstName: 'User',
      lastName: 'One',
      password: 'password123'
    });
    
    testUser2 = await User.create({
      email: 'user2@example.com',
      username: 'user2',
      firstName: 'User',
      lastName: 'Two',
      password: 'password123'
    });
    
    testUser3 = await User.create({
      email: 'user3@example.com',
      username: 'user3',
      firstName: 'User',
      lastName: 'Three',
      password: 'password123'
    });

    // Create profiles for test users
    await Profile.create({
      userId: testUser.id,
      bio: 'Test bio for user 1',
      gender: 'male',
      orientation: 'heterosexual',
      birthDate: new Date(1990, 0, 1),
      fameRating: 100
    });
    
    await Profile.create({
      userId: testUser2.id,
      bio: 'Test bio for user 2',
      gender: 'female',
      orientation: 'heterosexual',
      birthDate: new Date(1995, 0, 1),
      fameRating: 200
    });
    
    await Profile.create({
      userId: testUser3.id,
      bio: 'Test bio for user 3',
      gender: 'non-binary',
      orientation: 'bisexual',
      birthDate: new Date(1992, 0, 1),
      fameRating: 150
    });

    // Add photos
    await Photo.create({
      userId: testUser.id,
      url: 'https://example.com/photo1.jpg',
      isProfile: true
    });
    
    await Photo.create({
      userId: testUser2.id,
      url: 'https://example.com/photo2.jpg',
      isProfile: true
    });
    
    await Photo.create({
      userId: testUser3.id,
      url: 'https://example.com/photo3.jpg',
      isProfile: true
    });

    // Add locations
    await Location.create({
      userId: testUser.id,
      latitude: 48.8566, // Paris
      longitude: 2.3522,
      city: 'Paris',
      country: 'France',
      locationMethod: 'GPS'
    });
    
    await Location.create({
      userId: testUser2.id,
      latitude: 48.8666, // Paris
      longitude: 2.3622,
      city: 'Paris',
      country: 'France',
      locationMethod: 'GPS'
    });
    
    await Location.create({
      userId: testUser3.id,
      latitude: 40.7128, // New York
      longitude: -74.0060,
      city: 'New York',
      country: 'USA',
      locationMethod: 'GPS'
    });

    // Create some tags
    const tag1 = await Tag.create('sports');
    const tag2 = await Tag.create('music');
    const tag3 = await Tag.create('travel');
    const tag4 = await Tag.create('cooking');

    // Assign tags to users
    await UserTag.create(testUser.id, tag1.id); // sports
    await UserTag.create(testUser.id, tag2.id); // music
    await UserTag.create(testUser2.id, tag2.id); // music (common tag)
    await UserTag.create(testUser2.id, tag3.id); // travel
    await UserTag.create(testUser3.id, tag3.id); // travel
    await UserTag.create(testUser3.id, tag4.id); // cooking

    // Generate auth tokens (mock implementation - in real app this would be actual JWT)
    // For testing purposes, we'll need to simulate JWT authentication
    // This is a simplified version - in real implementation, you'd need to handle actual JWT generation
    authToken = 'valid-jwt-token-for-user1';
    authToken2 = 'valid-jwt-token-for-user2';
    authToken3 = 'valid-jwt-token-for-user3';
  });

  afterAll(async () => {
    await db.pool.end();
  });

  describe('GET /api/profiles', () => {
    it('should return profiles with pagination', async () => {
      const response = await request(app)
        .get('/api/profiles')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('total');
      expect(response.body.pagination).toHaveProperty('totalPages');
    });

    it('should return profiles with pagination parameters', async () => {
      const response = await request(app)
        .get('/api/profiles?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(2);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(2);
    });

    it('should apply age filters', async () => {
      const response = await request(app)
        .get('/api/profiles?ageMin=25&ageMax=35')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      // Should only return users born between 1990 and 1999 (age 25-35 in 2025)
      const data = response.body.data;
      data.forEach(profile => {
        const birthYear = new Date(profile.profile.birthDate).getFullYear();
        expect(birthYear).toBeGreaterThanOrEqual(1990);
        expect(birthYear).toBeLessThanOrEqual(2000);
      });
    });

    it('should apply fame rating filter', async () => {
      const response = await request(app)
        .get('/api/profiles?fameRating=150')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      const data = response.body.data;
      data.forEach(profile => {
        expect(profile.profile.fameRating).toBeGreaterThanOrEqual(150);
      });
    });

    it('should apply distance filter', async () => {
      const response = await request(app)
        .get('/api/profiles?distance=1000') // 1000 km radius
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      // This test requires proper JWT implementation to validate user location
      // For now, just test that it doesn't error
    });

    it('should apply tags filter', async () => {
      const response = await request(app)
        .get('/api/profiles?tags=music')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      const data = response.body.data;
      // Should return users with 'music' tag
      const hasMusicTag = data.some(profile => 
        profile.tags && profile.tags.includes('music')
      );
      expect(hasMusicTag).toBe(true);
    });

    it('should return lite response when requested', async () => {
      const response = await request(app)
        .get('/api/profiles?lite=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      const data = response.body.data;
      
      // In lite response, check that only essential fields are present
      // Should not have email, first_name, last_name, etc.
      data.forEach(profile => {
        expect(profile).toHaveProperty('id');
        expect(profile).toHaveProperty('username');
        expect(profile).toHaveProperty('profilePhotoUrl');
        expect(profile).toHaveProperty('profile');
        expect(profile).toHaveProperty('location');
        expect(profile).toHaveProperty('tags');
        // Should NOT have full profile details like in full response
        expect(profile).not.toHaveProperty('email'); // assuming email is in full response
      });
    });
  });
});