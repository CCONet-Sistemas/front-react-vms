import { ListTodo, Play, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { cn } from '~/lib/utils';
import type { QueueMetrics } from '../types/dashboard.types';

interface QueueStatusProps {
  queue: QueueMetrics | null;
  isLoading?: boolean;
}

interface QueueItem {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}

export function QueueStatus({ queue, isLoading = false }: QueueStatusProps) {
  const items: QueueItem[] = [
    {
      label: 'Ativos',
      value: queue?.active || 0,
      icon: Play,
      color: 'text-blue-500',
    },
    {
      label: 'Aguardando',
      value: queue?.waiting || 0,
      icon: Clock,
      color: 'text-yellow-500',
    },
    {
      label: 'Concluídos',
      value: queue?.completed || 0,
      icon: CheckCircle2,
      color: 'text-green-500',
    },
    {
      label: 'Falhas',
      value: queue?.failed || 0,
      icon: XCircle,
      color: 'text-red-500',
    },
  ];

  const totalPending = (queue?.active || 0) + (queue?.waiting || 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Fila de Processamento</CardTitle>
          <div className="flex items-center gap-2">
            <ListTodo className="h-4 w-4 text-muted-foreground" />
            {totalPending > 0 && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {totalPending} pendente{totalPending > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {items.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
              >
                <item.icon className={cn('h-5 w-5', item.color)} />
                <div>
                  <p className="text-lg font-semibold">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
