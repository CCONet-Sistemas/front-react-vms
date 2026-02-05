import { HardDrive } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Progress } from '~/components/ui/progress';
import { cn } from '~/lib/utils';
import type { DiskInfo } from '../types/dashboard.types';

interface StorageCardProps {
  disk: DiskInfo | null;
  isLoading?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getUsageColor(percent: number): string {
  if (percent >= 90) return 'bg-red-500';
  if (percent >= 75) return 'bg-yellow-500';
  return 'bg-green-500';
}

function getUsageTextColor(percent: number): string {
  if (percent >= 90) return 'text-red-500';
  if (percent >= 75) return 'text-yellow-500';
  return 'text-green-500';
}

export function StorageCard({ disk, isLoading = false }: StorageCardProps) {
  const usagePercent = disk?.usagePercent || 0;
  const total = disk?.total || 0;
  const used = disk?.used || 0;
  const available = disk?.available || 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Armazenamento</CardTitle>
          <HardDrive className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-3 bg-muted animate-pulse rounded" />
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Progress bar */}
            <div className="space-y-2">
              <Progress
                value={usagePercent}
                size="lg"
                indicatorClassName={getUsageColor(usagePercent)}
              />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {formatBytes(used)} usado
                </span>
                <span className={cn('font-medium', getUsageTextColor(usagePercent))}>
                  {usagePercent}%
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-sm font-medium">{formatBytes(total)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Disponível</p>
                <p className="text-sm font-medium">{formatBytes(available)}</p>
              </div>
            </div>

            {/* Warning if usage is high */}
            {usagePercent >= 90 && (
              <div className="p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-500">
                Armazenamento crítico! Libere espaço para evitar problemas.
              </div>
            )}
            {usagePercent >= 75 && usagePercent < 90 && (
              <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-600">
                Armazenamento alto. Considere liberar espaço.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
