require("dotenv").config();

// JWT secrets must be provided via the environment (.env, excluded from Git).
// We intentionally do NOT fall back to a hardcoded value: a predictable secret
// would let anyone forge valid tokens.
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error(
    "Missing JWT secrets: set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET in your environment (.env)."
  );
}

// Token lifetimes (overridable via env)
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

module.exports = {
  ACCESS_SECRET,
  REFRESH_SECRET,
  ACCESS_EXPIRES_IN,
  REFRESH_EXPIRES_IN,
};
