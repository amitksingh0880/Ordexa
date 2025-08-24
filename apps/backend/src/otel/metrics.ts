import { meterProvider } from "./index";

const meter = meterProvider.getMeter("backend");

export const metrics = {
  httpRequestsTotal: meter.createCounter("http.server.requests", {
    description: "Total HTTP requests",
  }),
  httpRequestDurationMs: meter.createHistogram("http.server.duration", {
    description: "HTTP request duration in ms",
    unit: "ms",
  }),
  httpInflight: meter.createUpDownCounter("http.server.inflight_requests", {
    description: "In-flight HTTP requests",
  }),
} as const;

export type HttpLabels = {
  method: string;
  route: string;
  status: number;
};
