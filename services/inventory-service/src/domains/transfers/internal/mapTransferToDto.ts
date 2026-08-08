import type { StockTransferRequest, TransferStatus } from "@platform/contracts";
import type { StockTransferRequest as PrismaTransfer } from "@platform/db";

export function mapTransferToDto(transfer: PrismaTransfer): StockTransferRequest {
  return {
    id: transfer.id,
    itemId: transfer.itemId,
    sourceLocationId: transfer.sourceLocationId,
    destinationLocationId: transfer.destinationLocationId,
    requestedQuantity: transfer.requestedQuantity,
    dispatchedQuantity: transfer.dispatchedQuantity,
    receivedQuantity: transfer.receivedQuantity,
    status: transfer.status as TransferStatus,
    requestedByUserId: transfer.requestedByUserId,
    approvedByUserId: transfer.approvedByUserId,
    createdAt: transfer.createdAt.toISOString(),
  };
}
