const Profile = require("../models/Profile");
const Tag = require("../models/Tag");
const UserTag = require("../models/UserTag");
const Photo = require("../models/Photo");
const Location = require("../models/Location");
const { forwardGeocode, reverseGeocode } = require("../utils/geocoding");
const db = require("../config/db");

// Get current user profile
const getProfile = async (req, res) => {
  try {
    // req.user is added by the authJWT middleware
    const userId = req.user.id;

    // Get user profile
    const profile = await Profile.findByUserId(userId);

    // Get user tags
    const tags = await UserTag.findTagsByUserId(userId);

    // Get user photos
    const photos = await Photo.findByUserId(userId);

    // Get user location
    const location = await Location.findByUserId(userId);

    // Combine all profile data
    const profileData = {
      ...req.user.toJSON(),
      profile: profile ? profile.toJSON() : null,
      tags,
      photos,
      location: location ? location.toJSON() : null,
    };

    res.json(profileData);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getMatchesUser = async (req, res) => {
  try {
    const viewerId = req.user.id;
    const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);
    const offset = Math.max(parseInt(req.query.offset || "0", 10), 0);

    const { rows } = await db.query(
      `WITH others AS (
         SELECT CASE WHEN user1_id = $1 THEN user2_id ELSE user1_id END AS other_id
         FROM matches
         WHERE user1_id = $1 OR user2_id = $1
      )
      SELECT
        u.id,
        u.email,
        u.username,
        u.first_name AS "firstName",
        u.last_name  AS "lastName",
        p.birth_date AS "birthDate",
        p.gender,
        p.sexual_orientation AS "orientation",
        p.bio,
        p.fame_rating AS "fameRating",
        l.city,
        l.country,
        (
          SELECT ph.url FROM photos ph
          WHERE ph.user_id = u.id AND ph.is_profile = TRUE
          ORDER BY ph.id DESC LIMIT 1
        ) AS "profilePhotoUrl",
        CASE
          WHEN lv.latitude IS NOT NULL AND lv.longitude IS NOT NULL
           AND l.latitude  IS NOT NULL AND l.longitude  IS NOT NULL
          THEN ROUND(
            6371 * acos(
              cos(radians(lv.latitude)) * cos(radians(l.latitude)) *
              cos(radians(l.longitude) - radians(lv.longitude)) +
              sin(radians(lv.latitude)) * sin(radians(l.latitude))
            )::numeric, 1
          )
          ELSE NULL
        END AS "distanceKm"
      FROM others o
      JOIN users u    ON u.id = o.other_id
      JOIN profiles p ON p.user_id = u.id
      LEFT JOIN LATERAL (
        SELECT latitude, longitude, city, country
        FROM locations
        WHERE user_id = u.id
        ORDER BY updated_at DESC NULLS LAST, created_at DESC
        LIMIT 1
      ) l ON true
      LEFT JOIN LATERAL (
        SELECT latitude, longitude
        FROM locations
        WHERE user_id = $1
        ORDER BY updated_at DESC NULLS LAST, created_at DESC
        LIMIT 1
      ) lv ON true
      ORDER BY p.fame_rating DESC NULLS LAST, u.id
      LIMIT $2 OFFSET $3`,
      [viewerId, limit, offset]
    );

    const data = rows.map((r) => ({
      id: r.id,
      email: r.email,
      username: r.username,
      firstName: r.firstName,
      lastName: r.lastName,
      profilePhotoUrl: r.profilePhotoUrl || null,
      profile: {
        birthDate: r.birthDate || null,
        gender: r.gender || null,
        orientation: r.orientation || null,
        bio: r.bio || "",
        fameRating: r.fameRating ?? 0,
      },
      location: { city: r.city || null, country: r.country || null },
      distanceKm: r.distanceKm,
    }));

    res.json(data);
  } catch (error) {
    console.error("Error fetching matches:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update current user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bio, gender, orientation, birthDate } = req.body;

    // Validate input
    if (!bio || !gender || !orientation || !birthDate) {
      return res.status(400).json({
        message: "Missing required fields: bio, gender, orientation, birthDate",
      });
    }

    // Check if profile already exists
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

    res.json(profile.toJSON());
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all tags
const getAllTags = async (req, res) => {
  try {
    const tags = await Tag.findAll();
    res.json(tags.map((tag) => tag.toJSON()));
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add tags to user
const addUserTags = async (req, res) => {
  try {
    const userId = req.user.id;
    const { tags } = req.body;

    if (!Array.isArray(tags)) {
      return res.status(400).json({ message: "Tags must be an array" });
    }

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

    res.status(204).send();
  } catch (error) {
    console.error("Error adding user tags:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get user tags
const getUserTags = async (req, res) => {
  try {
    const userId = req.user.id;
    const tags = await UserTag.findTagsByUserId(userId);
    res.json(tags);
  } catch (error) {
    console.error("Error fetching user tags:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add photo
const addPhoto = async (req, res) => {
  try {
    const userId = req.user.id;
    const { url, isProfile } = req.body;

    if (!url) {
      return res.status(400).json({ message: "URL is required" });
    }

    const photo = await Photo.create({ userId, url, isProfile });
    res.status(201).json(photo.toJSON());
  } catch (error) {
    console.error("Error adding photo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Set photo as profile photo
const setProfilePhoto = async (req, res) => {
  try {
    const userId = req.user.id;
    const { photoId } = req.params;

    const photo = await Photo.setAsProfilePhoto(photoId, userId);
    if (!photo) {
      return res.status(404).json({ message: "Photo not found" });
    }

    res.json(photo.toJSON());
  } catch (error) {
    console.error("Error setting profile photo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete photo
const deletePhoto = async (req, res) => {
  try {
    const userId = req.user.id;
    const { photoId } = req.params;

    const deleted = await Photo.delete(photoId, userId);
    if (!deleted) {
      return res.status(404).json({ message: "Photo not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting photo:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update location
const updateLocation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { latitude, longitude, city, country, method } = req.body;

    if (!method) {
      return res
        .status(400)
        .json({ message: "Missing required field: method" });
    }

    const hasCoords =
      typeof latitude === "number" &&
      !Number.isNaN(latitude) &&
      typeof longitude === "number" &&
      !Number.isNaN(longitude);

    let finalLocation = { latitude, longitude, city, country, method };
    try {
      if (method === "MANUAL") {
        if (
          (!hasCoords || (latitude === 0 && longitude === 0)) &&
          (city || country)
        ) {
          const fwd = await forwardGeocode(city, country);
          if (fwd) finalLocation = { ...finalLocation, ...fwd };
        } else if (hasCoords && (!city || !country)) {
          const rev = await reverseGeocode(latitude, longitude);
          if (rev) finalLocation = { ...finalLocation, ...rev };
        }
      }
    } catch (e) {
      // Non-fatal geocoding failure, continue with provided data
      console.warn("Geocoding failed during updateLocation:", e?.message || e);
    }

    if (
      typeof finalLocation.latitude !== "number" ||
      Number.isNaN(finalLocation.latitude) ||
      typeof finalLocation.longitude !== "number" ||
      Number.isNaN(finalLocation.longitude)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid or missing coordinates" });
    }

    const location = await Location.create({
      userId,
      latitude: finalLocation.latitude,
      longitude: finalLocation.longitude,
      city: finalLocation.city,
      country: finalLocation.country,
      locationMethod: finalLocation.method,
    });

    res.json(location.toJSON());
  } catch (error) {
    console.error("Error updating location:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAllTags,
  addUserTags,
  getUserTags,
  addPhoto,
  setProfilePhoto,
  deletePhoto,
  updateLocation,
  getMatchesUser,
};
