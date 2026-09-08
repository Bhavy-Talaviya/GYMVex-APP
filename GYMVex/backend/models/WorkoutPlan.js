// ═══════════════════════════════════════════════════════════════════════
// WorkoutPlan.js — Workout Plan Model (Mongoose Schema)
// ═══════════════════════════════════════════════════════════════════════
// This file defines the Mongoose schema for Workout Plans in GYMVex.
// Each plan includes name, description, fitness goal, difficulty level,
// duration, exercises per day, rest days, estimated calories, etc.
// ═══════════════════════════════════════════════════════════════════════

const mongoose = require('mongoose');

// ─── Constant allowed values for Goals & Difficulty ─────────────────────
// Allowed fitness goals
const GOALS = [
  'Weight Loss',
  'Muscle Gain',
  'Strength',
  'General Fitness',
  'Flexibility',
  'Yoga',
];

// Allowed difficulty levels
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

// ─── Exercise in Plan Sub-schema ─────────────────────────────────────────
// Defines an exercise item within a specific workout day
const planExerciseSchema = new mongoose.Schema({
  exerciseName: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    default: 'General',
  },
  sets: {
    type: Number,
    default: 3,
  },
  reps: {
    type: Number,
    default: 12,
  },
  durationSeconds: {
    type: Number,
    default: 0, // 0 if rep-based, else time in seconds
  },
  restSeconds: {
    type: Number,
    default: 60, // Rest period between sets
  },
  image: {
    type: String,
    default: '',
  },
  instructions: {
    type: String,
    default: '',
  },
});

// ─── Workout Day Schedule Sub-schema ─────────────────────────────────────
// Defines what happens on Day 1, Day 2, Rest Day, etc.
const planDaySchema = new mongoose.Schema({
  dayNumber: {
    type: Number,
    required: true,
  },
  dayName: {
    type: String, // e.g. "Day 1 - Chest & Triceps" or "Day 3 - Rest & Recovery"
    required: true,
  },
  isRestDay: {
    type: Boolean,
    default: false,
  },
  exercises: [planExerciseSchema], // Array of exercises for this day
});

// ═══════════════════════════════════════════════════════════════════════
// WORKOUT PLAN SCHEMA
// ═══════════════════════════════════════════════════════════════════════

const workoutPlanSchema = new mongoose.Schema(
  {
    _id: { type: String },
    // name — Title of the workout plan (e.g. "Beginner Weight Loss Shred")
    name: {
      type: String,
      required: [true, 'Workout plan name is required'],
      trim: true,
    },

    // description — Details about the program goals and approach
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },

    // goal — Primary goal (Weight Loss, Muscle Gain, Strength, General Fitness, Flexibility, Yoga)
    goal: {
      type: String,
      required: [true, 'Goal is required'],
      enum: GOALS,
    },

    // difficulty — Difficulty level (Beginner, Intermediate, Advanced)
    difficulty: {
      type: String,
      required: [true, 'Difficulty is required'],
      enum: DIFFICULTIES,
    },

    // durationWeeks — Length of the program in weeks (e.g., 4 weeks, 8 weeks)
    durationWeeks: {
      type: Number,
      required: [true, 'Duration in weeks is required'],
      min: 1,
      default: 4,
    },

    // daysPerWeek — How many active workout days per week (e.g., 3, 4, 5 days)
    daysPerWeek: {
      type: Number,
      required: [true, 'Days per week is required'],
      min: 1,
      max: 7,
      default: 4,
    },

    // estimatedCalories — Estimated calories burned per workout session
    estimatedCalories: {
      type: Number,
      required: true,
      default: 300,
    },

    // exercises — Array of workout day schedules containing exercises
    exercises: [planDaySchema],

    // restDays — List of rest day names (e.g. ['Wednesday', 'Sunday'])
    restDays: {
      type: [String],
      default: ['Wednesday', 'Sunday'],
    },

    // image — Cover image URL for the plan
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
    },

    // badge — Tag for display (e.g. "Popular", "Recommended", "Fat Burner")
    badge: {
      type: String,
      default: 'Standard',
    },
  },
  {
    // Automatically manage createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// Index for text search by name and description
workoutPlanSchema.index({ name: 'text', description: 'text' });

// Create model
const WorkoutPlan = mongoose.model('WorkoutPlan', workoutPlanSchema);

module.exports = WorkoutPlan;
module.exports.GOALS = GOALS;
module.exports.DIFFICULTIES = DIFFICULTIES;
