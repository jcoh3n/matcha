const express = require('express');
const { completeOnboarding } = require('../controllers/onboardingController');
const { authJWT } = require('../middleware/authJWT');

const router = express.Router();

// Complete onboarding (protected route)
router.post('/onboarding/complete', authJWT, completeOnboarding);

module.exports = router;