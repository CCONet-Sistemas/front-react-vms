import { useState } from 'react';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { useTestNotificationTemplate } from '../hooks/useNotificationTemplate';
import type {
  NotificationTemplate,
  TestTemplateResponse,
} from '~/types/notification-template.types';
import { toast } from 'sonner';

interface VariableRow {
  key: string;
  value: string;
}

interface TemplateTestDialogProps {
  template: NotificationTemplate | null;
  isOpen: boolean;
  onClose: () => void;
}

function isHtml(str: string): boolean {
  return /<[a-z][\s\S]*>/i.test(str);
}

export function TemplateTestDialog({ template, isOpen, onClose }: TemplateTestDialogProps) {
  const [variableRows, setVariableRows] = useState<VariableRow[]>([{ key: '', value: '' }]);
  const [result, setResult] = useState<TestTemplateResponse | null>(null);

  const testMutation = useTestNotificationTemplate();

  const handleClose = () => {
    setVariableRows([{ key: '', value: '' }]);
    setResult(null);
    onClose();
  };

  const addRow = () => setVariableRows((prev) => [...prev, { key: '', value: '' }]);

  const removeRow = (index: number) =>
    setVariableRows((prev) => prev.filter((_, i) => i !== index));

  const updateRow = (index: number, field: 'key' | 'value', val: string) =>
    setVariableRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: val } : row)));

  const handleSend = async () => {
    if (!template) return;

    const dto = variableRows
      .filter((r) => r.key.trim())
      .reduce<Record<string, string>>((acc, r) => {
        acc[r.key.trim()] = r.value;
        return acc;
      }, {});

    try {
      const response = await testMutation.mutateAsync({
        uuid: template.uuid,
        dto: Object.keys(dto).length > 0 ? dto : undefined,
      });
      setResult(response);
    } catch {}
  };

  if (!template) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {result ? 'Preview renderizado' : `Testar Template: ${template.name}`}
          </DialogTitle>
        </DialogHeader>

        {result ? (
          <div className="space-y-3">
            {result.subject && (
              <div className="rounded-md border bg-muted/30 px-3 py-2">
                <p className="text-xs text-muted-foreground mb-0.5">Assunto</p>
                <p className="text-sm font-medium">{result.subject}</p>
              </div>
            )}
            <div className="rounded-md border bg-muted/30 overflow-hidden">
              <p className="text-xs text-muted-foreground px-3 pt-2 pb-1">Corpo</p>
              {isHtml(result.body) ? (
                <div
                  className="p-3 overflow-auto max-h-[60vh] text-sm prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: result.body }}
                />
              ) : (
                <pre className="p-3 whitespace-pre-wrap break-words text-sm font-mono overflow-auto max-h-[60vh]">
                  {result.body}
                </pre>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Variáveis</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRow}
                disabled={testMutation.isPending}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Adicionar
              </Button>
            </div>

            {variableRows.map((row, i) => (
              <div key={i} className="flex gap-2 items-end">
                <Input
                  label={i === 0 ? 'Chave' : undefined}
                  value={row.key}
                  onChange={(e) => updateRow(i, 'key', e.target.value)}
                  placeholder="nomeVariavel"
                  disabled={testMutation.isPending}
                  className="flex-1"
                />
                <Input
                  label={i === 0 ? 'Valor' : undefined}
                  value={row.value}
                  onChange={(e) => updateRow(i, 'value', e.target.value)}
                  placeholder="valor"
                  disabled={testMutation.isPending}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeRow(i)}
                  disabled={testMutation.isPending || variableRows.length === 1}
                  className="text-destructive hover:text-destructive mb-0.5"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          {result ? (
            <>
              <Button type="button" variant="outline" onClick={() => setResult(null)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <Button type="button" onClick={handleClose}>
                Fechar
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={testMutation.isPending}
              >
                Cancelar
              </Button>
              <Button onClick={handleSend} disabled={testMutation.isPending}>
                {testMutation.isPending ? 'Gerando...' : 'Gerar Preview'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
