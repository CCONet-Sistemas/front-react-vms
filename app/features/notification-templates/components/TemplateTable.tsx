import { useState } from 'react';
import { Pencil, FlaskConical, Trash2, Plus } from 'lucide-react';
import { Link } from 'react-router';
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
import { ConfirmDeleteDialog } from '~/components/common/ConfirmDeleteDialog';
import { TableSkeleton } from '~/components/ui/table-skeleton';
import { TemplateChannelBadge } from './TemplateChannelBadge';
import type { NotificationTemplate } from '~/types/notification-template.types';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface TemplateTableProps {
  templates: NotificationTemplate[];
  onEdit: (template: NotificationTemplate) => void;
  onTest: (template: NotificationTemplate) => void;
  onDelete: (template: NotificationTemplate) => void;
  isLoading?: boolean;
  isDeleting?: boolean;
}

export function TemplateTable({
  templates,
  onEdit,
  onTest,
  onDelete,
  isLoading,
  isDeleting,
}: TemplateTableProps) {
  const [templateToDelete, setTemplateToDelete] = useState<NotificationTemplate | null>(null);

  const handleDeleteConfirm = () => {
    if (templateToDelete) {
      onDelete(templateToDelete);
      setTemplateToDelete(null);
    }
  };

  if (isLoading) {
    return <TableSkeleton rows={8} columns={6} />;
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Canal</TableHead>
              <TableHead>Assunto</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-muted-foreground">Nenhum template encontrado.</p>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/settings/notifications/templates/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Criar template
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              templates.map((template) => (
                <TableRow key={template.uuid}>
                  <TableCell className="font-medium">
                    <div>
                      <span>{template.name}</span>
                      {template.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {template.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <TemplateChannelBadge channel={template.channel} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {template.subject_template ?? '--'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={template.is_active ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {template.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(template.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onEdit(template)}
                        tooltip
                        tooltipText="Editar template"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onTest(template)}
                        tooltip
                        tooltipText="Enviar teste"
                      >
                        <FlaskConical className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setTemplateToDelete(template)}
                        className="text-destructive hover:text-destructive"
                        tooltip
                        tooltipText="Excluir template"
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

      <ConfirmDeleteDialog
        open={!!templateToDelete}
        onOpenChange={() => setTemplateToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        description={
          <>
            Tem certeza que deseja excluir o template{' '}
            <strong>{templateToDelete?.name}</strong>? Esta ação não pode ser desfeita.
          </>
        }
      />
    </>
  );
}
