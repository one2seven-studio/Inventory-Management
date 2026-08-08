import type { FastifyReply, FastifyRequest } from "fastify";
import { AUTH_HEADER, type AccessTokenClaims } from "@platform/contracts";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
]);

/**
 * Forwards a request to a downstream service, replacing any client-supplied
 * identity headers with the ones derived from the gateway's own verified
 * JWT — so a service can trust x-user-* headers unconditionally.
 */
export async function proxyRequest(
  request: FastifyRequest,
  reply: FastifyReply,
  targetBaseUrl: string,
  targetPath: string,
  authContext: AccessTokenClaims | null
) {
  const url = new URL(targetPath, targetBaseUrl);
  if (request.query && typeof request.query === "object") {
    for (const [key, value] of Object.entries(request.query as Record<string, unknown>)) {
      if (typeof value === "string") url.searchParams.set(key, value);
    }
  }

  const headers = new Headers();
  for (const [key, value] of Object.entries(request.headers)) {
    const lowerKey = key.toLowerCase();
    // Strips any client-supplied x-user-*/x-restaurant-id — a caller could
    // otherwise spoof its own trusted identity headers, since only the ones
    // set below (derived from the gateway's own verified JWT) may be trusted.
    const isSpoofableIdentityHeader = lowerKey.startsWith("x-user-") || lowerKey === AUTH_HEADER.RESTAURANT_ID;
    if (typeof value === "string" && !HOP_BY_HOP_HEADERS.has(lowerKey) && !isSpoofableIdentityHeader) {
      headers.set(key, value);
    }
  }

  if (authContext) {
    headers.set(AUTH_HEADER.USER_ID, authContext.sub);
    headers.set(AUTH_HEADER.EMAIL, authContext.email);
    headers.set(AUTH_HEADER.ROLES, authContext.roles.join(","));
    headers.set(AUTH_HEADER.LOCATION_IDS, authContext.locationIds.join(","));
    if (authContext.restaurantId) {
      headers.set(AUTH_HEADER.RESTAURANT_ID, authContext.restaurantId);
    }
  }

  const hasBody = !["GET", "HEAD"].includes(request.method);
  const upstreamResponse = await fetch(url, {
    method: request.method,
    headers,
    body: hasBody && request.body !== undefined ? JSON.stringify(request.body) : undefined,
  });

  const responseText = await upstreamResponse.text();
  reply.code(upstreamResponse.status);
  reply.header("content-type", upstreamResponse.headers.get("content-type") ?? "application/json");
  return responseText;
}
