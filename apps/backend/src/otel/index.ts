// otel/index.ts
//
// OpenTelemetry is OPTIONAL. It only wires up real exporters when an OTLP
// endpoint is configured via OTEL_EXPORTER_OTLP_ENDPOINT (e.g. a local
// collector or a hosted backend like Grafana Cloud). On Render's single-port
// free tier we leave it off by default, so the app boots clean with no
// localhost exporters trying (and failing) to connect.
import { NodeSDK } from "@opentelemetry/sdk-node";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { PrismaInstrumentation } from "@prisma/instrumentation";
import { logs } from "@opentelemetry/api-logs";
import { metrics } from "@opentelemetry/api";
import { config } from "../config/env";

const { enabled: OTEL_ENABLED, endpoint: OTLP_ENDPOINT, serviceName: OTEL_SERVICE_NAME } = config.otel;

// A no-op stand-in so callers can always `await sdk.start()` / `sdk.shutdown()`.
const noopSdk = {
  start() {
    console.log("ℹ️  OpenTelemetry disabled (set OTEL_EXPORTER_OTLP_ENDPOINT to enable).");
  },
  async shutdown() {},
};

function buildSdk() {
  const resource = resourceFromAttributes({
    [SemanticResourceAttributes.SERVICE_NAME]: OTEL_SERVICE_NAME,
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: config.nodeEnv,
  });

  const traceExporter = new OTLPTraceExporter({
    // Accepts the base endpoint; appends the standard /v1/traces path.
    url: `${OTLP_ENDPOINT!.replace(/\/$/, "")}/v1/traces`,
  });

  return new NodeSDK({
    resource,
    spanProcessors: [new BatchSpanProcessor(traceExporter)],
    instrumentations: [...getNodeAutoInstrumentations(), new PrismaInstrumentation()],
  });
}

export const sdk = OTEL_ENABLED ? buildSdk() : noopSdk;

// Logger + meter remain available; they are no-ops until/unless OTel is on.
export const logger = logs.getLogger(OTEL_SERVICE_NAME);
export const meter = metrics.getMeter(OTEL_SERVICE_NAME);
