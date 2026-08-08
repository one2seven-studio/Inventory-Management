import Link from "next/link";
import type { Recipe, RecipeCost } from "@platform/contracts";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";
import { formatCurrency } from "@/lib/format/formatCurrency";

export function RecipesTable({ recipes, costsById }: { recipes: Recipe[]; costsById: Map<string, RecipeCost> }) {
  if (recipes.length === 0) {
    return <EmptyState>No recipes yet — add one above.</EmptyState>;
  }

  return (
    <Table>
      <Thead>
        <tr>
          <Th>Name</Th>
          <Th>Type</Th>
          <Th>Yield</Th>
          <Th>Plate cost</Th>
          <Th>Food cost %</Th>
        </tr>
      </Thead>
      <tbody>
        {recipes.map((recipe) => {
          const cost = costsById.get(recipe.id);
          return (
            <Tr key={recipe.id}>
              <Td>
                <Link href={`/recipes/${recipe.id}`} className="font-medium text-primary transition-colors hover:underline">
                  {recipe.name}
                </Link>
              </Td>
              <Td className="text-on-surface-variant">{recipe.type.replaceAll("_", " ")}</Td>
              <Td className="font-data-mono">
                {recipe.yieldQuantity} {recipe.yieldUnit}
              </Td>
              <Td className="font-data-mono">{cost ? formatCurrency(cost.plateCost) : "—"}</Td>
              <Td className="font-data-mono">{cost?.foodCostPercent != null ? `${cost.foodCostPercent.toFixed(1)}%` : "—"}</Td>
            </Tr>
          );
        })}
      </tbody>
    </Table>
  );
}
