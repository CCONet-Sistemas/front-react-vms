import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
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
import { ConfirmDeleteDialog } from '~/components/common';
import type { Configuration } from '~/types';

interface ConfigTableProps {
  configs: Configuration[];
  onEdit: (config: Configuration) => void;
  onDelete: (config: Configuration) => void;
  isDeleting?: boolean;
}

const typeBadgeVariant: Record<Configuration['type'], 'default' | 'secondary' | 'outline'> = {
  string: 'default',
  number: 'secondary',
  boolean: 'outline',
  json: 'secondary',
};

function toStr(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  return JSON.stringify(value) ?? '';
}

function truncate(
  text: unknown,
  max: number,
  type: 'string' | 'json' | 'boolean' | 'number' = 'string'
): string {
  if (type === 'json') {
    return '[JSON] abra para visualizar';
  }
  const str = toStr(text);
  if (str.length <= max) return str;
  return str.slice(0, max) + '...';
}

export function ConfigTable({ configs, onEdit, onDelete, isDeleting }: ConfigTableProps) {
  const [configToDelete, setConfigToDelete] = useState<Configuration | null>(null);

  const handleDeleteConfirm = () => {
    if (configToDelete) {
      onDelete(configToDelete);
      setConfigToDelete(null);
    }
  };

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Chave</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {configs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Nenhuma configuração encontrada.
                </TableCell>
              </TableRow>
            ) : (
              configs.map((config) => (
                <TableRow key={toStr(config.key.value)}>
                  <TableCell className="font-medium font-mono text-sm">
                    {toStr(config.key.value)}
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <span className="text-sm" title={toStr(config.value.rawValue)}>
                      {truncate(config.value.rawValue, 50, config.value.type)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={typeBadgeVariant[config.value.type] ?? 'secondary'}
                      className="text-xs"
                    >
                      {toStr(config.value.type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[250px]">
                    <span
                      className="text-sm text-muted-foreground"
                      title={toStr(config.description)}
                    >
                      {config.description ? truncate(config.description, 60) : '-'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onEdit(config)}
                        title="Editar configuração"
                        tooltip={true}
                        tooltipText="Editar configuração"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setConfigToDelete(config)}
                        title="Excluir configuração"
                        className="text-destructive hover:text-destructive"
                        tooltip={true}
                        tooltipText="Remover configuração"
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
        open={!!configToDelete}
        onOpenChange={() => setConfigToDelete(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        description={
          <>
            Tem certeza que deseja excluir a configuração{' '}
            <strong>{toStr(configToDelete?.key?.value)}</strong>? Esta ação não pode ser desfeita.
          </>
        }
      />
    </>
  );
}
