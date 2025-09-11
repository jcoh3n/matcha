const express = require('express');
const { getAllUsers, getUserById, createUser, updateUser, deleteUser, getCurrentUser } = require('../controllers/userController');
const authRoutes = require('./auth');
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

// Auth routes
router.use('/auth', authRoutes);

module.exports = router;