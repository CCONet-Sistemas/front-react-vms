import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { videoService, type VideoListParams } from '~/services/api/videoService';

export const videoKeys = {
  all: ['videos'] as const,
  lists: () => [...videoKeys.all, 'list'] as const,
  list: (params?: VideoListParams) => [...videoKeys.lists(), params] as const,
  details: () => [...videoKeys.all, 'detail'] as const,
  detail: (uuid: string) => [...videoKeys.details(), uuid] as const,
};

export function useVideos(params?: VideoListParams) {
  return useQuery({
    queryKey: videoKeys.list(params),
    queryFn: () => videoService.list(params),
    staleTime: 30000,
  });
}

export function useVideo(uuid: string) {
  return useQuery({
    queryKey: videoKeys.detail(uuid),
    queryFn: () => videoService.getById(uuid),
    enabled: !!uuid,
  });
}

export function useDeleteVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: videoService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: videoKeys.lists() });
    },
  });
}
