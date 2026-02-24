import { useRef, useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { cn } from '~/lib/utils';
import type { DetectionRegion } from '~/types/detection.types';

// Points order (clockwise): N, NE, E, SE, S, SW, W, NW
const HANDLE_CURSORS = [
  'n-resize',
  'ne-resize',
  'e-resize',
  'se-resize',
  'n-resize',
  'sw-resize',
  'e-resize',
  'nw-resize',
];

type Interaction =
  | { kind: 'none' }
  | { kind: 'draw'; startX: number; startY: number }
  | { kind: 'move'; regionIndex: number; offsetX: number; offsetY: number }
  | { kind: 'move-handle'; regionIndex: number; handleIndex: number };

interface RegionEditorProps {
  regions: DetectionRegion[];
  onChange: (regions: DetectionRegion[]) => void;
  snapshotUrl?: string;
  className?: string;
}

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}

function getRelativeCoords(e: MouseEvent | React.MouseEvent, container: HTMLDivElement) {
  const rect = container.getBoundingClientRect();
  return {
    x: clamp((e.clientX - rect.left) / rect.width, 0, 1),
    y: clamp((e.clientY - rect.top) / rect.height, 0, 1),
  };
}

/** Gera 8 pontos (N, NE, E, SE, S, SW, W, NW) a partir de um retângulo */
export function rectToPoints(x: number, y: number, w: number, h: number) {
  return [
    { x: x + w / 2, y: y }, // N
    { x: x + w, y: y }, // NE
    { x: x + w, y: y + h / 2 }, // E
    { x: x + w, y: y + h }, // SE
    { x: x + w / 2, y: y + h }, // S
    { x: x, y: y + h }, // SW
    { x: x, y: y + h / 2 }, // W
    { x: x, y: y }, // NW
  ];
}

/** Retorna os pontos da região (converte retângulo se necessário) */
function getPoints(region: DetectionRegion) {
  if (region.points && region.points.length >= 3) return region.points;
  return rectToPoints(region.x, region.y, region.width, region.height);
}

/** Bounding box dos pontos para manter compatibilidade com x/y/width/height */
function boundingBox(points: Array<{ x: number; y: number }>) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  return { x: minX, y: minY, width: Math.max(...xs) - minX, height: Math.max(...ys) - minY };
}

function computeCentroid(points: Array<{ x: number; y: number }>) {
  const s = points.reduce((a, p) => ({ x: a.x + p.x, y: a.y + p.y }), { x: 0, y: 0 });
  return { x: s.x / points.length, y: s.y / points.length };
}

function toSvgPoints(points: Array<{ x: number; y: number }>) {
  return points.map((p) => `${(p.x * 100).toFixed(3)},${(p.y * 100).toFixed(3)}`).join(' ');
}

