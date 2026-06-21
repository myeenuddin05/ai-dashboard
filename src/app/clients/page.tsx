'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { statusConfig } from '@/lib/constants';
import { formatCurrency, formatDate, formatDateTime, getInitials } from '@/lib/utils';
import { Plus, Search, ChevronDown, ChevronRight, Pencil, Trash2, Download, Users, Mail, Phone, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  status: string;
  value: number;
  notes: string | null;
  createdAt: string;
  histories?: ClientHistory[];
  events?: Event[];
}

interface ClientHistory {
  id: string;
  action: string;
  description: string;
  createdAt: string;
}

interface Event {
  id: string;
  title: string;
  type: string;
  startDate: string;
}

export default function ClientsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const queryClient = useQueryClient();

  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients', search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/clients?${params}`);
      return res.json() as Promise<Client[]>;
    },
  });

  const { data: expandedClient, isLoading: isExpandedLoading } = useQuery({
    queryKey: ['client', expandedId],
    queryFn: async () => {
      const res = await fetch(`/api/clients/${expandedId}`);
      return res.json() as Promise<Client>;
    },
    enabled: !!expandedId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Client>) => {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setIsCreateOpen(false);
      toast.success('Client created');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Client>) => {
      const res = await fetch(`/api/clients/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', expandedId] });
      setEditingClient(null);
      toast.success('Client updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/clients/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client deleted');
    },
  });

  const exportCsv = () => {
    if (!clients) return;
    const data = clients.map((c) => ({
      Name: c.name,
      Email: c.email,
      Company: c.company || '',
      Phone: c.phone || '',
      Status: c.status,
      Value: c.value,
    }));
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map((row) => Object.values(row).map((v) => `"${v}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'clients.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Clients exported to CSV');
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data: Record<string, unknown> = {};
    formData.forEach((v, k) => { data[k] = v; });
    if (editingClient) {
      updateMutation.mutate({ ...data, id: editingClient.id, value: parseFloat(data.value as string) || 0 });
    } else {
      createMutation.mutate({ ...data, value: parseFloat(data.value as string) || 0 });
    }
  };

  const ClientForm = ({ defaultValues }: { defaultValues?: Partial<Client> }) => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required defaultValue={defaultValues?.name} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required defaultValue={defaultValues?.email} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="company">Company</Label>
          <Input id="company" name="company" defaultValue={defaultValues?.company || ''} />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={defaultValues?.phone || ''} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={defaultValues?.status || 'active'}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="value">Value ($)</Label>
          <Input id="value" name="value" type="number" defaultValue={defaultValues?.value || 0} />
        </div>
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" rows={3} defaultValue={defaultValues?.notes || ''} />
      </div>
      <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">
        {defaultValues ? 'Update' : 'Create'} Client
      </Button>
    </form>
  );

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your client relationships</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCsv} className="gap-2">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger >
                <Button className="gap-2 bg-teal-600 hover:bg-teal-700">
                  <Plus className="h-4 w-4" /> Add Client
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Client</DialogTitle></DialogHeader>
                <ClientForm />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || "")}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Client List */}
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {(clients || []).map((client, i) => (
              <div key={client.id}>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card
                    className={cn(
                      'cursor-pointer hover:shadow-md transition-all',
                      expandedId === client.id && 'ring-2 ring-teal-200 dark:ring-teal-800'
                    )}
                    onClick={() => setExpandedId(expandedId === client.id ? null : client.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 font-semibold text-sm">
                          {getInitials(client.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{client.name}</span>
                            <Badge className={statusConfig[client.status]?.className || ''} variant="secondary">
                              {statusConfig[client.status]?.label || client.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            {client.company && (
                              <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{client.company}</span>
                            )}
                            <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{client.email}</span>
                            {client.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{client.phone}</span>}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-semibold text-sm">{formatCurrency(client.value)}</p>
                          <p className="text-xs text-muted-foreground">Client since {formatDate(client.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setEditingClient(client); }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          {expandedId === client.id ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Expanded Detail */}
                <AnimatePresence>
                  {expandedId === client.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mx-4 border-x border-b rounded-b-xl bg-muted/30 p-4">
                        {isExpandedLoading ? (
                          <Skeleton className="h-32" />
                        ) : expandedClient ? (
                          <div className="grid gap-6 md:grid-cols-2">
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Notes</h4>
                              <p className="text-sm text-muted-foreground">{expandedClient.notes || 'No notes'}</p>

                              {expandedClient.events && expandedClient.events.length > 0 && (
                                <div className="mt-4">
                                  <h4 className="font-semibold text-sm mb-2">Upcoming Events</h4>
                                  <div className="space-y-1">
                                    {expandedClient.events.map((ev) => (
                                      <div key={ev.id} className="text-sm text-muted-foreground">
                                        {ev.title} — {formatDate(ev.startDate)}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm mb-2">Interaction History</h4>
                              <div className="space-y-2">
                                {(expandedClient.histories || []).map((h) => (
                                  <div key={h.id} className="flex gap-2 text-sm">
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-950 text-teal-600 text-xs">
                                      {statusConfig[h.action]?.label?.[0] || '•'}
                                    </div>
                                    <div>
                                      <p className="text-xs">{h.description}</p>
                                      <p className="text-[10px] text-muted-foreground">{formatDateTime(h.createdAt)}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            {(!clients || clients.length === 0) && (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Users className="h-12 w-12 mb-3" />
                <p className="text-sm">No clients found</p>
              </div>
            )}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingClient} onOpenChange={(o) => !o && setEditingClient(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Client</DialogTitle></DialogHeader>
            {editingClient && <ClientForm defaultValues={editingClient} />}
          </DialogContent>
        </Dialog>
      </motion.div>
    </AppLayout>
  );
}
