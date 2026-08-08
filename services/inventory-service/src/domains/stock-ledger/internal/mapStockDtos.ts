import type { StockLevel, StockTransaction, StockTransactionType } from "@platform/contracts";
import type { StockLevel as PrismaStockLevel, StockTransaction as PrismaStockTransaction } from "@platform/db";

export function mapStockLevelToDto(level: PrismaStockLevel): StockLevel {
  return {
    itemId: level.itemId,
    locationId: level.locationId,
    storageAreaId: null,
    quantityOnHand: level.quantityOnHand,
    parLevel: level.parLevel,
    minLevel: level.minLevel,
    maxLevel: level.maxLevel,
  };
}

export function mapStockTransactionToDto(tx: PrismaStockTransaction): StockTransaction {
  return {
    id: tx.id,
    itemId: tx.itemId,
    locationId: tx.locationId,
    storageAreaId: tx.storageAreaId,
    type: tx.type as StockTransactionType,
    quantity: tx.quantity,
    runningBalance: tx.runningBalance,
    unitCost: tx.unitCost,
    batchId: tx.batchId,
    referenceType: tx.referenceType,
    referenceId: tx.referenceId,
    reasonCode: tx.reasonCode,
    userId: tx.userId,
    createdAt: tx.createdAt.toISOString(),
  };
}
