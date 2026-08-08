import type { Restaurant } from "@platform/contracts";
import type { Restaurant as PrismaRestaurant } from "@platform/db";

export function mapRestaurantToDto(restaurant: PrismaRestaurant): Restaurant {
  return {
    id: restaurant.id,
    name: restaurant.name,
    ownerUserId: restaurant.ownerUserId,
    isActive: restaurant.isActive,
    createdAt: restaurant.createdAt.toISOString(),
  };
}
