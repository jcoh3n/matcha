const express = require('express');
const { updateLocation, getCurrentLocation } = require('../controllers/locationController');
const { authJWT } = require('../middleware/authJWT');

const router = express.Router();

// Update user location (protected)
router.put('/location', authJWT, updateLocation);

// Get current user location (protected)
router.get('/location', authJWT, getCurrentLocation);

module.exports = router;