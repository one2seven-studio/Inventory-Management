import type { Recipe, RecipeType } from "@platform/contracts";
import type { Recipe as PrismaRecipe, RecipeIngredient as PrismaRecipeIngredient } from "@platform/db";

type RecipeWithIngredients = PrismaRecipe & { ingredients: PrismaRecipeIngredient[] };

export function mapRecipeToDto(recipe: RecipeWithIngredients): Recipe {
  return {
    id: recipe.id,
    name: recipe.name,
    type: recipe.type as RecipeType,
    yieldQuantity: recipe.yieldQuantity,
    yieldUnit: recipe.yieldUnit,
    sellingPrice: recipe.sellingPrice,
    ingredients: recipe.ingredients.map((ingredient) => ({
      id: ingredient.id,
      ingredientItemId: ingredient.ingredientItemId,
      ingredientRecipeId: ingredient.ingredientRecipeId,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
    })),
    version: recipe.version,
    effectiveFrom: recipe.effectiveFrom.toISOString(),
    isActive: recipe.isActive,
  };
}
