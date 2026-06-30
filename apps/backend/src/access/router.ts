import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../auth/middleware";
import { authorizeArn } from "../auth/authorize";
import { ARN_MODULES, ARN_ACTIONS } from "../constants/arn";
import {
  listPermissions,
  syncPermissionCatalog,
  listRoles,
  assignRolePermissions,
  assignUserRoles,
  listTenantUsers,
} from "./service";

const asyncHandler =
  (fn: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res)).catch(next);

const roleSchema = z.object({
  id: z.string().optional(),
  roleName: z.string().min(1),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  isSuperAdmin: z.boolean().optional(),
});
const idListSchema = z.array(z.string());

const arnsGuard = authorizeArn(ARN_MODULES.accessManagement, ARN_ACTIONS.arns);
const rolesGuard = authorizeArn(ARN_MODULES.accessManagement, ARN_ACTIONS.roles);
const usersGuard = authorizeArn(ARN_MODULES.accessManagement, ARN_ACTIONS.users);

export function createAccessRouter(): Router {
  const router = Router();
  router.use(requireAuth);

  router.get("/permissions", arnsGuard, asyncHandler(async (_req, res) => {
    res.json({ data: await listPermissions() });
  }));

  router.post("/sync", arnsGuard, asyncHandler(async (_req, res) => {
    const count = await syncPermissionCatalog();
    res.json({ data: { synced: count } });
  }));

  router.get("/roles", rolesGuard, asyncHandler(async (req, res) => {
    res.json({ data: await listRoles(req.user!.tenantId) });
  }));

  router.post("/roles", rolesGuard, asyncHandler(async (req, res) => {
    const parsed = roleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message });
    }
    const { id, roleName, description, isActive, isSuperAdmin } = parsed.data;
    const tenantId = req.user!.tenantId;
    const data = id
      ? await prisma.accessRole.update({
          where: { id },
          data: { roleName, description, isActive, isSuperAdmin },
        })
      : await prisma.accessRole.create({
          data: { tenantId, roleName, description, isActive, isSuperAdmin },
        });
    res.json({ data });
  }));

  router.delete("/roles/:id", rolesGuard, asyncHandler(async (req, res) => {
    await prisma.accessRole.update({
      where: { id: req.params.id },
      data: { isDeleted: true, isActive: false },
    });
    res.status(204).end();
  }));

  router.post("/roles/:id/permissions", rolesGuard, asyncHandler(async (req, res) => {
    const parsed = idListSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Expected an array of permission ids" });
    await assignRolePermissions(req.params.id!, parsed.data);
    res.json({ data: { ok: true } });
  }));

  router.get("/users", usersGuard, asyncHandler(async (req, res) => {
    res.json({ data: await listTenantUsers(req.user!.tenantId) });
  }));

  router.post("/users/:id/roles", usersGuard, asyncHandler(async (req, res) => {
    const parsed = idListSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Expected an array of role ids" });
    await assignUserRoles(req.params.id!, parsed.data);
    res.json({ data: { ok: true } });
  }));

  return router;
}
