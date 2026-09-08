// ═══════════════════════════════════════════════════════════════════════
// workoutPlanController.js — Controller Logic for Workout Plans & User State
// ═══════════════════════════════════════════════════════════════════════
// Handles fetching plans, recommended plans, start/pause/resume/change plan,
// completing daily workout sessions, history tracking, and database seeding.
// ═══════════════════════════════════════════════════════════════════════

const WorkoutPlan = require('../models/WorkoutPlan');
const UserWorkoutState = require('../models/UserWorkoutState');
const planSeedData = require('../seed/planSeedData');

// ─── Helper function: Get or initialize User Workout State ────────────
const getOrCreateUserState = async (userId = 'default_user') => {
  let userState = await UserWorkoutState.findOne({ userId });
  if (!userState) {
    userState = await UserWorkoutState.create({
      userId,
      status: 'none',
      currentWeek: 1,
      currentDay: 1,
      completedWorkouts: [],
      userProfile: { goal: 'General Fitness', difficulty: 'Beginner' },
    });
  }
  return userState;
};

// ═══════════════════════════════════════════════════════════════════════
// 1. GET ALL WORKOUT PLANS (Supports Goal, Difficulty, Search filtering)
// ═══════════════════════════════════════════════════════════════════════
exports.getWorkoutPlans = async (req, res) => {
  try {
    const { goal, difficulty, search } = req.query;

    let filter = {};

    if (goal && goal !== 'All') {
      filter.goal = goal;
    }

    if (difficulty && difficulty !== 'All') {
      filter.difficulty = difficulty;
    }

    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    let plans = await WorkoutPlan.find(filter).sort({ createdAt: -1 });

    // Fallback: If DB empty, return seed data filtered locally
    if (!plans || plans.length === 0) {
      plans = planSeedData.filter((p) => {
        let matchGoal = !goal || goal === 'All' || p.goal === goal;
        let matchDiff = !difficulty || difficulty === 'All' || p.difficulty === difficulty;
        let matchSearch =
          !search ||
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase());
        return matchGoal && matchDiff && matchSearch;
      });
    }

    res.json({
      success: true,
      count: plans.length,
      data: plans,
    });
  } catch (error) {
    console.error('Error fetching workout plans:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// 2. GET RECOMMENDED PLANS (Based on User Profile Goal & Difficulty)
// ═══════════════════════════════════════════════════════════════════════
exports.getRecommendedPlans = async (req, res) => {
  try {
    const { goal = 'Weight Loss', difficulty = 'Beginner' } = req.query;

    // Search DB for exact or close match to profile
    let recommended = await WorkoutPlan.find({
      $or: [{ goal: goal }, { difficulty: difficulty }],
    }).limit(6);

    if (!recommended || recommended.length === 0) {
      recommended = planSeedData.filter((p) => p.goal === goal || p.difficulty === difficulty);
    }

    res.json({
      success: true,
      userProfile: { goal, difficulty },
      data: recommended,
    });
  } catch (error) {
    console.error('Error fetching recommended plans:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// 3. GET SINGLE WORKOUT PLAN BY ID
// ═══════════════════════════════════════════════════════════════════════
exports.getWorkoutPlanById = async (req, res) => {
  try {
    const { id } = req.params;

    let plan = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      plan = await WorkoutPlan.findById(id);
    }

    if (!plan) {
      plan = planSeedData.find((p) => p._id === id || p.name.toLowerCase() === id.toLowerCase());
    }

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Workout plan not found' });
    }

    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// 4. CREATE WORKOUT PLAN
// ═══════════════════════════════════════════════════════════════════════
exports.createWorkoutPlan = async (req, res) => {
  try {
    const newPlan = await WorkoutPlan.create(req.body);
    res.status(201).json({ success: true, data: newPlan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// 5. UPDATE WORKOUT PLAN
// ═══════════════════════════════════════════════════════════════════════
exports.updateWorkoutPlan = async (req, res) => {
  try {
    const updatedPlan = await WorkoutPlan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedPlan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    res.json({ success: true, data: updatedPlan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// 6. DELETE WORKOUT PLAN
// ═══════════════════════════════════════════════════════════════════════
exports.deleteWorkoutPlan = async (req, res) => {
  try {
    await WorkoutPlan.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Workout plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// 7. GET USER WORKOUT STATE (Active Plan, Status, History)
// ═══════════════════════════════════════════════════════════════════════
exports.getUserPlanState = async (req, res) => {
  try {
    const userState = await getOrCreateUserState();
    res.json({ success: true, data: userState });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// 8. START / ENROLL IN WORKOUT PLAN
// ═══════════════════════════════════════════════════════════════════════
exports.startPlan = async (req, res) => {
  try {
    const { planId, planData } = req.body;
    const userState = await getOrCreateUserState();

    let targetPlan = planData;
    if (!targetPlan && planId && planId.match(/^[0-9a-fA-F]{24}$/)) {
      targetPlan = await WorkoutPlan.findById(planId);
    }
    if (!targetPlan) {
      targetPlan = planSeedData.find((p) => p._id === planId) || planSeedData[0];
    }

    userState.activePlanData = targetPlan;
    userState.status = 'active';
    userState.startedAt = new Date();
    userState.currentWeek = 1;
    userState.currentDay = 1;

    await userState.save();

    res.json({ success: true, message: 'Plan started successfully', data: userState });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// 9. PAUSE WORKOUT PLAN
// ═══════════════════════════════════════════════════════════════════════
exports.pausePlan = async (req, res) => {
  try {
    const userState = await getOrCreateUserState();
    if (userState.status === 'none' || !userState.activePlanData) {
      return res.status(400).json({ success: false, message: 'No active plan to pause' });
    }

    userState.status = 'paused';
    await userState.save();

    res.json({ success: true, message: 'Plan paused successfully', data: userState });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// 10. RESUME WORKOUT PLAN
// ═══════════════════════════════════════════════════════════════════════
exports.resumePlan = async (req, res) => {
  try {
    const userState = await getOrCreateUserState();
    if (!userState.activePlanData) {
      return res.status(400).json({ success: false, message: 'No plan found to resume' });
    }

    userState.status = 'active';
    await userState.save();

    res.json({ success: true, message: 'Plan resumed successfully', data: userState });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// 11. COMPLETE WORKOUT & RECORD IN HISTORY
// ═══════════════════════════════════════════════════════════════════════
exports.completeWorkout = async (req, res) => {
  try {
    const { caloriesBurned = 300, durationMinutes = 30, exercisesCount = 5 } = req.body;
    const userState = await getOrCreateUserState();

    if (!userState.activePlanData) {
      return res.status(400).json({ success: false, message: 'No active plan' });
    }

    const plan = userState.activePlanData;
    const daySchedule =
      plan.exercises?.find((d) => d.dayNumber === userState.currentDay) || plan.exercises?.[0] || {};

    // Record completed workout log
    const completedLog = {
      planId: String(plan._id || 'local_plan'),
      planName: plan.name || 'Workout Plan',
      dayNumber: userState.currentDay,
      dayName: daySchedule.dayName || `Day ${userState.currentDay}`,
      completedAt: new Date(),
      caloriesBurned: Number(caloriesBurned) || plan.estimatedCalories || 300,
      durationMinutes: Number(durationMinutes) || 35,
      exercisesCompletedCount: Number(exercisesCount) || daySchedule.exercises?.length || 4,
    };

    userState.completedWorkouts.unshift(completedLog);

    // Advance current day counter
    const totalDaysInSchedule = plan.exercises?.length || 4;
    if (userState.currentDay < totalDaysInSchedule) {
      userState.currentDay += 1;
    } else {
      // Loop back or advance week
      userState.currentDay = 1;
      userState.currentWeek += 1;
    }

    await userState.save();

    res.json({
      success: true,
      message: 'Workout completed! Great job!',
      data: userState,
      completedEntry: completedLog,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// 12. GET WORKOUT HISTORY
// ═══════════════════════════════════════════════════════════════════════
exports.getWorkoutHistory = async (req, res) => {
  try {
    const userState = await getOrCreateUserState();
    res.json({
      success: true,
      history: userState.completedWorkouts || [],
      totalWorkouts: userState.completedWorkouts?.length || 0,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// 13. SEED INITIAL WORKOUT PLANS INTO MONGODB
// ═══════════════════════════════════════════════════════════════════════
exports.seedPlans = async (req, res) => {
  try {
    await WorkoutPlan.deleteMany({});
    const inserted = await WorkoutPlan.insertMany(planSeedData);
    res.json({
      success: true,
      message: `Successfully seeded ${inserted.length} workout plans!`,
      data: inserted,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
