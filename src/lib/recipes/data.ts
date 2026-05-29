export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack";

export type Difficulty = "Easy" | "Medium";

export type Recipe = {
  slug: string;
  title: string;
  mealType: MealType;
  goals: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  difficulty: Difficulty;
  ingredients: string[];
  instructions: string[];
  description: string;
  tags: string[];
};

export type RecipeFilters = {
  mealType: MealType | "";
  goal: string;
  prepTime: string;
  protein: string;
};

export const mealTypeOptions: MealType[] = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snack",
];

export const goalFilterOptions = [
  "Fat loss",
  "Muscle gain",
  "Get fit",
  "Meal prep",
  "Budget",
  "High protein",
  "Quick",
];

export const prepTimeFilterOptions = [
  "Under 10 min",
  "Under 20 min",
  "Under 30 min",
  "Meal prep",
];

export const proteinFilterOptions = ["20g+", "30g+", "40g+"];

export const recipes: Recipe[] = [
  {
    slug: "greek-yogurt-protein-bowl",
    title: "Greek Yogurt Protein Bowl",
    mealType: "Breakfast",
    goals: ["Fat loss", "High protein", "Quick"],
    description:
      "A fast protein-heavy breakfast bowl with fruit, oats, and peanut butter.",
    ingredients: [
      "Greek yogurt",
      "Banana",
      "Berries",
      "Peanut butter",
      "Oats",
      "Cinnamon",
    ],
    calories: 420,
    protein: 32,
    carbs: 48,
    fat: 12,
    prepTimeMinutes: 5,
    cookTimeMinutes: 0,
    difficulty: "Easy",
    instructions: [
      "Add Greek yogurt to a bowl.",
      "Slice banana and add berries.",
      "Add oats and peanut butter.",
      "Finish with cinnamon.",
    ],
    tags: ["Breakfast", "Fruit", "No cook", "High protein"],
  },
  {
    slug: "eggs-avocado-toast",
    title: "Eggs, Avocado & Toast",
    mealType: "Breakfast",
    goals: ["Get fit", "Balanced", "Quick"],
    description:
      "A simple whole-food breakfast with eggs, avocado, toast, and tomatoes.",
    ingredients: [
      "Eggs",
      "Avocado",
      "Wholegrain toast",
      "Mini tomatoes",
      "Salt",
      "Pepper",
    ],
    calories: 480,
    protein: 25,
    carbs: 38,
    fat: 26,
    prepTimeMinutes: 5,
    cookTimeMinutes: 10,
    difficulty: "Easy",
    instructions: [
      "Cook eggs to preference.",
      "Toast the bread.",
      "Slice avocado and tomatoes.",
      "Plate together and season.",
    ],
    tags: ["Breakfast", "Balanced", "Whole foods"],
  },
  {
    slug: "steak-egg-breakfast-plate",
    title: "Steak & Egg Breakfast Plate",
    mealType: "Breakfast",
    goals: ["Muscle gain", "High protein"],
    description: "A high-protein breakfast plate for heavier training days.",
    ingredients: ["Lean steak", "Eggs", "Mushrooms", "Mini tomatoes", "Spinach"],
    calories: 560,
    protein: 48,
    carbs: 12,
    fat: 34,
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    difficulty: "Medium",
    instructions: [
      "Season and cook steak.",
      "Cook eggs to preference.",
      "Saute mushrooms, tomatoes, and spinach.",
      "Serve together.",
    ],
    tags: ["Breakfast", "High protein", "Training day"],
  },
  {
    slug: "banana-peanut-butter-oats",
    title: "Banana Peanut Butter Oats",
    mealType: "Breakfast",
    goals: ["Budget", "Get fit"],
    description: "Budget-friendly oats for energy and satiety.",
    ingredients: ["Oats", "Banana", "Peanut butter", "Milk", "Cinnamon"],
    calories: 520,
    protein: 22,
    carbs: 70,
    fat: 18,
    prepTimeMinutes: 3,
    cookTimeMinutes: 5,
    difficulty: "Easy",
    instructions: [
      "Cook oats with milk.",
      "Stir in peanut butter.",
      "Top with sliced banana and cinnamon.",
    ],
    tags: ["Breakfast", "Budget", "Oats"],
  },
  {
    slug: "high-protein-smoothie",
    title: "High-Protein Smoothie",
    mealType: "Breakfast",
    goals: ["Quick", "High protein", "Get fit"],
    description: "A quick smoothie for busy mornings.",
    ingredients: ["Greek yogurt", "Banana", "Oats", "Peanut butter", "Milk", "Ice"],
    calories: 500,
    protein: 35,
    carbs: 58,
    fat: 15,
    prepTimeMinutes: 5,
    cookTimeMinutes: 0,
    difficulty: "Easy",
    instructions: [
      "Add all ingredients to blender.",
      "Blend until smooth.",
      "Serve cold.",
    ],
    tags: ["Breakfast", "Smoothie", "Quick"],
  },
  {
    slug: "cottage-cheese-fruit-bowl",
    title: "Cottage Cheese Fruit Bowl",
    mealType: "Breakfast",
    goals: ["Fat loss", "Quick", "High protein"],
    description: "A light high-protein breakfast or snack bowl.",
    ingredients: ["Cottage cheese", "Apple", "Berries", "Honey", "Cinnamon"],
    calories: 330,
    protein: 28,
    carbs: 38,
    fat: 7,
    prepTimeMinutes: 5,
    cookTimeMinutes: 0,
    difficulty: "Easy",
    instructions: [
      "Add cottage cheese to a bowl.",
      "Add sliced apple and berries.",
      "Add a small drizzle of honey.",
      "Finish with cinnamon.",
    ],
    tags: ["Breakfast", "No cook", "High protein"],
  },
  {
    slug: "chicken-rice-power-bowl",
    title: "Chicken Rice Power Bowl",
    mealType: "Lunch",
    goals: ["Fat loss", "Meal prep", "High protein"],
    description:
      "A balanced chicken and rice bowl with vegetables and avocado.",
    ingredients: ["Chicken breast", "Rice", "Peas", "Corn", "Tomatoes", "Avocado"],
    calories: 620,
    protein: 45,
    carbs: 68,
    fat: 18,
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    difficulty: "Easy",
    instructions: [
      "Cook rice.",
      "Grill or pan-cook chicken.",
      "Add peas, corn, tomatoes, and avocado.",
      "Slice chicken and serve over rice.",
    ],
    tags: ["Lunch", "Meal prep", "Chicken"],
  },
  {
    slug: "chicken-salad-wrap",
    title: "Chicken Salad Wrap",
    mealType: "Lunch",
    goals: ["Quick", "High protein"],
    description:
      "A quick wrap with chicken, salad vegetables, and a light dressing.",
    ingredients: [
      "Chicken breast",
      "Wholewheat wrap",
      "Lettuce",
      "Tomato",
      "Cucumber",
      "Avocado or Greek yogurt dressing",
    ],
    calories: 470,
    protein: 38,
    carbs: 42,
    fat: 15,
    prepTimeMinutes: 10,
    cookTimeMinutes: 5,
    difficulty: "Easy",
    instructions: [
      "Slice cooked chicken.",
      "Add salad ingredients to wrap.",
      "Add avocado or Greek yogurt dressing.",
      "Roll and serve.",
    ],
    tags: ["Lunch", "Wrap", "Quick"],
  },
  {
    slug: "steak-potato-meal-prep",
    title: "Steak & Potato Meal Prep",
    mealType: "Lunch",
    goals: ["Muscle gain", "Meal prep", "High protein"],
    description:
      "A filling meal-prep option with steak, potatoes, and vegetables.",
    ingredients: ["Lean steak", "Potatoes", "Peas", "Mushrooms", "Tomatoes"],
    calories: 680,
    protein: 50,
    carbs: 62,
    fat: 24,
    prepTimeMinutes: 10,
    cookTimeMinutes: 25,
    difficulty: "Medium",
    instructions: [
      "Cook potatoes.",
      "Cook steak to preference.",
      "Saute mushrooms, peas, and tomatoes.",
      "Portion into meal-prep containers.",
    ],
    tags: ["Lunch", "Meal prep", "Muscle gain"],
  },
  {
    slug: "chicken-avocado-salad",
    title: "Chicken Avocado Salad",
    mealType: "Lunch",
    goals: ["Fat loss", "Low carb", "High protein"],
    description: "A fresh chicken salad with avocado and vegetables.",
    ingredients: [
      "Chicken breast",
      "Avocado",
      "Lettuce",
      "Tomato",
      "Cucumber",
      "Olive oil dressing",
    ],
    calories: 520,
    protein: 42,
    carbs: 18,
    fat: 30,
    prepTimeMinutes: 10,
    cookTimeMinutes: 10,
    difficulty: "Easy",
    instructions: [
      "Cook and slice chicken.",
      "Add salad vegetables to bowl.",
      "Add avocado.",
      "Top with chicken and dressing.",
    ],
    tags: ["Lunch", "Salad", "Low carb"],
  },
  {
    slug: "egg-fried-rice-vegetables",
    title: "Egg Fried Rice with Vegetables",
    mealType: "Lunch",
    goals: ["Budget", "Balanced"],
    description: "A budget-friendly rice dish with eggs and vegetables.",
    ingredients: ["Rice", "Eggs", "Peas", "Corn", "Carrots", "Spring onion", "Soy sauce"],
    calories: 560,
    protein: 24,
    carbs: 78,
    fat: 16,
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    difficulty: "Easy",
    instructions: [
      "Cook eggs in pan.",
      "Add cooked rice and vegetables.",
      "Add soy sauce.",
      "Stir-fry until hot.",
    ],
    tags: ["Lunch", "Budget", "Balanced"],
  },
  {
    slug: "mince-rice-bowl",
    title: "Mince & Rice Bowl",
    mealType: "Lunch",
    goals: ["Meal prep", "High protein"],
    description: "A simple lean mince bowl for meal prep.",
    ingredients: ["Lean mince", "Rice", "Tomatoes", "Onion", "Peas", "Spices"],
    calories: 650,
    protein: 42,
    carbs: 70,
    fat: 20,
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    difficulty: "Easy",
    instructions: [
      "Cook rice.",
      "Cook mince with onion, tomatoes, peas, and spices.",
      "Serve mince mixture over rice.",
    ],
    tags: ["Lunch", "Meal prep", "Mince"],
  },
  {
    slug: "chicken-stir-fry",
    title: "Chicken Stir Fry",
    mealType: "Dinner",
    goals: ["Fat loss", "Balanced", "Quick"],
    description:
      "A balanced chicken stir fry with vegetables and rice or noodles.",
    ingredients: ["Chicken breast", "Mixed vegetables", "Rice or noodles", "Garlic", "Soy sauce"],
    calories: 580,
    protein: 45,
    carbs: 65,
    fat: 14,
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    difficulty: "Easy",
    instructions: [
      "Cook rice or noodles.",
      "Stir-fry chicken with garlic.",
      "Add vegetables and soy sauce.",
      "Serve together.",
    ],
    tags: ["Dinner", "Quick", "Balanced"],
  },
  {
    slug: "salmon-sweet-potato",
    title: "Salmon & Sweet Potato",
    mealType: "Dinner",
    goals: ["Recovery", "Healthy fats", "High protein"],
    description: "A recovery-focused dinner with salmon and sweet potato.",
    ingredients: ["Salmon", "Sweet potato", "Green vegetables", "Lemon", "Olive oil"],
    calories: 650,
    protein: 42,
    carbs: 52,
    fat: 28,
    prepTimeMinutes: 10,
    cookTimeMinutes: 25,
    difficulty: "Medium",
    instructions: [
      "Roast or boil sweet potato.",
      "Cook salmon with lemon and seasoning.",
      "Steam or saute green vegetables.",
      "Plate together.",
    ],
    tags: ["Dinner", "Recovery", "Healthy fats"],
  },
  {
    slug: "lean-beef-mince-bolognese",
    title: "Lean Beef Mince Bolognese",
    mealType: "Dinner",
    goals: ["High protein", "Balanced"],
    description:
      "A high-protein comfort meal using lean mince and tomato sauce.",
    ingredients: ["Lean mince", "Tomato sauce", "Pasta", "Mushrooms", "Onion"],
    calories: 700,
    protein: 45,
    carbs: 82,
    fat: 20,
    prepTimeMinutes: 10,
    cookTimeMinutes: 25,
    difficulty: "Easy",
    instructions: [
      "Cook pasta.",
      "Cook mince with onion and mushrooms.",
      "Add tomato sauce.",
      "Serve sauce over pasta.",
    ],
    tags: ["Dinner", "Comfort food", "High protein"],
  },
  {
    slug: "steak-eggs-vegetables",
    title: "Steak, Eggs & Vegetables",
    mealType: "Dinner",
    goals: ["High protein", "Low carb"],
    description:
      "A simple high-protein dinner with steak, eggs, and vegetables.",
    ingredients: ["Steak", "Eggs", "Mushrooms", "Tomatoes", "Spinach"],
    calories: 620,
    protein: 55,
    carbs: 14,
    fat: 36,
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    difficulty: "Medium",
    instructions: [
      "Cook steak to preference.",
      "Cook eggs.",
      "Saute mushrooms, tomatoes, and spinach.",
      "Serve together.",
    ],
    tags: ["Dinner", "Low carb", "High protein"],
  },
  {
    slug: "chicken-potato-veg-tray-bake",
    title: "Chicken, Potato & Veg Tray Bake",
    mealType: "Dinner",
    goals: ["Meal prep", "Easy dinner"],
    description: "A simple tray bake that works well for batch cooking.",
    ingredients: ["Chicken thighs or breast", "Potatoes", "Carrots", "Onion", "Spices"],
    calories: 670,
    protein: 48,
    carbs: 60,
    fat: 24,
    prepTimeMinutes: 10,
    cookTimeMinutes: 35,
    difficulty: "Easy",
    instructions: [
      "Add chicken, potatoes, carrots, and onion to a tray.",
      "Season with spices.",
      "Bake until cooked through.",
      "Serve hot or portion for meal prep.",
    ],
    tags: ["Dinner", "Meal prep", "Tray bake"],
  },
  {
    slug: "chicken-burger-bowl",
    title: "Chicken Burger Bowl",
    mealType: "Dinner",
    goals: ["Healthy comfort food", "High protein"],
    description: "A burger-style bowl without the heavy fast-food feel.",
    ingredients: ["Lean chicken patty", "Lettuce", "Tomato", "Potato wedges", "Greek yogurt sauce"],
    calories: 620,
    protein: 44,
    carbs: 55,
    fat: 22,
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    difficulty: "Easy",
    instructions: [
      "Cook chicken patty.",
      "Bake potato wedges.",
      "Add lettuce and tomato to bowl.",
      "Add chicken and yogurt sauce.",
    ],
    tags: ["Dinner", "Comfort food", "High protein"],
  },
  {
    slug: "boiled-eggs-fruit",
    title: "Boiled Eggs & Fruit",
    mealType: "Snack",
    goals: ["Quick protein", "Budget"],
    description: "A simple snack with protein and fruit.",
    ingredients: ["Boiled eggs", "Apple or banana"],
    calories: 240,
    protein: 13,
    carbs: 25,
    fat: 10,
    prepTimeMinutes: 10,
    cookTimeMinutes: 0,
    difficulty: "Easy",
    instructions: [
      "Boil eggs if needed.",
      "Serve with apple or banana.",
    ],
    tags: ["Snack", "Budget", "Simple"],
  },
  {
    slug: "apple-peanut-butter",
    title: "Apple with Peanut Butter",
    mealType: "Snack",
    goals: ["Simple snack", "Quick"],
    description: "A fast snack with fruit and healthy fats.",
    ingredients: ["Apple", "Peanut butter"],
    calories: 260,
    protein: 7,
    carbs: 30,
    fat: 14,
    prepTimeMinutes: 2,
    cookTimeMinutes: 0,
    difficulty: "Easy",
    instructions: [
      "Slice apple.",
      "Serve with peanut butter.",
    ],
    tags: ["Snack", "Quick", "Fruit"],
  },
  {
    slug: "protein-yogurt-cup",
    title: "Protein Yogurt Cup",
    mealType: "Snack",
    goals: ["Sweet snack", "High protein", "Quick"],
    description: "A sweet high-protein snack without much prep.",
    ingredients: ["Greek yogurt", "Honey", "Berries", "Cinnamon"],
    calories: 280,
    protein: 25,
    carbs: 32,
    fat: 5,
    prepTimeMinutes: 5,
    cookTimeMinutes: 0,
    difficulty: "Easy",
    instructions: [
      "Add Greek yogurt to a cup.",
      "Add honey and berries.",
      "Finish with cinnamon.",
    ],
    tags: ["Snack", "Sweet", "High protein"],
  },
  {
    slug: "cottage-cheese-toast",
    title: "Cottage Cheese Toast",
    mealType: "Snack",
    goals: ["High protein", "Quick"],
    description: "A savory high-protein snack.",
    ingredients: ["Cottage cheese", "Wholegrain toast", "Tomato", "Pepper"],
    calories: 300,
    protein: 24,
    carbs: 32,
    fat: 8,
    prepTimeMinutes: 5,
    cookTimeMinutes: 2,
    difficulty: "Easy",
    instructions: [
      "Toast bread.",
      "Add cottage cheese.",
      "Top with tomato and pepper.",
    ],
    tags: ["Snack", "Savory", "High protein"],
  },
  {
    slug: "chicken-cucumber-snack-plate",
    title: "Chicken Cucumber Snack Plate",
    mealType: "Snack",
    goals: ["Lean snack", "Quick protein"],
    description:
      "A light snack plate with shredded chicken and crunchy vegetables.",
    ingredients: [
      "Shredded chicken breast",
      "Cucumber slices",
      "Mini tomatoes",
      "Greek yogurt dip",
      "Black pepper",
    ],
    calories: 300,
    protein: 30,
    carbs: 12,
    fat: 12,
    prepTimeMinutes: 10,
    cookTimeMinutes: 0,
    difficulty: "Easy",
    instructions: [
      "Add shredded chicken to a plate.",
      "Add cucumber and mini tomatoes.",
      "Add Greek yogurt dip.",
      "Season with black pepper.",
    ],
    tags: ["Snack", "Lean", "Quick protein"],
  },
  {
    slug: "smoothie-mini",
    title: "Smoothie Mini",
    mealType: "Snack",
    goals: ["Post-workout", "Quick", "High protein"],
    description: "A smaller smoothie for post-workout recovery.",
    ingredients: ["Milk", "Banana", "Greek yogurt", "Cinnamon"],
    calories: 350,
    protein: 25,
    carbs: 48,
    fat: 7,
    prepTimeMinutes: 5,
    cookTimeMinutes: 0,
    difficulty: "Easy",
    instructions: [
      "Add all ingredients to blender.",
      "Blend until smooth.",
      "Serve cold.",
    ],
    tags: ["Snack", "Post-workout", "Smoothie"],
  },
];

