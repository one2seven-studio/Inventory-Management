import type { User } from "@platform/contracts";
import { prisma } from "../../../db/client.js";
import { userWithRelationsInclude } from "../internal/userWithRelations.js";
import { mapUserToDto } from "../internal/mapUserToDto.js";

/** Staff of the caller's restaurant only — the Owner's own row isn't a "staff" member and isn't included. */
export async function listUsers(restaurantId: string): Promise<User[]> {
  const users = await prisma.user.findMany({
    where: { restaurantId },
    include: userWithRelationsInclude,
    orderBy: { createdAt: "asc" },
  });
  return users.map((user) => mapUserToDto(user));
}
