import { Router, type Request, type Response, type NextFunction } from "express";
import { RESOURCES, type CrudAccess, type CrudResource } from "./registry";
import { AUTH_ERRORS } from "../constants/auth";
import { ARN_ACTIONS, moduleArn } from "../constants/arn";
import { hasArn, isReadGranted } from "../auth/arn";

interface CrudRequest extends Request {
  resource?: CrudResource;
}

const DEFAULT_OWNER_FIELD = "userId";
const TENANT_FIELD = "tenantId";

const isTenantScoped = (resource: CrudResource): boolean =>
  resource.tenantScoped !== false;

const coerce = (value: string): unknown => {
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
};

interface AccessVerdict {
  status?: number;
  error?: string;
  scoped?: boolean; // restrict to rows the caller owns
}

const evaluate = (req: Request, access: CrudAccess): AccessVerdict => {
  if (access.kind === "public") return {};
  if (!req.user) return { status: 401, error: AUTH_ERRORS.unauthorized };

  const { tenantId, permissions } = req.user;

  if (access.kind === "arn") {
    const required = moduleArn(tenantId, access.module, access.action);
    if (hasArn(permissions, required) || isReadGranted(permissions, tenantId, req.method)) {
      return {};
    }
    return { status: 403, error: AUTH_ERRORS.forbidden };
  }

  // owner
  const full = moduleArn(tenantId, access.module);
  if (hasArn(permissions, full) || isReadGranted(permissions, tenantId, req.method)) {
    return {};
  }
  if (hasArn(permissions, moduleArn(tenantId, access.module, ARN_ACTIONS.own))) {
    return { scoped: true };
  }
  return { status: 403, error: AUTH_ERRORS.forbidden };
};

const isPrivileged = (req: Request, resource: CrudResource): boolean =>
  req.user
    ? hasArn(req.user.permissions, moduleArn(req.user.tenantId, resource.module, ARN_ACTIONS.write))
    : false;

const stripProtected = (req: CrudRequest): void => {
  const fields = req.resource!.protectedFields;
  if (!fields || isPrivileged(req, req.resource!)) return;
  const body = req.body as Record<string, unknown>;
  for (const field of fields) delete body[field];
};

const asyncHandler =
  (fn: (req: CrudRequest, res: Response) => Promise<unknown>) =>
  (req: CrudRequest, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res)).catch(next);

