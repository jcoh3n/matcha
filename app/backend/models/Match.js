const db = require("../config/db");

function orderPair(a, b) {
  return a < b ? [a, b] : [b, a];
}

class Match {
  static async createIfNotExists(userIdA, userIdB) {
    const [user1, user2] = orderPair(userIdA, userIdB);
    const { rows } = await db.query(
      `INSERT INTO matches (user1_id, user2_id)
       VALUES ($1, $2)
       ON CONFLICT (user1_id, user2_id) DO NOTHING
       RETURNING *`,
      [user1, user2]
    );
    return rows[0] || null;
  }

  static async exists(userIdA, userIdB) {
    const [user1, user2] = orderPair(userIdA, userIdB);
    const { rows } = await db.query(
      `SELECT 1 FROM matches WHERE user1_id = $1 AND user2_id = $2`,
      [user1, user2]
    );
    return rows.length > 0;
  }

  static async delete(userIdA, userIdB) {
    const [user1, user2] = orderPair(userIdA, userIdB);
    const { rowCount } = await db.query(
      `DELETE FROM matches WHERE user1_id = $1 AND user2_id = $2`,
      [user1, user2]
    );
    return rowCount > 0;
  }

  static async findOtherUserIdsForUser(
    userId,
    { limit = 50, offset = 0 } = {}
  ) {
    const { rows } = await db.query(
      `SELECT CASE WHEN user1_id = $1 THEN user2_id ELSE user1_id END AS other_id
       FROM matches
       WHERE user1_id = $1 OR user2_id = $1
       ORDER BY id DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return rows.map((r) => r.other_id);
  }
}

module.exports = Match;
