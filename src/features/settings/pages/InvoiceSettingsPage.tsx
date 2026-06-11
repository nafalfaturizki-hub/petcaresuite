import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, Button, Input, Textarea } from '@/components/ui';
import { useInvoiceSettings, useUpdateInvoiceSettings } from '../settings.hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import type { InvoiceSettings } from '../settings.types';

const emptySettings: InvoiceSettings = {
  prefix: 'INV',
  nextNumber: 1,
  headerText: '',
  footerText: ''
};

export default function InvoiceSettingsPage() {
  useDocumentTitle('Invoice Settings');
  const { data, isLoading } = useInvoiceSettings();
  const updateSettings = useUpdateInvoiceSettings();
  const [form, setForm] = useState<InvoiceSettings>(emptySettings);

  useEffect(() => {
    if (data) {
      setForm({ ...emptySettings, ...data });
    }
  }, [data]);

  const preview = useMemo(
    () => `${form.prefix}-${String(form.nextNumber).padStart(5, '0')}`,
    [form.prefix, form.nextNumber]
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Invoice Settings" description="Configure invoice numbering and templates." />
      <Card className="space-y-6 p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Invoice Prefix</label>
              <Input value={form.prefix} onChange={(event) => setForm({ ...form, prefix: event.target.value })} placeholder="INV" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Next Number</label>
              <Input
                type="number"
                min={1}
                value={form.nextNumber}
                onChange={(event) => setForm({ ...form, nextNumber: Number(event.target.value) || 1 })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Header Text</label>
              <Textarea
                value={form.headerText}
                onChange={(event) => setForm({ ...form, headerText: event.target.value })}
                placeholder="Enter text for the top of invoices"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Footer Text</label>
              <Textarea
                value={form.footerText}
                onChange={(event) => setForm({ ...form, footerText: event.target.value })}
                placeholder="Enter footer text for invoices"
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={() => updateSettings.mutate(form)} disabled={updateSettings.isLoading}>
                {updateSettings.isLoading ? 'Saving…' : 'Save Invoice Settings'}
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Live preview</p>
              <div className="mt-4 rounded-3xl bg-white p-5 shadow-sm dark:bg-slate-950">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Invoice</p>
                <div className="mt-4 text-lg font-semibold text-slate-950 dark:text-slate-100">{preview}</div>
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">{form.headerText || 'Invoice header text will appear here.'}</p>
                <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                  {form.footerText || 'Invoice footer text will appear here.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
