const db = require("../config/db");

const getMatchesByUserId = async (userId) => {
  const query = `
    SELECT u.id, u.username, u.profile_picture
    FROM users u
    JOIN matches m ON (u.id = m.match_id)
    WHERE m.user_id = $1
  `;
  const { rows } = await db.query(query, [userId]);
  return rows;
};

module.exports = {
  getMatchesByUserId,
};
