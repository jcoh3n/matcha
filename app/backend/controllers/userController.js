const User = require('../models/User');
const Profile = require('../models/Profile');
const { authJWT } = require('../middleware/authJWT');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users.map(user => user.toJSON()));
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.toJSON());
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create a new user
const createUser = async (req, res) => {
  try {
    const errors = User.validate(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Check if user with this email already exists
    const existingUser = await User.findByEmail(req.body.email);
    if (existingUser) {
      return res.status(400).json({ errors: ['User with this email already exists'] });
    }

    const newUser = await User.create(req.body);
    res.status(201).json(newUser.toJSON());
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const errors = User.validate(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const updatedUser = await User.update(req.params.id, req.body);
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser.toJSON());
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const deleted = await User.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get current user profile (protected route)
const getCurrentUser = async (req, res) => {
  try {
    // req.user is added by the authJWT middleware
    const user = req.user;
    
    // Get user profile
    const profile = await Profile.findByUserId(user.id);
    
    // Combine user and profile data
    const userData = {
      ...user.toJSON(),
      profile: profile ? profile.toJSON() : null
    };
    
    res.json(userData);
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update the current user's account info (first name, last name, email)
const updateCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, email } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        message: 'First name, last name and email are required',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    // Ensure the email isn't already used by another account
    const existing = await User.findByEmail(email);
    if (existing && existing.id !== userId) {
      return res.status(409).json({ message: 'This email is already in use' });
    }

    const updated = await User.update(userId, {
      email,
      username: req.user.username, // keep the existing username
      firstName,
      lastName,
    });

    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updated.toJSON());
  } catch (error) {
    console.error('Error updating current user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getCurrentUser,
  updateCurrentUser
};