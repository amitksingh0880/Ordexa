import { apiHttp } from "./http";
import { TENANT_ENDPOINTS } from "../constants/app";
import type { TenantOption, Tenant, TenantConfig } from "../types/domain";

export const tenantsApi = {
  async list(): Promise<TenantOption[]> {
    const { data } = await apiHttp.get<{ data: TenantOption[] }>(TENANT_ENDPOINTS.list);
    return data.data;
  },
  async get(id: string): Promise<Tenant> {
    const { data } = await apiHttp.get<{ data: Tenant }>(`${TENANT_ENDPOINTS.list}/${id}`);
    return data.data;
  },
  async updateConfig(id: string, config: TenantConfig): Promise<void> {
    await apiHttp.patch(`${TENANT_ENDPOINTS.list}/${id}`, { config });
  },
};
