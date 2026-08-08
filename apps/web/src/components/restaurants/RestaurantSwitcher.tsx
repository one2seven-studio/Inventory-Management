"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Restaurant } from "@platform/contracts";
import { Store, Plus } from "lucide-react";
import { selectRestaurantAction, type SelectRestaurantActionState } from "@/actions/restaurants/selectRestaurant";

const initialState: SelectRestaurantActionState = {};

/**
 * A single restaurant renders as a plain label (nothing to switch between).
 * 2+ renders an auto-submitting `<select>`, same interaction pattern as
 * LocationSwitcher — except this one POSTs (it rotates the session's token
 * pair, not just a URL param) rather than a GET form.
 */
export function RestaurantSwitcher({
  restaurants,
  activeRestaurantId,
  canManageRestaurants,
}: {
  restaurants: Restaurant[];
  activeRestaurantId: string;
  canManageRestaurants: boolean;
}) {
  const [state, formAction] = useActionState(selectRestaurantAction, initialState);

  const addLink = canManageRestaurants ? (
    <Link
      href="/restaurants/new"
      className="shrink-0 text-on-surface-variant transition-colors hover:text-primary"
      title="Add another restaurant"
      aria-label="Add another restaurant"
    >
      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
    </Link>
  ) : null;

  if (restaurants.length <= 1) {
    const name = restaurants[0]?.name ?? "Restaurant";
    return (
      <div className="flex items-center justify-between gap-2 px-1 py-1">
        <div className="flex min-w-0 items-center gap-1.5 text-xs text-on-surface-variant">
          <Store className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{name}</span>
        </div>
        {addLink}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <form action={formAction} className="flex items-center gap-1 px-1">
        <div className="relative flex-1">
          <Store
            className="pointer-events-none absolute top-1/2 left-2 h-3.5 w-3.5 -translate-y-1/2 text-on-surface-variant"
            aria-hidden="true"
          />
          <select
            name="restaurantId"
            aria-label="Restaurant"
            defaultValue={activeRestaurantId}
            onChange={(event) => event.currentTarget.form?.requestSubmit()}
            className="label-caps w-full appearance-none rounded border border-outline bg-surface-container-high py-1.5 pr-2 pl-7 text-on-surface outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
          >
            {restaurants.map((restaurant) => (
              <option key={restaurant.id} value={restaurant.id}>
                {restaurant.name}
              </option>
            ))}
          </select>
        </div>
        {addLink}
      </form>
      {state.error ? <p className="px-1 text-xs text-danger">{state.error}</p> : null}
    </div>
  );
}
