import { RecipeDetail } from "@/components/recipes/recipe-detail";
import { getAllRecipes, getRecipeBySlug } from "@/src/lib/recipes/data";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return getAllRecipes().map((recipe) => ({
    slug: recipe.slug,
  }));
}

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const recipe = getRecipeBySlug(slug);

  if (!recipe) {
    notFound();
  }

  return <RecipeDetail recipe={recipe} />;
}
