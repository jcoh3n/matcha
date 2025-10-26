const User = require('../models/User');
const Profile = require('../models/Profile');
const Photo = require('../models/Photo');
const Location = require('../models/Location');
const Like = require('../models/Like');
const Block = require('../models/Block');
const ProfileView = require('../models/ProfileView');

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
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

// Helper function to check if user is online (active in last 5 minutes)
const isUserOnline = (lastActive) => {
  if (!lastActive) return false;
  return (new Date() - new Date(lastActive)) < 5 * 60 * 1000;
};

// Get users who viewed my profile
const getViewers = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Get all profile views for the current user
    const views = await ProfileView.findByViewedUserId(currentUserId);

    // Get blocked users by current user
    const blockedUsers = await Block.findBlockedUsersByUserId(currentUserId);
    const blockedUserIds = blockedUsers.map(block => block.blockedUserId);

    // Filter out blocked users and deduplicate by viewerId (keep latest)
    const uniqueViews = views
      .filter(view => !blockedUserIds.includes(view.viewerId))
      .reduce((acc, view) => {
        const existing = acc.find(v => v.viewerId === view.viewerId);
        if (!existing || new Date(view.createdAt) > new Date(existing.createdAt)) {
          // Remove existing if it exists
          const filtered = acc.filter(v => v.viewerId !== view.viewerId);
          return [...filtered, view];
        }
        return acc;
      }, [])
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Get viewer details
    const viewers = await Promise.all(
      uniqueViews.map(async (view) => {
        const viewerUser = await User.findById(view.viewerId);
        if (!viewerUser) return null;

        const viewerProfile = await Profile.findByUserId(view.viewerId);
        const viewerPhotos = await Photo.findByUserId(view.viewerId);
        const viewerLocation = await Location.findByUserId(view.viewerId);

        // Get current user location
        const currentUserLocation = await Location.findByUserId(currentUserId);

        // Calculate distance if both users have locations
        let distance = null;
        if (viewerLocation && currentUserLocation) {
          distance = calculateDistance(
            parseFloat(currentUserLocation.latitude),
            parseFloat(currentUserLocation.longitude),
            parseFloat(viewerLocation.latitude),
            parseFloat(viewerLocation.longitude)
          );
          // Round to nearest integer
          distance = Math.round(distance);
        }

        // Check relationship status
        const isLiked = await Like.exists(currentUserId, view.viewerId);
        const isLikedByUser = await Like.exists(view.viewerId, currentUserId);
        const isMatch = isLiked && isLikedByUser;

        return {
          id: viewerUser.id,
          username: viewerUser.username,
          firstName: viewerUser.firstName,
          lastName: viewerUser.lastName,
          age: viewerProfile && viewerProfile.birthDate ? calculateAge(viewerProfile.birthDate) : null,
          bio: viewerProfile ? viewerProfile.bio : null,
          photos: viewerPhotos,
          fameRating: viewerProfile ? viewerProfile.fameRating : 0,
          distance,
          location: viewerLocation
            ? {
                city: viewerLocation.city,
                country: viewerLocation.country,
              }
            : null,
          isOnline: isUserOnline(viewerUser.updatedAt),
          lastSeen: viewerUser.updatedAt,
          isLiked,
          isLikedByUser,
          isMatch,
          viewedAt: view.createdAt
        };
      })
    );

    // Filter out null viewers (in case user was deleted)
    const validViewers = viewers.filter(viewer => viewer !== null);

    res.json(validViewers);
  } catch (error) {
    console.error("Error fetching viewers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get users who liked me
const getLikers = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Get all likes for the current user
    const likes = await Like.findLikesForUser(currentUserId);

    // Get blocked users by current user
    const blockedUsers = await Block.findBlockedUsersByUserId(currentUserId);
    const blockedUserIds = blockedUsers.map(block => block.blockedUserId);

    // Filter out blocked users and sort by createdAt (newest first)
    const filteredLikes = likes
      .filter(like => !blockedUserIds.includes(like.userId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Get liker details
    const likers = await Promise.all(
      filteredLikes.map(async (like) => {
        const likerUser = await User.findById(like.userId);
        if (!likerUser) return null;

        const likerProfile = await Profile.findByUserId(like.userId);
        const likerPhotos = await Photo.findByUserId(like.userId);
        const likerLocation = await Location.findByUserId(like.userId);

        // Get current user location
        const currentUserLocation = await Location.findByUserId(currentUserId);

        // Calculate distance if both users have locations
        let distance = null;
        if (likerLocation && currentUserLocation) {
          distance = calculateDistance(
            parseFloat(currentUserLocation.latitude),
            parseFloat(currentUserLocation.longitude),
            parseFloat(likerLocation.latitude),
            parseFloat(likerLocation.longitude)
          );
          // Round to nearest integer
          distance = Math.round(distance);
        }

        // Check relationship status
        const isLiked = await Like.exists(currentUserId, like.userId);
        const isMatch = isLiked && (await Like.exists(like.userId, currentUserId));

        return {
          id: likerUser.id,
          username: likerUser.username,
          firstName: likerUser.firstName,
          lastName: likerUser.lastName,
          age: likerProfile && likerProfile.birthDate ? calculateAge(likerProfile.birthDate) : null,
          bio: likerProfile ? likerProfile.bio : null,
          photos: likerPhotos,
          fameRating: likerProfile ? likerProfile.fameRating : 0,
          distance,
          location: likerLocation
            ? {
                city: likerLocation.city,
                country: likerLocation.country,
              }
            : null,
          isOnline: isUserOnline(likerUser.updatedAt),
          lastSeen: likerUser.updatedAt,
          isLiked,
          isMatch,
          likedAt: like.createdAt
        };
      })
    );

    // Filter out null likers (in case user was deleted)
    const validLikers = likers.filter(liker => liker !== null);

    res.json(validLikers);
  } catch (error) {
    console.error("Error fetching likers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get current user's online status
const getOnlineStatus = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const user = await User.findById(currentUserId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({
      isOnline: isUserOnline(user.updatedAt),
      lastSeen: user.updatedAt
    });
  } catch (error) {
    console.error("Error fetching online status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getViewers,
  getLikers,
  getOnlineStatus
};