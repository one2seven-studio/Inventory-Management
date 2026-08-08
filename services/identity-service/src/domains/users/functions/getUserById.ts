import { ApiError, type User } from "@platform/contracts";
import { prisma } from "../../../db/client.js";
import { userWithRelationsInclude } from "../internal/userWithRelations.js";
import { mapUserToDto } from "../internal/mapUserToDto.js";

export interface GetUserByIdOptions {
  /** Overrides the DTO's `restaurantId` with the caller's own session claim — only meaningful for self-lookups (/auth/me). */
  activeRestaurantId?: string | null;
  /** Tenant boundary for admin lookups (/users/:id) — 404s (not 403, to avoid confirming the id exists elsewhere) if the target user isn't staff of this restaurant. */
  requireRestaurantId?: string;
}

export async function getUserById(id: string, options: GetUserByIdOptions = {}): Promise<User> {
  const user = await prisma.user.findUnique({ where: { id }, include: userWithRelationsInclude });
  if (!user) throw ApiError.notFound(`User ${id} not found`);
  if (options.requireRestaurantId && user.restaurantId !== options.requireRestaurantId) {
    throw ApiError.notFound(`User ${id} not found`);
  }
  return mapUserToDto(user, options.activeRestaurantId);
}
