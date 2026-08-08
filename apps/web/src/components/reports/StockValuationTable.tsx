import Link from "next/link";
import type { StockValuationReport } from "@platform/contracts";
import { Warehouse } from "lucide-react";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";
import { formatCurrency } from "@/lib/format/formatCurrency";

export function StockValuationTable({ report }: { report: StockValuationReport }) {
  if (report.lines.length === 0) {
    return (
      <EmptyState
        icon={<Warehouse className="h-6 w-6" aria-hidden="true" />}
        action={
          <Link href="/stock" className="label-caps text-primary hover:underline">
            Receive stock →
          </Link>
        }
      >
        No stock on hand to value.
      </EmptyState>
    );
  }

  return (
    <Table>
      <Thead>
        <tr>
          <Th>Item</Th>
          <Th>Category</Th>
          <Th>On hand</Th>
          <Th>Unit cost</Th>
          <Th>Total value</Th>
        </tr>
      </Thead>
      <tbody>
        {report.lines.map((line) => (
          <Tr key={line.itemId}>
            <Td>{line.itemName}</Td>
            <Td>
              <span className="label-caps rounded bg-surface-container-highest px-1.5 py-0.5 text-on-surface-variant">
                {line.category}
              </span>
            </Td>
            <Td className="font-data-mono">{line.quantityOnHand}</Td>
            <Td className="font-data-mono">{formatCurrency(line.unitCost)}</Td>
            <Td className="font-data-mono">{formatCurrency(line.totalValue)}</Td>
          </Tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="border-t border-outline-variant font-medium">
          <Td colSpan={4}>Grand total</Td>
          <Td className="font-data-mono">{formatCurrency(report.totalValue)}</Td>
        </tr>
      </tfoot>
    </Table>
  );
}
