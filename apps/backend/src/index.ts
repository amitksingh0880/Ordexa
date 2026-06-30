import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "./config/env";
import express from "express";
import { OpenAPIBackend, type Request as OpenAPIRequest } from "openapi-backend";
import { createOrderHandler } from "./handlers/order";
import { getOrdersByUserHandler } from "./handlers/getOrdersByUser";
import { getInventoryHandler } from "./handlers/getInventory";
import { createCrudRouter } from "./crud/router";
import { createAuthRouter } from "./auth/router";
import { createAccessRouter } from "./access/router";
import { createPaymentsRouter } from "./payments/router";
import { createProductImportRouter } from "./products/importRouter";
import { createTenantRouter } from "./tenants/router";
import { currentUser, tenantContext } from "./auth/middleware";
import cookieParser from "cookie-parser";
import cors from "cors";

// Node ESM ("type": "module") has no __dirname; derive it from import.meta.url.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { trace, context, metrics } from "@opentelemetry/api";
import { sdk } from "./otel/index";
import type { ErrorRequestHandler } from "express";
import { logs } from "@opentelemetry/api-logs";

const logger = logs.getLogger("backend-logger");

// ------------------------------------------------------
// Metrics
// ------------------------------------------------------
const meter = metrics.getMeter("backend");
const requestCounter = meter.createCounter("http_requests_total", {
  description: "Total number of HTTP requests",
});

// ------------------------------------------------------
// Express app
// ------------------------------------------------------
const app = express();
const corsOrigin = config.cors.origins.includes("*") ? true : config.cors.origins;
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser() as unknown as express.RequestHandler);
app.use(currentUser);
app.use(tenantContext);

// Healthcheck route (for readiness & tracing validation)
app.get("/health", (req, res) => {
  logger.emit({
    severityText: "INFO",
    body: "💓 Health check pinged",
    attributes: {
      path: "/health",
      status: 200,
    },
  });

  res.json({ status: "ok" });
});

// Middleware to trace all HTTP requests
app.use((req, res, next) => {
  const tracer = trace.getTracer("backend");
  const span = tracer.startSpan(`HTTP ${req.method} ${req.path}`, {
    attributes: {
      "http.method": req.method,
      "http.route": req.path,
      "http.url": req.originalUrl,
    },
  });

  const ctx = trace.setSpan(context.active(), span);
  context.with(ctx, () => {
    res.on("finish", () => {
      span.setAttribute("http.status_code", res.statusCode);
      requestCounter.add(1, {
        method: req.method,
        route: req.path,
        status: res.statusCode.toString(),
      });
      span.end();
    });
    next();
  });
});

// Authentication — register/login/logout/me/addresses/cart-merge.
app.use("/auth", createAuthRouter());

// Payments — Razorpay order creation + signature verification.
app.use("/payments", createPaymentsRouter());

// Tenant master table + ARN access management — mounted before the generic CRUD
// router so they are not captured by the /api/:resource param route.
app.use("/api/tenants", createTenantRouter());
app.use("/api/access", createAccessRouter());

// Product bulk import/template — mounted before generic CRUD so /api/products/
// import|template are not captured by the /:resource/:id route.
app.use("/api/products", createProductImportRouter());

// Storefront catalog CRUD — mounted before the OpenAPI catch-all.
app.use("/api", createCrudRouter());

// Error handling middleware (to trace uncaught errors)
interface ErrorHandlerRequest extends express.Request {}
interface ErrorHandlerResponse extends express.Response {}
interface ErrorHandlerNextFunction extends express.NextFunction {}

const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: ErrorHandlerRequest,
  res: ErrorHandlerResponse,
  next: ErrorHandlerNextFunction
) => {
  const span = trace.getSpan(context.active());
  if (span) {
    span.recordException(err);
    span.setStatus({ code: 2, message: err.message }); // 2 = ERROR
  }
  console.error("❌ Unhandled Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
};

app.use(errorHandler);

// ------------------------------------------------------
// OpenAPIBackend setup
// ------------------------------------------------------
const api = new OpenAPIBackend({
  definition: path.join(__dirname, "../spec/index.yml"),
  handlers: {
    createOrder: createOrderHandler,
    getOrdersByUser: getOrdersByUserHandler,
    getInventory: getInventoryHandler,
    notFound: (_c, _req, res) => res.status(404).json({ error: "Not found" }),
    validationFail: (c, _req, res) =>
      res.status(400).json({ error: c.validation.errors }),
  },
});
api.init();
app.use((req, res) => api.handleRequest(req as OpenAPIRequest, req, res));

// ------------------------------------------------------
// Main entrypoint
// ------------------------------------------------------
async function main() {
  await sdk.start(); // ✅ Start OpenTelemetry SDK before any instrumentation

  const server = app.listen(config.port, () => {
    console.log(`🚀 Backend running on port ${config.port}`);
  });

  // Graceful shutdown (SIGINT / SIGTERM)
  for (const sig of ["SIGINT", "SIGTERM"] as const) {
    process.on(sig, async () => {
      console.log(`📦 Caught ${sig}, shutting down...`);
      server.close();
      await sdk.shutdown();
      console.log("✅ OpenTelemetry shut down.");
      process.exit(0);
    });
  }
}

main().catch((err) => {
  console.error("❌ Failed to start:", err);
  process.exit(1);
});
