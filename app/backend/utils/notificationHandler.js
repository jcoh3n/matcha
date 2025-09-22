const Notification = require('../models/Notification');

// Store connected users
const connectedUsers = new Map();

// Add a user to the connected users map
function addUser(userId, socketId) {
  connectedUsers.set(userId, socketId);
}

// Remove a user from the connected users map
function removeUser(socketId) {
  for (let [userId, sockId] of connectedUsers.entries()) {
    if (sockId === socketId) {
      connectedUsers.delete(userId);
      break;
    }
  }
}

// Get socket ID for a user
function getUserSocketId(userId) {
  return connectedUsers.get(userId);
}

// Send notification to a specific user
function sendNotificationToUser(io, userId, notification) {
  const socketId = getUserSocketId(userId);
  if (socketId) {
    io.to(socketId).emit('notification', notification);
  }
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
  getUserSocketId,
  sendNotificationToUser,
  createAndSendNotification
};