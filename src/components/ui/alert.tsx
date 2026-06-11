import * as React from 'react';
import { cn } from '@/lib/utils';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const alertVariants: Record<NonNullable<AlertProps['variant']>, string> = {
  default: 'bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-100',
  success: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200',
  warning: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
  danger: 'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200'
};

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(({ className, variant = 'default', ...props }, ref) => (
  <div ref={ref} className={cn('rounded-3xl border border-slate-200 px-4 py-3 text-sm shadow-sm dark:border-slate-800', alertVariants[variant], className)} {...props} />
));
Alert.displayName = 'Alert';
