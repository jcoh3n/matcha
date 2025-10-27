const express = require('express');
const { authJWT } = require('../middleware/authJWT');
const { 
  sendMessage, 
  getConversation, 
  getUnreadMessagesCount,
  getConversations
} = require('../controllers/messagesController');

const router = express.Router();

// Apply JWT authentication to all routes
router.use(authJWT);

// Send a message
router.post('/', sendMessage);

// Get conversation with a user
router.get('/:userId', getConversation);

// Get unread messages count
router.get('/unread/count', getUnreadMessagesCount);

// Get all conversations (matches with message history)
router.get('/', getConversations);

module.exports = router;