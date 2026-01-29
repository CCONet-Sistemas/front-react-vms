import * as React from 'react';
import { cn } from '~/lib/utils';

export interface FlexListSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number;
  variant?: 'grid' | 'list';
}

const FlexListSkeleton = React.forwardRef<HTMLDivElement, FlexListSkeletonProps>(
  ({ count = 8, variant = 'grid', className, ...props }, ref) => {
    return (
      <>
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            ref={index === 0 ? ref : undefined}
            className={cn(
              'animate-pulse rounded-lg border bg-card',
              variant === 'grid' ? 'aspect-video' : 'h-24',
              className
            )}
            {...props}
          >
            <div className="flex h-full flex-col">
              {variant === 'grid' ? (
                <>
                  <div className="flex-1 bg-muted rounded-t-lg" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-4 p-4 h-full">
                  <div className="h-16 w-24 bg-muted rounded shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                    <div className="h-3 bg-muted rounded w-1/4" />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </>
    );
  }
);
FlexListSkeleton.displayName = 'FlexListSkeleton';

export { FlexListSkeleton };
