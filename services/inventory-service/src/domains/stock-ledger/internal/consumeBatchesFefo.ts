import type { Prisma, PrismaClient } from "@platform/db";

type Db = PrismaClient | Prisma.TransactionClient;

/**
 * PRD §3.9 — draws down batches oldest-expiry-first as stock is issued, so
 * batch/expiry data stays accurate from receiving through consumption.
 * Batches without an expiry date are consumed last.
 */
export async function consumeBatchesFefo(db: Db, itemId: string, locationId: string, quantity: number) {
  let remaining = quantity;
  const batches = await db.batch.findMany({
    where: { itemId, locationId, remainingQuantity: { gt: 0 } },
    orderBy: [{ expiryDate: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }],
  });

  for (const batch of batches) {
    if (remaining <= 0) break;
    const consumed = Math.min(batch.remainingQuantity, remaining);
    await db.batch.update({
      where: { id: batch.id },
      data: { remainingQuantity: batch.remainingQuantity - consumed },
    });
    remaining -= consumed;
  }
}
