const express = require('express');
const { getViewers, getLikers, getOnlineStatus } = require('../controllers/meController');
const { authJWT } = require('../middleware/authJWT');

const router = express.Router();

// Apply authJWT middleware to all routes in this router
router.use(authJWT);

// GET /me/viewers - Get users who viewed my profile
router.get('/viewers', getViewers);

// GET /me/likers - Get users who liked me
router.get('/likers', getLikers);

// GET /me/online-status - Get current user's online status
router.get('/online-status', getOnlineStatus);

module.exports = router;