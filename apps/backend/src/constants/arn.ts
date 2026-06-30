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
  tenants: "tenants",
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

export const humanizeArnSegment = (segment: string): string =>
  segment.charAt(0).toUpperCase() + segment.slice(1);

export const DEFAULT_TENANT = {
  slug: process.env.DEFAULT_TENANT_SLUG ?? "ordexa",
  name: process.env.DEFAULT_TENANT_NAME ?? "Ordexa",
} as const;

export const TENANT_HEADER = "x-tenant-id";

export const SYSTEM_ROLES = {
  administrator: "Administrator",
  customer: "Customer",
} as const;
