const db = require('../config/db');

// Tag model
class Tag {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.createdAt = data.created_at || data.createdAt || new Date();
  }

  // Convert to JSON format
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      createdAt: this.createdAt
    };
  }

  // Create a new tag in the database
  static async create(name) {
    const createdAt = new Date();
    
    const query = `
      INSERT INTO tags (name, created_at)
      VALUES ($1, $2)
      ON CONFLICT (name) DO NOTHING
      RETURNING *
    `;
    
    const values = [name, createdAt];
    const result = await db.query(query, values);
    
    // If the tag already exists, fetch it
    if (result.rows.length === 0) {
      const existing = await db.query('SELECT * FROM tags WHERE name = $1', [name]);
      return existing.rows.length ? new Tag(existing.rows[0]) : null;
    }
    
    return new Tag(result.rows[0]);
  }

  // Find all tags
  static async findAll() {
    const result = await db.query('SELECT * FROM tags ORDER BY name');
    return result.rows.map(row => new Tag(row));
  }

  // Find tag by ID
  static async findById(id) {
    const result = await db.query('SELECT * FROM tags WHERE id = $1', [id]);
    return result.rows.length ? new Tag(result.rows[0]) : null;
  }

  // Find tag by name
  static async findByName(name) {
    const result = await db.query('SELECT * FROM tags WHERE name = $1', [name]);
    return result.rows.length ? new Tag(result.rows[0]) : null;
  }

  // Delete tag
  static async delete(id) {
    const result = await db.query('DELETE FROM tags WHERE id = $1 RETURNING *', [id]);
    return result.rows.length > 0;
  }
}

module.exports = Tag;