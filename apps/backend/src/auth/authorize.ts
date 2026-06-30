import type { Request, Response, NextFunction } from "express";
import { AUTH_ERRORS } from "../constants/auth";
import { moduleArn } from "../constants/arn";
import { hasArn, isReadGranted } from "./arn";
import { registerGuardArn } from "../access/discovery";

export const authorizeArn = (module: string, action?: string) => {
  registerGuardArn(module, action);
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: AUTH_ERRORS.unauthorized });
      return;
    }
    const { tenantId, permissions } = req.user;
    const required = moduleArn(tenantId, module, action);
    if (hasArn(permissions, required) || isReadGranted(permissions, tenantId, req.method)) {
      next();
      return;
    }
    res.status(403).json({ error: AUTH_ERRORS.forbidden });
  };
};
