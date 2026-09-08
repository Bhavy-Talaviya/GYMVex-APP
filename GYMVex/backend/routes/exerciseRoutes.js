// ═══════════════════════════════════════════════════════════════════════
// exerciseRoutes.js — Exercise API Routes
// ═══════════════════════════════════════════════════════════════════════
// This file maps URL paths to controller functions.
// When someone visits a URL, Express checks these routes to find
// which controller function should handle the request.
//
// All routes here start with /api/exercises (set in server.js)
// So "/" here means "/api/exercises" and "/:id" means "/api/exercises/:id"
// ═══════════════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();

// Import all controller functions
const exerciseController = require('../controllers/exerciseController');

// ═══════════════════════════════════════════════════════════════════════
// ROUTE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════
//
// IMPORTANT: Order matters! Routes with fixed paths (like /search and
// /recommended) must come BEFORE routes with parameters (like /:id).
// Otherwise Express thinks "search" is an exercise ID.

// GET /api/exercises/search?q=push
// Search exercises by name or description
// Must be ABOVE /:id route
router.get('/search', exerciseController.searchExercises);

// GET /api/exercises/recommended
// Get recommended exercises for beginners
// Must be ABOVE /:id route
router.get('/recommended', exerciseController.getRecommendedExercises);

// GET /api/exercises/category/:category
// Get exercises filtered by category
// Example: /api/exercises/category/Chest
router.get('/category/:category', exerciseController.getExercisesByCategory);

// GET /api/exercises/muscle/:muscle
// Get exercises filtered by muscle group
// Example: /api/exercises/muscle/Biceps
router.get('/muscle/:muscle', exerciseController.getExercisesByMuscle);

// GET /api/exercises
// Get all exercises with pagination, filtering, and sorting
// Example: /api/exercises?page=1&limit=10&category=Chest
router.get('/', exerciseController.getAllExercises);

// GET /api/exercises/:id
// Get a single exercise by its MongoDB _id
// This must be LAST because :id matches any string
router.get('/:id', exerciseController.getExerciseById);

// ═══════════════════════════════════════════════════════════════════════
// EXPORT THE ROUTER
// ═══════════════════════════════════════════════════════════════════════
// server.js will mount this router at /api/exercises

module.exports = router;
