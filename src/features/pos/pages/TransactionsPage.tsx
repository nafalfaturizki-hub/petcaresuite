import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, RefreshCcw } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Button, Card, Input } from '@/components/ui';
import { useInvoices } from '../pos.hooks';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function TransactionsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'paid' | 'pending' | 'refunded' | 'cancelled'>('all');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const params = {
    page,
    pageSize: 12,
    search: search || undefined,
    status: status === 'all' ? undefined : status
  };

  const { data, isLoading, refetch } = useInvoices(params);
  const invoices = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 12));

  return (
    <div className="space-y-6">
      <PageHeader
        title="POS Transactions"
        description="Review sales transactions and open invoice details."
        actions={
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <Search className="w-4 h-4 text-slate-500" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search invoice or notes"
              className="border-0 px-0 ring-0 focus:ring-0"
            />
          </div>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as any);
              setPage(1);
            }}
            className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm shadow-sm"
          >
            <option value="all">All statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => navigate('/staff/pos')}>
            Back to POS
          </Button>
        </div>
      </div>

      <Card className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <DataTable
          columns={[
            {
              key: 'invoice_number',
              header: 'Invoice',
              render: (record: any) => record.invoice_number || record.id
            },
            {
              key: 'created_at',
              header: 'Date',
              render: (record: any) => formatDate(record.created_at ?? '', { year: 'numeric', month: 'short', day: 'numeric' })
            },
            {
              key: 'payment_method',
              header: 'Payment',
              render: (record: any) => record.payment_method || 'N/A'
            },
            {
              key: 'status',
              header: 'Status',
              render: (record: any) => record.status || 'unknown'
            },
            {
              key: 'total',
              header: 'Total',
              align: 'right',
              render: (record: any) => formatCurrency(record.total || 0)
            }
          ]}
          data={invoices}
          isLoading={isLoading}
          onRowClick={(record) => navigate(`/staff/pos/transactions/${record.id}`)}
          emptyTitle="No transactions found"
          emptyDescription="Process a sale in the POS to generate invoices."
        />
      </Card>

      <div className="flex items-center justify-between text-sm text-slate-600">
        <div>Showing {invoices.length} of {total}</div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
            Previous
          </Button>
          <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
