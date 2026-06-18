const User = require("../models/User");
const Profile = require("../models/Profile");
const Photo = require("../models/Photo");
const Location = require("../models/Location");
const db = require("../config/db");

// Small helper to safely parse integers from query params. Returns fallback when parsing fails.
function safeParseInt(value, fallback = undefined) {
  const n = parseInt(value);
  return Number.isNaN(n) ? fallback : n;
}

// Helper: fetch current user's gender & orientation (support both schema variants)
async function fetchViewerProfile(userId) {
  const q = `SELECT gender, sexual_orientation as orientation FROM profiles WHERE user_id = $1 LIMIT 1`;
  try {
    const result = await db.query(q, [userId]);
    if (result.rows.length === 0) return { gender: null, orientation: null };
    return {
      gender: result.rows[0].gender,
      orientation: result.rows[0].orientation,
    };
  } catch (e) {
    console.error("Error fetching viewer profile for orientation filter:", e);
    return { gender: null, orientation: null };
  }
}

// Helper: compute allowed genders array based on viewer gender & orientation
// Simplified logic:
// orientation values assumed: 'straight', 'gay', 'lesbian', 'bisexual', 'bi', 'pan', 'other'
// genders assumed: 'male', 'female', 'non-binary'
function computeAllowedGenders(viewerGender, orientation) {
  if (!viewerGender || !orientation) return [];
  let g = viewerGender.toLowerCase();
  let o = orientation.toLowerCase();
  if (g === "other") g = "non-binary";
  if (o === "hetero") o = "straight";
  if (["bisexual", "bi", "pan", "pansexual"].includes(o)) {
    return ["male", "female", "non-binary"];
  }
  if (o === "straight") {
    if (g === "male") return ["female"];
    if (g === "female") return ["male"];
    // non-binary straight: show opposite binary genders
    if (g === "non-binary") return ["male", "female"];
  }
  if (["gay", "homosexual"].includes(o)) {
    if (g === "male") return ["male"];
    if (g === "female") return ["female"];
    if (g === "non-binary") return ["non-binary"];
  }
  if (["lesbian"].includes(o)) {
    // lesbian only female-female
    return g === "female" ? ["female"] : [];
  }
  // fallback: no restriction
  return [];
}

