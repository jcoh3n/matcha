const cron = require("node-cron");
// Fix path: jobs/ -> services/
const { updateAllFameRatings } = require("../services/fameRatingService");

// Schedule fame rating updates every hour
cron.schedule("0 * * * *", async () => {
  console.log("Running hourly fame rating update job");
  try {
    await updateAllFameRatings();
    console.log("Fame rating update job completed successfully");
  } catch (error) {
    console.error("Error in fame rating update job:", error);
  }
});

// Schedule a full fame rating update every day at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("Running daily full fame rating update job");
  try {
    await updateAllFameRatings();
    console.log("Daily fame rating update job completed successfully");
  } catch (error) {
    console.error("Error in daily fame rating update job:", error);
  }
});
