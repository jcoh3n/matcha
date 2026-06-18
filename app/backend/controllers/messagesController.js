const Message = require('../models/Message');
const User = require('../models/User');
const Match = require('../models/Match');
const { createAndSendNotification, getUserSocketIds } = require('../utils/notificationHandler');
const db = require('../config/db');

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

    // Check if users are matched
    try {
      const areMatched = await Match.exists(senderId, receiverId);
      if (!areMatched) {
        return res.status(403).json({ message: 'You can only send messages to users you have matched with' });
      }
    } catch (matchErr) {
      console.error('[ERROR] Failed to verify match status:', matchErr);
      return res.status(500).json({ message: 'Internal server error' });
    }
    
    // Create the message
    const message = await Message.create({
      senderId,
      receiverId,
      content: content.trim()
    });
    
    
    // Emit real-time message event to the receiver socket only (read flag included)
    const sender = await User.findById(senderId);
    if (sender && global.io) {
      try {
        const socketIds = getUserSocketIds(receiverId);
        const payload = {
          message: message.toJSON(),
          sender: {
            id: senderId,
            name: `${sender.firstName} ${sender.lastName}`
          }
        };

        if (socketIds.length > 0) {
          try {
            for (const sid of socketIds) {
              if (global.io && typeof global.io.of === 'function') {
                global.io.of('/chat').to(sid).emit('new_message', payload);
              } else {
                global.io.to(sid).emit('new_message', payload);
              }
            }
          } catch (nsErr) {
            console.error('[ERROR] Failed to emit new_message to sockets:', nsErr);
          }
        } else {
          // Receiver not connected
        }
      } catch (emitErr) {
        console.error('[ERROR] Failed to emit new_message:', emitErr);
      }
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
    
    // Mark messages as read (messages sent by otherUserId to userId)
    const updatedMessages = await Message.markConversationAsRead(otherUserId, userId);

    // Notify the original sender that their messages were read
    try {
      if (updatedMessages.length > 0 && global.io) {
        const messageIds = updatedMessages.map(m => m.id);
        const senderSocketIds = getUserSocketIds(otherUserId);
        if (senderSocketIds.length > 0) {
          try {
            for (const sid of senderSocketIds) {
              if (global.io && typeof global.io.of === 'function') {
                global.io.of('/chat').to(sid).emit('message_read', {
                  messageIds,
                  readerId: userId
                });
              } else {
                global.io.to(sid).emit('message_read', {
                  messageIds,
                  readerId: userId
                });
              }
            }
          } catch (nsErr) {
            console.error('[ERROR] Failed to emit message_read to sockets:', nsErr);
          }
        }
      }
    } catch (notifyErr) {
      console.error('[ERROR] Failed to notify sender about read receipts:', notifyErr);
    }
    
    const messagesJson = messages.map(message => message.toJSON());
    
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