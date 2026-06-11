import { Card } from '@/components/ui';
import { PageHeader } from '@/components/common/PageHeader';
import { useAuthStore } from '@/stores/auth.store';
import { usePortalInvoices, usePortalCustomerId } from '../portal.hooks';

export default function PortalInvoicesPage() {
  const user = useAuthStore((state) => state.user);
  const customerIdQuery = usePortalCustomerId(user?.id);
  const invoicesQuery = usePortalInvoices(customerIdQuery.data ?? undefined);

  return (
    <div className="space-y-6">
      <PageHeader title="Invoices" description="Review your recent invoices and payment status." />
      <div className="grid gap-4">
        {invoicesQuery.data?.length ? (
          invoicesQuery.data.map((invoice) => (
            <Card key={invoice.id} className="p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm text-slate-500">Invoice ID: {invoice.id}</div>
                  <h2 className="text-lg font-semibold">Total: ₱{invoice.total.toFixed(2)}</h2>
                </div>
                <div className="text-sm text-slate-600">{invoice.status}</div>
              </div>
              <div className="mt-4 text-sm text-slate-500">Created on {new Date(invoice.createdAt).toLocaleDateString()}</div>
            </Card>
          ))
        ) : (
          <Card className="p-6 text-slate-600">No invoices available yet. Once services are completed, invoices will appear here.</Card>
        )}
      </div>
    </div>
  );
}
