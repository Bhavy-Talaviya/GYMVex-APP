// ═══════════════════════════════════════════════════════════════════════
// seedDatabase.js — Populate Database with Exercise Data
// ═══════════════════════════════════════════════════════════════════════
// Run this script to fill the database with seed exercises.
// Command: npm run seed (from the backend folder)
//
// What it does:
// 1. Connects to MongoDB
// 2. Deletes all existing exercises (clean start)
// 3. Inserts all seed exercises
// 4. Shows a summary of what was added
// ═══════════════════════════════════════════════════════════════════════

// Load environment variables
const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const Exercise = require('../models/Exercise');
const exercises = require('./exerciseSeedData');

// ─── MongoDB URI from .env file ─────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gymvex';

// ─── Main seed function ─────────────────────────────────────────────
const seedDatabase = async () => {
  try {
    // Step 1: Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Step 2: Delete all existing exercises (fresh start)
    console.log('🗑️  Clearing old exercise data...');
    await Exercise.deleteMany({});
    console.log('✅ Old data cleared');

    // Step 3: Insert all seed exercises
    console.log(`📦 Inserting ${exercises.length} exercises...`);
    const result = await Exercise.insertMany(exercises);
    console.log(`✅ Successfully inserted ${result.length} exercises!`);

    // Step 4: Show summary of categories
    console.log('\n📋 Summary by Category:');
    console.log('─────────────────────────────');

    // Group exercises by category and count them
    const categoryCounts = {};
    result.forEach((exercise) => {
      const cat = exercise.category;
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    // Print each category and its count
    Object.keys(categoryCounts)
      .sort()
      .forEach((category) => {
        console.log(`  ${category}: ${categoryCounts[category]} exercises`);
      });

    console.log('─────────────────────────────');
    console.log(`  Total: ${result.length} exercises\n`);

    // Step 5: Disconnect and exit
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    console.log('🎉 Seeding complete! Run "npm start" to start the server.\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
