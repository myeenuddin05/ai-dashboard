'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { timeAgo } from '@/lib/utils';
import { CheckCircle2, PlusCircle, Pencil, Trash2, Bell, Calendar, FileText, Target, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface Activity {
  id: string;
  type: string;
  entity: string;
  description: string;
  createdAt: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  created: PlusCircle,
  updated: Pencil,
  completed: CheckCircle2,
  deleted: Trash2,
};

const entityIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  task: CheckCircle2,
  client: Users,
  lead: Target,
  content: FileText,
  event: Calendar,
  reminder: Bell,
};

const entityColorMap: Record<string, string> = {
  task: 'text-amber-600 bg-amber-50 dark:bg-amber-950',
  client: 'text-teal-600 bg-teal-50 dark:bg-teal-950',
  lead: 'text-violet-600 bg-violet-50 dark:bg-violet-950',
  content: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950',
  event: 'text-blue-600 bg-blue-50 dark:bg-blue-950',
  reminder: 'text-red-600 bg-red-50 dark:bg-red-950',
};

async function fetchActivities(): Promise<Activity[]> {
  const res = await fetch('/api/activities');
  return res.json();
}

export function ActivityFeed() {
  const { data, isLoading } = useQuery({ queryKey: ['activities'], queryFn: fetchActivities });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-2 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {(data || []).slice(0, 10).map((activity, i) => {
              const ActionIcon = iconMap[activity.type] || PlusCircle;
              const EntityIcon = entityIconMap[activity.entity] || FileText;
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-start gap-3 rounded-lg p-2 hover:bg-muted/50 transition-colors"
                >
                  <div className={`rounded-full p-1.5 shrink-0 ${entityColorMap[activity.entity] || 'bg-stone-100'}`}>
                    <EntityIcon className="h-3 w-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo(activity.createdAt)}</p>
                  </div>
                </motion.div>
              );
            })}
            {(!data || data.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-6">No recent activity</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
