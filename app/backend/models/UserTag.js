const db = require('../config/db');

// UserTag model (many-to-many relationship between users and tags)
class UserTag {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.tagId = data.tag_id;
    this.createdAt = data.created_at || data.createdAt || new Date();
  }

  // Convert to JSON format
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      tagId: this.tagId,
      createdAt: this.createdAt
    };
  }

  // Create a new user-tag relationship in the database
  static async create(userId, tagId) {
    const createdAt = new Date();
    
    const query = `
      INSERT INTO user_tags (user_id, tag_id, created_at)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, tag_id) DO NOTHING
      RETURNING *
    `;
    
    const values = [userId, tagId, createdAt];
    const result = await db.query(query, values);
    return result.rows.length ? new UserTag(result.rows[0]) : null;
  }

  // Find all tags for a user
  static async findTagsByUserId(userId) {
    const query = `
      SELECT t.* FROM tags t
      JOIN user_tags ut ON t.id = ut.tag_id
      WHERE ut.user_id = $1
      ORDER BY t.name
    `;
    
    const result = await db.query(query, [userId]);
    return result.rows;
  }

  // Find all users for a tag
  static async findUsersByTagId(tagId) {
    const query = `
      SELECT u.* FROM users u
      JOIN user_tags ut ON u.id = ut.user_id
      WHERE ut.tag_id = $1
    `;
    
    const result = await db.query(query, [tagId]);
    return result.rows;
  }

  // Delete a user-tag relationship
  static async delete(userId, tagId) {
    const result = await db.query(
      'DELETE FROM user_tags WHERE user_id = $1 AND tag_id = $2 RETURNING *',
      [userId, tagId]
    );
    return result.rows.length > 0;
  }

  // Delete all tags for a user
  static async deleteAllByUserId(userId) {
    const result = await db.query('DELETE FROM user_tags WHERE user_id = $1', [userId]);
    return result.rowCount;
  }
}

module.exports = UserTag;