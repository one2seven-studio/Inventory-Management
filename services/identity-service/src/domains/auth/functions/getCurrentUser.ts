import { getUserById } from "../../users/functions/getUserById.js";
import type { User } from "@platform/contracts";

/** `activeRestaurantId` comes from the current request's auth context (the session's own claim), not re-derived. */
export async function getCurrentUser(userId: string, activeRestaurantId: string | null): Promise<User> {
  return getUserById(userId, { activeRestaurantId });
}
