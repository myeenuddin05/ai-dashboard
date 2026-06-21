'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDate, formatDistanceToNow } from 'date-fns';
import { Plus, Bell, BellOff, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Reminder {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  isRead: boolean;
  priority: string;
}

const priorityColor: Record<string, string> = {
  high: 'border-l-red-500',
  medium: 'border-l-amber-500',
  low: 'border-l-lime-500',
  urgent: 'border-l-red-600',
};

export default function RemindersPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: reminders, isLoading } = useQuery({
    queryKey: ['reminders'],
    queryFn: async () => {
      const res = await fetch('/api/reminders');
      return res.json() as Promise<Reminder[]>;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Reminder>) => {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      setIsCreateOpen(false);
      toast.success('Reminder created');
    },
  });

  const toggleReadMutation = useMutation({
    mutationFn: async ({ id, isRead }: { id: string; isRead: boolean }) => {
      await fetch(`/api/reminders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reminders'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/reminders/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Reminder deleted');
    },
  });

  const sorted = [...(reminders || [])].sort((a, b) => {
    if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const isOverdue = (date: string) => new Date(date) < new Date();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data: Record<string, unknown> = {};
    formData.forEach((v, k) => { data[k] = v; });
    createMutation.mutate(data);
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reminders</h1>
            <p className="text-sm text-muted-foreground mt-1">Stay on top of your tasks</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger >
              <Button className="gap-2 bg-teal-600 hover:bg-teal-700">
                <Plus className="h-4 w-4" /> New Reminder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Reminder</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" required />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" rows={2} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input id="dueDate" name="dueDate" type="datetime-local" required />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select name="priority" defaultValue="medium">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">Create Reminder</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.map((reminder, i) => {
              const overdue = isOverdue(reminder.dueDate) && !reminder.isRead;
              return (
                <motion.div
                  key={reminder.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card
                    className={cn(
                      'border-l-4 transition-all',
                      priorityColor[reminder.priority] || 'border-l-stone-300',
                      reminder.isRead && 'opacity-60',
                      overdue && 'bg-red-50/50 dark:bg-red-950/20'
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={reminder.isRead}
                          onCheckedChange={(checked) =>
                            toggleReadMutation.mutate({ id: reminder.id, isRead: checked as boolean })
                          }
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={cn('text-sm font-medium', reminder.isRead && 'line-through')}>
                              {reminder.title}
                            </span>
                            {overdue && (
                              <Badge className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400 text-xs">
                                Overdue
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs capitalize">{reminder.priority}</Badge>
                          </div>
                          {reminder.description && (
                            <p className="text-xs text-muted-foreground mt-1">{reminder.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {overdue
                              ? `Due ${formatDistanceToNow(new Date(reminder.dueDate), { addSuffix: true })}`
                              : `Due ${formatDate(new Date(reminder.dueDate), 'MMM d, yyyy h:mm a')}`
                            }
                          </p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-red-500"
                          onClick={() => deleteMutation.mutate(reminder.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
            {sorted.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Bell className="h-12 w-12 mb-3" />
                <p className="text-sm">No reminders yet</p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}
