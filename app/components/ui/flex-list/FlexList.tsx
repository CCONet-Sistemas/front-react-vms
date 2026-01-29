import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '~/lib/utils';
import { FlexListEmpty } from './FlexListEmpty';
import { FlexListSkeleton } from './FlexListSkeleton';

const flexListVariants = cva('w-full', {
  variants: {
    variant: {
      grid: 'grid',
      list: 'flex flex-col',
    },
    gap: {
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
    },
  },
  compoundVariants: [
    {
      variant: 'grid',
      className: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    },
  ],
  defaultVariants: {
    variant: 'grid',
    gap: 'md',
  },
});

const gridColumnsVariants = cva('', {
  variants: {
    columns: {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      auto: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    },
  },
  defaultVariants: {
    columns: 'auto',
  },
});

export interface FlexListProps<T>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof flexListVariants> {
  data: T[];
  isLoading?: boolean;
  keyExtractor: (item: T) => string;
  renderItem: (item: T, index: number) => React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 'auto';
  emptyState?: React.ReactNode;
  skeletonCount?: number;
  renderSkeleton?: () => React.ReactNode;
}

function FlexListInner<T>(
  {
    data,
    isLoading = false,
    keyExtractor,
    renderItem,
    variant = 'grid',
    columns = 'auto',
    gap = 'md',
    emptyState,
    skeletonCount = 8,
    renderSkeleton,
    className,
    ...props
  }: FlexListProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  if (isLoading) {
    return (
      <div
        ref={ref}
        className={cn(
          flexListVariants({ variant, gap }),
          variant === 'grid' && gridColumnsVariants({ columns }),
          className
        )}
        {...props}
      >
        {renderSkeleton ? (
          Array.from({ length: skeletonCount }).map((_, index) => (
            <React.Fragment key={index}>{renderSkeleton()}</React.Fragment>
          ))
        ) : (
          <FlexListSkeleton count={skeletonCount} variant={variant} />
        )}
      </div>
    );
  }

  if (data.length === 0) {
    return emptyState ?? <FlexListEmpty />;
  }

  return (
    <div
      ref={ref}
      className={cn(
        flexListVariants({ variant, gap }),
        variant === 'grid' && gridColumnsVariants({ columns }),
        className
      )}
      {...props}
    >
      {data.map((item, index) => (
        <React.Fragment key={keyExtractor(item)}>{renderItem(item, index)}</React.Fragment>
      ))}
    </div>
  );
}

export const FlexList = React.forwardRef(FlexListInner) as <T>(
  props: FlexListProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> }
) => React.ReactElement;

export { flexListVariants };
