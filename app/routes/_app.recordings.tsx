import { useRouteError, isRouteErrorResponse } from 'react-router';
import type { Route } from './+types/_app.recordings';
import { PageContent, PageHeader, Pagination, ProtectedRoute, FilterBar } from '~/components/common';
import { RecordingList } from '~/features/recordings/components/RecordingList';
import { useCameras } from '~/features/cameras';
import { useListParams } from '~/hooks/useListParams';

export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <PageContent>
      <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
        <p className="text-destructive font-medium">Ocorreu um erro inesperado.</p>
        <p className="text-sm text-muted-foreground mt-1">
          {isRouteErrorResponse(error) ? error.statusText : 'Tente novamente mais tarde.'}
        </p>
      </div>
    </PageContent>
  );
}

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
    per_page: Number(params.per_page),
    search: params.search,
    sort: params.sort,
    order: params.order,
  });

  const data = cameraData?.data ?? [];
  const total = cameraData?.meta?.total ?? 0;
  const totalPages = cameraData?.meta?.last_page ?? 0;

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
              page={cameraData?.meta?.current_page ?? Number(params.page)}
              totalPages={totalPages}
              total={total}
              limit={cameraData?.meta?.per_page ?? Number(params.per_page)}
              onPageChange={setPage}
            />
          )}
        </div>
      </PageContent>
    </ProtectedRoute>
  );
}
