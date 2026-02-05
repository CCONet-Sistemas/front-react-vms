import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { cn } from '~/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
  isLoading?: boolean;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = 'text-primary',
  isLoading = false,
}: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={cn('h-4 w-4', color)} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-8 w-16 bg-muted animate-pulse rounded" />
        ) : (
          <>
            <p className={cn('text-2xl font-bold', color)}>{value}</p>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
            {trend && (
              <p
                className={cn('text-xs mt-1', trend.isPositive ? 'text-green-500' : 'text-red-500')}
              >
                {trend.isPositive ? '+' : '-'}
                {Math.abs(trend.value)}%
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
