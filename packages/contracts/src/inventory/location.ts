import { z } from "zod";

export const locationTypeSchema = z.enum(["BRANCH", "CENTRAL_KITCHEN", "WAREHOUSE"]);
export type LocationType = z.infer<typeof locationTypeSchema>;

export const storageAreaTypeSchema = z.enum([
  "DRY_STORE",
  "WALK_IN_COOLER",
  "FREEZER",
  "BAR",
  "KITCHEN",
  "OTHER",
]);
export type StorageAreaType = z.infer<typeof storageAreaTypeSchema>;

export const locationSchema = z.object({
  id: z.string(),
  restaurantId: z.string(),
  name: z.string(),
  type: locationTypeSchema,
  address: z.string().nullable(),
  isActive: z.boolean(),
});
export type Location = z.infer<typeof locationSchema>;

export const createLocationInputSchema = z.object({
  name: z.string().min(1),
  type: locationTypeSchema,
  address: z.string().optional(),
});
export type CreateLocationInput = z.infer<typeof createLocationInputSchema>;

export const storageAreaSchema = z.object({
  id: z.string(),
  locationId: z.string(),
  name: z.string(),
  type: storageAreaTypeSchema,
});
export type StorageArea = z.infer<typeof storageAreaSchema>;

export const createStorageAreaInputSchema = z.object({
  locationId: z.string(),
  name: z.string().min(1),
  type: storageAreaTypeSchema,
});
export type CreateStorageAreaInput = z.infer<typeof createStorageAreaInputSchema>;
