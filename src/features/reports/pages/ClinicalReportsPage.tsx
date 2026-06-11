import React, { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, Input, Button } from '@/components/ui';
import { useClinicalStats } from '../reports.hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';

export default function ClinicalReportsPage() {
  useDocumentTitle('Clinical Reports');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const statsQ = useClinicalStats(from || undefined, to || undefined);

  const top = statsQ.data?.topDiagnoses || [];
  const typeBreak = Object.entries(statsQ.data?.typeBreakdown || {}).map(([k, v]) => ({ name: k, value: v }));

  return (
    <div className="space-y-6">
      <PageHeader title="Clinical Reports" description="Patient and clinical activity metrics." />

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-4"><p className="text-sm text-slate-500">Total patients</p><p className="text-2xl font-semibold">{statsQ.data?.totalPatients ?? '-'}</p></Card>
        <Card className="p-4"><p className="text-sm text-slate-500">New patients</p><p className="text-2xl font-semibold">{statsQ.data?.newPatients ?? '-'}</p></Card>
        <Card className="p-4"><p className="text-sm text-slate-500">Appointments</p><p className="text-2xl font-semibold">-</p></Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Top diagnoses</h3>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold mb-2">Record type breakdown</h3>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={typeBreak} dataKey="value" nameKey="name" outerRadius={100} label>
                  {typeBreak.map((entry, idx) => <Cell key={idx} fill={['#60a5fa','#34d399','#f59e0b','#f97316'][idx % 4]} />)}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <Button onClick={() => statsQ.refetch()}>Run</Button>
      </div>
    </div>
  );
}
