import type { TrainingGoal, TrainingPlan } from "@/src/lib/training-plans/types";

export const trainingGoals: TrainingGoal[] = [
  "Lose weight",
  "Gain muscle",
  "Get fit",
  "Build strength",
  "Improve cardio",
  "General health",
];

export const defaultTrainingGoal: TrainingGoal = "Get fit";

export const trainingPlans: TrainingPlan[] = [
  {
    slug: "fat-loss-foundation",
    goal: "Lose weight",
    title: "Fat Loss Foundation",
    description:
      "Balanced strength, cardio, and mobility to support steady fat loss.",
    recommendedFor:
      "Beginner to intermediate users who want sustainable movement, not crash training.",
    weeklyFocus:
      "Full-body strength twice, moderate aerobic work, core, mobility, and recovery walks.",
    days: [
      {
        dayLabel: "Day 1",
        sessionType: "Strength",
        title: "Full-body strength",
        durationMinutes: 50,
        intensity: "Moderate",
        exercises: [
          { name: "Leg press or goblet squat", sets: 3, reps: "8-10", rest: "90 sec" },
          { name: "Chest press or push-up", sets: 3, reps: "8-12", rest: "75 sec" },
          { name: "Seated row", sets: 3, reps: "10-12", rest: "75 sec" },
          { name: "Romanian deadlift", sets: 2, reps: "10", rest: "90 sec" },
          { name: "Plank", sets: 3, duration: "30-45 sec", rest: "45 sec" },
        ],
        notes:
          "Start light and leave a couple of reps in reserve. Manual logging keeps this version simple.",
      },
      {
        dayLabel: "Day 2",
        sessionType: "Hybrid",
        title: "Zone 2 cardio + core",
        durationMinutes: 45,
        intensity: "Moderate",
        exercises: [
          { name: "Incline treadmill walk or bike", duration: "30 min", notes: "Comfortably hard pace" },
          { name: "Dead bug", sets: 3, reps: "8 per side", rest: "30 sec" },
          { name: "Side plank", sets: 2, duration: "25 sec per side", rest: "30 sec" },
          { name: "Easy stretching", duration: "5 min" },
        ],
        notes:
          "Keep breathing controlled. You should be able to speak in short sentences.",
      },
      {
        dayLabel: "Day 3",
        sessionType: "Hybrid",
        title: "Lower-body strength + incline walk",
        durationMinutes: 55,
        intensity: "Moderate",
        exercises: [
          { name: "Goblet squat", sets: 3, reps: "10", rest: "90 sec" },
          { name: "Lunges", sets: 2, reps: "8 per side", rest: "75 sec" },
          { name: "Hamstring curl or hip hinge", sets: 3, reps: "10-12", rest: "75 sec" },
          { name: "Farmer carry", sets: 3, duration: "30 sec", rest: "60 sec" },
          { name: "Incline walk", duration: "12-15 min", notes: "Easy finish" },
        ],
        notes:
          "Use smooth reps and stop before form breaks. Manual logging keeps this version simple.",
      },
      {
        dayLabel: "Day 4",
        sessionType: "Yoga",
        title: "Yoga/mobility + long walk",
        durationMinutes: 60,
        intensity: "Light",
        exercises: [
          { name: "Easy walk", duration: "35-45 min" },
          { name: "Cat-cow", duration: "2 min" },
          { name: "Hip flexor stretch", duration: "2 min per side" },
          { name: "Hamstring stretch", duration: "2 min per side" },
          { name: "Deep breathing", duration: "3 min" },
        ],
        notes: "Recovery supports consistency. Keep this easy and restorative.",
      },
    ],
  },
  {
    slug: "muscle-builder",
    goal: "Gain muscle",
    title: "Muscle Builder",
    description: "Strength-focused routine with enough recovery to build muscle.",
    recommendedFor:
      "Beginner to intermediate lifters who want more muscle with controlled volume.",
    weeklyFocus:
      "Upper/lower strength, hypertrophy accessories, legs, core, and recovery between sessions.",
    days: [
      {
        dayLabel: "Day 1",
        sessionType: "Strength",
        title: "Upper-body strength",
        durationMinutes: 60,
        intensity: "Moderate",
        exercises: [
          { name: "Chest press or bench press", sets: 4, reps: "6-8", rest: "2 min" },
          { name: "Seated row", sets: 4, reps: "8-10", rest: "90 sec" },
          { name: "Shoulder press", sets: 3, reps: "8-10", rest: "90 sec" },
          { name: "Lat pulldown", sets: 3, reps: "10-12", rest: "75 sec" },
          { name: "Farmer carry", sets: 3, duration: "30 sec", rest: "60 sec" },
        ],
        notes:
          "Add weight gradually when reps feel strong. Manual logging keeps this version simple.",
      },
      {
        dayLabel: "Day 2",
        sessionType: "Strength",
        title: "Lower-body strength",
        durationMinutes: 60,
        intensity: "Moderate",
        exercises: [
          { name: "Leg press or squat", sets: 4, reps: "6-8", rest: "2 min" },
          { name: "Romanian deadlift", sets: 3, reps: "8-10", rest: "2 min" },
          { name: "Lunges", sets: 3, reps: "8 per side", rest: "90 sec" },
          { name: "Calf raise", sets: 3, reps: "12-15", rest: "60 sec" },
          { name: "Plank", sets: 3, duration: "45 sec", rest: "45 sec" },
        ],
        notes:
          "Prioritize range of motion and steady tempo. Manual logging keeps this version simple.",
      },
      {
        dayLabel: "Day 3",
        sessionType: "Strength",
        title: "Push/pull hypertrophy",
        durationMinutes: 55,
        intensity: "Moderate",
        exercises: [
          { name: "Incline press or push-up", sets: 3, reps: "10-12", rest: "75 sec" },
          { name: "Cable row or dumbbell row", sets: 3, reps: "10-12", rest: "75 sec" },
          { name: "Lateral raise", sets: 3, reps: "12-15", rest: "45 sec" },
          { name: "Lat pulldown", sets: 3, reps: "10-12", rest: "75 sec" },
          { name: "Easy bike", duration: "8-10 min", notes: "Cooldown" },
        ],
        notes:
          "Keep effort honest but avoid grinding. Manual logging keeps this version simple.",
      },
      {
        dayLabel: "Day 4",
        sessionType: "Strength",
        title: "Legs + core",
        durationMinutes: 55,
        intensity: "Moderate",
        exercises: [
          { name: "Goblet squat", sets: 3, reps: "10-12", rest: "90 sec" },
          { name: "Hip thrust or glute bridge", sets: 3, reps: "10-12", rest: "90 sec" },
          { name: "Hamstring curl", sets: 3, reps: "10-12", rest: "75 sec" },
          { name: "Dead bug", sets: 3, reps: "8 per side", rest: "30 sec" },
          { name: "Child's pose", duration: "2 min" },
        ],
        notes:
          "Finish feeling trained, not destroyed. Manual logging keeps this version simple.",
      },
    ],
  },
  {
    slug: "balanced-fitness-week",
    goal: "Get fit",
    title: "Balanced Fitness Week",
    description:
      "A balanced routine for general fitness, conditioning, and consistency.",
    recommendedFor:
      "Anyone building a reliable routine across strength, cardio, and mobility.",
    weeklyFocus:
      "Two strength-focused sessions, one interval day, and one mobility/yoga recovery day.",
    days: [
      {
        dayLabel: "Day 1",
        sessionType: "Strength",
        title: "Full-body strength",
        durationMinutes: 50,
        intensity: "Moderate",
        exercises: [
          { name: "Goblet squat", sets: 3, reps: "8-10", rest: "90 sec" },
          { name: "Push-up or chest press", sets: 3, reps: "8-12", rest: "75 sec" },
          { name: "Seated row", sets: 3, reps: "10-12", rest: "75 sec" },
          { name: "Shoulder press", sets: 2, reps: "10", rest: "75 sec" },
          { name: "Plank", sets: 3, duration: "30 sec", rest: "45 sec" },
        ],
        notes:
          "A practical all-around session. Manual logging keeps this version simple.",
      },
      {
        dayLabel: "Day 2",
        sessionType: "Cardio",
        title: "Cardio intervals",
        durationMinutes: 35,
        intensity: "Hard",
        exercises: [
          { name: "Warm-up walk or bike", duration: "8 min" },
          { name: "Intervals", sets: 8, duration: "30 sec hard / 90 sec easy" },
          { name: "Easy cooldown", duration: "8 min" },
          { name: "Deep breathing", duration: "3 min" },
        ],
        notes: "Hard intervals should still feel controlled. Stop if form or breathing gets ragged.",
      },
      {
        dayLabel: "Day 3",
        sessionType: "Hybrid",
        title: "Upper/lower strength mix",
        durationMinutes: 50,
        intensity: "Moderate",
        exercises: [
          { name: "Leg press", sets: 3, reps: "10", rest: "90 sec" },
          { name: "Lat pulldown", sets: 3, reps: "10", rest: "75 sec" },
          { name: "Romanian deadlift", sets: 2, reps: "10", rest: "90 sec" },
          { name: "Chest press", sets: 3, reps: "10", rest: "75 sec" },
          { name: "Farmer carry", sets: 3, duration: "30 sec", rest: "60 sec" },
        ],
        notes:
          "Keep the pace steady without rushing. Manual logging keeps this version simple.",
      },
      {
        dayLabel: "Day 4",
        sessionType: "Yoga",
        title: "Mobility/yoga + easy walk",
        durationMinutes: 45,
        intensity: "Light",
        exercises: [
          { name: "Easy walk", duration: "20 min" },
          { name: "Cat-cow", duration: "2 min" },
          { name: "Downward dog", duration: "2 min" },
          { name: "Thoracic rotations", sets: 2, reps: "8 per side" },
          { name: "Child's pose", duration: "3 min" },
        ],
        notes: "Keep this light and use it to feel better for the next session.",
      },
    ],
  },
  {
    slug: "strength-base",
    goal: "Build strength",
    title: "Strength Base",
    description: "Lower-rep strength work with controlled accessory movements.",
    recommendedFor:
      "Beginner to intermediate lifters who want stronger movement patterns without extreme volume.",
    weeklyFocus:
      "Squat, push, pull, deadlift pattern work, core stability, and mobility.",
    days: [
      {
        dayLabel: "Day 1",
        sessionType: "Strength",
        title: "Squat-focused strength",
        durationMinutes: 60,
        intensity: "Hard",
        exercises: [
          { name: "Squat or leg press", sets: 4, reps: "4-6", rest: "2-3 min" },
          { name: "Romanian deadlift", sets: 3, reps: "6-8", rest: "2 min" },
          { name: "Lunges", sets: 2, reps: "8 per side", rest: "90 sec" },
          { name: "Plank", sets: 3, duration: "45 sec", rest: "45 sec" },
        ],
        notes:
          "Use a load you can control. Manual logging keeps this version simple.",
      },
      {
        dayLabel: "Day 2",
        sessionType: "Strength",
        title: "Bench/push strength",
        durationMinutes: 55,
        intensity: "Hard",
        exercises: [
          { name: "Bench press or chest press", sets: 4, reps: "4-6", rest: "2-3 min" },
          { name: "Shoulder press", sets: 3, reps: "6-8", rest: "2 min" },
          { name: "Push-up", sets: 2, reps: "Comfortable reps", rest: "90 sec" },
          { name: "Farmer carry", sets: 3, duration: "30 sec", rest: "60 sec" },
        ],
        notes:
          "Do not chase maxes. Smooth, repeatable reps win.",
      },
      {
        dayLabel: "Day 3",
        sessionType: "Strength",
        title: "Deadlift/pull strength",
        durationMinutes: 60,
        intensity: "Hard",
        exercises: [
          { name: "Deadlift variation", sets: 4, reps: "3-5", rest: "2-3 min" },
          { name: "Lat pulldown", sets: 3, reps: "6-8", rest: "90 sec" },
          { name: "Seated row", sets: 3, reps: "8", rest: "90 sec" },
          { name: "Dead bug", sets: 3, reps: "8 per side", rest: "30 sec" },
        ],
        notes:
          "Keep the spine neutral and stop sets before form changes. Manual logging keeps this version simple.",
      },
      {
        dayLabel: "Day 4",
        sessionType: "Mobility",
        title: "Mobility + core stability",
        durationMinutes: 40,
        intensity: "Light",
        exercises: [
          { name: "Brisk walk", duration: "15 min" },
          { name: "Hip flexor stretch", duration: "2 min per side" },
          { name: "Thoracic rotations", sets: 2, reps: "8 per side" },
          { name: "Side plank", sets: 2, duration: "30 sec per side" },
          { name: "Deep breathing", duration: "4 min" },
        ],
        notes: "Recovery and control help strength progress stick.",
      },
    ],
  },
  {
    slug: "cardio-engine",
    goal: "Improve cardio",
    title: "Cardio Engine",
    description:
      "Progressive cardio plan with one strength day to maintain muscle.",
    recommendedFor:
      "Users who want better endurance while keeping a small strength base.",
    weeklyFocus:
      "Zone 2 cardio, intervals, long easy cardio, mobility, and one full-body strength day.",
    days: [
      {
        dayLabel: "Day 1",
        sessionType: "Cardio",
        title: "Zone 2 cardio",
        durationMinutes: 45,
        intensity: "Moderate",
        exercises: [
          { name: "Bike, elliptical, or brisk walk", duration: "35-40 min" },
          { name: "Easy cooldown", duration: "5 min" },
          { name: "Hamstring stretch", duration: "2 min per side" },
        ],
        notes: "Stay at a pace you can maintain without gasping.",
      },
      {
        dayLabel: "Day 2",
        sessionType: "Strength",
        title: "Full-body strength",
        durationMinutes: 45,
        intensity: "Moderate",
        exercises: [
          { name: "Goblet squat", sets: 3, reps: "10", rest: "75 sec" },
          { name: "Push-up or chest press", sets: 3, reps: "8-10", rest: "75 sec" },
          { name: "Seated row", sets: 3, reps: "10", rest: "75 sec" },
          { name: "Romanian deadlift", sets: 2, reps: "10", rest: "90 sec" },
          { name: "Plank", sets: 2, duration: "40 sec", rest: "45 sec" },
        ],
        notes:
          "Lift to maintain muscle and joint resilience. Manual logging keeps this version simple.",
      },
      {
        dayLabel: "Day 3",
        sessionType: "Cardio",
        title: "Intervals",
        durationMinutes: 35,
        intensity: "Hard",
        exercises: [
          { name: "Warm-up", duration: "8 min" },
          { name: "Rowing machine or bike intervals", sets: 6, duration: "45 sec hard / 90 sec easy" },
          { name: "Cooldown", duration: "8 min" },
        ],
        notes: "Hard does not mean reckless. Keep technique smooth.",
      },
      {
        dayLabel: "Day 4",
        sessionType: "Hybrid",
        title: "Long easy cardio + mobility",
        durationMinutes: 65,
        intensity: "Light",
        exercises: [
          { name: "Brisk walk, bike, or elliptical", duration: "45-55 min" },
          { name: "Cat-cow", duration: "2 min" },
          { name: "Child's pose", duration: "2 min" },
          { name: "Deep breathing", duration: "3 min" },
        ],
        notes: "This should feel refreshing, not punishing.",
      },
    ],
  },
  {
    slug: "healthy-routine",
    goal: "General health",
    title: "Healthy Routine",
    description:
      "Simple sustainable movement for health, energy, and consistency.",
    recommendedFor:
      "Users who want a low-pressure routine with strength, cardio, and recovery.",
    weeklyFocus:
      "Sustainable movement, basic strength, easy cardio, mobility, and optional walking.",
    days: [
      {
        dayLabel: "Day 1",
        sessionType: "Strength",
        title: "Full-body strength",
        durationMinutes: 40,
        intensity: "Moderate",
        exercises: [
          { name: "Goblet squat or leg press", sets: 2, reps: "10", rest: "75 sec" },
          { name: "Chest press or push-up", sets: 2, reps: "8-10", rest: "75 sec" },
          { name: "Seated row", sets: 2, reps: "10", rest: "75 sec" },
          { name: "Farmer carry", sets: 2, duration: "30 sec", rest: "60 sec" },
        ],
        notes:
          "Keep it simple and repeatable.",
      },
      {
        dayLabel: "Day 2",
        sessionType: "Mobility",
        title: "Brisk walk + mobility",
        durationMinutes: 40,
        intensity: "Light",
        exercises: [
          { name: "Brisk walk", duration: "25-30 min" },
          { name: "Hip flexor stretch", duration: "2 min per side" },
          { name: "Hamstring stretch", duration: "2 min per side" },
          { name: "Thoracic rotations", sets: 2, reps: "8 per side" },
        ],
        notes: "Move at a pace that leaves you feeling better afterward.",
      },
      {
        dayLabel: "Day 3",
        sessionType: "Hybrid",
        title: "Light cardio + core",
        durationMinutes: 35,
        intensity: "Light",
        exercises: [
          { name: "Bike, elliptical, or easy walk", duration: "20 min" },
          { name: "Dead bug", sets: 2, reps: "8 per side", rest: "30 sec" },
          { name: "Plank", sets: 2, duration: "30 sec", rest: "45 sec" },
          { name: "Deep breathing", duration: "3 min" },
        ],
        notes: "Light cardio still counts. Consistency is the play.",
      },
      {
        dayLabel: "Day 4",
        sessionType: "Yoga",
        title: "Yoga/stretching + optional walk",
        durationMinutes: 35,
        intensity: "Light",
        exercises: [
          { name: "Optional easy walk", duration: "10-20 min" },
          { name: "Cat-cow", duration: "2 min" },
          { name: "Downward dog", duration: "2 min" },
          { name: "Child's pose", duration: "3 min" },
          { name: "Deep breathing", duration: "4 min" },
        ],
        notes: "This is a recovery day. Keep it relaxed.",
      },
    ],
  },
];

export function getAllTrainingPlans() {
  return trainingPlans;
}

export function getTrainingPlanByGoal(goal: TrainingGoal) {
  return (
    trainingPlans.find((plan) => plan.goal === goal) ??
    trainingPlans.find((plan) => plan.goal === defaultTrainingGoal) ??
    trainingPlans[0]
  );
}
