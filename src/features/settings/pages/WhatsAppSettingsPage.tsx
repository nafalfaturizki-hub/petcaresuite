import { useEffect, useMemo, useState } from 'react';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, Button, Input, Label, RadioGroup, RadioGroupItem } from '@/components/ui';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSaveWhatsAppSettings, useTestWhatsApp, useWhatsAppSettings } from '../settings.hooks';
import type { WhatsAppSettings } from '../settings.types';

const statusMap = {
  connected: { label: 'Connected', icon: CheckCircle, className: 'text-emerald-600' },
  notConfigured: { label: 'Not configured', icon: AlertCircle, className: 'text-slate-500' },
  error: { label: 'Error', icon: XCircle, className: 'text-red-600' }
};

function getStatus(settings?: WhatsAppSettings | null, error?: unknown) {
  if (error) return 'error';
  if (!settings || !settings.provider || !settings.apiKey || !settings.senderNumber) return 'notConfigured';
  return 'connected';
}

export default function WhatsAppSettingsPage() {
  useDocumentTitle('WhatsApp Settings');
  const { data, isLoading, error } = useWhatsAppSettings();
  const saveSettings = useSaveWhatsAppSettings();
  const testWhatsApp = useTestWhatsApp();
  const [form, setForm] = useState<WhatsAppSettings>({ provider: 'fonnte', apiKey: '', senderNumber: '' });
  const [showSecret, setShowSecret] = useState(false);
  const [testNumber, setTestNumber] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (data) {
      setForm({
        provider: data.provider,
        apiKey: data.apiKey ?? '',
        senderNumber: data.senderNumber ?? ''
      });
    }
  }, [data]);

  const status = useMemo(() => getStatus(data, error), [data, error]);
  const statusDefinition = statusMap[status as keyof typeof statusMap];

  const isMaskedKey = useMemo(() => form.apiKey.startsWith('••••'), [form.apiKey]);

  return (
    <div className="space-y-6">
      <PageHeader title="WhatsApp Settings" description="Configure WhatsApp provider and test connectivity." />
      <Card className="space-y-6 p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-700">Provider</p>
              <RadioGroup value={form.provider} onValueChange={(value) => setForm({ ...form, provider: value as WhatsAppSettings['provider'] })} className="mt-3 flex flex-col gap-3">
                <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950">
                  <RadioGroupItem value="fonnte" />
                  <span>Fonnte</span>
                </label>
                <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950">
                  <RadioGroupItem value="wablas" />
                  <span>Wablas</span>
                </label>
              </RadioGroup>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">API Key</label>
              <div className="relative">
                <Input
                  type={showSecret ? 'text' : 'password'}
                  value={form.apiKey}
                  onChange={(event) => setForm({ ...form, apiKey: event.target.value })}
                  placeholder="Enter API key"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret((current) => !current)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                >
                  {showSecret ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">API keys are masked after saving for security.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Sender Number</label>
              <Input
                value={form.senderNumber}
                onChange={(event) => setForm({ ...form, senderNumber: event.target.value })}
                placeholder="+6281234567890"
              />
            </div>
            <div className="flex items-center gap-3">
              <statusDefinition.icon className={`h-5 w-5 ${statusDefinition.className}`} />
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{statusDefinition.label}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                variant="default"
                onClick={() => saveSettings.mutate(form)}
                disabled={saveSettings.isLoading}
              >
                {saveSettings.isLoading ? 'Saving…' : 'Save Settings'}
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  const result = await testWhatsApp.mutateAsync(testNumber);
                  setTestResult(result);
                }}
                disabled={!testNumber || testWhatsApp.isLoading}
              >
                {testWhatsApp.isLoading ? 'Sending…' : 'Send Test'}
              </Button>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Test Number</label>
              <Input value={testNumber} onChange={(event) => setTestNumber(event.target.value)} placeholder="Recipient phone number" />
            </div>
            {testResult ? (
              <div className={`rounded-3xl border p-4 text-sm ${testResult.success ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-red-300 bg-red-50 text-red-900'} dark:border-emerald-600/40 dark:bg-emerald-950/60 dark:text-emerald-200`}>
                {testResult.message}
              </div>
            ) : null}
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">WhatsApp settings</p>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Use the selected provider and sender number for WhatsApp notifications.</p>
            <div className="mt-6 space-y-4 rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="text-sm text-slate-500 dark:text-slate-400">Provider</div>
              <div className="text-sm text-slate-900 dark:text-slate-100">{form.provider}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Sender</div>
              <div className="text-sm text-slate-900 dark:text-slate-100">{form.senderNumber || 'Not configured'}</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
