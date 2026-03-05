import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '~/lib/utils';

interface ChipProps {
  variant: 'input' | 'filter' | 'choice' | 'action';
  label: string;
  icon?: React.ReactNode;
  selected?: boolean;
  disabled?: boolean;
  outline?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
}

function Chip({ variant, label, icon, selected, disabled, outline, onRemove, onClick, className }: ChipProps) {
  const base =
    'inline-flex items-center h-8 rounded-2xl p-1 gap-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:shadow-sm disabled:opacity-50 disabled:pointer-events-none';

  const outlineBorder = outline
    ? cn(
        'border',
        selected && variant === 'choice' ? 'border-primary' : 'border-[#CED2D9]',
        'focus-visible:border-[#767A80]'
      )
    : '';

  const containerColor = selected
    ? 'bg-primary-95'
    : 'bg-[#E4E6EB] hover:bg-[#D8DADF]';

  const iconWrapperClass = cn(
    'w-6 h-6 rounded-full flex items-center justify-center shrink-0',
    selected && 'bg-primary-90'
  );

  const iconClass = cn('w-4 h-4', selected ? 'text-primary' : 'text-neutral-60');

  const labelClass = cn(
    'px-2 text-sm leading-none tracking-wide',
    selected ? 'text-primary' : 'text-foreground'
  );

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.();
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(base, containerColor, outlineBorder, className)}
    >
      {variant !== 'choice' && icon && (
        <span className={iconWrapperClass}>
          <span className={iconClass}>{icon}</span>
        </span>
      )}

      <span className={labelClass}>{label}</span>

      {variant === 'input' && onRemove && (
        <span
          role="button"
          tabIndex={-1}
          onClick={handleRemove}
          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-black/10"
        >
          <X className="w-3 h-3" />
        </span>
      )}
    </button>
  );
}

export { Chip };
export type { ChipProps };
