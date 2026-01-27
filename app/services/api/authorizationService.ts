import type { RolePermissions } from "~/types/permissions";
import apiClient from "./client";
import type { Permission } from "~/types";

export const permissionsService = {
  listRoles: async (): Promise<RolePermissions[]> => {
    const { data } = await apiClient.get<RolePermissions[]>('/authorization/roles');
    return data;
  },
  postRoles: async (): Promise<RolePermissions> => {
    const {data} = await apiClient.post(`/authorization/roles`);
    return data;
  },
  listPermissions: async (): Promise<Permission[]> => {
    const { data } = await apiClient.get<Permission[]>('/authorization/permissions');
    return data;
  },
  putRoles: async (roleId: number, permissions: number[]): Promise<RolePermissions> => {
    const {data} = await apiClient.put(`/authorization/roles/${roleId}`, { permissions });
    return data;
  }
};
