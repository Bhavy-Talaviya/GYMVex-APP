// ═══════════════════════════════════════════════════════════════════════
// fitnessTrackingRoutes.js — Express Routes for Weight & Calories Tracking
// ═══════════════════════════════════════════════════════════════════════
// Express Router mapping endpoints for weight logging, history, and daily/
// weekly/monthly calories calculation breakdowns.
// ═══════════════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const fitnessTrackingController = require('../controllers/fitnessTrackingController');

// ─── Weight Tracking Routes ────────────────────────────────────────────
router.post('/weight', fitnessTrackingController.addWeightLog);
router.get('/weight/history', fitnessTrackingController.getWeightHistory);

// ─── Calorie Calculation & Analytics Routes ──────────────────────────
router.get('/calories/daily', fitnessTrackingController.getDailyCalories);
router.get('/calories/weekly', fitnessTrackingController.getWeeklyCalories);
router.get('/calories/monthly', fitnessTrackingController.getMonthlyCalories);
router.get('/analytics', fitnessTrackingController.getAnalytics);

module.exports = router;
