// ═══════════════════════════════════════════════════════════════════════
// UserProfile.js — Mongoose Model for User Profile & Settings (GYMVex)
// ═══════════════════════════════════════════════════════════════════════
// Stores user personal profile info (name, email, height, weight, target weight,
// fitness goal, activity level, experience) and settings preferences.
// ═══════════════════════════════════════════════════════════════════════

const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: 'default_user',
      unique: true,
      index: true,
    },
    profileImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400',
    },
    name: {
      type: String,
      default: 'Athlete',
    },
    email: {
      type: String,
      default: '',
    },
    height: {
      type: Number,
      default: 175,
    },
    heightUnit: {
      type: String,
      enum: ['cm', 'ft'],
      default: 'cm',
    },
    weight: {
      type: Number,
      default: 75.0,
    },
    targetWeight: {
      type: Number,
      default: 70.0,
    },
    weightUnit: {
      type: String,
      enum: ['kg', 'lbs'],
      default: 'kg',
    },
    fitnessGoal: {
      type: String,
      enum: ['Weight Loss', 'Muscle Gain', 'Strength', 'General Fitness', 'Flexibility', 'Yoga'],
      default: 'Weight Loss',
    },
    activityLevel: {
      type: String,
      enum: ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active'],
      default: 'Moderately Active',
    },
    experience: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    theme: {
      type: String,
      enum: ['dark', 'light'],
      default: 'light',
    },
    restTimerSeconds: {
      type: Number,
      default: 60,
    },
    soundEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('UserProfile', userProfileSchema);
