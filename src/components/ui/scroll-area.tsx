import * as React from 'react';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { cn } from '@/lib/utils';

export const ScrollArea = React.forwardRef<React.ElementRef<typeof ScrollAreaPrimitive.Root>, React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>>(
  ({ className, children, ...props }, ref) => (
    <ScrollAreaPrimitive.Root ref={ref} className={cn('relative overflow-hidden', className)} {...props}>
      {children}
    </ScrollAreaPrimitive.Root>
  )
);
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

export const ScrollAreaViewport = React.forwardRef<React.ElementRef<typeof ScrollAreaPrimitive.Viewport>, React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Viewport>>(
  ({ className, ...props }, ref) => (
    <ScrollAreaPrimitive.Viewport ref={ref} className={cn('h-full w-full', className)} {...props} />
  )
);
ScrollAreaViewport.displayName = ScrollAreaPrimitive.Viewport.displayName;

export const ScrollAreaScrollbar = React.forwardRef<React.ElementRef<typeof ScrollAreaPrimitive.Scrollbar>, React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Scrollbar>>(
  ({ className, orientation = 'vertical', ...props }, ref) => (
    <ScrollAreaPrimitive.Scrollbar
      ref={ref}
      orientation={orientation}
      className={cn('flex touch-none select-none p-0.5 transition-colors', orientation === 'vertical' ? 'h-full w-2.5' : 'h-2.5 w-full', className)}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-slate-300 dark:bg-slate-700" />
    </ScrollAreaPrimitive.Scrollbar>
  )
);
ScrollAreaScrollbar.displayName = ScrollAreaPrimitive.Scrollbar.displayName;

export const ScrollAreaCorner = React.forwardRef<React.ElementRef<typeof ScrollAreaPrimitive.Corner>, React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Corner>>(
  ({ className, ...props }, ref) => (
    <ScrollAreaPrimitive.Corner ref={ref} className={cn('bg-slate-200 dark:bg-slate-800', className)} {...props} />
  )
);
ScrollAreaCorner.displayName = ScrollAreaPrimitive.Corner.displayName;
