// ═══════════════════════════════════════════════════════════════════════
// fitnessTrackingController.js — Controller for Weight & Calories Tracking
// ═══════════════════════════════════════════════════════════════════════
// Controller handling APIs for logging weight, weight history, progress %,
// and daily, weekly, & monthly workout calorie calculation breakdowns.
// ═══════════════════════════════════════════════════════════════════════

const WeightLog = require('../models/WeightLog');
const WorkoutLog = require('../models/WorkoutLog');

// Calorie calculation notice
const CALORIE_DISCLAIMER =
  'Note: Calorie calculations are estimated based on workout duration, intensity METs, and user weight. They are not medically or scientifically exact.';

// ═══════════════════════════════════════════════════════════════════════
// 1. POST /api/weight — Log or Update Weight Entry
// ═══════════════════════════════════════════════════════════════════════
exports.addWeightLog = async (req, res) => {
  try {
    const { userId = 'default_user', weight, unit = 'kg', targetWeight = 70, notes = '' } = req.body;

    if (!weight) {
      return res.status(400).json({
        success: false,
        message: 'Weight value is required.',
      });
    }

    const newLog = await WeightLog.create({
      userId,
      weight: Number(weight),
      unit,
      targetWeight: Number(targetWeight),
      notes,
      recordedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Weight log saved successfully!',
      data: newLog,
    });
  } catch (error) {
    console.error('Error adding weight log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save weight log',
      error: error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// 2. GET /api/weight/history — Get Weight History & Progress %
// ═══════════════════════════════════════════════════════════════════════
exports.getWeightHistory = async (req, res) => {
  try {
    const userId = req.query.userId || 'default_user';

    const logs = await WeightLog.find({ userId }).sort({ recordedAt: -1 });

    const currentWeight = logs.length > 0 ? logs[0].weight : 75;
    const initialWeight = logs.length > 0 ? logs[logs.length - 1].weight : currentWeight;
    const targetWeight = logs.length > 0 ? logs[0].targetWeight : 70;
    const unit = logs.length > 0 ? logs[0].unit : 'kg';

    // Weight difference and progress percentage calculation
    const weightLost = Number((initialWeight - currentWeight).toFixed(1));
    const totalToLose = initialWeight - targetWeight;
    let progressPercent = 0;

    if (totalToLose !== 0) {
      progressPercent = Math.min(100, Math.max(0, Math.round(((initialWeight - currentWeight) / totalToLose) * 100)));
    } else {
      progressPercent = 100;
    }

    res.json({
      success: true,
      data: {
        currentWeight,
        initialWeight,
        targetWeight,
        weightLost,
        progressPercent,
        unit,
        history: logs,
      },
    });
  } catch (error) {
    console.error('Error fetching weight history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weight history',
      error: error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// 3. GET /api/calories/daily — Get Daily Calories Burned
// ═══════════════════════════════════════════════════════════════════════
exports.getDailyCalories = async (req, res) => {
  try {
    const userId = req.query.userId || 'default_user';

    // Calculate start of today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayLogs = await WorkoutLog.find({
      userId,
      recordedAt: { $gte: startOfToday },
    });

    const todayCaloriesBurned = todayLogs.reduce((sum, item) => sum + (item.caloriesBurned || 0), 0);

    // Get past 7 days breakdown for bar chart
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const weekLogs = await WorkoutLog.find({
      userId,
      recordedAt: { $gte: sevenDaysAgo },
    });

    const dailyBreakdown = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });

      const dayLogs = weekLogs.filter((log) => {
        const logDate = new Date(log.recordedAt);
        return logDate.toDateString() === d.toDateString();
      });

      const calories = dayLogs.reduce((sum, item) => sum + (item.caloriesBurned || 0), 0);

      return {
        day: dayStr,
        date: d.toISOString().split('T')[0],
        calories,
      };
    });

    res.json({
      success: true,
      data: {
        todayCaloriesBurned,
        dailyBreakdown,
        disclaimer: CALORIE_DISCLAIMER,
      },
    });
  } catch (error) {
    console.error('Error fetching daily calories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch daily calories',
      error: error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// 4. GET /api/calories/weekly — Get Weekly Calories Total & Breakdown
// ═══════════════════════════════════════════════════════════════════════
exports.getWeeklyCalories = async (req, res) => {
  try {
    const userId = req.query.userId || 'default_user';

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const logs = await WorkoutLog.find({
      userId,
      recordedAt: { $gte: sevenDaysAgo },
    });

    const weeklyCaloriesTotal = logs.reduce((sum, item) => sum + (item.caloriesBurned || 0), 0);
    const weeklyDurationMinutes = logs.reduce((sum, item) => sum + (item.durationMinutes || 0), 0);

    res.json({
      success: true,
      data: {
        weeklyCaloriesTotal,
        weeklyDurationMinutes,
        totalWorkouts: logs.length,
        disclaimer: CALORIE_DISCLAIMER,
      },
    });
  } catch (error) {
    console.error('Error fetching weekly calories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weekly calories',
      error: error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// 5. GET /api/calories/monthly — Get Monthly Calories Total & Breakdown
// ═══════════════════════════════════════════════════════════════════════
exports.getMonthlyCalories = async (req, res) => {
  try {
    const userId = req.query.userId || 'default_user';

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const logs = await WorkoutLog.find({
      userId,
      recordedAt: { $gte: thirtyDaysAgo },
    });

    const monthlyCaloriesTotal = logs.reduce((sum, item) => sum + (item.caloriesBurned || 0), 0);
    const monthlyDurationMinutes = logs.reduce((sum, item) => sum + (item.durationMinutes || 0), 0);

    res.json({
      success: true,
      data: {
        monthlyCaloriesTotal,
        monthlyDurationMinutes,
        totalWorkouts: logs.length,
        disclaimer: CALORIE_DISCLAIMER,
      },
    });
  } catch (error) {
    console.error('Error fetching monthly calories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch monthly calories',
      error: error.message,
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════
// 6. GET /api/analytics — Complete Progress & Analytics Dashboard Data
// ═══════════════════════════════════════════════════════════════════════
exports.getAnalytics = async (req, res) => {
  try {
    const userId = req.query.userId || 'default_user';
    const range = req.query.range || '7days'; // '7days' | '30days' | '90days' | '1year'

    // Determine filter start date
    const now = new Date();
    let startDate = new Date();

    if (range === '30days') startDate.setDate(now.getDate() - 30);
    else if (range === '90days') startDate.setDate(now.getDate() - 90);
    else if (range === '1year') startDate.setFullYear(now.getFullYear() - 1);
    else startDate.setDate(now.getDate() - 7); // Default 7 days

    // Fetch workout logs & weight logs within date range
    const workoutLogs = await WorkoutLog.find({
      userId,
      recordedAt: { $gte: startDate },
    }).sort({ recordedAt: 1 });

    const weightLogs = await WeightLog.find({
      userId,
      recordedAt: { $gte: startDate },
    }).sort({ recordedAt: 1 });

    const latestWeightLog = await WeightLog.findOne({ userId }).sort({ recordedAt: -1 });

    // ─── 1. Calculate Summary Cards ─────────────────────────────────────
    const totalWorkouts = workoutLogs.length;
    const totalWorkoutTime = workoutLogs.reduce((sum, item) => sum + (item.durationMinutes || 0), 0);
    const estimatedCalories = workoutLogs.reduce((sum, item) => sum + (item.caloriesBurned || 0), 0);
    const currentWeight = latestWeightLog ? latestWeightLog.weight : 75.0;

    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Build day map for streak & charts
    const numDays = range === '30days' ? 30 : range === '90days' ? 90 : range === '1year' ? 12 : 7;

    for (let i = numDays - 1; i >= 0; i--) {
      const checkDate = new Date();
      if (range === '1year') {
        checkDate.setMonth(now.getMonth() - i);
      } else {
        checkDate.setDate(now.getDate() - i);
      }

      const hasWorkout = workoutLogs.some((l) => {
        const d = new Date(l.recordedAt);
        return range === '1year'
          ? d.getMonth() === checkDate.getMonth() && d.getFullYear() === checkDate.getFullYear()
          : d.toDateString() === checkDate.toDateString();
      });

      if (hasWorkout) {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }
    currentStreak = tempStreak;

    // ─── 2. Build 8 Chart Datasets ──────────────────────────────────────
    const chartLabels = [];
    const weightProgress = [];
    const weeklyWorkoutDuration = [];
    const caloriesBurned = [];
    const workoutFrequency = [];
    const exerciseVolume = [];
    const setsCompleted = [];
    const repsCompleted = [];
    const workoutStreakData = [];

    const numPoints = range === '1year' ? 12 : range === '90days' ? 6 : range === '30days' ? 10 : 7;

    for (let i = 0; i < numPoints; i++) {
      const pointDate = new Date();
      if (range === '1year') {
        pointDate.setMonth(now.getMonth() - (numPoints - 1 - i));
        chartLabels.push(pointDate.toLocaleDateString('en-US', { month: 'short' }));
      } else if (range === '90days') {
        pointDate.setDate(now.getDate() - (numPoints - 1 - i) * 15);
        chartLabels.push(pointDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      } else if (range === '30days') {
        pointDate.setDate(now.getDate() - (numPoints - 1 - i) * 3);
        chartLabels.push(pointDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      } else {
        pointDate.setDate(now.getDate() - (numPoints - 1 - i));
        chartLabels.push(pointDate.toLocaleDateString('en-US', { weekday: 'short' }));
      }

      // Filter logs matching point
      const matchingLogs = workoutLogs.filter((l) => {
        const d = new Date(l.recordedAt);
        return range === '1year'
          ? d.getMonth() === pointDate.getMonth() && d.getFullYear() === pointDate.getFullYear()
          : d.toDateString() === pointDate.toDateString();
      });

      const matchingWeight = weightLogs.find((w) => new Date(w.recordedAt).toDateString() === pointDate.toDateString());

      const cal = matchingLogs.reduce((sum, item) => sum + (item.caloriesBurned || 0), 0);
      const dur = matchingLogs.reduce((sum, item) => sum + (item.durationMinutes || 0), 0);
      const exCount = matchingLogs.reduce((sum, item) => sum + (item.exercisesCompletedCount || 0), 0);

      weightProgress.push(matchingWeight ? matchingWeight.weight : currentWeight);
      weeklyWorkoutDuration.push(dur);
      caloriesBurned.push(cal);
      workoutFrequency.push(matchingLogs.length);
      exerciseVolume.push(exCount * 45); // Estimated volume (kg)
      setsCompleted.push(exCount * 3);
      repsCompleted.push(exCount * 3 * 12);
      workoutStreakData.push(matchingLogs.length > 0 ? 1 : 0);
    }

    res.json({
      success: true,
      data: {
        range,
        summary: {
          totalWorkouts,
          totalWorkoutTime,
          estimatedCalories,
          currentStreak,
          longestStreak,
          currentWeight,
        },
        charts: {
          labels: chartLabels,
          weightProgress,
          weeklyWorkoutDuration,
          caloriesBurned,
          workoutFrequency,
          exerciseVolume,
          setsCompleted,
          repsCompleted,
          workoutStreak: workoutStreakData,
        },
        disclaimer: CALORIE_DISCLAIMER,
      },
    });
  } catch (error) {
    console.error('Error generating analytics dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate analytics dashboard data',
      error: error.message,
    });
  }
};

