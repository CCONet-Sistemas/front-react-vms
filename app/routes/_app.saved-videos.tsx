import type { Route } from './+types/_app.recordings';
import { PageContent, PageHeader, ProtectedRoute } from '~/components/common';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Vídeos Salvos | VMS' },
    { name: 'description', content: 'Gerenciar vídeos salvos - Video Management System' },
  ];
}

export default function SavedVideosPage() {
  return (
    <ProtectedRoute resource="recording" action="read">
      <PageContent variant="list">
        <PageHeader
          title="Vídeos Salvos"
          description="Gerencie seus vídeos salvos, acesse gravações anteriores e organize seu conteúdo de vídeo."
        />
      </PageContent>
    </ProtectedRoute>
  );
}
