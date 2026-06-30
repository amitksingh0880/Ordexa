import type { Request } from "express";
import { prisma } from "../lib/prisma";
import { DEFAULT_TENANT, TENANT_HEADER } from "../constants/arn";

export const getDefaultTenant = () =>
  prisma.tenant.findUnique({ where: { slug: DEFAULT_TENANT.slug } });

export const resolveTenantId = async (req: Request): Promise<string> => {
  const header = req.headers[TENANT_HEADER];
  const value = Array.isArray(header) ? header[0] : header;
  if (value) {
    const tenant = await prisma.tenant.findFirst({
      where: { OR: [{ id: value }, { slug: value }] },
    });
    if (tenant) return tenant.id;
  }
  const fallback = await getDefaultTenant();
  if (!fallback) throw new Error("Default tenant is not provisioned");
  return fallback.id;
};
