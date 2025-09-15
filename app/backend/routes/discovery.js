const express = require('express');
const { getDiscoveryUsers, getRandomUsers, searchUsers, getFilteredUsers } = require('../controllers/discoveryController');
const { authJWT } = require('../middleware/authJWT');

const router = express.Router();

// Get users for discovery (protected)
router.get('/discovery', authJWT, getDiscoveryUsers);

// Get random users for discovery (protected)
router.get('/discovery/random', authJWT, getRandomUsers);

// Search users by name (protected)
router.get('/discovery/search', authJWT, searchUsers);

// Get filtered users for discovery (protected)
router.get('/discovery/filtered', authJWT, getFilteredUsers);

module.exports = router;