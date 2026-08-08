import { ApiError } from "@platform/contracts";
import { prisma } from "../../../db/client.js";
import type { Recipe as PrismaRecipe, RecipeIngredient as PrismaRecipeIngredient } from "@platform/db";

export type RecipeWithIngredients = PrismaRecipe & { ingredients: PrismaRecipeIngredient[] };

const withIngredients = { include: { ingredients: true } } as const;

/**
 * Recipe versioning (PRD §3.6): editing a recipe never mutates the row in
 * place — it inserts a new row (version N+1) sharing the same
 * `recipeGroupId` and flips the old row's `isActive` to false. Any id a
 * caller holds (from an earlier `getRecipeById`, a POS system's stored
 * `recipeId`, etc.) may therefore point at a now-superseded version.
 *
 * For MVP, every operation that *uses* a recipe (costing, stock deduction,
 * editing, archiving) resolves to the group's currently-active version
 * rather than the literal row the id happens to point at — this keeps
 * consumption/costing accurate as of "now" without callers needing to track
 * version churn themselves. (Only `getRecipeById` returns the literal row,
 * for inspecting specific historical versions.)
 */
export async function resolveActiveRecipe(id: string): Promise<RecipeWithIngredients> {
  const row = await prisma.recipe.findUnique({ where: { id }, ...withIngredients });
  if (!row) throw ApiError.notFound(`Recipe ${id} not found`);
  if (row.isActive) return row;

  const active = await prisma.recipe.findFirst({
    where: { recipeGroupId: row.recipeGroupId, isActive: true },
    ...withIngredients,
  });
  if (!active) throw ApiError.notFound(`Recipe ${id} has no currently-active version`);
  return active;
}