export function RegionEditor({ regions, onChange, snapshotUrl, className }: RegionEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [interaction, setInteraction] = useState<Interaction>({ kind: 'none' });
  const [preview, setPreview] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  // Refs para evitar closures obsoletas nos listeners do documento
  const interactionRef = useRef<Interaction>({ kind: 'none' });
  const regionsRef = useRef(regions);
  regionsRef.current = regions;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const setInteractionBoth = useCallback((i: Interaction) => {
    interactionRef.current = i;
    setInteraction(i);
  }, []);

  // Listeners globais para arrastar além dos limites do canvas
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const current = interactionRef.current;
      if (current.kind === 'none') return;

      const { x, y } = getRelativeCoords(e, containerRef.current);
      const currentRegions = regionsRef.current;

      if (current.kind === 'draw') {
        const rx = Math.min(current.startX, x);
        const ry = Math.min(current.startY, y);
        setPreview({
          x: rx,
          y: ry,
          width: Math.abs(x - current.startX),
          height: Math.abs(y - current.startY),
        });
      } else if (current.kind === 'move') {
        const { regionIndex, offsetX, offsetY } = current;
        const region = currentRegions[regionIndex];
        const points = getPoints(region);
        const bb = boundingBox(points);
        const newX = clamp(x - offsetX, 0, 1 - bb.width);
        const newY = clamp(y - offsetY, 0, 1 - bb.height);
        const dx = newX - bb.x;
        const dy = newY - bb.y;
        const newPoints = points.map((p) => ({ x: p.x + dx, y: p.y + dy }));
        const newBb = boundingBox(newPoints);
        onChangeRef.current(
          currentRegions.map((r, i) =>
            i === regionIndex ? { ...r, ...newBb, points: newPoints } : r
          )
        );
      } else if (current.kind === 'move-handle') {
        const { regionIndex, handleIndex } = current;
        const region = currentRegions[regionIndex];
        const points = getPoints(region);
        const newPoints = points.map((p, vi) =>
          vi === handleIndex ? { x: clamp(x, 0, 1), y: clamp(y, 0, 1) } : p
        );
        const newBb = boundingBox(newPoints);
        onChangeRef.current(
          currentRegions.map((r, i) =>
            i === regionIndex ? { ...r, ...newBb, points: newPoints } : r
          )
        );
      }
    };

    const handleUp = (e: MouseEvent) => {
      const current = interactionRef.current;
      if (current.kind === 'draw' && containerRef.current) {
        const { x, y } = getRelativeCoords(e, containerRef.current);
        const rx = Math.min(current.startX, x);
        const ry = Math.min(current.startY, y);
        const rw = Math.abs(x - current.startX);
        const rh = Math.abs(y - current.startY);
        if (rw >= 0.02 && rh >= 0.02) {
          const currentRegions = regionsRef.current;
          const points = rectToPoints(rx, ry, rw, rh);
          onChangeRef.current([
            ...currentRegions,
            {
              name: `Região ${currentRegions.length + 1}`,
              x: rx,
              y: ry,
              width: rw,
              height: rh,
              tag: 'motion',
              points,
            },
          ]);
        }
        setPreview(null);
      }
      if (current.kind !== 'none') setInteractionBoth({ kind: 'none' });
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
  }, [setInteractionBoth]);

  const handleContainerMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      e.preventDefault();
      const { x, y } = getRelativeCoords(e, containerRef.current);
      setInteractionBoth({ kind: 'draw', startX: x, startY: y });
      setPreview(null);
    },
    [setInteractionBoth]
  );

  const handleRegionMouseDown = useCallback(
    (e: React.MouseEvent, index: number) => {
      if (!containerRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      const { x, y } = getRelativeCoords(e, containerRef.current);
      const region = regions[index];
      const bb = boundingBox(getPoints(region));
      setInteractionBoth({
        kind: 'move',
        regionIndex: index,
        offsetX: x - bb.x,
        offsetY: y - bb.y,
      });
    },
    [regions, setInteractionBoth]
  );

  const handleHandleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, regionIndex: number, handleIndex: number) => {
      e.preventDefault();
      e.stopPropagation();
      setInteractionBoth({ kind: 'move-handle', regionIndex, handleIndex });
    },
    [setInteractionBoth]
  );

  const handleDelete = useCallback(
    (index: number) => {
      onChange(regions.filter((_, i) => i !== index));
    },
    [regions, onChange]
  );

  const containerCursor =
    interaction.kind === 'move'
      ? 'grabbing'
      : interaction.kind === 'move-handle'
        ? 'grabbing'
        : 'crosshair';

  const primaryColor = 'hsl(var(--primary))';
  const primaryFill = 'rgba(220, 38, 38, 0.47)';

  return (
    <div className={cn('space-y-2', className)}>
      <div
        ref={containerRef}
        className="relative w-full rounded-md border border-border bg-muted select-none"
        style={{ aspectRatio: '16/9', cursor: containerCursor }}
        onMouseDown={handleContainerMouseDown}
      >
        {snapshotUrl ? (
          <img
            src={snapshotUrl}
            alt="Camera snapshot"
            className="absolute inset-0 h-full w-full object-cover pointer-events-none"
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground pointer-events-none">
            Sem imagem — desenhe uma região
          </div>
        )}

        {/* SVG: regiões e preview */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {regions.map((region, index) => {
            const pts = getPoints(region);
            return (
              <polygon
                key={index}
                points={toSvgPoints(pts)}
                fill={primaryFill}
                stroke={primaryColor}
                strokeWidth="0.4"
                style={{
                  cursor:
                    interaction.kind === 'move' && interaction.regionIndex === index
                      ? 'grabbing'
                      : 'grab',
                }}
                onMouseDown={(e) => handleRegionMouseDown(e, index)}
              />
            );
          })}

          {/* Preview ao desenhar */}
          {preview && (
            <rect
              x={(preview.x * 100).toFixed(3)}
              y={(preview.y * 100).toFixed(3)}
              width={(preview.width * 100).toFixed(3)}
              height={(preview.height * 100).toFixed(3)}
              fill="none"
              stroke={primaryColor}
              strokeWidth="0.4"
              strokeDasharray="2 1"
              opacity="0.6"
              style={{ pointerEvents: 'none' }}
            />
          )}
        </svg>

        {/* Handles dos pontos (HTML para drag preciso) */}
        {regions.map((region, index) => {
          const pts = getPoints(region);
          return pts.map((pt, hi) => (
            <div
              key={`h-${index}-${hi}`}
              className="absolute z-20 h-3 w-3 rounded-sm border-2 border-primary bg-white shadow-sm"
              style={{
                left: `${pt.x * 100}%`,
                top: `${pt.y * 100}%`,
                transform: 'translate(-50%, -50%)',
                cursor: HANDLE_CURSORS[hi],
              }}
              onMouseDown={(e) => handleHandleMouseDown(e, index, hi)}
            />
          ));
        })}

        {/* Labels e botões de deletar */}
        {regions.map((region, index) => {
          const pts = getPoints(region);
          const c = computeCentroid(pts);
          return (
            <div
              key={`lbl-${index}`}
              className="absolute z-10 flex items-center gap-1 bg-primary px-1 py-0.5 text-[10px] text-primary-foreground leading-none"
              style={{
                left: `${c.x * 100}%`,
                top: `${c.y * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <span className="pointer-events-none">{region.name}</span>
              <button
                type="button"
                className="hover:text-destructive-foreground"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleDelete(index);
                }}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Clique e arraste para desenhar • Arraste a região para mover • Arraste os pontos para
        remodelar
      </p>
    </div>
  );
}
