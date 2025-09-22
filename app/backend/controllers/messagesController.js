const Message = require('../models/Message');
const User = require('../models/User');
const { createAndSendNotification } = require('../utils/notificationHandler');

// Send a message
const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, content } = req.body;
    
    // Validate input
    if (!receiverId || !content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Receiver ID and content are required' });
    }
    
    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }
    
    // Check if user is trying to message themselves
    if (senderId === receiverId) {
      return res.status(400).json({ message: 'Cannot send message to yourself' });
    }
    
    // Create the message
    const message = await Message.create({
      senderId,
      receiverId,
      content: content.trim()
    });
    
    // Emit real-time message event
    const sender = await User.findById(senderId);
    if (sender && global.io) {
      // Emit to receiver if they're connected
      global.io.emit('message', {
        senderId: senderId,
        senderName: `${sender.firstName} ${sender.lastName}`,
        receiverId: receiverId,
        content: content.trim(),
        timestamp: new Date()
      });
    }
    
    // Send notification to receiver if they're not the sender
    if (senderId !== receiverId) {
      if (sender) {
        const notificationContent = `${sender.firstName} ${sender.lastName}: ${content.trim().substring(0, 50)}${content.trim().length > 50 ? '...' : ''}`;
        
        // Send notification
        await createAndSendNotification(global.io, {
          userId: receiverId,
          fromUserId: senderId,
          type: 'MESSAGE',
          content: notificationContent
        });
      }
    }
    
    res.status(201).json(message.toJSON());
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get conversation between two users
const getConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { userId: otherUserId } = req.params;
    
    // Validate input
    if (!otherUserId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Check if user exists
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get conversation
    const messages = await Message.findConversation(userId, otherUserId);
    
    // Mark messages as read
    await Message.markConversationAsRead(otherUserId, userId);
    
    res.json(messages.map(message => message.toJSON()));
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get unread messages count
const getUnreadMessagesCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const unreadMessages = await Message.findUnreadByReceiverId(userId);
    res.json({ count: unreadMessages.length });
  } catch (error) {
    console.error('Error fetching unread messages count:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getUnreadMessagesCount
};