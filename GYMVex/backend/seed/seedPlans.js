// ═══════════════════════════════════════════════════════════════════════
// seedPlans.js — Seed Script to Populate Database with Workout Plans
// ═══════════════════════════════════════════════════════════════════════
// Run with: node backend/seed/seedPlans.js
// ═══════════════════════════════════════════════════════════════════════

const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const WorkoutPlan = require('../models/WorkoutPlan');
const planSeedData = require('./planSeedData');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gymvex';

const seedPlans = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected');

    console.log('🗑️  Clearing old workout plans...');
    await WorkoutPlan.deleteMany({});

    console.log(`📦 Inserting ${planSeedData.length} workout plans...`);
    const result = await WorkoutPlan.insertMany(planSeedData);
    console.log(`✅ Successfully seeded ${result.length} workout plans!`);

    await mongoose.disconnect();
    console.log('👋 Disconnected. Done!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seedPlans();
