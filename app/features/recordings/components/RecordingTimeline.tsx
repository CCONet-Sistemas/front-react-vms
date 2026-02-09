import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Slider } from '~/components/ui/slider';
import type { RecordingSessions } from '~/types/recordings.types';

interface RecordingTimelineProps {
  sessions: RecordingSessions[];
  currentTime: Date | null;
  onTimeSelect: (time: Date, sessionUuid: string) => void;
}

const SECONDS_IN_DAY = 86400;
const MIN_ZOOM = 1;
const MAX_ZOOM = 12;

interface Segment {
  startPercent: number;
  widthPercent: number;
  sessionUuid: string;
  startTime: Date;
  endTime: Date;
}

function getStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getHourLabels(zoom: number): number[] {
  const labels: number[] = [];
  let step: number;
  if (zoom >= 8) step = 0.5;
  else if (zoom >= 4) step = 1;
  else if (zoom >= 2) step = 2;
  else step = 3;

  for (let h = 0; h <= 24; h += step) {
    labels.push(h);
  }
  return labels;
}

function formatHourLabel(hour: number): string {
  if (Number.isInteger(hour)) return `${hour}h`;
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  return `${h}:${m.toString().padStart(2, '0')}`;
}

export function RecordingTimeline({
  sessions,
  currentTime,
  onTimeSelect,
}: RecordingTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; scrollLeft: number } | null>(null);

  const dayStart = useMemo(() => {
    if (sessions.length === 0) return getStartOfDay(new Date());
    const earliest = sessions.reduce((min, s) => {
      const d = new Date(s.startedAt);
      return d < min ? d : min;
    }, new Date(sessions[0].startedAt));
    return getStartOfDay(earliest);
  }, [sessions]);

  const segments: Segment[] = useMemo(() => {
    return sessions.map((session) => {
      const start = new Date(session.startedAt);
      const end = new Date(session.stoppedAt || session.lastSegmentAt);
      const startSec = (start.getTime() - dayStart.getTime()) / 1000;
      const endSec = (end.getTime() - dayStart.getTime()) / 1000;
      const startPercent = Math.max(0, (startSec / SECONDS_IN_DAY) * 100);
      const widthPercent = Math.max(0.1, ((endSec - startSec) / SECONDS_IN_DAY) * 100);

      return {
        startPercent,
        widthPercent,
        sessionUuid: session.uuid,
        startTime: start,
        endTime: end,
      };
    });
  }, [sessions, dayStart]);

  const playheadPercent = useMemo(() => {
    if (!currentTime) return null;
    const sec = (currentTime.getTime() - dayStart.getTime()) / 1000;
    if (sec < 0 || sec > SECONDS_IN_DAY) return null;
    return (sec / SECONDS_IN_DAY) * 100;
  }, [currentTime, dayStart]);

  const hourLabels = useMemo(() => getHourLabels(zoom), [zoom]);

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom)));
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.5 : 0.5;
        handleZoomChange(zoom + delta);
      }
    },
    [zoom, handleZoomChange],
  );

  const handleTrackClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isDragging) return;
      const track = trackRef.current;
      if (!track) return;

      const rect = track.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = (x / rect.width) * 100;

      const clickedSegment = segments.find(
        (seg) =>
          percent >= seg.startPercent &&
          percent <= seg.startPercent + seg.widthPercent,
      );

      if (clickedSegment) {
        const secInDay = (percent / 100) * SECONDS_IN_DAY;
        const clickedTime = new Date(dayStart.getTime() + secInDay * 1000);
        onTimeSelect(clickedTime, clickedSegment.sessionUuid);
      }
    },
    [segments, dayStart, onTimeSelect, isDragging],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom <= 1) return;
      const container = containerRef.current;
      if (!container) return;
      setIsDragging(false);
      dragStartRef.current = {
        x: e.clientX,
        scrollLeft: container.scrollLeft,
      };
    },
    [zoom],
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current) return;
      const container = containerRef.current;
      if (!container) return;

      const dx = e.clientX - dragStartRef.current.x;
      if (Math.abs(dx) > 3) setIsDragging(true);
      container.scrollLeft = dragStartRef.current.scrollLeft - dx;
    };

    const handleMouseUp = () => {
      dragStartRef.current = null;
      setTimeout(() => setIsDragging(false), 0);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Auto-scroll to playhead when it changes
  useEffect(() => {
    if (playheadPercent === null || zoom <= 1) return;
    const container = containerRef.current;
    if (!container) return;

    const trackWidth = container.scrollWidth;
    const playheadX = (playheadPercent / 100) * trackWidth;
    const containerWidth = container.clientWidth;
    const targetScroll = playheadX - containerWidth / 2;

    container.scrollTo({ left: targetScroll, behavior: 'smooth' });
  }, [playheadPercent, zoom]);

  return (
    <div className="w-full space-y-2">
      {/* Timeline track */}
      <div
        ref={containerRef}
        className="relative overflow-x-auto scrollbar-thin scrollbar-thumb-muted-foreground/20"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        style={{ cursor: zoom > 1 ? 'grab' : 'default' }}
      >
        <div
          ref={trackRef}
          className="relative h-12 bg-muted/50 rounded-md"
          style={{ width: `${zoom * 100}%`, minWidth: '100%' }}
          onClick={handleTrackClick}
        >
          {/* Hour labels */}
          {hourLabels.map((hour) => {
            const percent = (hour / 24) * 100;
            return (
              <div
                key={hour}
                className="absolute top-0 h-full flex flex-col items-center pointer-events-none"
                style={{ left: `${percent}%` }}
              >
                <span className="text-[10px] text-muted-foreground select-none leading-none pt-0.5">
                  {formatHourLabel(hour)}
                </span>
                <div className="w-px h-full bg-muted-foreground/20" />
              </div>
            );
          })}

          {/* Recording segments */}
          {segments.map((seg) => (
            <div
              key={seg.sessionUuid}
              className="absolute bottom-0 h-7 bg-blue-500/80 hover:bg-blue-400 rounded-sm cursor-pointer transition-colors"
              style={{
                left: `${seg.startPercent}%`,
                width: `${seg.widthPercent}%`,
              }}
              title={`${seg.startTime.toLocaleTimeString()} - ${seg.endTime.toLocaleTimeString()}`}
            />
          ))}

          {/* Playhead */}
          {playheadPercent !== null && (
            <div
              className="absolute top-0 h-full w-0.5 bg-red-500 z-10 pointer-events-none"
              style={{ left: `${playheadPercent}%` }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-red-500 rounded-full" />
            </div>
          )}
        </div>
      </div>

      {/* Zoom controls */}
      <div className="flex items-center gap-3 px-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => handleZoomChange(zoom - 1)}
          disabled={zoom <= MIN_ZOOM}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Slider
          value={[zoom]}
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={0.5}
          onValueChange={([v]) => handleZoomChange(v)}
          className="flex-1"
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => handleZoomChange(zoom + 1)}
          disabled={zoom >= MAX_ZOOM}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <span className="text-xs text-muted-foreground w-10 text-right">
          {zoom.toFixed(1)}x
        </span>
      </div>
    </div>
  );
}
