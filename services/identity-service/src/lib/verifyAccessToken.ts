import { jwtVerify } from "jose";
import { config } from "../config.js";
import { accessTokenClaimsSchema, type AccessTokenClaims } from "@platform/contracts";

export async function verifyAccessToken(token: string): Promise<AccessTokenClaims> {
  const secret = new TextEncoder().encode(config.jwtAccessSecret);
  const { payload } = await jwtVerify(token, secret);
  return accessTokenClaimsSchema.parse({
    sub: payload.sub,
    email: payload.email,
    roles: payload.roles,
    locationIds: payload.locationIds,
    restaurantId: payload.restaurantId ?? null,
  });
}
