import * as React from 'react';
import { Dialog, DialogTrigger, DialogClose, DialogContent, DialogOverlay, DialogPortal } from './dialog';
import { cn } from '@/lib/utils';

export const Sheet = Dialog;
export const SheetTrigger = DialogTrigger;
export const SheetClose = DialogClose;
export const SheetPortal = DialogPortal;

export const SheetOverlay = React.forwardRef<React.ElementRef<typeof DialogOverlay>, React.ComponentPropsWithoutRef<typeof DialogOverlay>>(
  ({ className, ...props }, ref) => (
    <DialogOverlay ref={ref} className={cn('bg-slate-950/50', className)} {...props} />
  )
);
SheetOverlay.displayName = 'SheetOverlay';

export const SheetContent = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof DialogContent>>(
  ({ className, children, ...props }, ref) => (
    <DialogPortal>
      <DialogOverlay />
      <DialogContent
        ref={ref}
        className={cn(
          'fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/20 outline-none dark:border-slate-800 dark:bg-slate-950',
          className
        )}
        {...props}
      >
        {children}
      </DialogContent>
    </DialogPortal>
  )
);
SheetContent.displayName = 'SheetContent';

export const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mb-4 flex flex-col gap-2', className)} {...props} />
);
SheetHeader.displayName = 'SheetHeader';

export const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mt-auto flex items-center justify-end gap-2', className)} {...props} />
);
SheetFooter.displayName = 'SheetFooter';
