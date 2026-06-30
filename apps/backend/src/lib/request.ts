import type { Request } from "express";

// Reads a route parameter as a plain string, independent of how the installed
// @types/express version models req.params (string vs string | string[]).
export const routeParam = (req: Request, name: string): string => {
  const value = (req.params as Record<string, string | string[] | undefined>)[name];
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
};
