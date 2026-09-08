// ═══════════════════════════════════════════════════════════════════════
// autoSeed.js — Auto Seeder for GYMVex MongoDB Database
// ═══════════════════════════════════════════════════════════════════════
// Automatically populates MongoDB with initial exercises, workout plans,
// and default user profile if the database is empty upon server startup.
// ═══════════════════════════════════════════════════════════════════════

const Exercise = require('../models/Exercise');
const WorkoutPlan = require('../models/WorkoutPlan');
const UserProfile = require('../models/UserProfile');

const exerciseSeedData = require('./exerciseSeedData');
const planSeedData = require('./planSeedData');

/**
 * Automatically seeds the database if collections are empty.
 */
const autoSeed = async () => {
  try {
    // 1. Auto-seed Exercises
    const exerciseCount = await Exercise.countDocuments();
    if (exerciseCount === 0) {
      console.log(`🌱 Empty Exercise database detected. Auto-seeding ${exerciseSeedData.length} exercises...`);
      await Exercise.insertMany(exerciseSeedData);
      console.log(`✅ Auto-seeded ${exerciseSeedData.length} exercises successfully!`);
    } else {
      console.log(`📊 Exercises collection ready (${exerciseCount} exercises found).`);
    }

    // 2. Auto-seed Workout Plans
    const planCount = await WorkoutPlan.countDocuments();
    if (planCount === 0) {
      console.log(`🌱 Empty WorkoutPlan database detected. Auto-seeding ${planSeedData.length} workout plans...`);
      await WorkoutPlan.insertMany(planSeedData);
      console.log(`✅ Auto-seeded ${planSeedData.length} workout plans successfully!`);
    } else {
      console.log(`📊 WorkoutPlans collection ready (${planCount} plans found).`);
    }

    // 3. User profiles remain clean for new user registration
  } catch (error) {
    console.error('⚠️  Auto-seeding error:', error.message);
  }
};

module.exports = autoSeed;
