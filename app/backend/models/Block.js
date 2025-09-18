const db = require('../config/db');

// Block model
class Block {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.blockedUserId = data.blocked_user_id;
    this.createdAt = data.created_at || data.createdAt || new Date();
  }

  // Convert to JSON format
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      blockedUserId: this.blockedUserId,
      createdAt: this.createdAt
    };
  }

  // Create a new block in the database
  static async create(blockData) {
    const { userId, blockedUserId } = blockData;
    const createdAt = new Date();
    
    const query = `
      INSERT INTO blocks (user_id, blocked_user_id, created_at)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, blocked_user_id) DO NOTHING
      RETURNING *
    `;
    
    const values = [userId, blockedUserId, createdAt];
    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      // If the block already exists, fetch it
      const existing = await db.query(
        'SELECT * FROM blocks WHERE user_id = $1 AND blocked_user_id = $2', 
        [userId, blockedUserId]
      );
      return existing.rows.length ? new Block(existing.rows[0]) : null;
    }
    
    return new Block(result.rows[0]);
  }

  // Find block by user ID and blocked user ID
  static async findByUserAndBlockedUser(userId, blockedUserId) {
    const result = await db.query(
      'SELECT * FROM blocks WHERE user_id = $1 AND blocked_user_id = $2',
      [userId, blockedUserId]
    );
    return result.rows.length ? new Block(result.rows[0]) : null;
  }

  // Check if a user has blocked another user
  static async exists(userId, blockedUserId) {
    const result = await db.query(
      'SELECT 1 FROM blocks WHERE user_id = $1 AND blocked_user_id = $2',
      [userId, blockedUserId]
    );
    return result.rows.length > 0;
  }

  // Find all blocks by user ID
  static async findByUserId(userId) {
    const result = await db.query('SELECT * FROM blocks WHERE user_id = $1', [userId]);
    return result.rows.map(row => new Block(row));
  }

  // Find all users blocked by a user
  static async findBlockedUsersByUserId(userId) {
    const result = await db.query('SELECT * FROM blocks WHERE user_id = $1', [userId]);
    return result.rows.map(row => new Block(row));
  }

  // Delete a block
  static async delete(userId, blockedUserId) {
    const result = await db.query(
      'DELETE FROM blocks WHERE user_id = $1 AND blocked_user_id = $2 RETURNING *',
      [userId, blockedUserId]
    );
    return result.rows.length > 0;
  }

  // Delete all blocks for a user
  static async deleteAllByUserId(userId) {
    const result = await db.query('DELETE FROM blocks WHERE user_id = $1 OR blocked_user_id = $1', [userId]);
    return result.rowCount;
  }
}

module.exports = Block;