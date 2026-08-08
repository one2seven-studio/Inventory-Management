import { z } from "zod";
import { ROLES } from "../common/roles.js";
import { restaurantSchema } from "./restaurant.js";

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  roles: z.array(z.enum(ROLES)),
  locationIds: z.array(z.string()),
  isActive: z.boolean(),
  createdAt: z.string(),
  /** The session's currently-active restaurant — null until one is picked (see /auth/select-restaurant). */
  restaurantId: z.string().nullable(),
  /** Every restaurant this user can pick: owned ones for an Owner, or their single assigned one otherwise. */
  restaurants: z.array(restaurantSchema),
});
export type User = z.infer<typeof userSchema>;

export const createUserInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  roles: z.array(z.enum(ROLES)).min(1),
  locationIds: z.array(z.string()).default([]),
});
export type CreateUserInput = z.infer<typeof createUserInputSchema>;

export const assignRolesInputSchema = z.object({
  roles: z.array(z.enum(ROLES)).min(1),
});
export type AssignRolesInput = z.infer<typeof assignRolesInputSchema>;

/** Self-service profile edit — every field optional, only supplied ones change. */
export const updateProfileInputSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>;

export const changePasswordInputSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});
export type ChangePasswordInput = z.infer<typeof changePasswordInputSchema>;
