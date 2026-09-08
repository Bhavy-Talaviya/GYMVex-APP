// ═══════════════════════════════════════════════════════════════════════
// resetAllData.js — Wipe All User Data & Fresh Seed (GYMVex)
// ═══════════════════════════════════════════════════════════════════════
// This script:
// 1. Connects to MongoDB Atlas / Local MongoDB
// 2. Wipes ALL user accounts, profiles, logs, workout states & notification settings
// 3. Re-seeds fresh exercise catalog & default workout plans
// 4. Leaves database 100% fresh and clean for new users
// ═══════════════════════════════════════════════════════════════════════

const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');

// Import all models
const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const Exercise = require('../models/Exercise');
const WorkoutPlan = require('../models/WorkoutPlan');
const WorkoutLog = require('../models/WorkoutLog');
const WeightLog = require('../models/WeightLog');
const UserWorkoutState = require('../models/UserWorkoutState');
const NotificationSettings = require('../models/NotificationSettings');

// Import seed data
const exerciseSeedData = require('./exerciseSeedData');
const planSeedData = require('./planSeedData');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gymvex';

async function resetAllData() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully.');

    console.log('\n🧹 [1/7] Deleting all User Accounts...');
    const usersDeleted = await User.deleteMany({});
    console.log(`   Deleted ${usersDeleted.deletedCount} users.`);

    console.log('🧹 [2/7] Deleting all User Profiles...');
    const profilesDeleted = await UserProfile.deleteMany({});
    console.log(`   Deleted ${profilesDeleted.deletedCount} profiles.`);

    console.log('🧹 [3/7] Deleting all Workout Logs...');
    const workoutLogsDeleted = await WorkoutLog.deleteMany({});
    console.log(`   Deleted ${workoutLogsDeleted.deletedCount} workout logs.`);

    console.log('🧹 [4/7] Deleting all Weight Logs...');
    const weightLogsDeleted = await WeightLog.deleteMany({});
    console.log(`   Deleted ${weightLogsDeleted.deletedCount} weight logs.`);

    console.log('🧹 [5/7] Deleting all User Workout States...');
    const workoutStatesDeleted = await UserWorkoutState.deleteMany({});
    console.log(`   Deleted ${workoutStatesDeleted.deletedCount} user workout states.`);

    console.log('🧹 [6/7] Deleting all Notification Settings...');
    const notifDeleted = await NotificationSettings.deleteMany({});
    console.log(`   Deleted ${notifDeleted.deletedCount} notification settings.`);

    console.log('\n🌱 [7/7] Re-seeding Core Library Data...');
    
    // Clear and reseed Exercises
    await Exercise.deleteMany({});
    const insertedExercises = await Exercise.insertMany(exerciseSeedData);
    console.log(`   ✅ Seeded ${insertedExercises.length} standard exercises.`);

    // Clear and reseed Workout Plans
    await WorkoutPlan.deleteMany({});
    const insertedPlans = await WorkoutPlan.insertMany(planSeedData);
    console.log(`   ✅ Seeded ${insertedPlans.length} standard workout plans.`);

    console.log('\n═════════════════════════════════════════════════════════');
    console.log('🎉 COMPLETE FRESH DATABASE RESET SUCCESSFUL!');
    console.log('   All user data removed. Ready for new clean app start.');
    console.log('═════════════════════════════════════════════════════════\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during data reset:', error);
    process.exit(1);
  }
}

resetAllData();
