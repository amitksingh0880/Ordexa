import { ARN } from "../constants/app";

const globalSuper = `${ARN.partition}:${ARN.wildcard}`;

const arnMatches = (permission: string, required: string): boolean =>
  permission === required ||
  (permission.endsWith("*") && required.startsWith(permission.slice(0, -1)));

const tenantOf = (permissions: string[]): string | null => {
  for (const p of permissions) {
    const segment = p.split(":")[2];
    if (segment && segment !== ARN.wildcard) return segment;
  }
  return null;
};

export const can = (
  permissions: string[],
  module: string,
  action?: string,
): boolean => {
  if (permissions.includes(globalSuper)) return true;
  const tenant = tenantOf(permissions);
  if (!tenant) return false;
  const required = `${ARN.partition}:${tenant}:${ARN.moduleSegment}:${module}${action ? `:${action}` : ""}`;
  return permissions.some((p) => arnMatches(p, required));
};
