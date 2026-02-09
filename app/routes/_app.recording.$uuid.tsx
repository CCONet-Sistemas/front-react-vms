import type { Route } from '../+types/root';

import { PageContent, PageHeader, ProtectedRoute } from '~/components/common';
import { useSessionSegments } from '~/features/recordings/hooks/useRecording';
import { RecordingPlayer } from '~/features/recordings/components/RecordingPlayer';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Available Recordings | VMS' },
    { name: 'description', content: 'View recordings - Video Management System' },
  ];
}

export default function EditRecordingPage({ params }: Route.ComponentProps) {
  const { uuid } = params;
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
  const { data: sessions, isLoading } = useSessionSegments(uuid);

  return (
    <ProtectedRoute resource="recording" action="read">
      <PageContent variant="form">
        <PageHeader
          title="Gravações disponíveis"
          description="Gravações da camera armazenadas no sistema"
        />
        <div className="mx-auto w-full max-w-5xl">
          <RecordingPlayer sessions={sessions ?? []} isLoading={isLoading} cameraId={uuid} />
        </div>
      </PageContent>
    </ProtectedRoute>
  );
}
