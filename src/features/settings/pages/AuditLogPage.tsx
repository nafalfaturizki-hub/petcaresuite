import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Input, Button } from '@/components/ui';
import { useAuditLogs } from '../settings.hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function AuditLogPage() {
  useDocumentTitle('Audit Log');
  const [filters, setFilters] = useState({ page: 1, pageSize: 50, user: '', action: '' });
  const { data, isLoading } = useAuditLogs(filters as any);
  const [queryPage, setQueryPage] = useState(1);

  const items = data?.items || [];

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Log" description="Track system changes and user actions." />
      <div className="flex items-center gap-3">
        <Input placeholder="User ID" value={filters.user} onChange={(e) => setFilters({ ...filters, user: e.target.value })} />
        <Input placeholder="Action" value={filters.action} onChange={(e) => setFilters({ ...filters, action: e.target.value })} />
        <Button onClick={() => setFilters({ ...filters, page: 1 })}>Filter</Button>
      </div>
      <DataTable
        columns={[
          { key: 'user_id', header: 'User' },
          { key: 'action', header: 'Action' },
          { key: 'table_name', header: 'Table' },
          { key: 'created_at', header: 'Time', render: (r: any) => new Date(r.created_at).toLocaleString() },
          { key: 'old_value', header: 'Old', render: (r: any) => (r.old_value ? JSON.stringify(r.old_value).slice(0, 100) : '-') },
          { key: 'new_value', header: 'New', render: (r: any) => (r.new_value ? JSON.stringify(r.new_value).slice(0, 100) : '-') }
        ]}
        data={items as any}
        isLoading={isLoading}
        pagination={data ? { page: filters.page!, pageSize: filters.pageSize!, total: data.total } : undefined}
        onPageChange={(p) => setFilters({ ...filters, page: p })}
      />
    </div>
  );
}
