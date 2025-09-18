const express = require('express');
<<<<<<< HEAD
const { getDiscoveryUsers, getRandomUsers, searchUsers } = require('../controllers/discoveryController');
=======
const { getDiscoveryUsers, getRandomUsers, searchUsers, getFilteredUsers } = require('../controllers/discoveryController');
>>>>>>> origin/mdembele_sprint_03
const { authJWT } = require('../middleware/authJWT');

const router = express.Router();

// Get users for discovery (protected)
router.get('/discovery', authJWT, getDiscoveryUsers);

// Get random users for discovery (protected)
router.get('/discovery/random', authJWT, getRandomUsers);

// Search users by name (protected)
router.get('/discovery/search', authJWT, searchUsers);

<<<<<<< HEAD
=======
// Get filtered users for discovery (protected)
router.get('/discovery/filtered', authJWT, getFilteredUsers);

>>>>>>> origin/mdembele_sprint_03
module.exports = router;