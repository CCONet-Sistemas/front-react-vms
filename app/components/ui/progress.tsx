import { cn } from '~/lib/utils';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  indicatorClassName?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Progress({
  value,
  max = 100,
  className,
  indicatorClassName,
  showLabel = false,
  size = 'md',
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn('relative w-full', className)}>
      <div
        className={cn(
          'w-full overflow-hidden rounded-full bg-secondary',
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            'h-full rounded-full bg-primary transition-all duration-300',
            indicatorClassName
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-muted-foreground ml-2">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}
