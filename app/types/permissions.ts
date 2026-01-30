export interface Permission {
  id: number;
  resource: string;
  action: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RolePermissions {
  id: number;
  name: string;
  description: string;
  hierarchy: number;
  isActive: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  permissions: Permission[];
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  hierarchy?: number;
  isActive?: boolean;
  permissions: string[];
}

export interface UpdateRoleDto {
  description?: string;
  hierarchy?: number;
  isActive?: boolean;
  permissions?: string[];
}
