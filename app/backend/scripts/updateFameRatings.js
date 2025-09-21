#!/usr/bin/env node

const db = require("../config/db");
const { updateAllFameRatings } = require("../services/fameRatingService");

async function updateFameRatings() {
  try {
    console.log("Starting fame rating update for all users...");
    await updateAllFameRatings();
    console.log("Successfully updated fame ratings for all users");
  } catch (error) {
    console.error("Error updating fame ratings:", error);
    process.exit(1);
  } finally {
    try {
      if (db.pool && typeof db.pool.end === "function") {
        await db.pool.end();
        console.log("Database connection pool closed");
      }
    } catch (e) {
      console.error("Error closing database pool:", e);
    }
  }
}

// Run the update function if this script is executed directly
if (require.main === module) {
  console.log("Updating fame ratings for all users...");
  updateFameRatings();
}

module.exports = { updateFameRatings };
