// ═══════════════════════════════════════════════════════════════════════
// NotificationSettings.js — Mongoose Model for Notification Preferences
// ═══════════════════════════════════════════════════════════════════════
// Stores user notification preferences, FCM tokens, reminder time,
// workout reminder days, and specific reminder type toggles.
// ═══════════════════════════════════════════════════════════════════════

const mongoose = require('mongoose');

const notificationSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: 'default_user',
      unique: true,
      index: true,
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
    reminderTime: {
      type: String,
      default: '08:00',
    },
    fcmToken: {
      type: String,
      default: '',
    },
    workoutReminder: {
      type: Boolean,
      default: true,
    },
    dailyFitnessReminder: {
      type: Boolean,
      default: true,
    },
    restReminder: {
      type: Boolean,
      default: true,
    },
    planReminder: {
      type: Boolean,
      default: true,
    },
    streakReminder: {
      type: Boolean,
      default: true,
    },
    inactivityReminder: {
      type: Boolean,
      default: true,
    },
    workoutDays: {
      type: [String],
      default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    },
    restDayNotifications: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('NotificationSettings', notificationSettingsSchema);
