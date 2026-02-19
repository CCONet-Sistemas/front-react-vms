import { useState } from 'react';
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
    itemsPerPage: Number(params.per_page),
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
          key: editingConfig.key.value,
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
      await deleteConfig.mutateAsync(config.key.value);
      toast.success('Configuração excluída com sucesso!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ocorreu um erro';
      toast.error('Erro ao excluir configuração', { description: message });
    }
  };

  const isSubmitting = createConfig.isPending || updateConfig.isPending;

  const paginationMeta = meta
    ? {
        page: meta.currentPage,
        totalPages: meta.totalPages,
        total: meta.totalItems,
        limit: meta.itemsPerPage,
      }
    : null;

  return (
    <ProtectedRoute permission="configuration:read">
      <PageContent variant="list">
        <div className="space-y-6">
          <PageHeader title="Configurações avançadas" description="Gerencie as configurações do sistema">
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
            <div className="flex items-center justify-center py-12">
              <div className="animate-pulse text-muted-foreground">Carregando configurações...</div>
            </div>
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
