const db = require('../config/db');

// Message model
class Message {
  constructor(data) {
    this.id = data.id;
    this.senderId = data.sender_id;
    this.receiverId = data.receiver_id;
    this.content = data.content;
    this.read = data.read;
    this.createdAt = data.created_at || data.createdAt || new Date();
    this.updatedAt = data.updated_at || data.updatedAt || new Date();
  }

  // Convert to JSON format
  toJSON() {
    return {
      id: this.id,
      senderId: this.senderId,
      receiverId: this.receiverId,
      content: this.content,
      read: this.read,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Create a new message in the database
  static async create(messageData) {
    const { senderId, receiverId, content } = messageData;
    const createdAt = new Date();
    const updatedAt = new Date();
    const read = false;
    
    const query = `
      INSERT INTO messages (sender_id, receiver_id, content, read, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [senderId, receiverId, content, read, createdAt, updatedAt];
    const result = await db.query(query, values);
    return new Message(result.rows[0]);
  }

  // Find all messages between two users
  static async findConversation(senderId, receiverId) {
    const result = await db.query(
      `SELECT * FROM messages 
       WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY created_at ASC`,
      [senderId, receiverId]
    );
    return result.rows.map(row => new Message(row));
  }

  // Find unread messages for a user
  static async findUnreadByReceiverId(receiverId) {
    const result = await db.query(
      'SELECT * FROM messages WHERE receiver_id = $1 AND read = FALSE ORDER BY created_at ASC',
      [receiverId]
    );
    return result.rows.map(row => new Message(row));
  }

  // Mark a message as read
  static async markAsRead(id) {
    const result = await db.query(
      'UPDATE messages SET read = TRUE, updated_at = $1 WHERE id = $2 RETURNING *',
      [new Date(), id]
    );
    return result.rows.length ? new Message(result.rows[0]) : null;
  }

  // Mark all messages as read between two users
  static async markConversationAsRead(senderId, receiverId) {
    const result = await db.query(
      `UPDATE messages 
       SET read = TRUE, updated_at = $1 
       WHERE sender_id = $2 AND receiver_id = $3 AND read = FALSE 
       RETURNING *`,
      [new Date(), senderId, receiverId]
    );
    return result.rows.map(row => new Message(row));
  }

  // Delete a message
  static async delete(id) {
    const result = await db.query('DELETE FROM messages WHERE id = $1 RETURNING *', [id]);
    return result.rows.length > 0;
  }
}

module.exports = Message;