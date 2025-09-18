const db = require('../config/db');

// ProfileView model
class ProfileView {
  constructor(data) {
    this.id = data.id;
    this.viewerId = data.viewer_id;
    this.viewedUserId = data.viewed_user_id;
    this.createdAt = data.created_at || data.createdAt || new Date();
  }

  // Convert to JSON format
  toJSON() {
    return {
      id: this.id,
      viewerId: this.viewerId,
      viewedUserId: this.viewedUserId,
      createdAt: this.createdAt
    };
  }

  // Create a new profile view in the database
  static async create(viewData) {
    const { viewerId, viewedUserId } = viewData;
    const createdAt = new Date();
    
    const query = `
      INSERT INTO profile_views (viewer_id, viewed_user_id, created_at)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const values = [viewerId, viewedUserId, createdAt];
    const result = await db.query(query, values);
    return new ProfileView(result.rows[0]);
  }

  // Find all views by viewer ID
  static async findByViewerId(viewerId) {
    const result = await db.query('SELECT * FROM profile_views WHERE viewer_id = $1', [viewerId]);
    return result.rows.map(row => new ProfileView(row));
  }

  // Find all views for a user (who viewed this user's profile)
  static async findByViewedUserId(viewedUserId) {
    const result = await db.query('SELECT * FROM profile_views WHERE viewed_user_id = $1', [viewedUserId]);
    return result.rows.map(row => new ProfileView(row));
  }

  // Find recent views for a user (who viewed this user's profile recently)
  static async findRecentViewsByViewedUserId(viewedUserId, hours = 24) {
    const result = await db.query(
      `SELECT * FROM profile_views 
       WHERE viewed_user_id = $1 
       AND created_at >= NOW() - INTERVAL '${hours} hours'
       ORDER BY created_at DESC`,
      [viewedUserId]
    );
    return result.rows.map(row => new ProfileView(row));
  }

  // Delete all views for a user
  static async deleteAllByUserId(userId) {
    const result = await db.query('DELETE FROM profile_views WHERE viewer_id = $1 OR viewed_user_id = $1', [userId]);
    return result.rowCount;
  }
}

module.exports = ProfileView;