import * as React from 'react';
import { cn } from '~/lib/utils';

export interface SliderProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'onChange'
> {
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number) => void;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    { className, value = 0, min = 0, max = 100, step = 1, onValueChange, disabled, ...props },
    ref
  ) => {
    const percentage = ((value - min) / (max - min)) * 100;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onValueChange?.(Number(e.target.value));
    };

    return (
      <div
        className={cn('relative flex w-full touch-none select-none items-center h-5', className)}
      >
        {/* Track background */}
        <div className="absolute inset-y-0 left-0 right-0 flex items-center pointer-events-none">
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-primary/20">
            {/* Filled track */}
            <div className="absolute h-full bg-primary" style={{ width: `${percentage}%` }} />
          </div>
        </div>
        {/* Native input for accessibility and interaction */}
        <input
          ref={ref}
          type="range"
          value={value}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={handleChange}
          className={cn(
            'relative w-full h-5 cursor-pointer appearance-none bg-transparent',
            'disabled:cursor-not-allowed',
            // Webkit track (invisible)
            '[&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:bg-transparent',
            // Webkit thumb
            '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-primary/50 [&::-webkit-slider-thumb]:bg-background [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:-mt-[5px]',
            // Firefox track (invisible)
            '[&::-moz-range-track]:h-1.5 [&::-moz-range-track]:bg-transparent',
            // Firefox thumb
            '[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-primary/50 [&::-moz-range-thumb]:bg-background [&::-moz-range-thumb]:shadow [&::-moz-range-thumb]:cursor-pointer',
            // Focus styles
            '[&:focus-visible::-webkit-slider-thumb]:ring-2 [&:focus-visible::-webkit-slider-thumb]:ring-ring [&:focus-visible::-webkit-slider-thumb]:ring-offset-2',
            // Disabled styles
            '[&:disabled::-webkit-slider-thumb]:opacity-50 [&:disabled::-webkit-slider-thumb]:cursor-not-allowed',
            '[&:disabled::-moz-range-thumb]:opacity-50 [&:disabled::-moz-range-thumb]:cursor-not-allowed'
          )}
          {...props}
        />
      </div>
    );
  }
);

Slider.displayName = 'Slider';

export { Slider };
