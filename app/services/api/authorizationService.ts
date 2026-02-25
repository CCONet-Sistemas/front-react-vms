import type { RolePermissions, CreateRoleDto, UpdateRoleDto } from "~/types/permissions";
import apiClient from "./client";
import type { Permission } from "~/types";

export const permissionsService = {
  listRoles: async (): Promise<RolePermissions[]> => {
    const { data } = await apiClient.get<{ data: RolePermissions[]; meta: unknown }>(
      '/authorization/roles'
    );
    return data.data;
  },
  createRole: async (payload: CreateRoleDto): Promise<RolePermissions> => {
    const { data } = await apiClient.post<RolePermissions>('/authorization/roles', payload);
    return data;
  },
  listPermissions: async (): Promise<Permission[]> => {
    const { data } = await apiClient.get<Permission[]>('/authorization/permissions');
    return data;
  },
  updateRole: async (roleId: number, payload: UpdateRoleDto): Promise<RolePermissions> => {
    const { data } = await apiClient.put<RolePermissions>(`/authorization/roles/${roleId}`, payload);
    return data;
  }
};
