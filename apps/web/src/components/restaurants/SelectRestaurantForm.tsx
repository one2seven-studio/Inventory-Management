"use client";

import { useActionState } from "react";
import type { Restaurant } from "@platform/contracts";
import { selectRestaurantAction, type SelectRestaurantActionState } from "@/actions/restaurants/selectRestaurant";
import { Button } from "@/components/ui/Button";

const initialState: SelectRestaurantActionState = {};

export function SelectRestaurantForm({ restaurants }: { restaurants: Restaurant[] }) {
  const [state, formAction, isPending] = useActionState(selectRestaurantAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        {restaurants.map((restaurant) => (
          <label
            key={restaurant.id}
            className="flex cursor-pointer items-center gap-2 rounded border border-outline-variant px-3 py-2 text-sm text-on-surface transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary-container/10"
          >
            <input type="radio" name="restaurantId" value={restaurant.id} required className="accent-primary" />
            {restaurant.name}
          </label>
        ))}
      </div>
      {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      <Button type="submit" pending={isPending} className="w-full py-2">
        {isPending ? "Switching…" : "Continue"}
      </Button>
    </form>
  );
}
