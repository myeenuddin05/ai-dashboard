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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { statusConfig, taskCategories, priorities } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import { Plus, GripVertical, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  category: string;
  priority: string;
  dueDate: string | null;
}

const columns = [
  { id: 'todo', title: 'To Do', color: 'border-t-stone-400' },
  { id: 'in_progress', title: 'In Progress', color: 'border-t-amber-400' },
  { id: 'review', title: 'Review', color: 'border-t-violet-400' },
  { id: 'done', title: 'Done', color: 'border-t-emerald-400' },
];

const priorityColor: Record<string, string> = {
  urgent: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-400',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400',
  low: 'bg-lime-100 text-lime-800 dark:bg-lime-950 dark:text-lime-400',
};

export default function TasksPage() {
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', categoryFilter, priorityFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categoryFilter) params.set('category', categoryFilter);
      if (priorityFilter) params.set('priority', priorityFilter);
      const res = await fetch(`/api/tasks?${params}`);
      return res.json() as Promise<Task[]>;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Task>) => {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsCreateOpen(false);
      toast.success('Task created');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Task>) => {
      const res = await fetch(`/api/tasks/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setEditingTask(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted');
    },
  });

  const moveTask = (taskId: string, newStatus: string) => {
    updateMutation.mutate({ id: taskId, status: newStatus });
    toast.success(`Task moved to ${statusConfig[newStatus]?.label}`);
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDrop = (columnId: string) => {
    setDragOverColumn(null);
    const taskId = (window as unknown as { _dragTaskId?: string })._dragTaskId;
    if (taskId) {
      moveTask(taskId, columnId);
      (window as unknown as { _dragTaskId?: string })._dragTaskId = undefined;
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data: Record<string, unknown> = {};
    formData.forEach((v, k) => { data[k] = v; });

    if (editingTask) {
      updateMutation.mutate({ ...data, id: editingTask.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const TaskForm = ({ defaultValues }: { defaultValues?: Partial<Task> }) => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required defaultValue={defaultValues?.title} />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={3} defaultValue={defaultValues?.description || ''} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select name="category" defaultValue={defaultValues?.category || 'general'}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {taskCategories.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select name="priority" defaultValue={defaultValues?.priority || 'medium'}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {priorities.map((p) => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={defaultValues?.status || 'todo'}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {columns.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="dueDate">Due Date</Label>
        <Input id="dueDate" name="dueDate" type="datetime-local" defaultValue={defaultValues?.dueDate ? new Date(defaultValues.dueDate).toISOString().slice(0, 16) : ''} />
      </div>
      <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
        {defaultValues ? 'Update' : 'Create'} Task
      </Button>
    </form>
  );

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <Skeleton className="h-8 w-40" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[400px]" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
            <p className="text-sm text-muted-foreground mt-1">Kanban board</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger >
              <Button className="gap-2 bg-teal-600 hover:bg-teal-700">
                <Plus className="h-4 w-4" /> New Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Task</DialogTitle></DialogHeader>
              <TaskForm />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v || "")}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Categories" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {taskCategories.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v || "")}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Priorities" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              {priorities.map((p) => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((column) => {
            const columnTasks = (tasks || []).filter((t) => t.status === column.id);
            return (
              <div
                key={column.id}
                className={cn(
                  'rounded-xl border bg-card/50 p-3 min-h-[400px] transition-colors',
                  'border-t-2',
                  column.color,
                  dragOverColumn === column.id && 'bg-accent/50 border-teal-400'
                )}
                onDragOver={(e) => { e.preventDefault(); setDragOverColumn(column.id); }}
                onDragLeave={() => setDragOverColumn(null)}
                onDrop={() => handleDrop(column.id)}
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="font-semibold text-sm">{column.title}</h3>
                  <Badge variant="secondary" className="text-xs">{columnTasks.length}</Badge>
                </div>
                <div className="space-y-2">
                  {columnTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                    >
                      <div
                        draggable
                        onDragStart={(e: React.DragEvent) => {
                          (window as unknown as { _dragTaskId?: string })._dragTaskId = task.id;
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                      >
                      <Card className="group cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
                        <CardContent className="p-3">
                          <div className="flex items-start gap-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{task.title}</p>
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                <Badge className={priorityColor[task.priority] || ''} variant="secondary">
                                  {task.priority}
                                </Badge>
                                <Badge variant="outline" className="text-xs">{task.category}</Badge>
                              </div>
                              {task.dueDate && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  Due: {formatDate(task.dueDate)}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingTask(task)}>
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => deleteMutation.mutate(task.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingTask} onOpenChange={(o) => !o && setEditingTask(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Task</DialogTitle></DialogHeader>
            {editingTask && <TaskForm defaultValues={editingTask} />}
          </DialogContent>
        </Dialog>
      </motion.div>
    </AppLayout>
  );
}
