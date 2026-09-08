// ═══════════════════════════════════════════════════════════════════════
// workoutPlanApi.js — Frontend API Service for Workout Plans
// ═══════════════════════════════════════════════════════════════════════
// Connects React Native app screens to backend API endpoints for plans,
// active user plan state, start, pause, resume, completion, & history.
// Includes seamless offline fallback so the app works even offline!
// ═══════════════════════════════════════════════════════════════════════

import { API_BASE_URL } from './config';
import fallbackPlans from '../backend/seed/planSeedData';
import { safeStorage } from './storage';

const STORAGE_KEYS = {
  PLAN_STATE: 'gymvex_user_plan_state',
  HISTORY: 'gymvex_workout_history',
};

// ─── Default Initial Completed Workouts (Clean fresh state) ──────────────
const DEFAULT_INITIAL_HISTORY = [];

// ─── Local In-Memory / Fallback State for Offline Mode ───────────────────
let localUserState = {
  activePlanData: null,
  status: 'none', // 'active' | 'paused' | 'none'
  currentWeek: 1,
  currentDay: 1,
  startedAt: undefined,
  userProfile: {
    goal: 'Weight Loss',
    difficulty: 'Beginner',
  },
  completedWorkouts: [],
};

// Helper: load stored state on startup
const initStoredState = async () => {
  try {
    const savedStateStr = await safeStorage.getItem(STORAGE_KEYS.PLAN_STATE);
    if (savedStateStr) {
      const parsed = typeof savedStateStr === 'string' ? JSON.parse(savedStateStr) : savedStateStr;
      if (parsed) {
        localUserState = { ...localUserState, ...parsed };
      }
    }

    const savedHistoryStr = await safeStorage.getItem(STORAGE_KEYS.HISTORY);
    if (savedHistoryStr) {
      const parsedHistory = typeof savedHistoryStr === 'string' ? JSON.parse(savedHistoryStr) : savedHistoryStr;
      if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
        localUserState.completedWorkouts = parsedHistory;
      }
    }
  } catch (e) {
    console.warn('Error reading stored plan state:', e);
  }
};
initStoredState();

