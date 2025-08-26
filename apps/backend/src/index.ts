import path from "node:path";
import express from "express";
import OpenAPIBackend, { type Request as OpenAPIRequest } from "openapi-backend";
import { createOrderHandler } from "./handlers/order";
import { getOrdersByUserHandler } from "./handlers/getOrdersByUser";
import { connectConsumer } from "./kafka/consumer";
import { connectProducer } from "./kafka/producer";
import cors from "cors";
import { trace, context, metrics } from "@opentelemetry/api";
import { sdk } from "./otel/index";

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
app.use(express.json());
app.use(cors());

// Middleware to trace all HTTP requests
app.use((req, res, next) => {
  const tracer = trace.getTracer("backend");
  const span = tracer.startSpan(`HTTP ${req.method} ${req.path}`, {
    attributes: {
      "http.method": req.method,
      "http.route": req.path,
      "http.url": req.url,
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

// Kafka connections
connectProducer();
connectConsumer();

// OpenAPIBackend setup
const api = new OpenAPIBackend({
  definition: path.join(__dirname, "../spec/index.yml"),
  handlers: {
    createOrder: createOrderHandler,
    getOrdersByUser: getOrdersByUserHandler,
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
  await sdk.start(); // ✅ Start OpenTelemetry SDK before server

  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`🚀 Backend running at http://localhost:${PORT}`);
  });

  // Graceful shutdown
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
