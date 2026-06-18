const jwt = require("jsonwebtoken");
const { ACCESS_SECRET, ACCESS_EXPIRES_IN } = require("../config/jwt");

// Issue a real, verifiable access token for a given user id (tests previously
// used a hardcoded fake token, which the auth middleware correctly rejected).
function signToken(userId) {
  return jwt.sign({ userId }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
}

module.exports = { signToken };
