const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
require("dotenv").config();

// Create a fresh `matcha_test` database (schema = init.sql + migrations,
// mirroring the Docker startup) before the suite runs.
module.exports = async () => {
  const TEST_DB = "matcha_test";
  const cfg = {
    user: process.env.POSTGRES_USER || process.env.DB_USER || "postgres",
    password:
      process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD || "postgres",
    host: process.env.POSTGRES_HOST || process.env.DB_HOST || "localhost",
    port: Number(process.env.POSTGRES_PORT || process.env.DB_PORT || 5432),
  };

  const admin = new Pool({ ...cfg, database: "postgres" });
  await admin.query(
    `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`,
    [TEST_DB]
  );
  await admin.query(`DROP DATABASE IF EXISTS ${TEST_DB}`);
  await admin.query(`CREATE DATABASE ${TEST_DB}`);
  await admin.end();

  const db = new Pool({ ...cfg, database: TEST_DB });
  const initSql = fs.readFileSync(
    path.join(__dirname, "..", "init.sql"),
    "utf8"
  );
  await db.query(initSql);
  await db.end();

  execSync("node scripts/runMigrations.js", {
    cwd: path.join(__dirname, ".."),
    env: { ...process.env, POSTGRES_DB: TEST_DB, DB_NAME: TEST_DB },
    stdio: "ignore",
  });
};
