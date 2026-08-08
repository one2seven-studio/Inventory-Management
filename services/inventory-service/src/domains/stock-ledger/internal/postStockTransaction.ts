import type { Prisma, PrismaClient } from "@platform/db";
import type { StockTransactionType } from "@platform/contracts";

export interface PostStockTransactionArgs {
  itemId: string;
  locationId: string;
  storageAreaId?: string | null;
  type: StockTransactionType;
  quantityDelta: number;
  unitCost?: number | null;
  batchId?: string | null;
  referenceType?: string | null;
  referenceId?: string | null;
  reasonCode?: string | null;
  userId: string;
}

type Db = PrismaClient | Prisma.TransactionClient;

/**
 * Single choke point for every stock movement: upserts the item+location
 * running balance and appends the immutable ledger entry in one place, so
 * `quantityOnHand` and the transaction history can never drift apart.
 */
export async function postStockTransaction(db: Db, args: PostStockTransactionArgs) {
  const stockLevel = await db.stockLevel.upsert({
    where: { itemId_locationId: { itemId: args.itemId, locationId: args.locationId } },
    create: { itemId: args.itemId, locationId: args.locationId, quantityOnHand: args.quantityDelta },
    update: { quantityOnHand: { increment: args.quantityDelta } },
  });

  const transaction = await db.stockTransaction.create({
    data: {
      itemId: args.itemId,
      locationId: args.locationId,
      storageAreaId: args.storageAreaId ?? null,
      type: args.type,
      quantity: args.quantityDelta,
      runningBalance: stockLevel.quantityOnHand,
      unitCost: args.unitCost ?? null,
      batchId: args.batchId ?? null,
      referenceType: args.referenceType ?? null,
      referenceId: args.referenceId ?? null,
      reasonCode: args.reasonCode ?? null,
      userId: args.userId,
    },
  });

  return { stockLevel, transaction };
}
