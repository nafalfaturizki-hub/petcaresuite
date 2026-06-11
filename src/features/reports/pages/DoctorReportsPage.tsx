import React, { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, Input, Button } from '@/components/ui';
import { useDoctorStats } from '../reports.hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { DataTable } from '@/components/common/DataTable';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function DoctorReportsPage() {
  useDocumentTitle('Doctor Reports');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const from = month && year ? `${year}-${month}-01` : undefined;
  const to = month && year ? `${year}-${month}-31` : undefined;
  const q = useDoctorStats(from, to);

  const rows = q.data || [];

  return (
    <div className="space-y-6">
      <PageHeader title="Doctor Reports" description="Performance and revenue by doctor." />

      <div className="grid gap-4 md:grid-cols-3 items-end">
        <Input placeholder="Month (MM)" value={month} onChange={(e) => setMonth(e.target.value)} />
        <Input placeholder="Year (YYYY)" value={year} onChange={(e) => setYear(e.target.value)} />
        <Button onClick={() => q.refetch()}>Run</Button>
      </div>

      <Card className="p-4">
        <DataTable columns={[{ key: 'doctorName', header: 'Doctor' }, { key: 'patients', header: 'Patients' }, { key: 'services', header: 'Services' }, { key: 'revenue', header: 'Revenue', render: (r: any) => (r.revenue || 0).toLocaleString() }]} data={rows} isLoading={q.isLoading} />
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-2">Revenue by doctor</h3>
        <div style={{ height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={rows}>
              <XAxis dataKey="doctorName" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