// Get users for discovery/search
const getDiscoveryUsers = async (req, res) => {
  try {
    // Get query parameters
    const { limit = 20, offset = 0, lite } = req.query;

    // Determine if we should use lite response
    const useLiteResponse = lite === 'true' || lite === true || lite === '1';

    // Log the current user
    console.log("Current user:", req.user);

    // Query to get users with their profiles, photos, and locations
    // Orientation-based gender filtering
    const viewerProfile = await fetchViewerProfile(req.user.id);
    console.log("Viewer profile (orientation filter):", viewerProfile);
    const allowedGenders = computeAllowedGenders(
      viewerProfile.gender,
      viewerProfile.orientation
    );
    console.log("Allowed genders derived:", allowedGenders);

    let genderFilterClause = "";
    const params = [safeParseInt(limit, 20), safeParseInt(offset, 0), req.user.id];
    if (allowedGenders.length > 0) {
      genderFilterClause = " AND (LOWER(p.gender) = ANY($4))";
      params.push(allowedGenders.map((g) => g.toLowerCase()));
    }

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
          /* distance in km between viewer and candidate; null if missing coords */
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
        LEFT JOIN locations lv ON lv.user_id = $3
        WHERE COALESCE(u.email_verified, true) = true AND u.id != $3
        AND NOT EXISTS (
          SELECT 1 FROM passes ps WHERE ps.viewer_id = $3 AND ps.passed_user_id = u.id
        ) AND NOT EXISTS (
          SELECT 1 FROM blocks b WHERE (b.user_id = $3 AND b.blocked_user_id = u.id) OR (b.user_id = u.id AND b.blocked_user_id = $3)
        )
        AND NOT EXISTS (
          SELECT 1 FROM profile_views pv WHERE pv.viewer_id = $3 AND pv.viewed_user_id = u.id
        )
        ${genderFilterClause}
        GROUP BY 
          u.id, u.username, ph.url, p.birth_date, p.gender, p.fame_rating, 
          l.city, l.country, l.latitude, l.longitude, lv.latitude, lv.longitude
        ORDER BY p.fame_rating DESC, u.created_at DESC
        LIMIT $1 OFFSET $2
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
        LEFT JOIN locations lv ON lv.user_id = $3
        LEFT JOIN user_tags ut ON u.id = ut.user_id
        LEFT JOIN tags t ON t.id = ut.tag_id
    WHERE COALESCE(u.email_verified, true) = true AND u.id != $3
        AND NOT EXISTS (
          SELECT 1 FROM passes ps WHERE ps.viewer_id = $3 AND ps.passed_user_id = u.id
        ) AND NOT EXISTS (
          SELECT 1 FROM blocks b WHERE (b.user_id = $3 AND b.blocked_user_id = u.id) OR (b.user_id = u.id AND b.blocked_user_id = $3)
        )
        AND NOT EXISTS (
          SELECT 1 FROM profile_views pv WHERE pv.viewer_id = $3 AND pv.viewed_user_id = u.id
        )
        ${genderFilterClause}
        GROUP BY 
          u.id, u.email, u.username, u.first_name, u.last_name, u.created_at, u.updated_at,
          p.birth_date, p.gender, p.sexual_orientation, p.bio, p.fame_rating, p.last_active,
          ph.url,
          l.latitude, l.longitude, l.city, l.country,
          lv.latitude, lv.longitude
        ORDER BY p.fame_rating DESC, u.created_at DESC
        LIMIT $1 OFFSET $2
      `;
    }

    const result = await db.query(query, params);
    if (result.rows.length === 0 && allowedGenders.length > 0) {
      console.log(
        "[Discovery] No users found with allowed genders:",
        allowedGenders,
        "Viewer:",
        viewerProfile
      );
    }

    // Log the number of users found
    console.log(
      `Found ${result.rows.length} users for discovery (excluding current user)`
    );

    // Transform the data based on whether we're using lite response
    const users = result.rows.map((row) => {
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
          distanceKm:
            row.distance_km !== null && row.distance_km !== undefined
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

    // Log the transformed users
    console.log("Transformed users:", users);

    // Check if pagination parameters are provided
    if (req.query.page !== undefined || req.query.limit !== undefined) {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;
      
      // Query to get total count for proper pagination
      let countQuery = `
        SELECT COUNT(*) as total
        FROM users u
        LEFT JOIN profiles p ON u.id = p.user_id
        LEFT JOIN locations l ON u.id = l.user_id
        WHERE COALESCE(u.email_verified, true) = true AND u.id != $1
        AND NOT EXISTS (
          SELECT 1 FROM passes ps WHERE ps.viewer_id = $1 AND ps.passed_user_id = u.id
        ) AND NOT EXISTS (
          SELECT 1 FROM blocks b WHERE (b.user_id = $1 AND b.blocked_user_id = u.id) OR (b.user_id = u.id AND b.blocked_user_id = $1)
        )
        AND NOT EXISTS (
          SELECT 1 FROM profile_views pv WHERE pv.viewer_id = $1 AND pv.viewed_user_id = u.id
        )
      `;

      let countParams = [req.user.id];
      let countParamIndex = 1;

      if (allowedGenders.length > 0) {
        countQuery += ` AND (LOWER(p.gender) = ANY($${++countParamIndex}))`;
        countParams.push(allowedGenders.map((g) => g.toLowerCase()));
      }

      const countResult = await db.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);
      
      const paginatedResponse = {
        data: users,
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
    } else {
      // Maintain backward compatibility
      res.json(users);
    }
  } catch (error) {
    console.error("Error fetching discovery users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get a random set of users for discovery
const getRandomUsers = async (req, res) => {
  try {
  const { limit = 9 } = req.query;
    console.log("Current user (random):", req.user);
    const viewerProfile = await fetchViewerProfile(req.user.id);
    console.log("Viewer profile (random/orientation filter):", viewerProfile);
    const allowedGenders = computeAllowedGenders(
      viewerProfile.gender,
      viewerProfile.orientation
    );
    console.log("Allowed genders (random):", allowedGenders);

  let genderFilterClause = "";
  const params = [safeParseInt(limit, 9), req.user.id];
    if (allowedGenders.length > 0) {
      genderFilterClause = " AND (LOWER(p.gender) = ANY($3))";
      params.push(allowedGenders.map((g) => g.toLowerCase()));
    }

    const query = `
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
        l.city,
        l.country,
        array_remove(array_agg(DISTINCT t.name), NULL) as tags
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN photos ph ON u.id = ph.user_id AND ph.is_profile = true
      LEFT JOIN locations l ON u.id = l.user_id
      LEFT JOIN locations lv ON lv.user_id = $2
      LEFT JOIN user_tags ut ON u.id = ut.user_id
      LEFT JOIN tags t ON t.id = ut.tag_id
  WHERE COALESCE(u.email_verified, true) = true AND u.id != $2
      AND NOT EXISTS (
        SELECT 1 FROM passes ps WHERE ps.viewer_id = $2 AND ps.passed_user_id = u.id
        ) AND NOT EXISTS (
          SELECT 1 FROM blocks b WHERE (b.user_id = $2 AND b.blocked_user_id = u.id) OR (b.user_id = u.id AND b.blocked_user_id = $2)
      )
      AND NOT EXISTS (
        SELECT 1 FROM profile_views pv WHERE pv.viewer_id = $2 AND pv.viewed_user_id = u.id
      )
      ${genderFilterClause}
      GROUP BY 
        u.id, u.email, u.username, u.first_name, u.last_name, u.created_at, u.updated_at,
        p.birth_date, p.gender, p.sexual_orientation, p.bio, p.fame_rating, p.last_active,
        ph.url,
        l.latitude, l.longitude, l.city, l.country,
        lv.latitude, lv.longitude
      ORDER BY RANDOM()
      LIMIT $1
    `;

    const result = await db.query(query, params);
    if (result.rows.length === 0 && allowedGenders.length > 0) {
      console.log(
        "[Random] No users found with allowed genders:",
        allowedGenders,
        "Viewer:",
        viewerProfile
      );
    }

    // Log the number of users found
    console.log(
      `Found ${result.rows.length} random users for discovery (excluding current user)`
    );

    // Transform the data to match the frontend's expected format
    const users = result.rows.map((row) => ({
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
      distanceKm:
        row.distance_km !== null && row.distance_km !== undefined
          ? Math.round(Number(row.distance_km))
          : null,
    }));

    // Log the transformed users
    console.log("Transformed random users:", users);

    res.json(users);
  } catch (error) {
    console.error("Error fetching random users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Search users by name
const searchUsers = async (req, res) => {
  try {
    const { query: searchQuery, limit = 20, offset = 0, lite } = req.query;

    if (!searchQuery) {
      return res.status(400).json({ message: "Query parameter is required" });
    }

    // Determine if we should use lite response
    const useLiteResponse = lite === 'true' || lite === true || lite === '1';

    // Log the current user
    console.log("Current user (search):", req.user);
    console.log("Search query:", searchQuery);

    // Query to search users by username, first name, or last name
    const viewerProfile = await fetchViewerProfile(req.user.id);
    const allowedGenders = computeAllowedGenders(
      viewerProfile.gender,
      viewerProfile.orientation
    );
    console.log("Viewer profile (search/orientation filter):", viewerProfile);
    console.log("Allowed genders (search):", allowedGenders);

    // Build the search query - parameters will be:
    // $1: limit, $2: offset, $3: search query, $4: user id, $5: gender array (if any)
    const baseQuery = useLiteResponse 
      ? `
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
           LIMIT 5
          ) as tags
        FROM users u
        LEFT JOIN profiles p ON u.id = p.user_id
        LEFT JOIN photos ph ON u.id = ph.user_id AND ph.is_profile = true
        LEFT JOIN locations l ON u.id = l.user_id
        LEFT JOIN locations lv ON lv.user_id = $4
        WHERE COALESCE(u.email_verified, true) = true
              AND (u.username ILIKE $3 OR u.first_name ILIKE $3 OR u.last_name ILIKE $3)
              AND u.id != $4
              AND NOT EXISTS (
                SELECT 1 FROM passes ps WHERE ps.viewer_id = $4 AND ps.passed_user_id = u.id
        ) AND NOT EXISTS (
          SELECT 1 FROM blocks b WHERE (b.user_id = $4 AND b.blocked_user_id = u.id) OR (b.user_id = u.id AND b.blocked_user_id = $4)
              )
              AND NOT EXISTS (
                SELECT 1 FROM profile_views pv WHERE pv.viewer_id = $4 AND pv.viewed_user_id = u.id
              )
      `
      : `
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
          l.city,
          l.country,
          array_remove(array_agg(DISTINCT t.name), NULL) as tags
        FROM users u
        LEFT JOIN profiles p ON u.id = p.user_id
        LEFT JOIN photos ph ON u.id = ph.user_id AND ph.is_profile = true
        LEFT JOIN locations l ON u.id = l.user_id
        LEFT JOIN locations lv ON lv.user_id = $4
        LEFT JOIN user_tags ut ON u.id = ut.user_id
        LEFT JOIN tags t ON t.id = ut.tag_id
        WHERE COALESCE(u.email_verified, true) = true
              AND (u.username ILIKE $3 OR u.first_name ILIKE $3 OR u.last_name ILIKE $3)
              AND u.id != $4
              AND NOT EXISTS (
                SELECT 1 FROM passes ps WHERE ps.viewer_id = $4 AND ps.passed_user_id = u.id
        ) AND NOT EXISTS (
          SELECT 1 FROM blocks b WHERE (b.user_id = $4 AND b.blocked_user_id = u.id) OR (b.user_id = u.id AND b.blocked_user_id = $4)
              )
              AND NOT EXISTS (
                SELECT 1 FROM profile_views pv WHERE pv.viewer_id = $4 AND pv.viewed_user_id = u.id
              )
      `;

    // Build parameters in the correct order
    const params = [
      safeParseInt(limit, 20),  // $1: limit
      safeParseInt(offset, 0),  // $2: offset
      `%${searchQuery}%`,       // $3: search query
      req.user.id,              // $4: user id
    ];

    // Add gender filter to query if needed
    let fullQuery = baseQuery;
    if (allowedGenders.length > 0) {
      params.push(allowedGenders.map((g) => g.toLowerCase())); // Add to params as next position
      fullQuery += ` AND (LOWER(p.gender) = ANY($${params.length}))`; // Reference correct parameter number
    }

    // Add GROUP BY and ORDER BY (and LIMIT/OFFSET) clauses
    if (useLiteResponse) {
      fullQuery += `
        GROUP BY 
          u.id, u.username, ph.url, p.birth_date, p.gender, p.fame_rating, 
          l.city, l.country, l.latitude, l.longitude, lv.latitude, lv.longitude
        ORDER BY p.fame_rating DESC, u.created_at DESC
        LIMIT $1 OFFSET $2
      `;
    } else {
      fullQuery += `
        GROUP BY 
          u.id, u.email, u.username, u.first_name, u.last_name, u.created_at, u.updated_at,
          p.birth_date, p.gender, p.sexual_orientation, p.bio, p.fame_rating, p.last_active,
          ph.url,
          l.latitude, l.longitude, l.city, l.country,
          lv.latitude, lv.longitude
        ORDER BY p.fame_rating DESC, u.created_at DESC
        LIMIT $1 OFFSET $2
      `;
    }

    console.log("Search query:", fullQuery);
    console.log("Search params:", params);

    const result = await db.query(fullQuery, params);
    if (result.rows.length === 0 && allowedGenders.length > 0) {
      console.log(
        "[Search] No users found with allowed genders:",
        allowedGenders,
        "Viewer:",
        viewerProfile
      );
    }

    // Log the number of users found
    console.log(
      `Found ${result.rows.length} users for search (excluding current user)`
    );

    // Transform the data to match the frontend's expected format based on lite response
    const users = result.rows.map((row) => {
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
          distanceKm:
            row.distance_km !== null && row.distance_km !== undefined
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
          distanceKm:
            row.distance_km !== null && row.distance_km !== undefined
              ? Math.round(Number(row.distance_km))
              : null,
          tags: row.tags || [],
        };
      }
    });

    // Log the transformed users
    console.log("Transformed search users:", users);

    // Count query - parameters will be:
    // $1: search query, $2: user id, $3: gender array (if any)
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN locations l ON u.id = l.user_id
      LEFT JOIN locations lv ON lv.user_id = $2
      WHERE COALESCE(u.email_verified, true) = true
            AND (u.username ILIKE $1 OR u.first_name ILIKE $1 OR u.last_name ILIKE $1)
            AND u.id != $2
            AND NOT EXISTS (
              SELECT 1 FROM passes ps WHERE ps.viewer_id = $2 AND ps.passed_user_id = u.id
        ) AND NOT EXISTS (
          SELECT 1 FROM blocks b WHERE (b.user_id = $2 AND b.blocked_user_id = u.id) OR (b.user_id = u.id AND b.blocked_user_id = $2)
            )
            AND NOT EXISTS (
              SELECT 1 FROM profile_views pv WHERE pv.viewer_id = $2 AND pv.viewed_user_id = u.id
            )
    `;

    // Build count parameters
    const countParams = [
      `%${searchQuery}%`,  // $1: search query
      req.user.id,         // $2: user id
    ];

    // Add gender filter to count query if needed
    let fullCountQuery = countQuery;
    if (allowedGenders.length > 0) {
      countParams.push(allowedGenders.map((g) => g.toLowerCase())); // Add to countParams as next position
      fullCountQuery += ` AND (LOWER(p.gender) = ANY($${countParams.length}))`; // Reference correct parameter number
    }

    console.log("Count query:", fullCountQuery);
    console.log("Count params:", countParams);

    const countResult = await db.query(fullCountQuery, countParams);
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    // Format paginated response
    const paginatedResponse = {
      data: users,
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit: limit,
        total: total,
        totalPages,
        hasNext: (offset + limit) < total,
        hasPrev: offset > 0
      }
    };

    res.json(paginatedResponse);
  } catch (error) {
    console.error("Error searching users:", error);
    console.error("Stack trace:", error.stack);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get filtered users for discovery
const getFilteredUsers = async (req, res) => {
  try {
    const { limit = 20, offset = 0, lite } = req.query;
    const { ageMin, ageMax, distance, tags, sortBy, sortOrder, fameRating } =
      req.query;

    // Determine if we should use lite response
    const useLiteResponse = lite === 'true' || lite === true || lite === '1';

    console.log("Current user (filtered):", req.user);
    console.log("Filters:", {
      ageMin,
      ageMax,
      distance,
      tags,
      sortBy,
      sortOrder,
      fameRating,
    });

    // Orientation filter
    const viewerProfile = await fetchViewerProfile(req.user.id);
    const allowedGenders = computeAllowedGenders(
      viewerProfile.gender,
      viewerProfile.orientation
    );
    console.log(
      "Viewer profile (filtered/orientation):",
      viewerProfile,
      "Allowed genders:",
      allowedGenders
    );

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
        LEFT JOIN locations lv ON lv.user_id = $1
        WHERE u.email_verified = true AND u.id != $1
        AND NOT EXISTS (
          SELECT 1 FROM passes ps WHERE ps.viewer_id = $1 AND ps.passed_user_id = u.id
        ) AND NOT EXISTS (
          SELECT 1 FROM blocks b WHERE (b.user_id = $1 AND b.blocked_user_id = u.id) OR (b.user_id = u.id AND b.blocked_user_id = $1)
        )
        AND NOT EXISTS (
          SELECT 1 FROM profile_views pv WHERE pv.viewer_id = $1 AND pv.viewed_user_id = u.id
        )
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
          l.city,
          l.country,
    array_remove(array_agg(DISTINCT t.name), NULL) as tags
        FROM users u
        LEFT JOIN profiles p ON u.id = p.user_id
        LEFT JOIN photos ph ON u.id = ph.user_id AND ph.is_profile = true
        LEFT JOIN locations l ON u.id = l.user_id
        LEFT JOIN locations lv ON lv.user_id = $1
        LEFT JOIN user_tags ut ON u.id = ut.user_id
        LEFT JOIN tags t ON t.id = ut.tag_id
        WHERE u.email_verified = true AND u.id != $1
        AND NOT EXISTS (
          SELECT 1 FROM passes ps WHERE ps.viewer_id = $1 AND ps.passed_user_id = u.id
        ) AND NOT EXISTS (
          SELECT 1 FROM blocks b WHERE (b.user_id = $1 AND b.blocked_user_id = u.id) OR (b.user_id = u.id AND b.blocked_user_id = $1)
        )
        AND NOT EXISTS (
          SELECT 1 FROM profile_views pv WHERE pv.viewer_id = $1 AND pv.viewed_user_id = u.id
        )
      `;
    }

    const params = [req.user.id];
    let paramIndex = 1;

    if (allowedGenders.length > 0) {
      params.push(allowedGenders.map((g) => g.toLowerCase()));
      query += ` AND (LOWER(p.gender) = ANY($${params.length}))`;
    }

    // Age filters (convert ages to birth_date bounds)
    if (ageMax || ageMin) {
      const today = new Date();
      const aMin = safeParseInt(ageMin, undefined);
      const aMax = safeParseInt(ageMax, undefined);

      // Oldest acceptable birthdate (lower bound): today - (aMax + 1) years + 1 day
      if (aMax !== undefined) {
        const lower = new Date(today);
        lower.setFullYear(today.getFullYear() - (aMax + 1));
        lower.setDate(lower.getDate() + 1);
        query += ` AND p.birth_date >= $${++paramIndex}`;
        params.push(lower.toISOString().split("T")[0]);
      }

      // Youngest acceptable birthdate (upper bound): today - aMin years
      if (aMin !== undefined) {
        const upper = new Date(today);
        upper.setFullYear(today.getFullYear() - aMin);
        query += ` AND p.birth_date <= $${++paramIndex}`;
        params.push(upper.toISOString().split("T")[0]);
      }
    }

    // Fame rating
    if (
      fameRating !== undefined &&
      fameRating !== "" &&
      !Number.isNaN(safeParseInt(fameRating))
    ) {
      query += ` AND p.fame_rating >= $${++paramIndex}`;
      params.push(safeParseInt(fameRating, 0));
    }

    if (distance && !Number.isNaN(safeParseInt(distance))) {
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
      params.push(safeParseInt(distance, 0));
    }
    // Tags filter (match users having at least one of the provided tag names)
    if (tags) {
      const tagList = Array.isArray(tags)
        ? tags
        : String(tags)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
      if (tagList.length > 0) {
        params.push(tagList);
        query += ` AND EXISTS (
          SELECT 1
          FROM user_tags ut2
          JOIN tags t2 ON t2.id = ut2.tag_id
          WHERE ut2.user_id = u.id AND t2.name = ANY($${params.length})
        )`;
      }
    }

    // Group by and order by clause - different for lite vs full response
    if (useLiteResponse) {
      query += ` GROUP BY 
          u.id, u.username, ph.url, p.birth_date, p.gender, p.fame_rating, 
          l.city, l.country, l.latitude, l.longitude, lv.latitude, lv.longitude
        ORDER BY `;
    } else {
      query += ` GROUP BY 
          u.id, u.email, u.username, u.first_name, u.last_name, u.created_at, u.updated_at,
          p.birth_date, p.gender, p.sexual_orientation, p.bio, p.fame_rating, p.last_active,
          ph.url,
          l.latitude, l.longitude, l.city, l.country,
          lv.latitude, lv.longitude
        ORDER BY `;
    }

    switch (sortBy) {
      case "distance":
        query += "distance_km ";
        query += sortOrder === "desc" ? "DESC " : "ASC ";
        break;
      case "age":
        query += "p.birth_date ";
        // Inversion logique: pour âge asc (plus jeune d'abord) => birth_date DESC
        if (sortOrder === "asc") {
          query += "DESC ";
        } else {
          query += "ASC ";
        }
        break;
      case "tags":
        query += "u.created_at ";
        break;
      case "fame":
      default:
        query += "p.fame_rating ";
        query += sortOrder === "asc" ? "ASC " : "DESC ";
        break;
    }

    // LIMIT / OFFSET
    query += `LIMIT $${++paramIndex} OFFSET $${++paramIndex}`;
    params.push(safeParseInt(limit, 20), safeParseInt(offset, 0));

    console.log("Final query:", query);
    console.log("Parameters:", params);

    const result = await db.query(query, params);
    if (result.rows.length === 0 && allowedGenders.length > 0) {
      console.log(
        "[Filtered] No users found with allowed genders:",
        allowedGenders,
        "Viewer:",
        viewerProfile
      );
    }

    // Transform the data based on whether we're using lite response
    const users = result.rows.map((row) => {
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
          distanceKm:
            row.distance_km !== null && row.distance_km !== undefined
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
    // isVerified column may not exist in some schemas; avoid failing if absent
    isVerified: typeof row.is_verified !== 'undefined' ? row.is_verified : false,
            lastActive: row.last_active,
          },
          profilePhotoUrl: row.profile_photo_url,
          location: {
            latitude: row.latitude,
            longitude: row.longitude,
            city: row.city,
            country: row.country,
          },
          distanceKm:
            row.distance_km !== null && row.distance_km !== undefined
              ? Math.round(Number(row.distance_km))
              : null,
          tags: row.tags || [],
        };
      }
    });

    console.log("Transformed filtered users:", users);

    // Count total for pagination (with a separate query for accuracy)
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN locations l ON u.id = l.user_id
      LEFT JOIN locations lv ON lv.user_id = $1
      WHERE u.email_verified = true AND u.id != $1
      AND NOT EXISTS (
        SELECT 1 FROM passes ps WHERE ps.viewer_id = $1 AND ps.passed_user_id = u.id
        ) AND NOT EXISTS (
          SELECT 1 FROM blocks b WHERE (b.user_id = $1 AND b.blocked_user_id = u.id) OR (b.user_id = u.id AND b.blocked_user_id = $1)
      )
      AND NOT EXISTS (
        SELECT 1 FROM profile_views pv WHERE pv.viewer_id = $1 AND pv.viewed_user_id = u.id
      )
    `;

    let countParams = [req.user.id];
    paramIndex = 1;

    if (allowedGenders.length > 0) {
      params.push(allowedGenders.map((g) => g.toLowerCase()));
      countQuery += ` AND (LOWER(p.gender) = ANY($${countParams.length}))`;
    }

    if (ageMax || ageMin) {
      const today = new Date();
      const aMin = safeParseInt(ageMin, undefined);
      const aMax = safeParseInt(ageMax, undefined);

      if (aMax !== undefined) {
        const lower = new Date(today);
        lower.setFullYear(today.getFullYear() - (aMax + 1));
        lower.setDate(lower.getDate() + 1);
        countParams.push(lower.toISOString().split("T")[0]);
        countQuery += ` AND p.birth_date >= $${countParams.length}`;
      }

      if (aMin !== undefined) {
        const upper = new Date(today);
        upper.setFullYear(today.getFullYear() - aMin);
        countParams.push(upper.toISOString().split("T")[0]);
        countQuery += ` AND p.birth_date <= $${countParams.length}`;
      }
    }

    if (
      fameRating !== undefined &&
      fameRating !== "" &&
      !Number.isNaN(safeParseInt(fameRating))
    ) {
      countParams.push(safeParseInt(fameRating, 0));
      countQuery += ` AND p.fame_rating >= $${countParams.length}`;
    }

    if (distance && !Number.isNaN(safeParseInt(distance))) {
      countParams.push(safeParseInt(distance, 0));
      countQuery += ` AND (
        l.latitude IS NOT NULL AND l.longitude IS NOT NULL AND
        (
          6371 * 2 * ASIN(
            SQRT(
              POWER(SIN(RADIANS(l.latitude - lv.latitude) / 2), 2) +
              COS(RADIANS(lv.latitude)) * COS(RADIANS(l.latitude)) * POWER(SIN(RADIANS(l.longitude - lv.longitude) / 2), 2)
            )
          )
        ) <= $${countParams.length}
      )`;
    }

    if (tags) {
      const tagList = Array.isArray(tags)
        ? tags
        : String(tags)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
      if (tagList.length > 0) {
        countParams.push(tagList);
        countQuery += ` AND EXISTS (
          SELECT 1
          FROM user_tags ut2
          JOIN tags t2 ON t2.id = ut2.tag_id
          WHERE ut2.user_id = u.id AND t2.name = ANY($${countParams.length})
        )`;
      }
    }

    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    // Format paginated response
    const paginatedResponse = {
      data: users,
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit: limit,
        total: total,
        totalPages,
        hasNext: (offset + limit) < total,
        hasPrev: offset > 0
      }
    };

    res.json(paginatedResponse);
  } catch (error) {
    console.error("Error fetching filtered users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get suggested users based on common interests, location, and activity
const getSuggestedUsers = async (req, res) => {
  try {
    const { limit = 20, offset = 0, lite } = req.query;
    const currentUserId = req.user.id;

    // Determine if we should use lite response
    const useLiteResponse = lite === 'true' || lite === true || lite === '1';

    // Parse additional filters that may be provided
    const { ageMin, ageMax, distance, tags, sortBy, sortOrder, fameRating } = req.query;

    console.log("Current user (suggested):", req.user);
    console.log("Filters:", {
      ageMin,
      ageMax,
      distance,
      tags,
      sortBy,
      sortOrder,
      fameRating,
    });

    // Orientation filter
    const viewerProfile = await fetchViewerProfile(req.user.id);
    const allowedGenders = computeAllowedGenders(
      viewerProfile.gender,
      viewerProfile.orientation
    );
    console.log(
      "Viewer profile (suggested/orientation):",
      viewerProfile,
      "Allowed genders:",
      allowedGenders
    );

    // Build query to get suggested users
    // Suggest users based on common tags, similar fame rating, recent activity, and proximity
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
          ) as tags,
          -- Calculate common tag count for relevance scoring
          (SELECT COUNT(*) FROM user_tags ut2 
           JOIN user_tags ut3 ON ut2.tag_id = ut3.tag_id 
           WHERE ut2.user_id = u.id AND ut3.user_id = $1) AS common_tags_count
        FROM users u
        LEFT JOIN profiles p ON u.id = p.user_id
        LEFT JOIN photos ph ON u.id = ph.user_id AND ph.is_profile = true
        LEFT JOIN locations l ON u.id = l.user_id
        LEFT JOIN locations lv ON lv.user_id = $1  -- Current user's location
        WHERE u.email_verified = true AND u.id != $1
        AND NOT EXISTS (
          SELECT 1 FROM passes ps WHERE ps.viewer_id = $1 AND ps.passed_user_id = u.id
        ) AND NOT EXISTS (
          SELECT 1 FROM blocks b WHERE (b.user_id = $1 AND b.blocked_user_id = u.id) OR (b.user_id = u.id AND b.blocked_user_id = $1)
        )
        AND NOT EXISTS (
          SELECT 1 FROM profile_views pv WHERE pv.viewer_id = $1 AND pv.viewed_user_id = u.id
        )
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
          l.city,
          l.country,
          array_remove(array_agg(DISTINCT t.name), NULL) as tags,
          -- Calculate common tag count for relevance scoring
          (SELECT COUNT(*) FROM user_tags ut2 
           JOIN user_tags ut3 ON ut2.tag_id = ut3.tag_id 
           WHERE ut2.user_id = u.id AND ut3.user_id = $1) AS common_tags_count
        FROM users u
        LEFT JOIN profiles p ON u.id = p.user_id
        LEFT JOIN photos ph ON u.id = ph.user_id AND ph.is_profile = true
        LEFT JOIN locations l ON u.id = l.user_id
        LEFT JOIN locations lv ON lv.user_id = $1  -- Current user's location
        LEFT JOIN user_tags ut ON u.id = ut.user_id
        LEFT JOIN tags t ON t.id = ut.tag_id
        WHERE u.email_verified = true AND u.id != $1
        AND NOT EXISTS (
          SELECT 1 FROM passes ps WHERE ps.viewer_id = $1 AND ps.passed_user_id = u.id
        ) AND NOT EXISTS (
          SELECT 1 FROM blocks b WHERE (b.user_id = $1 AND b.blocked_user_id = u.id) OR (b.user_id = u.id AND b.blocked_user_id = $1)
        )
        AND NOT EXISTS (
          SELECT 1 FROM profile_views pv WHERE pv.viewer_id = $1 AND pv.viewed_user_id = u.id
        )
      `;
    }

    const params = [currentUserId];
    let paramIndex = 1;

    // Gender filter based on orientation
    if (allowedGenders.length > 0) {
      params.push(allowedGenders.map((g) => g.toLowerCase()));
      query += ` AND (LOWER(p.gender) = ANY($${params.length}))`;
    }

    // Age filters (convert ages to birth_date bounds)
    if (ageMax || ageMin) {
      const today = new Date();
      const aMin = safeParseInt(ageMin, undefined);
      const aMax = safeParseInt(ageMax, undefined);

      // Oldest acceptable birthdate (lower bound): today - (aMax + 1) years + 1 day
      if (aMax !== undefined) {
        const lower = new Date(today);
        lower.setFullYear(today.getFullYear() - (aMax + 1));
        lower.setDate(lower.getDate() + 1);
        query += ` AND p.birth_date >= $${++paramIndex}`;
        params.push(lower.toISOString().split("T")[0]);
      }

      // Youngest acceptable birthdate (upper bound): today - aMin years
      if (aMin !== undefined) {
        const upper = new Date(today);
        upper.setFullYear(today.getFullYear() - aMin);
        query += ` AND p.birth_date <= $${++paramIndex}`;
        params.push(upper.toISOString().split("T")[0]);
      }
    }

    // Fame rating filter
    if (
      fameRating !== undefined &&
      fameRating !== "" &&
      !Number.isNaN(safeParseInt(fameRating))
    ) {
      query += ` AND p.fame_rating >= $${++paramIndex}`;
      params.push(safeParseInt(fameRating, 0));
    }

    // Distance filter
    if (distance && !Number.isNaN(safeParseInt(distance))) {
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
      params.push(safeParseInt(distance, 0));
    }

    // Tags filter (match users having at least one of the provided tag names)
    if (tags) {
      const tagList = Array.isArray(tags)
        ? tags
        : String(tags)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
      if (tagList.length > 0) {
        params.push(tagList);
        query += ` AND EXISTS (
          SELECT 1
          FROM user_tags ut2
          JOIN tags t2 ON t2.id = ut2.tag_id
          WHERE ut2.user_id = u.id AND t2.name = ANY($${params.length})
        )`;
      }
    }

    // Group by clause - different for lite vs full response
    if (useLiteResponse) {
      query += ` GROUP BY 
          u.id, u.username, ph.url, p.birth_date, p.gender, p.fame_rating, 
          l.city, l.country, l.latitude, l.longitude, lv.latitude, lv.longitude
        ORDER BY `;
    } else {
      query += ` GROUP BY 
          u.id, u.email, u.username, u.first_name, u.last_name, u.created_at, u.updated_at,
          p.birth_date, p.gender, p.sexual_orientation, p.bio, p.fame_rating, p.last_active,
          ph.url,
          l.latitude, l.longitude, l.city, l.country,
          lv.latitude, lv.longitude
        ORDER BY `;
    }

    // Ordering: prioritize users with common tags, then by fame rating, then by recency
    if (sortBy) {
      // Apply sorting based on parameters if provided
      switch (sortBy) {
        case "distance":
          query += "distance_km ";
          query += sortOrder === "desc" ? "DESC " : "ASC ";
          break;
        case "age":
          query += "p.birth_date ";
          // Inversion logique: pour âge asc (plus jeune d'abord) => birth_date DESC
          if (sortOrder === "asc") {
            query += "DESC ";
          } else {
            query += "ASC ";
          }
          break;
        case "tags":
          query += "common_tags_count ";
          query += sortOrder === "desc" ? "DESC " : "ASC ";
          break;
        case "fame":
        default:
          query += "p.fame_rating ";
          query += sortOrder === "desc" ? "DESC " : "ASC ";
          break;
      }
    } else {
      // Default suggested ordering: prioritize common tags, then fame rating, then recency
      query += "common_tags_count DESC, p.fame_rating DESC, p.last_active DESC NULLS LAST, u.created_at DESC ";
    }

    // LIMIT / OFFSET
    query += `LIMIT $${++paramIndex} OFFSET $${++paramIndex}`;
    params.push(safeParseInt(limit, 20), safeParseInt(offset, 0));

    console.log("Final suggested query:", query);
    console.log("Parameters:", params);

    const result = await db.query(query, params);
    if (result.rows.length === 0 && allowedGenders.length > 0) {
      console.log(
        "[Suggested] No users found with allowed genders:",
        allowedGenders,
        "Viewer:",
        viewerProfile
      );
    }

    // Transform the data based on whether we're using lite response
    const users = result.rows.map((row) => {
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
          distanceKm:
            row.distance_km !== null && row.distance_km !== undefined
              ? Math.round(Number(row.distance_km))
              : null,
          tags: row.tags || [],
          commonTagsCount: row.common_tags_count, // Include for transparency
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
            // isVerified column may not exist in some schemas; avoid failing if absent
            isVerified: typeof row.is_verified !== 'undefined' ? row.is_verified : false,
            lastActive: row.last_active,
          },
          profilePhotoUrl: row.profile_photo_url,
          location: {
            latitude: row.latitude,
            longitude: row.longitude,
            city: row.city,
            country: row.country,
          },
          distanceKm:
            row.distance_km !== null && row.distance_km !== undefined
              ? Math.round(Number(row.distance_km))
              : null,
          tags: row.tags || [],
          commonTagsCount: row.common_tags_count, // Include for transparency
        };
      }
    });

    console.log("Transformed suggested users:", users);

    // Count total for pagination (with a separate query for accuracy)
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN locations l ON u.id = l.user_id
      LEFT JOIN locations lv ON lv.user_id = $1
      WHERE u.email_verified = true AND u.id != $1
      AND NOT EXISTS (
        SELECT 1 FROM passes ps WHERE ps.viewer_id = $1 AND ps.passed_user_id = u.id
        ) AND NOT EXISTS (
          SELECT 1 FROM blocks b WHERE (b.user_id = $1 AND b.blocked_user_id = u.id) OR (b.user_id = u.id AND b.blocked_user_id = $1)
      )
      AND NOT EXISTS (
        SELECT 1 FROM profile_views pv WHERE pv.viewer_id = $1 AND pv.viewed_user_id = u.id
      )
    `;

    let countParams = [currentUserId];
    paramIndex = 1;

    if (allowedGenders.length > 0) {
      countParams.push(allowedGenders.map((g) => g.toLowerCase()));
      countQuery += ` AND (LOWER(p.gender) = ANY($${countParams.length}))`;
    }

    if (ageMax || ageMin) {
      const today = new Date();
      const aMin = safeParseInt(ageMin, undefined);
      const aMax = safeParseInt(ageMax, undefined);

      if (aMax !== undefined) {
        const lower = new Date(today);
        lower.setFullYear(today.getFullYear() - (aMax + 1));
        lower.setDate(lower.getDate() + 1);
        countParams.push(lower.toISOString().split("T")[0]);
        countQuery += ` AND p.birth_date >= $${countParams.length}`;
      }

      if (aMin !== undefined) {
        const upper = new Date(today);
        upper.setFullYear(today.getFullYear() - aMin);
        countParams.push(upper.toISOString().split("T")[0]);
        countQuery += ` AND p.birth_date <= $${countParams.length}`;
      }
    }

    if (
      fameRating !== undefined &&
      fameRating !== "" &&
      !Number.isNaN(safeParseInt(fameRating))
    ) {
      countParams.push(safeParseInt(fameRating, 0));
      countQuery += ` AND p.fame_rating >= $${countParams.length}`;
    }

    if (distance && !Number.isNaN(safeParseInt(distance))) {
      countParams.push(safeParseInt(distance, 0));
      countQuery += ` AND (
        l.latitude IS NOT NULL AND l.longitude IS NOT NULL AND
        (
          6371 * 2 * ASIN(
            SQRT(
              POWER(SIN(RADIANS(l.latitude - lv.latitude) / 2), 2) +
              COS(RADIANS(lv.latitude)) * COS(RADIANS(l.latitude)) * POWER(SIN(RADIANS(l.longitude - lv.longitude) / 2), 2)
            )
          )
        ) <= $${countParams.length}
      )`;
    }

    if (tags) {
      const tagList = Array.isArray(tags)
        ? tags
        : String(tags)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
      if (tagList.length > 0) {
        countParams.push(tagList);
        countQuery += ` AND EXISTS (
          SELECT 1
          FROM user_tags ut2
          JOIN tags t2 ON t2.id = ut2.tag_id
          WHERE ut2.user_id = u.id AND t2.name = ANY($${countParams.length})
        )`;
      }
    }

    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    // Format paginated response
    const paginatedResponse = {
      data: users,
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit: limit,
        total: total,
        totalPages: totalPages,
        hasNext: (offset + limit) < total,
        hasPrev: offset > 0
      }
    };

    res.json(paginatedResponse);
  } catch (error) {
    console.error("Error fetching suggested users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getDiscoveryUsers,
  getRandomUsers,
  searchUsers,
  getFilteredUsers,
  getSuggestedUsers,
};
