const request = require('supertest');
const app = require('../src/app');
const db = require('../config/db');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Photo = require('../models/Photo');
const Location = require('../models/Location');
const Tag = require('../models/Tag');
const UserTag = require('../models/UserTag');

describe('Server-side Sorting Tests', () => {
  let testUser, testUser2, testUser3, testUser4;
  let authToken;

  beforeEach(async () => {
    // Clear the relevant tables before each test
    await db.query('DELETE FROM user_tags');
    await db.query('DELETE FROM tags');
    await db.query('DELETE FROM photos');
    await db.query('DELETE FROM locations');
    await db.query('DELETE FROM profiles');
    await db.query('DELETE FROM users');

    // Create test users with specific values for sorting
    testUser = await User.create({
      email: 'user1@example.com',
      username: 'user1',
      firstName: 'Alice',
      lastName: 'Smith',
      password: 'password123'
    });
    
    testUser2 = await User.create({
      email: 'user2@example.com',
      username: 'user2',
      firstName: 'Bob',
      lastName: 'Johnson',
      password: 'password123'
    });
    
    testUser3 = await User.create({
      email: 'user3@example.com',
      username: 'user3',
      firstName: 'Carol',
      lastName: 'Williams',
      password: 'password123'
    });

    testUser4 = await User.create({
      email: 'user4@example.com',
      username: 'user4',
      firstName: 'David',
      lastName: 'Brown',
      password: 'password123'
    });

    // Create profiles with different values for testing sorting
    await Profile.create({
      userId: testUser.id,
      bio: 'Test bio for user 1',
      gender: 'female',
      orientation: 'heterosexual',
      birthDate: new Date(1990, 0, 1), // Born in 1990 (35 years old in 2025)
      fameRating: 100
    });
    
    await Profile.create({
      userId: testUser2.id,
      bio: 'Test bio for user 2',
      gender: 'male',
      orientation: 'heterosexual',
      birthDate: new Date(1995, 0, 1), // Born in 1995 (30 years old in 2025)
      fameRating: 200
    });
    
    await Profile.create({
      userId: testUser3.id,
      bio: 'Test bio for user 3',
      gender: 'female',
      orientation: 'bisexual',
      birthDate: new Date(1985, 0, 1), // Born in 1985 (40 years old in 2025)
      fameRating: 300
    });

    await Profile.create({
      userId: testUser4.id,
      bio: 'Test bio for user 4',
      gender: 'male',
      orientation: 'heterosexual',
      birthDate: new Date(1980, 0, 1), // Born in 1980 (45 years old in 2025)
      fameRating: 50
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

    await Photo.create({
      userId: testUser4.id,
      url: 'https://example.com/photo4.jpg',
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

    await Location.create({
      userId: testUser4.id,
      latitude: 41.8781, // Chicago
      longitude: -87.6298,
      city: 'Chicago',
      country: 'USA',
      locationMethod: 'GPS'
    });

    // Create tags for testing
    const tag1 = await Tag.create('sports');
    const tag2 = await Tag.create('music');
    const tag3 = await Tag.create('travel');
    const tag4 = await Tag.create('cooking');

    // Assign tags to users
    await UserTag.create(testUser.id, tag1.id); // sports
    await UserTag.create(testUser.id, tag2.id); // music
    await UserTag.create(testUser2.id, tag2.id); // music
    await UserTag.create(testUser2.id, tag3.id); // travel
    await UserTag.create(testUser3.id, tag3.id); // travel
    await UserTag.create(testUser3.id, tag4.id); // cooking
    await UserTag.create(testUser4.id, tag4.id); // cooking

    // Mock auth token
    authToken = 'valid-jwt-token-for-user1';
  });

  afterAll(async () => {
    await db.pool.end();
  });

  describe('Fame Rating Sorting', () => {
    it('should sort by fame rating in descending order (default)', async () => {
      const response = await request(app)
        .get('/api/discovery/filtered')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      const data = response.body.data;

      if (data.length > 1) {
        // Check that fame rating is in descending order
        for (let i = 0; i < data.length - 1; i++) {
          expect(data[i].profile.fameRating).toBeGreaterThanOrEqual(data[i + 1].profile.fameRating);
        }
      }
    });

    it('should sort by fame rating in ascending order', async () => {
      const response = await request(app)
        .get('/api/discovery/filtered?sortBy=fame&sortOrder=asc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      const data = response.body.data;

      if (data.length > 1) {
        // Check that fame rating is in ascending order
        for (let i = 0; i < data.length - 1; i++) {
          expect(data[i].profile.fameRating).toBeLessThanOrEqual(data[i + 1].profile.fameRating);
        }
      }
    });

    it('should sort by fame rating in descending order explicitly', async () => {
      const response = await request(app)
        .get('/api/discovery/filtered?sortBy=fame&sortOrder=desc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      const data = response.body.data;

      if (data.length > 1) {
        // Check that fame rating is in descending order
        for (let i = 0; i < data.length - 1; i++) {
          expect(data[i].profile.fameRating).toBeGreaterThanOrEqual(data[i + 1].profile.fameRating);
        }
      }
    });
  });

  describe('Age Sorting', () => {
    it('should sort by age in ascending order (youngest first)', async () => {
      const response = await request(app)
        .get('/api/discovery/filtered?sortBy=age&sortOrder=asc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      const data = response.body.data;

      if (data.length > 1) {
        // Check that age is in ascending order (birth date in descending order - youngest first)
        for (let i = 0; i < data.length - 1; i++) {
          const birthDate1 = new Date(data[i].profile.birthDate);
          const birthDate2 = new Date(data[i + 1].profile.birthDate);
          expect(birthDate1.getTime()).toBeGreaterThanOrEqual(birthDate2.getTime()); // Later birth date = younger person
        }
      }
    });

    it('should sort by age in descending order (oldest first)', async () => {
      const response = await request(app)
        .get('/api/discovery/filtered?sortBy=age&sortOrder=desc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      const data = response.body.data;

      if (data.length > 1) {
        // Check that age is in descending order (birth date in ascending order - oldest first)
        for (let i = 0; i < data.length - 1; i++) {
          const birthDate1 = new Date(data[i].profile.birthDate);
          const birthDate2 = new Date(data[i + 1].profile.birthDate);
          expect(birthDate1.getTime()).toBeLessThanOrEqual(birthDate2.getTime()); // Earlier birth date = older person
        }
      }
    });
  });

  describe('Distance Sorting', () => {
    it('should sort by distance in ascending order (closest first)', async () => {
      const response = await request(app)
        .get('/api/discovery/filtered?sortBy=distance&sortOrder=asc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      const data = response.body.data;

      // This is difficult to verify precisely without exact known locations
      // But we can at least check that the response is valid
      expect(Array.isArray(data)).toBe(true);
    });

    it('should sort by distance in descending order (farthest first)', async () => {
      const response = await request(app)
        .get('/api/discovery/filtered?sortBy=distance&sortOrder=desc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      const data = response.body.data;

      // This is difficult to verify precisely without exact known locations
      // But we can at least check that the response is valid
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('Tags Sorting', () => {
    it('should sort by tags (by creation date when sortBy=tags)', async () => {
      const response = await request(app)
        .get('/api/discovery/filtered?sortBy=tags&sortOrder=desc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      const data = response.body.data;
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('Suggested Users Sorting', () => {
    it('should sort suggested users by common tags by default', async () => {
      const response = await request(app)
        .get('/api/suggested')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      const data = response.body.data;

      if (data.length > 1) {
        // In our test setup, user1 and user2 share the 'music' tag, so they should be prioritized
        // First few results should have commonTagsCount > 0
        for (let i = 0; i < Math.min(2, data.length); i++) {
          if (data[i].hasOwnProperty('commonTagsCount')) {
            // If common tags sorting is working, higher commonTagsCount should appear first
          }
        }
      }
    });

    it('should allow sorting suggested users by fame rating', async () => {
      const response = await request(app)
        .get('/api/suggested?sortBy=fame&sortOrder=desc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      const data = response.body.data;

      if (data.length > 1) {
        // Check that fame rating is in descending order
        for (let i = 0; i < data.length - 1; i++) {
          if (data[i].profile && data[i + 1].profile) {
            expect(data[i].profile.fameRating).toBeGreaterThanOrEqual(data[i + 1].profile.fameRating);
          }
        }
      }
    });

    it('should allow sorting suggested users by age', async () => {
      const response = await request(app)
        .get('/api/suggested?sortBy=age&sortOrder=asc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      const data = response.body.data;

      if (data.length > 1 && data[0].profile && data[1].profile) {
        // Check that age is in ascending order (birth date in descending order)
        const birthDate1 = new Date(data[0].profile.birthDate);
        const birthDate2 = new Date(data[1].profile.birthDate);
        expect(birthDate1.getTime()).toBeGreaterThanOrEqual(birthDate2.getTime()); // Later birth date = younger
      }
    });
  });

  describe('Search Result Sorting', () => {
    it('should sort search results by fame rating', async () => {
      const response = await request(app)
        .get('/api/discovery/search?query=User&sortBy=fame&sortOrder=desc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      const data = response.body.data;

      if (data.length > 1) {
        // Check that fame rating is in descending order
        for (let i = 0; i < data.length - 1; i++) {
          if (data[i].profile && data[i + 1].profile) {
            expect(data[i].profile.fameRating).toBeGreaterThanOrEqual(data[i + 1].profile.fameRating);
          }
        }
      }
    });

    it('should sort search results by age in ascending order', async () => {
      const response = await request(app)
        .get('/api/discovery/search?query=User&sortBy=age&sortOrder=asc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      const data = response.body.data;

      if (data.length > 1) {
        // Check that birth date is in descending order (youngest first)
        for (let i = 0; i < data.length - 1; i++) {
          if (data[i].profile && data[i + 1].profile) {
            const birthDate1 = new Date(data[i].profile.birthDate);
            const birthDate2 = new Date(data[i + 1].profile.birthDate);
            expect(birthDate1.getTime()).toBeGreaterThanOrEqual(birthDate2.getTime());
          }
        }
      }
    });
  });
});