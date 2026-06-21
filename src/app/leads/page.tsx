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
import { Progress } from '@/components/ui/progress';
import { statusConfig, leadSources } from '@/lib/constants';
import { formatCurrency, formatDate, getInitials } from '@/lib/utils';
import { Plus, Download, Globe, Users, Link, Calendar, Mail, Pencil, Trash2, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  source: string;
  status: string;
  score: number;
  value: number;
  notes: string | null;
  createdAt: string;
}

const pipelineColumns = [
  { id: 'new', title: 'New', color: 'border-t-amber-400' },
  { id: 'contacted', title: 'Contacted', color: 'border-t-blue-400' },
  { id: 'qualified', title: 'Qualified', color: 'border-t-violet-400' },
  { id: 'converted', title: 'Converted', color: 'border-t-emerald-400' },
  { id: 'lost', title: 'Lost', color: 'border-t-red-400' },
];

const sourceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  website: Globe,
  referral: Users,
  linkedin: Link,
  conference: Calendar,
  email: Mail,
};

const scoreColor = (score: number) => {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-red-600';
};

export default function LeadsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const queryClient = useQueryClient();

  const { data: leads, isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const res = await fetch('/api/leads');
      return res.json() as Promise<Lead[]>;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Lead>) => {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setIsCreateOpen(false);
      toast.success('Lead created');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Lead>) => {
      const res = await fetch(`/api/leads/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setEditingLead(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/leads/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  });

  const moveLead = (leadId: string, newStatus: string) => {
    updateMutation.mutate({ id: leadId, status: newStatus });
    toast.success(`Lead moved to ${statusConfig[newStatus]?.label}`);
  };

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    (window as unknown as { _dragLeadId?: string })._dragLeadId = leadId;
  };

  const exportCsv = () => {
    if (!leads) return;
    const data = leads.map((l) => ({
      Name: l.name, Email: l.email, Company: l.company || '',
      Source: l.source, Status: l.status, Score: l.score, Value: l.value,
    }));
    const csv = [Object.keys(data[0]).join(','), ...data.map((r) => Object.values(r).map((v) => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'leads.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Leads exported to CSV');
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data: Record<string, unknown> = {};
    formData.forEach((v, k) => { data[k] = v; });
    const payload = { ...data, score: parseInt(data.score as string) || 50, value: parseFloat(data.value as string) || 0 };

    if (editingLead) {
      updateMutation.mutate({ ...payload, id: editingLead.id });
    } else {
      createMutation.mutate(payload);
    }
  };

  const LeadForm = ({ defaultValues }: { defaultValues?: Partial<Lead> }) => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><Label htmlFor="name">Name</Label><Input id="name" name="name" required defaultValue={defaultValues?.name} /></div>
        <div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required defaultValue={defaultValues?.email} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label htmlFor="company">Company</Label><Input id="company" name="company" defaultValue={defaultValues?.company || ''} /></div>
        <div><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" defaultValue={defaultValues?.phone || ''} /></div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor="source">Source</Label>
          <Select name="source" defaultValue={defaultValues?.source || 'website'}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{leadSources.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}</SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={defaultValues?.status || 'new'}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{pipelineColumns.map((c) => (<SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>))}</SelectContent>
          </Select>
        </div>
        <div><Label htmlFor="score">Score (0-100)</Label><Input id="score" name="score" type="number" min="0" max="100" defaultValue={defaultValues?.score || 50} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label htmlFor="value">Value ($)</Label><Input id="value" name="value" type="number" defaultValue={defaultValues?.value || 0} /></div>
      </div>
      <div><Label htmlFor="notes">Notes</Label><Textarea id="notes" name="notes" rows={2} defaultValue={defaultValues?.notes || ''} /></div>
      <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700">{defaultValues ? 'Update' : 'Create'} Lead</Button>
    </form>
  );

  const totalValue = (leads || []).reduce((sum, l) => sum + (l.value || 0), 0);
  const avgScore = (leads || []).length > 0 ? Math.round((leads || []).reduce((s, l) => s + l.score, 0) / leads!.length) : 0;

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
            <p className="text-sm text-muted-foreground mt-1">Pipeline management</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCsv} className="gap-2"><Download className="h-4 w-4" /> Export CSV</Button>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger >
                <Button className="gap-2 bg-teal-600 hover:bg-teal-700"><Plus className="h-4 w-4" /> Add Lead</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Lead</DialogTitle></DialogHeader>
                <LeadForm />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary */}
        {!isLoading && (
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold">{(leads || []).length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Pipeline Value</p>
                <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold">{avgScore}/100</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pipeline */}
        {isLoading ? (
          <div className="grid grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-[400px]" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {pipelineColumns.map((col) => {
              const colLeads = (leads || []).filter((l) => l.status === col.id);
              return (
                <div
                  key={col.id}
                  className={cn('rounded-xl border bg-card/50 p-3 min-h-[300px] border-t-2', col.color)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    const leadId = (window as unknown as { _dragLeadId?: string })._dragLeadId;
                    if (leadId) { moveLead(leadId, col.id); (window as unknown as { _dragLeadId?: string })._dragLeadId = undefined; }
                  }}
                >
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="font-semibold text-sm">{col.title}</h3>
                    <Badge variant="secondary" className="text-xs">{colLeads.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {colLeads.map((lead) => {
                      const SourceIcon = sourceIcons[lead.source] || Globe;
                      return (
                        <motion.div key={lead.id} layout>
                          <div draggable onDragStart={(e) => { handleDragStart(e as unknown as React.DragEvent, lead.id); }}>
                          <Card className="group cursor-grab hover:shadow-md transition-shadow">
                            <CardContent className="p-3">
                              <div>
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium truncate flex-1">{lead.name}</p>
                                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingLead(lead)}>
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500" onClick={() => deleteMutation.mutate(lead.id)}>
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                {lead.company && <p className="text-xs text-muted-foreground">{lead.company}</p>}
                                <div className="flex items-center gap-2 mt-2">
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between text-xs mb-0.5">
                                      <span className={scoreColor(lead.score)}>Score: {lead.score}</span>
                                    </div>
                                    <Progress value={lead.score} className="h-1.5" />
                                  </div>
                                  <span className="text-xs font-medium">{formatCurrency(lead.value)}</span>
                                </div>
                                <div className="flex items-center gap-1 mt-2">
                                  <SourceIcon className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-[10px] text-muted-foreground">{lead.source}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Dialog open={!!editingLead} onOpenChange={(o) => !o && setEditingLead(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Lead</DialogTitle></DialogHeader>
            {editingLead && <LeadForm defaultValues={editingLead} />}
          </DialogContent>
        </Dialog>
      </motion.div>
    </AppLayout>
  );
}
