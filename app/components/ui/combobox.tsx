import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '~/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command';

export interface ComboboxOption {
  value: string;
  label: string;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  helperText?: string;
  error?: boolean;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = 'Selecione...',
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'Nenhum resultado encontrado.',
  disabled = false,
  className,
  label,
  helperText,
  error,
}: ComboboxProps) {
  const generatedId = React.useId();
  const [open, setOpen] = React.useState(false);

  const selectedOption = options.find((option) => option.value === value);
  const hasValue = !!selectedOption;
  const isError = !!error;

  const trigger = (
    <button
      type="button"
      role="combobox"
      aria-expanded={open}
      aria-haspopup="listbox"
      disabled={disabled}
      className={cn(
        'flex w-full items-center justify-between rounded-t-[6px] border-b bg-transparent text-sm font-medium transition-colors',
        'focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        'select-default input-state-default',
        isError && 'input-state-error',
        !hasValue && 'text-muted-foreground',
        className
      )}
    >
      <span>{selectedOption ? selectedOption.label : (!label ? placeholder : '')}</span>
      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
    </button>
  );

  if (label) {
    return (
      <div className={cn('floating-combobox-wrapper', hasValue && 'combobox-has-value', isError && 'floating-combobox-error')}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <Command>
              <CommandInput placeholder={searchPlaceholder} />
              <CommandList>
                <CommandEmpty>{emptyMessage}</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onSelect={() => {
                        onChange?.(option.value === value ? '' : option.value);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === option.value ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <label htmlFor={generatedId} className="floating-label pointer-events-none">
          {label}
        </label>
        {helperText && <p className="floating-helper-text">{helperText}</p>}
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'flex w-full items-center justify-between rounded-t-[6px] border-b bg-transparent text-sm font-medium transition-colors',
            'focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
            'select-default input-state-default',
            isError && 'input-state-error',
            !hasValue && 'text-muted-foreground',
            className
          )}
        >
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onChange?.(option.value === value ? '' : option.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === option.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
