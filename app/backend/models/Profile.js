const db = require('../config/db');

// Profile model
class Profile {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.bio = data.bio;
  // Normalize & fallback
  this.gender = data.gender ? data.gender.toLowerCase() : null;
  this.orientation = (data.sexual_orientation || data.orientation || null);
  if (this.orientation) this.orientation = this.orientation.toLowerCase();
  if (this.gender === 'other') this.gender = 'non-binary';
    this.birthDate = data.birth_date;
    this.fameRating = data.fame_rating;
    this.createdAt = data.created_at || data.createdAt || new Date();
    this.updatedAt = data.updated_at || data.updatedAt || new Date();
  }

  // Convert to JSON format
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      bio: this.bio,
      gender: this.gender,
      orientation: this.orientation,
      birthDate: this.birthDate,
      fameRating: this.fameRating,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Create a new profile in the database
  static async create(profileData) {
    const { userId, bio, gender, orientation, birthDate } = profileData;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    const query = `
      INSERT INTO profiles (user_id, bio, gender, sexual_orientation, birth_date, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const values = [userId, bio, gender, orientation, birthDate, createdAt, updatedAt];
    const result = await db.query(query, values);
    return new Profile(result.rows[0]);
  }

  // Find profile by user ID
  static async findByUserId(userId) {
    const result = await db.query('SELECT * FROM profiles WHERE user_id = $1', [userId]);
    return result.rows.length ? new Profile(result.rows[0]) : null;
  }

  // Update profile
  static async update(userId, profileData) {
    const { bio, gender, orientation, birthDate } = profileData;
    const updatedAt = new Date();
    
    const query = `
      UPDATE profiles
      SET bio = $1, gender = $2, sexual_orientation = $3, birth_date = $4, updated_at = $5
      WHERE user_id = $6
      RETURNING *
    `;
    
    const values = [bio, gender, orientation, birthDate, updatedAt, userId];
    const result = await db.query(query, values);
    return result.rows.length ? new Profile(result.rows[0]) : null;
  }

  // Delete profile
  static async delete(userId) {
    const result = await db.query('DELETE FROM profiles WHERE user_id = $1 RETURNING *', [userId]);
    return result.rows.length > 0;
  }
}

module.exports = Profile;