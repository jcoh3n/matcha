const express = require('express');
const { getAllUsers, getUserById, getCurrentUser, updateCurrentUser } = require('../controllers/userController');
const profileRoutes = require('./profile');
const authRoutes = require('./auth');
const onboardingRoutes = require('./onboarding');
const discoveryRoutes = require('./discovery');
const locationRoutes = require('./location');
const notificationsRoutes = require('./notifications');
const messagesRoutes = require('./messages');
const meRoutes = require('./me');
const photosRoutes = require('./photos');
const { authJWT } = require('../middleware/authJWT');

const router = express.Router();

// User routes (read-only, authenticated). Account creation goes through
// /auth/register; account updates through PUT /me below. The previous
// unauthenticated POST/PUT/DELETE /users routes were removed (security).
router.get('/users', authJWT, getAllUsers);
router.get('/users/:id', authJWT, getUserById);

// Current user
router.get('/me', authJWT, getCurrentUser);
router.put('/me', authJWT, updateCurrentUser);

// Profile routes
router.use('/profiles', profileRoutes);

// Auth routes
router.use('/auth', authRoutes);

// Onboarding routes
router.use('/', onboardingRoutes);

// Discovery routes
router.use('/', discoveryRoutes);

// Location routes
router.use('/', locationRoutes);

// Notifications routes
router.use('/notifications', notificationsRoutes);

// Messages routes
router.use('/messages', messagesRoutes);

// Photos routes
router.use('/', photosRoutes);

// Me routes (viewers, likers)
router.use('/me', meRoutes);

module.exports = router;