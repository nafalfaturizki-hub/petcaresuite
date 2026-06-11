import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(({ className, value, ...props }, ref) => (
  <div ref={ref} className={cn('relative h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800', className)} {...props}>
    <div className="absolute inset-y-0 left-0 rounded-full bg-slate-900 transition-all duration-300 dark:bg-slate-100" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
  </div>
));
Progress.displayName = 'Progress';
