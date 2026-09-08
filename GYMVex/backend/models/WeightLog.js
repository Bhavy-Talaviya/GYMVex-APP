// ═══════════════════════════════════════════════════════════════════════
// WeightLog.js — Mongoose Model for Weight Logs (GYMVex)
// ═══════════════════════════════════════════════════════════════════════
// Stores user weight entries, target weight goal, measurement unit (kg/lbs),
// and timestamp history.
// ═══════════════════════════════════════════════════════════════════════

const mongoose = require('mongoose');

const weightLogSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: 'default_user',
      index: true,
    },
    weight: {
      type: Number,
      required: [true, 'Weight value is required'],
    },
    unit: {
      type: String,
      enum: ['kg', 'lbs'],
      default: 'kg',
    },
    targetWeight: {
      type: Number,
      default: 70,
    },
    recordedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('WeightLog', weightLogSchema);