// Registry-driven CRUD: GET list, GET :id, POST, PATCH :id, DELETE :id.
export function createCrudRouter(): Router {
  const router = Router();

  router.param("resource", (req: CrudRequest, res, next, name: string) => {
    const resource = RESOURCES[name];
    if (!resource) {
      return res.status(404).json({ error: `Unknown resource '${name}'` });
    }
    req.resource = resource;
    next();
  });

  router.get(
    "/:resource",
    asyncHandler(async (req, res) => {
      const resource = req.resource!;
      const verdict = evaluate(req, resource.policy.list);
      if (verdict.status) return res.status(verdict.status).json({ error: verdict.error });
      if (isTenantScoped(resource) && !req.tenantId) {
        return res.status(400).json({ error: "Tenant not resolved" });
      }

      const { model, searchFields, filterFields, defaultOrderBy } = resource;
      const { search, skip, take, ...rest } = req.query as Record<string, string>;

      const where: Record<string, unknown> = {};
      if (isTenantScoped(resource)) where[TENANT_FIELD] = req.tenantId;
      for (const field of filterFields) {
        if (rest[field] !== undefined) where[field] = coerce(rest[field]);
      }
      if (search && searchFields.length > 0) {
        where.OR = searchFields.map((field) => ({
          [field]: { contains: search, mode: "insensitive" },
        }));
      }
      if (verdict.scoped) {
        const ownerField =
          resource.policy.list.kind === "owner"
            ? resource.policy.list.ownerField ?? DEFAULT_OWNER_FIELD
            : DEFAULT_OWNER_FIELD;
        where[ownerField] = req.user!.id;
      }

      const [data, total] = await Promise.all([
        model.findMany({
          where,
          orderBy: defaultOrderBy,
          skip: skip ? Number(skip) : undefined,
          take: take ? Number(take) : undefined,
        }),
        model.count({ where }),
      ]);
      res.json({ data, count: data.length, total });
    }),
  );

  router.get(
    "/:resource/:id",
    asyncHandler(async (req, res) => {
      const resource = req.resource!;
      const verdict = evaluate(req, resource.policy.read);
      if (verdict.status) return res.status(verdict.status).json({ error: verdict.error });

      const { model, lookupField } = resource;
      const { id } = req.params;

      let item = await model.findUnique({ where: { id } }).catch(() => null);
      if (!item && lookupField) {
        item = await model.findUnique({ where: { [lookupField]: id } }).catch(() => null);
      }
      if (!item) return res.status(404).json({ error: "Not found" });

      if (isTenantScoped(resource) &&
        (item as Record<string, unknown>)[TENANT_FIELD] !== req.tenantId) {
        return res.status(404).json({ error: "Not found" });
      }
      if (verdict.scoped) {
        const ownerField =
          resource.policy.read.kind === "owner"
            ? resource.policy.read.ownerField ?? DEFAULT_OWNER_FIELD
            : DEFAULT_OWNER_FIELD;
        if ((item as Record<string, unknown>)[ownerField] !== req.user!.id) {
          return res.status(404).json({ error: "Not found" });
        }
      }
      res.json({ data: item });
    }),
  );

  router.post(
    "/:resource",
    asyncHandler(async (req, res) => {
      const resource = req.resource!;
      const verdict = evaluate(req, resource.policy.create);
      if (verdict.status) return res.status(verdict.status).json({ error: verdict.error });
      if (isTenantScoped(resource)) {
        if (!req.tenantId) return res.status(400).json({ error: "Tenant not resolved" });
        (req.body as Record<string, unknown>)[TENANT_FIELD] = req.tenantId;
      }
      stripProtected(req);

      if (verdict.scoped && resource.policy.create.kind === "owner") {
        (req.body as Record<string, unknown>)[
          resource.policy.create.ownerField ?? DEFAULT_OWNER_FIELD
        ] = req.user!.id;
      }
      const data = await resource.model.create({ data: req.body });
      res.status(201).json({ data });
    }),
  );

  const ensureModifyAllowed = async (
    req: CrudRequest,
    res: Response,
  ): Promise<boolean> => {
    const resource = req.resource!;
    const verdict = evaluate(req, resource.policy.modify);
    if (verdict.status) {
      res.status(verdict.status).json({ error: verdict.error });
      return false;
    }
    const ownerScoped = verdict.scoped && resource.policy.modify.kind === "owner";
    if (isTenantScoped(resource) || ownerScoped) {
      const item = (await resource.model
        .findUnique({ where: { id: req.params.id } })
        .catch(() => null)) as Record<string, unknown> | null;
      if (!item) {
        res.status(404).json({ error: "Not found" });
        return false;
      }
      if (isTenantScoped(resource) && item[TENANT_FIELD] !== req.tenantId) {
        res.status(404).json({ error: "Not found" });
        return false;
      }
      if (ownerScoped) {
        const ownerField =
          resource.policy.modify.kind === "owner"
            ? resource.policy.modify.ownerField ?? DEFAULT_OWNER_FIELD
            : DEFAULT_OWNER_FIELD;
        if (item[ownerField] !== req.user!.id) {
          res.status(404).json({ error: "Not found" });
          return false;
        }
      }
    }
    return true;
  };

  router.patch(
    "/:resource/:id",
    asyncHandler(async (req, res) => {
      if (!(await ensureModifyAllowed(req, res))) return;
      stripProtected(req);
      const data = await req.resource!.model.update({
        where: { id: req.params.id },
        data: req.body,
      });
      await req.resource!.hooks?.afterUpdate?.(data);
      res.json({ data });
    }),
  );

  router.delete(
    "/:resource/:id",
    asyncHandler(async (req, res) => {
      if (!(await ensureModifyAllowed(req, res))) return;
      await req.resource!.model.delete({ where: { id: req.params.id } });
      res.status(204).end();
    }),
  );

  return router;
}
