const Profile = require("../models/Profile");
const Tag = require("../models/Tag");
const UserTag = require("../models/UserTag");
const Photo = require("../models/Photo");
const Location = require("../models/Location");
const User = require("../models/User");
const db = require("../config/db");
const { forwardGeocode, reverseGeocode } = require("../utils/geocoding");

// Complete user onboarding
const completeOnboarding = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bio, gender, orientation, birthDate, tags, photos, location } =
      req.body;

    // Validate required fields
    if (!bio || !gender || !orientation || !birthDate) {
      return res.status(400).json({
        message:
          "Missing required profile fields: bio, gender, orientation, birthDate",
      });
    }

    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return res.status(400).json({
        message: "At least one photo is required",
      });
    }

    if (!location) {
      return res
        .status(400)
        .json({ message: "Location information is required" });
    }
    // Accept zero coordinates; we'll try geocoding to enrich if possible.
    const hasCoords =
      typeof location.latitude === "number" &&
      !Number.isNaN(location.latitude) &&
      typeof location.longitude === "number" &&
      !Number.isNaN(location.longitude);

    // Start a transaction
    const client = await db.pool.connect();

    try {
      await client.query("BEGIN");

      // Create or update user profile
      let profile = await Profile.findByUserId(userId);

      if (profile) {
        // Update existing profile
        profile = await Profile.update(userId, {
          bio,
          gender,
          orientation,
          birthDate,
        });
      } else {
        // Create new profile
        profile = await Profile.create({
          userId,
          bio,
          gender,
          orientation,
          birthDate,
        });
      }

      // Handle tags
      if (Array.isArray(tags) && tags.length > 0) {
        // Delete existing tags for user
        await UserTag.deleteAllByUserId(userId);

        // Add new tags
        for (const tagName of tags) {
          // Create tag if it doesn't exist
          let tag = await Tag.findByName(tagName);
          if (!tag) {
            tag = await Tag.create(tagName);
          }

          // Create user-tag relationship
          await UserTag.create(userId, tag.id);
        }
      }

      // Handle photos
      // First, delete existing photos for user
      await Photo.deleteAllByUserId(userId);

      // Add new photos
      let hasProfilePhoto = false;
      for (const photoData of photos) {
        const { url, isProfile } = photoData;

        // Validate photo URL
        if (!url) {
          continue; // Skip invalid photos
        }

        // If no photo is explicitly marked as profile, use the first one
        const shouldBeProfile =
          isProfile || (!hasProfilePhoto && photos.indexOf(photoData) === 0);
        if (shouldBeProfile) {
          hasProfilePhoto = true;
        }

        await Photo.create({ userId, url, isProfile: shouldBeProfile });
      }

      // Handle location: enrich using geocoding when beneficial
      let finalLocation = { ...location };
      try {
        if (location.method === "MANUAL") {
          if (
            (!hasCoords ||
              (location.latitude === 0 && location.longitude === 0)) &&
            (location.city || location.country)
          ) {
            const fwd = await forwardGeocode(location.city, location.country);
            if (fwd) finalLocation = { ...finalLocation, ...fwd };
          } else if (hasCoords && (!location.city || !location.country)) {
            const rev = await reverseGeocode(
              location.latitude,
              location.longitude
            );
            if (rev) finalLocation = { ...finalLocation, ...rev };
          }
        }
      } catch (e) {
        // Non-fatal: continue with provided data
        console.warn(
          "Geocoding failed, using provided location:",
          e?.message || e
        );
      }

      await Location.create({
        userId,
        latitude: finalLocation.latitude,
        longitude: finalLocation.longitude,
        city: finalLocation.city,
        country: finalLocation.country,
        locationMethod: finalLocation.method || location.method,
      });

      await client.query("COMMIT");

      // Fetch updated user data
      const updatedUser = await User.findById(userId);

      res.status(200).json({
        message: "Onboarding completed successfully",
        user: updatedUser.toJSON(),
        profile: profile.toJSON(),
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error completing onboarding:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  completeOnboarding,
};
