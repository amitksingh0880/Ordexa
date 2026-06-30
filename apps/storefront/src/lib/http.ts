import axios, { type AxiosInstance } from "axios";
import { API_BASE_URL } from "./api";
import { API, STORAGE_KEYS } from "../constants/app";

let token: string | null = localStorage.getItem(STORAGE_KEYS.token);

export const getToken = (): string | null => token;

export const setToken = (next: string | null): void => {
  token = next;
  if (next) localStorage.setItem(STORAGE_KEYS.token, next);
  else localStorage.removeItem(STORAGE_KEYS.token);
};

const attach = (instance: AxiosInstance): AxiosInstance => {
  instance.defaults.withCredentials = true;
  instance.interceptors.request.use((cfg) => {
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
  });
  return instance;
};

export const apiHttp = attach(axios.create({ baseURL: `${API_BASE_URL}${API.crudBasePath}` }));
export const authHttp = attach(axios.create({ baseURL: `${API_BASE_URL}${API.authBasePath}` }));
export const paymentsHttp = attach(axios.create({ baseURL: `${API_BASE_URL}${API.paymentsBasePath}` }));
