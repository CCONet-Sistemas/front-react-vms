import { cn } from '~/lib/utils';

interface DividerProps {
  className?: string;
}

export function Divider({ className }: DividerProps) {
  return (
    <hr
      className={cn('w-full border-none h-px bg-[#CED2D9]', className)}
    />
  );
}
