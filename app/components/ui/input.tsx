import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '~/lib/utils';

const inputVariants = cva(
  'flex w-full rounded-t-[6px] border-b bg-transparent text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
  {
    variants: {
      variant: {
        default: 'input-state-default',
        error: 'input-state-error',
        success: 'input-state-success',
      },
      inputSize: {
        default: 'input-default',
        sm: 'h-9 px-3 py-1 text-xs',
        lg: 'h-12 pt-4 pr-3 pb-3.5 pl-3.5',
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
  label?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, inputSize, leftIcon, rightIcon, error, label, helperText, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const inputVariant = error ? 'error' : variant;
    const isError = inputVariant === 'error';

    if (label) {
      return (
        <div className={cn('floating-input-wrapper relative', isError && 'floating-input-error')}>
          <input
            id={inputId}
            type={type}
            className={cn(inputVariants({ variant: inputVariant, inputSize }), rightIcon && 'pr-10', className)}
            ref={ref}
            {...props}
            placeholder=" "
          />
          <label htmlFor={inputId} className="floating-label">
            {label}
          </label>
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
          {helperText && <p className="floating-helper-text">{helperText}</p>}
        </div>
      );
    }

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
            <div className="text-muted-foreground border-b bg-transparent left-icon">
              {leftIcon}
            </div>
          )}
          <input
            id={id}
            type={type}
            className={cn(inputVariants({ variant: inputVariant, inputSize }), className)}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="text-muted-foreground border-b bg-transparent right-icon">
              {rightIcon}
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        id={id}
        type={type}
        className={cn(inputVariants({ variant: inputVariant, inputSize }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export interface FloatingInputProps extends Omit<InputProps, 'label'> {
  label: string;
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  (props, ref) => <Input ref={ref} {...props} />
);
FloatingInput.displayName = 'FloatingInput';

export { Input, FloatingInput, inputVariants };
