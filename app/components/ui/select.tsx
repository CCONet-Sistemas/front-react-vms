import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';
import { cn } from '~/lib/utils';

const selectVariants = cva(
  'flex w-full items-center justify-between rounded-t-[6px] border-b bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed transition-colors appearance-none cursor-pointer',
  {
    variants: {
      variant: {
        default: 'input-state-default',
        error: 'input-state-error',
        success: 'input-state-success',
      },
      selectSize: {
        default: 'select-default',
        sm: 'h-9 px-3 py-1 text-xs',
        lg: 'h-12 pt-4 pr-3 pb-3.5 pl-3.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      selectSize: 'default',
    },
  }
);

export interface SelectProps
  extends
    Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof selectVariants> {
  error?: boolean;
  label?: string;
  helperText?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, variant, selectSize, error, label, helperText, id, children, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id ?? generatedId;
    const selectVariant = error ? 'error' : variant;
    const isError = selectVariant === 'error';

    if (label) {
      return (
        <div className={cn('floating-select-wrapper', isError && 'floating-select-error')}>
          <select
            id={selectId}
            className={cn(selectVariants({ variant: selectVariant, selectSize }), 'pr-10', className)}
            ref={ref}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="absolute right-3 bottom-3 h-4 w-4 opacity-50 pointer-events-none" />
          <label htmlFor={selectId} className="floating-label">
            {label}
          </label>
          {helperText && <p className="floating-helper-text">{helperText}</p>}
        </div>
      );
    }

    return (
      <div className="relative">
        <select
          id={id}
          className={cn(selectVariants({ variant: selectVariant, selectSize }), 'pr-10', className)}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50 pointer-events-none" />
      </div>
    );
  }
);
Select.displayName = 'Select';

export interface SelectOptionProps extends React.OptionHTMLAttributes<HTMLOptionElement> {}

const SelectOption = React.forwardRef<HTMLOptionElement, SelectOptionProps>(
  ({ className, ...props }, ref) => (
    <option ref={ref} className={cn('bg-background', className)} {...props} />
  )
);
SelectOption.displayName = 'SelectOption';

export { Select, SelectOption, selectVariants };
