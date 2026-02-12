import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import type { Route } from './+types/_app.settings.config';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { PageContent, PageHeader, Pagination, ProtectedRoute } from '~/components/common';
import { Button } from '~/components/ui/button';
import {
  ConfigTable,
  ConfigFormDialog,
  ConfigFilters,
  useConfigs,
  useCreateConfig,
  useUpdateConfig,
  useDeleteConfig,
} from '~/features/config';
import type { Configuration, CreateConfigDto, UpdateConfigDto } from '~/types';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Configurações | VMS' },
    { name: 'description', content: 'Gerenciar configurações - Video Management System' },
  ];
}

const DEFAULT_ITEMS_PER_PAGE = 50;

export default function SettingsConfigPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<Configuration | null>(null);

  // Get params from URL
  const page = Number(searchParams.get('page')) || 1;
  const itemsPerPage = Number(searchParams.get('itemsPerPage')) || DEFAULT_ITEMS_PER_PAGE;
  const search = searchParams.get('search') || undefined;

  // Queries and mutations
  const { data, isLoading, error } = useConfigs({ page, itemsPerPage, search });
  const createConfig = useCreateConfig();
  const updateConfig = useUpdateConfig();
  const deleteConfig = useDeleteConfig();

  const configs = data?.data ?? [];
  const meta = data?.meta;

  // Update URL params
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

  const handlePageChange = (newPage: number) => {
    updateParams({ page: String(newPage) });
  };

  const handleLimitChange = (newLimit: number) => {
    updateParams({ itemsPerPage: String(newLimit), page: '1' });
  };

  const handleSearchChange = (newSearch: string) => {
    updateParams({
      search: newSearch || undefined,
      page: '1',
    });
  };

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
        await updateConfig.mutateAsync({ key: editingConfig.key.value, data: formData as UpdateConfigDto });
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

  // Normalize meta to Pagination component format
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

          <ConfigFilters search={search || ''} onSearchChange={handleSearchChange} />

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
                  onPageChange={handlePageChange}
                  onLimitChange={handleLimitChange}
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
