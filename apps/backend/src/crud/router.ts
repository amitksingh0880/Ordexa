import { Router, type Request, type Response, type NextFunction } from "express";
import { RESOURCES, type CrudResource } from "./registry";

interface CrudRequest extends Request {
  resource?: CrudResource;
}

const coerce = (value: string): unknown => {
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
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
      const { model, searchFields, filterFields, defaultOrderBy } = req.resource!;
      const { search, skip, take, ...rest } = req.query as Record<string, string>;

      const where: Record<string, unknown> = {};
      for (const field of filterFields) {
        if (rest[field] !== undefined) where[field] = coerce(rest[field]);
      }
      if (search && searchFields.length > 0) {
        where.OR = searchFields.map((field) => ({
          [field]: { contains: search, mode: "insensitive" },
        }));
      }

      const data = await model.findMany({
        where,
        orderBy: defaultOrderBy,
        skip: skip ? Number(skip) : undefined,
        take: take ? Number(take) : undefined,
      });
      res.json({ data, count: data.length });
    }),
  );

  router.get(
    "/:resource/:id",
    asyncHandler(async (req, res) => {
      const { model, lookupField } = req.resource!;
      const { id } = req.params;

      let item = await model.findUnique({ where: { id } }).catch(() => null);
      if (!item && lookupField) {
        item = await model
          .findUnique({ where: { [lookupField]: id } })
          .catch(() => null);
      }
      if (!item) return res.status(404).json({ error: "Not found" });
      res.json({ data: item });
    }),
  );

  router.post(
    "/:resource",
    asyncHandler(async (req, res) => {
      const data = await req.resource!.model.create({ data: req.body });
      res.status(201).json({ data });
    }),
  );

  router.patch(
    "/:resource/:id",
    asyncHandler(async (req, res) => {
      const data = await req.resource!.model.update({
        where: { id: req.params.id },
        data: req.body,
      });
      res.json({ data });
    }),
  );

  router.delete(
    "/:resource/:id",
    asyncHandler(async (req, res) => {
      await req.resource!.model.delete({ where: { id: req.params.id } });
      res.status(204).end();
    }),
  );

  return router;
}
