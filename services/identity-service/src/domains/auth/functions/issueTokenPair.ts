import { prisma } from "../../../db/client.js";
import { config } from "../../../config.js";
import { signAccessToken } from "../../../lib/signAccessToken.js";
import { generateOpaqueToken } from "../../../lib/generateOpaqueToken.js";
import { hashToken } from "../../../lib/hashToken.js";
import type { UserWithRelations } from "../../users/internal/userWithRelations.js";

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface IssueTokenPairOptions {
  /** The session's active restaurant — null if ambiguous (Owner, 2+ restaurants) or nonexistent yet (brand-new Owner). */
  restaurantId: string | null;
  /** Persistent login — see RefreshToken.rememberMe and config.rememberMeRefreshTokenTtlSeconds. */
  rememberMe?: boolean;
}

export async function issueTokenPair(user: UserWithRelations, options: IssueTokenPairOptions): Promise<TokenPair> {
  const roles = user.roles.map((r) => r.role);
  const locationIds = user.locations.map((l) => l.locationId);
  const { restaurantId, rememberMe = false } = options;

  const accessToken = await signAccessToken({
    sub: user.id,
    email: user.email,
    roles,
    locationIds,
    restaurantId,
  });

  const refreshToken = generateOpaqueToken();
  const ttlSeconds = rememberMe ? config.rememberMeRefreshTokenTtlSeconds : config.refreshTokenTtlSeconds;
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      restaurantId,
      rememberMe,
      expiresAt: new Date(Date.now() + ttlSeconds * 1000),
    },
  });

  return { accessToken, refreshToken };
}
