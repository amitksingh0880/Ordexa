// ─────────────────────────────────────────────────────────────────────────────
// Centralized admin UI constants — labels, routes, API resources, status metadata.
// No literal in a component should duplicate a value defined here.
// ─────────────────────────────────────────────────────────────────────────────

export const APP = {
  name: "Ordexa",
  tagline: "Shop Management Console",
} as const;

// Client-side route paths (TanStack Router).
export const ROUTES = {
  dashboard: "/",
  orders: "/orders",
  inventory: "/inventory",
  products: "/products",
  reviews: "/reviews",
  messages: "/messages",
  customers: "/customers",
  access: "/access",
  settings: "/settings",
  login: "/login",
} as const;

// Generic CRUD API: base path + the resource segments under /api/:resource.
export const API = {
  crudBasePath: "/api",
  authBasePath: "/auth",
} as const;

export const AUTH_ENDPOINTS = {
  login: "/login",
  register: "/register",
  logout: "/logout",
  me: "/me",
} as const;

export const ACCESS_ENDPOINTS = {
  permissions: "/access/permissions",
  sync: "/access/sync",
  roles: "/access/roles",
  users: "/access/users",
} as const;

export const PRODUCT_IMPORT_ENDPOINTS = {
  template: "/products/template",
  import: "/products/import",
} as const;

export const CUSTOMERS_COPY = {
  title: "Customers",
  name: "Name",
  email: "Email",
  role: "Role",
  orders: "Orders",
  empty: "No customers yet.",
} as const;

export const SETTINGS_COPY = {
  title: "Settings",
  profile: "Profile",
  saveProfile: "Save profile",
  payment: "Payment",
  shipping: "Shipping",
  mode: "Mode",
  live: "Live",
  test: "Test / Mock",
  freeOver: "Free shipping over",
  methods: "Delivery methods",
} as const;

export const ACCESS_COPY = {
  title: "Access management",
  sync: "Sync permissions",
  roles: "Roles",
  permissions: "Permissions",
  users: "Users",
  newRole: "New role",
  editPermissions: "Permissions",
  assignRoles: "Roles",
  save: "Save",
  delete: "Delete",
  superAdmin: "Super admin",
} as const;

export const PRODUCT_COPY = {
  newProduct: "New product",
  editProduct: "Edit product",
  downloadTemplate: "Download template",
  importProducts: "Import",
  importTitle: "Bulk import products",
  importHint: "Upload an .xlsx file. Download the template for the expected columns.",
  uploadCta: "Upload & import",
  deleteTitle: "Delete product",
  deleteConfirm: "This permanently removes the product. Continue?",
  delete: "Delete",
  cancel: "Cancel",
  save: "Save product",
  create: "Create product",
} as const;

export const RESOURCES = {
  products: "products",
  collections: "collections",
  orders: "orders",
  inventory: "inventory",
  reviews: "reviews",
  messages: "messages",
} as const;

export const AUTH_STORAGE_KEY = "ordexa-admin-token";
export const TENANT_STORAGE_KEY = "ordexa-admin-tenant";

export const TENANT_ENDPOINTS = {
  list: "/tenants",
} as const;

export const ARN = {
  partition: "arn:ordexa",
  wildcard: "*",
  moduleSegment: "module",
} as const;

export const ARN_MODULES = {
  products: "products",
  collections: "collections",
  orders: "orders",
  inventory: "inventory",
  reviews: "reviews",
  messages: "messages",
  accessManagement: "accessmanagement",
} as const;

export const ARN_ACTIONS = {
  write: "write",
  roles: "roles",
  arns: "arns",
  users: "users",
} as const;

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

// ── Orders ───────────────────────────────────────────────────────────────────
export const ORDER_STATUS = {
  Pending: "Pending",
  Confirmed: "Confirmed",
  Shipped: "Shipped",
  Delivered: "Delivered",
  Cancelled: "Cancelled",
  Failed: "Failed",
} as const;
export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

