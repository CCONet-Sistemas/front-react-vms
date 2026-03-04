import { useState } from 'react';
import { Pencil, Play, Power, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog';
import { ConfirmDeleteDialog } from '~/components/common/ConfirmDeleteDialog';
import { ScheduleStatusBadge } from './ScheduleStatusBadge';
import type { BackupSchedule, BackupType } from '~/types/backup.types';

const typeLabels: Record<BackupType, string> = {
  FULL: 'Completo',
  INCREMENTAL: 'Incremental',
  DIFFERENTIAL: 'Diferencial',
  MANUAL: 'Manual',
  SCHEDULED: 'Agendado',
};

function formatDate(dateString?: string): string {
  if (!dateString) return '--';
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface ScheduleTableProps {
  schedules: BackupSchedule[];
  onEdit: (schedule: BackupSchedule) => void;
  onDelete: (schedule: BackupSchedule) => void;
  onToggle: (schedule: BackupSchedule) => void;
  onExecute: (schedule: BackupSchedule) => void;
  isDeleting?: boolean;
  isToggling?: boolean;
  isExecuting?: boolean;
}

export function ScheduleTable({
  schedules,
  onEdit,
  onDelete,
  onToggle,
  onExecute,
  isDeleting,
  isToggling,
  isExecuting,
}: ScheduleTableProps) {
  const [scheduleToDelete, setScheduleToDelete] = useState<BackupSchedule | null>(null);
  const [scheduleToExecute, setScheduleToExecute] = useState<BackupSchedule | null>(null);

  const handleDeleteConfirm = () => {
    if (scheduleToDelete) {
      onDelete(scheduleToDelete);
      setScheduleToDelete(null);
    }
  };

  const handleExecuteConfirm = () => {
    if (scheduleToExecute) {
      onExecute(scheduleToExecute);
      setScheduleToExecute(null);
    }
  };

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Cron</TableHead>
              <TableHead>Próxima Execução</TableHead>
              <TableHead>Última Execução</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Nenhum agendamento encontrado.
                </TableCell>
              </TableRow>
            ) : (
              schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium">
                    <div>
                      <span>{schedule.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {typeLabels[schedule.type] ?? schedule.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <span className="font-mono">{schedule.cronExpression ?? '--'}</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(schedule.nextRunAt)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(schedule.lastRunAt)}
                  </TableCell>
                  <TableCell>
                    <ScheduleStatusBadge enabled={schedule.enabled} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onToggle(schedule)}
                        disabled={isToggling}
                        tooltip={true}
                        tooltipText={schedule.enabled ? 'Desabilitar' : 'Habilitar'}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setScheduleToExecute(schedule)}
                        disabled={isExecuting}
                        tooltip={true}
                        tooltipText="Executar agora"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onEdit(schedule)}
                        tooltip={true}
                        tooltipText="Editar agendamento"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setScheduleToDelete(schedule)}
                        className="text-destructive hover:text-destructive"
                        tooltip={true}
                        tooltipText="Excluir agendamento"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Execute AlertDialog */}
      <AlertDialog open={!!scheduleToExecute} onOpenChange={() => setScheduleToExecute(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Executar agendamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja executar o agendamento{' '}
              <strong>{scheduleToExecute?.name}</strong> agora?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isExecuting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleExecuteConfirm} disabled={isExecuting}>
              {isExecuting ? 'Executando...' : 'Executar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete ConfirmDeleteDialog */}
      <ConfirmDeleteDialog
        open={!!scheduleToDelete}
        onOpenChange={() => setScheduleToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        description={
          <>
            Tem certeza que deseja excluir o agendamento <strong>{scheduleToDelete?.name}</strong>?
            Esta ação não pode ser desfeita.
          </>
        }
      />
    </>
  );
}
