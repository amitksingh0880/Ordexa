import axios, { type AxiosInstance } from "axios";
import { API_BASE_URL } from "./api";
import { API, AUTH_STORAGE_KEY, ROUTES } from "../constants/app";

const TENANT_HEADER = "X-Tenant-Id";
const tenantId = import.meta.env.VITE_TENANT_ID as string | undefined;

let token: string | null = localStorage.getItem(AUTH_STORAGE_KEY);

export const getToken = (): string | null => token;

export const setToken = (next: string | null): void => {
  token = next;
  if (next) localStorage.setItem(AUTH_STORAGE_KEY, next);
  else localStorage.removeItem(AUTH_STORAGE_KEY);
};

const attach = (instance: AxiosInstance): AxiosInstance => {
  instance.defaults.withCredentials = true;
  instance.interceptors.request.use((cfg) => {
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    if (tenantId) cfg.headers[TENANT_HEADER] = tenantId;
    return cfg;
  });
  instance.interceptors.response.use(
    (res) => res,
    (error) => {
      const status = error?.response?.status;
      if (status === 401 && window.location.pathname !== ROUTES.login) {
        setToken(null);
        window.location.assign(ROUTES.login);
      }
      return Promise.reject(error);
    },
  );
  return instance;
};

export const apiHttp = attach(axios.create({ baseURL: `${API_BASE_URL}${API.crudBasePath}` }));
export const authHttp = attach(axios.create({ baseURL: `${API_BASE_URL}${API.authBasePath}` }));
