import type { Request } from "express";
import { prisma } from "../lib/prisma";
import { DEFAULT_TENANT, TENANT_HEADER } from "../constants/arn";

let defaultTenantId: string | null = null;

export const invalidateTenantCache = (): void => {
  defaultTenantId = null;
};

export const getDefaultTenant = () =>
  prisma.tenant.findUnique({ where: { slug: DEFAULT_TENANT.slug } });

// The active tenant is always a real row from the master Tenant table: the
// configured default slug if present, otherwise the first active tenant.
export const getDefaultTenantId = async (): Promise<string> => {
  if (defaultTenantId) return defaultTenantId;
  const tenant =
    (await getDefaultTenant()) ??
    (await prisma.tenant.findFirst({ where: { isActive: true }, orderBy: { createdAt: "asc" } }));
  if (!tenant) throw new Error("No tenant is provisioned");
  defaultTenantId = tenant.id;
  return defaultTenantId;
};

export const resolveTenantId = async (req: Request): Promise<string> => {
  const header = req.headers[TENANT_HEADER];
  const value = Array.isArray(header) ? header[0] : header;
  if (value) {
    const tenant = await prisma.tenant.findFirst({
      where: { isActive: true, OR: [{ id: value }, { slug: value }] },
    });
    if (tenant) return tenant.id;
  }
  return getDefaultTenantId();
};
