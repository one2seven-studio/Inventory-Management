"use server";

import { redirect } from "next/navigation";
import { ApiError, type LoginResult, type Location } from "@platform/contracts";
import { getAuthedGatewayClient } from "@/lib/api/getAuthedGatewayClient";
import { getGatewayClient } from "@/lib/api/gatewayClient";
import { setSessionCookies } from "@/lib/session/setSessionCookies";
import { getRememberMe } from "@/lib/session/getRememberMe";

export interface CreateRestaurantActionState {
  error?: string;
}

/**
 * Creates a restaurant the caller owns, switches the session into it, and
 * — if a first-location name was given — creates that too, using the
 * *new*, now-restaurant-scoped token (the one the caller signed in with
 * can't create locations for a restaurant it isn't scoped to yet).
 */
export async function createRestaurantAction(
  _prevState: CreateRestaurantActionState,
  formData: FormData
): Promise<CreateRestaurantActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const locationName = String(formData.get("locationName") ?? "").trim();
  if (!name) return { error: "Restaurant name is required" };

  const rememberMe = await getRememberMe();

  let result: LoginResult;
  try {
    const client = await getAuthedGatewayClient();
    result = await client.post<LoginResult>("/identity/restaurants", { name, rememberMe });
  } catch (error) {
    return { error: error instanceof ApiError ? error.message : "Unable to create restaurant. Please try again." };
  }

  await setSessionCookies(result.accessToken, result.refreshToken, result.rememberMe);

  if (locationName) {
    try {
      await getGatewayClient(result.accessToken).post<Location>("/inventory/locations", {
        name: locationName,
        type: "BRANCH",
      });
    } catch {
      // Non-fatal — the restaurant exists and the session is already scoped
      // to it; a location can always be added from the Stock page instead.
    }
  }

  redirect("/dashboard");
}
