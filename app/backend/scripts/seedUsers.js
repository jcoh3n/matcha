#!/usr/bin/env node

const https = require("https");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
require("dotenv").config();

// Database configuration
const pool = new Pool({
  user: process.env.POSTGRES_USER || process.env.DB_USER || "postgres",
  host: process.env.POSTGRES_HOST || process.env.DB_HOST || "localhost",
  database: process.env.POSTGRES_DB || process.env.DB_NAME || "matcha_db",
  password:
    process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD || "postgres",
  port: process.env.POSTGRES_PORT || process.env.DB_PORT || 5432,
});

// Function to check if seeding has already been completed
async function isSeedingCompleted(client) {
  try {
    const result = await client.query(
      "SELECT completed FROM seed_tracking WHERE name = $1",
      ["user_seeding"]
    );

    return result.rows.length > 0 && result.rows[0].completed;
  } catch (error) {
    console.log(
      "Seed tracking table not found or error checking seed status, proceeding with seeding..."
    );
    return false;
  }
}

// Function to mark seeding as completed
async function markSeedingAsCompleted(client) {
  try {
    await client.query(
      "UPDATE seed_tracking SET completed = TRUE, completed_at = NOW(), updated_at = NOW() WHERE name = $1",
      ["user_seeding"]
    );
    console.log("Marked seeding as completed in seed_tracking table");
  } catch (error) {
    console.error("Error marking seeding as completed:", error);
  }
}

// Function to fetch users from randomuser.me API
function fetchUsers(count = 500) {
  return new Promise((resolve, reject) => {
    const url = `https://randomuser.me/api/?results=${count}&nat=fr`;

    console.log(`Fetching ${count} users from ${url}`);

    https
      .get(url, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const users = JSON.parse(data);
            console.log(
              `Successfully fetched ${users.results.length} users from API`
            );
            resolve(users.results);
          } catch (error) {
            console.error("Error parsing API response:", error);
            reject(error);
          }
        });
      })
      .on("error", (error) => {
        console.error("Error fetching from API:", error);
        reject(error);
      });
  });
}

// Function to hash password
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Function to insert a user into the database
async function insertUser(client, user, index) {
  // Make email unique by appending index if needed
  let email = user.email;
  const username = user.login.username + (index > 0 ? index : "");

  console.log(
    `Attempting to insert user: ${user.name.first} ${user.name.last} (${email})`
  );

  // Insert user
  const userQuery = `
    INSERT INTO users (email, username, first_name, last_name, password, email_verified, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (email) DO NOTHING
    RETURNING id
  `;

  // Generate a simple password for all users (same for simplicity)
  const hashedPassword = await hashPassword("Password123!");

  const userValues = [
    email,
    username,
    user.name.first,
    user.name.last,
    hashedPassword,
    true, // email_verified
    new Date(user.registered.date),
    new Date(),
  ];

  const userResult = await client.query(userQuery, userValues);

  // If no rows were returned, it means the email already exists
  if (userResult.rows.length === 0) {
    console.log(
      `Skipped user ${user.name.first} ${user.name.last} - email already exists: ${email}`
    );
    return null;
  }

  const userId = userResult.rows[0].id;
  console.log(
    `Successfully inserted user: ${user.name.first} ${user.name.last} with ID ${userId}`
  );
  return userId;
}

