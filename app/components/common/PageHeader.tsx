import { cn } from '~/lib/utils';
import { ProtectedFeature } from './ProtectedFeature';
import { Link } from 'react-router';
import { Plus } from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import type { Permission } from '~/types';
import type { StreamStatusConfig } from '~/features/cameras/constants';
import { Button, Label, Select } from '../ui';
import { FormSection } from '../ui/form-section';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  to?: string;
  linkText?: string;
  permission?: Permission;
  status?: StreamStatusConfig;
}

export function PageHeader({
  title,
  description,
  children,
  className,
  to,
  linkText,
  permission,
  status,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        // Expand full width (compensate for parent padding)
        '-mx-4 -mt-4 md:-mx-6 md:-mt-6 lg:-mx-8 lg:-mt-8',
        // Internal padding
        'px-4 py-4 md:px-6 md:py-5 lg:px-8 lg:py-6',
        // Layout
        'flex items-center justify-between',
        // Style
        // Bottom margin to separate from content
        'mb-6',
        'bg-content-header',
        className
      )}
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
      {to && linkText && permission && (
        <ProtectedFeature permission={permission}>
          <Link to={to}>
            <Button className="bt-primary" variant={'secondary'}>
              <Plus className="h-4 w-4 mr-2" />
              {linkText}
            </Button>
          </Link>
        </ProtectedFeature>
      )}

      {status && (
        <div className="mt-2">
          <Badge variant={status.variant} className="gap-1">
            <status.icon className="h-3 w-3" />
            {status.label}
          </Badge>
        </div>
      )}
    </div>
  );
}
