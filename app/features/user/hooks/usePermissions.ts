import { useQuery } from "@tanstack/react-query";
import { permissionsService } from "~/services/api/authorizationService";

export const permissionsKeys = {
  all: ['permissions'] as const,
  lists: () => [...permissionsKeys.all, 'list'] as const,
  list: () => [...permissionsKeys.lists()] as const,

}


export function useUserPermissions() {
  return useQuery({
    queryKey: permissionsKeys.list(),
    queryFn: () => permissionsService.listPermissions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUserRolesPermissions() {
  return useQuery({
    queryKey: permissionsKeys.list(),
    queryFn: () => permissionsService.listRoles(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
