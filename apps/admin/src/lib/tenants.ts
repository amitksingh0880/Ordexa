import { apiHttp } from "./http";
import { TENANT_ENDPOINTS } from "../constants/app";
import type { TenantOption } from "../types/domain";

export const tenantsApi = {
  async list(): Promise<TenantOption[]> {
    const { data } = await apiHttp.get<{ data: TenantOption[] }>(TENANT_ENDPOINTS.list);
    return data.data;
  },
};
