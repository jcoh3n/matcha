const User = require('../models/User');
const Profile = require('../models/Profile');
const Photo = require('../models/Photo');
const Location = require('../models/Location');
const db = require('../config/db');

// Helper: fetch current user's gender & orientation (support both schema variants)
async function fetchViewerProfile(userId) {
  const q = `SELECT gender, sexual_orientation as orientation FROM profiles WHERE user_id = $1 LIMIT 1`;
  try {
    const result = await db.query(q, [userId]);
    if (result.rows.length === 0) return { gender: null, orientation: null };
    return { gender: result.rows[0].gender, orientation: result.rows[0].orientation };
  } catch (e) {
    console.error('Error fetching viewer profile for orientation filter:', e);
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
  if (g === 'other') g = 'non-binary';
  if (o === 'hetero') o = 'straight';
  if (['bisexual','bi','pan','pansexual'].includes(o)) {
    return ['male','female','non-binary'];
  }
  if (o === 'straight') {
    if (g === 'male') return ['female'];
    if (g === 'female') return ['male'];
    // non-binary straight: show opposite binary genders
    if (g === 'non-binary') return ['male','female'];
  }
  if (['gay','homosexual'].includes(o)) {
    if (g === 'male') return ['male'];
    if (g === 'female') return ['female'];
    if (g === 'non-binary') return ['non-binary'];
  }
  if (['lesbian'].includes(o)) {
    // lesbian only female-female
    return g === 'female' ? ['female'] : [];
  }
  // fallback: no restriction
  return [];
}

// Get users for discovery/search
const getDiscoveryUsers = async (req, res) => {
  try {
    // Get query parameters
    const { limit = 20, offset = 0 } = req.query;
    
    // Log the current user
    console.log('Current user:', req.user);
    
    // Query to get users with their profiles, photos, and locations
    // Orientation-based gender filtering
    const viewerProfile = await fetchViewerProfile(req.user.id);
    console.log('Viewer profile (orientation filter):', viewerProfile);
    const allowedGenders = computeAllowedGenders(viewerProfile.gender, viewerProfile.orientation);
    console.log('Allowed genders derived:', allowedGenders);

    let genderFilterClause = '';
    const params = [parseInt(limit), parseInt(offset), req.user.id];
    if (allowedGenders.length > 0) {
      genderFilterClause = ' AND (LOWER(p.gender) = ANY($4))';
      params.push(allowedGenders.map(g => g.toLowerCase()));
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
        p.is_verified,
        p.last_active,
        ph.url as profile_photo_url,
        l.latitude,
        l.longitude,
        l.city,
        l.country
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN photos ph ON u.id = ph.user_id AND ph.is_profile = true
      LEFT JOIN locations l ON u.id = l.user_id
      WHERE u.email_verified = true AND u.id != $3
      ${genderFilterClause}
      ORDER BY p.fame_rating DESC, u.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await db.query(query, params);
    if (result.rows.length === 0 && allowedGenders.length > 0) {
      console.log('[Discovery] No users found with allowed genders:', allowedGenders, 'Viewer:', viewerProfile);
    }
    
    // Log the number of users found
    console.log(`Found ${result.rows.length} users for discovery (excluding current user)`);
    
    // Transform the data to match the frontend's expected format
    const users = result.rows.map(row => ({
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
        isVerified: row.is_verified,
        lastActive: row.last_active
      },
      profilePhotoUrl: row.profile_photo_url,
      location: {
        latitude: row.latitude,
        longitude: row.longitude,
        city: row.city,
        country: row.country
      }
    }));
    
    // Log the transformed users
    console.log('Transformed users:', users);
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching discovery users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get a random set of users for discovery
const getRandomUsers = async (req, res) => {
  try {
    const { limit = 9 } = req.query;
    console.log('Current user (random):', req.user);
    const viewerProfile = await fetchViewerProfile(req.user.id);
    console.log('Viewer profile (random/orientation filter):', viewerProfile);
    const allowedGenders = computeAllowedGenders(viewerProfile.gender, viewerProfile.orientation);
    console.log('Allowed genders (random):', allowedGenders);

    let genderFilterClause = '';
    const params = [parseInt(limit), req.user.id];
    if (allowedGenders.length > 0) {
      genderFilterClause = ' AND (LOWER(p.gender) = ANY($3))';
      params.push(allowedGenders.map(g => g.toLowerCase()));
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
        p.is_verified,
        p.last_active,
        ph.url as profile_photo_url,
        l.latitude,
        l.longitude,
        l.city,
        l.country
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN photos ph ON u.id = ph.user_id AND ph.is_profile = true
      LEFT JOIN locations l ON u.id = l.user_id
      WHERE u.email_verified = true AND u.id != $2
      ${genderFilterClause}
      ORDER BY RANDOM()
      LIMIT $1
    `;

    const result = await db.query(query, params);
    if (result.rows.length === 0 && allowedGenders.length > 0) {
      console.log('[Random] No users found with allowed genders:', allowedGenders, 'Viewer:', viewerProfile);
    }
    
    // Log the number of users found
    console.log(`Found ${result.rows.length} random users for discovery (excluding current user)`);
    
    // Transform the data to match the frontend's expected format
    const users = result.rows.map(row => ({
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
        isVerified: row.is_verified,
        lastActive: row.last_active
      },
      profilePhotoUrl: row.profile_photo_url,
      location: {
        latitude: row.latitude,
        longitude: row.longitude,
        city: row.city,
        country: row.country
      }
    }));
    
    // Log the transformed users
    console.log('Transformed random users:', users);
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching random users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Search users by name
const searchUsers = async (req, res) => {
  try {
    const { query: searchQuery, limit = 20, offset = 0 } = req.query;
    
    if (!searchQuery) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }
    
    // Log the current user
    console.log('Current user (search):', req.user);
    
    // Query to search users by first name or last name
    const viewerProfile = await fetchViewerProfile(req.user.id);
    const allowedGenders = computeAllowedGenders(viewerProfile.gender, viewerProfile.orientation);
    console.log('Allowed genders (search):', allowedGenders);

    let genderFilterClause = '';
    const params = [parseInt(limit), parseInt(offset), `%${searchQuery}%`, req.user.id];
    if (allowedGenders.length > 0) {
      genderFilterClause = ' AND (LOWER(p.gender) = ANY($5))';
      params.push(allowedGenders.map(g => g.toLowerCase()));
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
        p.is_verified,
        p.last_active,
        ph.url as profile_photo_url,
        l.latitude,
        l.longitude,
        l.city,
        l.country
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN photos ph ON u.id = ph.user_id AND ph.is_profile = true
      LEFT JOIN locations l ON u.id = l.user_id
      WHERE u.email_verified = true
        AND (u.first_name ILIKE $3 OR u.last_name ILIKE $3)
        AND u.id != $4
        ${genderFilterClause}
      ORDER BY p.fame_rating DESC, u.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await db.query(query, params);
    if (result.rows.length === 0 && allowedGenders.length > 0) {
      console.log('[Search] No users found with allowed genders:', allowedGenders, 'Viewer:', viewerProfile);
    }
    
    // Log the number of users found
    console.log(`Found ${result.rows.length} users for search (excluding current user)`);
    
    // Transform the data to match the frontend's expected format
    const users = result.rows.map(row => ({
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
        isVerified: row.is_verified,
        lastActive: row.last_active
      },
      profilePhotoUrl: row.profile_photo_url,
      location: {
        latitude: row.latitude,
        longitude: row.longitude,
        city: row.city,
        country: row.country
      }
    }));
    
    // Log the transformed users
    console.log('Transformed search users:', users);
    
    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get filtered users for discovery
const getFilteredUsers = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const { ageMin, ageMax, distance, tags, sortBy, sortOrder, fameRating } = req.query;

    console.log('Current user (filtered):', req.user);
    console.log('Filters:', { ageMin, ageMax, distance, tags, sortBy, sortOrder, fameRating });

    // Orientation filter
    const viewerProfile = await fetchViewerProfile(req.user.id);
    const allowedGenders = computeAllowedGenders(viewerProfile.gender, viewerProfile.orientation);
    console.log('Viewer profile (filtered/orientation):', viewerProfile, 'Allowed genders:', allowedGenders);

    let query = `
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
        p.is_verified,
        p.last_active,
        ph.url as profile_photo_url,
        l.latitude,
        l.longitude,
        l.city,
        l.country
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      LEFT JOIN photos ph ON u.id = ph.user_id AND ph.is_profile = true
      LEFT JOIN locations l ON u.id = l.user_id
      WHERE u.email_verified = true AND u.id != $1
    `;

    const params = [req.user.id];
    let paramIndex = 1;

    if (allowedGenders.length > 0) {
      query += ` AND (LOWER(p.gender) = ANY($${++paramIndex}))`;
      params.push(allowedGenders.map(g => g.toLowerCase()));
    }

    // Age filters (convert ages to birth_date bounds)
    if (ageMax || ageMin) {
      const today = new Date();
      if (ageMax) {
        // Plus vieilles dates (ex: 35 ans -> 1990)
        const minBirthDate = new Date(today.getFullYear() - parseInt(ageMax), today.getMonth(), today.getDate());
        query += ` AND p.birth_date >= $${++paramIndex}`;
        params.push(minBirthDate.toISOString().split('T')[0]);
      }
      if (ageMin) {
        // Plus récentes dates (ex: 18 ans -> 2007)
        const maxBirthDate = new Date(today.getFullYear() - parseInt(ageMin), today.getMonth(), today.getDate());
        query += ` AND p.birth_date <= $${++paramIndex}`;
        params.push(maxBirthDate.toISOString().split('T')[0]);
      }
    }

    // Fame rating
    if (fameRating !== undefined && fameRating !== '' && !isNaN(parseInt(fameRating))) {
      query += ` AND p.fame_rating >= $${++paramIndex}`;
      params.push(parseInt(fameRating));
    }

    if (distance) {
      console.log(`Distance filter requested (placeholder only): ${distance} km`);
    }
    if (tags) {
      console.log(`Tags filter requested (placeholder only): ${tags}`);
    }

    // Tri
    query += ' ORDER BY ';
    switch (sortBy) {
      case 'distance':
        query += 'u.created_at ';
        break;
      case 'age':
        query += 'p.birth_date ';
        // Inversion logique: pour âge asc (plus jeune d'abord) => birth_date DESC
        if (sortOrder === 'asc') {
          query += 'DESC ';
        } else {
          query += 'ASC ';
        }
        break;
      case 'tags':
        query += 'u.created_at ';
        break;
      case 'fame':
      default:
        query += 'p.fame_rating ';
        query += (sortOrder === 'asc' ? 'ASC ' : 'DESC ');
        break;
    }
    // (Pas de double ajout de ASC/DESC pour 'age' grâce au bloc ci-dessus)

    // LIMIT / OFFSET
  query += `LIMIT $${++paramIndex} OFFSET $${++paramIndex}`;
  params.push(parseInt(limit), parseInt(offset));

    console.log('Final query:', query);
    console.log('Parameters:', params);

    const result = await db.query(query, params);
    if (result.rows.length === 0 && allowedGenders.length > 0) {
      console.log('[Filtered] No users found with allowed genders:', allowedGenders, 'Viewer:', viewerProfile);
    }

    const users = result.rows.map(row => ({
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
        isVerified: row.is_verified,
        lastActive: row.last_active
      },
      profilePhotoUrl: row.profile_photo_url,
      location: {
        latitude: row.latitude,
        longitude: row.longitude,
        city: row.city,
        country: row.country
      }
    }));

    console.log('Transformed filtered users:', users);
    res.json(users);
  } catch (error) {
    console.error('Error fetching filtered users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getDiscoveryUsers,
  getRandomUsers,
  searchUsers,
  getFilteredUsers
};