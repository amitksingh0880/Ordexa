import type { Request, Response, NextFunction } from "express";
import { config } from "../config/env";
import { verifyToken } from "./jwt";
import { AUTH_ERRORS } from "../constants/auth";

export interface AuthedUser {
  id: string;
  tenantId: string;
  role: string;
  permissions: string[];
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthedUser;
    }
  }
}

const extractToken = (req: Request): string | null => {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  const cookie = (req.cookies as Record<string, string> | undefined)?.[
    config.auth.cookieName
  ];
  return cookie ?? null;
};

// Soft decode: attaches req.user when a valid token is present, never blocks.
export const currentUser = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const token = extractToken(req);
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      req.user = {
        id: payload.sub,
        tenantId: payload.tenantId,
        role: payload.role,
        permissions: payload.permissions,
      };
    }
  }
  next();
};

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.user) {
    res.status(401).json({ error: AUTH_ERRORS.unauthorized });
    return;
  }
  next();
};
