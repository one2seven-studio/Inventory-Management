"use server";

import { redirect } from "next/navigation";
import { ApiError } from "@platform/contracts";
import { getAuthedGatewayClient } from "@/lib/api/getAuthedGatewayClient";
import { clearSessionCookies } from "@/lib/session/clearSessionCookies";

export interface ChangePasswordActionState {
  error?: string;
}

export async function changePasswordAction(
  _prevState: ChangePasswordActionState,
  formData: FormData
): Promise<ChangePasswordActionState> {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || !newPassword) return { error: "All fields are required" };
  if (newPassword.length < 8) return { error: "New password must be at least 8 characters" };
  if (newPassword !== confirmPassword) return { error: "New passwords don't match" };

  try {
    const client = await getAuthedGatewayClient();
    await client.post("/identity/auth/change-password", { currentPassword, newPassword });
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : "Unable to change password. Please try again." };
  }

  // The server just revoked every refresh token for this account (including
  // this session's) — clear the local cookies too and send the user back
  // through login with their new password.
  await clearSessionCookies();
  redirect("/login");
}
