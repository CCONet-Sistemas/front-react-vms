import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, type UserListResponse } from '~/services/api/userService';
import type { UserListParams, CreateUserDto, UpdateUserDto } from '~/types';

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params?: UserListParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (uuid: string) => [...userKeys.details(), uuid] as const,
  me: () => [...userKeys.all, 'me'] as const,
};

export function useUsers(params?: UserListParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userService.list(params),
    staleTime: 30000,
  });
}

export function useUser(uuid: string) {
  return useQuery({
    queryKey: userKeys.detail(uuid),
    queryFn: () => userService.getById(uuid),
    enabled: !!uuid,
  });
}

export function useMe() {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: () => userService.getMe(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserDto) => userService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: UpdateUserDto }) =>
      userService.update(uuid, data),
    onSuccess: (_, { uuid }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(uuid) });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => userService.delete(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}
