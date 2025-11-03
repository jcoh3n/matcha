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

// Get all profiles with pagination and filtering
const getAllProfiles = async (req, res) => {
  try {
    // Parse pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100); // Limit to 100 max for performance
    const offset = (page - 1) * limit;

    // Parse filter parameters
    const { ageMin, ageMax, distance, fameRating, tags, lite } = req.query;

    // Get current user id for potential filtering
    const currentUserId = req.user.id;

    // Determine if we should use lite response
    const useLiteResponse = lite === 'true' || lite === true || lite === '1';

    // Query to get profiles with their basic user information, photos, and locations
    let query = '';
    if (useLiteResponse) {
      // Lite response - only essential fields to reduce payload
      query = `
        SELECT 
          u.id,
          u.username,
          ph.url as profile_photo_url,
          p.birth_date,
          p.gender,
          p.fame_rating,
          l.city,
          l.country,
          CASE 
            WHEN l.latitude IS NULL OR l.longitude IS NULL THEN NULL
            ELSE (
              6371 * 2 * ASIN(
                SQRT(
                  POWER(SIN(RADIANS(l.latitude - lv.latitude) / 2), 2) +
                  COS(RADIANS(lv.latitude)) * COS(RADIANS(l.latitude)) * POWER(SIN(RADIANS(l.longitude - lv.longitude) / 2), 2)
                )
              )
            )
          END AS distance_km,
          (SELECT array_remove(array_agg(t2.name), NULL)
           FROM user_tags ut2
           JOIN tags t2 ON t2.id = ut2.tag_id
           WHERE ut2.user_id = u.id
           LIMIT 5  -- Limit number of tags to reduce payload
          ) as tags
        FROM users u
        LEFT JOIN profiles p ON u.id = p.user_id
        LEFT JOIN photos ph ON u.id = ph.user_id AND ph.is_profile = true
        LEFT JOIN locations l ON u.id = l.user_id
        LEFT JOIN locations lv ON lv.user_id = $3  -- Current user's location for distance calculation
        WHERE COALESCE(u.email_verified, true) = true AND u.id != $3
      `;
    } else {
      // Full response - all fields
      query = `
        SELECT 
          u.id,
          u.email,
          u.username,
          u.first_name,
          u.last_name,
          u.created_at,
          u.updated_at,
          p.birth_date,
          p.gender,
          p.sexual_orientation as sexual_orientation,
          p.bio,
          p.fame_rating,
          p.last_active,
          ph.url as profile_photo_url,
          l.latitude,
          l.longitude,
          l.city,
          l.country,
          array_remove(array_agg(DISTINCT t.name), NULL) as tags
        FROM users u
        LEFT JOIN profiles p ON u.id = p.user_id
        LEFT JOIN photos ph ON u.id = ph.user_id AND ph.is_profile = true
        LEFT JOIN locations l ON u.id = l.user_id
        LEFT JOIN locations lv ON lv.user_id = $3  -- Current user's location for distance calculation
        LEFT JOIN user_tags ut ON u.id = ut.user_id
        LEFT JOIN tags t ON t.id = ut.tag_id
        WHERE COALESCE(u.email_verified, true) = true AND u.id != $3
      `;
    }

    // Parameters array: [limit, offset, currentUserId, ...filter params]
    const params = [limit, offset, currentUserId];
    let paramIndex = 3;

    // Age filters (convert ages to birth_date bounds)
    if (ageMax || ageMin) {
      const today = new Date();
      const aMin = parseInt(ageMin);
      const aMax = parseInt(ageMax);

      // Oldest acceptable birthdate (lower bound): today - (aMax + 1) years + 1 day
      if (aMax !== undefined && !isNaN(aMax)) {
        const lower = new Date(today);
        lower.setFullYear(today.getFullYear() - (aMax + 1));
        lower.setDate(lower.getDate() + 1);
        query += ` AND p.birth_date >= $${++paramIndex}`;
        params.push(lower.toISOString().split("T")[0]);
      }

      // Youngest acceptable birthdate (upper bound): today - aMin years
      if (aMin !== undefined && !isNaN(aMin)) {
        const upper = new Date(today);
        upper.setFullYear(today.getFullYear() - aMin);
        query += ` AND p.birth_date <= $${++paramIndex}`;
        params.push(upper.toISOString().split("T")[0]);
      }
    }

    // Fame rating filter
    if (fameRating !== undefined && fameRating !== "" && !isNaN(parseInt(fameRating))) {
      query += ` AND p.fame_rating >= $${++paramIndex}`;
      params.push(parseInt(fameRating));
    }

    // Distance filter
    if (distance !== undefined && !isNaN(parseInt(distance))) {
      query += ` AND (
        l.latitude IS NOT NULL AND l.longitude IS NOT NULL AND
        (
          6371 * 2 * ASIN(
            SQRT(
              POWER(SIN(RADIANS(l.latitude - lv.latitude) / 2), 2) +
              COS(RADIANS(lv.latitude)) * COS(RADIANS(l.latitude)) * POWER(SIN(RADIANS(l.longitude - lv.longitude) / 2), 2)
            )
          )
        ) <= $${++paramIndex}
      )`;
      params.push(parseInt(distance));
    }

    // Tags filter
    if (tags) {
      const tagList = Array.isArray(tags)
        ? tags
        : String(tags)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
      if (tagList.length > 0) {
        query += ` AND EXISTS (
          SELECT 1
          FROM user_tags ut2
          JOIN tags t2 ON t2.id = ut2.tag_id
          WHERE ut2.user_id = u.id AND t2.name = ANY($${++paramIndex})
        )`;
        params.push(tagList);
      }
    }

    // Group by clause - different for lite vs full response
    if (useLiteResponse) {
      query += ` GROUP BY 
          u.id, u.username, ph.url, p.birth_date, p.gender, p.fame_rating, l.city, l.country,
          l.latitude, l.longitude, lv.latitude, lv.longitude
        ORDER BY p.fame_rating DESC, u.created_at DESC
        LIMIT $1 OFFSET $2
      `;
    } else {
      query += ` GROUP BY 
          u.id, u.email, u.username, u.first_name, u.last_name, u.created_at, u.updated_at,
          p.birth_date, p.gender, p.sexual_orientation, p.bio, p.fame_rating, p.last_active,
          ph.url,
          l.latitude, l.longitude, l.city, l.country,
          lv.latitude, lv.longitude
        ORDER BY p.fame_rating DESC, u.created_at DESC
        LIMIT $1 OFFSET $2
      `;
    }

    // Count query with same filters
    let countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN locations l ON u.id = l.user_id
      LEFT JOIN locations lv ON lv.user_id = $1
      WHERE COALESCE(u.email_verified, true) = true AND u.id != $1
    `;

    // Parameters for count query
    const countParams = [currentUserId];
    let countParamIndex = 1;

    // Apply same filters to count query
    if (ageMax || ageMin) {
      const today = new Date();
      const aMin = parseInt(ageMin);
      const aMax = parseInt(ageMax);

      if (aMax !== undefined && !isNaN(aMax)) {
        const lower = new Date(today);
        lower.setFullYear(today.getFullYear() - (aMax + 1));
        lower.setDate(lower.getDate() + 1);
        countQuery += ` AND p.birth_date >= $${++countParamIndex}`;
        countParams.push(lower.toISOString().split("T")[0]);
      }

      if (aMin !== undefined && !isNaN(aMin)) {
        const upper = new Date(today);
        upper.setFullYear(today.getFullYear() - aMin);
        countQuery += ` AND p.birth_date <= $${++countParamIndex}`;
        countParams.push(upper.toISOString().split("T")[0]);
      }
    }

    if (fameRating !== undefined && fameRating !== "" && !isNaN(parseInt(fameRating))) {
      countQuery += ` AND p.fame_rating >= $${++countParamIndex}`;
      countParams.push(parseInt(fameRating));
    }

    if (distance !== undefined && !isNaN(parseInt(distance))) {
      countQuery += ` AND (
        l.latitude IS NOT NULL AND l.longitude IS NOT NULL AND
        (
          6371 * 2 * ASIN(
            SQRT(
              POWER(SIN(RADIANS(l.latitude - lv.latitude) / 2), 2) +
              COS(RADIANS(lv.latitude)) * COS(RADIANS(l.latitude)) * POWER(SIN(RADIANS(l.longitude - lv.longitude) / 2), 2)
            )
          )
        ) <= $${++countParamIndex}
      )`;
      countParams.push(parseInt(distance));
    }

    if (tags) {
      const tagList = Array.isArray(tags)
        ? tags
        : String(tags)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
      if (tagList.length > 0) {
        countQuery += ` AND EXISTS (
          SELECT 1
          FROM user_tags ut2
          JOIN tags t2 ON t2.id = ut2.tag_id
          WHERE ut2.user_id = u.id AND t2.name = ANY($${++countParamIndex})
        )`;
        countParams.push(tagList);
      }
    }

    // Execute both queries in parallel
    const [profilesResult, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, countParams)
    ]);

    // Transform the data based on whether we're using lite response
    const profiles = profilesResult.rows.map((row) => {
      if (useLiteResponse) {
        // Lite response structure
        return {
          id: row.id,
          username: row.username,
          profilePhotoUrl: row.profile_photo_url,
          profile: {
            birthDate: row.birth_date,
            gender: row.gender,
            fameRating: row.fame_rating,
          },
          location: {
            city: row.city,
            country: row.country,
          },
          distanceKm: row.distance_km !== null && row.distance_km !== undefined
            ? Math.round(Number(row.distance_km))
            : null,
          tags: row.tags || [],
        };
      } else {
        // Full response structure
        return {
          id: row.id,
          email: row.email,
          username: row.username,
          firstName: row.first_name,
          lastName: row.last_name,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          profile: {
            birthDate: row.birth_date,
            gender: row.gender,
            orientation: row.sexual_orientation,
            bio: row.bio,
            fameRating: row.fame_rating,
            lastActive: row.last_active,
          },
          profilePhotoUrl: row.profile_photo_url,
          location: {
            latitude: row.latitude,
            longitude: row.longitude,
            city: row.city,
            country: row.country,
          },
          tags: row.tags || [],
        };
      }
    });

    // Calculate pagination metadata
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    // Send paginated response
    const paginatedResponse = {
      data: profiles,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };

    res.json(paginatedResponse);
  } catch (error) {
    console.error("Error fetching profiles:", error);
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
  getAllProfiles,
};
