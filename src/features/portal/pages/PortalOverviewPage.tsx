import { Card } from '@/components/ui';
import { PageHeader } from '@/components/common/PageHeader';
import { useAuthStore } from '@/stores/auth.store';
import { usePortalSummary, usePortalCustomer, usePortalCustomerId } from '../portal.hooks';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function PortalOverviewPage() {
  const user = useAuthStore((state) => state.user);
  const customerIdQuery = usePortalCustomerId(user?.id);
  const customerQuery = usePortalCustomer(user?.id);
  const summaryQuery = usePortalSummary(customerIdQuery.data ?? undefined);

  return (
    <div className="space-y-6">
      <PageHeader title="Customer Portal" description="View your pets, upcoming visits, and invoices." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6">
          <div className="text-sm text-slate-500">Pet count</div>
          <div className="mt-4 text-3xl font-semibold">{summaryQuery.data?.petCount ?? '-'}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-slate-500">Upcoming appointments</div>
          <div className="mt-4 text-3xl font-semibold">{summaryQuery.data?.appointmentCount ?? '-'}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-slate-500">Invoices</div>
          <div className="mt-4 text-3xl font-semibold">{summaryQuery.data?.invoiceCount ?? '-'}</div>
        </Card>
      </div>

      <Card className="space-y-4 p-6">
        <div className="text-sm text-slate-500">Your account</div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-sm text-slate-500">Name</p>
            <p className="mt-1 font-semibold text-slate-900">{customerQuery.data?.fullName ?? user?.fullName ?? '—'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Email</p>
            <p className="mt-1 font-semibold text-slate-900">{customerQuery.data?.email ?? '—'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">WhatsApp</p>
            <p className="mt-1 font-semibold text-slate-900">{customerQuery.data?.whatsapp ?? '—'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Status</p>
            <p className="mt-1 font-semibold text-slate-900">{customerQuery.data?.status ?? '—'}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