// Allowed next statuses, and the action label the admin sees for each transition.
export const ORDER_TRANSITIONS: Record<string, OrderStatus[]> = {
  [ORDER_STATUS.Pending]: [ORDER_STATUS.Confirmed, ORDER_STATUS.Cancelled],
  [ORDER_STATUS.Confirmed]: [ORDER_STATUS.Shipped, ORDER_STATUS.Cancelled],
  [ORDER_STATUS.Shipped]: [ORDER_STATUS.Delivered],
  [ORDER_STATUS.Delivered]: [],
  [ORDER_STATUS.Cancelled]: [],
  [ORDER_STATUS.Failed]: [],
};

export const ORDER_ACTION_LABEL: Record<string, string> = {
  [ORDER_STATUS.Confirmed]: "Accept",
  [ORDER_STATUS.Cancelled]: "Reject",
  [ORDER_STATUS.Shipped]: "Mark Shipped",
  [ORDER_STATUS.Delivered]: "Mark Delivered",
};

export const ORDER_STATUS_VARIANT: Record<string, BadgeVariant> = {
  [ORDER_STATUS.Pending]: "secondary",
  [ORDER_STATUS.Confirmed]: "default",
  [ORDER_STATUS.Shipped]: "default",
  [ORDER_STATUS.Delivered]: "outline",
  [ORDER_STATUS.Cancelled]: "destructive",
  [ORDER_STATUS.Failed]: "destructive",
};

// Status filter tabs for the Orders page ("" = all).
export const ORDER_STATUS_TABS = [
  { value: "", label: "All" },
  { value: ORDER_STATUS.Pending, label: "Pending" },
  { value: ORDER_STATUS.Confirmed, label: "Confirmed" },
  { value: ORDER_STATUS.Shipped, label: "Shipped" },
  { value: ORDER_STATUS.Delivered, label: "Delivered" },
  { value: ORDER_STATUS.Cancelled, label: "Cancelled" },
] as const;

// ── Reviews ──────────────────────────────────────────────────────────────────
export const REVIEW_STATUS = {
  Pending: "Pending",
  Published: "Published",
  Rejected: "Rejected",
} as const;
export type ReviewStatus = (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS];

export const REVIEW_STATUS_VARIANT: Record<string, BadgeVariant> = {
  [REVIEW_STATUS.Pending]: "secondary",
  [REVIEW_STATUS.Published]: "default",
  [REVIEW_STATUS.Rejected]: "destructive",
};

export const REVIEW_STATUS_TABS = [
  { value: REVIEW_STATUS.Pending, label: "Pending" },
  { value: REVIEW_STATUS.Published, label: "Published" },
  { value: REVIEW_STATUS.Rejected, label: "Rejected" },
] as const;

// ── Messages ─────────────────────────────────────────────────────────────────
export const MESSAGE_STATUS = {
  Unread: "Unread",
  Read: "Read",
  Archived: "Archived",
} as const;
export type MessageStatus = (typeof MESSAGE_STATUS)[keyof typeof MESSAGE_STATUS];

export const MESSAGE_STATUS_VARIANT: Record<string, BadgeVariant> = {
  [MESSAGE_STATUS.Unread]: "default",
  [MESSAGE_STATUS.Read]: "secondary",
  [MESSAGE_STATUS.Archived]: "outline",
};

// ── Payments ─────────────────────────────────────────────────────────────────
export const PAYMENT_STATUS = {
  Unpaid: "Unpaid",
  Paid: "Paid",
  Refunded: "Refunded",
} as const;

export const PAYMENT_STATUS_VARIANT: Record<string, BadgeVariant> = {
  [PAYMENT_STATUS.Unpaid]: "secondary",
  [PAYMENT_STATUS.Paid]: "default",
  [PAYMENT_STATUS.Refunded]: "outline",
};

// ── Inventory ────────────────────────────────────────────────────────────────
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

export const CURRENCY = {
  locale: "en-US",
  code: "USD",
} as const;

export const THEME_STORAGE_KEY = "ordexa-admin-theme";
