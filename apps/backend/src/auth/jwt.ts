import jwt, { type SignOptions } from "jsonwebtoken";
import { config } from "../config/env";
import type { UserRole } from "../constants/auth";

export interface TokenPayload {
  sub: string;
  tenantId: string;
  role: UserRole;
  permissions: string[];
}

export const signToken = (payload: TokenPayload): string =>
  jwt.sign(payload, config.auth.jwtSecret, {
    expiresIn: config.auth.jwtExpiresIn as SignOptions["expiresIn"],
  });

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, config.auth.jwtSecret);
    if (typeof decoded === "string") return null;
    return {
      sub: decoded.sub as string,
      tenantId: decoded.tenantId as string,
      role: decoded.role as UserRole,
      permissions: Array.isArray(decoded.permissions)
        ? (decoded.permissions as string[])
        : [],
    };
  } catch {
    return null;
  }
};
