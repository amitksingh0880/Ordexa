// otel/index.ts
import { NodeSDK } from "@opentelemetry/sdk-node";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { ConsoleSpanExporter, BatchSpanProcessor, TraceIdRatioBasedSampler } from "@opentelemetry/sdk-trace-node";
import { ConsoleMetricExporter, PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { ConsoleLogRecordExporter, SimpleLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { PrismaInstrumentation } from "@prisma/instrumentation";
import { logs } from "@opentelemetry/api-logs";
import { metrics } from "@opentelemetry/api";

// ------------------------------------------------------
// Resource
// ------------------------------------------------------
const resource = resourceFromAttributes({
  [SemanticResourceAttributes.SERVICE_NAME]: "my-backend",
  [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || "development",
});

// ------------------------------------------------------
// Console Exporters
// ------------------------------------------------------
const traceExporter = new OTLPTraceExporter({
  url: "http://localhost:4318/v1/traces", // Jaeger OTLP HTTP endpoint
});

const metricExporter = new PrometheusExporter(
  { port: 9464, endpoint: "/metrics" },  // 👈 exposes at localhost:9464/metrics
  () => console.log("✅ Prometheus scrape endpoint: http://localhost:9464/metrics")
);


// const metricExporter = new ConsoleMetricExporter();
const logExporter = new ConsoleLogRecordExporter();

// ------------------------------------------------------
// SDK
// ------------------------------------------------------
export const sdk = new NodeSDK({
  resource,
  spanProcessors: [new BatchSpanProcessor(traceExporter)],
  traceSampler: new TraceIdRatioBasedSampler(1.0),
  metricReaders: [
    new PeriodicExportingMetricReader({ exporter: metricExporter }),
  ],
  logRecordProcessors: [
    new SimpleLogRecordProcessor(logExporter),
  ],
  instrumentations: [
    ...getNodeAutoInstrumentations(),
    new PrismaInstrumentation(),
  ],
});

// ------------------------------------------------------
// Optional logger + meter instances
// ------------------------------------------------------
export const logger = logs.getLogger("my-backend", "1.0.0");
export const meter = metrics.getMeter("my-backend", "1.0.0");
