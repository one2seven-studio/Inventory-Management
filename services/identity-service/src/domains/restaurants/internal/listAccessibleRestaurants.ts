import type { Restaurant as PrismaRestaurant } from "@platform/db";
import type { UserWithRelations } from "../../users/internal/userWithRelations.js";

/** Every restaurant a user can pick as their active one: all owned ones for an Owner, or their single assigned one otherwise. */
export function listAccessibleRestaurants(user: UserWithRelations): PrismaRestaurant[] {
  const isOwner = user.roles.some((r) => r.role === "OWNER");
  if (isOwner) return user.ownedRestaurants;
  return user.restaurant ? [user.restaurant] : [];
}
