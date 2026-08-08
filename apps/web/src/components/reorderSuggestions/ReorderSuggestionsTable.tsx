"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { Item, ReorderSuggestion, Supplier } from "@platform/contracts";
import { CircleCheck } from "lucide-react";
import { convertToPoAction, type ConvertToPoActionState } from "@/actions/reorderSuggestions/convertToPo";
import { Button } from "@/components/ui/Button";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";
import { formatCurrency } from "@/lib/format/formatCurrency";

const initialState: ConvertToPoActionState = {};

export function ReorderSuggestionsTable({
  suggestions,
  items,
  suppliers,
  locationId,
  canConvert,
}: {
  suggestions: ReorderSuggestion[];
  items: Item[];
  suppliers: Supplier[];
  locationId: string;
  canConvert: boolean;
}) {
  const [state, formAction, isPending] = useActionState(convertToPoAction, initialState);
  const itemsById = new Map(items.map((item) => [item.id, item]));
  const suppliersById = new Map(suppliers.map((supplier) => [supplier.id, supplier]));

  if (suggestions.length === 0) {
    return (
      <EmptyState
        icon={<CircleCheck className="h-6 w-6" aria-hidden="true" />}
        action={
          <Link href="/stock" className="label-caps text-primary hover:underline">
            View stock levels →
          </Link>
        }
      >
        No reorder suggestions right now — stock is above PAR.
      </EmptyState>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="locationId" value={locationId} />
      <Table>
        <Thead>
          <tr>
            {canConvert ? <Th /> : null}
            <Th>Item</Th>
            <Th>On hand</Th>
            <Th>PAR</Th>
            <Th>Suggested qty</Th>
            <Th>Preferred supplier</Th>
            <Th>Last price</Th>
          </tr>
        </Thead>
        <tbody>
          {suggestions.map((suggestion) => (
            <Tr key={suggestion.itemId}>
              {canConvert ? (
                <Td>
                  <input type="checkbox" name="itemIds" value={suggestion.itemId} defaultChecked className="accent-primary" />
                </Td>
              ) : null}
              <Td>{itemsById.get(suggestion.itemId)?.name ?? suggestion.itemId}</Td>
              <Td className="font-data-mono">{suggestion.quantityOnHand}</Td>
              <Td className="font-data-mono">{suggestion.parLevel}</Td>
              <Td className="font-data-mono font-medium text-primary">{suggestion.suggestedQuantity}</Td>
              <Td>
                {suggestion.preferredSupplierId
                  ? suppliersById.get(suggestion.preferredSupplierId)?.name ?? suggestion.preferredSupplierId
                  : "—"}
              </Td>
              <Td className="font-data-mono">{suggestion.lastPrice != null ? formatCurrency(suggestion.lastPrice) : "—"}</Td>
            </Tr>
          ))}
        </tbody>
      </Table>

      {canConvert ? (
        <div>
          {state.error ? <p className="mb-2 text-sm text-danger">{state.error}</p> : null}
          {state.createdCount != null ? (
            <p className="mb-2 text-sm text-success">
              Created {state.createdCount} purchase order{state.createdCount === 1 ? "" : "s"}.
            </p>
          ) : null}
          <Button type="submit" pending={isPending}>
            {isPending ? "Converting…" : "Convert selected to PO"}
          </Button>
        </div>
      ) : null}
    </form>
  );
}
