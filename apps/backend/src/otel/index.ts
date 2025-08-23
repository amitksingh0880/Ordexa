import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes as R } from "@opentelemetry/semantic-conventions";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { MeterProvider, PeriodicExportingMetricReader, AggregationTemporality } from "@opentelemetry/sdk-metrics";
import { LoggerProvider, BatchLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { z } from "zod";

if (process.env.NODE_ENV !== "production") {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);
}

const Env = z.object({
  OTEL_SERVICE_NAME: z.string().min(1),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url(),
  OTEL_TRACES_SAMPLER: z.enum(["always_on", "always_off", "traceidratio"]).default("always_on"),
  OTEL_RESOURCE_ATTRIBUTES: z.string().optional(),
});

const env = Env.parse({
  OTEL_SERVICE_NAME: process.env.OTEL_SERVICE_NAME,
  OTEL_EXPORTER_OTLP_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
  OTEL_TRACES_SAMPLER: process.env.OTEL_TRACES_SAMPLER,
  OTEL_RESOURCE_ATTRIBUTES: process.env.OTEL_RESOURCE_ATTRIBUTES,
});

const deployment =
  /(?:^|,)deployment\.environment=([^,]+)/.exec(env.OTEL_RESOURCE_ATTRIBUTES ?? "")?.[1] ?? "dev";

const resource = new Resource({
  [R.SERVICE_NAME]: env.OTEL_SERVICE_NAME,
  [R.SERVICE_NAMESPACE]: "apps",
  [R.SERVICE_VERSION]: "0.1.0",
  [R.DEPLOYMENT_ENVIRONMENT]: deployment,
});

export const tracerProvider = new NodeTracerProvider({ resource });
tracerProvider.addSpanProcessor(
  new BatchSpanProcessor(new OTLPTraceExporter({ url: `${env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces` }))
);
tracerProvider.register();

export const meterProvider = new MeterProvider({ resource });
meterProvider.addMetricReader(
  new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: `${env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/metrics`,
      temporalityPreference: AggregationTemporality.CUMULATIVE,
    }),
    exportIntervalMillis: 5000,
  })
);

export const loggerProvider = new LoggerProvider({ resource });
loggerProvider.addLogRecordProcessor(
  new BatchLogRecordProcessor(new OTLPLogExporter({ url: `${env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/logs` }))
);

export async function shutdownTelemetry() {
  await Promise.allSettled([
    tracerProvider.shutdown(),
    meterProvider.shutdown(),
    loggerProvider.shutdown(),
  ]);
}
