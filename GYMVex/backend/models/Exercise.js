// ═══════════════════════════════════════════════════════════════════════
// Exercise.js — Exercise Database Model (Mongoose Schema)
// ═══════════════════════════════════════════════════════════════════════
// This file defines the shape of an Exercise document in MongoDB.
// Every exercise stored in the database will follow this structure.
// ═══════════════════════════════════════════════════════════════════════

const mongoose = require('mongoose');

// ─── Allowed values for category, equipment, and difficulty ─────────
// These arrays define which values are valid for each field.
// If you try to save an exercise with a value not in these lists,
// MongoDB will reject it with a validation error.

const CATEGORIES = [
  'Chest',
  'Back',
  'Shoulders',
  'Arms',
  'Biceps',
  'Triceps',
  'Legs',
  'Glutes',
  'Core',
  'Cardio',
  'Full Body',
  'Stretching',
  'Yoga',
];

const EQUIPMENT = [
  'Bodyweight',
  'Dumbbell',
  'Barbell',
  'Machine',
  'Resistance Band',
  'Kettlebell',
  'Cable',
  'Bench',
  'None',
];

const DIFFICULTY = [
  'Beginner',
  'Intermediate',
  'Advanced',
];

// ═══════════════════════════════════════════════════════════════════════
// EXERCISE SCHEMA — defines all 22 fields of an exercise
// ═══════════════════════════════════════════════════════════════════════

const exerciseSchema = new mongoose.Schema(
  {
    // ─── Basic Info ───────────────────────────────────────────────
    
    // name — the exercise name (e.g., "Push-Up", "Bench Press")
    name: {
      type: String,
      required: [true, 'Exercise name is required'],
      trim: true, // removes extra spaces from start/end
    },

    // slug — URL-friendly version of the name (e.g., "push-up", "bench-press")
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true, // no two exercises can have the same slug
      lowercase: true,
      trim: true,
    },

    // description — short explanation of what this exercise does
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },

    // ─── Classification ──────────────────────────────────────────

    // category — which body part or workout type (e.g., "Chest", "Cardio")
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: CATEGORIES, // must be one of the allowed values
    },

    // muscleGroups — list of muscles this exercise works (e.g., ["Chest", "Triceps"])
    muscleGroups: {
      type: [String], // array of strings
      required: [true, 'At least one muscle group is required'],
    },

    // equipment — what equipment is needed (e.g., "Dumbbell", "Bodyweight")
    equipment: {
      type: String,
      required: [true, 'Equipment is required'],
      enum: EQUIPMENT, // must be one of the allowed values
    },

    // difficulty — how hard the exercise is (Beginner / Intermediate / Advanced)
    difficulty: {
      type: String,
      required: [true, 'Difficulty is required'],
      enum: DIFFICULTY, // must be one of the allowed values
    },

    // exerciseType — the kind of exercise (e.g., "Strength", "Cardio", "Flexibility")
    exerciseType: {
      type: String,
      required: [true, 'Exercise type is required'],
      trim: true,
    },

    // ─── Guidance ────────────────────────────────────────────────

    // instructions — step-by-step list of how to do the exercise
    instructions: {
      type: [String], // array of strings, each string is one step
      required: [true, 'Instructions are required'],
    },

    // tips — helpful tips for better form or results
    tips: {
      type: [String], // array of tip strings
      default: [], // optional — defaults to empty array
    },

    // mistakes — common mistakes people make with this exercise
    mistakes: {
      type: [String], // array of mistake strings
      default: [],
    },

    // benefits — what you gain from doing this exercise
    benefits: {
      type: [String], // array of benefit strings
      default: [],
    },

    // contraindications — when NOT to do this exercise (injuries, conditions)
    contraindications: {
      type: [String], // array of warning strings
      default: [],
    },

    // ─── Media ───────────────────────────────────────────────────

    // image — URL to an image showing the exercise
    image: {
      type: String,
      default: '', // optional — empty string if no image
    },

    // video — URL to a video demonstrating the exercise
    video: {
      type: String,
      default: '', // optional — empty string if no video
    },

    // ─── Workout Defaults ────────────────────────────────────────
    // These are suggested starting values when adding this exercise
    // to a workout plan. Users can change them.

    // caloriesPerMinute — estimated calories burned per minute
    caloriesPerMinute: {
      type: Number,
      default: 5,
    },

    // defaultSets — suggested number of sets (e.g., 3)
    defaultSets: {
      type: Number,
      default: 3,
    },

    // defaultReps — suggested number of reps per set (e.g., 12)
    defaultReps: {
      type: Number,
      default: 12,
    },

    // defaultDuration — suggested duration in seconds (for timed exercises like plank)
    defaultDuration: {
      type: Number,
      default: 0, // 0 means this exercise uses reps, not time
    },

    // restTime — suggested rest between sets in seconds (e.g., 60)
    restTime: {
      type: Number,
      default: 60,
    },
  },
  {
    // ─── Schema Options ──────────────────────────────────────────

    // timestamps: true — automatically adds createdAt and updatedAt fields
    // MongoDB will set createdAt when exercise is first saved
    // and update updatedAt every time it changes
    timestamps: true,
  }
);

// ═══════════════════════════════════════════════════════════════════════
// INDEX — makes searching by name faster
// ═══════════════════════════════════════════════════════════════════════
// This creates a "text index" on name and description fields.
// It lets MongoDB search through exercise names/descriptions quickly
// when we use the search API endpoint.
exerciseSchema.index({ name: 'text', description: 'text' });

// ═══════════════════════════════════════════════════════════════════════
// CREATE AND EXPORT THE MODEL
// ═══════════════════════════════════════════════════════════════════════
// mongoose.model('Exercise', exerciseSchema) creates a model.
// A model is like a class — we use it to create, read, update,
// and delete Exercise documents in the database.

const Exercise = mongoose.model('Exercise', exerciseSchema);

// Export the model and the constant arrays so other files can use them
module.exports = Exercise;
module.exports.CATEGORIES = CATEGORIES;
module.exports.EQUIPMENT = EQUIPMENT;
module.exports.DIFFICULTY = DIFFICULTY;
