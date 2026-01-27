export interface UserRoles {
  name: string[];
  permissions: Permission[];
}

export interface User {
  uuid: string;
  name: string;
  email: string;
  groupId: number;
  roles: UserRoles;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Resources
export type Resource =
  | 'user'
  | 'camera'
  | 'stream'
  | 'video'
  | 'recording'
  | 'event'
  | 'notification'
  | 'configuration'
  | 'backup'
  | 'media_core'
  | 'role';

// Actions
export type Action = 'create' | 'read' | 'update' | 'delete' | 'execute';

// Permission format: "resource:action"
export type Permission = `${Resource}:${Action}`;

export interface CreateUserDto {
  email: string;
  name: string;
  password: string;
  groupId?: number;
  roleIds?: string[];
  isActive?: boolean;
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
  password?: string;
  groupId?: number;
  roleIds?: string[];
  isActive?: boolean;
}

export interface UserFilters {
  search?: string;
  activeOnly?: boolean;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  activeOnly?: boolean;
}
