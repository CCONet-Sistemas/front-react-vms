import { useState } from 'react';
import { useRouteError, isRouteErrorResponse } from 'react-router';
import type { Route } from './+types/_app.settings.config';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import {
  PageContent,
  PageHeader,
  Pagination,
  ProtectedRoute,
  FilterBar,
} from '~/components/common';
import { TableSkeleton } from '~/components/ui/table-skeleton';
import { Button } from '~/components/ui/button';
import {
  ConfigTable,
  ConfigFormDialog,
  useConfigs,
  useCreateConfig,
  useUpdateConfig,
  useDeleteConfig,
} from '~/features/config';
import { useListParams } from '~/hooks/useListParams';
import type { Configuration, CreateConfigDto, UpdateConfigDto } from '~/types';

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
    { title: 'Configurações | VMS' },
    { name: 'description', content: 'Gerenciar configurações - Video Management System' },
  ];
}

export default function SettingsConfigPage() {
  const { params, setPage } = useListParams({ defaults: { per_page: 50 } });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<Configuration | null>(null);

  const { data, isLoading, error } = useConfigs({
    page: Number(params.page),
    per_page: Number(params.per_page),
    search: params.search,
  });
  const createConfig = useCreateConfig();
  const updateConfig = useUpdateConfig();
  const deleteConfig = useDeleteConfig();

  const configs = data?.data ?? [];
  const meta = data?.meta;
  const handleOpenCreate = () => {
    setEditingConfig(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (config: Configuration) => {
    setEditingConfig(config);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingConfig(null);
  };

  const handleSubmit = async (formData: CreateConfigDto | UpdateConfigDto) => {
    try {
      if (editingConfig) {
        await updateConfig.mutateAsync({
          key: editingConfig.key,
          data: formData as UpdateConfigDto,
        });
        toast.success('Configuração atualizada com sucesso!');
      } else {
        await createConfig.mutateAsync(formData as CreateConfigDto);
        toast.success('Configuração criada com sucesso!');
      }
      handleCloseForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ocorreu um erro';
      toast.error(editingConfig ? 'Erro ao atualizar configuração' : 'Erro ao criar configuração', {
        description: message,
      });
    }
  };

  const handleDelete = async (config: Configuration) => {
    try {
      await deleteConfig.mutateAsync(config.key);
      toast.success('Configuração excluída com sucesso!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ocorreu um erro';
      toast.error('Erro ao excluir configuração', { description: message });
    }
  };

  const isSubmitting = createConfig.isPending || updateConfig.isPending;

  const paginationMeta = meta
    ? {
        page: meta.current_page,
        totalPages: Math.ceil(meta.total / meta.per_page),
        total: meta.total,
        limit: meta.per_page,
        from: meta.from,
        to: meta.to,
      }
    : null;

  return (
    <ProtectedRoute permission="configuration:read">
      <PageContent variant="list">
        <div className="space-y-6">
          <PageHeader
            title="Configurações avançadas"
            description="Gerencie as configurações do sistema"
          >
            <Button variant="secondary" onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nova configuração
            </Button>
          </PageHeader>

          <FilterBar
            placeholder="Buscar por chave ou descrição..."
            sortOptions={[
              { label: 'Chave', value: 'key' },
              { label: 'Data', value: 'createdAt' },
            ]}
          />

          {error && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
              <p className="text-sm text-destructive">
                Erro ao carregar configurações. Tente novamente.
              </p>
            </div>
          )}

          {isLoading ? (
            <TableSkeleton rows={8} columns={4} />
          ) : (
            <>
              <ConfigTable
                configs={configs}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
                isDeleting={deleteConfig.isPending}
              />

              {paginationMeta && paginationMeta.totalPages > 0 && (
                <Pagination
                  page={paginationMeta.page}
                  totalPages={paginationMeta.totalPages}
                  total={paginationMeta.total}
                  limit={paginationMeta.limit}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </div>

        <ConfigFormDialog
          config={editingConfig}
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </PageContent>
    </ProtectedRoute>
  );
}
