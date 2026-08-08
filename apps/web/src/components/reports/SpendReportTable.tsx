import type { SpendReportLine } from "@platform/contracts";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";
import { formatCurrency } from "@/lib/format/formatCurrency";

export function SpendReportTable({ lines }: { lines: SpendReportLine[] }) {
  if (lines.length === 0) {
    return <EmptyState>No spend recorded in this date range — try widening the range above.</EmptyState>;
  }

  const total = lines.reduce((sum, line) => sum + line.totalSpend, 0);

  return (
    <Table>
      <Thead>
        <tr>
          <Th>Supplier</Th>
          <Th>Total spend</Th>
        </tr>
      </Thead>
      <tbody>
        {lines.map((line) => (
          <Tr key={line.groupKey}>
            <Td>{line.groupLabel}</Td>
            <Td className="font-data-mono">{formatCurrency(line.totalSpend)}</Td>
          </Tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="border-t border-outline-variant font-medium">
          <Td>Total</Td>
          <Td className="font-data-mono">{formatCurrency(total)}</Td>
        </tr>
      </tfoot>
    </Table>
  );
}
