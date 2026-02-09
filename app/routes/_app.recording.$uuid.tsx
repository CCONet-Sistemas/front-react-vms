import type { Route } from '../+types/root';

import { PageContent, PageHeader, ProtectedRoute } from '~/components/common';
import { useSessionSegments } from '~/features/recordings/hooks/useRecording';
import { RecordingPlayer } from '~/features/recordings/components/RecordingPlayer';
import type { DateRange } from '~/components/ui/date-picker';
import { useSearchParams } from 'react-router';
import { useCallback } from 'react';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Available Recordings | VMS' },
    { name: 'description', content: 'View recordings - Video Management System' },
  ];
}

export default function EditRecordingPage({ params }: Route.ComponentProps) {
  const { uuid } = params;
  const [searchParams, setSearchParams] = useSearchParams();

  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;
  const dateRange: DateRange = { startDate, endDate };

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const newParams = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === '') {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  const handleDateRangeChange = (range: DateRange) => {
    updateParams({
      startDate: range.startDate,
      endDate: range.endDate,
    });
  };

  if (!uuid) {
    return (
      <ProtectedRoute resource="recording" action="read">
        <PageContent variant="form">
          <PageHeader
            title="Gravações disponíveis"
            description="Gravações da camera armazenadas no sistema"
          />
        </PageContent>
      </ProtectedRoute>
    );
  }
  const { data: sessions, isLoading } = useSessionSegments(uuid, { startDate, endDate });

  return (
    <ProtectedRoute resource="recording" action="read">
      <PageContent variant="form">
        <PageHeader
          title="Gravações disponíveis"
          description="Gravações da camera armazenadas no sistema"
        />
        <div className="mx-auto w-full max-w-5xl">
          <RecordingPlayer
            sessions={sessions ?? []}
            isLoading={isLoading}
            cameraId={uuid}
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
          />
        </div>
      </PageContent>
    </ProtectedRoute>
  );
}
