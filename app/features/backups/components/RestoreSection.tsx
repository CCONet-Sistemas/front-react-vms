import { useState, useRef } from 'react';
import { UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { FormSection } from '~/components/ui/form-section';
import { Button } from '~/components/ui/button';
import { Select, SelectOption } from '~/components/ui/select';
import { Switch } from '~/components/ui/switch';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { ProtectedFeature } from '~/components/common/ProtectedFeature';
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
import type { RestoreStrategy } from '~/types/backup.types';
import { useRestoreBackup } from '../hooks/useBackup';

export function RestoreSection() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [strategy, setStrategy] = useState<RestoreStrategy>('merge');
  const [keys, setKeys] = useState('');
  const [backupFirst, setBackupFirst] = useState(true);
  const [dryRun, setDryRun] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const restoreBackup = useRestoreBackup();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.json')) {
      toast.error('Arquivo inválido', { description: 'Selecione um arquivo .json de backup.' });
      return;
    }
    setSelectedFile(file);
    setFileName(file.name);
  };

  const handleConfirm = async () => {
    if (!selectedFile) return;

    try {
      const result = await restoreBackup.mutateAsync({
        file: selectedFile,
        strategy,
        keys: keys.trim() || undefined,
        createBackupBeforeRestore: backupFirst,
        dryRun,
      });

      if (result.success) {
        toast.success(dryRun ? 'Simulação concluída' : 'Restauração concluída com sucesso!', {
          description: result.message,
        });
      } else {
        toast.error(dryRun ? 'Simulação falhou' : 'Falha na restauração', {
          description: result.message,
        });
      }
    } catch {
      toast.error(dryRun ? 'Erro ao simular restauração' : 'Erro ao restaurar backup');
    } finally {
      setConfirmOpen(false);
    }
  };

  const isLoading = restoreBackup.isPending;

  return (
    <FormSection title="Restaurar Backup">
      <div className="space-y-5">
        <p className="text-sm text-muted-foreground">
          Selecione um arquivo de backup e escolha a estratégia de restauração. As configurações
          serão aplicadas conforme a estratégia selecionada.
        </p>

        {/* Arquivo */}
        <div className="space-y-2">
          <Label>Arquivo de backup</Label>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="h-4 w-4 mr-2" />
              Selecionar arquivo
            </Button>
            {fileName && (
              <span className="text-sm text-muted-foreground truncate max-w-xs">{fileName}</span>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Estratégia */}
        <div className="space-y-2">
          <Select
            label="Estratégia de restauração"
            value={strategy}
            onChange={(e) => {
              setStrategy(e.target.value as RestoreStrategy);
              setKeys('');
            }}
          >
            <SelectOption value="merge">Mesclar — combina com configurações existentes</SelectOption>
            <SelectOption value="replace">Substituir — substitui todas as configurações</SelectOption>
            <SelectOption value="selective">Seletivo — aplica apenas chaves específicas</SelectOption>
          </Select>
        </div>

        {/* Chaves (apenas para selective) */}
        {strategy === 'selective' && (
          <div className="space-y-2">
            <Label htmlFor="restore-keys">Chaves a restaurar</Label>
            <Input
              id="restore-keys"
              value={keys}
              onChange={(e) => setKeys(e.target.value)}
              placeholder='["app.timeout","app.name"] ou app.timeout,app.name'
            />
            <p className="text-xs text-muted-foreground">
              JSON array ou lista separada por vírgula das chaves a restaurar.
            </p>
          </div>
        )}

        {/* Opções */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Switch
              id="backup-first"
              checked={backupFirst}
              onCheckedChange={setBackupFirst}
            />
            <Label htmlFor="backup-first" className="cursor-pointer">
              Fazer backup antes de restaurar
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="dry-run"
              checked={dryRun}
              onCheckedChange={setDryRun}
            />
            <Label htmlFor="dry-run" className="cursor-pointer">
              Simulação (dry run) — não aplica alterações reais
            </Label>
          </div>
        </div>

        <ProtectedFeature resource="configuration" action="update">
          <Button
            variant={dryRun ? 'outline' : 'destructive'}
            disabled={!selectedFile || isLoading}
            onClick={() => setConfirmOpen(true)}
          >
            <UploadCloud className="h-4 w-4 mr-2" />
            {dryRun ? 'Simular Restauração' : 'Restaurar'}
          </Button>
        </ProtectedFeature>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dryRun ? 'Confirmar simulação' : 'Confirmar restauração'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dryRun
                ? 'Será executada uma simulação da restauração. Nenhuma alteração real será feita no sistema.'
                : backupFirst
                  ? 'Um backup será gerado antes da restauração. Em seguida, as configurações serão aplicadas conforme a estratégia selecionada.'
                  : 'As configurações serão aplicadas conforme a estratégia selecionada. Esta ação pode alterar o comportamento do sistema e não pode ser desfeita facilmente.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isLoading}
              className={
                dryRun
                  ? undefined
                  : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
              }
            >
              {isLoading
                ? dryRun
                  ? 'Simulando...'
                  : 'Restaurando...'
                : dryRun
                  ? 'Confirmar Simulação'
                  : 'Confirmar Restauração'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FormSection>
  );
}
