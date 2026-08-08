"use server";

import { revalidatePath } from "next/cache";
import { ApiError, type User } from "@platform/contracts";
import { getAuthedGatewayClient } from "@/lib/api/getAuthedGatewayClient";

export interface UpdateProfileActionState {
  error?: string;
  success?: boolean;
}

export async function updateProfileAction(
  _prevState: UpdateProfileActionState,
  formData: FormData
): Promise<UpdateProfileActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  if (!name) return { error: "Name is required" };
  if (!email) return { error: "Email is required" };

  try {
    const client = await getAuthedGatewayClient();
    await client.patch<User>("/identity/auth/me", { name, email });
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : "Unable to update profile. Please try again." };
  }

  // No auth cookie changes here (unlike restaurant switching) — a normal
  // revalidatePath is enough for the sidebar's name/email to pick this up.
  revalidatePath("/", "layout");
  return { success: true };
}
