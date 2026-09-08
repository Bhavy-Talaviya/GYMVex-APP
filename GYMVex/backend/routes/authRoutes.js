// ═══════════════════════════════════════════════════════════════════════
// authRoutes.js — Express Routes for Authentication (GYMVex)
// ═══════════════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userProfileController = require('../controllers/userProfileController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.delete('/account', userProfileController.deleteAccount);

module.exports = router;

