import { ApiError, type RefreshInput, type LoginResult } from "@platform/contracts";
import { prisma } from "../../../db/client.js";
import { hashToken } from "../../../lib/hashToken.js";
import { userWithRelationsInclude } from "../../users/internal/userWithRelations.js";
import { mapUserToDto } from "../../users/internal/mapUserToDto.js";
import { issueTokenPair } from "./issueTokenPair.js";

/** Rotates a refresh token: the old one is revoked and a new pair issued. */
export async function refreshAccessToken(input: RefreshInput): Promise<LoginResult> {
  const tokenHash = hashToken(input.refreshToken);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw ApiError.unauthorized("Refresh token is invalid or expired");
  }

  const user = await prisma.user.findUnique({
    where: { id: stored.userId },
    include: userWithRelationsInclude,
  });
  if (!user || !user.isActive) {
    throw ApiError.unauthorized("Account is no longer active");
  }

  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });

  // Carry the session's active restaurant and remember-me choice forward —
  // a refresh should never silently reset either (see /auth/select-restaurant
  // for the only place restaurantId is meant to change mid-session).
  const { accessToken, refreshToken } = await issueTokenPair(user, {
    restaurantId: stored.restaurantId,
    rememberMe: stored.rememberMe,
  });

  return {
    accessToken,
    refreshToken,
    rememberMe: stored.rememberMe,
    user: mapUserToDto(user, stored.restaurantId),
  };
}
