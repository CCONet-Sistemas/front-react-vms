import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '~/lib/utils';

const Tabs = TabsPrimitive.Root;

// ─── Indicator context ────────────────────────────────────────────────────────

interface IndicatorStyle {
  left: number;
  width: number;
}

const TabsIndicatorContext = React.createContext<{
  setIndicator: (style: IndicatorStyle) => void;
}>({ setIndicator: () => {} });

// ─── TabsList ─────────────────────────────────────────────────────────────────

const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, children, ...props }, ref) => {
  const [indicator, setIndicator] = React.useState<IndicatorStyle>({ left: 0, width: 0 });

  return (
    <TabsIndicatorContext.Provider value={{ setIndicator }}>
      <TabsPrimitive.List
        ref={ref}
        className={cn('relative flex w-full border-b border-border', className)}
        {...props}
      >
        {children}
        <span
          aria-hidden
          className="absolute bottom-0 h-[2px] bg-primary-40 transition-all duration-300 ease-in-out"
          style={{ left: indicator.left, width: indicator.width }}
        />
      </TabsPrimitive.List>
    </TabsIndicatorContext.Provider>
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

// ─── TabsTrigger ──────────────────────────────────────────────────────────────

const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => {
  const innerRef = React.useRef<HTMLButtonElement>(null);
  const { setIndicator } = React.useContext(TabsIndicatorContext);

  React.useLayoutEffect(() => {
    const node = innerRef.current;
    if (!node) return;

    const updateIndicator = () => {
      if (node.dataset.state !== 'active') return;
      const parent = node.parentElement;
      if (!parent) return;
      const { left: parentLeft } = parent.getBoundingClientRect();
      const { left, width } = node.getBoundingClientRect();
      setIndicator({ left: left - parentLeft, width });
    };

    const mutationObserver = new MutationObserver(updateIndicator);
    mutationObserver.observe(node, { attributes: true, attributeFilter: ['data-state'] });

    const resizeObserver = new ResizeObserver(updateIndicator);
    resizeObserver.observe(node);

    updateIndicator();

    return () => {
      mutationObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, [setIndicator]);

  return (
    <TabsPrimitive.Trigger
      ref={(node) => {
        (innerRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      }}
      className={cn(
        'flex items-center justify-center gap-1.5',
        'min-w-[127px] h-[48px] px-4',
        'text-[14px] font-medium leading-[16px] tracking-[0.08em] uppercase',
        'text-muted-foreground transition-colors duration-200',
        'hover:text-foreground hover:bg-black/[0.04]',
        'focus-visible:outline-none',
        'disabled:pointer-events-none disabled:opacity-50',
        'data-[state=active]:text-primary-40',
        className
      )}
      {...props}
    />
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

// ─── TabsContent ──────────────────────────────────────────────────────────────

const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn('mt-4 focus-visible:outline-none', className)}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
