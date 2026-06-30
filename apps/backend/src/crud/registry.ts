import { prisma } from "../lib/prisma";

export interface ModelDelegate {
  findMany(args?: unknown): Promise<unknown[]>;
  findUnique(args: unknown): Promise<unknown | null>;
  create(args: unknown): Promise<unknown>;
  update(args: unknown): Promise<unknown>;
  delete(args: unknown): Promise<unknown>;
}

export interface CrudResource {
  model: ModelDelegate;
  searchFields: string[];
  filterFields: string[];
  lookupField?: string;
  defaultOrderBy?: Record<string, "asc" | "desc">;
}

// Registering a model here exposes full REST CRUD for it under /api/:resource.
export const RESOURCES: Record<string, CrudResource> = {
  products: {
    model: prisma.product as unknown as ModelDelegate,
    searchFields: ["name", "series", "description"],
    filterFields: ["collectionSlug", "series", "featured", "slug", "badge"],
    lookupField: "slug",
    defaultOrderBy: { createdAt: "asc" },
  },
  collections: {
    model: prisma.collection as unknown as ModelDelegate,
    searchFields: ["name", "tagline", "description"],
    filterFields: ["slug"],
    lookupField: "slug",
    defaultOrderBy: { createdAt: "asc" },
  },
  cart: {
    model: prisma.cartItem as unknown as ModelDelegate,
    searchFields: ["name"],
    filterFields: ["cartId", "productSlug", "finish"],
    defaultOrderBy: { createdAt: "asc" },
  },
};

export type ResourceName = keyof typeof RESOURCES;
