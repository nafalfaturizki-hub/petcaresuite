import * as React from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CalendarProps {
  date: Date;
  onDateChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function Calendar({ date, onDateChange, minDate, maxDate }: CalendarProps) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const startDay = start.getDay();

  const daysInMonth = Array.from({ length: end.getDate() }, (_, idx) => new Date(date.getFullYear(), date.getMonth(), idx + 1));

  const isDisabled = (day: Date) => {
    if (minDate && day < minDate) return true;
    if (maxDate && day > maxDate) return true;
    return false;
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{format(date, 'MMMM yyyy')}</p>
          <p className="text-lg font-semibold">{format(date, 'EEEE, MMM d')}</p>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
        {days.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-2 text-sm">
        {Array.from({ length: startDay }).map((_, index) => (
          <div key={`blank-${index}`} />
        ))}
        {daysInMonth.map((day) => {
          const disabled = isDisabled(day);
          const isSelected = day.toDateString() === date.toDateString();
          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => onDateChange(day)}
              className={cn(
                'rounded-2xl py-2 transition-colors',
                disabled ? 'cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-900 dark:text-slate-600' : 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800',
                isSelected && 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950'
              )}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
