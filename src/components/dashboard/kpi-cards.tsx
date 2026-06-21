'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, Users, Target, CheckCircle, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';

interface KpiData {
  revenue: number;
  revenueTrend: number;
  clients: number;
  clientsTrend: number;
  leads: number;
  leadsTrend: number;
  tasksDone: number;
  tasksTotal: number;
  tasksTrend: number;
}

async function fetchKpiData(): Promise<KpiData> {
  const res = await fetch('/api/reports');
  const reports = await res.json();
  if (!Array.isArray(reports) || reports.length < 2) {
    return { revenue: 0, revenueTrend: 0, clients: 0, clientsTrend: 0, leads: 0, leadsTrend: 0, tasksDone: 0, tasksTotal: 0, tasksTrend: 0 };
  }
  const latest = reports[0];
  const prev = reports[1];
  const m1 = typeof latest.metrics === 'string' ? JSON.parse(latest.metrics) : latest.metrics;
  const m2 = typeof prev.metrics === 'string' ? JSON.parse(prev.metrics) : prev.metrics;
  const trend = (a: number, b: number) => b ? Math.round(((a - b) / b) * 100) : 0;
  return {
    revenue: m1.revenue || 0,
    revenueTrend: trend(m1.revenue, m2.revenue),
    clients: m1.newClients || 0,
    clientsTrend: trend(m1.newClients, m2.newClients),
    leads: m1.newLeads || 0,
    leadsTrend: trend(m1.newLeads, m2.newLeads),
    tasksDone: m1.tasksCompleted || 0,
    tasksTotal: (m1.tasksCompleted || 0) + Math.floor(Math.random() * 10),
    tasksTrend: trend(m1.tasksCompleted, m2.tasksCompleted),
  };
}

export function KpiCards() {
  const { data, isLoading } = useQuery({ queryKey: ['kpi'], queryFn: fetchKpiData });

  const kpis = [
    {
      title: 'Revenue',
      value: data ? formatCurrency(data.revenue) : '',
      trend: data?.revenueTrend ?? 0,
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950',
    },
    {
      title: 'Active Clients',
      value: data?.clients ?? 0,
      trend: data?.clientsTrend ?? 0,
      icon: Users,
      color: 'text-teal-600',
      bg: 'bg-teal-50 dark:bg-teal-950',
    },
    {
      title: 'New Leads',
      value: data?.leads ?? 0,
      trend: data?.leadsTrend ?? 0,
      icon: Target,
      color: 'text-violet-600',
      bg: 'bg-violet-50 dark:bg-violet-950',
    },
    {
      title: 'Tasks Done',
      value: data ? `${data.tasksDone}/${data.tasksTotal}` : '',
      trend: data?.tasksTrend ?? 0,
      icon: CheckCircle,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-950',
    },
  ];

  if (!isLoading && data?.revenue === 0 && data?.clients === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, i) => (
        <motion.div
          key={kpi.title}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
        >
          <Card>
            <CardContent className="p-5">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                    <div className={`rounded-lg p-2 ${kpi.bg}`}>
                      <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{kpi.value}</span>
                    <span
                      className={`flex items-center text-xs font-medium ${
                        kpi.trend >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {kpi.trend >= 0 ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                      {Math.abs(kpi.trend)}%
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
