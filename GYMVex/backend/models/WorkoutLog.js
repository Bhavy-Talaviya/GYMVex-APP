// ═══════════════════════════════════════════════════════════════════════
// WorkoutLog.js — Mongoose Model for Calorie & Workout Logs (GYMVex)
// ═══════════════════════════════════════════════════════════════════════
// Stores completed workout logs, calorie burn calculations, and timestamps
// for daily, weekly, and monthly tracking stats.
// ═══════════════════════════════════════════════════════════════════════

const mongoose = require('mongoose');

const workoutLogSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: 'default_user',
      index: true,
    },
    workoutName: {
      type: String,
      default: 'Daily Workout Session',
    },
    planId: {
      type: String,
      default: '',
    },
    durationMinutes: {
      type: Number,
      default: 30,
    },
    caloriesBurned: {
      type: Number,
      default: 300,
    },
    exercisesCompletedCount: {
      type: Number,
      default: 5,
    },
    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('WorkoutLog', workoutLogSchema);
