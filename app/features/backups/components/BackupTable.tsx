import { useState } from 'react';
import { Download, RotateCcw, ShieldCheck, Trash2 } from 'lucide-react';
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
import { BackupStatusBadge } from './BackupStatusBadge';
import type { Backup, BackupType } from '~/types/backup.types';

const typeLabels: Record<BackupType, string> = {
  FULL: 'Completo',
  INCREMENTAL: 'Incremental',
  DIFFERENTIAL: 'Diferencial',
  MANUAL: 'Manual',
  SCHEDULED: 'Agendado',
};

function formatBytes(bytes: number): string {
  if (!bytes || isNaN(bytes)) return '--';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface BackupTableProps {
  backups: Backup[];
  onDelete: (backup: Backup) => void;
  onValidate: (backup: Backup) => void;
  onRestore: (backup: Backup) => void;
  onDownload: (backup: Backup) => void;
  isDeleting?: boolean;
  isValidating?: boolean;
  isRestoring?: boolean;
  isDownloading?: boolean;
}

export function BackupTable({
  backups,
  onDelete,
  onValidate,
  onRestore,
  onDownload,
  isDeleting,
  isValidating,
  isRestoring,
  isDownloading,
}: BackupTableProps) {
  const [backupToDelete, setBackupToDelete] = useState<Backup | null>(null);
  const [backupToRestore, setBackupToRestore] = useState<Backup | null>(null);

  const handleDeleteConfirm = () => {
    if (backupToDelete) {
      onDelete(backupToDelete);
      setBackupToDelete(null);
    }
  };

  const handleRestoreConfirm = () => {
    if (backupToRestore) {
      onRestore(backupToRestore);
      setBackupToRestore(null);
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
              <TableHead>Status</TableHead>
              <TableHead>Tamanho</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {backups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Nenhum backup encontrado.
                </TableCell>
              </TableRow>
            ) : (
              backups.map((backup) => (
                <TableRow key={backup.uuid}>
                  <TableCell className="font-medium">
                    <div>
                      <span>{backup.name}</span>
                      {backup.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{backup.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {typeLabels[backup.type] ?? backup.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <BackupStatusBadge status={backup.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatBytes(backup.size)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(backup.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onValidate(backup)}
                        disabled={isValidating}
                        title="Validar backup"
                        tooltip={true}
                        tooltipText="Validar backup"
                      >
                        <ShieldCheck className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setBackupToRestore(backup)}
                        disabled={isRestoring}
                        title="Restaurar backup"
                        tooltip={true}
                        tooltipText="Restaurar backup"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onDownload(backup)}
                        disabled={isDownloading}
                        title="Baixar backup"
                        tooltip={true}
                        tooltipText="Baixar backup"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setBackupToDelete(backup)}
                        className="text-destructive hover:text-destructive"
                        title="Excluir backup"
                        tooltip={true}
                        tooltipText="Excluir backup"
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

      {/* Restore AlertDialog */}
      <AlertDialog open={!!backupToRestore} onOpenChange={() => setBackupToRestore(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar restauração</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja restaurar o backup{' '}
              <strong>{backupToRestore?.name}</strong>? Esta ação irá sobrescrever os dados atuais
              do sistema e não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRestoring}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestoreConfirm}
              disabled={isRestoring}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRestoring ? 'Restaurando...' : 'Restaurar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete ConfirmDeleteDialog */}
      <ConfirmDeleteDialog
        open={!!backupToDelete}
        onOpenChange={() => setBackupToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        description={
          <>
            Tem certeza que deseja excluir o backup <strong>{backupToDelete?.name}</strong>? Esta
            ação não pode ser desfeita.
          </>
        }
      />
    </>
  );
}
