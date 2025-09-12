const db = require('../config/db');

// Photo model
class Photo {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.url = data.url;
    this.isProfile = data.is_profile;
    this.createdAt = data.created_at || data.createdAt || new Date();
    this.updatedAt = data.updated_at || data.updatedAt || new Date();
  }

  // Convert to JSON format
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      url: this.url,
      isProfile: this.isProfile,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Create a new photo in the database
  static async create(photoData) {
    const { userId, url, isProfile = false } = photoData;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    const query = `
      INSERT INTO photos (user_id, url, is_profile, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [userId, url, isProfile, createdAt, updatedAt];
    const result = await db.query(query, values);
    return new Photo(result.rows[0]);
  }

  // Find all photos for a user
  static async findByUserId(userId) {
    const result = await db.query(
      'SELECT * FROM photos WHERE user_id = $1 ORDER BY is_profile DESC, created_at',
      [userId]
    );
    return result.rows.map(row => new Photo(row));
  }

  // Find profile photo for a user
  static async findProfilePhotoByUserId(userId) {
    const result = await db.query(
      'SELECT * FROM photos WHERE user_id = $1 AND is_profile = true LIMIT 1',
      [userId]
    );
    return result.rows.length ? new Photo(result.rows[0]) : null;
  }

  // Update photo
  static async update(id, photoData) {
    const { url, isProfile } = photoData;
    const updatedAt = new Date();
    
    const query = `
      UPDATE photos
      SET url = $1, is_profile = $2, updated_at = $3
      WHERE id = $4
      RETURNING *
    `;
    
    const values = [url, isProfile, updatedAt, id];
    const result = await db.query(query, values);
    return result.rows.length ? new Photo(result.rows[0]) : null;
  }

  // Set a photo as profile photo
  static async setAsProfilePhoto(photoId, userId) {
    // First, unset the current profile photo
    await db.query(
      'UPDATE photos SET is_profile = false WHERE user_id = $1 AND is_profile = true',
      [userId]
    );
    
    // Then, set the new profile photo
    const result = await db.query(
      'UPDATE photos SET is_profile = true, updated_at = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [new Date(), photoId, userId]
    );
    
    return result.rows.length ? new Photo(result.rows[0]) : null;
  }

  // Delete photo
  static async delete(id, userId) {
    const result = await db.query(
      'DELETE FROM photos WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );
    return result.rows.length > 0;
  }

  // Delete all photos for a user
  static async deleteAllByUserId(userId) {
    const result = await db.query(
      'DELETE FROM photos WHERE user_id = $1',
      [userId]
    );
    return result.rowCount;
  }

  // Count photos for a user
  static async countByUserId(userId) {
    const result = await db.query('SELECT COUNT(*) FROM photos WHERE user_id = $1', [userId]);
    return parseInt(result.rows[0].count);
  }
}

module.exports = Photo;