import React, { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, Input, Button } from '@/components/ui';
import { useProductStats } from '../reports.hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { DataTable } from '@/components/common/DataTable';

export default function ProductReportsPage() {
  useDocumentTitle('Product Reports');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const q = useProductStats(from || undefined, to || undefined);

  return (
    <div className="space-y-6">
      <PageHeader title="Product Reports" description="Best selling products and revenue." />
      <div className="grid gap-4 md:grid-cols-3 items-end">
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <Button onClick={() => q.refetch()}>Run</Button>
      </div>

      <Card className="p-4">
        <DataTable columns={[{ key: 'name', header: 'Product' }, { key: 'qty', header: 'Quantity' }, { key: 'revenue', header: 'Revenue', render: (r: any) => (r.revenue || 0).toLocaleString() }]} data={q.data || []} isLoading={q.isLoading} />
      </Card>
    </div>
  );
}
