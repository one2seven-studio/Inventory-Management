import { ApiError, type LoginInput, type LoginResult } from "@platform/contracts";
import { prisma } from "../../../db/client.js";
import { verifyPassword } from "../../../lib/verifyPassword.js";
import { userWithRelationsInclude } from "../../users/internal/userWithRelations.js";
import { mapUserToDto } from "../../users/internal/mapUserToDto.js";
import { listAccessibleRestaurants } from "../../restaurants/internal/listAccessibleRestaurants.js";
import { issueTokenPair } from "./issueTokenPair.js";

export async function login(input: LoginInput): Promise<LoginResult> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: userWithRelationsInclude,
  });

  if (!user || !user.isActive) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const passwordMatches = await verifyPassword(input.password, user.passwordHash);
  if (!passwordMatches) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  // Auto-select the active restaurant when it's unambiguous (exactly one
  // accessible); otherwise leave it unset. The web app sends the caller to
  // a restaurant picker (2+ accessible) or first-restaurant onboarding (0)
  // instead of the dashboard when restaurantId comes back null.
  const accessible = listAccessibleRestaurants(user);
  const restaurantId = accessible.length === 1 ? (accessible[0]?.id ?? null) : null;

  const { accessToken, refreshToken } = await issueTokenPair(user, { restaurantId, rememberMe: input.rememberMe });

  return { accessToken, refreshToken, rememberMe: input.rememberMe, user: mapUserToDto(user, restaurantId) };
}
