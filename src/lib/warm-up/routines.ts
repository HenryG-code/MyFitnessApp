export type WarmUpMode = "run" | "gym";

export type WarmUpStep = {
  title: string;
  focus: string;
  instruction: string;
  easierOption: string;
  durationSeconds: number;
};

export const guidedStretchHabitName = "Stretch for 10 mins";

export function isGuidedWarmUpHabit(name: string) {
  const normalized = name.trim().replace(/\s+/g, " ").toLowerCase();
  return /\bstretch\b.*\b(10|ten)\s*(min|mins|minute|minutes)\b/.test(
    normalized
  );
}

const sharedOpening: WarmUpStep[] = [
  {
    title: "Brisk march + arm swing",
    focus: "Raise your temperature",
    instruction:
      "Stand tall and march with purpose. Let both arms swing naturally, then gradually lift the knees higher.",
    easierOption: "March slowly and keep both feet close to the floor.",
    durationSeconds: 60,
  },
  {
    title: "Shoulder rolls + reaches",
    focus: "Shoulders and upper back",
    instruction:
      "Roll the shoulders back, then alternate smooth overhead reaches without arching your lower back.",
    easierOption: "Make the circles smaller and reach only as high as comfortable.",
    durationSeconds: 60,
  },
  {
    title: "Squat + overhead reach",
    focus: "Hips, knees and ankles",
    instruction:
      "Sit the hips back into a comfortable squat. Stand tall and reach overhead, moving continuously.",
    easierOption: "Use a shallow squat or lightly hold a stable support.",
    durationSeconds: 60,
  },
  {
    title: "Reverse lunge + rotation",
    focus: "Hips and torso",
    instruction:
      "Step back into a short lunge and rotate toward the front leg. Alternate sides with control.",
    easierOption: "Use a smaller step and keep the lunge shallow.",
    durationSeconds: 60,
  },
];

const runSteps: WarmUpStep[] = [
  ...sharedOpening,
  {
    title: "Ankle rocks",
    focus: "Ankles and calves",
    instruction:
      "Shift forward over one ankle while keeping the heel down, return, then switch sides.",
    easierOption: "Hold a wall and reduce the forward range.",
    durationSeconds: 60,
  },
  {
    title: "Leg swings",
    focus: "Hips and hamstrings",
    instruction:
      "Hold a stable support and swing one leg forward and back. Switch legs halfway through.",
    easierOption: "Keep each swing small and slow.",
    durationSeconds: 60,
  },
  {
    title: "Calf raise + knee drive",
    focus: "Running push-off",
    instruction:
      "Rise onto one foot as the opposite knee drives up. Alternate sides and stay tall.",
    easierOption: "Keep both hands on a wall and skip the knee drive.",
    durationSeconds: 60,
  },
  {
    title: "High-knee march",
    focus: "Hip flexors and posture",
    instruction:
      "Drive opposite arm and knee while staying light on your feet. Build the rhythm gradually.",
    easierOption: "Keep it as a controlled march without bouncing.",
    durationSeconds: 60,
  },
  {
    title: "Heel flicks",
    focus: "Hamstrings and turnover",
    instruction:
      "Jog gently in place, drawing each heel toward the glute without forcing the range.",
    easierOption: "Perform alternating standing heel curls.",
    durationSeconds: 60,
  },
  {
    title: "Build-up jog",
    focus: "Ready your running rhythm",
    instruction:
      "Jog easily in place or forward. Start relaxed and finish near your planned opening pace.",
    easierOption: "Finish with a brisk walk instead of a jog.",
    durationSeconds: 60,
  },
];

const gymSteps: WarmUpStep[] = [
  ...sharedOpening,
  {
    title: "Wall slides",
    focus: "Shoulder blades and upper back",
    instruction:
      "Keep ribs down as the forearms slide up a wall, then pull the elbows gently back down.",
    easierOption: "Stand away from the wall and use a smaller range.",
    durationSeconds: 60,
  },
  {
    title: "Hip-hinge drill",
    focus: "Hamstrings and lifting position",
    instruction:
      "Push the hips back with a long spine, feel the hamstrings load, then squeeze the glutes to stand.",
    easierOption: "Reduce the depth and place hands on the hips for feedback.",
    durationSeconds: 60,
  },
  {
    title: "Inchworm walkout",
    focus: "Core, shoulders and posterior chain",
    instruction:
      "Fold softly, walk the hands to a strong plank, pause, then walk back and stand tall.",
    easierOption: "Walk the hands onto a bench instead of the floor.",
    durationSeconds: 60,
  },
  {
    title: "Glute bridge",
    focus: "Glutes and trunk control",
    instruction:
      "Press through both feet, lift the hips, pause briefly, then lower with control and repeat.",
    easierOption: "Use a smaller lift and keep the ribs relaxed.",
    durationSeconds: 60,
  },
  {
    title: "Plank shoulder taps",
    focus: "Core and shoulder stability",
    instruction:
      "From a strong plank, tap opposite shoulders while keeping the hips as quiet as possible.",
    easierOption: "Use a bench or perform the taps from your knees.",
    durationSeconds: 60,
  },
  {
    title: "First-lift rehearsal",
    focus: "Prepare the exact movement",
    instruction:
      "Practice your first exercise with bodyweight, an empty bar, or very light resistance. Prioritize crisp form.",
    easierOption: "Rehearse the movement pattern with no load.",
    durationSeconds: 60,
  },
];

export const warmUpRoutines: Record<WarmUpMode, WarmUpStep[]> = {
  run: runSteps,
  gym: gymSteps,
};

export function getWarmUpDuration(steps: WarmUpStep[]) {
  return steps.reduce((total, step) => total + step.durationSeconds, 0);
}
