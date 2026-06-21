'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

interface LeadStage {
  status: string;
  count: number;
  value: number;
}

const statusColors: Record<string, string> = {
  new: '#d97706',
  contacted: '#2563eb',
  qualified: '#7c3aed',
  converted: '#059669',
  lost: '#dc2626',
};

const statusLabels: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  converted: 'Converted',
  lost: 'Lost',
};

async function fetchLeadPipeline(): Promise<LeadStage[]> {
  const res = await fetch('/api/leads');
  const leads = await res.json();
  if (!Array.isArray(leads)) return [];
  const stages: Record<string, { count: number; value: number }> = {};
  leads.forEach((l: { status: string; value: number }) => {
    if (!stages[l.status]) stages[l.status] = { count: 0, value: 0 };
    stages[l.status].count++;
    stages[l.status].value += l.value || 0;
  });
  return Object.entries(stages).map(([status, data]) => ({
    status,
    count: data.count,
    value: data.value,
  }));
}

export function LeadPipelineFunnel() {
  const { data, isLoading } = useQuery({ queryKey: ['lead-pipeline'], queryFn: fetchLeadPipeline });

  const chartData = (data || []).map((d) => ({
    name: statusLabels[d.status] || d.status,
    count: d.count,
    value: d.value,
    color: statusColors[d.status] || '#78716c',
  }));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Lead Pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[200px] w-full" />
        ) : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--card)',
                  }}
                  formatter={(value) => [value, 'Leads']}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 flex flex-wrap gap-2">
              {chartData.map((s) => (
                <div key={s.name} className="flex items-center gap-1.5 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-muted-foreground">{s.name}:</span>
                  <span className="font-medium">{s.count}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
