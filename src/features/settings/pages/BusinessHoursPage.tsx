import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, Button, Input, Label, Switch } from '@/components/ui';
import { useBusinessHours, useUpdateBusinessHours } from '../settings.hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import type { BusinessHoursSettings, Holiday } from '../settings.types';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function BusinessHoursPage() {
  useDocumentTitle('Business Hours');
  const { data, isLoading } = useBusinessHours();
  const updateHours = useUpdateBusinessHours();
  const [settings, setSettings] = useState<BusinessHoursSettings>({ schedule: [], holidays: [] });

  useEffect(() => {
    if (data) {
      setSettings(data);
    }
  }, [data]);

  const canSave = useMemo(() => settings.schedule.length === 7, [settings]);

  const updateSchedule = (index: number, update: Partial<Holiday> | Partial<BusinessHoursSettings['schedule'][number]>) => {
    setSettings((current) => ({
      ...current,
      schedule: current.schedule.map((entry, idx) => (idx === index ? { ...entry, ...update } : entry))
    }));
  };

  const updateHoliday = (index: number, update: Partial<Holiday>) => {
    setSettings((current) => ({
      ...current,
      holidays: current.holidays.map((holiday, idx) => (idx === index ? { ...holiday, ...update } : holiday))
    }));
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Business Hours" description="Configure daily hours and holiday closures." />
      <Card className="space-y-6 p-6">
        <div className="space-y-4">
          {settings.schedule.map((entry, index) => (
            <div key={entry.dayOfWeek} className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 lg:grid-cols-[1fr,180px,180px,120px]">
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{DAYS[entry.dayOfWeek]}</p>
              </div>
              <div>
                <Label>Open</Label>
                <Input type="time" value={entry.startTime} onChange={(event) => updateSchedule(index, { startTime: event.target.value })} />
              </div>
              <div>
                <Label>Close</Label>
                <Input type="time" value={entry.endTime} onChange={(event) => updateSchedule(index, { endTime: event.target.value })} />
              </div>
              <div className="flex items-center gap-3">
                <Label className="mb-0">Closed</Label>
                <Switch checked={entry.isClosed} onCheckedChange={(checked) => updateSchedule(index, { isClosed: checked })} />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-100">Special holidays</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">Add dates when the clinic is closed or has special hours.</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setSettings((current) => ({ ...current, holidays: [...current.holidays, { date: '', label: '' }] }))}
            >
              Add holiday
            </Button>
          </div>
          <div className="space-y-4">
            {settings.holidays.map((holiday, index) => (
              <div key={`${holiday.date}-${index}`} className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 lg:grid-cols-[180px,1fr,120px]">
                <Input type="date" value={holiday.date} onChange={(event) => updateHoliday(index, { date: event.target.value })} />
                <Input value={holiday.label} placeholder="Holiday name" onChange={(event) => updateHoliday(index, { label: event.target.value })} />
                <Button variant="danger" onClick={() => setSettings((current) => ({ ...current, holidays: current.holidays.filter((_, idx) => idx !== index) }))}>
                  Remove
                </Button>
              </div>
            ))}
            {!settings.holidays.length && <p className="text-sm text-slate-600 dark:text-slate-400">No special holidays configured.</p>}
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => updateHours.mutate(settings)} disabled={!canSave || updateHours.isLoading}>
            {updateHours.isLoading ? 'Saving…' : 'Save Business Hours'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
