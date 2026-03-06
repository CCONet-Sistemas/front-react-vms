import { Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import { TemplateChannelBadge } from './TemplateChannelBadge';
import type { DefaultNotificationTemplate } from '~/types/notification-template.types';

interface TemplateDefaultsTableProps {
  templates: DefaultNotificationTemplate[];
  onPreview: (template: DefaultNotificationTemplate) => void;
}

export function TemplateDefaultsTable({ templates, onPreview }: TemplateDefaultsTableProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Canal</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                Nenhum template padrão encontrado.
              </TableCell>
            </TableRow>
          ) : (
            templates.map((template) => (
              <TableRow key={template.name}>
                <TableCell className="font-medium font-mono text-sm">{template.name}</TableCell>
                <TableCell>
                  <TemplateChannelBadge channel={template.channel} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {template.description ?? '--'}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onPreview(template)}
                    tooltip
                    tooltipText="Ver detalhes"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
