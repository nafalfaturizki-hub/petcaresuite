import { useEffect, useMemo, useState } from 'react';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, Button, Input, Label } from '@/components/ui';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useEmailSettings, useSaveEmailSettings, useTestEmail } from '../settings.hooks';
import type { EmailSettings } from '../settings.types';

const statusMap = {
  connected: { label: 'Connected', icon: CheckCircle, className: 'text-emerald-600' },
  notConfigured: { label: 'Not configured', icon: AlertCircle, className: 'text-slate-500' },
  error: { label: 'Error', icon: XCircle, className: 'text-red-600' }
};

function getStatus(settings?: EmailSettings | null, error?: unknown) {
  if (error) return 'error';
  if (!settings || !settings.host || !settings.port || !settings.username || !settings.password || !settings.fromEmail) return 'notConfigured';
  return 'connected';
}

export default function EmailSettingsPage() {
  useDocumentTitle('Email Settings');
  const { data, error } = useEmailSettings();
  const saveEmailSettings = useSaveEmailSettings();
  const testEmail = useTestEmail();
  const [form, setForm] = useState<EmailSettings>({ host: '', port: 587, username: '', password: '', fromEmail: '', fromName: '' });
  const [showSecret, setShowSecret] = useState(false);
  const [testAddress, setTestAddress] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (data) {
      setForm({
        host: data.host ?? '',
        port: data.port ?? 587,
        username: data.username ?? '',
        password: data.password ?? '',
        fromEmail: data.fromEmail ?? '',
        fromName: data.fromName ?? ''
      });
    }
  }, [data]);

  const status = useMemo(() => getStatus(data, error), [data, error]);
  const statusDefinition = statusMap[status as keyof typeof statusMap];

  return (
    <div className="space-y-6">
      <PageHeader title="Email Settings" description="Configure SMTP settings and send a test email." />
      <Card className="space-y-6 p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">SMTP Host</label>
              <Input value={form.host} onChange={(event) => setForm({ ...form, host: event.target.value })} placeholder="smtp.mailprovider.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Port</label>
              <Input type="number" value={form.port} onChange={(event) => setForm({ ...form, port: Number(event.target.value) })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Username</label>
              <Input value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <Input
                  type={showSecret ? 'text' : 'password'}
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  placeholder="SMTP password"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret((current) => !current)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                >
                  {showSecret ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">From Email</label>
              <Input value={form.fromEmail} onChange={(event) => setForm({ ...form, fromEmail: event.target.value })} type="email" placeholder="noreply@petcare.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">From Name</label>
              <Input value={form.fromName} onChange={(event) => setForm({ ...form, fromName: event.target.value })} placeholder="PetCare Clinic" />
            </div>
            <div className="flex items-center gap-3">
              <statusDefinition.icon className={`h-5 w-5 ${statusDefinition.className}`} />
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{statusDefinition.label}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button onClick={() => saveEmailSettings.mutate(form)} disabled={saveEmailSettings.isLoading}>
                {saveEmailSettings.isLoading ? 'Saving…' : 'Save Settings'}
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  const result = await testEmail.mutateAsync(testAddress);
                  setTestResult(result);
                }}
                disabled={!testAddress || testEmail.isLoading}
              >
                {testEmail.isLoading ? 'Sending…' : 'Send Test'}
              </Button>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Test Email Address</label>
              <Input value={testAddress} onChange={(event) => setTestAddress(event.target.value)} type="email" placeholder="recipient@example.com" />
            </div>
            {testResult && (
              <div className={`rounded-3xl border p-4 text-sm ${testResult.success ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-red-300 bg-red-50 text-red-900'} dark:border-emerald-600/40 dark:bg-emerald-950/60 dark:text-emerald-200`}>
                {testResult.message}
              </div>
            )}
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">SMTP Configuration</p>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Use these values to send transactional emails from PetCare Suite.</p>
            <div className="mt-6 space-y-4 rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="text-sm text-slate-500 dark:text-slate-400">Host</div>
              <div className="text-sm text-slate-900 dark:text-slate-100">{form.host || 'Not configured'}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">From</div>
              <div className="text-sm text-slate-900 dark:text-slate-100">{form.fromEmail || 'Not configured'}</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
