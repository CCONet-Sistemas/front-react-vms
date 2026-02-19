import { useState } from 'react';
import { Maximize, Minimize, Pause, Play, Scissors, Volume2, VolumeX } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Slider } from '~/components/ui/slider';
import { Select, SelectOption } from '~/components/ui/select';
import { Progress } from '~/components/ui/progress';
import { cn } from '~/lib/utils';
import type { RecordingSessions } from '~/types/recordings.types';
import type { Event } from '~/types';
import type { DateRange } from '~/components/ui/date-picker';
import { RecordingTimeline } from './RecordingTimeline';
import { RecordingDateFilterDialog } from './RecordingDateFilterDialog';

interface SelectionRange {
  startPercent: number;
  endPercent: number;
}

interface RecordingControlBarProps {
  sessions: RecordingSessions[];
  currentTime: Date | null;
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  isFullscreen: boolean;
  onPlayPause: () => void;
  onMuteToggle: () => void;
  onVolumeChange: (v: number) => void;
  onFullscreen: () => void;
  onTimeSelect: (time: Date, sessionUuid: string) => void;
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange) => void;
  isSelectionMode?: boolean;
  onToggleSelectionMode?: () => void;
  isExtracting?: boolean;
  extractionProgress?: number;
  onSubmitExtraction?: (config: {
    quality: string;
    resolution: string;
    codec: string;
    outputFileName: string;
  }) => void;
  selectionRange?: SelectionRange;
  onSelectionChange?: (range: SelectionRange) => void;
  playbackRate?: number;
  onPlaybackRateChange?: (rate: number) => void;
  events?: Event[];
}

function formatTime(date: Date | null): string {
  if (!date) return '--:--:--';
  return date.toLocaleTimeString('pt-BR', { hour12: false });
}

export function RecordingControlBar({
  sessions,
  currentTime,
  isPlaying,
  isMuted,
  volume,
  isFullscreen,
  onPlayPause,
  onMuteToggle,
  onVolumeChange,
  onFullscreen,
  onTimeSelect,
  dateRange,
  onDateRangeChange,
  isSelectionMode = false,
  onToggleSelectionMode,
  isExtracting = false,
  extractionProgress,
  onSubmitExtraction,
  selectionRange,
  onSelectionChange,
  playbackRate = 1,
  onPlaybackRateChange,
  events = [],
}: RecordingControlBarProps) {
  const [quality, setQuality] = useState('original');
  const [resolution, setResolution] = useState('original');
  const [codec, setCodec] = useState('copy');

  const handleSubmit = () => {
    onSubmitExtraction?.({
      quality,
      resolution,
      codec,
      outputFileName: new Date().toISOString().replace(/[:.]/g, '-') + '.mp4',
    });
  };

  return (
    <div className="w-full bg-background border rounded-b-lg">
      {/* Controls row */}
      <div className="flex items-center gap-2 px-3 py-1.5">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onPlayPause}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onMuteToggle}>
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>

        <Slider
          value={isMuted ? 0 : volume}
          min={0}
          max={100}
          step={1}
          onValueChange={onVolumeChange}
          className="w-24"
        />

        <span className="text-sm font-mono text-muted-foreground ml-2">
          {formatTime(currentTime)}
        </span>

        <Select
          selectSize="sm"
          value={playbackRate}
          onChange={(e) => onPlaybackRateChange?.(Number(e.target.value))}
          className="w-20"
        >
          <SelectOption value={0.5}>0.5×</SelectOption>
          <SelectOption value={1}>1×</SelectOption>
          <SelectOption value={2}>2×</SelectOption>
          <SelectOption value={4}>4×</SelectOption>
          <SelectOption value={10}>10×</SelectOption>
        </Select>

        <div className="flex-1" />

        {dateRange && onDateRangeChange && (
          <RecordingDateFilterDialog value={dateRange} onChange={onDateRangeChange} />
        )}

        <Button
          variant="ghost"
          size="icon"
          className={cn('h-8 w-8 relative', isSelectionMode && 'text-red-500')}
          onClick={onToggleSelectionMode}
        >
          <Scissors className="h-4 w-4" />
          {isExtracting && (
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary animate-pulse" />
          )}
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onFullscreen}>
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </Button>
      </div>

      {/* Timeline */}
      <div className="px-3 pb-2">
        <RecordingTimeline
          sessions={sessions}
          currentTime={currentTime}
          onTimeSelect={onTimeSelect}
          isSelectionMode={isSelectionMode}
          selectionRange={selectionRange}
          onSelectionChange={onSelectionChange}
          events={events}
        />
      </div>

      {/* Extraction panel */}
      {isSelectionMode && (
        <div className="flex items-center gap-3 px-3 pb-2 flex-wrap control-bar pt-4">
          <Select
            selectSize="sm"
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            className="w-28"
          >
            <SelectOption value="original">Original</SelectOption>
            <SelectOption value="high">Alta</SelectOption>
            <SelectOption value="medium">Média</SelectOption>
            <SelectOption value="low">Baixa</SelectOption>
          </Select>

          <Select
            selectSize="sm"
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            className="w-28"
          >
            <SelectOption value="original">Original</SelectOption>
            <SelectOption value="1080p">1080p</SelectOption>
            <SelectOption value="720p">720p</SelectOption>
            <SelectOption value="480p">480p</SelectOption>
          </Select>

          <Select
            selectSize="sm"
            value={codec}
            onChange={(e) => setCodec(e.target.value)}
            className="w-28"
          >
            <SelectOption value="copy">Copiar</SelectOption>
            <SelectOption value="h264">H.264</SelectOption>
            <SelectOption value="h265">H.265</SelectOption>
          </Select>

          <Button size="sm" onClick={handleSubmit}>
            <Scissors className="h-3 w-3 mr-1" />
            Extrair
          </Button>
        </div>
      )}

      {/* Extraction progress */}
      {isExtracting && !isSelectionMode && extractionProgress !== undefined && (
        <div className="px-3 pb-1">
          <Progress value={extractionProgress} size="sm" />
        </div>
      )}
    </div>
  );
}
