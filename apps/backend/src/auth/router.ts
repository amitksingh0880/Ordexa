import { Router, type Request, type Response, type NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { hashPassword, verifyPassword } from "./password";
import { signToken } from "./jwt";
import { setAuthCookie, clearAuthCookie } from "./cookie";
import { requireAuth } from "./middleware";
import { resolveUserAccess } from "../access/service";
import { resolveTenantId } from "../access/tenant";
import { routeParam } from "../lib/request";
import { AUTH_ERRORS, PUBLIC_USER_FIELDS, UserRole } from "../constants/auth";
import { SYSTEM_ROLES } from "../constants/arn";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  addressSchema,
  cartMergeSchema,
} from "./schemas";
import { z } from "zod";

const asyncHandler =
  (fn: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res)).catch(next);

const parse = <T>(schema: z.ZodType<T>, body: unknown, res: Response): T | null => {
  const result = schema.safeParse(body);
  if (!result.success) {
    res.status(400).json({ error: result.error.issues[0]?.message ?? "Invalid input" });
    return null;
  }
  return result.data;
};

export function createAuthRouter(): Router {
  const router = Router();

  router.post(
    "/register",
    asyncHandler(async (req, res) => {
      const input = parse(registerSchema, req.body, res);
      if (!input) return;

      const existing = await prisma.user.findUnique({ where: { email: input.email } });
      if (existing) return res.status(409).json({ error: AUTH_ERRORS.emailInUse });

      const tenantId = await resolveTenantId(req);
      const user = await prisma.user.create({
        data: {
          tenantId,
          name: input.name,
          email: input.email,
          passwordHash: await hashPassword(input.password),
          role: UserRole.Customer,
        },
        select: PUBLIC_USER_FIELDS,
      });

      const customerRole = await prisma.accessRole.findFirst({
        where: { tenantId, roleName: SYSTEM_ROLES.customer, isDeleted: false },
      });
      if (customerRole) {
        await prisma.accessUserRoleMapping.create({
          data: { userId: user.id, roleId: customerRole.id },
        });
      }

      const access = await resolveUserAccess(user.id);
      const token = signToken({
        sub: user.id,
        tenantId,
        role: user.role as UserRole,
        permissions: access?.permissions ?? [],
      });
      setAuthCookie(res, token);
      res.status(201).json({ data: { ...user, permissions: access?.permissions ?? [] }, token });
    }),
  );

  router.post(
    "/login",
    asyncHandler(async (req, res) => {
      const input = parse(loginSchema, req.body, res);
      if (!input) return;

      const user = await prisma.user.findUnique({ where: { email: input.email } });
      if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
        return res.status(401).json({ error: AUTH_ERRORS.invalidCredentials });
      }

      const access = await resolveUserAccess(user.id);
      const token = signToken({
        sub: user.id,
        tenantId: user.tenantId,
        role: user.role as UserRole,
        permissions: access?.permissions ?? [],
      });
      setAuthCookie(res, token);
      res.json({
        data: {
          id: user.id,
          tenantId: user.tenantId,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          permissions: access?.permissions ?? [],
        },
        token,
      });
    }),
  );

  router.post("/logout", (_req, res) => {
    clearAuthCookie(res);
    res.json({ data: { ok: true } });
  });

  router.get(
    "/me",
    requireAuth,
    asyncHandler(async (req, res) => {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: PUBLIC_USER_FIELDS,
      });
      if (!user) return res.status(404).json({ error: AUTH_ERRORS.notFound });
      res.json({ data: { ...user, permissions: req.user!.permissions } });
    }),
  );

  router.patch(
    "/me",
    requireAuth,
    asyncHandler(async (req, res) => {
      const input = parse(updateProfileSchema, req.body, res);
      if (!input) return;

      const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
      if (!user) return res.status(404).json({ error: AUTH_ERRORS.notFound });

      const data: { name?: string; passwordHash?: string } = {};
      if (input.name) data.name = input.name;
      if (input.newPassword) {
        if (!input.currentPassword ||
          !(await verifyPassword(input.currentPassword, user.passwordHash))) {
          return res.status(400).json({ error: AUTH_ERRORS.invalidCurrentPassword });
        }
        data.passwordHash = await hashPassword(input.newPassword);
      }

      const updated = await prisma.user.update({
        where: { id: user.id },
        data,
        select: PUBLIC_USER_FIELDS,
      });
      res.json({ data: updated });
    }),
  );

  router.get(
    "/addresses",
    requireAuth,
    asyncHandler(async (req, res) => {
      const data = await prisma.address.findMany({
        where: { userId: req.user!.id },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      });
      res.json({ data });
    }),
  );

  router.post(
    "/addresses",
    requireAuth,
    asyncHandler(async (req, res) => {
      const input = parse(addressSchema, req.body, res);
      if (!input) return;
      const userId = req.user!.id;

      if (input.isDefault) {
        await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
      }
      const data = await prisma.address.create({ data: { ...input, userId } });
      res.status(201).json({ data });
    }),
  );

  router.patch(
    "/addresses/:id",
    requireAuth,
    asyncHandler(async (req, res) => {
      const input = parse(addressSchema.partial(), req.body, res);
      if (!input) return;
      const userId = req.user!.id;

      const owned = await prisma.address.findFirst({
        where: { id: routeParam(req, "id"), userId },
      });
      if (!owned) return res.status(404).json({ error: "Address not found" });

      if (input.isDefault) {
        await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
      }
      const data = await prisma.address.update({
        where: { id: routeParam(req, "id") },
        data: input,
      });
      res.json({ data });
    }),
  );

  router.delete(
    "/addresses/:id",
    requireAuth,
    asyncHandler(async (req, res) => {
      const owned = await prisma.address.findFirst({
        where: { id: routeParam(req, "id"), userId: req.user!.id },
      });
      if (!owned) return res.status(404).json({ error: "Address not found" });
      await prisma.address.delete({ where: { id: routeParam(req, "id") } });
      res.status(204).end();
    }),
  );

  // Reassigns a guest cart (keyed by the client cartId) to the authenticated
  // user so items added before login survive into the account session.
  router.post(
    "/cart/merge",
    requireAuth,
    asyncHandler(async (req, res) => {
      const input = parse(cartMergeSchema, req.body, res);
      if (!input) return;
      const userId = req.user!.id;
      if (input.cartId === userId) return res.json({ data: { merged: 0 } });

      const guestItems = await prisma.cartItem.findMany({ where: { cartId: input.cartId } });
      let merged = 0;
      for (const item of guestItems) {
        const existing = await prisma.cartItem.findFirst({
          where: { cartId: userId, productSlug: item.productSlug, finish: item.finish },
        });
        if (existing) {
          await prisma.cartItem.update({
            where: { id: existing.id },
            data: { quantity: existing.quantity + item.quantity },
          });
          await prisma.cartItem.delete({ where: { id: item.id } });
        } else {
          await prisma.cartItem.update({
            where: { id: item.id },
            data: { cartId: userId },
          });
        }
        merged += 1;
      }
      res.json({ data: { merged } });
    }),
  );

  return router;
}
