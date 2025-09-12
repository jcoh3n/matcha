const express = require('express');
const { 
  getProfile,
  updateProfile,
  getAllTags,
  addUserTags,
  getUserTags,
  addPhoto,
  setProfilePhoto,
  deletePhoto,
  updateLocation
} = require('../controllers/profileController');
const { authJWT } = require('../middleware/authJWT');

const router = express.Router();

// Profile routes
router.get('/me', authJWT, getProfile);
router.put('/me', authJWT, updateProfile);

// Tag routes
router.get('/tags', getAllTags);
router.post('/me/tags', authJWT, addUserTags);
router.get('/me/tags', authJWT, getUserTags);

// Photo routes
router.post('/me/photos', authJWT, addPhoto);
router.put('/me/photos/:photoId/profile', authJWT, setProfilePhoto);
router.delete('/me/photos/:photoId', authJWT, deletePhoto);

// Location routes
router.put('/me/location', authJWT, updateLocation);

module.exports = router;