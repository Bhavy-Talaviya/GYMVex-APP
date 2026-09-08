// ═══════════════════════════════════════════════════════════════════════
// planSeedData.js — Pre-configured Workout Plans Seed Data (6 Workout + 1 Rest Day)
// ═══════════════════════════════════════════════════════════════════════
// Contains comprehensive 7-day weekly schedules (Day 1 to Day 7) with 6 active
// workout days and exactly 1 rest day (Sunday).
// ═══════════════════════════════════════════════════════════════════════

const planSeedData = [
  {
    _id: 'plan_weight_loss_beginner',
    name: 'Beginner Fat Burner & Sculpt',
    description: 'A 4-week high-energy fat burning routine designed for beginners. Combines cardio, bodyweight sculpts, and core activation across 6 workout days and 1 rest day.',
    goal: 'Weight Loss',
    difficulty: 'Beginner',
    durationWeeks: 4,
    daysPerWeek: 6,
    estimatedCalories: 350,
    badge: 'Popular Fat Burner',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
    restDays: ['Sunday'],
    exercises: [
      {
        dayNumber: 1,
        dayName: 'Day 1 — Full Body Fat Loss Circuit',
        isRestDay: false,
        exercises: [
          { exerciseName: 'Jumping Jacks', category: 'Cardio', sets: 3, reps: 30, durationSeconds: 45, restSeconds: 30, image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800' },
          { exerciseName: 'Bodyweight Squats', category: 'Legs', sets: 3, reps: 15, durationSeconds: 0, restSeconds: 45, image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800' },
          { exerciseName: 'Push-Ups (Incline or Knees)', category: 'Chest', sets: 3, reps: 10, durationSeconds: 0, restSeconds: 45, image: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=800' },
          { exerciseName: 'Mountain Climbers', category: 'Core', sets: 3, reps: 20, durationSeconds: 30, restSeconds: 30, image: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?q=80&w=800' },
          { exerciseName: 'Plank Hold', category: 'Core', sets: 3, reps: 1, durationSeconds: 30, restSeconds: 45, image: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?q=80&w=800' },
        ],
      },
      {
        dayNumber: 2,
        dayName: 'Day 2 — Low Impact Cardio & Core',
        isRestDay: false,
        exercises: [
          { exerciseName: 'High Knees', category: 'Cardio', sets: 3, reps: 30, durationSeconds: 30, restSeconds: 30, image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800' },
          { exerciseName: 'Forward Lunges', category: 'Legs', sets: 3, reps: 12, durationSeconds: 0, restSeconds: 45, image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800' },
          { exerciseName: 'Bicycle Crunches', category: 'Core', sets: 3, reps: 20, durationSeconds: 0, restSeconds: 30, image: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?q=80&w=800' },
          { exerciseName: 'Glute Bridges', category: 'Glutes', sets: 3, reps: 15, durationSeconds: 0, restSeconds: 45, image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800' },
        ],
      },
      {
        dayNumber: 3,
        dayName: 'Day 3 — Total Body Fat Loss Burnout',
        isRestDay: false,
        exercises: [
          { exerciseName: 'Jumping Jacks', category: 'Cardio', sets: 3, reps: 30, durationSeconds: 45, restSeconds: 30, image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800' },
          { exerciseName: 'Bodyweight Squats', category: 'Legs', sets: 3, reps: 15, durationSeconds: 0, restSeconds: 45, image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800' },
          { exerciseName: 'Plank Hold', category: 'Core', sets: 3, reps: 1, durationSeconds: 45, restSeconds: 30, image: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?q=80&w=800' },
        ],
      },
      {
        dayNumber: 4,
        dayName: 'Day 4 — Lower Body Sculpt & Sweat',
        isRestDay: false,
        exercises: [
          { exerciseName: 'Sumo Squats', category: 'Legs', sets: 3, reps: 15, durationSeconds: 0, restSeconds: 45, image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800' },
          { exerciseName: 'Calf Raises', category: 'Legs', sets: 3, reps: 20, durationSeconds: 0, restSeconds: 30, image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800' },
          { exerciseName: 'Burpees (Modified)', category: 'Cardio', sets: 3, reps: 8, durationSeconds: 0, restSeconds: 60, image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800' },
        ],
      },
      {
        dayNumber: 5,
        dayName: 'Day 5 — Upper Body & Core Burn',
        isRestDay: false,
        exercises: [
          { exerciseName: 'Dumbbell Rows', category: 'Back', sets: 3, reps: 12, durationSeconds: 0, restSeconds: 45, image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=800' },
          { exerciseName: 'Shoulder Press', category: 'Shoulders', sets: 3, reps: 12, durationSeconds: 0, restSeconds: 45, image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800' },
          { exerciseName: 'Plank Shoulder Taps', category: 'Core', sets: 3, reps: 16, durationSeconds: 0, restSeconds: 30, image: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?q=80&w=800' },
        ],
      },
      {
        dayNumber: 6,
        dayName: 'Day 6 — Total Body HIIT Circuit',
        isRestDay: false,
        exercises: [
          { exerciseName: 'Jumping Jacks', category: 'Cardio', sets: 3, reps: 30, durationSeconds: 45, restSeconds: 30, image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800' },
          { exerciseName: 'High Knees', category: 'Cardio', sets: 3, reps: 30, durationSeconds: 30, restSeconds: 30, image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800' },
          { exerciseName: 'Mountain Climbers', category: 'Core', sets: 3, reps: 25, durationSeconds: 30, restSeconds: 30, image: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?q=80&w=800' },
        ],
      },
      {
        dayNumber: 7,
        dayName: 'Day 7 — Sunday Full Rest & Recharge',
        isRestDay: true,
        exercises: [],
      },
    ],
  },
  {
    _id: 'plan_muscle_gain_intermediate',
    name: 'Intermediate Muscle Hypertrophy',
    description: 'An intensive 8-week progressive overload plan designed to maximize muscle size, endurance, and power for intermediate lifters.',
    goal: 'Muscle Gain',
    difficulty: 'Intermediate',
    durationWeeks: 8,
    daysPerWeek: 6,
    estimatedCalories: 480,
    badge: 'Mass Builder',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop',
    restDays: ['Sunday'],
    exercises: [
      {
        dayNumber: 1,
        dayName: 'Day 1 — Upper Body Chest & Arms',
        isRestDay: false,
        exercises: [
          { exerciseName: 'Dumbbell Bench Press', category: 'Chest', sets: 3, reps: 10, durationSeconds: 0, restSeconds: 60, image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800' },
          { exerciseName: 'Incline Dumbbell Press', category: 'Chest', sets: 3, reps: 12, durationSeconds: 0, restSeconds: 60, image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800' },
          { exerciseName: 'Dumbbell Bicep Curls', category: 'Biceps', sets: 3, reps: 12, durationSeconds: 0, restSeconds: 45, image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800' },
          { exerciseName: 'Tricep Dips', category: 'Triceps', sets: 3, reps: 15, durationSeconds: 0, restSeconds: 45, image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800' },
        ],
      },
      {
        dayNumber: 2,
        dayName: 'Day 2 — Back & Core Thickness',
        isRestDay: false,
        exercises: [
          { exerciseName: 'Bent-Over Dumbbell Rows', category: 'Back', sets: 3, reps: 10, durationSeconds: 0, restSeconds: 60, image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=800' },
          { exerciseName: 'Lat Pulldowns', category: 'Back', sets: 3, reps: 12, durationSeconds: 0, restSeconds: 60, image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=800' },
          { exerciseName: 'Hanging Leg Raises', category: 'Core', sets: 3, reps: 15, durationSeconds: 0, restSeconds: 45, image: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?q=80&w=800' },
        ],
      },
      {
        dayNumber: 3,
        dayName: 'Day 3 — Mid-Week Chest & Core Push',
        isRestDay: false,
        exercises: [
          { exerciseName: 'Push-Ups', category: 'Chest', sets: 3, reps: 20, durationSeconds: 0, restSeconds: 45, image: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=800' },
          { exerciseName: 'Plank Hold', category: 'Core', sets: 3, reps: 1, durationSeconds: 60, restSeconds: 45, image: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?q=80&w=800' },
        ],
      },
      {
        dayNumber: 4,
        dayName: 'Day 4 — Leg Day Power',
        isRestDay: false,
        exercises: [
          { exerciseName: 'Barbell/Dumbbell Squats', category: 'Legs', sets: 3, reps: 8, durationSeconds: 0, restSeconds: 90, image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800' },
          { exerciseName: 'Romanian Deadlifts', category: 'Legs', sets: 3, reps: 10, durationSeconds: 0, restSeconds: 75, image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800' },
          { exerciseName: 'Walking Lunges', category: 'Legs', sets: 3, reps: 12, durationSeconds: 0, restSeconds: 60, image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800' },
        ],
      },
      {
        dayNumber: 5,
        dayName: 'Day 5 — Shoulders & Arms Hypertrophy',
        isRestDay: false,
        exercises: [
          { exerciseName: 'Lateral Raises', category: 'Shoulders', sets: 3, reps: 15, durationSeconds: 0, restSeconds: 45, image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800' },
          { exerciseName: 'Hammer Curls', category: 'Biceps', sets: 3, reps: 12, durationSeconds: 0, restSeconds: 45, image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800' },
          { exerciseName: 'Overhead Tricep Extension', category: 'Triceps', sets: 3, reps: 12, durationSeconds: 0, restSeconds: 45, image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800' },
        ],
      },
      {
        dayNumber: 6,
        dayName: 'Day 6 — Full Body Conditioning',
        isRestDay: false,
        exercises: [
          { exerciseName: 'Push-Ups', category: 'Chest', sets: 3, reps: 20, durationSeconds: 0, restSeconds: 45, image: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=800' },
          { exerciseName: 'Goblet Squats', category: 'Legs', sets: 3, reps: 15, durationSeconds: 0, restSeconds: 45, image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800' },
          { exerciseName: 'Plank Hold', category: 'Core', sets: 3, reps: 1, durationSeconds: 60, restSeconds: 45, image: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?q=80&w=800' },
        ],
      },
      {
        dayNumber: 7,
        dayName: 'Day 7 — Sunday Rest & Muscle Recovery',
        isRestDay: true,
        exercises: [],
      },
    ],
  },
  {
    _id: 'plan_strength_advanced',
    name: 'Advanced Heavy Power & Strength',
    description: 'A 6-week elite strength program prioritizing compound movements, heavy resistance, and max power output across 6 training sessions and 1 rest day.',
    goal: 'Strength',
    difficulty: 'Advanced',
    durationWeeks: 6,
    daysPerWeek: 6,
    estimatedCalories: 550,
    badge: 'Pro Athlete',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
    restDays: ['Sunday'],
    exercises: [
      {
        dayNumber: 1,
        dayName: 'Day 1 — Heavy Push & Bench Press',
        isRestDay: false,
        exercises: [
          { exerciseName: 'Barbell Bench Press', category: 'Chest', sets: 3, reps: 5, durationSeconds: 0, restSeconds: 120, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800' },
          { exerciseName: 'Overhead Shoulder Press', category: 'Shoulders', sets: 3, reps: 6, durationSeconds: 0, restSeconds: 90, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800' },
          { exerciseName: 'Weighted Dips', category: 'Triceps', sets: 3, reps: 8, durationSeconds: 0, restSeconds: 90, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800' },
        ],
      },
      {
        dayNumber: 2,
        dayName: 'Day 2 — Heavy Pull & Deadlift',
        isRestDay: false,
        exercises: [
          { exerciseName: 'Barbell Deadlift', category: 'Back', sets: 3, reps: 5, durationSeconds: 0, restSeconds: 150, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800' },
          { exerciseName: 'Weighted Pull-Ups', category: 'Back', sets: 3, reps: 6, durationSeconds: 0, restSeconds: 90, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800' },
          { exerciseName: 'Barbell Rows', category: 'Back', sets: 3, reps: 8, durationSeconds: 0, restSeconds: 90, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800' },
        ],
      },
      {
        dayNumber: 3,
        dayName: 'Day 3 — Heavy Core & Grip Power',
        isRestDay: false,
        exercises: [
          { exerciseName: 'Farmers Walk', category: 'Core', sets: 3, reps: 1, durationSeconds: 45, restSeconds: 60, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800' },
          { exerciseName: 'Plank Hold', category: 'Core', sets: 3, reps: 1, durationSeconds: 60, restSeconds: 60, image: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?q=80&w=800' },
        ],
      },
      {
        dayNumber: 4,
        dayName: 'Day 4 — Heavy Squat & Lower Power',
        isRestDay: false,
        exercises: [
          { exerciseName: 'Barbell Back Squats', category: 'Legs', sets: 3, reps: 5, durationSeconds: 0, restSeconds: 150, image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800' },
          { exerciseName: 'Leg Press Heavy', category: 'Legs', sets: 3, reps: 8, durationSeconds: 0, restSeconds: 90, image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800' },
        ],
      },
      {
        dayNumber: 5,
        dayName: 'Day 5 — Heavy Upper Accessory',
        isRestDay: false,
        exercises: [
          { exerciseName: 'Incline Bench Press', category: 'Chest', sets: 3, reps: 6, durationSeconds: 0, restSeconds: 90, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800' },
          { exerciseName: 'Close-Grip Bench Press', category: 'Triceps', sets: 3, reps: 8, durationSeconds: 0, restSeconds: 90, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800' },
        ],
      },
      {
        dayNumber: 6,
        dayName: 'Day 6 — Full Body Strength Finisher',
        isRestDay: false,
        exercises: [
          { exerciseName: 'Push-Ups', category: 'Chest', sets: 3, reps: 20, durationSeconds: 0, restSeconds: 45, image: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=800' },
          { exerciseName: 'Barbell Rows', category: 'Back', sets: 3, reps: 10, durationSeconds: 0, restSeconds: 60, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800' },
        ],
      },
      {
        dayNumber: 7,
        dayName: 'Day 7 — Sunday Rest & Recovery',
        isRestDay: true,
        exercises: [],
      },
    ],
  },
  {
    _id: 'plan_general_fitness_beginner',
    name: 'Daily Vitality & General Fitness',
    description: 'A well-rounded 4-week fitness routine to increase energy, tone muscles, improve stamina, and keep your body feeling strong with 6 active days and 1 rest day.',
    goal: 'General Fitness',
    difficulty: 'Beginner',
    durationWeeks: 4,
    daysPerWeek: 6,
    estimatedCalories: 300,
    badge: 'Everyday Fit',
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=800&auto=format&fit=crop',
    restDays: ['Sunday'],
    exercises: [
      {
        dayNumber: 1,
        dayName: 'Day 1 — Total Body Refresh',
        isRestDay: false,
        exercises: [
          { exerciseName: 'Bodyweight Squats', category: 'Legs', sets: 3, reps: 15, durationSeconds: 0, restSeconds: 45, image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=800' },
          { exerciseName: 'Wall Push-Ups', category: 'Chest', sets: 3, reps: 12, durationSeconds: 0, restSeconds: 45, image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=800' },
          { exerciseName: 'Plank Hold', category: 'Core', sets: 3, reps: 1, durationSeconds: 40, restSeconds: 45, image: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?q=80&w=800' },
        ],
      },
      {
        dayNumber: 2,
        dayName: 'Day 2 — Upper Body & Core Light',
        isRestDay: false,
        exercises: [
          { exerciseName: 'Dumbbell Rows', category: 'Back', sets: 3, reps: 12, durationSeconds: 0, restSeconds: 45, image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=800' },
          { exerciseName: 'Crunches', category: 'Core', sets: 3, reps: 15, durationSeconds: 0, restSeconds: 30, image: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?q=80&w=800' },
        ],
      },
      {
        dayNumber: 3,
        dayName: 'Day 3 — Mid-Week Cardio Refresh',
        isRestDay: false,
        exercises: [
          { exerciseName: 'Jumping Jacks', category: 'Cardio', sets: 3, reps: 30, durationSeconds: 45, restSeconds: 30, image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800' },
          { exerciseName: 'High Knees', category: 'Cardio', sets: 3, reps: 25, durationSeconds: 30, restSeconds: 30, image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800' },
        ],
      },
      {
        dayNumber: 4,
        dayName: 'Day 4 — Core & Endurance Boost',
        isRestDay: false,
        exercises: [
          { exerciseName: 'Jumping Jacks', category: 'Cardio', sets: 3, reps: 25, durationSeconds: 30, restSeconds: 30, image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800' },
          { exerciseName: 'Plank Hold', category: 'Core', sets: 3, reps: 1, durationSeconds: 45, restSeconds: 30, image: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?q=80&w=800' },
        ],
      },
      {
        dayNumber: 5,
        dayName: 'Day 5 — Lower Body Toning',
        isRestDay: false,
        exercises: [
          { exerciseName: 'Lunges', category: 'Legs', sets: 3, reps: 12, durationSeconds: 0, restSeconds: 45, image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800' },
          { exerciseName: 'Calf Raises', category: 'Legs', sets: 3, reps: 20, durationSeconds: 0, restSeconds: 30, image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800' },
        ],
      },
      {
        dayNumber: 6,
        dayName: 'Day 6 — Active Weekend Mobility',
        isRestDay: false,
        exercises: [
          { exerciseName: 'Bodyweight Squats', category: 'Legs', sets: 3, reps: 15, durationSeconds: 0, restSeconds: 45, image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=800' },
        ],
      },
      {
        dayNumber: 7,
        dayName: 'Day 7 — Sunday Rest & Relax',
        isRestDay: true,
        exercises: [],
      },
    ],
  },
  {
    _id: 'plan_flexibility_beginner',
    name: 'Full Body Mobility & Flexibility',
    description: 'Release tightness, restore muscle movement range, improve posture, and alleviate stiffness with targeted stretching across 6 active days and 1 rest day.',
    goal: 'Flexibility',
    difficulty: 'Beginner',
    durationWeeks: 4,
    daysPerWeek: 6,
    estimatedCalories: 180,
    badge: 'Stiffness Relief',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop',
    restDays: ['Sunday'],
    exercises: [
      {
        dayNumber: 1,
        dayName: 'Day 1 — Lower Body & Spine Mobility',
        isRestDay: false,
        exercises: [
          { exerciseName: 'Hamstring Stretch', category: 'Stretching', sets: 3, reps: 1, durationSeconds: 45, restSeconds: 15, image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800' },
          { exerciseName: 'Cobra Stretch', category: 'Stretching', sets: 3, reps: 1, durationSeconds: 30, restSeconds: 20, image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800' },
        ],
      },
      {
        dayNumber: 2,
        dayName: 'Day 2 — Upper Body & Chest Opener',
        isRestDay: false,
        exercises: [
          { exerciseName: 'Childs Pose', category: 'Stretching', sets: 3, reps: 1, durationSeconds: 60, restSeconds: 20, image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800' },
          { exerciseName: 'Cat-Cow Stretch', category: 'Stretching', sets: 3, reps: 10, durationSeconds: 0, restSeconds: 20, image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800' },
        ],
      },
      {
        dayNumber: 3,
        dayName: 'Day 3 — Mid-Week Shoulder & Neck Mobility',
        isRestDay: false,
        exercises: [
          { exerciseName: 'Cobra Stretch', category: 'Stretching', sets: 3, reps: 1, durationSeconds: 45, restSeconds: 20, image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800' },
        ],
      },
      {
        dayNumber: 4,
        dayName: 'Day 4 — Hip Flexor & Glute Release',
        isRestDay: false,
        exercises: [
          { exerciseName: 'Pigeon Pose Stretch', category: 'Stretching', sets: 3, reps: 1, durationSeconds: 45, restSeconds: 20, image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800' },
          { exerciseName: 'Butterfly Stretch', category: 'Stretching', sets: 3, reps: 1, durationSeconds: 45, restSeconds: 20, image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800' },
        ],
      },
      {
        dayNumber: 5,
        dayName: 'Day 5 — Full Body Deep Stretch Flow',
        isRestDay: false,
        exercises: [
          { exerciseName: 'Standing Forward Fold', category: 'Stretching', sets: 3, reps: 1, durationSeconds: 60, restSeconds: 20, image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800' },
        ],
      },
      {
        dayNumber: 6,
        dayName: 'Day 6 — Active Weekend Mobility',
        isRestDay: false,
        exercises: [
          { exerciseName: 'Hamstring Stretch', category: 'Stretching', sets: 3, reps: 1, durationSeconds: 45, restSeconds: 15, image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800' },
        ],
      },
      {
        dayNumber: 7,
        dayName: 'Day 7 — Sunday Rest & Relaxation',
        isRestDay: true,
        exercises: [],
      },
    ],
  },
  {
    _id: 'plan_yoga_intermediate',
    name: 'Mindful Vinyasa Yoga Flow',
    description: 'Harmonize body, breath, and focus with fluid yoga sequences that enhance balance, core stability, and inner calm across 6 yoga flows and 1 rest day.',
    goal: 'Yoga',
    difficulty: 'Intermediate',
    durationWeeks: 4,
    daysPerWeek: 6,
    estimatedCalories: 250,
    badge: 'Zen Flow',
    image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=800&auto=format&fit=crop',
    restDays: ['Sunday'],
    exercises: [
      {
        dayNumber: 1,
        dayName: 'Day 1 — Sun Salutation & Balance Flow',
        isRestDay: false,
        exercises: [
          { exerciseName: 'Downward-Facing Dog', category: 'Yoga', sets: 3, reps: 1, durationSeconds: 60, restSeconds: 20, image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=800' },
          { exerciseName: 'Warrior II Pose', category: 'Yoga', sets: 3, reps: 1, durationSeconds: 45, restSeconds: 20, image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=800' },
          { exerciseName: 'Tree Pose (Balance)', category: 'Yoga', sets: 3, reps: 1, durationSeconds: 45, restSeconds: 20, image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=800' },
        ],
      },
      {
        dayNumber: 2,
        dayName: 'Day 2 — Core Yoga & Power Poses',
        isRestDay: false,
        exercises: [
          { exerciseName: 'Plank Pose', category: 'Yoga', sets: 3, reps: 1, durationSeconds: 45, restSeconds: 20, image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=800' },
          { exerciseName: 'Cobra Pose', category: 'Yoga', sets: 3, reps: 1, durationSeconds: 30, restSeconds: 20, image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=800' },
        ],
      },
      {
        dayNumber: 3,
        dayName: 'Day 3 — Mid-Week Balance & Focus',
        isRestDay: false,
        exercises: [
          { exerciseName: 'Tree Pose (Balance)', category: 'Yoga', sets: 3, reps: 1, durationSeconds: 45, restSeconds: 20, image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=800' },
        ],
      },
      {
        dayNumber: 4,
        dayName: 'Day 4 — Flexibility & Hip Openers',
        isRestDay: false,
        exercises: [
          { exerciseName: 'Triangle Pose', category: 'Yoga', sets: 3, reps: 1, durationSeconds: 45, restSeconds: 20, image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=800' },
          { exerciseName: 'Bridge Pose', category: 'Yoga', sets: 3, reps: 1, durationSeconds: 40, restSeconds: 20, image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=800' },
        ],
      },
      {
        dayNumber: 5,
        dayName: 'Day 5 — Upper Body & Chest Openers',
        isRestDay: false,
        exercises: [
          { exerciseName: 'Warrior II Pose', category: 'Yoga', sets: 3, reps: 1, durationSeconds: 45, restSeconds: 20, image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=800' },
        ],
      },
      {
        dayNumber: 6,
        dayName: 'Day 6 — Full Body Zen Vinyasa',
        isRestDay: false,
        exercises: [
          { exerciseName: 'Childs Pose Rest', category: 'Yoga', sets: 3, reps: 1, durationSeconds: 60, restSeconds: 20, image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=800' },
        ],
      },
      {
        dayNumber: 7,
        dayName: 'Day 7 — Sunday Rest & Mindfulness',
        isRestDay: true,
        exercises: [],
      },
    ],
  },
];

module.exports = planSeedData;
