const db = require("../config/db");

class Pass {
  constructor(data) {
    this.id = data.id;
    this.viewerId = data.viewer_id;
    this.passedUserId = data.passed_user_id;
    this.createdAt = data.created_at || new Date();
  }

  static async create({ viewerId, passedUserId }) {
    const query = `
      INSERT INTO passes (viewer_id, passed_user_id)
      VALUES ($1, $2)
      ON CONFLICT (viewer_id, passed_user_id) DO NOTHING
      RETURNING *
    `;
    const values = [viewerId, passedUserId];
    const result = await db.query(query, values);
    if (result.rows.length === 0) {
      const existing = await db.query(
        "SELECT * FROM passes WHERE viewer_id = $1 AND passed_user_id = $2",
        [viewerId, passedUserId]
      );
      return existing.rows.length ? new Pass(existing.rows[0]) : null;
    }
    return new Pass(result.rows[0]);
  }

  static async delete(viewerId, passedUserId) {
    const result = await db.query(
      "DELETE FROM passes WHERE viewer_id = $1 AND passed_user_id = $2 RETURNING *",
      [viewerId, passedUserId]
    );
    return result.rows.length > 0;
  }

  static async exists(viewerId, passedUserId) {
    const result = await db.query(
      "SELECT 1 FROM passes WHERE viewer_id = $1 AND passed_user_id = $2",
      [viewerId, passedUserId]
    );
    return result.rows.length > 0;
  }
}

module.exports = Pass;
