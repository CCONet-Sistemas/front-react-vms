import { useCallback, useMemo } from 'react';
import { useAuthStore } from '~/store/auth.store';
import type { Permission, Resource, Action } from '~/types';

export function usePermissions() {
  const user = useAuthStore((state) => state.user);

  const permissions = useMemo(() => {
    return user?.roles?.permissions ?? [];
  }, [user?.roles?.permissions]);

  const roleNames = useMemo(() => {
    return user?.roles?.name ?? [];
  }, [user?.roles?.name]);

  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      return permissions.includes(permission);
    },
    [permissions]
  );

  const hasAnyPermission = useCallback(
    (permissionList: Permission[]): boolean => {
      return permissionList.some((p) => permissions.includes(p));
    },
    [permissions]
  );

  const hasAllPermissions = useCallback(
    (permissionList: Permission[]): boolean => {
      return permissionList.every((p) => permissions.includes(p));
    },
    [permissions]
  );

  const canAccess = useCallback(
    (resource: Resource, action: Action): boolean => {
      return permissions.includes(`${resource}:${action}` as Permission);
    },
    [permissions]
  );

  const hasRole = useCallback(
    (roleName: string): boolean => {
      return roleNames.includes(roleName);
    },
    [roleNames]
  );

  const isAdmin = useMemo(() => {
    return roleNames.includes('admin');
  }, [roleNames]);

  return {
    permissions,
    roleNames,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccess,
    hasRole,
    isAdmin,
  };
}
