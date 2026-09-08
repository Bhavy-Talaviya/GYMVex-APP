// ═══════════════════════════════════════════════════════════════════════
// notificationRoutes.js — Express Routes for Notification Preferences
// ═══════════════════════════════════════════════════════════════════════
// Express Router mapping endpoints for getting, saving notification preferences,
// and triggering test FCM push notifications.
// ═══════════════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// ─── Notification Routes ──────────────────────────────────────────────
router.get('/notifications/settings', notificationController.getNotificationSettings);
router.post('/notifications/settings', notificationController.saveNotificationSettings);
router.post('/notifications/send-test', notificationController.sendTestNotification);

module.exports = router;
