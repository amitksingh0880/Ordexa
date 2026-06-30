import { apiHttp } from "./http";
import { ACCESS_ENDPOINTS } from "../constants/app";
import type { AccessPermission, AccessRole, AccessUser } from "../types/domain";

export const accessApi = {
  async permissions(): Promise<AccessPermission[]> {
    const { data } = await apiHttp.get<{ data: AccessPermission[] }>(ACCESS_ENDPOINTS.permissions);
    return data.data;
  },
  async sync(): Promise<number> {
    const { data } = await apiHttp.post<{ data: { synced: number } }>(ACCESS_ENDPOINTS.sync);
    return data.data.synced;
  },
  async roles(): Promise<AccessRole[]> {
    const { data } = await apiHttp.get<{ data: AccessRole[] }>(ACCESS_ENDPOINTS.roles);
    return data.data;
  },
  async saveRole(role: Partial<AccessRole>): Promise<AccessRole> {
    const { data } = await apiHttp.post<{ data: AccessRole }>(ACCESS_ENDPOINTS.roles, role);
    return data.data;
  },
  async deleteRole(id: string): Promise<void> {
    await apiHttp.delete(`${ACCESS_ENDPOINTS.roles}/${id}`);
  },
  async assignRolePermissions(roleId: string, permissionIds: string[]): Promise<void> {
    await apiHttp.post(`${ACCESS_ENDPOINTS.roles}/${roleId}/permissions`, permissionIds);
  },
  async users(): Promise<AccessUser[]> {
    const { data } = await apiHttp.get<{ data: AccessUser[] }>(ACCESS_ENDPOINTS.users);
    return data.data;
  },
  async assignUserRoles(userId: string, roleIds: string[]): Promise<void> {
    await apiHttp.post(`${ACCESS_ENDPOINTS.users}/${userId}/roles`, roleIds);
  },
};
