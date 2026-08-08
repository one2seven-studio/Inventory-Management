import { ApiError, type CreateRestaurantInput, type LoginResult } from "@platform/contracts";
import { prisma } from "../../../db/client.js";
import { userWithRelationsInclude } from "../../users/internal/userWithRelations.js";
import { mapUserToDto } from "../../users/internal/mapUserToDto.js";
import { issueTokenPair } from "../../auth/functions/issueTokenPair.js";

/**
 * Creates a restaurant owned by the caller and immediately switches the
 * session into it (issues a new token pair scoped to the new restaurant),
 * so an Owner lands in a usable dashboard right away instead of needing an
 * extra select-restaurant round trip. `rememberMe` carries forward from the
 * caller's current session so creating a restaurant never resets it.
 */
export async function createRestaurant(ownerUserId: string, input: CreateRestaurantInput): Promise<LoginResult> {
  const restaurant = await prisma.restaurant.create({
    data: { name: input.name, ownerUserId },
  });

  const user = await prisma.user.findUnique({ where: { id: ownerUserId }, include: userWithRelationsInclude });
  if (!user) throw ApiError.notFound(`User ${ownerUserId} not found`);

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
