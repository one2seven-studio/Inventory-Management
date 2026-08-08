import { z } from "zod";

export const restaurantSchema = z.object({
  id: z.string(),
  name: z.string(),
  ownerUserId: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
});
export type Restaurant = z.infer<typeof restaurantSchema>;

export const createRestaurantInputSchema = z.object({
  name: z.string().min(1),
  /** Carried forward from the caller's current session so switching/creating a restaurant never resets remember-me. */
  rememberMe: z.boolean().optional().default(false),
});
export type CreateRestaurantInput = z.infer<typeof createRestaurantInputSchema>;

export const selectRestaurantInputSchema = z.object({
  restaurantId: z.string().min(1),
  rememberMe: z.boolean().optional().default(false),
});
export type SelectRestaurantInput = z.infer<typeof selectRestaurantInputSchema>;
