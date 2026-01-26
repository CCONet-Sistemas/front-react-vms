import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '~/lib/utils';

const inputVariants = cva(
  'flex w-full rounded-md border bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
  {
    variants: {
      variant: {
        default: 'border-input',
        error: 'border-destructive focus-visible:ring-destructive',
        success: 'border-success focus-visible:ring-success',
      },
      inputSize: {
        default: 'h-10 px-3 py-2',
        sm: 'h-9 px-3 py-1 text-xs',
        lg: 'h-12 px-4 py-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'default',
    },
  }
);

export interface InputProps
  extends
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, inputSize, leftIcon, rightIcon, error, ...props }, ref) => {
    const inputVariant = error ? 'error' : variant;

    if (leftIcon || rightIcon) {
      return (
        <div
          className={cn(
            'relative flex items-center input-icon-wrapper',
            leftIcon && 'has-left-icon',
            rightIcon && 'has-right-icon'
          )}
        >
          {leftIcon && (
            <div className="text-muted-foreground border-t border-b border-l left-icon">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(inputVariants({ variant: inputVariant, inputSize }), className)}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="text-muted-foreground border-t border-b border-r right-icon">
              {rightIcon}
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        type={type}
        className={cn(inputVariants({ variant: inputVariant, inputSize }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input, inputVariants };
