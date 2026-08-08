import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session/getCurrentUser";
import { AppShell } from "@/components/AppShell";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  // Every page under here assumes a restaurant-scoped session (locations,
  // items, etc. are all fetched per-restaurant) — bounce anyone who somehow
  // landed here without one back through the picker/onboarding flow.
  if (!user.restaurantId) redirect("/select-restaurant");

  return <AppShell user={user}>{children}</AppShell>;
}
