import {
  Activity,
  Dumbbell,
  Flame,
  Footprints,
  Moon,
  Salad,
  Scale,
  Target,
  Trophy,
  Waves,
} from "lucide-react";

export const profile = {
  name: "Alex Morgan",
  email: "alex@example.com",
  plan: "Free forever",
  timezone: "Africa/Johannesburg",
};

export const dashboardStats = {
  currentWeight: "78.4 kg",
  goalWeight: "74.0 kg",
  weeklyWorkouts: 4,
  habitCompletion: "82%",
  latestWorkout: {
    title: "Upper Body Strength",
    date: "Today",
    duration: "48 min",
    effort: "Strong",
  },
};

export const weeklyProgress = [
  { day: "Mon", workouts: 1, habits: 4 },
  { day: "Tue", workouts: 0, habits: 3 },
  { day: "Wed", workouts: 1, habits: 5 },
  { day: "Thu", workouts: 1, habits: 4 },
  { day: "Fri", workouts: 0, habits: 4 },
  { day: "Sat", workouts: 1, habits: 5 },
  { day: "Sun", workouts: 0, habits: 3 },
];

export const workoutHistory = [
  {
    title: "Upper Body Strength",
    type: "Strength",
    date: "Today",
    duration: "48 min",
    notes: "Bench press, rows, shoulder press, cable flys.",
  },
  {
    title: "Zone 2 Ride",
    type: "Cardio",
    date: "Yesterday",
    duration: "35 min",
    notes: "Steady bike session with easy nasal breathing.",
  },
  {
    title: "Lower Body Builder",
    type: "Strength",
    date: "May 25",
    duration: "52 min",
    notes: "Squats, RDLs, walking lunges, calf raises.",
  },
];

export const weightEntries = [
  { date: "May 1", weight: 80.1 },
  { date: "May 7", weight: 79.4 },
  { date: "May 14", weight: 79.0 },
  { date: "May 21", weight: 78.7 },
  { date: "May 28", weight: 78.4 },
];

export const habits = [
  {
    name: "Hydration",
    target: "2.5 L",
    streak: 12,
    completion: 92,
    icon: Waves,
  },
  {
    name: "Protein",
    target: "140 g",
    streak: 7,
    completion: 78,
    icon: Salad,
  },
  {
    name: "Steps",
    target: "8,000",
    streak: 5,
    completion: 84,
    icon: Footprints,
  },
  {
    name: "Sleep",
    target: "7.5 h",
    streak: 4,
    completion: 74,
    icon: Moon,
  },
];

export const highlights = [
  {
    label: "Training focus",
    value: "Build consistency",
    icon: Dumbbell,
  },
  {
    label: "Active streak",
    value: "12 days",
    icon: Flame,
  },
  {
    label: "Next milestone",
    value: "75 kg",
    icon: Target,
  },
  {
    label: "Best habit",
    value: "Hydration",
    icon: Trophy,
  },
  {
    label: "Check-in",
    value: "Weekly",
    icon: Scale,
  },
  {
    label: "Intensity",
    value: "Balanced",
    icon: Activity,
  },
];
