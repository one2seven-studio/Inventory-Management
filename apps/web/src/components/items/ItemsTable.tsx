import type { Item, ItemStatus } from "@platform/contracts";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/format/formatCurrency";

const STATUS_TONE: Record<ItemStatus, BadgeTone> = {
  ACTIVE: "success",
  INACTIVE: "neutral",
  DISCONTINUED: "danger",
};

export function ItemsTable({ items }: { items: Item[] }) {
  if (items.length === 0) {
    return <EmptyState>No items yet — add one above.</EmptyState>;
  }

  return (
    <Table>
      <Thead>
        <tr>
          <Th>SKU</Th>
          <Th>Name</Th>
          <Th>Category</Th>
          <Th>Stock UoM</Th>
          <Th>Avg. cost</Th>
          <Th>Perishable</Th>
          <Th>Status</Th>
        </tr>
      </Thead>
      <tbody>
        {items.map((item) => (
          <Tr key={item.id}>
            <Td className="font-data-mono text-xs">{item.sku}</Td>
            <Td className="font-medium">{item.name}</Td>
            <Td className="text-on-surface-variant">{item.category}</Td>
            <Td className="font-data-mono">{item.stockUom}</Td>
            <Td className="font-data-mono">{item.averageCost != null ? formatCurrency(item.averageCost) : "—"}</Td>
            <Td>
              <Badge tone={item.isPerishable ? "warning" : "neutral"}>{item.isPerishable ? "Yes" : "No"}</Badge>
            </Td>
            <Td>
              <Badge tone={STATUS_TONE[item.status]}>{item.status}</Badge>
            </Td>
          </Tr>
        ))}
      </tbody>
    </Table>
  );
}
