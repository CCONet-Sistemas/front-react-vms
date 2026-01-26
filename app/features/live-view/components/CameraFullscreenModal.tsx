import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { HLSPlayer } from './HLSPlayer';
import type { Camera } from '~/types';

interface CameraFullscreenModalProps {
  camera: Camera | null;
  isOpen: boolean;
  onClose: () => void;
  /** Navigate to previous camera */
  onPrevious?: () => void;
  /** Navigate to next camera */
  onNext?: () => void;
  /** Show navigation arrows */
  showNavigation?: boolean;
}

export function CameraFullscreenModal({
  camera,
  isOpen,
  onClose,
  onPrevious,
  onNext,
  showNavigation = false,
}: CameraFullscreenModalProps) {
  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          onPrevious?.();
          break;
        case 'ArrowRight':
          onNext?.();
          break;
      }
    },
    [isOpen, onClose, onPrevious, onNext]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !camera) return null;

  // Build HLS URL the same way as CameraMosaicCell
  const streamUrl = camera.streamStatus?.hlsUrl || `${import.meta.env.VITE_API_URL}/stream/${camera.uuid}/hls`;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-white">{camera.name}</h2>
          {camera.connection?.host && (
            <span className="text-sm text-white/60">{camera.connection.host}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Video */}
      <div className="absolute inset-0 flex items-center justify-center">
        <HLSPlayer
          src={streamUrl}
          autoPlay
          muted
          className="w-full h-full object-contain"
        />
      </div>

      {/* Navigation arrows */}
      {showNavigation && (
        <>
          {onPrevious && (
            <button
              onClick={onPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
              aria-label="Câmera anterior"
            >
              <svg
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
          {onNext && (
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
              aria-label="Próxima câmera"
            >
              <svg
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </>
      )}

      {/* Bottom info bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center gap-2 text-white/60 text-sm">
          <span>Pressione ESC para sair</span>
          {showNavigation && <span>• Use ← → para navegar</span>}
        </div>
      </div>
    </div>
  );
}
