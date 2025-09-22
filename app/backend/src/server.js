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

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Handle user authentication
  socket.on('authenticate', (data) => {
    const { userId } = data;
    if (userId) {
      addUser(userId, socket.id);
      console.log(`User ${userId} authenticated with socket ${socket.id}`);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    removeUser(socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});