import type { Prisma } from "@platform/db";

export const userWithRelationsInclude = {
  roles: true,
  locations: true,
  // Staff's single home restaurant, and every restaurant an Owner owns —
  // see mapUserToDto.js's listAccessibleRestaurants for how these combine.
  restaurant: true,
  ownedRestaurants: true,
} satisfies Prisma.UserInclude;

export type UserWithRelations = Prisma.UserGetPayload<{ include: typeof userWithRelationsInclude }>;
