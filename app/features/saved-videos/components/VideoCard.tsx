import { Link } from 'react-router';
import { cva, type VariantProps } from 'class-variance-authority';
import { Film, Download } from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import type { Video } from '~/types';

const videoCardVariants = cva(
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

export interface VideoCardProps extends VariantProps<typeof videoCardVariants> {
  video: Video;
  onDownload?: (video: Video) => void;
  className?: string;
}

function formatFileSize(sizeStr: string): string {
  const bytes = Number(sizeStr);
  if (isNaN(bytes) || bytes === 0) return sizeStr;
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(1)} ${units[i]}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function VideoCard({ video, variant = 'grid', onDownload, className }: VideoCardProps) {
  return (
    <div className={cn(videoCardVariants({ variant }), className)}>
      <Link to={`/saved-video/${video.uuid}`} className="contents">
        {/* Thumbnail */}
        <div className={cn(thumbnailVariants({ variant }))}>
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <Film className="h-10 w-10 text-muted-foreground/50" />
            <img
              src={video.thumbnailUrl}
              alt={video.originalFileName}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Format badge */}
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="gap-1 text-xs uppercase">
              {video.format}
            </Badge>
          </div>

          {/* Resolution badge - only on grid */}
          {variant === 'grid' && video.width > 0 && video.height > 0 && (
            <div className="absolute bottom-2 left-2">
              <Badge variant="outline" className="bg-black/50 text-white border-none text-xs">
                {video.width}x{video.height}
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
                {video.originalFileName}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatFileSize(video.size)} &middot; {formatDate(video.createdAt)}
              </p>
            </div>
          </div>

          {/* Extra info for list view */}
          {variant === 'list' && video.width > 0 && video.height > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <span>
                {video.width}x{video.height}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Download button */}
      {onDownload && (
        <div className={cn('flex items-center', variant === 'grid' ? 'px-3 pb-3' : 'pr-3 sm:pr-4')}>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={(e) => {
              e.preventDefault();
              onDownload(video);
            }}
            title="Baixar vídeo"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export { videoCardVariants };
