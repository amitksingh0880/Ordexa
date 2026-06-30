// ─────────────────────────────────────────────────────────────────────────────
// Centralized UI constants — labels, routes, API paths, status metadata.
// No literal in a component should duplicate a value defined here.
// ─────────────────────────────────────────────────────────────────────────────

export const APP = {
  name: "Ordexa",
  tagline: "Order & Inventory Management",
} as const;

// Client-side route paths (TanStack Router).
export const ROUTES = {
  dashboard: "/",
  createOrder: "/orders/create",
  inventory: "/inventory",
  ordersByUser: (userId: string) => `/orders/${userId}`,
} as const;

// Backend API paths (joined to VITE_API_URL by the api client).
export const API_PATHS = {
  createOrder: "/order/create",
  ordersByUser: (userId: string) => `/orders/${userId}`,
  inventory: "/inventory",
} as const;

export const ORDER_STATUS = {
  Pending: "Pending",
  Confirmed: "Confirmed",
  Failed: "Failed",
} as const;
export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

// Maps an order status to its shadcn Badge variant.
export const ORDER_STATUS_VARIANT: Record<string, BadgeVariant> = {
  [ORDER_STATUS.Pending]: "secondary",
  [ORDER_STATUS.Confirmed]: "default",
  [ORDER_STATUS.Failed]: "destructive",
};

// Stock-level thresholds for the inventory badges.
export const STOCK = {
  lowThreshold: 10,
  labels: {
    out: "Out of stock",
    low: "Low stock",
    inStock: "In stock",
  },
  variants: {
    out: "destructive" as BadgeVariant,
    low: "secondary" as BadgeVariant,
    inStock: "default" as BadgeVariant,
  },
} as const;

// Defaults for the create-order form.
export const ORDER_DEFAULTS = {
  quantity: 1,
  status: "Created",
} as const;

export const CURRENCY = {
  locale: "en-IN",
  code: "INR",
} as const;

// localStorage keys + limits for the User ID helper in the sidebar.
export const STORAGE_KEYS = {
  userIdHistory: "ordexa-user-id-history",
  lastUserId: "ordexa-user-id",
} as const;

export const USER_ID_HISTORY_LIMIT = 5;
