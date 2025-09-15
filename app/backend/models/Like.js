const db = require('../config/db');

// Like model
class Like {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.likedUserId = data.liked_user_id;
    this.createdAt = data.created_at || data.createdAt || new Date();
  }

  // Convert to JSON format
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      likedUserId: this.likedUserId,
      createdAt: this.createdAt
    };
  }

  // Create a new like in the database
  static async create(likeData) {
    const { userId, likedUserId } = likeData;
    const createdAt = new Date();
    
    const query = `
      INSERT INTO likes (user_id, liked_user_id, created_at)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, liked_user_id) DO NOTHING
      RETURNING *
    `;
    
    const values = [userId, likedUserId, createdAt];
    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      // If the like already exists, fetch it
      const existing = await db.query(
        'SELECT * FROM likes WHERE user_id = $1 AND liked_user_id = $2', 
        [userId, likedUserId]
      );
      return existing.rows.length ? new Like(existing.rows[0]) : null;
    }
    
    return new Like(result.rows[0]);
  }

  // Find like by user ID and liked user ID
  static async findByUserAndLikedUser(userId, likedUserId) {
    const result = await db.query(
      'SELECT * FROM likes WHERE user_id = $1 AND liked_user_id = $2',
      [userId, likedUserId]
    );
    return result.rows.length ? new Like(result.rows[0]) : null;
  }

  // Find all likes by user ID
  static async findByUserId(userId) {
    const result = await db.query('SELECT * FROM likes WHERE user_id = $1', [userId]);
    return result.rows.map(row => new Like(row));
  }

  // Find all likes for a user (who liked this user)
  static async findLikesForUser(userId) {
    const result = await db.query('SELECT * FROM likes WHERE liked_user_id = $1', [userId]);
    return result.rows.map(row => new Like(row));
  }

  // Check if a user has liked another user
  static async exists(userId, likedUserId) {
    const result = await db.query(
      'SELECT 1 FROM likes WHERE user_id = $1 AND liked_user_id = $2',
      [userId, likedUserId]
    );
    return result.rows.length > 0;
  }

  // Delete a like
  static async delete(userId, likedUserId) {
    const result = await db.query(
      'DELETE FROM likes WHERE user_id = $1 AND liked_user_id = $2 RETURNING *',
      [userId, likedUserId]
    );
    return result.rows.length > 0;
  }

  // Delete all likes for a user
  static async deleteAllByUserId(userId) {
    const result = await db.query('DELETE FROM likes WHERE user_id = $1 OR liked_user_id = $1', [userId]);
    return result.rowCount;
  }
}

module.exports = Like;