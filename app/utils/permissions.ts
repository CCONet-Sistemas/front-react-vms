import { redirect } from 'react-router';
import { useAuthStore } from '~/store/auth.store';
import type { Permission, Resource, Action } from '~/types';

/**
 * Get current user permissions from store
 */
export function getUserPermissions(): Permission[] {
  const user = useAuthStore.getState().user;
  return user?.roles?.permissions ?? [];
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(permission: Permission): boolean {
  return getUserPermissions().includes(permission);
}

/**
 * Check if user can access a resource with a specific action
 */
export function canAccess(resource: Resource, action: Action): boolean {
  return hasPermission(`${resource}:${action}` as Permission);
}

/**
 * Check if user has any of the given permissions
 */
export function hasAnyPermission(permissions: Permission[]): boolean {
  const userPermissions = getUserPermissions();
  return permissions.some((p) => userPermissions.includes(p));
}

/**
 * Check if user has all of the given permissions
 */
export function hasAllPermissions(permissions: Permission[]): boolean {
  const userPermissions = getUserPermissions();
  return permissions.every((p) => userPermissions.includes(p));
}

/**
 * Route guard - use in clientLoader to protect routes
 * Redirects to /forbidden if user lacks permission
 */
export function requirePermission(permission: Permission, redirectTo = '/forbidden') {
  if (!hasPermission(permission)) {
    throw redirect(redirectTo);
  }
}

/**
 * Route guard - require access to resource with action
 */
export function requireAccess(resource: Resource, action: Action, redirectTo = '/forbidden') {
  if (!canAccess(resource, action)) {
    throw redirect(redirectTo);
  }
}

/**
 * Route guard - require any of the given permissions
 */
export function requireAnyPermission(permissions: Permission[], redirectTo = '/forbidden') {
  if (!hasAnyPermission(permissions)) {
    throw redirect(redirectTo);
  }
}
