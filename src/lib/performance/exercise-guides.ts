import type { MuscleGroupId } from "@/src/lib/performance/muscles";

export type ExerciseGuideMedia = {
  type: "gif" | "video";
  src: string;
  alt: string;
  poster?: string;
};

export type ExerciseGuide = {
  name: string;
  equipment: string;
  difficulty: "Beginner" | "Intermediate";
  prescription: string;
  steps: string[];
  formCue: string;
  media?: ExerciseGuideMedia;
};

export const exerciseGuidesByMuscle: Record<
  MuscleGroupId,
  ExerciseGuide[]
> = {
  chest: [
    {
      name: "Push-up",
      equipment: "Bodyweight",
      difficulty: "Beginner",
      prescription: "3 sets · 8–15 reps",
      steps: [
        "Place your hands just wider than shoulder-width and make a straight line from head to heels.",
        "Brace your core and lower your chest between your hands with your elbows angled slightly back.",
        "Press the floor away until your arms are straight without letting your hips sag.",
      ],
      formCue: "Move your chest and hips as one unit.",
    },
    {
      name: "Dumbbell bench press",
      equipment: "Bench and dumbbells",
      difficulty: "Intermediate",
      prescription: "3 sets · 8–12 reps",
      steps: [
        "Lie on the bench with feet planted and dumbbells beside your chest.",
        "Lower the weights under control until your elbows sit slightly below the bench line.",
        "Drive the dumbbells upward and slightly inward while keeping your shoulders anchored.",
      ],
      formCue: "Keep shoulder blades gently pulled back throughout.",
    },
  ],
  shoulders: [
    {
      name: "Seated dumbbell shoulder press",
      equipment: "Bench and dumbbells",
      difficulty: "Beginner",
      prescription: "3 sets · 8–12 reps",
      steps: [
        "Sit tall against a bench and hold the dumbbells at shoulder height.",
        "Brace your ribs down and press the weights overhead without leaning back.",
        "Lower slowly until your elbows return just below shoulder height.",
      ],
      formCue: "Finish with biceps near your ears, not the weights behind your head.",
    },
    {
      name: "Dumbbell lateral raise",
      equipment: "Light dumbbells",
      difficulty: "Beginner",
      prescription: "3 sets · 12–15 reps",
      steps: [
        "Stand tall with light dumbbells at your sides and elbows softly bent.",
        "Raise your arms out and slightly forward until they reach shoulder height.",
        "Pause briefly, then lower the weights slowly without swinging.",
      ],
      formCue: "Lead with your elbows and keep your shoulders away from your ears.",
    },
  ],
  biceps: [
    {
      name: "Hammer curl",
      equipment: "Dumbbells",
      difficulty: "Beginner",
      prescription: "3 sets · 10–12 reps",
      steps: [
        "Stand with palms facing your thighs and elbows close to your ribs.",
        "Curl the dumbbells upward without moving your upper arms forward.",
        "Squeeze briefly and lower until the elbows are fully extended.",
      ],
      formCue: "Keep wrists neutral and avoid rocking your torso.",
    },
    {
      name: "Incline dumbbell curl",
      equipment: "Incline bench and dumbbells",
      difficulty: "Intermediate",
      prescription: "3 sets · 8–12 reps",
      steps: [
        "Sit against an incline bench with arms hanging straight and palms forward.",
        "Curl both dumbbells while keeping the shoulders pinned to the bench.",
        "Lower through the full range until your arms are straight again.",
      ],
      formCue: "Use a lighter weight than your standing curl and control the stretch.",
    },
  ],
  triceps: [
    {
      name: "Rope triceps pushdown",
      equipment: "Cable and rope",
      difficulty: "Beginner",
      prescription: "3 sets · 10–15 reps",
      steps: [
        "Stand close to the cable with elbows tucked beside your ribs.",
        "Push the rope down by straightening only at the elbows.",
        "Separate the rope ends at the bottom, then return under control.",
      ],
      formCue: "Keep your upper arms still from start to finish.",
    },
    {
      name: "Overhead dumbbell extension",
      equipment: "One dumbbell",
      difficulty: "Intermediate",
      prescription: "3 sets · 8–12 reps",
      steps: [
        "Hold one dumbbell overhead with both hands and brace your core.",
        "Bend your elbows to lower the weight behind your head.",
        "Extend your elbows to return overhead without flaring them wide.",
      ],
      formCue: "Keep ribs stacked over hips and elbows pointing forward.",
    },
  ],
  forearms: [
    {
      name: "Farmer carry",
      equipment: "Heavy dumbbells or kettlebells",
      difficulty: "Beginner",
      prescription: "3 carries · 30–45 sec",
      steps: [
        "Pick up equal weights and stand tall with arms straight at your sides.",
        "Walk with short controlled steps while squeezing the handles firmly.",
        "Turn carefully and set the weights down with a hip hinge.",
      ],
      formCue: "Stay tall and do not let the weights pull your shoulders forward.",
    },
    {
      name: "Seated wrist curl",
      equipment: "Light dumbbells",
      difficulty: "Beginner",
      prescription: "2–3 sets · 12–20 reps",
      steps: [
        "Rest your forearms on your thighs with palms up and wrists beyond your knees.",
        "Let the dumbbells roll slightly toward your fingers, then curl the wrists upward.",
        "Lower slowly through a comfortable range.",
      ],
      formCue: "Only the wrists should move; keep forearms supported.",
    },
  ],
  core: [
    {
      name: "Front plank",
      equipment: "Bodyweight",
      difficulty: "Beginner",
      prescription: "3 holds · 20–45 sec",
      steps: [
        "Place elbows beneath shoulders and extend both legs behind you.",
        "Tighten your glutes and brace as if preparing for a light punch.",
        "Hold a straight line while breathing slowly through the brace.",
      ],
      formCue: "Pull your ribs toward your hips instead of lifting your backside.",
    },
    {
      name: "Dead bug",
      equipment: "Bodyweight",
      difficulty: "Beginner",
      prescription: "3 sets · 6–10 per side",
      steps: [
        "Lie on your back with hips and knees at 90 degrees and arms above your chest.",
        "Press your lower back gently into the floor as you extend the opposite arm and leg.",
        "Return to centre and alternate sides without losing back contact.",
      ],
      formCue: "Shorten the reach if your lower back starts to lift.",
    },
  ],
  quads: [
    {
      name: "Goblet squat",
      equipment: "Dumbbell or kettlebell",
      difficulty: "Beginner",
      prescription: "3 sets · 8–12 reps",
      steps: [
        "Hold the weight at your chest and stand with feet around shoulder-width.",
        "Sit between your hips while allowing your knees to track over your toes.",
        "Drive through your whole foot to stand tall.",
      ],
      formCue: "Keep the weight close and your heels planted.",
    },
    {
      name: "Bulgarian split squat",
      equipment: "Bench; dumbbells optional",
      difficulty: "Intermediate",
      prescription: "3 sets · 8–10 per side",
      steps: [
        "Place one foot behind you on a bench and set the front foot far enough forward for balance.",
        "Lower the back knee toward the floor while the front knee tracks over the toes.",
        "Push through the front foot to return to the top.",
      ],
      formCue: "Keep most of your weight on the front leg.",
    },
  ],
  hamstrings: [
    {
      name: "Romanian deadlift",
      equipment: "Barbell or dumbbells",
      difficulty: "Intermediate",
      prescription: "3 sets · 8–12 reps",
      steps: [
        "Stand tall with the weight close to your thighs and knees softly bent.",
        "Push your hips backward while keeping the weight close to your legs.",
        "Stop at a strong hamstring stretch, then drive the hips forward to stand.",
      ],
      formCue: "Think hips back, not weight down; keep your spine long.",
    },
    {
      name: "Lying leg curl",
      equipment: "Leg-curl machine",
      difficulty: "Beginner",
      prescription: "3 sets · 10–15 reps",
      steps: [
        "Align your knees with the machine pivot and place the pad above your heels.",
        "Curl your heels toward your glutes without lifting your hips.",
        "Pause, then lower the pad slowly until the legs are nearly straight.",
      ],
      formCue: "Control the return instead of letting the weight stack drop.",
    },
  ],
  glutes: [
    {
      name: "Hip thrust",
      equipment: "Bench and barbell or dumbbell",
      difficulty: "Intermediate",
      prescription: "3 sets · 8–12 reps",
      steps: [
        "Rest your upper back against a bench and place the weight across your hips.",
        "Drive through your heels until hips are level with knees and shoulders.",
        "Squeeze the glutes briefly, then lower under control.",
      ],
      formCue: "Finish by tucking the pelvis slightly, not arching the lower back.",
    },
    {
      name: "Reverse lunge",
      equipment: "Bodyweight or dumbbells",
      difficulty: "Beginner",
      prescription: "3 sets · 8–10 per side",
      steps: [
        "Stand tall and step one foot backward onto the ball of the foot.",
        "Lower both knees until the front thigh approaches parallel.",
        "Push through the front foot and return to standing before switching sides.",
      ],
      formCue: "Use a long enough step to keep pressure through the front heel.",
    },
  ],
  calves: [
    {
      name: "Standing calf raise",
      equipment: "Step or calf-raise machine",
      difficulty: "Beginner",
      prescription: "3 sets · 12–20 reps",
      steps: [
        "Stand with the balls of your feet supported and heels free to move.",
        "Lower the heels into a comfortable stretch.",
        "Rise as high as possible onto your toes, pause, and lower slowly.",
      ],
      formCue: "Move straight up and down instead of rolling onto the outer toes.",
    },
    {
      name: "Seated calf raise",
      equipment: "Seated calf machine or dumbbell",
      difficulty: "Beginner",
      prescription: "3 sets · 15–20 reps",
      steps: [
        "Sit with knees bent, feet on a step, and resistance resting above the knees.",
        "Lower your heels below the step for a controlled stretch.",
        "Press through the balls of your feet and raise your heels fully.",
      ],
      formCue: "Pause at both the stretched and raised positions.",
    },
  ],
  back: [
    {
      name: "Lat pulldown",
      equipment: "Cable pulldown machine",
      difficulty: "Beginner",
      prescription: "3 sets · 8–12 reps",
      steps: [
        "Grip the bar just wider than shoulder-width and sit with thighs secured.",
        "Pull your elbows down toward your ribs until the bar reaches upper chest height.",
        "Let the arms extend overhead slowly without shrugging.",
      ],
      formCue: "Drive with your elbows and avoid leaning far backward.",
    },
    {
      name: "One-arm dumbbell row",
      equipment: "Bench and dumbbell",
      difficulty: "Beginner",
      prescription: "3 sets · 8–12 per side",
      steps: [
        "Support one hand and knee on a bench with your back flat.",
        "Pull the dumbbell toward your hip while keeping your torso square.",
        "Lower until the arm is long and the shoulder blade can move naturally.",
      ],
      formCue: "Pull toward your pocket, not straight up toward your shoulder.",
    },
  ],
  traps: [
    {
      name: "Dumbbell shrug",
      equipment: "Dumbbells",
      difficulty: "Beginner",
      prescription: "3 sets · 10–15 reps",
      steps: [
        "Stand tall with dumbbells at your sides and arms straight.",
        "Lift your shoulders directly toward your ears without bending the elbows.",
        "Pause at the top and lower slowly to a full stretch.",
      ],
      formCue: "Move straight up and down; do not roll your shoulders.",
    },
    {
      name: "Cable face pull",
      equipment: "Cable and rope",
      difficulty: "Intermediate",
      prescription: "3 sets · 12–15 reps",
      steps: [
        "Set the rope around face height and take a stable staggered stance.",
        "Pull the rope toward your forehead while separating the ends.",
        "Finish with hands beside your ears, then return slowly.",
      ],
      formCue: "Keep elbows high and avoid pushing your head forward.",
    },
  ],
};

export function getExerciseGuidesForMuscle(muscleId: MuscleGroupId) {
  return exerciseGuidesByMuscle[muscleId];
}
