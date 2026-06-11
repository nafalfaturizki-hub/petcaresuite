import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

export const Tooltip = TooltipPrimitive.Root;
export const TooltipProvider = TooltipPrimitive.Provider;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export const TooltipContent = React.forwardRef<React.ElementRef<typeof TooltipPrimitive.Content>, React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>>(
  ({ className, sideOffset = 4, ...props }, ref) => (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn('z-50 rounded-xl border border-slate-200 bg-slate-900 px-3 py-2 text-sm text-white shadow-lg shadow-slate-950/20 dark:border-slate-700', className)}
        {...props}
      />
    </TooltipPrimitive.Portal>
  )
);
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export const TooltipArrow = React.forwardRef<React.ElementRef<typeof TooltipPrimitive.Arrow>, React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Arrow>>(
  ({ className, ...props }, ref) => (
    <TooltipPrimitive.Arrow ref={ref} className={cn('fill-slate-900 dark:fill-slate-900', className)} {...props} />
  )
);
TooltipArrow.displayName = TooltipPrimitive.Arrow.displayName;
