import * as React from 'react';
import { Calendar, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '~/lib/utils';
import { Button } from './button';

// Helper to format date for input (YYYY-MM-DD)
function formatDateForInput(date?: string | Date): string {
  if (!date) return '';
  if (typeof date === 'string') {
    return date.split('T')[0];
  }
  return format(date, 'yyyy-MM-dd');
}


// ============================================
// DatePicker (Single Date)
// ============================================

export interface DatePickerProps {
  value?: string;
  onChange: (date: string | undefined) => void;
  className?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
}

export function DatePicker({
  value,
  onChange,
  className,
  disabled,
  min,
  max,
}: DatePickerProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue) {
      onChange(new Date(newValue).toISOString());
    } else {
      onChange(undefined);
    }
  };

  const handleClear = () => {
    onChange(undefined);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={cn('relative flex items-center', className)}>
      <div className="relative flex-1">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          <Calendar className="h-4 w-4" />
        </div>
        <input
          ref={inputRef}
          type="date"
          value={formatDateForInput(value)}
          onChange={handleChange}
          disabled={disabled}
          min={min ? formatDateForInput(min) : undefined}
          max={max ? formatDateForInput(max) : undefined}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-8 py-2 text-sm',
            'ring-offset-background placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            '[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer'
          )}
        />
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================
// DateRangePicker
// ============================================

export interface DateRange {
  startDate?: string;
  endDate?: string;
}

export interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  placeholder?: { start?: string; end?: string };
  className?: string;
  disabled?: boolean;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = { start: 'Data inicial', end: 'Data final' },
  className,
  disabled,
}: DateRangePickerProps) {
  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange({
      ...value,
      startDate: newValue ? new Date(newValue).toISOString() : undefined,
    });
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange({
      ...value,
      endDate: newValue ? new Date(newValue).toISOString() : undefined,
    });
  };

  const handleClear = () => {
    onChange({ startDate: undefined, endDate: undefined });
  };

  const hasValue = value.startDate || value.endDate;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          <Calendar className="h-4 w-4" />
        </div>
        <input
          type="date"
          value={formatDateForInput(value.startDate)}
          onChange={handleStartChange}
          disabled={disabled}
          max={value.endDate ? formatDateForInput(value.endDate) : undefined}
          placeholder={placeholder.start}
          className={cn(
            'flex h-10 w-[140px] rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm',
            'ring-offset-background placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            '[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer'
          )}
        />
      </div>

      <span className="text-muted-foreground text-sm">até</span>

      <div className="relative">
        <input
          type="date"
          value={formatDateForInput(value.endDate)}
          onChange={handleEndChange}
          disabled={disabled}
          min={value.startDate ? formatDateForInput(value.startDate) : undefined}
          placeholder={placeholder.end}
          className={cn(
            'flex h-10 w-[140px] rounded-md border border-input bg-background px-3 py-2 text-sm',
            'ring-offset-background placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            '[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer'
          )}
        />
      </div>

      {hasValue && !disabled && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={handleClear}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
