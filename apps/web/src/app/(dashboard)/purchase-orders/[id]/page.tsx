import Link from "next/link";
import { notFound } from "next/navigation";
import type { Item, PurchaseOrder, Supplier } from "@platform/contracts";
import { roleHasCapability } from "@platform/contracts";
import { getAuthedGatewayClient } from "@/lib/api/getAuthedGatewayClient";
import { getCurrentUser } from "@/lib/session/getCurrentUser";
import { PoStatusBadge } from "@/components/purchaseOrders/PoStatusBadge";
import { ApproveRejectForm } from "@/components/purchaseOrders/ApproveRejectForm";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/Table";
import { formatCurrency } from "@/lib/format/formatCurrency";

const RECEIVABLE_STATUSES = ["SENT", "CONFIRMED", "PARTIALLY_RECEIVED"];
const APPROVABLE_STATUSES = ["DRAFT", "PENDING_APPROVAL"];

export default async function PurchaseOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [client, user] = await Promise.all([getAuthedGatewayClient(), getCurrentUser()]);

  let po: PurchaseOrder;
  try {
    po = await client.get<PurchaseOrder>(`/purchasing/purchase-orders/${id}`);
  } catch {
    notFound();
  }

  const [suppliers, items] = await Promise.all([
    client.get<Supplier[]>("/purchasing/suppliers"),
    client.get<Item[]>("/inventory/items"),
  ]);
  const itemsById = new Map(items.map((item) => [item.id, item]));
  const supplier = suppliers.find((s) => s.id === po.supplierId);

  const canApprove = user?.roles.some((role) => roleHasCapability(role, "APPROVE_PURCHASE_ORDER")) ?? false;
  const canReceive = user?.roles.some((role) => roleHasCapability(role, "RECEIVE_GOODS")) ?? false;

  return (
    <div className="flex animate-fade-in-up flex-col gap-6">
      <div>
        <Link href="/purchase-orders" className="text-sm text-primary transition-colors hover:underline">
          ← Purchase orders
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="font-headline text-2xl font-bold text-on-surface">{po.poNumber}</h1>
          <PoStatusBadge status={po.status} />
        </div>
        <p className="text-sm text-on-surface-variant">Supplier: {supplier?.name ?? po.supplierId}</p>
      </div>

      <Table>
        <Thead>
          <tr>
            <Th>Item</Th>
            <Th>Ordered</Th>
            <Th>Received</Th>
            <Th>Unit price</Th>
            <Th>Line total</Th>
          </tr>
        </Thead>
        <tbody>
          {po.lines.map((line) => (
            <Tr key={line.id}>
              <Td>{itemsById.get(line.itemId)?.name ?? line.itemId}</Td>
              <Td className="font-data-mono">{line.quantityOrdered}</Td>
              <Td className="font-data-mono">{line.quantityReceived}</Td>
              <Td className="font-data-mono">{formatCurrency(line.unitPrice)}</Td>
              <Td className="font-data-mono">{formatCurrency(line.quantityOrdered * line.unitPrice)}</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
      <p className="text-right text-sm font-medium text-on-surface">
        Total: <span className="font-data-mono">{formatCurrency(po.totalAmount)}</span>
      </p>

      {canApprove && APPROVABLE_STATUSES.includes(po.status) ? <ApproveRejectForm poId={po.id} /> : null}

      {canReceive && RECEIVABLE_STATUSES.includes(po.status) ? (
        <Link
          href={`/purchase-orders/${po.id}/receive`}
          className="inline-flex w-fit items-center justify-center rounded bg-primary-container px-4 py-1.5 font-data-mono text-xs font-bold uppercase tracking-wide text-on-primary-container transition-colors duration-150 hover:brightness-110 active:scale-[0.98]"
        >
          Receive goods
        </Link>
      ) : null}
    </div>
  );
}
