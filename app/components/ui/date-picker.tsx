import * as React from 'react';
import { Calendar, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '~/lib/utils';
import { Button } from './button';

const dateInputClass = [
  'h-[54px] w-full rounded-t-[6px] border-b border-b-[var(--color-border)] bg-transparent',
  'text-sm font-medium transition-colors',
  'pt-4 pb-3.5',
  'focus-visible:outline-none focus-visible:border-b-[var(--color-primary)]',
  'disabled:cursor-not-allowed disabled:opacity-50',
  '[&::-webkit-calendar-picker-indicator]:opacity-0',
  '[&::-webkit-calendar-picker-indicator]:absolute',
  '[&::-webkit-calendar-picker-indicator]:inset-0',
  '[&::-webkit-calendar-picker-indicator]:w-full',
  '[&::-webkit-calendar-picker-indicator]:h-full',
  '[&::-webkit-calendar-picker-indicator]:cursor-pointer',
].join(' ');

function formatDateForInput(date?: string | Date): string {
  if (!date) return '';
  if (typeof date === 'string') return date.split('T')[0];
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

export function DatePicker({ value, onChange, className, disabled, min, max }: DatePickerProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue ? new Date(newValue).toISOString() : undefined);
  };

  const handleClear = () => {
    onChange(undefined);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={cn('relative flex items-center', className)}>
      <div className="relative flex-1">
        <div className="absolute left-3.5 top-5 -translate-y-1/2 text-muted-foreground pointer-events-none">
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
          className={cn(dateInputClass, 'pl-10 pr-8')}
        />
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
  className,
  disabled,
}: DateRangePickerProps) {
  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange({ ...value, startDate: newValue ? new Date(newValue).toISOString() : undefined });
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange({ ...value, endDate: newValue ? new Date(newValue).toISOString() : undefined });
  };

  const handleClear = () => onChange({ startDate: undefined, endDate: undefined });

  const hasValue = value.startDate || value.endDate;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        <div className="absolute left-3.5 top-5 -translate-y-1/2 text-muted-foreground pointer-events-none">
          <Calendar className="h-4 w-4" />
        </div>
        <input
          type="date"
          value={formatDateForInput(value.startDate)}
          onChange={handleStartChange}
          disabled={disabled}
          max={value.endDate ? formatDateForInput(value.endDate) : undefined}
          className={cn(dateInputClass, 'w-[180px] pl-10 pr-3')}
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
          className={cn(dateInputClass, 'w-[180px] px-3.5')}
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
