// ═══════════════════════════════════════════════════════════════════════
// exerciseController.js — Exercise Request Handler (Controller)
// ═══════════════════════════════════════════════════════════════════════
// This file handles HTTP requests and sends HTTP responses.
// It receives the request from the route, calls the service function,
// and sends back the result as JSON.
//
// Flow: Route → Controller → Service → Database
// Route decides WHICH controller to call based on the URL
// Controller parses the request and calls the right service function
// Service does the actual database work and returns data
// ═══════════════════════════════════════════════════════════════════════

const exerciseService = require('../services/exerciseService');

// ═══════════════════════════════════════════════════════════════════════
// 1. GET ALL EXERCISES
// ═══════════════════════════════════════════════════════════════════════
// URL: GET /api/exercises
// Query params: page, limit, category, difficulty, equipment, muscleGroup, sortBy, sortOrder
//
// Example requests:
//   GET /api/exercises?page=1&limit=10
//   GET /api/exercises?category=Chest&difficulty=Beginner
//   GET /api/exercises?sortBy=name&sortOrder=asc

const getAllExercises = async (req, res) => {
  try {
    // req.query contains all the ?key=value params from the URL
    const result = await exerciseService.getAllExercises(req.query);

    // Send success response with exercise data
    res.status(200).json({
      success: true,
      message: 'Exercises fetched successfully',
      data: result,
    });
  } catch (error) {
    // Something went wrong — send error response
    console.error('Error fetching exercises:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exercises',
      error: error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// 2. GET EXERCISE BY ID
// ═══════════════════════════════════════════════════════════════════════
// URL: GET /api/exercises/:id
// The :id is a route parameter (part of the URL path, not a query param)
//
// Example: GET /api/exercises/64f1a2b3c4d5e6f7g8h9i0j1

const getExerciseById = async (req, res) => {
  try {
    // req.params.id gets the :id value from the URL
    const exercise = await exerciseService.getExerciseById(req.params.id);

    // If no exercise found with this ID, send 404
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found',
      });
    }

    // Exercise found — send it back
    res.status(200).json({
      success: true,
      message: 'Exercise fetched successfully',
      data: exercise,
    });
  } catch (error) {
    console.error('Error fetching exercise:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exercise',
      error: error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// 3. GET EXERCISES BY CATEGORY
// ═══════════════════════════════════════════════════════════════════════
// URL: GET /api/exercises/category/:category
//
// Example: GET /api/exercises/category/Chest?page=1&limit=10

const getExercisesByCategory = async (req, res) => {
  try {
    // req.params.category gets the :category from the URL
    const result = await exerciseService.getExercisesByCategory(
      req.params.category,
      req.query // pagination params
    );

    res.status(200).json({
      success: true,
      message: `Exercises in ${req.params.category} category fetched successfully`,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching exercises by category:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exercises by category',
      error: error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// 4. GET EXERCISES BY MUSCLE GROUP
// ═══════════════════════════════════════════════════════════════════════
// URL: GET /api/exercises/muscle/:muscle
//
// Example: GET /api/exercises/muscle/Biceps?page=1&limit=10

const getExercisesByMuscle = async (req, res) => {
  try {
    const result = await exerciseService.getExercisesByMuscle(
      req.params.muscle,
      req.query
    );

    res.status(200).json({
      success: true,
      message: `Exercises for ${req.params.muscle} muscle fetched successfully`,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching exercises by muscle:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch exercises by muscle',
      error: error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// 5. SEARCH EXERCISES
// ═══════════════════════════════════════════════════════════════════════
// URL: GET /api/exercises/search?q=push
// Searches exercise name and description for the given text
//
// Example: GET /api/exercises/search?q=push&page=1&limit=10

const searchExercises = async (req, res) => {
  try {
    const result = await exerciseService.searchExercises(req.query);

    res.status(200).json({
      success: true,
      message: 'Search completed successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error searching exercises:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to search exercises',
      error: error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// 6. GET RECOMMENDED EXERCISES
// ═══════════════════════════════════════════════════════════════════════
// URL: GET /api/exercises/recommended
// Returns beginner-friendly exercises for recommendations

const getRecommendedExercises = async (req, res) => {
  try {
    const result = await exerciseService.getRecommendedExercises();

    res.status(200).json({
      success: true,
      message: 'Recommended exercises fetched successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error fetching recommended exercises:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommended exercises',
      error: error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// EXPORT ALL CONTROLLER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════
// The routes file will import these to connect URLs to handlers

module.exports = {
  getAllExercises,
  getExerciseById,
  getExercisesByCategory,
  getExercisesByMuscle,
  searchExercises,
  getRecommendedExercises,
};
