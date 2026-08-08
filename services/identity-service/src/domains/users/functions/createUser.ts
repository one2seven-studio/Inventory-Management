import { ApiError, type CreateUserInput, type User } from "@platform/contracts";
import { prisma } from "../../../db/client.js";
import { hashPassword } from "../../../lib/hashPassword.js";
import { userWithRelationsInclude } from "../internal/userWithRelations.js";
import { mapUserToDto } from "../internal/mapUserToDto.js";

/**
 * PRD §3.16 — create a staff user with an initial role set and location
 * scope. `restaurantId` is always the caller's own active restaurant (from
 * their auth context, not client input) — an Owner can only add staff to
 * the restaurant they're currently acting as.
 */
export async function createUser(input: CreateUserInput, restaurantId: string): Promise<User> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw ApiError.conflict(`A user with email ${input.email} already exists`);

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      restaurantId,
      roles: { create: input.roles.map((role) => ({ role })) },
      locations: { create: input.locationIds.map((locationId) => ({ locationId })) },
    },
    include: userWithRelationsInclude,
  });

  return mapUserToDto(user);
}
