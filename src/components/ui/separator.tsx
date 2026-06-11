import * as React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cn } from '@/lib/utils';

export const Separator = React.forwardRef<React.ElementRef<typeof SeparatorPrimitive.Root>, React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>>(
  ({ className, orientation = 'horizontal', decorative = true, ...props }, ref) => (
    <SeparatorPrimitive.Root
      ref={ref}
      className={cn(
        orientation === 'vertical' ? 'mx-2 h-full w-px bg-slate-200 dark:bg-slate-800' : 'my-2 h-px w-full bg-slate-200 dark:bg-slate-800',
        className
      )}
      orientation={orientation}
      decorative={decorative}
      {...props}
    />
  )
);
Separator.displayName = SeparatorPrimitive.Root.displayName;
