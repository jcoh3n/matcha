const db = require('../config/db');

// Notification model
class Notification {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.fromUserId = data.from_user_id;
    this.type = data.type;
    this.content = data.content;
    this.read = data.read;
    this.createdAt = data.created_at || data.createdAt || new Date();
    this.updatedAt = data.updated_at || data.updatedAt || new Date();
  }

  // Convert to JSON format
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      fromUserId: this.fromUserId,
      type: this.type,
      content: this.content,
      read: this.read,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Create a new notification in the database
  static async create(notificationData) {
    const { userId, fromUserId, type, content } = notificationData;
    const createdAt = new Date();
    const updatedAt = new Date();
    const read = false;
    
    const query = `
      INSERT INTO notifications (user_id, from_user_id, type, content, read, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [userId, fromUserId, type, content, read, createdAt, updatedAt];
    const result = await db.query(query, values);
    return new Notification(result.rows[0]);
  }

  // Find all notifications for a user
  static async findByUserId(userId) {
    const result = await db.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows.map(row => new Notification(row));
  }

  // Find unread notifications for a user
  static async findUnreadByUserId(userId) {
    const result = await db.query(
      'SELECT * FROM notifications WHERE user_id = $1 AND read = FALSE ORDER BY created_at DESC',
      [userId]
    );
    return result.rows.map(row => new Notification(row));
  }

  // Mark a notification as read
  static async markAsRead(id) {
    const result = await db.query(
      'UPDATE notifications SET read = TRUE, updated_at = $1 WHERE id = $2 RETURNING *',
      [new Date(), id]
    );
    return result.rows.length ? new Notification(result.rows[0]) : null;
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId) {
    const result = await db.query(
      'UPDATE notifications SET read = TRUE, updated_at = $1 WHERE user_id = $2 AND read = FALSE RETURNING *',
      [new Date(), userId]
    );
    return result.rows.map(row => new Notification(row));
  }

  // Delete a notification
  static async delete(id) {
    const result = await db.query('DELETE FROM notifications WHERE id = $1 RETURNING *', [id]);
    return result.rows.length > 0;
  }

  // Count unread notifications for a user
  static async countUnreadByUserId(userId) {
    const result = await db.query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read = FALSE',
      [userId]
    );
    return parseInt(result.rows[0].count, 10);
  }
}

module.exports = Notification;