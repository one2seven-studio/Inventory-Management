import Link from "next/link";
import type { DashboardSummary } from "@platform/contracts";
import { Trash2 } from "lucide-react";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";
import { formatCurrency } from "@/lib/format/formatCurrency";

export function TopWastageList({ items }: { items: DashboardSummary["topWastageItems"] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Trash2 className="h-6 w-6" aria-hidden="true" />}
        action={
          <Link href="/stock" className="label-caps text-primary hover:underline">
            Log wastage on the Stock page →
          </Link>
        }
      >
        No wastage recorded recently.
      </EmptyState>
    );
  }

  return (
    <Table>
      <Thead>
        <tr>
          <Th>Item</Th>
          <Th>Cost impact</Th>
        </tr>
      </Thead>
      <tbody>
        {items.map((item) => (
          <Tr key={item.itemId}>
            <Td>{item.itemName}</Td>
            <Td className="font-data-mono">{formatCurrency(item.costImpact)}</Td>
          </Tr>
        ))}
      </tbody>
    </Table>
  );
}
