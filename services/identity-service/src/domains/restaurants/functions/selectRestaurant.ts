import { ApiError, type SelectRestaurantInput, type LoginResult } from "@platform/contracts";
import { prisma } from "../../../db/client.js";
import { userWithRelationsInclude } from "../../users/internal/userWithRelations.js";
import { mapUserToDto } from "../../users/internal/mapUserToDto.js";
import { issueTokenPair } from "../../auth/functions/issueTokenPair.js";
import { listAccessibleRestaurants } from "../internal/listAccessibleRestaurants.js";

/** Switches the session's active restaurant — validates the caller actually has access to it first. */
export async function selectRestaurant(userId: string, input: SelectRestaurantInput): Promise<LoginResult> {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: userWithRelationsInclude });
  if (!user) throw ApiError.notFound(`User ${userId} not found`);

  const accessible = listAccessibleRestaurants(user);
  const restaurant = accessible.find((r) => r.id === input.restaurantId);
  if (!restaurant) throw ApiError.forbidden("You don't have access to that restaurant");

  const { accessToken, refreshToken } = await issueTokenPair(user, {
    restaurantId: restaurant.id,
    rememberMe: input.rememberMe,
  });

  return {
    accessToken,
    refreshToken,
    rememberMe: input.rememberMe,
    user: mapUserToDto(user, restaurant.id),
  };
}
