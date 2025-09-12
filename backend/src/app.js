const express = require("express");
const cors = require("cors");
const apiRoutes = require("../routes/api");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", apiRoutes);

// Basic endpoint
app.get("/", (req, res) => {
  res.json({ message: "Matcha backend API" });
});

// Dedicated health check endpoint
// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "matcha-backend",
  });
});

module.exports = app;
