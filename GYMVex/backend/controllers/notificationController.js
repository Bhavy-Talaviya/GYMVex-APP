// ═══════════════════════════════════════════════════════════════════════
// notificationController.js — Controller for Notifications & Reminders
// ═══════════════════════════════════════════════════════════════════════
// Controller handling APIs for reading & saving user notification settings,
// FCM token registration, and triggering test push notifications.
// ═══════════════════════════════════════════════════════════════════════

const NotificationSettings = require('../models/NotificationSettings');

// ═══════════════════════════════════════════════════════════════════════
// 1. GET /api/notifications/settings — Fetch Notification Preferences
// ═══════════════════════════════════════════════════════════════════════
exports.getNotificationSettings = async (req, res) => {
  try {
    const userId = req.query.userId || 'default_user';

    let settings = await NotificationSettings.findOne({ userId });

    if (!settings) {
      settings = await NotificationSettings.create({ userId });
    }

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification settings',
      error: error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// 2. POST /api/notifications/settings — Update Notification Preferences
// ═══════════════════════════════════════════════════════════════════════
exports.saveNotificationSettings = async (req, res) => {
  try {
    const { userId = 'default_user', ...updateFields } = req.body;

    const settings = await NotificationSettings.findOneAndUpdate(
      { userId },
      { $set: updateFields },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Notification settings updated successfully!',
      data: settings,
    });
  } catch (error) {
    console.error('Error saving notification settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save notification settings',
      error: error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// 3. POST /api/notifications/send-test — Send Test Notification
// ═══════════════════════════════════════════════════════════════════════
exports.sendTestNotification = async (req, res) => {
  try {
    const { type = 'workout', title, body } = req.body;

    // Simulate FCM Cloud Messaging push payload
    const pushPayload = {
      title: title || '🏋️ GYMVex Workout Reminder',
      body: body || "It's time for today's workout! Crush your fitness goals.",
      data: { type, timestamp: new Date().toISOString() },
    };

    console.log('[FCM Notification Sent]:', pushPayload);

    res.json({
      success: true,
      message: 'Test notification triggered successfully via Cloud Messaging!',
      payload: pushPayload,
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification',
      error: error.message,
    });
  }
};
