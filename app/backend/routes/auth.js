const express = require('express');
const { register, login, verifyEmail, resendVerificationEmail, forgotPassword, resetPassword } = require('../controllers/authController');
const { logout, refresh } = require('../controllers/authController2');

const router = express.Router();

// Register a new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Verify email
router.post('/verify-email', verifyEmail);

// Resend verification email
router.post('/resend-verification', resendVerificationEmail);

// Forgot password
router.post('/forgot-password', forgotPassword);

// Reset password
router.post('/reset-password', resetPassword);

// Logout user
router.post('/logout', logout);

// Refresh access token
router.post('/refresh', refresh);

module.exports = router;