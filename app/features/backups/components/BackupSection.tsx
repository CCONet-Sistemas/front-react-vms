import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { FormSection } from '~/components/ui/form-section';
import { Button } from '~/components/ui/button';
import { ProtectedFeature } from '~/components/common/ProtectedFeature';
import { useCreateBackup } from '../hooks/useBackup';

export function BackupSection() {
  const createBackup = useCreateBackup();

  const handleBackup = async () => {
    try {
      await createBackup.mutateAsync();
      toast.success('Backup gerado com sucesso!');
    } catch {}
  };

  return (
    <FormSection title="Gerar Backup">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Gere um arquivo JSON com todas as configurações atuais do sistema. O arquivo pode ser
          usado posteriormente para restaurar as configurações.
        </p>
        <ProtectedFeature resource="configuration" action="update">
          <Button onClick={handleBackup} disabled={createBackup.isPending} variant="secondary">
            <Download className="h-4 w-4 mr-2" />
            {createBackup.isPending ? 'Gerando...' : 'Gerar Backup'}
          </Button>
        </ProtectedFeature>
      </div>
    </FormSection>
  );
}
