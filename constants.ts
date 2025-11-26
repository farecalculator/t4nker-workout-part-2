import { WorkoutDay, Principle, Exercise } from './types';

export const WORKOUT_PLAN: WorkoutDay[] = [
  {
    id: 'mon',
    day: 'Monday',
    title: 'PUSH 1',
    focus: 'Chest + Shoulders + Triceps',
    color: 'red',
    exercises: [
      { id: 'm1', name: 'Flat Bench Press (Barbell or Smith)', sets: 4, reps: '6–10', category: 'push' },
      { id: 'm2', name: 'Incline Dumbbell Press', sets: 3, reps: '8–12', category: 'push' },
      { id: 'm3', name: 'Cable Chest Fly', sets: 3, reps: '12–15', category: 'push' },
      { id: 'm4', name: 'Seated Dumbbell Shoulder Press', sets: 3, reps: '8–12', category: 'push' },
      { id: 'm5', name: 'Dumbbell Lateral Raise', sets: 3, reps: '12–15', category: 'push' },
      { id: 'm6', name: 'Cable Triceps Pushdown', sets: 3, reps: '10–15', category: 'push' },
    ]
  },
  {
    id: 'tue',
    day: 'Tuesday',
    title: 'PULL 1',
    focus: 'Back + Biceps',
    color: 'blue',
    exercises: [
      { id: 'tu1', name: 'Lat Pulldown or Assisted Pull-up', sets: 4, reps: '8–12', category: 'pull' },
      { id: 'tu2', name: 'Seated Cable Row or Machine Row', sets: 3, reps: '8–12', category: 'pull' },
      { id: 'tu3', name: 'Single-arm Dumbbell Row (Bench Supported)', sets: 3, reps: '10–12 each', category: 'pull' },
      { id: 'tu4', name: 'Face Pulls (Rear Delts)', sets: 3, reps: '12–15', category: 'pull' },
      { id: 'tu5', name: 'Standing Dumbbell Biceps Curl', sets: 3, reps: '10–15', category: 'pull' },
      { id: 'tu6', name: 'Hammer Curl', sets: 2, reps: '10–12', category: 'pull', notes: '2-3 sets' },
    ]
  },
  {
    id: 'wed',
    day: 'Wednesday',
    title: 'LEGS 1 (Heavy)',
    focus: 'Quads + Hamstrings + Calves',
    color: 'green',
    exercises: [
      { id: 'w1', name: 'Squat (Smith, Barbell, or Goblet)', sets: 4, reps: '6–10', category: 'legs' },
      { id: 'w2', name: 'Leg Press', sets: 3, reps: '8–12', category: 'legs' },
      { id: 'w3', name: 'Romanian Deadlift (Barbell or DB)', sets: 3, reps: '8–12', category: 'legs' },
      { id: 'w4', name: 'Leg Curl (Lying or Seated)', sets: 3, reps: '10–15', category: 'legs' },
      { id: 'w5', name: 'Standing or Seated Calf Raise', sets: 4, reps: '12–20', category: 'legs' },
    ]
  },
  {
    id: 'thu',
    day: 'Thursday',
    title: 'PUSH 2 (Upper Focus)',
    focus: 'Chest + Shoulders + Triceps (Angles)',
    color: 'purple',
    exercises: [
      { id: 'th1', name: 'Incline Bench (Barbell or Smith)', sets: 3, reps: '6–10', category: 'push', notes: '3-4 sets' },
      { id: 'th2', name: 'Flat Dumbbell Press or Machine Chest Press', sets: 3, reps: '8–12', category: 'push' },
      { id: 'th3', name: 'Cable Fly (High-to-Low or Low-to-High)', sets: 3, reps: '12–15', category: 'push' },
      { id: 'th4', name: 'Dumbbell Shoulder Press OR Arnold Press', sets: 3, reps: '8–12', category: 'push' },
      { id: 'th5', name: 'Dumbbell Lateral Raise', sets: 3, reps: '12–15', category: 'push' },
      { id: 'th6', name: 'Overhead Triceps Extension (DB or Cable)', sets: 3, reps: '10–15', category: 'push' },
    ]
  },
  {
    id: 'fri',
    day: 'Friday',
    title: 'LEGS 2 + CORE',
    focus: 'Glutes, Hamstrings, Quads, Abs',
    color: 'yellow',
    exercises: [
      { id: 'f1', name: 'Walking Lunges (DB or Bodyweight)', sets: 3, reps: '10–12 steps/leg', category: 'legs' },
      { id: 'f2', name: 'Bulgarian Split Squats', sets: 3, reps: '8–12 each', category: 'legs' },
      { id: 'f3', name: 'Hip Thrust or Glute Bridge', sets: 3, reps: '10–15', category: 'legs' },
      { id: 'f4', name: 'Leg Curl (Hamstring Focus)', sets: 3, reps: '10–15', category: 'legs' },
      { id: 'f5', name: 'Calf Raises (Any Machine)', sets: 3, reps: '15–20', category: 'legs' },
      { id: 'f6', name: 'Core: Plank, Leg Raise, or Cable Crunch', sets: 3, reps: 'Varied', category: 'core', notes: 'Choose 2 exercises' },
    ]
  }
];

