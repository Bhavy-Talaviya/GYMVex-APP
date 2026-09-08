// ═══════════════════════════════════════════════════════════════════════
// UserWorkoutState.js — User Workout Tracking Model (Mongoose Schema)
// ═══════════════════════════════════════════════════════════════════════
// Stores user active plan, status (active/paused), current week/day,
// completed workouts history, and user profile goal/difficulty.
// ═══════════════════════════════════════════════════════════════════════

const mongoose = require('mongoose');

// Schema for each logged completed workout entry in history
const completedWorkoutSchema = new mongoose.Schema({
  planId: {
    type: String,
    required: true,
  },
  planName: {
    type: String,
    required: true,
  },
  dayNumber: {
    type: Number,
    required: true,
  },
  dayName: {
    type: String,
    required: true,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
  caloriesBurned: {
    type: Number,
    default: 0,
  },
  durationMinutes: {
    type: Number,
    default: 0,
  },
  exercisesCompletedCount: {
    type: Number,
    default: 0,
  },
});

const userWorkoutStateSchema = new mongoose.Schema(
  {
    // Unique user ID key (for single user app or multi-user system, default 'default_user')
    userId: {
      type: String,
      default: 'default_user',
      unique: true,
    },

    // activePlan — Reference or copy of active workout plan
    activePlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkoutPlan',
      default: null,
    },

    // activePlanData — Embedded plan summary object for easy frontend display
    activePlanData: {
      type: Object,
      default: null,
    },

    // status — Current plan state: 'active' | 'paused' | 'none'
    status: {
      type: String,
      enum: ['active', 'paused', 'none'],
      default: 'none',
    },

    // Progress tracking counters
    currentWeek: {
      type: Number,
      default: 1,
    },

    currentDay: {
      type: Number,
      default: 1,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    // User preference profile for recommendations
    userProfile: {
      goal: {
        type: String,
        default: 'General Fitness',
      },
      difficulty: {
        type: String,
        default: 'Beginner',
      },
    },

    // History log of completed workouts
    completedWorkouts: [completedWorkoutSchema],
  },
  {
    timestamps: true,
  }
);

const UserWorkoutState = mongoose.model('UserWorkoutState', userWorkoutStateSchema);

module.exports = UserWorkoutState;
