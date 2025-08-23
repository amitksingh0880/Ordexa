import { loggerProvider } from "./index";
import { context, trace } from "@opentelemetry/api";
import { z } from "zod";

const otelLogger = loggerProvider.getLogger("backend");

const LogSchema = z.object({
  level: z.enum(["debug", "info", "warn", "error"]),
  msg: z.string(),
  event: z.string().optional(),
  http: z
    .object({
      method: z.string().optional(),
      route: z.string().optional(),
      status: z.number().int().optional(),
    })
    .optional(),
  user: z.object({ id: z.string().optional() }).optional(),
});

type LogFields = z.infer<typeof LogSchema>;

function traceContext() {
  const span = trace.getSpan(context.active());
  const sc = span?.spanContext();
  return sc ? { trace_id: sc.traceId, span_id: sc.spanId, sampled: sc.traceFlags === 1 } : {};
}

export function log(fields: LogFields) {
  const parsed = LogSchema.parse(fields);
  const record = { ...parsed, ...traceContext(), ts: new Date().toISOString() };
  console.log(JSON.stringify(record)); // mirror to stdout (optional)
  otelLogger.emit({
    body: JSON.stringify(record),
    attributes: {
      "log.level": record.level,
      "log.event": record.event ?? "",
    },
  });
}
