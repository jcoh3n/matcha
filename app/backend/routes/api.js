const express = require('express');
const { getAllUsers, getUserById, createUser, updateUser, deleteUser, getCurrentUser } = require('../controllers/userController');
const profileRoutes = require('./profile');
const authRoutes = require('./auth');
const onboardingRoutes = require('./onboarding');
const discoveryRoutes = require('./discovery');
const notificationsRoutes = require('./notifications');
const messagesRoutes = require('./messages');
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

// Notifications routes
router.use('/notifications', notificationsRoutes);

// Messages routes
router.use('/messages', messagesRoutes);

module.exports = router;