import type { Batch } from "@platform/contracts";
import type { Batch as PrismaBatch } from "@platform/db";

export function mapBatchToDto(batch: PrismaBatch): Batch {
  return {
    id: batch.id,
    itemId: batch.itemId,
    locationId: batch.locationId,
    batchNumber: batch.batchNumber,
    expiryDate: batch.expiryDate ? batch.expiryDate.toISOString() : null,
    receivedQuantity: batch.receivedQuantity,
    remainingQuantity: batch.remainingQuantity,
    unitCost: batch.unitCost,
    createdAt: batch.createdAt.toISOString(),
  };
}
