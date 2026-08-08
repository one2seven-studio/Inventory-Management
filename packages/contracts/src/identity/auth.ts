import { z } from "zod";
import { userSchema } from "./user.js";

export const loginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  /** Persistent login: a long-lived refresh cookie that survives closing the browser, not just this tab session. */
  rememberMe: z.boolean().optional().default(false),
});
export type LoginInput = z.infer<typeof loginInputSchema>;

export const loginResultSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  /** Echoed back so the web session layer knows how to persist the refresh cookie without tracking it separately. */
  rememberMe: z.boolean(),
  user: userSchema,
});
export type LoginResult = z.infer<typeof loginResultSchema>;

export const refreshInputSchema = z.object({
  refreshToken: z.string().min(1),
});
export type RefreshInput = z.infer<typeof refreshInputSchema>;

export const accessTokenClaimsSchema = z.object({
  sub: z.string(),
  email: z.string().email(),
  roles: z.array(z.string()),
  locationIds: z.array(z.string()),
  restaurantId: z.string().nullable(),
});
export type AccessTokenClaims = z.infer<typeof accessTokenClaimsSchema>;
