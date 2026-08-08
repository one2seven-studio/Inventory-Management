export const ROLES = [
  "OWNER",
  "MANAGER",
  "CHEF",
  "PURCHASING",
  "STORE_CLERK",
  "ACCOUNTANT",
] as const;

export type Role = (typeof ROLES)[number];

/** PRD §6 Roles & Permissions Matrix, encoded as capability -> allowed roles. */
export const ROLE_CAPABILITIES = {
  VIEW_DASHBOARD: ["OWNER", "MANAGER", "CHEF", "PURCHASING", "STORE_CLERK", "ACCOUNTANT"],
  MANAGE_ITEM_MASTER: ["OWNER", "MANAGER", "PURCHASING"],
  CREATE_PURCHASE_ORDER: ["OWNER", "MANAGER", "PURCHASING"],
  APPROVE_PURCHASE_ORDER: ["OWNER", "MANAGER"],
  RECEIVE_GOODS: ["OWNER", "MANAGER", "PURCHASING", "STORE_CLERK"],
  MANAGE_RECIPES: ["OWNER", "MANAGER", "CHEF"],
  LOG_WASTAGE: ["OWNER", "MANAGER", "CHEF", "STORE_CLERK"],
  PERFORM_STOCK_COUNT: ["OWNER", "MANAGER", "CHEF", "STORE_CLERK"],
  APPROVE_STOCK_ADJUSTMENT: ["OWNER", "MANAGER"],
  MANAGE_USERS: ["OWNER"],
  MANAGE_RESTAURANTS: ["OWNER"],
  EXPORT_FINANCIAL_REPORTS: ["OWNER", "MANAGER", "ACCOUNTANT"],
} as const satisfies Record<string, readonly Role[]>;

export type Capability = keyof typeof ROLE_CAPABILITIES;

export function roleHasCapability(role: Role, capability: Capability): boolean {
  return (ROLE_CAPABILITIES[capability] as readonly Role[]).includes(role);
}
