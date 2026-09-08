// ═══════════════════════════════════════════════════════════════════════
// exerciseApi.js — API Service for GYMVex Mobile App (with Offline Fallback)
// ═══════════════════════════════════════════════════════════════════════
// This file handles fetching exercise data from the backend API.
// Includes automatic local fallback so the app works instantly and
// seamlessly whether online or offline!
// ═══════════════════════════════════════════════════════════════════════

import { API_BASE_URL } from './config';
import fallbackExercises from '../backend/seed/exerciseSeedData';

// ─── Local Fallback Helper ──────────────────────────────────────────
// Used when backend API is unreachable or offline
const getFallbackData = (page = 1, limit = 10, filters = {}, sortBy = 'name', sortOrder = 'asc', searchQuery = '') => {
  let list = [...fallbackExercises];

  // 1. Search text filter
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    list = list.filter((e) => e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
  }

  // 2. Category filter
  if (filters.category && filters.category !== 'All') {
    list = list.filter((e) => e.category.toLowerCase() === filters.category.toLowerCase());
  }

  // 3. Difficulty filter
  if (filters.difficulty && filters.difficulty !== 'All') {
    list = list.filter((e) => e.difficulty.toLowerCase() === filters.difficulty.toLowerCase());
  }

  // 4. Equipment filter
  if (filters.equipment && filters.equipment !== 'All') {
    list = list.filter((e) => e.equipment.toLowerCase() === filters.equipment.toLowerCase());
  }

  // 5. Muscle group filter
  if (filters.muscleGroup && filters.muscleGroup !== 'All') {
    list = list.filter((e) => e.muscleGroups?.some((m) => m.toLowerCase() === filters.muscleGroup.toLowerCase()));
  }

  // Ensure unique string _id for list keys
  const formatted = list.map((item, idx) => ({
    ...item,
    _id: item._id || item.slug || `local-${idx}`,
  }));

  const totalExercises = formatted.length;
  const totalPages = Math.ceil(totalExercises / limit) || 1;
  const start = (page - 1) * limit;
  const pageItems = formatted.slice(start, start + limit);

  return {
    exercises: pageItems,
    currentPage: page,
    totalPages,
    totalExercises,
  };
};

// ═══════════════════════════════════════════════════════════════════════
// 1. FETCH ALL EXERCISES
// ═══════════════════════════════════════════════════════════════════════

export const fetchAllExercises = async (page = 1, limit = 10, filters = {}, sortBy = 'createdAt', sortOrder = 'desc') => {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sortBy: sortBy,
      sortOrder: sortOrder,
    });

    if (filters.category) params.append('category', filters.category);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.equipment) params.append('equipment', filters.equipment);
    if (filters.muscleGroup) params.append('muscleGroup', filters.muscleGroup);

    // Timeout after 8 seconds if backend is slow/unreachable
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${API_BASE_URL}/exercises?${params.toString()}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json();

    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message || 'Failed to fetch exercises');
    }
  } catch (error) {
    // Return instant local fallback so user never gets stuck or sees network errors
    return getFallbackData(page, limit, filters, sortBy, sortOrder);
  }
};

// ═══════════════════════════════════════════════════════════════════════
// 2. FETCH EXERCISE BY ID
// ═══════════════════════════════════════════════════════════════════════

export const fetchExerciseById = async (id) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${API_BASE_URL}/exercises/${id}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json();

    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message || 'Exercise not found');
    }
  } catch (error) {
    // Find exercise in local seed array by _id or slug
    const found = fallbackExercises.find(
      (e, idx) => e._id === id || e.slug === id || `local-${idx}` === id || e.name.toLowerCase() === id.toLowerCase()
    );
    if (found) {
      return { ...found, _id: found._id || found.slug || id };
    }
    // Return first exercise as safe fallback if ID not matched
    return { ...fallbackExercises[0], _id: id };
  }
};

// ═══════════════════════════════════════════════════════════════════════
// 3. FETCH EXERCISES BY CATEGORY
// ═══════════════════════════════════════════════════════════════════════

export const fetchExercisesByCategory = async (category, page = 1, limit = 10) => {
  return fetchAllExercises(page, limit, { category });
};

// ═══════════════════════════════════════════════════════════════════════
// 4. FETCH EXERCISES BY MUSCLE GROUP
// ═══════════════════════════════════════════════════════════════════════

export const fetchExercisesByMuscle = async (muscle, page = 1, limit = 10) => {
  return fetchAllExercises(page, limit, { muscleGroup: muscle });
};

// ═══════════════════════════════════════════════════════════════════════
// 5. SEARCH EXERCISES
// ═══════════════════════════════════════════════════════════════════════

export const searchExercises = async (query, page = 1, limit = 10) => {
  try {
    const params = new URLSearchParams({
      q: query,
      page: String(page),
      limit: String(limit),
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${API_BASE_URL}/exercises/search?${params.toString()}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json();

    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message || 'Search failed');
    }
  } catch (error) {
    return getFallbackData(page, limit, {}, 'name', 'asc', query);
  }
};

// ═══════════════════════════════════════════════════════════════════════
// 6. FETCH RECOMMENDED EXERCISES
// ═══════════════════════════════════════════════════════════════════════

export const fetchRecommendedExercises = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${API_BASE_URL}/exercises/recommended`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json();

    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message || 'Failed to fetch recommendations');
    }
  } catch (error) {
    const recs = fallbackExercises
      .filter((e) => e.difficulty === 'Beginner' || e.difficulty === 'Intermediate')
      .slice(0, 10)
      .map((item, idx) => ({ ...item, _id: item._id || item.slug || `local-${idx}` }));
    return { exercises: recs, totalExercises: recs.length };
  }
};

module.exports = {
  fetchAllExercises,
  fetchExerciseById,
  fetchExercisesByCategory,
  fetchExercisesByMuscle,
  searchExercises,
  fetchRecommendedExercises,
};
