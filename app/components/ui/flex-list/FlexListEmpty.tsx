import * as React from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '~/lib/utils';

export interface FlexListEmptyProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

const FlexListEmpty = React.forwardRef<HTMLDivElement, FlexListEmptyProps>(
  (
    {
      icon,
      title = 'Nenhum item encontrado',
      description = 'Não há itens para exibir no momento.',
      action,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center py-12 px-4 text-center',
          className
        )}
        {...props}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
          {icon ?? <Inbox className="h-6 w-6 text-muted-foreground" />}
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
        {action}
      </div>
    );
  }
);
FlexListEmpty.displayName = 'FlexListEmpty';

export { FlexListEmpty };
