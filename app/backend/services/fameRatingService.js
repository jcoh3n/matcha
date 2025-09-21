const db = require("../config/db");
const Profile = require("../models/Profile");
const Like = require("../models/Like");
const ProfileView = require("../models/ProfileView");

/**
 * Calculate fame rating based on likes, views, and activity
 * @param {number} userId - The user ID to calculate fame rating for
 * @returns {number} - The calculated fame rating (0-1000 scale)
 */
async function calculateFameRating(userId) {
  // Get counts for the user
  const [likesCount, viewsCount, recentViewsCount] = await Promise.all([
    // Count of likes received
    db.query("SELECT COUNT(*) as count FROM likes WHERE liked_user_id = $1", [
      userId,
    ]),
    // Total profile views
    db.query(
      "SELECT COUNT(*) as count FROM profile_views WHERE viewed_user_id = $1",
      [userId]
    ),
    // Recent profile views (last 30 days)
    db.query(
      `SELECT COUNT(*) as count FROM profile_views 
       WHERE viewed_user_id = $1 
       AND created_at >= NOW() - INTERVAL '30 days'`,
      [userId]
    ),
  ]);

  const likes = parseInt(likesCount.rows[0].count);
  const views = parseInt(viewsCount.rows[0].count);
  const recentViews = parseInt(recentViewsCount.rows[0].count);

  // Simple algorithm for fame rating (can be adjusted):
  // - Each like = 10 points
  // - Each view = 1 point
  // - Recent activity multiplier (last 30 days) = up to 2x bonus
  let baseScore = likes * 10 + views;

  // Activity bonus: up to 100% bonus based on recent views vs total views
  let activityBonus = 0;
  if (views > 0) {
    const activityRatio = recentViews / views;
    activityBonus = baseScore * activityRatio;
  }

  let fameRating = baseScore + activityBonus;

  // Cap the rating at 1000
  fameRating = Math.min(fameRating, 1000);

  // Ensure minimum baseline of 200
  fameRating = Math.max(fameRating, 200);

  return Math.round(fameRating);
}

/**
 * Update fame rating for a specific user
 * @param {number} userId - The user ID to update fame rating for
 */
async function updateFameRating(userId) {
  const fameRating = await calculateFameRating(userId);

  // Update the profile with new fame rating
  await db.query(
    "UPDATE profiles SET fame_rating = GREATEST($1, 200), updated_at = CURRENT_TIMESTAMP WHERE user_id = $2",
    [fameRating, userId]
  );

  return fameRating;
}

/**
 * Update fame ratings for all users
 */
async function updateAllFameRatings() {
  // Get all user IDs
  const result = await db.query("SELECT id FROM users");
  const userIds = result.rows.map((row) => row.id);

  // Update fame rating for each user
  const updates = userIds.map((userId) => updateFameRating(userId));
  await Promise.all(updates);
}

module.exports = {
  calculateFameRating,
  updateFameRating,
  updateAllFameRatings,
};
