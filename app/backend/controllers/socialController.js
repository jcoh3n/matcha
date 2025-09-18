const User = require('../models/User');
const Profile = require('../models/Profile');
const Photo = require('../models/Photo');
const Location = require('../models/Location');
const UserTag = require('../models/UserTag');
const Like = require('../models/Like');
const Block = require('../models/Block');
const Report = require('../models/Report');
const ProfileView = require('../models/ProfileView');
const { createAndSendNotification } = require('../utils/notificationHandler');

// Helper function to calculate age from birth date
const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

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

// Get public profile by ID
const getPublicProfile = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const profileUserId = parseInt(req.params.id);
    
    // Check if user is trying to view their own profile
    if (currentUserId === profileUserId) {
      return res.status(400).json({ message: 'Cannot view your own profile' });
    }
    
    // Check if the profile user exists
    const profileUser = await User.findById(profileUserId);
    if (!profileUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if current user is blocked by the profile user
    const isBlocked = await Block.exists(profileUserId, currentUserId);
    if (isBlocked) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Get user profile
    const profile = await Profile.findByUserId(profileUserId);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    // Get user tags
    const tags = await UserTag.findTagsByUserId(profileUserId);
    
    // Get user photos
    const photos = await Photo.findByUserId(profileUserId);
    
    // Get user location
    const location = await Location.findByUserId(profileUserId);
    
    // Get current user location
    const currentUserLocation = await Location.findByUserId(currentUserId);
    
    // Calculate distance if both users have locations
    let distance = null;
    if (location && currentUserLocation) {
      distance = calculateDistance(
        parseFloat(currentUserLocation.latitude),
        parseFloat(currentUserLocation.longitude),
        parseFloat(location.latitude),
        parseFloat(location.longitude)
      );
      // Round to nearest integer
      distance = Math.round(distance);
    }
    
    // Check relationship status
    const isLiked = await Like.exists(currentUserId, profileUserId);
    const isLikedByUser = await Like.exists(profileUserId, currentUserId);
    const isMatch = isLiked && isLikedByUser;
    
    // Check if user is blocked
    const isBlockedByCurrentUser = await Block.exists(currentUserId, profileUserId);
    
    // Create profile view record
    await ProfileView.create({
      viewerId: currentUserId,
      viewedUserId: profileUserId
    });
    
    // Send notification to the profile owner about the visit
    // Only send if the viewer is not the profile owner (should always be true here)
    // and if they're not blocked
    if (currentUserId !== profileUserId && !isBlocked) {
      // Get the viewer's profile for the notification content
      const viewerProfile = await Profile.findByUserId(currentUserId);
      const viewerUser = await User.findById(currentUserId);
      
      if (viewerProfile && viewerUser) {
        const notificationContent = `${viewerUser.firstName} ${viewerUser.lastName} visited your profile`;
        
        // We'll implement the io object passing later
        // For now, we'll just create the notification in the database
        await createAndSendNotification(global.io, {
          userId: profileUserId,
          fromUserId: currentUserId,
          type: 'VISIT',
          content: notificationContent
        });
      }
    }
    
    // Get profile view count
    const viewsCount = await ProfileView.findByViewedUserId(profileUserId);
    
    // Get liked count
    const likedCount = await Like.findLikesForUser(profileUserId);
    
    // Combine all profile data
    const profileData = {
      id: profileUser.id,
      username: profileUser.username,
      firstName: profileUser.firstName,
      lastName: profileUser.lastName,
      age: profile.birthDate ? calculateAge(profile.birthDate) : null,
      bio: profile.bio,
      tags,
      photos,
      fameRating: profile.fameRating,
      distance,
      location: location ? {
        city: location.city,
        country: location.country
      } : null,
      viewsCount: viewsCount.length,
      likedCount: likedCount.length,
      isOnline: false, // Will be implemented later
      lastSeen: profileUser.updatedAt, // Will be improved later
      isLiked,
      isLikedByUser,
      isMatch,
      isBlocked: isBlockedByCurrentUser
    };
    
    res.json(profileData);
  } catch (error) {
    console.error('Error fetching public profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Like a user
const likeUser = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const likedUserId = parseInt(req.params.id);
    
    // Check if user is trying to like themselves
    if (currentUserId === likedUserId) {
      return res.status(400).json({ message: 'Cannot like yourself' });
    }
    
    // Check if the liked user exists
    const likedUser = await User.findById(likedUserId);
    if (!likedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if current user has a profile photo
    const profilePhoto = await Photo.findProfilePhotoByUserId(currentUserId);
    if (!profilePhoto) {
      return res.status(400).json({ message: 'You must have a profile photo to like other users' });
    }
    
    // Check if current user is blocked by the liked user
    const isBlocked = await Block.exists(likedUserId, currentUserId);
    if (isBlocked) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Create the like
    const like = await Like.create({
      userId: currentUserId,
      likedUserId
    });
    
    // Send notification to the liked user
    // Only send if the liker is not the liked user (should always be true here)
    // and if they're not blocked
    if (currentUserId !== likedUserId && !isBlocked) {
      // Get the liker's profile for the notification content
      const likerUser = await User.findById(currentUserId);
      
      if (likerUser) {
        const notificationContent = isMatch 
          ? `${likerUser.firstName} ${likerUser.lastName} liked you back! It's a match!`
          : `${likerUser.firstName} ${likerUser.lastName} liked your profile`;
        
        const notificationType = isMatch ? 'MATCH' : 'LIKE';
        
        // Send notification
        await createAndSendNotification(global.io, {
          userId: likedUserId,
          fromUserId: currentUserId,
          type: notificationType,
          content: notificationContent
        });
      }
    }
    
    // Return relationship status
    res.json({
      isLiked: true,
      isMatch,
      message: isMatch ? 'It\'s a match!' : 'User liked successfully'
    });
  } catch (error) {
    console.error('Error liking user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Unlike a user
const unlikeUser = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const unlikedUserId = parseInt(req.params.id);
    
    // Check if user is trying to unlike themselves
    if (currentUserId === unlikedUserId) {
      return res.status(400).json({ message: 'Cannot unlike yourself' });
    }
    
    // Check if the unliked user exists
    const unlikedUser = await User.findById(unlikedUserId);
    if (!unlikedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete the like
    const deleted = await Like.delete(currentUserId, unlikedUserId);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Like not found' });
    }
    
    // Send notification to the unliked user about the unlike
    // Only send if the unliker is not the unliked user
    if (currentUserId !== unlikedUserId) {
      // Get the unliker's profile for the notification content
      const unlikerUser = await User.findById(currentUserId);
      
      if (unlikerUser) {
        const notificationContent = `${unlikerUser.firstName} ${unlikerUser.lastName} unliked your profile`;
        
        // Send notification
        await createAndSendNotification(global.io, {
          userId: unlikedUserId,
          fromUserId: currentUserId,
          type: 'UNLIKE',
          content: notificationContent
        });
      }
    }
    
    res.json({
      isLiked: false,
      isMatch: false,
      message: 'User unliked successfully'
    });
  } catch (error) {
    console.error('Error unliking user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Block a user
const blockUser = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const blockedUserId = parseInt(req.params.id);
    
    // Check if user is trying to block themselves
    if (currentUserId === blockedUserId) {
      return res.status(400).json({ message: 'Cannot block yourself' });
    }
    
    // Check if the blocked user exists
    const blockedUser = await User.findById(blockedUserId);
    if (!blockedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Create the block
    const block = await Block.create({
      userId: currentUserId,
      blockedUserId
    });
    
    res.json({
      isBlocked: true,
      message: 'User blocked successfully'
    });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Unblock a user
const unblockUser = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const unblockedUserId = parseInt(req.params.id);
    
    // Check if user is trying to unblock themselves
    if (currentUserId === unblockedUserId) {
      return res.status(400).json({ message: 'Cannot unblock yourself' });
    }
    
    // Check if the unblocked user exists
    const unblockedUser = await User.findById(unblockedUserId);
    if (!unblockedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete the block
    const deleted = await Block.delete(currentUserId, unblockedUserId);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Block not found' });
    }
    
    res.json({
      isBlocked: false,
      message: 'User unblocked successfully'
    });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Report a user
const reportUser = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const reportedUserId = parseInt(req.params.id);
    const { reason } = req.body;
    
    // Check if user is trying to report themselves
    if (currentUserId === reportedUserId) {
      return res.status(400).json({ message: 'Cannot report yourself' });
    }
    
    // Check if the reported user exists
    const reportedUser = await User.findById(reportedUserId);
    if (!reportedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user has already reported this user
    const alreadyReported = await Report.exists(currentUserId, reportedUserId);
    if (alreadyReported) {
      return res.status(400).json({ message: 'You have already reported this user' });
    }
    
    // Validate reason
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ message: 'Reason is required' });
    }
    
    // Create the report
    const report = await Report.create({
      reporterId: currentUserId,
      reportedUserId,
      reason: reason.trim()
    });
    
    res.json({
      message: 'User reported successfully'
    });
  } catch (error) {
    console.error('Error reporting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getPublicProfile,
  likeUser,
  unlikeUser,
  blockUser,
  unblockUser,
  reportUser
};