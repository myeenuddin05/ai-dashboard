'use client';

import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { AppLayout } from '@/components/layout/app-layout';
import { KpiCards } from '@/components/dashboard/kpi-cards';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { TaskProgressChart } from '@/components/dashboard/task-progress-chart';
import { LeadPipelineFunnel } from '@/components/dashboard/lead-pipeline-funnel';

export default function DashboardPage() {
  const { widgets } = useStore();
  const visibleWidgets = widgets.filter((w) => w.visible).sort((a, b) => a.order - b.order);

  const widgetComponents: Record<string, React.ReactNode> = {
    'kpi-cards': <KpiCards key="kpi" />,
    'quick-actions': <QuickActions key="actions" />,
    'activity-feed': <ActivityFeed key="activity" />,
    'task-progress': <TaskProgressChart key="tasks" />,
    'lead-pipeline': <LeadPipelineFunnel key="pipeline" />,
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back! Here&apos;s your overview.
          </p>
        </div>

        <div className="space-y-6">
          {visibleWidgets.map((widget) => (
            <div key={widget.id}>
              {widgetComponents[widget.id] || null}
            </div>
          ))}
          {visibleWidgets.length === 0 && (
            <div className="flex items-center justify-center py-20">
              <p className="text-muted-foreground">No widgets enabled. Go to Settings to enable some.</p>
            </div>
          )}
        </div>
      </motion.div>
    </AppLayout>
  );
}
