import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '~/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

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

// ─── Item types for parsing children ──────────────────────────────────────────

type OptionItem = {
  type: 'option';
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
};

type GroupItem = {
  type: 'group';
  label: string;
  options: OptionItem[];
};

type Item = OptionItem | GroupItem;

interface OptionElementProps {
  value?: string | number;
  children?: React.ReactNode;
  disabled?: boolean;
}

interface OptGroupElementProps {
  label?: string;
  children?: React.ReactNode;
}

function parseChildren(
  children: React.ReactNode,
  currentValue: string
): { items: Item[]; selectedLabel: React.ReactNode } {
  const items: Item[] = [];
  let selectedLabel: React.ReactNode = null;

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const displayName = (child.type as React.FC).displayName;

    if (displayName === 'SelectOption') {
      const p = child.props as OptionElementProps;
      const optValue = String(p.value ?? '');
      items.push({ type: 'option', value: optValue, label: p.children, disabled: p.disabled });
      if (optValue === currentValue) selectedLabel = p.children;
    } else if (displayName === 'SelectOptGroup') {
      const gp = child.props as OptGroupElementProps;
      const groupOptions: OptionItem[] = [];
      React.Children.forEach(gp.children, (gc) => {
        if (!React.isValidElement(gc)) return;
        if ((gc.type as React.FC).displayName === 'SelectOption') {
          const p = gc.props as OptionElementProps;
          const optValue = String(p.value ?? '');
          groupOptions.push({
            type: 'option',
            value: optValue,
            label: p.children,
            disabled: p.disabled,
          });
          if (optValue === currentValue) selectedLabel = p.children;
        }
      });
      items.push({ type: 'group', label: gp.label ?? '', options: groupOptions });
    }
  });

  return { items, selectedLabel };
}

