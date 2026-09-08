// ═══════════════════════════════════════════════════════════════════════
// server.js — Main Entry Point for GYMVex Backend
// ═══════════════════════════════════════════════════════════════════════
// This file sets up the Express server, connects to MongoDB,
// and mounts all the API routes.
// ═══════════════════════════════════════════════════════════════════════

// ─── Load environment variables from .env file ──────────────────────
const dotenv = require('dotenv');
dotenv.config();

// ─── Import packages ────────────────────────────────────────────────
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

// ─── Import routes ──────────────────────────────────────────────────
const exerciseRoutes = require('./routes/exerciseRoutes');
const workoutPlanRoutes = require('./routes/workoutPlanRoutes');
const fitnessTrackingRoutes = require('./routes/fitnessTrackingRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const userProfileRoutes = require('./routes/userProfileRoutes');
const authRoutes = require('./routes/authRoutes');

// ─── Create Express app ─────────────────────────────────────────────
const app = express();

// ─── Read config from environment variables ─────────────────────────
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gymvex';

// ═══════════════════════════════════════════════════════════════════════
// MIDDLEWARE — These run on every request before reaching routes
// ═══════════════════════════════════════════════════════════════════════

// cors() — allows the React Native app to call this API from any device
app.use(cors());

// express.json() — parses JSON request bodies (e.g., POST data)
app.use(express.json());

// morgan('dev') — logs each request to the console (method, url, status, time)
app.use(morgan('dev'));

// ═══════════════════════════════════════════════════════════════════════
// ROUTES — Mount exercise, workout plan, fitness tracking, notifications & profile
// ═══════════════════════════════════════════════════════════════════════

app.use('/api/auth', authRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/plans', workoutPlanRoutes);
app.use('/api/user-plan', workoutPlanRoutes);
app.use('/api', fitnessTrackingRoutes);
app.use('/api', notificationRoutes);
app.use('/api', userProfileRoutes);

// ─── Simple health check route ──────────────────────────────────────
// You can visit http://localhost:5000/ to check if server is running
app.get('/', (req, res) => {
  res.json({
    message: 'GYMVex API is running!',
    version: '1.0.0',
    endpoints: {
      exercises: '/api/exercises',
      search: '/api/exercises/search?q=push',
      category: '/api/exercises/category/Chest',
      muscle: '/api/exercises/muscle/Biceps',
      recommended: '/api/exercises/recommended',
    },
  });
});

// ═══════════════════════════════════════════════════════════════════════
// CONNECT TO MONGODB AND START SERVER
// ═══════════════════════════════════════════════════════════════════════

const autoSeed = require('./seed/autoSeed');
const LOCAL_MONGODB_URI = 'mongodb://localhost:27017/gymvex';

const connectWithFallback = async () => {
  try {
    console.log(`🔌 Connecting to Primary MongoDB: ${MONGODB_URI.replace(/:([^@]+)@/, ':****@')}`);
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected successfully to Primary MongoDB');
  } catch (primaryErr) {
    console.error('❌ Primary MongoDB Connection Error:', primaryErr.message);

    if (MONGODB_URI !== LOCAL_MONGODB_URI) {
      console.log(`🔄 Attempting Fallback to Local MongoDB (${LOCAL_MONGODB_URI})...`);
      try {
        await mongoose.connect(LOCAL_MONGODB_URI);
        console.log('✅ Connected successfully to Local MongoDB Fallback!');
      } catch (fallbackErr) {
        console.error('❌ Local MongoDB Fallback Connection Error:', fallbackErr.message);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }

  // Run auto-seeding to ensure collections are populated
  await autoSeed();

  // Start Express HTTP Server on all network interfaces
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT} and LAN IP (0.0.0.0:${PORT})`);
    console.log(`📋 API docs: http://localhost:${PORT}/`);
  });
};

connectWithFallback();

