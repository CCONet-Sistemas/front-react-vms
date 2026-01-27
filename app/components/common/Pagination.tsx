import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Select, SelectOption } from '~/components/ui/select';
import { cn } from '~/lib/utils';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  className?: string;
}

const limitOptions = [10, 20, 50, 100];

export function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
  className,
}: PaginationProps) {
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-4', className)}>
      {/* Info */}
      <div className="text-sm text-muted-foreground">
        Mostrando {startItem} a {endItem} de {total} resultados
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Limit selector */}
        {onLimitChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Por página:</span>
            <Select
              value={String(limit)}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="w-20"
            >
              {limitOptions.map((option) => (
                <SelectOption key={option} value={String(option)}>
                  {option}
                </SelectOption>
              ))}
            </Select>
          </div>
        )}

        {/* Page navigation */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(1)}
            disabled={!canGoPrevious}
            title="Primeira página"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(page - 1)}
            disabled={!canGoPrevious}
            title="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="px-3 text-sm">
            Página {page} de {totalPages}
          </span>

          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(page + 1)}
            disabled={!canGoNext}
            title="Próxima página"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(totalPages)}
            disabled={!canGoNext}
            title="Última página"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