export function getAllRecipes() {
  return recipes;
}

export function getRecipeBySlug(slug: string) {
  return recipes.find((recipe) => recipe.slug === slug) ?? null;
}

export function getRecipesByMealType(mealType: MealType) {
  return recipes.filter((recipe) => recipe.mealType === mealType);
}

export function filterRecipes(
  recipeList: Recipe[],
  filters: RecipeFilters
) {
  return recipeList.filter((recipe) => {
    if (filters.mealType && recipe.mealType !== filters.mealType) {
      return false;
    }

    if (filters.goal && !recipe.goals.includes(filters.goal)) {
      return false;
    }

    if (filters.prepTime === "Under 10 min" && recipe.prepTimeMinutes > 10) {
      return false;
    }

    if (filters.prepTime === "Under 20 min" && recipe.prepTimeMinutes > 20) {
      return false;
    }

    if (filters.prepTime === "Under 30 min" && recipe.prepTimeMinutes > 30) {
      return false;
    }

    if (
      filters.prepTime === "Meal prep" &&
      !recipe.goals.includes("Meal prep")
    ) {
      return false;
    }

    if (filters.protein === "20g+" && recipe.protein < 20) {
      return false;
    }

    if (filters.protein === "30g+" && recipe.protein < 30) {
      return false;
    }

    if (filters.protein === "40g+" && recipe.protein < 40) {
      return false;
    }

    return true;
  });
}
