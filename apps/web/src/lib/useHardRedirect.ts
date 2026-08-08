"use client";

import { useEffect } from "react";

/**
 * Forces a full browser navigation instead of Next's client-side router.
 * Needed after actions that rotate the session's auth cookie (switching or
 * creating a restaurant) — a soft `redirect()`/router transition can reuse
 * an already-prefetched payload for the target route captured under the
 * *previous* cookie (every sidebar <Link> prefetches automatically), even
 * though the cookie itself updates correctly. See
 * actions/restaurants/selectRestaurant.ts's SelectRestaurantActionState for
 * the full explanation.
 */
export function useHardRedirect(redirectTo: string | undefined) {
  useEffect(() => {
    if (redirectTo) {
      window.location.href = redirectTo;
    }
  }, [redirectTo]);
}