export const ALTERNATIVE_EXERCISES: Record<string, Partial<Exercise>[]> = {
  push: [
    { name: 'Push-Ups (Weighted or Bodyweight)', sets: 3, reps: 'Failure' },
    { name: 'Machine Chest Press', sets: 3, reps: '8-12' },
    { name: 'Pec Deck Machine', sets: 3, reps: '12-15' },
    { name: 'Dips (Chest Focus)', sets: 3, reps: '8-12' },
    { name: 'Landmine Press', sets: 3, reps: '8-12' },
    { name: 'Front Plate Raise', sets: 3, reps: '12-15' },
    { name: 'Skullcrushers (EZ Bar)', sets: 3, reps: '10-12' },
    { name: 'Rope Triceps Extension', sets: 3, reps: '12-15' }
  ],
  pull: [
    { name: 'Pull-Ups (Weighted)', sets: 3, reps: '6-10' },
    { name: 'T-Bar Row', sets: 3, reps: '8-12' },
    { name: 'Meadows Row', sets: 3, reps: '10-12' },
    { name: 'Straight Arm Pulldown', sets: 3, reps: '12-15' },
    { name: 'Chest Supported Machine Row', sets: 3, reps: '10-12' },
    { name: 'Preacher Curl (Machine or Bar)', sets: 3, reps: '10-12' },
    { name: 'Concentration Curl', sets: 3, reps: '12-15' },
    { name: 'Reverse Fly (Machine)', sets: 3, reps: '15-20' }
  ],
  legs: [
    { name: 'Hack Squat', sets: 3, reps: '8-12' },
    { name: 'Front Squat', sets: 3, reps: '6-10' },
    { name: 'Sumo Deadlift', sets: 3, reps: '5-8' },
    { name: 'Glute Kickback Machine', sets: 3, reps: '12-15' },
    { name: 'Sissy Squat', sets: 3, reps: 'Failure' },
    { name: 'Seated Calf Raise', sets: 4, reps: '15-20' },
    { name: 'Adductor/Abductor Machine', sets: 3, reps: '15-20' }
  ],
  core: [
    { name: 'Hanging Leg Raise', sets: 3, reps: '10-15' },
    { name: 'Cable Woodchoppers', sets: 3, reps: '12-15' },
    { name: 'Ab Wheel Rollout', sets: 3, reps: '10-12' },
    { name: 'Russian Twists', sets: 3, reps: '20' }
  ]
};

export const GENERAL_RULES = [
  "Consistency is key: Stick to the schedule as much as possible.",
  "Listen to your body: Drop the weight if you feel sharp pain.",
  "Hydration: Drink plenty of water throughout the workout.",
  "Form over Weight: Always prioritize proper technique."
];

export const PRINCIPLES: Principle[] = [
  {
    id: 'warmup',
    title: 'Warm-up properly',
    description: 'Spend 5–10 minutes walking or biking to raise your body temperature. Follow this with 1–2 light sets of the specific exercise before your working sets. This primes your joints and nervous system, reducing injury risk.',
    iconName: 'Flame',
    color: 'orange'
  },
  {
    id: 'progressive',
    title: 'Progressive Overload',
    description: 'When a weight feels easy for all prescribed sets, increase it slightly the next week. This forces your muscles to adapt and grow. Do not increase weight if your form breaks down.',
    iconName: 'TrendingUp',
    color: 'blue'
  },
  {
    id: 'rir',
    title: 'Reps in Reserve (RIR)',
    description: 'Aim to finish your sets with 1–2 reps left "in the tank." You should feel like you could do maybe one more rep with good form, but not two. You do not need to hit absolute failure every single time to grow.',
    iconName: 'Battery',
    color: 'green'
  },
  {
    id: 'recovery',
    title: 'Sleep & Nutrition',
    description: 'Muscles grow while you rest, not while you train. Prioritize 7-9 hours of sleep. Eat enough protein (building blocks) and calories (energy) to recover. If you are under-recovering, you will not see results.',
    iconName: 'Moon',
    color: 'indigo'
  }
];