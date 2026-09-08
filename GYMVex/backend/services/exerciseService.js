// ═══════════════════════════════════════════════════════════════════════
// exerciseService.js — Exercise Business Logic Layer
// ═══════════════════════════════════════════════════════════════════════
// This file contains all the database operations for exercises.
// The controller calls these functions — they do the actual work
// of talking to MongoDB through the Exercise model.
//
// WHY USE A SERVICE?
// Keeping database logic separate from request handling (controller)
// makes the code cleaner, easier to test, and reusable.
// ═══════════════════════════════════════════════════════════════════════

const Exercise = require('../models/Exercise');

// ═══════════════════════════════════════════════════════════════════════
// 1. GET ALL EXERCISES — with pagination, filtering, and sorting
// ═══════════════════════════════════════════════════════════════════════
// This is the most complex function because it handles many features:
// - Pagination (page & limit)
// - Filtering (by category, difficulty, equipment, muscleGroup)
// - Sorting (by any field, ascending or descending)
//
// Example usage from controller:
//   getAllExercises({ page: 1, limit: 10, category: 'Chest', sortBy: 'name' })

const getAllExercises = async (queryParams) => {
  // ─── Step 1: Extract pagination values ──────────────────────
  // parseInt converts string "2" to number 2
  // Default: page 1, 10 items per page
  const page = parseInt(queryParams.page) || 1;
  const limit = parseInt(queryParams.limit) || 10;

  // "skip" tells MongoDB how many documents to skip
  // Page 1: skip 0, Page 2: skip 10, Page 3: skip 20, etc.
  const skip = (page - 1) * limit;

  // ─── Step 2: Build the filter object ────────────────────────
  // Start with empty filter (matches all exercises)
  const filter = {};

  // If user sent ?category=Chest, only get Chest exercises
  if (queryParams.category) {
    filter.category = queryParams.category;
  }

  // If user sent ?difficulty=Beginner, only get Beginner exercises
  if (queryParams.difficulty) {
    filter.difficulty = queryParams.difficulty;
  }

  // If user sent ?equipment=Dumbbell, only get Dumbbell exercises
  if (queryParams.equipment) {
    filter.equipment = queryParams.equipment;
  }

  // If user sent ?muscleGroup=Biceps, find exercises where
  // the muscleGroups array contains "Biceps"
  if (queryParams.muscleGroup) {
    filter.muscleGroups = { $in: [queryParams.muscleGroup] };
    // $in means "array contains at least one of these values"
  }

  // ─── Step 3: Build the sort object ──────────────────────────
  // Default sort: newest first (by createdAt, descending)
  const sortBy = queryParams.sortBy || 'createdAt';
  const sortOrder = queryParams.sortOrder === 'asc' ? 1 : -1;
  // 1 = ascending (A-Z, 0-9), -1 = descending (Z-A, 9-0)
  const sort = { [sortBy]: sortOrder };

  // ─── Step 4: Run the database query ─────────────────────────
  // .find(filter) — get exercises matching our filter
  // .sort(sort) — sort the results
  // .skip(skip) — skip exercises for pagination
  // .limit(limit) — only return 'limit' number of exercises
  const exercises = await Exercise.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  // ─── Step 5: Count total matching exercises ─────────────────
  // We need the total count to calculate total pages
  const totalExercises = await Exercise.countDocuments(filter);
  const totalPages = Math.ceil(totalExercises / limit);

  // ─── Step 6: Return the result ──────────────────────────────
  return {
    exercises,
    currentPage: page,
    totalPages,
    totalExercises,
  };
};

// ═══════════════════════════════════════════════════════════════════════
// 2. GET EXERCISE BY ID — get a single exercise by its MongoDB _id
// ═══════════════════════════════════════════════════════════════════════
// Example: getExerciseById('64f1a2b3c4d5e6f7g8h9i0j1')

const getExerciseById = async (id) => {
  // findById searches for a document with the given _id
  const exercise = await Exercise.findById(id);
  return exercise; // returns null if not found
};

// ═══════════════════════════════════════════════════════════════════════
// 3. GET EXERCISES BY CATEGORY — with pagination
// ═══════════════════════════════════════════════════════════════════════
// Example: getExercisesByCategory('Chest', { page: 1, limit: 10 })

