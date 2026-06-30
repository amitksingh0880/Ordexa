import { prisma } from "../lib/prisma";
import { config } from "../config/env";
import { DEFAULT_TENANT } from "../constants/arn";

export interface ShippingConfig {
  flatRate: number;
  freeThreshold: number;
  methods: { id: string; label: string; cost: number; etaDays: number }[];
}

export interface StorefrontConfig {
  brand: string;
  tagline: string;
  currency: string;
  shipping: ShippingConfig;
}

type StoredConfig = Partial<{
  brand: string;
  tagline: string;
  currency: string;
  shipping: Partial<ShippingConfig>;
}>;

// Tenant overrides (Tenant.config) merged over the env-derived defaults, so the
// storefront is driven entirely by what the tenant configures in the admin UI.
export const getStorefrontConfig = async (tenantId: string): Promise<StorefrontConfig> => {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  const stored = (tenant?.config ?? {}) as StoredConfig;
  return {
    brand: stored.brand ?? tenant?.name ?? DEFAULT_TENANT.name,
    tagline: stored.tagline ?? "",
    currency: stored.currency ?? config.shipping.currency,
    shipping: {
      flatRate: stored.shipping?.flatRate ?? config.shipping.flatRate,
      freeThreshold: stored.shipping?.freeThreshold ?? config.shipping.freeThreshold,
      methods: stored.shipping?.methods ?? [...config.shipping.methods],
    },
  };
};
