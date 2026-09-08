// ═══════════════════════════════════════════════════════════════════════
// userProfileRoutes.js — Express Routes for Profile & Settings
// ═══════════════════════════════════════════════════════════════════════
// Express Router mapping endpoints for getting, updating profile, and account deletion.
// ═══════════════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const userProfileController = require('../controllers/userProfileController');

// ─── Profile Routes ───────────────────────────────────────────────────
router.get('/profile', userProfileController.getUserProfile);
router.post('/profile', userProfileController.updateUserProfile);
router.delete('/profile/account', userProfileController.deleteAccount);

module.exports = router;
