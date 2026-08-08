import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session/getCurrentUser";
import { SelectRestaurantForm } from "@/components/restaurants/SelectRestaurantForm";

export default async function SelectRestaurantPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.restaurantId) redirect("/dashboard");
  if (user.restaurants.length === 0) redirect("/restaurants/new");

  return (
    <div className="relative flex flex-1 items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm animate-fade-in-up rounded-md border border-outline-variant bg-surface-container p-8">
        <h1 className="font-headline text-xl font-bold text-on-surface">Choose a restaurant</h1>
        <p className="mt-1 mb-6 text-sm text-on-surface-variant">You manage more than one — pick which to sign into.</p>
        <SelectRestaurantForm restaurants={user.restaurants} />
      </div>
    </div>
  );
}
