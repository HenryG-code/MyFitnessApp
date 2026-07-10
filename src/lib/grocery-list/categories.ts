import type { GroceryCategory } from "@/src/lib/grocery-list/types";

const categoryKeywords: Record<GroceryCategory, string[]> = {
  Protein: [
    "chicken",
    "steak",
    "mince",
    "eggs",
    "egg",
    "salmon",
    "patty",
    "beef",
    "prawn",
    "tuna",
    "tofu",
    "biltong",
    "edamame",
    "chickpea",
  ],
  Vegetables: [
    "lettuce",
    "tomato",
    "tomatoes",
    "cucumber",
    "mushroom",
    "mushrooms",
    "spinach",
    "carrot",
    "carrots",
    "onion",
    "vegetables",
    "greens",
    "broccoli",
    "pak choi",
    "cabbage",
    "spring onion",
  ],
  Fruit: ["banana", "apple", "berries", "lime", "lemon"],
  Carbs: [
    "rice",
    "potato",
    "potatoes",
    "sweet potato",
    "pasta",
    "oats",
    "toast",
    "wrap",
    "noodles",
    "bread",
    "ramen",
    "soba",
    "granola",
    "rice cake",
  ],
  Dairy: [
    "greek yogurt",
    "cottage cheese",
    "milk",
    "yogurt",
    "cheddar",
    "cheese",
  ],
  Pantry: [
    "honey",
    "soy sauce",
    "tomato sauce",
    "sauce",
    "stock",
    "hummus",
    "mustard",
    "mayonnaise",
    "dressing",
    "sesame seeds",
  ],
  "Fats & Oils": [
    "avocado",
    "peanut butter",
    "olive oil",
    "sesame oil",
    "cooking oil",
    "almonds",
    "chilli crisp",
  ],
  Spices: [
    "cinnamon",
    "salt",
    "pepper",
    "black pepper",
    "garlic",
    "spices",
    "seasoning",
    "ginger",
    "chilli",
    "paprika",
    "coriander",
    "vanilla",
  ],
  Other: [],
};

export function normalizeIngredientName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function createGroceryItemId(category: GroceryCategory, name: string) {
  const normalizedCategory = category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const normalizedName = normalizeIngredientName(name).replace(/[^a-z0-9]+/g, "-");

  return `${normalizedCategory}-${normalizedName}`;
}

export function categorizeIngredient(name: string): GroceryCategory {
  const normalizedName = normalizeIngredientName(name);

  for (const [category, keywords] of Object.entries(categoryKeywords) as [
    GroceryCategory,
    string[],
  ][]) {
    if (category === "Other") {
      continue;
    }

    if (keywords.some((keyword) => normalizedName.includes(keyword))) {
      return category;
    }
  }

  return "Other";
}
