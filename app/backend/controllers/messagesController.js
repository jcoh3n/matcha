const Message = require('../models/Message');
const User = require('../models/User');
const { createAndSendNotification } = require('../utils/notificationHandler');
const db = require('../config/db');

// Send a message
const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, content } = req.body;
    
    console.log('[DEBUG] sendMessage called:', { senderId, receiverId, content: content?.substring(0, 50) + '...' });
    
    // Validate input
    if (!receiverId || !content || content.trim().length === 0) {
      console.log('[DEBUG] Validation failed for sendMessage:', { receiverId, hasContent: !!content, contentLength: content?.trim().length });
      return res.status(400).json({ message: 'Receiver ID and content are required' });
    }
    
    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      console.log('[DEBUG] Receiver not found:', receiverId);
      return res.status(404).json({ message: 'Receiver not found' });
    }
    
    // Check if user is trying to message themselves
    if (senderId === receiverId) {
      console.log('[DEBUG] User tried to message themselves:', senderId);
      return res.status(400).json({ message: 'Cannot send message to yourself' });
    }
    
    // Create the message
    const message = await Message.create({
      senderId,
      receiverId,
      content: content.trim()
    });
    
    console.log('[DEBUG] Message created successfully:', message.id);
    
    // Emit real-time message event
    const sender = await User.findById(senderId);
    if (sender && global.io) {
      console.log('[DEBUG] Emitting message via WebSocket to receiver:', receiverId);
      // Emit to receiver if they're connected
      global.io.emit('message', {
        senderId: senderId,
        senderName: `${sender.firstName} ${sender.lastName}`,
        receiverId: receiverId,
        content: content.trim(),
        timestamp: new Date()
      });
    } else {
      console.log('[DEBUG] Could not emit message via WebSocket - sender or io not available');
    }
    
    // Send notification to receiver if they're not the sender
    if (senderId !== receiverId) {
      if (sender) {
        const notificationContent = `${sender.firstName} ${sender.lastName}: ${content.trim().substring(0, 50)}${content.trim().length > 50 ? '...' : ''}`;
        
        console.log('[DEBUG] Sending notification to receiver:', receiverId);
        // Send notification
        await createAndSendNotification(global.io, {
          userId: receiverId,
          fromUserId: senderId,
          type: 'MESSAGE',
          content: notificationContent
        });
      }
    }
    
    console.log('[DEBUG] sendMessage completed successfully, returning message:', message.id);
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
    
    console.log('[DEBUG] getConversation called:', { userId, otherUserId });
    
    // Validate input
    if (!otherUserId) {
      console.log('[DEBUG] Validation failed - otherUserId is required');
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Check if user exists
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      console.log('[DEBUG] Other user not found:', otherUserId);
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get conversation
    const messages = await Message.findConversation(userId, otherUserId);
    console.log('[DEBUG] Found', messages.length, 'messages in conversation between', userId, 'and', otherUserId);
    
    // Mark messages as read
    await Message.markConversationAsRead(otherUserId, userId);
    console.log('[DEBUG] Marked messages as read for conversation between', userId, 'and', otherUserId);
    
    const messagesJson = messages.map(message => message.toJSON());
    console.log('[DEBUG] Returning', messagesJson.length, 'messages');
    
    res.json(messagesJson);
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

// Get all conversations for a user (users they have matched with)
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('[DEBUG] getConversations called for user:', userId);
    
    // Get all matched users with their latest message information
    const { rows } = await db.query(
      `WITH matches_with_users AS (
         SELECT CASE WHEN m.user1_id = $1 THEN m.user2_id ELSE m.user1_id END AS other_user_id,
                m.created_at AS match_date
         FROM matches m
         WHERE m.user1_id = $1 OR m.user2_id = $1
       ),
       latest_messages AS (
         SELECT DISTINCT ON (
           CASE 
             WHEN sender_id = $1 THEN receiver_id
             ELSE sender_id
           END
         )
           CASE 
             WHEN sender_id = $1 THEN receiver_id
             ELSE sender_id
           END AS other_user_id,
           content,
           sender_id,
           created_at
         FROM messages
         WHERE sender_id = $1 OR receiver_id = $1
         ORDER BY 
           CASE 
             WHEN sender_id = $1 THEN receiver_id
             ELSE sender_id
           END,
           created_at DESC
       )
       SELECT
         u.id,
         u.email,
         u.username,
         u.first_name AS "firstName",
         u.last_name  AS "lastName",
         p.birth_date AS "birthDate",
         p.gender,
         p.sexual_orientation AS "orientation",
         p.bio,
         p.fame_rating AS "fameRating",
         l.city,
         l.country,
         (
           SELECT ph.url FROM photos ph
           WHERE ph.user_id = u.id AND ph.is_profile = TRUE
           ORDER BY ph.id DESC LIMIT 1
         ) AS "profilePhotoUrl",
         CASE
           WHEN lv.latitude IS NOT NULL AND lv.longitude IS NOT NULL
            AND l.latitude  IS NOT NULL AND l.longitude  IS NOT NULL
           THEN ROUND(
             6371 * acos(
               cos(radians(lv.latitude)) * cos(radians(l.latitude)) *
               cos(radians(l.longitude) - radians(lv.longitude)) +
               sin(radians(lv.latitude)) * sin(radians(l.latitude))
             )::numeric, 1
           )
           ELSE NULL
         END AS "distanceKm",
         lm.content AS "lastMessageContent",
         lm.sender_id AS "lastMessageSenderId",
         lm.created_at AS "lastMessageTime"
       FROM matches_with_users mu
       JOIN users u ON u.id = mu.other_user_id
       JOIN profiles p ON p.user_id = u.id
       LEFT JOIN LATERAL (
         SELECT latitude, longitude, city, country
         FROM locations
         WHERE user_id = u.id
         ORDER BY updated_at DESC NULLS LAST, created_at DESC
         LIMIT 1
       ) l ON true
       LEFT JOIN latest_messages lm ON lm.other_user_id = u.id
       LEFT JOIN LATERAL (
         SELECT latitude, longitude
         FROM locations
         WHERE user_id = $1
         ORDER BY updated_at DESC NULLS LAST, created_at DESC
         LIMIT 1
       ) lv ON true
       ORDER BY COALESCE(lm.created_at, mu.match_date) DESC`,
      [userId]
    );

    console.log('[DEBUG] Query returned', rows.length, 'matches for user', userId);
    
    // Transform the results to match the expected format
    const conversations = rows.map(row => ({
      id: row.id,
      email: row.email,
      username: row.username,
      firstName: row.firstName,
      lastName: row.lastName,
      profilePhotoUrl: row.profilePhotoUrl || null,
      profile: {
        birthDate: row.birthDate || null,
        gender: row.gender || null,
        orientation: row.orientation || null,
        bio: row.bio || "",
        fameRating: row.fameRating ?? 0,
      },
      location: { city: row.city || null, country: row.country || null },
      distanceKm: row.distanceKm,
      lastMessage: row.lastMessageContent ? {
        content: row.lastMessageContent,
        senderId: row.lastMessageSenderId,
        timestamp: row.lastMessageTime
      } : null
    }));

    console.log('[DEBUG] Returning', conversations.length, 'conversations for user', userId);
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getUnreadMessagesCount,
  getConversations
};