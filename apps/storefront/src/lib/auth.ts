import { authHttp, setToken } from "./http";
import { AUTH_ENDPOINTS } from "../constants/app";
import type { AuthUser } from "../types/shop";

interface AuthResponse {
  data: AuthUser;
  token: string;
}

export const authApi = {
  async login(email: string, password: string): Promise<AuthUser> {
    const { data } = await authHttp.post<AuthResponse>(AUTH_ENDPOINTS.login, { email, password });
    setToken(data.token);
    return data.data;
  },
  async register(name: string, email: string, password: string): Promise<AuthUser> {
    const { data } = await authHttp.post<AuthResponse>(AUTH_ENDPOINTS.register, {
      name,
      email,
      password,
    });
    setToken(data.token);
    return data.data;
  },
  async me(): Promise<AuthUser> {
    const { data } = await authHttp.get<{ data: AuthUser }>(AUTH_ENDPOINTS.me);
    return data.data;
  },
  async logout(): Promise<void> {
    await authHttp.post(AUTH_ENDPOINTS.logout).catch(() => undefined);
    setToken(null);
  },
  async mergeCart(cartId: string): Promise<void> {
    await authHttp.post(AUTH_ENDPOINTS.cartMerge, { cartId }).catch(() => undefined);
  },
};