// ═══════════════════════════════════════════════════════════════════════
// 1. FETCH ALL WORKOUT PLANS (Filtering by Goal, Difficulty, Search)
// ═══════════════════════════════════════════════════════════════════════
export const fetchWorkoutPlans = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.goal && filters.goal !== 'All') params.append('goal', filters.goal);
    if (filters.difficulty && filters.difficulty !== 'All') params.append('difficulty', filters.difficulty);
    if (filters.search) params.append('search', filters.search);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${API_BASE_URL}/plans?${params.toString()}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json();
    if (data.success && data.data && data.data.length > 0) {
      return data.data;
    }
    throw new Error('Empty response from server');
  } catch (error) {
    // Return filtered local fallback
    return fallbackPlans.filter((p) => {
      let matchGoal = !filters.goal || filters.goal === 'All' || p.goal === filters.goal;
      let matchDiff = !filters.difficulty || filters.difficulty === 'All' || p.difficulty === filters.difficulty;
      let matchSearch =
        !filters.search ||
        p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.description.toLowerCase().includes(filters.search.toLowerCase());
      return matchGoal && matchDiff && matchSearch;
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// 2. FETCH RECOMMENDED PLANS (Based on User Profile Goal & Difficulty)
// ═══════════════════════════════════════════════════════════════════════
export const fetchRecommendedPlans = async (goal = 'Weight Loss', difficulty = 'Beginner') => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(
      `${API_BASE_URL}/plans/recommended?goal=${encodeURIComponent(goal)}&difficulty=${encodeURIComponent(difficulty)}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    const data = await response.json();
    if (data.success && data.data && data.data.length > 0) {
      return data.data;
    }
    throw new Error('No recommended response');
  } catch (error) {
    return fallbackPlans.filter((p) => p.goal === goal || p.difficulty === difficulty);
  }
};

// ═══════════════════════════════════════════════════════════════════════
// 3. FETCH SINGLE PLAN BY ID
// ═══════════════════════════════════════════════════════════════════════
export const fetchPlanById = async (id) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${API_BASE_URL}/plans/${id}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json();
    if (data.success) return data.data;
    throw new Error(data.message || 'Plan not found');
  } catch (error) {
    const found = fallbackPlans.find((p) => p._id === id || p.name.toLowerCase() === String(id).toLowerCase());
    return found || fallbackPlans[0];
  }
};

// Helper to save state & history
const persistStateAndHistory = async () => {
  try {
    await safeStorage.setItem(STORAGE_KEYS.PLAN_STATE, localUserState);
    await safeStorage.setItem(STORAGE_KEYS.HISTORY, localUserState.completedWorkouts);
  } catch (e) {
    console.warn('Error saving plan state/history:', e);
  }
};

// ═══════════════════════════════════════════════════════════════════════
// 4. GET USER ACTIVE PLAN STATE
// ═══════════════════════════════════════════════════════════════════════
export const getUserPlanState = async () => {
  try {
    const saved = await safeStorage.getItem(STORAGE_KEYS.PLAN_STATE);
    if (saved) {
      const parsed = typeof saved === 'string' ? JSON.parse(saved) : saved;
      if (parsed) localUserState = { ...localUserState, ...parsed };
    }
  } catch (e) {}

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${API_BASE_URL}/user-plan/state`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await response.json();
    if (data.success) {
      localUserState = { ...localUserState, ...data.data };
      await safeStorage.setItem(STORAGE_KEYS.PLAN_STATE, localUserState);
      return localUserState;
    }
  } catch (error) {
    // API offline, return local state
  }

  return localUserState;
};

// ═══════════════════════════════════════════════════════════════════════
// 5. START / ENROLL WORKOUT PLAN
// ═══════════════════════════════════════════════════════════════════════
export const startWorkoutPlan = async (plan) => {
  localUserState.activePlanData = plan;
  localUserState.status = 'active';
  localUserState.currentWeek = 1;
  localUserState.currentDay = 1;
  localUserState.startedAt = new Date().toISOString();
  await persistStateAndHistory();

  try {
    fetch(`${API_BASE_URL}/user-plan/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId: plan._id, planData: plan }),
    }).catch(() => {});
  } catch (e) {}

  return localUserState;
};

// ═══════════════════════════════════════════════════════════════════════
// 6. PAUSE WORKOUT PLAN
// ═══════════════════════════════════════════════════════════════════════
export const pauseWorkoutPlan = async () => {
  localUserState.status = 'paused';
  await persistStateAndHistory();
  return localUserState;
};

// ═══════════════════════════════════════════════════════════════════════
// 7. RESUME WORKOUT PLAN
// ═══════════════════════════════════════════════════════════════════════
export const resumeWorkoutPlan = async () => {
  localUserState.status = 'active';
  await persistStateAndHistory();
  return localUserState;
};

// ═══════════════════════════════════════════════════════════════════════
// 8. COMPLETE WORKOUT & LOG HISTORY
// ═══════════════════════════════════════════════════════════════════════
export const completeWorkoutSession = async (caloriesBurned = 320, durationMinutes = 35, exercisesCount = 4) => {
  const plan = localUserState.activePlanData || fallbackPlans[0];
  const daySchedule =
    plan.exercises?.find((d) => d.dayNumber === localUserState.currentDay) || plan.exercises?.[0] || {};

  const newLog = {
    _id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    planId: String(plan._id || 'plan_session'),
    planName: plan.name || 'Workout Program',
    dayNumber: localUserState.currentDay,
    dayName: daySchedule.dayName || `Day ${localUserState.currentDay} Workout`,
    completedAt: new Date().toISOString(),
    caloriesBurned: Math.max(10, Number(caloriesBurned) || 300),
    durationMinutes: Math.max(1, Number(durationMinutes) || 30),
    exercisesCompletedCount: Number(exercisesCount) || 4,
    image: plan.image,
    type: 'plan',
  };

  localUserState.completedWorkouts = [newLog, ...(localUserState.completedWorkouts || [])];

  const totalDays = plan.exercises?.length || 4;
  if (localUserState.currentDay < totalDays) {
    localUserState.currentDay += 1;
  } else {
    localUserState.currentDay = 1;
    localUserState.currentWeek += 1;
  }

  await persistStateAndHistory();

  try {
    fetch(`${API_BASE_URL}/user-plan/complete-workout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caloriesBurned, durationMinutes, exercisesCount }),
    }).catch(() => {});
  } catch (error) {}

  return { success: true, data: localUserState, completedEntry: newLog };
};

