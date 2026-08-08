import type { PoStatus, PurchaseOrder } from "@platform/contracts";
import type {
  PurchaseOrder as PrismaPurchaseOrder,
  PurchaseOrderLine as PrismaPurchaseOrderLine,
  PurchaseOrderStatusEvent as PrismaPurchaseOrderStatusEvent,
} from "@platform/db";

export type PrismaPurchaseOrderWithRelations = PrismaPurchaseOrder & {
  lines: PrismaPurchaseOrderLine[];
  statusHistory: PrismaPurchaseOrderStatusEvent[];
};

export function mapPurchaseOrderToDto(po: PrismaPurchaseOrderWithRelations): PurchaseOrder {
  return {
    id: po.id,
    poNumber: po.poNumber,
    supplierId: po.supplierId,
    locationId: po.locationId,
    status: po.status as PoStatus,
    lines: po.lines.map((line) => ({
      id: line.id,
      itemId: line.itemId,
      quantityOrdered: line.quantityOrdered,
      unitPrice: line.unitPrice,
      quantityReceived: line.quantityReceived,
    })),
    totalAmount: po.totalAmount,
    createdByUserId: po.createdByUserId,
    approvedByUserId: po.approvedByUserId,
    createdAt: po.createdAt.toISOString(),
    statusHistory: po.statusHistory
      .slice()
      .sort((a, b) => a.at.getTime() - b.at.getTime())
      .map((event) => ({
        status: event.status as PoStatus,
        at: event.at.toISOString(),
        byUserId: event.byUserId,
      })),
  };
}