// Function to insert profile for a user
async function insertProfile(client, userId, user) {
  console.log(`Inserting profile for user ID ${userId}`);

  const profileQuery = `
    INSERT INTO profiles (user_id, birth_date, gender, sexual_orientation, bio, fame_rating, is_verified, last_active, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING id
  `;

  // Calculate age from dob
  const birthDate = new Date(user.dob.date);

  // Simple bio generation
  const bios = [
    "Looking for meaningful connections 🌟",
    "Love to travel and explore new places ✈️",
    "Coffee enthusiast and book lover ☕📚",
    "Fitness lover and outdoor enthusiast 🏃‍♀️🌳",
    "Foodie always looking for the next great meal 🍝",
    "Music lover and concert goer 🎵",
    "Art enthusiast and creative soul 🎨",
    "Dog lover and animal advocate 🐶",
    "Movie buff and streaming expert 🎬",
    "Gamer and tech enthusiast 🎮💻",
  ];

  const randomBio = bios[Math.floor(Math.random() * bios.length)];

  // Simple orientation mapping
  const orientations = ["straight", "gay", "lesbian", "bisexual", "pansexual"];
  const randomOrientation =
    orientations[Math.floor(Math.random() * orientations.length)];

  const profileValues = [
    userId,
    birthDate,
    user.gender,
    randomOrientation,
    randomBio,
    Math.floor(Math.random() * 500), // fame_rating between 0-500
    true, // is_verified
    new Date(), // last_active
    new Date(), // created_at
    new Date(), // updated_at
  ];

  const profileResult = await client.query(profileQuery, profileValues);
  const profileId = profileResult.rows[0].id;
  console.log(
    `Successfully inserted profile ID ${profileId} for user ID ${userId}`
  );
  return profileId;
}

// Function to insert photo for a user
async function insertPhoto(client, userId, user, isProfile = true) {
  console.log(`Inserting photo for user ID ${userId}`);

  const photoQuery = `
    INSERT INTO photos (user_id, url, is_profile, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `;

  const photoValues = [
    userId,
    user.picture.large,
    isProfile,
    new Date(),
    new Date(),
  ];

  const photoResult = await client.query(photoQuery, photoValues);
  const photoId = photoResult.rows[0].id;
  console.log(
    `Successfully inserted photo ID ${photoId} for user ID ${userId}`
  );
  return photoId;
}

// Function to insert location for a user
async function insertLocation(client, userId, user) {
  console.log(`Inserting location for user ID ${userId}`);

  const locationQuery = `
    INSERT INTO locations (user_id, latitude, longitude, city, country, location_method, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id
  `;

  const locationValues = [
    userId,
    parseFloat(user.location.coordinates.latitude),
    parseFloat(user.location.coordinates.longitude),
    user.location.city,
    user.location.country,
    "manual", // location_method
    new Date(),
    new Date(),
  ];

  const locationResult = await client.query(locationQuery, locationValues);
  const locationId = locationResult.rows[0].id;
  console.log(
    `Successfully inserted location ID ${locationId} for user ID ${userId}`
  );
  return locationId;
}

// -----------------------------
// Tags seeding helpers
// -----------------------------

// Base tag catalog (aligned with frontend availableTags + extras for variety)
const TAG_CATALOG = [
  "Art",
  "Coffee",
  "Hiking",
  "Foodie",
  "Photography",
  "Tech",
  "Music",
  "Guitar",
  "Travel",
  "Yoga",
  "Mindfulness",
  "Nature",
  "Cooking",
  "Dogs",
  "Cats",
  "Design",
  "Fitness",
  "Climbing",
  "Adventure",
  "Science",
  "Movies",
  "Gaming",
  "Reading",
  "Running",
  "Cycling",
  "Swimming",
  "Coding",
  "Baking",
  "Dancing",
  "Theatre",
  "Board Games",
  "Crafts",
  "Gardening",
  "Meditation",
  "Podcasts",
  "Fashion",
  "Skateboarding",
  "Skiing",
  "Snowboarding",
  "Surfing",
  "Basketball",
  "Football",
  "Tennis",
  "Badminton",
  "Volleyball",
  "Chess",
  "Anime",
];

