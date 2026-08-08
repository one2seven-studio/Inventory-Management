"use client";

import { useActionState } from "react";
import type { Item, Recipe } from "@platform/contracts";
import { createRecipeAction, type CreateRecipeActionState } from "@/actions/recipes/createRecipe";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

const initialState: CreateRecipeActionState = {};

const INGREDIENT_ROWS = 6;

// Standard units always offered, even before any item/recipe references them.
const COMMON_UNITS = [
  "mg",
  "g",
  "kg",
  "ml",
  "l",
  "piece",
  "dozen",
  "oz",
  "lb",
  "cup",
  "tbsp",
  "tsp",
  "pack",
  "box",
  "bag",
  "case",
  "unit",
  "plate",
  "serving",
  "portion",
  "bowl",
  "slice",
];

/** Ingredients can be a raw inventory item OR another sub-recipe — this select lists both. */
export function NewRecipeForm({ items, subRecipes }: { items: Item[]; subRecipes: Recipe[] }) {
  const [state, formAction, isPending] = useActionState(createRecipeAction, initialState);

  // Common baseline units, plus anything already in use anywhere in the system (every
  // item's purchase/stock/recipe UoM and every sub-recipe's yield unit) that isn't
  // already covered — so the ingredient row's unit picker never needs free-typed text.
  const units = Array.from(
    new Set(
      COMMON_UNITS.concat(
        items.flatMap((item) => [item.purchaseUom, item.stockUom, item.recipeUom]),
        subRecipes.map((recipe) => recipe.yieldUnit)
      )
    )
  ).sort();

  return (
    <Card as="form" action={formAction}>
      <p className="mb-3 label-caps text-on-surface">New recipe</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Input name="name" placeholder="Name" required />
        <Select name="type" required defaultValue="">
          <option value="" disabled>
            Type
          </option>
          <option value="MENU_ITEM">Menu item</option>
          <option value="SUB_RECIPE">Sub-recipe</option>
        </Select>
        <Input name="yieldQuantity" type="number" step="any" min={0} placeholder="Yield quantity" required />
        <Select name="yieldUnit" required defaultValue="">
          <option value="" disabled>
            Yield unit
          </option>
          {units.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </Select>
        <Input name="sellingPrice" type="number" step="any" min={0} placeholder="Selling price (optional)" />
      </div>

      <p className="mt-4 mb-2 label-caps text-on-surface-variant">Ingredients</p>
      <div className="flex flex-col gap-2">
        {Array.from({ length: INGREDIENT_ROWS }).map((_, index) => (
          <div key={index} className="grid grid-cols-3 gap-2">
            <Select name="ingredientRef" defaultValue="" className="sm:col-span-1">
              <option value="">— Ingredient —</option>
              <optgroup label="Items">
                {items.map((item) => (
                  <option key={item.id} value={`item:${item.id}`}>
                    {item.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Sub-recipes">
                {subRecipes.map((recipe) => (
                  <option key={recipe.id} value={`recipe:${recipe.id}`}>
                    {recipe.name}
                  </option>
                ))}
              </optgroup>
            </Select>
            <Input name="ingredientQuantity" type="number" step="any" min={0} placeholder="Quantity" />
            <Select name="ingredientUnit" defaultValue="">
              <option value="">Unit</option>
              {units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </Select>
          </div>
        ))}
      </div>

      {state.error ? <p className="mt-2 text-sm text-danger">{state.error}</p> : null}
      <Button type="submit" pending={isPending} className="mt-3">
        {isPending ? "Creating…" : "Create recipe"}
      </Button>
    </Card>
  );
}
