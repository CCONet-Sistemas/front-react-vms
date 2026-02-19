import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '~/lib/utils';

const textareaVariants = cva(
  'flex min-h-[80px] w-full rounded-t-[6px] border-b bg-transparent px-3.5 py-2 text-sm font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-y',
  {
    variants: {
      variant: {
        default: 'input-state-default',
        error: 'input-state-error',
        success: 'input-state-success',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  error?: boolean;
  label?: string;
  helperText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, error, label, helperText, id, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = id ?? generatedId;
    const textareaVariant = error ? 'error' : variant;
    const isError = textareaVariant === 'error';

    if (label) {
      return (
        <div className={cn('floating-textarea-wrapper', isError && 'floating-textarea-error')}>
          <textarea
            id={textareaId}
            className={cn(textareaVariants({ variant: textareaVariant }), className)}
            ref={ref}
            {...props}
            placeholder=" "
          />
          <label htmlFor={textareaId} className="floating-label">
            {label}
          </label>
          {helperText && <p className="floating-helper-text">{helperText}</p>}
        </div>
      );
    }

    return (
      <textarea
        id={id}
        className={cn(textareaVariants({ variant: textareaVariant }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea, textareaVariants };
