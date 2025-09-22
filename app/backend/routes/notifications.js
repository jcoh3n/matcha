const express = require('express');
const { authJWT } = require('../middleware/authJWT');
const { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} = require('../controllers/notificationController');

const router = express.Router();

// Apply JWT authentication to all routes
router.use(authJWT);

// Get all notifications for the current user
router.get('/', getNotifications);

// Mark a notification as read
router.post('/:id/read', markNotificationAsRead);

// Mark all notifications as read
router.post('/read-all', markAllNotificationsAsRead);

module.exports = router;