import { ApiError, type ChangePasswordInput } from "@platform/contracts";
import { prisma } from "../../../db/client.js";
import { verifyPassword } from "../../../lib/verifyPassword.js";
import { hashPassword } from "../../../lib/hashPassword.js";

/**
 * Self-service password change. Revokes every one of the user's refresh
 * tokens as part of the same transaction — a changed password should end
 * every existing session (including this one; the caller's own access
 * token still works until it naturally expires in the next few minutes,
 * but nothing can silently refresh past that anymore).
 */
export async function changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound("User not found");

  const matches = await verifyPassword(input.currentPassword, user.passwordHash);
  if (!matches) throw ApiError.unauthorized("Current password is incorrect");

  const passwordHash = await hashPassword(input.newPassword);
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
    prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } }),
  ]);
}
