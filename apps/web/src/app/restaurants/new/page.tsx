import { redirect } from "next/navigation";
import { roleHasCapability } from "@platform/contracts";
import { getCurrentUser } from "@/lib/session/getCurrentUser";
import { NewRestaurantForm } from "@/components/restaurants/NewRestaurantForm";

export default async function NewRestaurantPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Reachable both for a brand-new Owner's first restaurant (restaurantId
  // still null) and, later, an Owner adding another one from the sidebar
  // switcher (restaurantId already set) — so the guard is the capability,
  // not restaurantId presence.
  const canManageRestaurants = user.roles.some((role) => roleHasCapability(role, "MANAGE_RESTAURANTS"));
  if (!canManageRestaurants) redirect("/dashboard");

  return (
    <div className="relative flex flex-1 items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm animate-fade-in-up rounded-md border border-outline-variant bg-surface-container p-8">
        <h1 className="font-headline text-xl font-bold text-on-surface">
          {user.restaurants.length > 0 ? "Add another restaurant" : "Create your restaurant"}
        </h1>
        <p className="mt-1 mb-6 text-sm text-on-surface-variant">
          {user.restaurants.length > 0
            ? "Set up a new restaurant — you'll switch into it right away."
            : "Let's get your first restaurant set up."}
        </p>
        <NewRestaurantForm />
      </div>
    </div>
  );
}
