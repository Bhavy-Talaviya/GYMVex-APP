// ═══════════════════════════════════════════════════════════════════════
// User.js — Mongoose Model for User Authentication Accounts (GYMVex)
// ═══════════════════════════════════════════════════════════════════════

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    loginCount: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Pre-save hook: automatically hash password with bcryptjs ────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ─── Instance method: verify password against hash ────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password || !enteredPassword) return false;
  // If password is a bcrypt hash
  if (
    this.password.startsWith('$2a$') ||
    this.password.startsWith('$2b$') ||
    this.password.startsWith('$2y$')
  ) {
    return await bcrypt.compare(enteredPassword, this.password);
  }
  // Fallback for legacy plain text passwords
  return this.password === enteredPassword;
};

module.exports = mongoose.model('User', userSchema);
