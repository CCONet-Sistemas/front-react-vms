import type { Route } from './+types/_app.recordings';
import { PageContent, PageHeader, Pagination, ProtectedRoute, FilterBar } from '~/components/common';
import { RecordingList } from '~/features/recordings/components/RecordingList';
import { useCameras } from '~/features/cameras';
import { useListParams } from '~/hooks/useListParams';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Recordings | VMS' },
    { name: 'description', content: 'View recordings - Video Management System' },
  ];
}

export default function RecordingsPage() {
  const { params, setPage } = useListParams({ defaults: { per_page: 12 } });

  const { data: cameraData, isLoading: cameraLoading, error: cameraError } = useCameras({
    page: Number(params.page),
    limit: Number(params.per_page),
    search: params.search,
  });

  const data = cameraData?.data ?? [];
  const total = cameraData?.total ?? 0;
  const totalPages = Math.ceil(total / Number(params.per_page));

  return (
    <ProtectedRoute resource="recording" action="read">
      <PageContent variant="list">
        <div className="space-y-6">
          <PageHeader
            title="Listagem de Gravações"
            description="Gravações de vídeo armazenadas no sistema"
          />

          <FilterBar
            placeholder="Buscar gravações..."
            sortOptions={[
              { label: 'Data', value: 'createdAt' },
              { label: 'Câmera', value: 'camera' },
            ]}
            fields={[{ type: 'viewmode', defaultMode: 'list' }]}
          />

          {cameraError && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
              <p className="text-sm text-destructive">
                Erro ao carregar gravações. Tente novamente.
              </p>
            </div>
          )}

          <RecordingList recordings={data} isLoading={cameraLoading} variant="list" />

          {totalPages > 0 && (
            <Pagination
              page={Number(params.page)}
              totalPages={totalPages}
              total={total}
              limit={Number(params.per_page)}
              onPageChange={setPage}
            />
          )}
        </div>
      </PageContent>
    </ProtectedRoute>
  );
}
