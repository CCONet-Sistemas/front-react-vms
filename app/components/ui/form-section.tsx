import * as React from 'react';
import { cn } from '~/lib/utils';

interface FormSectionProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  children?: React.ReactNode;
}

const FormSection = React.forwardRef<HTMLElement, FormSectionProps>(
  ({ title, children, className, ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn(
          'rounded-lg border border-section-border bg-section p-5 main-content-list',
          className
        )}
        {...props}
      >
        {title && (
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {title}
          </h2>
        )}
        {children}
      </section>
    );
  }
);

FormSection.displayName = 'FormSection';

export { FormSection };
