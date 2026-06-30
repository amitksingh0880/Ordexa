import type { CookieOptions, Response } from "express";
import { config } from "../config/env";
import { COOKIE_MAX_AGE_MS } from "../constants/auth";

const baseOptions: CookieOptions = {
  httpOnly: true,
  sameSite: config.isProduction ? "none" : "lax",
  secure: config.isProduction,
  maxAge: COOKIE_MAX_AGE_MS,
  path: "/",
};

export const setAuthCookie = (res: Response, token: string): void => {
  res.cookie(config.auth.cookieName, token, baseOptions);
};

export const clearAuthCookie = (res: Response): void => {
  res.clearCookie(config.auth.cookieName, { ...baseOptions, maxAge: undefined });
};
