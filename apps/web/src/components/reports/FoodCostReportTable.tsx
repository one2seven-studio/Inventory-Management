import Link from "next/link";
import type { FoodCostReportLine } from "@platform/contracts";
import { BookOpen } from "lucide-react";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";
import { formatCurrency } from "@/lib/format/formatCurrency";

export function FoodCostReportTable({ lines }: { lines: FoodCostReportLine[] }) {
  if (lines.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen className="h-6 w-6" aria-hidden="true" />}
        action={
          <Link href="/recipes" className="label-caps text-primary hover:underline">
            Create a recipe →
          </Link>
        }
      >
        No recipes to report on yet.
      </EmptyState>
    );
  }

  return (
    <Table>
      <Thead>
        <tr>
          <Th>Recipe</Th>
          <Th>Plate cost</Th>
          <Th>Selling price</Th>
          <Th>Food cost %</Th>
        </tr>
      </Thead>
      <tbody>
        {lines.map((line) => (
          <Tr key={line.recipeId}>
            <Td>{line.recipeName}</Td>
            <Td className="font-data-mono">{formatCurrency(line.plateCost)}</Td>
            <Td className="font-data-mono">{line.sellingPrice != null ? formatCurrency(line.sellingPrice) : "—"}</Td>
            <Td className="font-data-mono">{line.foodCostPercent != null ? `${line.foodCostPercent.toFixed(1)}%` : "—"}</Td>
          </Tr>
        ))}
      </tbody>
    </Table>
  );
}
