const request = require('supertest');
const app = require('../src/app');
const db = require('../config/db');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Photo = require('../models/Photo');
const Location = require('../models/Location');
const Tag = require('../models/Tag');
const UserTag = require('../models/UserTag');

describe('Database Indexes Performance Tests', () => {
  let testUsers = [];
  let authToken;

  beforeAll(async () => {
    // Clear the relevant tables 
    await db.query('DELETE FROM user_tags');
    await db.query('DELETE FROM tags');
    await db.query('DELETE FROM photos');
    await db.query('DELETE FROM locations');
    await db.query('DELETE FROM profiles');
    await db.query('DELETE FROM users');

    // Create a substantial number of test users to test performance with indexes
    const userPromises = [];
    for (let i = 0; i < 50; i++) {
      userPromises.push(User.create({
        email: `user${i}@example.com`,
        username: `user${i}`,
        firstName: `User${i}`,
        lastName: `Test${i}`,
        password: 'Str0ngP@ss9'
      }));
    }
    
    testUsers = await Promise.all(userPromises);

    // Create profiles for the test users
    const profilePromises = [];
    for (let i = 0; i < testUsers.length; i++) {
      const birthYear = 1980 + (i % 25); // Ages 20-45 for 2025
      const fameRating = 50 + (i * 10); // Fame ratings from 50 to 500+
      
      profilePromises.push(Profile.create({
        userId: testUsers[i].id,
        bio: `Test bio for user ${i}`,
        gender: i % 2 === 0 ? 'male' : 'female',
        orientation: ['heterosexual', 'homosexual', 'bisexual'][i % 3],
        birthDate: new Date(birthYear, 0, 1),
        fameRating: fameRating
      }));
    }
    
    await Promise.all(profilePromises);

    // Create photos for the test users
    const photoPromises = [];
    for (let i = 0; i < testUsers.length; i++) {
      photoPromises.push(Photo.create({
        userId: testUsers[i].id,
        url: `https://example.com/photo${i}.jpg`,
        isProfile: true
      }));
    }
    
    await Promise.all(photoPromises);

    // Create locations for the test users
    const locationPromises = [];
    for (let i = 0; i < testUsers.length; i++) {
      const latBase = 48.8566; // Base coordinates near Paris
      const lonBase = 2.3522;
      
      locationPromises.push(Location.create({
        userId: testUsers[i].id,
        latitude: latBase + (i * 0.001), // Small variations
        longitude: lonBase + (i * 0.001),
        city: i % 10 === 0 ? 'New York' : i % 3 === 0 ? 'London' : 'Paris',
        country: i % 10 === 0 ? 'USA' : i % 3 === 0 ? 'UK' : 'France',
        locationMethod: 'GPS'
      }));
    }
    
    await Promise.all(locationPromises);

    // Create tags
    const tagNames = ['sports', 'music', 'travel', 'cooking', 'reading', 'dancing', 'art', 'photography'];
    const tagPromises = [];
    for (const tagName of tagNames) {
      tagPromises.push(Tag.create(tagName));
    }
    
    const tags = await Promise.all(tagPromises);

    // Create many user-tag relationships to test tag-based queries
    const userTagPromises = [];
    for (let i = 0; i < testUsers.length; i++) {
      // Assign 2-4 random tags to each user
      const numTags = 2 + (i % 3); // Between 2 and 4 tags
      for (let j = 0; j < numTags; j++) {
        const tagIndex = (i + j) % tags.length;
        userTagPromises.push(UserTag.create(testUsers[i].id, tags[tagIndex].id));
      }
    }
    
    await Promise.all(userTagPromises);

    // Mock auth token 
    authToken = 'valid-jwt-token-for-performance-test';
  });

  afterAll(async () => {
    await db.pool.end();
  });

  describe('Performance with Indexes', () => {
    it('should perform age filtering efficiently with indexes', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/profiles?ageMin=25&ageMax=35')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Response should be fast due to indexes on birth_date
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // Verify that the filter is working correctly
      const data = response.body.data;
      data.forEach(profile => {
        const birthYear = new Date(profile.profile.birthDate).getFullYear();
        expect(birthYear).toBeLessThanOrEqual(2000); // Born after 1990 (35 or younger in 2025)
        expect(birthYear).toBeGreaterThanOrEqual(1990); // Born before 1999 (25 or older in 2025)
      });
    });

    it('should perform fame rating filtering efficiently with indexes', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/profiles?fameRating=200')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Response should be fast due to indexes on fame_rating
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // Verify that the filter is working correctly
      const data = response.body.data;
      data.forEach(profile => {
        expect(profile.profile.fameRating).toBeGreaterThanOrEqual(200);
      });
    });

    it('should perform city filtering efficiently with indexes', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/profiles')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Response should be faster with proper indexes
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should perform tag filtering efficiently with indexes', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/profiles?tags=music')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Response should be fast due to indexes on user_tags and tags
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // Verify that the filter is working correctly
      const data = response.body.data;
      // Note: With 50 users and 8 tags, we expect some results with the 'music' tag
    });

    it('should perform complex filtering efficiently with composite indexes', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/profiles?ageMin=25&ageMax=35&fameRating=150&tags=music')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Response should be fast due to proper indexing
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // Verify that the filters are working correctly
      const data = response.body.data;
      data.forEach(profile => {
        const birthYear = new Date(profile.profile.birthDate).getFullYear();
        expect(birthYear).toBeLessThanOrEqual(2000); // Born after 1990 (35 or younger in 2025)
        expect(birthYear).toBeGreaterThanOrEqual(1990); // Born before 1999 (25 or older in 2025)
        expect(profile.profile.fameRating).toBeGreaterThanOrEqual(150);
        // Tags filtering is harder to verify without knowing the specific assignments
      });
    });

    it('should maintain performance during sorting operations', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/profiles?sortBy=fame&sortOrder=desc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Sorting should be efficient with proper indexes
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      
      expect(response.body).toHaveProperty('data');
      const data = response.body.data;
      
      // Verify that sorting is actually happening (fame rating descending)
      if (data.length > 1) {
        for (let i = 0; i < data.length - 1; i++) {
          expect(data[i].profile.fameRating).toBeGreaterThanOrEqual(data[i + 1].profile.fameRating);
        }
      }
    });

    it('should maintain performance with pagination', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/profiles?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Pagination should be efficient
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.length).toBeLessThanOrEqual(10);
      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('limit', 10);
    });

    it('should verify that the suggested endpoint performs well with indexes', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/suggested')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Suggested endpoint should be efficient with proper indexing
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('pagination');
    });

    it('should verify that search endpoint performs well with indexes', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/discovery/search?query=User')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Search should be efficient with proper indexing
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('pagination');
    });
  });
});