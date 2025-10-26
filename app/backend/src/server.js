const http = require('http');
const socketIo = require('socket.io');
const app = require('./app');
const { addUser, removeUser } = require('../utils/notificationHandler');
require('dotenv').config();

// Initialize fame rating cron jobs
require('../jobs/fameRatingJob');

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
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

chat.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error: token missing'));

    // Verify token using same secret as REST middleware
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'access_secret_key');
    const user = await User.findById(decoded.userId);
    if (!user) return next(new Error('Authentication error: user not found'));

    // Attach user to socket and register it
    socket.user = user;
    addUser(user.id, socket.id);
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
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});