const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { ACCESS_SECRET, REFRESH_SECRET, ACCESS_EXPIRES_IN } = require('../config/jwt');

// Logout user
const logout = async (req, res) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(400).json({ 
        message: 'Token is required' 
      });
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    // Delete the refresh token from database
    await db.query('DELETE FROM sessions WHERE token = $1', [token]);
    
    res.status(200).json({
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      message: 'Internal server error' 
    });
  }
};

// Refresh access token
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ 
        message: 'Refresh token is required' 
      });
    }
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    
    // Check if refresh token exists in database
    const result = await db.query('SELECT * FROM sessions WHERE token = $1 AND expires_at > NOW()', [refreshToken]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ 
        message: 'Invalid refresh token' 
      });
    }
    
    // Generate new access token
    const accessToken = jwt.sign(
      { userId: decoded.userId },
      ACCESS_SECRET,
      { expiresIn: ACCESS_EXPIRES_IN }
    );
    
    res.status(200).json({
      accessToken
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Invalid refresh token' 
      });
    }
    
    console.error('Refresh token error:', error);
    res.status(500).json({ 
      message: 'Internal server error' 
    });
  }
};

module.exports = {
  logout,
  refresh
};