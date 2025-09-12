const db = require('../config/db');

// Location model
class Location {
  constructor(data) {
    this.id = data.id;
    this.userId = data.user_id;
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    this.city = data.city;
    this.country = data.country;
    this.locationMethod = data.location_method;
    this.createdAt = data.created_at || data.createdAt || new Date();
    this.updatedAt = data.updated_at || data.updatedAt || new Date();
  }

  // Convert to JSON format
  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      latitude: this.latitude,
      longitude: this.longitude,
      city: this.city,
      country: this.country,
      locationMethod: this.locationMethod,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Create a new location in the database
  static async create(locationData) {
    const { userId, latitude, longitude, city, country, locationMethod } = locationData;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    const query = `
      INSERT INTO locations (user_id, latitude, longitude, city, country, location_method, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (user_id) DO UPDATE SET
        latitude = $2, longitude = $3, city = $4, country = $5, location_method = $6, updated_at = $8
      RETURNING *
    `;
    
    const values = [userId, latitude, longitude, city, country, locationMethod, createdAt, updatedAt];
    const result = await db.query(query, values);
    return new Location(result.rows[0]);
  }

  // Find location by user ID
  static async findByUserId(userId) {
    const result = await db.query('SELECT * FROM locations WHERE user_id = $1', [userId]);
    return result.rows.length ? new Location(result.rows[0]) : null;
  }

  // Update location
  static async update(userId, locationData) {
    const { latitude, longitude, city, country, locationMethod } = locationData;
    const updatedAt = new Date();
    
    const query = `
      UPDATE locations
      SET latitude = $1, longitude = $2, city = $3, country = $4, location_method = $5, updated_at = $6
      WHERE user_id = $7
      RETURNING *
    `;
    
    const values = [latitude, longitude, city, country, locationMethod, updatedAt, userId];
    const result = await db.query(query, values);
    return result.rows.length ? new Location(result.rows[0]) : null;
  }

  // Delete location
  static async delete(userId) {
    const result = await db.query('DELETE FROM locations WHERE user_id = $1 RETURNING *', [userId]);
    return result.rows.length > 0;
  }
}

module.exports = Location;