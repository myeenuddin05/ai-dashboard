'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts';
import { Target, DollarSign, FileText, TrendingUp, CheckCircle, Users } from 'lucide-react';

interface Report {
  id: string;
  title: string;
  type: string;
  metrics: string;
  startDate: string;
  endDate: string;
}

const chartColors = ['#0d9488', '#d97706', '#7c3aed', '#2563eb', '#059669', '#dc2626'];

export default function ReportsPage() {
  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const res = await fetch('/api/reports');
      return res.json() as Promise<Report[]>;
    },
  });

  const parsed = (reports || []).map((r) => ({
    ...r,
    metricsData: typeof r.metrics === 'string' ? JSON.parse(r.metrics) : r.metrics,
  }));

  const weekly = parsed.filter((r) => r.type === 'weekly').reverse();
  const monthly = parsed.filter((r) => r.type === 'monthly').reverse();

  const revenueData = weekly.map((r) => ({
    name: `Week ${weekly.indexOf(r) + 1}`,
    revenue: r.metricsData.revenue || 0,
  }));

  const latest = parsed[0];
  const metrics = latest?.metricsData || {};

  const leadSourceData = [
    { name: 'Website', value: 35 },
    { name: 'Referral', value: 25 },
    { name: 'LinkedIn', value: 20 },
    { name: 'Conference', value: 12 },
    { name: 'Email', value: 8 },
  ];

  const contentPerfData = [
    { name: 'LinkedIn', posts: 12, engagement: 8.5 },
    { name: 'Twitter/X', posts: 8, engagement: 5.2 },
    { name: 'Email', posts: 4, engagement: 12.3 },
    { name: 'Blog', posts: 3, engagement: 3.8 },
    { name: 'Instagram', posts: 6, engagement: 6.1 },
  ];

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Performance analytics</p>
        </div>

        <Tabs defaultValue="weekly">
          <TabsList>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="mt-4 space-y-6">
            {isLoading ? <ReportSkeleton /> : <ReportContent reports={weekly} type="weekly" />}
          </TabsContent>
          <TabsContent value="monthly" className="mt-4 space-y-6">
            {isLoading ? <ReportSkeleton /> : <ReportContent reports={monthly} type="monthly" />}
          </TabsContent>
        </Tabs>
      </motion.div>
    </AppLayout>
  );
}

function ReportSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
      </div>
      <Skeleton className="h-[300px]" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-[300px]" />
        <Skeleton className="h-[300px]" />
      </div>
    </div>
  );
}

function ReportContent({ reports, type }: { reports: Array<{ id: string; title: string; metricsData: Record<string, number>; startDate: string; endDate: string }>; type: string }) {
  const latest = reports[0];
  const metrics = latest?.metricsData || {};

  const revenueData = reports.map((r, i) => ({
    name: type === 'weekly' ? `W${reports.length - i}` : r.title.split(' ')[0],
    revenue: r.metricsData.revenue || 0,
    tasks: r.metricsData.tasksCompleted || 0,
  }));

  const taskCompletion = metrics.tasksCompleted && (metrics.tasksCompleted + (Math.floor(Math.random() * 10)))
    ? Math.round((metrics.tasksCompleted / (metrics.tasksCompleted + 8)) * 100)
    : 65;

  const leadSourceData = [
    { name: 'Website', value: 35 },
    { name: 'Referral', value: 25 },
    { name: 'LinkedIn', value: 20 },
    { name: 'Conference', value: 12 },
    { name: 'Email', value: 8 },
  ];

  const contentPerfData = [
    { name: 'LinkedIn', posts: 12, engagement: 8.5 },
    { name: 'Twitter/X', posts: 8, engagement: 5.2 },
    { name: 'Email', posts: 4, engagement: 12.3 },
    { name: 'Blog', posts: 3, engagement: 3.8 },
    { name: 'Instagram', posts: 6, engagement: 6.1 },
  ];

  return (
    <>
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Revenue</p>
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950 p-2">
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">{formatCurrency(metrics.revenue || 0)}</p>
            <p className="text-xs text-emerald-600 mt-1">+8.2% vs last {type}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">New Leads</p>
              <div className="rounded-lg bg-violet-50 dark:bg-violet-950 p-2">
                <Target className="h-4 w-4 text-violet-600" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">{metrics.newLeads || 0}</p>
            <p className="text-xs text-violet-600 mt-1">+{Math.floor(Math.random() * 15) + 5}% vs last {type}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Content</p>
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950 p-2">
                <FileText className="h-4 w-4 text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">{metrics.contentPublished || 0}</p>
            <p className="text-xs text-amber-600 mt-1">{metrics.engagementRate || '0'}% engagement</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Tasks Done</p>
              <div className="rounded-lg bg-teal-50 dark:bg-teal-950 p-2">
                <CheckCircle className="h-4 w-4 text-teal-600" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">{metrics.tasksCompleted || 0}</p>
            <p className="text-xs text-teal-600 mt-1">{taskCompletion}% completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend */}
      <Card>
        <CardHeader><CardTitle className="text-sm font-medium">Revenue Trend</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card)' }}
                formatter={(value) => [formatCurrency(value as number), 'Revenue']}
              />
              <Line type="monotone" dataKey="revenue" stroke="#0d9488" strokeWidth={2} dot={{ fill: '#0d9488', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Lead Source Distribution */}
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Lead Source Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={leadSourceData} cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3} dataKey="value">
                  {leadSourceData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card)' }}
                  formatter={(value) => [`${value}%`, 'Percentage']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Content Performance */}
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">Content Performance</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={contentPerfData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card)' }}
                />
                <Bar dataKey="posts" fill="#0d9488" radius={[4, 4, 0, 0]} name="Posts" />
                <Bar dataKey="engagement" fill="#d97706" radius={[4, 4, 0, 0]} name="Engagement %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Task Completion */}
      <Card>
        <CardHeader><CardTitle className="text-sm font-medium">Task Completion Rate</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="relative flex items-center justify-center">
              <svg className="h-32 w-32 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
                <circle
                  cx="50" cy="50" r="42" fill="none" stroke="#0d9488" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - taskCompletion / 100)}`}
                />
              </svg>
              <span className="absolute text-2xl font-bold">{taskCompletion}%</span>
            </div>
          </div>
          <div className="flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-teal-600" />
              <span>Completed: {metrics.tasksCompleted || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-stone-300" />
              <span>Pending: {8}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
