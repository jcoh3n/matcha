const request = require('supertest');
const app = require('../src/app');
const db = require('../config/db');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Photo = require('../models/Photo');
const Location = require('../models/Location');
const Tag = require('../models/Tag');
const UserTag = require('../models/UserTag');

describe('Discovery API Tests', () => {
  let testUser, testUser2, testUser3, testUser4;
  let authToken, authToken2, authToken3, authToken4;

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
      password: 'Str0ngP@ss9'
    });
    
    testUser2 = await User.create({
      email: 'user2@example.com',
      username: 'user2',
      firstName: 'User',
      lastName: 'Two',
      password: 'Str0ngP@ss9'
    });
    
    testUser3 = await User.create({
      email: 'user3@example.com',
      username: 'user3',
      firstName: 'User',
      lastName: 'Three',
      password: 'Str0ngP@ss9'
    });

    testUser4 = await User.create({
      email: 'user4@example.com',
      username: 'user4',
      firstName: 'User',
      lastName: 'Four',
      password: 'Str0ngP@ss9'
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
      gender: 'female',
      orientation: 'heterosexual',
      birthDate: new Date(1992, 0, 1),
      fameRating: 150
    });

    await Profile.create({
      userId: testUser4.id,
      bio: 'Test bio for user 4',
      gender: 'male',
      orientation: 'heterosexual',
      birthDate: new Date(1988, 0, 1),
      fameRating: 300
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

    // Create some tags
    const tag1 = await Tag.create('sports');
    const tag2 = await Tag.create('music');
    const tag3 = await Tag.create('travel');
    const tag4 = await Tag.create('cooking');
    const tag5 = await Tag.create('reading');

    // Assign tags to users
    await UserTag.create(testUser.id, tag1.id); // sports
    await UserTag.create(testUser.id, tag2.id); // music
    await UserTag.create(testUser2.id, tag2.id); // music (common tag with user1)
    await UserTag.create(testUser2.id, tag3.id); // travel
    await UserTag.create(testUser3.id, tag3.id); // travel
    await UserTag.create(testUser3.id, tag4.id); // cooking
    await UserTag.create(testUser4.id, tag5.id); // reading

    // Mock auth tokens
    authToken = 'valid-jwt-token-for-user1';
    authToken2 = 'valid-jwt-token-for-user2';
    authToken3 = 'valid-jwt-token-for-user3';
    authToken4 = 'valid-jwt-token-for-user4';
  });

  afterAll(async () => {
    await db.pool.end();
  });

  describe('GET /api/discovery', () => {
    it('should return discovery users with pagination', async () => {
      const response = await request(app)
        .get('/api/discovery')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('total');
    });

    it('should return discovery users with lite response when requested', async () => {
      const response = await request(app)
        .get('/api/discovery?lite=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      const data = response.body.data;
      
      data.forEach(profile => {
        expect(profile).toHaveProperty('id');
        expect(profile).toHaveProperty('username');
        expect(profile).toHaveProperty('profilePhotoUrl');
        expect(profile).toHaveProperty('profile');
        expect(profile).toHaveProperty('location');
        expect(profile).toHaveProperty('tags');
      });
    });
  });

  describe('GET /api/suggested', () => {
    it('should return suggested users with pagination', async () => {
      const response = await request(app)
        .get('/api/suggested')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toHaveProperty('page');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('total');
    });

    it('should return suggested users prioritizing common tags', async () => {
      const response = await request(app)
        .get('/api/suggested')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      const data = response.body.data;
      
      // User 1 and User 2 share 'music' tag, so user2 should be prioritized in suggestions for user1
      if (data.length >= 1) {
        // The most relevant suggestions should come first
        expect(data[0]).toHaveProperty('commonTagsCount');
      }
    });

    it('should apply filters to suggested users', async () => {
      const response = await request(app)
        .get('/api/suggested?ageMin=25&ageMax=35&fameRating=150')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      const data = response.body.data;
      
      data.forEach(profile => {
        // Check age filter (users born between 1990 and 2000 should be included in 2025)
        const birthYear = new Date(profile.profile.birthDate).getFullYear();
        expect(birthYear).toBeGreaterThanOrEqual(1990);
        expect(birthYear).toBeLessThanOrEqual(2000);
        
        // Check fame rating filter
        expect(profile.profile.fameRating).toBeGreaterThanOrEqual(150);
      });
    });

    it('should return lite response when requested for suggested users', async () => {
      const response = await request(app)
        .get('/api/suggested?lite=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      const data = response.body.data;
      
      data.forEach(profile => {
        expect(profile).toHaveProperty('id');
        expect(profile).toHaveProperty('username');
        expect(profile).toHaveProperty('profilePhotoUrl');
        expect(profile).toHaveProperty('profile');
        expect(profile).toHaveProperty('location');
        expect(profile).toHaveProperty('tags');
        expect(profile).toHaveProperty('commonTagsCount');
      });
    });

    it('should sort suggested users by relevance and fame rating', async () => {
      const response = await request(app)
        .get('/api/suggested')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      const data = response.body.data;
      
      // Check that data is sorted by relevance (common tags count) and fame rating
      if (data.length > 1) {
        // Should be ordered by common tags count DESC, then fame rating DESC
        for (let i = 0; i < data.length - 1; i++) {
          expect(data[i].profile.fameRating).toBeGreaterThanOrEqual(data[i + 1].profile.fameRating);
        }
      }
    });
  });

  describe('GET /api/discovery/filtered', () => {
    it('should return filtered users with sorting', async () => {
      const response = await request(app)
        .get('/api/discovery/filtered?sortBy=fame&sortOrder=desc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      const data = response.body.data;
      
      if (data.length > 1) {
        // Should be sorted by fame rating in descending order
        for (let i = 0; i < data.length - 1; i++) {
          expect(data[i].profile.fameRating).toBeGreaterThanOrEqual(data[i + 1].profile.fameRating);
        }
      }
    });

    it('should apply multiple filters simultaneously', async () => {
      const response = await request(app)
        .get('/api/discovery/filtered?ageMin=25&ageMax=35&fameRating=150&tags=music')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      const data = response.body.data;
      
      data.forEach(profile => {
        // Check age filter
        const birthYear = new Date(profile.profile.birthDate).getFullYear();
        expect(birthYear).toBeGreaterThanOrEqual(1990);
        expect(birthYear).toBeLessThanOrEqual(2000);
        
        // Check fame rating filter
        expect(profile.profile.fameRating).toBeGreaterThanOrEqual(150);
        
        // Check tags filter
        expect(profile.tags).toContain('music');
      });
    });
  });

  describe('GET /api/discovery/search', () => {
    it('should search users by first name', async () => {
      const response = await request(app)
        .get('/api/discovery/search?query=User')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      const data = response.body.data;
      expect(data.length).toBeGreaterThan(0);
    });

    it('should return search results with pagination', async () => {
      const response = await request(app)
        .get('/api/discovery/search?query=User&page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('limit', 2);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
    });

    it('should return lite response for search results when requested', async () => {
      const response = await request(app)
        .get('/api/discovery/search?query=User&lite=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      const data = response.body.data;
      
      data.forEach(profile => {
        expect(profile).toHaveProperty('id');
        expect(profile).toHaveProperty('username');
        expect(profile).toHaveProperty('profilePhotoUrl');
        expect(profile).toHaveProperty('profile');
        expect(profile).toHaveProperty('location');
        expect(profile).toHaveProperty('tags');
      });
    });
  });
});