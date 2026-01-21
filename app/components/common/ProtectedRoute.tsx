import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { usePermissions } from '~/hooks/usePermissions';
import type { Permission, Resource, Action } from '~/types';

interface ProtectedRouteProps {
  children: ReactNode;
  /** Single permission to check */
  permission?: Permission;
  /** Check using resource and action */
  resource?: Resource;
  action?: Action;
  /** Multiple permissions - user needs ANY of these */
  anyOf?: Permission[];
  /** Multiple permissions - user needs ALL of these */
  allOf?: Permission[];
  /** Redirect path when unauthorized (default: /forbidden) */
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  permission,
  resource,
  action,
  anyOf,
  allOf,
  redirectTo = '/forbidden',
}: ProtectedRouteProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, canAccess } = usePermissions();
  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (resource && action) {
    hasAccess = canAccess(resource, action);
  } else if (anyOf && anyOf.length > 0) {
    hasAccess = hasAnyPermission(anyOf);
  } else if (allOf && allOf.length > 0) {
    hasAccess = hasAllPermissions(allOf);
  }

  if (!hasAccess) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