// ═══════════════════════════════════════════════════════════════════════
// 8B. LOG INDIVIDUAL EXERCISE OR CUSTOM WORKOUT
// ═══════════════════════════════════════════════════════════════════════
export const logCompletedWorkout = async (customLog = {}) => {
  const newLog = {
    _id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    planId: customLog.planId || 'exercise_session',
    planName: customLog.planName || customLog.exerciseName || 'Single Exercise Workout',
    dayNumber: customLog.dayNumber || 1,
    dayName: customLog.dayName || customLog.exerciseName || 'Completed Exercise',
    completedAt: customLog.completedAt || new Date().toISOString(),
    caloriesBurned: Math.max(10, Number(customLog.caloriesBurned) || 120),
    durationMinutes: Math.max(1, Number(customLog.durationMinutes) || 15),
    exercisesCompletedCount: Number(customLog.exercisesCompletedCount) || 1,
    setsCount: customLog.setsCount || customLog.sets,
    repsCount: customLog.repsCount || customLog.reps,
    weight: customLog.weight,
    image: customLog.image,
    type: customLog.type || 'exercise',
  };

  localUserState.completedWorkouts = [newLog, ...(localUserState.completedWorkouts || [])];
  await persistStateAndHistory();

  return { success: true, data: localUserState, completedEntry: newLog };
};

// ═══════════════════════════════════════════════════════════════════════
// 9. GET WORKOUT HISTORY
// ═══════════════════════════════════════════════════════════════════════
export const getWorkoutHistory = async () => {
  try {
    const saved = await safeStorage.getItem(STORAGE_KEYS.HISTORY);
    if (saved) {
      const parsed = typeof saved === 'string' ? JSON.parse(saved) : saved;
      if (Array.isArray(parsed)) {
        localUserState.completedWorkouts = parsed;
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading history:', e);
  }
  return localUserState.completedWorkouts || [];
};

// ═══════════════════════════════════════════════════════════════════════
// 9B. DELETE WORKOUT LOG
// ═══════════════════════════════════════════════════════════════════════
export const deleteWorkoutLog = async (logId) => {
  localUserState.completedWorkouts = (localUserState.completedWorkouts || []).filter(
    (item) => item._id !== logId && String(item.completedAt) !== String(logId)
  );
  await persistStateAndHistory();
  return localUserState.completedWorkouts;
};

// ═══════════════════════════════════════════════════════════════════════
// 9C. CLEAR ALL WORKOUT HISTORY
// ═══════════════════════════════════════════════════════════════════════
export const clearWorkoutHistory = async () => {
  localUserState.completedWorkouts = [];
  await persistStateAndHistory();
  return [];
};

// ═══════════════════════════════════════════════════════════════════════
// 10. UPDATE USER PROFILE PREFERENCES (Goal & Difficulty)
// ═══════════════════════════════════════════════════════════════════════
export const updateUserProfile = async (goal, difficulty) => {
  localUserState.userProfile = { goal, difficulty };
  await persistStateAndHistory();
  return localUserState.userProfile;
};

// ═══════════════════════════════════════════════════════════════════════
// 11. FULL RESET WORKOUT PLAN STATE (Used during account deletion/logout)
// ═══════════════════════════════════════════════════════════════════════
export const clearAllWorkoutPlanData = async () => {
  localUserState = {
    activePlanData: null,
    status: 'none',
    currentWeek: 1,
    currentDay: 1,
    startedAt: undefined,
    userProfile: {
      goal: 'Weight Loss',
      difficulty: 'Beginner',
    },
    completedWorkouts: [],
  };
  try {
    await safeStorage.removeItem(STORAGE_KEYS.PLAN_STATE);
    await safeStorage.removeItem(STORAGE_KEYS.HISTORY);
  } catch (e) {}
};
