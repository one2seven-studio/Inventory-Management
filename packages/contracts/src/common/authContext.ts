import { z } from "zod";
import { ROLES } from "./roles.js";

/**
 * The trusted identity the gateway attaches to every proxied request
 * (as headers) after verifying the caller's JWT. Downstream services
 * read this instead of re-verifying the token themselves.
 */
export const authContextSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  roles: z.array(z.enum(ROLES)),
  locationIds: z.array(z.string()),
  /** The session's active restaurant — null until one is picked (see /auth/select-restaurant). */
  restaurantId: z.string().nullable(),
});

export type AuthContext = z.infer<typeof authContextSchema>;

export const AUTH_HEADER = {
  USER_ID: "x-user-id",
  EMAIL: "x-user-email",
  ROLES: "x-user-roles",
  LOCATION_IDS: "x-user-locations",
  RESTAURANT_ID: "x-restaurant-id",
} as const;
