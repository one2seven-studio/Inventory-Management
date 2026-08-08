"use server";

import { redirect } from "next/navigation";
import { ApiError, type LoginResult } from "@platform/contracts";
import { getAuthedGatewayClient } from "@/lib/api/getAuthedGatewayClient";
import { setSessionCookies } from "@/lib/session/setSessionCookies";
import { getRememberMe } from "@/lib/session/getRememberMe";

export interface SelectRestaurantActionState {
  error?: string;
}

/** Switches the session's active restaurant — used both for the post-login picker and the sidebar switcher. */
export async function selectRestaurantAction(
  _prevState: SelectRestaurantActionState,
  formData: FormData
): Promise<SelectRestaurantActionState> {
  const restaurantId = String(formData.get("restaurantId") ?? "");
  if (!restaurantId) return { error: "Choose a restaurant" };

  const rememberMe = await getRememberMe();

  let result: LoginResult;
  try {
    const client = await getAuthedGatewayClient();
    result = await client.post<LoginResult>("/identity/auth/select-restaurant", { restaurantId, rememberMe });
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : "Unable to switch restaurants. Please try again." };
  }

  await setSessionCookies(result.accessToken, result.refreshToken, result.rememberMe);
  redirect("/dashboard");
}
