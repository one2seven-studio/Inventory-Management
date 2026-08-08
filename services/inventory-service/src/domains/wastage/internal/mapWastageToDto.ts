import type { WastageLog, WastageReason } from "@platform/contracts";
import type { WastageLog as PrismaWastageLog } from "@platform/db";

export function mapWastageToDto(log: PrismaWastageLog): WastageLog {
  return {
    id: log.id,
    itemId: log.itemId,
    locationId: log.locationId,
    station: log.station,
    quantity: log.quantity,
    reason: log.reason as WastageReason,
    costImpact: log.costImpact,
    photoUrl: log.photoUrl,
    userId: log.userId,
    createdAt: log.createdAt.toISOString(),
  };
}
