'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface TaskStats {
  status: string;
  count: number;
}

async function fetchTaskStats(): Promise<TaskStats[]> {
  const res = await fetch('/api/tasks');
  const tasks = await res.json();
  if (!Array.isArray(tasks)) return [];
  const counts: Record<string, number> = { todo: 0, in_progress: 0, review: 0, done: 0 };
  tasks.forEach((t: { status: string }) => {
    if (counts[t.status] !== undefined) counts[t.status]++;
  });
  return Object.entries(counts).map(([status, count]) => ({ status, count }));
}

const statusColors: Record<string, string> = {
  todo: '#78716c',
  in_progress: '#d97706',
  review: '#7c3aed',
  done: '#059669',
};

const statusLabels: Record<string, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  review: 'Review',
  done: 'Done',
};

export function TaskProgressChart() {
  const { data, isLoading } = useQuery({ queryKey: ['task-stats'], queryFn: fetchTaskStats });

  const chartData = (data || []).map((d) => ({
    name: statusLabels[d.status] || d.status,
    value: d.count,
    color: statusColors[d.status] || '#78716c',
  }));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Task Progress</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[200px] w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={80}
                tick={{ fontSize: 12, fill: '#78716c' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--card)',
                }}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
