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
import { statusConfig, eventTypes } from '@/lib/constants';
import { formatDate, formatDateTime } from '@/lib/utils';
import { Plus, Calendar, MapPin, Users, Video, Building2, ClipboardCopy, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Event {
  id: string;
  title: string;
  description: string | null;
  type: string;
  location: string;
  status: string;
  startDate: string;
  endDate: string | null;
  client?: { name: string; company: string | null } | null;
}

const eventIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  meeting: Users,
  webinar: Video,
  conference: Building2,
  campaign: Calendar,
};

const eventColors: Record<string, string> = {
  meeting: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  webinar: 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-400',
  conference: 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-400',
  campaign: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
};

export default function EventsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [detailEvent, setDetailEvent] = useState<Event | null>(null);
  const queryClient = useQueryClient();

  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await fetch('/api/events');
      return res.json() as Promise<Event[]>;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Event>) => {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setIsCreateOpen(false);
      toast.success('Event created');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Event>) => {
      const res = await fetch(`/api/events/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setEditingEvent(null);
      toast.success('Event updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/events/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });

  const copyEventDetails = (event: Event) => {
    const text = `📅 ${event.title}\n📍 ${event.location}\n🕐 ${formatDateTime(event.startDate)}${event.endDate ? ` - ${formatDateTime(event.endDate)}` : ''}\n${event.description || ''}`;
    navigator.clipboard.writeText(text);
    toast.success('Event details copied!');
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data: Record<string, unknown> = {};
    formData.forEach((v, k) => { data[k] = v; });

    if (editingEvent) {
      updateMutation.mutate({ ...data, id: editingEvent.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const EventForm = ({ defaultValues }: { defaultValues?: Partial<Event> }) => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div><Label htmlFor="title">Title</Label><Input id="title" name="title" required defaultValue={defaultValues?.title} /></div>
      <div><Label htmlFor="description">Description</Label><Textarea id="description" name="description" rows={3} defaultValue={defaultValues?.description || ''} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="type">Type</Label>
          <Select name="type" defaultValue={defaultValues?.type || 'meeting'}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{eventTypes.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}</SelectContent>
          </Select>
        </div>
        <div><Label htmlFor="location">Location</Label><Input id="location" name="location" defaultValue={defaultValues?.location || 'Virtual'} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label htmlFor="startDate">Start</Label><Input id="startDate" name="startDate" type="datetime-local" required defaultValue={defaultValues?.startDate ? new Date(defaultValues.startDate).toISOString().slice(0, 16) : ''} /></div>
        <div><Label htmlFor="endDate">End</Label><Input id="endDate" name="endDate" type="datetime-local" defaultValue={defaultValues?.endDate ? new Date(defaultValues.endDate).toISOString().slice(0, 16) : ''} /></div>
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <Select name="status" defaultValue={defaultValues?.status || 'scheduled'}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">{defaultValues ? 'Update' : 'Create'} Event</Button>
    </form>
  );

  const sortedEvents = [...(events || [])].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Events</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your schedule</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger >
              <Button className="gap-2 bg-teal-600 hover:bg-teal-700"><Plus className="h-4 w-4" /> Add Event</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Event</DialogTitle></DialogHeader>
              <EventForm />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
        ) : (
          <div className="space-y-3">
            {sortedEvents.map((event, i) => {
              const Icon = eventIcons[event.type] || Calendar;
              const isPast = new Date(event.startDate) < new Date();
              return (
                <motion.div key={event.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card className={cn('hover:shadow-md transition-all', isPast && 'opacity-60')}
                    onClick={() => setDetailEvent(event)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={cn('rounded-xl p-3 shrink-0', eventColors[event.type] || 'bg-stone-100')}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{event.title}</span>
                            <Badge className={statusConfig[event.status]?.className || ''} variant="secondary">
                              {statusConfig[event.status]?.label || event.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(event.startDate)}</span>
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.location}</span>
                            {event.client && <span className="flex items-center gap-1"><Users className="h-3 w-3" />{event.client.name}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => copyEventDetails(event)}>
                            <ClipboardCopy className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingEvent(event)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500" onClick={() => deleteMutation.mutate(event.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
            {sortedEvents.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Calendar className="h-12 w-12 mb-3" /><p className="text-sm">No events yet</p>
              </div>
            )}
          </div>
        )}

        {/* Detail Dialog */}
        <Dialog open={!!detailEvent} onOpenChange={(o) => !o && setDetailEvent(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>{detailEvent?.title}</DialogTitle></DialogHeader>
            {detailEvent && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Type</div><div>{detailEvent.type}</div>
                  <div className="text-muted-foreground">Location</div><div>{detailEvent.location}</div>
                  <div className="text-muted-foreground">Start</div><div>{formatDateTime(detailEvent.startDate)}</div>
                  {detailEvent.endDate && <><div className="text-muted-foreground">End</div><div>{formatDateTime(detailEvent.endDate)}</div></>}
                  <div className="text-muted-foreground">Status</div><div><Badge className={statusConfig[detailEvent.status]?.className}>{statusConfig[detailEvent.status]?.label}</Badge></div>
                  {detailEvent.client && <><div className="text-muted-foreground">Client</div><div>{detailEvent.client.name}</div></>}
                </div>
                {detailEvent.description && (
                  <div><p className="text-sm font-medium mb-1">Description</p><p className="text-sm text-muted-foreground">{detailEvent.description}</p></div>
                )}
                <Button variant="outline" className="w-full gap-2" onClick={() => copyEventDetails(detailEvent)}>
                  <ClipboardCopy className="h-4 w-4" /> Copy Event Details
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={!!editingEvent} onOpenChange={(o) => !o && setEditingEvent(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Event</DialogTitle></DialogHeader>
            {editingEvent && <EventForm defaultValues={editingEvent} />}
          </DialogContent>
        </Dialog>
      </motion.div>
    </AppLayout>
  );
}
