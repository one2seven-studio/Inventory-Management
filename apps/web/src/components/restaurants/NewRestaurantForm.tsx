"use client";

import { useActionState } from "react";
import { createRestaurantAction, type CreateRestaurantActionState } from "@/actions/restaurants/createRestaurant";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: CreateRestaurantActionState = {};

export function NewRestaurantForm() {
  const [state, formAction, isPending] = useActionState(createRestaurantAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium text-on-surface-variant">
          Restaurant name
        </label>
        <Input id="name" name="name" required className="w-full py-2" placeholder="e.g. Spice Route" />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="locationName" className="text-sm font-medium text-on-surface-variant">
          First location <span className="text-on-surface-variant/60">(optional)</span>
        </label>
        <Input id="locationName" name="locationName" className="w-full py-2" placeholder="e.g. Main Branch" />
      </div>
      {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      <Button type="submit" pending={isPending} className="w-full py-2">
        {isPending ? "Creating…" : "Create restaurant"}
      </Button>
    </form>
  );
}
