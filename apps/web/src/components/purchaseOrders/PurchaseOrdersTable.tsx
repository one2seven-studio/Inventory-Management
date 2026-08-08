import Link from "next/link";
import type { PurchaseOrder, Supplier } from "@platform/contracts";
import { PackageSearch } from "lucide-react";
import { PoStatusBadge } from "./PoStatusBadge";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/Table";
import { formatCurrency } from "@/lib/format/formatCurrency";

export function PurchaseOrdersTable({
  purchaseOrders,
  suppliers,
}: {
  purchaseOrders: PurchaseOrder[];
  suppliers: Supplier[];
}) {
  const suppliersById = new Map(suppliers.map((supplier) => [supplier.id, supplier]));

  if (purchaseOrders.length === 0) {
    return (
      <EmptyState
        icon={<PackageSearch className="h-6 w-6" aria-hidden="true" />}
        action={
          <Link href="/purchase-orders" className="label-caps text-primary hover:underline">
            Clear filters →
          </Link>
        }
      >
        No purchase orders match these filters.
      </EmptyState>
    );
  }

  return (
    <Table>
      <Thead>
        <tr>
          <Th>PO #</Th>
          <Th>Supplier</Th>
          <Th>Lines</Th>
          <Th>Total</Th>
          <Th>Status</Th>
          <Th>Created</Th>
        </tr>
      </Thead>
      <tbody>
        {purchaseOrders.map((po) => (
          <Tr key={po.id}>
            <Td className="font-data-mono">
              <Link href={`/purchase-orders/${po.id}`} className="font-medium text-primary transition-colors hover:underline">
                {po.poNumber}
              </Link>
            </Td>
            <Td>{suppliersById.get(po.supplierId)?.name ?? po.supplierId}</Td>
            <Td className="font-data-mono">{po.lines.length}</Td>
            <Td className="font-data-mono">{formatCurrency(po.totalAmount)}</Td>
            <Td>
              <PoStatusBadge status={po.status} />
            </Td>
            <Td className="text-xs text-on-surface-variant">{new Date(po.createdAt).toLocaleDateString()}</Td>
          </Tr>
        ))}
      </tbody>
    </Table>
  );
}