// Ensure all tags exist in tags table; return a map name -> id
async function ensureTags(client, tagNames = TAG_CATALOG) {
  console.log(`Ensuring ${tagNames.length} tags exist...`);
  const nameToId = new Map();
  for (const name of tagNames) {
    try {
      const upsert = await client.query(
        `INSERT INTO tags (name) VALUES ($1)
         ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [name]
      );
      const id = upsert.rows[0]?.id;
      if (id) {
        nameToId.set(name, id);
        continue;
      }
      // Fallback: select existing id
      const sel = await client.query(`SELECT id FROM tags WHERE name = $1`, [
        name,
      ]);
      if (sel.rows.length > 0) nameToId.set(name, sel.rows[0].id);
    } catch (e) {
      console.error(`Error ensuring tag '${name}':`, e);
    }
  }
  console.log(`Tag catalog ready (${nameToId.size} tags).`);
  return nameToId;
}

// Assign N random tags (3-7) to a user, ignore duplicates
async function assignRandomTagsToUser(client, userId, tagIds) {
  const pickCount = Math.floor(Math.random() * 5) + 3; // 3..7
  const ids = [...tagIds];
  // Shuffle
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  const chosen = ids.slice(0, pickCount);
  for (const tagId of chosen) {
    try {
      await client.query(
        `INSERT INTO user_tags (user_id, tag_id) VALUES ($1, $2)
         ON CONFLICT (user_id, tag_id) DO NOTHING`,
        [userId, tagId]
      );
    } catch (e) {
      console.error(`Error assigning tag ${tagId} to user ${userId}:`, e);
    }
  }
}

// Main function to seed the database
async function seedDatabase() {
  let client;

  try {
    // Get database client
    client = await pool.connect();

    console.log("Connected to database successfully");

    // Check if seeding has already been completed
    const seedingCompleted = await isSeedingCompleted(client);
    if (seedingCompleted) {
      console.log("Database seeding has already been completed. Skipping...");
      return;
    }

    console.log(
      "Database seeding not yet completed. Proceeding with seeding..."
    );

    // Begin transaction
    await client.query("BEGIN");
    console.log("Started database transaction");

    // Ensure tag catalog is present
    const tagMap = await ensureTags(client);
    const allTagIds = Array.from(tagMap.values());

    // Fetch users from API
    console.log("Fetching users from randomuser.me API...");
    const users = await fetchUsers(500);
    console.log(`Fetched ${users.length} users`);

    // Process each user
    console.log("Inserting users into database...");
    let count = 0;
    let index = 0;
    let skipped = 0;

    for (const user of users) {
      try {
        // Insert user
        const userId = await insertUser(client, user, index);

        // If user was not inserted due to conflict, skip to next
        if (userId === null) {
          skipped++;
          index++;
          continue;
        }

        // Insert profile
        await insertProfile(client, userId, user);

        // Insert photo
        await insertPhoto(client, userId, user, true);

        // Insert location
        await insertLocation(client, userId, user);

        // Assign random tags to user
        await assignRandomTagsToUser(client, userId, allTagIds);

        count++;
        index++;
        if (count % 50 === 0) {
          console.log(
            `Processed ${count} users... (Skipped ${skipped} duplicates)`
          );
        }
      } catch (error) {
        console.error(`Error processing user ${user.login.username}:`, error);
        // Continue with next user instead of aborting transaction
      }
    }

    // Mark seeding as completed
    await markSeedingAsCompleted(client);

    // Commit transaction
    await client.query("COMMIT");
    console.log("Committed database transaction");

    console.log(
      `Successfully seeded database with ${count} users (Skipped ${skipped} duplicates)`
    );
  } catch (error) {
    // Rollback transaction on error
    if (client) {
      await client.query("ROLLBACK");
      console.log("Rolled back database transaction due to error");
    }
    console.error("Error seeding database:", error);
    process.exit(1);
  } finally {
    // Release client and end pool
    if (client) {
      client.release();
      console.log("Released database client");
    }
    await pool.end();
    console.log("Closed database connection pool");
  }
}

// Run the seed function if this script is executed directly
if (require.main === module) {
  console.log("Starting user seeding process...");
  seedDatabase();
}

module.exports = { seedDatabase };
