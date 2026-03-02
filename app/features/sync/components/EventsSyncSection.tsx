import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { FormSection } from '~/components/ui/form-section';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { Switch } from '~/components/ui/switch';
import { Select, SelectOption } from '~/components/ui/select';
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
import { useSyncEvents, useAutoSync } from '../hooks/useEventsSync';

const INTERVAL_OPTIONS = [
  { value: '300000', label: '5 minutos' },
  { value: '900000', label: '15 minutos' },
  { value: '1800000', label: '30 minutos' },
  { value: '3600000', label: '60 minutos' },
];

export function EventsSyncSection() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [autoSync, setAutoSync] = useState(false);
  const [intervalMs, setIntervalMs] = useState(900000);

  const syncEvents = useSyncEvents();

  useAutoSync(intervalMs, autoSync);

  const handleConfirm = () => {
    setConfirmOpen(false);
    syncEvents.mutate();
  };

  return (
    <FormSection title="Sincronizar Eventos">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Sincronize os eventos do VMS com o servidor. A sincronização importa eventos pendentes e
          atualiza o estado local com os dados mais recentes.
        </p>

        <ProtectedFeature resource="event" action="update">
          <Button
            variant="secondary"
            disabled={syncEvents.isPending}
            onClick={() => setConfirmOpen(true)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${syncEvents.isPending ? 'animate-spin' : ''}`} />
            {syncEvents.isPending ? 'Sincronizando...' : 'Sincronizar Eventos'}
          </Button>
        </ProtectedFeature>

        <div className="pt-2 border-t space-y-3">
          <div className="flex items-center gap-3">
            <Switch id="auto-sync" checked={autoSync} onCheckedChange={setAutoSync} />
            <Label htmlFor="auto-sync" className="cursor-pointer">
              Sincronização automática
            </Label>
          </div>

          {autoSync && (
            <div className="space-y-1">
              <Select
                label="Intervalo"
                value={String(intervalMs)}
                onChange={(e) => setIntervalMs(Number(e.target.value))}
              >
                {INTERVAL_OPTIONS.map((opt) => (
                  <SelectOption key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectOption>
                ))}
              </Select>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar sincronização</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja iniciar a sincronização de eventos? O processo importará eventos pendentes do
              servidor e atualizará a listagem local.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Sincronizar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FormSection>
  );
}
