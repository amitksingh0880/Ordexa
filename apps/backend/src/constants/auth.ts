export const UserRole = {
  Customer: "customer",
  Admin: "admin",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const AUTH_ERRORS = {
  emailInUse: "Email already registered",
  invalidCredentials: "Invalid email or password",
  unauthorized: "Authentication required",
  forbidden: "Insufficient permissions",
  notFound: "Account not found",
  invalidCurrentPassword: "Current password is incorrect",
} as const;

export const PUBLIC_USER_FIELDS = {
  id: true,
  tenantId: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
} as const;

export const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
