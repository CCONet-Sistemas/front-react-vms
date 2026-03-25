import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cameraService } from '~/services/api/cameraService';
import type { UpdatePtzConfigDto } from '~/types/camera.types';

interface UpdatePtzConfigParams {
  cameraId: string;
  config: UpdatePtzConfigDto;
}

export const useUpdatePtzConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cameraId, config }: UpdatePtzConfigParams) =>
      cameraService.updatePtzConfig(cameraId, config),
    onSuccess: (data, variables) => {
      // Invalida a query da câmera específica
      queryClient.invalidateQueries({ queryKey: ['cameras', variables.cameraId] });
      // Invalida a lista de câmeras
      queryClient.invalidateQueries({ queryKey: ['cameras', 'list'] });
    },
  });
};
