const Profile = require('../models/Profile');
const Tag = require('../models/Tag');
const UserTag = require('../models/UserTag');
const Photo = require('../models/Photo');
const Location = require('../models/Location');

// Get current user profile
const getProfile = async (req, res) => {
  try {
    // req.user is added by the authJWT middleware
    const userId = req.user.id;
    
    // Get user profile
    const profile = await Profile.findByUserId(userId);
    
    // Get user tags
    const tags = await UserTag.findTagsByUserId(userId);
    
    // Get user photos
    const photos = await Photo.findByUserId(userId);
    
    // Get user location
    const location = await Location.findByUserId(userId);
    
    // Combine all profile data
    const profileData = {
      ...req.user.toJSON(),
      profile: profile ? profile.toJSON() : null,
      tags,
      photos,
      location: location ? location.toJSON() : null
    };
    
    res.json(profileData);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update current user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bio, gender, orientation, birthDate } = req.body;
    
    // Validate input
    if (!bio || !gender || !orientation || !birthDate) {
      return res.status(400).json({ 
        message: 'Missing required fields: bio, gender, orientation, birthDate' 
      });
    }
    
    // Check if profile already exists
    let profile = await Profile.findByUserId(userId);
    
    if (profile) {
      // Update existing profile
      profile = await Profile.update(userId, { bio, gender, orientation, birthDate });
    } else {
      // Create new profile
      profile = await Profile.create({ userId, bio, gender, orientation, birthDate });
    }
    
    res.json(profile.toJSON());
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all tags
const getAllTags = async (req, res) => {
  try {
    const tags = await Tag.findAll();
    res.json(tags.map(tag => tag.toJSON()));
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Add tags to user
const addUserTags = async (req, res) => {
  try {
    const userId = req.user.id;
    const { tags } = req.body;
    
    if (!Array.isArray(tags)) {
      return res.status(400).json({ message: 'Tags must be an array' });
    }
    
    // Delete existing tags for user
    await UserTag.deleteAllByUserId(userId);
    
    // Add new tags
    for (const tagName of tags) {
      // Create tag if it doesn't exist
      let tag = await Tag.findByName(tagName);
      if (!tag) {
        tag = await Tag.create(tagName);
      }
      
      // Create user-tag relationship
      await UserTag.create(userId, tag.id);
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error adding user tags:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user tags
const getUserTags = async (req, res) => {
  try {
    const userId = req.user.id;
    const tags = await UserTag.findTagsByUserId(userId);
    res.json(tags);
  } catch (error) {
    console.error('Error fetching user tags:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Add photo
const addPhoto = async (req, res) => {
  try {
    const userId = req.user.id;
    const { url, isProfile } = req.body;
    
    if (!url) {
      return res.status(400).json({ message: 'URL is required' });
    }
    
    const photo = await Photo.create({ userId, url, isProfile });
    res.status(201).json(photo.toJSON());
  } catch (error) {
    console.error('Error adding photo:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Set photo as profile photo
const setProfilePhoto = async (req, res) => {
  try {
    const userId = req.user.id;
    const { photoId } = req.params;
    
    const photo = await Photo.setAsProfilePhoto(photoId, userId);
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }
    
    res.json(photo.toJSON());
  } catch (error) {
    console.error('Error setting profile photo:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete photo
const deletePhoto = async (req, res) => {
  try {
    const userId = req.user.id;
    const { photoId } = req.params;
    
    const deleted = await Photo.delete(photoId, userId);
    if (!deleted) {
      return res.status(404).json({ message: 'Photo not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update location
const updateLocation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { latitude, longitude, city, country, method } = req.body;
    
    if (!latitude || !longitude || !method) {
      return res.status(400).json({ 
        message: 'Missing required fields: latitude, longitude, method' 
      });
    }
    
    const location = await Location.create({ 
      userId, 
      latitude, 
      longitude, 
      city, 
      country, 
      locationMethod: method 
    });
    
    res.json(location.toJSON());
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAllTags,
  addUserTags,
  getUserTags,
  addPhoto,
  setProfilePhoto,
  deletePhoto,
  updateLocation
};