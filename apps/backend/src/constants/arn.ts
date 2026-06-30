// ARN format: arn:ordexa:{tenant}:module:{resource}[:{action}] (effective in the
// JWT / required at the guard). Stored templates omit the tenant segment, which
// is injected per-user when the token is built. Wildcards: arn:ordexa:* (global
// super), arn:ordexa:{tenant}:* (tenant super), arn:ordexa:{tenant}:readonly.

export const ARN = {
  partition: "arn:ordexa",
  wildcard: "*",
  moduleSegment: "module",
  readonlySegment: "readonly",
} as const;

export const ARN_MODULES = {
  products: "products",
  collections: "collections",
  cart: "cart",
  orders: "orders",
  inventory: "inventory",
  reviews: "reviews",
  messages: "messages",
  payments: "payments",
  accessManagement: "accessmanagement",
} as const;
export type ArnModule = (typeof ARN_MODULES)[keyof typeof ARN_MODULES];

export const ARN_ACTIONS = {
  write: "write",
  own: "own",
  checkout: "checkout",
  roles: "roles",
  arns: "arns",
  users: "users",
} as const;

export const moduleTemplate = (module: string, action?: string): string =>
  `${ARN.partition}:${ARN.moduleSegment}:${module}${action ? `:${action}` : ""}`;

export const READONLY_TEMPLATE = `${ARN.partition}:${ARN.readonlySegment}`;

export const globalSuperArn = `${ARN.partition}:${ARN.wildcard}`;
export const tenantSuperArn = (tenantId: string): string =>
  `${ARN.partition}:${tenantId}:${ARN.wildcard}`;
export const tenantReadonlyArn = (tenantId: string): string =>
  `${ARN.partition}:${tenantId}:${ARN.readonlySegment}`;
export const moduleArn = (
  tenantId: string,
  module: string,
  action?: string,
): string =>
  `${ARN.partition}:${tenantId}:${ARN.moduleSegment}:${module}${action ? `:${action}` : ""}`;

export const scopeTemplateToTenant = (template: string, tenantId: string): string =>
  template.replace(`${ARN.partition}:`, `${ARN.partition}:${tenantId}:`);

// Synced into AccessPermission so roles can be composed from the catalogue.
export const ARN_CATALOG: { name: string; template: string; description: string }[] = [
  { name: "Products – Manage", template: moduleTemplate(ARN_MODULES.products, ARN_ACTIONS.write), description: "Create, edit, import and delete products" },
  { name: "Collections – Manage", template: moduleTemplate(ARN_MODULES.collections, ARN_ACTIONS.write), description: "Create, edit and delete collections" },
  { name: "Inventory – Manage", template: moduleTemplate(ARN_MODULES.inventory, ARN_ACTIONS.write), description: "Adjust stock and pricing" },
  { name: "Orders – View All", template: moduleTemplate(ARN_MODULES.orders), description: "View every order in the tenant" },
  { name: "Orders – Own", template: moduleTemplate(ARN_MODULES.orders, ARN_ACTIONS.own), description: "View one's own orders" },
  { name: "Orders – Manage", template: moduleTemplate(ARN_MODULES.orders, ARN_ACTIONS.write), description: "Update order status and details" },
  { name: "Reviews – Moderate", template: moduleTemplate(ARN_MODULES.reviews, ARN_ACTIONS.write), description: "Approve, reject and remove reviews" },
  { name: "Messages – View", template: moduleTemplate(ARN_MODULES.messages), description: "Read the contact inbox" },
  { name: "Messages – Manage", template: moduleTemplate(ARN_MODULES.messages, ARN_ACTIONS.write), description: "Triage and archive messages" },
  { name: "Payments – Checkout", template: moduleTemplate(ARN_MODULES.payments, ARN_ACTIONS.checkout), description: "Create and verify payment orders" },
  { name: "Access – Roles", template: moduleTemplate(ARN_MODULES.accessManagement, ARN_ACTIONS.roles), description: "Manage roles and their permissions" },
  { name: "Access – Permissions", template: moduleTemplate(ARN_MODULES.accessManagement, ARN_ACTIONS.arns), description: "View and sync the permission catalogue" },
  { name: "Access – Users", template: moduleTemplate(ARN_MODULES.accessManagement, ARN_ACTIONS.users), description: "Assign roles to users" },
  { name: "Read Only", template: READONLY_TEMPLATE, description: "Read access to all guarded modules (GET only)" },
];

export const DEFAULT_TENANT = {
  slug: process.env.DEFAULT_TENANT_SLUG ?? "ordexa",
  name: process.env.DEFAULT_TENANT_NAME ?? "Ordexa",
} as const;

export const TENANT_HEADER = "x-tenant-id";

export const SYSTEM_ROLES = {
  administrator: "Administrator",
  customer: "Customer",
} as const;
