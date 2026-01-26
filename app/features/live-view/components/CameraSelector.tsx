import { useState } from 'react';
import { Check, Camera, Search, X } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Badge } from '~/components/ui/badge';
import { cn } from '~/lib/utils';
import type { Camera as CameraType } from '~/types';

interface CameraSelectorProps {
  cameras: CameraType[];
  selectedCameras: (CameraType | null)[];
  onSelectionChange: (cameras: (CameraType | null)[]) => void;
  maxCameras: number;
  isOpen: boolean;
  onClose: () => void;
}

export function CameraSelector({
  cameras,
  selectedCameras,
  onSelectionChange,
  maxCameras,
  isOpen,
  onClose,
}: CameraSelectorProps) {
  const [search, setSearch] = useState('');
  const [editingSlot, setEditingSlot] = useState<number | null>(null);

  const filteredCameras = cameras.filter((camera) =>
    camera.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedUuids = selectedCameras.filter(Boolean).map((c) => c!.uuid);

  const handleSelectCamera = (camera: CameraType) => {
    if (editingSlot !== null) {
      // Replace camera in specific slot
      const newSelection = [...selectedCameras];
      newSelection[editingSlot] = camera;
      onSelectionChange(newSelection);
      setEditingSlot(null);
    } else {
      // Add to first empty slot
      const emptyIndex = selectedCameras.findIndex((c) => c === null);
      if (emptyIndex !== -1) {
        const newSelection = [...selectedCameras];
        newSelection[emptyIndex] = camera;
        onSelectionChange(newSelection);
      } else if (selectedCameras.length < maxCameras) {
        onSelectionChange([...selectedCameras, camera]);
      }
    }
  };

  const handleRemoveCamera = (index: number) => {
    const newSelection = [...selectedCameras];
    newSelection[index] = null;
    onSelectionChange(newSelection);
  };

  const handleClearAll = () => {
    onSelectionChange(Array(maxCameras).fill(null));
  };

  const handleAutoFill = () => {
    const newSelection: (CameraType | null)[] = [];
    for (let i = 0; i < maxCameras; i++) {
      newSelection.push(cameras[i] || null);
    }
    onSelectionChange(newSelection);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-modal bg-surface rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Configurar Mosaico</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Selected cameras grid */}
          <div className="w-1/2 p-4 border-r overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">
                Slots do Mosaico ({selectedCameras.filter(Boolean).length}/{maxCameras})
              </h3>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={handleAutoFill}>
                  Auto-preencher
                </Button>
                <Button variant="destructive" size="sm" onClick={handleClearAll}>
                  Limpar
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: maxCameras }).map((_, index) => {
                const camera = selectedCameras[index];
                const isEditing = editingSlot === index;

                return (
                  <div
                    key={index}
                    className={cn(
                      'relative p-3 rounded-lg border-2 border-dashed min-h-[80px] flex items-center justify-center cursor-pointer transition-colors',
                      camera
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/30 hover:border-muted-foreground/50',
                      isEditing && 'ring-2 ring-primary'
                    )}
                    onClick={() => setEditingSlot(isEditing ? null : index)}
                  >
                    {camera ? (
                      <div className="flex items-center gap-2 w-full">
                        <Camera className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium truncate flex-1">{camera.name}</span>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="h-6 w-6 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveCamera(index);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <span className="text-xs">Slot {index + 1}</span>
                        {isEditing && <p className="text-xs mt-1">Selecione uma câmera</p>}
                      </div>
                    )}
                    <Badge className="absolute -top-2 -left-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Available cameras list */}
          <div className="w-1/2 p-4 overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Câmeras Disponíveis</h3>
              <Input
                placeholder="Buscar câmera..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="h-4 w-4 " />}
              />
            </div>

            <div className="space-y-1">
              {filteredCameras.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma câmera encontrada
                </p>
              ) : (
                filteredCameras.map((camera) => {
                  const isSelected = selectedUuids.includes(camera.uuid);
                  const isOnline = camera.streamStatus?.state === 'streaming';

                  return (
                    <div
                      key={camera.uuid}
                      className={cn(
                        'flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors',
                        isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-accent'
                      )}
                      onClick={() => handleSelectCamera(camera)}
                    >
                      <Camera className="h-4 w-4 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{camera.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {camera.connection?.host}
                        </p>
                      </div>
                      <Badge variant={isOnline ? 'success' : 'secondary'} className="shrink-0">
                        {isOnline ? 'Online' : 'Offline'}
                      </Badge>
                      {isSelected && <Check className="h-4 w-4 shrink-0" />}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant={'success'} onClick={onClose}>
            Aplicar
          </Button>
        </div>
      </div>
    </div>
  );
}
