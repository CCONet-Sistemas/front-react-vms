import { cn } from '~/lib/utils';

interface PageContentProps {
  variant?: 'list' | 'form';
  children: React.ReactNode;
  className?: string;
}

export function PageContent({ variant = 'list', children, className }: PageContentProps) {
  return (
    <div
      className={cn(
        'main-content min-h-full p-4 md:p-6 lg:p-8',
        variant === 'list' && 'main-content-list',
        variant === 'form' && 'main-content-form',
        className
      )}
    >
      {children}
    </div>
  );
}
