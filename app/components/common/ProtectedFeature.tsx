import type { ReactNode } from 'react';
import { usePermissions } from '~/hooks/usePermissions';
import type { Permission, Resource, Action } from '~/types';

interface ProtectedFeatureProps {
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
  /** Fallback content when user lacks permission */
  fallback?: ReactNode;
}

export function ProtectedFeature({
  children,
  permission,
  resource,
  action,
  anyOf,
  allOf,
  fallback = null,
}: ProtectedFeatureProps) {
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
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
