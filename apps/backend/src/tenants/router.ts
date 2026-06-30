import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../auth/middleware";
import { authorizeArn } from "../auth/authorize";
import { ARN_MODULES, ARN_ACTIONS } from "../constants/arn";
import { invalidateTenantCache } from "../access/tenant";

const asyncHandler =
  (fn: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res)).catch(next);

const tenantSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  isActive: z.boolean().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
});

const writeGuard = authorizeArn(ARN_MODULES.tenants, ARN_ACTIONS.write);

export function createTenantRouter(): Router {
  const router = Router();

  // The master list used by tenant pickers — limited fields, any authed user.
  router.get(
    "/",
    requireAuth,
    asyncHandler(async (_req, res) => {
      const data = await prisma.tenant.findMany({
        where: { isActive: true },
        select: { id: true, slug: true, name: true, isActive: true },
        orderBy: { name: "asc" },
      });
      res.json({ data });
    }),
  );

  router.post(
    "/",
    requireAuth,
    writeGuard,
    asyncHandler(async (req, res) => {
      const parsed = tenantSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message });
      const data = await prisma.tenant.create({ data: parsed.data });
      invalidateTenantCache();
      res.status(201).json({ data });
    }),
  );

  router.patch(
    "/:id",
    requireAuth,
    writeGuard,
    asyncHandler(async (req, res) => {
      const parsed = tenantSchema.partial().safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message });
      const data = await prisma.tenant.update({ where: { id: req.params.id }, data: parsed.data });
      invalidateTenantCache();
      res.json({ data });
    }),
  );

  return router;
}
