const jwt = require("jsonwebtoken");
const User = require("../models/User");
const db = require("../config/db");

// JWT authentication middleware
const authJWT = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || "access_secret_key"
    );

    // Get user from database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    // Add user to request object
    req.user = user;

    // Lightweight activity hook: update profiles.last_active and users.updated_at occasionally
    // Skip if client opts out via header (e.g., background polling)
    const skipActivity = req.headers["x-skip-activity"] === "1";
    if (!skipActivity) {
      try {
        // Best-effort, don't block request
        db.query("UPDATE profiles SET last_active = NOW() WHERE user_id = $1", [
          user.id,
        ]).catch(() => {});
        
        // Also update user's updated_at field
        db.query("UPDATE users SET updated_at = NOW() WHERE id = $1", [
          user.id,
        ]).catch(() => {});
      } catch (_) {}
    }
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired",
      });
    }

    console.error("Authentication error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = { authJWT };
