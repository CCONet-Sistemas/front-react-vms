import * as React from 'react';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { cn } from '~/lib/utils';

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function parseDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d;
}

function toDateStr(value?: string): string | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : format(d, 'yyyy-MM-dd');
}

// ─── Calendar Grid ─────────────────────────────────────────────────────────────

function CalendarGrid({
  viewDate,
  selected,
  onSelect,
  minStr,
  maxStr,
}: {
  viewDate: Date;
  selected?: Date;
  onSelect: (day: Date) => void;
  minStr?: string;
  maxStr?: string;
}) {
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(viewDate), { weekStartsOn: 0 }),
    end: endOfWeek(endOfMonth(viewDate), { weekStartsOn: 0 }),
  });

  return (
    <div className="grid grid-cols-7">
      {WEEK_DAYS.map((d) => (
        <div
          key={d}
          className="h-8 w-8 mx-auto flex items-center justify-center text-[11px] font-medium text-muted-foreground"
        >
          {d}
        </div>
      ))}
      {days.map((day) => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const isSelected = selected ? isSameDay(day, selected) : false;
        const inMonth = isSameMonth(day, viewDate);
        const isTodayDate = isToday(day);
        const isDisabled = (!!minStr && dayStr < minStr) || (!!maxStr && dayStr > maxStr);

        return (
          <button
            key={dayStr}
            type="button"
            disabled={isDisabled}
            onClick={() => onSelect(day)}
            className={cn(
              'h-8 w-8 mx-auto rounded-full text-xs flex items-center justify-center transition-colors',
              isSelected
                ? 'bg-primary text-primary-foreground font-semibold'
                : isTodayDate
                  ? 'border border-primary text-primary font-medium'
                  : inMonth
                    ? 'hover:bg-accent'
                    : 'text-muted-foreground/30',
              isDisabled && 'opacity-30 cursor-not-allowed pointer-events-none',
            )}
          >
            {format(day, 'd')}
          </button>
        );
      })}
    </div>
  );
}

// ─── DatePicker ───────────────────────────────────────────────────────────────

export interface DatePickerProps {
  value?: string;
  onChange: (date: string | undefined) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
}

export function DatePicker({ value, onChange, label, placeholder, className, disabled, min, max }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const [popoverWidth, setPopoverWidth] = React.useState<number | undefined>(undefined);

  const selected = parseDate(value);
  const [viewDate, setViewDate] = React.useState<Date>(() => selected ?? new Date());

  React.useEffect(() => {
    if (selected) setViewDate(selected);
  }, [value]);

  const hasValue = !!selected;
  const displayValue = selected ? format(selected, 'dd/MM/yyyy') : '';

  const handleOpenChange = (next: boolean) => {
    if (disabled) return;
    if (next && wrapperRef.current) {
      setPopoverWidth(wrapperRef.current.offsetWidth);
    }
    setOpen(next);
  };

  const handleSelect = (day: Date) => {
    onChange(day.toISOString());
    setOpen(false);
  };

  const minStr = toDateStr(min);
  const maxStr = toDateStr(max);

  return (
    <div
      ref={wrapperRef}
      className={cn(
        'floating-select-wrapper',
        hasValue && 'select-has-value',
        open && 'floating-select-open',
        className,
      )}
    >
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              'flex w-full items-center rounded-t-[6px] border-b bg-transparent',
              'text-sm font-medium transition-colors cursor-pointer text-left',
              'select-default input-state-default focus-visible:outline-none pr-10',
            )}
          >
            <span
              className={cn(
                hasValue
                  ? 'text-foreground'
                  : open && placeholder
                    ? 'text-muted-foreground'
                    : 'text-transparent',
              )}
            >
              {displayValue || (open ? placeholder : undefined) || '\u00A0'}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="p-3 rounded-t-none"
          align="start"
          sideOffset={0}
          style={popoverWidth ? { minWidth: popoverWidth } : undefined}
        >
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-1 px-1">
            <button
              type="button"
              onClick={() => setViewDate(subMonths(viewDate, 1))}
              className="h-7 w-7 flex items-center justify-center rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold capitalize select-none">
              {format(viewDate, 'MMMM yyyy', { locale: ptBR })}
            </span>
            <button
              type="button"
              onClick={() => setViewDate(addMonths(viewDate, 1))}
              className="h-7 w-7 flex items-center justify-center rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <CalendarGrid
            viewDate={viewDate}
            selected={selected}
            onSelect={handleSelect}
            minStr={minStr}
            maxStr={maxStr}
          />
        </PopoverContent>
      </Popover>

      {/* Trailing icons */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none text-muted-foreground">
        {hasValue && !disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(undefined);
            }}
            className="pointer-events-auto hover:text-foreground transition-colors p-0.5"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        <Calendar className="h-4 w-4 opacity-50" />
      </div>

      {label && (
        <label className="floating-label pointer-events-none">{label}</label>
      )}
    </div>
  );
}

// ─── DateRangePicker ──────────────────────────────────────────────────────────

export interface DateRange {
  startDate?: string;
  endDate?: string;
}

export interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  labels?: { start?: string; end?: string };
  placeholder?: { start?: string; end?: string };
  className?: string;
  disabled?: boolean;
}

export function DateRangePicker({ value, onChange, labels, placeholder, className, disabled }: DateRangePickerProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <DatePicker
        value={value.startDate}
        onChange={(date) => onChange({ ...value, startDate: date })}
        label={labels?.start}
        placeholder={placeholder?.start}
        disabled={disabled}
        max={value.endDate}
        className="w-[160px]"
      />
      <span className="text-muted-foreground text-sm shrink-0">até</span>
      <DatePicker
        value={value.endDate}
        onChange={(date) => onChange({ ...value, endDate: date })}
        label={labels?.end}
        placeholder={placeholder?.end}
        disabled={disabled}
        min={value.startDate}
        className="w-[160px]"
      />
    </div>
  );
}
