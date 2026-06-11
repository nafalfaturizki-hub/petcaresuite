import React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui';
import { useInventoryStats } from '../reports.hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function InventoryReportsPage() {
  useDocumentTitle('Inventory Reports');
  const q = useInventoryStats();

  return (
    <div className="space-y-6">
      <PageHeader title="Inventory Reports" description="Stock levels, expirations, and value." />
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-4"><p className="text-sm text-slate-500">Low stock</p><p className="text-2xl font-semibold">{q.data?.lowStockCount ?? '-'}</p></Card>
        <Card className="p-4"><p className="text-sm text-slate-500">Expiring &lt;30d</p><p className="text-2xl font-semibold">{q.data?.expiring30 ?? '-'}</p></Card>
        <Card className="p-4"><p className="text-sm text-slate-500">Total value</p><p className="text-2xl font-semibold">{q.data?.totalValue ? q.data.totalValue.toLocaleString() : '-'}</p></Card>
      </div>
    </div>
  );
}
