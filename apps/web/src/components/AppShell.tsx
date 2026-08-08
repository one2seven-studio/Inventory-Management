import type { User } from "@platform/contracts";
import { roleHasCapability } from "@platform/contracts";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Truck,
  ShoppingCart,
  RefreshCw,
  BookOpen,
  Trash2,
  ArrowLeftRight,
  Bell,
  BarChart3,
  Users,
  Box,
  type LucideIcon,
} from "lucide-react";
import { logoutAction } from "@/actions/logout";
import { NavLinks, type NavItem } from "@/components/NavLinks";
import { ThemeToggle } from "@/components/ThemeToggle";

const navIcon = (Icon: LucideIcon) => <Icon className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />;

function getNavItems(user: User): NavItem[] {
  const items: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: navIcon(LayoutDashboard) },
    { href: "/items", label: "Items", icon: navIcon(Package) },
    { href: "/stock", label: "Stock", icon: navIcon(Warehouse) },
    { href: "/suppliers", label: "Suppliers", icon: navIcon(Truck) },
    { href: "/purchase-orders", label: "Purchase orders", icon: navIcon(ShoppingCart) },
  ];
  if (user.roles.some((role) => roleHasCapability(role, "CREATE_PURCHASE_ORDER"))) {
    items.push({ href: "/reorder-suggestions", label: "Reorder suggestions", icon: navIcon(RefreshCw) });
  }
  items.push(
    { href: "/recipes", label: "Recipes", icon: navIcon(BookOpen) },
    { href: "/wastage", label: "Wastage", icon: navIcon(Trash2) },
    { href: "/transfers", label: "Transfers", icon: navIcon(ArrowLeftRight) },
    { href: "/alerts", label: "Alerts", icon: navIcon(Bell) },
    { href: "/reports", label: "Reports", icon: navIcon(BarChart3) }
  );
  if (user.roles.some((role) => roleHasCapability(role, "MANAGE_USERS"))) {
    items.push({ href: "/users", label: "Users", icon: navIcon(Users) });
  }
  return items;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export function AppShell({ user, children }: { user: User; children: React.ReactNode }) {
  const navItems = getNavItems(user);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex flex-col justify-between border-b border-outline-variant bg-surface-container-low p-4 md:h-screen md:w-60 md:border-b-0 md:border-r">
        <div>
          <div className="mb-6 flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              <Box className="h-5 w-5 text-primary" strokeWidth={2.5} aria-hidden="true" />
              <div>
                <p className="font-headline text-sm font-bold tracking-tight text-on-surface">Smart Inventory</p>
                <p className="label-caps text-on-surface-variant">Restaurant Ops</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
          <NavLinks items={navItems} />
        </div>
        <div className="mt-6 flex items-center gap-2 border-t border-outline-variant pt-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-outline-variant bg-surface-container-high font-data-mono text-xs font-bold text-primary">
            {initials(user.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-on-surface">{user.name}</p>
            <p className="truncate text-xs text-on-surface-variant">{user.roles.join(", ")}</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded px-2 py-1 text-xs text-on-surface-variant transition-colors duration-150 hover:bg-surface-container-high hover:text-on-surface"
            >
              Log out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
