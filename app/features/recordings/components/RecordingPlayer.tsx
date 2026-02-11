import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HLSPlayer } from '~/features/live-view/components/HLSPlayer';
import type { HLSPlayerHandle } from '~/features/live-view/components/HLSPlayer';
import { cn } from '~/lib/utils';
import type { RecordingSessions } from '~/types/recordings.types';
import type { DateRange } from '~/components/ui/date-picker';
import { RecordingControlBar } from './RecordingControlBar';
import { useExtractionManager } from '../hooks/useExtractionManager';

interface RecordingPlayerProps {
  sessions: RecordingSessions[];
  cameraId?: string;
  isLoading: boolean;
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange) => void;
}

function getStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function RecordingPlayer({ sessions, isLoading, cameraId, dateRange, onDateRangeChange }: RecordingPlayerProps) {
  const [selectedSessionUuid, setSelectedSessionUuid] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playStartRef = useRef<{ wallTime: number; mediaTime: Date } | null>(null);
  const playerRef = useRef<HLSPlayerHandle>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pendingSeekRef = useRef<number | null>(null);

  const dayStart = useMemo(() => {
    if (sessions.length === 0) return getStartOfDay(new Date());
    const earliest = sessions.reduce((min, s) => {
      const d = new Date(s.startedAt);
      return d < min ? d : min;
    }, new Date(sessions[0].startedAt));
    return getStartOfDay(earliest);
  }, [sessions]);

  const extraction = useExtractionManager(cameraId, dayStart);

  const sortedSessions = useMemo(
    () =>
      [...sessions].sort(
        (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
      ),
    [sessions]
  );
  const selectedSession = useMemo(
    () => sessions.find((s) => s.uuid === selectedSessionUuid) ?? null,
    [sessions, selectedSessionUuid]
  );
  const hlsSrc = useMemo(() => {
    if (!selectedSessionUuid) return '';
    return `${import.meta.env.VITE_API_URL}/recording/${cameraId}/playlist.m3u8?sessionId=${selectedSessionUuid}`;
  }, [selectedSessionUuid, cameraId]);

  const playheadPercent = useMemo(() => {
    if (!currentTime) return null;
    const SECONDS_IN_DAY = 86400;
    const sec = (currentTime.getTime() - dayStart.getTime()) / 1000;
    if (sec < 0 || sec > SECONDS_IN_DAY) return null;
    return (sec / SECONDS_IN_DAY) * 100;
  }, [currentTime, dayStart]);

  // Auto-select first active session
  useEffect(() => {
    if (sessions.length === 0 || selectedSessionUuid) return;
    const active = sessions.find((s) => s.status === 'active') ?? sessions[0];
    if (active) {
      setSelectedSessionUuid(active.uuid);
      setCurrentTime(new Date(active.startedAt));
    }
  }, [sessions, selectedSessionUuid]);

  const handleTimeSelect = useCallback(
    (time: Date, sessionUuid: string) => {
      const session = sessions.find((s) => s.uuid === sessionUuid);
      if (!session) return;
      const offsetSeconds = (time.getTime() - new Date(session.startedAt).getTime()) / 1000;

      setCurrentTime(time);
      playStartRef.current = { wallTime: Date.now(), mediaTime: time };

      if (sessionUuid === selectedSessionUuid) {
        // Same session — seek immediately
        playerRef.current?.seek(offsetSeconds);
      } else {
        // Different session — store pending seek, change source
        pendingSeekRef.current = offsetSeconds;
        setSelectedSessionUuid(sessionUuid);
      }
    },
    [sessions, selectedSessionUuid]
  );

  const handleEnded = useCallback(() => {
    const currentIndex = sortedSessions.findIndex((s) => s.uuid === selectedSessionUuid);
    const nextSession = sortedSessions[currentIndex + 1];
    if (!nextSession) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    playStartRef.current = null;

    setSelectedSessionUuid(nextSession.uuid);
    setCurrentTime(new Date(nextSession.startedAt));
  }, [sortedSessions, selectedSessionUuid]);

  const handlePlaying = useCallback(() => {
    if (!selectedSession) return;
    setIsPlaying(true);

    // Apply pending seek if switching sessions
    if (pendingSeekRef.current !== null) {
      playerRef.current?.seek(pendingSeekRef.current);
      pendingSeekRef.current = null;
      return; // will fire onPlaying again after seek
    }

    const startTime = currentTime ?? new Date(selectedSession.startedAt);
    playStartRef.current = { wallTime: Date.now(), mediaTime: startTime };

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (!playStartRef.current) return;
      const elapsed = Date.now() - playStartRef.current.wallTime;
      const newTime = new Date(playStartRef.current.mediaTime.getTime() + elapsed);
      setCurrentTime(newTime);
    }, 1000);
  }, [selectedSession, currentTime]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      playerRef.current?.pause();
    } else {
      playerRef.current?.play();
    }
  }, [isPlaying]);

  const handleMuteToggle = useCallback(() => {
    const next = !isMuted;
    playerRef.current?.setMuted(next);
    setIsMuted(next);
  }, [isMuted]);

  const handleVolumeChange = useCallback(
    (v: number) => {
      playerRef.current?.setVolume(v / 100);
      setVolume(v);
      if (v === 0) {
        playerRef.current?.setMuted(true);
        setIsMuted(true);
      } else if (isMuted) {
        playerRef.current?.setMuted(false);
        setIsMuted(false);
      }
    },
    [isMuted]
  );

  const handleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  }, []);

  const handleToggleSelectionMode = useCallback(() => {
    if (!extraction.isSelectionMode) {
      extraction.initSelectionRange(playheadPercent);
    }
    extraction.toggleSelectionMode();
  }, [extraction, playheadPercent]);

  // Listen for fullscreen changes
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className={cn('w-full aspect-video rounded-lg bg-muted animate-pulse')} />
        <div className={cn('w-full h-12 rounded-md bg-muted animate-pulse')} />
        <div className={cn('w-full h-8 rounded-md bg-muted animate-pulse')} />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn('flex flex-col', isFullscreen && 'bg-black h-screen')}>
      {/* Video Player */}
      <div
        className={cn(
          'w-full bg-black overflow-hidden',
          isFullscreen ? 'flex-1' : 'aspect-video rounded-t-lg'
        )}
      >
        {hlsSrc ? (
          <HLSPlayer
            ref={playerRef}
            src={hlsSrc}
            autoPlay
            muted={isMuted}
            controls={false}
            onPlaying={handlePlaying}
            onPause={handlePause}
            onEnded={handleEnded}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <p>Selecione um ponto na timeline para reproduzir</p>
          </div>
        )}
      </div>

      {/* Unified Control Bar */}
      <RecordingControlBar
        sessions={sessions}
        currentTime={currentTime}
        isPlaying={isPlaying}
        isMuted={isMuted}
        volume={volume}
        isFullscreen={isFullscreen}
        onPlayPause={handlePlayPause}
        onMuteToggle={handleMuteToggle}
        onVolumeChange={handleVolumeChange}
        onFullscreen={handleFullscreen}
        onTimeSelect={handleTimeSelect}
        dateRange={dateRange}
        onDateRangeChange={onDateRangeChange}
        isSelectionMode={extraction.isSelectionMode}
        onToggleSelectionMode={handleToggleSelectionMode}
        isExtracting={extraction.isExtracting}
        extractionProgress={extraction.extractionProgress}
        onSubmitExtraction={extraction.submitExtraction}
        selectionRange={extraction.selectionRange}
        onSelectionChange={extraction.setSelectionRange}
      />
    </div>
  );
}
