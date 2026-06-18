const express = require("express");
const cors = require("cors");
const path = require("path");
const apiRoutes = require("../routes/api");

const app = express();

// Middleware
// Restrict CORS to the configured frontend origin (falls back to local dev).
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

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
