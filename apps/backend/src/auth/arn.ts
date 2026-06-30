import { tenantReadonlyArn } from "../constants/arn";

export const arnMatches = (permission: string, required: string): boolean =>
  permission === required ||
  (permission.endsWith("*") && required.startsWith(permission.slice(0, -1)));

export const hasArn = (permissions: string[], required: string): boolean =>
  permissions.some((p) => arnMatches(p, required));

export const hasAnyArn = (permissions: string[], requiredAny: string[]): boolean =>
  requiredAny.some((required) => hasArn(permissions, required));

// GET/HEAD bypass for holders of the tenant readonly ARN (or any super grant,
// which hasArn already resolves via the wildcard rule).
export const isReadGranted = (
  permissions: string[],
  tenantId: string,
  method: string,
): boolean =>
  (method === "GET" || method === "HEAD") &&
  hasArn(permissions, tenantReadonlyArn(tenantId));
