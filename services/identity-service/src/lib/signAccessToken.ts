import { SignJWT } from "jose";
import { config } from "../config.js";
import type { AccessTokenClaims } from "@platform/contracts";

export async function signAccessToken(claims: AccessTokenClaims): Promise<string> {
  const secret = new TextEncoder().encode(config.jwtAccessSecret);
  return new SignJWT({
    email: claims.email,
    roles: claims.roles,
    locationIds: claims.locationIds,
    restaurantId: claims.restaurantId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(`${config.accessTokenTtlSeconds}s`)
    .sign(secret);
}
