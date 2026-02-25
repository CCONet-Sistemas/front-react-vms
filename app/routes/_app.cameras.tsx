import { useSearchParams } from 'react-router';
import type { Route } from './+types/_app.cameras';
import {
  ProtectedRoute,
  PageHeader,
  PageContent,
  Pagination,
  FilterBar,
  ViewModeToggle,
} from '~/components/common';
import { CameraList, useCameras, type ViewMode } from '~/features/cameras';
import { useListParams } from '~/hooks/useListParams';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Câmeras | VMS' },
    { name: 'description', content: 'Gerenciar câmeras - Video Management System' },
  ];
}

export default function CamerasPage() {
  const { params, setPage } = useListParams({ defaults: { per_page: 12 } });
  const [searchParams] = useSearchParams();

  const viewMode = (searchParams.get('view') as ViewMode) || 'list';

  const { data, isLoading, error } = useCameras({
    page: Number(params.page),
    per_page: Number(params.per_page),
    search: params.search,
    sort: params.sort,
    order: params.order,
  });
  console.log('Cameras data:', data); // Log para depuração
  const cameras = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.last_page ?? 0;

  return (
    <ProtectedRoute resource="camera" action="read">
      <PageContent variant="list">
        <div className="space-y-6">
          <PageHeader
            title="Câmeras"
            description="Gerencie e configure suas câmeras"
            to="/camera"
            linkText="Adicionar"
            permission="camera:create"
          />

          <div className="space-y-2">
            <FilterBar
              placeholder="Buscar câmeras..."
              sortOptions={[
                { label: 'Nome', value: 'name' },
                { label: 'IP', value: 'ip' },
                { label: 'Data', value: 'createdAt' },
              ]}
            />
            <div className="flex justify-end">
              <ViewModeToggle defaultMode="list" />
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
              <p className="text-sm text-destructive">Erro ao carregar câmeras. Tente novamente.</p>
            </div>
          )}

          <CameraList cameras={cameras} isLoading={isLoading} variant={viewMode} />

          {totalPages > 0 && (
            <Pagination
              page={data?.meta?.current_page ?? Number(params.page)}
              totalPages={totalPages}
              total={total}
              limit={data?.meta?.per_page ?? Number(params.per_page)}
              onPageChange={setPage}
            />
          )}
        </div>
      </PageContent>
    </ProtectedRoute>
  );
}
