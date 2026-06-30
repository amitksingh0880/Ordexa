import axios from "axios";
import { API_BASE_URL } from "./api";
import { API } from "../constants/app";

const http = axios.create({ baseURL: `${API_BASE_URL}${API.crudBasePath}` });

export type ListParams = Record<string, string | number | boolean | undefined>;

export interface CrudClient<T> {
  list(params?: ListParams): Promise<T[]>;
  get(id: string): Promise<T>;
  create(input: Partial<T>): Promise<T>;
  update(id: string, input: Partial<T>): Promise<T>;
  remove(id: string): Promise<void>;
}

export function createCrudClient<T>(resource: string): CrudClient<T> {
  const base = `/${resource}`;
  return {
    async list(params) {
      const { data } = await http.get<{ data: T[] }>(base, { params });
      return data.data;
    },
    async get(id) {
      const { data } = await http.get<{ data: T }>(`${base}/${id}`);
      return data.data;
    },
    async create(input) {
      const { data } = await http.post<{ data: T }>(base, input);
      return data.data;
    },
    async update(id, input) {
      const { data } = await http.patch<{ data: T }>(`${base}/${id}`, input);
      return data.data;
    },
    async remove(id) {
      await http.delete(`${base}/${id}`);
    },
  };
}
