import "dotenv/config";

// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for runtime configuration. Every environment-derived
// value is read here once (with its default) and imported elsewhere — no
// process.env access or inline literals are allowed outside this module.
// NOTE: keep this module free of I/O; it must be safe to import anywhere.
// ─────────────────────────────────────────────────────────────────────────────

const toNumber = (value: string | undefined, fallback: number): number =>
  value !== undefined && value !== "" ? Number(value) : fallback;

const toList = (value: string | undefined, fallback: string[]): string[] =>
  value !== undefined && value !== ""
    ? value.split(",").map((entry) => entry.trim()).filter(Boolean)
    : fallback;

const DEFAULTS = {
  port: 5000,
  nodeEnv: "development",
  otelServiceName: "ordexa-backend",
  temporalNamespace: "default",
  temporalTaskQueue: "orders",
  jwtExpiresIn: "7d",
  authCookieName: "ordexa_token",
  bcryptRounds: 10,
  corsOrigins: ["*"],
  defaultCurrency: "INR",
  shippingFlatRate: 49,
  shippingFreeThreshold: 999,
  mailFrom: "Ordexa <no-reply@ordexa.shop>",
} as const;

const SHIPPING_METHODS = [
  { id: "standard", label: "Standard Delivery", cost: 49, etaDays: 5 },
  { id: "express", label: "Express Delivery", cost: 149, etaDays: 2 },
] as const;

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

  auth: {
    jwtSecret: process.env.JWT_SECRET ?? "",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? DEFAULTS.jwtExpiresIn,
    cookieName: process.env.AUTH_COOKIE_NAME ?? DEFAULTS.authCookieName,
    bcryptRounds: toNumber(process.env.BCRYPT_ROUNDS, DEFAULTS.bcryptRounds),
  },

  cors: {
    origins: toList(process.env.CORS_ORIGINS, [...DEFAULTS.corsOrigins]),
  },

  payments: {
    razorpay: {
      keyId: process.env.RAZORPAY_KEY_ID ?? "",
      keySecret: process.env.RAZORPAY_KEY_SECRET ?? "",
      enabled: Boolean(process.env.RAZORPAY_KEY_SECRET),
    },
  },

  shipping: {
    currency: process.env.DEFAULT_CURRENCY ?? DEFAULTS.defaultCurrency,
    flatRate: toNumber(process.env.SHIPPING_FLAT_RATE, DEFAULTS.shippingFlatRate),
    freeThreshold: toNumber(
      process.env.SHIPPING_FREE_THRESHOLD,
      DEFAULTS.shippingFreeThreshold,
    ),
    methods: SHIPPING_METHODS,
  },

  mail: {
    enabled: Boolean(process.env.RESEND_API_KEY) || Boolean(process.env.SMTP_HOST),
    from: process.env.MAIL_FROM ?? DEFAULTS.mailFrom,
    resendApiKey: process.env.RESEND_API_KEY ?? "",
    smtp: {
      host: process.env.SMTP_HOST ?? "",
      port: toNumber(process.env.SMTP_PORT, 587),
      user: process.env.SMTP_USER ?? "",
      pass: process.env.SMTP_PASS ?? "",
      secure: process.env.SMTP_SECURE === "true",
    },
  },
} as const;

export type ShippingMethod = (typeof SHIPPING_METHODS)[number];
