import { Router, type Request, type Response, type NextFunction, type RequestHandler } from "express";
import multer from "multer";
import { requireAuth } from "../auth/middleware";
import { authorizeArn } from "../auth/authorize";
import { ARN_MODULES, ARN_ACTIONS } from "../constants/arn";
import { buildTemplate, importProducts } from "./import.service";
import { TEMPLATE_FILENAME } from "./columns";

const upload = multer({ storage: multer.memoryStorage() });
const writeGuard = authorizeArn(ARN_MODULES.products, ARN_ACTIONS.write);

const asyncHandler =
  (fn: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res)).catch(next);

const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export function createProductImportRouter(): Router {
  const router = Router();

  router.get(
    "/template",
    requireAuth,
    writeGuard,
    asyncHandler(async (_req, res) => {
      const buffer = await buildTemplate();
      res.setHeader("Content-Type", XLSX_MIME);
      res.setHeader("Content-Disposition", `attachment; filename="${TEMPLATE_FILENAME}"`);
      res.send(buffer);
    }),
  );

  router.post(
    "/import",
    requireAuth,
    writeGuard,
    upload.single("file") as unknown as RequestHandler,
    asyncHandler(async (req, res) => {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });
      const results = await importProducts(req.file.buffer);
      const summary = {
        created: results.filter((r) => r.status === "created").length,
        updated: results.filter((r) => r.status === "updated").length,
        errors: results.filter((r) => r.status === "error").length,
      };
      res.json({ data: { results, summary } });
    }),
  );

  return router;
}
