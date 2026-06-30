import { prisma } from "../lib/prisma";
import { ARN_MODULES, ARN_ACTIONS } from "../constants/arn";
import { notifyOrderStatus } from "../notify/orderNotifications";

export interface ModelDelegate {
  findMany(args?: unknown): Promise<unknown[]>;
  findUnique(args: unknown): Promise<unknown | null>;
  count(args?: unknown): Promise<number>;
  create(args: unknown): Promise<unknown>;
  update(args: unknown): Promise<unknown>;
  delete(args: unknown): Promise<unknown>;
}

// public → anyone; arn → requires module[:action]; owner → module ARN (all rows)
// or module:own ARN (only the caller's rows).
export type CrudAccess =
  | { kind: "public" }
  | { kind: "arn"; module: string; action?: string }
  | { kind: "owner"; module: string; ownerField?: string };

export interface CrudPolicy {
  list: CrudAccess;
  read: CrudAccess;
  create: CrudAccess;
  modify: CrudAccess;
}

export interface CrudResource {
  module: string;
  model: ModelDelegate;
  searchFields: string[];
  filterFields: string[];
  lookupField?: string;
  defaultOrderBy?: Record<string, "asc" | "desc">;
  policy: CrudPolicy;
  protectedFields?: string[]; // stripped unless the caller holds module:write
  hooks?: { afterUpdate?: (updated: unknown) => Promise<void> | void };
  tenantScoped?: boolean; // default true: rows carry tenantId and are isolated per tenant
}

const pub: CrudAccess = { kind: "public" };
const arn = (module: string, action?: string): CrudAccess => ({ kind: "arn", module, action });
const own = (module: string, ownerField = "userId"): CrudAccess => ({ kind: "owner", module, ownerField });
const write = ARN_ACTIONS.write;

// Registering a model here exposes full REST CRUD for it under /api/:resource.
export const RESOURCES: Record<string, CrudResource> = {
  products: {
    module: ARN_MODULES.products,
    model: prisma.product as unknown as ModelDelegate,
    searchFields: ["name", "series", "description"],
    filterFields: ["collectionSlug", "series", "featured", "slug", "badge"],
    lookupField: "slug",
    defaultOrderBy: { createdAt: "asc" },
    policy: {
      list: pub,
      read: pub,
      create: arn(ARN_MODULES.products, write),
      modify: arn(ARN_MODULES.products, write),
    },
  },
  collections: {
    module: ARN_MODULES.collections,
    model: prisma.collection as unknown as ModelDelegate,
    searchFields: ["name", "tagline", "description"],
    filterFields: ["slug"],
    lookupField: "slug",
    defaultOrderBy: { createdAt: "asc" },
    policy: {
      list: pub,
      read: pub,
      create: arn(ARN_MODULES.collections, write),
      modify: arn(ARN_MODULES.collections, write),
    },
  },
  cart: {
    module: ARN_MODULES.cart,
    model: prisma.cartItem as unknown as ModelDelegate,
    searchFields: ["name"],
    filterFields: ["cartId", "productSlug", "finish"],
    defaultOrderBy: { createdAt: "asc" },
    policy: { list: pub, read: pub, create: pub, modify: pub },
  },
  orders: {
    module: ARN_MODULES.orders,
    model: prisma.order as unknown as ModelDelegate,
    searchFields: ["customerName", "customerEmail", "userId", "status"],
    filterFields: ["status", "userId"],
    defaultOrderBy: { createdAt: "desc" },
    policy: {
      list: own(ARN_MODULES.orders),
      read: own(ARN_MODULES.orders),
      create: arn(ARN_MODULES.orders, write),
      modify: arn(ARN_MODULES.orders, write),
    },
    protectedFields: ["paymentStatus", "paymentId", "razorpayOrderId"],
    hooks: { afterUpdate: notifyOrderStatus },
  },
  inventory: {
    module: ARN_MODULES.inventory,
    model: prisma.inventory as unknown as ModelDelegate,
    searchFields: ["name", "sku"],
    filterFields: ["sku"],
    lookupField: "sku",
    defaultOrderBy: { sku: "asc" },
    policy: {
      list: pub,
      read: pub,
      create: arn(ARN_MODULES.inventory, write),
      modify: arn(ARN_MODULES.inventory, write),
    },
  },
  reviews: {
    module: ARN_MODULES.reviews,
    model: prisma.review as unknown as ModelDelegate,
    searchFields: ["author", "title", "body", "productSlug"],
    filterFields: ["productSlug", "status"],
    defaultOrderBy: { createdAt: "desc" },
    policy: {
      list: pub,
      read: pub,
      create: pub,
      modify: arn(ARN_MODULES.reviews, write),
    },
    protectedFields: ["status"],
  },
  messages: {
    module: ARN_MODULES.messages,
    model: prisma.message as unknown as ModelDelegate,
    searchFields: ["name", "email", "subject", "body"],
    filterFields: ["status"],
    defaultOrderBy: { createdAt: "desc" },
    policy: {
      list: arn(ARN_MODULES.messages),
      read: arn(ARN_MODULES.messages),
      create: pub,
      modify: arn(ARN_MODULES.messages, write),
    },
    protectedFields: ["status"],
  },
  coupons: {
    module: ARN_MODULES.coupons,
    model: prisma.coupon as unknown as ModelDelegate,
    searchFields: ["code"],
    filterFields: ["code", "active", "type"],
    lookupField: "code",
    defaultOrderBy: { createdAt: "desc" },
    policy: {
      list: arn(ARN_MODULES.coupons),
      read: arn(ARN_MODULES.coupons),
      create: arn(ARN_MODULES.coupons, write),
      modify: arn(ARN_MODULES.coupons, write),
    },
  },
  wishlist: {
    module: ARN_MODULES.wishlist,
    model: prisma.wishlist as unknown as ModelDelegate,
    searchFields: ["productSlug"],
    filterFields: ["productSlug", "userId"],
    defaultOrderBy: { createdAt: "desc" },
    policy: {
      list: own(ARN_MODULES.wishlist),
      read: own(ARN_MODULES.wishlist),
      create: own(ARN_MODULES.wishlist),
      modify: own(ARN_MODULES.wishlist),
    },
  },
};

export type ResourceName = keyof typeof RESOURCES;
