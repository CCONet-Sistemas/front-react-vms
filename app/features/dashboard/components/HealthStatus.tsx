import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Database,
  HardDrive,
  ListTodo,
  Server,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { cn } from '~/lib/utils';
import type { SystemHealthResponse } from '../types/dashboard.types';

interface HealthStatusProps {
  health: SystemHealthResponse | null;
  isLoading?: boolean;
}

type HealthItemStatus = 'up' | 'down' | 'unknown';

interface HealthItem {
  name: string;
  status: HealthItemStatus;
  icon: React.ElementType;
  message?: string;
}

function StatusIcon({ status }: { status: HealthItemStatus }) {
  switch (status) {
    case 'up':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'down':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
  }
}

function StatusText({ status }: { status: HealthItemStatus }) {
  const config = {
    up: { text: 'Operacional', className: 'text-green-500' },
    down: { text: 'Indisponível', className: 'text-red-500' },
    unknown: { text: 'Desconhecido', className: 'text-yellow-500' },
  };

  const { text, className } = config[status];
  return <span className={cn('text-sm font-medium', className)}>{text}</span>;
}

export function HealthStatus({ health, isLoading = false }: HealthStatusProps) {
  const items: HealthItem[] = [
    {
      name: 'Banco de Dados',
      status: health?.info?.database?.status || 'unknown',
      icon: Database,
    },
    {
      name: 'Armazenamento',
      status: health?.info?.storage?.status || 'unknown',
      icon: HardDrive,
    },
    {
      name: 'Fila de Vídeo',
      status: health?.info?.['video-queue']?.status || 'unknown',
      icon: ListTodo,
    },
  ];

  // Check for errors
  const errors = health?.error || {};
  const hasErrors = Object.keys(errors).length > 0;

  // Overall status
  const overallStatus: HealthItemStatus =
    health?.status === 'ok' ? 'up' : hasErrors ? 'down' : 'unknown';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Status do Sistema</CardTitle>
          <div className="flex items-center gap-2">
            <StatusIcon status={overallStatus} />
            <StatusText status={overallStatus} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between py-1"
              >
                <div className="flex items-center gap-2">
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusIcon status={item.status} />
                </div>
              </div>
            ))}

            {/* Show errors if any */}
            {hasErrors && (
              <div className="mt-4 pt-3 border-t">
                <p className="text-sm font-medium text-red-500 mb-2">Alertas:</p>
                {Object.entries(errors).map(([key, error]) => (
                  <div
                    key={key}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                    <span>
                      <strong className="capitalize">{key}:</strong>{' '}
                      {error.message || 'Serviço indisponível'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