const getExercisesByCategory = async (category, queryParams) => {
  const page = parseInt(queryParams.page) || 1;
  const limit = parseInt(queryParams.limit) || 10;
  const skip = (page - 1) * limit;

  // Find all exercises where category matches
  const exercises = await Exercise.find({ category })
    .sort({ name: 1 }) // sort alphabetically by name
    .skip(skip)
    .limit(limit);

  const totalExercises = await Exercise.countDocuments({ category });
  const totalPages = Math.ceil(totalExercises / limit);

  return {
    exercises,
    category,
    currentPage: page,
    totalPages,
    totalExercises,
  };
};

// ═══════════════════════════════════════════════════════════════════════
// 4. GET EXERCISES BY MUSCLE GROUP — with pagination
// ═══════════════════════════════════════════════════════════════════════
// Example: getExercisesByMuscle('Biceps', { page: 1, limit: 10 })

const getExercisesByMuscle = async (muscle, queryParams) => {
  const page = parseInt(queryParams.page) || 1;
  const limit = parseInt(queryParams.limit) || 10;
  const skip = (page - 1) * limit;

  // $in checks if the muscleGroups array contains this muscle
  const filter = { muscleGroups: { $in: [muscle] } };

  const exercises = await Exercise.find(filter)
    .sort({ name: 1 })
    .skip(skip)
    .limit(limit);

  const totalExercises = await Exercise.countDocuments(filter);
  const totalPages = Math.ceil(totalExercises / limit);

  return {
    exercises,
    muscle,
    currentPage: page,
    totalPages,
    totalExercises,
  };
};

// ═══════════════════════════════════════════════════════════════════════
// 5. SEARCH EXERCISES — search by name or description
// ═══════════════════════════════════════════════════════════════════════
// Uses a simple regex search (case-insensitive).
// Example: searchExercises({ q: 'push', page: 1, limit: 10 })

const searchExercises = async (queryParams) => {
  const searchQuery = queryParams.q || '';
  const page = parseInt(queryParams.page) || 1;
  const limit = parseInt(queryParams.limit) || 10;
  const skip = (page - 1) * limit;

  // If no search query provided, return empty result
  if (!searchQuery.trim()) {
    return {
      exercises: [],
      searchQuery: '',
      currentPage: 1,
      totalPages: 0,
      totalExercises: 0,
    };
  }

  // Build a regex pattern for case-insensitive search
  // 'i' flag means case-insensitive (matches "Push", "push", "PUSH")
  const searchRegex = new RegExp(searchQuery, 'i');

  // $or means "match if ANY of these conditions is true"
  // So this finds exercises where name OR description contains the search text
  const filter = {
    $or: [
      { name: { $regex: searchRegex } },
      { description: { $regex: searchRegex } },
    ],
  };

  const exercises = await Exercise.find(filter)
    .sort({ name: 1 })
    .skip(skip)
    .limit(limit);

  const totalExercises = await Exercise.countDocuments(filter);
  const totalPages = Math.ceil(totalExercises / limit);

  return {
    exercises,
    searchQuery,
    currentPage: page,
    totalPages,
    totalExercises,
  };
};

// ═══════════════════════════════════════════════════════════════════════
// 6. GET RECOMMENDED EXERCISES — beginner-friendly popular exercises
// ═══════════════════════════════════════════════════════════════════════
// Returns a mix of exercises from different categories
// that are good for beginners or intermediate users.

const getRecommendedExercises = async () => {
  // Get exercises that are Beginner or Intermediate level
  // Limit to 12 exercises, sorted randomly for variety
  const exercises = await Exercise.find({
    difficulty: { $in: ['Beginner', 'Intermediate'] },
  })
    .limit(12);

  return {
    exercises,
    totalExercises: exercises.length,
  };
};

// ═══════════════════════════════════════════════════════════════════════
// EXPORT ALL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════
// The controller will import these functions to handle API requests

module.exports = {
  getAllExercises,
  getExerciseById,
  getExercisesByCategory,
  getExercisesByMuscle,
  searchExercises,
  getRecommendedExercises,
};
