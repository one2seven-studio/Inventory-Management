"use server";

import { ApiError, type LoginResult } from "@platform/contracts";
import { getAuthedGatewayClient } from "@/lib/api/getAuthedGatewayClient";
import { setSessionCookies } from "@/lib/session/setSessionCookies";
import { getRememberMe } from "@/lib/session/getRememberMe";

export interface SelectRestaurantActionState {
  error?: string;
  /**
   * Set instead of calling redirect() server-side. Switching restaurants
   * rotates the session's auth cookie, but Next's client-side Router Cache
   * can still serve an *already-prefetched* payload for the target route —
   * every sidebar <Link> prefetches /dashboard automatically, capturing
   * whatever cookie was active at prefetch time, and a soft redirect() can
   * reuse that stale, wrong-restaurant payload even though the cookie
   * itself updated correctly (verified directly: the JWT is right, the
   * rendered page isn't). The caller does a hard `window.location`
   * navigation on this instead, which always re-fetches everything fresh.
   */
  redirectTo?: string;
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
  return { redirectTo: "/dashboard" };
}
