import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  PageContent,
  PageHeader,
  ProtectedRoute,
  FilterBar,
  Pagination,
} from '~/components/common';
import { Button } from '~/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs';
import {
  BackupSection,
  RestoreSection,
  BackupStatsRow,
  BackupTable,
  CreateBackupDialog,
  useBackupList,
  useBackupStatistics,
  useCreateBackupRecord,
  useDeleteBackup,
  useValidateBackup,
  useRestoreBackupById,
  useDownloadBackup,
} from '~/features/backups';
import { useListParams } from '~/hooks/useListParams';
import type { Backup, BackupStatus, BackupType } from '~/types/backup.types';

export function meta() {
  return [
    { title: 'Backup e Restauração | VMS' },
    { name: 'description', content: 'Backup e restauração - Video Management System' },
  ];
}

export default function SettingsBackupPage() {
  const { params, setPage } = useListParams();
  const [searchParams] = useSearchParams();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const status = (searchParams.get('status') as BackupStatus) || undefined;
  const type = (searchParams.get('type') as BackupType) || undefined;
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;

  const { data, isLoading } = useBackupList({
    page: Number(params.page),
    limit: Number(params.per_page),
    search: params.search,
    sort: params.sort,
    order: params.order,
    status,
    type,
    startDate,
    endDate,
  });

  const { data: statistics, isLoading: isLoadingStats } = useBackupStatistics();

  const createBackupRecord = useCreateBackupRecord();
  const deleteBackup = useDeleteBackup();
  const validateBackup = useValidateBackup();
  const restoreBackupById = useRestoreBackupById();
  const downloadBackup = useDownloadBackup();

  const backups = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.last_page ?? 0;

  const handleCreate = useCallback(
    async (dto: Parameters<typeof createBackupRecord.mutateAsync>[0]) => {
      try {
        await createBackupRecord.mutateAsync(dto);
        toast.success('Backup criado com sucesso!');
        setIsCreateOpen(false);
      } catch {
        toast.error('Erro ao criar backup');
      }
    },
    [createBackupRecord]
  );

  const handleDelete = useCallback(
    async (backup: Backup) => {
      try {
        await deleteBackup.mutateAsync(backup.uuid);
        toast.success('Backup excluído com sucesso!');
      } catch {
        toast.error('Erro ao excluir backup');
      }
    },
    [deleteBackup]
  );

  const handleValidate = useCallback(
    async (backup: Backup) => {
      try {
        const result = await validateBackup.mutateAsync(backup.uuid);
        if (result.valid) {
          toast.success('Backup válido!', { description: result.message });
        } else {
          toast.error('Backup inválido', {
            description: result.errors?.join(', ') ?? result.message,
          });
        }
      } catch {
        toast.error('Erro ao validar backup');
      }
    },
    [validateBackup]
  );

  const handleRestore = useCallback(
    async (backup: Backup) => {
      try {
        await restoreBackupById.mutateAsync(backup.uuid);
        toast.success('Backup restaurado com sucesso!');
      } catch {
        toast.error('Erro ao restaurar backup');
      }
    },
    [restoreBackupById]
  );

  const handleDownload = useCallback(
    async (backup: Backup) => {
      try {
        const downloadInfo = await downloadBackup.mutateAsync(backup.uuid);
        const a = document.createElement('a');
        a.href = downloadInfo.url;
        a.download = `${downloadInfo.fileName}.zip`;
        a.click();
      } catch {
        toast.error('Erro ao baixar backup');
      }
    },
    [downloadBackup]
  );

  return (
    <ProtectedRoute permission="backup:read">
      <PageContent variant="list">
        <div className="space-y-6">
          <PageHeader
            title="Backup e Restauração"
            description="Gerencie backups e restaurações do sistema"
          >
            <Button variant="secondary" onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Backup
            </Button>
          </PageHeader>

          <Tabs defaultValue="manage">
            <TabsList>
              <TabsTrigger value="manage">Gerenciar Backups</TabsTrigger>
              <TabsTrigger value="configurations">Backup de Configurações</TabsTrigger>
            </TabsList>

            <TabsContent value="manage">
              <div className="space-y-6">
                <BackupStatsRow statistics={statistics} isLoading={isLoadingStats} />

                <FilterBar
                  placeholder="Buscar backups..."
                  fields={[
                    {
                      type: 'select',
                      key: 'status',
                      placeholder: 'Todos os status',
                      options: [
                        { label: 'Pendente', value: 'PENDING' },
                        { label: 'Em andamento', value: 'IN_PROGRESS' },
                        { label: 'Concluído', value: 'COMPLETED' },
                        { label: 'Falhou', value: 'FAILED' },
                        { label: 'Validando', value: 'VALIDATING' },
                        { label: 'Validado', value: 'VALIDATED' },
                      ],
                    },
                    {
                      type: 'select',
                      key: 'type',
                      placeholder: 'Todos os tipos',
                      options: [
                        { label: 'Completo', value: 'FULL' },
                        { label: 'Incremental', value: 'INCREMENTAL' },
                        { label: 'Diferencial', value: 'DIFFERENTIAL' },
                        { label: 'Manual', value: 'MANUAL' },
                        { label: 'Agendado', value: 'SCHEDULED' },
                      ],
                    },
                    { type: 'daterange' },
                  ]}
                />

                <BackupTable
                  backups={backups}
                  onDelete={handleDelete}
                  onValidate={handleValidate}
                  onRestore={handleRestore}
                  onDownload={handleDownload}
                  isDeleting={deleteBackup.isPending}
                  isValidating={validateBackup.isPending}
                  isRestoring={restoreBackupById.isPending}
                  isDownloading={downloadBackup.isPending}
                />

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
            </TabsContent>

            <TabsContent value="configurations">
              <div className="space-y-6">
                <BackupSection />
                <RestoreSection />
              </div>
            </TabsContent>
          </Tabs>

          <CreateBackupDialog
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            onSubmit={handleCreate}
            isSubmitting={createBackupRecord.isPending}
          />
        </div>
      </PageContent>
    </ProtectedRoute>
  );
}
