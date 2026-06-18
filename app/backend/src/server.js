const http = require('http');
const socketIo = require('socket.io');
const app = require('./app');
const { addUser, removeUser } = require('../utils/notificationHandler');
require('dotenv').config();

// Initialize fame rating cron jobs
require('../jobs/fameRatingJob');

const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ["GET", "POST"]
  }
});

// Make io globally available
global.io = io;

const PORT = process.env.PORT || 3000;

// Create a dedicated chat namespace and secure it with a JWT handshake
const chat = io.of('/chat');

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Profile = require('../models/Profile');
const { ACCESS_SECRET } = require('../config/jwt');

chat.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error: token missing'));

    // Verify token using same secret as REST middleware
    const decoded = jwt.verify(token, ACCESS_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return next(new Error('Authentication error: user not found'));

    // Attach user to socket and register it
    socket.user = user;
    addUser(user.id, socket.id);
    // Mark the user as active (presence / "last seen")
    Profile.touchLastActive(user.id);
    console.log(`Socket ${socket.id} authenticated as user ${user.id}`);
    return next();
  } catch (err) {
    console.error('WebSocket auth error:', err.message || err);
    return next(new Error('Authentication error'));
  }
});

chat.on('connection', (socket) => {
  console.log('New chat client connected:', socket.id, 'user:', socket.user && socket.user.id);

  socket.on('disconnect', () => {
    console.log('Chat client disconnected:', socket.id);
    removeUser(socket.id);
    // Record the time of the last connection as "last seen"
    if (socket.user) {
      Profile.touchLastActive(socket.user.id);
    }
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});