import { useState, useEffect } from 'react';
import { Check, Camera, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Badge } from '~/components/ui/badge';
import { cn } from '~/lib/utils';
import { useCameras } from '~/features/cameras';
import type { Camera as CameraType } from '~/types';

const ITEMS_PER_PAGE = 10;

interface CameraSelectorProps {
  selectedCameras: (CameraType | null)[];
  onSelectionChange: (cameras: (CameraType | null)[]) => void;
  maxCameras: number;
  isOpen: boolean;
  onClose: () => void;
  initialCameras?: CameraType[]; // For auto-fill functionality
}

export function CameraSelector({
  selectedCameras,
  onSelectionChange,
  maxCameras,
  isOpen,
  onClose,
  initialCameras = [],
}: CameraSelectorProps) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editingSlot, setEditingSlot] = useState<number | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page when search changes
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearch('');
      setDebouncedSearch('');
      setPage(1);
      setEditingSlot(null);
    }
  }, [isOpen]);

  const { data, isLoading } = useCameras({
    page,
    limit: ITEMS_PER_PAGE,
    search: debouncedSearch || undefined,
  });

  const cameras = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

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
    // Use initialCameras if available, otherwise use current page cameras
    const sourceCameras = initialCameras.length > 0 ? initialCameras : cameras;
    const newSelection: (CameraType | null)[] = [];
    for (let i = 0; i < maxCameras; i++) {
      newSelection.push(sourceCameras[i] || null);
    }
    onSelectionChange(newSelection);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-modal bg-surface rounded-lg shadow-xl w-full max-w-4xl min-h-[500px] max-h-[90vh] overflow-hidden flex flex-col m-4">
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
          <div className="w-1/2 p-4 flex flex-col">
            <div className="mb-4">
              {/* <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Câmeras Disponíveis</h3>
                <span className="text-xs text-muted-foreground">{total} câmeras</span>
              </div> */}
              <Input
                label="Buscar câmera"
                leftIcon={<Search className="h-4 w-4" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-pulse text-sm text-muted-foreground">Carregando...</div>
                </div>
              ) : cameras.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma câmera encontrada
                </p>
              ) : (
                cameras.map((camera) => {
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t mt-4">
                <span className="text-xs text-muted-foreground">
                  Página {page} de {totalPages}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
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
