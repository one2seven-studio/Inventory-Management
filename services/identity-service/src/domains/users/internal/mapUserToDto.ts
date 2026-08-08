import type { User, Role } from "@platform/contracts";
import type { UserWithRelations } from "./userWithRelations.js";
import { listAccessibleRestaurants } from "../../restaurants/internal/listAccessibleRestaurants.js";
import { mapRestaurantToDto } from "../../restaurants/internal/mapRestaurantToDto.js";

/**
 * `activeRestaurantIdOverride` is the session's *current* restaurant (the JWT
 * claim / auth-context restaurantId) — it can't always be derived from the
 * user row alone, since an Owner's active restaurant is a per-session choice,
 * not a fixed column. Pass it explicitly from login/refresh/getCurrentUser,
 * where a real session exists; omit it everywhere else (createUser,
 * assignRoles, listUsers, ...) and a sensible default is used instead.
 */
export function mapUserToDto(user: UserWithRelations, activeRestaurantIdOverride?: string | null): User {
  const restaurants = listAccessibleRestaurants(user).map(mapRestaurantToDto);
  const restaurantId =
    activeRestaurantIdOverride !== undefined ? activeRestaurantIdOverride : (user.restaurantId ?? restaurants[0]?.id ?? null);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    roles: user.roles.map((r) => r.role as Role),
    locationIds: user.locations.map((l) => l.locationId),
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    restaurantId,
    restaurants,
  };
}
