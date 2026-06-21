'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, FileText, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const actions = [
  { label: 'New Task', href: '/tasks', icon: Plus, color: 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-400' },
  { label: 'Add Client', href: '/clients', icon: Users, color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' },
  { label: 'Create Content', href: '/content', icon: FileText, color: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400' },
  { label: 'Schedule Event', href: '/events', icon: Calendar, color: 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-400' },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {actions.map((action, i) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
            >
              <Link href={action.href}>
                <Button variant="outline" className="w-full h-auto flex-col gap-1 py-3 hover:border-teal-300">
                  <div className={`rounded-lg p-1.5 ${action.color}`}>
                    <action.icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs">{action.label}</span>
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
