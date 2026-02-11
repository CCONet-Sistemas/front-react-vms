import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useExtractRecording, useExtractionStatus } from './useExtractRecording';
import { recordingService } from '~/services/api/recordingsService';
import type { ExtractionProcessConfig } from '~/types/recordings.types';

const SECONDS_IN_DAY = 86400;

interface SelectionRange {
  startPercent: number;
  endPercent: number;
}

export function useExtractionManager(cameraId: string | undefined, dayStart: Date) {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectionRange, setSelectionRange] = useState<SelectionRange>({ startPercent: 45, endPercent: 55 });
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const extractMutation = useExtractRecording();
  const { data: jobStatus } = useExtractionStatus(cameraId ?? null, activeJobId);
  const prevStatusRef = useRef<string | null>(null);

  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode((prev) => !prev);
  }, []);

  const initSelectionRange = useCallback((playheadPercent: number | null) => {
    const center = playheadPercent ?? 50;
    const start = Math.max(0, center - 5);
    const end = Math.min(100, center + 5);
    setSelectionRange({ startPercent: start, endPercent: end });
  }, []);

  const percentToISOString = useCallback(
    (percent: number): string => {
      const ms = (percent / 100) * SECONDS_IN_DAY * 1000;
      return new Date(dayStart.getTime() + ms).toISOString();
    },
    [dayStart],
  );

  const submitExtraction = useCallback(
    (config: { quality: string; resolution: string; codec: string; outputFileName: string }) => {
      if (!cameraId) return;

      const processConfig: ExtractionProcessConfig = {};
      if (config.quality !== 'original') {
        processConfig.compress = { quality: config.quality as ExtractionProcessConfig['compress'] extends { quality: infer Q } ? Q : never };
      }
      if (config.resolution !== 'original') {
        processConfig.resize = { resolution: config.resolution as ExtractionProcessConfig['resize'] extends { resolution: infer R } ? R : never };
      }
      if (config.codec !== 'copy') {
        processConfig.reencode = { codec: config.codec as ExtractionProcessConfig['reencode'] extends { codec: infer C } ? C : never };
      }

      extractMutation.mutate(
        {
          cameraId,
          request: {
            startTime: percentToISOString(selectionRange.startPercent),
            endTime: percentToISOString(selectionRange.endPercent),
            processConfig,
            outputFileName: config.outputFileName || 'extraction',
          },
        },
        {
          onSuccess: (job) => {
            setActiveJobId(job.jobId);
            setIsSelectionMode(false);
            toast.info('Extração iniciada');
          },
          onError: () => {
            toast.error('Erro ao iniciar extração');
          },
        },
      );
    },
    [cameraId, selectionRange, percentToISOString, extractMutation],
  );

  const handleDownload = useCallback(
    async (jobId: string) => {
      if (!cameraId) return;
      try {
        const blob = await recordingService.downloadExtraction(cameraId, jobId);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = jobStatus?.outputFileName ?? 'extraction.mp4';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch {
        toast.error('Erro ao baixar arquivo');
      }
    },
    [cameraId, jobStatus?.outputFileName],
  );

  // Monitor job status changes
  useEffect(() => {
    if (!jobStatus || !activeJobId) return;

    const prevStatus = prevStatusRef.current;
    const currentStatus = jobStatus.status;

    if (prevStatus === currentStatus) return;
    prevStatusRef.current = currentStatus;

    if (currentStatus === 'completed') {
      toast.success('Extração concluída', {
        action: {
          label: 'Download',
          onClick: () => handleDownload(activeJobId),
        },
      });
      setActiveJobId(null);
    } else if (currentStatus === 'failed') {
      toast.error('Extração falhou', {
        description: jobStatus.errorMessage ?? 'Erro desconhecido',
      });
      setActiveJobId(null);
    }
  }, [jobStatus, activeJobId, handleDownload]);

  return {
    isSelectionMode,
    selectionRange,
    isExtracting: !!activeJobId,
    extractionProgress: jobStatus?.progress ?? 0,
    toggleSelectionMode,
    initSelectionRange,
    setSelectionRange,
    submitExtraction,
  };
}
