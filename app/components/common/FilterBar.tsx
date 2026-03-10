import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import { Search, X, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Input } from '~/components/ui/input';
import { Select, SelectOption } from '~/components/ui/select';
import { DateRangePicker } from '~/components/ui/date-picker';
import { useListParams } from '~/hooks/useListParams';
import { cn } from '~/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SortOption {
  label: string;
  value: string;
}

export interface FilterSelectConfig {
  type: 'select';
  key: string;
  placeholder: string;
  options: { label: string; value: string }[];
  className?: string;
}

export interface FilterDateRangeConfig {
  type: 'daterange';
  startKey?: string;
  endKey?: string;
}

export type FilterFieldConfig = FilterSelectConfig | FilterDateRangeConfig;

// ─── Component ────────────────────────────────────────────────────────────────

const DEFAULT_PER_PAGE_OPTIONS = [10, 20, 50, 100];
const DEFAULT_DEBOUNCE_MS = 400;

interface FilterBarProps {
  placeholder?: string;
  debounceMs?: number;
  sortOptions?: SortOption[];
  perPageOptions?: number[];
  fields?: FilterFieldConfig[];
  className?: string;
}

export function FilterBar({
  placeholder = 'Buscar...',
  debounceMs = DEFAULT_DEBOUNCE_MS,
  sortOptions,
  perPageOptions = DEFAULT_PER_PAGE_OPTIONS,
  fields = [],
  className,
}: FilterBarProps) {
  const { params, setSearch, setSort, setOrder, setPerPage } = useListParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const [inputValue, setInputValue] = useState(params.search ?? '');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setInputValue(params.search ?? '');
  }, [params.search]);

  const handleSearchChange = (value: string) => {
    setInputValue(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setSearch(value || undefined);
    }, debounceMs);
  };

  const updateFieldParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const newParams = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === '') newParams.delete(key);
        else newParams.set(key, value);
      });
      newParams.set('page', '1');
      setSearchParams(newParams);
    },
    [searchParams, setSearchParams]
  );

  const clearableFieldKeys = fields.flatMap((field) => {
    if (field.type === 'select') return [field.key];
    if (field.type === 'daterange')
      return [field.startKey ?? 'startDate', field.endKey ?? 'endDate'];
    return [];
  });

  const hasActiveFilters =
    !!params.search || !!params.sort || clearableFieldKeys.some((key) => !!searchParams.get(key));

  const handleClearAll = useCallback(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('search');
    newParams.delete('sort');
    newParams.delete('order');
    clearableFieldKeys.forEach((key) => newParams.delete(key));
    newParams.set('page', '1');
    setSearchParams(newParams);
    setInputValue('');
  }, [searchParams, setSearchParams, clearableFieldKeys]);

  const OrderIcon = params.order === 'desc' ? ArrowDown : ArrowUp;

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {/* Search */}
      <div className="flex-1 min-w-[200px] max-w-sm">
        <Input
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
        />
      </div>

      {/* Sort */}
      {sortOptions && sortOptions.length > 0 && (
        <div className="flex items-center gap-2">
          <Select
            value={String(params.sort ?? '')}
            onChange={(e) => setSort(e.target.value || undefined)}
            className="w-[160px]"
            label="Ordenar por"
          >
            {sortOptions.map((opt) => (
              <SelectOption key={opt.value} value={opt.value}>
                {opt.label}
              </SelectOption>
            ))}
          </Select>

          {params.sort && (
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setOrder(params.order === 'asc' ? 'desc' : 'asc')}
              title={params.order === 'asc' ? 'Crescente' : 'Decrescente'}
            >
              <OrderIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Extra fields (select, daterange, viewmode) */}
      {fields.map((field, i) => {
        if (field.type === 'select') {
          const value = searchParams.get(field.key) ?? '';
          return (
            <Select
              key={field.key}
              value={value}
              onChange={(e) => updateFieldParams({ [field.key]: e.target.value || undefined })}
              className={cn('w-[160px]', field.className)}
              label={field.placeholder}
            >
              {field.options.map((opt) => (
                <SelectOption key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectOption>
              ))}
            </Select>
          );
        }

        if (field.type === 'daterange') {
          const startKey = field.startKey ?? 'startDate';
          const endKey = field.endKey ?? 'endDate';
          return (
            <DateRangePicker
              key={`daterange-${i}`}
              value={{
                startDate: searchParams.get(startKey) ?? undefined,
                endDate: searchParams.get(endKey) ?? undefined,
              }}
              onChange={(range) =>
                updateFieldParams({ [startKey]: range.startDate, [endKey]: range.endDate })
              }
            />
          );
        }

        return null;
      })}

      {/* Per page */}
      <div className="flex items-center gap-2">
        <Select
          value={String(params.per_page ?? 10)}
          onChange={(e) => setPerPage(Number(e.target.value))}
          className="w-20"
          label="Por página"
        >
          {perPageOptions.map((opt) => (
            <SelectOption key={opt} value={String(opt)}>
              {opt}
            </SelectOption>
          ))}
        </Select>
      </div>

      {/* Clear all */}
      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={handleClearAll} className="gap-1.5">
          <X className="h-3.5 w-3.5" />
          Limpar
          <Badge
            variant="secondary"
            className="ml-0.5 h-4 min-w-4 rounded-full px-1 text-[10px] leading-none"
          >
            {[
              params.search ? 1 : 0,
              params.sort ? 1 : 0,
              ...clearableFieldKeys.map((key) => (searchParams.get(key) ? 1 : 0)),
            ].reduce((a, b) => a + b, 0)}
          </Badge>
        </Button>
      )}
    </div>
  );
}
