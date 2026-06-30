import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { authApi } from "../lib/auth";
import { getToken, getTenantId, setTenantId } from "../lib/http";
import { can } from "../lib/arn";
import { ARN } from "../constants/app";
import type { AuthUser } from "../types/domain";

const GLOBAL_SUPER_ARN = `${ARN.partition}:${ARN.wildcard}`;

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isGlobalSuper: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  can: (module: string, action?: string) => boolean;
}

const rememberTenant = (user: AuthUser): void => {
  if (!getTenantId()) setTenantId(user.tenantId);
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then((u) => { rememberTenant(u); setUser(u); })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const u = await authApi.login(email, password);
    rememberTenant(u);
    setUser(u);
  };

  const logout = async () => {
    await authApi.logout();
    setTenantId(null);
    setUser(null);
  };

  const value: AuthContextValue = {
    user,
    loading,
    isGlobalSuper: user ? user.permissions.includes(GLOBAL_SUPER_ARN) : false,
    login,
    logout,
    can: (module, action) => (user ? can(user.permissions, module, action) : false),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
