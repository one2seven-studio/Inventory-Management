import { redirect } from "next/navigation";
import { UserCircle, KeyRound } from "lucide-react";
import { getCurrentUser } from "@/lib/session/getCurrentUser";
import { Card, CardHeader } from "@/components/ui/Card";
import { UpdateProfileForm } from "@/components/profile/UpdateProfileForm";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const activeRestaurant = user.restaurants.find((restaurant) => restaurant.id === user.restaurantId);

  return (
    <div className="flex max-w-lg animate-fade-in-up flex-col gap-6">
      <div>
        <h1 className="font-headline text-2xl font-bold text-on-surface">Profile settings</h1>
        <p className="text-sm text-on-surface-variant">
          {user.roles.join(", ")}
          {activeRestaurant ? ` · ${activeRestaurant.name}` : ""}
        </p>
      </div>

      <Card>
        <CardHeader title="Account details" icon={<UserCircle className="h-3.5 w-3.5" aria-hidden="true" />} />
        <UpdateProfileForm user={user} />
      </Card>

      <Card>
        <CardHeader title="Change password" icon={<KeyRound className="h-3.5 w-3.5" aria-hidden="true" />} />
        <ChangePasswordForm />
      </Card>
    </div>
  );
}
