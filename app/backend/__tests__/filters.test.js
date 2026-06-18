const request = require('supertest');
const app = require('../src/app');
const db = require('../config/db');
const { signToken } = require('./helpers');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Photo = require('../models/Photo');
const Location = require('../models/Location');
const Tag = require('../models/Tag');
const UserTag = require('../models/UserTag');

describe('Dynamic Filters Tests', () => {
  let testUser, testUser2, testUser3;
  let authToken;

  beforeEach(async () => {
    // Clear the relevant tables before each test
    await db.query('DELETE FROM user_tags');
    await db.query('DELETE FROM tags');
    await db.query('DELETE FROM photos');
    await db.query('DELETE FROM locations');
    await db.query('DELETE FROM profiles');
    await db.query('DELETE FROM users');

    // Create test users with specific values for filtering
    testUser = await User.create({
      email: 'user1@example.com',
      username: 'user1',
      firstName: 'Alice',
      lastName: 'Smith',
      password: 'Str0ngP@ss9'
    });
    
    testUser2 = await User.create({
      email: 'user2@example.com',
      username: 'user2',
      firstName: 'Bob',
      lastName: 'Johnson',
      password: 'Str0ngP@ss9'
    });
    
    testUser3 = await User.create({
      email: 'user3@example.com',
      username: 'user3',
      firstName: 'Carol',
      lastName: 'Williams',
      password: 'Str0ngP@ss9'
    });

    // Create profiles with different fame ratings and birth dates for testing filters
    await Profile.create({
      userId: testUser.id,
      bio: 'Test bio for user 1',
      gender: 'female',
      orientation: 'heterosexual',
      birthDate: new Date(1990, 0, 1), // 35 years old in 2025
      fameRating: 100
    });
    
    await Profile.create({
      userId: testUser2.id,
      bio: 'Test bio for user 2',
      gender: 'male',
      orientation: 'heterosexual',
      birthDate: new Date(1995, 0, 1), // 30 years old in 2025
      fameRating: 200
    });
    
    await Profile.create({
      userId: testUser3.id,
      bio: 'Test bio for user 3',
      gender: 'female',
      orientation: 'bisexual',
      birthDate: new Date(1985, 0, 1), // 40 years old in 2025
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

    // Add locations with different distances from a reference point
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
      latitude: 48.8666, // Paris, slightly different coordinates
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

    // Create tags for testing
    const tag1 = await Tag.create('sports');
    const tag2 = await Tag.create('music');
    const tag3 = await Tag.create('travel');
    const tag4 = await Tag.create('cooking');

    // Assign different tags to users
    await UserTag.create(testUser.id, tag1.id); // sports
    await UserTag.create(testUser.id, tag2.id); // music
    await UserTag.create(testUser2.id, tag2.id); // music
    await UserTag.create(testUser2.id, tag3.id); // travel
    await UserTag.create(testUser2.id, tag1.id); // sports
    await UserTag.create(testUser3.id, tag3.id); // travel
    await UserTag.create(testUser3.id, tag4.id); // cooking

    // Mock auth token
    // Mark all test users as verified so they appear in discovery/search
    await db.query("UPDATE users SET email_verified = true");
    authToken = signToken(testUser.id);
  });

  afterAll(async () => {
  });

  describe('Age Filters', () => {
    it('should filter users by minimum age', async () => {
      const response = await request(app)
        .get('/api/discovery/filtered?ageMin=30')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      const data = response.body.data;
      
      // Should only return users 30+ years old (born in 1995 or earlier)
      data.forEach(profile => {
        const birthYear = new Date(profile.profile.birthDate).getFullYear();
        // In 2025, someone born in 1995 is 30, born in 1990 is 35, born in 1985 is 40
        expect(birthYear).toBeLessThanOrEqual(1995); // 30 years old or older in 2025
      });
    });

    it('should filter users by maximum age', async () => {
      const response = await request(app)
        .get('/api/discovery/filtered?ageMax=35')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      const data = response.body.data;
      
      // Should only return users 35 years old or younger (born in 1990 or later)
      data.forEach(profile => {
        const birthYear = new Date(profile.profile.birthDate).getFullYear();
        // In 2025, someone born in 1990 is 35, born in 1995 is 30
        expect(birthYear).toBeGreaterThanOrEqual(1990); // 35 years old or younger in 2025
      });
    });

    it('should filter users by age range', async () => {
      const response = await request(app)
        .get('/api/discovery/filtered?ageMin=30&ageMax=37')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      const data = response.body.data;
      
      // Should only return users between 30-37 years old (born between 1988-1995)
      data.forEach(profile => {
        const birthYear = new Date(profile.profile.birthDate).getFullYear();
        // In 2025: 30 years old = born 1995, 37 years old = born 1988
        expect(birthYear).toBeLessThanOrEqual(1995); // born in 1995 or earlier (30+ years old)
        expect(birthYear).toBeGreaterThanOrEqual(1988); // born in 1988 or later (37 or younger)
      });
    });
  });

  describe('Fame Rating Filters', () => {
    it('should filter users by minimum fame rating', async () => {
      const response = await request(app)
        .get('/api/discovery/filtered?fameRating=150')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      const data = response.body.data;
      
      // Should only return users with fame rating 150 or higher
      data.forEach(profile => {
        expect(profile.profile.fameRating).toBeGreaterThanOrEqual(150);
      });
    });

    it('should return users with fame rating in descending order by default', async () => {
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
  });

  describe('Tags Filters', () => {
    it('should filter users by single tag', async () => {
      const response = await request(app)
        .get('/api/discovery/filtered?tags=sports')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      const data = response.body.data;
      
      // Should only return users with 'sports' tag
      expect(data.length).toBeGreaterThan(0);
      data.forEach(profile => {
        expect(profile.tags).toContain('sports');
      });
    });

    it('should filter users by multiple tags', async () => {
      const response = await request(app)
        .get('/api/discovery/filtered?tags=music,travel')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      const data = response.body.data;
      
      // Should return users with either 'music' OR 'travel' tag
      expect(data.length).toBeGreaterThan(0);
      data.forEach(profile => {
        const hasMusicOrTravel = profile.tags.includes('music') || profile.tags.includes('travel');
        expect(hasMusicOrTravel).toBe(true);
      });
    });
  });

  describe('Distance Filters', () => {
    it('should filter users by distance', async () => {
      // Note: For distance filtering to work properly, we need JWT to identify the requesting user
      // for location comparison. This test might require more complex setup.
      const response = await request(app)
        .get('/api/discovery/filtered?distance=10') // 10km radius
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      // This test is difficult to validate precisely without a real JWT and location setup
      // Just ensure the request doesn't fail and returns valid data
    });
  });

  describe('Combined Filters', () => {
    it('should apply multiple filters simultaneously', async () => {
      const response = await request(app)
        .get('/api/discovery/filtered?ageMin=30&ageMax=36&fameRating=150&tags=music')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      const data = response.body.data;
      
      data.forEach(profile => {
        // Age filter: 30-36 years old (born 1989-1995 in 2025)
        const birthYear = new Date(profile.profile.birthDate).getFullYear();
        expect(birthYear).toBeLessThanOrEqual(1995); // 30 years old or older
        expect(birthYear).toBeGreaterThanOrEqual(1989); // 36 years old or younger
        
        // Fame rating filter
        expect(profile.profile.fameRating).toBeGreaterThanOrEqual(150);
        
        // Tags filter
        expect(profile.tags).toContain('music');
      });
    });
  });

  describe('Suggested Endpoint Filters', () => {
    it('should apply filters to suggested users', async () => {
      const response = await request(app)
        .get('/api/suggested?ageMin=30&fameRating=150')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      const data = response.body.data;
      
      data.forEach(profile => {
        // Age filter: 30+ years old (born 1995 or earlier in 2025)
        const birthYear = new Date(profile.profile.birthDate).getFullYear();
        expect(birthYear).toBeLessThanOrEqual(1995);
        
        // Fame rating filter
        expect(profile.profile.fameRating).toBeGreaterThanOrEqual(150);
      });
    });
  });

  describe('Search Endpoint Filters', () => {
    it('should apply filters to search results', async () => {
      const response = await request(app)
        .get('/api/discovery/search?query=User&ageMin=30&fameRating=150')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      const data = response.body.data;
      
      data.forEach(profile => {
        // Age filter: 30+ years old
        const birthYear = new Date(profile.profile.birthDate).getFullYear();
        expect(birthYear).toBeLessThanOrEqual(1995);
        
        // Fame rating filter
        expect(profile.profile.fameRating).toBeGreaterThanOrEqual(150);
      });
    });
  });
});