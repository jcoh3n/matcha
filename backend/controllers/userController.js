const User = require('../models/User');

// Mock data store (in a real app, this would be a database)
let users = [
  new User({ id: 1, email: 'john@example.com', username: 'johndoe', firstName: 'John', lastName: 'Doe' }),
  new User({ id: 2, email: 'jane@example.com', username: 'janesmith', firstName: 'Jane', lastName: 'Smith' })
];
let nextId = 3;

// Get all users
const getAllUsers = (req, res) => {
  res.json(users.map(user => user.toJSON()));
};

// Get user by ID
const getUserById = (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json(user.toJSON());
};

// Create a new user
const createUser = (req, res) => {
  const errors = User.validate(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const newUser = new User({
    id: nextId++,
    ...req.body
  });

  users.push(newUser);
  res.status(201).json(newUser.toJSON());
};

// Update user
const updateUser = (req, res) => {
  const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  const errors = User.validate(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  users[userIndex] = new User({
    ...users[userIndex],
    ...req.body,
    id: users[userIndex].id // Preserve the ID
  });

  res.json(users[userIndex].toJSON());
};

// Delete user
const deleteUser = (req, res) => {
  const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  users.splice(userIndex, 1);
  res.status(204).send();
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};