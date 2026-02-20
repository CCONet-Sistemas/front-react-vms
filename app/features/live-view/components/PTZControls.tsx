import { useMutation } from '@tanstack/react-query';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { cameraService, type PtzCommand } from '~/services/api/cameraService';

interface PTZControlsProps {
  cameraUuid: string;
}

export function PTZControls({ cameraUuid }: PTZControlsProps) {
  const { mutate: sendCommand } = useMutation({
    mutationFn: (command: PtzCommand) => cameraService.ptz(cameraUuid, command),
  });

  const btnClass = 'h-9 w-9 text-white hover:bg-white/20 active:bg-white/30';

  return (
    <div className="flex items-center gap-4">
      {/* D-pad */}
      <div className="grid grid-cols-3 grid-rows-3 gap-0.5 w-[108px]">
        {/* Row 1 */}
        <div />
        <Button
          variant="ghost"
          size="icon"
          className={btnClass}
          onClick={() => sendCommand('up')}
          aria-label="PTZ cima"
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
        <div />

        {/* Row 2 */}
        <Button
          variant="ghost"
          size="icon"
          className={btnClass}
          onClick={() => sendCommand('left')}
          aria-label="PTZ esquerda"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center">
          <span className="block h-2 w-2 rounded-full bg-white/60" />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={btnClass}
          onClick={() => sendCommand('right')}
          aria-label="PTZ direita"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>

        {/* Row 3 */}
        <div />
        <Button
          variant="ghost"
          size="icon"
          className={btnClass}
          onClick={() => sendCommand('down')}
          aria-label="PTZ baixo"
        >
          <ChevronDown className="h-5 w-5" />
        </Button>
        <div />
      </div>

      {/* Zoom */}
      <div className="flex flex-col gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          className={btnClass}
          onClick={() => sendCommand('zoom_in')}
          aria-label="Zoom in"
        >
          <ZoomIn className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={btnClass}
          onClick={() => sendCommand('zoom_out')}
          aria-label="Zoom out"
        >
          <ZoomOut className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
