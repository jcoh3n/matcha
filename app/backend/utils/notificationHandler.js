const Notification = require('../models/Notification');

// Store connected users as a map userId -> Set(socketId)
const connectedUsers = new Map();

// Add a user to the connected users map (supports multiple devices)
function addUser(userId, socketId) {
  const key = String(userId);
  if (!connectedUsers.has(key)) connectedUsers.set(key, new Set());
  connectedUsers.get(key).add(socketId);
}

// Remove a socketId from the connected users map
function removeUser(socketId) {
  for (let [userId, sockSet] of connectedUsers.entries()) {
    if (sockSet.has(socketId)) {
      sockSet.delete(socketId);
      if (sockSet.size === 0) connectedUsers.delete(userId);
      break;
    }
  }
}

// Get socket ID(s) for a user
function getUserSocketIds(userId) {
  const set = connectedUsers.get(String(userId));
  return set ? Array.from(set) : [];
}

// Backwards-compatible single socket getter (returns first socket id or undefined)
function getUserSocketId(userId) {
  const ids = getUserSocketIds(userId);
  return ids.length ? ids[0] : undefined;
}

// Real-time presence: a user is online if they have at least one active socket
function isUserConnected(userId) {
  const set = connectedUsers.get(String(userId));
  return !!(set && set.size > 0);
}

// Send notification to a specific user (all connected sockets)
function sendNotificationToUser(io, userId, notification) {
  const socketIds = getUserSocketIds(userId);
  socketIds.forEach(socketId => {
    try {
      if (io && typeof io.of === 'function') {
        io.of('/chat').to(socketId).emit('notification', notification);
      } else {
        io.to(socketId).emit('notification', notification);
      }
    } catch (err) {
      try { io.to(socketId).emit('notification', notification); } catch (_) {}
    }
  });
}

// Create and send a notification
async function createAndSendNotification(io, notificationData) {
  try {
    // Create notification in database
    const notification = await Notification.create(notificationData);

    // Send real-time notification if user is connected
    sendNotificationToUser(io, notificationData.userId, notification);

    return notification;
  } catch (error) {
    console.error('Error creating and sending notification:', error);
  }
}

module.exports = {
  addUser,
  removeUser,
  getUserSocketIds,
  getUserSocketId,
  isUserConnected,
  sendNotificationToUser,
  createAndSendNotification
};