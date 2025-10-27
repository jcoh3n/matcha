const Notification = require('../models/Notification');

// Get all notifications for the current user
async function getNotifications(req, res) {
  try {
    const userId = req.user.id;
    const notifications = await Notification.findByUserId(userId);
    
    // Get unread count
    const unreadCount = await Notification.countUnreadByUserId(userId);
    
    res.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Mark a notification as read
async function markNotificationAsRead(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Verify the notification belongs to the user
    const notification = await Notification.markAsRead(id);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    if (notification.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Mark all notifications as read
async function markAllNotificationsAsRead(req, res) {
  try {
    const userId = req.user.id;
    const notifications = await Notification.markAllAsRead(userId);
    
    res.json({ 
      message: 'All notifications marked as read',
      notifications
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
};