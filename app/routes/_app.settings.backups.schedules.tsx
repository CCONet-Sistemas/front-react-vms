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
import {
  ScheduleStatsRow,
  ScheduleTable,
  ScheduleFormDialog,
  useScheduleList,
  useScheduleStatistics,
  useCreateSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
  useToggleSchedule,
  useExecuteSchedule,
} from '~/features/backups';
import { useListParams } from '~/hooks/useListParams';
import { CRON_OPTIONS } from '~/types/cron-expression.type';
import type {
  BackupSchedule,
  BackupStatus,
  CreateBackupScheduleDto,
} from '~/types/backup.types';
import type { ScheduleFormData } from '~/features/backups/schemas/schedule.schema';

function toScheduleDto(formData: ScheduleFormData): CreateBackupScheduleDto {
  const cronOption = CRON_OPTIONS.find((o) => o.value === formData.cronExpression);
  const cronLabel = cronOption?.label ?? formData.cronExpression;
  return {
    name: formData.name,
    description: formData.description,
    cronExpression: formData.cronExpression,
    type: formData.type,
    enabled: formData.enabled,
    retentionCount: formData.retentionCount,
  };
}

export function meta() {
  return [
    { title: 'Agendamentos de Backup | VMS' },
    { name: 'description', content: 'Agendamentos de backup - Video Management System' },
  ];
}

export default function SettingsBackupSchedulesPage() {
  const { params, setPage } = useListParams();
  const [searchParams] = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<BackupSchedule | null>(null);

  const status = (searchParams.get('status') as BackupStatus) || undefined;

  const { data, isLoading } = useScheduleList({
    page: Number(params.page),
    limit: Number(params.per_page),
    search: params.search,
    sort: params.sort,
    order: params.order,
    status,
  });

  const { data: statistics, isLoading: isLoadingStats } = useScheduleStatistics();

  const createSchedule = useCreateSchedule();
  const updateSchedule = useUpdateSchedule();
  const deleteSchedule = useDeleteSchedule();
  const toggleSchedule = useToggleSchedule();
  const executeSchedule = useExecuteSchedule();

  const schedules = data?.data ?? [];
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.last_page ?? 0;

  const handleCreate = useCallback(
    async (formData: ScheduleFormData) => {
      try {
        await createSchedule.mutateAsync(toScheduleDto(formData));
        toast.success('Agendamento criado com sucesso!');
        setIsFormOpen(false);
      } catch {
        toast.error('Erro ao criar agendamento');
      }
    },
    [createSchedule]
  );

  const handleUpdate = useCallback(
    async (formData: ScheduleFormData) => {
      if (!editingSchedule) return;
      try {
        await updateSchedule.mutateAsync({ id: editingSchedule.uuid, dto: toScheduleDto(formData) });
        toast.success('Agendamento atualizado com sucesso!');
        setEditingSchedule(null);
        setIsFormOpen(false);
      } catch {
        toast.error('Erro ao atualizar agendamento');
      }
    },
    [updateSchedule, editingSchedule]
  );

  const handleDelete = useCallback(
    async (schedule: BackupSchedule) => {
      try {
        await deleteSchedule.mutateAsync(schedule.uuid);
        toast.success('Agendamento excluído com sucesso!');
      } catch {
        toast.error('Erro ao excluir agendamento');
      }
    },
    [deleteSchedule]
  );

  const handleToggle = useCallback(
    async (schedule: BackupSchedule) => {
      try {
        await toggleSchedule.mutateAsync(schedule.uuid);
        toast.success(schedule.enabled ? 'Agendamento desabilitado.' : 'Agendamento habilitado.');
      } catch {
        toast.error('Erro ao alterar status do agendamento');
      }
    },
    [toggleSchedule]
  );

  const handleExecute = useCallback(
    async (schedule: BackupSchedule) => {
      try {
        await executeSchedule.mutateAsync(schedule.uuid);
        toast.success('Agendamento executado com sucesso!');
      } catch {
        toast.error('Erro ao executar agendamento');
      }
    },
    [executeSchedule]
  );

  const handleEdit = useCallback((schedule: BackupSchedule) => {
    setEditingSchedule(schedule);
    setIsFormOpen(true);
  }, []);

  const handleFormClose = useCallback(() => {
    setIsFormOpen(false);
    setEditingSchedule(null);
  }, []);

  const handleFormSubmit = useCallback(
    (formData: ScheduleFormData) => {
      if (editingSchedule) {
        handleUpdate(formData);
      } else {
        handleCreate(formData);
      }
    },
    [editingSchedule, handleCreate, handleUpdate]
  );

  return (
    <ProtectedRoute permission="backup:read">
      <PageContent variant="list">
        <div className="space-y-6">
          <PageHeader
            title="Agendamentos de Backup"
            description="Gerencie os agendamentos automáticos de backup"
          >
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
          </PageHeader>

          <ScheduleStatsRow statistics={statistics} isLoading={isLoadingStats} />

          <FilterBar
            placeholder="Buscar agendamentos..."
            fields={[
              {
                type: 'select',
                key: 'status',
                placeholder: 'Todos os status',
                options: [
                  { label: 'Pendente', value: 'PENDING' },
                  { label: 'Em progresso', value: 'IN_PROGRESS' },
                  { label: 'Concluído', value: 'COMPLETED' },
                  { label: 'Falhou', value: 'FAILED' },
                ],
              },
            ]}
          />

          <ScheduleTable
            schedules={schedules}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggle={handleToggle}
            onExecute={handleExecute}
            isDeleting={deleteSchedule.isPending}
            isToggling={toggleSchedule.isPending}
            isExecuting={executeSchedule.isPending}
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

        <ScheduleFormDialog
          isOpen={isFormOpen}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
          schedule={editingSchedule ?? undefined}
          isSubmitting={createSchedule.isPending || updateSchedule.isPending}
        />
      </PageContent>
    </ProtectedRoute>
  );
}
