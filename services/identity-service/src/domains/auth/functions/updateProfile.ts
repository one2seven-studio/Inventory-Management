import { ApiError, type UpdateProfileInput, type User } from "@platform/contracts";
import { prisma } from "../../../db/client.js";
import { userWithRelationsInclude } from "../../users/internal/userWithRelations.js";
import { mapUserToDto } from "../../users/internal/mapUserToDto.js";

/** Self-service — a user editing their own name/email. `activeRestaurantId` is the session's own claim, not re-derived. */
export async function updateProfile(
  userId: string,
  input: UpdateProfileInput,
  activeRestaurantId: string | null
): Promise<User> {
  if (input.email) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing && existing.id !== userId) {
      throw ApiError.conflict(`A user with email ${input.email} already exists`);
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.email !== undefined ? { email: input.email } : {}),
    },
    include: userWithRelationsInclude,
  });

  return mapUserToDto(user, activeRestaurantId);
}
