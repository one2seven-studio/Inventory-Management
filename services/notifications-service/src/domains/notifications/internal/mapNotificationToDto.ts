import type { Notification, NotificationType } from "@platform/contracts";
import type { Notification as PrismaNotification } from "@platform/db";

export function mapNotificationToDto(row: PrismaNotification): Notification {
  return {
    id: row.id,
    type: row.type as NotificationType,
    title: row.title,
    message: row.message,
    targetUserId: row.targetUserId,
    targetRoles: row.targetRoles,
    locationId: row.locationId,
    isRead: row.isRead,
    createdAt: row.createdAt.toISOString(),
  };
}
