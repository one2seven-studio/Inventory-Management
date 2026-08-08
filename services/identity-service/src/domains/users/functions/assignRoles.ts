import { ApiError, type AssignRolesInput, type User } from "@platform/contracts";
import { prisma } from "../../../db/client.js";
import { userWithRelationsInclude } from "../internal/userWithRelations.js";
import { mapUserToDto } from "../internal/mapUserToDto.js";

/** PRD §3.16 — replace a user's role set (manager/owner action). Restricted to staff of the caller's own restaurant. */
export async function assignRoles(userId: string, input: AssignRolesInput, callerRestaurantId: string): Promise<User> {
  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing || existing.restaurantId !== callerRestaurantId) {
    throw ApiError.notFound(`User ${userId} not found`);
  }

  const user = await prisma.$transaction(async (tx) => {
    await tx.userRole.deleteMany({ where: { userId } });
    return tx.user.update({
      where: { id: userId },
      data: { roles: { create: input.roles.map((role) => ({ role })) } },
      include: userWithRelationsInclude,
    });
  });

  return mapUserToDto(user);
}
