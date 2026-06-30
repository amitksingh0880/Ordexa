import "dotenv/config";

// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for runtime configuration. Every environment-derived
// value is read here once (with its default) and imported elsewhere — no
// process.env access or inline literals are allowed outside this module.
// NOTE: keep this module free of I/O; it must be safe to import anywhere.
// ─────────────────────────────────────────────────────────────────────────────

const toNumber = (value: string | undefined, fallback: number): number =>
  value !== undefined && value !== "" ? Number(value) : fallback;

const DEFAULTS = {
  port: 5000,
  nodeEnv: "development",
  otelServiceName: "ordexa-backend",
  temporalNamespace: "default",
  temporalTaskQueue: "orders",
} as const;

export const config = {
  port: toNumber(process.env.PORT, DEFAULTS.port),
  nodeEnv: process.env.NODE_ENV ?? DEFAULTS.nodeEnv,
  isProduction: (process.env.NODE_ENV ?? DEFAULTS.nodeEnv) === "production",
  databaseUrl: process.env.DATABASE_URL,

  otel: {
    enabled: Boolean(process.env.OTEL_EXPORTER_OTLP_ENDPOINT),
    endpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    serviceName: process.env.OTEL_SERVICE_NAME ?? DEFAULTS.otelServiceName,
  },

  temporal: {
    enabled: Boolean(process.env.TEMPORAL_ADDRESS),
    address: process.env.TEMPORAL_ADDRESS,
    namespace: process.env.TEMPORAL_NAMESPACE ?? DEFAULTS.temporalNamespace,
    taskQueue: process.env.TEMPORAL_TASK_QUEUE ?? DEFAULTS.temporalTaskQueue,
  },
} as const;
