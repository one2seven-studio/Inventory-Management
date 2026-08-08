import Link from "next/link";
import type { Item, WastageLog } from "@platform/contracts";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";
import { formatCurrency } from "@/lib/format/formatCurrency";

export function WastageTable({ logs, items }: { logs: WastageLog[]; items: Item[] }) {
  const itemsById = new Map(items.map((item) => [item.id, item]));

  if (logs.length === 0) {
    return (
      <EmptyState
        icon={<Trash2 className="h-6 w-6" aria-hidden="true" />}
        action={
          <Link href="/stock" className="label-caps text-primary hover:underline">
            Log wastage on the Stock page →
          </Link>
        }
      >
        No wastage logged for this location yet.
      </EmptyState>
    );
  }

  return (
    <Table>
      <Thead>
        <tr>
          <Th>Item</Th>
          <Th>Quantity</Th>
          <Th>Reason</Th>
          <Th>Cost impact</Th>
          <Th>Station</Th>
          <Th>Logged</Th>
        </tr>
      </Thead>
      <tbody>
        {logs.map((log) => (
          <Tr key={log.id}>
            <Td>{itemsById.get(log.itemId)?.name ?? log.itemId}</Td>
            <Td className="font-data-mono">{log.quantity}</Td>
            <Td>
              <Badge tone="danger">{log.reason.replaceAll("_", " ")}</Badge>
            </Td>
            <Td className="font-data-mono">{formatCurrency(log.costImpact)}</Td>
            <Td>{log.station ?? "—"}</Td>
            <Td className="text-xs text-on-surface-variant">{new Date(log.createdAt).toLocaleString()}</Td>
          </Tr>
        ))}
      </tbody>
    </Table>
  );
}
