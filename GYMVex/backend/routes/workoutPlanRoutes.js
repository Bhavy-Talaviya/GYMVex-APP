// ═══════════════════════════════════════════════════════════════════════
// workoutPlanRoutes.js — API Endpoints for Workout Plans & User State
// ═══════════════════════════════════════════════════════════════════════
// Maps HTTP request URLs to the workout plan controller functions.
// ═══════════════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const controller = require('../controllers/workoutPlanController');

// ─── Plan Browse & Search Routes ───────────────────────────────────────
// GET  /api/plans — List all plans with optional goal & difficulty filters
router.get('/', controller.getWorkoutPlans);

// GET  /api/plans/recommended — Get recommended plans based on profile
router.get('/recommended', controller.getRecommendedPlans);

// POST /api/plans/seed — Seed default database plans
router.post('/seed', controller.seedPlans);

// GET  /api/plans/:id — Get details of a single plan by ID
router.get('/:id', controller.getWorkoutPlanById);

// POST /api/plans — Create new plan (admin/custom)
router.post('/', controller.createWorkoutPlan);

// PUT  /api/plans/:id — Update existing plan
router.put('/:id', controller.updateWorkoutPlan);

// DELETE /api/plans/:id — Delete plan
router.delete('/:id', controller.deleteWorkoutPlan);

// ─── User Plan Action Routes ───────────────────────────────────────────
// GET  /api/user-plan — Get active user plan state & progress
router.get('/user-plan/state', controller.getUserPlanState);

// POST /api/user-plan/start — Enroll/start a workout plan
router.post('/user-plan/start', controller.startPlan);

// POST /api/user-plan/pause — Pause current active plan
router.post('/user-plan/pause', controller.pausePlan);

// POST /api/user-plan/resume — Resume paused plan
router.post('/user-plan/resume', controller.resumePlan);

// POST /api/user-plan/complete-workout — Complete daily workout session
router.post('/user-plan/complete-workout', controller.completeWorkout);

// GET  /api/user-plan/history — Get workout completion log history
router.get('/user-plan/history', controller.getWorkoutHistory);

module.exports = router;
