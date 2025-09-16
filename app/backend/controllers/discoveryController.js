const User = require('../models/User');
const Profile = require('../models/Profile');
const Photo = require('../models/Photo');
const Location = require('../models/Location');
const db = require('../config/db');

// Helper function to calculate distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg) => {
  return deg * (Math.PI/180);
};

// Get users for discovery/search
const getDiscoveryUsers = async (req, res) => {
  try {
    // Get query parameters
    const { limit = 20, offset = 0 } = req.query;
    
    // Log the current user
    console.log('Current user:', req.user);
    
    // Query to get users with their profiles, photos, and locations
    const query = `
      SELECT 
        u.id,
        u.email,
        u.username,
        u.first_name,
        u.last_name,
        u.created_at,
        u.updated_at,
        p.birth_date,
        p.gender,
        p.sexual_orientation,
        p.bio,
        p.fame_rating,
        p.is_verified,
        p.last_active,
        ph.url as profile_photo_url,
        l.latitude,
        l.longitude,
        l.city,
        l.country
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN photos ph ON u.id = ph.user_id AND ph.is_profile = true
      LEFT JOIN locations l ON u.id = l.user_id
      WHERE u.email_verified = true AND u.id != $3
      ORDER BY p.fame_rating DESC, u.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await db.query(query, [parseInt(limit), parseInt(offset), req.user.id]);
    
    // Log the number of users found
    console.log(`Found ${result.rows.length} users for discovery (excluding current user)`);
    
    // Transform the data to match the frontend's expected format
    const users = result.rows.map(row => ({
      id: row.id,
      email: row.email,
      username: row.username,
      firstName: row.first_name,
      lastName: row.last_name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      profile: {
        birthDate: row.birth_date,
        gender: row.gender,
        orientation: row.sexual_orientation,
        bio: row.bio,
        fameRating: row.fame_rating,
        isVerified: row.is_verified,
        lastActive: row.last_active
      },
      profilePhotoUrl: row.profile_photo_url,
      location: {
        latitude: row.latitude,
        longitude: row.longitude,
        city: row.city,
        country: row.country
      }
    }));
    
    // Log the transformed users
    console.log('Transformed users:', users);
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching discovery users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get a random set of users for discovery
const getRandomUsers = async (req, res) => {
  try {
    // Get query parameters
    const { limit = 9 } = req.query;
    
    // Log the current user
    console.log('Current user (random):', req.user);
    
    // Get current user's location
    const currentUserLocation = await Location.findByUserId(req.user.id);
    
    // Query to get random users with their profiles, photos, and locations
    const query = `
      SELECT 
        u.id,
        u.email,
        u.username,
        u.first_name,
        u.last_name,
        u.created_at,
        u.updated_at,
        p.birth_date,
        p.gender,
        p.sexual_orientation,
        p.bio,
        p.fame_rating,
        p.is_verified,
        p.last_active,
        ph.url as profile_photo_url,
        l.latitude,
        l.longitude,
        l.city,
        l.country
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN photos ph ON u.id = ph.user_id AND ph.is_profile = true
      LEFT JOIN locations l ON u.id = l.user_id
      WHERE u.email_verified = true AND u.id != $2
      ORDER BY RANDOM()
      LIMIT $1
    `;
    
    const result = await db.query(query, [parseInt(limit), req.user.id]);
    
    // Log the number of users found
    console.log(`Found ${result.rows.length} random users for discovery (excluding current user)`);
    
    // Transform the data to match the frontend's expected format
    const users = result.rows.map(row => {
      // Calculate distance if both users have locations
      let distance = null;
      if (currentUserLocation && row.latitude && row.longitude) {
        distance = calculateDistance(
          parseFloat(currentUserLocation.latitude),
          parseFloat(currentUserLocation.longitude),
          parseFloat(row.latitude),
          parseFloat(row.longitude)
        );
        // Round to nearest integer
        distance = Math.round(distance);
      }
      
      return {
        id: row.id,
        email: row.email,
        username: row.username,
        firstName: row.first_name,
        lastName: row.last_name,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        profile: {
          birthDate: row.birth_date,
          gender: row.gender,
          orientation: row.sexual_orientation,
          bio: row.bio,
          fameRating: row.fame_rating,
          isVerified: row.is_verified,
          lastActive: row.last_active
        },
        profilePhotoUrl: row.profile_photo_url,
        location: {
          latitude: row.latitude,
          longitude: row.longitude,
          city: row.city,
          country: row.country
        },
        distance: distance
      }
    });
    
    // Log the transformed users
    console.log('Transformed random users:', users);
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching random users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Search users by name
const searchUsers = async (req, res) => {
  try {
    const { query: searchQuery, limit = 20, offset = 0 } = req.query;
    
    if (!searchQuery) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }
    
    // Log the current user
    console.log('Current user (search):', req.user);
    
    // Query to search users by first name or last name
    const query = `
      SELECT 
        u.id,
        u.email,
        u.username,
        u.first_name,
        u.last_name,
        u.created_at,
        u.updated_at,
        p.birth_date,
        p.gender,
        p.sexual_orientation,
        p.bio,
        p.fame_rating,
        p.is_verified,
        p.last_active,
        ph.url as profile_photo_url,
        l.latitude,
        l.longitude,
        l.city,
        l.country
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN photos ph ON u.id = ph.user_id AND ph.is_profile = true
      LEFT JOIN locations l ON u.id = l.user_id
      WHERE u.email_verified = true
        AND (u.first_name ILIKE $3 OR u.last_name ILIKE $3)
        AND u.id != $4
      ORDER BY p.fame_rating DESC, u.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await db.query(query, [parseInt(limit), parseInt(offset), `%${searchQuery}%`, req.user.id]);
    
    // Log the number of users found
    console.log(`Found ${result.rows.length} users for search (excluding current user)`);
    
    // Transform the data to match the frontend's expected format
    const users = result.rows.map(row => ({
      id: row.id,
      email: row.email,
      username: row.username,
      firstName: row.first_name,
      lastName: row.last_name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      profile: {
        birthDate: row.birth_date,
        gender: row.gender,
        orientation: row.sexual_orientation,
        bio: row.bio,
        fameRating: row.fame_rating,
        isVerified: row.is_verified,
        lastActive: row.last_active
      },
      profilePhotoUrl: row.profile_photo_url,
      location: {
        latitude: row.latitude,
        longitude: row.longitude,
        city: row.city,
        country: row.country
      }
    }));
    
    // Log the transformed users
    console.log('Transformed search users:', users);
    
    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getDiscoveryUsers,
  getRandomUsers,
  searchUsers
};