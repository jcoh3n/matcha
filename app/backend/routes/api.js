const express = require('express');
const { getAllUsers, getUserById, createUser, updateUser, deleteUser, getCurrentUser } = require('../controllers/userController');
const profileRoutes = require('./profile');
const authRoutes = require('./auth');
const onboardingRoutes = require('./onboarding');
const discoveryRoutes = require('./discovery');
const locationRoutes = require('./location');
const notificationsRoutes = require('./notifications');
const messagesRoutes = require('./messages');
const meRoutes = require('./me');
const { authJWT } = require('../middleware/authJWT');

const router = express.Router();

// User routes
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Protected route to get current user
router.get('/me', authJWT, getCurrentUser);

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

// Me routes (viewers, likers)
router.use('/me', meRoutes);

module.exports = router;