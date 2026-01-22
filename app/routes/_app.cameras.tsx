import { Link, useSearchParams } from 'react-router';
import type { Route } from './+types/_app.cameras';
import { Button } from '~/components/ui/button';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProtectedRoute, ProtectedFeature } from '~/components/common';
import { CameraGrid, useCameras } from '~/features/cameras';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Câmeras | VMS' },
    { name: 'description', content: 'Gerenciar câmeras - Video Management System' },
  ];
}

const ITEMS_PER_PAGE = 12;

export default function CamerasPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;

  const { data, isLoading, error } = useCameras({ page, limit: ITEMS_PER_PAGE });

  const totalPages = data ? Math.ceil(data.total / ITEMS_PER_PAGE) : 0;

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: String(newPage) });
  };

  return (
    <ProtectedRoute resource="camera" action="read">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Câmeras</h1>
            <p className="text-muted-foreground">
              Gerencie e configure suas câmeras
            </p>
          </div>
          <ProtectedFeature permission="camera:create">
            <Link to="/camera">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Link>
          </ProtectedFeature>
        </div>

        {/* Error state */}
        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
            <p className="text-sm text-destructive">
              Erro ao carregar câmeras. Tente novamente.
            </p>
          </div>
        )}

        {/* Camera Grid */}
        <CameraGrid cameras={data?.data ?? []} isLoading={isLoading} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Página {page} de {totalPages} ({data?.total} câmeras)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
              >
                Próxima
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
