import { authHttp, setToken } from "./http";
import { AUTH_ENDPOINTS } from "../constants/app";
import type { AuthUser } from "../types/domain";

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
  async me(): Promise<AuthUser> {
    const { data } = await authHttp.get<{ data: AuthUser }>(AUTH_ENDPOINTS.me);
    return data.data;
  },
  async logout(): Promise<void> {
    await authHttp.post(AUTH_ENDPOINTS.logout).catch(() => undefined);
    setToken(null);
  },
  async updateProfile(input: {
    name?: string;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<AuthUser> {
    const { data } = await authHttp.patch<{ data: AuthUser }>(AUTH_ENDPOINTS.me, input);
    return data.data;
  },
};
