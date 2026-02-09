import { Maximize, Minimize, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Slider } from '~/components/ui/slider';
import type { RecordingSessions } from '~/types/recordings.types';
import { RecordingTimeline } from './RecordingTimeline';

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
}: RecordingControlBarProps) {
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

        <div className="flex-1" />

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
        />
      </div>
    </div>
  );
}
