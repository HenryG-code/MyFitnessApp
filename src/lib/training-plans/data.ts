import {
  defaultTrainingGoal,
  defaultTrainingLevel,
  type TrainingGoal,
  type TrainingLevel,
  type TrainingPlan,
} from "@/src/lib/training-plans/types";

export const trainingPlans: TrainingPlan[] = [
  {
    slug: "fat-loss-foundation",
    goal: "Lose weight",
    level: "Beginner",
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
          "Start light and leave a couple of reps in reserve.",
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
          "Use smooth reps and stop before form breaks.",
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
    level: "Beginner",
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
          "Add weight gradually when reps feel strong.",
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
          "Prioritize range of motion and steady tempo.",
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
          "Keep effort honest but avoid grinding.",
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
          "Finish feeling trained, not destroyed.",
      },
    ],
  },
  {
    slug: "balanced-fitness-week",
    goal: "Get fit",
    level: "Beginner",
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
          "A practical all-around session.",
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
          "Keep the pace steady without rushing.",
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
    level: "Beginner",
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
          "Use a load you can control.",
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
          "Keep the spine neutral and stop sets before form changes.",
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
    level: "Beginner",
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
          "Lift to maintain muscle and joint resilience.",
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
    level: "Beginner",
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
  {
    slug: "fat-loss-momentum",
    goal: "Lose weight",
    level: "Intermediate",
    title: "Fat Loss Momentum",
    description:
      "A five-day strength and conditioning plan for building momentum while preserving muscle.",
    recommendedFor:
      "Intermediate trainees who recover well from five purposeful sessions each week.",
    weeklyFocus:
      "Three strength sessions, one interval session, and one longer aerobic session with recovery built around them.",
    days: [
      {
        dayLabel: "Day 1",
        sessionType: "Strength",
        title: "Full-body strength",
        durationMinutes: 60,
        intensity: "Moderate",
        exercises: [
          { name: "Back squat or leg press", sets: 4, reps: "6-8", rest: "2 min" },
          { name: "Dumbbell bench press", sets: 4, reps: "8-10", rest: "90 sec" },
          { name: "Lat pulldown", sets: 3, reps: "10-12", rest: "75 sec" },
          { name: "Romanian deadlift", sets: 3, reps: "8-10", rest: "90 sec" },
          { name: "Front plank", sets: 3, duration: "45 sec", rest: "45 sec" },
        ],
        notes: "Leave one or two quality reps in reserve on the main lifts.",
      },
      {
        dayLabel: "Day 2",
        sessionType: "Cardio",
        title: "Intervals + core",
        durationMinutes: 45,
        intensity: "Hard",
        exercises: [
          { name: "Easy warm-up", duration: "8 min" },
          { name: "Bike or rower intervals", sets: 8, duration: "45 sec hard / 75 sec easy" },
          { name: "Dead bug", sets: 3, reps: "10 per side", rest: "30 sec" },
          { name: "Easy cooldown", duration: "6 min" },
        ],
        notes: "Push the work intervals, but keep enough control to repeat every round well.",
      },
      {
        dayLabel: "Day 3",
        sessionType: "Strength",
        title: "Upper-body strength",
        durationMinutes: 55,
        intensity: "Moderate",
        exercises: [
          { name: "Incline dumbbell press", sets: 4, reps: "8-10", rest: "90 sec" },
          { name: "One-arm dumbbell row", sets: 4, reps: "8-10 per side", rest: "90 sec" },
          { name: "Seated shoulder press", sets: 3, reps: "10", rest: "75 sec" },
          { name: "Cable face pull", sets: 3, reps: "12-15", rest: "60 sec" },
          { name: "Farmer carry", sets: 3, duration: "40 sec", rest: "60 sec" },
        ],
        notes: "Use smooth reps and keep your shoulders controlled throughout.",
      },
      {
        dayLabel: "Day 4",
        sessionType: "Strength",
        title: "Lower-body strength",
        durationMinutes: 55,
        intensity: "Moderate",
        exercises: [
          { name: "Romanian deadlift", sets: 4, reps: "6-8", rest: "2 min" },
          { name: "Bulgarian split squat", sets: 3, reps: "8 per side", rest: "90 sec" },
          { name: "Hamstring curl", sets: 3, reps: "10-12", rest: "75 sec" },
          { name: "Standing calf raise", sets: 3, reps: "12-15", rest: "60 sec" },
          { name: "Side plank", sets: 2, duration: "35 sec per side", rest: "30 sec" },
        ],
        notes: "Prioritize stable knee tracking and a controlled hip hinge.",
      },
      {
        dayLabel: "Day 5",
        sessionType: "Cardio",
        title: "Zone 2 conditioning",
        durationMinutes: 50,
        intensity: "Moderate",
        exercises: [
          { name: "Incline walk, bike, or elliptical", duration: "40 min" },
          { name: "Hip flexor stretch", duration: "2 min per side" },
          { name: "Thoracic rotations", sets: 2, reps: "8 per side" },
          { name: "Easy breathing reset", duration: "3 min" },
        ],
        notes: "Keep the effort steady enough to speak in short sentences.",
      },
    ],
  },
  {
    slug: "muscle-builder-five-day",
    goal: "Gain muscle",
    level: "Intermediate",
    title: "Muscle Builder 5-Day Split",
    description:
      "A higher-frequency split that gives each major muscle group focused weekly volume.",
    recommendedFor:
      "Intermediate lifters with consistent technique, dependable recovery, and gym access.",
    weeklyFocus:
      "Push, pull, legs, upper hypertrophy, and lower-body plus arms across five sessions.",
    days: [
      {
        dayLabel: "Day 1",
        sessionType: "Strength",
        title: "Push strength",
        durationMinutes: 65,
        intensity: "Hard",
        exercises: [
          { name: "Barbell or dumbbell bench press", sets: 4, reps: "6-8", rest: "2 min" },
          { name: "Seated shoulder press", sets: 3, reps: "8-10", rest: "90 sec" },
          { name: "Incline dumbbell press", sets: 3, reps: "10-12", rest: "75 sec" },
          { name: "Dumbbell lateral raise", sets: 3, reps: "12-15", rest: "60 sec" },
          { name: "Rope triceps pushdown", sets: 3, reps: "10-12", rest: "60 sec" },
        ],
        notes: "Keep one rep in reserve on pressing sets; do not turn them into grinders.",
      },
      {
        dayLabel: "Day 2",
        sessionType: "Strength",
        title: "Pull strength",
        durationMinutes: 65,
        intensity: "Hard",
        exercises: [
          { name: "Romanian deadlift", sets: 3, reps: "6-8", rest: "2 min" },
          { name: "Lat pulldown or pull-up", sets: 4, reps: "8-10", rest: "90 sec" },
          { name: "Chest-supported row", sets: 3, reps: "8-10", rest: "90 sec" },
          { name: "Cable face pull", sets: 3, reps: "12-15", rest: "60 sec" },
          { name: "Hammer curl", sets: 3, reps: "10-12", rest: "60 sec" },
        ],
        notes: "Drive rows with your elbows and keep the lower back stable.",
      },
      {
        dayLabel: "Day 3",
        sessionType: "Strength",
        title: "Legs",
        durationMinutes: 70,
        intensity: "Hard",
        exercises: [
          { name: "Back squat or hack squat", sets: 4, reps: "6-8", rest: "2-3 min" },
          { name: "Leg press", sets: 3, reps: "10-12", rest: "90 sec" },
          { name: "Lying leg curl", sets: 3, reps: "10-12", rest: "75 sec" },
          { name: "Walking lunge", sets: 2, reps: "10 per side", rest: "75 sec" },
          { name: "Seated calf raise", sets: 4, reps: "12-15", rest: "60 sec" },
        ],
        notes: "Use a full comfortable range and keep the final reps clean.",
      },
      {
        dayLabel: "Day 4",
        sessionType: "Strength",
        title: "Upper hypertrophy",
        durationMinutes: 60,
        intensity: "Moderate",
        exercises: [
          { name: "Incline machine press", sets: 3, reps: "10-12", rest: "75 sec" },
          { name: "Seated cable row", sets: 3, reps: "10-12", rest: "75 sec" },
          { name: "Cable fly", sets: 3, reps: "12-15", rest: "60 sec" },
          { name: "Straight-arm pulldown", sets: 3, reps: "12-15", rest: "60 sec" },
          { name: "Lateral raise", sets: 3, reps: "15", rest: "45 sec" },
        ],
        notes: "Chase controlled tension instead of heavier weight today.",
      },
      {
        dayLabel: "Day 5",
        sessionType: "Hybrid",
        title: "Lower body + arms",
        durationMinutes: 55,
        intensity: "Moderate",
        exercises: [
          { name: "Hip thrust", sets: 3, reps: "8-10", rest: "90 sec" },
          { name: "Bulgarian split squat", sets: 3, reps: "10 per side", rest: "75 sec" },
          { name: "Leg extension", sets: 3, reps: "12-15", rest: "60 sec" },
          { name: "Incline dumbbell curl", sets: 3, reps: "10-12", rest: "60 sec" },
          { name: "Overhead dumbbell extension", sets: 3, reps: "10-12", rest: "60 sec" },
        ],
        notes: "Finish with a small amount of quality arm work, then recover for the weekend.",
      },
    ],
  },
  {
    slug: "balanced-fitness-five-day",
    goal: "Get fit",
    level: "Intermediate",
    title: "Balanced Fitness 5-Day",
    description:
      "A five-day blend of strength, conditioning, aerobic work, and mobility for broad fitness.",
    recommendedFor:
      "Intermediate users ready for more frequent training without specialising in one discipline.",
    weeklyFocus:
      "Two strength days, one mixed strength day, intervals, zone 2 work, and purposeful mobility.",
    days: [
      {
        dayLabel: "Day 1",
        sessionType: "Strength",
        title: "Full-body strength",
        durationMinutes: 55,
        intensity: "Moderate",
        exercises: [
          { name: "Goblet squat or front squat", sets: 4, reps: "8", rest: "90 sec" },
          { name: "Dumbbell bench press", sets: 3, reps: "8-10", rest: "90 sec" },
          { name: "One-arm dumbbell row", sets: 3, reps: "10 per side", rest: "75 sec" },
          { name: "Romanian deadlift", sets: 3, reps: "10", rest: "90 sec" },
          { name: "Plank", sets: 3, duration: "40 sec", rest: "45 sec" },
        ],
        notes: "Start the week with steady, technically sound work.",
      },
      {
        dayLabel: "Day 2",
        sessionType: "Cardio",
        title: "Intervals",
        durationMinutes: 40,
        intensity: "Hard",
        exercises: [
          { name: "Warm-up walk, bike, or row", duration: "8 min" },
          { name: "Intervals", sets: 8, duration: "1 min hard / 90 sec easy" },
          { name: "Easy cooldown", duration: "8 min" },
          { name: "Hip mobility", duration: "5 min" },
        ],
        notes: "Work hard enough to raise your heart rate, not to lose technique.",
      },
      {
        dayLabel: "Day 3",
        sessionType: "Hybrid",
        title: "Upper/lower mix",
        durationMinutes: 55,
        intensity: "Moderate",
        exercises: [
          { name: "Leg press", sets: 3, reps: "10", rest: "90 sec" },
          { name: "Lat pulldown", sets: 3, reps: "10-12", rest: "75 sec" },
          { name: "Incline dumbbell press", sets: 3, reps: "10", rest: "75 sec" },
          { name: "Reverse lunge", sets: 3, reps: "8 per side", rest: "75 sec" },
          { name: "Farmer carry", sets: 3, duration: "40 sec", rest: "60 sec" },
        ],
        notes: "Move with purpose, resting just enough to keep every set sharp.",
      },
      {
        dayLabel: "Day 4",
        sessionType: "Cardio",
        title: "Zone 2 + core",
        durationMinutes: 50,
        intensity: "Moderate",
        exercises: [
          { name: "Bike, treadmill, or elliptical", duration: "35 min" },
          { name: "Dead bug", sets: 3, reps: "10 per side", rest: "30 sec" },
          { name: "Side plank", sets: 2, duration: "30 sec per side", rest: "30 sec" },
          { name: "Easy stretching", duration: "5 min" },
        ],
        notes: "Keep this aerobic day controlled enough to support the final session.",
      },
      {
        dayLabel: "Day 5",
        sessionType: "Hybrid",
        title: "Conditioning circuit + mobility",
        durationMinutes: 45,
        intensity: "Moderate",
        exercises: [
          { name: "Kettlebell deadlift", sets: 3, reps: "12", rest: "60 sec" },
          { name: "Push-up", sets: 3, reps: "8-15", rest: "60 sec" },
          { name: "Seated row", sets: 3, reps: "12", rest: "60 sec" },
          { name: "Step-up", sets: 3, reps: "10 per side", rest: "60 sec" },
          { name: "Mobility flow", duration: "8 min" },
        ],
        notes: "Keep the circuit smooth; this is fitness work, not a race.",
      },
    ],
  },
  {
    slug: "strength-progress-five-day",
    goal: "Build strength",
    level: "Intermediate",
    title: "Strength Progress 5-Day",
    description:
      "A five-day strength template with focused main lifts and enough accessory volume to build durable progress.",
    recommendedFor:
      "Intermediate lifters who have established solid technique in the main movement patterns.",
    weeklyFocus:
      "Squat, bench, hinge, upper-body volume, and lower-body volume with core stability throughout the week.",
    days: [
      {
        dayLabel: "Day 1",
        sessionType: "Strength",
        title: "Squat strength",
        durationMinutes: 70,
        intensity: "Hard",
        exercises: [
          { name: "Back squat", sets: 5, reps: "4-6", rest: "2-3 min" },
          { name: "Paused goblet squat", sets: 3, reps: "8", rest: "90 sec" },
          { name: "Leg curl", sets: 3, reps: "10-12", rest: "75 sec" },
          { name: "Standing calf raise", sets: 3, reps: "12", rest: "60 sec" },
        ],
        notes: "Use repeatable loads; add weight only when every rep stays crisp.",
      },
      {
        dayLabel: "Day 2",
        sessionType: "Strength",
        title: "Bench strength",
        durationMinutes: 65,
        intensity: "Hard",
        exercises: [
          { name: "Bench press", sets: 5, reps: "4-6", rest: "2-3 min" },
          { name: "Overhead press", sets: 3, reps: "6-8", rest: "2 min" },
          { name: "Chest-supported row", sets: 4, reps: "8", rest: "90 sec" },
          { name: "Rope triceps pushdown", sets: 3, reps: "10-12", rest: "60 sec" },
        ],
        notes: "Keep your shoulder blades set and drive the bar with control.",
      },
      {
        dayLabel: "Day 3",
        sessionType: "Strength",
        title: "Hinge strength",
        durationMinutes: 70,
        intensity: "Hard",
        exercises: [
          { name: "Deadlift variation", sets: 4, reps: "3-5", rest: "2-3 min" },
          { name: "Front-foot elevated split squat", sets: 3, reps: "8 per side", rest: "90 sec" },
          { name: "Lat pulldown", sets: 3, reps: "8-10", rest: "75 sec" },
          { name: "Dead bug", sets: 3, reps: "10 per side", rest: "30 sec" },
        ],
        notes: "Stop a set if your bracing or bar path starts to change.",
      },
      {
        dayLabel: "Day 4",
        sessionType: "Strength",
        title: "Upper volume",
        durationMinutes: 60,
        intensity: "Moderate",
        exercises: [
          { name: "Incline dumbbell press", sets: 4, reps: "8-10", rest: "90 sec" },
          { name: "Seated cable row", sets: 4, reps: "10", rest: "75 sec" },
          { name: "Dumbbell lateral raise", sets: 3, reps: "12-15", rest: "60 sec" },
          { name: "Hammer curl", sets: 3, reps: "10-12", rest: "60 sec" },
        ],
        notes: "This day supports the heavy lifts—leave the gym with quality reps still available.",
      },
      {
        dayLabel: "Day 5",
        sessionType: "Strength",
        title: "Lower volume + core",
        durationMinutes: 60,
        intensity: "Moderate",
        exercises: [
          { name: "Leg press", sets: 4, reps: "10", rest: "90 sec" },
          { name: "Hip thrust", sets: 3, reps: "10", rest: "90 sec" },
          { name: "Walking lunge", sets: 3, reps: "10 per side", rest: "75 sec" },
          { name: "Hanging knee raise or reverse crunch", sets: 3, reps: "10-12", rest: "45 sec" },
        ],
        notes: "Finish the week with stable positions and controlled accessory work.",
      },
    ],
  },
  {
    slug: "cardio-engine-five-day",
    goal: "Improve cardio",
    level: "Intermediate",
    title: "Cardio Engine 5-Day",
    description:
      "A five-day endurance plan balancing aerobic volume, quality intervals, and strength maintenance.",
    recommendedFor:
      "Intermediate cardio trainees who can already handle regular steady-state sessions.",
    weeklyFocus:
      "Zone 2 volume, intervals, tempo work, a long aerobic session, and one full-body strength day.",
    days: [
      {
        dayLabel: "Day 1",
        sessionType: "Cardio",
        title: "Zone 2 base",
        durationMinutes: 55,
        intensity: "Moderate",
        exercises: [
          { name: "Bike, run-walk, rower, or elliptical", duration: "45 min" },
          { name: "Easy cooldown", duration: "5 min" },
          { name: "Calf and hip mobility", duration: "5 min" },
        ],
        notes: "Choose a pace you can hold with steady nasal or conversational breathing.",
      },
      {
        dayLabel: "Day 2",
        sessionType: "Cardio",
        title: "Intervals",
        durationMinutes: 45,
        intensity: "Hard",
        exercises: [
          { name: "Warm-up", duration: "10 min" },
          { name: "Intervals", sets: 6, duration: "2 min hard / 2 min easy" },
          { name: "Easy cooldown", duration: "8 min" },
        ],
        notes: "Keep the first interval conservative enough that the last one looks the same.",
      },
      {
        dayLabel: "Day 3",
        sessionType: "Strength",
        title: "Strength maintenance",
        durationMinutes: 55,
        intensity: "Moderate",
        exercises: [
          { name: "Goblet squat", sets: 3, reps: "8-10", rest: "90 sec" },
          { name: "Dumbbell bench press", sets: 3, reps: "8-10", rest: "75 sec" },
          { name: "Seated row", sets: 3, reps: "10", rest: "75 sec" },
          { name: "Romanian deadlift", sets: 3, reps: "8", rest: "90 sec" },
          { name: "Plank", sets: 3, duration: "40 sec", rest: "45 sec" },
        ],
        notes: "Lift with intent, but keep enough recovery for the aerobic sessions.",
      },
      {
        dayLabel: "Day 4",
        sessionType: "Cardio",
        title: "Tempo effort",
        durationMinutes: 45,
        intensity: "Hard",
        exercises: [
          { name: "Easy warm-up", duration: "10 min" },
          { name: "Tempo cardio", duration: "20 min", notes: "Comfortably hard but controlled" },
          { name: "Easy cooldown", duration: "10 min" },
          { name: "Breathing reset", duration: "3 min" },
        ],
        notes: "Tempo should be demanding but smooth—do not sprint it.",
      },
      {
        dayLabel: "Day 5",
        sessionType: "Hybrid",
        title: "Long aerobic + mobility",
        durationMinutes: 75,
        intensity: "Moderate",
        exercises: [
          { name: "Easy long cardio", duration: "60 min" },
          { name: "Hip flexor stretch", duration: "2 min per side" },
          { name: "Hamstring stretch", duration: "2 min per side" },
          { name: "Thoracic rotations", sets: 2, reps: "8 per side" },
        ],
        notes: "Fuel and hydrate for this session; the goal is patient aerobic volume.",
      },
    ],
  },
  {
    slug: "healthy-routine-five-day",
    goal: "General health",
    level: "Intermediate",
    title: "Healthy Routine 5-Day",
    description:
      "A practical five-day routine for people who want more structure across strength, cardio, and recovery.",
    recommendedFor:
      "Intermediate users who enjoy regular movement and can comfortably train on most weekdays.",
    weeklyFocus:
      "Two full-body strength sessions, two cardio sessions, core work, and a dedicated mobility day.",
    days: [
      {
        dayLabel: "Day 1",
        sessionType: "Strength",
        title: "Full-body strength A",
        durationMinutes: 50,
        intensity: "Moderate",
        exercises: [
          { name: "Leg press or goblet squat", sets: 3, reps: "10", rest: "90 sec" },
          { name: "Chest press", sets: 3, reps: "8-10", rest: "75 sec" },
          { name: "Seated row", sets: 3, reps: "10", rest: "75 sec" },
          { name: "Farmer carry", sets: 3, duration: "30 sec", rest: "60 sec" },
        ],
        notes: "Keep the first session repeatable enough to build a weekly habit.",
      },
      {
        dayLabel: "Day 2",
        sessionType: "Cardio",
        title: "Steady cardio + core",
        durationMinutes: 45,
        intensity: "Moderate",
        exercises: [
          { name: "Brisk walk, bike, or elliptical", duration: "30 min" },
          { name: "Dead bug", sets: 3, reps: "8 per side", rest: "30 sec" },
          { name: "Side plank", sets: 2, duration: "25 sec per side", rest: "30 sec" },
          { name: "Easy stretching", duration: "5 min" },
        ],
        notes: "Aim for steady breathing and good posture throughout the session.",
      },
      {
        dayLabel: "Day 3",
        sessionType: "Strength",
        title: "Full-body strength B",
        durationMinutes: 50,
        intensity: "Moderate",
        exercises: [
          { name: "Romanian deadlift", sets: 3, reps: "8-10", rest: "90 sec" },
          { name: "Dumbbell shoulder press", sets: 3, reps: "10", rest: "75 sec" },
          { name: "Lat pulldown", sets: 3, reps: "10", rest: "75 sec" },
          { name: "Reverse lunge", sets: 3, reps: "8 per side", rest: "75 sec" },
          { name: "Calf raise", sets: 3, reps: "15", rest: "60 sec" },
        ],
        notes: "Prioritize smooth movement and stop before fatigue changes your form.",
      },
      {
        dayLabel: "Day 4",
        sessionType: "Cardio",
        title: "Cardio progression",
        durationMinutes: 45,
        intensity: "Moderate",
        exercises: [
          { name: "Warm-up walk or bike", duration: "8 min" },
          { name: "Cardio progression", sets: 5, duration: "3 min moderate / 1 min brisk" },
          { name: "Easy cooldown", duration: "7 min" },
          { name: "Deep breathing", duration: "3 min" },
        ],
        notes: "The brisk sections should feel lively, never all-out.",
      },
      {
        dayLabel: "Day 5",
        sessionType: "Mobility",
        title: "Mobility + longer walk",
        durationMinutes: 50,
        intensity: "Light",
        exercises: [
          { name: "Easy walk", duration: "30 min" },
          { name: "Cat-cow", duration: "2 min" },
          { name: "Hip flexor stretch", duration: "2 min per side" },
          { name: "Hamstring stretch", duration: "2 min per side" },
          { name: "Child's pose", duration: "3 min" },
        ],
        notes: "Use the final day to recover while keeping the movement habit alive.",
      },
    ],
  },
];

export function getAllTrainingPlans() {
  return trainingPlans;
}

export function getTrainingPlanByGoal(
  goal: TrainingGoal,
  level: TrainingLevel = defaultTrainingLevel
) {
  return (
    trainingPlans.find(
      (plan) => plan.goal === goal && plan.level === level
    ) ??
    trainingPlans.find(
      (plan) =>
        plan.goal === goal && plan.level === defaultTrainingLevel
    ) ??
    trainingPlans.find(
      (plan) =>
        plan.goal === defaultTrainingGoal && plan.level === defaultTrainingLevel
    ) ??
    trainingPlans[0]
  );
}
