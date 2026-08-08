import type { Prisma } from "@platform/db";

export const userWithRelationsInclude = {
  roles: true,
  locations: true,
} satisfies Prisma.UserInclude;

export type UserWithRelations = Prisma.UserGetPayload<{ include: typeof userWithRelationsInclude }>;
