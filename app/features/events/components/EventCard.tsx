import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Check, Clock, Eye, Video } from 'lucide-react';
import { cn } from '~/lib/utils';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { useAuthImage } from '~/hooks';
import { statusConfig } from '../constants/eventTypes';
import type { Event } from '~/types';

const eventCardVariants = cva(
  'group relative rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md',
  {
    variants: {
      variant: {
        grid: 'flex flex-col overflow-hidden',
        list: 'flex flex-row items-stretch overflow-hidden',
      },
    },
    defaultVariants: {
      variant: 'grid',
    },
  }
);

const thumbnailVariants = cva('relative bg-muted overflow-hidden', {
  variants: {
    variant: {
      grid: 'aspect-video w-full',
      list: 'w-32 sm:w-40 shrink-0',
    },
  },
  defaultVariants: {
    variant: 'grid',
  },
});

export interface EventCardProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'>,
    VariantProps<typeof eventCardVariants> {
  event: Event;
  onView?: (event: Event) => void;
  onAcknowledge?: (event: Event) => void;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Agora mesmo';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min atrás`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} h atrás`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} d atrás`;

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const EventCard = React.forwardRef<HTMLDivElement, EventCardProps>(
  ({ event, variant = 'grid', onView, onAcknowledge, className, ...props }, ref) => {
    const status = statusConfig[event.status];
    const StatusIcon = status.icon;
    const isNew = event.status === 'new';

    // Load thumbnail with authentication
    const thumbnailUrl = `/events/fullcam/videos/${event.uuid}/thumbnail`;
    const { imageUrl, isLoading: isLoadingThumbnail } = useAuthImage(thumbnailUrl);

    const handleClick = () => {
      onView?.(event);
    };

    const handleAcknowledge = (e: React.MouseEvent) => {
      e.stopPropagation();
      onAcknowledge?.(event);
    };

    return (
      <div
        ref={ref}
        className={cn(
          eventCardVariants({ variant }),
          isNew && 'ring-2 ring-primary/20',
          onView && 'cursor-pointer',
          className
        )}
        onClick={handleClick}
        role={onView ? 'button' : undefined}
        tabIndex={onView ? 0 : undefined}
        onKeyDown={(e) => {
          if (onView && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleClick();
          }
        }}
        {...props}
      >
        {/* New indicator */}
        {isNew && (
          <div className="absolute top-2 left-2 z-10">
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
          </div>
        )}

        {/* Thumbnail */}
        <div className={cn(thumbnailVariants({ variant }))}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={event.reason}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              {isLoadingThumbnail ? (
                <div className="h-6 w-6 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
              ) : (
                <Video className="h-8 w-8 text-muted-foreground/50" />
              )}
            </div>
          )}

          {/* Status badge overlay on thumbnail */}
          <div className="absolute top-2 right-2">
            <Badge variant={status.badgeVariant} className="gap-1 text-xs">
              <StatusIcon className="h-3 w-3" />
              {variant === 'grid' && <span className="hidden sm:inline">{status.label}</span>}
            </Badge>
          </div>

          {/* Confidence badge */}
          {event.confidence > 0 && (
            <div className="absolute bottom-2 left-2">
              <Badge variant="outline" className="text-xs bg-background/80">
                {event.confidence}%
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div
          className={cn(
            'flex flex-col',
            variant === 'grid' ? 'p-3 flex-1' : 'p-3 sm:p-4 flex-1 justify-center'
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3
                className={cn(
                  'font-medium text-foreground truncate',
                  variant === 'grid' ? 'text-sm' : 'text-sm sm:text-base'
                )}
              >
                {event.reason}
              </h3>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                Câmera: {event.cameraName}
              </p>
            </div>
          </div>

          <div
            className={cn(
              'flex items-center gap-2 text-xs text-muted-foreground',
              variant === 'grid' ? 'mt-2' : 'mt-1 sm:mt-2'
            )}
          >
            <Clock className="h-3 w-3" />
            <span>{formatRelativeTime(event.timestamp)}</span>

            {event.status === 'acknowledged' && (
              <span className="flex items-center gap-1 text-success ml-auto">
                <Check className="h-3 w-3" />
                <span className="hidden sm:inline">Confirmado</span>
              </span>
            )}
          </div>

          {/* Actions - visible on hover for grid, always visible for list */}
          {(onView || onAcknowledge) && (
            <div
              className={cn(
                'flex items-center gap-2 mt-2',
                variant === 'grid' && 'opacity-0 group-hover:opacity-100 transition-opacity'
              )}
            >
              {onView && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs flex-1"
                  onClick={handleClick}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Ver
                </Button>
              )}
              {onView && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs flex-1"
                  onClick={handleClick}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Ver
                </Button>
              )}
              {onAcknowledge && event.status !== 'acknowledged' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs flex-1"
                  onClick={handleAcknowledge}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Confirmar
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
);
EventCard.displayName = 'EventCard';

export { EventCard, eventCardVariants };