// ─── Select component ──────────────────────────────────────────────────────────

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      variant,
      selectSize,
      error,
      label,
      helperText,
      id,
      children,
      value,
      defaultValue,
      onChange,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const selectId = id ?? generatedId;
    const selectVariant = error ? 'error' : variant;
    const isError = selectVariant === 'error';

    // ── With label: styled Popover-based dropdown ──────────────────────────────
    if (label) {
      return (
        <SelectFloating
          id={selectId}
          label={label}
          helperText={helperText}
          isError={isError}
          variant={selectVariant}
          selectSize={selectSize}
          className={className}
          value={value !== undefined ? String(value) : undefined}
          defaultValue={defaultValue !== undefined ? String(defaultValue) : undefined}
          onChange={onChange}
          disabled={disabled}
          ref={ref}
        >
          {children}
        </SelectFloating>
      );
    }

    // ── Without label: native select ───────────────────────────────────────────
    return (
      <div className="relative">
        <select
          id={id}
          className={cn(selectVariants({ variant: selectVariant, selectSize }), 'pr-10', className)}
          ref={ref}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          disabled={disabled}
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

// ─── Floating (Popover-based) select ──────────────────────────────────────────

interface SelectFloatingProps {
  id: string;
  label: string;
  helperText?: string;
  isError: boolean;
  variant?: 'default' | 'error' | 'success' | null;
  selectSize?: 'default' | 'sm' | 'lg' | null;
  className?: string;
  value?: string;
  defaultValue?: string;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  disabled?: boolean;
  children?: React.ReactNode;
}

const SelectFloating = React.forwardRef<HTMLSelectElement, SelectFloatingProps>(
  (
    {
      id,
      label,
      helperText,
      isError,
      variant,
      selectSize,
      className,
      value,
      defaultValue,
      onChange,
      disabled,
      children,
    },
    ref
  ) => {
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = React.useState(
      isControlled ? (value ?? '') : (defaultValue ?? '')
    );
    const [open, setOpen] = React.useState(false);
    const wrapperRef = React.useRef<HTMLDivElement>(null);
    const [popoverWidth, setPopoverWidth] = React.useState<number | undefined>(undefined);

    React.useEffect(() => {
      if (isControlled) setInternalValue(value ?? '');
    }, [isControlled, value]);

    const handleOpenChange = (nextOpen: boolean) => {
      if (disabled) return;
      if (nextOpen && wrapperRef.current) {
        setPopoverWidth(wrapperRef.current.offsetWidth);
      }
      setOpen(nextOpen);
    };

    const currentValue = isControlled ? (value ?? '') : internalValue;
    const hasValue = !!currentValue && currentValue !== '';

    const { items, selectedLabel } = parseChildren(children, currentValue);

    const handleSelect = (optValue: string) => {
      if (!isControlled) setInternalValue(optValue);
      onChange?.({ target: { value: optValue } } as React.ChangeEvent<HTMLSelectElement>);
      setOpen(false);
    };

    const triggerClass = cn(
      selectVariants({ variant, selectSize }),
      'pr-10 text-left font-medium',
      !hasValue && 'text-transparent',
      className
    );

    return (
      <div className={cn(isError && 'floating-select-error')}>
        <div
          ref={wrapperRef}
          className={cn(
            'floating-select-wrapper',
            hasValue && 'select-has-value',
            open && 'floating-select-open'
          )}
        >
          <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
              <button type="button" id={id} disabled={disabled} className={triggerClass}>
                <span className="truncate">{selectedLabel ?? '\u00A0'}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="p-0 max-h-60 overflow-y-auto rounded-t-none"
              align="start"
              sideOffset={0}
              style={popoverWidth ? { width: popoverWidth } : undefined}
            >
              {items.map((item, i) => {
                if (item.type === 'group') {
                  return (
                    <div key={i}>
                      <p className="px-2 pt-1 pb-0.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {item.label}
                      </p>
                      {item.options.map((opt) => (
                        <SelectDropdownItem
                          key={opt.value}
                          value={opt.value}
                          label={opt.label}
                          disabled={opt.disabled}
                          selected={currentValue === opt.value}
                          onSelect={handleSelect}
                        />
                      ))}
                    </div>
                  );
                }
                return (
                  <SelectDropdownItem
                    key={item.value}
                    value={item.value}
                    label={item.label}
                    disabled={item.disabled}
                    selected={currentValue === item.value}
                    onSelect={handleSelect}
                  />
                );
              })}
            </PopoverContent>
          </Popover>

          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />

          <label htmlFor={id} className="floating-label pointer-events-none">
            {label}
          </label>

          {/* Hidden native select for ref/form compat */}
          <select
            ref={ref}
            value={currentValue}
            onChange={(e) => {
              if (!isControlled) setInternalValue(e.target.value);
              onChange?.(e);
            }}
            disabled={disabled}
            className="sr-only"
            tabIndex={-1}
            aria-hidden
          >
            {children}
          </select>
        </div>
        {helperText && <p className="floating-helper-text">{helperText}</p>}
      </div>
    );
  }
);
SelectFloating.displayName = 'SelectFloating';

// ─── Dropdown item ─────────────────────────────────────────────────────────────

function SelectDropdownItem({
  value,
  label,
  disabled,
  selected,
  onSelect,
}: {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
  selected: boolean;
  onSelect: (value: string) => void;
}) {
  if (!value) return null;
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(value)}
      className={cn(
        'flex w-full items-center gap-2 min-h-[48px] px-4 text-sm transition-colors text-left',
        'hover:bg-accent hover:text-accent-foreground',
        'disabled:opacity-50 disabled:pointer-events-none',
        selected && 'bg-accent/60 font-medium'
      )}
    >
      <Check className={cn('h-4 w-4 shrink-0', selected ? 'opacity-100' : 'opacity-0')} />
      {label}
    </button>
  );
}

// ─── SelectOption / SelectOptGroup ────────────────────────────────────────────

export interface SelectOptionProps extends React.OptionHTMLAttributes<HTMLOptionElement> {}

const SelectOption = React.forwardRef<HTMLOptionElement, SelectOptionProps>(
  ({ className, ...props }, ref) => (
    <option ref={ref} className={cn('bg-background', className)} {...props} />
  )
);
SelectOption.displayName = 'SelectOption';

export interface SelectOptGroupProps extends React.OptgroupHTMLAttributes<HTMLOptGroupElement> {}

const SelectOptGroup = React.forwardRef<HTMLOptGroupElement, SelectOptGroupProps>(
  ({ className, ...props }, ref) => (
    <optgroup ref={ref} className={cn('bg-background', className)} {...props} />
  )
);
SelectOptGroup.displayName = 'SelectOptGroup';

export { Select, SelectOption, SelectOptGroup, selectVariants };
